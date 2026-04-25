/**
 * Lightweight character-level diff using LCS (Longest Common Subsequence).
 * Produces a compact ordered list of segments tagged 'added' | 'removed' | 'equal'.
 * Good enough for typical prompt-sized strings (<5k chars). O(n*m) memory.
 */

export type DiffOp = "equal" | "added" | "removed";
export interface DiffSegment {
  op: DiffOp;
  text: string;
}

export function charDiff(a: string, b: string): DiffSegment[] {
  const n = a.length;
  const m = b.length;

  if (n === 0) return b.length ? [{ op: "added", text: b }] : [];
  if (m === 0) return a.length ? [{ op: "removed", text: a }] : [];

  // Cap to keep things snappy
  const MAX = 4000;
  if (n > MAX || m > MAX) {
    // Fallback: word-level diff for big strings
    return wordDiff(a, b);
  }

  // DP table of LCS lengths
  const dp: Uint16Array[] = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = dp[i - 1][j] >= dp[i][j - 1] ? dp[i - 1][j] : dp[i][j - 1];
      }
    }
  }

  // Backtrack
  const ops: DiffSegment[] = [];
  let i = n;
  let j = m;
  const push = (op: DiffOp, ch: string) => {
    const last = ops[ops.length - 1];
    if (last && last.op === op) last.text = ch + last.text;
    else ops.push({ op, text: ch });
  };

  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      push("equal", a[i - 1]);
      i--; j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      push("removed", a[i - 1]);
      i--;
    } else {
      push("added", b[j - 1]);
      j--;
    }
  }
  while (i > 0) { push("removed", a[i - 1]); i--; }
  while (j > 0) { push("added", b[j - 1]); j--; }

  return ops;
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
  const push = (op: DiffOp, t: string) => {
    const last = ops[ops.length - 1];
    if (last && last.op === op) last.text = t + last.text;
    else ops.push({ op, text: t });
  };
  while (i > 0 && j > 0) {
    if (aw[i - 1] === bw[j - 1]) { push("equal", aw[i - 1]); i--; j--; }
    else if (dp[i - 1][j] >= dp[i][j - 1]) { push("removed", aw[i - 1]); i--; }
    else { push("added", bw[j - 1]); j--; }
  }
  while (i > 0) { push("removed", aw[i - 1]); i--; }
  while (j > 0) { push("added", bw[j - 1]); j--; }
  return ops;
}

export function diffStats(segs: DiffSegment[]) {
  let added = 0, removed = 0, unchanged = 0;
  for (const s of segs) {
    if (s.op === "added") added += s.text.length;
    else if (s.op === "removed") removed += s.text.length;
    else unchanged += s.text.length;
  }
  return { added, removed, unchanged };
}
