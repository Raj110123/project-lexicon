import { motion } from "framer-motion";
import { BLOCK_META, BLOCK_ORDER, type BlockType } from "@/lib/lexicon/blocks";
import { Plus } from "lucide-react";

interface PaletteProps {
  onAdd: (type: BlockType) => void;
  onDragStart: (type: BlockType) => void;
  onDragEnd: () => void;
  draggingType: BlockType | null;
}

export function Palette({ onAdd, onDragStart, onDragEnd, draggingType }: PaletteProps) {
  return (
    <aside className="glass-strong h-full rounded-2xl p-4">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Palette
        </h3>
        <span className="font-mono text-[10px] text-muted-foreground/70">7 blocks</span>
      </div>

      <div className="space-y-2">
        {BLOCK_ORDER.map((t, i) => {
          const meta = BLOCK_META[t];
          const Icon = meta.icon;
          const isDragging = draggingType === t;
          return (
            <motion.div
              key={t}
              draggable
              onDragStart={(e) => {
                (e as unknown as DragEvent).dataTransfer?.setData("text/lexicon-block", t);
                if ((e as unknown as DragEvent).dataTransfer) {
                  (e as unknown as DragEvent).dataTransfer!.effectAllowed = "copy";
                }
                onDragStart(t);
              }}
              onDragEnd={onDragEnd}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="group relative cursor-grab active:cursor-grabbing"
              style={{ opacity: isDragging ? 0.5 : 1 }}
            >
              <div
                className="relative overflow-hidden rounded-xl border border-border/60 bg-card/60 p-3 transition-all hover:border-transparent"
                style={{
                  boxShadow: `0 0 0 1px hsl(${meta.hsl} / 0)`,
                }}
              >
                {/* Hover glow */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(135deg, hsl(${meta.hsl} / 0.18), transparent 70%)`,
                    boxShadow: `inset 0 0 0 1px hsl(${meta.hsl} / 0.45), 0 0 24px hsl(${meta.hsl} / 0.25)`,
                  }}
                />

                <div className="relative flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, hsl(${meta.hsl} / 0.25), hsl(${meta.hsl} / 0.05))`,
                      boxShadow: `inset 0 0 0 1px hsl(${meta.hsl} / 0.4)`,
                      color: `hsl(${meta.hsl})`,
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold leading-tight">{meta.label}</div>
                    <div className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {meta.short}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAdd(t)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background/40 text-muted-foreground opacity-0 transition-all hover:bg-background hover:text-foreground group-hover:opacity-100"
                    aria-label={`Add ${meta.label} block`}
                    title={`Add ${meta.label}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-4 px-1 text-[11px] leading-relaxed text-muted-foreground/80">
        Drag a block onto the canvas, or click <Plus className="inline h-3 w-3" /> to add.
      </p>
    </aside>
  );
}
