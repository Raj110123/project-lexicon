import { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  BLOCK_META,
  RECOMMENDED,
  assemblePrompt,
  makeBlock,
  type Block,
  type BlockType,
} from "@/lib/lexicon/blocks";
import { storage } from "@/lib/lexicon/storage";

import { AmbientBackground } from "@/components/lexicon/AmbientBackground";
import { Hero } from "@/components/lexicon/Hero";
import { FeatureStrip } from "@/components/lexicon/FeatureStrip";
import { Palette } from "@/components/lexicon/Palette";
import { BlockCanvas } from "@/components/lexicon/BlockCanvas";
import { PromptPreview } from "@/components/lexicon/PromptPreview";
import { CompletenessBadge } from "@/components/lexicon/CompletenessBadge";
import { ActionBar } from "@/components/lexicon/ActionBar";
import { MockResponse } from "@/components/lexicon/MockResponse";
import { CompareMode } from "@/components/lexicon/CompareMode";
import { HistoryPanel } from "@/components/lexicon/HistoryPanel";

const DEFAULT_BLOCKS: Block[] = [
  makeBlock("role"),
  makeBlock("context"),
  makeBlock("constraint"),
  makeBlock("format"),
];

const Index = () => {
  const { toast } = useToast();

  const [blocks, setBlocksState] = useState<Block[]>(() => {
    const saved = storage.loadSession();
    return saved && saved.length ? saved : DEFAULT_BLOCKS;
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggingType, setDraggingType] = useState<BlockType | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [libraryRefresh, setLibraryRefresh] = useState(0);

  const studioRef = useRef<HTMLDivElement>(null);

  // Persist session
  useEffect(() => {
    storage.saveSession(blocks);
  }, [blocks]);

  // Auto-snapshot to history (debounced)
  const lastSnapshotRef = useRef<string>("");
  useEffect(() => {
    const id = setTimeout(() => {
      const sig = JSON.stringify(blocks.map((b) => [b.type, b.text]));
      if (sig === lastSnapshotRef.current) return;
      lastSnapshotRef.current = sig;
      // Only snapshot if non-trivial change
      if (blocks.length > 0) {
        storage.pushHistory(blocks);
      }
    }, 4000);
    return () => clearTimeout(id);
  }, [blocks]);

  const setBlocks = (b: Block[]) => setBlocksState(b);

  const addBlock = (type: BlockType) => {
    const nb = makeBlock(type);
    setBlocks([...blocks, nb]);
    setActiveId(nb.id);
    requestAnimationFrame(() => {
      const el = document.getElementById(nb.id);
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const fullPrompt = useMemo(() => assemblePrompt(blocks), [blocks]);

  const scrollToStudio = () => {
    studioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullPrompt);
      toast({ title: "Prompt copied", description: `${fullPrompt.length} characters on the clipboard.` });
    } catch {
      toast({ title: "Copy failed", description: "Clipboard unavailable.", variant: "destructive" });
    }
  };

  const handleExport = () => {
    const blob = new Blob([fullPrompt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lexicon-prompt-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: a.download });
  };

  const handleSave = () => {
    const name = window.prompt("Name this template:", `Composition · ${new Date().toLocaleDateString()}`);
    if (!name) return;
    storage.saveTemplate(name, blocks);
    setLibraryRefresh((n) => n + 1);
    toast({ title: "Template saved", description: `“${name}” added to your library.` });
  };

  const handleLoad = () => {
    setHistoryOpen(true);
  };

  const handleHistoryLoad = (b: Block[]) => {
    // give every loaded block a fresh id to avoid collisions
    setBlocks(b.map((x) => ({ ...x, id: makeBlock(x.type, x.text).id })));
    toast({ title: "Loaded", description: `${b.length} blocks restored.` });
  };

  const handleClear = () => {
    if (blocks.length && !window.confirm("Clear all blocks?")) return;
    setBlocks([]);
    setActiveId(null);
  };

  const handleAddMissing = (t: BlockType) => {
    addBlock(t);
    toast({ title: `${BLOCK_META[t].label} added`, description: "Recommended block inserted." });
  };

  return (
    <main className="relative min-h-screen text-foreground">
      <AmbientBackground />

      {/* Top nav */}
      <nav className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
            <span className="font-display text-sm font-bold">L</span>
          </div>
          <span className="font-display text-sm font-semibold tracking-wide">Lexicon</span>
          <span className="ml-2 hidden font-mono text-[10px] text-muted-foreground sm:inline">PS-05</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHistoryOpen(true)}
            className="hidden h-9 items-center gap-1.5 rounded-full border border-border/60 bg-background/40 px-4 text-xs font-medium backdrop-blur transition-all hover:border-primary/40 hover:bg-background sm:inline-flex"
          >
            Library
          </button>
          <button
            onClick={scrollToStudio}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gradient-primary px-4 text-xs font-semibold text-primary-foreground shadow-glow transition-all hover:shadow-[0_0_30px_hsl(var(--primary)/0.55)]"
          >
            Open studio
          </button>
        </div>
      </nav>

      {/* Hero */}
      <Hero
        onTryDemo={scrollToStudio}
        onCompare={() => { scrollToStudio(); setCompareOpen(true); }}
        onExport={() => { scrollToStudio(); handleExport(); }}
      />

      <FeatureStrip />

      {/* Studio */}
      <section ref={studioRef} className="relative px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-primary-glow">
                The Studio
              </div>
              <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Compose your <span className="text-gradient-vivid">prompt</span>
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Drag blocks in from the left, edit inline, reorder by dragging the grip handle.
                The right panel rebuilds your prompt live.
              </p>
            </div>
          </div>

          <div className="mb-4">
            <ActionBar
              onSave={handleSave}
              onLoad={handleLoad}
              onCopy={handleCopy}
              onExport={handleExport}
              onClear={handleClear}
              onCompare={() => setCompareOpen(true)}
              onHistory={() => setHistoryOpen(true)}
            />
          </div>

          <div className="mb-4">
            <CompletenessBadge blocks={blocks} onAddMissing={handleAddMissing} />
          </div>

          {/* 3-column layout: palette | canvas | preview */}
          <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_minmax(0,420px)]">
            <div className="lg:sticky lg:top-20 lg:self-start">
              <Palette
                onAdd={addBlock}
                onDragStart={setDraggingType}
                onDragEnd={() => setDraggingType(null)}
                draggingType={draggingType}
              />
            </div>

            <div className="min-h-[560px]">
              <BlockCanvas
                blocks={blocks}
                setBlocks={setBlocks}
                onAddType={addBlock}
                activeId={activeId}
                setActiveId={setActiveId}
              />
            </div>

            <div className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)]">
              <div className="flex h-full min-h-[560px] flex-col">
                <PromptPreview blocks={blocks} onCopy={handleCopy} onExport={handleExport} />
              </div>
            </div>
          </div>

          {/* Mock response */}
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <MockResponse blocks={blocks} />
            <div className="rounded-2xl glass p-5">
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Pro tip
              </div>
              <h4 className="mt-1 font-display text-lg font-semibold">
                Toggle <span className="text-gradient-vivid">Compare</span> to A/B test
              </h4>
              <p className="mt-2 text-sm text-muted-foreground">
                Open Comparison Mode to strip selected block types from a variant and see
                a character-level diff. Perfect for justifying which blocks earn their place.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {RECOMMENDED.map((t) => {
                  const m = BLOCK_META[t];
                  return (
                    <div
                      key={t}
                      className="rounded-lg border border-border/60 bg-background/40 px-2 py-2 text-center"
                    >
                      <div
                        className="mx-auto mb-1 h-2 w-2 rounded-full"
                        style={{ background: `hsl(${m.hsl})`, boxShadow: `0 0 8px hsl(${m.hsl} / 0.7)` }}
                      />
                      <div className="font-mono text-[9px] font-semibold uppercase tracking-wider" style={{ color: `hsl(${m.hsl})` }}>
                        {m.short}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 px-6 py-10 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="font-display text-sm font-semibold uppercase tracking-wider text-gradient">
            Project Lexicon
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Hackathon submission · PS-05 · Block-based prompt composition.
            Crafted with framer-motion, Tailwind, and a lot of caffeine.
          </p>
        </div>
      </footer>

      {/* Overlays */}
      <CompareMode blocks={blocks} open={compareOpen} onClose={() => setCompareOpen(false)} />
      <HistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onLoad={handleHistoryLoad}
        refreshKey={libraryRefresh}
      />
    </main>
  );
};

export default Index;
