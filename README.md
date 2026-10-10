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
    state.ts        zod-validated memory: status and per-run seen/notes/actions; legacy-state upgrade
  tools/     what the agent can do
    index.ts        7 zod-checked tools; every failure returns as text the model can act on
    guards.ts       the refusal rules; they run before any adapter, so a real API cannot skip them
    evidence.ts     amounts and dates a message may state
  agent/     one run of the model
    prompt.ts       prompt assembly; case text wrapped in <case_data> (evidence, not instructions)
    loop.ts         Claude tool loop, 15 turns max, must end with exactly one end tool
    approval.ts     a small model reads the landlord's reply as approved, refused or unclear
    playbooks.ts    selects applicable JSON playbook steps from current visible evidence
    playbook-audit.ts  bounded completion review before hold/close
    model-submission.ts  model-compatible structured tool submission
  runner/    files on disk
    process.ts      state, traces, answers, outbox; --next resumes, --to-end runs through holds
    answers.ts      ANSWER.md, REASONING.md and the outbox files
    batch.ts        worker pool, resumable run-summary.json, RUN_SUMMARY.md
    runs.ts         read-only views of the run folders, for the dashboard
  entry/     cli.ts and mcp.ts: the same runner over the command line and stdio MCP
    dashboard.ts    the runs dashboard (server in dashboard-server.ts, page in dashboard/)
```

Each folder imports only from the folders above it: `case` <- `tools` <- `agent` <- `runner` <- `entry`.

Per case it writes `state/<id>.json` (case memory for `--next`), `traces/<id>.jsonl` (every model call and tool call, with the model that answered; older traces rotated aside), `outbox/<id>/` (one `.eml` per email and one `.sms.txt` per SMS the agent sent), and `ANSWERS/<id>/`. `ANSWER.md` starts with the decision (status, next step, why), puts the escalation handover next when there is one, then the summary, outbox, timeline, approvals and final checks. `REASONING.md` has the cited reason for each action plus the agent's notes. A batch also writes `run-summary.json` and `RUN_SUMMARY.md`: one row per case with its status, next step, messages, runs, time and tokens.

The rules are in `policy.md`, distilled from the 50 public Property Management cases in `data/public/` and the evidence-backed rule bank in `policy_bank/`. Where the cases disagree, the rule follows what most cases did: landlord approval before a repair, completion proven by the contractor or the party that arranged the work, email by default. Rules 18 to 21 (hazards, disputes, tool failures, untrusted content) are our own safety margin; no case shows them.

Guardrails and recovery:

- **Tool guards.** Every rule runs before the tool body or a real adapter, so an adapter cannot skip it.
  - `assign_contractor` refuses unless the agency recorded an approval, or the landlord's reply to an earlier request reads as approved.
  - `send_message` refuses `[event N]` references, a message identical to one already sent to the same person, and any £ amount or date that no event, record or document in the case shows. `request_landlord_approval` applies the same amount and date check to its cost.
  - `close_case` refuses while keys are outstanding, and unless `work_confirmed_by` cites an event the agent can see.
  - After a refused or failed call, the rest of the same model response is not run, so a later message cannot claim the failed action happened.
- **Loop limits.** A run that does not end in 15 turns auto-escalates; a system error escalates with a handover summary.
- **Overload.** The SDK retries rate limits and server errors with backoff; if the model stays overloaded, the request goes once to `FALLBACK_MODEL` (default `claude-sonnet-5`), and the trace records which model answered.
- **Untrusted content.** Case text is wrapped in `<case_data>` tags; attached images and PDFs are also declared evidence, not instructions. This reduces exposure to injection; it is not a guarantee.

Tools are simulated: each writes to the case state rather than a live system. `runTool` accepts adapter functions, so a real email, SMS or job API can replace each simulated body without touching the loop.

## Prerequisites and installation

Use Node.js 24 and npm; the package declares Node >=22 and uses `--env-file-if-exists`, so use a release that supports that flag. Git is needed to clone this repository and the public practice data. Live agent runs require internet access, an Anthropic API key with access to the configured models, and API credit. No database or hosted backend is required.

```bash
git clone https://github.com/hridaya423/caseagent.git
cd caseagent
node --version
npm ci
cp .env.example .env
```

Set `ANTHROPIC_API_KEY` in `.env`. Keep it local: `.env`, `node_modules/`, `data/` and `runs/` are gitignored. Never include credentials in committed outputs or submission metadata.

For the public examples and tests, obtain the organisers' dataset separately:

```bash
git clone https://github.com/DwellyOrg/HackatonPublicCases.git ../HackatonPublicCases
mkdir -p data/public
ln -s "$(cd ../HackatonPublicCases && pwd)/Property Management" "data/public/Property Management"
```

The link command is for macOS/Linux. On another platform, copy the `Property Management` directory to `data/public/Property Management`. The dataset is not bundled in this repository. Supplied Reality Test folders can be used directly without this link.

## Configuration

The npm scripts for live runs load `.env`. Exported environment variables take precedence. Defaults below describe this code, not a guarantee that an account has access to each model.

| Variable | Required | Default and purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | For live runs/scoring | Anthropic Messages API credential. Not needed for the dashboard, unit tests or format validator. |
| `MODEL` | No | `claude-sonnet-5-5`, the acting model. |
| `APPROVAL_MODEL` | No | `claude-haiku-5-5`, classifies landlord replies; errors count as unclear. |
| `FALLBACK_MODEL` | No | `claude-sonnet-5`, one fallback attempt after retryable API failures; set to an empty string to disable. |
| `PLAYBOOKS` | No | Enabled; exactly `off` disables selection and completion auditing. |
| `PLAYBOOK_MODEL` | No | `MODEL`, or `claude-sonnet-5-5` when unset; used for playbook selection and completion auditing. |
| `NATIVE_PDF_MAX_MB` | No | `5`, threshold for sending a native PDF, also subject to page and prompt-budget limits. |
| `CASES_DIR` | MCP only | `data/public/Property Management`, relative to the repository unless absolute. |
| `OUT_DIR` | MCP only | `runs/mcp`, relative to the repository unless absolute. CLI uses `--out` instead. |
| `JUDGE_MODEL` | Development scoring only | `claude-opus-5-5`. The judge is separate from the acting agent. |

## Run the agent

Run commands from the repository root. A case directory normally contains `index.md`, `history.md` and optional `attachments/`; the CLI also supports loose-case folders with emails, transcripts and records.

```bash
# One stage, with outputs isolated from other runs.
npm run case -- run "data/public/Property Management/027" --out runs/example
# Continue the same saved case when the next outside reply arrives.
npm run case -- run "data/public/Property Management/027" --next --out runs/example
# Replay an entire case through its available outside replies.
npm run case -- run "data/public/Property Management/027" --to-end --out runs/full-case
# Replay every case in a folder, with four workers.
npm run case -- run-all "data/public/Property Management" --to-end --concurrency 4 --out runs/public-batch
```

A plain `run` processes one stage and ends with `hold`, `escalate` or `close_case`. `--next` uses saved state in the same output directory. `--to-end` starts fresh and resumes after each hold until the case closes, escalates or has no further outside events, capped at 50 stages. A legitimate hold can be the final result. One stage has at most 15 model turns. Agent escalations require a checked/missing-or-conflict/decision-needed handover; system escalations are incomplete runs.

### Reality Test command and outputs

When the organisers release the unseen cases, run the frozen implementation against that directory:

```bash
npm run reality -- /absolute/path/to/reality-test-cases
```

This uses six workers, replays every case, and writes into the repository root by default. `--concurrency N` and `--out <dir>` override those settings. Use a clean output location for an independent run: rerunning a batch in the same location skips recorded cases. `--retry-incomplete` retries incomplete/system-error cases; `--fresh` reruns all cases. Preserve the original results and disclose retries rather than replacing semantic failures by hand.

```text
ANSWERS/<case-id>/ANSWER.md       decision, status, next step, actions, failures and final checks
ANSWERS/<case-id>/REASONING.md    per-run agent notes and cited reasons for actions
state/<case-id>.json             initial cut and per-run seen/notes/actions
traces/<case-id>.jsonl           model/tool events, usage, errors and optional playbook checks
outbox/<case-id>/                successful email/SMS messages as .eml/.sms.txt files
run-summary.json                machine-readable batch results
RUN_SUMMARY.md                  per-case results, coverage, timing and token summary
```

Case IDs are preserved. Event cuts and successful/failed tool calls allow reviewers to distinguish what the agent saw, attempted, completed and escalated. `REASONING.md` contains the notes and action explanations emitted by the system. Preserve supplied inputs, or an accessible reference to them where publication is permitted, so reviewers can reconstruct the context. If using `--out`, place the generated `ANSWERS/` at the submission repository root and retain the corresponding traces and run metadata.

### MCP interface

```bash
CASES_DIR="data/public/Property Management" OUT_DIR=runs/mcp npm run mcp
```

Connect an MCP client to this stdio command. It is not an HTTP server. The client must start it in the repository working directory (so `.env` loads); an absolute-case/output path also works.

| Tool | Input | Behaviour and output |
|---|---|---|
| `list_cases` | `{}` | Lists folders containing `index.md`. |
| `run_case` | `case_id`; optional `step`, `single_action`, `to_end` | Starts/restarts saved state and returns status plus `ANSWER.md`. `step` exposes history through that event inclusive. `to_end` cannot be combined with `step` or `single_action`. |
| `resume_case` | `case_id`; optional `step`, `single_action` | Resumes at the current open stage or next outside reply. An explicit step must be the same or later. Returns status plus `ANSWER.md`. |
| `get_case` | `case_id` | Returns saved `ANSWER.md` and `REASONING.md` without running a model. |

`single_action: true` executes at most one business action and can leave the state open; the default completes a stage. Closed or escalated cases must be restarted with `run_case`. Loose folders without `index.md` are supported by the CLI but are not listed/accepted by this MCP interface.

### Demo dashboard

```bash
npm run dashboard
# Display root-level Reality Test output and its supplied case history.
npm run dashboard -- --runs . --cases /absolute/path/to/reality-test-cases
```

Open `http://localhost:4317`. The dashboard binds only to `127.0.0.1`, is read-only and needs no API key. Its default sources are `runs/`, checked-in development results and public case history. It shows decisions, handovers, tool calls/refusals, visible and hidden events, answers and traces. `--runs`, repeatable `--cases` and `--port` select other sources. It is a local demo viewer, not a production service.

### Verification and development evaluation

```bash
npm test
npm run typecheck
python3 -I evals/reality-sim/tools/validate.py --all
# Live development run and scoring; requires the API key and incurs API usage.
npm run eval -- --score
npm run eval:score -- runs/eval/<run>
```

The unified [development evaluation](evals/reality-sim/README.md) contains 59 decision points across A/B/C/E tiers. Labels and expected outcomes are withheld from the acting model. Scoring combines the Opus judge with mechanical checks for tier E; judge errors remain unscored. The earlier Process Reward and edge-case runners were consolidated into this suite. [Recorded results](evals/results/) include historical runs on smaller sets and paired playbook comparisons; they are not results for the organisers' unseen Reality Test or for every later implementation.

The reviewed implementation at `4438a46` passed 143 unit tests, TypeScript checks and all 59 format/leak checks using Node 24 and the public-data link. That verification reused installed dependencies and did not perform a fresh install or a new live-model run.

Optional document pre-extraction requires `uv`, Python >=3.10,<3.13 and Docling dependencies (declared in the script). It writes a local markdown cache for supported attachments; normal runs do not require it:

```bash
npm run extract -- "data/public/Property Management"
```

## Models, APIs and external services

- Anthropic Messages API through `@anthropic-ai/sdk`. Model: `claude-sonnet-5-5` by default (set `MODEL`; the batch must finish inside 30 minutes). Prompt caching: one breakpoint on the system block (tools and policy, shared across cases) and the request-level `cache_control`, which caches each conversation as it grows. A second, small model (`claude-haiku-5-5`, set `APPROVAL_MODEL`) reads the landlord's reply to an approval request as approved, refused or unclear; `assign_contractor` refuses unless the answer is approved, and any classifier failure counts as unclear.
- `pdfjs-dist` for PDF text when a file is too large to send natively. `NATIVE_PDF_MAX_MB` (default 5) sets the native-PDF threshold, capped at 100 pages and a 20 MB prompt budget; larger files go as extracted text truncated to 8,000 characters.
- `@modelcontextprotocol/sdk` provides stdio MCP transport; `zod` validates tool inputs and saved state. `tsx` executes TypeScript without a separate build. `scripts/extract.py` optionally uses Docling via `uv` for structured markdown of attachments.
- Anthropic receives the visible case content and supported attachments for model inference. The default agent has no live email, SMS, contractor or CRM integration: operational tool actions are recorded locally. The dashboard makes no external network requests.

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

- Broader held-out, multi-stage evaluations with stable rubrics, failure injection, cost and coverage measurements.
- Real adapters for email, SMS and the agency's job system; the seam already exists in `runTool`.
- A watch mode that ingests a new reply and resumes automatically, replacing `--next`.
- A human-in-the-loop queue for escalations, writing a person's decision back into the case as an event.

## Playbook references

The [JSON playbook bank](docs/playbooks/property-management-playbooks.json) contains reusable workflows distilled from public historical cases, with source references and selected examples. It is enabled by default; `PLAYBOOKS=off` disables it. Each actor turn shortlists relevant steps, then a model selects references using only currently visible evidence. Only validated selections enter context; the full historical case collection is not injected.

Before hold/close, selected obligations can be checked against current evidence and successful tool results, at most twice per invocation. Invalid or failed optional audits fall back to the normal policy; this is not an absolute safety guarantee. Single-action runs skip this completion check. Selection and auditing add model calls and latency.

The recorded two-trial comparison of runtime `8ea7817` against main `0b2399d` passed 62/74 versus 61/74, with seven gains and six regressions. Mean case latency was 25.6 versus 13.2 seconds. This development result does not establish reliable improvement or statistical significance, and does not evaluate the later 59-case suite or latest main. See the [full report](evals/results/playbook-paired-v4-2026-10-10/SUMMARY.md).

## Submission materials and licence

The canonical submission is this public repository, released under the standard [Apache License 2.0](LICENSE). Third-party packages, models, APIs and datasets retain their own licences and terms; publish supplied data and assets only where permitted.

Before submitting, include the following actual artefacts:

- The frozen source commit and system-generated unseen Reality Test `ANSWERS/<case-id>/ANSWER.md` and `REASONING.md`, with relevant execution evidence. Do not manually correct failed outputs.
- A working-product demo video of approximately 60 seconds or less, uploaded inside the repository; an external video link alone does not satisfy the requirement. Git LFS can be used if needed.
- At least one public LinkedIn post and one public X post identifying the project and linking to this repository. Include both URLs in the submission.
- Team name, Property Management track, all team members, repository URL, frozen commit hash, Reality Test result paths and video path. These can be collected in `SUBMISSION.md` and the organisers' form.

At the reviewed commit `4438a46`, root-level unseen `ANSWERS/`, a demo video and submission/social metadata had not been committed. Development evaluation reports do not satisfy those missing deliverables. This README documents preparation; it does not claim a completed submission.

The supplied guide names 16:30 BST for source/demo freeze in its timeline and 17:00 BST for code/results freeze elsewhere. Confirm the controlling deadline with the organisers, prepare source and demo for the earlier time, and preserve the exact submitted commit and generated results. After the applicable freeze, follow the organisers' restrictions on implementation and result changes.
