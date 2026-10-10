import type Anthropic from "@anthropic-ai/sdk";
import type { CasePrompt } from "../src/agent/prompt.ts";
import type { Action, Run } from "../src/case/state.ts";

// The prompt's case text: the first content block.
export function promptText(p: CasePrompt): string {
  const [first] = p.content;
  if (first?.type !== "text") throw new Error("the prompt does not start with a text block");
  return first.text;
}

// The titles of the PDF blocks, in prompt order.
export function documentTitles(p: CasePrompt): string[] {
  return p.content.flatMap((b: Anthropic.ContentBlockParam) => (b.type === "document" && b.title ? [b.title] : []));
}

// A stored action, for building test states.
export function act(tool: string, input: Record<string, unknown> = {}, ok = true, result = "ok"): Action {
  return { tool, input, ok, result };
}

// A stored run that saw events up to `seen`.
export function run(seen: number, actions: Action[] = [], notes: string[] = []): Run {
  return { seen, notes, actions };
}
