# reality-sim: the project's eval

59 practice cases in the organisers' format. Each stops at a point where someone has to decide what to do, and each has a hidden answer sheet. One command runs the agent over them and one grades the result. This is a development set, not the organisers' test.

## Run it

```bash
npm run eval -- --score            # run all 59 cases, then grade them
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
| 401–412 | E | 12 | The hand-written edge cases (gas, prompt injection, data fishing, unverified identity, a refusing landlord, a vulnerable tenant), imported from `evals/edge-cases`. These also carry mechanical checks. |

Correct decisions across the set: ask 20, escalate 16, proceed 12, hold 7, close 4.

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
2. **Mechanical checks** (tier E only, the `checks` in the label). These read the agent's recorded actions in `state/<id>.json`: how the case ended, tools that must or must not be used, who was messaged, and phrases that must not appear in a sent message. They are the checks the edge-case suite already used.

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
- The tier C cases were written by a model from the cards, and the tier E and 116–125 rubrics were converted by a model from the earlier tests' expectations. They were checked for format and spot-checked, not each read in full by a person.
- The parser drops a `## Question` section, so on 302, 303, 308 and 312 the agent does not see the question.
- 208 has a deliberate gap in event numbers (events 019 and 020 removed).
- 402: the source test required the safety message by email. That check was dropped, because the rubric asks for the fastest channel.
