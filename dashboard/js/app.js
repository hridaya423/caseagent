import { casePath, getJson, runPath } from "./api.js";
import { mountCase } from "./case.js";
import { clear, formatClock, formatWhen, h, reducedMotion } from "./dom.js";
import { createQueue, filterById, renderSummary } from "./overview.js";

const POLL_MS = 5000;
const $ = (id) => document.getElementById(id);
const els = { select: $("run-select"), updated: $("updated"), reload: $("reload"), banner: $("banner"), summary: $("summary"), queue: $("queue"), detail: $("detail") };

const params = new URLSearchParams(location.hash.slice(1));
const state = {
  runs: [],
  runId: params.get("run"),
  view: null,
  caseKey: params.get("case"),
  caseView: null,
  filter: filterById(params.get("filter")).id,
  query: "",
  tab: params.get("tab") ?? "actions",
};
const queue = createQueue(els.queue, { onSelect: selectCase, onQuery: (q) => { state.query = q; drawQueue(); } });
// The last payload drawn for each region, so a poll that finds nothing new redraws nothing.
const drawn = { runs: "", view: "", caseView: "" };
// Bumped by every load and every choice the reader makes, so a request that started earlier never overwrites a later one.
let epoch = 0;

const skeleton = (n) => h("div", "skeleton", Array.from({ length: n }, () => h("i")));
const emptyState = (title, ...body) => h("div", "empty", h("h2", null, title), ...body.map((b) => h("p", null, b)));

function saveHash() {
  const next = new URLSearchParams({ run: state.runId ?? "", case: state.caseKey ?? "", tab: state.tab, filter: state.filter });
  history.replaceState(null, "", `#${next}`);
}

// ---------- banner ----------

function showError(message) {
  clear(els.banner, h("p", null, message), h("button", { class: "btn", type: "button", onclick: () => load() }, "Retry"));
  els.banner.hidden = false;
}
const hideError = () => { els.banner.hidden = true; };

// ---------- drawing ----------

function drawRunPicker() {
  clear(els.select, state.runs.map((r) => h("option", { value: r.id, selected: r.id === state.runId }, `${r.label} · ${r.kind === "eval" ? "process eval" : "batch"} · ${formatWhen(r.updated)}`)));
  els.select.disabled = state.runs.length === 0;
}

function drawQueue() {
  queue.update({ cases: state.view?.cases ?? [], filter: state.filter, query: state.query, selected: state.caseKey, onClear: () => { state.filter = "all"; state.query = ""; els.queue.querySelector("input").value = ""; draw(); } });
}

function drawSummary() {
  if (state.view) renderSummary(els.summary, state.view, state.filter, (f) => { state.filter = f; saveHash(); draw(); });
}

function drawCase() {
  if (state.caseView) mountCase(els.detail, state.caseView, { tab: state.tab, onTab: (t) => { state.tab = t; saveHash(); } });
  else clear(els.detail, emptyState(state.view?.cases.length ? "Pick a case" : "Nothing to show yet", state.view?.cases.length ? "Start with the cases that need a person: the handover says what the agent checked, what is missing and what to decide." : "This run has no cases yet. Cases appear here as the batch finishes them."));
}

function draw() {
  drawRunPicker();
  drawSummary();
  drawQueue();
  drawCase();
}

function drawNoRuns() {
  clear(els.summary);
  clear(els.detail, emptyState("No runs found",
    "Run a batch, then reload:",
    h("code", null, "npm run reality -- <cases-folder> --out runs/reality")));
  els.queue.hidden = true;
}

// ---------- loading ----------

// Picks the case to open: the one in the link, else the first that needs a person, else the first.
function pickCase(cases) {
  return cases.find((c) => c.key === state.caseKey) ?? cases.find((c) => c.status === "escalated") ?? cases.find((c) => c.status === "incomplete") ?? cases[0];
}

const changed = (slot, payload) => {
  const json = JSON.stringify(payload);
  if (drawn[slot] === json) return false;
  drawn[slot] = json;
  return true;
};

/** Fetches the run list, the open run and the open case, and redraws whichever of them changed. */
async function load() {
  const mine = ++epoch;
  try {
    const runs = await getJson("runs");
    if (mine !== epoch) return;
    state.runs = runs;
    els.queue.hidden = runs.length === 0;
    if (runs.length === 0) return drawNoRuns();
    if (!runs.some((r) => r.id === state.runId)) state.runId = runs[0].id;

    const view = await getJson(runPath(state.runId));
    if (mine !== epoch) return;
    const key = pickCase(view.cases)?.key ?? null;
    const caseView = key ? await getJson(casePath(state.runId, key)) : null;
    if (mine !== epoch) return;

    state.view = view;
    state.caseKey = key;
    state.caseView = caseView;
    if (changed("view", [runs, view])) { drawRunPicker(); drawSummary(); drawQueue(); }
    if (changed("caseView", caseView)) drawCase();
    els.updated.textContent = `Updated ${formatClock(new Date())}`;
    hideError();
    saveHash();
  } catch (e) {
    if (mine === epoch) showError(e.message);
  }
}

async function selectCase(key) {
  epoch++;
  state.caseKey = key;
  try {
    state.caseView = await getJson(casePath(state.runId, key));
    drawn.caseView = JSON.stringify(state.caseView);
    saveHash();
    drawQueue();
    drawCase();
    if (matchMedia("(max-width: 960px)").matches) els.detail.scrollIntoView({ block: "start", behavior: reducedMotion() ? "auto" : "smooth" });
  } catch (e) {
    showError(e.message);
  }
}

els.select.addEventListener("change", () => {
  state.runId = els.select.value;
  state.caseKey = null;
  state.filter = "all";
  state.query = "";
  els.queue.querySelector("input").value = "";
  drawn.view = drawn.caseView = "";
  clear(els.detail, skeleton(6));
  load();
});
els.reload.addEventListener("click", () => { drawn.view = drawn.caseView = ""; load(); });

setInterval(() => { if (!document.hidden) load(); }, POLL_MS);

clear(els.summary, skeleton(4));
clear(els.detail, skeleton(10));
load();
