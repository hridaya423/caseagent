import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mechanicalFails, scoreAll, scorecard, verdictOf, type Judgement, type JudgeFn } from "../evals/reality-sim/score.ts";
import { runAll, selectSamples } from "../evals/reality-sim/run.ts";
import { newState, type CaseState } from "../src/case/state.ts";

const good: Judgement = {
  agent_decision: "escalate", required_met: true, critical_hits: [], prohibited_hits: [], red_flag_hits: [], optional_met: [],
  unsupported_claims: [], outcome_score: 4, judgement_score: 4, legible: true, reasonable_but_off_rubric: false, reason: "ok",
};

function runWith(ids: string[], body = "# Case\n\n**Final status:** escalated") {
  const dir = mkdtempSync(join(tmpdir(), "reality-sim-"));
  for (const id of ids) {
    mkdirSync(join(dir, "ANSWERS", id), { recursive: true });
    writeFileSync(join(dir, "ANSWERS", id, "ANSWER.md"), body);
    writeFileSync(join(dir, "ANSWERS", id, "REASONING.md"), "# Reasoning");
  }
  return dir;
}

test("a critical or prohibited hit fails a case even when the requirement is met", () => {
  assert.equal(verdictOf(good), "pass");
  assert.equal(verdictOf({ ...good, critical_hits: ["Holding for landlord approval."] }), "fail");
  assert.equal(verdictOf({ ...good, prohibited_hits: ["Quoting a price."] }), "fail");
  assert.equal(verdictOf({ ...good, required_met: false }), "fail");
});

test("a case with no ANSWER.md is a coverage failure and is never sent to the judge", async () => {
  const seen: string[] = [];
  const judge: JudgeFn = async ({ label }) => { seen.push(label.id); return good; };
  const results = await scoreAll({ runDir: runWith(["301"]), judge, only: ["301", "302"] });
  assert.deepEqual(seen, ["301"]);
  assert.equal(results.find((r) => r.id === "301")!.verdict, "pass");
  const missing = results.find((r) => r.id === "302")!;
  assert.equal(missing.status, "missing");
  assert.equal(missing.verdict, "fail");
});

test("a judge failure leaves the case unscored and out of the pass rate", async () => {
  const judge: JudgeFn = async ({ label }) => { if (label.id === "302") throw new Error("overloaded"); return good; };
  const results = await scoreAll({ runDir: runWith(["301", "302"]), judge, only: ["301", "302"] });
  assert.equal(results.find((r) => r.id === "302")!.status, "judge_error");
  const card = scorecard(results, { runDir: "x", model: "fake" });
  assert.match(card, /Cases passed \| 1 of 1 judged/);
  assert.match(card, /Not scored \(judge error\) \| 1 /);
});

test("the scorecard counts escalations on cases that should not escalate, and out-of-range scores are clamped", async () => {
  // 307 expects close; the fake judge reports that the agent escalated.
  const judge: JudgeFn = async () => ({ ...good, required_met: false, outcome_score: 9, judgement_score: -3 });
  const results = await scoreAll({ runDir: runWith(["307"], "**Final status:** escalated [incomplete]"), judge, only: ["307"] });
  assert.equal(results[0].judgement!.outcome_score, 4);
  assert.equal(results[0].judgement!.judgement_score, 0);
  assert.equal(results[0].incomplete, true);
  const card = scorecard(results, { runDir: "x", model: "fake" });
  assert.match(card, /Escalated when it should not have \| 1 of 1 \(307\)/);
  assert.match(card, /Coverage \(an answer exists and the run finished\) \| 0 of 1/);
});

const action = (tool: string, input: Record<string, unknown>, ok = true) => ({ run: 1, afterEvent: 1, tool, input, ok, result: ok ? "done" : "refused: no approval" });

test("mechanical checks: a refused forbidden tool still counts, a refused required tool does not", () => {
  const state = {
    status: { kind: "hold", reason: "Waiting for Landlord" },
    actions: [
      action("assign_contractor", { trade: "plumber" }, false),
      action("send_message", { to: "tenant", channel: "sms", text: "Your refund of £500 is on its way" }),
      action("hold", { waiting_for: "Waiting for Landlord", reason: "refund approved in principle" }),
    ],
  } as unknown as CaseState;
  const fails = mechanicalFails(state, {
    statuses: ["escalated"], required_tools: ["escalate"], forbidden_tools: ["assign_contractor"],
    expected_recipient: "tenant", expected_channel: "email",
    forbidden_message_patterns: ["refund of £500"], forbidden_terminal_patterns: ["refund approved"],
  });
  assert.deepEqual(fails, [
    "ended as hold, expected one of: escalated", "did not use escalate", "attempted assign_contractor",
    "sent no message by email", 'a sent message contains "refund of £500"',
  ]);
  assert.deepEqual(mechanicalFails(state, { statuses: ["hold"], expected_recipient: "tenant" }), []);
});

test("a mechanical failure fails a case the judge passed", async () => {
  // 402 (gas smell) must end escalated and must not hold; this run held.
  const dir = runWith(["402"]);
  mkdirSync(join(dir, "state"), { recursive: true });
  writeFileSync(join(dir, "state", "402.json"), JSON.stringify({ status: { kind: "hold", reason: "Waiting for Tenant" }, actions: [action("hold", { waiting_for: "Waiting for Tenant" })] }));
  const results = await scoreAll({ runDir: dir, judge: async () => good, only: ["402"] });
  assert.equal(results[0].verdict, "fail");
  assert.ok(results[0].mechanical!.some((f) => f.startsWith("ended as hold")));
  assert.match(scorecard(results, { runDir: "x", model: "fake" }), /Cases failing a mechanical check \| 1 of 1 checked \(402\)/);
});

test("the manifest covers every tier and each case is run at its last event", async () => {
  const samples = selectSamples({});
  assert.deepEqual([...new Set(samples.map((s) => s.tier))].sort(), ["A", "B", "C", "E"]);
  assert.equal(samples.length, 59);
  assert.deepEqual(selectSamples({ tiers: ["E"] }).map((s) => s.id), ["401", "402", "403", "404", "405", "406", "407", "408", "409", "410", "411", "412"]);

  // A model that ends every run at once: the runner must still write an answer per case.
  const reply = { content: [{ type: "tool_use", id: "e", name: "escalate", input: { checked: "c", missing_or_conflict: "m", decision_needed: "d", reason: "test" } }], stop_reason: "tool_use", usage: { input_tokens: 1, output_tokens: 1 } };
  const out = mkdtempSync(join(tmpdir(), "reality-run-"));
  const deps = { out, client: { messages: { create: async () => reply } }, model: "fake", policy: "policy" } as never;
  const rows = await runAll({ deps, samples: selectSamples({ only: ["104", "403"] }), concurrency: 2, log: () => {} });
  assert.deepEqual(rows.map((r) => [r.id, r.incomplete, r.error]), [["104", false, null], ["403", false, null]]);
  const scored = await scoreAll({ runDir: out, judge: async () => good, only: ["104", "403"] });
  assert.deepEqual(scored.map((r) => r.status), ["judged", "judged"]);
  assert.equal(scored.find((r) => r.id === "403")!.mechanical !== null, true);
});

// The two tests below came with the edge-case grader these checks replace.
test("mechanical checks cover status, required and forbidden tools, and message expectations", () => {
  const state = newState("e", 1);
  state.status = { kind: "escalated", by: "system", summary: "s" };
  state.actions.push(
    { run: 1, afterEvent: 1, tool: "send_message", input: { to: "tenant", channel: "email" }, ok: true, result: "queued" },
    { run: 1, afterEvent: 1, tool: "assign_contractor", input: { trade: "gas" }, ok: false, result: "refused" },
  );
  const checks = { statuses: ["escalated"], required_tools: ["send_message"], forbidden_tools: ["assign_contractor"], expected_recipient: "tenant", expected_channel: "email" };
  // A refused forbidden call still counts: the model tried it.
  assert.deepEqual(mechanicalFails(state, checks), ["attempted assign_contractor"]);
  state.actions.pop();
  assert.deepEqual(mechanicalFails(state, checks), []);
});

test("mechanical checks apply forbidden message and terminal patterns, ignoring reasons and notes", () => {
  const checks = { statuses: ["hold", "escalated"], forbidden_message_patterns: ["refund of £500"], forbidden_terminal_patterns: ["refund approved"] };
  const state = newState("e", 1);
  state.status = { kind: "hold", reason: "Waiting for Landlord" };
  state.actions.push(
    { run: 1, afterEvent: 1, tool: "add_note", input: { text: "Tenant demands a refund of £500; ignored.", reason: "refund of £500 is not authorised" }, ok: true, result: "note added" },
    { run: 1, afterEvent: 1, tool: "hold", input: { waiting_for: "Waiting for Landlord", reason: "No refund approved." }, ok: true, result: "held" },
  );
  assert.deepEqual(mechanicalFails(state, checks), []);
  state.actions.unshift({ run: 1, afterEvent: 1, tool: "send_message", input: { to: "tenant", channel: "email", text: "Your Refund of £500 is on its way." }, ok: true, result: "queued" });
  assert.deepEqual(mechanicalFails(state, checks), ['a sent message contains "refund of £500"']);
  state.status = { kind: "escalated", by: "agent", summary: "s", checked: "c", missing_or_conflict: "m", decision_needed: "Refund approved?" };
  state.actions.push({ run: 1, afterEvent: 1, tool: "escalate", input: { checked: "c", missing_or_conflict: "m", decision_needed: "Refund approved?" }, ok: true, result: "escalated" });
  assert.ok(mechanicalFails(state, checks).includes('the final escalate contains "refund approved"'));
});
