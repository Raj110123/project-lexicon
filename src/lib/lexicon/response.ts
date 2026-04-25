import type { Block, BlockType } from "./blocks";

/**
 * Deterministic mock-response engine.
 * The shape of the response changes based on which block types are present,
 * and surface details echo content from the user's blocks — so it FEELS
 * like the prompt is shaping the output.
 */

export interface MockResponse {
  title: string;
  summary: string;
  bullets: string[];
  footer: string;
  meta: {
    style: "structured" | "freeform";
    voice: string;
    length: string;
  };
}

function pickFirstSentence(text: string, max = 140): string {
  const t = text.trim();
  if (!t) return "";
  const m = t.match(/^([^.!?\n]+[.!?])/);
  const out = (m ? m[1] : t).trim();
  return out.length > max ? out.slice(0, max - 1).trim() + "…" : out;
}

function get(blocks: Block[], type: BlockType): string | undefined {
  return blocks.find((b) => b.type === type)?.text?.trim();
}

export function generateMockResponse(blocks: Block[]): MockResponse {
  const role = get(blocks, "role");
  const context = get(blocks, "context");
  const constraint = get(blocks, "constraint");
  const format = get(blocks, "format");
  const tone = get(blocks, "tone");
  const example = get(blocks, "example");
  const length = get(blocks, "length");

  const present = new Set(blocks.map((b) => b.type));
  const structured = present.has("format");
  const voice = tone ? pickFirstSentence(tone, 60) : "Neutral, informative.";
  const lengthLabel = length ? pickFirstSentence(length, 60) : "Standard response length.";

  // Title — derived from role/context
  let title = "Composed Response";
  if (role) {
    const roleSubject = role.replace(/^you are\s+/i, "").trim();
    const subj = roleSubject.split(/[,.]/)[0];
    title = `Notes from ${subj.length > 60 ? subj.slice(0, 60) + "…" : subj}`;
  } else if (context) {
    title = pickFirstSentence(context, 70) || title;
  }

  // Summary — composed from context + constraint
  const parts: string[] = [];
  if (context) parts.push(`Working from this context: ${pickFirstSentence(context, 120)}`);
  if (constraint) parts.push(`Within these constraints: ${pickFirstSentence(constraint, 120)}`);
  if (!parts.length) parts.push("This is a structurally sparse prompt — add a Context block to ground the response.");
  const summary = parts.join(" ");

  // Bullets — drawn from blocks present
  const bullets: string[] = [];
  if (role) bullets.push(`Persona engaged: ${pickFirstSentence(role, 90)}`);
  if (format) bullets.push(`Output shaped by: ${pickFirstSentence(format, 90)}`);
  if (constraint) bullets.push(`Guardrails honored: ${pickFirstSentence(constraint, 90)}`);
  if (example) bullets.push(`Anchored on example: ${pickFirstSentence(example, 90)}`);
  if (tone) bullets.push(`Tone calibrated: ${pickFirstSentence(tone, 90)}`);
  if (length) bullets.push(`Length budget: ${pickFirstSentence(length, 90)}`);
  if (!bullets.length) bullets.push("Drop blocks from the palette to see the response evolve.");

  const footer = structured
    ? "Generated as structured markdown per the Format block."
    : "Generated as a freeform paragraph — add a Format block for structure.";

  return {
    title,
    summary,
    bullets: bullets.slice(0, 5),
    footer,
    meta: {
      style: structured ? "structured" : "freeform",
      voice,
      length: lengthLabel,
    },
  };
}
