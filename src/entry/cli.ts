import { parseArgs } from "node:util";
import { runBatch } from "../batch.ts";
import { liveDeps, processCase, processToEnd, summary } from "../runner/process.ts";

const USAGE = `usage:
  npm run case -- run <case-dir> [--next|--to-end] [--out <dir>]
  npm run case -- run-all <cases-dir> [--to-end|--next] [--limit N] [--concurrency N] [--fresh] [--retry-incomplete] [--out <dir>]
  npm run reality -- <cases-dir> [--concurrency N] [--fresh] [--retry-incomplete] [--out <dir>]

reality runs every case to the end and writes ANSWERS/, traces/, outbox/, state/,
run-summary.json and RUN_SUMMARY.md into --out (default: the current directory).
A rerun skips the cases an earlier batch in the same --out finished; --fresh reruns all of them,
--retry-incomplete reruns only the incomplete ones.`;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    next: { type: "boolean", default: false },
    "to-end": { type: "boolean", default: false },
    out: { type: "string", default: "." },
    limit: { type: "string" },
    concurrency: { type: "string" },
    fresh: { type: "boolean", default: false },
    "retry-incomplete": { type: "boolean", default: false },
  },
});
const [cmd, target] = positionals;
if (!cmd || !target || !["run", "run-all", "reality"].includes(cmd)) {
  console.error(USAGE);
  process.exit(1);
}

const reality = cmd === "reality";
const positiveInt = (v: string | undefined, name: string, fallback?: number): number | undefined => {
  if (v === undefined) return fallback;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1) {
    console.error(`--${name} must be a positive integer.`);
    process.exit(1);
  }
  return n;
};
const concurrency = positiveInt(values.concurrency, "concurrency", reality ? 6 : 4)!;
const limit = positiveInt(values.limit, "limit");
if (values.next && values["to-end"]) {
  console.error("--next and --to-end cannot be combined.");
  process.exit(1);
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add the key.");
  process.exit(1);
}

const deps = liveDeps(values.out);

if (cmd === "run") {
  const state = values["to-end"] ? await processToEnd(deps, target) : await processCase(deps, target, values.next);
  console.log(summary(state));
} else {
  const started = Date.now();
  const rows = await runBatch({
    casesDir: target,
    deps,
    concurrency,
    toEnd: reality || values["to-end"],
    next: values.next,
    fresh: values.fresh,
    retryIncomplete: values["retry-incomplete"],
    limit,
  });
  console.log(`done: ${rows.length} cases in ${Math.round((Date.now() - started) / 1000)} s. Summary: ${values.out}/RUN_SUMMARY.md`);
}
