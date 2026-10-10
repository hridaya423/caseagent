# case-agent

## Verify

```bash
npm test                                               # needs data/public/Property Management (see README)
npm run typecheck                                      # covers src, test and evals
python3 -I evals/reality-sim/tools/validate.py --all    # eval case format and leak check, no live model calls
```

## Layout

`src/` has five folders. Each one imports only from the folders before it in this order:

`case` (parse, messy, cut, attachments, state) <- `tools` (index, guards, evidence) <- `agent` (prompt, loop, approval) <- `runner` (process, answers, batch) <- `entry` (cli, mcp)

- The hidden-future rule lives in `src/case/cut.ts`. The dashboard reuses it to mark events the agent never saw.
- `dashboard/` is a plain HTML, CSS and ES-module page with no build step and no network requests; `npm run dashboard` serves it read-only on localhost.
- Every refusal rule lives in `src/tools/guards.ts`. Guards run before adapters.
- A system escalation (`status.by === "system"`) marks an incomplete run.
- `src/case/state.ts` defines the state as zod schemas. `state.runs` is a list of run records (`seen`, `notes`, `actions`). Use `actionLog(state)` for every action in order, with its run number and cut. `loadState` upgrades older files, including the flat `actions`/`notes` format.
- Paths built from `import.meta.url` are relative to the file's folder. `src/runner/process.ts` reads `../../policy.md`.
