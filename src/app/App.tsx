import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { LoadingScreen } from "./components/LoadingScreen";
import {
  Folder, FileText, Image, Music, Archive,
  HardDrive, Calendar, MessageSquare, Mail,
  Settings, Search, List, LayoutGrid,
  Star, Share2, Plus, Bell, RefreshCw,
  Clock, AlertTriangle, ChevronRight,
  Film, FileCode, Command, Users, Upload,
  Home, TrendingUp, Database, Zap, Camera,
  Activity, Shield, CheckCircle2, X, Download,
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Module = "dashboard" | "files" | "photos" | "activity" | "calendar" | "talk" | "mail" | "settings";
type FileType = "folder" | "image" | "video" | "audio" | "document" | "archive" | "code";
type ViewMode = "grid" | "list";

interface FileItem {
  id: string;
  name: string;
  type: FileType;
  size?: string;
  items?: number;
  modified: string;
  starred?: boolean;
  shared?: boolean;
}

interface ActivityEvent {
  id: string;
  verb: string;
  file: string;
  time: string;
  eventType: "sync" | "share" | "upload" | "conflict" | "download" | "restore";
  user: string;
  initials?: string;
}

// ─── DATA ──────────────────────────────────────────────────────────────────────

const FILES: FileItem[] = [
  { id: "1",  name: "Brand Identity 2026",       type: "folder",   items: 24,   modified: "2h ago",    starred: true,  shared: true  },
  { id: "2",  name: "Annual Report Q2.pdf",       type: "document", size: "4.2 MB",  modified: "5h ago"  },
  { id: "3",  name: "Campaign Shoot",             type: "folder",   items: 156,  modified: "Yesterday", shared: true  },
  { id: "4",  name: "server-config.yml",          type: "code",     size: "12 KB",   modified: "Yesterday" },
  { id: "5",  name: "Product Demo v3.mp4",        type: "video",    size: "847 MB",  modified: "Jul 10"  },
  { id: "6",  name: "Architecture Diagrams",      type: "folder",   items: 8,    modified: "Jul 9"     },
  { id: "7",  name: "backup-2026-07.tar.gz",      type: "archive",  size: "12.4 GB", modified: "Jul 8"  },
  { id: "8",  name: "Team Photo Berlin.jpg",      type: "image",    size: "18.2 MB", modified: "Jul 7",  starred: true  },
  { id: "9",  name: "Q3 Roadmap.md",              type: "document", size: "48 KB",   modified: "Jul 7"  },
  { id: "10", name: "Synth Session 04.wav",       type: "audio",    size: "224 MB",  modified: "Jul 6"  },
  { id: "11", name: "Infrastructure Docs",        type: "folder",   items: 31,   modified: "Jul 5",    shared: true  },
  { id: "12", name: "design-tokens.json",         type: "code",     size: "28 KB",   modified: "Jul 4"  },
];

const ACTIVITY: ActivityEvent[] = [
  { id: "1", verb: "Synced",     file: "Design System v2.figma",  time: "2m ago",    eventType: "sync",     user: "You"                        },
  { id: "2", verb: "Shared",     file: "Campaign Assets",         time: "1h ago",    eventType: "share",    user: "Maya Chen",   initials: "MC" },
  { id: "3", verb: "Uploaded",   file: "Product Demo v3.mp4",     time: "3h ago",    eventType: "upload",   user: "You"                        },
  { id: "4", verb: "Conflict",   file: "Q3 Roadmap.md",           time: "5h ago",    eventType: "conflict", user: "Erik Vogt",   initials: "EV" },
  { id: "5", verb: "Downloaded", file: "Annual Report Q2.pdf",    time: "Yesterday", eventType: "download", user: "Priya Nair",  initials: "PN" },
  { id: "6", verb: "Restored",   file: "server-config.yml",       time: "Jul 10",    eventType: "restore",  user: "You"                        },
];

const STORAGE_BREAKDOWN = [
  { label: "Photos",    gb: 18.2, pct: 38.5, color: "oklch(79% 0.14 175)" },
  { label: "Documents", gb: 12.4, pct: 26.2, color: "oklch(67% 0.21 275)" },
  { label: "Videos",    gb: 11.8, pct: 24.9, color: "oklch(68% 0.18 25)"  },
  { label: "Other",     gb: 4.9,  pct: 10.4, color: "oklch(81% 0.16 85)"  },
];

const COMMANDS = [
  "Upload files", "New folder", "Share selected", "Download",
  "Resolve conflict", "Restore version", "Open settings",
  "View activity", "Manage sync", "Open terminal",
];

// ─── HELPERS ───────────────────────────────────────────────────────────────────

function fileIcon(type: FileType, size = 18) {
  const p = { size, strokeWidth: 1.5 };
  switch (type) {
    case "folder":   return <Folder   {...p} />;
    case "image":    return <Image    {...p} />;
    case "video":    return <Film     {...p} />;
    case "audio":    return <Music    {...p} />;
    case "document": return <FileText {...p} />;
    case "archive":  return <Archive  {...p} />;
    case "code":     return <FileCode {...p} />;
  }
}

function fileColor(type: FileType): string {
  switch (type) {
    case "folder":   return "oklch(81% 0.16 85)";
    case "image":    return "oklch(79% 0.14 175)";
    case "video":    return "oklch(68% 0.18 25)";
    case "audio":    return "oklch(67% 0.21 275)";
    case "document": return "oklch(73% 0.13 230)";
    case "archive":  return "oklch(52% 0.025 265)";
    case "code":     return "oklch(79% 0.14 175)";
  }
}

function eventColor(type: ActivityEvent["eventType"]): string {
  switch (type) {
    case "sync":     return "oklch(67% 0.21 275)";
    case "share":    return "oklch(79% 0.14 175)";
    case "upload":   return "oklch(73% 0.13 230)";
    case "conflict": return "oklch(68% 0.18 25)";
    case "download": return "oklch(81% 0.16 85)";
    case "restore":  return "oklch(52% 0.025 265)";
  }
}

// ─── STORAGE RING ──────────────────────────────────────────────────────────────

function StorageRing() {
  const r = 52, cx = 70, cy = 70;
  const C = 2 * Math.PI * r;
  let cum = 0;
  const segs = STORAGE_BREAKDOWN.map(s => {
    const start = cum;
    cum += s.pct / 100;
    const len = (s.pct / 100) * C;
    return { ...s, da: `${len - 2} ${C - len + 2}`, do: -(start * C) };
  });

  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <svg width={140} height={140} viewBox="0 0 140 140">
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="oklch(22% 0.028 265)" strokeWidth={13} />
        {segs.map(s => (
          <circle key={s.label} cx={cx} cy={cy} r={r}
            fill="none" stroke={s.color} strokeWidth={13}
            strokeDasharray={s.da} strokeDashoffset={s.do}
            style={{ transform: `rotate(-90deg)`, transformOrigin: `${cx}px ${cy}px`, transition: "stroke-dasharray 0.9s cubic-bezier(0.16,1,0.3,1)" }}
          />
        ))}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.7rem", fontWeight: 700, color: "oklch(95% 0.008 265)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>47%</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: "oklch(42% 0.025 265)", letterSpacing: "0.04em" }}>47.3 / 100 GB</span>
      </div>
    </div>
  );
}

// ─── CUSTOM CURSOR ─────────────────────────────────────────────────────────────

function CustomCursor() {
  const dot  = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number;
    let rx = 200, ry = 200, mx = 200, my = 200;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (dot.current) dot.current.style.transform = `translate(${mx - 5}px, ${my - 5}px)`;
    };

    const tick = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (ring.current) ring.current.style.transform = `translate(${rx - 16}px, ${ry - 16}px)`;
      raf = requestAnimationFrame(tick);
    };

    document.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => { document.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div ref={dot} style={{ position: "fixed", top: 0, left: 0, width: 10, height: 10, borderRadius: "50%", background: "oklch(67% 0.21 275)", mixBlendMode: "screen", pointerEvents: "none", zIndex: 99999 }} />
      <div ref={ring} style={{ position: "fixed", top: 0, left: 0, width: 32, height: 32, borderRadius: "50%", border: "1px solid oklch(67% 0.21 275 / 0.4)", pointerEvents: "none", zIndex: 99998 }} />
    </>
  );
}

// ─── COMMAND PALETTE ───────────────────────────────────────────────────────────

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setQuery(""); setTimeout(() => inputRef.current?.focus(), 60); }
  }, [open]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const results = query.trim()
    ? [...COMMANDS, ...FILES.map(f => f.name)].filter(c => c.toLowerCase().includes(query.toLowerCase()))
    : COMMANDS;

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9990, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "18vh" }}
      onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "oklch(12% 0.020 265 / 0.72)", backdropFilter: "blur(10px)" }} />
      <motion.div
        initial={{ opacity: 0, y: -14, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "relative", width: "100%", maxWidth: 560, borderRadius: 14, overflow: "hidden", background: "oklch(18% 0.028 265)", border: "1px solid oklch(32% 0.035 275 / 0.55)", boxShadow: "0 32px 80px oklch(0% 0 0 / 0.65), 0 0 0 1px oklch(67% 0.21 275 / 0.08)" }}
        onClick={e => e.stopPropagation()}>

        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "1px solid oklch(25% 0.028 265)" }}>
          <Search size={15} style={{ color: "oklch(45% 0.025 265)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search files, commands, people…"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "0.875rem", color: "oklch(84% 0.012 265)", fontFamily: "'Inter', sans-serif" }}
          />
          <kbd style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", padding: "2px 6px", borderRadius: 4, background: "oklch(25% 0.028 265)", color: "oklch(48% 0.025 265)", border: "1px solid oklch(30% 0.028 265)" }}>ESC</kbd>
        </div>

        <div style={{ maxHeight: 288, overflowY: "auto", padding: "8px 0" }}>
          {results.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center", fontSize: "0.8rem", color: "oklch(40% 0.025 265)", fontFamily: "'Inter', sans-serif" }}>
              No results for "{query}"
            </div>
          ) : (
            <>
              {query.trim() === "" && (
                <div style={{ padding: "4px 16px 8px", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "oklch(35% 0.025 265)", fontFamily: "'JetBrains Mono', monospace" }}>
                  Commands
                </div>
              )}
              {results.map((item, i) => (
                <button key={i}
                  onClick={onClose}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", background: "transparent", border: "none", color: "oklch(72% 0.020 265)", fontSize: "0.85rem", fontFamily: "'Inter', sans-serif", textAlign: "left", transition: "background 80ms" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "oklch(22% 0.032 265)"; (e.currentTarget as HTMLElement).style.color = "oklch(88% 0.012 265)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "oklch(72% 0.020 265)"; }}>
                  <Search size={13} style={{ color: "oklch(40% 0.025 265)", flexShrink: 0 }} />
                  {item}
                </button>
              ))}
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: 16, padding: "8px 16px", borderTop: "1px solid oklch(20% 0.026 265)" }}>
          {[["↵", "Open"], ["↑↓", "Navigate"], ["⌘K", "Close"]].map(([key, label]) => (
            <span key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.6rem", color: "oklch(35% 0.025 265)", fontFamily: "'JetBrains Mono', monospace" }}>
              <kbd style={{ padding: "1px 5px", borderRadius: 3, background: "oklch(22% 0.028 265)", border: "1px solid oklch(27% 0.028 265)", color: "oklch(48% 0.025 265)" }}>{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── APP ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [appReady, setAppReady] = useState(() => {
    try { return sessionStorage.getItem("nexus-entered") === "true"; }
    catch { return false; }
  });

  const [activeModule, setActiveModule] = useState<Module>("dashboard");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [cmdOpen, setCmdOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [uploadHover, setUploadHover] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen(v => !v); }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const NAV: { id: Module; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <Home size={17} strokeWidth={1.5} />         },
    { id: "files",     label: "Files",     icon: <Folder size={17} strokeWidth={1.5} />       },
    { id: "photos",    label: "Photos",    icon: <Camera size={17} strokeWidth={1.5} />       },
    { id: "activity",  label: "Activity",  icon: <Activity size={17} strokeWidth={1.5} />     },
    { id: "calendar",  label: "Calendar",  icon: <Calendar size={17} strokeWidth={1.5} />     },
    { id: "talk",      label: "Talk",      icon: <MessageSquare size={17} strokeWidth={1.5} />},
    { id: "mail",      label: "Mail",      icon: <Mail size={17} strokeWidth={1.5} />         },
  ];

  const active = (id: Module) => id === activeModule;

  // ── Sidebar ────────────────────────────────────────────────────────────────

  const Sidebar = (
    <nav style={{ width: 224, flexShrink: 0, display: "flex", flexDirection: "column", height: "100%", background: "oklch(15% 0.024 265)", borderRight: "1px solid oklch(22% 0.028 265)" }}>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 20px 18px", borderBottom: "1px solid oklch(20% 0.026 265)" }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: "oklch(67% 0.21 275)", boxShadow: "0 0 16px oklch(67% 0.21 275 / 0.45), inset 0 1px 0 oklch(100% 0 0 / 0.15)" }}>
          <Database size={14} strokeWidth={2} style={{ color: "white" }} />
        </div>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "oklch(95% 0.008 265)", letterSpacing: "-0.02em", lineHeight: 1 }}>Nexus Cloud</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", color: "oklch(38% 0.025 265)", letterSpacing: "0.06em", marginTop: 2 }}>EVENT HORIZON v2</div>
        </div>
      </div>

      {/* Search trigger */}
      <div style={{ padding: "12px 12px 8px" }}>
        <button onClick={() => setCmdOpen(true)}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "oklch(20% 0.030 265)", border: "1px solid oklch(26% 0.028 265)", borderRadius: 8, color: "oklch(42% 0.025 265)", fontSize: "0.78rem", fontFamily: "'Inter', sans-serif", transition: "border-color 140ms, color 140ms" }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "oklch(34% 0.038 275)"; el.style.color = "oklch(58% 0.025 265)"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "oklch(26% 0.028 265)"; el.style.color = "oklch(42% 0.025 265)"; }}>
          <Search size={12} strokeWidth={1.5} />
          <span style={{ flex: 1, textAlign: "left" }}>Search…</span>
          <kbd style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.58rem", padding: "1px 5px", borderRadius: 3, background: "oklch(24% 0.028 265)", border: "1px solid oklch(28% 0.028 265)" }}>⌘K</kbd>
        </button>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: "8px 10px", overflowY: "auto" }}>
        <div style={{ fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "oklch(32% 0.025 265)", fontFamily: "'JetBrains Mono', monospace", padding: "0 10px 8px" }}>Modules</div>
        {NAV.map(item => (
          <button key={item.id} onClick={() => setActiveModule(item.id)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px",
              borderRadius: 8, marginBottom: 1, border: active(item.id) ? "1px solid oklch(67% 0.21 275 / 0.28)" : "1px solid transparent",
              background: active(item.id) ? "oklch(67% 0.21 275 / 0.11)" : "transparent",
              color: active(item.id) ? "oklch(78% 0.14 275)" : "oklch(50% 0.025 265)",
              fontSize: "0.82rem", fontFamily: "'Inter', sans-serif", fontWeight: active(item.id) ? 500 : 400,
              transition: "all 140ms",
            }}
            onMouseEnter={e => { if (!active(item.id)) { const el = e.currentTarget as HTMLElement; el.style.background = "oklch(20% 0.030 265)"; el.style.color = "oklch(66% 0.020 265)"; } }}
            onMouseLeave={e => { if (!active(item.id)) { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "oklch(50% 0.025 265)"; } }}>
            <span style={{ color: active(item.id) ? "oklch(67% 0.21 275)" : "oklch(40% 0.025 265)" }}>{item.icon}</span>
            {item.label}
            {item.id === "activity" && (
              <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "oklch(68% 0.18 25)", boxShadow: "0 0 6px oklch(68% 0.18 25 / 0.7)" }} />
            )}
          </button>
        ))}

        <div style={{ height: 1, background: "oklch(20% 0.026 265)", margin: "12px 0" }} />

        <div style={{ fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "oklch(32% 0.025 265)", fontFamily: "'JetBrains Mono', monospace", padding: "0 10px 8px" }}>Quick Access</div>
        {[
          { label: "Recent",        icon: <Clock  size={14} strokeWidth={1.5} /> },
          { label: "Starred",       icon: <Star   size={14} strokeWidth={1.5} /> },
          { label: "Shared with me",icon: <Users  size={14} strokeWidth={1.5} /> },
          { label: "Trash",         icon: <Archive size={14} strokeWidth={1.5} /> },
        ].map(item => (
          <button key={item.label}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, marginBottom: 1, border: "1px solid transparent", background: "transparent", color: "oklch(44% 0.025 265)", fontSize: "0.8rem", fontFamily: "'Inter', sans-serif", transition: "all 140ms" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "oklch(20% 0.030 265)"; el.style.color = "oklch(60% 0.020 265)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "oklch(44% 0.025 265)"; }}>
            <span style={{ color: "oklch(36% 0.025 265)" }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Storage bar */}
      <div style={{ padding: "14px 16px", borderTop: "1px solid oklch(20% 0.026 265)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: "0.72rem", color: "oklch(48% 0.025 265)", fontFamily: "'Inter', sans-serif" }}>Storage</span>
          <span style={{ fontSize: "0.72rem", fontFamily: "'JetBrains Mono', monospace", color: "oklch(67% 0.21 275)" }}>47.3 GB</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: "oklch(20% 0.028 265)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: "47.3%", borderRadius: 2, background: "linear-gradient(90deg, oklch(67% 0.21 275), oklch(79% 0.14 175))", boxShadow: "0 0 8px oklch(67% 0.21 275 / 0.4)" }} />
        </div>
        <div style={{ marginTop: 5, fontSize: "0.6rem", color: "oklch(36% 0.025 265)", fontFamily: "'JetBrains Mono', monospace" }}>52.7 GB free · 100 GB plan</div>
      </div>

      {/* User */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderTop: "1px solid oklch(20% 0.026 265)" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, fontFamily: "'Syne', sans-serif", background: "oklch(67% 0.21 275 / 0.18)", color: "oklch(67% 0.21 275)", border: "1px solid oklch(67% 0.21 275 / 0.3)", flexShrink: 0 }}>AK</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "oklch(84% 0.012 265)", fontFamily: "'Inter', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Alex Kim</div>
          <div style={{ fontSize: "0.6rem", color: "oklch(36% 0.025 265)", fontFamily: "'JetBrains Mono', monospace" }}>admin · localhost</div>
        </div>
        <button
          onClick={() => setActiveModule("settings")}
          style={{ padding: 6, borderRadius: 6, background: "transparent", border: "none", color: "oklch(36% 0.025 265)", transition: "color 140ms, background 140ms" }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "oklch(22% 0.032 265)"; el.style.color = "oklch(55% 0.025 265)"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "oklch(36% 0.025 265)"; }}>
          <Settings size={14} strokeWidth={1.5} />
        </button>
      </div>
    </nav>
  );

  // ── Top Bar ────────────────────────────────────────────────────────────────

  const TopBar = (
    <div style={{ height: 52, display: "flex", alignItems: "center", gap: 12, padding: "0 20px", borderBottom: "1px solid oklch(20% 0.026 265)", background: "oklch(15% 0.024 265 / 0.85)", backdropFilter: "blur(14px)", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: "0.75rem", color: "oklch(36% 0.025 265)", fontFamily: "'Inter', sans-serif" }}>Nexus</span>
        <ChevronRight size={11} style={{ color: "oklch(28% 0.025 265)" }} />
        <span style={{ fontSize: "0.75rem", color: "oklch(68% 0.020 265)", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
          {activeModule.charAt(0).toUpperCase() + activeModule.slice(1)}
        </span>
      </div>

      {/* Sync pill */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 20, background: "oklch(20% 0.030 265)", border: "1px solid oklch(26% 0.028 265)" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "oklch(79% 0.14 155)", boxShadow: "0 0 8px oklch(79% 0.14 155 / 0.7)", flexShrink: 0 }} />
        <span style={{ fontSize: "0.68rem", color: "oklch(50% 0.025 265)", fontFamily: "'JetBrains Mono', monospace" }}>Synced</span>
      </div>

      {/* View toggle — only in files */}
      {activeModule === "files" && (
        <div style={{ display: "flex", gap: 2, padding: 3, background: "oklch(18% 0.028 265)", borderRadius: 8, border: "1px solid oklch(24% 0.028 265)" }}>
          {([["grid", <LayoutGrid size={14} strokeWidth={1.5} />], ["list", <List size={14} strokeWidth={1.5} />]] as [ViewMode, React.ReactNode][]).map(([mode, icon]) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              style={{ padding: "5px 8px", borderRadius: 6, border: "none", transition: "all 140ms", background: viewMode === mode ? "oklch(27% 0.032 265)" : "transparent", color: viewMode === mode ? "oklch(67% 0.21 275)" : "oklch(38% 0.025 265)" }}>
              {icon}
            </button>
          ))}
        </div>
      )}

      <button onClick={() => setCmdOpen(true)}
        style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 12px", borderRadius: 8, background: "oklch(20% 0.030 265)", border: "1px solid oklch(26% 0.028 265)", color: "oklch(44% 0.025 265)", fontSize: "0.75rem", fontFamily: "'Inter', sans-serif", transition: "all 140ms" }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "oklch(34% 0.038 275)"; el.style.color = "oklch(60% 0.020 265)"; }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "oklch(26% 0.028 265)"; el.style.color = "oklch(44% 0.025 265)"; }}>
        <Command size={12} strokeWidth={2} />
        Command
        <kbd style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.58rem", padding: "1px 4px", borderRadius: 3, background: "oklch(24% 0.028 265)", border: "1px solid oklch(28% 0.028 265)" }}>⌘K</kbd>
      </button>

      <button style={{ position: "relative", padding: 7, borderRadius: 8, background: "transparent", border: "none", color: "oklch(40% 0.025 265)", transition: "all 140ms" }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "oklch(20% 0.030 265)"; el.style.color = "oklch(56% 0.025 265)"; }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "oklch(40% 0.025 265)"; }}>
        <Bell size={16} strokeWidth={1.5} />
        <span style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, borderRadius: "50%", background: "oklch(68% 0.18 25)", boxShadow: "0 0 6px oklch(68% 0.18 25 / 0.7)" }} />
      </button>
    </div>
  );

  // ── Dashboard Module ────────────────────────────────────────────────────────

  const DashModule = (
    <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(1.6rem, 1.4rem + 1.5vw, 2.4rem)", fontWeight: 800, color: "oklch(95% 0.008 265)", letterSpacing: "-0.025em", lineHeight: 1.05, textWrap: "balance", margin: 0 }}>
          Your space is ready.
        </h1>
        <p style={{ marginTop: 8, fontSize: "0.82rem", color: "oklch(42% 0.025 265)", fontFamily: "'Inter', sans-serif" }}>
          Sunday, July 13, 2026 · Last sync 2 minutes ago · 3 devices online
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Total Files",     value: "3,847",   sub: "+12 today",   icon: <Folder   size={17} strokeWidth={1.5} />, color: "oklch(81% 0.16 85)"  },
          { label: "Storage Used",    value: "47.3 GB", sub: "52.7 GB free", icon: <HardDrive size={17} strokeWidth={1.5} />, color: "oklch(67% 0.21 275)" },
          { label: "Shared Links",    value: "24",      sub: "6 active",    icon: <Share2   size={17} strokeWidth={1.5} />, color: "oklch(79% 0.14 175)" },
          { label: "Synced Devices",  value: "3",       sub: "All online",  icon: <Zap      size={17} strokeWidth={1.5} />, color: "oklch(79% 0.14 155)" },
        ].map(s => (
          <div key={s.label}
            style={{ padding: 18, borderRadius: 14, background: "oklch(18% 0.028 265)", border: "1px solid oklch(26% 0.028 265)", boxShadow: "inset 0 1px 0 oklch(100% 0 0 / 0.04)", transition: "transform 200ms, border-color 200ms" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "oklch(32% 0.038 275)"; el.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "oklch(26% 0.028 265)"; el.style.transform = "none"; }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
              <div style={{ padding: "7px 8px", borderRadius: 8, background: `${s.color.replace("oklch(", "oklch(").slice(0, -1)} / 0.14)` }}>
                <span style={{ color: s.color, display: "flex" }}>{s.icon}</span>
              </div>
              <TrendingUp size={11} strokeWidth={2} style={{ color: "oklch(79% 0.14 155)", marginTop: 4 }} />
            </div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.65rem", fontWeight: 700, color: "oklch(95% 0.008 265)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
            <div style={{ fontSize: "0.72rem", color: "oklch(42% 0.025 265)", fontFamily: "'Inter', sans-serif", marginTop: 5 }}>{s.label}</div>
            <div style={{ fontSize: "0.62rem", color: "oklch(52% 0.025 265)", fontFamily: "'JetBrains Mono', monospace", marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Storage + Activity row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 18, marginBottom: 28 }}>

        {/* Storage breakdown */}
        <div style={{ padding: 22, borderRadius: 14, background: "oklch(18% 0.028 265)", border: "1px solid oklch(26% 0.028 265)", boxShadow: "inset 0 1px 0 oklch(100% 0 0 / 0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: "0.88rem", color: "oklch(82% 0.012 265)", margin: 0 }}>Storage Breakdown</h2>
            <span style={{ fontSize: "0.6rem", color: "oklch(38% 0.025 265)", fontFamily: "'JetBrains Mono', monospace" }}>100 GB plan</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <StorageRing />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              {STORAGE_BREAKDOWN.map(s => (
                <div key={s.label}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                      <span style={{ fontSize: "0.78rem", color: "oklch(66% 0.020 265)", fontFamily: "'Inter', sans-serif" }}>{s.label}</span>
                    </div>
                    <span style={{ fontSize: "0.68rem", color: "oklch(48% 0.025 265)", fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: "tabular-nums" }}>{s.gb} GB</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: "oklch(22% 0.028 265)", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 2, width: `${s.pct}%`, background: s.color, transition: "width 0.9s cubic-bezier(0.16,1,0.3,1)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity */}
        <div style={{ padding: 22, borderRadius: 14, background: "oklch(18% 0.028 265)", border: "1px solid oklch(26% 0.028 265)", boxShadow: "inset 0 1px 0 oklch(100% 0 0 / 0.04)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: "0.88rem", color: "oklch(82% 0.012 265)", margin: 0 }}>Activity</h2>
            <button
              onClick={() => setActiveModule("activity")}
              style={{ fontSize: "0.65rem", color: "oklch(38% 0.025 265)", fontFamily: "'JetBrains Mono', monospace", background: "transparent", border: "none", transition: "color 140ms" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "oklch(67% 0.21 275)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "oklch(38% 0.025 265)"; }}>
              View all →
            </button>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
            {ACTIVITY.map(ev => (
              <div key={ev.id} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: `${eventColor(ev.eventType).slice(0, -1)} / 0.15)`, border: `1px solid ${eventColor(ev.eventType).slice(0, -1)} / 0.3)` }}>
                  {ev.initials
                    ? <span style={{ fontSize: "0.55rem", fontWeight: 700, color: eventColor(ev.eventType), fontFamily: "'Syne', sans-serif" }}>{ev.initials}</span>
                    : <span style={{ color: eventColor(ev.eventType), display: "flex" }}>
                        {ev.eventType === "sync"    && <RefreshCw    size={10} strokeWidth={2} />}
                        {ev.eventType === "upload"  && <Upload       size={10} strokeWidth={2} />}
                        {ev.eventType === "conflict"&& <AlertTriangle size={10} strokeWidth={2} />}
                        {ev.eventType === "restore" && <Clock        size={10} strokeWidth={2} />}
                        {ev.eventType === "download"&& <Download     size={10} strokeWidth={2} />}
                      </span>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "oklch(66% 0.020 265)", fontFamily: "'Inter', sans-serif", lineHeight: 1.4 }}>
                    <span style={{ color: ev.eventType === "conflict" ? "oklch(68% 0.18 25)" : eventColor(ev.eventType), fontWeight: 500 }}>{ev.verb}</span>
                    {" "}
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block", maxWidth: "calc(100% - 4rem)", verticalAlign: "bottom" }}>{ev.file}</span>
                  </p>
                  <p style={{ margin: 0, fontSize: "0.62rem", color: "oklch(34% 0.025 265)", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{ev.user} · {ev.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent files */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: "0.88rem", color: "oklch(82% 0.012 265)", margin: 0 }}>Recent Files</h2>
          <button onClick={() => setActiveModule("files")}
            style={{ fontSize: "0.75rem", color: "oklch(67% 0.21 275)", fontFamily: "'Inter', sans-serif", background: "transparent", border: "none", transition: "color 140ms" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "oklch(78% 0.14 275)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "oklch(67% 0.21 275)"; }}>
            Browse all files →
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
          {FILES.slice(0, 6).map(f => (
            <div key={f.id}
              style={{ padding: 14, borderRadius: 12, background: "oklch(18% 0.028 265)", border: "1px solid oklch(26% 0.028 265)", boxShadow: "inset 0 1px 0 oklch(100% 0 0 / 0.04)", transition: "all 200ms" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "oklch(32% 0.038 275)"; el.style.background = "oklch(20% 0.030 265)"; el.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "oklch(26% 0.028 265)"; el.style.background = "oklch(18% 0.028 265)"; el.style.transform = "none"; }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, background: `${fileColor(f.type).slice(0, -1)} / 0.14)` }}>
                <span style={{ color: fileColor(f.type), display: "flex" }}>{fileIcon(f.type, 16)}</span>
              </div>
              <div style={{ fontSize: "0.72rem", fontWeight: 500, color: "oklch(75% 0.012 265)", fontFamily: "'Inter', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>{f.name}</div>
              <div style={{ fontSize: "0.6rem", color: "oklch(36% 0.025 265)", fontFamily: "'JetBrains Mono', monospace" }}>{f.size ?? `${f.items} items`}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Files Module ────────────────────────────────────────────────────────────

  const FilesModule = (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 24px", borderBottom: "1px solid oklch(20% 0.026 265)", flexShrink: 0 }}>
        <button
          onMouseEnter={() => setUploadHover(true)}
          onMouseLeave={() => setUploadHover(false)}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 9, background: "oklch(67% 0.21 275)", color: "white", fontSize: "0.82rem", fontFamily: "'Inter', sans-serif", fontWeight: 500, border: "none", boxShadow: uploadHover ? "0 0 20px oklch(67% 0.21 275 / 0.45)" : "0 0 12px oklch(67% 0.21 275 / 0.25)", transform: uploadHover ? "translateY(-1px)" : "none", transition: "all 200ms cubic-bezier(0.34,1.56,0.64,1)" }}>
          <Upload size={13} strokeWidth={2} /> Upload files
        </button>
        <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 9, background: "oklch(20% 0.030 265)", border: "1px solid oklch(26% 0.028 265)", color: "oklch(56% 0.025 265)", fontSize: "0.82rem", fontFamily: "'Inter', sans-serif", transition: "all 140ms" }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "oklch(32% 0.038 275)"; el.style.color = "oklch(68% 0.020 265)"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "oklch(26% 0.028 265)"; el.style.color = "oklch(56% 0.025 265)"; }}>
          <Plus size={13} strokeWidth={2} /> New folder
        </button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: "0.68rem", color: "oklch(36% 0.025 265)", fontFamily: "'JetBrains Mono', monospace" }}>{FILES.length} items · 47.3 GB</span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        {viewMode === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(176px, 1fr))", gap: 12 }}>
            {FILES.map(f => (
              <div key={f.id}
                style={{ position: "relative", padding: "16px 14px 14px", borderRadius: 13, background: selectedFile === f.id ? "oklch(67% 0.21 275 / 0.1)" : "oklch(18% 0.028 265)", border: selectedFile === f.id ? "1px solid oklch(67% 0.21 275 / 0.45)" : "1px solid oklch(26% 0.028 265)", boxShadow: "inset 0 1px 0 oklch(100% 0 0 / 0.04)", transition: "all 200ms cubic-bezier(0.16,1,0.3,1)" }}
                onClick={() => setSelectedFile(selectedFile === f.id ? null : f.id)}
                onMouseEnter={e => { if (selectedFile !== f.id) { const el = e.currentTarget as HTMLElement; el.style.borderColor = "oklch(30% 0.035 275)"; el.style.background = "oklch(20% 0.030 265)"; el.style.transform = "translateY(-3px)"; el.style.boxShadow = "0 8px 24px oklch(0% 0 0 / 0.35), inset 0 1px 0 oklch(100% 0 0 / 0.06)"; }}}
                onMouseLeave={e => { if (selectedFile !== f.id) { const el = e.currentTarget as HTMLElement; el.style.borderColor = "oklch(26% 0.028 265)"; el.style.background = "oklch(18% 0.028 265)"; el.style.transform = "none"; el.style.boxShadow = "inset 0 1px 0 oklch(100% 0 0 / 0.04)"; }}}>
                {/* Badges */}
                <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 5, alignItems: "center" }}>
                  {f.starred && <Star size={11} fill="oklch(81% 0.16 85)" style={{ color: "oklch(81% 0.16 85)" }} />}
                  {f.shared  && <Share2 size={11} style={{ color: "oklch(79% 0.14 175)" }} />}
                </div>
                {/* Icon */}
                <div style={{ width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, background: `${fileColor(f.type).slice(0, -1)} / 0.15)` }}>
                  <span style={{ color: fileColor(f.type), display: "flex" }}>{fileIcon(f.type, 22)}</span>
                </div>
                <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "oklch(82% 0.012 265)", fontFamily: "'Inter', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 18, marginBottom: 5 }}>{f.name}</div>
                <div style={{ fontSize: "0.62rem", color: "oklch(38% 0.025 265)", fontFamily: "'JetBrains Mono', monospace" }}>{f.size ?? `${f.items} items`} · {f.modified}</div>
              </div>
            ))}
          </div>
        ) : (
          /* List view */
          <div style={{ borderRadius: 13, border: "1px solid oklch(22% 0.028 265)", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 100px 120px 60px", padding: "8px 16px", borderBottom: "1px solid oklch(22% 0.028 265)", background: "oklch(15% 0.024 265)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "oklch(34% 0.025 265)", fontFamily: "'JetBrains Mono', monospace" }}>
              <span>Name</span><span>Size</span><span>Modified</span><span>Shared</span>
            </div>
            {FILES.map((f, i) => (
              <div key={f.id}
                style={{ display: "grid", gridTemplateColumns: "2fr 100px 120px 60px", alignItems: "center", padding: "11px 16px", borderBottom: i < FILES.length - 1 ? "1px solid oklch(19% 0.026 265)" : "none", background: selectedFile === f.id ? "oklch(67% 0.21 275 / 0.07)" : "transparent", transition: "background 100ms" }}
                onClick={() => setSelectedFile(selectedFile === f.id ? null : f.id)}
                onMouseEnter={e => { if (selectedFile !== f.id) (e.currentTarget as HTMLElement).style.background = "oklch(19% 0.028 265)"; }}
                onMouseLeave={e => { if (selectedFile !== f.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <span style={{ color: fileColor(f.type), display: "flex", flexShrink: 0 }}>{fileIcon(f.type, 15)}</span>
                  <span style={{ fontSize: "0.82rem", color: "oklch(75% 0.012 265)", fontFamily: "'Inter', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                  {f.starred && <Star size={10} fill="oklch(81% 0.16 85)" style={{ color: "oklch(81% 0.16 85)", flexShrink: 0 }} />}
                </div>
                <span style={{ fontSize: "0.72rem", color: "oklch(42% 0.025 265)", fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: "tabular-nums" }}>{f.size ?? "—"}</span>
                <span style={{ fontSize: "0.72rem", color: "oklch(42% 0.025 265)", fontFamily: "'JetBrains Mono', monospace" }}>{f.modified}</span>
                <span>{f.shared ? <Share2 size={13} style={{ color: "oklch(79% 0.14 175)" }} /> : <span style={{ color: "oklch(28% 0.025 265)", fontSize: "0.75rem" }}>—</span>}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ── Placeholder Module ──────────────────────────────────────────────────────

  const PlaceholderModule = (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", background: "oklch(67% 0.21 275 / 0.08)", border: "1px dashed oklch(67% 0.21 275 / 0.3)" }}>
          <span style={{ color: "oklch(67% 0.21 275 / 0.45)", display: "flex" }}>
            {activeModule === "photos"   && <Camera       size={28} strokeWidth={1.2} />}
            {activeModule === "activity" && <Activity     size={28} strokeWidth={1.2} />}
            {activeModule === "calendar" && <Calendar     size={28} strokeWidth={1.2} />}
            {activeModule === "talk"     && <MessageSquare size={28} strokeWidth={1.2} />}
            {activeModule === "mail"     && <Mail         size={28} strokeWidth={1.2} />}
            {activeModule === "settings" && <Settings     size={28} strokeWidth={1.2} />}
          </span>
        </div>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: "1.05rem", color: "oklch(68% 0.020 265)", margin: "0 0 8px" }}>
          {activeModule.charAt(0).toUpperCase() + activeModule.slice(1)} is coming.
        </h3>
        <p style={{ fontSize: "0.8rem", color: "oklch(38% 0.025 265)", fontFamily: "'Inter', sans-serif", margin: 0 }}>
          Connect your {activeModule} to get started.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 20 }}>
          {activeModule === "activity" && ACTIVITY.slice(0, 3).map(ev => (
            <div key={ev.id} style={{ padding: "6px 12px", borderRadius: 20, background: "oklch(18% 0.028 265)", border: "1px solid oklch(24% 0.028 265)", fontSize: "0.7rem", fontFamily: "'Inter', sans-serif", color: "oklch(52% 0.025 265)" }}>
              <span style={{ color: eventColor(ev.eventType), fontWeight: 500 }}>{ev.verb}</span> {ev.file.slice(0, 16)}…
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  if (!appReady) {
    return (
      <LoadingScreen
        onComplete={() => {
          try { sessionStorage.setItem("nexus-entered", "true"); } catch {}
          setAppReady(true);
        }}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "fixed", inset: 0, background: "oklch(12% 0.020 265)", overflow: "hidden", cursor: "none" }}
    >
      <style>{`
        @keyframes spine-pulse {
          0%   { background-position: 0%   50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0%   50%; }
        }
        * { cursor: none !important; }
        ::-webkit-scrollbar       { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: oklch(26% 0.028 265); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: oklch(33% 0.035 275); }
        ::selection { background: oklch(67% 0.21 275 / 0.3); color: oklch(95% 0.008 265); }
      `}</style>

      <CustomCursor />

      {/* Status Spine */}
      <div style={{ height: 2, background: "linear-gradient(90deg, oklch(67% 0.21 275), oklch(79% 0.14 175), oklch(73% 0.13 230), oklch(67% 0.21 275))", backgroundSize: "300% 100%", animation: "spine-pulse 5s ease-in-out infinite", position: "relative", zIndex: 100 }} />

      {/* Layout */}
      <div style={{ display: "flex", height: "calc(100% - 2px)" }}>
        {Sidebar}

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {TopBar}

          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {activeModule === "dashboard" && DashModule}
            {activeModule === "files"     && FilesModule}
            {activeModule !== "dashboard" && activeModule !== "files" && PlaceholderModule}
          </div>
        </div>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </motion.div>
  );
}
