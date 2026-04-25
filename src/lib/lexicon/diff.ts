import { BLOCK_META, type Block } from "./blocks";

/**
 * The system uses two-layer diff logic:
 *
 * 1. A pure character-level LCS diff for comparing arbitrary prompt strings.
 * 2. A block-anchored diff renderer for the app's A/B mode, because Prompt B
 *    is created by excluding whole AST blocks.
 *
 * The character-level LCS is still the core algorithm, but the UI respects
 * block boundaries so enabled blocks do not get partially struck out just
 * because similar characters appear later in the prompt.
 */
export type DiffType = "added" | "deleted" | "unchanged";
export interface DiffSegment {
  type: DiffType;
  text: string;
}

export function diffCharacters(promptA: string, promptB: string): DiffSegment[] {
  const a = Array.from(promptA);
  const b = Array.from(promptB);
  const n = a.length;
  const m = b.length;

  if (n === 0) return promptB.length ? [{ type: "added", text: promptB }] : [];
  if (m === 0) return promptA.length ? [{ type: "deleted", text: promptA }] : [];

  // Cap to keep things snappy
  const MAX = 4000;
  if (n > MAX || m > MAX) {
    // Fallback: word-level diff for big strings
    return wordDiff(promptA, promptB);
  }

  const table = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0) as number[]);

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (a[i - 1] === b[j - 1]) {
        table[i][j] = table[i - 1][j - 1] + 1;
      } else {
        table[i][j] = Math.max(table[i - 1][j], table[i][j - 1]);
      }
    }
  }

  const segments: DiffSegment[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      segments.unshift({ type: "unchanged", text: a[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || table[i][j - 1] >= table[i - 1][j])) {
      segments.unshift({ type: "added", text: b[j - 1] });
      j--;
    } else {
      segments.unshift({ type: "deleted", text: a[i - 1] });
      i--;
    }
  }

  return mergeAdjacentSegments(segments);
}

export const charDiff = diffCharacters;

export function mergeAdjacentSegments(segments: DiffSegment[]): DiffSegment[] {
  const merged: DiffSegment[] = [];

  for (const segment of segments) {
    const last = merged[merged.length - 1];

    if (last && last.type === segment.type) {
      last.text += segment.text;
    } else {
      merged.push({ ...segment });
    }
  }

  return merged;
}

export function diffVariantBlocks(blocks: Block[], exclusions: Set<string>): DiffSegment[] {
  return blocks.map((block) => {
    const label = BLOCK_META[block.type].prefix;
    const text = `[${label}]\n${block.text.trim()}`;

    return {
      type: exclusions.has(block.id) || exclusions.has(block.type) ? "deleted" : "unchanged",
      text,
    };
  });
}

function wordDiff(a: string, b: string): DiffSegment[] {
  const aw = a.split(/(\s+)/);
  const bw = b.split(/(\s+)/);
  const n = aw.length;
  const m = bw.length;
  const dp: Uint16Array[] = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (aw[i - 1] === bw[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = dp[i - 1][j] >= dp[i][j - 1] ? dp[i - 1][j] : dp[i][j - 1];
    }
  }
  const ops: DiffSegment[] = [];
  let i = n; let j = m;
  const push = (type: DiffType, t: string) => {
    const last = ops[ops.length - 1];
    if (last && last.type === type) last.text = t + last.text;
    else ops.push({ type, text: t });
  };
  while (i > 0 && j > 0) {
    if (aw[i - 1] === bw[j - 1]) { push("unchanged", aw[i - 1]); i--; j--; }
    else if (dp[i - 1][j] >= dp[i][j - 1]) { push("deleted", aw[i - 1]); i--; }
    else { push("added", bw[j - 1]); j--; }
  }
  while (i > 0) { push("deleted", aw[i - 1]); i--; }
  while (j > 0) { push("added", bw[j - 1]); j--; }
  return ops;
}

export function diffStats(segs: DiffSegment[]) {
  let added = 0, removed = 0, unchanged = 0;
  for (const s of segs) {
    if (s.type === "added") added += s.text.length;
    else if (s.type === "deleted") removed += s.text.length;
    else unchanged += s.text.length;
  }
  return { added, removed, unchanged };
}
