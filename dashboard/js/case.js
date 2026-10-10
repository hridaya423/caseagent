import { clear, formatClock, formatEventTime, h, num, reducedMotion, sentence, withEventLinks } from "./dom.js";
import { icon } from "./icons.js";
import { renderMarkdown } from "./markdown.js";
import { badge, pill, STATUS } from "./status.js";

// One case: the decision (or handover) first, then tabs for what the agent did, what it was allowed to see,
// the files it wrote and the raw trace.

// Ending a run is already shown by the decision above, so a finished end action repeats only its reason.
const END_TOOLS = new Set(["hold", "escalate", "close_case"]);
const upperFirst = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const pad = (n) => String(n).padStart(3, "0");
const seenLabel = (view) => (view.seen ? `at event ${pad(view.seen)}` : "before the first event");
const plural = (n, word) => `${num(n)} ${word}${n === 1 ? "" : "s"}`;
const empty = (title, body) => h("div", "empty", h("h3", null, title), body && h("p", null, body));

// ---------- decision ----------

function fieldRows(rows, link) {
  return h("dl", "fields", rows.filter(([, value]) => value).map(([label, value, key]) =>
    h("div", { class: `field-row${key ? " key" : ""}` }, h("dt", null, label), h("dd", null, withEventLinks(value, link)))));
}

// The handover is the product's answer to "when should a person step in", so it leads the case.
function decisionContent(view) {
  const { final, decision } = view;
  if (!final) return { title: "No saved state", rows: [["Note", "This case has no state file in this run."]] };
  switch (final.kind) {
    case "escalated":
      return final.by === "agent"
        ? { title: "Handed over to a person", rows: [["Checked", final.checked], ["Missing or in conflict", final.missing_or_conflict], ["Decision needed", final.decision_needed, true]] }
        : { title: "The agent did not finish", rows: [["What happened", final.summary], ["Next step", decision.next]] };
    case "hold":
      return { title: final.reason, rows: [["Next step", decision.next], ["Why", decision.why]] };
    case "closed": {
      const c = final.checks;
      return { title: `Closed: ${sentence(c.outcome).toLowerCase()}`, rows: [["Confirmed by", c.work_confirmed_by], ["Landlord informed", c.landlord_informed ? "Yes" : "No"], ["Keys", sentence(c.keys)], ["Invoice", sentence(c.invoice)], ["Why", decision.why]] };
    }
    default:
      return { title: view.runKind === "eval" ? "Single-step sample" : "Stopped before an end action", rows: [["Next step", decision.next]] };
  }
}

function decisionPanel(view, link) {
  const { title, rows } = decisionContent(view);
  return h("section", { class: "decision", "data-tone": view.status, "aria-label": "Decision" },
    h("h3", "decision-title", icon(STATUS[view.status].icon), title),
    fieldRows(rows, link));
}

function statsStrip(view) {
  const last = view.events?.at(-1)?.n;
  const count = (outcome) => view.actions.filter((a) => a.outcome === outcome).length;
  const stats = [
    ["Runs", num(view.runs.length)],
    ["Agent saw up to", view.final ? `${view.seen ? `event ${pad(view.seen)}` : "no events"}${last ? ` of ${pad(last)}` : ""}` : "n/a"],
    ["Actions", num(view.actions.length)],
    ["Guard refusals", num(count("refused"))],
    ["Failed", num(count("failed"))],
    ["Tokens", num(view.tokens)],
  ];
  return h("dl", "stats", stats.map(([label, value]) => h("div", "stat", h("dt", null, label), h("dd", null, value))));
}

// ---------- agent actions ----------

function argList(input, link) {
  const { reason: _reason, ...args } = input;
  const rows = Object.entries(args);
  const quotes = rows.filter(([k]) => k === "text");
  const fields = rows.filter(([k]) => k !== "text");
  const show = (v) => (typeof v === "string" ? withEventLinks(v, link) : JSON.stringify(v));
  return [
    ...quotes.map(([, v]) => h("p", "quote", show(v))),
    fields.length > 0 && h("dl", "args", fields.map(([k, v]) => [h("dt", null, sentence(k)), h("dd", null, show(v))])),
  ];
}

function callout(a) {
  if (a.outcome === "ok") return null;
  const title = { refused: "Guard", failed: "Failed", skipped: "Not run" }[a.outcome];
  return h("div", { class: "callout", "data-tone": a.outcome }, h("b", null, title), h("span", null, upperFirst(a.result.replace(/^refused: /, ""))));
}

function actionCard(a, link) {
  return h("li", { class: "action", "data-tone": a.outcome },
    h("div", "action-head", h("span", "tool", a.tool), badge(a.outcome), a.recovered && h("span", "recovered", "The agent corrected this and tried again.")),
    a.input.reason && h("p", "why", h("b", null, "Why: "), withEventLinks(a.input.reason, link)),
    !(a.ok && END_TOOLS.has(a.tool)) && argList(a.input, link),
    callout(a));
}

function actionsPanel(view, link) {
  if (view.actions.length === 0) return empty("No actions yet", "The agent has not acted on this case in this run.");
  const runs = view.runs.length > 0 ? view.runs : [...new Set(view.actions.map((a) => a.run))].map((run) => ({ run }));
  return runs.map(({ run, seen }) => {
    const actions = view.actions.filter((a) => a.run === run);
    return h("section", "run-group",
      h("h3", null, `Run ${run}`, seen != null && h("span", null, `read up to event ${pad(seen)}`)),
      actions.length > 0 ? h("ul", "actions", actions.map((a) => actionCard(a, link))) : h("p", "muted", "No actions recorded in this run."));
  });
}

// ---------- history and the cut ----------

const HIDDEN = { own: "Hidden: agency's own record", future: "Hidden" };

function eventItem(e) {
  const hidden = HIDDEN[e.view];
  return h("details", { class: "event", id: `ev-${e.n}`, "data-view": e.view },
    h("summary", null,
      h("span", "event-n mono", pad(e.n)),
      h("span", "event-line", h("span", null, formatEventTime(e.at)), h("span", "chip", e.channel), h("span", null, `${e.from} to ${e.to}`),
        hidden && h("span", "chip", icon("eyeOff"), ` ${hidden}`)),
      h("span", "event-headline", e.headline)),
    h("div", "event-body", h("pre", null, e.body), e.attachments.length > 0 && h("p", "files", `Attachments: ${e.attachments.join(", ")}`)));
}

function historyGroups(view) {
  const events = view.events;
  const runs = view.runs.length > 0 ? view.runs : [{ run: 0, seen: Infinity }];
  let from = 0;
  const groups = runs.map(({ run, seen }) => {
    const group = { run, events: events.filter((e) => e.n > from && e.n <= seen) };
    from = seen;
    return group;
  });
  return { groups, future: events.filter((e) => e.n > from) };
}

function historyPanel(view) {
  if (!view.events) return empty("No history to show", "The case folder was not found. Start the dashboard with --cases <folder> to point it at the cases.");
  const { groups, future } = historyGroups(view);
  const cut = view.final
    ? h("div", "cut",
        h("b", null, icon("eyeOff"), `The agent's view ends ${seenLabel(view)}`),
        h("span", "muted", future.length > 0 ? `${plural(future.length, "later event")} never reached it.` : "Nothing was hidden: it saw the whole history."))
    : null;
  return [
    view.loadWarnings.length > 0 && h("p", { class: "callout", "data-tone": "hold" }, `Loader notes: ${view.loadWarnings.join("; ")}`),
    view.request && h("div", "request", h("p", "eyebrow", "What the agent was first given"), h("p", "quote", view.request)),
    h("div", "legend", h("span", null, h("i", "swatch"), "Seen by the agent"), h("span", null, h("i", "swatch hidden"), "Hidden from the agent")),
    groups.map((g) =>
      h("section", "events",
        g.run > 0 && h("h3", "group-head", `Run ${g.run}`, h("span", null, g.events.length ? `events ${pad(g.events[0].n)} to ${pad(g.events.at(-1).n)}` : "no new events")),
        g.events.map(eventItem))),
    cut,
    future.length > 0 && h("section", "events", future.map(eventItem)),
  ];
}

// ---------- files and trace ----------

const filePanel = (field, name) => (view) =>
  view[field] ? renderMarkdown(view[field]) : empty(`No ${name}`, `This run did not write ${name} for the case.`);

function tracePanel(view) {
  if (view.trace.length === 0) return empty("No trace", "No trace was recorded for this case.");
  const step = (r) =>
    h("details", { class: "step", "data-kind": r.kind, "data-ok": r.ok == null ? null : String(r.ok) },
      h("summary", null, h("span", "step-t mono", formatClock(r.t)), h("i", "dot"), h("span", null, r.label), h("span", "step-t mono", r.tokens ? `${num(r.tokens)} tok` : "")),
      r.detail && h("pre", null, r.detail));
  return [...new Set(view.trace.map((r) => r.run))].map((run) =>
    h("section", "run-group",
      h("h3", null, run > 0 ? `Run ${run}` : "Before the first run"),
      h("div", "trace", view.trace.filter((r) => r.run === run).map(step))));
}

// ---------- tabs ----------

const TABS = [
  { id: "actions", label: "Agent actions", count: (v) => v.actions.length, render: actionsPanel },
  { id: "history", label: "History and cut", render: historyPanel },
  { id: "answer", label: "ANSWER.md", render: filePanel("answer", "ANSWER.md") },
  { id: "reasoning", label: "REASONING.md", render: filePanel("reasoning", "REASONING.md") },
  { id: "trace", label: "Trace", count: (v) => v.trace.length, render: tracePanel },
];
export const TAB_IDS = TABS.map((t) => t.id);

export function mountCase(root, view, { tab, onTab }) {
  const panel = h("div", { class: "panel", role: "tabpanel", tabindex: "0" });
  let current = TAB_IDS.includes(tab) ? tab : "actions";

  const reveal = (n) => {
    const item = panel.querySelector(`#ev-${n}`);
    if (!item) return;
    item.open = true;
    item.scrollIntoView({ block: "center", behavior: reducedMotion() ? "auto" : "smooth" });
    item.classList.add("flash");
    item.querySelector("summary").focus({ preventScroll: true });
  };
  const link = view.events ? (n) => { select("history"); reveal(n); } : null;

  const buttons = TABS.map((t, i) =>
    h("button", {
      class: "tab", role: "tab", type: "button", id: `tab-${t.id}`, "aria-controls": "case-panel",
      onclick: () => select(t.id),
      onkeydown: (e) => {
        const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: TABS.length - 1 }[e.key];
        if (next === undefined) return;
        e.preventDefault();
        const target = (next + TABS.length) % TABS.length;
        select(TABS[target].id);
        buttons[target].focus();
      },
    }, t.label, t.count && h("span", "tab-n", num(t.count(view)))));
  panel.id = "case-panel";

  function select(id) {
    current = id;
    TABS.forEach((t, i) => {
      buttons[i].setAttribute("aria-selected", String(t.id === id));
      buttons[i].tabIndex = t.id === id ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", `tab-${id}`);
    clear(panel, TABS.find((t) => t.id === id).render(view, link));
    onTab(id);
  }

  clear(root, h("article", "card case",
    h("header", "case-head",
      h("p", "eyebrow", [`Case ${view.caseId}`, view.role && `reported by ${view.role.toLowerCase()}`, view.property].filter(Boolean).join(" · ")),
      h("div", "case-title-row", h("h2", null, view.title), pill(view.status), view.tag && h("span", "chip", view.tag))),
    decisionPanel(view, link),
    statsStrip(view),
    h("div", { class: "tabs", role: "tablist", "aria-label": "Case sections" }, buttons),
    panel));
  select(current);
}
