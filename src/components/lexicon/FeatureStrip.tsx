import { motion } from "framer-motion";
import { MousePointer2, Activity, GitCompare, Gauge, Save, Download } from "lucide-react";

const FEATURES = [
  { icon: MousePointer2, title: "Drag & drop blocks", desc: "Physics-based motion with ghost preview and animated drop zones." },
  { icon: Activity, title: "Live prompt assembly", desc: "Composition rebuilds character-by-character as you edit." },
  { icon: GitCompare, title: "A/B character diff", desc: "LCS-based diff with green/red highlighting and progressive reveal." },
  { icon: Gauge, title: "Completeness score", desc: "Live structural score with chips for missing recommended blocks." },
  { icon: Save, title: "Templates & history", desc: "Persisted to localStorage. Save, load and reload past compositions." },
  { icon: Download, title: "Copy & export", desc: "One-click copy to clipboard or download as a .txt file." },
];

export function FeatureStrip() {
  return (
    <section className="relative px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 text-center"
        >
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
            <span className="h-1 w-1 rounded-full bg-primary-glow" />
            What you get
          </div>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Six pillars of <span className="text-gradient-vivid">composable prompting</span>
          </h2>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden rounded-2xl glass p-5"
            >
              <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "radial-gradient(at top right, hsl(var(--primary) / 0.15), transparent 60%)" }} />
              <div className="relative">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary/20 text-primary-glow shadow-glow-cyan">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
