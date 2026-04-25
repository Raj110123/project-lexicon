import { motion } from "framer-motion";
import { ArrowRight, GitCompare, Download, Sparkles } from "lucide-react";

interface HeroProps {
  onTryDemo: () => void;
  onCompare: () => void;
  onExport: () => void;
}

export function Hero({ onTryDemo, onCompare, onExport }: HeroProps) {
  return (
    <section className="relative isolate flex min-h-[92vh] items-center justify-center px-6 pt-20 pb-16">
      <div className="relative z-10 mx-auto w-full max-w-6xl text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium tracking-wider text-primary-glow backdrop-blur"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="uppercase">PS-05 · Hackathon Edition</span>
          <span className="h-1 w-1 rounded-full bg-primary-glow/60" />
          <span className="font-mono text-foreground/70">v0.1.0</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[clamp(2.75rem,9vw,7.5rem)] font-bold leading-[0.95] tracking-tight text-balance"
        >
          <span className="text-gradient">Project</span>{" "}
          <span className="text-gradient-vivid">Lexicon</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-7 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg"
        >
          A block-based prompt composition studio. Drag, reorder and edit
          AST-style blocks to assemble prompts in real time — then compare
          variants, diff at the character level, and preview mock responses.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <CTAButton onClick={onTryDemo} variant="primary">
            Try Demo <ArrowRight className="h-4 w-4" />
          </CTAButton>
          <CTAButton onClick={onCompare} variant="ghost">
            <GitCompare className="h-4 w-4" /> Compare Variants
          </CTAButton>
          <CTAButton onClick={onExport} variant="ghost">
            <Download className="h-4 w-4" /> Export Prompt
          </CTAButton>
        </motion.div>

        {/* Stat strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-16 grid max-w-3xl grid-cols-3 divide-x divide-border/60 rounded-2xl border border-border/60 glass px-2 py-5 text-sm"
        >
          {[
            { v: "7", l: "Block types" },
            { v: "Live", l: "Prompt assembly" },
            { v: "A/B", l: "Diff comparison" },
          ].map((s) => (
            <div key={s.l} className="px-4">
              <div className="font-display text-2xl font-semibold text-gradient">{s.v}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </motion.div>

        {/* Floating preview cards */}
        <FloatingPreviewCards />
      </div>
    </section>
  );
}

function CTAButton({
  children,
  onClick,
  variant,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant: "primary" | "ghost";
}) {
  if (variant === "primary") {
    return (
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="btn-magnetic group relative inline-flex h-12 items-center gap-2 rounded-full bg-gradient-primary px-7 text-sm font-semibold text-primary-foreground shadow-glow transition-all"
      >
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-glow to-primary opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </motion.button>
    );
  }
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group relative inline-flex h-12 items-center gap-2 rounded-full border border-border/80 bg-background/40 px-6 text-sm font-medium text-foreground backdrop-blur transition-colors hover:border-primary/50 hover:bg-background/70"
    >
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      <span className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ boxShadow: "0 0 24px hsl(var(--primary) / 0.3)" }} />
    </motion.button>
  );
}

function FloatingPreviewCards() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto hidden h-full max-w-6xl lg:block">
      <motion.div
        initial={{ opacity: 0, y: 24, rotate: -6 }}
        animate={{ opacity: 1, y: 0, rotate: -6 }}
        transition={{ duration: 1.1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-2 top-32 w-56 rounded-2xl glass p-4"
        style={{ borderColor: "hsl(264 92% 66% / 0.3)" }}
      >
        <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "hsl(264 92% 75%)" }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "hsl(264 92% 66%)" }} /> Role
        </div>
        <div className="font-mono text-xs text-foreground/70 leading-relaxed">You are a senior product designer with deep expertise…</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24, rotate: 4 }}
        animate={{ opacity: 1, y: 0, rotate: 4 }}
        transition={{ duration: 1.1, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="absolute right-2 top-48 w-60 rounded-2xl glass p-4"
        style={{ borderColor: "hsl(190 95% 60% / 0.3)" }}
      >
        <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "hsl(190 95% 70%)" }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "hsl(190 95% 60%)" }} /> Context
        </div>
        <div className="font-mono text-xs text-foreground/70 leading-relaxed">We're shipping a block-based prompt composition tool…</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: -2 }}
        transition={{ duration: 1.1, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="absolute right-12 top-[26rem] w-52 rounded-2xl glass p-4"
        style={{ borderColor: "hsl(152 76% 50% / 0.3)" }}
      >
        <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "hsl(152 76% 60%)" }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "hsl(152 76% 50%)" }} /> Format
        </div>
        <div className="font-mono text-xs text-foreground/70 leading-relaxed">Respond in markdown with H2 headings…</div>
      </motion.div>
    </div>
  );
}
