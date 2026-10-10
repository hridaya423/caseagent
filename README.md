# case-agent

Real-World Agents Hackathon, London, 10 October 2026 · Property Management

![Agent workflow with playbook references](diagram/case-agent.png)
[HTML diagram](diagram/case-agent.html)

## What we built

An agent that handles property-maintenance tickets for Northbridge Lettings: triage, landlord approval, contractor coordination and completion checks. It takes routine actions autonomously and escalates emergencies, disputes and conflicting facts with a structured handover. Saved state lets it resume when a new reply arrives.

Seven tools send messages, request approval, assign contractors, add notes, or end a stage with `hold`, `escalate` or `close_case`. Every action records a reason with event citations. Operational tools are simulated locally; adapter functions can connect real email, SMS or job APIs.

## Architecture

```text
case/   → parse files and attachments, cut visible history, persist state
 tools/ → validate inputs and enforce approval/evidence/closing guards
 agent/ → Claude tool loop, approval classifier, playbook selection and audit
runner/ → resume stages, batch cases, write answers/traces/outbox
 entry/ → CLI, stdio MCP and read-only dashboard
```

[policy.md](policy.md) draws on the 50 public cases and [policy bank](policy_bank/policy_bank.json), with added rules for hazards, disputes, failed tools and untrusted content. Tool guards run before adapters. Failed calls return to the model; subsequent calls in the same response are skipped. API failures use SDK retries and an optional fallback. A stage is limited to 15 turns, a full replay to 50 stages; system failures are marked incomplete and escalated.

The [JSON playbooks](docs/playbooks/property-management-playbooks.json) provide reusable workflows and selected examples. Each turn selects relevant steps using current evidence; only validated references enter context. Before hold/close, an optional audit checks obligations against successful actions, at most twice per invocation. Invalid/failed audits fall back to policy; single-action runs skip them. Set `PLAYBOOKS=off` to disable this feature.

## Install and configure

Requires Node.js 24, npm and Git. Live runs need internet access and an Anthropic API key with model access and credit. No database or hosted backend is needed.

```bash
git clone https://github.com/hridaya423/caseagent.git
cd caseagent
npm ci
cp .env.example .env
```

Set `ANTHROPIC_API_KEY` in `.env`; never commit credentials. Live npm scripts load this file, with exported variables taking precedence.

| Variable | Default / purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Required for live inference and scoring. |
| `MODEL` | `claude-sonnet-5-5`, acting model. |
| `APPROVAL_MODEL` | `claude-haiku-5-5`, landlord-reply classifier. |
| `FALLBACK_MODEL` | `claude-sonnet-5`; empty string disables fallback. |
| `PLAYBOOKS` | Enabled; `off` disables references and audits. |
| `PLAYBOOK_MODEL` | Same as `MODEL`, for selection and audits. |
| `NATIVE_PDF_MAX_MB` | `5`, native-PDF size threshold. |
| `CASES_DIR` / `OUT_DIR` | MCP: `data/public/Property Management` / `runs/mcp`; paths relative to the repository. |
| `JUDGE_MODEL` | `claude-opus-5-5`, development scorer. |

Anthropic receives visible case content and supported attachments. Dependencies include its SDK, the MCP SDK, Zod, tsx and pdfjs-dist; versions are locked in `package-lock.json`. Optional Docling pre-extraction uses `uv` and Python >=3.10,<3.13: `npm run extract -- <cases-dir>`.

Public practice data is needed for the examples and unit tests:

```bash
git clone https://github.com/DwellyOrg/HackatonPublicCases.git ../HackatonPublicCases
mkdir -p data/public
ln -s "$(cd ../HackatonPublicCases && pwd)/Property Management" "data/public/Property Management"
```

On platforms without symlinks, copy that directory instead. Supplied unseen cases can be used directly.

## Run

From the repository root, use a case folder containing `index.md`, `history.md` and optional `attachments/`. The CLI also loads loose emails, transcripts and records.

```bash
npm run case -- run "data/public/Property Management/027" --out runs/example
npm run case -- run "data/public/Property Management/027" --next --out runs/example
npm run case -- run-all <cases-dir> --to-end --concurrency 4 --out runs/batch
npm run reality -- <unseen-cases-dir>
npm run mcp
npm run dashboard
```

`run` handles one stage; `--next` resumes saved state. `--to-end` replays replies until closed, escalated or waiting with no further events. `reality` does this for every case with six workers and writes at the repository root. `--out` changes the destination. Reusing a batch directory skips recorded cases; `--retry-incomplete` retries system failures and `--fresh` restarts all cases. Preserve original results and disclose retries.

MCP exposes `list_cases`, `run_case`, `resume_case` and `get_case` over stdio. Run/resume take `case_id` and optional inclusive `step` and `single_action`; run additionally accepts `to_end`, incompatible with the other two options. Run/resume return status and `ANSWER.md`; get returns both answer and reasoning. MCP requires `index.md`; use CLI for loose folders. `single_action` stops after at most one business action.

The read-only dashboard is at `http://localhost:4317`, needs no key, and shows decisions, handovers, tool calls, history and traces. To inspect submission output: `npm run dashboard -- --runs . --cases <unseen-cases-dir>`.

## Outputs

```text
ANSWERS/<id>/ANSWER.md       decisions, actions, failures, handover and final result
ANSWERS/<id>/REASONING.md    per-run notes and cited action reasons
state/<id>.json             saved state and event cuts
traces/<id>.jsonl           model/tool calls, errors and usage
outbox/<id>/                successful email/SMS files
run-summary.json            batch results
RUN_SUMMARY.md              coverage, time and token summary
```

These records show what the system saw, attempted, completed and escalated. Keep the supplied inputs or an accessible reference where publication is permitted. If using `--out`, include the generated `ANSWERS/` at the submission root with its corresponding execution evidence.

## Validation

```bash
npm test
npm run typecheck
python3 -I evals/reality-sim/tools/validate.py --all
npm run eval -- --score
```

The [development eval](evals/reality-sim/README.md) has 59 decision points, hidden labels, an Opus judge and mechanical checks for tier E. It is not the organisers' unseen Reality Test. Live evaluation requires the API key; tests and format checks do not. At `4438a46`, 143 tests, typecheck and all 59 format/leak checks passed using existing dependencies.

[Recorded playbook comparisons](evals/results/playbook-paired-v4-2026-10-10/SUMMARY.md) passed 62/74 versus 61/74 without playbooks, with higher latency. This older development run does not prove reliable improvement or evaluate latest main.

## Assumptions and limitations

- The agent acts as the agency; after the initial cut, outside replies advance the case. Time comes from event timestamps rather than a live clock.
- Approval is an agency-recorded grant or an approved classifier result for a landlord reply. Classifier errors count as unclear; sender/approval phrase matching can miss unfamiliar wording.
- Large PDFs fall back to text, capped at 8,000 characters. Image-only amounts cannot satisfy the text-based evidence guard. Unread files are flagged.
- Raw-case reconstruction can leak outcome details. Case content is treated as evidence, but injection resistance is not guaranteed.
- Messages and assignments remain local simulations. Playbooks add calls and latency; their optional audits are not absolute safety enforcement.

## Next steps

Connect live operational adapters, ingest replies automatically, add a human escalation queue, and validate multi-stage behaviour on held-out cases with cost and coverage measurements.

## Submission and licence

Released under [Apache 2.0](LICENSE); third-party dependencies and data retain their own terms. The final submission must include:

- System-generated unseen `ANSWERS/` and relevant traces; do not manually correct failed outputs.
- A working-product demo of about 60 seconds or less uploaded **inside the repository**.
- LinkedIn and X launch-post URLs, each identifying the project and linking to this repository.
- Team name, track, member names, public repo URL, frozen commit hash, results and video paths, in the submission form and optionally `SUBMISSION.md`.

Those final artefacts were not committed at `4438a46`. Confirm the freeze deadline with organisers: the supplied guide names both 16:30 and 17:00 BST; prepare source/demo for the earlier time and preserve the submitted code and results.
