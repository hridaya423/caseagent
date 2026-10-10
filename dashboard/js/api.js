export async function getJson(path) {
  let res;
  try {
    res = await fetch(`/api/${path}`);
  } catch {
    throw new Error("Cannot reach the dashboard server. Check that npm run dashboard is still running.");
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `The server answered ${res.status}.`);
  return body;
}

export const runPath = (runId) => `runs/${encodeURIComponent(runId)}`;
export const casePath = (runId, key) => `${runPath(runId)}/cases/${encodeURIComponent(key)}`;
