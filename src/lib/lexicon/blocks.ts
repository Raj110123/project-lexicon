import {
  UserCircle2,
  BookOpen,
  ShieldAlert,
  LayoutTemplate,
  Sparkles,
  Quote,
  Ruler,
  type LucideIcon,
} from "lucide-react";

export type BlockType =
  | "role"
  | "context"
  | "constraint"
  | "format"
  | "tone"
  | "example"
  | "length";

export interface BlockMeta {
  type: BlockType;
  label: string;
  short: string;
  icon: LucideIcon;
  /** tailwind color token name from theme: text-block-{token}, bg-block-{token} */
  token: BlockType;
  /** raw HSL triplet used for inline gradients & glows */
  hsl: string;
  placeholder: string;
  defaultText: string;
  description: string;
  /** prompt prefix used in assembled output */
  prefix: string;
}

export const BLOCK_META: Record<BlockType, BlockMeta> = {
  role: {
    type: "role",
    label: "Role",
    short: "ROLE",
    icon: UserCircle2,
    token: "role",
    hsl: "264 92% 66%",
    placeholder: "You are a senior product designer with 12 years of experience…",
    defaultText: "You are a senior product designer with deep expertise in interaction design and design systems.",
    description: "Defines the persona the model adopts.",
    prefix: "ROLE",
  },
  context: {
    type: "context",
    label: "Context",
    short: "CONTEXT",
    icon: BookOpen,
    token: "context",
    hsl: "190 95% 60%",
    placeholder: "We're building a hackathon project called Lexicon…",
    defaultText: "We're shipping a block-based prompt composition tool for a frontend hackathon. The audience is technical judges.",
    description: "Background information the model should ground its answer in.",
    prefix: "CONTEXT",
  },
  constraint: {
    type: "constraint",
    label: "Constraint",
    short: "CONSTRAINT",
    icon: ShieldAlert,
    token: "constraint",
    hsl: "35 95% 60%",
    placeholder: "Do not invent features. Cite tradeoffs explicitly…",
    defaultText: "Stay factual. Avoid marketing language. Do not invent features that aren't described.",
    description: "Hard rules and guardrails.",
    prefix: "CONSTRAINTS",
  },
  format: {
    type: "format",
    label: "Format",
    short: "FORMAT",
    icon: LayoutTemplate,
    token: "format",
    hsl: "152 76% 50%",
    placeholder: "Respond in markdown with H2 headings and bullet lists…",
    defaultText: "Respond in markdown with an H2 title, a one-paragraph summary, and a bulleted breakdown.",
    description: "Shape, structure or schema of the output.",
    prefix: "FORMAT",
  },
  tone: {
    type: "tone",
    label: "Tone",
    short: "TONE",
    icon: Sparkles,
    token: "tone",
    hsl: "340 92% 66%",
    placeholder: "Confident, expressive, slightly playful…",
    defaultText: "Confident, expressive, technically precise. A little playful but never cute.",
    description: "Voice, register, and personality.",
    prefix: "TONE",
  },
  example: {
    type: "example",
    label: "Example",
    short: "EXAMPLE",
    icon: Quote,
    token: "example",
    hsl: "215 95% 65%",
    placeholder: "Input → Output examples to anchor the response…",
    defaultText: "Example — Input: 'a logging library'. Output: 'A small TypeScript logger with structured fields and pluggable transports.'",
    description: "Few-shot examples that anchor the output style.",
    prefix: "EXAMPLE",
  },
  length: {
    type: "length",
    label: "Output Length",
    short: "LENGTH",
    icon: Ruler,
    token: "length",
    hsl: "90 78% 56%",
    placeholder: "Around 150 words. No more than 4 bullets.",
    defaultText: "Approximately 150 words. No more than 4 bullets in any list.",
    description: "How long the response should be.",
    prefix: "OUTPUT LENGTH",
  },
};

export const BLOCK_ORDER: BlockType[] = [
  "role",
  "context",
  "constraint",
  "format",
  "tone",
  "example",
  "length",
];

/** Recommended core blocks for completeness scoring. */
export const RECOMMENDED: BlockType[] = ["role", "context", "constraint", "format"];

export interface Block {
  id: string;
  type: BlockType;
  text: string;
}

export const newId = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `b_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`);

export function makeBlock(type: BlockType, text?: string): Block {
  return { id: newId(), type, text: text ?? BLOCK_META[type].defaultText };
}

/** Assemble blocks into a single prompt string. */
export function assemblePrompt(blocks: Block[]): string {
  return blocks
    .map((b) => {
      const meta = BLOCK_META[b.type];
      return `[${meta.prefix}]\n${b.text.trim()}`;
    })
    .join("\n\n");
}

/** 0–100 structural completeness score across recommended blocks. */
export function completeness(blocks: Block[]): { score: number; missing: BlockType[] } {
  const present = new Set(blocks.map((b) => b.type));
  const missing = RECOMMENDED.filter((t) => !present.has(t));
  const base = ((RECOMMENDED.length - missing.length) / RECOMMENDED.length) * 80;
  // bonus 5 per non-recommended unique block, capped at 20
  const bonusUnique = Array.from(present).filter((t) => !RECOMMENDED.includes(t)).length;
  const bonus = Math.min(20, bonusUnique * 7);
  return { score: Math.round(base + bonus), missing };
}
