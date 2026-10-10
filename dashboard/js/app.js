import { casePath, getJson, runPath } from "./api.js";
import { mountCase } from "./case.js";
import { clear, formatClock, formatWhen, h } from "./dom.js";
import { icon } from "./icons.js";
import { filterById, mountRunPage, runName, visibleCases } from "./overview.js";
import { caseHref, parseRoute, runHref } from "./routes.js";
import { empty, skeleton } from "./ui.js";

const POLL_MS = 5000;
const $ = (id) => document.getElementById(id);
const els = { select: $("run-select"), live: $("live"), reload: $("reload"), banner: $("banner"), page: $("page") };

// The route says where the reader is; everything else is data fetched for it.
const state = { route: parseRoute(), runs: [], runId: null, view: null, caseView: null, query: "" };
// The last payload drawn, so a poll that finds nothing new redraws nothing.
let drawn = "";
// Bumped by every load, so a request that started earlier never overwrites a later one.
let epoch = 0;

function setLive(ok, text) {
  els.live.dataset.state = ok ? "ok" : "error";
  clear(els.live, h("span", "dot"), h("span", null, text));
}

function showError(message) {
  clear(els.banner, h("span", null, message), h("button", { class: "btn", type: "button", onclick: () => load(true) }, "Retry"));
  els.banner.hidden = false;
  setLive(false, "Offline");
}

// ---------- drawing ----------

function drawRunPicker() {
  clear(els.select, state.runs.map((r) => h("option", { value: r.id, selected: r.id === state.runId }, `${runName(r)} · ${formatWhen(r.updated)}`)));
  els.select.disabled = state.runs.length === 0;
}

const filter = () => filterById(state.route.filter).id;

function drawRun() {
  document.title = `${runName(state.view.run)} · Case Agent`;
  mountRunPage(els.page, state.view, {
    filter: filter(),
    query: state.query,
    onFilter: (f) => { history.replaceState(null, "", runHref(state.runId, f)); state.route = parseRoute(); drawRun(); },
    onQuery: (q) => { state.query = q; drawRun(); },
  });
}

// Prev and next follow the table the reader came from: same filter, same search.
function neighbours(key) {
  const list = visibleCases(state.view, filter(), state.query);
  const at = list.findIndex((c) => c.key === key);
  const hrefOf = (c) => c && caseHref(state.runId, c.key, state.route.tab);
  return { position: at + 1, total: list.length, prevHref: hrefOf(list[at - 1]), nextHref: hrefOf(list[at + 1]) };
}

function drawCase() {
  const view = state.caseView;
  document.title = `${view.caseId} ${view.title} · Case Agent`;
  mountCase(els.page, view, {
    tab: state.route.tab,
    onTab: (tab) => { history.replaceState(null, "", caseHref(state.runId, view.key, tab)); state.route = parseRoute(); },
    nav: { backHref: runHref(state.runId, filter()), backLabel: runName(state.view.run), ...neighbours(view.key) },
  });
}

function draw() {
  drawRunPicker();
  if (state.route.caseKey && state.caseView) drawCase();
  else if (state.route.caseKey) clear(els.page, h("div", "card", empty("Case not found", "This run has no case with that key.", h("a", { class: "btn", href: runHref(state.runId) }, "Back to the run"))));
  else drawRun();
}

// ---------- loading ----------

/** Fetches what the current route needs and redraws if any of it changed. */
async function load(force = false) {
  const mine = ++epoch;
  const route = state.route;
  try {
    const runs = await getJson("runs");
    if (mine !== epoch) return;
    if (runs.length === 0) {
      state.runs = [];
      drawRunPicker();
      clear(els.page, h("div", "card", empty("No runs found", "Run a batch, then it shows up here:", h("code", null, "npm run reality -- <cases-folder> --out runs/reality"))));
      return;
    }
    const runId = runs.some((r) => r.id === route.runId) ? route.runId : runs[0].id;
    const view = await getJson(runPath(runId));
    const caseView = route.caseKey && view.cases.some((c) => c.key === route.caseKey) ? await getJson(casePath(runId, route.caseKey)) : null;
    if (mine !== epoch) return;

    Object.assign(state, { runs, runId, view, caseView });
    const payload = JSON.stringify([route, runs, view, caseView]);
    if (force || payload !== drawn) {
      drawn = payload;
      draw();
    }
    els.banner.hidden = true;
    setLive(true, `Live · ${formatClock(new Date())}`);
  } catch (e) {
    if (mine === epoch) showError(e.message);
  }
}

window.addEventListener("hashchange", () => {
  const before = state.route;
  state.route = parseRoute();
  if (before.runId !== state.route.runId) state.query = "";
  // Every hash change redraws: whatever load finishes first, it must not skip the draw as "unchanged".
  drawn = "";
  if (before.caseKey !== state.route.caseKey || before.runId !== state.route.runId) {
    clear(els.page, h("div", "card", skeleton(8)));
    scrollTo({ top: 0 });
  }
  load();
});

els.select.addEventListener("change", () => { location.hash = runHref(els.select.value); });
els.reload.append(icon("refresh"));
els.reload.addEventListener("click", () => load(true));

// J and K step through cases, like a mail client, unless the reader is typing.
document.addEventListener("keydown", (e) => {
  if (!state.route.caseKey || e.metaKey || e.ctrlKey || e.altKey || e.target.closest?.("input, select, textarea")) return;
  const { prevHref, nextHref } = neighbours(state.route.caseKey);
  const target = { j: nextHref, k: prevHref }[e.key];
  if (target) location.hash = target;
});

setInterval(() => { if (!document.hidden) load(); }, POLL_MS);

clear(els.page, h("div", "card", skeleton(10)));
load();
