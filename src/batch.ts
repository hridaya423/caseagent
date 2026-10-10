import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { decisionOf } from "./answers.ts";
import { processCase, processToEnd, summary, type RunDeps } from "./run.ts";
import { isIncomplete, loadState } from "./state.ts";

export type BatchRow = {
  id: string;
  status: string;
  incomplete: boolean;
  next: string;
  messages: number;
  runs: number;
  seconds: number;
  input_tokens: number;
  output_tokens: number;
  models: string[];
  // Set when the batch itself failed on this case, outside processCase's own error handling.
  error?: string;
};

type SummaryFile = { model: string; started: string; cases: Record<string, BatchRow> };

export type BatchOptions = {
  casesDir: string;
  deps: RunDeps;
  concurrency: number;
  toEnd: boolean;
  // One stage per case: continue each saved case at its next outside event, instead of starting it.
  next?: boolean;
  timeLimitMs?: number;
  // Rerun every case, instead of skipping the ones a previous batch in the same output finished.
  fresh?: boolean;
  // Rerun only the cases a previous batch left incomplete (system escalations) or failed on.
  retryIncomplete?: boolean;
  limit?: number;
  log?: (line: string) => void;
};

// Every folder in the cases directory is a case, whether or not it has an index.md: a messy case
// without one still loads through the fallback loaders and still gets an ANSWER.md.
export function caseDirs(casesDir: string): string[] {
  return readdirSync(casesDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .map((e) => e.name)
    .sort();
}

// Token use from the case's trace: the agent's calls and the approval checks.
function usage(tracePath: string): Pick<BatchRow, "input_tokens" | "output_tokens" | "models"> {
  const out = { input_tokens: 0, output_tokens: 0, models: new Set<string>() };
  if (!existsSync(tracePath)) return { input_tokens: 0, output_tokens: 0, models: [] };
  for (const line of readFileSync(tracePath, "utf8").split("\n")) {
    if (!line) continue;
    const r = JSON.parse(line) as { kind: string; model?: string; usage?: Record<string, number> };
    if ((r.kind !== "model" && r.kind !== "approval_check_usage") || !r.usage) continue;
    out.input_tokens += (r.usage.input_tokens ?? 0) + (r.usage.cache_read_input_tokens ?? 0) + (r.usage.cache_creation_input_tokens ?? 0);
    out.output_tokens += r.usage.output_tokens ?? 0;
    if (r.model) out.models.add(r.model);
  }
  return { input_tokens: out.input_tokens, output_tokens: out.output_tokens, models: [...out.models].sort() };
}

const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();

export function renderSummary(file: SummaryFile): string {
  const rows = Object.values(file.cases).sort((a, b) => a.id.localeCompare(b.id));
  const count = (pred: (r: BatchRow) => boolean) => rows.filter(pred).length;
  const lines = [
    "# Run summary",
    "",
    `Model: ${file.model} · Started: ${file.started} · Cases: ${rows.length}`,
    "",
    `Closed: ${count((r) => r.status.startsWith("closed"))} · On hold: ${count((r) => r.status.startsWith("hold"))} · Escalated by the agent: ${count((r) => r.status === "escalated")} · Incomplete: ${count((r) => r.incomplete)} · Batch errors: ${count((r) => Boolean(r.error))}`,
    "",
    `Tokens: ${rows.reduce((n, r) => n + r.input_tokens, 0).toLocaleString("en-GB")} in, ${rows.reduce((n, r) => n + r.output_tokens, 0).toLocaleString("en-GB")} out · Time: ${Math.round(rows.reduce((n, r) => n + r.seconds, 0))} s of case time`,
    "",
    "| Case | Status | Next step | Messages | Runs | Time (s) | Tokens in / out |",
    "|---|---|---|---|---|---|---|",
    ...rows.map((r) => `| ${r.id} | ${cell(r.status)} | ${cell(r.error ? `Batch error: ${r.error}` : r.next)} | ${r.messages} | ${r.runs} | ${r.seconds.toFixed(0)} | ${r.input_tokens.toLocaleString("en-GB")} / ${r.output_tokens.toLocaleString("en-GB")} |`),
    "",
  ];
  return lines.join("\n");
}

function writeAtomic(path: string, text: string): void {
  writeFileSync(`${path}.tmp`, text);
  renameSync(`${path}.tmp`, path);
}

// Runs every case with a fixed number of workers. After each case it records a row in
// run-summary.json and rewrites RUN_SUMMARY.md, so a crashed batch can resume where it stopped.
export async function runBatch(o: BatchOptions): Promise<BatchRow[]> {
  const { deps, log = console.log } = o;
  mkdirSync(deps.out, { recursive: true });
  const jsonPath = join(deps.out, "run-summary.json");
  const previous = !o.fresh && existsSync(jsonPath) ? (JSON.parse(readFileSync(jsonPath, "utf8")) as SummaryFile) : null;
  const file: SummaryFile = { model: deps.model, started: previous?.started ?? new Date().toISOString(), cases: previous?.cases ?? {} };
  const all = caseDirs(o.casesDir).slice(0, o.limit);
  const todo = all.filter((id) => {
    const row = file.cases[id];
    return !row || (o.retryIncomplete && (row.incomplete || row.error));
  });
  if (todo.length < all.length) log(`skipping ${all.length - todo.length} cases finished by an earlier batch in ${deps.out} (use --fresh to rerun them)`);

  const queue = [...todo];
  let done = 0;
  const save = () => {
    writeAtomic(jsonPath, JSON.stringify(file, null, 2) + "\n");
    writeAtomic(join(deps.out, "RUN_SUMMARY.md"), renderSummary(file));
  };
  const workers = Array.from({ length: Math.min(o.concurrency, queue.length) }, async () => {
    for (let id = queue.shift(); id; id = queue.shift()) {
      const dir = join(o.casesDir, id);
      const started = Date.now();
      let row: BatchRow;
      try {
        let state;
        if (o.toEnd) state = await processToEnd(deps, dir, { timeLimitMs: o.timeLimitMs });
        else {
          const controller = new AbortController();
          const timer = o.timeLimitMs
            ? setTimeout(() => controller.abort(new Error(`the case did not finish within ${Math.round(o.timeLimitMs! / 1000)} s`)), o.timeLimitMs)
            : undefined;
          state = await processCase(deps, dir, o.next ?? false, { signal: controller.signal }).finally(() => clearTimeout(timer));
        }
        const d = decisionOf(state);
        row = {
          id: state.caseId,
          status: d.status,
          incomplete: isIncomplete(state),
          next: d.next,
          messages: state.actions.filter((a) => a.ok && a.tool === "send_message").length,
          runs: state.runs,
          seconds: (Date.now() - started) / 1000,
          ...usage(join(deps.out, "traces", `${state.caseId}.jsonl`)),
        };
        log(`[${++done}/${todo.length}] ${summary(state)} (${row.seconds.toFixed(0)} s)`);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        const state = loadState(join(deps.out, "state", `${id}.json`));
        row = {
          id, status: state ? decisionOf(state).status : "error", incomplete: true, next: "A person must review the case.", messages: 0,
          runs: state?.runs ?? 0, seconds: (Date.now() - started) / 1000, input_tokens: 0, output_tokens: 0, models: [], error: message,
        };
        log(`[${++done}/${todo.length}] ${id}: failed: ${message}`);
      }
      file.cases[id] = row;
      save();
    }
  });
  await Promise.all(workers);
  save();
  return Object.values(file.cases);
}
