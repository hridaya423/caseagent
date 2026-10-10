// Local runs dashboard: reads runs/ (and the checked-in evals/results/) live, and re-runs cases or the
// process eval through the same code paths as the CLI. Binds to 127.0.0.1 only.
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { initialSeen } from "./cut.ts";
import { buildCatalog, extractEntities, type Catalog } from "./entities.ts";
import { loadCase, type CaseEvent } from "./parse.ts";
import { liveDeps, processCase, processToEnd, summary, type RunDeps } from "./run.ts";
import { loadState, statusLabel, type CaseState } from "./state.ts";

const repo = resolve(fileURLToPath(new URL("..", import.meta.url)));
const SAFE = /^[A-Za-z0-9._-]{1,120}$/;

export type DashboardOptions = {
  casesDir: string;
  runsDir: string;
  evalDirs: string[];
  html: () => string;
  makeDeps: (out: string) => RunDeps;
  hasKey: () => boolean;
  model: string;
  runEval?: (out: string) => Promise<unknown>;
  concurrency?: number;
};

// ---------- run discovery ----------

export type RunRef = { id: string; kind: "batch" | "eval"; dir: string; label: string };

function isDir(p: string): boolean {
  try { return statSync(p).isDirectory(); } catch { return false; }
}

export function discoverRuns(o: Pick<DashboardOptions, "runsDir" | "evalDirs">): RunRef[] {
  const out: RunRef[] = [];
  const visit = (root: string, prefix: string, depth: number) => {
    if (!isDir(root)) return;
    for (const name of readdirSync(root).sort()) {
      if (name.startsWith(".") || !SAFE.test(name)) continue;
      const dir = join(root, name);
      if (!isDir(dir)) continue;
      const id = prefix ? `${prefix}~${name}` : name;
      if (existsSync(join(dir, "results.json"))) out.push({ id, kind: "eval", dir, label: id.replaceAll("~", "/") });
      else if (isDir(join(dir, "state"))) out.push({ id, kind: "batch", dir, label: id.replaceAll("~", "/") });
      else if (depth < 2) visit(dir, id, depth + 1);
    }
  };
  visit(o.runsDir, "", 0);
  for (const evalDir of o.evalDirs) {
    if (!isDir(evalDir)) continue;
    for (const name of readdirSync(evalDir).sort()) {
      const dir = join(evalDir, name);
      if (SAFE.test(name) && existsSync(join(dir, "results.json"))) out.push({ id: `evals~${name}`, kind: "eval", dir, label: `evals/results/${name} (checked in)` });
    }
  }
  return out.sort((a, b) => mtime(b.dir) - mtime(a.dir));
}

function mtime(p: string): number {
  try {
    let t = statSync(p).mtimeMs;
    for (const sub of ["state", "results.json"]) if (existsSync(join(p, sub))) t = Math.max(t, statSync(join(p, sub)).mtimeMs);
    const st = join(p, "state");
    if (isDir(st)) for (const f of readdirSync(st)) t = Math.max(t, statSync(join(st, f)).mtimeMs);
    return t;
  } catch { return 0; }
}

function within(root: string, p: string): boolean {
  const r = relative(root, p);
  return r === "" || (!r.startsWith("..") && !r.includes(`..${sep}`) && !r.startsWith(sep));
}

// ---------- reading a run ----------

type TraceRow = { t: string; kind: string; turn?: number; stop?: string; input_tokens?: number; output_tokens?: number; tool?: string; ok?: boolean; detail: string; run?: number; seen?: number };

export function readTrace(path: string): TraceRow[] {
  if (!existsSync(path)) return [];
  const rows: TraceRow[] = [];
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (!line.trim()) continue;
    let e: Record<string, any>;
    try { e = JSON.parse(line); } catch { continue; }
    const row: TraceRow = { t: e.t, kind: e.kind, detail: "" };
    if (e.kind === "model") {
      row.turn = e.turn; row.stop = e.stop;
      row.input_tokens = e.usage?.input_tokens ?? 0; row.output_tokens = e.usage?.output_tokens ?? 0;
      const parts: string[] = [];
      for (const b of e.content ?? []) {
        if (b.type === "text" && b.text) parts.push("Text: " + b.text);
        else if (b.type === "thinking" && b.thinking) parts.push("Thinking: " + b.thinking);
        else if (b.type === "tool_use") { parts.push(`Calls ${b.name}: ${JSON.stringify(b.input)}`); row.tool = b.name; }
      }
      row.detail = parts.join("\n\n");
    } else if (e.kind === "tool") {
      row.tool = e.name; row.ok = e.ok; row.detail = String(e.result ?? "");
    } else if (e.kind === "run_start") {
      row.run = e.run; row.seen = e.seen;
      row.detail = `Run ${e.run} on case ${e.case}, history up to event ${e.seen}, model ${e.model}`;
    } else {
      const { t: _t, kind: _k, ...rest } = e;
      row.detail = JSON.stringify(rest);
    }
    rows.push(row);
  }
  return rows;
}

function readText(p: string): string {
  return existsSync(p) ? readFileSync(p, "utf8") : "";
}

function statusKind(s: CaseState | null): string {
  if (!s) return "not_run";
  if (s.incomplete) return "incomplete";
  return s.status.kind;
}

function caseTitle(casesDir: string, id: string): string {
  const idx = join(casesDir, id, "index.md");
  if (!existsSync(idx)) return id;
  const m = readFileSync(idx, "utf8").match(/^# Case [^:]+: (.+)$/m);
  return m ? m[1].trim() : id;
}

function caseRow(casesDir: string, outDir: string, id: string, key = id) {
  const state = loadState(join(outDir, "state", `${id}.json`));
  const trace = readTrace(join(outDir, "traces", `${id}.jsonl`));
  const models = trace.filter((r) => r.kind === "model");
  const last = state?.actions.at(-1);
  const historyDir = join(outDir, "history", id);
  return {
    key, case_id: id, title: caseTitle(casesDir, id),
    status: statusKind(state), status_label: state ? statusLabel(state.status) + (state.incomplete ? " [incomplete]" : "") : "not run",
    runs: state?.runs ?? 0, seen: state?.seen ?? 0,
    actions: state?.actions.length ?? 0, failed_actions: state?.actions.filter((a) => !a.ok).length ?? 0,
    last_tool: last?.tool ?? "", model_turns: models.length,
    input_tokens: models.reduce((a, r) => a + (r.input_tokens ?? 0), 0),
    output_tokens: models.reduce((a, r) => a + (r.output_tokens ?? 0), 0),
    errors: trace.filter((r) => r.kind === "error").length,
    updated: existsSync(join(outDir, "state", `${id}.json`)) ? statSync(join(outDir, "state", `${id}.json`)).mtime.toISOString() : null,
    attempts: isDir(historyDir) ? readdirSync(historyDir).length : 0,
  };
}

export function listCases(casesDir: string): string[] {
  if (!isDir(casesDir)) return [];
  return readdirSync(casesDir).filter((d) => SAFE.test(d) && existsSync(join(casesDir, d, "index.md"))).sort();
}

function readRun(o: DashboardOptions, run: RunRef) {
  if (run.kind === "batch") {
    const stateDir = join(run.dir, "state");
    const ran = readdirSync(stateDir).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).filter((id) => SAFE.test(id)).sort();
    const rows = ran.map((id) => caseRow(o.casesDir, run.dir, id));
    const notRun = listCases(o.casesDir).filter((id) => !ran.includes(id)).map((id) => ({ ...caseRow(o.casesDir, run.dir, id), status: "not_run" }));
    return { run: { ...run, dir: relative(repo, run.dir) || "." }, cases: [...rows, ...notRun] };
  }
  const report = JSON.parse(readFileSync(join(run.dir, "results.json"), "utf8"));
  const cases = (report.results ?? []).map((r: any) => {
    const sampleRel = r.trace ? dirname(dirname(r.trace)) : r.id;
    const key = sampleRel.split(/[\\/]/).join("~");
    const row = caseRow(o.casesDir, join(run.dir, sampleRel), r.case_id, key);
    return { ...row, sample_id: r.id, step: r.step, trial: r.trial ?? 1, structural_match: !!r.structural_match, run_outcome: r.run_outcome ?? "", score: r.score ?? r.historical_reference_score ?? null, semantic_review: r.semantic_review ?? "" };
  });
  return {
    run: { ...run, dir: relative(repo, run.dir) },
    report: { model: report.model, code_revision: report.code_revision, started_at: report.started_at, trials: report.trials ?? 1, pass_1: report.pass_1 ?? null, pass_k: report.pass_k ?? null, summary: report.summary ?? null },
    cases,
  };
}

const STAGE_RULES: [string, RegExp][] = [
  ["closed", /All checks have been completed|Task has been completed (without payment|by supervisor)|request is now closed/i],
  ["checks", /marked as completed, lets do the final checks|Keys return confirmed|check the key return/i],
  ["result", /moved to Result|No work results|Work results isset/i],
  ["visit", /Visit date selected|Visit date confirmed/i],
  ["works", /Maintenance provider assigned/i],
  ["provider", /Landlord approval confirmed|approve selection of provider|Quote was approved/i],
  ["approval", /landlord approval step first|Need confirmation from landlord|Waiting for landlord\/tenant response before provider/i],
];
const STAGE_ORDER = ["triage", "approval", "provider", "works", "visit", "result", "checks", "closed"];

function party(s: string): string {
  const v = (s || "").trim().toLowerCase();
  if (!v || /not specified|unspecified|internal|staff/.test(v)) return "Internal";
  if (/tenant/.test(v)) return "Tenant";
  if (/landlord/.test(v)) return "Landlord";
  if (/contractor|provider|surveying|cedar homes/.test(v)) return "Contractor";
  if (/agency|northbridge/.test(v)) return "Agency";
  return "Internal";
}

export function caseFlow(c: { events: CaseEvent[] }) {
  let stage = "triage";
  return c.events.map((e) => {
    const from = party(e.from), to = party(e.to);
    const internal = ["Note", "Update", "Hold"].includes(e.channel) || to === "Internal";
    const m = e.channel === "Update" ? STAGE_RULES.find(([, re]) => re.test(e.body))?.[0] ?? "" : "";
    if (m && STAGE_ORDER.indexOf(m) > STAGE_ORDER.indexOf(stage)) stage = m;
    const hold = e.channel === "Hold" ? (e.body.match(/Reason: ([^.\n]+)/i)?.[1] ?? e.body.split("\n")[0]).trim().slice(0, 80) : "";
    return {
      n: e.n, at: e.at, channel: e.channel, from_raw: e.from, to_raw: e.to, from_party: from, to_party: internal ? "Internal" : to,
      kind: e.channel === "Hold" ? "hold" : m ? "milestone" : internal ? "internal" : "message",
      stage, hold_reason: hold, headline: e.body.replace(/\*\*/g, "").replace(/\s+/g, " ").trim().slice(0, 180), body: e.body.slice(0, 4000),
    };
  });
}

function readCase(o: DashboardOptions, run: RunRef, key: string) {
  let outDir = run.dir, caseId = key;
  if (run.kind === "eval") {
    const report = JSON.parse(readFileSync(join(run.dir, "results.json"), "utf8"));
    const r = (report.results ?? []).find((x: any) => (x.trace ? dirname(dirname(x.trace)) : x.id).split(/[\\/]/).join("~") === key);
    if (!r) return null;
    outDir = join(run.dir, ...key.split("~"));
    caseId = r.case_id;
  }
  if (!within(run.dir, outDir) || !SAFE.test(caseId)) return null;
  const state = loadState(join(outDir, "state", `${caseId}.json`));
  let info: any = null;
  const dir = join(o.casesDir, caseId);
  if (existsSync(join(dir, "index.md"))) {
    try {
      const c = loadCase(dir);
      const idx = readFileSync(join(dir, "index.md"), "utf8");
      const field = (k: string) => idx.match(new RegExp(`\\*\\*${k}:\\*\\* ?(.*)`))?.[1] ?? "";
      info = { title: c.title, property: field("Property"), source_role: field("Source role"), request: c.request, first_run_sees: initialSeen(c), events: caseFlow(c), entities: extractEntities(c, idx) };
    } catch (e) {
      info = { title: caseId, error: e instanceof Error ? e.message : String(e), events: [] };
    }
  }
  const histDir = join(outDir, "history", caseId);
  const attempts = isDir(histDir) ? readdirSync(histDir).sort().reverse().map((stamp) => {
    const s = loadState(join(histDir, stamp, "state.json"));
    return { stamp, status: statusKind(s), status_label: s ? statusLabel(s.status) : "unknown", actions: s?.actions.length ?? 0, last_tool: s?.actions.at(-1)?.tool ?? "" };
  }) : [];
  return {
    key, case_id: caseId, state,
    answer_md: readText(join(outDir, "ANSWERS", caseId, "ANSWER.md")),
    reasoning_md: readText(join(outDir, "ANSWERS", caseId, "REASONING.md")),
    trace: readTrace(join(outDir, "traces", `${caseId}.jsonl`)),
    info, attempts,
  };
}

// ---------- jobs ----------

export type Mode = "to-end" | "stage" | "next";
type Job = {
  id: string; run: string; kind: "batch" | "eval"; mode: Mode | "eval"; cases: string[];
  total: number; done: number; failed: number; status: "running" | "done" | "failed";
  log: { t: string; msg: string }[]; started: string; finished: string | null;
};

function stamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

// The previous answer, state and trace for a case are kept under history/<case>/<stamp>/ before a re-run.
function archive(outDir: string, id: string): void {
  const statePath = join(outDir, "state", `${id}.json`);
  if (!existsSync(statePath)) return;
  const dest = join(outDir, "history", id, stamp());
  mkdirSync(dest, { recursive: true });
  cpSync(statePath, join(dest, "state.json"));
  const ans = join(outDir, "ANSWERS", id);
  if (isDir(ans)) cpSync(ans, join(dest, "ANSWERS"), { recursive: true });
  const tr = join(outDir, "traces", `${id}.jsonl`);
  if (existsSync(tr)) cpSync(tr, join(dest, "trace.jsonl"));
}

export function createDashboard(o: DashboardOptions) {
  const jobs = new Map<string, Job>();
  let seq = 0;
  const runningFor = (run: string) => [...jobs.values()].find((j) => j.run === run && j.status === "running");
  const log = (j: Job, msg: string) => { j.log.push({ t: new Date().toISOString(), msg }); if (j.log.length > 400) j.log.shift(); };

  async function batchJob(j: Job, run: RunRef) {
    const deps = o.makeDeps(run.dir);
    const queue = [...j.cases];
    const worker = async () => {
      for (let id = queue.shift(); id; id = queue.shift()) {
        const dir = join(o.casesDir, id);
        try {
          if (j.mode !== "next") archive(run.dir, id);
          const state = j.mode === "to-end" ? await processToEnd(deps, dir)
            : await processCase(deps, dir, j.mode === "next");
          if (state.incomplete) j.failed++;
          log(j, summary(state));
        } catch (e) {
          j.failed++;
          log(j, `${id}: failed: ${e instanceof Error ? e.message : String(e)}`);
        }
        j.done++;
      }
    };
    await Promise.all(Array.from({ length: Math.max(1, Math.min(o.concurrency ?? 3, j.cases.length)) }, worker));
  }

  function startJob(run: RunRef, mode: Job["mode"], cases: string[], body: (j: Job) => Promise<void>): Job {
    const j: Job = { id: `job-${++seq}`, run: run.id, kind: run.kind, mode, cases, total: Math.max(1, cases.length), done: 0, failed: 0, status: "running", log: [], started: new Date().toISOString(), finished: null };
    jobs.set(j.id, j);
    log(j, mode === "eval" ? "Process eval started" : `Started ${cases.length} case${cases.length === 1 ? "" : "s"} (${mode})`);
    body(j).then(() => { j.status = "done"; log(j, "Finished"); }).catch((e) => { j.status = "failed"; log(j, `Stopped: ${e instanceof Error ? e.message : String(e)}`); })
      .finally(() => { j.finished = new Date().toISOString(); });
    return j;
  }

  const catalogCache = new Map<string, { at: number; catalog: Catalog }>();
  const catalog = (): Catalog => {
    const hit = catalogCache.get(o.casesDir);
    if (hit && Date.now() - hit.at < 60_000) return hit.catalog;
    const fresh = buildCatalog(o.casesDir);
    catalogCache.set(o.casesDir, { at: Date.now(), catalog: fresh });
    return fresh;
  };

  const findRun = (id: string) => discoverRuns(o).find((r) => r.id === id) ?? null;

  async function handle(req: IncomingMessage, res: ServerResponse) {
    const url = new URL(req.url ?? "/", "http://localhost");
    const path = url.pathname;
    const host = (req.headers.host ?? "").replace(/:\d+$/, "");
    if (host && !["localhost", "127.0.0.1", "[::1]"].includes(host)) return send(res, 403, { error: "This dashboard only answers on localhost." });

    if (req.method === "GET" && (path === "/" || path === "/index.html")) {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      return res.end(o.html());
    }
    if (!path.startsWith("/api/")) return send(res, 404, { error: "Not found" });

    if (req.method === "POST") {
      // A custom header cannot be sent cross-site without a CORS preflight, which this server never allows.
      if (req.headers["x-case-agent"] !== "1") return send(res, 403, { error: "Missing X-Case-Agent header." });
    }

    const parts = path.split("/").filter(Boolean).slice(1); // after "api"
    try {
      if (req.method === "GET" && parts[0] === "config") {
        return send(res, 200, { casesDir: relative(repo, o.casesDir), runsDir: relative(repo, o.runsDir), model: o.model, hasKey: o.hasKey(), cases: listCases(o.casesDir).length, canRunEval: !!o.runEval });
      }
      if (req.method === "GET" && parts[0] === "entities" && parts.length === 1) return send(res, 200, catalog());
      if (req.method === "GET" && parts[0] === "runs" && parts.length === 1) {
        return send(res, 200, discoverRuns(o).map((r) => ({ id: r.id, kind: r.kind, label: r.label, dir: relative(repo, r.dir), updated: new Date(mtime(r.dir)).toISOString(), running: !!runningFor(r.id) })));
      }
      if (parts[0] === "runs" && parts[1]) {
        if (!SAFE.test(parts[1].replaceAll("~", "_"))) return send(res, 400, { error: "Bad run id" });
        const run = findRun(parts[1]);
        if (!run) return send(res, 404, { error: `No run ${parts[1]}` });
        if (req.method === "GET" && parts.length === 2) return send(res, 200, readRun(o, run));
        if (req.method === "GET" && parts[2] === "cases" && parts[3]) {
          const data = readCase(o, run, parts[3]);
          return data ? send(res, 200, data) : send(res, 404, { error: "No such case in this run" });
        }
        if (req.method === "POST" && parts[2] === "rerun") return rerun(req, res, run);
      }
      if (req.method === "POST" && parts[0] === "runs" && parts.length === 1) return newRun(req, res);
      if (req.method === "GET" && parts[0] === "jobs") {
        if (parts[1]) { const j = jobs.get(parts[1]); return j ? send(res, 200, j) : send(res, 404, { error: "No such job" }); }
        return send(res, 200, [...jobs.values()].reverse().slice(0, 20));
      }
      return send(res, 404, { error: "Not found" });
    } catch (e) {
      return send(res, 500, { error: e instanceof Error ? e.message : String(e) });
    }
  }

  async function rerun(req: IncomingMessage, res: ServerResponse, run: RunRef) {
    const body = await readJson(req);
    if (!o.hasKey()) return send(res, 400, { error: "ANTHROPIC_API_KEY is not set. Add it to .env and restart the dashboard." });
    if (runningFor(run.id)) return send(res, 409, { error: "A job is already running for this run. Wait for it to finish." });
    if (run.kind === "eval") {
      if (!o.runEval) return send(res, 400, { error: "Process eval re-runs are not available." });
      const out = join(o.runsDir, "process-eval", stamp());
      const target: RunRef = { ...run };
      const j = startJob(target, "eval", [], async (job) => { await o.runEval!(out); job.done = 1; log(job, `Results: ${relative(repo, out)}/results.json`); });
      return send(res, 202, { job: j, new_run: `process-eval~${basename(out)}` });
    }
    const mode: Mode = ["to-end", "stage", "next"].includes(body.mode) ? body.mode : "to-end";
    const all = listCases(o.casesDir);
    let cases: string[];
    if (body.cases === "all") cases = all;
    else if (body.cases === "ran") cases = readdirSync(join(run.dir, "state")).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).filter((id) => all.includes(id));
    else if (Array.isArray(body.cases)) cases = body.cases.filter((c: unknown) => typeof c === "string" && all.includes(c));
    else return send(res, 400, { error: "cases must be \"all\", \"ran\" or a list of case ids" });
    if (!cases.length) return send(res, 400, { error: "No matching cases to run." });
    const j = startJob(run, mode, cases, (job) => batchJob(job, run));
    return send(res, 202, { job: j });
  }

  async function newRun(req: IncomingMessage, res: ServerResponse) {
    const body = await readJson(req);
    const name = String(body.name ?? "").trim() || `run-${stamp()}`;
    if (!SAFE.test(name)) return send(res, 400, { error: "Use letters, digits, dots, dashes and underscores for the run name." });
    const dir = join(o.runsDir, name);
    if (existsSync(dir)) return send(res, 409, { error: `runs/${name} already exists.` });
    mkdirSync(join(dir, "state"), { recursive: true });
    return send(res, 201, { id: name });
  }

  return { handle, jobs };
}

function send(res: ServerResponse, code: number, body: unknown) {
  res.writeHead(code, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}

async function readJson(req: IncomingMessage): Promise<any> {
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const c of req) {
    size += (c as Buffer).length;
    if (size > 65536) throw new Error("Request body too large");
    chunks.push(c as Buffer);
  }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new Error("Request body is not JSON"); }
}

export function listen(o: DashboardOptions, port: number): Server {
  const d = createDashboard(o);
  const server = createServer((req, res) => { d.handle(req, res).catch((e) => send(res, 500, { error: String(e) })); });
  server.listen(port, "127.0.0.1");
  return server;
}

// import.meta.main needs Node 24; compare the entry script instead so Node 22 works too.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.DASHBOARD_PORT ?? 4317);
  const htmlPath = join(repo, "dashboard", "index.html");
  const casesDir = resolve(repo, process.env.CASES_DIR ?? "data/public/Property Management");
  const options: DashboardOptions = {
    casesDir,
    runsDir: resolve(repo, process.env.RUNS_DIR ?? "runs"),
    evalDirs: [join(repo, "evals", "results")],
    html: () => readFileSync(htmlPath, "utf8"),
    makeDeps: liveDeps,
    hasKey: () => !!process.env.ANTHROPIC_API_KEY,
    model: process.env.MODEL ?? "claude-sonnet-5-5",
    concurrency: Number(process.env.DASHBOARD_CONCURRENCY ?? 3),
    runEval: async (out) => {
      const { runSuite } = await import("../evals/Process Reward/run.ts");
      let revision = "unknown";
      try { revision = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repo, encoding: "utf8" }).trim(); } catch { /* not a git checkout */ }
      return runSuite({ out, makeDeps: liveDeps, model: process.env.MODEL ?? "claude-sonnet-5-5", revision });
    },
  };
  listen(options, port);
  console.log(`Case agent dashboard: http://localhost:${port}`);
  console.log(`Cases: ${relative(repo, casesDir)} (${listCases(casesDir).length}) · Runs: ${relative(repo, options.runsDir)}${process.env.ANTHROPIC_API_KEY ? "" : " · ANTHROPIC_API_KEY not set: viewing only, re-runs disabled"}`);
}
