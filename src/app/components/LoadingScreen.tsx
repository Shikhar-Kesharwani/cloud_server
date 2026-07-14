import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "motion/react";

interface Props {
  onComplete: () => void;
}

const ACCENT   = "oklch(67% 0.21 275)";
const ACCENT2  = "oklch(79% 0.14 175)";
const VOID_BG  = "oklch(12% 0.020 265)";
const FOCAL    = 400;
const STAR_COUNT = 320;

type Phase = "warp" | "decelerate" | "reveal" | "tagline" | "enter" | "exit";

interface Star {
  x: number; y: number; z: number;
  px: number; py: number; // previous projected
  speed: number;
}

function initStar(): Star {
  const angle = Math.random() * Math.PI * 2;
  const dist  = 0.05 + Math.random() * 0.6;
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist,
    z: 0.1 + Math.random() * 0.9,
    px: 0, py: 0,
    speed: 0.004 + Math.random() * 0.006,
  };
}

export function LoadingScreen({ onComplete }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const speedRef   = useRef(1.0);
  const phaseRef   = useRef<Phase>("warp");
  const timersRef  = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rafRef     = useRef<number>(0);
  const exitRef    = useRef(false);

  const [phase,       setPhase]       = useState<Phase>("warp");
  const [canvasAlpha, setCanvasAlpha] = useState(1);
  const [showRings,   setShowRings]   = useState(false);
  const [showLogo,    setShowLogo]    = useState(false);
  const [logoGlitch,  setLogoGlitch]  = useState(false);
  const [tagLine,     setTagLine]     = useState("");
  const [progress,    setProgress]    = useState(0);
  const [screenAlpha, setScreenAlpha] = useState(1);

  const prefersReduced = typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clearTimers = () => timersRef.current.forEach(clearTimeout);

  const schedule = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
  };

  const fireComplete = useCallback(() => {
    if (exitRef.current) return;
    exitRef.current = true;
    clearTimers();
    cancelAnimationFrame(rafRef.current);
    setScreenAlpha(0);
    setTimeout(onComplete, 650);
  }, [onComplete]);

  const skip = useCallback(() => fireComplete(), [fireComplete]);

  // ── Canvas warp ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (prefersReduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => {
      const s = initStar();
      // pre-project so first frame has valid px/py
      s.px = (s.x / s.z) * FOCAL + canvas.width  / 2;
      s.py = (s.y / s.z) * FOCAL + canvas.height / 2;
      return s;
    });

    let last = performance.now();

    const draw = (now: number) => {
      if (exitRef.current) return;
      rafRef.current = requestAnimationFrame(draw);
      const dt = Math.min((now - last) / 16.67, 3);
      last = now;

      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;
      const spd = speedRef.current;

      // motion-blur clear
      ctx.fillStyle = "rgba(10, 11, 20, 0.18)";
      ctx.fillRect(0, 0, W, H);

      for (const s of stars) {
        const prevZ = s.z;
        s.z -= s.speed * spd * dt;

        if (s.z < 0.04) {
          Object.assign(s, initStar());
          s.z = 0.9 + Math.random() * 0.1;
          s.px = (s.x / s.z) * FOCAL + cx;
          s.py = (s.y / s.z) * FOCAL + cy;
          continue;
        }

        const nx = (s.x / s.z) * FOCAL + cx;
        const ny = (s.y / s.z) * FOCAL + cy;

        // only draw if trail was valid last frame
        if (
          s.px > 0 && s.px < W && s.py > 0 && s.py < H &&
          nx > 0 && nx < W && ny > 0 && ny < H
        ) {
          const proximity = 1 - s.z;
          const alpha = Math.min(proximity * 1.4, 0.95) * Math.min(spd / 0.6, 1);
          const lw    = Math.max(0.3, proximity * 2.5 * Math.min(spd / 0.5, 1));

          // color: mix between muted-white and accent based on speed
          const mix = Math.min(spd, 1);
          ctx.strokeStyle = `oklch(${70 + proximity * 25}% ${0.04 + mix * 0.17} 275 / ${alpha})`;
          ctx.lineWidth   = lw;
          ctx.beginPath();
          ctx.moveTo(s.px, s.py);
          ctx.lineTo(nx, ny);
          ctx.stroke();
        }

        s.px = nx;
        s.py = ny;
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [prefersReduced]);

  // ── Phase sequence ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (prefersReduced) {
      // skip straight to reveal
      setShowLogo(true);
      setShowRings(true);
      setCanvasAlpha(0);
      schedule(() => {
        const full = "Your data. Your gravity.";
        setTagLine(full);
        setProgress(100);
      }, 400);
      schedule(() => {
        setPhase("exit");
        fireComplete();
      }, 1600);
      return clearTimers;
    }

    phaseRef.current = "warp";
    speedRef.current = 1.0;

    // 1 — begin decelerating
    schedule(() => {
      phaseRef.current = "decelerate";
      setPhase("decelerate");
      let spd = 1.0;
      const dec = setInterval(() => {
        spd = Math.max(0, spd - 0.04);
        speedRef.current = spd;
        if (spd <= 0) clearInterval(dec);
      }, 30);
      timersRef.current.push(dec as unknown as ReturnType<typeof setTimeout>);
    }, 1500);

    // 2 — fade canvas, show rings + logo
    schedule(() => {
      setCanvasAlpha(0);
      setShowRings(true);
      schedule(() => {
        setShowLogo(true);
        schedule(() => setLogoGlitch(true), 100);
        schedule(() => setLogoGlitch(false), 600);
        setPhase("reveal");
      }, 300);
    }, 2200);

    // 3 — typewriter
    schedule(() => {
      setPhase("tagline");
      const full  = "Your data. Your gravity.";
      let i = 0;
      const ti = setInterval(() => {
        i++;
        setTagLine(full.slice(0, i));
        if (i >= full.length) clearInterval(ti);
      }, 45);
      timersRef.current.push(ti as unknown as ReturnType<typeof setTimeout>);
    }, 3200);

    // 4 — progress bar
    schedule(() => {
      setPhase("enter");
      let p = 0;
      const pi = setInterval(() => {
        p = Math.min(100, p + 2.5);
        setProgress(Math.round(p));
        if (p >= 100) clearInterval(pi);
      }, 20);
      timersRef.current.push(pi as unknown as ReturnType<typeof setTimeout>);
    }, 3850);

    // 5 — exit
    schedule(() => {
      setPhase("exit");
      fireComplete();
    }, 4800);

    return clearTimers;
  }, [prefersReduced, fireComplete]);

  // ── Skip listeners ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey   = () => skip();
    const onClick = () => skip();
    window.addEventListener("keydown", onKey);
    window.addEventListener("click",   onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click",   onClick);
    };
  }, [skip]);

  // ── Render ─────────────────────────────────────────────────────────────────
  const ringBase: React.CSSProperties = {
    position: "absolute",
    borderRadius: "50%",
    border: `1px solid ${ACCENT}55`,
    boxShadow: `0 0 18px ${ACCENT}22, inset 0 0 8px ${ACCENT}11`,
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        background: VOID_BG,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
        opacity: screenAlpha,
        transition: "opacity 0.65s cubic-bezier(0.7,0,0.84,0)",
      }}
    >
      {/* Injected keyframes */}
      <style>{`
        @keyframes orbit-1 {
          from { transform: rotateX(72deg) rotateZ(0deg);   }
          to   { transform: rotateX(72deg) rotateZ(360deg); }
        }
        @keyframes orbit-2 {
          from { transform: rotateX(48deg) rotateY(28deg) rotateZ(0deg);    }
          to   { transform: rotateX(48deg) rotateY(28deg) rotateZ(-360deg); }
        }
        @keyframes orbit-3 {
          from { transform: rotateX(62deg) rotateY(-22deg) rotateZ(0deg);   }
          to   { transform: rotateX(62deg) rotateY(-22deg) rotateZ(360deg); }
        }
        @keyframes ring-dot {
          from { transform: rotateZ(0deg)   translate(50%, 0) scaleX(0.5); }
          to   { transform: rotateZ(360deg) translate(50%, 0) scaleX(0.5); }
        }
        @keyframes glitch-text {
          0%,100% { transform: translate(0);         clip-path: none; opacity: 1; }
          8%      { transform: translate(-3px,  1px); clip-path: inset(20% 0 55% 0); }
          16%     { transform: translate( 3px, -2px); clip-path: inset(55% 0 20% 0); opacity: 0.85; }
          24%     { transform: translate(-2px,  2px); clip-path: none; }
          32%     { transform: translate( 2px, -1px); clip-path: inset(35% 0 40% 0); }
          40%     { transform: translate(0);          clip-path: none; opacity: 1; }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes halo-pulse {
          0%,100% { opacity: 0.5; transform: scale(1);    }
          50%     { opacity: 0.9; transform: scale(1.06); }
        }
        @keyframes blink-cursor {
          0%,100% { opacity: 1; }
          50%     { opacity: 0; }
        }
      `}</style>

      {/* Canvas — warp star field */}
      {!prefersReduced && (
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute", inset: 0,
            opacity: canvasAlpha,
            transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      )}

      {/* Scanline overlay (subtle) */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "repeating-linear-gradient(0deg, transparent, transparent 3px, oklch(0% 0 0 / 0.03) 4px)",
        zIndex: 2,
      }} />

      {/* Ambient halo */}
      {showLogo && (
        <div style={{
          position: "absolute",
          width: 520, height: 520,
          borderRadius: "50%",
          background: `radial-gradient(ellipse at center, ${ACCENT}09, ${ACCENT2}05, transparent 70%)`,
          animation: "halo-pulse 3s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 1,
        }} />
      )}

      {/* Center stage — rings + logo */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>

        {/* 3D ring stage */}
        <div style={{
          position: "relative",
          width: 340, height: 340,
          display: "flex", alignItems: "center", justifyContent: "center",
          perspective: "800px",
        }}>
          {/* Rings */}
          {showRings && (
            <>
              {/* Ring 1 */}
              <div style={{
                ...ringBase,
                width: 210, height: 210,
                animation: "orbit-1 7s linear infinite",
                opacity: showLogo ? 1 : 0,
                transition: "opacity 0.6s ease",
                transformStyle: "preserve-3d",
              }} />
              {/* Ring 2 */}
              <div style={{
                ...ringBase,
                width: 265, height: 265,
                animation: "orbit-2 10s linear infinite",
                opacity: showLogo ? 1 : 0,
                transition: "opacity 0.8s 0.1s ease",
                transformStyle: "preserve-3d",
                border: `1px solid ${ACCENT2}44`,
                boxShadow: `0 0 14px ${ACCENT2}18`,
              }} />
              {/* Ring 3 */}
              <div style={{
                ...ringBase,
                width: 325, height: 325,
                animation: "orbit-3 14s linear infinite",
                opacity: showLogo ? 1 : 0,
                transition: "opacity 1s 0.2s ease",
                transformStyle: "preserve-3d",
                border: "1px solid oklch(67% 0.21 275 / 0.2)",
              }} />
            </>
          )}

          {/* Logo center */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={showLogo ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}
          >
            {/* Hex icon */}
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
              boxShadow: `0 0 40px ${ACCENT}55, 0 0 80px ${ACCENT}22, inset 0 1px 0 oklch(100% 0 0 / 0.2)`,
            }}>
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx={12} cy={12} rx={10} ry={4} />
                <path d="M2 12c0 2.21 4.477 4 10 4s10-1.79 10-4" />
                <path d="M2 17c0 2.21 4.477 4 10 4s10-1.79 10-4" />
              </svg>
            </div>

            {/* Word mark */}
            <div style={{
              animation: logoGlitch ? "glitch-text 0.5s steps(1) forwards" : "none",
              textAlign: "center",
            }}>
              <div style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "2rem",
                fontWeight: 800,
                color: "oklch(96% 0.008 265)",
                letterSpacing: "-0.025em",
                lineHeight: 1,
                textShadow: `0 0 30px ${ACCENT}55`,
              }}>
                NEXUS
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.35em",
                color: ACCENT,
                marginTop: 5,
                textTransform: "uppercase",
              }}>
                CLOUD · EVENT HORIZON
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tagline */}
        <div style={{
          height: 28,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginTop: -8,
        }}>
          {(phase === "tagline" || phase === "enter" || phase === "exit") && (
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.9rem",
              color: "oklch(60% 0.020 265)",
              letterSpacing: "0.01em",
              fontStyle: "italic",
            }}>
              {tagLine}
              {tagLine.length < "Your data. Your gravity.".length && (
                <span style={{ animation: "blink-cursor 0.6s step-end infinite", borderRight: `2px solid ${ACCENT}`, marginLeft: 1 }}>&nbsp;</span>
              )}
            </span>
          )}
        </div>

        {/* Progress bar + label */}
        <div style={{
          marginTop: 36,
          width: 240,
          opacity: phase === "enter" || phase === "exit" ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.1em", color: "oklch(35% 0.025 265)", textTransform: "uppercase" }}>
              Initializing Nexus
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.58rem", color: ACCENT, fontVariantNumeric: "tabular-nums" }}>
              {progress}%
            </span>
          </div>
          <div style={{ height: 2, background: "oklch(22% 0.028 265)", borderRadius: 1, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})`,
              boxShadow: `0 0 8px ${ACCENT}88`,
              borderRadius: 1,
              transition: "width 0.04s linear",
            }} />
          </div>
        </div>

        {/* Skip hint */}
        <div style={{
          marginTop: 24,
          opacity: phase === "warp" || phase === "decelerate" ? 0 : 0.4,
          transition: "opacity 1s ease",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.58rem",
          color: "oklch(38% 0.025 265)",
          letterSpacing: "0.08em",
        }}>
          PRESS ANY KEY TO SKIP
        </div>
      </div>

      {/* Corner coordinates — flavor decoration */}
      {["tl","tr","bl","br"].map(pos => (
        <div key={pos} style={{
          position: "absolute",
          ...(pos.includes("t") ? { top: 24 } : { bottom: 24 }),
          ...(pos.includes("l") ? { left: 24 }  : { right: 24 }),
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.55rem",
          color: "oklch(28% 0.025 265)",
          letterSpacing: "0.06em",
          lineHeight: 1.8,
          opacity: showLogo ? 1 : 0,
          transition: "opacity 1s ease",
          zIndex: 10,
        }}>
          {pos === "tl" && (<><div>NEXUS OS v2.0</div><div>BOOT SEQUENCE</div></>)}
          {pos === "tr" && (<><div style={{ textAlign: "right" }}>SECTOR 0x4E58</div><div style={{ textAlign: "right" }}>GRAVITY: NOMINAL</div></>)}
          {pos === "bl" && (<><div>STORAGE: 47.3 GB</div><div>SYNC: ████████░░</div></>)}
          {pos === "br" && (<><div style={{ textAlign: "right" }}>LAT: 52.520°N</div><div style={{ textAlign: "right" }}>LON: 13.405°E</div></>)}
        </div>
      ))}
    </div>
  );
}
