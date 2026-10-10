import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { initialSeen, visibleEvents } from "../case/cut.ts";
import { loadCase, type Case } from "../case/parse.ts";
import { actionLog, isIncomplete, loadState, type Action, type CaseState, type Status } from "../case/state.ts";
import { decisionOf, type Decision } from "./answers.ts";

// Read-only views of what batch runs and process evals wrote to disk, for the demo dashboard.
// Nothing here writes, and every path it opens is built from a folder name that passed SEGMENT.

export type Sources = { runsDir: string; evalDirs: string[]; casesDirs: string[] };
export type RunKind = "batch" | "eval";
export type RunRef = { id: string; kind: RunKind; label: string; dir: string; updated: string };

export type StatusKey = "closed" | "hold" | "escalated" | "incomplete" | "open";
export type Outcome = "ok" | "refused" | "skipped" | "failed";
export type ActionView = Action & { run: number; seen: number; outcome: Outcome; recovered: boolean };

export type CaseRow = {
  key: string;
  caseId: string;
  title: string;
  property: string;
  status: StatusKey;
  label: string;
  next: string;
  runs: number;
  seen: number;
  actions: number;
  refused: number;
  failed: number;
  tokens: number;
  updated: string;
  tag?: string;
};

export type RunView = {
  run: Omit<RunRef, "dir">;
  meta: { model?: string; started?: string; revision?: string; note?: string };
  cases: CaseRow[];
};

// What the agent could see of an event: everything, nothing yet ("future"), or the agency's own
// later records, which the cut keeps from the agent even when they come before the latest event.
export type EventView = {
  n: number;
  at: string;
  channel: string;
  from: string;
  to: string;
  headline: string;
  body: string;
  attachments: string[];
  view: "seen" | "own" | "future";
};

export type TraceRow = { t: string; kind: string; label: string; detail: string; run: number; ok?: boolean; tokens?: number };

export type CaseView = {
  key: string;
  caseId: string;
  runKind: RunKind;
  tag?: string;
  title: string;
  property: string;
  role: string;
  request: string;
  status: StatusKey;
  label: string;
  decision: Decision | null;
  final: Status | null;
  seen: number;
  actions: ActionView[];
  // Where each run's view of the case ended.
  runs: { run: number; seen: number }[];
  events: EventView[] | null;
  loadWarnings: string[];
  answer: string;
  reasoning: string;
  trace: TraceRow[];
  tokens: number;
};

// A folder name is a path segment we will open: no dots at the start, so no "..", and no separators.
const SEGMENT = /^(?!\.)[A-Za-z0-9._-]{1,120}$/;
const BODY_LIMIT = 4000;

const isDir = (p: string): boolean => {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
};
const mtime = (p: string): number => {
  try {
    return statSync(p).mtimeMs;
  } catch {
    return 0;
  }
};
const entries = (dir: string): string[] => (isDir(dir) ? readdirSync(dir).filter((n) => SEGMENT.test(n)).sort() : []);
const readText = (p: string): string => (existsSync(p) ? readFileSync(p, "utf8") : "");
const readJson = (p: string): Record<string, any> | null => {
  try {
    return JSON.parse(readText(p));
  } catch {
    return null;
  }
};

// ---------- discovery ----------

function newest(dir: string, kind: RunKind): string {
  const files = kind === "eval" ? [join(dir, "results.json")] : entries(join(dir, "state")).map((f) => join(dir, "state", f));
  return new Date(Math.max(mtime(dir), ...files.map(mtime))).toISOString();
}

// A run is a folder holding state/ (a batch) or results.json (a process eval), up to two folders below the root.
function scan(root: string, path: string[]): RunRef[] {
  return entries(root).flatMap((name) => {
    const dir = join(root, name);
    const here = [...path, name];
    if (!isDir(dir)) return [];
    const kind: RunKind | null = existsSync(join(dir, "results.json")) ? "eval" : isDir(join(dir, "state")) ? "batch" : null;
    if (kind) return [{ id: here.join("~"), kind, label: here.join("/"), dir, updated: newest(dir, kind) }];
    return here.length < 3 ? scan(dir, here) : [];
  });
}

// Eval exports in other formats (summaries, paired arms) carry no per-sample state, so there is nothing to show for them.
const hasCases = (run: RunRef): boolean =>
  run.kind === "batch" || samples(run).some((s) => existsSync(join(s.outDir, "state", `${s.caseId}.json`)));

export function discoverRuns(src: Sources): RunRef[] {
  const runs = [...scan(src.runsDir, []), ...src.evalDirs.flatMap((d) => scan(d, ["evals", "results"]))].filter(hasCases);
  return runs.sort((a, b) => b.updated.localeCompare(a.updated));
}

const findRun = (src: Sources, id: string): RunRef | undefined => discoverRuns(src).find((r) => r.id === id);

// ---------- actions ----------

// The loop and runTool word their failures differently; the prefix says which part of the harness said no.
export function classify(a: Pick<Action, "ok" | "result">): Outcome {
  if (a.ok) return "ok";
  if (a.result.endsWith("the action was not executed") || a.result.startsWith("not executed:")) return "skipped";
  return a.result.startsWith("refused:") ? "refused" : "failed";
}

function actionViews(state: CaseState): ActionView[] {
  const actions = actionLog(state);
  return actions.map((a, i) => ({
    ...a,
    outcome: classify(a),
    recovered: !a.ok && actions.slice(i + 1).some((later) => later.ok && later.tool === a.tool),
  }));
}

// ---------- traces ----------

type Rec = Record<string, any>;

function readRecords(path: string): Rec[] {
  const out: Rec[] = [];
  for (const line of readText(path).split("\n")) {
    try {
      if (line.trim()) out.push(JSON.parse(line));
    } catch {
      // A batch that is still running may have written half a line.
    }
  }
  return out;
}

const usageTokens = (u: Rec | undefined): number =>
  (u?.input_tokens ?? 0) + (u?.cache_read_input_tokens ?? 0) + (u?.cache_creation_input_tokens ?? 0) + (u?.output_tokens ?? 0);

const totalTokens = (records: Rec[]): number =>
  records.reduce((n, r) => n + (r.kind === "model" || r.kind === "approval_check_usage" ? usageTokens(r.usage) : 0), 0);

function modelDetail(content: Rec[] = []): string {
  return content
    .map((b) => (b.type === "text" ? `Text: ${b.text}` : b.type === "thinking" ? `Thinking: ${b.thinking}` : b.type === "tool_use" ? `Calls ${b.name}: ${JSON.stringify(b.input, null, 2)}` : ""))
    .filter(Boolean)
    .join("\n\n");
}

function traceRows(records: Rec[]): TraceRow[] {
  let run = 0;
  const rows: TraceRow[] = [];
  for (const r of records) {
    const base = { t: String(r.t ?? ""), kind: String(r.kind) };
    if (r.kind === "run_start") run = r.run;
    const row = (label: string, detail = "", extra: Partial<TraceRow> = {}) => rows.push({ ...base, label, detail, run, ...extra });
    switch (r.kind) {
      case "run_start":
        row(`Run ${r.run} starts`, `The agent sees events up to ${r.seen}. Model ${r.model}.`);
        break;
      case "model":
        row(`Model turn ${r.turn} · ${r.stop}`, modelDetail(r.content), { tokens: usageTokens(r.usage) });
        break;
      case "tool":
        row(`${r.name} · ${classify({ ok: r.ok, result: String(r.result) })}`, `${JSON.stringify(r.input, null, 2)}\n\n${r.result}`, { ok: r.ok });
        break;
      case "approval_check":
        row(`Landlord reply read as ${r.answer}`, String(r.request ?? ""));
        break;
      case "approval_check_usage":
        break;
      case "error":
      case "approval_check_error":
        row(r.kind === "error" ? "Error" : "Approval check failed", String(r.message ?? r.error ?? ""), { ok: false });
        break;
      case "auto_escalate":
        row("Turn limit reached", `No end action within ${r.turns} turns. The system escalated the case.`, { ok: false });
        break;
      case "parse_warnings":
        row("Loader warnings", [].concat(r.warnings ?? []).join("\n"));
        break;
      default: {
        const { t: _t, kind: _k, ...rest } = r;
        row(base.kind, JSON.stringify(rest));
      }
    }
  }
  return rows;
}

// ---------- cases ----------

type Sample = { key: string; caseId: string; outDir: string; tag?: string };

function samples(run: RunRef): Sample[] {
  if (run.kind === "batch") {
    return entries(join(run.dir, "state"))
      .filter((f) => f.endsWith(".json"))
      .map((f) => ({ key: f.slice(0, -5), caseId: f.slice(0, -5), outDir: run.dir }));
  }
  // An eval sample lives in <run>/<sample>/{state,traces,ANSWERS}; the trace path in results.json names it.
  const results: Rec[] = readJson(join(run.dir, "results.json"))?.results ?? [];
  return results.flatMap((r) => {
    const segments = String(r.trace ? dirname(dirname(r.trace)) : r.id).split(/[\\/]/);
    if (!segments.every((s) => SEGMENT.test(s)) || !SEGMENT.test(String(r.case_id))) return [];
    const tag = r.structural_match ? "Matches the reference action" : "Differs from the reference action";
    return [{ key: segments.join("~"), caseId: String(r.case_id), outDir: join(run.dir, ...segments), tag }];
  });
}

const statusKey = (s: CaseState): StatusKey => (isIncomplete(s) ? "incomplete" : s.status.kind);

function findCaseDir(src: Sources, caseId: string): string | null {
  return src.casesDirs.map((d) => join(d, caseId)).find(isDir) ?? null;
}

// Titles never change during a run, so each case folder is parsed once.
const loaded = new Map<string, Case | null>();
function loadCaseAt(dir: string): Case | null {
  if (!loaded.has(dir)) {
    try {
      loaded.set(dir, loadCase(dir));
    } catch {
      loaded.set(dir, null);
    }
  }
  return loaded.get(dir)!;
}

const detail = (c: Case | null, name: string): string => c?.details.match(new RegExp(`\\*\\*${name}:\\*\\*\\s*(.+)`))?.[1].trim() ?? "";

// A process eval stops after one action, so "open" is expected there and means nothing is wrong.
function decisionFor(run: RunRef, state: CaseState): Decision {
  const decision = decisionOf(state);
  const last = actionLog(state).at(-1);
  if (run.kind === "batch" || state.status.kind !== "open" || !last) return decision;
  return { ...decision, next: `One action: ${last.tool}` };
}

function caseRow(src: Sources, run: RunRef, s: Sample): CaseRow | null {
  const statePath = join(s.outDir, "state", `${s.caseId}.json`);
  const state = loadState(statePath);
  if (!state) return null;
  const dir = findCaseDir(src, s.caseId);
  const decision = decisionFor(run, state);
  const views = actionViews(state);
  return {
    key: s.key,
    caseId: s.caseId,
    title: (dir && loadCaseAt(dir)?.title) || `Case ${s.caseId}`,
    property: detail(dir ? loadCaseAt(dir) : null, "Property"),
    status: statusKey(state),
    label: decision.status,
    next: decision.next,
    runs: state.runs.length,
    seen: state.seen,
    actions: views.length,
    refused: views.filter((a) => a.outcome === "refused").length,
    failed: views.filter((a) => a.outcome === "failed").length,
    tokens: totalTokens(readRecords(join(s.outDir, "traces", `${s.caseId}.jsonl`))),
    updated: new Date(mtime(statePath)).toISOString(),
    tag: s.tag,
  };
}

function readMeta(run: RunRef): RunView["meta"] {
  const results = readJson(join(run.dir, run.kind === "eval" ? "results.json" : "run-summary.json"));
  if (!results) return {};
  if (run.kind === "batch") return { model: results.model, started: results.started };
  const sum = results.summary ?? {};
  const note = sum.attempted ? `${sum.historical_reference_matches} of ${sum.attempted} match the historical reference; ${sum.alternative_paths_needing_review} differ and need review.` : undefined;
  return { model: results.model, started: results.started_at, revision: results.code_revision, note };
}

export function listRuns(src: Sources): Omit<RunRef, "dir">[] {
  return discoverRuns(src).map(({ dir: _dir, ...run }) => run);
}

export function readRun(src: Sources, id: string): RunView | null {
  const run = findRun(src, id);
  if (!run) return null;
  const { dir: _dir, ...ref } = run;
  const cases = samples(run).flatMap((s) => caseRow(src, run, s) ?? []);
  return { run: ref, meta: readMeta(run), cases };
}

function eventViews(c: Case, initial: number, seen: number): EventView[] {
  const visible = new Set(visibleEvents(c, initial, seen).map((e) => e.n));
  return c.events.map((e) => ({
    n: e.n,
    at: e.at,
    channel: e.channel,
    from: e.from,
    to: e.to,
    headline: e.body.replace(/\*\*/g, "").replace(/\s+/g, " ").trim().slice(0, 160),
    body: e.body.length > BODY_LIMIT ? `${e.body.slice(0, BODY_LIMIT)}…` : e.body,
    attachments: e.attachments,
    view: visible.has(e.n) ? "seen" : e.n > seen ? "future" : "own",
  }));
}

export function readCase(src: Sources, id: string, key: string): CaseView | null {
  const run = findRun(src, id);
  const s = run && samples(run).find((x) => x.key === key);
  if (!run || !s) return null;

  const state = loadState(join(s.outDir, "state", `${s.caseId}.json`));
  const dir = findCaseDir(src, s.caseId);
  const c = dir ? loadCaseAt(dir) : null;
  const records = readRecords(join(s.outDir, "traces", `${s.caseId}.jsonl`));
  const answers = join(s.outDir, "ANSWERS", s.caseId);
  const initial = state?.initialSeen ?? (c ? initialSeen(c) : 0);
  const decision = state ? decisionFor(run, state) : null;

  return {
    key,
    caseId: s.caseId,
    runKind: run.kind,
    tag: s.tag,
    title: c?.title || `Case ${s.caseId}`,
    property: detail(c, "Property"),
    role: detail(c, "Source role"),
    request: c?.request ?? "",
    status: state ? statusKey(state) : "open",
    label: decision?.status ?? "not run",
    decision,
    final: state?.status ?? null,
    seen: state?.seen ?? 0,
    actions: state ? actionViews(state) : [],
    runs: state?.runs.map((r, i) => ({ run: i + 1, seen: r.seen })) ?? [],
    events: c ? eventViews(c, initial, state?.seen ?? initial) : null,
    loadWarnings: c?.warnings ?? [],
    answer: readText(join(answers, "ANSWER.md")),
    reasoning: readText(join(answers, "REASONING.md")),
    trace: traceRows(records),
    tokens: totalTokens(records),
  };
}
