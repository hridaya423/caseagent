import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { unsupported } from "./evidence.ts";
import { HOLD_REASONS, type CaseState } from "./state.ts";

export class Refusal extends Error {}

export type ToolOutcome = { ok: boolean; result: string; ends: boolean };
export type ToolAdapter = (input: Record<string, unknown>, state: CaseState) => string;

// What the agent could see in this run: the prompt text plus the text of attached documents, and
// the numbers of the visible events. agent.ts always passes it; without it the evidence checks are skipped.
export type ToolContext = { evidence: string; visibleEvents: Set<number> };

// Every rule lives in a guard, which runs before apply or an adapter, so a real adapter cannot skip it.
type Guard<I> = (state: CaseState, input: I, ctx?: ToolContext) => void;

type Tool = {
  description: string;
  schema: z.ZodType;
  end: boolean;
  guard?: Guard<Record<string, unknown>>;
  apply: (input: Record<string, unknown>, state: CaseState) => string;
};

function tool<S extends z.ZodType>(d: {
  description: string;
  schema: S;
  end?: boolean;
  guard?: Guard<z.infer<S>>;
  apply: (input: z.infer<S>, state: CaseState) => string;
}): Tool {
  return {
    description: d.description,
    schema: d.schema,
    end: d.end ?? false,
    guard: d.guard && ((state, input, ctx) => d.guard!(state, input as z.infer<S>, ctx)),
    apply: (input, state) => d.apply(input as z.infer<S>, state),
  };
}

function requireEvidence(text: string, ctx: ToolContext | undefined, what: string): void {
  if (!ctx) return;
  const { amounts, dates } = unsupported(text, ctx.evidence);
  const named = [...amounts, ...dates];
  if (named.length) {
    throw new Refusal(
      `${what} states ${named.join(", ")}, which no event, record or document in the case shows. State only amounts and dates from the case; write "plus VAT" rather than a total you worked out, and ask for a date rather than proposing one.`,
    );
  }
}

const normaliseText = (t: string) => t.replace(/\s+/g, " ").trim().toLowerCase();

function checkMessage(state: CaseState, i: { to: string; text: string }, ctx?: ToolContext): void {
  if (/\[event \d+\]/i.test(i.text)) throw new Refusal("the message text contains an event reference. Event references belong in reason only; rewrite the text without them.");
  const same = state.actions.find((a) => a.ok && a.tool === "send_message" && a.input.to === i.to && normaliseText(String(a.input.text)) === normaliseText(i.text));
  if (same) throw new Refusal(`the same message already went to the ${i.to} in run ${same.run}. Do not send it again; write only what is new, or send nothing.`);
  requireEvidence(i.text, ctx, "the message");
}

// The person who confirmed the result must be traceable to an event the agent saw.
function checkClose(state: CaseState, i: { keys: string; work_confirmed_by: string }, ctx?: ToolContext): void {
  if (i.keys === "outstanding") throw new Refusal("keys are outstanding. Confirm the key return first, or hold the case.");
  if (!ctx) return;
  const cited = [...i.work_confirmed_by.matchAll(/event\s*0*(\d+)/gi)].map((m) => Number(m[1]));
  if (!cited.some((n) => ctx.visibleEvents.has(n))) {
    throw new Refusal('work_confirmed_by must cite the event that confirms the result, for example "contractor [event 027]". No event you can see is cited, so the result is not proven; hold the case or ask for confirmation.');
  }
}

// The landlord answers in a later run, so a request made in this run does not count yet. A request
// from an earlier run counts only once the landlord's reply was read as a clear approval.
function requireApproval(state: CaseState): void {
  if (state.approvalOnFile) return;
  const requested = state.actions.some((a) => a.tool === "request_landlord_approval" && a.ok && a.run < state.runs);
  if (!requested) throw new Refusal("landlord approval is not on file. Use request_landlord_approval first, and hold the case for the landlord's answer.");
  const answer = state.landlordAnswer?.answer;
  if (answer === "approved") return;
  if (answer === "refused") throw new Refusal("the landlord refused the work or will use their own contractor. Do not assign a contractor; tell the tenant or escalate.");
  if (answer === "unclear") throw new Refusal("the landlord's reply is not a clear approval. Ask the landlord to confirm, or escalate.");
  throw new Refusal("the landlord has not answered the approval request yet. Hold the case for the landlord's answer.");
}

const reason = z.string().min(1).describe("Why you take this action. Cite events as [event 007].");

const TOOLS: Record<string, Tool> = {
  send_message: tool({
    description: "Send an email or SMS to the tenant, the landlord or the assigned contractor. The message goes to the outbox.",
    schema: z.object({
      to: z.enum(["tenant", "landlord", "contractor"]),
      channel: z.enum(["email", "sms"]),
      text: z.string().min(1),
      reason,
    }),
    guard: checkMessage,
    apply: (i) => `${i.channel} to ${i.to} queued in the outbox`,
  }),
  request_landlord_approval: tool({
    description: "Ask the landlord to approve work or a cost. Use this before any contractor visit or any spend.",
    schema: z.object({
      scope: z.string().min(1),
      cost: z.string().min(1).describe('The known cost or quote, for example "£165 + VAT", or "unknown".'),
      reason,
    }),
    guard: (_s, i, ctx) => requireEvidence(`${i.scope}\n${i.cost}`, ctx, "the approval request"),
    apply: (i) => `approval request for "${i.scope}" (cost: ${i.cost}) sent to the landlord`,
  }),
  assign_contractor: tool({
    description: "Assign a maintenance provider. Use this only after the landlord approved the work and is not using their own contractor.",
    schema: z.object({ trade: z.string().min(1), notes: z.string(), reason }),
    guard: requireApproval,
    apply: (i) => `${i.trade} contractor assigned`,
  }),
  add_note: tool({
    description: "Add an internal note to the case, for example an unrelated request or a missing final check.",
    schema: z.object({ text: z.string().min(1), reason }),
    apply: () => "note added",
  }),
  hold: tool({
    description: "End this run. The case waits for the named party.",
    schema: z.object({ waiting_for: z.enum(HOLD_REASONS), reason }),
    end: true,
    apply: (i, s) => {
      s.status = { kind: "hold", reason: i.waiting_for };
      return `case on hold: ${i.waiting_for}`;
    },
  }),
  escalate: tool({
    description: "End this run. A person takes over the case. The handover needs three fields: what you checked, what is missing or in conflict, and the one decision the person must make.",
    schema: z.object({
      checked: z.string().min(1).describe("What you checked, citing events as [event 007]."),
      missing_or_conflict: z.string().min(1).describe("What is missing, unclear or in conflict."),
      decision_needed: z.string().min(1).describe("The one decision the person must make."),
      reason,
    }),
    end: true,
    apply: (i, s) => {
      const summary = `Checked: ${i.checked}\nMissing or in conflict: ${i.missing_or_conflict}\nDecision needed: ${i.decision_needed}`;
      s.status = { kind: "escalated", by: "agent", summary, checked: i.checked, missing_or_conflict: i.missing_or_conflict, decision_needed: i.decision_needed };
      return "case escalated to a person";
    },
  }),
  close_case: tool({
    description: "End this run and close the case. Answer every final check.",
    schema: z.object({
      outcome: z.enum(["work_completed", "resolved_without_work", "withdrawn"]),
      work_confirmed_by: z.string().min(1).describe('Who confirmed the result, with the event, for example "tenant [event 007]".'),
      landlord_informed: z.boolean(),
      keys: z.enum(["returned", "not_issued", "outstanding"]),
      invoice: z.enum(["on_file", "not_required", "outstanding"]),
      reason,
    }),
    end: true,
    guard: checkClose,
    apply: (i, s) => {
      const { reason: _reason, ...checks } = i;
      s.status = { kind: "closed", checks };
      return "case closed";
    },
  }),
};

export function runTool(
  name: string,
  input: unknown,
  state: CaseState,
  adapters?: Record<string, ToolAdapter>,
  ctx?: ToolContext,
): ToolOutcome {
  const t = TOOLS[name];
  if (!t) return { ok: false, ends: false, result: `unknown tool "${name}"` };
  const parsed = t.schema.safeParse(input);
  if (!parsed.success) return { ok: false, ends: false, result: `invalid input:\n${z.prettifyError(parsed.error)}` };
  const apply = adapters?.[name] ?? t.apply;
  try {
    t.guard?.(state, parsed.data as Record<string, unknown>, ctx);
    return { ok: true, ends: t.end, result: apply(parsed.data as Record<string, unknown>, state) };
  } catch (e) {
    if (e instanceof Refusal) return { ok: false, ends: false, result: `refused: ${e.message}` };
    const errorMsg = e instanceof Error ? e.message : String(e);
    return { ok: false, ends: false, result: `failed: ${errorMsg}` };
  }
}

// The API takes the schema body; the "$schema" dialect marker that zod adds is not part of it.
export const TOOL_SPECS: Anthropic.Tool[] = Object.entries(TOOLS).map(([name, t]) => {
  const { $schema: _dialect, ...schema } = z.toJSONSchema(t.schema);
  return { name, description: t.description, input_schema: schema as Anthropic.Tool.InputSchema };
});
