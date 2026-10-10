import { clear, formatWhen, h, num } from "./dom.js";
import { icon } from "./icons.js";
import { pill, STATUS } from "./status.js";

// The run summary (headline numbers that double as filters) and the case queue.

export const FILTERS = [
  { id: "all", label: "All cases", icon: "list", test: () => true },
  { id: "escalated", label: "Need a person", icon: "person", test: (c) => c.status === "escalated" },
  { id: "incomplete", label: "Incomplete", icon: "alert", test: (c) => c.status === "incomplete" },
  { id: "hold", label: "On hold", icon: "pause", test: (c) => c.status === "hold" },
  { id: "closed", label: "Closed", icon: "check", test: (c) => c.status === "closed" },
  { id: "guarded", label: "Hit a guard", icon: "shield", test: (c) => c.refused > 0 },
];
const TONES = { escalated: "escalated", incomplete: "incomplete", hold: "hold", closed: "closed", guarded: "guarded" };
const BAR_ORDER = ["escalated", "incomplete", "hold", "closed", "open"];

export const filterById = (id) => FILTERS.find((f) => f.id === id) ?? FILTERS[0];

export function matches(c, filter, query) {
  const q = query.trim().toLowerCase();
  return filterById(filter).test(c) && (!q || [c.caseId, c.title, c.label, c.next].some((s) => s.toLowerCase().includes(q)));
}

function metaLine(view) {
  const { run, meta, cases } = view;
  const refusals = cases.reduce((n, c) => n + c.refused, 0);
  const tokens = cases.reduce((n, c) => n + c.tokens, 0);
  const item = (label, value) => value && h("span", null, `${label} `, h("b", null, value));
  return h("p", "meta",
    item("Type", run.kind === "eval" ? "Process eval" : "Batch run"),
    item("Model", meta.model),
    item("Started", meta.started && formatWhen(meta.started)),
    item("Code", meta.revision?.slice(0, 7)),
    item("Tokens", tokens && num(tokens)),
    item("Guard refusals", num(refusals)));
}

export function renderSummary(root, view, filter, onFilter) {
  const { run, meta, cases } = view;
  const counts = Object.fromEntries(FILTERS.map((f) => [f.id, cases.filter(f.test).length]));
  const tiles = FILTERS.map((f) =>
    h("button", { class: "tile", type: "button", "data-tone": TONES[f.id], "aria-pressed": String(f.id === filter), onclick: () => onFilter(f.id === filter ? "all" : f.id) },
      icon(f.icon), h("span", "tile-n", num(counts[f.id])), h("span", "tile-l", f.label)));
  const segments = BAR_ORDER.filter((s) => cases.some((c) => c.status === s)).map((s) => {
    const n = cases.filter((c) => c.status === s).length;
    return h("i", { style: `flex: ${n}; --tone: var(--${s})`, title: `${STATUS[s].label}: ${n}` });
  });
  clear(root,
    h("div", "summary-head", h("h1", null, run.label), metaLine(view)),
    meta.note && h("p", "note", meta.note),
    h("div", { class: "tiles", role: "group", "aria-label": "Filter cases" }, tiles),
    segments.length > 0 && h("div", { class: "bar", "aria-hidden": "true" }, segments));
}

export function createQueue(root, { onSelect, onQuery }) {
  const input = h("input", { class: "input", type: "search", placeholder: "Search case, title or next step", "aria-label": "Search cases", autocomplete: "off", oninput: () => onQuery(input.value) });
  const count = h("p", { class: "queue-count", role: "status" });
  const list = h("ul", "queue-list");
  clear(root, h("div", "queue-tools", input, count), list);

  return {
    update({ cases, filter, query, selected, onClear }) {
      const shown = cases.filter((c) => matches(c, filter, query));
      count.textContent = `${num(shown.length)} of ${num(cases.length)} cases`;
      if (shown.length > 0) {
        clear(list, shown.map((c) =>
          h("li", null, h("button", { class: "queue-item", type: "button", "aria-current": String(c.key === selected), onclick: () => onSelect(c.key) },
            h("span", "queue-id mono", c.caseId),
            h("span", "queue-title", c.title),
            h("span", "queue-next", c.next),
            h("span", "queue-tags", pill(c.status), c.tag && h("span", "chip", c.tag))))));
        return;
      }
      const none = cases.length === 0;
      clear(list, h("li", "empty",
        h("h3", null, none ? "No cases in this run yet" : "No cases match"),
        !none && h("button", { class: "btn", type: "button", onclick: onClear }, "Clear filters")));
    },
  };
}
