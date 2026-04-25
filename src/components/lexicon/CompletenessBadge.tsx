import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { BLOCK_META, RECOMMENDED, completeness, type Block } from "@/lib/lexicon/blocks";

interface CompletenessBadgeProps {
  blocks: Block[];
  onAddMissing: (t: (typeof RECOMMENDED)[number]) => void;
}

export function CompletenessBadge({ blocks, onAddMissing }: CompletenessBadgeProps) {
  const { score, missing } = completeness(blocks);
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 90 ? "hsl(152 76% 55%)" :
    score >= 60 ? "hsl(190 95% 65%)" :
    score >= 30 ? "hsl(35 95% 60%)" :
                  "hsl(340 92% 66%)";

  return (
    <div className="rounded-2xl glass-strong p-4">
      <div className="flex items-center gap-4">
        {/* Animated ring */}
        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
            <circle cx="32" cy="32" r={radius} stroke="hsl(var(--border))" strokeWidth="5" fill="none" />
            <motion.circle
              cx="32"
              cy="32"
              r={radius}
              stroke={color}
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ strokeDasharray: circumference, filter: `drop-shadow(0 0 6px ${color})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={score}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="font-display text-base font-bold leading-none"
              style={{ color }}
            >
              {score}
            </motion.span>
            <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">/100</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary-glow" />
            <span className="font-display text-sm font-semibold uppercase tracking-wider">
              Structural completeness
            </span>
          </div>

          {missing.length === 0 ? (
            <p className="mt-1 text-xs text-success">All recommended blocks present. Solid composition.</p>
          ) : (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">Missing:</span>
              {missing.map((t) => {
                const m = BLOCK_META[t];
                return (
                  <button
                    key={t}
                    onClick={() => onAddMissing(t)}
                    className="group inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider transition-all hover:scale-105"
                    style={{
                      background: `hsl(${m.hsl} / 0.12)`,
                      color: `hsl(${m.hsl})`,
                      boxShadow: `inset 0 0 0 1px hsl(${m.hsl} / 0.35)`,
                    }}
                    title={`Add ${m.label} block`}
                  >
                    + {m.short}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
