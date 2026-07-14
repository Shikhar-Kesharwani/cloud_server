# 🌌 NEXUS CLOUD — Design System v2
### Codename: **EVENT HORIZON**
*A self-hosted cloud that doesn't manage files — it orchestrates your digital gravity.*

---

## ⚡ What Changed From v1 (The Delta)

Your v1 was already strong: clean tokens, real module thinking, a command palette, glass. Most "premium" prompts stop there. The gap wasn't polish — it was **missing dimensions**. A god-level interface isn't more shadows and gradients; it's a *complete perceptual system*. Here is exactly what v1 lacked and what v2 adds:

| v1 had | v2 adds (the missing dimension) |
|---|---|
| Hex palette | **OKLCH perceptual color science** + semantic derivation + dynamic theming |
| Type scale | **Variable fonts, fluid `clamp()`, optical sizing, numeric figures** |
| Box-shadow "depth" | **A real lighting model + z-axis layering + parallax** |
| "Use Framer Motion sparingly" | **A full motion grammar** (curves, durations, choreography, physics) |
| Hover states | **Micro-interaction physics + custom cursor/pointer system** |
| Nothing | **Sound design** |
| Static layouts | **Cutting-edge layout engine** (container queries, view transitions, scroll-driven anim, anchor positioning, `:has()`) |
| Empty states only | **Complete state-machine matrix** (loading/degraded/offline/conflict/optimistic) |
| AI as a bolt-on button | **Adaptive/intelligent UI** — the chrome itself is aware |
| WCAG AA mention | **Accessibility as a first-class design axis** (cognitive, designed-contrast, SR choreography) |
| Nothing | **Performance & perceived-performance budget** |
| "Dark mode only" | **Personalization system** (density, accent extraction, aesthetic skins) |
| Nothing | **Gesture vocabulary + onboarding choreography** |
| Good signature elements | **"Impossible" features** nobody ships (chrono-scrub, spatial canvas, whisper mode) |
| No rationale | **Cognitive design laws** attached to every major decision |

This document is authored, not assembled. Every decision below carries its *why*.

---

# PART 1 — PHILOSOPHY & COGNITIVE LAWS 🧠

Design without rationale is decoration. Every rule in this system is anchored to a perceptual or cognitive principle. When two rules conflict, the law wins.

### The Three Tenets
1. **Calm by default, commanding on demand.** The resting UI is quiet. Power surfaces *only* when intent is detected. (Respects *attention residue* — context-switching has a cognitive cost; never interrupt without cause.)
2. **The interface has mass.** Elements obey consistent physics. Motion implies weight, hierarchy, and causality. A deleted file doesn't vanish — it falls. The brain trusts a world with consistent gravity.
3. **Sovereignty of focus.** The user's current object is the sun; everything else orbits and dims. (Gestalt *figure-ground*, enforced systematically, not per-screen.)

### The Law Table (cite these in code comments & PRs)

| Law | Principle | Applied as |
|---|---|---|
| **Fitts** | Time-to-target ∝ distance/size | Primary actions live at edges/corners (infinite target via edge-clamping); command palette for everything else |
| **Hick** | Decision time ∝ log(choices) | Progressive disclosure; never show >7 sibling actions; overflow into `···` |
| **Miller / Chunking** | 7±2 working memory | Breadcrumbs chunk paths; detail panel groups metadata into accordions |
| **Gestalt proximity** | Near = related | 4px base grid; related controls share a cluster, separated by 24px+ |
| **Gestalt continuity** | Eye follows paths | Shared-element transitions; motion along arcs, not teleports |
| **Jakob's Law** | Users expect familiar patterns | Finder/VSCode/Linear mental models reused; novelty only where it *earns* attention |
| **Peak-End Rule** | Memory = peak + end | Upload *completion* and *conflict resolution* get the most delightful moments |
| **Doherty Threshold** | <400ms feels instant | Optimistic UI everywhere; skeleton → content morph, never blank wait |
| **Tesler's Law** | Complexity is conserved | Move complexity to the *system* (smart defaults), never to the *user* |
| **Aesthetic-Usability** | Beautiful is perceived as usable | The premium feel *is* a usability feature — it builds trust in a sovereignty product |

> **Rationale note:** A self-hosted, privacy product lives or dies on *trust*. Trust is built by *consistency* and *calm*, not flash. Hence: motion is purposeful, never decorative; the void background is restful, not "cool."

---

# PART 2 — COLOR SCIENCE 🎨

Hex is dead for serious systems. v2 uses **OKLCH** — perceptually uniform, so a "50% lightness" token *looks* 50% across all hues (hex/HSL lies about this; blue at 50% L looks darker than yellow at 50% L). This is what makes the palette feel *engineered* rather than picked.

### 2.1 The Perceptual Palette (OKLCH)

```css
:root {
  /* Surfaces — a single hue-arc (h≈265, indigo-tinted) so darks feel cohesive, not grey */
  --void:     oklch(13% 0.020 265);   /* #0A0B14 equiv, but tunable */
  --deep:     oklch(16% 0.024 265);
  --surface:  oklch(19% 0.028 265);
  --raised:   oklch(23% 0.032 265);
  --border:   oklch(28% 0.030 265);
  --muted:    oklch(45% 0.025 265);
  --text:     oklch(84% 0.012 265);
  --bright:   oklch(95% 0.008 265);

  /* Accents — chosen at matched *perceived* chroma so none "shouts" */
  --accent:      oklch(68% 0.20 275);   /* electric indigo */
  --accent-2:    oklch(80% 0.14 175);   /* teal pulse */
  --accent-3:    oklch(70% 0.18 25);    /* coral */
  --accent-warn: oklch(82% 0.16 85);    /* amber */

  /* Semantic — DERIVED, never hardcoded. Change --accent, everything follows. */
  --accent-soft:    color-mix(in oklch, var(--accent) 16%, transparent);
  --accent-border:  color-mix(in oklch, var(--accent) 32%, transparent);
  --accent-glow:    color-mix(in oklch, var(--accent) 22%, transparent);
  --on-accent:      oklch(99% 0 0);     /* auto-contrast target */

  /* Status — also perceptually balanced */
  --ok:      oklch(78% 0.16 155);
  --info:    oklch(74% 0.13 230);
  --warn:    oklch(82% 0.16 85);
  --danger:  oklch(70% 0.18 25);
}
```

> **Why `color-mix(in oklch …)`:** soft/border/glow variants stay on the *same hue arc* as the accent at every opacity. In sRGB, mixing toward transparent shifts hue (the "muddy overlay" bug). OKLCH mixing is the single biggest "nobody notices but everyone feels it" upgrade.

### 2.2 Automatic Contrast (WCAG without hand-tuning)
Text-on-surface colors are computed, not guessed. Use the relative-luminance branch so `--on-*` always passes AA:

```css
/* Pseudo-logic implemented via a build step or :has()/light-dark pairing */
--on-surface: oklch( from var(--surface) calc(1 - l) 0 0 );
/* i.e. if surface lightness < 0.5 → text = white-ish, else dark. */
```
In practice: ship a tiny token-compiler (Style Dictionary / custom) that emits `--on-accent` per accent so **re-theming never breaks contrast.** This is the difference between a themeable toy and a themeable product.

### 2.3 Dynamic / Extracted Theming
The accent isn't fixed. Three sources, in priority order:
1. **User-chosen** accent (settings wheel of 12 OKLCH-spaced hues).
2. **Wallpaper/avatar extraction** — sample dominant hue from profile image → set `--accent` (quantize to nearest of 24 hues to keep it tasteful).
3. **Contextual** — a shared album tints its own scope via a CSS `@scope` / scoped custom property, so opening "Wedding 2024" warms the chrome subtly. *The UI remembers where you are emotionally.*

### 2.4 The Glow Discipline
Glow is the easiest thing to overdo. Rule: **glow only on (a) the focused/active element, (b) live status (syncing), (c) the primary CTA at rest.** Everything else uses border + elevation, never glow. Glow = "this is alive or this wants you." Two meanings only.

---

# PART 3 — TYPOGRAPHY 🔤

v1 had a scale. v2 has a *typographic system* — the kind that makes text feel expensive.

### 3.1 Faces (variable, single file each)
- **Display:** `Syne` (variable 400–800) — geometric, wide. Headers, numerals in stat cards.
- **Body/UI:** `Inter` (variable, with `opsz` optical axis) — set `font-optical-sizing: auto` so small UI text gets sturdier stems and large text gets refined ones *automatically*.
- **Mono:** `JetBrains Mono` (variable) — paths, hashes, logs, EXIF, checksums, shortcuts.

### 3.2 Fluid Type (no breakpoint jumps)
Replace fixed px steps with `clamp()` so type breathes with the viewport — one rule, zero media queries:

```css
--text-base: clamp(0.94rem, 0.9rem + 0.2vw, 1.06rem);
--text-lg:   clamp(1.25rem, 1.1rem + 0.8vw, 1.75rem);
--text-xl:   clamp(1.9rem, 1.4rem + 2.4vw, 3.2rem);
--text-2xl:  clamp(2.6rem, 1.6rem + 5vw, 5rem);
```

### 3.3 The Numeric & Text Micro-Settings (the secret sauce)
```css
/* Tabular figures for ALL data columns, timers, sizes — digits never jiggle */
.num, .stat, table td.size, time { font-variant-numeric: tabular-nums; }

/* Proportional + slashed zero for code/paths */
code, .path, .hash { font-variant-numeric: proportional-nums zero; font-feature-settings: "ss01"; }

/* Balanced headlines — no orphan words */
h1, h2, .card-title { text-wrap: balance; }

/* Pretty body — no single trailing word on a line */
p, .preview-snippet { text-wrap: pretty; }

/* Tighten large display via negative tracking that scales with size */
h1 { letter-spacing: calc(-0.02em - 0.005em * (var(--fs, 1))); }
```
> **Why this matters:** tabular-nums alone is the difference between a "dashboard" and a "trading terminal." Users feel precision before they can name it.

### 3.4 Hierarchy by *weight + color*, not just size
Avoid the amateur trap of 8 font sizes. Use 4 sizes × 3 weights × 3 colors (`--bright / --text / --muted`) = a 36-cell matrix. Most "levels" are the *same size*, differentiated by weight and luminance. This is how Linear and Stripe read as calm.

---

# PART 4 — SPATIAL & LIGHTING MODEL 💡

v1 said "depth" and meant shadows. v2 defines an actual **3D space** the UI lives in, with one consistent light source. Inconsistent lighting is the #1 tell of an un-designed dark UI.

### 4.1 The Light Source
**One light, top-left, 35° elevation, slightly cool.** Every elevation, inset highlight, and gradient derives from it. No element gets lit from a different angle — ever.

```css
:root {
  --light-x: -1; --light-y: -1;        /* top-left unit vector */
  --hi:  inset 0 1px 0 oklch(100% 0 0 / 0.05);   /* top edge catch-light */
  --lo:  inset 0 -1px 0 oklch(0% 0 0 / 0.30);    /* bottom edge occlusion */
}
.card { box-shadow: var(--hi), var(--lo), 0 2px 12px oklch(0% 0 0 / .35); }
```

### 4.2 The Z-Axis (elevation tokens, not ad-hoc shadows)
Define discrete *planes*. Elements snap to a plane; they never float between.

| Plane | z | Use | Shadow |
|---|---|---|---|
| `--z-floor` | 0 | page void | none |
| `--z-card` | 1 | file cards, rows | sm |
| `--z-raised` | 2 | hover card, dropdown | md |
| `--z-float` | 3 | upload tray, FAB | lg |
| `--z-overlay` | 4 | modal, command palette | xl + backdrop |
| `--z-toast` | 5 | toasts, cursor labels | xl |

```css
--shadow-sm: 0 1px 2px oklch(0% 0 0/.4), var(--hi);
--shadow-md: 0 6px 20px oklch(0% 0 0/.45), var(--hi), var(--lo);
--shadow-lg: 0 16px 48px oklch(0% 0 0/.55), var(--hi);
--shadow-xl: 0 32px 80px oklch(0% 0 0/.6), 0 0 0 1px var(--accent-border);
```

### 4.3 Parallax & Perspective (used *once*, on the dashboard hero)
The storage-pulse and ambient field sit on a `perspective: 1200px` stage; on pointer-move they tilt ≤3° (`rotateX/Y`) with a 600ms spring. Subtle, GPU-cheap, and it makes the dashboard feel *physical*. Disabled under `prefers-reduced-motion` and on touch.

---

# PART 5 — MOTION GRAMMAR 🌊

This is the single biggest upgrade. v1 had no motion language. Premium feel *is* motion. Here is the complete grammar.

### 5.1 Easing Curves (named, never raw numbers in components)
```css
--ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1);     /* entrances — fast start, long settle */
--ease-in-expo:   cubic-bezier(0.7, 0, 0.84, 0);     /* exits */
--ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1); /* overshoot — toggles, pops, badges */
--ease-standard:  cubic-bezier(0.4, 0, 0.2, 1);      /* property changes (color, bg) */
--ease-linear:    linear;                            /* ONLY for progress bars / spinners */
```
> **Rule:** entrances use `out-expo`, exits use `in-expo`, *state* changes use `standard`, *delight* uses `spring`. Linear is reserved for things that represent real time. Mixing these up is what makes motion feel "off."

### 5.2 Duration Scale (tied to distance & size, not arbitrary)
```css
--dur-instant: 80ms;    /* hover bg, focus ring */
--dur-fast:    140ms;   /* button press, icon swap */
--dur-base:    220ms;   /* card hover, panel slide */
--dur-slow:    360ms;   /* modal, drawer, route */
--dur-scene:   520ms;   /* shared-element / view transition */
```
Bigger travel = longer duration, but **never linear with distance** — use the expo curves so long moves still feel snappy.

### 5.3 Choreography Rules
1. **Stagger, don't dump.** Lists enter with 24–40ms stagger, capped at 8 items then the rest appear together (else long lists feel slow). `transition-delay: calc(var(--i) * 30ms)` via inline `--i`.
2. **Exit before enter** on route/module change (120ms crossfade minimum) — never two full UIs visible at once (violates figure-ground).
3. **Shared-element transitions** via the **View Transitions API**: clicking a file card morphs it into the detail-panel preview (`view-transition-name` set dynamically). The file *becomes* its preview. This is the "how did they do that" moment.
4. **Anchor the motion to causality.** A toast flies *from* the button that triggered it. A deleted card collapses *in place*, pushing siblings up (FLIP). Motion explains *what happened*.
5. **`@starting-style`** for enter transitions on freshly-inserted nodes (no JS class juggling):
```css
.toast { opacity: 1; translate: 0 0; transition: .36s var(--ease-out-expo); }
@starting-style { .toast { opacity: 0; translate: 0 16px; } }
```

### 5.4 Physics, Not Tweens (for drag, scroll, momentum)
Drag-drop, the upload tray, and the spatial canvas use a **spring integrator** (stiffness 170, damping 26, mass 1) so released items have real momentum and settle. Tweens feel robotic; springs feel held.

### 5.5 The Reduced-Motion Contract
`prefers-reduced-motion: reduce` doesn't kill feedback — it **swaps translation/scale for opacity-only crossfades** at ≤150ms. The UI still responds; it just doesn't *travel*. Never leave a reduced-motion user with zero feedback (that's an accessibility failure disguised as accommodation).

---

# PART 6 — MICRO-INTERACTION PHYSICS & CURSOR 🖱️

### 6.1 Magnetic & Tactile Controls
Primary buttons and the FAB are **magnetic**: within 24px the element translates toward the pointer by ≤6px (lerp 0.2), and the *label* moves slightly more than the *container* (parallax inside the button) — the classic "the text is loose inside" premium feel. On press: scale 0.97 + shadow drops a plane (it physically depresses).

### 6.2 The Cursor System
A custom cursor layer (a 12px dot + 36px lagging ring, ring lerps at 0.15):
- **Default:** dot only.
- **Over interactive:** ring snaps to the element's bounding box (rounded), blends `mix-blend-mode: difference` so it's visible on any surface.
- **Over draggable:** ring becomes a grab hand glyph + scales.
- **Over text:** collapses to a thin I-beam accent line.
- **On click:** ring ripples once.
Hidden on touch & reduced-motion. This single feature is what separates "website" from "experience."

### 6.3 Haptic Mapping (PWA / supported devices)
`navigator.vibrate` patterns mapped to semantics: success = `[8]`, error = `[12,40,12]`, conflict = `[6,30,6,30,6]`, drop = `[10]`. Sub-15ms, never on hover.

---

# PART 7 — SOUND DESIGN 🔊

Silence is fine; *thoughtful* sound is god-tier. A 3-layer audio model, all opt-in, all respecting a global mute + reduced-motion:

| Layer | Trigger | Character |
|---|---|---|
| **UI ticks** | toggle, send, confirm | sub-40ms synthesized clicks (different pitch per semantic: ok=+5st, danger=−7st) |
| **Ambient texture** | sync health | a near-inaudible pad whose brightness maps to sync %; conflicts introduce a faint dissonance that *resolves* when fixed |
| **Sonified data** | storage pulse, upload completion | a soft chime whose interval encodes completion (rising perfect fifth on 100%) |

> Implemented via WebAudio oscillators (no asset loading, <2KB). The point is **audio as a status channel you can feel with your eyes closed** — perfect for a sovereignty/self-hosted product running in the background.

---

# PART 8 — LAYOUT ENGINE 🏗️

v1 described layouts. v2 specifies the *modern CSS machinery* that makes them robust and "impossible-looking."

### 8.1 The Architecture
- **CSS Grid + `subgrid`** for file rows so icon/name/meta columns align perfectly across nested components (subgrid is the feature that finally makes complex tables clean).
- **Container queries (`@container`)** on every card/panel so a `FileCard` reflows by *its own* width, not the viewport — the same component works in grid, list, and detail-panel contexts with zero variants.
- **`:has()`** for parent-aware styling: a folder card *that contains a selected child* lifts a plane; a sidebar *that has an open section* dims the others. No JS state plumbing for visual coupling.
- **Anchor positioning (`anchor()`)** for tooltips, popovers, and the share caret — they position relative to their trigger natively, with `position-try-fallbacks` to flip when near edges. No Popper.js.
- **View Transitions API** for module/route changes and the file→preview morph (see §5.3).
- **Scroll-driven animations (`animation-timeline: scroll()`)** for the breadcrumb bar condensing and the dashboard hero parallax — zero JS scroll listeners, zero jank.
- **Popover API (`popover="auto"`)** for menus/modals — free focus-trap, light-dismiss, top-layer stacking. Replaces half your modal JS.
- **CSS nesting** throughout for locality.

### 8.2 The Responsive Philosophy (intrinsic, not breakpoint-driven)
Instead of "mobile/tablet/desktop" breakpoints, layouts use **intrinsic sizing**: `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))` for the file grid means it's *always* the right column count. Breakpoints only swap the *shell* (sidebar→bottom-bar), never the content grids. This is the modern, future-proof approach and it's what makes the UI feel fluid rather than "snapping."

---

# PART 9 — STATE MACHINE MATRIX 🔄

v1 had empty states. A real product has **7 states per surface**, and most designs only handle 2. Define every one, or the product feels broken the first time the network hiccups.

| State | Visual treatment |
|---|---|
| **Empty** | Illustration + benefit + primary action (your v1, good) |
| **Skeleton** | Shimmer *matching final layout exactly* (no layout shift); shimmer gradient angled to match the light source |
| **Partial / Streaming** | Content paints as it arrives (Suspense boundaries per card); no full-screen wait |
| **Optimistic** | Action applied instantly with a subtle "pending" ring; reconciles silently or rolls back with a shake + toast |
| **Degraded / Offline** | A slim top ribbon "Offline — changes will sync"; write actions queue with a clock badge; reads served from cache with a "cached" chip |
| **Error** | Inline, next to the cause (never only a toast); states *what + why + fix*; retry button right there |
| **Conflict** | The split-diff resolver (§module sync) with a coral pulse on the conflicted node in the tree |

> **Skeleton rule:** the skeleton's geometry must equal the loaded geometry to the pixel. A mismatched skeleton *is* layout shift, which *is* a CLS violation, which *is* a trust violation.

---

# PART 10 — ADAPTIVE / INTELLIGENT UI 🧬

This is where v2 leaves v1 (and most products) behind. The AI isn't a button — **the chrome itself is aware.**

### 10.1 The Attention Model
The UI maintains a lightweight focus score per region. The active module + active object = 100% chrome opacity; idle regions decay to 64% and desaturate 10%. The moment the pointer or focus approaches, they wake (120ms). Result: **the UI recedes around your work and brightens where you look.** It feels like the room dims the lights around your desk.

### 10.2 Predictive Command Palette
`⌘K` ranks by: recency × frequency × context (what module you're in) × time-of-day. At 9am it surfaces your standup doc; in the Photos module it prefixes results with images. It *learns your shape*. The top 3 are pre-rendered so the palette feels telepathic.

### 10.3 Contextual Surfaces
The toolbar is not static. In a folder of images it shows "Slideshow / Auto-tag"; in a folder of code it shows "Open in editor / Diff"; in Mail it shows triage actions. The surface **infers intent from content type + recent verbs** (Hick's law: fewer, *better* choices).

### 10.4 Focus / Whisper Dimension
A single toggle (or auto after 90s idle-on-one-object) enters **Whisper Mode**: chrome collapses to a 1px frame, palette drops to monochrome, only the active object + urgent status retain color and glow. Deep work becomes *visually* deep. Exiting is any edge-move or key.

### 10.5 Ambient, Non-Interrupting Status
Sync, quota, and share-activity never modal, never toast-spam. They live in a **status spine** (a 2px gradient line along the top whose hue/flow encodes system health) + the activity drawer. You *sense* the system without being *told* by it.

---

# PART 11 — COMPONENT ARCHITECTURE 🧩

For a build that survives contact with reality, specify the *patterns*, not just the pixels.

- **Compound components** (`<Menu><Menu.Trigger/><Menu.Item/></Menu>`) so composition is explicit and accessible by construction.
- **Slot-based polymorphism** (`asChild` / render-prop) so a `<Button>` can *be* an `<a>` or a router link without wrapper divs (wrapper divs destroy grid/flex semantics).
- **Variant × Size × State** as a typed matrix (CVA / class-variance-authority), never boolean prop soup (`isPrimary isLarge isLoading` → 💀).
- **Headless logic + styled shell split** (Radix/Ark primitives underneath) so accessibility (focus trap, roving tabindex, ARIA) is *inherited*, not re-implemented per component. This is non-negotiable for god-level a11y.
- **Design-token-driven, not class-driven** visuals: components read `--accent`, `--radius-md`, `--dur-base` — so theming/density (§15) is a token swap, not a rewrite.

---

# PART 12 — DATA VISUALIZATION LANGUAGE 📊

v1 had a donut. v2 needs a *chart grammar* so every number looks like it belongs to one brain.

- **Data-ink ratio > 0.8**: no gridlines by default (use subtle baseline + value labels); no 3D, no gradients on bars, no pie charts except the single storage ring.
- **One accent per series**, drawn from the OKLCH accent family at stepped lightness so series are distinguishable *and* harmonious.
- **Sparklines everywhere** a trend exists (sync history, quota over time, mail volume) — 14px tall, no axes, accent stroke + soft area fill. They turn static numbers into *stories*.
- **Motion on data**: bars/lines draw in with `--ease-out-expo`, staggered; on value update they *tween* (numbers count up via tabular-nums + rAF). A stat that animates to its value reads as "live and true."
- **Hover = crosshair + value chip anchored to the point** (anchor positioning), never a detached tooltip.

---

# PART 13 — ACCESSIBILITY AS A DESIGN AXIS ♿

WCAG AA is the *floor*, not the goal. v2 designs accessibility as a *parallel aesthetic*, not a remediation.

- **Designed high-contrast mode**, not a browser override: a dedicated token set (`--hc-*`) with thicker borders, removed reliance on color-alone (every status gets an icon + label), and *increased* glow contrast. It should look intentional, like a "tactical" skin.
- **Cognitive accessibility**: a **Reduced Complexity** mode that hides secondary modules, increases spacing one step, disables parallax/magnetic/cursor effects, and switches copy to plain-language. (Respects cognitive load / Miller.)
- **Screen-reader choreography**: live regions are *orchestrated* — a single polite `aria-live` aggregator announces batched changes ("3 files synced, 1 conflict") instead of 4 interrupting shouts. Focus is *managed* on route change (move to the module heading, not the body).
- **Focus rings**: a 2px accent ring offset 2px, on `:focus-visible` only, with a soft glow — beautiful *and* compliant. Never `outline: none` without a replacement.
- **Keyboard parity**: every pointer interaction has a keyboard path; the spatial canvas and drag-drop have a "move via menu" fallback.
- **Target sizes**: 44×44px minimum touch/keyboard targets even if the visual is smaller (padding trick).

---

# PART 14 — PERFORMANCE & PERCEIVED PERFORMANCE ⚡

A slow premium UI is a contradiction. Define the budget.

| Metric | Target | How |
|---|---|---|
| **INP** | < 120ms | No main-thread work on input; optimistic UI; virtualize lists >50 rows |
| **CLS** | < 0.02 | Skeleton = final geometry; reserve image aspect-ratio boxes; font `display: swap` + size-adjust fallback metrics |
| **LCP** | < 1.6s | Inline critical tokens; preload display font; server-stream the dashboard hero |
| **Bundle** | route-split; <120KB gz initial | Dynamic import per module; icons tree-shaken (Lucide per-icon import) |
| **Motion** | 60fps, compositor-only | Animate only `transform`/`opacity`; `will-change` sparingly; `contain: layout paint` on cards |

**Perceived-performance tricks (the feel):**
- **Optimistic everything** with reconciliation (Doherty threshold).
- **Skeleton → content crossfade**, not pop-in.
- **Progress that never lies**: indeterminate bars use a *decelerating* fill (fast 0→70%, slow 70→95%, hold at 95% until truly done) so nothing ever "jumps back."
- **Prefetch on hover/intent**: hovering a folder for 200ms prefetches its first page; `⌘K` results prefetch on focus.

---

# PART 15 — THEMING & PERSONALIZATION 🎛️

"Dark mode only" was a v1 cop-out. v2: dark is the *identity*, but the user tunes the *character*.

- **Density**: Comfortable / Cozy / Compact — swaps the spacing scale one step and the type base (a token change, not a redesign).
- **Accent**: 12-hue wheel + extracted-from-avatar (§2.3).
- **Aesthetic skins** (token-only swaps, same components): *Event Horizon* (default indigo void), *Solar Flare* (warm amber void), *Deep Sea* (teal void), *Mono* (true greyscale, for focus). Each is a 12-line token file. This proves the system is *real*.
- **Motion intensity**: Full / Reduced / Still (still = crossfades only).
- **Sound**: off / subtle / expressive.
- All persisted, all per-device, all exported as a shareable "theme URL" (a sovereignty flex).

---

# PART 16 — GESTURE VOCABULARY ✋

Power users live in gestures. Define them so they're consistent app-wide (and discoverable via a `⌘/` cheat-sheet that *animates* the gesture).

| Gesture (trackpad/touch) | Action |
|---|---|
| Two-finger horizontal swipe | Breadcrumb back / forward |
| Pinch-out on folder | Zoom into spatial canvas (§19) |
| Pinch-in | Zoom to parent / dashboard |
| Three-finger swipe down | Reveal command palette |
| Long-press (touch) | Context menu + haptic |
| Edge-swipe from right | Activity drawer |
| Force-click / middle-click | Preview (Space-equivalent) |

Every gesture has a keyboard + menu equivalent (Tesler's law: never trap a function in one modality).

---

# PART 17 — ONBOARDING & FIRST-RUN CHOREGRAPHY 🚪

v1 had nothing. First run is the peak of the peak-end curve — design it.

1. **The Arrival (0–3s):** void background, the logo draws via stroke animation, a single line types: *"Your data. Your gravity."* Then the shell assembles around it (sidebar slides, top bar fades) — the user *watches their space form*.
2. **The Empty Dashboard, alive:** storage pulse at 0% with a breathing glow; a single guided card "Bring your first files" with a drag target that *already* reacts to hover.
3. **Progressive disclosure:** modules unlock visually as used — Mail/Calendar stay as quiet icons until first connect, then bloom into the nav with a spring. The nav *grows with the user*.
4. **No modal tour.** Tooltips appear *in context* the first time a feature is relevant (a "coach mark" anchored to the element, dismissible, never stacking). Tours are interruptions; contextual hints are education.

---

# PART 18 — MODULES (Refined, New Systems Applied) 🗂️

I won't restate your v1 module copy — it was good. Here is what *changes* when the v2 systems touch each module.

### Files
- File cards use **container queries** (one component, three contexts) + **subgrid** rows in list view.
- Selection uses **scroll-driven** sticky group headers ("Modified today") that pin with a backdrop-blur as you scroll.
- Drag-drop uses **spring physics** + a drop-zone that *inflates* (scale 1.02, accent border) when a valid payload hovers (causality).
- Detail panel opens via **View Transition** from the card (the card *is* the panel's hero).
- Right-click menu uses the **Popover API** + **anchor positioning**.

### Sync
- Device cards show a **live spring-animated ring**; the conflict node pulses coral in the tree *and* the status spine flickers.
- Conflict resolver: a true **inline diff** (additions in `--ok`-tinted bg, removals in `--danger`-tinted), with a "scrub" slider that wipes between versions (a tiny, delightful, *clarifying* interaction).

### Sharing
- Permission matrix cells are **toggles that morph** between Read/Write/Manage with a spring + icon swap; revoking plays a "dissolve" exit (peak-end: revoking should feel *decisive and safe*).

### Calendar
- Events drag with **spring snap**; creating an event uses `@starting-style` so it *grows from the click point*.
- "Now" line is a gradient that *pulses* once per minute (ambient, non-interrupting).

### Talk
- Message entrance: stagger + slide 8px with `out-expo`; your own messages spring from the composer.
- Typing indicator: three dots on a **spring** loop, not a CSS linear bounce (feels alive, not mechanical).
- Reactions: the emoji *pops* with overshoot and the count ticks with tabular-nums.

### Mail
- Reader uses **`text-wrap: pretty`** + max-width 68ch + optical sizing for that "Hey/Superhuman calm."
- Triage (archive/snooze) is **gesture + optimistic**, with an undo affordance that *counts down* (a thin shrinking bar) — the peak-end moment of mail is the undo.

### Photos
- Masonry via CSS `columns` + `break-inside: avoid` (no JS layout lib) or grid with row-span from aspect-ratio.
- Lightbox uses **View Transitions** from the thumbnail (the photo *expands* from where it was — continuity law).
- EXIF panel: a **radial dial** for aperture/ISO that fills like a gauge (data-viz language).

### Settings
- Storage donut animates its arc on mount and on change; per-category bars are **stacked with a hover-isolate** (others dim — figure-ground).
- 2FA wizard: the TOTP digits use tabular-nums + a **circular countdown ring** per 30s window.

---

# PART 19 — SIGNATURE "IMPOSSIBLE" FEATURES 🌠

These are the things that make a portfolio reviewer stop scrolling. Each is *buildable* with the stack above; none is vaporware.

### 19.1 Chrono-Scrub (Time-Travel Browsing)
A horizontal **timeline scrubber** at the bottom of Files. Drag it and the folder *rewinds* — showing the file set as it existed at that moment (powered by your version history). Ghosted outlines show files that didn't exist yet. *You can browse your own past.* (View Transitions morph the grid between states.)

### 19.2 Spatial Canvas (The Memory Palace)
Pinch-out of any folder into an **infinite zoomable canvas** where folders are *rooms* and files are *objects* placed by type/usage (a force-directed layout you can pin and arrange). It's a Miro-board of *your own data*. Zoom back in and it collapses to the normal grid (shared-element morph). People organize spatially — this honors that.

### 19.3 Whisper Mode (Deep Focus Dimension)
(§10.4) One key dims the universe to your current object. Urgent sync/conflict is the *only* thing allowed to glow through. It's the visual equivalent of noise-cancelling.

### 19.4 Generative Empty States
Empty-state illustrations aren't static SVGs — they're **generated from your usage signature** (a tiny deterministic function of your module-usage vector → a unique abstract glyph/constellation). Your empty Photos and your friend's empty Photos look *different*. The void is *yours*.

### 19.5 The Status Spine + Sonified Health
(§10.5 + §7) A 2px living line + optional ambient audio that encodes system health continuously. You *feel* a conflict before you see it. Background-awareness without notifications.

### 19.6 Narration Layer (Spatial Audio UI)
Beyond alt-text: a toggle that gives the UI a **spatial-audio map** — modules have positions in stereo space (Files center, Mail left, Photos right), focus moves a soft tone through the field, and a screen-reader user can *hear the layout*. This is frontier accessibility and an extraordinary portfolio statement.

### 19.7 Command Palette That Speaks Back
The palette doesn't just search — type `summarize <file>` or `find photos from beach` and it routes to the **semantic/AI layer** (§AI features) with results streamed inline. The palette is the *universal verb bar* for the entire app, including AI. One input, infinite intent.

---

# PART 20 — BUILD ORDER (Refined Phasing) 🏗️

```
Phase 0 — The Brain
  ├── Cognitive-law doc + token compiler (OKLCH → derived semantics + contrast)
  └── Motion grammar tokens + reduced-motion contract

Phase 1 — Foundation (your v1 Phase 1, upgraded)
  ├── Tokens (OKLCH), type (variable + fluid + numeric), radius, z-planes, light source
  ├── Headless primitives wired (Radix/Ark) + CVA variants
  ├── Button/Input/Toggle/Badge/Avatar + custom cursor layer + sound engine

Phase 2 — Shell & Motion
  ├── Sidebar (collapsible, attention-aware), TopBar, Detail panel, Modal (popover API)
  ├── View Transitions + scroll-driven breadcrumb + ambient field
  └── Command palette (predictive) + status spine

Phase 3 — Modules (each ships with ALL 7 states)
  ├── Files (container queries, subgrid, drag-spring, chrono-scrub)
  ├── Sync (spring rings, diff scrub) → Sharing → Calendar → Talk → Mail → Photos
  └── Settings (animated donut, 2FA ring)

Phase 4 — Intelligence & Signature
  ├── Attention model + contextual surfaces + whisper mode
  ├── Spatial canvas + generative empty states + narration layer
  └── AI verb routing in palette

Phase 5 — Polish & Proof
  ├── Theming/personalization + skins + density
  ├── Perf budget audit (INP/CLS/LCP) + a11y audit (axe + manual SR pass)
  └── Storybook with state matrix per component + motion showcase
```

---

# PART 21 — IMPLEMENTATION CHECKLIST (Expanded) ✅

- [ ] Token compiler emits OKLCH semantics + per-accent `--on-*` contrast
- [ ] Single light source; all shadows from `--hi/--lo` + z-plane tokens
- [ ] Motion: named easings + duration scale + stagger + `@starting-style` + reduced-motion swap
- [ ] Custom cursor layer (disabled on touch/reduced-motion)
- [ ] Sound engine (3 layers, global mute, reduced-motion aware)
- [ ] Layout: subgrid, container queries, `:has()`, anchor positioning, View Transitions, scroll-driven anim, Popover API
- [ ] **7-state matrix implemented per surface** (empty/skeleton/partial/optimistic/offline/error/conflict)
- [ ] Attention model + whisper mode + predictive palette + contextual toolbars
- [ ] Headless primitives + compound/slot/CVA component patterns
- [ ] Data-viz grammar: sparklines, tweened numbers, single donut, no chartjunk
- [ ] A11y: designed high-contrast skin, reduced-complexity mode, SR live-region aggregator, focus management, 44px targets
- [ ] Perf budget enforced in CI (Lighthouse + INP/CLS gates)
- [ ] Theming: density + accent + 4 skins + motion/sound intensity + shareable theme URL
- [ ] Gesture vocabulary + animated cheat-sheet (`⌘/`)
- [ ] First-run choreography + contextual coach marks (no modal tours)
- [ ] Signature features: chrono-scrub, spatial canvas, generative empty states, narration layer
- [ ] PWA: manifest, service worker (offline reads), install prompt choreography
- [ ] i18n: all copy via keys; logical properties (`margin-inline`) not `left/right`; RTL-tested
- [ ] `prefers-reduced-motion`, `prefers-contrast`, `prefers-color-scheme` all honored
- [ ] Storybook: every component × every state × every density

---

# PART 22 — COPY & TONE (Refined) ✍️

- **Voice:** calm, precise, quietly confident. The product is *sovereign* — the copy should feel like a trusted instrument, not a cheerful assistant.
- **No "Welcome back!"** The dashboard *is* the welcome.
- **Buttons = verb + object:** "Upload files", "Resolve conflict", "Restore version".
- **Errors = what + why + fix:** *"Upload paused — 4.2 GB exceeds your 2 GB single-file limit on this storage backend. Split the archive or switch to S3."*
- **Status vocabulary (consistent, never synonym-drift):** `Synced · Syncing · Paused · Conflict · Offline · Cached`. Pick one word per state, app-wide.
- **Time:** relative < 7 days ("3h ago"), absolute after ("Jul 4, 2025"), ISO in `title`/`aria-label`.
- **Numbers:** always tabular; always units; always thousands separators localized.
- **Empty states:** name the *benefit*, not the absence. Not "No files" → *"Your space is ready. Drop files to make it yours."*

---

## 🧭 Closing Rationale

A "god-level" interface isn't a checklist of effects — it's a **coherent world with consistent physics, light, motion, and intent**, where every pixel can answer *why*. v1 had taste. v2 has *a theory*. The signature features (chrono-scrub, spatial canvas, whisper mode, narration layer) are the fireworks — but the fireworks only land because the foundation (OKLCH color science, the motion grammar, the 7-state matrix, the attention model, the cognitive laws) makes the whole thing feel *inevitable* rather than decorated.

That inevitability — the feeling that the interface *could not have been any other way* — is the actual definition of master-level design. Ship that, and the portfolio reviews itself.

---

**Build order starts at Phase 0 — the brain.** Get the token compiler and motion grammar right on day one; everything downstream inherits the premium feel for free. 🌌