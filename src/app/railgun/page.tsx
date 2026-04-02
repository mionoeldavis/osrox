"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  AlertTriangle,
  Eye,
  TrendingUp,
  Ban,
  ChevronRight,
  Info,
  Target,
  AtSign,
  Terminal,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { formatNumber } from "@/lib/format";

const SHADOWBAN_REASONS = [
  {
    icon: Eye,
    title: "IMPRESSION FLOOD DETECTED",
    desc: "When an account suddenly gains millions of impressions without organic reach history, Instagram's ML pipeline flags the spike as synthetic traffic.",
  },
  {
    icon: Ban,
    title: "ENGAGEMENT RATIO MISMATCH",
    desc: "Billions of views with near-zero likes and followers creates an engagement ratio so far from human norms that the algorithm immediately throttles distribution.",
  },
  {
    icon: TrendingUp,
    title: "VELOCITY ANOMALY",
    desc: "Impressions accumulating at thousands per second is a hard signal. No organic post achieves this velocity. The account enters suppression within minutes.",
  },
  {
    icon: AlertTriangle,
    title: "SHADOWBAN ENFORCED",
    desc: "Instagram does not notify the account owner. Content is hidden from Explore, hashtags, and Reels feeds. The account appears live but reaches nobody.",
  },
];

const TOTAL_IMPRESSIONS = 2_400_000;
const FIRE_DURATION_MS = 9000;

type LogColor = "yellow" | "green" | "red" | "cyan" | "dim";

interface LogLine {
  id: number;
  text: string;
  color: LogColor;
}

function buildSequence(t: string): Array<{ ms: number; text: string; color: LogColor }> {
  return [
    { ms: 0,    text: "[RAILGUN] Payload engine v4.2 — initializing...",              color: "yellow" },
    { ms: 250,  text: "[SYS]     Loading CDN spoof layer... OK",                      color: "dim"    },
    { ms: 480,  text: "[SYS]     Loading rate-limit bypass... OK",                    color: "dim"    },
    { ms: 700,  text: "[SWARM]   Connecting to distributed bot network...",            color: "dim"    },
    { ms: 1050, text: "[SWARM]   Node scan complete — 847 / 847 nodes ONLINE",        color: "green"  },
    { ms: 1300, text: "[SWARM]   Region map: US-EAST ██ EU-WEST ██ ASIA ██ LATAM ██", color: "cyan"   },
    { ms: 1600, text: `[TARGET]  Resolving @${t}...`,                                 color: "dim"    },
    { ms: 1950, text: `[TARGET]  Profile confirmed ✓  @${t}`,                        color: "yellow" },
    { ms: 2150, text: `[TARGET]  Posts: 234  |  Followers: 12.4K  |  Following: 891`, color: "dim"    },
    { ms: 2400, text: "[BOT-NET] Assigning 847 bots to impression queue...",           color: "dim"    },
    { ms: 2650, text: "[BOT-NET] BOT-001 → BOT-847 locked on target — READY",        color: "green"  },
    { ms: 2900, text: "[RAILGUN] ⚡  FIRE — impression flood INITIATED",              color: "yellow" },
    { ms: 3200, text: "[INJECT]  Batch  #1 — 240,000 impressions dispatched",         color: "green"  },
    { ms: 3650, text: "[INJECT]  Batch  #2 — 240,000 impressions dispatched",         color: "green"  },
    { ms: 4000, text: "[BYPASS]  Instagram CDN rate-limiter: BYPASSED ✓",             color: "green"  },
    { ms: 4200, text: "[INJECT]  Batch  #3 — 240,000 impressions dispatched",         color: "green"  },
    { ms: 4600, text: "[INJECT]  Batch  #4 — 240,000 impressions dispatched",         color: "green"  },
    { ms: 4900, text: "[MONITOR] Engagement ratio: 0.00%  ← anomaly threshold hit",   color: "red"    },
    { ms: 5200, text: "[INJECT]  Batch  #5 — 240,000 impressions dispatched",         color: "green"  },
    { ms: 5550, text: "[INJECT]  Batch  #6 — 240,000 impressions dispatched",         color: "green"  },
    { ms: 5900, text: "[INSTA]   Algorithm flagged — suppression signal detected",    color: "red"    },
    { ms: 6150, text: "[INJECT]  Batch  #7 — 240,000 impressions dispatched",         color: "green"  },
    { ms: 6500, text: "[INJECT]  Batch  #8 — 240,000 impressions dispatched",         color: "green"  },
    { ms: 6800, text: "[INSTA]   Shadowban trigger: ACTIVE — account suppressed",     color: "red"    },
    { ms: 7100, text: "[INJECT]  Batch  #9 — 240,000 impressions dispatched",         color: "green"  },
    { ms: 7450, text: "[INJECT]  Batch #10 — 240,000 impressions dispatched",         color: "green"  },
    { ms: 7800, text: "[SWARM]   All 847 bots standing down...",                      color: "dim"    },
    { ms: 8200, text: `[RAILGUN] ✓  OPERATION COMPLETE — @${t} flooded`,             color: "green"  },
    { ms: 8500, text: "[STATUS]  Total impressions: 2,400,000",                       color: "cyan"   },
    { ms: 8700, text: "[STATUS]  Shadowban probability: CRITICAL (98.7%)",            color: "red"    },
    { ms: 8900, text: "[STATUS]  Likes gained: 0  |  Followers gained: 0",            color: "red"    },
  ];
}

const COLOR_CLASS: Record<LogColor, string> = {
  yellow: "text-neon-yellow",
  green:  "text-neon-green",
  red:    "text-neon-red",
  cyan:   "text-neon-cyan",
  dim:    "text-text-dim",
};

export default function RailgunPage() {
  const [target, setTarget]             = useState("");
  const [firing, setFiring]             = useState(false);
  const [fired, setFired]               = useState(false);
  const [firedTarget, setFiredTarget]   = useState("");
  const [logLines, setLogLines]         = useState<LogLine[]>([]);
  const [impressions, setImpressions]   = useState(0);
  const [progress, setProgress]         = useState(0);

  const terminalRef  = useRef<HTMLDivElement>(null);
  const timersRef    = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const lineId       = useRef(0);

  const cleanTarget = target.replace("@", "").trim();

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logLines]);

  const handleFire = () => {
    if (firing || fired || !cleanTarget) return;

    setFiring(true);
    setFired(false);
    setLogLines([]);
    setImpressions(0);
    setProgress(0);
    setFiredTarget(cleanTarget);
    clearTimers();

    const sequence = buildSequence(cleanTarget);

    sequence.forEach(({ ms, text, color }) => {
      const t = setTimeout(() => {
        setLogLines((prev) => [...prev, { id: lineId.current++, text, color }]);
      }, ms);
      timersRef.current.push(t);
    });

    // Impression counter — runs for FIRE_DURATION_MS
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(elapsed / FIRE_DURATION_MS, 1);
      // Ease-out cubic so it slows near the end
      const eased = 1 - Math.pow(1 - pct, 3);
      setImpressions(Math.floor(eased * TOTAL_IMPRESSIONS));
      setProgress(Math.floor(pct * 100));

      if (pct >= 1) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setImpressions(TOTAL_IMPRESSIONS);
        setProgress(100);
        setFiring(false);
        setFired(true);
      }
    }, 50);
  };

  const handleReset = () => {
    clearTimers();
    setFired(false);
    setFiring(false);
    setTarget("");
    setFiredTarget("");
    setLogLines([]);
    setImpressions(0);
    setProgress(0);
  };

  const showTerminal = firing || fired;

  return (
    <div className="h-full flex flex-col bg-bg-dark bg-grid">
      <Navbar />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card-glow p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Zap
                className="w-7 h-7 text-neon-yellow"
                style={{ filter: "drop-shadow(0 0 8px rgba(255,230,0,0.7))" }}
              />
              {firing && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-neon-yellow animate-ping" />
              )}
            </div>
            <div>
              <h1
                className="text-neon-yellow text-xl font-bold tracking-[0.4em]"
                style={{ textShadow: "0 0 12px rgba(255,230,0,0.6), 0 0 24px rgba(255,230,0,0.3)" }}
              >
                RAILGUN
              </h1>
              <p className="text-text-dim text-[10px] tracking-widest uppercase mt-0.5">
                Mass Impression &amp; View Injection Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-text-dim">
            {firing ? (
              <><span className="w-1.5 h-1.5 rounded-full bg-neon-yellow animate-ping" /><span className="text-neon-yellow">FIRING...</span></>
            ) : fired ? (
              <><span className="w-1.5 h-1.5 rounded-full bg-neon-green" /><span className="text-neon-green">PAYLOAD DELIVERED</span></>
            ) : (
              <><span className="w-1.5 h-1.5 rounded-full bg-text-dim" /><span>STANDBY</span></>
            )}
          </div>
        </motion.div>

        {/* ── Target input ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="card-glow p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-neon-yellow" />
            <span className="text-[10px] text-neon-yellow tracking-widest font-bold uppercase">
              Target Acquisition
            </span>
          </div>

          <div>
            <label className="text-[10px] text-text-dim tracking-widest uppercase mb-1.5 block">
              Instagram Username
            </label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim pointer-events-none" />
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFire()}
                placeholder="username or @username"
                disabled={firing || fired}
                className="w-full bg-black/50 border border-border-dim text-neon-yellow placeholder:text-text-dim pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-neon-yellow/50 transition-colors disabled:opacity-40"
              />
            </div>
            {cleanTarget && !fired && (
              <p className="text-[10px] text-text-dim mt-1">
                Target locked: <span className="text-neon-yellow">@{cleanTarget}</span>
              </p>
            )}
          </div>

          <AnimatePresence mode="wait">
            {fired ? (
              <motion.button
                key="reset"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleReset}
                className="w-full py-3 border border-neon-green/50 text-neon-green text-sm font-bold tracking-widest hover:bg-neon-green/10 transition-all cursor-pointer"
              >
                RESET — NEW TARGET
              </motion.button>
            ) : (
              <motion.button
                key="fire"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleFire}
                disabled={firing || !cleanTarget}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 border text-sm font-bold tracking-widest transition-all flex items-center justify-center gap-2 ${
                  firing
                    ? "border-neon-yellow/50 text-neon-yellow cursor-not-allowed"
                    : !cleanTarget
                    ? "border-border-dim text-text-dim cursor-not-allowed"
                    : "border-neon-yellow/60 text-neon-yellow hover:bg-neon-yellow/10 cursor-pointer"
                }`}
                style={
                  cleanTarget && !firing
                    ? { boxShadow: "0 0 8px rgba(255,230,0,0.3), 0 0 30px rgba(255,230,0,0.1)" }
                    : {}
                }
              >
                {firing ? (
                  <><Zap className="w-4 h-4 animate-pulse" />FIRING ON @{firedTarget}...</>
                ) : (
                  <><Zap className="w-4 h-4" />FIRE RAILGUN</>
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Terminal + counter ── */}
        <AnimatePresence>
          {showTerminal && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.35 }}
              className="card overflow-hidden"
              style={{ borderColor: fired ? "rgba(0,255,65,0.25)" : "rgba(255,230,0,0.2)" }}
            >
              {/* Terminal title bar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-dim bg-black/30">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-neon-yellow" />
                  <span className="text-[10px] text-neon-yellow tracking-widest uppercase font-bold">
                    Railgun Terminal
                  </span>
                </div>
                <span className={`text-[10px] tracking-widest ${fired ? "text-neon-green" : "text-neon-yellow"}`}>
                  {fired ? "COMPLETE" : "ACTIVE"}
                </span>
              </div>

              {/* Big impression counter */}
              <div
                className="px-4 py-5 border-b border-border-dim text-center"
                style={{ background: "rgba(0,0,0,0.4)" }}
              >
                <p className="text-[10px] text-text-dim tracking-widest uppercase mb-1">
                  Impressions Injected
                </p>
                <p
                  className="text-4xl md:text-5xl font-bold tabular-nums"
                  style={{
                    color: fired ? "var(--neon-green)" : "var(--neon-yellow)",
                    textShadow: fired
                      ? "0 0 20px rgba(0,255,65,0.6), 0 0 40px rgba(0,255,65,0.3)"
                      : "0 0 20px rgba(255,230,0,0.6), 0 0 40px rgba(255,230,0,0.3)",
                  }}
                >
                  {formatNumber(impressions)}
                </p>
                <p className="text-[10px] text-text-dim mt-1">
                  of {formatNumber(TOTAL_IMPRESSIONS)} target
                </p>

                {/* Progress bar */}
                <div className="w-full h-1 bg-border-dim mt-3 overflow-hidden">
                  <motion.div
                    className="h-full"
                    style={{
                      background: fired ? "var(--neon-green)" : "var(--neon-yellow)",
                      boxShadow: fired
                        ? "0 0 8px rgba(0,255,65,0.7)"
                        : "0 0 8px rgba(255,230,0,0.7)",
                    }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear", duration: 0.05 }}
                  />
                </div>
              </div>

              {/* Log lines */}
              <div
                ref={terminalRef}
                className="h-52 overflow-y-auto px-4 py-3 space-y-0.5 bg-black/20"
              >
                {logLines.map((line) => (
                  <motion.p
                    key={line.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`text-[11px] font-mono leading-relaxed whitespace-pre ${COLOR_CLASS[line.color]}`}
                  >
                    {line.text}
                  </motion.p>
                ))}
                {firing && (
                  <p className="text-[11px] text-text-dim cursor-blink">&nbsp;</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Info banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card p-4 flex gap-3"
          style={{ borderColor: "rgba(255,230,0,0.15)", boxShadow: "0 0 20px rgba(255,230,0,0.04)" }}
        >
          <Info className="w-4 h-4 text-neon-yellow shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p className="text-neon-yellow text-xs font-bold tracking-widest uppercase">
              What Railgun Does
            </p>
            <p className="text-[11px] text-[#c9d1d9]/70 leading-relaxed">
              Railgun injects <span className="text-neon-yellow font-bold">millions of impressions and views</span> into
              a target Instagram account in a single burst. Unlike followers or likes, raw impression volume is nearly
              impossible to trace back to a purchase — it simply looks like a viral moment.
            </p>
            <p className="text-[11px] text-[#c9d1d9]/70 leading-relaxed">
              However, the side effect is severe: because the account gains{" "}
              <span className="text-neon-yellow">zero likes, zero comments, and zero new followers</span> alongside
              those impressions, Instagram's algorithm reads the engagement ratio as pathological. The result is an
              automatic and silent <span className="text-neon-red font-bold">shadowban</span>.
            </p>
          </div>
        </motion.div>

        {/* ── Shadowban breakdown ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-neon-red" />
            <span className="text-[10px] text-neon-red tracking-widest uppercase font-bold">
              Why Your Account Gets Shadowbanned
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SHADOWBAN_REASONS.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 + i * 0.07 }}
                  className="card p-4 flex gap-3 hover:border-neon-red/30 transition-colors"
                >
                  <Icon className="w-4 h-4 text-neon-red shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold tracking-widest text-neon-red uppercase">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-text-dim leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Bottom note ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="flex items-start gap-2 text-text-dim text-[10px] leading-relaxed pb-4"
        >
          <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />
          <span>
            Use Railgun only on accounts you intend to burn. The shadowban is persistent and typically
            requires a 2–4 week cooldown before organic reach is partially restored. There is no
            guaranteed recovery path once Instagram&apos;s trust score for the account drops below threshold.
          </span>
        </motion.div>

      </main>
    </div>
  );
}
