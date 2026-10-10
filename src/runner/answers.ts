import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Case, CaseEvent } from "../case/parse.ts";
import { actionLog, isIncomplete, statusLabel, type CaseState } from "../case/state.ts";

const END_TOOLS = new Set(["hold", "escalate", "close_case"]);

export type Decision = { status: string; next: string; why: string };

// The answer a judge or an operator reads first: where the case stands, what happens next, and why.
export function decisionOf(s: CaseState): Decision {
  const actions = actionLog(s);
  const end = actions.findLast((a) => a.ok && END_TOOLS.has(a.tool));
  const why = String(end?.input.reason ?? "");
  const st = s.status;
  const status = statusLabel(st);
  switch (st.kind) {
    case "open":
      return { status, next: "The run stopped before an end action. Resume the case.", why: String(actions.at(-1)?.input.reason ?? "") };
    case "hold":
      return { status, next: `Wait for the ${st.reason.replace(/^Waiting for /, "").toLowerCase()}'s reply.`, why };
    case "escalated":
      return st.by === "agent"
        ? { status, next: `A person decides: ${st.decision_needed}`, why: st.missing_or_conflict }
        : { status, next: "A person must review the case.", why: st.summary };
    case "closed":
      return { status, next: "None. The case is closed.", why: why || `${st.checks.outcome}, confirmed by ${st.checks.work_confirmed_by}` };
    default: {
      const _exhaustive: never = st;
      return _exhaustive;
    }
  }
}

function summarizeLine(s: string): string {
  return s.split("\n")[0].slice(0, 60);
}

// Events a run received: those after the previous run's last seen event, up to its own last seen event.
function runEvents(s: CaseState, visible: CaseEvent[], i: number): CaseEvent[] {
  const from = s.runs[i - 1]?.seen ?? 0;
  return visible.filter((e) => e.n > from && e.n <= s.runs[i].seen);
}

function answerMd(c: Case, s: CaseState, visible: CaseEvent[]): string {
  const d = decisionOf(s);
  const decision = `- **Status:** ${d.status}\n- **Next step:** ${d.next}${d.why ? `\n- **Why:** ${d.why}` : ""}`;

  // Summary
  const summary =
    `**Final status:** ${statusLabel(s.status)}\n**Runs:** ${s.runs.length} · **Events seen:** up to event ${s.seen} · **Loaded with:** ${c.layer}` +
    (isIncomplete(s) ? "\n\n**Incomplete:** the agent did not finish this run, so the system escalated the case to a person." : "") +
    (c.layer === "raw" ? "\n\n**Raw mode loaded:** this case was reconstructed from unstructured files. Review for leaks." : "") +
    (c.warnings?.length ? `\n\n**Loader warnings:** ${c.warnings.join("; ")}` : "") +
    (c.unread?.length ? `\n\n**Files not read:** ${c.unread.join(", ")}` : "");

  const actions = actionLog(s);

  const timelineBlocks = s.runs.map((r, i) => {
    const run = i + 1;
    const runActions = r.actions;
    const runEvts = runEvents(s, visible, i);
    const eventLines = runEvts.map((e) => {
      const excerpt = summarizeLine(e.body);
      return `- event ${String(e.n).padStart(3, "0")}: ${e.channel} from ${e.from} · ${excerpt}`;
    });

    const actionLines = runActions.map((a) => {
      const detail = a.ok ? a.result : `⚠ ${a.result}`;
      return `- ${a.tool}: ${detail}`;
    });

    return `### Run ${run}\n\n${eventLines.join("\n") || "(no events)"}\n\n${actionLines.join("\n") || "(no actions)"}`;
  }).join("\n\n");

  // Outbox: send_message actions with full text
  const messages = actions.filter((a) => a.tool === "send_message");
  const outboxLines = messages.map((m) => {
    const input = m.input as Record<string, unknown>;
    return `**Run ${m.run}, to ${input.to}, ${input.channel}:**\n\n${input.text}`;
  });

  // Approvals requested
  const approvals = actions.filter((a) => a.tool === "request_landlord_approval");
  const approvalsLines = approvals.map((a) => {
    const input = a.input as Record<string, unknown>;
    return `- Run ${a.run}: **${input.scope}** (${input.cost})`;
  });

  // Notes
  const notes = actions.filter((a) => a.tool === "add_note");
  const notesLines = notes.map((n) => {
    const input = n.input as Record<string, unknown>;
    return `- Run ${n.run}: ${input.text}`;
  });

  // Final checks: only show if closed
  let finalChecksSection = "";
  if (s.status.kind === "closed") {
    const checks = s.status.checks;
    finalChecksSection = `
## Final checks

| | |
|---|---|
| **Outcome** | ${checks.outcome} |
| **Confirmed by** | ${checks.work_confirmed_by} |
| **Landlord informed** | ${checks.landlord_informed ? "Yes" : "No"} |
| **Keys** | ${checks.keys} |
| **Invoice** | ${checks.invoice} |
`;
  }

  // Escalation: an agent escalation shows its three fields; a system escalation shows plain text.
  const st = s.status;
  const escalation =
    st.kind !== "escalated" ? "None."
    : st.by === "agent" ? `- **Checked:** ${st.checked}\n- **Missing or in conflict:** ${st.missing_or_conflict}\n- **Decision needed:** ${st.decision_needed}`
    : st.summary;

  // Failed, refused or invalid actions
  const failed = actions.filter((a) => !a.ok);
  const failedLines = failed.map((f) => {
    const toolName = f.tool;
    const didRecover = actions.some((a) => a.tool === toolName && a.ok && actions.indexOf(a) > actions.indexOf(f));
    const recoveryText = didRecover ? " — agent recovered" : "";
    return `- **${toolName}:** ${f.result}${recoveryText}`;
  });

  // An escalated case leads with the handover, because that is what the person picking it up needs.
  const escalationSection = `## Escalation\n\n${escalation}\n\n`;
  const escalated = s.status.kind === "escalated";
  return `# Case ${c.id}: ${c.title}

## Decision

${decision}

${escalated ? escalationSection : ""}## Summary

${summary}

## Outbox

${outboxLines.length > 0 ? outboxLines.join("\n\n") : "No messages."}

## Timeline

${timelineBlocks}

## Approvals requested

${approvalsLines.length > 0 ? approvalsLines.join("\n") : "None."}
${finalChecksSection}
## Notes

${notesLines.length > 0 ? notesLines.join("\n") : "None."}

${escalated ? "" : escalationSection}## Failed, refused or invalid actions

${failedLines.length > 0 ? failedLines.join("\n") : "None."}
`;
}

function reasoningMd(c: Case, s: CaseState, visible: CaseEvent[]): string {
  const runSections: string[] = [];
  for (const [i, r] of s.runs.entries()) {
    const run = i + 1;
    const runActions = r.actions;
    const runNotes = r.notes;

    if (runActions.length === 0 && runNotes.length === 0) continue;

    const eventsInRun = runEvents(s, visible, i)
      .map((e) => `- [event ${String(e.n).padStart(3, "0")}]`)
      .join("\n");

    const actions = runActions
      .map((a) => `- **${a.tool}** (${a.ok ? "ok" : "failed"}): ${String(a.input.reason ?? "(no reason given)")}`)
      .join("\n");

    const notes = runNotes.join("\n\n");

    const runSection = `## Run ${run}

### Events received

${eventsInRun || "None."}

### Agent notes

${notes || "None."}

### Actions

${actions || "None."}
`;
    runSections.push(runSection);
  }

  return `# Reasoning for case ${c.id}

${runSections.join("\n")}`;
}

// Every message the agent sent, as files a real mail or SMS gateway could take: an .eml per email and
// a .sms.txt per SMS. Recipient addresses are not in the case data, so they use the reserved
// .invalid domain. Dates are case time (the event the run saw), so a rerun writes the same files.
export function writeOutbox(outDir: string, c: Case, s: CaseState): void {
  const dir = join(outDir, "outbox", c.id);
  rmSync(dir, { recursive: true, force: true });
  const sent = actionLog(s).filter((a) => a.ok && a.tool === "send_message");
  if (sent.length === 0) return;
  mkdirSync(dir, { recursive: true });
  sent.forEach((a, i) => {
    const to = String(a.input.to);
    const at = c.events.filter((e) => e.n <= a.seen).at(-1)?.at;
    const date = at ? new Date(at.replace(" UTC", "Z")) : null;
    const head = [
      `Message-ID: <${c.id}.${a.run}.${i + 1}@northbridge-lettings.case-agent>`,
      ...(date && !Number.isNaN(date.getTime()) ? [`Date: ${date.toUTCString()}`] : []),
      `X-Case-Id: ${c.id}`,
      `X-Run: ${a.run}`,
      `X-Recipient-Role: ${to}`,
    ];
    const name = `${String(i + 1).padStart(2, "0")}-run${a.run}-${to}`;
    if (a.input.channel === "sms") {
      writeFileSync(join(dir, `${name}.sms.txt`), `${head.join("\n")}\nTo: ${to}\n\n${a.input.text}\n`);
    } else {
      writeFileSync(
        join(dir, `${name}.eml`),
        [
          ...head,
          "From: Northbridge Lettings <maintenance@northbridge-lettings.invalid>",
          `To: ${to} <${to}@case-${c.id}.invalid>`,
          `Subject: Re: ${c.title}`,
          "MIME-Version: 1.0",
          "Content-Type: text/plain; charset=utf-8",
          "",
          String(a.input.text),
          "",
        ].join("\r\n"),
      );
    }
  });
}

export function writeAnswer(outDir: string, c: Case, s: CaseState, visible: CaseEvent[]): void {
  const dir = join(outDir, "ANSWERS", c.id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "ANSWER.md"), answerMd(c, s, visible));
  writeFileSync(join(dir, "REASONING.md"), reasoningMd(c, s, visible));
}
