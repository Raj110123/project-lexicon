import { Reorder, motion, AnimatePresence, useDragControls } from "framer-motion";
import { useState } from "react";
import { GripVertical, Trash2, Check, Pencil } from "lucide-react";
import { BLOCK_META, type Block } from "@/lib/lexicon/blocks";

interface BlockCardProps {
  block: Block;
  index: number;
  active: boolean;
  onActivate: () => void;
  onChange: (text: string) => void;
  onDelete: () => void;
}

export function BlockCard({ block, index, active, onActivate, onChange, onDelete }: BlockCardProps) {
  const meta = BLOCK_META[block.type];
  const Icon = meta.icon;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(block.text);
  const controls = useDragControls();

  const commit = () => {
    onChange(draft);
    setEditing(false);
  };

  return (
    <Reorder.Item
      value={block}
      id={block.id}
      dragListener={false}
      dragControls={controls}
      onPointerDown={onActivate}
      whileDrag={{ scale: 1.02, zIndex: 50, boxShadow: `0 24px 60px -20px hsl(${meta.hsl} / 0.5)` }}
      transition={{ type: "spring", stiffness: 350, damping: 30, mass: 0.6 }}
      className="list-none"
    >
      <motion.div
        layout
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="group relative"
      >
        <div
          className={`relative overflow-hidden rounded-2xl border bg-card/70 p-4 backdrop-blur-md transition-all ${
            active ? "border-transparent" : "border-border/60 hover:border-border"
          }`}
          style={
            active
              ? { boxShadow: `inset 0 0 0 1px hsl(${meta.hsl} / 0.65), 0 0 28px hsl(${meta.hsl} / 0.28)` }
              : undefined
          }
        >
          {/* Left accent bar */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-[3px]"
            style={{
              background: `linear-gradient(180deg, hsl(${meta.hsl} / 0.95), hsl(${meta.hsl} / 0.25))`,
              opacity: active ? 1 : 0.6,
            }}
          />
          {/* Subtle background tint */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(at top left, hsl(${meta.hsl} / 0.08), transparent 60%)` }}
          />

          <div className="relative flex items-start gap-3">
            {/* Drag handle */}
            <button
              type="button"
              onPointerDown={(e) => {
                onActivate();
                controls.start(e);
              }}
              className="mt-0.5 flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-md border border-border/60 bg-background/40 text-muted-foreground transition-all hover:bg-background/80 hover:text-foreground active:cursor-grabbing"
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </button>

            {/* Type chip */}
            <div
              className="flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2 font-mono text-[10px] font-semibold uppercase tracking-wider"
              style={{
                background: `hsl(${meta.hsl} / 0.14)`,
                color: `hsl(${meta.hsl})`,
                boxShadow: `inset 0 0 0 1px hsl(${meta.hsl} / 0.35)`,
              }}
            >
              <Icon className="h-3.5 w-3.5" />
              {meta.short}
            </div>

            {/* Index */}
            <div className="mt-1 hidden font-mono text-[10px] text-muted-foreground/60 sm:block">
              {String(index + 1).padStart(2, "0")}
            </div>

            {/* Action icons */}
            <div className="ml-auto flex shrink-0 items-center gap-1">
              {!editing ? (
                <button
                  type="button"
                  onClick={() => {
                    setDraft(block.text);
                    setEditing(true);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
                  aria-label="Edit block"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={commit}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-success transition-colors hover:bg-success/10"
                  aria-label="Save"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onDelete}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                aria-label="Delete block"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="relative mt-3 pl-11">
            <AnimatePresence mode="wait" initial={false}>
              {editing ? (
                <motion.textarea
                  key="edit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={commit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commit();
                    if (e.key === "Escape") {
                      setDraft(block.text);
                      setEditing(false);
                    }
                  }}
                  placeholder={meta.placeholder}
                  className="min-h-[72px] w-full resize-none rounded-lg border border-border/60 bg-background/60 px-3 py-2 font-mono text-sm leading-relaxed text-foreground outline-none transition-all focus:border-transparent"
                  style={{ boxShadow: `inset 0 0 0 1px hsl(${meta.hsl} / 0.5)` }}
                />
              ) : (
                <motion.p
                  key="view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                    setDraft(block.text);
                    setEditing(true);
                  }}
                  className="cursor-text whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-foreground/85"
                >
                  {block.text || (
                    <span className="italic text-muted-foreground/60">{meta.placeholder}</span>
                  )}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </Reorder.Item>
  );
}
