# Run notes

Baseline: main 0b2399d. Playbooks: 8ea7817, including the latest main merge and adaptations to upstream run-record state. Both arms used the same policy hash and operational tools.

The unchanged reality-sim manifest supplied 37 cases. Two fresh trials ran concurrently across arms with four workers and counterbalanced case order. Inputs were projected to case ID and decision step; expected outcomes were not supplied to the actor. Baseline loaded main directly from a detached worktree, subsequently removed.

Actor, selector and completion auditor: claude-sonnet-5-5; fallback disabled. Judge: the original unmodified reality-sim scorer using claude-opus-5-5. Trial 1 was scored in full; trial 2 was scored in disjoint A/B/C shards and combined with the original scorecard function. All 148 actor runs and judge results are included. There were no execution errors, judge errors or missing cases. No semantic failures were selectively retried.

Validation before evaluation: TypeScript checks passed, 140 unit tests passed, and all 10 process-reward boundary fixtures passed. Results-only commits after evaluation do not change the evaluated runtime commit.

Earlier partial v2/v3 runs were stopped before scoring for an auditor provenance fix and an upstream-main update. They are excluded, not substituted for any final result. The practice set informed development and is not a held-out benchmark. Completion audit is bounded to two checks and fails open on invalid responses or model errors; it is not an absolute safety guarantee.

Results are developmental evidence, not proof that the playbook package improves accuracy reliably. See SUMMARY.md for gains, regressions and overhead.
