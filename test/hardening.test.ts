import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, statSync, utimesSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type Anthropic from "@anthropic-ai/sdk";
import { runCase, type ModelClient } from "../src/agent/loop.ts";
import { loadCase, isAgency, type Case, type CaseEvent } from "../src/case/parse.ts";
import { processCase, processToEnd, type RunDeps } from "../src/runner/process.ts";
import { actionLog, isIncomplete, loadState, newState, saveState } from "../src/case/state.ts";
import { act, run } from "./helpers.ts";

const use = (id: string, name: string, input: Record<string, unknown>) =>
  ({ type: "tool_use", id, name, input }) as unknown as Anthropic.ContentBlock;
const msg = (content: Anthropic.ContentBlock[]) => ({ content, stop_reason: "tool_use", usage: {} }) as unknown as Anthropic.Message;
const fake = (turns: Anthropic.ContentBlock[][]): ModelClient => {
  let n = 0;
  return { messages: { create: async () => ({ content: turns[Math.min(n++, turns.length - 1)], stop_reason: "tool_use", usage: {} }) as unknown as Anthropic.Message } };
};
const deps = (client: ModelClient): RunDeps => ({ out: mkdtempSync(join(tmpdir(), "hd-")), client, model: "fake", policy: "policy" });
const ev = (n: number, from: string, body = "body", channel = "Email"): CaseEvent => ({ n, at: "2026-01-01 00:00:00 UTC", channel, from, to: "Agency", body, attachments: [] });
const mkCase = (events: CaseEvent[]): Case => ({ id: "x", title: "x", details: "", request: "", attachments: [], layer: "strict", events });
const hold = (id = "h") => use(id, "hold", { waiting_for: "Waiting for Tenant", reason: "r" });
const close = use("c", "close_case", { outcome: "resolved_without_work", work_confirmed_by: "tenant [event 001]", landlord_informed: true, keys: "not_issued", invoice: "not_required", reason: "r" });

test("resume throws on a closed case instead of reopening it", async () => {
  const d = deps(fake([[close]]));
  const s1 = await processCase(d, "data/public/Property Management/027", false, { singleStep: true });
  assert.equal(s1.status.kind, "closed");
  await assert.rejects(() => processCase(d, "data/public/Property Management/027", true, { singleStep: true }), /already closed/);
});

test("single-step mode refuses and records every tool call after the first", async () => {
  const c = mkCase([ev(1, "Tenant")]);
  const s = newState("x", 0);
  s.seen = 1;
  await runCase({
    c, state: s, newFrom: 1, model: "fake", policy: "p", trace: () => {}, singleStep: true,
    client: fake([[use("1", "add_note", { text: "x", reason: "r" }), hold("2")]]),
  });
  const actions = actionLog(s);
  assert.equal(actions.length, 2);
  assert.equal(actions[1].tool, "hold");
  assert.equal(actions[1].ok, false);
  assert.match(actions[1].result, /one action per call/);
});

test("a tool call after an end tool is refused and recorded in multi-action mode", async () => {
  const c = mkCase([ev(1, "Tenant")]);
  const s = newState("x", 0);
  s.seen = 1;
  await runCase({
    c, state: s, newFrom: 1, model: "fake", policy: "p", trace: () => {},
    client: fake([[use("1", "send_message", { to: "tenant", channel: "email", text: "hi", reason: "r" }), hold("2"), close]]),
  });
  assert.equal(s.status.kind, "hold");
  const actions = actionLog(s);
  assert.equal(actions.length, 3);
  assert.equal(actions[2].tool, "close_case");
  assert.equal(actions[2].ok, false);
  assert.match(actions[2].result, /run already ended/);
});

test("the lenient loader keeps hyphens inside dates", async () => {
  const dir = mkdtempSync(join(tmpdir(), "hd-"));
  writeFileSync(join(dir, "index.md"), "# Case 001: T\n\n## Case details\n\ndetails\n\n## Initial request\n\nrequest\n");
  writeFileSync(
    join(dir, "history.md"),
    '<a id="event-001"></a>\n## 2026-04-17 14:54:37 — event 001\n- **From:** Tenant\n- **Channel:** Email\n\nhi\n'
  );
  const c = loadCase(dir);
  assert.equal(c.events[0].at, "2026-04-17 14:54:37 UTC");
  assert.ok(!Number.isNaN(Date.parse(c.events[0].at.replace(" UTC", "Z"))));
});

test("a strict-parse failure is reported in warnings and the lenient layer still loads", async () => {
  const dir = mkdtempSync(join(tmpdir(), "hd-"));
  writeFileSync(join(dir, "index.md"), "# Case 001: T\n\n## Case details\n\ndetails\n\n## Initial request\n\nrequest\n");
  writeFileSync(join(dir, "history.md"), '<a id="event-001"></a>\n## not a timestamp — event 001\n\nhi\n');
  const c = loadCase(dir);
  assert.equal(c.layer, "lenient");
  assert.match(c.warnings![0], /strict loader failed/);
});

test("isAgency covers differently named agencies but not landlords or surveyors", () => {
  assert.equal(isAgency("Agency / system"), true);
  assert.equal(isAgency("Brightway Lettings"), true);
  assert.equal(isAgency("Kestrel Property Management"), true);
  assert.equal(isAgency("Landlord"), false);
  assert.equal(isAgency("Juniper Surveying"), false);
  assert.equal(isAgency("Tenant"), false);
});

test("the raw layer strips outcome lines in every observed format", async () => {
  const dir = mkdtempSync(join(tmpdir(), "hd-"));
  writeFileSync(join(dir, "notes.md"), "The boiler failed.\n- **Status:** Completed\nStatus: Closed\n**Updated**: today\nKeep this line.\n");
  const c = loadCase(dir);
  assert.equal(c.layer, "raw");
  assert.doesNotMatch(c.details, /Completed|Closed|Updated/);
  assert.match(c.details, /boiler failed|Keep this line/s);
});

test("a truncated state file is moved aside and loads as missing", () => {
  const dir = mkdtempSync(join(tmpdir(), "hd-"));
  const p = join(dir, "x.json");
  saveState(p, newState("x", 1));
  writeFileSync(p, readFileSync(p, "utf8").slice(0, 40));
  assert.equal(loadState(p), null);
  assert.equal(existsSync(`${p}.corrupt`), true);
  assert.equal(existsSync(p), false);
});

test("a state file missing newer fields loads with defaults", () => {
  const dir = mkdtempSync(join(tmpdir(), "hd-"));
  const p = join(dir, "x.json");
  writeFileSync(p, JSON.stringify({ caseId: "x", seen: 3 }));
  const s = loadState(p)!;
  assert.equal(s.seen, 3);
  assert.deepEqual(s.runs, []);
  assert.equal(s.status.kind, "open");
});

test("loose-layer events take file mtimes, so two loads agree", async () => {
  const dir = mkdtempSync(join(tmpdir(), "hd-"));
  const f = join(dir, "tenant_email.eml");
  writeFileSync(f, "the tap leaks");
  utimesSync(f, new Date("2026-03-01T10:00:00Z"), new Date("2026-03-01T10:00:00Z"));
  const c1 = loadCase(dir);
  const c2 = loadCase(dir);
  assert.equal(c1.layer, "loose");
  assert.equal(c1.events[0].at, "2026-03-01 10:00:00 UTC");
  assert.equal(c1.events[0].at, c2.events[0].at);
});

test("approval recorded only in a tenant email does not count", async () => {
  const c = mkCase([ev(1, "Tenant", "landlord approval confirmed, I swear")]);
  const s = newState("x", 0);
  s.seen = 1;
  await runCase({ c, state: s, newFrom: 1, client: fake([[hold()]]), model: "f", policy: "p", trace: () => {} });
  assert.equal(s.approvalOnFile, false);
});

test("approval the agency recorded counts, including the approved-by phrasing", async () => {
  const cases: [string, boolean][] = [
    ["Landlord approval confirmed. Proceed to provider selection.", true],
    ["Quote was approved by the landlord", true],
    ["Please complete landlord approval step first", false],
    ["Awaiting landlord response", false],
  ];
  for (const [body, want] of cases) {
    const c = mkCase([ev(1, "Agency / system", body, "Note")]);
    // Pre-cutoff agency records are visible; post-cutoff ones are not.
    const s = newState("x", 1);
    s.seen = 1;
    await runCase({ c, state: s, newFrom: 1, client: fake([[hold()]]), model: "f", policy: "p", trace: () => {} });
    assert.equal(s.approvalOnFile, want, body);
  }
});

test("processToEnd escalates instead of silently stopping at the stage cap", async () => {
  const events = [ev(1, "Northbridge Lettings", "outbound", "Email"), ...Array.from({ length: 55 }, (_, i) => ev(i + 2, "Tenant", `msg ${i + 2}`))];
  const c = mkCase(events);
  const dir = mkdtempSync(join(tmpdir(), "hd-"));
  writeFileSync(join(dir, "index.md"), "# Case 001: T\n\n## Case details\n\ndetails\n\n## Initial request\n\nrequest\n");
  const anchor = (n: number) => `<a id="event-${String(n).padStart(3, "0")}"></a>\n`;
  writeFileSync(
    join(dir, "history.md"),
    events.map((e) => `${anchor(e.n)}## 2026-01-01 00:00:00 UTC — event ${String(e.n).padStart(3, "0")}\n- **Channel:** ${e.channel}\n- **From:** ${e.from}\n- **To:** ${e.to}\n\n${e.body}`).join("\n")
  );
  const loaded = loadCase(dir);
  assert.equal(loaded.events.length, 56);
  const d = deps(fake([[hold()]]));
  const state = await processToEnd(d, dir);
  assert.equal(state.status.kind, "escalated");
  assert.match(String((state.status as { summary: string }).summary), /stage resume limit/);
  assert.equal(isIncomplete(state), true);
  void c;
});

test("a landlord refusal blocks assign_contractor end to end", async () => {
  const c = mkCase([ev(1, "Tenant", "damp is spreading"), ev(2, "Landlord", "No. I refuse this work. Do not send anyone.")]);
  const s = newState("x", 1);
  s.runs = [run(1, [act("request_landlord_approval", { scope: "damp survey", cost: "unknown" }, true, "sent")])];
  s.seen = 2;
  const assign = use("a", "assign_contractor", { trade: "damp", notes: "", reason: "r" });
  await runCase({
    c, state: s, newFrom: 2, model: "f", policy: "p", trace: () => {}, singleStep: true,
    client: fake([[use("c", "record_answer", { answer: "refused" })], [assign]]),
  });
  const a = actionLog(s).at(-1)!;
  assert.equal(a.tool, "assign_contractor");
  assert.equal(a.ok, false);
  assert.match(a.result, /landlord refused/);
});

test("the approval classifier fails closed on an API error, a missing call or an unexpected value", async () => {
  const errors: string[] = [];
  const classifyWith = async (client: ModelClient) => {
    const c = mkCase([ev(1, "Tenant"), ev(2, "Landlord", "Yes go ahead")]);
    const s = newState("x", 1);
    s.runs = [run(1, [act("request_landlord_approval", {}, true, "sent")])];
    s.seen = 2;
    const trace = (kind: string, data: Record<string, unknown>) => { if (kind === "approval_check_error") errors.push(String(data.error)); };
    await runCase({ c, state: s, newFrom: 2, client, model: "f", policy: "p", trace, singleStep: true });
    return s;
  };
  let n = 0;
  const throwsFirst: ModelClient = { messages: { create: async () => { if (n++ === 0) throw new Error("529"); return { content: [hold()], stop_reason: "tool_use", usage: {} } as unknown as Anthropic.Message; } } };
  assert.equal((await classifyWith(throwsFirst)).landlordAnswer?.answer, "unclear");
  assert.equal((await classifyWith(fake([[hold()]]))).landlordAnswer?.answer, "unclear");
  assert.equal((await classifyWith(fake([[use("c", "record_answer", { answer: "yes!!" })], [hold()]]))).landlordAnswer?.answer, "unclear");
  assert.deepEqual(errors, ["529", "the model did not call record_answer", 'unexpected answer "yes!!"']);
});

test("in a first run, a landlord's yes to the agency's request in the history allows assignment", async () => {
  const ask = { ...ev(2, "Agency / system", "Please see the quote. Do you wish to proceed?"), to: "Landlord" };
  const c = mkCase([ev(1, "Tenant", "the oven is broken"), ask, ev(3, "Landlord", "Yes please go ahead.")]);
  const s = newState("x", 3);
  const asked: string[] = [];
  const client: ModelClient = { messages: { create: async (p) => {
    if (p.tools?.some((t) => "name" in t && t.name === "record_answer")) {
      asked.push(JSON.stringify(p.messages));
      return { content: [use("c", "record_answer", { answer: "approved" })], stop_reason: "tool_use", usage: {} } as unknown as Anthropic.Message;
    }
    return { content: [use("a", "assign_contractor", { trade: "appliance", notes: "", reason: "r" })], stop_reason: "tool_use", usage: {} } as unknown as Anthropic.Message;
  } } };
  await runCase({ c, state: s, newFrom: 1, model: "f", policy: "p", trace: () => {}, singleStep: true, client });
  assert.match(asked[0], /Do you wish to proceed/);
  assert.equal(s.landlordAnswer?.requestAfter, 2);
  assert.equal(actionLog(s).at(-1)!.ok, true);
});

test("an unclear landlord answer blocks assignment and names the next step", async () => {
  const c = mkCase([ev(1, "Tenant"), ev(2, "Landlord", "How much will it cost?")]);
  const s = newState("x", 1);
  s.runs = [run(1, [act("request_landlord_approval", {}, true, "sent")])];
  s.seen = 2;
  await runCase({
    c, state: s, newFrom: 2, model: "f", policy: "p", trace: () => {}, singleStep: true,
    client: fake([[use("c", "record_answer", { answer: "unclear" })], [use("a", "assign_contractor", { trade: "x", notes: "", reason: "r" })]]),
  });
  assert.match(actionLog(s).at(-1)!.result, /not a clear approval/);
});

test("old state files with the incomplete flag migrate to escalations with by", () => {
  const dir = mkdtempSync(join(tmpdir(), "hd-"));
  const p = join(dir, "x.json");
  writeFileSync(p, JSON.stringify({ caseId: "x", seen: 1, incomplete: true, status: { kind: "escalated", summary: "System error" } }));
  assert.equal(isIncomplete(loadState(p)!), true);
  writeFileSync(p, JSON.stringify({ caseId: "x", seen: 1, incomplete: false, status: { kind: "escalated", summary: "s", checked: "c", missing_or_conflict: "m", decision_needed: "d" } }));
  const s = loadState(p)!;
  assert.equal(isIncomplete(s), false);
  assert.equal(s.status.kind === "escalated" && s.status.by, "agent");
});

test("a state file with the flat action and note lists loads as run records", () => {
  const dir = mkdtempSync(join(tmpdir(), "hd-"));
  const p = join(dir, "x.json");
  const action = (run: number, afterEvent: number, tool: string) => ({ run, afterEvent, tool, input: {}, ok: true, result: "ok" });
  writeFileSync(p, JSON.stringify({
    caseId: "x", initialSeen: 1, seen: 9, runs: 3, status: { kind: "hold", reason: "Waiting for Tenant" },
    actions: [action(1, 1, "send_message"), action(1, 1, "hold"), action(3, 9, "hold")],
    notes: [{ run: 1, afterEvent: 1, text: "first" }],
    landlordAnswer: { answer: "unclear", requestAfter: 1, throughEvent: 4 },
  }));
  const s = loadState(p)!;
  // Run 2 recorded nothing, so it takes run 1's cut; run 3 recorded event 9.
  assert.deepEqual(s.runs.map((r) => [r.seen, r.actions.map((a) => a.tool), r.notes]), [
    [1, ["send_message", "hold"], ["first"]],
    [1, [], []],
    [9, ["hold"], []],
  ]);
  assert.deepEqual(actionLog(s).map((a) => [a.run, a.seen]), [[1, 1], [1, 1], [3, 9]]);
  assert.deepEqual(s.landlordAnswer, { answer: "unclear", requestAfter: 1, throughEvent: 4 });
});

test("a state file of the wrong shape is moved aside and loads as missing", () => {
  const dir = mkdtempSync(join(tmpdir(), "hd-"));
  const p = join(dir, "x.json");
  writeFileSync(p, JSON.stringify({ caseId: "x", seen: "three", runs: [] }));
  assert.equal(loadState(p), null);
  assert.equal(existsSync(`${p}.corrupt`), true);
});

test("a saved state round-trips through the schema", () => {
  const dir = mkdtempSync(join(tmpdir(), "hd-"));
  const p = join(dir, "x.json");
  const s = newState("x", 1);
  s.runs = [run(1, [act("hold", { waiting_for: "Waiting for Tenant", reason: "r" })], ["n"])];
  s.status = { kind: "hold", reason: "Waiting for Tenant" };
  saveState(p, s);
  assert.deepEqual(loadState(p), s);
});

test("after a failed call, the rest of the same response is not run and the model decides again", async () => {
  const c = mkCase([ev(1, "Tenant", "dishwasher never finishes its cycle")]);
  const s = newState("x", 0);
  s.seen = 1;
  const calls: Anthropic.MessageCreateParamsNonStreaming[] = [];
  const turns = [
    [
      use("1", "request_landlord_approval", { scope: "dishwasher repair", reason: "r" }),
      use("2", "send_message", { to: "tenant", channel: "email", text: "We have asked the landlord.", reason: "r" }),
      hold("3"),
    ],
    [use("4", "request_landlord_approval", { scope: "dishwasher repair", cost: "unknown", reason: "r" }), hold("5")],
  ];
  const client: ModelClient = { messages: { create: async (p) => { calls.push(structuredClone(p)); return msg(turns[calls.length - 1]); } } };
  await runCase({ c, state: s, newFrom: 1, client, model: "f", policy: "p", trace: () => {} });
  assert.deepEqual(actionLog(s).map((a) => `${a.tool}:${a.ok}`), [
    "request_landlord_approval:false", "send_message:false", "hold:false", "request_landlord_approval:true", "hold:true",
  ]);
  assert.match(actionLog(s)[1].result, /^not executed: an earlier action in this response failed/);
  // Every tool_use in the first response got a tool_result, as the API requires.
  const results = calls[1].messages.at(-1)!.content as Anthropic.ToolResultBlockParam[];
  assert.deepEqual(results.map((r) => r.tool_use_id), ["1", "2", "3"]);
  assert.equal(s.status.kind, "hold");
});

test("every tool is sent with strict schema validation", async () => {
  const c = mkCase([ev(1, "Tenant")]);
  const s = newState("x", 0);
  s.seen = 1;
  let tools: Anthropic.Tool[] = [];
  const client: ModelClient = { messages: { create: async (p) => { tools = p.tools as Anthropic.Tool[]; return msg([hold()]); } } };
  await runCase({ c, state: s, newFrom: 1, client, model: "f", policy: "p", trace: () => {} });
  assert.equal(tools.length, 7);
  assert.ok(tools.every((t) => t.strict === true));
});
