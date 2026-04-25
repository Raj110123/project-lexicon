import { motion, AnimatePresence } from "framer-motion";
import { Copy, Download, FileCode2 } from "lucide-react";
import { BLOCK_META, type Block } from "@/lib/lexicon/blocks";

interface PromptPreviewProps {
  blocks: Block[];
  onCopy: () => void;
  onExport: () => void;
}

export function PromptPreview({ blocks, onCopy, onExport }: PromptPreviewProps) {
  const totalChars = blocks.reduce((s, b) => s + b.text.length, 0);

  return (
    <div className="flex h-full flex-col rounded-2xl glass-strong">
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
        <div className="flex items-center gap-2">
          <FileCode2 className="h-4 w-4 text-primary-glow" />
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider">Live Prompt</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {totalChars} chars
          </span>
          <div className="ml-2 flex items-center gap-1">
            <IconBtn label="Copy" onClick={onCopy}><Copy className="h-3.5 w-3.5" /></IconBtn>
            <IconBtn label="Export" onClick={onExport}><Download className="h-3.5 w-3.5" /></IconBtn>
          </div>
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto px-5 py-4">
        {blocks.length === 0 ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
            <div className="font-mono text-xs text-muted-foreground/60">// no blocks yet</div>
            <div className="mt-2 text-sm text-muted-foreground">Your assembled prompt appears here in real time.</div>
          </div>
        ) : (
          <div className="font-mono text-sm leading-[1.7]">
            <AnimatePresence initial={false}>
              {blocks.map((b, i) => {
                const meta = BLOCK_META[b.type];
                return (
                  <motion.div
                    key={b.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-4"
                  >
                    <div
                      className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: `hsl(${meta.hsl})` }}
                    >
                      <span className="opacity-60">[</span>
                      {meta.prefix}
                      <span className="opacity-60">]</span>
                    </div>
                    <motion.div
                      key={b.text}
                      initial={{ opacity: 0.4 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-pre-wrap break-words pl-3 text-foreground/90"
                      style={{
                        borderLeft: `2px solid hsl(${meta.hsl} / 0.4)`,
                      }}
                    >
                      {b.text || <span className="italic text-muted-foreground/50">{meta.placeholder}</span>}
                    </motion.div>
                    {i < blocks.length - 1 && (
                      <div className="mt-2 text-muted-foreground/30">———</div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background/40 text-muted-foreground transition-all hover:border-primary/40 hover:bg-background hover:text-foreground"
    >
      {children}
    </button>
  );
}
