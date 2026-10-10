import { actionLog, type CaseState } from "../case/state.ts";
import { unsupported } from "./evidence.ts";

// The rules a tool call must pass. Every rule lives in a guard, which runs before apply or an adapter,
// so a real adapter cannot skip it. A refusal goes back to the model as an error it can recover from.

export class Refusal extends Error {}

// What the agent could see in this run: the prompt text plus the text of attached documents, and
// the numbers of the visible events. The agent loop always passes it; without it the evidence checks are skipped.
export type ToolContext = { evidence: string; visibleEvents: Set<number> };

export function requireEvidence(text: string, ctx: ToolContext | undefined, what: string): void {
  if (!ctx) return;
  const { amounts, dates } = unsupported(text, ctx.evidence);
  const named = [...amounts, ...dates];
  if (named.length) {
    throw new Refusal(
      `${what} states ${named.join(", ")}, which no event, record or document in the case shows. State only amounts and dates from the case; write "plus VAT" rather than a total you worked out, and ask for a date rather than proposing one.`,
    );
  }
}

// A model can leak its tool-call syntax into a value: it closes one field with "</field>" and writes the
// next one inside it as <parameter name="...">. That text would reach the outbox or the handover verbatim.
// Ordinary angle brackets ("< 5C", "<urgent>") pass; only the call syntax and this tool's own field names count.
export function checkMarkup(input: Record<string, unknown>): void {
  const names = ["parameter", "invoke", "function_calls", ...Object.keys(input)].join("|");
  const tag = new RegExp(`</?(?:antml:)?(?:${names})\\b[^>]*>`, "i");
  for (const [field, value] of Object.entries(input)) {
    if (typeof value === "string" && tag.test(value)) {
      throw new Refusal(`${field} contains tool-call markup (${tag.exec(value)![0]}). Put each value in its own field as plain text and call the tool again.`);
    }
  }
}

const normaliseText = (t: string) => t.replace(/\s+/g, " ").trim().toLowerCase();

export function checkMessage(state: CaseState, i: { to: string; text: string }, ctx?: ToolContext): void {
  if (/\[event \d+\]/i.test(i.text)) throw new Refusal("the message text contains an event reference. Event references belong in reason only; rewrite the text without them.");
  const same = actionLog(state).find((a) => a.ok && a.tool === "send_message" && a.input.to === i.to && normaliseText(String(a.input.text)) === normaliseText(i.text));
  if (same) throw new Refusal(`the same message already went to the ${i.to} in run ${same.run}. Do not send it again; write only what is new, or send nothing.`);
  requireEvidence(i.text, ctx, "the message");
}

// The person who confirmed the result must be traceable to an event the agent saw.
export function checkClose(state: CaseState, i: { keys: string; work_confirmed_by: string }, ctx?: ToolContext): void {
  if (i.keys === "outstanding") throw new Refusal("keys are outstanding. Confirm the key return first, or hold the case.");
  if (!ctx) return;
  const cited = [...i.work_confirmed_by.matchAll(/event\s*0*(\d+)/gi)].map((m) => Number(m[1]));
  if (!cited.some((n) => ctx.visibleEvents.has(n))) {
    throw new Refusal('work_confirmed_by must cite the event that confirms the result, for example "contractor [event 027]". No event you can see is cited, so the result is not proven; hold the case or ask for confirmation.');
  }
}

// The landlord answers in a later run, so a request made in this run does not count yet. A request
// from an earlier run, or the agency's last message to the landlord in the history, counts only once
// the landlord's reply was read as a clear approval.
export function requireApproval(state: CaseState): void {
  const answer = state.landlordAnswer?.answer;
  if (state.approvalOnFile || answer === "approved") return;
  const requested = actionLog(state).some((a) => a.tool === "request_landlord_approval" && a.ok && a.run < state.runs.length);
  if (!requested) throw new Refusal("landlord approval is not on file. Use request_landlord_approval first, and hold the case for the landlord's answer.");
  if (answer === "refused") throw new Refusal("the landlord refused the work or will use their own contractor. Do not assign a contractor; tell the tenant or escalate.");
  if (answer === "unclear") throw new Refusal("the landlord's reply is not a clear approval. Ask the landlord to confirm, or escalate.");
  throw new Refusal("the landlord has not answered the approval request yet. Hold the case for the landlord's answer.");
}
