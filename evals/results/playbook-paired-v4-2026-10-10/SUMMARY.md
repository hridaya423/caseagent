# Playbook paired reality-sim evaluation

Models: Sonnet 5.5 actor/selector/auditor; original Opus 5.5 judge. Same cases, policy and operational tools; baseline loads latest main directly. Two fresh counterbalanced trials. All final results are included.

| Trial | Arm | Passed | Outcome / 4 | Judgement / 4 | Critical | Prohibited | Judge errors |
|---|---|---|---|---|---|---|---|
| 1 | baseline | 31/37 | 3.59 | 3.51 | 0 | 1 | 0 |
| 1 | playbooks | 31/37 | 3.41 | 3.32 | 0 | 1 | 0 |
| 2 | baseline | 30/37 | 3.46 | 3.35 | 0 | 1 | 0 |
| 2 | playbooks | 31/37 | 3.43 | 3.38 | 0 | 1 | 0 |

## Combined descriptive results

- baseline: 61/74 (82.43%), critical 0, prohibited 2.
- playbooks: 62/74 (83.78%), critical 0, prohibited 2.

Paired wins: 7; paired losses: 6. Each trial-case pair counts once.
Net difference: 1.35 percentage points.

## Changed verdicts

| Trial | Case | Baseline | Playbooks |
|---|---|---|---|
| 1 | 103 | fail | pass |
| 1 | 110 | pass | fail |
| 1 | 112 | fail | pass |
| 1 | 113 | fail | pass |
| 1 | 114 | pass | fail |
| 1 | 307 | pass | fail |
| 1 | 309 | pass | fail |
| 1 | 312 | fail | pass |
| 2 | 103 | fail | pass |
| 2 | 112 | fail | pass |
| 2 | 114 | pass | fail |
| 2 | 309 | pass | fail |
| 2 | 312 | fail | pass |

## Failures

- Trial 1 baseline: 102, 103, 106, 112, 113, 312.
- Trial 1 playbooks: 102, 106, 110, 114, 307, 309.
- Trial 2 baseline: 102, 103, 106, 110, 112, 306, 312.
- Trial 2 playbooks: 102, 106, 110, 114, 306, 309.

## Limits

- Practice set informed development; not held out.
- Two stochastic repeats of the same cases do not establish statistical significance.
- The playbook arm includes selection plus completion checking; effect is not isolated to bank text alone.
- Earlier v2/v3 partial runs were stopped before scoring (provenance bug and latest-main update) and are excluded.

## Interpretation and overhead

Playbooks passed one additional trial-case pair overall (62/74 versus 61/74), with seven gains and six regressions. This does not demonstrate a reliable accuracy improvement. Mean outcome score declined from 3.53 to 3.42; mean judgement score declined from 3.43 to 3.35.

Mean actor-run case latency was 13.2 seconds for baseline and 25.6 seconds for playbooks (judge time excluded). Playbooks made 104 selector calls and 63 completion audits in addition to 106 actor calls; baseline made 82 actor calls. Eleven blocked endings were followed by corrective messages, which alone does not establish better outcomes. Neither selector nor auditor reported an error. Raw token and cache usage is in usage.json; billed dollar cost was not available.
