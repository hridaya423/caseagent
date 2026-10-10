// Readers for case folders that arrive as loose files instead of index.md + history.md:
// emails (.eml, or .txt with mail headers), call transcripts, and CRM-style records.

export type MailPart = { name: string; contentType: string; data: Buffer };
export type Mail = { from: string; to: string; date: Date | null; subject: string; body: string; attachments: MailPart[] };

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

// "2026-10-09 07:02:44 UTC", the timestamp format of the public cases.
export function stamp(d: Date): string {
  return d.toISOString().slice(0, 19).replace("T", " ") + " UTC";
}

// A date with a zone (RFC 2822 mail dates, ISO with Z) parses natively. A date without one, such as
// a transcript's "09 Oct 2026, 08:14", is read as UTC: native parsing would use the machine's zone.
export function parseLooseDate(text: string): Date | null {
  if (/[+-]\d{4}\b|\d(Z|\s*(GMT|UTC))\b/.test(text)) {
    const direct = new Date(text);
    if (!Number.isNaN(direct.getTime())) return direct;
  }
  const iso = text.match(/(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (iso) return new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), Number(iso[4] ?? 0), Number(iso[5] ?? 0), Number(iso[6] ?? 0)));
  const m = text.match(/(\d{1,2})\s+([A-Za-z]{3,9})\.?\s+(\d{4})(?:[,\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (!m) return null;
  const month = MONTHS.indexOf(m[2].slice(0, 3).toLowerCase());
  if (month < 0) return null;
  return new Date(Date.UTC(Number(m[3]), month, Number(m[1]), Number(m[4] ?? 0), Number(m[5] ?? 0), Number(m[6] ?? 0)));
}

function splitHead(raw: string): { headers: Map<string, string>; body: string } {
  const text = raw.replace(/\r\n/g, "\n");
  const end = text.search(/\n\s*\n/);
  const headText = end === -1 ? text : text.slice(0, end);
  const body = end === -1 ? "" : text.slice(end).replace(/^\s*\n/, "");
  const headers = new Map<string, string>();
  let last = "";
  for (const line of headText.split("\n")) {
    if (/^\s/.test(line) && last) headers.set(last, `${headers.get(last)} ${line.trim()}`);
    else {
      const m = line.match(/^([A-Za-z][\w-]*):\s?(.*)$/);
      if (!m) continue;
      last = m[1].toLowerCase();
      headers.set(last, m[2].trim());
    }
  }
  return { headers, body };
}

// =?UTF-8?B?...?= and =?UTF-8?Q?...?= words in headers.
function decodeWords(s: string): string {
  return s.replace(/=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g, (_m, _cs, enc: string, data: string) =>
    enc.toUpperCase() === "B" ? Buffer.from(data, "base64").toString("utf8") : decodeQP(data.replace(/_/g, " ")).toString("utf8"),
  );
}

function decodeQP(s: string): Buffer {
  const soft = s.replace(/=\r?\n/g, "");
  const bytes: number[] = [];
  for (let i = 0; i < soft.length; i++) {
    if (soft[i] === "=" && /^[0-9A-Fa-f]{2}$/.test(soft.slice(i + 1, i + 3))) {
      bytes.push(parseInt(soft.slice(i + 1, i + 3), 16));
      i += 2;
    } else bytes.push(...Buffer.from(soft[i], "utf8"));
  }
  return Buffer.from(bytes);
}

const param = (header: string, name: string) => header.match(new RegExp(`${name}\\*?="?([^";]+)"?`, "i"))?.[1];

function decodeBody(body: string, encoding: string): Buffer {
  const e = encoding.toLowerCase();
  if (e === "base64") return Buffer.from(body.replace(/\s+/g, ""), "base64");
  if (e === "quoted-printable") return decodeQP(body);
  return Buffer.from(body, "utf8");
}

const htmlToText = (html: string) =>
  html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, "").replace(/<br\s*\/?>|<\/p>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

// Walks a MIME tree: the first text/plain part is the body (text/html when no plain part exists),
// and every part with a filename is an attachment.
function walk(headers: Map<string, string>, body: string, out: { plain?: string; html?: string; attachments: MailPart[] }): void {
  const type = headers.get("content-type") ?? "text/plain";
  const boundary = param(type, "boundary");
  if (/^multipart\//i.test(type) && boundary) {
    for (const chunk of body.split(`--${boundary}`).slice(1)) {
      if (chunk.startsWith("--")) break;
      const part = splitHead(chunk.replace(/^\n/, ""));
      walk(part.headers, part.body, out);
    }
    return;
  }
  const data = decodeBody(body, headers.get("content-transfer-encoding") ?? "7bit");
  const disposition = headers.get("content-disposition") ?? "";
  const name = param(disposition, "filename") ?? param(type, "name");
  if (name) out.attachments.push({ name: decodeWords(name).replace(/[\\/]/g, "_"), contentType: type.split(";")[0].trim().toLowerCase(), data });
  else if (/^text\/html/i.test(type)) out.html ??= htmlToText(data.toString("utf8"));
  else if (/^text\//i.test(type)) out.plain ??= data.toString("utf8");
}

export const looksLikeMail = (raw: string) => {
  const { headers } = splitHead(raw);
  return headers.has("from") && (headers.has("subject") || headers.has("date") || headers.has("to"));
};

export function parseMail(raw: string): Mail {
  const { headers, body } = splitHead(raw);
  const out: { plain?: string; html?: string; attachments: MailPart[] } = { attachments: [] };
  walk(headers, body, out);
  const date = headers.get("date");
  return {
    from: decodeWords(headers.get("from") ?? ""),
    to: decodeWords(headers.get("to") ?? ""),
    date: date ? parseLooseDate(date) : null,
    subject: decodeWords(headers.get("subject") ?? ""),
    body: (out.plain ?? out.html ?? "").trim(),
    attachments: out.attachments,
  };
}

// A call transcript names its caller and time in the first lines, for example
// "CALL TRANSCRIPT - 09 Oct 2026, 08:14" and "Caller: +44 7700 900101 (Amara Okafor, flat 14A)".
export function parseTranscript(text: string): { from: string; to: string; date: Date | null } {
  const head = text.split("\n").slice(0, 8);
  const field = (re: RegExp) => head.map((l) => l.match(re)?.[1]?.trim()).find(Boolean) ?? "";
  const date = head.map((l) => parseLooseDate(l.replace(/^[^0-9]*?(?=\d{1,2}\s+[A-Za-z]{3})/, ""))).find((d) => d !== null) ?? null;
  return { from: field(/^(?:caller|from)\s*:\s*(.+)$/i), to: field(/^(?:callee|to|recipient)\s*:\s*(.+)$/i), date };
}

// CRM-style records become readable context, not events.
export function renderRecord(name: string, text: string): string {
  if (/\.json$/i.test(name)) {
    try {
      return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      return text;
    }
  }
  return text.trim();
}
