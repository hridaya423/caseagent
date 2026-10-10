import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type Anthropic from "@anthropic-ai/sdk";
import type { ModelClient } from "../src/agent.ts";
import { runBatch } from "../src/batch.ts";
import { withFallback, type RunDeps } from "../src/run.ts";

const PM = "data/public/Property Management";
const reply = (content: unknown[], model = "fake") => ({ content, model, stop_reason: "tool_use", usage: { input_tokens: 10, output_tokens: 5 } }) as unknown as Anthropic.Message;
const use = (id: string, name: string, input: Record<string, unknown>) => ({ type: "tool_use", id, name, input });
const hold = use("h", "hold", { waiting_for: "Waiting for Tenant", reason: "Asked the tenant [event 001]." });
const message = use("m", "send_message", { to: "tenant", channel: "email", text: "Please try a plunger and tell us if it clears.", reason: "Blocked drain [event 001]." });
const sms = use("s", "send_message", { to: "tenant", channel: "sms", text: "Please read our email about the drain.", reason: "Prompt [event 001]." });
const deps = (client: ModelClient, out = mkdtempSync(join(tmpdir(), "batch-"))): RunDeps => ({ out, client, model: "fake", policy: "policy" });

function counting(content: unknown[]) {
  const calls = { n: 0 };
  const client: ModelClient = { messages: { create: async () => (calls.n++, reply(content)) } };
  return { calls, client };
}

test("withFallback retries an overloaded request once on the fallback model, and only then", async () => {
  const models: string[] = [];
  const flaky = (status: number): ModelClient => ({
    messages: {
      create: async (p) => {
        models.push(p.model);
        if (p.model === "main") throw Object.assign(new Error(`${status}`), { status });
        return reply([], p.model);
      },
    },
  });
  const params = { model: "main", max_tokens: 1, messages: [] } as Anthropic.MessageCreateParamsNonStreaming;
  assert.equal((await withFallback(flaky(529), "spare").messages.create(params)).model, "spare");
  assert.deepEqual(models, ["main", "spare"]);
  await assert.rejects(() => withFallback(flaky(400), "spare").messages.create(params), /400/);
});

function casesDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "cases-"));
  cpSync(`${PM}/027`, join(dir, "027"), { recursive: true });
  mkdirSync(join(dir, "messy"));
  writeFileSync(join(dir, "messy", "tenant.eml"), "From: Priya <priya@example.com>\nTo: ops@lettings.example\nSubject: Intercom broken\nDate: Thu, 8 Oct 2026 18:42:11 +0100\n\nThe intercom does not open the door.\n");
  writeFileSync(join(dir, "messy", "photo.heic"), "x");
  mkdirSync(join(dir, "empty"));
  return dir;
}

test("runBatch runs every folder, writes the summary, the outbox and one ANSWER.md per case", async () => {
  const { client } = counting([message, sms, hold]);
  const d = deps(client);
  const rows = await runBatch({ casesDir: casesDir(), deps: d, concurrency: 2, toEnd: false, log: () => {} });
  assert.deepEqual(rows.map((r) => r.id).sort(), ["027", "empty", "messy"]);
  for (const id of ["027", "empty", "messy"]) assert.ok(existsSync(join(d.out, "ANSWERS", id, "ANSWER.md")), id);

  const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
  assert.equal(byId["027"].status, "hold (Waiting for Tenant)");
  assert.equal(byId["027"].next, "Wait for the tenant's reply.");
  assert.equal(byId["027"].messages, 2);
  assert.deepEqual([byId["027"].input_tokens, byId["027"].output_tokens], [10, 5]);
  assert.equal(byId.empty.incomplete, true);

  const md = readFileSync(join(d.out, "RUN_SUMMARY.md"), "utf8");
  assert.match(md, /\| 027 \| hold \(Waiting for Tenant\) \| Wait for the tenant's reply\. \| 2 \| 1 \|/);
  assert.match(md, /Incomplete: 1/);

  assert.deepEqual(readdirSync(join(d.out, "outbox", "027")), ["01-run1-tenant.eml", "02-run1-tenant.sms.txt"]);
  const eml = readFileSync(join(d.out, "outbox", "027", "01-run1-tenant.eml"), "utf8");
  assert.match(eml, /^Message-ID: <027\.1\.1@northbridge-lettings\.case-agent>\r\nDate: Fri, 17 Apr 2026 14:/);
  assert.match(eml, /\r\nTo: tenant <tenant@case-027\.invalid>\r\nSubject: Re: Blocked Bath Drain Request\r\n/);
  assert.match(eml, /\r\n\r\nPlease try a plunger and tell us if it clears\.\r\n$/);
  assert.match(readFileSync(join(d.out, "outbox", "027", "02-run1-tenant.sms.txt"), "utf8"), /To: tenant\n\nPlease read our email/);
  assert.match(readFileSync(join(d.out, "ANSWERS", "messy", "ANSWER.md"), "utf8"), /\*\*Files not read:\*\* photo\.heic/);
});

test("a rerun skips finished cases; --retry-incomplete reruns only the incomplete one; --fresh reruns all", async () => {
  const dir = casesDir();
  const out = mkdtempSync(join(tmpdir(), "batch-"));
  const first = counting([hold]);
  await runBatch({ casesDir: dir, deps: deps(first.client, out), concurrency: 1, toEnd: false, log: () => {} });
  const firstCalls = first.calls.n;
  assert.ok(firstCalls >= 2);

  const again = counting([hold]);
  const logs: string[] = [];
  await runBatch({ casesDir: dir, deps: deps(again.client, out), concurrency: 1, toEnd: false, log: (l) => logs.push(l) });
  assert.equal(again.calls.n, 0);
  assert.match(logs[0], /skipping 3 cases/);

  const retry = counting([hold]);
  const retried: string[] = [];
  await runBatch({ casesDir: dir, deps: deps(retry.client, out), concurrency: 1, toEnd: false, retryIncomplete: true, log: (l) => retried.push(l) });
  assert.equal(retry.calls.n, 0);
  assert.ok(retried.some((l) => /empty: escalated \[incomplete\]/.test(l)));

  const fresh = counting([hold]);
  await runBatch({ casesDir: dir, deps: deps(fresh.client, out), concurrency: 1, toEnd: false, fresh: true, log: () => {} });
  assert.equal(fresh.calls.n, firstCalls);
});

test("ANSWER.md starts with the decision; an escalated case shows the handover before the summary", async () => {
  const { client } = counting([hold]);
  const d = deps(client);
  await runBatch({ casesDir: casesDir(), deps: d, concurrency: 1, toEnd: false, limit: 1, log: () => {} });
  const held = readFileSync(join(d.out, "ANSWERS/027/ANSWER.md"), "utf8");
  assert.match(held, /^# Case 027: Blocked Bath Drain Request\n\n## Decision\n\n- \*\*Status:\*\* hold \(Waiting for Tenant\)\n- \*\*Next step:\*\* Wait for the tenant's reply\.\n- \*\*Why:\*\* Asked the tenant \[event 001\]\.\n\n## Summary/);

  const esc = counting([use("e", "escalate", { checked: "the events [event 001]", missing_or_conflict: "two reports conflict", decision_needed: "pick a side", reason: "conflict [event 001]" })]);
  const d2 = deps(esc.client);
  await runBatch({ casesDir: casesDir(), deps: d2, concurrency: 1, toEnd: false, limit: 1, log: () => {} });
  const escalated = readFileSync(join(d2.out, "ANSWERS/027/ANSWER.md"), "utf8");
  assert.match(escalated, /## Decision\n\n- \*\*Status:\*\* escalated\n- \*\*Next step:\*\* A person decides: pick a side\n- \*\*Why:\*\* two reports conflict\n\n## Escalation\n\n- \*\*Checked:\*\*[\s\S]*\n\n## Summary/);
  assert.equal(escalated.match(/## Escalation/g)?.length, 1);
});
