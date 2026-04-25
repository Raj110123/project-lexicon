# Project Lexicon — Block-Based Prompt Composition Studio

A single-page, presentation-ready experience that doubles as a landing page *and* a fully interactive demo. The page tells a story top-to-bottom while the central canvas is a real, working tool.

---

## 1. Visual Language & Design System

A bespoke dark theme tuned for "premium AI product" energy — not generic SaaS.

- **Palette**: deep ink background (near-black with a hint of indigo), elevated glass surfaces, hairline borders. Accent gradient duo: electric violet → cyan, with a warm magenta secondary for emphasis.
- **Per-block-type colors** (each gets its own hue, gradient, icon, and glow):
  - Role — violet
  - Context — cyan
  - Constraint — amber
  - Format — emerald
  - Tone — rose
  - Example — sky blue
  - Output Length — lime
- **Typography**: tight display sans for headings, geometric sans for UI, mono for prompt preview & diff.
- **Texture & depth**: subtle film grain overlay, soft inner highlights on glass cards, layered shadows, faint dotted grid.
- **Background life**: drifting gradient blobs, slow-moving particle field, parallax grid lines, and an orbital element behind the hero.
- All tokens defined as HSL CSS variables in `index.css` and mapped through `tailwind.config.ts` so every component pulls from the design system (no hardcoded colors).

---

## 2. Page Structure (top to bottom)

### Hero
- Oversized "Project Lexicon" wordmark with gradient sheen and a soft entrance reveal.
- Subtitle describing block-based composition, live assembly, reorderable AST blocks, comparison, and mock previews.
- CTA row: **Try Demo** (scrolls to canvas), **Compare Variants** (jumps to compare mode), **Export Prompt**.
- Animated backdrop: drifting blobs, particle drift, subtle grid, orbital ring.
- Floating "preview" cards parallaxing on scroll to hint at the product.

### Feature Marquee
- Scroll-triggered reveal strip: drag-and-drop, live assembly, A/B diff, completeness score, templates, export.
- Each item animates in with stagger as it enters the viewport.

### The Studio (main interactive canvas)
The hero of the page — a real working app embedded in the landing.

**Left palette (sidebar)** — exactly seven draggable block types listed above. Each tile has its own gradient, icon, glow on hover, and a magnetic hover lift. Drag begins a physics-feeling motion with a ghost preview.

**Center canvas** — reorderable list of blocks:
- Drop zones animate open as a dragged block approaches.
- Reorder uses spring transitions so neighbors slide cleanly.
- Each block card has a drag handle, type chip, inline-editable text, delete, and an active luminous outline when focused.
- Empty state with helpful prompt to drag the first block.
- Entry/exit animations on add/remove.

**Right rail — Live Prompt Preview**:
- Editor-style panel with monospaced text.
- Each block's contribution is colored to match its type.
- Updates instantly with smooth crossfade so text never flickers.
- Header shows token-ish character count and copy/export icons.

### Completeness & Actions Bar
- Live **Structural Completeness Score** badge (0–100) with animated ring, listing which recommended blocks are missing as removable chips.
- Buttons: **Save Template**, **Load Template**, **Copy Prompt**, **Export .txt**, **Clear**.
- Toast feedback for every action with smooth slide+fade.

### Comparison Mode (A/B Diff)
- Toggle expands the studio into a dual-pane view with a smooth shared-element transition.
- Left pane = full composition. Right pane = stripped variant (user picks which block types to remove via chips).
- Character-level diff: green for added, red for removed (strikethrough), neutral for unchanged.
- Diff reveals progressively with a subtle stagger.
- Summary bar shows added/removed counts.

### Mock Response Panel
- Card with a "model" badge and shimmer-loading state, then a pre-authored response that adapts based on which block types are present (e.g. tone block makes it more casual, format block returns markdown, constraint block adds bullet limits).
- Response variants are deterministic mappings from the active block set — feels like the prompt is influencing the result.
- Strong visual hierarchy: header, response body, footer with regenerate/copy.

### Prompt History Sidebar
- Slide-in panel listing timestamped saved compositions from localStorage.
- Click to load, hover to preview a snippet, delete with confirm.
- Empty state with friendly illustration.

### Footer
- Compact credits, hackathon tag, repeat of primary CTA.

---

## 3. Interaction & Motion Spec

- Spring-based drag with ghost preview, drop placement animation, and elevation/scale on the dragged item.
- Hover: lift, glow, animated outline, magnetic pull on primary buttons, ripple-like press feedback.
- Inputs: focus glow + animated underline.
- Section reveals on scroll with stagger.
- Panel slide-in/out for history and comparison.
- Toasts: slide+fade with success/error variants.
- Subtle 3D tilt on key cards (response, score badge).
- All motion tuned to feel fast and confident — never sluggish.

---

## 4. Persistence & Utilities

- localStorage for: saved templates (named + timestamped), prompt history, last session auto-restore.
- Copy-to-clipboard with success toast.
- .txt export via Blob download.
- Completeness score = weighted check across recommended block types.
- Diff implemented as a lightweight LCS-based char diff (no heavy deps).

---

## 5. Tech Choices

- React + Vite + TypeScript + Tailwind (existing stack).
- **framer-motion** for drag, reorder, layout, and reveal animations (industry-standard for this caliber of motion).
- **lucide-react** for icons (already available).
- Existing **shadcn/ui** primitives for buttons, tooltips, dialogs, toasts, badges.
- No backend required — fully client-side, instant demo.

---

## 6. Out of Scope (for this build)

- Real LLM calls (responses are pre-authored and structure-driven by design).
- Auth / multi-user sync.
- Mobile-optimized drag (we'll degrade gracefully: palette becomes a tap-to-add list under `md`, full drag experience on desktop where the demo will be judged).

---

## Deliverable

A single polished route (`/`) that loads into the hero, scrolls into the live studio, and lets a judge: drag blocks in, edit them, reorder, see the live prompt build, toggle compare mode with diff, view a mock response that reacts to structure, save/load templates, and export — all wrapped in cinematic motion and a cohesive premium dark aesthetic.