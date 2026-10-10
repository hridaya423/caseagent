import { clear, formatClock, formatEventTime, h, num, reducedMotion, sentence, withEventLinks } from "./dom.js";
import { icon } from "./icons.js";
import { renderMarkdown } from "./markdown.js";
import { badge, callout, chip, empty, fields, OUTCOME, pill, STATUS } from "./ui.js";

// The case page: what the agent did, what it was allowed to see, the files it wrote and the trace on the
// left; the decision (or handover) and the case details pinned on the right.

// Ending a run is already shown by the decision, so a finished end action repeats only its reason.
const END_TOOLS = new Set(["hold", "escalate", "close_case"]);
const upperFirst = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const pad = (n) => String(n).padStart(3, "0");
const plural = (n, word) => `${num(n)} ${word}${n === 1 ? "" : "s"}`;

// ---------- aside: decision and details ----------

// The handover is the product's answer to "when should a person step in", so it leads the case.
function decisionContent(view) {
  const { final, decision } = view;
  if (!final) return { title: "No saved state", rows: [["Note", "This case has no state file in this run."]] };
  switch (final.kind) {
    case "escalated":
      return final.by === "agent"
        ? { title: "Handed over to a person", rows: [["Decision needed", final.decision_needed, true], ["Missing or in conflict", final.missing_or_conflict], ["Checked", final.checked]] }
        : { title: "The agent did not finish", rows: [["What happened", final.summary], ["Next step", decision.next]] };
    case "hold":
      return { title: final.reason, rows: [["Next step", decision.next, true], ["Why", decision.why]] };
    case "closed": {
      const c = final.checks;
      return { title: `Closed: ${sentence(c.outcome).toLowerCase()}`, rows: [["Confirmed by", c.work_confirmed_by], ["Landlord informed", c.landlord_informed ? "Yes" : "No"], ["Keys", sentence(c.keys)], ["Invoice", sentence(c.invoice)], ["Why", decision.why]] };
    }
    default:
      return view.runKind === "eval"
        ? { title: "Single-step sample", rows: [["Action taken", view.actions.at(-1)?.tool ?? "none", true]] }
        : { title: "Stopped before an end action", rows: [["Next step", decision.next, true]] };
  }
}

function decisionCard(view, link) {
  const { title, rows } = decisionContent(view);
  return h("section", { class: "card decision", "data-tone": view.status, "aria-label": "Decision" },
    h("p", "section-title", "Decision"),
    h("h2", null, h("span", "tone-icon", icon(STATUS[view.status].icon)), title),
    fields(rows, link));
}

function detailsCard(view) {
  const last = view.events?.at(-1)?.n;
  const refused = view.actions.filter((a) => a.outcome === "refused").length;
  const saw = view.final ? `${view.seen ? `Up to event ${pad(view.seen)}` : "No events"}${last ? ` of ${pad(last)}` : ""}` : "";
  return h("section", { class: "card details", "aria-label": "Case details" }, fields([
    ["Property", view.property],
    ["Reported by", view.role],
    ["The agent saw", saw],
    ["Activity", [plural(view.runs.length, "run"), plural(view.actions.length, "action"), refused > 0 && plural(refused, "guard refusal")].filter(Boolean).join(" · ")],
  ]));
}

// ---------- actions ----------

function argList(input, link) {
  const { reason: _reason, to, channel, text, ...rest } = input;
  const show = (v) => (typeof v === "string" ? withEventLinks(v, link) : JSON.stringify(v));
  const entries = Object.entries(rest);
  return [
    to && h("p", "note", channel ? `${sentence(String(channel))} to the ${to}` : `To the ${to}`),
    text && h("p", "quote", show(text)),
    entries.length > 0 && h("dl", "args", entries.map(([k, v]) => [h("dt", null, sentence(k)), h("dd", null, show(v))])),
  ];
}

const RESULT_TITLE = { refused: "Guard", failed: "Failed", skipped: "Not run" };

function actionItem(a, link) {
  return h("li", { class: "action", "data-tone": a.outcome },
    h("span", { class: "action-node", "aria-hidden": "true" }, icon(OUTCOME[a.outcome].icon)),
    h("div", "action-head", h("span", "tool", a.tool), a.outcome !== "ok" && badge(a.outcome), a.recovered && h("span", "note", "Corrected on the next try")),
    a.input.reason && h("p", "why", withEventLinks(a.input.reason, link)),
    !(a.ok && END_TOOLS.has(a.tool)) && argList(a.input, link),
    a.outcome !== "ok" && callout(a.outcome, RESULT_TITLE[a.outcome], upperFirst(a.result.replace(/^refused: /, ""))));
}

function actionsPanel(view, link) {
  if (view.actions.length === 0) return empty("No actions yet", "The agent has not acted on this case in this run.");
  const runs = view.runs.length > 0 ? view.runs : [...new Set(view.actions.map((a) => a.run))].map((run) => ({ run }));
  return runs.map(({ run, seen }) => {
    const actions = view.actions.filter((a) => a.run === run);
    return h("section", "group",
      h("h3", "group-head", `Run ${run}`, seen != null && h("span", null, `read up to event ${pad(seen)}`)),
      actions.length > 0 ? h("ol", "actions", actions.map((a) => actionItem(a, link))) : h("p", "muted", "No actions recorded in this run."));
  });
}

// ---------- history and the cut ----------

const HIDDEN = { own: "Hidden: agency's own record", future: "Hidden" };

function eventItem(e) {
  const hidden = HIDDEN[e.view];
  return h("details", { class: "row event", id: `ev-${e.n}`, "data-view": e.view },
    h("summary", null,
      h("span", "event-n mono", pad(e.n)),
      h("span", "event-meta", h("span", null, formatEventTime(e.at)), chip(e.channel), h("span", null, `${e.from} to ${e.to}`), hidden && chip(icon("eyeOff"), hidden)),
      h("span", "event-headline", e.headline)),
    h("div", "event-body", h("pre", null, e.body), e.attachments.length > 0 && h("p", "note", `Attachments: ${e.attachments.join(", ")}`)));
}

function historyPanel(view) {
  if (!view.events) return empty("No history to show", "The case folder was not found. Start the dashboard with --cases <folder>.");
  const runs = view.runs.length > 0 ? view.runs : [{ run: 0, seen: Infinity }];
  let from = 0;
  const groups = runs.map(({ run, seen }) => {
    const group = { run, events: view.events.filter((e) => e.n > from && e.n <= seen) };
    from = seen;
    return group;
  });
  const future = view.events.filter((e) => e.n > from);
  return [
    view.loadWarnings.length > 0 && callout("hold", "Loader notes", view.loadWarnings.join("; ")),
    view.request && h("section", "group", h("h3", "group-head", "Initial request"), h("p", "quote", view.request)),
    h("div", "legend", h("span", null, h("i", "swatch"), "Seen by the agent"), h("span", null, h("i", "swatch hidden"), "Hidden from the agent")),
    groups.map((g) =>
      h("section", "group",
        g.run > 0 && h("h3", "group-head", `Run ${g.run}`, h("span", null, g.events.length ? `events ${pad(g.events[0].n)} to ${pad(g.events.at(-1).n)}` : "no new events")),
        h("div", "events", g.events.map(eventItem)))),
    view.final && h("div", "cut",
      h("b", null, icon("eyeOff"), view.seen ? `The agent's view ends at event ${pad(view.seen)}` : "The agent saw no events"),
      h("span", "muted", future.length > 0 ? `${plural(future.length, "later event")} never reached it` : "It saw the whole history")),
    future.length > 0 && h("div", "events", future.map(eventItem)),
  ];
}

// ---------- files and trace ----------

const filePanel = (field, name) => (view) =>
  view[field] ? renderMarkdown(view[field]) : empty(`No ${name}`, `This run did not write ${name} for the case.`);

function tracePanel(view) {
  if (view.trace.length === 0) return empty("No trace", "No trace was recorded for this case.");
  const step = (r) =>
    h("details", { class: "row step", "data-kind": r.kind, "data-ok": r.ok == null ? null : String(r.ok) },
      h("summary", null, h("span", "mono muted", formatClock(r.t)), h("i", "dot"), h("span", null, r.label), h("span", "mono muted", r.tokens ? `${num(r.tokens)} tok` : "")),
      r.detail && h("pre", null, r.detail));
  return [...new Set(view.trace.map((r) => r.run))].map((run) =>
    h("section", "group",
      h("h3", "group-head", run > 0 ? `Run ${run}` : "Before the first run"),
      h("div", "trace", view.trace.filter((r) => r.run === run).map(step))));
}

// ---------- page ----------

const TABS = [
  { id: "actions", label: "Actions", count: (v) => v.actions.length, render: actionsPanel },
  { id: "history", label: "History", count: (v) => v.events?.length ?? 0, render: historyPanel },
  { id: "answer", label: "Answer", render: filePanel("answer", "ANSWER.md") },
  { id: "reasoning", label: "Reasoning", render: filePanel("reasoning", "REASONING.md") },
  { id: "trace", label: "Trace", count: (v) => v.trace.length, render: tracePanel },
];

function crumbs({ backHref, backLabel, position, total, prevHref, nextHref }) {
  const step = (href, label, name) => h("a", { class: "btn square", href: href ?? "#", "aria-label": label, "aria-disabled": href ? null : "true", tabindex: href ? null : "-1" }, icon(name));
  return h("div", "crumbs",
    h("nav", { "aria-label": "Breadcrumb" }, h("a", { href: backHref }, icon("arrowLeft"), backLabel)),
    position > 0 && h("div", "stepper", h("span", null, `${num(position)} of ${num(total)}`), step(prevHref, "Previous case", "chevronLeft"), step(nextHref, "Next case", "chevronRight"), h("span", { class: "visually-hidden" }, "Keys J and K also move between cases")));
}

/** Draws one case into root. nav carries the breadcrumb target and the neighbouring cases in the run's table order. */
export function mountCase(root, view, { tab, onTab, nav }) {
  const panel = h("div", { class: "panel", role: "tabpanel", id: "case-panel", tabindex: "0" });
  const ids = TABS.map((t) => t.id);
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
    }, t.label, t.count && t.count(view) > 0 && h("span", "tab-n", num(t.count(view)))));

  function select(id) {
    TABS.forEach((t, i) => {
      buttons[i].setAttribute("aria-selected", String(t.id === id));
      buttons[i].tabIndex = t.id === id ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", `tab-${id}`);
    clear(panel, TABS.find((t) => t.id === id).render(view, link));
    onTab(id);
  }

  const showPill = !(view.runKind === "eval" && view.status === "open");
  clear(root,
    crumbs(nav),
    h("header", "case-head",
      h("p", "eyebrow", `Case ${view.caseId}`),
      h("div", "case-title", h("h1", null, view.title), showPill && pill(view.status), view.tag && chip(view.tag))),
    h("div", "case-layout",
      h("section", { class: "card", "aria-label": "Case activity" }, h("div", { class: "tabs", role: "tablist", "aria-label": "Case sections" }, buttons), panel),
      h("aside", "aside", decisionCard(view, link), detailsCard(view))));
  select(ids.includes(tab) ? tab : "actions");
}
