import { motion, AnimatePresence } from "framer-motion";
import { Clock, X, Trash2, FileDown, History as HistoryIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { storage, type SavedItem } from "@/lib/lexicon/storage";
import type { Block } from "@/lib/lexicon/blocks";
import { BLOCK_META } from "@/lib/lexicon/blocks";

interface HistoryPanelProps {
  open: boolean;
  onClose: () => void;
  onLoad: (blocks: Block[]) => void;
  refreshKey: number;
}

export function HistoryPanel({ open, onClose, onLoad, refreshKey }: HistoryPanelProps) {
  const [tab, setTab] = useState<"history" | "templates">("history");
  const [history, setHistory] = useState<SavedItem[]>([]);
  const [templates, setTemplates] = useState<SavedItem[]>([]);

  useEffect(() => {
    if (!open) return;
    setHistory(storage.listHistory());
    setTemplates(storage.listTemplates());
  }, [open, refreshKey]);

  const items = tab === "history" ? history : templates;

  const handleDelete = (id: string) => {
    if (tab === "history") {
      storage.deleteHistory(id);
      setHistory(storage.listHistory());
    } else {
      storage.deleteTemplate(id);
      setTemplates(storage.listTemplates());
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-border/60 glass-strong"
          >
            <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
              <div className="flex items-center gap-2">
                <HistoryIcon className="h-4 w-4 text-primary-glow" />
                <h3 className="font-display text-sm font-semibold uppercase tracking-wider">Library</h3>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-background/40 transition-colors hover:bg-background"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-1 px-3 pt-3">
              {(["history", "templates"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium uppercase tracking-wider transition-all ${
                    tab === t
                      ? "bg-primary/15 text-primary-glow"
                      : "text-muted-foreground hover:bg-background/50"
                  }`}
                  style={tab === t ? { boxShadow: "inset 0 0 0 1px hsl(var(--primary) / 0.35)" } : undefined}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {items.length === 0 ? (
                <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-border/60 p-6 text-center">
                  <Clock className="mb-3 h-8 w-8 text-muted-foreground/60" />
                  <div className="text-sm font-medium">No {tab} yet</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {tab === "history"
                      ? "Snapshots are saved automatically as you edit."
                      : "Save your composition as a template to reuse it."}
                  </div>
                </div>
              ) : (
                <ul className="space-y-2">
                  {items.map((it) => (
                    <li key={it.id}>
                      <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/60 p-3 transition-all hover:border-primary/40">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold">{it.name}</div>
                            <div className="font-mono text-[10px] text-muted-foreground">
                              {new Date(it.createdAt).toLocaleString()} · {it.blocks.length} blocks
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(it.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1">
                          {it.blocks.slice(0, 8).map((b, i) => {
                            const m = BLOCK_META[b.type];
                            return (
                              <span
                                key={i}
                                className="rounded-sm px-1 font-mono text-[9px] font-semibold uppercase tracking-wider"
                                style={{
                                  background: `hsl(${m.hsl} / 0.14)`,
                                  color: `hsl(${m.hsl})`,
                                }}
                              >
                                {m.short}
                              </span>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => {
                            onLoad(it.blocks);
                            onClose();
                          }}
                          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border/60 bg-background/40 py-1.5 text-[11px] font-medium transition-all hover:border-primary/40 hover:bg-background"
                        >
                          <FileDown className="h-3 w-3" />
                          Load into canvas
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
