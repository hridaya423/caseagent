import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AddressInfo } from "node:net";
import { once } from "node:events";
import { buildCatalog, extractEntities, type Catalog } from "../src/entities.ts";
import { loadCase } from "../src/parse.ts";
import { listen, type DashboardOptions } from "../src/dashboard.ts";

const PM = "data/public/Property Management";
const entitiesOf = (id: string) => extractEntities(loadCase(join(PM, id)), readFileSync(join(PM, id, "index.md"), "utf8"));

let cached: Catalog | null = null;
const catalog = () => (cached ??= buildCatalog(PM));

test("parses the property of case 027 with postcode and unit", () => {
  const props = entitiesOf("027").filter((e) => e.type === "property");
  assert.equal(props.length, 1);
  assert.equal(props[0].id, "property:flat-10-30-copperfield-walk-willowbank-zz2-3zz");
  assert.equal(props[0].attrs.postcode, "ZZ2 3ZZ");
  assert.equal(props[0].attrs.unit, "Flat 10");
});

test("parses quoted amounts in case 008", () => {
  const money = entitiesOf("008").filter((e) => e.type === "money");
  const q = money.find((m) => m.attrs.amount === 1370);
  assert.ok(q, "£1,370.00 found");
  assert.equal(q.attrs.kind, "quote");
  assert.ok(q.id.startsWith("money:008-"));
  assert.ok(q.events.length >= 1);
  const vat = money.find((m) => m.attrs.amount === 1700);
  assert.equal(vat?.attrs.vat, "plus VAT");
});

test("finds job reference NBL-050-2635 in case 050", () => {
  const ref = entitiesOf("050").find((e) => e.id === "job_ref:nbl-050-2635");
  assert.ok(ref);
  assert.equal(ref.attrs.prefix, "NBL");
  assert.ok(ref.events.length > 0);
});

test("issue comes from the AI intake classification, or the title when unclassified", () => {
  const i = entitiesOf("011").filter((e) => e.type === "issue");
  assert.deepEqual(i.map((e) => e.attrs), [{ category: "Appliances", subcategory: "Dishwasher not completing cycle", severity: "ROUTINE" }]);
  const u = entitiesOf("027").filter((e) => e.type === "issue");
  assert.equal(u.length, 1);
  assert.equal(u[0].attrs.category, "Unclassified");
});

test("staff Clara Harper is in the catalog with several mentions", () => {
  const s = catalog().entities.find((e) => e.id === "staff:clara-harper");
  assert.ok(s);
  assert.equal(s.label, "Clara Harper");
  assert.equal(s.attrs.role, "Agency staff");
  // The public cases use distinct staff names per case, so Clara Harper only appears in case 045.
  assert.ok(s.cases.length >= 1);
  assert.ok(s.mentions > 1);
});

test("organisations: Harbour Services across cases, no salutation noise, no Northbridge", () => {
  const orgs = catalog().entities.filter((e) => e.type === "organisation");
  const hs = orgs.find((e) => e.id === "org:harbour-services");
  assert.ok(hs);
  assert.ok(hs.cases.length > 1);
  assert.equal(hs.attrs.kind, "contractor");
  assert.equal(orgs.find((e) => e.id === "org:juniper-surveying")?.attrs.kind, "surveyor");
  for (const o of orgs) {
    assert.doesNotMatch(o.label, /^(Dear|The|Your|Hi|Hello|From|At) /);
    assert.doesNotMatch(o.label, /Northbridge Lettings/);
    assert.notEqual(o.label, "Garden Maintenance");
  }
});

test("catalog lists all 8 types in order with counts and relationships", () => {
  const c = catalog();
  assert.deepEqual(c.types.map((t) => t.type), ["property", "issue", "organisation", "staff", "job_ref", "money", "visit", "document"]);
  for (const t of c.types) assert.equal(t.count, c.entities.filter((e) => e.type === t.type).length);
  assert.equal(c.types[0].count, 50);
  assert.equal(c.relationships.length, 8);
  assert.ok(c.relationships.every((r) => r.from === "Case"));
  assert.ok(!Number.isNaN(Date.parse(c.generated_at)));
});

test("every case entity id is type-prefixed and lowercase", () => {
  const prefix: Record<string, string> = { property: "property:", issue: "issue:", organisation: "org:", staff: "staff:", job_ref: "job_ref:", money: "money:", visit: "visit:", document: "document:" };
  for (const id of ["001", "008", "011", "027", "045", "050"]) {
    for (const e of entitiesOf(id)) {
      assert.ok(e.id.startsWith(prefix[e.type]), e.id);
      assert.equal(e.id, e.id.toLowerCase());
    }
  }
});

test("documents come from the attachments folder with kind and linking event", () => {
  const docs = entitiesOf("008").filter((e) => e.type === "document");
  assert.equal(docs.length, 4);
  assert.ok(docs.some((d) => d.attrs.kind === "invoice"));
  assert.ok(docs.some((d) => d.attrs.kind === "quote"));
  assert.ok(docs.every((d) => d.attrs.format === "pdf"));
});

test("GET /api/entities serves the catalog and case info carries entities", async () => {
  const root = mkdtempSync(join(tmpdir(), "ent-"));
  mkdirSync(join(root, "runs", "batch-a", "state"), { recursive: true });
  const opts: DashboardOptions = {
    casesDir: PM, runsDir: join(root, "runs"), evalDirs: [], html: () => "<!doctype html>",
    makeDeps: () => { throw new Error("not used"); }, hasKey: () => false, model: "fake",
  };
  const server = listen(opts, 0);
  await once(server, "listening");
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    const res = await fetch(`${base}/api/entities`);
    assert.equal(res.status, 200);
    const c = (await res.json()) as Catalog;
    assert.equal(c.types.length, 8);
    assert.ok(c.entities.some((e) => e.id === "org:harbour-services"));
    const again = (await (await fetch(`${base}/api/entities`)).json()) as Catalog;
    assert.equal(again.generated_at, c.generated_at, "cached");
    const cs = await (await fetch(`${base}/api/runs/batch-a/cases/027`)).json();
    assert.ok(cs.info.entities.some((e: any) => e.type === "property" && e.attrs.postcode === "ZZ2 3ZZ"));
  } finally { server.close(); }
});
