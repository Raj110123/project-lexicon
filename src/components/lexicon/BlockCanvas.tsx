import { Reorder, AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Layers, MousePointerClick } from "lucide-react";
import type { Block, BlockType } from "@/lib/lexicon/blocks";
import { BlockCard } from "./BlockCard";

interface BlockCanvasProps {
  blocks: Block[];
  setBlocks: (b: Block[]) => void;
  onAddType: (t: BlockType) => void;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}

export function BlockCanvas({ blocks, setBlocks, onAddType, activeId, setActiveId }: BlockCanvasProps) {
  const [over, setOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setOver(false);
    const t = e.dataTransfer.getData("text/lexicon-block") as BlockType;
    if (t) onAddType(t);
  };

  return (
    <div className="flex h-full flex-col rounded-2xl glass-strong">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary-glow" />
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider">Composition Canvas</h3>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>{blocks.length} {blocks.length === 1 ? "block" : "blocks"}</span>
          <span className="h-1 w-1 rounded-full bg-success animate-pulse" />
          <span className="text-success">Live</span>
        </div>
      </div>

      {/* Drop area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={handleDrop}
        className={`relative flex-1 overflow-y-auto p-5 transition-all ${
          over ? "bg-primary/5" : ""
        }`}
      >
        {/* Drop overlay */}
        <AnimatePresence>
          {over && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-3 rounded-xl border-2 border-dashed border-primary/60"
              style={{ boxShadow: "inset 0 0 40px hsl(var(--primary) / 0.18)" }}
            >
              <div className="flex h-full items-center justify-center">
                <div className="rounded-full bg-primary/15 px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-primary-glow">
                  Drop to append
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {blocks.length === 0 ? (
          <EmptyState />
        ) : (
          <Reorder.Group
            axis="y"
            values={blocks}
            onReorder={setBlocks}
            className="flex flex-col gap-3"
          >
            <AnimatePresence initial={false}>
              {blocks.map((b, i) => (
                <BlockCard
                  key={b.id}
                  block={b}
                  index={i}
                  active={activeId === b.id}
                  onActivate={() => setActiveId(b.id)}
                  onChange={(text) => {
                    setBlocks(blocks.map((x) => (x.id === b.id ? { ...x, text } : x)));
                  }}
                  onDelete={() => {
                    setBlocks(blocks.filter((x) => x.id !== b.id));
                  }}
                />
              ))}
            </AnimatePresence>
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-border/60 p-8 text-center"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary/20 text-primary-glow shadow-glow-cyan">
        <MousePointerClick className="h-6 w-6" />
      </div>
      <h4 className="font-display text-lg font-semibold">Start composing</h4>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Drag a block from the palette on the left, or click the <strong>+</strong> on any block to insert it here.
      </p>
    </motion.div>
  );
}
