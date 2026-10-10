import Anthropic from "@anthropic-ai/sdk";
import { appendFileSync, existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { runCase, type ModelClient, type Trace } from "./agent.ts";
import { writeAnswer, writeOutbox } from "./answers.ts";
import { initialSeen, nextSeen, visibleEvents } from "./cut.ts";
import { loadCase } from "./parse.ts";
import { loadState, newState, saveState, statusLabel, type CaseState } from "./state.ts";

const MAX_STAGES = 50;

// A fresh run keeps the previous trace under a timestamped name instead of overwriting it.
function startTrace(tracePath: string): void {
  if (existsSync(tracePath) && statSync(tracePath).size > 0) {
    const stamp = statSync(tracePath).mtime.toISOString().replace(/[:.]/g, "-");
    renameSync(tracePath, tracePath.replace(/\.jsonl$/, `.${stamp}.jsonl`));
  }
  writeFileSync(tracePath, "");
}

export type RunDeps = { out: string; client: ModelClient; model: string; policy: string };

// Errors the SDK already retried with backoff: rate limits, overload, server errors, lost connections.
const OVERLOAD = new Set([429, 500, 502, 503, 504, 529]);
const isOverload = (e: unknown) =>
  (e instanceof Error && /^APIConnection(Timeout)?Error$/.test(e.name)) || OVERLOAD.has((e as { status?: number }).status ?? 0);

// When the model stays overloaded after the SDK's retries, the same request goes to the fallback model
// once. The trace records which model answered, so a fallback answer is visible.
export function withFallback(client: ModelClient, fallback: string | undefined): ModelClient {
  return {
    messages: {
      create: async (p, o) => {
        try {
          return await client.messages.create(p, o);
        } catch (e) {
          if (!fallback || fallback === p.model || o?.signal?.aborted || !isOverload(e)) throw e;
          return client.messages.create({ ...p, model: fallback }, o);
        }
      },
    },
  };
}

export function liveDeps(out: string): RunDeps {
  return {
    out,
    client: withFallback(new Anthropic({ timeout: 120_000, maxRetries: 4 }), process.env.FALLBACK_MODEL ?? "claude-sonnet-5"),
    model: process.env.MODEL ?? "claude-sonnet-5-5",
    policy: readFileSync(new URL("../policy.md", import.meta.url), "utf8"),
  };
}

export function summary(state: CaseState): string {
  return `${state.caseId}: ${statusLabel(state.status)}`;
}

// Failures the agent cannot fix end the case on a person: a load failure, an API error, or a stage cap.
function markSystemFailure(state: CaseState, label: string, message: string, caseId: string): void {
  state.status = { kind: "escalated", by: "system", summary: `${label}: ${message}. A person must review case ${caseId}.` };
}

export async function processCase(
  deps: RunDeps,
  dir: string,
  next: boolean,
  options: { step?: number; singleStep?: boolean; signal?: AbortSignal } = {},
): Promise<CaseState> {
  const { out, client, model, policy } = deps;

  let c: ReturnType<typeof loadCase>;
  try {
    c = loadCase(dir);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const id = basename(dir);
    const statePath = join(out, "state", `${id}.json`);
    const tracePath = join(out, "traces", `${id}.jsonl`);
    mkdirSync(dirname(tracePath), { recursive: true });
    startTrace(tracePath);
    const state = newState(id, 0);
    markSystemFailure(state, "Loading error", message, id);
    const trace: Trace = (kind, data) =>
      appendFileSync(tracePath, JSON.stringify({ t: new Date().toISOString(), kind, ...data }) + "\n");
    const emptyCase = { id, title: id, details: "", request: "", events: [], attachments: [], layer: "raw" as const };
    saveState(statePath, state);
    writeAnswer(out, emptyCase, state, []);
    trace("error", { message });
    return state;
  }

  const statePath = join(out, "state", `${c.id}.json`);
  const tracePath = join(out, "traces", `${c.id}.jsonl`);
  if (options.step !== undefined && (!Number.isInteger(options.step) || !c.events.some((e) => e.n === options.step))) {
    throw new Error(`step ${options.step} is not an event in case ${c.id}`);
  }
  mkdirSync(dirname(tracePath), { recursive: true });
  if (!next) startTrace(tracePath);
  const trace: Trace = (kind, data) =>
    appendFileSync(tracePath, JSON.stringify({ t: new Date().toISOString(), kind, ...data }) + "\n");
  if (c.warnings?.length) trace("parse_warnings", { warnings: c.warnings });

  let state = next ? loadState(statePath) : null;
  let newFrom = 1;
  if (next) {
    if (!state) throw new Error(`case ${c.id} has no saved state. Run it once without --next.`);
    if (state.status.kind === "closed" || state.status.kind === "escalated") {
      throw new Error(`case ${c.id} is already ${state.status.kind}. Run it once without --next to restart.`);
    }
    // An open case was stopped mid-stage by a single-action call, so it continues at the same event.
    const seen = options.step ?? (state.status.kind === "open" ? state.seen : nextSeen(c, state.seen));
    if (seen === null) throw new Error(`case ${c.id} has no further events from the tenant, landlord or a contractor.`);
    if (seen < state.seen) throw new Error(`step ${seen} precedes saved step ${state.seen}. Use run_case to restart.`);
    newFrom = seen === state.seen ? seen : state.seen + 1;
    state.seen = seen;
  } else {
    state = newState(c.id, options.step ?? initialSeen(c));
  }

  try {
    await runCase({ c, state: state!, newFrom, client, model, policy, trace, singleStep: options.singleStep, caseDir: dir, signal: options.signal });
  } catch (e) {
    const timedOut = options.signal?.aborted === true;
    const message = timedOut ? String((options.signal!.reason as Error)?.message ?? options.signal!.reason) : e instanceof Error ? e.message : String(e);
    markSystemFailure(state!, timedOut ? "Time limit" : "System error", message, c.id);
    trace(timedOut ? "time_limit" : "error", { message });
  }
  saveState(statePath, state!);
  writeAnswer(out, c, state!, visibleEvents(c, state!.initialSeen, state!.seen));
  writeOutbox(out, c, state!);
  return state!;
}

// Runs the first stage, then resumes while the case is on hold and an outside event remains.
// A case that still has outside events after MAX_STAGES stages did not finish; it escalates
// instead of reporting the same "hold" as a case that is genuinely waiting.
// With timeLimitMs, the whole case (every stage) must finish in time; the running model call is
// cancelled at the limit and the case escalates with an ANSWER.md that says so.
export async function processToEnd(deps: RunDeps, dir: string, opts: { timeLimitMs?: number } = {}): Promise<CaseState> {
  const controller = new AbortController();
  const timer = opts.timeLimitMs
    ? setTimeout(() => controller.abort(new Error(`the case did not finish within ${Math.round(opts.timeLimitMs! / 1000)} s`)), opts.timeLimitMs)
    : undefined;
  try {
    const signal = controller.signal;
    let state = await processCase(deps, dir, false, { signal });
    for (let stage = 1; stage < MAX_STAGES && state.status.kind === "hold" && !signal.aborted; stage++) {
      if (nextSeen(loadCase(dir), state.seen) === null) break;
      state = await processCase(deps, dir, true, { signal });
    }
    if (state.status.kind === "hold" && nextSeen(loadCase(dir), state.seen) !== null) {
      const c = loadCase(dir);
      if (signal.aborted) markSystemFailure(state, "Time limit", String((signal.reason as Error).message), c.id);
      else markSystemFailure(state, `Stopped at the ${MAX_STAGES}-stage resume limit`, "the case still has outside events", c.id);
      saveState(join(deps.out, "state", `${c.id}.json`), state);
      writeAnswer(deps.out, c, state, visibleEvents(c, state.initialSeen, state.seen));
    }
    return state;
  } finally {
    clearTimeout(timer);
  }
}
