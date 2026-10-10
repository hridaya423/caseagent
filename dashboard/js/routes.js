// Hash routes, so the back button, reloads and shared links all land on the same page:
//   #/                          the newest run
//   #/runs/<run>?filter=hold    a run's cases
//   #/runs/<run>/cases/<key>?tab=history   one case
const enc = encodeURIComponent;

export function parseRoute(hash = location.hash) {
  const [path, search = ""] = hash.replace(/^#\/?/, "").split("?");
  const [kind, runId, sub, key] = path.split("/").map((p) => decodeURIComponent(p));
  const query = new URLSearchParams(search);
  return {
    runId: kind === "runs" && runId ? runId : null,
    caseKey: kind === "runs" && sub === "cases" && key ? key : null,
    filter: query.get("filter") ?? "all",
    tab: query.get("tab") ?? "actions",
  };
}

export const runHref = (runId, filter = "all") => `#/runs/${enc(runId)}${filter !== "all" ? `?filter=${enc(filter)}` : ""}`;
export const caseHref = (runId, key, tab = "actions") => `#/runs/${enc(runId)}/cases/${enc(key)}${tab !== "actions" ? `?tab=${enc(tab)}` : ""}`;
