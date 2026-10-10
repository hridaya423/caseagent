// Entity data layer: heuristic, regex-based extraction of the things a case talks about (property, issue,
// contractors, staff, job references, money, visits, documents), and a cross-case catalog for the dashboard.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { loadCase, type Case } from "./parse.ts";

export type EntityType = "property" | "issue" | "organisation" | "staff" | "job_ref" | "money" | "visit" | "document";
export type CaseEntity = { id: string; type: EntityType; label: string; attrs: Record<string, string | number>; events: number[] };
export type CatalogEntity = { id: string; type: EntityType; label: string; attrs: Record<string, string | number>; cases: string[]; mentions: number };
export type Catalog = {
  types: { type: EntityType; label: string; count: number; description: string }[];
  entities: CatalogEntity[];
  relationships: { from: "Case"; to: EntityType; label: string; cardinality: "1" | "0..1" | "0..n" | "1..n" }[];
  generated_at: string;
};

const TYPES: { type: EntityType; label: string; description: string; rel: string; cardinality: "1" | "0..1" | "0..n" | "1..n" }[] = [
  { type: "property", label: "Property", description: "The let property the case is about, from the case details.", rel: "concerns", cardinality: "1" },
  { type: "issue", label: "Issue", description: "Problem category and severity from the AI intake classification, or the case title when unclassified.", rel: "reports", cardinality: "1..n" },
  { type: "organisation", label: "Organisation", description: "Contractors, surveyors and suppliers named in the history.", rel: "involves", cardinality: "0..n" },
  { type: "staff", label: "Staff", description: "Agency staff who acted on the case (holds and updates).", rel: "handled by", cardinality: "0..n" },
  { type: "job_ref", label: "Job reference", description: "Work order and job references such as NBL-050-2635.", rel: "references", cardinality: "0..n" },
  { type: "money", label: "Money", description: "GBP amounts quoted, invoiced, approved or mentioned in the case.", rel: "has amount", cardinality: "0..n" },
  { type: "visit", label: "Visit", description: "Contractor visit dates selected, confirmed or rescheduled.", rel: "schedules", cardinality: "0..n" },
  { type: "document", label: "Document", description: "Files attached to the case (reports, quotes, invoices, photos).", rel: "attaches", cardinality: "0..n" },
];

export function slug(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// ---------- organisation heuristics ----------

const ORG_SUFFIX = "Services|Surveying|Homes|Maintenance|Plumbing|Electrical|Cleaning|Ltd|Limited|Heating|Roofing|Gardening|Drainage|Locksmiths|Repairs|Glazing|Appliances|Solutions|Works|Utilities|Compliance|Contractors";
const ORG_SUFFIX_RE = new RegExp(`^(?:${ORG_SUFFIX})$`);
const ORG_RE = new RegExp(`\\b((?:[A-Z][A-Za-z'&-]+ ){1,3}(?:${ORG_SUFFIX}))\\b`, "g");
const NOISE = new Set(["Dear", "The", "Your", "Hi", "Hello", "From", "At", "To", "By", "Our", "A", "An", "Chased", "Asked", "Called", "Emailed", "Thanks", "Contacted"]);
// Words that describe a trade or a task rather than name a company ("Garden Maintenance", "Check-Out Works").
const GENERIC = new Set([
  "Garden", "Gardens", "Hedge", "Bathroom", "Kitchen", "Tap", "Toilet", "Boiler", "Shower", "Window", "Windows", "Door", "Lock", "Roof",
  "Check", "Out", "Check-Out", "Checkout", "General", "Property", "Building", "Cleaning", "Communal", "Emergency", "Repair", "Repairs",
  "Request", "Plumbing", "Electrical", "Heating", "Maintenance", "Works", "Services", "Homes", "Front", "Back", "Rear", "End", "Of", "Tenancy",
  "Domestic", "Local", "Northbridge", "Lettings", "Agency", "Landlord", "Tenant", "Contractor", "Provider",
]);
const GENERIC_PARTY = /^(tenant|landlord|agency|northbridge|contractor|maintenance provider|not specified|unspecified|internal|staff)\b/i;

function cleanOrg(raw: string): string | null {
  let words = raw.trim().split(/\s+/);
  while (words.length && NOISE.has(words[0])) words.shift();
  // Cut at the first suffix that follows a naming word: "Beacon Homes Maintenance" -> "Beacon Homes".
  for (let i = 1; i < words.length; i++) {
    if (ORG_SUFFIX_RE.test(words[i]) && words.slice(0, i).some((w) => !GENERIC.has(w))) { words = words.slice(0, i + 1); break; }
  }
  if (words.length < 2) return null;
  const name = words.join(" ");
  if (/^Northbridge Lettings$/i.test(name)) return null;
  // Need a capitalised, non-generic naming word before the suffix; person names before a company are not wanted either.
  const naming = words.slice(0, -1);
  if (!naming.every((w) => /^[A-Z]/.test(w)) || naming.every((w) => GENERIC.has(w))) return null;
  if (naming.length > 2) return null;
  return name;
}

function orgsInText(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(ORG_RE)) {
    const name = cleanOrg(m[1]);
    if (name) out.push(name);
  }
  return out;
}

// ---------- extraction ----------

class Bag {
  map = new Map<string, CaseEntity>();
  add(type: EntityType, id: string, label: string, attrs: Record<string, string | number>, event?: number): CaseEntity {
    let e = this.map.get(id);
    if (!e) { e = { id, type, label, attrs, events: [] }; this.map.set(id, e); }
    else for (const [k, v] of Object.entries(attrs)) if (!(k in e.attrs)) e.attrs[k] = v;
    if (event !== undefined && !e.events.includes(event)) e.events.push(event);
    return e;
  }
}

const POSTCODE = /\b([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\s*$/;
const JOB_REF = /\b[A-Z]{2,5}-\d{3,}(?:-\d+)?\b/g;
const MONEY = /£\s?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?(\s*(?:\+|plus)\s*VAT|\s*(?:inc|incl|including)\.?\s*(?:of\s+)?VAT|\s*(?:ex|exc|excl|excluding)\.?\s*VAT)?/gi;

function field(md: string, k: string): string {
  return md.match(new RegExp(`\\*\\*${k}:\\*\\* ?(.*)`))?.[1]?.trim() ?? "";
}

function cleanTitle(title: string): string {
  return title.replace(/\s+at\s+Flat\b.*$/i, "").replace(/\s+request$/i, "").trim() || title;
}

function moneyKind(ctx: string): string {
  if (/\b(quote|quoted|quoting|quotation|estimate)\b/i.test(ctx)) return "quote";
  if (/\b(invoice|invoiced|paid|payment)\b/i.test(ctx)) return "invoice";
  if (/\b(approve|approved|approval|authorise|authorised|authorize|authorized)\b/i.test(ctx)) return "approval";
  return "amount";
}

function docKind(file: string): string {
  const f = file.toLowerCase();
  if (/invoice/.test(f)) return "invoice";
  if (/quot|estimate/.test(f)) return "quote";
  if (/report|inspection/.test(f)) return "report";
  if (/\.(png|jpe?g|gif|webp|heic)$/.test(f) || /photo|image|picture/.test(f)) return "photo";
  if (/statement/.test(f)) return "statement";
  if (/certificate|cert\b|gas-safety|eicr|epc/.test(f)) return "certificate";
  return "document";
}

function issueFromIntake(body: string): { category: string; subcategory?: string; severity?: string } | null {
  if (!/AI Intake Classification/i.test(body)) return null;
  const lines = body.split("\n").map((l) => l.replace(/\*\*/g, "").trim());
  const i = lines.findIndex((l) => /^Issue:/i.test(l));
  if (i < 0) return null;
  let text = lines[i].replace(/^Issue:\s*/i, "");
  let j = i;
  if (!text) { j = lines.findIndex((l, k) => k > i && l !== ""); text = j > 0 ? lines[j] : ""; }
  if (!text || /^(Severity|Confidence):/i.test(text)) return null;
  const [category, ...rest] = text.split(/\s+·\s+/);
  const out: { category: string; subcategory?: string; severity?: string } = { category: category.trim() };
  if (rest.length) out.subcategory = rest.join(" · ").trim();
  const sev = lines.slice(i).find((l) => /^Severity:/i.test(l))?.match(/^Severity:\s*([A-Za-z]+)/i)?.[1];
  if (sev) out.severity = sev.toUpperCase();
  return out;
}

export function extractEntities(c: Case, indexMd: string): CaseEntity[] {
  const bag = new Bag();
  const cid = c.id;

  // property
  const prop = field(indexMd, "Property");
  if (prop) {
    const attrs: Record<string, string | number> = { address: prop };
    const pc = prop.match(POSTCODE);
    if (pc) attrs.postcode = pc[1].replace(/\s+/g, " ");
    const unit = prop.match(/^((?:Flat|Apartment|Unit|Room)\s+[\w-]+)/i);
    if (unit) attrs.unit = unit[1];
    bag.add("property", `property:${slug(prop)}`, prop, attrs);
  }

  // issue
  for (const e of c.events) {
    if (e.channel !== "Note" && e.channel !== "Update") continue;
    const iss = issueFromIntake(e.body);
    if (!iss) continue;
    const attrs: Record<string, string | number> = { category: iss.category };
    if (iss.subcategory) attrs.subcategory = iss.subcategory;
    if (iss.severity) attrs.severity = iss.severity;
    const label = iss.subcategory ? `${iss.category} · ${iss.subcategory}` : iss.category;
    bag.add("issue", `issue:${slug(iss.category + (iss.subcategory ? " " + iss.subcategory : ""))}`, label, attrs, e.n);
  }
  if (![...bag.map.values()].some((x) => x.type === "issue")) {
    const t = cleanTitle(c.title);
    bag.add("issue", `issue:unclassified-${slug(t)}`, t, { category: "Unclassified" });
  }

  // organisations
  const addOrg = (name: string, n?: number) =>
    bag.add("organisation", `org:${slug(name)}`, name, { kind: /Surveying/.test(name) ? "surveyor" : "contractor" }, n);
  for (const e of c.events) {
    for (const p of [e.from, e.to]) {
      const v = p.trim();
      if (!v || GENERIC_PARTY.test(v)) continue;
      const name = cleanOrg(v);
      if (name) addOrg(name, e.n);
    }
    for (const name of orgsInText(e.body)) addOrg(name, e.n);
  }
  for (const name of orgsInText(indexMd)) addOrg(name);

  // staff
  for (const e of c.events) {
    const hits: string[] = [];
    if (e.channel === "Hold") for (const m of e.body.matchAll(/\bput on hold by ([A-Z][a-z'-]+(?: [A-Z][a-z'-]+)?)\b/gi)) hits.push(m[1]);
    if (e.channel === "Update" || e.channel === "Note")
      for (const m of e.body.matchAll(/\b(?:assigned|updated|completed|approved|closed|created|reopened|cancelled|put on hold) by ([A-Z][a-z'-]+ [A-Z][a-z'-]+)\b/g)) hits.push(m[1]);
    for (const name of hits) {
      if (ORG_SUFFIX_RE.test(name.split(" ").at(-1)!) || /Northbridge/.test(name)) continue;
      bag.add("staff", `staff:${slug(name)}`, name, { role: "Agency staff" }, e.n);
    }
  }

  // job references
  const addRef = (ref: string, n?: number) => bag.add("job_ref", `job_ref:${slug(ref)}`, ref, { prefix: ref.split("-")[0] }, n);
  for (const m of indexMd.matchAll(JOB_REF)) addRef(m[0]);
  for (const e of c.events) for (const m of e.body.matchAll(JOB_REF)) addRef(m[0], e.n);

  // money (per case, never merged across cases)
  for (const e of c.events) {
    for (const m of e.body.matchAll(MONEY)) {
      const amount = Number(m[1].replace(/,/g, "") + (m[2] ? "." + m[2] : ""));
      if (!Number.isFinite(amount)) continue;
      const vatRaw = (m[3] ?? "").toLowerCase();
      const start = m.index!, end = start + m[0].length;
      const after = e.body.slice(end, end + 50);
      const vat = /\+|plus/.test(vatRaw) ? "plus VAT" : /inc/.test(vatRaw) ? "incl VAT"
        : /^[^.\n£]*\b(?:inc|incl|including|inclusive of)\b[^.\n£]*\bVAT\b/i.test(after) ? "incl VAT" : "unknown";
      const near = e.body.slice(Math.max(0, start - 80), end + 80);
      const kind = moneyKind(near);
      const context = e.body.slice(Math.max(0, start - 50), end + 50).replace(/\s+/g, " ").trim();
      const label = `£${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${vat === "plus VAT" ? " + VAT" : vat === "incl VAT" ? " incl VAT" : ""} (${kind})`;
      bag.add("money", `money:${slug(cid)}-${String(amount).replace(".", "-")}-${kind}`, label, { amount, vat, kind, context }, e.n);
    }
  }

  // visits
  for (const e of c.events) {
    if (e.channel !== "Update") continue;
    for (const m of e.body.matchAll(/Visit date (selected|confirmed\/rescheduled) - ([^\n]+)/gi)) {
      const status = m[1].toLowerCase();
      const when = m[2].trim().replace(/[.\s]+$/, "");
      bag.add("visit", `visit:${slug(cid)}-${slug(when)}-${slug(status)}`, `${when} (${status})`, { when, status }, e.n);
    }
  }

  // documents
  for (const f of c.attachments) {
    const ev = c.events.find((e) => e.attachments.includes(f) || e.body.includes(`attachments/${f}`));
    const attrs: Record<string, string | number> = { filename: f, format: extname(f).slice(1).toLowerCase(), kind: docKind(f) };
    if (ev) attrs.event = ev.n;
    const docEvents = c.events.filter((e) => e.attachments.includes(f) || e.body.includes(`attachments/${f}`)).map((e) => e.n);
    const d = bag.add("document", `document:${slug(cid)}-${slug(f)}`, f, attrs);
    d.events = docEvents;
  }

  const out = [...bag.map.values()];
  for (const e of out) e.events.sort((a, b) => a - b);
  return out;
}

// ---------- catalog ----------

export function buildCatalog(casesDir: string): Catalog {
  const ids = existsSync(casesDir)
    ? readdirSync(casesDir).filter((d) => !d.startsWith(".") && existsSync(join(casesDir, d, "index.md")) && statSync(join(casesDir, d)).isDirectory()).sort()
    : [];
  const merged = new Map<string, CatalogEntity>();
  for (const id of ids) {
    const dir = join(casesDir, id);
    let ents: CaseEntity[];
    try { ents = extractEntities(loadCase(dir), readFileSync(join(dir, "index.md"), "utf8")); } catch { continue; }
    for (const e of ents) {
      let m = merged.get(e.id);
      if (!m) { m = { id: e.id, type: e.type, label: e.label, attrs: { ...e.attrs }, cases: [], mentions: 0 }; merged.set(e.id, m); }
      else for (const [k, v] of Object.entries(e.attrs)) if (!(k in m.attrs)) m.attrs[k] = v;
      if (!m.cases.includes(id)) m.cases.push(id);
      m.mentions += Math.max(1, e.events.length);
    }
  }
  const order = TYPES.map((t) => t.type);
  const entities = [...merged.values()].sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type) || b.cases.length - a.cases.length || a.label.localeCompare(b.label));
  return {
    types: TYPES.map((t) => ({ type: t.type, label: t.label, count: entities.filter((e) => e.type === t.type).length, description: t.description })),
    entities,
    relationships: TYPES.map((t) => ({ from: "Case" as const, to: t.type, label: t.rel, cardinality: t.cardinality })),
    generated_at: new Date().toISOString(),
  };
}
