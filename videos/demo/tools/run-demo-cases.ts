// Runs the demo's cases once each, the way the reality-sim README says: the whole history up to the
// decision point, one stage. Output goes to runs/demo, which the dashboard lists.
// Run from the repo root: node --env-file=.env --import tsx videos/demo/tools/run-demo-cases.ts [ids...]
import { readFileSync } from "node:fs";
import { liveDeps, processCase } from "../../../src/runner/process.ts";

const manifest = JSON.parse(readFileSync("evals/reality-sim/manifest.json", "utf8")) as { samples: { id: string; step: number }[] };
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ["110", "206", "309", "201", "204"];
const deps = liveDeps(process.env.OUT_DIR ?? "runs/demo");

await Promise.all(ids.map(async (id) => {
  const step = manifest.samples.find((s) => s.id === id)?.step;
  if (!step) throw new Error(`case ${id} is not in the reality-sim manifest`);
  const state = await processCase(deps, `evals/reality-sim/cases/${id}`, false, { step });
  console.log(`${id}: ${state.status.kind}`);
}));
