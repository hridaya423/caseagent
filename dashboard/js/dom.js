// Tiny DOM helpers. Text always goes in as text nodes, never as HTML, because case and trace
// content is untrusted input.

/** h("div", "class", child...) or h("div", { class, onclick, ... }, child...). Null and false children are skipped. */
export function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  for (const [name, value] of Object.entries(typeof attrs === "string" ? { class: attrs } : (attrs ?? {}))) {
    if (value == null || value === false) continue;
    if (name.startsWith("on")) el.addEventListener(name.slice(2), value);
    else el.setAttribute(name, value === true ? "" : value);
  }
  el.append(...children.flat(Infinity).filter((c) => c != null && c !== false));
  return el;
}

export const clear = (el, ...children) => el.replaceChildren(...children.flat(Infinity).filter(Boolean));

export const num = (n) => Number(n ?? 0).toLocaleString("en-GB");

const DATE = { day: "numeric", month: "short" };
const TIME = { hour: "2-digit", minute: "2-digit", second: "2-digit" };

export function formatWhen(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : `${d.toLocaleDateString("en-GB", DATE)}, ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}
export const formatClock = (when) => (Number.isNaN(new Date(when).getTime()) ? "" : new Date(when).toLocaleTimeString("en-GB", TIME));

/** Case timestamps look like "2026-11-29 05:07:59 UTC". */
export function formatEventTime(at) {
  const d = new Date(at.replace(" UTC", "Z").replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? at : `${d.toLocaleDateString("en-GB", DATE)}, ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })}`;
}

export const sentence = (snake) => snake.replaceAll("_", " ").replace(/^./, (c) => c.toUpperCase());

/**
 * Turns "[event 007]" in the agent's own words into a button that opens that event. Without a
 * history to open, the reference stays plain text.
 */
export function withEventLinks(text, openEvent) {
  return String(text)
    .split(/(\[event \d+\])/gi)
    .map((part) => {
      const n = part.match(/^\[event (\d+)\]$/i)?.[1];
      if (n === undefined) return part;
      const label = `event ${String(Number(n)).padStart(3, "0")}`;
      return openEvent
        ? h("button", { class: "ref", type: "button", "aria-label": `Open ${label}`, onclick: () => openEvent(Number(n)) }, label)
        : h("span", "ref", label);
    });
}

export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
