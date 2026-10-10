import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdirSync, mkdtempSync, appendFileSync, writeFileSync } from "node:fs";
import { request } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDashboard } from "../src/entry/dashboard-server.ts";
import { newState, saveState, type Action, type CaseState } from "../src/case/state.ts";
import { classify, discoverRuns, listRuns, readCase, readRun, type Sources } from "../src/runner/runs.ts";

const PM = "data/public/Property Management";

const refused: Action = { tool: "send_message", input: { reason: "r" }, ok: false, result: "refused: the message states £500, which no event shows." };
const done = (tool: string, input: Record<string, unknown> = { reason: "r" }): Action => ({ tool, input, ok: true, result: "ok" });

// A batch run with one case per way a case can end.
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "dashboard-"));
  const runsDir = join(root, "runs");
  const batch = join(runsDir, "batch");
  const put = (id: string, state: CaseState, trace: object[] = []) => {
    saveState(join(batch, "state", `${id}.json`), state);
    mkdirSync(join(batch, "traces"), { recursive: true });
    writeFileSync(join(batch, "traces", `${id}.jsonl`), trace.map((r) => JSON.stringify(r)).join("\n") + "\n");
  };
  const state = (id: string, status: CaseState["status"], seen: number, ...runs: Action[][]): CaseState => ({
    ...newState(id, 1),
    seen,
    status,
    runs: runs.map((actions, i) => ({ seen: i === 0 ? 1 : seen, notes: [], actions })),
  });

  put("027", state("027", { kind: "hold", reason: "Waiting for Tenant" }, 7, [refused, done("send_message")], [done("hold")]), [
    { t: "2026-10-10T10:00:00Z", kind: "run_start", case: "027", run: 1, seen: 1, model: "m" },
    { t: "2026-10-10T10:00:01Z", kind: "model", turn: 1, stop: "tool_use", usage: { input_tokens: 100, cache_read_input_tokens: 50, output_tokens: 10 }, content: [{ type: "text", text: "hi" }] },
    { t: "2026-10-10T10:00:02Z", kind: "approval_check_usage", usage: { input_tokens: 5, output_tokens: 5 } },
  ]);
  appendFileSync(join(batch, "traces", "027.jsonl"), '{"t":"2026-10-10T10:00:03Z","kind":"mod');
  put("a-handover", state("a-handover", { kind: "escalated", by: "agent", summary: "s", checked: "c", missing_or_conflict: "m", decision_needed: "d" }, 1, [done("escalate")]));
  put("b-system", state("b-system", { kind: "escalated", by: "system", summary: "System error: 529" }, 1, []));
  mkdirSync(join(runsDir, ".hidden", "state"), { recursive: true });
  mkdirSync(join(runsDir, "nothing-here"), { recursive: true });
  const src: Sources = { runsDir, evalDirs: ["evals/results"], casesDirs: [PM] };
  return { src, batch };
}

test("classifies a tool result by who refused it", () => {
  assert.equal(classify({ ok: true, result: "case on hold" }), "ok");
  assert.equal(classify(refused), "refused");
  assert.equal(classify({ ok: false, result: "invalid input:\nmissing text" }), "failed");
  assert.equal(classify({ ok: false, result: "refused: the run already ended; the action was not executed" }), "skipped");
  assert.equal(classify({ ok: false, result: "not executed: an earlier action in this response failed; the action was not executed" }), "skipped");
});

test("finds batch runs and the checked-in process eval, and skips hidden folders", () => {
  const { src } = fixture();
  const runs = discoverRuns(src);
  assert.ok(runs.some((r) => r.id === "batch" && r.kind === "batch"));
  assert.ok(runs.some((r) => r.kind === "eval" && r.id.startsWith("evals~results~")));
  assert.ok(!runs.some((r) => r.id.includes("hidden") || r.id.includes("nothing-here")));
  assert.ok(listRuns(src).every((r) => !("dir" in r)));
});

test("a run lists each case with its status, guard refusals and tokens", () => {
  const { src } = fixture();
  const rows = Object.fromEntries(readRun(src, "batch")!.cases.map((c) => [c.caseId, c]));
  assert.equal(rows["a-handover"].status, "escalated");
  assert.equal(rows["b-system"].status, "incomplete");
  assert.equal(rows["027"].status, "hold");
  assert.equal(rows["027"].refused, 1);
  assert.equal(rows["027"].runs, 2);
  assert.equal(rows["027"].tokens, 100 + 50 + 10 + 10, "counts the agent's calls and the approval checks, and ignores a half-written line");
  assert.notEqual(rows["027"].title, "Case 027", "the title comes from the case folder");
});

test("a case shows which events the agent could see", () => {
  const { src } = fixture();
  const view = readCase(src, "batch", "027")!;
  const seen = Object.fromEntries(view.events!.map((e) => [e.n, e.view]));
  assert.equal(seen[1], "seen");
  assert.equal(seen[2], "own", "the agency's own later record is hidden even before the latest event");
  assert.equal(seen[7], "seen");
  assert.equal(seen[8], "future");
  assert.deepEqual(view.runs, [{ run: 1, seen: 1 }, { run: 2, seen: 7 }]);
  const [first] = view.actions;
  assert.equal(first.outcome, "refused");
  assert.equal(first.recovered, true, "a later send_message succeeded");
  assert.equal(view.trace.find((r) => r.kind === "run_start")?.label, "Run 1 starts");
  assert.match(view.final?.kind ?? "", /hold/);
});

test("a case whose folder is missing still opens, without a history", () => {
  const { src } = fixture();
  const view = readCase({ ...src, casesDirs: [] }, "batch", "a-handover")!;
  assert.equal(view.events, null);
  assert.equal(view.title, "Case a-handover");
  assert.equal(view.decision?.next, "A person decides: d");
});

test("reads an eval sample with its trace and a single-step decision", () => {
  const { src } = fixture();
  const run = discoverRuns(src).find((r) => r.kind === "eval")!;
  const view = readRun(src, run.id)!;
  assert.equal(view.cases.length, 10);
  assert.ok(view.meta.note?.includes("10"));
  const sample = readCase(src, run.id, view.cases[0].key)!;
  assert.ok(sample.trace.some((r) => r.kind === "model"));
  assert.match(sample.answer, /^# Case/);
  assert.ok(view.cases.every((c) => c.tag));
});

test("unknown runs and cases come back as not found, and keys cannot leave the run", () => {
  const { src } = fixture();
  assert.equal(readRun(src, "nope"), null);
  assert.equal(readCase(src, "batch", "../../package"), null);
  assert.equal(readCase(src, "batch", "missing"), null);
});

async function serve() {
  const { src } = fixture();
  const server = createDashboard({ ...src, staticDir: "dashboard" });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return { server, base: `http://127.0.0.1:${(server.address() as AddressInfo).port}` };
}

test("serves the page and its files, and the run data as JSON", async () => {
  const { server, base } = await serve();
  try {
    const page = await fetch(base);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /<title>Case Agent/);
    assert.equal((await fetch(`${base}/js/app.js`)).headers.get("content-type"), "text/javascript; charset=utf-8");
    const runs = (await (await fetch(`${base}/api/runs`)).json()) as { id: string }[];
    assert.ok(runs.some((r) => r.id === "batch"));
    const run = await (await fetch(`${base}/api/runs/batch`)).json();
    assert.equal(run.cases.length, 3);
    const one = await (await fetch(`${base}/api/runs/batch/cases/a-handover`)).json();
    assert.equal(one.status, "escalated");
  } finally {
    server.close();
  }
});

test("is read-only, local-only and confined to the dashboard folder", async () => {
  const { server, base } = await serve();
  try {
    assert.equal((await fetch(`${base}/api/runs`, { method: "POST" })).status, 405);
    assert.equal((await fetch(`${base}/api/runs/nope`)).status, 404);
    assert.equal((await fetch(`${base}/api/runs/batch/cases/missing`)).status, 404);
    assert.equal((await fetch(`${base}/package.json`)).status, 404);
    assert.equal((await fetch(`${base}/..%2fpackage.json`)).status, 404);
    // fetch cannot override Host, so a DNS-rebinding request goes through node:http.
    const status = await new Promise<number>((resolve, reject) => {
      const u = new URL(`${base}/api/runs`);
      request({ host: u.hostname, port: u.port, path: u.pathname, headers: { host: "evil.example" } }, (res) => (res.resume(), resolve(res.statusCode ?? 0))).on("error", reject).end();
    });
    assert.equal(status, 403);
  } finally {
    server.close();
  }
});
