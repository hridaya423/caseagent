import { clear, formatWhen, h, num } from "./dom.js";
import { icon } from "./icons.js";
import { caseHref } from "./routes.js";
import { empty, pill, STATUS } from "./ui.js";

// The run page: a status bar whose legend is the filter, then every case in one table.

export const FILTERS = [
  { id: "all", label: "All cases", test: () => true },
  { id: "escalated", label: "Need a person", icon: "person", test: (c) => c.status === "escalated" },
  { id: "incomplete", label: "Incomplete", icon: "alert", test: (c) => c.status === "incomplete" },
  { id: "hold", label: "On hold", icon: "pause", test: (c) => c.status === "hold" },
  { id: "closed", label: "Closed", icon: "check", test: (c) => c.status === "closed" },
  { id: "guarded", label: "Hit a guard", icon: "shield", test: (c) => c.refused > 0 },
];
const BAR_ORDER = ["escalated", "incomplete", "hold", "closed", "open"];

export const filterById = (id) => FILTERS.find((f) => f.id === id) ?? FILTERS[0];

export function matches(c, filter, query) {
  const q = query.trim().toLowerCase();
  return filterById(filter).test(c) && (!q || [c.caseId, c.title, c.property, c.next].some((s) => s.toLowerCase().includes(q)));
}

/** A run's display name: process evals by kind, batches by folder. */
export const runName = (run) => (run.kind === "eval" ? "Process eval" : run.label);

/** The cases a filter and search leave, in table order; the case page steps through the same list. */
export const visibleCases = (view, filter, query) => view.cases.filter((c) => matches(c, filter, query));

function overview(view, filter, onFilter) {
  const { cases } = view;
  const count = (test) => cases.filter(test).length;
  const bar = BAR_ORDER.filter((s) => cases.some((c) => c.status === s)).map((s) => {
    const n = count((c) => c.status === s);
    return h("i", { "data-tone": s, style: `flex: ${n}`, title: `${STATUS[s].label}: ${n}` });
  });
  return h("section", { class: "card overview", "aria-label": "Status" },
    bar.length > 0 && h("div", { class: "bar", "aria-hidden": "true" }, bar),
    h("div", { class: "filters", role: "group", "aria-label": "Filter cases" }, FILTERS.map((f) => {
      const n = count(f.test);
      return h("button", {
        class: "filter", type: "button", "data-tone": f.id, "aria-pressed": String(f.id === filter), disabled: n === 0 && f.id !== filter,
        onclick: () => onFilter(f.id === filter ? "all" : f.id),
      }, f.icon && icon(f.icon), f.label, h("b", null, num(n)));
    })));
}

// A process eval sample stops after one action, so its status is that action rather than "open".
const statusCell = (kind, c) => (kind === "eval" && c.status === "open" ? h("span", "chip tool-chip", c.next.replace(/^One action: /, "")) : pill(c.status));

function caseRow(run, c) {
  const runId = run.id;
  const href = caseHref(runId, c.key);
  return h("tr", { onclick: (e) => { if (!e.target.closest("a")) location.hash = href; } },
    h("td", "narrow-hide", h("span", "mono muted", c.caseId)),
    h("td", null, h("a", { class: "case-link", href }, h("strong", null, c.title), c.property && h("span", null, c.property))),
    h("td", null, statusCell(run.kind, c)),
    h("td", "wide", h("div", { class: "next-cell", title: c.tag ?? c.next }, c.tag ?? c.next)),
    h("td", "num wide", num(c.actions)),
    h("td", "num narrow-hide", c.refused > 0 ? h("span", { class: "guard-count", title: `${c.refused} guard refusals` }, icon("shield"), num(c.refused)) : h("span", "muted", "–")));
}

export function mountRunPage(root, view, { filter, query, onFilter, onQuery }) {
  const { run, meta } = view;
  const sub = [meta.model, formatWhen(meta.started ?? run.updated), meta.note].filter(Boolean).join(" · ");
  const shown = visibleCases(view, filter, query);
  const typing = document.activeElement?.id === "case-search";
  const input = h("input", { id: "case-search", class: "input", type: "search", placeholder: "Search by case, title, property or next step", "aria-label": "Search cases", autocomplete: "off", value: query, oninput: () => onQuery(input.value) });
  const noun = view.cases.length === 1 ? "case" : "cases";

  const body = shown.length > 0
    ? h("div", "table-scroll", h("table", "case-table",
        h("thead", null, h("tr", null, h("th", "narrow-hide", "Case"), h("th", null, "Title"), h("th", null, "Status"), h("th", "wide", run.kind === "eval" ? "Reference" : "Next step"), h("th", "num wide", "Actions"), h("th", "num narrow-hide", "Guard"))),
        h("tbody", null, shown.map((c) => caseRow(run, c)))))
    : view.cases.length === 0
      ? empty("No cases yet", "Cases appear here as the batch finishes them.")
      : empty("No cases match", h("button", { class: "btn", type: "button", onclick: () => { onFilter("all"); onQuery(""); } }, "Clear filters"));

  clear(root,
    h("header", "page-head", h("div", null, h("h1", null, runName(run)), sub && h("p", "sub", sub))),
    overview(view, filter, onFilter),
    h("section", { class: "card cases", "aria-label": "Cases" },
      h("div", "cases-tools", input, h("p", { class: "count", role: "status" }, shown.length === view.cases.length ? `${num(shown.length)} ${noun}` : `${num(shown.length)} of ${num(view.cases.length)} ${noun}`)),
      body));
  if (typing) {
    input.focus();
    input.setSelectionRange(query.length, query.length);
  }
}
