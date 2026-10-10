import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadCase } from "../src/case/parse.ts";
import { parseLooseDate, parseMail } from "../src/case/messy.ts";
import { renderCase } from "../src/agent/prompt.ts";
import { promptText, documentTitles } from "./helpers.ts";
import { newState } from "../src/case/state.ts";
import { visibleEvents } from "../src/case/cut.ts";

const invoice = readFileSync("data/public/Property Management/003/attachments/attachment-02-cleaning-invoice.pdf");

function multipart(): string {
  const b = "XYZ-boundary";
  return [
    "From: =?UTF-8?B?" + Buffer.from("Amara Okafor").toString("base64") + "?= <amara@example.com>",
    "To: ops@lettings.example",
    "Subject: =?UTF-8?Q?Leak_under_the_sink_=E2=80=93_flat_14A?=",
    "Date: Fri, 9 Oct 2026 08:02:44 +0100",
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${b}"`,
    "",
    `--${b}`,
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: quoted-printable",
    "",
    "The pipe under the sink is dripping. The plumber's invoice is attached =",
    "for last time.",
    `--${b}`,
    'Content-Type: application/pdf; name="invoice.pdf"',
    'Content-Disposition: attachment; filename="invoice.pdf"',
    "Content-Transfer-Encoding: base64",
    "",
    invoice.toString("base64").replace(/(.{76})/g, "$1\n"),
    `--${b}--`,
    "",
  ].join("\r\n");
}

test("parseMail decodes encoded headers, quoted-printable bodies and base64 attachments", () => {
  const m = parseMail(multipart());
  assert.equal(m.from, "Amara Okafor <amara@example.com>");
  assert.equal(m.subject, "Leak under the sink – flat 14A");
  assert.equal(m.date?.toISOString(), "2026-10-09T07:02:44.000Z");
  assert.match(m.body, /attached for last time/);
  assert.equal(m.attachments.length, 1);
  assert.equal(m.attachments[0].name, "invoice.pdf");
  assert.ok(m.attachments[0].data.equals(invoice));
});

test("parseLooseDate reads transcript-style dates", () => {
  assert.equal(parseLooseDate("09 Oct 2026, 08:14")?.toISOString(), "2026-10-09T08:14:00.000Z");
  assert.equal(parseLooseDate("not a date"), null);
});

function messyCase(): string {
  const dir = join(mkdtempSync(join(tmpdir(), "messy-")), "case_9");
  mkdirSync(dir);
  writeFileSync(join(dir, "tenant_email.eml"), multipart());
  writeFileSync(
    join(dir, "call_transcript.txt"),
    'CALL TRANSCRIPT - 09 Oct 2026, 08:14 - duration 2m41s\nCaller: +44 7700 900101 (Amara Okafor, flat 14A)\n\n"It is getting worse overnight."\n',
  );
  writeFileSync(join(dir, "tenant.json"), JSON.stringify({ tenant: "Amara Okafor", unit: "14A", rent: 1450 }));
  writeFileSync(join(dir, "notes.md"), "Tenant since 2024.\n\n## Outcome\n\nPlumber fixed it on 12 Oct.\n");
  writeFileSync(join(dir, "lease.docx"), "binary");
  writeFileSync(join(dir, "index.md"), "# Case 9: Leak under the sink\n\n## Case details\n\n- **Property:** Flat 14A\n- **Status:** Completed\n\n## Initial request\n\nSink leaking.\n");
  return dir;
}

test("a loose folder: emails and transcripts become dated events, records become details, the rest is listed as unread", () => {
  const c = loadCase(messyCase());
  assert.equal(c.layer, "loose");
  assert.equal(c.title, "Leak under the sink");
  assert.equal(c.request, "Sink leaking.");
  // Ordered by date, not by file name: the email (07:02 UTC) comes before the call (08:14 UTC).
  assert.deepEqual(c.events.map((e) => [e.n, e.channel, e.at]), [
    [1, "Email", "2026-10-09 07:02:44 UTC"],
    [2, "Call", "2026-10-09 08:14:00 UTC"],
  ]);
  assert.equal(c.events[0].from, "Amara Okafor <amara@example.com>");
  assert.match(c.events[0].body, /^Subject: Leak under the sink/);
  assert.equal(c.events[1].from, "+44 7700 900101 (Amara Okafor, flat 14A)");
  assert.deepEqual(c.events[0].attachments, ["tenant_email.eml--invoice.pdf"]);
  assert.match(c.details, /### tenant\.json\n\{\n {2}"tenant": "Amara Okafor"/);
  assert.match(c.details, /Tenant since 2024/);
  assert.doesNotMatch(c.details, /Plumber fixed it|Status/);
  assert.deepEqual(c.unread, ["lease.docx"]);
});

test("an attachment extracted from an .eml reaches the prompt as a document from its event on", async () => {
  const dir = messyCase();
  const c = loadCase(dir);
  const s = newState(c.id, 1);
  const p = await renderCase(c, s, visibleEvents(c, 1, 1), 1, dir);
  assert.deepEqual(documentTitles(p), ["tenant_email.eml--invoice.pdf"]);
  assert.match(promptText(p), /Received with event 001/);
});

test("two loads of the same messy folder agree", () => {
  const dir = messyCase();
  assert.deepEqual(loadCase(dir), loadCase(dir));
});
