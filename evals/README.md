# Evals

Owner: Joshua Anyamene. Changes under `evals/` go through the owner.

**[`reality-sim/`](reality-sim/README.md)** is the project's eval: 59 decision-point cases with hidden answer sheets, a runner and a scorer.

```bash
npm run eval -- --score                  # run the agent over every case, then grade
npm run eval:score -- runs/eval/<run>    # grade a run made earlier
```

The set is in four tiers: public cases cut at a decision point (A), the same cuts with one change that alters the right answer (B), new cases covering situations the public set lacks (C), and hand-written edge cases with mechanical checks (E).

It replaces three earlier sets, whose content it carries: the ten Process Reward decision points are cases 116–125, and the twelve edge cases are 401–412. Their folders and the morning's results export were removed; they remain in the git history.

This is a development set built from public data. It is not the organisers' unseen Reality Test.
