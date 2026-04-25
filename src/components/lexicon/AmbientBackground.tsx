import { motion } from "framer-motion";

/**
 * Cinematic animated backdrop:
 * - drifting gradient blobs
 * - parallax dotted grid
 * - slow orbital ring
 * - particle drift
 * - subtle film grain
 *
 * Pure CSS + framer-motion. Pointer-events disabled.
 */
export function AmbientBackground() {
  // Pre-compute particle positions deterministically
  const particles = Array.from({ length: 28 }, (_, i) => {
    const seed = i * 9301 + 49297;
    const x = (seed % 100);
    const y = ((seed * 1.7) % 100);
    const size = 1 + ((seed * 0.3) % 3);
    const dur = 12 + ((seed * 0.5) % 18);
    const delay = (seed * 0.2) % 10;
    return { x, y, size, dur, delay };
  });

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Grid */}
      <div className="absolute inset-0 bg-grid bg-grid-fade animate-drift opacity-50" />

      {/* Drifting blobs */}
      <motion.div
        className="absolute -top-32 -left-32 h-[42rem] w-[42rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(264 92% 50% / 0.45), transparent 60%)" }}
        animate={{ x: [0, 80, -40, 0], y: [0, 60, -20, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -top-20 right-[-10rem] h-[36rem] w-[36rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(190 95% 50% / 0.4), transparent 60%)" }}
        animate={{ x: [0, -60, 40, 0], y: [0, 40, -30, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-12rem] left-1/3 h-[40rem] w-[40rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(320 90% 50% / 0.32), transparent 60%)" }}
        animate={{ x: [0, 50, -50, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Orbital ring (hero only — placed at top of viewport) */}
      <div className="absolute left-1/2 top-[18vh] -translate-x-1/2 -translate-y-1/2">
        <div className="relative h-[60vh] w-[60vh] max-h-[700px] max-w-[700px] opacity-40">
          <div className="absolute inset-0 rounded-full border border-primary/20 animate-orbit" style={{ animationDuration: "60s" }} />
          <div className="absolute inset-8 rounded-full border border-primary-glow/20 animate-orbit" style={{ animationDuration: "90s", animationDirection: "reverse" }} />
          <div className="absolute inset-20 rounded-full border border-accent/15 animate-orbit" style={{ animationDuration: "120s" }} />
        </div>
      </div>

      {/* Particles */}
      <div className="absolute inset-0">
        {particles.map((p, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: i % 3 === 0
                ? "hsl(190 95% 70% / 0.9)"
                : i % 3 === 1
                ? "hsl(264 92% 75% / 0.8)"
                : "hsl(320 90% 75% / 0.7)",
              boxShadow: "0 0 8px currentColor",
              color: i % 3 === 0 ? "hsl(190 95% 70%)" : i % 3 === 1 ? "hsl(264 92% 75%)" : "hsl(320 90% 75%)",
            }}
            animate={{ y: [0, -30, 0], opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />

      {/* Film grain */}
      <div className="absolute inset-0 noise" />
    </div>
  );
}
