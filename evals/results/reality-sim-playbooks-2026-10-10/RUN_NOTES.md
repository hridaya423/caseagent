# Playbook reality-sim run

- Evaluated commit: 686cab2, containing origin/main 4d046a6 plus restored PR10 playbook integration.
- Actor and selector: claude-sonnet-5-5 (repository defaults). Judge: claude-opus-5-5 (original scorer default). No actor fallback occurred.
- Invocation: MCP run_case for all 37 manifest IDs, step set to the last event, complete stage; neither to_end nor single_action enabled. Labels excluded from actor inputs.
- Original scorer ran in disjoint A/B/C shards. Results were concatenated once in manifest order and rendered using the original exported scorecard function; no rubric or verdict changes.
- Validation: typecheck passed, 129/129 tests passed, 37/37 fixture checks passed.
- Overall: 32/37 passed (86.49%), coverage 37/37, no judge errors, no critical failures. Failed cases: 102,112,114,309,312.
- Actual playbook references: 29/37 cases; 43 selector API calls; zero selector errors.
- Author-documented limit remains: the parser drops Question sections in 302,303,308,312.
- This run assesses the integrated agent. It has no paired baseline and cannot establish a causal improvement from playbooks. These are development-set results, not organiser scores.
