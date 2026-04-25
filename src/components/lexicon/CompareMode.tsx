import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  ArrowLeftRight,
  Award,
  GitCompare,
  Minus,
  Plus,
  Sparkles,
  Trophy,
  X,
  Loader2,
  Database,
  Play,
} from "lucide-react";
import { BLOCK_META, BLOCK_ORDER, type Block, type BlockType, assemblePrompt } from "@/lib/lexicon/blocks";
import { diffStats, diffVariantBlocks, type DiffSegment } from "@/lib/lexicon/diff";

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

  useEffect(() => {
    if (!open) return;

    setRemoved((current) => {
      if (current.size > 0) return current;

      const present = new Set(blocks.map((block) => block.type));
      const defaultStrip = (["role", "tone"] as BlockType[]).filter((type) => present.has(type));

      if (defaultStrip.length > 0) {
        return new Set(defaultStrip);
      }

      const fallback = blocks.at(-1)?.type;
      return fallback ? new Set([fallback]) : current;
    });
  }, [blocks, open]);

  const left = useMemo(() => assemblePrompt(blocks), [blocks]);
  const variantBlocks = useMemo(() => blocks.filter((b) => !removed.has(b.type)), [blocks, removed]);
  const right = useMemo(() => assemblePrompt(variantBlocks), [variantBlocks]);

  const diff = useMemo(() => diffVariantBlocks(blocks, removed), [blocks, removed]);
  const stats = useMemo(() => diffStats(diff), [diff]);

  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const analysisStats = useMemo(() => {
    const totalCompared = Math.max(left.length, 1);
    const changed = stats.added + stats.removed;
    const changePercent = Math.min(100, Math.round((changed / totalCompared) * 100));
    return {
      added: stats.added,
      removed: stats.removed,
      unchanged: stats.unchanged,
      changePercent,
      changeScore: Math.max(1, Math.round(changePercent / 10)),
      removedLabels: Array.from(removed)
        .sort((a, b) => BLOCK_ORDER.indexOf(a) - BLOCK_ORDER.indexOf(b))
        .map((t) => BLOCK_META[t].label),
    };
  }, [left.length, stats, removed]);

  const handleCompare = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const response = await fetch("https://nikunjn8n.up.railway.app/webhook/lexicon-compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blocksA: blocks.map((b) => BLOCK_META[b.type].label),
          blocksB: variantBlocks.map((b) => BLOCK_META[b.type].label),
          promptA: left,
          promptB: right,
        }),
        signal: abortController.signal,
      });

      if (response.ok) {
        const text = await response.text();
        if (text) {
          try {
            const data = JSON.parse(text);
            // Handle n8n output wrapper if present
            const analysis = data.output || data;
            setAiAnalysis(analysis);
          } catch (e) {
            console.error("Failed to parse AI Analysis JSON:", text);
          }
        } else {
          console.warn("AI Analysis returned an empty response.");
        }
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("AI Analysis failed:", error);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsAnalyzing(false);
      }
    }
  };

  const toggle = (t: BlockType) => {
    setRemoved((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const [showMock, setShowMock] = useState(false);
  const effectiveAnalysis = showMock ? {
    better_prompt: "A" as const,
    reasoning: "Prompt A is better structured for AI comprehension because it utilizes multiple strategic blocks. The Role block establishes a clear persona, while the Format block ensures the output adheres to a specific structure, reducing the chance of hallucination compared to the single-block approach in Prompt B.",
    scores: {
      clarityA: 8,
      clarityB: 5,
      specificityA: 7,
      specificityB: 4
    },
    key_differences: [
      "Prompt A defines a Role block which anchors the AI persona",
      "Prompt A includes a Tone block for consistent output style",
      "Prompt B lacks structural constraints leading to ambiguous output"
    ]
  } : aiAnalysis;

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
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary/20 text-primary-glow">
                  <GitCompare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold leading-tight">Comparison Mode</h3>
                  <p className="text-xs text-muted-foreground">
                    Toggle blocks to remove, then read the block-anchored LCS diff.
                  </p>
                </div>
              </div>

              <div className="ml-auto flex items-center gap-4">
                <button
                  onClick={handleCompare}
                  disabled={isAnalyzing}
                  className="group relative flex h-10 items-center gap-2 overflow-hidden rounded-xl bg-primary-glow px-5 font-display text-sm font-bold text-background transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5 fill-current" />
                  )}
                  {isAnalyzing ? "ANALYZING..." : "COMPARE"}
                </button>

                <div className="hidden items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-3 py-2 md:flex">
                  <ScoreRing score={analysisStats.changeScore} />
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      Change score
                    </div>
                    <div className="font-display text-sm font-semibold text-primary-glow">
                      {analysisStats.changePercent}% text changed
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowMock(!showMock)}
                className={`flex h-10 items-center gap-2 rounded-xl border px-3 transition-all ${
                  showMock ? "border-amber-400/50 bg-amber-400/10 text-amber-300" : "border-border/60 bg-background/40"
                }`}
                title="Toggle Sample Data Analysis"
              >
                <Database className="h-4 w-4" />
                <span className="font-mono text-[10px] uppercase font-bold">{showMock ? "Mock ON" : "Mock OFF"}</span>
              </button>

              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background/40 transition-all hover:border-primary/40 hover:bg-background"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-b border-border/50 px-6 py-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Strip from variant:
              </span>
              {presentTypes.length === 0 ? (
                <span className="text-xs text-muted-foreground">
                  No blocks to compare. Add some on the canvas first.
                </span>
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
                        title={`${off ? "Restore" : "Remove"} ${meta.label} in Prompt B`}
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

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-px overflow-hidden bg-border/50 lg:grid-cols-2">
              <Pane title="A - Full composition" blocks={blocks} removed={new Set()} accent="hsl(264 92% 66%)" />
              <Pane title="B - Stripped variant" blocks={blocks} removed={removed} accent="hsl(190 95% 60%)" />
            </div>

            <div className="grid max-h-[42vh] border-t border-border/50 bg-background/40 lg:grid-cols-[390px_minmax(0,1fr)]">
              <ComparisonAnalysis analysis={effectiveAnalysis} isAnalyzing={isAnalyzing} stats={analysisStats} />
              <div className="min-h-0 border-t border-border/50 lg:border-l lg:border-t-0">
                <div className="flex items-center gap-2 px-6 py-3">
                  <ArrowLeftRight className="h-4 w-4 text-primary-glow" />
                  <span className="font-display text-sm font-semibold uppercase tracking-wider">
                    Block-anchored LCS diff
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                    green added · red removed · gray unchanged
                  </span>
                </div>
                <div className="max-h-[30vh] overflow-y-auto border-t border-border/50 px-6 py-4">
                  <DiffView segments={diff} />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Pane({
  title,
  blocks,
  removed,
  accent,
}: {
  title: string;
  blocks: Block[];
  removed: Set<BlockType>;
  accent: string;
}) {
  const visibleBlocks = blocks.filter((block) => !removed.has(block.type));

  return (
    <div className="flex min-h-0 flex-col bg-background/40">
      <div
        className="flex items-center gap-2 border-b border-border/40 px-5 py-3 font-mono text-[11px] uppercase tracking-wider"
        style={{ color: accent }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
        {title}
      </div>
      <div className="flex-1 space-y-3 overflow-auto px-5 py-4">
        {visibleBlocks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 p-5 text-sm text-muted-foreground">
            // empty variant - every selected block has been stripped
          </div>
        ) : (
          visibleBlocks.map((block, index) => {
            const meta = BLOCK_META[block.type];
            const text = `[${meta.prefix}]\n${block.text.trim()}`;

            return (
              <motion.pre
                key={block.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.18) }}
                className="whitespace-pre-wrap break-words rounded-xl border bg-background/45 p-3 font-mono text-xs leading-[1.65] text-foreground/85"
                style={{
                  borderColor: `hsl(${meta.hsl} / 0.4)`,
                  boxShadow: `inset 3px 0 0 hsl(${meta.hsl}), 0 0 24px hsl(${meta.hsl} / 0.08)`,
                }}
              >
                <span style={{ color: `hsl(${meta.hsl})` }}>{`[${meta.prefix}]`}</span>
                {`\n${text.split("\n").slice(1).join("\n")}`}
              </motion.pre>
            );
          })
        )}
      </div>
    </div>
  );
}

interface AIAnalysisResponse {
  better_prompt: "A" | "B";
  reasoning: string;
  scores: {
    clarityA: number;
    clarityB: number;
    specificityA: number;
    specificityB: number;
  };
  key_differences: string[];
}

interface AnalysisStats {
  added: number;
  removed: number;
  unchanged: number;
  changePercent: number;
  changeScore: number;
  removedLabels: string[];
}


function ScoreRing({ score }: { score: number }) {
  return (
    <div className="relative grid h-12 w-12 place-items-center rounded-full border border-primary/40 bg-background/60">
      <div
        className="absolute inset-1 rounded-full"
        style={{ background: `conic-gradient(hsl(48 96% 56%) ${score * 10}%, hsl(var(--border)) 0)` }}
      />
      <div className="relative grid h-8 w-8 place-items-center rounded-full bg-background font-display text-sm font-bold text-amber-300">
        {score}
      </div>
    </div>
  );
}

function ComparisonAnalysis({
  analysis,
  isAnalyzing,
  stats,
}: {
  analysis: AIAnalysisResponse | null;
  isAnalyzing: boolean;
  stats: AnalysisStats;
}) {
  return (
    <div className="min-h-0 overflow-y-auto px-6 py-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-amber-300" />
          <span className="font-display text-base font-semibold uppercase tracking-wider">Quality Score</span>
          {isAnalyzing && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
        </div>
        <div className="flex text-amber-300">
          {[0, 1, 2].map((i) => (
            <Sparkles key={i} className="h-4 w-4 fill-current opacity-70" />
          ))}
        </div>
      </div>

      <div className="space-y-2 relative">
        <MetricBar label="Clarity A" value={analysis ? analysis.scores.clarityA * 10 : 0} color="hsl(152 76% 52%)" />
        <MetricBar label="Clarity B" value={analysis ? analysis.scores.clarityB * 10 : 0} color="hsl(190 95% 60%)" />
        <MetricBar label="Specificity A" value={analysis ? analysis.scores.specificityA * 10 : 0} color="hsl(152 76% 52%)" />
        <MetricBar label="Specificity B" value={analysis ? analysis.scores.specificityB * 10 : 0} color="hsl(190 95% 60%)" />
        
        {isAnalyzing && !analysis && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
                <span className="font-mono text-[10px] text-muted-foreground animate-pulse uppercase tracking-widest">Evaluating...</span>
            </div>
        )}
      </div>

      {analysis && (
          <div className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3">
            <div className="flex items-center gap-2 font-display text-lg font-semibold">
              <Trophy className="h-5 w-5 text-amber-300" />
              Better Prompt: {analysis.better_prompt}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-foreground/80">
              {analysis.reasoning}
            </p>
          </div>
      )}

      <div className="mt-4">
        <div className="font-display text-sm font-semibold uppercase tracking-wider">Key Differences</div>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-foreground/80">
          {analysis ? analysis.key_differences.map((diff, i) => (
             <li key={i} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-glow" />
                {diff}
             </li>
          )) : (
             <li className="flex gap-2 opacity-50">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                Waiting for AI analysis...
             </li>
          )}
          <li className="flex gap-2 pt-2 mt-2 border-t border-border/50">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
            <span>{stats.changePercent}% of compared text changed; {stats.unchanged} characters stayed unchanged.</span>
          </li>
        </ul>
        <div className="mt-4 font-mono text-[10px] text-muted-foreground flex items-center gap-1.5">
          <div className={`h-1.5 w-1.5 rounded-full ${isAnalyzing ? "bg-amber-400 animate-pulse" : analysis ? "bg-success" : "bg-muted-foreground"}`} />
          {isAnalyzing ? "Analyzing prompt comparison..." : "Live n8n workflow webhook connected."}
        </div>
      </div>
    </div>
  );
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="grid grid-cols-[96px_minmax(0,1fr)_34px] items-center gap-2 font-mono text-[11px]">
      <span className="text-muted-foreground">{label}</span>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted/35">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 12px ${color}` }}
        />
      </div>
      <span className="text-right text-foreground/80">{value}</span>
    </div>
  );
}

function DiffView({ segments }: { segments: DiffSegment[] }) {
  if (!segments.length) {
    return <div className="text-sm text-muted-foreground">No differences.</div>;
  }

  return (
    <div className="space-y-3">
      {segments.map((s, i) => {
        const blockType = getSegmentBlockType(s.text);
        const meta = blockType ? BLOCK_META[blockType] : null;
        const color = meta ? `hsl(${meta.hsl})` : "hsl(var(--muted-foreground))";
        const [label, ...body] = s.text.split("\n");
        const isDeleted = s.type === "deleted";
        const isAdded = s.type === "added";

        if (s.type === "unchanged") {
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.025, 0.2) }}
              className="rounded-xl border bg-background/35 p-3 font-mono text-xs leading-[1.7] text-foreground/55"
              style={{
                borderColor: meta ? `hsl(${meta.hsl} / 0.25)` : "hsl(var(--border))",
                boxShadow: meta ? `inset 3px 0 0 hsl(${meta.hsl} / 0.75)` : undefined,
              }}
            >
              <div className="font-semibold" style={{ color }}>{label}</div>
              <div className="mt-1 whitespace-pre-wrap break-words">{body.join("\n")}</div>
            </motion.div>
          );
        }

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.025, 0.2) }}
            className={`rounded-xl border p-3 font-mono text-xs leading-[1.7] ${
              isAdded ? "border-success/40 bg-success/10 text-success" : "border-destructive/45 bg-destructive/10 text-destructive"
            }`}
            style={{
              boxShadow: `inset 3px 0 0 ${isAdded ? "hsl(152 76% 50%)" : "hsl(0 84% 62%)"}`,
            }}
            title={isAdded ? "Added in Prompt B" : "Removed from Prompt B"}
          >
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-background/50 px-1.5 py-0.5 font-semibold" style={{ color }}>
                {label}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-wider opacity-80">
                {isAdded ? "added" : "removed"}
              </span>
            </div>
            <div className={`mt-2 whitespace-pre-wrap break-words ${isDeleted ? "line-through decoration-2" : ""}`}>
              {body.join("\n")}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function getSegmentBlockType(text: string): BlockType | null {
  const label = text.match(/^\[([^\]]+)\]/)?.[1];
  if (!label) return null;

  return BLOCK_ORDER.find((type) => BLOCK_META[type].prefix === label) ?? null;
}
