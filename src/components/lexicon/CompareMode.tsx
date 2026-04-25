import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { GitCompare, X, Plus, Minus, ArrowLeftRight } from "lucide-react";
import { BLOCK_META, BLOCK_ORDER, type Block, type BlockType, assemblePrompt } from "@/lib/lexicon/blocks";
import { charDiff, diffStats } from "@/lib/lexicon/diff";

interface CompareModeProps {
  blocks: Block[];
  open: boolean;
  onClose: () => void;
}

export function CompareMode({ blocks, open, onClose }: CompareModeProps) {
  const presentTypes = useMemo(
    () => Array.from(new Set(blocks.map((b) => b.type))) as BlockType[],
    [blocks],
  );
  const [removed, setRemoved] = useState<Set<BlockType>>(new Set());

  const left = useMemo(() => assemblePrompt(blocks), [blocks]);
  const variantBlocks = useMemo(() => blocks.filter((b) => !removed.has(b.type)), [blocks, removed]);
  const right = useMemo(() => assemblePrompt(variantBlocks), [variantBlocks]);

  const diff = useMemo(() => charDiff(left, right), [left, right]);
  const stats = useMemo(() => diffStats(diff), [diff]);

  const toggle = (t: BlockType) => {
    setRemoved((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md sm:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-full max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl glass-strong"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary/20 text-primary-glow">
                  <GitCompare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold leading-tight">Comparison Mode</h3>
                  <p className="text-xs text-muted-foreground">Toggle blocks to remove, then read the character-level diff.</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background/40 transition-all hover:border-primary/40 hover:bg-background"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Block toggles */}
            <div className="flex flex-wrap items-center gap-2 border-b border-border/50 px-6 py-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Strip from variant:</span>
              {presentTypes.length === 0 ? (
                <span className="text-xs text-muted-foreground">No blocks to compare. Add some on the canvas first.</span>
              ) : (
                presentTypes
                  .sort((a, b) => BLOCK_ORDER.indexOf(a) - BLOCK_ORDER.indexOf(b))
                  .map((t) => {
                    const meta = BLOCK_META[t];
                    const off = removed.has(t);
                    return (
                      <button
                        key={t}
                        onClick={() => toggle(t)}
                        className="group flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider transition-all"
                        style={{
                          background: off ? "transparent" : `hsl(${meta.hsl} / 0.16)`,
                          color: off ? "hsl(var(--muted-foreground))" : `hsl(${meta.hsl})`,
                          boxShadow: off
                            ? "inset 0 0 0 1px hsl(var(--border))"
                            : `inset 0 0 0 1px hsl(${meta.hsl} / 0.4)`,
                          textDecoration: off ? "line-through" : "none",
                        }}
                      >
                        {meta.short}
                      </button>
                    );
                  })
              )}
              <div className="ml-auto flex items-center gap-3 font-mono text-[11px]">
                <span className="inline-flex items-center gap-1 text-success">
                  <Plus className="h-3 w-3" /> {stats.added}
                </span>
                <span className="inline-flex items-center gap-1 text-destructive">
                  <Minus className="h-3 w-3" /> {stats.removed}
                </span>
                <span className="text-muted-foreground">= {stats.unchanged}</span>
              </div>
            </div>

            {/* Dual panes */}
            <div className="grid flex-1 grid-cols-1 gap-px overflow-hidden bg-border/50 lg:grid-cols-2">
              <Pane title="A · Full composition" body={left} accent="hsl(264 92% 66%)" />
              <Pane title="B · Stripped variant" body={right} accent="hsl(190 95% 60%)" />
            </div>

            {/* Diff strip */}
            <div className="border-t border-border/50 bg-background/40">
              <div className="flex items-center gap-2 px-6 py-3">
                <ArrowLeftRight className="h-4 w-4 text-primary-glow" />
                <span className="font-display text-sm font-semibold uppercase tracking-wider">Character diff</span>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground">A → B</span>
              </div>
              <div className="max-h-[28vh] overflow-y-auto border-t border-border/50 px-6 py-4">
                <DiffView segments={diff} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Pane({ title, body, accent }: { title: string; body: string; accent: string }) {
  return (
    <div className="flex flex-col bg-background/40">
      <div
        className="flex items-center gap-2 border-b border-border/40 px-5 py-3 font-mono text-[11px] uppercase tracking-wider"
        style={{ color: accent }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
        {title}
      </div>
      <pre className="flex-1 overflow-auto px-5 py-4 font-mono text-xs leading-[1.65] text-foreground/85 whitespace-pre-wrap break-words">
        {body || "// empty"}
      </pre>
    </div>
  );
}

import type { DiffSegment } from "@/lib/lexicon/diff";

function DiffView({ segments }: { segments: DiffSegment[] }) {
  if (!segments.length) {
    return <div className="text-sm text-muted-foreground">No differences.</div>;
  }
  return (
    <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-[1.7]">
      {segments.map((s, i) => {
        if (s.op === "equal") {
          return <span key={i} className="text-foreground/55">{s.text}</span>;
        }
        if (s.op === "added") {
          return (
            <motion.span
              key={i}
              initial={{ opacity: 0, backgroundColor: "hsl(152 76% 50% / 0.55)" }}
              animate={{ opacity: 1, backgroundColor: "hsl(152 76% 50% / 0.22)" }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.005, 0.3) }}
              className="rounded-sm px-0.5 text-success"
              style={{ boxShadow: "inset 0 -1px 0 hsl(152 76% 50% / 0.7)" }}
            >
              {s.text}
            </motion.span>
          );
        }
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, backgroundColor: "hsl(0 84% 62% / 0.55)" }}
            animate={{ opacity: 1, backgroundColor: "hsl(0 84% 62% / 0.18)" }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.005, 0.3) }}
            className="rounded-sm px-0.5 text-destructive line-through"
            style={{ boxShadow: "inset 0 -1px 0 hsl(0 84% 62% / 0.7)" }}
          >
            {s.text}
          </motion.span>
        );
      })}
    </pre>
  );
}
