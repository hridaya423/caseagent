import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AddressInfo } from "node:net";
import { once } from "node:events";
import { request } from "node:http";
import { listen, discoverRuns, type DashboardOptions } from "../src/dashboard.ts";
import type { RunDeps } from "../src/run.ts";

const PM = "data/public/Property Management";

// A model that always holds for the tenant, so every run ends after one turn.
const fakeDeps = (out: string): RunDeps => ({
  out, model: "fake", policy: "policy",
  client: { messages: { create: async () => ({
    id: "m", type: "message", role: "assistant", model: "fake", stop_reason: "tool_use", stop_sequence: null,
    usage: { input_tokens: 10, output_tokens: 5 },
    content: [{ type: "tool_use", id: "t1", name: "hold", input: { waiting_for: "Waiting for Tenant", reason: "Waiting on the tenant [event 001]." } }],
  }) as any } },
});

async function setup() {
  const root = mkdtempSync(join(tmpdir(), "dash-"));
  const runsDir = join(root, "runs");
  mkdirSync(join(runsDir, "batch-a", "state"), { recursive: true });
  const opts: DashboardOptions = {
    casesDir: PM, runsDir, evalDirs: ["evals/results"], html: () => "<!doctype html><title>t</title>",
    makeDeps: fakeDeps, hasKey: () => true, model: "fake", concurrency: 2,
  };
  const server = listen(opts, 0);
  await once(server, "listening");
  const base = () => `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  return { root, runsDir, opts, server, base };
}

const post = (url: string, body: unknown, headers: Record<string, string> = { "x-case-agent": "1" }) =>
  fetch(url, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) });

async function waitJob(base: string, id: string) {
  for (let i = 0; i < 100; i++) {
    const j = await (await fetch(`${base}/api/jobs/${id}`)).json();
    if (j.status !== "running") return j;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error("job did not finish");
}

test("discovers batch runs in runs/ and the checked-in process eval", async () => {
  const { opts, server } = await setup();
  try {
    const runs = discoverRuns(opts);
    assert.ok(runs.some((r) => r.id === "batch-a" && r.kind === "batch"));
    assert.ok(runs.some((r) => r.kind === "eval" && r.id.startsWith("evals~")));
  } finally { server.close(); }
});

test("lists every public case as not run in an empty batch run", async () => {
  const { base, server } = await setup();
  try {
    const data = await (await fetch(`${base()}/api/runs/batch-a`)).json();
    assert.equal(data.cases.length, 50);
    assert.ok(data.cases.every((c: any) => c.status === "not_run"));
  } finally { server.close(); }
});

test("reads an eval run's samples with their answers and traces", async () => {
  const { base, server, opts } = await setup();
  try {
    const run = discoverRuns(opts).find((r) => r.kind === "eval")!;
    const data = await (await fetch(`${base()}/api/runs/${run.id}`)).json();
    assert.equal(data.cases.length, 10);
    const one = data.cases[0];
    const c = await (await fetch(`${base()}/api/runs/${run.id}/cases/${one.key}`)).json();
    assert.match(c.answer_md, /^# Case/);
    assert.ok(c.trace.some((r: any) => r.kind === "model"));
    assert.ok(c.info.events.length > 0);
  } finally { server.close(); }
});

test("re-run needs the X-Case-Agent header", async () => {
  const { base, server } = await setup();
  try {
    const r = await post(`${base()}/api/runs/batch-a/rerun`, { cases: ["027"], mode: "stage" }, {});
    assert.equal(r.status, 403);
  } finally { server.close(); }
});

test("re-runs a case, then keeps the earlier answer under history/", async () => {
  const { base, server, runsDir } = await setup();
  try {
    let r = await post(`${base()}/api/runs/batch-a/rerun`, { cases: ["027"], mode: "stage" });
    assert.equal(r.status, 202);
    let job = await waitJob(base(), (await r.json()).job.id);
    assert.equal(job.status, "done");
    assert.equal(job.done, 1);
    assert.ok(existsSync(join(runsDir, "batch-a", "ANSWERS", "027", "ANSWER.md")));
    let row = (await (await fetch(`${base()}/api/runs/batch-a`)).json()).cases.find((c: any) => c.case_id === "027");
    assert.equal(row.status, "hold");

    r = await post(`${base()}/api/runs/batch-a/rerun`, { cases: "ran", mode: "stage" });
    job = await waitJob(base(), (await r.json()).job.id);
    assert.equal(job.done, 1);
    assert.equal(readdirSync(join(runsDir, "batch-a", "history", "027")).length, 1);
    const c = await (await fetch(`${base()}/api/runs/batch-a/cases/027`)).json();
    assert.equal(c.attempts.length, 1);
    assert.equal(c.attempts[0].status, "hold");
  } finally { server.close(); }
});

test("refuses unknown cases, bad run names and other hosts", async () => {
  const { base, server } = await setup();
  try {
    const r1 = await post(`${base()}/api/runs/batch-a/rerun`, { cases: ["../../etc"], mode: "stage" });
    assert.equal(r1.status, 400);
    const r2 = await post(`${base()}/api/runs`, { name: "../escape" });
    assert.equal(r2.status, 400);
    // fetch cannot override Host, so a DNS-rebinding request is sent with node:http.
    const status = await new Promise<number>((resolve, reject) => {
      const u = new URL(`${base()}/api/runs`);
      request({ host: u.hostname, port: u.port, path: u.pathname, headers: { host: "evil.example" } }, (res) => { res.resume(); resolve(res.statusCode ?? 0); }).on("error", reject).end();
    });
    assert.equal(status, 403);
    const r4 = await fetch(`${base()}/api/runs/batch-a/cases/..%2F..%2Fpackage`);
    assert.equal(r4.status, 404);
  } finally { server.close(); }
});

test("creates a new empty run folder", async () => {
  const { base, server, runsDir } = await setup();
  try {
    const r = await post(`${base()}/api/runs`, { name: "reality-test" });
    assert.equal(r.status, 201);
    assert.ok(existsSync(join(runsDir, "reality-test", "state")));
    const again = await post(`${base()}/api/runs`, { name: "reality-test" });
    assert.equal(again.status, 409);
  } finally { server.close(); }
});
