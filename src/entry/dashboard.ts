import { parseArgs } from "node:util";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createDashboard } from "./dashboard-server.ts";
import { discoverRuns } from "../runner/runs.ts";

const USAGE = `usage: npm run dashboard -- [--runs <dir>] [--cases <dir>]... [--port N]

Shows every run under --runs (default: runs) and the checked-in process evals, read-only, on 127.0.0.1.
--cases is where the case folders live, so a case can show its history and which events the agent saw.
Repeat it for more than one folder (default: data/public/Property Management).`;

const repo = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const { values } = parseArgs({
  options: {
    runs: { type: "string", default: "runs" },
    cases: { type: "string", multiple: true },
    port: { type: "string", default: "4317" },
    help: { type: "boolean", default: false },
  },
});
if (values.help) {
  console.log(USAGE);
  process.exit(0);
}
const port = Number(values.port);
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  console.error("--port must be a port number.");
  process.exit(1);
}

const options = {
  runsDir: resolve(values.runs),
  evalDirs: [resolve(repo, "evals/results")],
  casesDirs: (values.cases ?? ["data/public/Property Management"]).map((d) => resolve(d)),
  staticDir: resolve(repo, "dashboard"),
};
const server = createDashboard(options);
server.on("error", (e: NodeJS.ErrnoException) => {
  console.error(e.code === "EADDRINUSE" ? `Port ${port} is in use. Pick another with --port.` : String(e));
  process.exit(1);
});
server.listen(port, "127.0.0.1", () => {
  const runs = discoverRuns(options);
  console.log(`Case agent dashboard: http://localhost:${(server.address() as { port: number }).port}`);
  console.log(`${runs.length} runs found under ${relative(process.cwd(), options.runsDir) || "."} and evals/results`);
});
