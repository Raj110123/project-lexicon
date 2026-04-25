import type { Block, BlockType } from "./blocks";

/**
 * Pre-authored mock responses keyed to AST block structure.
 *
 * This intentionally does not call an LLM. The PS asks us to demonstrate that
 * prompt structure affects output, so each response is a curated sample chosen
 * from the block types currently present in the prompt.
 */

export interface MockResponse {
  title: string;
  summary: string;
  bullets: string[];
  footer: string;
  matchedCase: string;
  quality: "strong" | "focused" | "partial" | "generic";
  meta: {
    style: "structured" | "guided" | "freeform";
    voice: string;
    length: string;
  };
}

type StructureFlags = Record<BlockType, boolean>;

function detectStructure(blocks: Block[]): StructureFlags {
  return {
    role: blocks.some((b) => b.type === "role"),
    context: blocks.some((b) => b.type === "context"),
    constraint: blocks.some((b) => b.type === "constraint"),
    format: blocks.some((b) => b.type === "format"),
    tone: blocks.some((b) => b.type === "tone"),
    example: blocks.some((b) => b.type === "example"),
    length: blocks.some((b) => b.type === "length"),
  };
}

export function generateMockResponse(blocks: Block[]): MockResponse {
  const has = detectStructure(blocks);

  if (has.role && has.context && has.constraint && has.format && has.tone && has.example && has.length) {
    return {
      matchedCase: "Full architecture",
      quality: "strong",
      title: "Polished Strategy Brief",
      summary:
        "A precise, role-aware answer that explains the recommendation, respects constraints, follows the requested format, and mirrors the provided example pattern.",
      bullets: [
        "Starts with a confident expert framing because the Role block defines who is speaking.",
        "Grounds the answer in the project situation instead of giving generic advice.",
        "Uses the requested structure, tone, and length budget without drifting.",
        "Includes a concrete example-style output, making the response easier to evaluate.",
      ],
      footer: "Matched all seven structural signals: role, context, constraint, format, tone, example, and output length.",
      meta: {
        style: "structured",
        voice: "Persona-led and tone-calibrated",
        length: "Length-controlled",
      },
    };
  }

  if (has.context && has.constraint && has.format && has.length && !has.role && !has.tone) {
    return {
      matchedCase: "Focused stripped variant",
      quality: "focused",
      title: "Lean Execution Plan",
      summary:
        "A cleaner response that keeps the task context, rules, format, and size limit while removing persona and voice overhead.",
      bullets: [
        "Prioritizes the actual task over performance-style persona language.",
        "Keeps hard constraints visible, so the answer stays safe and specific.",
        "Preserves formatting and output length, making the result easy to scan.",
        "Feels more direct than the full prompt while retaining enough structure to work.",
      ],
      footer: "Matched core execution blocks: context, constraint, format, and output length.",
      meta: {
        style: "structured",
        voice: "Neutral and concise",
        length: "Length-controlled",
      },
    };
  }

  if (has.role && has.tone && has.example) {
    return {
      matchedCase: "Persona + tone + example",
      quality: "strong",
      title: "Expressive Sample Response",
      summary:
        "A vivid response with a recognizable voice and example-following behavior, but it may miss project grounding if Context is absent.",
      bullets: [
        "Adopts the requested persona and speaks with a deliberate voice.",
        "Uses the example as a pattern for phrasing and specificity.",
        "May sound polished even when the task itself is under-specified.",
      ],
      footer: "Matched expressive blocks: role, tone, and example.",
      meta: {
        style: has.format ? "structured" : "guided",
        voice: "Expressive and example-led",
        length: has.length ? "Length-controlled" : "Open-ended",
      },
    };
  }

  if (has.role && has.tone) {
    return {
      matchedCase: "Role + tone",
      quality: "partial",
      title: "Clear Voice, Thin Evidence",
      summary:
        "A readable response with a strong persona and voice, but the lack of examples or strict constraints makes the output less reliable.",
      bullets: [
        "The response sounds intentional because persona and tone are defined.",
        "Without an Example block, the model has fewer clues about the desired answer pattern.",
        "Without constraints, it may over-explain or invent details.",
      ],
      footer: "Matched voice blocks only: role and tone.",
      meta: {
        style: has.format ? "structured" : "guided",
        voice: "Persona-led",
        length: has.length ? "Length-controlled" : "Open-ended",
      },
    };
  }

  if (has.context && has.constraint && has.format) {
    return {
      matchedCase: "Core structured prompt",
      quality: "focused",
      title: "Grounded Structured Answer",
      summary:
        "A practical response that knows what problem it is solving, what rules it must follow, and how the final answer should be shaped.",
      bullets: [
        "Context grounds the answer in the user’s situation.",
        "Constraints reduce hallucination and keep the output inside boundaries.",
        "Format makes the result easier to judge and compare.",
      ],
      footer: "Matched core recommended blocks: context, constraint, and format.",
      meta: {
        style: "structured",
        voice: has.tone ? "Tone-calibrated" : "Neutral",
        length: has.length ? "Length-controlled" : "Standard length",
      },
    };
  }

  if (has.context || has.format || has.constraint) {
    return {
      matchedCase: "Partial structure",
      quality: "partial",
      title: "Usable but Underspecified",
      summary:
        "The response has one or two useful signals, but it lacks enough structure to consistently produce a strong output.",
      bullets: [
        "A single structural block improves the answer, but not enough to fully guide it.",
        "Adding Context, Constraint, and Format together would make the result more dependable.",
        "The output may vary because important intent is still implicit.",
      ],
      footer: "Matched a partial block composition.",
      meta: {
        style: has.format ? "structured" : "freeform",
        voice: has.tone ? "Tone-calibrated" : "Neutral",
        length: has.length ? "Length-controlled" : "Open-ended",
      },
    };
  }

  return {
    matchedCase: "Minimal / generic",
    quality: "generic",
    title: "Generic Response",
    summary:
      "A broad answer with minimal guidance. It may be understandable, but it is unlikely to be specific, consistent, or easy to evaluate.",
    bullets: [
      "No clear persona, context, constraints, examples, or formatting rules are present.",
      "The response defaults to generic explanation instead of tailored execution.",
      "Adding semantic blocks would immediately improve control over the output.",
    ],
    footer: "Matched no strong structural pattern.",
    meta: {
      style: "freeform",
      voice: "Generic",
      length: "Open-ended",
    },
  };
}
