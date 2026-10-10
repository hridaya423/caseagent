import { h } from "./dom.js";
import { icon } from "./icons.js";

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

const tag = (cls, tone, meta, text) => h("span", { class: cls, "data-tone": tone }, icon(meta.icon), text ?? meta.label);

export const pill = (status, text) => tag("pill", status, STATUS[status], text);
export const badge = (outcome) => tag("badge", outcome, OUTCOME[outcome]);
