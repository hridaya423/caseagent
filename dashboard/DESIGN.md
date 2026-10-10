---
version: alpha
name: Case Agent Runs
description: Read-only dashboard an agency uses to review what the case agent did on every run.
colors:
  primary: "#1f5fae"
  on-primary: "#ffffff"
  neutral: "#f4f5f7"
  surface: "#ffffff"
  sunken: "#f7f8fa"
  ink: "#111827"
  ink-secondary: "#3f4856"
  ink-muted: "#5f6977"
  line: "#e5e8ec"
  line-strong: "#cfd5dd"
  status-closed: "#17784a"
  status-hold: "#8f5400"
  status-escalated: "#6142b8"
  status-incomplete: "#b42318"
typography:
  title:
    fontFamily: system-ui
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.02em
  heading:
    fontFamily: system-ui
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: system-ui
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  meta:
    fontFamily: system-ui
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: system-ui
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
  code:
    fontFamily: ui-monospace
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: 6px
  md: 8px
  lg: 12px
  full: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  2xl: 32px
  3xl: 48px
components:
  page:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.ink}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
  divider:
    backgroundColor: "{colors.line}"
    height: 1px
  button-outline:
    backgroundColor: "{colors.line-strong}"
    height: 1px
  search-input:
    backgroundColor: "{colors.sunken}"
    rounded: "{rounded.md}"
  action-reason:
    textColor: "{colors.ink-secondary}"
  meta-text:
    textColor: "{colors.ink-muted}"
    typography: "{typography.meta}"
  pill-closed:
    textColor: "{colors.status-closed}"
  pill-hold:
    textColor: "{colors.status-hold}"
  pill-escalated:
    textColor: "{colors.status-escalated}"
  pill-incomplete:
    textColor: "{colors.status-incomplete}"
  filter:
    height: 32px
    rounded: "{rounded.full}"
  event-link:
    textColor: "{colors.primary}"
    typography: "{typography.code}"
  skip-link:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  pill:
    rounded: "{rounded.full}"
    typography: "{typography.label}"
  tab-selected:
    textColor: "{colors.ink}"
---

# Case Agent Runs

## Overview

An operations screen, not a report, in light mode only. The reader is an agency lead checking which cases need them and why the agent did what it did. Two pages: a run (every case in one table) and a case (its activity beside a pinned decision). It should feel calm and exact: white cards on a cool grey page, generous spacing, the decision before the detail. Values speak without labels where they are self-evident (a model name, a date); numbers that do not change a decision are left out.

## Colors

Neutral surfaces carry structure. Colour has exactly two jobs.

- **Primary (#1f5fae):** interaction only: focus rings, the selected filter and tab, links, event references. Static text is never primary.
- **Status hues:** closed green, on-hold amber, escalated violet, incomplete red. Each always travels with its icon and a label, so colour is never the only signal. A guard refusal uses the escalated violet because it is the harness working, not an error; a failed call uses the incomplete red.
- Pills and badges put the status hue as text on a 10% tint of itself; every pair measures above 4.5:1.

## Typography

System fonts only, so the page renders offline and records the same on any machine. Page and case titles are 24px bold; card headings 16px; body 14px; meta 12–13px. Identifiers, event numbers, times and tool names are monospace with tabular numbers.

## Layout

A sticky top bar (brand, run switcher, live state). The run page is a header, a status card (bar plus filter row) and the case table. The case page is a breadcrumb with previous and next, the case title, then a two-column grid: tabs on the left, the decision and details in a sticky 340px aside on the right. Below 1040px the aside moves above the tabs; below 560px the table drops to title and status. Spacing follows the 4px scale above; cards sit 24px apart.

## Elevation & Depth

One elevation: a hairline ring with a soft lift (`--raised`), used for cards and raised buttons, never together with a border. Inside a card, structure is a 1px `line` divider. Content the agent never saw is drawn with a diagonal hatch instead of being dimmed, so it stays readable.

## Shapes

Cards 12px, rows, inputs and buttons 8px, chips and callouts 6px, pills and filters fully round.

## Components

- **Filter:** a round button with icon, label and count; selected gets a primary inset ring on white; a filter with no cases is disabled.
- **Case table row:** case id, title with property, status pill, next step, action count, guard refusals. The whole row opens the case; the title is the keyboard link.
- **Case page:** breadcrumb back to the run with its filter, position ("4 of 10"), previous and next (also J and K), which step through the same filtered list.
- **Decision card:** first in the aside. An agent escalation leads with Decision needed (emphasised), then Missing or in conflict, then Checked.
- **Action timeline:** each tool call is a node coloured by outcome on a vertical line; a refusal adds a badge and a Guard callout with the guard's message.
- **Event row:** a disclosure row with a chevron; hidden events carry the hatch and a "Hidden" chip; a cut marker separates what the agent saw from what it did not.
- **Event link:** `[event 007]` in the agent's text becomes a small tinted monospace button that opens that event.

## Do's and Don'ts

- Do build new UI from `js/ui.js` (pill, badge, chip, fields, callout, empty, skeleton) and the tokens in `styles.css`.
- Do keep every page reachable by URL (`js/routes.js`), so back, reload and shared links land in the same place.
- Do pair every status colour with its icon and label.
- Don't add labelled metadata rows ("Type", "Code", "Tokens") to a page header; put a value in the sub line only if it changes what the reader does.
- Don't add a dark theme or load fonts, scripts or images from the network.
- Don't use the primary colour for anything that is not interactive.
