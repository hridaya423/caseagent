// Runs the agent over the reality-sim cases, each with its whole history visible, then (with --score) grades the output.
//
//   npm run eval -- [--out <dir>] [--concurrency 4] [--only 301,402] [--tier A,E] [--score]
//
// Every case is run once from a clean state at its decision point: the last event in its history
// (`step` in manifest.json). The agent sees every event up to there, the agency's own included.
import Anthropic from "@anthropic-ai/sdk";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { isIncomplete } from "../../src/case/state.ts";
import { liveDeps, processCase, summary, type RunDeps } from "../../src/runner/process.ts";
import { liveJudge, scoreAll, scorecard } from "./score.ts";

const ROOT = fileURLToPath(new URL(".", import.meta.url));

type Sample = { id: string; tier: string; case_dir: string; step: number };
export type RunRow = { id: string; tier: string; status: string; incomplete: boolean; seconds: number; error: string | null };

export function selectSamples(opts: { only?: string[]; tiers?: string[] }): Sample[] {
  const manifest = JSON.parse(readFileSync(join(ROOT, "manifest.json"), "utf8")) as { samples: Sample[] };
  return manifest.samples.filter((s) => (!opts.only || opts.only.includes(s.id)) && (!opts.tiers || opts.tiers.includes(s.tier)));
}

export async function runAll(opts: { deps: RunDeps; samples: Sample[]; concurrency?: number; log?: (line: string) => void }): Promise<RunRow[]> {
  const { deps, samples, log = console.log } = opts;
  const rows: RunRow[] = new Array(samples.length);
  let next = 0;
  const worker = async () => {
    for (let i = next++; i < samples.length; i = next++) {
      const s = samples[i];
      const started = Date.now();
      try {
        const state = await processCase(deps, join(ROOT, s.case_dir), false, { step: s.step });
        rows[i] = { id: s.id, tier: s.tier, status: summary(state), incomplete: isIncomplete(state), seconds: 0, error: null };
      } catch (e) {
        // processCase turns agent and API failures into a system escalation itself. What reaches
        // here is a failure of this runner (a bad step, an unreadable folder), so no answer exists.
        rows[i] = { id: s.id, tier: s.tier, status: "failed", incomplete: true, seconds: 0, error: e instanceof Error ? e.message : String(e) };
      }
      rows[i].seconds = Math.round((Date.now() - started) / 1000);
      log(`${rows[i].status}${rows[i].error ? `: ${rows[i].error}` : ""}  (${rows[i].seconds}s)`);
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, opts.concurrency ?? 4) }, worker));
  return rows;
}

const list = (v: string | undefined) => v?.split(",").map((s) => s.trim()).filter(Boolean);

if (import.meta.main) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add the key.");
    process.exit(1);
  }
  const { values } = parseArgs({
    options: {
      out: { type: "string" },
      concurrency: { type: "string", default: "4" },
      only: { type: "string" },
      tier: { type: "string" },
      score: { type: "boolean", default: false },
    },
  });
  const concurrency = Number(values.concurrency);
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    console.error("--concurrency must be a positive integer.");
    process.exit(1);
  }
  const only = list(values.only);
  const samples = selectSamples({ only, tiers: list(values.tier)?.map((t) => t.toUpperCase()) });
  if (samples.length === 0) {
    console.error("No cases match --only / --tier.");
    process.exit(1);
  }
  const out = resolve(values.out ?? join("runs", "eval", new Date().toISOString().replace(/[:.]/g, "-")));
  mkdirSync(out, { recursive: true });
  const deps = liveDeps(out);
  const started = Date.now();
  console.log(`Running ${samples.length} cases with ${deps.model}, ${concurrency} at a time. Output: ${out}`);
  const rows = await runAll({ deps, samples, concurrency });
  const seconds = Math.round((Date.now() - started) / 1000);
  writeFileSync(join(out, "run.json"), JSON.stringify({ model: deps.model, started: new Date(started).toISOString(), seconds, rows }, null, 2) + "\n");
  const finished = rows.filter((r) => !r.incomplete).length;
  console.log(`\n${finished}/${rows.length} cases finished in ${Math.floor(seconds / 60)}m ${seconds % 60}s. Answers: ${join(out, "ANSWERS")}`);

  if (values.score) {
    const model = process.env.JUDGE_MODEL ?? "claude-opus-5-5";
    const results = await scoreAll({ runDir: out, judge: liveJudge(new Anthropic({ timeout: 300_000, maxRetries: 4 }), model), concurrency, only: samples.map((s) => s.id) });
    mkdirSync(join(out, "score"), { recursive: true });
    writeFileSync(join(out, "score", "results.json"), JSON.stringify({ run_dir: out, judge_model: model, results }, null, 2) + "\n");
    writeFileSync(join(out, "score", "SCORECARD.md"), scorecard(results, { runDir: out, model }));
    const judged = results.filter((r) => r.status === "judged");
    console.log(`${judged.filter((r) => r.verdict === "pass").length}/${judged.length} passed. Scorecard: ${join(out, "score", "SCORECARD.md")}`);
  } else if (existsSync(join(out, "ANSWERS"))) {
    console.log(`To grade: npm run eval:score -- ${out}`);
  }
}
