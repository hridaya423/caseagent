# Evals

Owner: Joshua Anyamene. Changes under `evals/` go through the owner.

**[`reality-sim/`](reality-sim/README.md)** is the project's eval: 77 decision-point cases with hidden answer sheets, a runner and a scorer.

```bash
npm run eval -- --score                  # run the agent over every case, then grade
npm run eval:score -- runs/eval/<run>    # grade a run made earlier
```

The set is in four tiers: public cases cut at a decision point (A), the same cuts with one change that alters the right answer (B), new cases covering situations the public set lacks (C), and hand-written edge cases with mechanical checks (E).

It replaces three earlier sets, whose content it carries: the ten Process Reward decision points are cases 116–125, and the twelve edge cases are 401–412. Their folders were removed and remain in the git history; the Process Reward run recorded under `results/` is kept because the dashboard displays it.

## Also in this folder

| Folder | What it is |
|---|---|
| `playbooks/` | A small paired test of the playbook feature: the same ticket run with and without playbooks (`npm run eval:playbooks`). |
| `reality-sim/run-paired.ts` | Runs the reality-sim cases with and without playbooks, for scoring each arm with `score.ts`. |
| `results/` | Recorded runs, which the runs dashboard reads: the playbook comparisons, a reality-sim run of the first 37 cases (32 passed) made before the set grew to 59, and the morning's Process Reward run. |

This is a development set built from public data. It is not the organisers' unseen Reality Test.
