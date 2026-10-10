import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { listRuns, readCase, readRun, type Sources } from "../runner/runs.ts";

// Demo dashboard for the agency: a read-only view of every run. It binds to 127.0.0.1 and is not meant to be hosted.

export type DashboardOptions = Sources & { staticDir: string };

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
};
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

function send(res: ServerResponse, status: number, body: string | Buffer, type = "application/json; charset=utf-8"): void {
  res.writeHead(status, { "content-type": type, "cache-control": "no-store" });
  res.end(body);
}
const sendJson = (res: ServerResponse, status: number, body: unknown): void => send(res, status, JSON.stringify(body));

async function sendStatic(res: ServerResponse, staticDir: string, pathname: string): Promise<void> {
  const file = pathname === "/" ? "index.html" : normalize(pathname).replace(/^[/\\]+/, "");
  const type = TYPES[extname(file)];
  if (!type || file.split(/[/\\]/).includes("..")) return sendJson(res, 404, { error: "Not found" });
  try {
    send(res, 200, await readFile(join(staticDir, file)), type);
  } catch {
    sendJson(res, 404, { error: "Not found" });
  }
}

function route(o: DashboardOptions, pathname: string): { status: number; body: unknown } {
  const parts = pathname.split("/").filter(Boolean).slice(1).map(decodeURIComponent);
  const [resource, id, sub, key] = parts;
  const found = (body: unknown, what: string) => (body ? { status: 200, body } : { status: 404, body: { error: `No such ${what}` } });
  if (resource === "runs" && parts.length === 1) return found(listRuns(o), "runs");
  if (resource === "runs" && parts.length === 2) return found(readRun(o, id), "run");
  if (resource === "runs" && sub === "cases" && parts.length === 4) return found(readCase(o, id, key), "case in this run");
  return { status: 404, body: { error: "Not found" } };
}

export function createDashboard(o: DashboardOptions): Server {
  return createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const host = (req.headers.host ?? "").replace(/:\d+$/, "");
    if (host && !LOCAL_HOSTS.has(host)) return sendJson(res, 403, { error: "This dashboard only answers on localhost." });
    if (req.method !== "GET" && req.method !== "HEAD") return sendJson(res, 405, { error: "The dashboard is read-only." });
    const { pathname } = new URL(req.url ?? "/", "http://localhost");
    if (!pathname.startsWith("/api/")) return sendStatic(res, o.staticDir, pathname);
    try {
      const { status, body } = route(o, pathname);
      sendJson(res, status, body);
    } catch (e) {
      sendJson(res, 500, { error: e instanceof Error ? e.message : String(e) });
    }
  });
}
