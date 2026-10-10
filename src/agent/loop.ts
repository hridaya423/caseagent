import type Anthropic from "@anthropic-ai/sdk";
import { APPROVAL_MODEL, classifyLandlordReply } from "./approval.ts";
import { visibleEvents } from "../case/cut.ts";
import { isAgency, type Case } from "../case/parse.ts";
import { renderCase } from "./prompt.ts";
import { actionLog, type CaseState, type Run } from "../case/state.ts";
import { runTool, TOOL_SPECS, type ToolAdapter, type ToolContext } from "../tools/index.ts";
import { playbookContext, type PlaybookOptions } from "./playbooks.ts";
import { auditStageCompletion } from "./playbook-audit.ts";

export const MAX_TURNS = 15;
// The agency's own records of a landlord approval that came before the agent's first run.
// Positive grants only: "landlord approval pending" or "approve the quote with the landlord" must not match.
const APPROVAL_ON_FILE =
  /landlord(?:'s)? approval (?:confirmed|granted|received|given|on file|obtained)|landlord (?:who |has )?approv(?:ed|es)\b|approved by (?:the )?landlord\b/i;
const CACHE = { type: "ephemeral" } as const;
const NUDGE = "End the run now with exactly one of hold, escalate or close_case.";

export type ModelClient = {
  messages: { create(p: Anthropic.MessageCreateParamsNonStreaming): Promise<Anthropic.Message> };
};

export type Trace = (kind: string, data: Record<string, unknown>) => void;

export function casePolicy(policy: string, singleStep = false): string {
  return singleStep ? `${policy}\nInvocation contract: execute exactly one business tool action. Do not chain actions. After a message, approval request, assignment or note, saved status may remain open; a later invocation can hold, escalate or close. The normal end-tool requirement applies to a complete stage, not to this single-action invocation.` : policy;
}

export async function runCase(opts: {
  c: Case;
  state: CaseState;
  newFrom: number;
  client: ModelClient;
  model: string;
  policy: string;
  trace: Trace;
  caseDir?: string;
  adapters?: Record<string, ToolAdapter>;
  singleStep?: boolean;
  playbooks?: PlaybookOptions | false;
  approvalModel?: string;
}): Promise<void> {
  const { c, state, client, model, policy, trace, caseDir, adapters } = opts;
  const run: Run = { seen: state.seen, notes: [], actions: [] };
  state.runs.push(run);
  state.status = { kind: "open" };
  const visible = visibleEvents(c, state.initialSeen, state.seen);
  // Only the agency's own record counts: a tenant writing "landlord approval confirmed" in an email is not evidence.
  state.approvalOnFile = visible.some((e) => isAgency(e.from) && APPROVAL_ON_FILE.test(e.body));
  // Asking is not approval, and a reply is not approval either: the latest earlier-run request counts
  // only once a small model reads the landlord's replies to it as a clear yes.
  const request = actionLog(state).findLast((a) => a.tool === "request_landlord_approval" && a.ok && a.run < state.runs.length);
  const replies = request ? visible.filter((e) => e.n > request.seen && /landlord/i.test(e.from)) : [];
  if (!request || replies.length === 0) {
    state.landlordAnswer = undefined;
  } else if (state.landlordAnswer?.throughEvent !== replies[replies.length - 1].n || state.landlordAnswer.requestAfter !== request.seen) {
    const asked = `${String(request.input.scope ?? "")} (cost: ${String(request.input.cost ?? "unknown")})`;
    const answer = await classifyLandlordReply(client, opts.approvalModel ?? APPROVAL_MODEL, asked, replies.map((e) => `${e.at}\n${e.body}`), {
      onError: (error) => trace("approval_check_error", { error }),
      onUsage: (usage, model) => trace("approval_check_usage", { usage, model }),
    });
    state.landlordAnswer = { answer, requestAfter: request.seen, throughEvent: replies[replies.length - 1].n };
    trace("approval_check", { request: asked, through_event: replies[replies.length - 1].n, answer });
  }
  const prompt = await renderCase(c, state, visible, opts.newFrom, caseDir);
  const toolContext: ToolContext = { evidence: prompt.evidence, visibleEvents: new Set(visible.map((e) => e.n)) };

  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt.content }];
  trace("run_start", { case: c.id, run: state.runs.length, seen: state.seen, model });

  const systemText = casePolicy(policy, opts.singleStep);
  const retrievalQuery = [c.title, c.request, ...visible.slice(-3).map((e) => e.body)].join("\n");

  const tools: Anthropic.Tool[] = TOOL_SPECS.map((t) => ({ ...t, strict: true }));

  const referenceHistory = new Set<string>();
  let completionChecks = 0;
  for (let turn = 1; turn <= MAX_TURNS; turn++) {
    // Reassess after each tool result; a resumed run uses only its newly visible state.
    const currentActions = actionLog(state).map((a) => ({ tool: a.tool, input: a.input, ok: a.ok, result: a.result }));
    const references = opts.playbooks ? await playbookContext({
      options: opts.playbooks, client, model, policy,
      query: `${retrievalQuery}\n${JSON.stringify(currentActions)}`,
      currentEvidence: [
        { id: "title", text: c.title }, { id: "details", text: c.details }, { id: "request", text: c.request },
        ...visible.map((e) => ({ id: `event:${e.n}`, text: `${e.at} | ${e.channel} | from ${e.from} | to ${e.to}\n${e.body}` })),
        ...currentActions.map((a, i) => ({ id: `action:${i}`, text: JSON.stringify(a) })),
      ].filter((e) => e.text.trim()), trace, turn,
    }) : "";
    if (references) referenceHistory.add(references);
    const system: Anthropic.TextBlockParam[] = [
      { type: "text", text: systemText + references, cache_control: CACHE },
    ];
    const resp = await client.messages.create({ model, max_tokens: 4096, cache_control: CACHE, system, tools, messages });

    trace("model", { turn, model: resp.model, stop: resp.stop_reason, usage: resp.usage, content: resp.content });
    messages.push({ role: "assistant", content: resp.content });

    // Extract and store text blocks as notes
    for (const b of resp.content) {
      if (b.type === "text" && b.text.trim()) run.notes.push(b.text.trim());
    }

    const uses = resp.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
    if (uses.length === 0) {
      messages.push({ role: "user", content: opts.singleStep ? "Execute exactly one next business action through the available tools. Do not chain actions or claim an action occurred before its tool result." : NUDGE });
      continue;
    }
    const results: Anthropic.ToolResultBlockParam[] = [];
    let ended = false;
    let failed = false;
    let executed = 0;
    for (const u of uses) {
      // Calls after an end tool, or after the first call in single-action mode, are refused and
      // recorded so the trace and the answer show them instead of silently dropping them.
      // Calls after a failed call in the same response are not run: the model wrote them before it
      // saw the failure, so a later message could claim the failed action happened.
      const skip = ended
        ? "refused: the run already ended"
        : opts.singleStep && executed > 0
          ? "refused: one action per call"
          : failed
            ? "not executed: an earlier action in this response failed. Read its error, then decide again"
            : null;
      if (skip) {
        const result = `${skip}; the action was not executed`;
        run.actions.push({ tool: u.name, input: u.input as Record<string, unknown>, ok: false, result });
        trace("tool", { name: u.name, input: u.input, ok: false, ends: false, result });
        results.push({ type: "tool_result", tool_use_id: u.id, content: result, is_error: true });
        continue;
      }
      // Review only optional selected workflows, at most twice per invocation.
      // A refusal becomes a tool result so the actor must recover before claiming completion.
      if (!opts.singleStep && opts.playbooks && referenceHistory.size && completionChecks < 2 && (u.name === "hold" || u.name === "close_case")) {
        completionChecks++;
        const audit = await auditStageCompletion({
          client, model: opts.playbooks.model ?? model,
          references: [...referenceHistory].join("\n"),
          currentEvidence: [
            { id: "request", text: c.request }, { id: "details", text: c.details },
            { id: "visible_prompt_evidence", text: prompt.evidence },
            ...visible.map((e) => ({ id: `event:${e.n}`, text: `${e.at} | ${e.channel} | from ${e.from} | to ${e.to}\n${e.body}` })),
          ],
          actions: run.actions,
          ending: { tool: u.name, input: u.input }, trace,
        });
        if (!audit.ready) {
          const result = `Workflow completion check: this end action was not executed. Review these applicable omissions against current evidence and policy, execute any required actions, or escalate if human judgement is needed: ${JSON.stringify(audit.missing)}`;
          run.actions.push({ tool: u.name, input: u.input as Record<string, unknown>, ok: false, result });
          trace("tool", { name: u.name, input: u.input, ok: false, ends: false, result });
          results.push({ type: "tool_result", tool_use_id: u.id, content: result, is_error: true });
          failed = true;
          continue;
        }
      }
      const out = runTool(u.name, u.input, state, adapters, toolContext);
      run.actions.push({ tool: u.name, input: u.input as Record<string, unknown>, ok: out.ok, result: out.result });
      trace("tool", { name: u.name, input: u.input, ...out });
      executed++;
      if (!out.ok) failed = true;
      if (out.ends) {
        ended = true;
        continue;
      }
      results.push({ type: "tool_result", tool_use_id: u.id, content: out.result, is_error: !out.ok });
    }
    if (ended || opts.singleStep) return;
    messages.push({ role: "user", content: results });
  }

  state.status = { kind: "escalated", by: "system", summary: `The agent did not end the run within ${MAX_TURNS} turns. A person must review case ${c.id}.` };
  trace("auto_escalate", { turns: MAX_TURNS });
}
