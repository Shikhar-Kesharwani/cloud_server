# Plan: Nexus Cloud — Cryptic Gem Loading Screen

## Context
The app currently renders the dashboard immediately with no intro experience. This plan adds a cinematic first-run loading screen — a "Cryptic Gem" entry sequence — that triggers once on first visit (localStorage flag). It uses a canvas-based 3D warp/hyperspace animation, CSS perspective orbital rings, a glitch logo reveal, and a typewriter tagline, resolving into the main app with a crossfade.

---

## Visual Sequence (~4 seconds, skippable)

| Phase | Duration | What happens |
|---|---|---|
| **Void** | 0–150ms | Pure black void, canvas begins spawning particles |
| **Warp** | 150–1600ms | 300 stars flying outward (hyperspace), electric-blue trails |
| **Decelerate** | 1600–2200ms | Stars lerp speed → 0, canvas dims |
| **Reveal** | 2200–3200ms | Canvas fades; logo appears with stroke glitch; 3 CSS 3D orbital rings spin in |
| **Tagline** | 3200–3800ms | `"Your data. Your gravity."` types out character by character |
| **Enter** | 3800–4200ms | Thin progress bar fills 0→100%; "ENTERING NEXUS" mono label |
| **Exit** | 4200–4800ms | Full fade to void → `onComplete()` fires → main app fades in |

Click/keypress anywhere skips to `onComplete` immediately.

---

## Implementation

### New file: `src/app/components/LoadingScreen.tsx`

**Canvas warp star field**
- 300 stars, each with `{ x, y, z, speed }` in normalized 3D space
- Each frame: `z -= speed * speedMultiplier * delta`; when `z < 0.05` reset to `z = 1`
- Project to screen: `px = (x / z) * FOCAL + cx`, `py = (y / z) * FOCAL + cy`
- Draw line from previous projected pos to current (trail) — line width = `(1 - z) * 3`, capped at 2
- Color: mix of `oklch(67% 0.21 275)` and white based on proximity
- `speedMultiplier` ramps: warp phase = 1.0 → decelerate phase lerps to 0 over 600ms
- Canvas clears with `rgba(0,0,0,0.15)` each frame (motion blur effect instead of full clear)

**Phase state machine**
```ts
type Phase = 'warp' | 'decelerate' | 'reveal' | 'tagline' | 'enter' | 'exit';
```
Driven by `setTimeout` chain firing phase transitions. `speedRef` is the shared multiplier the canvas RAF reads.

**3D Orbital Rings (CSS only)**
Three absolutely-positioned divs around the logo, each:
- `border-radius: 50%`, `border: 1px solid oklch(67% 0.21 275 / 0.35)`
- Box-shadow: `0 0 14px oklch(67% 0.21 275 / 0.2)` for glow
- Sizes: 200px, 260px, 320px
- Rotation configs (applied via inline style, different `rotateX/rotateY` per ring)
- CSS `@keyframes orbit-N` animates `rotateZ(0→360deg)` at 6s/9s/12s speed
- The parent container has `perspective: 800px; transform-style: preserve-3d`

**Logo glitch keyframe**
```css
@keyframes glitch {
  0%,100% { transform: translate(0); clip-path: none; }
  10% { transform: translate(-2px, 1px); }
  20% { transform: translate(2px, -1px); clip-path: inset(30% 0 40% 0); }
  30% { transform: translate(-1px, 2px); }
  40% { transform: translate(0); clip-path: none; }
}
```
Applied once (1 cycle, ~400ms) on the "NEXUS CLOUD" text during the reveal phase.

**Typewriter hook**
Simple state: `displayText` counts characters from the full tagline every 45ms via `setInterval`.

**Progress bar**
CSS `transition: width 0.4s linear` driven by React state incrementing in steps.

**Ambient background during reveal**
Radial gradient centered on logo: `radial-gradient(ellipse 60% 40% at 50% 50%, oklch(67% 0.21 275 / 0.06), transparent)` — the "cryptic gem" glow halo.

**Skip behavior**
`document.addEventListener('click'/'keydown')` calls a `skip()` fn that cancels all timeouts and fires `onComplete` immediately.

---

### Changes to `src/app/App.tsx`

1. Add import: `import { LoadingScreen } from "./components/LoadingScreen";`
2. Add state:
   ```ts
   const [appReady, setAppReady] = useState(() => {
     return localStorage.getItem('nexus-entered') === 'true';
   });
   ```
3. In render, before the main layout:
   ```tsx
   if (!appReady) return (
     <LoadingScreen onComplete={() => {
       localStorage.setItem('nexus-entered', 'true');
       setAppReady(true);
     }} />
   );
   ```
4. Wrap existing main layout in a `motion.div` with `initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}` so it fades in after loading.

---

## Files to modify

| File | Change |
|---|---|
| `src/app/components/LoadingScreen.tsx` | **Create** — full loading screen component |
| `src/app/App.tsx` | Add `appReady` state + conditional render + entrance fade |

---

## Verification

1. Open the app in the preview — loading screen should appear first
2. Canvas warp animation plays, stars fly outward
3. Phases sequence: warp → decelerate → orbital rings spin in → logo glitches → tagline types → progress bar fills → fade out
4. Main app fades in after ~4.8s
5. Refresh: loading screen shows again (sessionStorage) — OR clear localStorage `nexus-entered` to replay
6. Click anywhere mid-sequence → skips directly to app
7. Check `prefers-reduced-motion`: canvas animation skips; logo/rings appear immediately; only opacity crossfades used
