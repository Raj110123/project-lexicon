import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import { Sparkles, RefreshCw, Bot } from "lucide-react";
import type { Block } from "@/lib/lexicon/blocks";
import { generateMockResponse } from "@/lib/lexicon/response";

interface MockResponseProps {
  blocks: Block[];
}

export function MockResponse({ blocks }: MockResponseProps) {
  const response = useMemo(() => generateMockResponse(blocks), [blocks]);
  const [loading, setLoading] = useState(false);
  const [seed, setSeed] = useState(0);

  // brief shimmer when blocks change
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 480);
    return () => clearTimeout(t);
  }, [blocks, seed]);

  return (
    <div className="rounded-2xl glass-strong p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary/20 text-primary-glow">
            <Bot className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-success animate-pulse" />
          </div>
          <div>
            <div className="font-display text-sm font-semibold uppercase tracking-wider">Mock Response</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              lexicon · structure-aware preview
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          className="flex h-8 items-center gap-1.5 rounded-md border border-border/60 bg-background/40 px-3 text-[11px] font-medium transition-all hover:border-primary/40 hover:bg-background"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Regenerate
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="h-5 w-2/3 rounded-md bg-muted/40 shimmer" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-muted/30 shimmer" />
              <div className="h-3 w-11/12 rounded bg-muted/30 shimmer" />
              <div className="h-3 w-9/12 rounded bg-muted/30 shimmer" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`r-${seed}-${response.title}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary-glow">
                {response.meta.style}
              </span>
              <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {response.meta.length}
              </span>
            </div>

            <h4 className="font-display text-xl font-semibold leading-tight text-gradient">
              {response.title}
            </h4>

            <p className="text-sm leading-relaxed text-foreground/85">
              {response.summary}
            </p>

            <ul className="space-y-2">
              {response.bullets.map((b, i) => (
                <motion.li
                  key={`${seed}-${i}-${b}`}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4 }}
                  className="flex gap-3 text-sm leading-relaxed text-foreground/80"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary-glow" />
                  <span>{b}</span>
                </motion.li>
              ))}
            </ul>

            <div className="flex items-center gap-2 border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              {response.footer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
