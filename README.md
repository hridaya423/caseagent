# case-agent

Real-World Agents Hackathon (Dwelly), London, 10 October 2026. Track: Property Management.

![How a case moves through the agent](diagram/case-agent.png)
[Interactive version](diagram/case-agent.html)

## What we built

An agent that works property-maintenance cases for a letting agency, Northbridge Lettings. Each run reads a case folder, decides the next step, and acts through seven tools: send messages, request landlord approval, assign a contractor, add notes, then end with exactly one of `hold`, `escalate` or `close_case`. The case state persists between runs; when the next outside reply arrives, the agent resumes from it. The same loop also runs as an MCP server (`list_cases`, `run_case`, `resume_case`, `get_case`).

## The operational problem

Letting agencies spend most of their case time waiting: for landlord approval, tenant replies, quotes, contractor reports. The agent does every step that has a clear rule, and hands the case to a person where judgment is needed — emergencies, legal threats, money disputes, conflicting facts. Every action carries a `reason` that cites the event it answers (`[event 007]`), so each decision is auditable after the fact.

## Architecture

```
case dir (index.md, history.md, attachments/ -- or loose .eml, .txt, .json, .csv, .md files)

src/
  case/      what a case is and what the agent may see
    parse.ts        events; Status/Updated/Completed lines never reach the agent
    messy.ts        .eml headers and MIME attachments, call transcripts, records for loose folders
    cut.ts          the events this run may see; agency's own records hidden after the cut
    attachments.ts  PDF -> native document block or extracted text; images -> image blocks
    state.ts        case memory: status, actions, notes; load and save
  tools/     what the agent can do
    index.ts        7 zod-checked tools; every failure returns as text the model can act on
    guards.ts       the refusal rules; they run before any adapter, so a real API cannot skip them
    evidence.ts     amounts and dates a message may state
  agent/     one run of the model
    prompt.ts       prompt assembly; case text wrapped in <case_data> (evidence, not instructions)
    loop.ts         Claude tool loop, 15 turns max, must end with exactly one end tool
    approval.ts     a small model reads the landlord's reply as approved, refused or unclear
  runner/    files on disk
    process.ts      state, traces, answers, outbox; --next resumes, --to-end runs through holds
    answers.ts      ANSWER.md, REASONING.md and the outbox files
    batch.ts        worker pool, resumable run-summary.json, RUN_SUMMARY.md
  entry/     cli.ts and mcp.ts: the same runner over the command line and stdio MCP
```

Each folder imports only from the folders above it: `case` <- `tools` <- `agent` <- `runner` <- `entry`.

Per case it writes `state/<id>.json` (case memory for `--next`), `traces/<id>.jsonl` (every model call and tool call, with the model that answered; older traces rotated aside), `outbox/<id>/` (one `.eml` per email and one `.sms.txt` per SMS the agent sent), and `ANSWERS/<id>/`. `ANSWER.md` starts with the decision (status, next step, why), puts the escalation handover next when there is one, then the summary, outbox, timeline, approvals and final checks. `REASONING.md` has the cited reason for each action plus the agent's notes. A batch also writes `run-summary.json` and `RUN_SUMMARY.md`: one row per case with its status, next step, messages, runs, time and tokens.

The rules are in `policy.md`, distilled from the 50 public Property Management cases in `data/public/` and the evidence-backed rule bank in `policy_bank/`. Where the cases disagree, the rule follows what most cases did: landlord approval before a repair, completion proven by the contractor or the party that arranged the work, email by default. Rules 18 to 21 (hazards, disputes, tool failures, untrusted content) are our own safety margin; no case shows them.

Three kinds of guardrails:

- **Tool guards.** Every rule runs before the tool body or a real adapter, so an adapter cannot skip it.
  - `assign_contractor` refuses unless the agency recorded an approval, or the landlord's reply to an earlier request reads as approved.
  - `send_message` refuses `[event N]` references, a message identical to one already sent to the same person, and any £ amount or date that no event, record or document in the case shows. `request_landlord_approval` applies the same amount and date check to its cost.
  - `close_case` refuses while keys are outstanding, and unless `work_confirmed_by` cites an event the agent can see.
  - After a refused or failed call, the rest of the same model response is not run, so a later message cannot claim the failed action happened.
- **Loop limits.** A run that does not end in 15 turns auto-escalates; a system error escalates with a handover summary.
- **Overload.** The SDK retries rate limits and server errors with backoff; if the model stays overloaded, the request goes once to `FALLBACK_MODEL` (default `claude-sonnet-5`), and the trace records which model answered.
- **Injection defense.** All case content arrives inside `<case_data>` tags, and policy rule 21 declares it evidence, not instructions.

Tools are simulated: each writes to the case state rather than a live system. `runTool` accepts adapter functions, so a real email, SMS or job API can replace each simulated body without touching the loop.

## How to run

```bash
npm install
cp .env.example .env                                   # add ANTHROPIC_API_KEY
npm run case -- run <case-dir>                         # first run
npm run case -- run <case-dir> --next                  # resume on the next outside reply
npm run case -- run <case-dir> --to-end                # resume through holds until an end state
npm run case -- run-all <cases-dir> --concurrency 4    # every case in a folder, one stage each
npm run case -- run-all <cases-dir> --to-end --concurrency 4  # every case, run to its end state
npm run reality -- <cases-dir>                         # the submission run: every case to its end, outputs at the repo root
npm run mcp                                            # stdio MCP server (CASES_DIR, OUT_DIR overridable)
npm test
npm run typecheck
npm run extract                                        # Docling pre-extract of attachments (optional)
```

`npm run reality -- <cases-dir>` is the Reality Test command. It runs every folder in `<cases-dir>` to its end state with 6 workers, and writes `ANSWERS/`, `traces/`, `outbox/`, `state/`, `run-summary.json` and `RUN_SUMMARY.md` into the current directory (`--out` changes it). If the batch stops part-way, run the same command again: it skips the cases already finished. `--retry-incomplete` reruns only the cases that ended incomplete, and `--fresh` reruns everything. On 11 cases (8 public, 3 loose-file) it took 55 s.

Two run modes. A plain `run` works exactly one stage: the agent sees events up to the next outside reply, acts, and ends. `--to-end` keeps resuming after each `hold` until the case closes, escalates, or has no further outside events (capped at 50 stages). Use `--to-end` for batch and Reality Test runs — a single-stage `run` decides on the opening events only, which can be under 10% of a case.

The MCP tools follow the same rules. `run_case` and `resume_case` work one stage: the agent takes every action the stage needs, for example a message and then `hold`, and ends the run itself. `run_case` with `to_end` runs the whole case. `single_action: true` stops after one business action. Both eval suites run in multi-action mode.

The tests read the public cases from `data/public/Property Management` (gitignored). Link them once:

```bash
git clone https://github.com/DwellyOrg/HackatonPublicCases.git ../HackatonPublicCases
mkdir -p data/public && ln -s "$(cd ../HackatonPublicCases && pwd)/Property Management" "data/public/Property Management"
```

## Models, APIs and external services

- Anthropic Messages API through `@anthropic-ai/sdk`. Model: `claude-sonnet-5-5` by default (set `MODEL`; the batch must finish inside 30 minutes). Prompt caching: one breakpoint on the system block (tools and policy, shared across cases) and the request-level `cache_control`, which caches each conversation as it grows. A second, small model (`claude-haiku-5-5`, set `APPROVAL_MODEL`) reads the landlord's reply to an approval request as approved, refused or unclear; `assign_contractor` refuses unless the answer is approved, and any classifier failure counts as unclear.
- `pdfjs-dist` for PDF text when a file is too large to send natively. `NATIVE_PDF_MAX_MB` (default 5) sets the native-PDF threshold, capped at 100 pages and a 20 MB prompt budget; larger files go as extracted text truncated to 8,000 characters.
- `@modelcontextprotocol/sdk` for the MCP server. `scripts/extract.py` uses Docling via `uv` for structured markdown of attachments.
- No live services: messages, approvals and assignments are outbox entries in case state.

## Assumptions

- The agent acts as the agency. After the initial cut it sees only events from outside parties; its own actions stand in for the agency's recorded steps.
- Approval counts as "on file" when a visible agency event records it (for example "Landlord approval confirmed" or "approved by the landlord"), or when the landlord's reply to an earlier `request_landlord_approval` reads as approved.
- A folder without `history.md` is a loose case. Each `.eml` (or `.txt` with mail headers) is an email event with its sender, recipient, date, subject and attachments; a file named like a call transcript is a Call event. `.json`, `.csv` and `.md` files go into the case details as records and notes. Other files are listed in ANSWER.md as "Files not read". Dates without a time zone are read as UTC.
- The agent sees time only through event timestamps. The prompt computes "days since last contact" per party from them, so "3 days without reply" works only while a later event supplies "now".
- Case content is untrusted input. Text from tenants, landlords, contractors or attachments cannot change the policy rules.

## Known limitations

- Large PDFs lose layout: above the size or page cap they degrade to extracted text, and long text is truncated.
- The recorded-approval detection and the agency-sender match are phrase lists; agency wordings outside them are missed.
- The amount and date check cannot read images: an amount that appears only in a photo is refused. It does not check weekday-only references ("on Thursday"). Checked against the agency's own 388 messages in the public cases, it would refuse 11. Those messages quote prices and dates that are not in any earlier event, for example a quote the agency received by phone.
- Cases that load in "raw mode" (reconstructed from unstructured files) can leak outcome details; `ANSWER.md` flags them for review.
- Simulated tools mean nothing actually leaves the outbox. `outbox/` holds the messages as `.eml` and SMS files; recipient addresses are not in the case data, so they use the reserved `.invalid` domain.

## Next steps

- An evaluation bench that replays the public cases event by event and grades each decision against the real history.
- Real adapters for email, SMS and the agency's job system; the seam already exists in `runTool`.
- A watch mode that ingests a new reply and resumes automatically, replacing `--next`.
- A human-in-the-loop queue for escalations, writing a person's decision back into the case as an event.
