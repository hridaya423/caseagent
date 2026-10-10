import { h, withEventLinks } from "./dom.js";
import { icon } from "./icons.js";

// The dashboard's shared components. Surfaces build from these instead of styling their own versions.

// How a case ends, in the words an agency uses. "escalated" is the agent handing the case to a person;
// "incomplete" is the system doing it because the agent did not finish.
export const STATUS = {
  escalated: { label: "Needs a person", icon: "person" },
  incomplete: { label: "Incomplete", icon: "alert" },
  hold: { label: "On hold", icon: "pause" },
  closed: { label: "Closed", icon: "check" },
  open: { label: "Open", icon: "circle" },
};

// What happened to one tool call. A refusal is a guard doing its job, so it is not drawn as an error.
export const OUTCOME = {
  ok: { label: "Done", icon: "check" },
  refused: { label: "Guard refused", icon: "shield" },
  failed: { label: "Failed", icon: "cross" },
  skipped: { label: "Not run", icon: "ban" },
};

const toned = (cls, tone, meta) => h("span", { class: cls, "data-tone": tone }, icon(meta.icon), meta.label);

export const pill = (status) => toned("pill", status, STATUS[status]);
export const badge = (outcome) => toned("badge", outcome, OUTCOME[outcome]);

export const chip = (...children) => h("span", "chip", children);

/** Label and value rows. A row is [label, value, emphasise?]; empty values are left out. */
export function fields(rows, openEvent) {
  return h("dl", "fields", rows.filter(([, value]) => value).map(([label, value, key]) =>
    h("div", { class: key ? "key" : null }, h("dt", null, label), h("dd", null, withEventLinks(value, openEvent)))));
}

export const callout = (tone, title, text) => h("div", { class: "callout", "data-tone": tone }, title && h("b", null, title), h("span", null, text));

/** A titled empty state; string lines become paragraphs, nodes (a button, a code sample) go in as they are. */
export const empty = (title, ...lines) => h("div", "empty", h("h3", null, title), lines.map((l) => (typeof l === "string" ? h("p", null, l) : l)));

export const skeleton = (rows) => h("div", { class: "skeleton", "aria-hidden": "true" }, Array.from({ length: rows }, () => h("i")));
