# reality-sim: the project's eval

77 practice cases in the organisers' format. Each stops at a point where someone has to decide what to do, and each has a hidden answer sheet. One command runs the agent over them and one grades the result. This is a development set, not the organisers' test.

## Run it

```bash
npm run eval -- --score            # run all 77 cases, then grade them
npm run eval -- --tier E --score   # only one tier (A, B, C or E)
npm run eval -- --only 301,402     # only some cases, no grading
npm run eval:score -- runs/eval/<run>   # grade a run made earlier
```

Both need `ANTHROPIC_API_KEY` (see `.env.example`). A run writes to `runs/eval/<timestamp>/` (`--out` to change): the agent's usual `ANSWERS/`, `state/` and `traces/`, a `run.json` with the time each case took, and with `--score` a `score/SCORECARD.md` and `score/results.json`. `--concurrency N` sets how many cases run at once (default 4). `MODEL` picks the agent's model and `JUDGE_MODEL` the judge's (default `claude-opus-5-5`).

Each case is run once, from a clean state, with its whole history visible up to its last event, the agency's own events included. That is the `step` in `manifest.json`.

## What is in the set

| IDs | Tier | Count | What it is |
|---|---|---|---|
| 101–125 | A | 25 | A public case cut short at a decision point. Overview, Outcome, Status and later events removed. 116–125 are the ten decision points from the earlier Process Reward set. |
| 201–210 | B | 10 | A tier A cut with one change that alters the right answer (a yes becomes a no, a reply is empty, an email bounces, a safety detail appears, an instruction is injected). |
| 301–312 | C | 12 | New cases written from a card: emergencies, a deposit dispute, a legal letter, an identity request, failed actions, a finished job with nothing to do. Four have a `## Question` section. |
| 313–330 | C | 18 | Harder new cases, mostly outside repairs: payment fraud, a gas safety deadline, a welfare concern, a safeguarding disclosure, suspected asbestos, a sale mid-case, an insurance declaration, a council notice, a disability adaptation. The deciding detail is buried in routine events or sits only in an attachment, and in several the landlord or the system instructs the wrong thing. Five of them test that the agent does not over-react. |
| 401–412 | E | 12 | The hand-written edge cases (gas, prompt injection, data fishing, unverified identity, a refusing landlord, a vulnerable tenant), formerly `evals/edge-cases`. These also carry mechanical checks. |

Correct decisions across the set: escalate 25, ask 25, proceed 15, hold 7, close 5.

## How a case is graded

Each `labels/<id>.json` has a `rubric` with the six parts the hackathon rules name:

- `required`: what a good answer must do
- `acceptable`: other answers that also pass
- `optional`: extra credit
- `red_flags`: poor judgement
- `prohibited`: must not do
- `critical`: any one of these fails the case

Two graders run:

1. **The judge.** A Claude model reads the case, the rubric, `ANSWER.md` and `REASONING.md`, and reports what the agent decided, whether the requirement (or an acceptable alternative) was met, and each critical, prohibited and red-flag item the answer commits.
2. **Mechanical checks** (tier E only, the `checks` in the label). These read the agent's recorded actions in `state/<id>.json`: how the case ended, tools that must or must not be used, who was messaged, and phrases that must not appear in a sent message. They are the checks the earlier edge-case suite used.

A case passes when the requirement is met, nothing critical or prohibited was done, and no mechanical check failed.

## Reading a scorecard

- The summary gives the pass rate, coverage (an answer exists and the run finished), critical failures, escalations where none was called for, and missed escalations.
- A case with no `ANSWER.md` is a coverage failure. A case the judge could not grade is listed as unscored and left out of the pass rate.
- Failing answers that the judge thinks a careful letting agent could still defend are listed first. Treat those as rubrics that may be too strict: fix the rubric in `worklist.json`, rerun `tools/build.py`, and rescore.
- The judge is a model reading our own rubrics. Its verdicts are a development signal, not the organisers' scores.

## Layout

```
cases/<id>/        what the agent is given: index.md, history.md, attachments/
labels/<id>.json   the answer sheet. NEVER give this folder to the agent.
manifest.json      every case: its folder, tier, decision-point event and label
worklist.json      the source of every rubric, cut point, change and card
run.ts             runs the agent over the cases
score.ts           grades a run
tools/build.py     rebuilds the tier A and B cases, all labels and the manifest from worklist.json
tools/validate.py  checks every case has the public-case shape and no outcome text
BRIEF.md           the writing instructions used for the tier C cases
```

## Changing the set

- **Fix a rubric:** edit it in `worklist.json`, then run `python3 -I evals/reality-sim/tools/build.py`. Do not edit `labels/` by hand; the build overwrites it.
- **Add a cut of a public case:** add a `tier_a` entry with `parent_case` and `cut_after_event`, then build. This needs `data/public/Property Management` linked (see the main README).
- **Add a written case:** add its folder under `cases/` and an entry under `tier_c` or `tier_e`, then build.
- **Check:** `python3 -I evals/reality-sim/tools/validate.py --all`.

The build overwrites the tier A and B case folders and every label. It leaves the tier C and E case folders alone.

## Known limits

- The policy was derived from the same 50 public cases the tier A cuts come from, so a high score there shows little about unseen cases. Tiers B, C and E are the better signal.
- 313–330 are untested: no agent has been run on them, so their rubrics have not been calibrated against real answers. Expect some to need loosening after the first run.
- 317 and 318 concern a possible death and a disclosure of fear of a partner. They are written soberly; handle their outputs with the same care.
- The tier C cases were written by a model from the cards, and the tier E and 116–125 rubrics were converted by a model from the earlier tests' expectations. They were checked for format and spot-checked, not each read in full by a person.
- The parser drops a `## Question` section, so on 302, 303, 308, 312 and 324 the agent does not see the question.
- 208 has a deliberate gap in event numbers (events 019 and 020 removed).
- 402: the source test required the safety message by email. That check was dropped, because the rubric asks for the fastest channel.

## Paired playbook check

`run-paired.ts` runs each case through the MCP `run_case` tool at its `step` from the manifest, for both arms, with fresh state, the same policy, tools and actor model. Only playbook selection and completion checking are disabled in the baseline. Each case alternates which arm runs first; the next trial reverses this order. The runner reads only IDs and steps from the manifest and exposes only `cases/` to the server. Use a fresh output directory:

```bash
MODEL=claude-sonnet-5-5 PLAYBOOK_MODEL=claude-sonnet-5-5 PLAYBOOKS=on FALLBACK_MODEL='' node --env-file-if-exists=.env --import tsx evals/reality-sim/run-paired.ts runs/reality-sim/paired-v2 2
```

Score each `trial-N/baseline` and `trial-N/playbooks` folder with the unchanged `score.ts` command and its default Opus judge. Report all trials, failures and judge errors; do not rerun just semantic failures or change rubrics to obtain a gain. These practice cases have informed development, so this comparison is a development check, not held-out evidence of generalisation or statistical proof.

For an exact latest-main comparator, set `BASELINE_REPO` to a separate clean checkout of main. The baseline then imports that checkout's MCP server and dependencies directly and records its own commit, while the playbook arm imports this branch. Both still use the same cases, model and policy; compare the recorded policy hashes before interpreting the results.
