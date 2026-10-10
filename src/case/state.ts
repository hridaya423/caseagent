import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { z } from "zod";

// The agent's memory of one case. The schemas are the single source for these types: the tools build
// their inputs from them, and a saved state file is checked against them when it loads.

export const holdReason = z.enum(["Waiting for Landlord", "Waiting for Tenant", "Waiting for Provider", "Waiting for Quote"]);

export const closeChecks = z.object({
  outcome: z.enum(["work_completed", "resolved_without_work", "withdrawn"]),
  work_confirmed_by: z.string().min(1).describe('Who confirmed the result, with the event, for example "tenant [event 007]".'),
  landlord_informed: z.boolean(),
  keys: z.enum(["returned", "not_issued", "outstanding"]),
  invoice: z.enum(["on_file", "not_required", "outstanding"]),
});

// An agent escalation is a handover with three fields. A system escalation (load error, API error,
// turn limit, stage limit) means the agent did not finish; that is what "incomplete" reports.
const status = z.union([
  z.object({ kind: z.literal("open") }),
  z.object({ kind: z.literal("hold"), reason: holdReason }),
  z.object({ kind: z.literal("escalated"), by: z.literal("agent"), summary: z.string(), checked: z.string(), missing_or_conflict: z.string(), decision_needed: z.string() }),
  z.object({ kind: z.literal("escalated"), by: z.literal("system"), summary: z.string() }),
  z.object({ kind: z.literal("closed"), checks: closeChecks }),
]);

// The landlord's reply to the latest approval request, classified once per new landlord event.
// requestAfter is the event the run that sent the request had seen.
const landlordAnswer = z.object({ answer: z.enum(["approved", "refused", "unclear"]), requestAfter: z.number(), throughEvent: z.number() });

const action = z.object({ tool: z.string(), input: z.record(z.string(), z.unknown()), ok: z.boolean(), result: z.string() });

// One run of the agent: the last event it could see, the model's text and its tool calls.
const run = z.object({ seen: z.number(), notes: z.array(z.string()), actions: z.array(action) });

const caseState = z.object({
  caseId: z.string(),
  initialSeen: z.number(),
  seen: z.number(),
  status,
  runs: z.array(run),
  approvalOnFile: z.boolean().optional(),
  landlordAnswer: landlordAnswer.optional(),
});

export type HoldReason = z.infer<typeof holdReason>;
export type CloseChecks = z.infer<typeof closeChecks>;
export type Status = z.infer<typeof status>;
export type LandlordAnswer = z.infer<typeof landlordAnswer>;
export type Action = z.infer<typeof action>;
export type Run = z.infer<typeof run>;
export type CaseState = z.infer<typeof caseState>;

export const isIncomplete = (s: { status: Status }): boolean => s.status.kind === "escalated" && s.status.by === "system";

export function newState(caseId: string, initialSeen: number): CaseState {
  return { caseId, initialSeen, seen: initialSeen, status: { kind: "open" }, runs: [] };
}

// Every action in order, with its run number (from 1) and the last event that run could see.
export function actionLog(s: CaseState): (Action & { run: number; seen: number })[] {
  return s.runs.flatMap((r, i) => r.actions.map((a) => ({ ...a, run: i + 1, seen: r.seen })));
}

export function loadState(path: string): CaseState | null {
  if (!existsSync(path)) return null;
  let parsed: ReturnType<typeof caseState.safeParse> | null = null;
  try {
    parsed = caseState.safeParse(upgrade(JSON.parse(readFileSync(path, "utf8"))));
  } catch {
    /* not JSON */
  }
  if (parsed?.success) return parsed.data;
  // A truncated, corrupt or malformed state file is moved aside so resume reports "no saved state"
  // instead of crashing on the same bytes every time.
  try {
    renameSync(path, `${path}.corrupt`);
  } catch {
    /* nothing to preserve */
  }
  return null;
}

export function saveState(path: string, state: CaseState): void {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, JSON.stringify(state, null, 2) + "\n");
  renameSync(tmp, path);
}

export function statusLabel(s: Status): string {
  if (s.kind === "hold") return `hold (${s.reason})`;
  if (s.kind === "closed") return `closed (${s.checks.outcome})`;
  if (s.kind === "escalated" && s.by === "system") return "escalated [incomplete]";
  return s.kind;
}

type LegacyEntry = { run?: number; afterEvent?: number };
type SavedFile = Partial<Omit<CaseState, "runs">> & {
  runs?: number | unknown[];
  actions?: (Action & LegacyEntry)[];
  notes?: ({ text: string } & LegacyEntry)[];
  incomplete?: boolean;
};

// Brings a saved file to the current format. Fields absent in older or partial files get their
// defaults; the schema then drops the old fields (actions, notes, incomplete).
function upgrade(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null) return raw;
  const s = raw as SavedFile;
  const seen = s.seen ?? 0;
  const initialSeen = s.initialSeen ?? seen;
  return {
    ...s,
    caseId: s.caseId ?? "unknown",
    initialSeen,
    seen,
    status: migrateStatus(s.status, s.incomplete),
    runs: Array.isArray(s.runs) ? s.runs : flatRuns(s.runs ?? 0, s.actions ?? [], s.notes ?? [], initialSeen, seen),
  };
}

// State files written before escalations carried `by`: the old `incomplete` flag marked system escalations.
function migrateStatus(status: unknown, incomplete: unknown): unknown {
  const s = status as (Status & { checked?: string }) | undefined;
  if (!s) return { kind: "open" };
  if (s.kind !== "escalated" || "by" in s) return s;
  const legacy = s as { summary: string; checked?: string; missing_or_conflict?: string; decision_needed?: string };
  if (incomplete === true || legacy.checked === undefined) return { kind: "escalated", by: "system", summary: legacy.summary };
  return { kind: "escalated", by: "agent", summary: legacy.summary, checked: legacy.checked, missing_or_conflict: legacy.missing_or_conflict ?? "", decision_needed: legacy.decision_needed ?? "" };
}

// State files written before runs were records: one flat list of actions and one of notes, each
// entry marked with its run and the event that run had seen. A run with no entries kept no record
// of its cut, so it takes the previous run's cut, or the current cut if it was the last run.
function flatRuns(count: number, actions: (Action & LegacyEntry)[], notes: ({ text: string } & LegacyEntry)[], initialSeen: number, seen: number): Run[] {
  const total = Math.max(count, ...actions.map((a) => a.run ?? 1), ...notes.map((n) => n.run ?? 1));
  const runs: Run[] = [];
  let previous = initialSeen;
  for (let r = 1; r <= total; r++) {
    const own = (e: LegacyEntry) => (e.run ?? 1) === r;
    const marks = [...actions, ...notes].filter(own).map((e) => e.afterEvent ?? previous);
    const cut = marks.length ? Math.max(...marks) : r === total ? seen : previous;
    runs.push({
      seen: cut,
      notes: notes.filter(own).map((n) => n.text),
      actions: actions.filter(own).map(({ run: _run, afterEvent: _after, ...a }) => a),
    });
    previous = cut;
  }
  return runs;
}
