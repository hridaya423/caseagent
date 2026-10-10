import { test } from "node:test";
import assert from "node:assert/strict";
import type Anthropic from "@anthropic-ai/sdk";
import type { ModelClient } from "../src/agent/loop.ts";
import { auditStageCompletion } from "../src/playbook-audit.ts";

const response = (input: unknown, name = "audit_workflow"): Anthropic.Message => ({
  id: "audit-test", type: "message", role: "assistant", model: "fake",
  stop_reason: "tool_use", stop_sequence: null,
  content: [{ type: "tool_use", id: "audit-use", name, input }],
  usage: { input_tokens: 1, output_tokens: 1 },
}) as Anthropic.Message;

function fixture(client: ModelClient, references = "Workflow: request the contractor invoice before holding for it.") {
  const traces: Array<{ kind: string; data: Record<string, unknown> }> = [];
  return {
    traces,
    opts: {
      client, model: "fake", references,
      currentEvidence: [{ id: "event:1", text: "The repair is complete. The contractor has not supplied an invoice." }],
      actions: [{ tool: "send_message", ok: false, input: { to: "contractor", text: "Please send the invoice." }, result: "refused" }],
      ending: { tool: "hold", input: { waiting_for: "Waiting for Provider" } },
      trace: (kind: string, data: Record<string, unknown>) => traces.push({ kind, data }),
    },
  };
}

test("a grounded omission blocks the ending and passes actual execution evidence to the auditor", async () => {
  const calls: Anthropic.MessageCreateParamsNonStreaming[] = [];
  const f = fixture({ messages: { create: async (p) => {
    calls.push(p);
    return response({ ready: false, missing: [{ requirement: "Request the contractor invoice.", current_evidence_ids: ["event:1"] }] });
  } } });
  assert.deepEqual(await auditStageCompletion(f.opts), { ready: false, missing: ["Request the contractor invoice."] });
  assert.equal(calls.length, 1);
  const payload = JSON.parse(String(calls[0].messages[0].content));
  assert.deepEqual(payload.executed_actions, f.opts.actions);
  assert.deepEqual(payload.current_evidence, f.opts.currentEvidence);
  assert.deepEqual(payload.proposed_ending, f.opts.ending);
  assert.equal(payload.references, f.opts.references);
  assert.equal(f.traces[0].kind, "playbook_completion_audit");
});

test("an audit citing unavailable evidence cannot block the agent", async () => {
  const f = fixture({ messages: { create: async () => response({ ready: false, missing: [{ requirement: "Follow a later event.", current_evidence_ids: ["event:999"] }] }) } });
  assert.deepEqual(await auditStageCompletion(f.opts), { ready: true, missing: [] });
  assert.equal(f.traces.length, 1);
  assert.equal(f.traces[0].kind, "playbook_audit_error");
  assert.match(String(f.traces[0].data.error), /unavailable evidence/);
});

test("empty references bypass the auditor without an API call", async () => {
  let calls = 0;
  const f = fixture({ messages: { create: async () => { calls++; throw new Error("Unexpected API call"); } } }, "");
  assert.deepEqual(await auditStageCompletion(f.opts), { ready: true, missing: [] });
  assert.equal(calls, 0);
  assert.deepEqual(f.traces, []);
});

test("auditor API failure preserves normal handling and records the error", async () => {
  const f = fixture({ messages: { create: async () => { throw new Error("Audit unavailable"); } } });
  assert.deepEqual(await auditStageCompletion(f.opts), { ready: true, missing: [] });
  assert.deepEqual(f.traces, [{ kind: "playbook_audit_error", data: { error: "Audit unavailable" } }]);
});

test("wrong tool, contradictory result and malformed audit cannot block normal handling", async () => {
  for (const result of [
    response({ ready: false, missing: [{ requirement: "Request the invoice.", current_evidence_ids: ["event:1"] }] }, "send_message"),
    response({ ready: true, missing: [{ requirement: "Request the invoice.", current_evidence_ids: ["event:1"] }] }),
    response({ ready: false, missing: [] }),
    response({ ready: false, missing: [{ requirement: "Request the invoice.", current_evidence_ids: [] }] }),
  ]) {
    const f = fixture({ messages: { create: async () => result } });
    assert.deepEqual(await auditStageCompletion(f.opts), { ready: true, missing: [] });
    assert.equal(f.traces.length, 1);
    assert.equal(f.traces[0].kind, "playbook_audit_error");
  }
});

test("a completed applicable step permits the proposed ending", async () => {
  const f = fixture({ messages: { create: async () => response({ ready: true, missing: [] }) } });
  f.opts.actions[0].ok = true;
  f.opts.actions[0].result = "email to contractor queued in the outbox";
  assert.deepEqual(await auditStageCompletion(f.opts), { ready: true, missing: [] });
  assert.equal(f.traces[0].kind, "playbook_completion_audit");
});
