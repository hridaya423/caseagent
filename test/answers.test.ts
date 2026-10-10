import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeAnswer } from "../src/runner/answers.ts";
import { visibleEvents } from "../src/case/cut.ts";
import { loadCase } from "../src/case/parse.ts";
import { newState, type CaseState } from "../src/case/state.ts";
import { act, run } from "./helpers.ts";

const c = loadCase("data/public/Property Management/027");

function answerFor(s: CaseState, seen: number, file = "ANSWER.md"): string {
  const out = mkdtempSync(join(tmpdir(), "answers-"));
  writeAnswer(out, c, s, visibleEvents(c, 1, seen));
  return readFileSync(join(out, "ANSWERS/027", file), "utf8");
}

test("full message text appears in outbox", () => {
  const s = newState("027", 1);
  const send = act("send_message", { to: "tenant", channel: "email", text: "Please confirm receipt of this message.", reason: "Testing" }, true, "email to tenant queued in the outbox");
  s.runs = [run(1, [send], ["Tenant first."])];
  s.status = { kind: "hold", reason: "Waiting for Tenant" };
  const answer = answerFor(s, 1);
  assert.match(answer, /## Outbox/);
  assert.match(answer, /Please confirm receipt of this message\./);
  assert.match(answer, /Run 1, to tenant, email/);
});

test("final checks appear only for closed cases", () => {
  const s = newState("027", 1);
  const checks = { outcome: "work_completed", work_confirmed_by: "tenant [event 001]", landlord_informed: true, keys: "returned", invoice: "on_file" } as const;
  s.runs = [run(1, [act("close_case", { ...checks, reason: "All done" }, true, "case closed")])];
  s.status = { kind: "closed", checks };
  const answer = answerFor(s, 1);
  assert.match(answer, /## Final checks/);
  assert.match(answer, /\*\*Outcome\*\* \| work_completed/);
  assert.match(answer, /\*\*Keys\*\* \| returned/);
});

test("final checks do not appear for open cases", () => {
  const s = newState("027", 1);
  s.runs = [run(1)];
  assert.doesNotMatch(answerFor(s, 1), /## Final checks/);
});

test("each run has its own timeline block", () => {
  const s = newState("027", 1);
  s.runs = [
    run(1, [act("send_message", { to: "tenant", channel: "email", text: "First message", reason: "First" }, true, "queued")]),
    run(2, [act("send_message", { to: "tenant", channel: "email", text: "Second message", reason: "Second" }, true, "queued")]),
  ];
  s.status = { kind: "hold", reason: "Waiting for Tenant" };
  const answer = answerFor(s, 2);
  assert.match(answer, /### Run 1/);
  assert.match(answer, /### Run 2/);
  assert.match(answer, /First message/);
  assert.match(answer, /Second message/);
});

test("a run with no actions and no notes keeps its events in the timeline", () => {
  const s = newState("027", 1);
  s.seen = 7;
  s.runs = [run(1, [act("hold", { waiting_for: "Waiting for Tenant", reason: "r" })]), run(7)];
  s.status = { kind: "escalated", by: "system", summary: "System error: API down. A person must review case 027." };
  assert.match(answerFor(s, 7), /### Run 2\n\n- event 007: /);
});

test("REASONING.md groups notes by run: two runs give two note blocks", () => {
  const s = newState("027", 1);
  s.runs = [
    run(1, [act("hold", { waiting_for: "Waiting for Tenant", reason: "Awaiting response." }, true, "case on hold: Waiting for Tenant")], ["Tenant contacted for information."]),
    run(2, [act("hold", { waiting_for: "Waiting for Landlord", reason: "Awaiting landlord approval." }, true, "case on hold: Waiting for Landlord")], ["Tenant provided details."]),
  ];
  s.status = { kind: "hold", reason: "Waiting for Landlord" };
  const reasoning = answerFor(s, 2, "REASONING.md");
  assert.match(reasoning, /## Run 1\n[\s\S]*Tenant contacted for information[\s\S]*## Run 2\n[\s\S]*Tenant provided details/);
  assert.doesNotMatch(reasoning.split("## Run 2")[0], /Tenant provided details/);
});

test("ANSWER.md shows the three escalation fields for an agent escalation, plain text for a system one", () => {
  const s = newState("027", 1);
  s.runs = [run(1)];
  s.status = {
    kind: "escalated",
    by: "agent",
    summary: "Checked: the events [event 001]\nMissing or in conflict: two reports conflict\nDecision needed: pick a side",
    checked: "the events [event 001]",
    missing_or_conflict: "two reports conflict",
    decision_needed: "pick a side",
  };
  assert.match(answerFor(s, 1), /## Escalation\n\n- \*\*Checked:\*\* the events \[event 001\]\n- \*\*Missing or in conflict:\*\* two reports conflict\n- \*\*Decision needed:\*\* pick a side/);

  s.status = { kind: "escalated", by: "system", summary: "System error: API down. A person must review case 027." };
  assert.match(answerFor(s, 1), /## Escalation\n\nSystem error: API down/);
});
