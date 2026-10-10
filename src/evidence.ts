// What a message may state: money amounts and calendar dates that appear somewhere in what the agent
// could see. A message that names a figure or a date from nowhere has invented it.

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const MONTH = "(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)";

const normalise = (n: string) => Number(n.replace(/,/g, "")).toFixed(2);

// Amounts the message states as money: £165, £1,450.00, GBP 620.
export function moneyIn(text: string): string[] {
  return [...text.matchAll(/(?:£|\bGBP\s?)\s?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?/gi)].map((m) => normalise(`${m[1]}${m[2] ? `.${m[2]}` : ""}`));
}

// Every number in the evidence, because an invoice or quote may print 162.85 without a £ sign.
export function numbersIn(text: string): Set<string> {
  return new Set([...text.matchAll(/\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?/g)].map((m) => normalise(m[0])));
}

// Calendar dates as "month-day": 18 November, 18th Nov, November 18, 18/11/2025, 2025-11-18.
// A slashed date counts only with a year, so "24/7" is not a date.
export function datesIn(text: string): Set<string> {
  const out = new Set<string>();
  const add = (month: number, day: number) => {
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) out.add(`${month}-${day}`);
  };
  const monthOf = (name: string) => MONTHS.indexOf(name.slice(0, 3).toLowerCase()) + 1;
  for (const m of text.matchAll(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?(?:\\s+of)?\\s+${MONTH}\\b`, "gi"))) add(monthOf(m[2]), Number(m[1]));
  for (const m of text.matchAll(new RegExp(`\\b${MONTH}\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b(?!\\d)`, "gi"))) add(monthOf(m[1]), Number(m[2]));
  for (const m of text.matchAll(/\b(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})\b/g)) add(Number(m[2]), Number(m[1]));
  for (const m of text.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g)) add(Number(m[2]), Number(m[3]));
  return out;
}

// The amounts and dates in `text` that the evidence never mentions.
export function unsupported(text: string, evidence: string): { amounts: string[]; dates: string[] } {
  const numbers = numbersIn(evidence);
  const dates = datesIn(evidence);
  const fmtDate = (k: string) => {
    const [m, d] = k.split("-").map(Number);
    return `${d} ${MONTHS[m - 1][0].toUpperCase()}${MONTHS[m - 1].slice(1)}`;
  };
  return {
    amounts: [...new Set(moneyIn(text).filter((a) => !numbers.has(a)))].map((a) => `£${a.replace(/\.00$/, "")}`),
    dates: [...datesIn(text)].filter((d) => !dates.has(d)).map(fmtDate),
  };
}
