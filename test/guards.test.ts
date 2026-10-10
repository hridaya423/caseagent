import { test } from "node:test";
import assert from "node:assert/strict";
import { datesIn, moneyIn, unsupported } from "../src/tools/evidence.ts";
import { renderCase } from "../src/agent/prompt.ts";
import { promptText } from "./helpers.ts";
import { newState } from "../src/case/state.ts";
import { runTool, type ToolContext } from "../src/tools/index.ts";
import type { Case } from "../src/case/parse.ts";

const evidence = [
  "[event 003] 2025-11-18 09:00:00 UTC | Email | from Contractor | to Agency",
  "Quote: £165 + VAT for the tap. Invoice total 162.85. Visit on Tuesday 18 November, 9am-12pm.",
].join("\n");
const ctx: ToolContext = { evidence, visibleEvents: new Set([1, 2, 3]) };
const msg = (text: string, to = "tenant") => ({ to, channel: "email", text, reason: "r [event 003]" });

test("moneyIn and datesIn read the forms the cases use", () => {
  assert.deepEqual(moneyIn("£165 + VAT, £1,450.00 rent and GBP 620"), ["165.00", "1450.00", "620.00"]);
  assert.deepEqual([...datesIn("18th of November, Nov 19, 20/11/2025, 2025-11-21")].sort(), ["11-18", "11-19", "11-20", "11-21"]);
  assert.deepEqual([...datesIn("our 24/7 line, May 2026")], []);
});

test("unsupported names only the figures and dates the evidence never shows", () => {
  assert.deepEqual(unsupported("£165 plus VAT, invoice £162.85, on 18 Nov", evidence), { amounts: [], dates: [] });
  assert.deepEqual(unsupported("£198 including VAT on Thursday 4 December", evidence), { amounts: ["£198"], dates: ["4 Dec"] });
});

test("send_message refuses an invented amount or date and accepts ones from the case", () => {
  const s = newState("x", 1);
  const bad = runTool("send_message", msg("The repair costs £198 and the plumber comes on 4 December."), s, undefined, ctx);
  assert.equal(bad.ok, false);
  assert.match(bad.result, /^refused: the message states £198, 4 Dec/);
  assert.equal(runTool("send_message", msg("The quote is £165 plus VAT; the visit is on 18 November."), s, undefined, ctx).ok, true);
});

test("request_landlord_approval refuses a cost the case does not show", () => {
  const s = newState("x", 1);
  assert.equal(runTool("request_landlord_approval", { scope: "tap", cost: "£250", reason: "r" }, s, undefined, ctx).ok, false);
  assert.equal(runTool("request_landlord_approval", { scope: "tap", cost: "£165 + VAT", reason: "r" }, s, undefined, ctx).ok, true);
  assert.equal(runTool("request_landlord_approval", { scope: "tap", cost: "unknown", reason: "r" }, s, undefined, ctx).ok, true);
});

test("the same message to the same person is refused; a different person or text is fine", () => {
  const s = newState("x", 1);
  s.runs = 2;
  s.actions.push({ run: 1, afterEvent: 3, tool: "send_message", input: msg("Please try the reset button."), ok: true, result: "queued" });
  const again = runTool("send_message", msg("Please  try the reset   button."), s, undefined, ctx);
  assert.equal(again.ok, false);
  assert.match(again.result, /already went to the tenant in run 1/);
  assert.equal(runTool("send_message", msg("Please try the reset button.", "landlord"), s, undefined, ctx).ok, true);
  assert.equal(runTool("send_message", msg("Did the reset button work?"), s, undefined, ctx).ok, true);
});

test("close_case must cite an event the agent can see", () => {
  const close = (by: string) => ({ outcome: "work_completed", work_confirmed_by: by, landlord_informed: true, keys: "not_issued", invoice: "on_file", reason: "r" });
  assert.equal(runTool("close_case", close("contractor [event 003]"), newState("x", 1), undefined, ctx).ok, true);
  assert.equal(runTool("close_case", close("contractor event 3"), newState("x", 1), undefined, ctx).ok, true);
  const none = runTool("close_case", close("the contractor"), newState("x", 1), undefined, ctx);
  assert.equal(none.ok, false);
  assert.match(none.result, /must cite the event/);
  assert.equal(runTool("close_case", close("contractor [event 009]"), newState("x", 1), undefined, ctx).ok, false);
});

test("guards run before adapters: an adapter cannot send an event reference or an invented amount", () => {
  const adapters = { send_message: () => "sent by the real email adapter" };
  const s = newState("x", 1);
  assert.equal(runTool("send_message", msg("See [event 003]."), s, adapters, ctx).ok, false);
  assert.equal(runTool("send_message", msg("That is £999."), s, adapters, ctx).ok, false);
  assert.equal(runTool("send_message", msg("We will be in touch."), s, adapters, ctx).result, "sent by the real email adapter");
});

test("the evidence includes visible events but not a refused message's invented amount", async () => {
  const c: Case = {
    id: "x", title: "x", details: "", request: "Tap leaking", attachments: [], layer: "strict",
    events: [{ n: 1, at: "2025-11-18 09:00:00 UTC", channel: "Email", from: "Tenant", to: "Agency", body: "Quote was £165.", attachments: [] }],
  };
  const s = newState("x", 1);
  s.actions.push({ run: 1, afterEvent: 1, tool: "send_message", input: msg("It costs £777."), ok: false, result: "refused: invented" });
  const p = await renderCase(c, s, c.events, 1);
  assert.match(p.evidence, /£165/);
  assert.doesNotMatch(p.evidence, /£777/);
  assert.match(promptText(p), /£777/);
});
