---
message: "Same case, one sentence changed, opposite decision: case-agent reads the case and knows when to stop."
mode: autonomous
canvas: 1920x1080
duration: 60
---

# case-agent demo, 60 s

Screen recordings carry the video. The built parts are a title card, one explainer card, the frame
around each recording, captions and an end card, all in the dashboard's light design (`design.md`).
The twin card's text is generated from the case files (`tools/export-data.ts` -> `content/cases.js`).

| # | Time | What | Status |
|---|---|---|---|
| 1 | 0-5 s | Title: what case-agent is | built (`compositions/title.html`) |
| 2 | 5-13 s | Twin card: event 021 of case 110 and case 206, the added sentence highlighted | built (`compositions/twin.html`) |
| 3 | 13-22 s | Step 1: both cases run through the agent | recording `recordings/run.mp4` |
| 4 | 22-35 s | Step 2: dashboard, 110 on hold for the contractor's confirmation; 206 sends the gas SMS and escalates | recording `recordings/decision.mp4` |
| 5 | 35-43 s | Step 3: case 206's refused escalate (tool-call markup) and the clean retry | recording `recordings/guard.mp4` |
| 6 | 43-52 s | Step 4: the reality-sim run and its scorecard | recording `recordings/evals.mp4` |
| 7 | 52-60 s | End card: command, facts, repo | built (`compositions/close.html`) |

Captions: `content/captions.js`. Cues 6-7 and 9-10 describe the runs in runs/demo.

## Recording

- Screen at 1920 x 1080, browser zoom 125 % so text reads at the window's 80 % scale. Hide the bookmarks bar and other tabs.
- Dashboard: `npm run dashboard -- --runs <runs dir> --cases evals/reality-sim/cases`.
- Trim each file to its slot length and speed up waiting (say so in the caption if a run is sped up).
- Only real runs. The demo runs are in `runs/demo` (110, 206, 309, 201, 204), made with `tools/run-demo-cases.ts`. Case 206 has a real guard refusal; 309 (engineer told not to start an unapproved £620 job) is the backup for step 3.

## Dropping a recording in

1. Put the file in `recordings/` with the name above.
2. In `index.html`, uncomment its `<video>` line. It plays inside the window of its frame.
3. `npm run check`, then `npx hyperframes snapshot --at <slot midpoint>`.
