# Evals

Owner: Joshua Anyamene. Changes under `evals/` go through the owner.

## The eval to run

**[`reality-sim/`](reality-sim/README.md)** is the project's eval: 59 decision-point cases with answer sheets, a runner and a scorer.

```bash
npm run eval -- --score
```

It contains the decision points from the earlier Process Reward set (cases 116–125) and the twelve edge cases (401–412), so one run covers everything below.

## Earlier sets, kept for now

| Folder | What it is | Status |
|---|---|---|
| `edge-cases/` | Twelve hand-written edge cases with mechanical checks (`npm run eval:edge`). | Imported into reality-sim as 401–412 with the same checks plus a judged rubric. |
| `Process Reward/` | Ten next-action tests that pass when the agent calls the same tool the agency did (`npm run eval:process`). | Its ten decision points are in reality-sim as 116–125, graded on substance. |
| `results/` | An export of one Process Reward run from the morning of 10 October, made with an early version of the agent. | Historical. |
| `Outcome Reward/` | Empty placeholder for whole-case outcome evals. | reality-sim fills this role. |

All of these are development sets built from public data. None is the organisers' unseen Reality Test.
