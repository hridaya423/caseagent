// Paired development evaluation. Labels never enter the MCP server or actor.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../../src/entry/mcp.ts";
import { liveDeps } from "../../src/runner/process.ts";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const out = resolve(process.argv[2] ?? "runs/reality-sim/paired");
const trials = Number(process.argv[3] ?? "2");
if (!Number.isInteger(trials) || trials < 1) throw new Error("Trials must be a positive integer");
const commit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const casesDir = resolve("evals/reality-sim/cases");
const samples: { id: string; step: number }[] = JSON.parse(readFileSync("evals/reality-sim/manifest.json", "utf8")).samples.map((s: { id: string; step: number }) => ({ id: s.id, step: s.step }));
const sessions: { trial: number; arm: "baseline" | "playbooks"; dir: string; client: Client; server: ReturnType<typeof createServer>; results: { id: string; step: number; duration_ms: number; status: unknown; error: string | null }[]; save: () => void }[] = [];
for (let trial = 1; trial <= trials; trial++) {
  for (const arm of ["baseline", "playbooks"] as const) {
    const dir = `${out}/trial-${trial}/${arm}`;
    if (existsSync(dir)) throw new Error(`Use a fresh output directory: ${dir}`);
    mkdirSync(dir, { recursive: true });
    const deps = liveDeps(dir);
    if (arm === "baseline") deps.playbooks = false;
    else if (!deps.playbooks) throw new Error("Playbooks must be enabled for the reference arm");
    const server = createServer({ casesDir, deps });
    const client = new Client({ name: "paired-reality-sim", version: "1" });
    const [a, b] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(a), client.connect(b)]);
    const results: { id: string; step: number; duration_ms: number; status: unknown; error: string | null }[] = [];
    const meta = { code_commit: commit, trial, arm, actor_model: deps.model, selector_model: deps.playbooks ? deps.playbooks.model ?? deps.model : null, playbooks_enabled: Boolean(deps.playbooks), policy_hash: createHash("sha256").update(deps.policy).digest("hex"), started_at: new Date().toISOString(), invocation: "MCP run_case at manifest.step, complete stage, labels excluded", counterbalance: "Alternate arm order by case index and trial" };
    const save = () => writeFileSync(`${dir}/run-metadata.json`, JSON.stringify({ ...meta, results }, null, 2) + "\n");
    save();
    sessions.push({ trial, arm, dir, client, server, results, save });
  }
}
const jobs = Array.from({ length: trials }, (_, t) => samples.map((s, index) => ({ trial: t + 1, index, s }))).flat();
let next = 0;
try {
  await Promise.all(Array.from({ length: 4 }, async () => {
    for (let i = next++; i < jobs.length; i = next++) {
      const { trial, index, s } = jobs[i];
      const order = (index + trial) % 2 ? ["baseline", "playbooks"] : ["playbooks", "baseline"];
      for (const arm of order) {
        const session = sessions.find((x) => x.trial === trial && x.arm === arm)!;
        const start = Date.now(); let error: string | null = null;
        try {
          const r = await session.client.callTool({ name: "run_case", arguments: { case_id: s.id, step: s.step } }, undefined, { timeout: 900000 });
          if (r.isError) error = JSON.stringify(r.content);
        } catch (e) { error = e instanceof Error ? e.message : String(e); }
        const stateFile = `${session.dir}/state/${s.id}.json`;
        const state = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, "utf8")) : null;
        session.results.push({ ...s, duration_ms: Date.now() - start, status: state?.status, error });
        session.save();
        console.log(JSON.stringify({ trial, arm, id: s.id, completed: session.results.length, status: state?.status?.kind, error }));
      }
    }
  }));
} finally {
  for (const s of sessions) { await s.client.close(); await s.server.close(); }
}
