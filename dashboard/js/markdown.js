import { h } from "./dom.js";

// Renders the small Markdown subset that ANSWER.md and REASONING.md use: headings, lists, tables,
// paragraphs, bold and code. Everything is built as DOM nodes, so file content cannot inject HTML.

const inline = (text) =>
  text.split(/(\*\*[^*]+\*\*|`[^`]+`)/).map((part) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return h("strong", null, part.slice(2, -2));
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) return h("code", null, part.slice(1, -1));
    return part;
  });

const isTableRow = (line) => line.trim().startsWith("|");
const isList = (line) => /^\s*[-*] /.test(line);
const isHeading = (line) => /^#{1,3} /.test(line);
const cells = (line) => line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

function table(rows) {
  const [head, , ...body] = rows.map(cells);
  return h("div", "table-wrap", h("table", null,
    h("thead", null, h("tr", null, head.map((c) => h("th", null, inline(c))))),
    h("tbody", null, body.map((r) => h("tr", null, r.map((c) => h("td", null, inline(c))))))));
}

export function renderMarkdown(source) {
  const lines = source.split("\n");
  const out = [];
  for (let i = 0; i < lines.length; ) {
    const line = lines[i];
    const take = (test) => {
      const block = [];
      while (i < lines.length && test(lines[i])) block.push(lines[i++]);
      return block;
    };
    if (!line.trim()) i++;
    else if (isHeading(line)) {
      const level = line.match(/^#+/)[0].length;
      out.push(h(`h${level + 2}`, null, inline(line.replace(/^#+ /, ""))));
      i++;
    } else if (isTableRow(line)) out.push(table(take(isTableRow)));
    else if (isList(line)) out.push(h("ul", null, take(isList).map((l) => h("li", null, inline(l.replace(/^\s*[-*] /, ""))))));
    else out.push(h("p", null, inline(take((l) => l.trim() && !isHeading(l) && !isList(l) && !isTableRow(l)).join("\n"))));
  }
  return h("div", "doc", out);
}
