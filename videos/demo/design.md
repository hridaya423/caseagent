# case-agent demo: design

The video looks like the dashboard it records (`dashboard/DESIGN.md`): light, quiet, one accent.
Screen recordings carry the story. The motion layer is limited to a title card, one explainer card,
a frame around each recording with a step label, captions and an end card.

## Colors (the dashboard tokens)

| Token | Value | Use |
|---|---|---|
| neutral | #f4f5f7 | page background |
| surface | #ffffff | cards, the recording window |
| sunken | #f7f8fa | quotes, code chips |
| ink | #111827 | headings, captions |
| ink-secondary | #3f4856 | body text |
| ink-muted | #5f6977 | labels |
| line | #e5e8ec | hairlines |
| primary | #1f5fae | step numbers, links |
| status-escalated | #6142b8 | the added sentence, the escalation |

Elevation is the dashboard's one shadow: `0 0 0 1px rgb(17 24 39 / 0.07), 0 1px 2px rgb(17 24 39 / 0.05), 0 4px 12px rgb(17 24 39 / 0.04)`, scaled up for the recording window.

## Type

- Inter (bundled; the dashboard's system-ui renders close to it): titles 700, body 400.
- JetBrains Mono (bundled): commands and event numbers.
- Sizes: title 88px, card heading 44px, body 26-30px, labels 20px, captions 32px.

## Layout

- Recording window: 1536 x 864 at (192, 112), 16 px radius. Record the screen at 1920 x 1080.
- Step label above the window at y 52. Captions below it, centred at y 1030.
- Everything stays inside the title-safe box.

## Motion

- Fades and 16 px rises, 0.4-0.5 s, power3.out. One highlight sweep on the added sentence.
- Hard cuts between sections. No camera moves.
