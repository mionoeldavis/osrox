"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  AlertTriangle,
  Eye,
  TrendingUp,
  Ban,
  ChevronRight,
  Loader2,
  Info,
  Target,
  AtSign,
} from "lucide-react";
import Navbar from "@/components/Navbar";

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

export default function RailgunPage() {
  const [target, setTarget] = useState("");
  const [firing, setFiring] = useState(false);
  const [fired, setFired] = useState(false);
  const [progress, setProgress] = useState(0);
  const [firedTarget, setFiredTarget] = useState("");

  const cleanTarget = target.replace("@", "").trim();

  const handleFire = async () => {
    if (firing || fired || !cleanTarget) return;
    setFiring(true);
    setProgress(0);
    setFiredTarget(cleanTarget);

    for (let i = 0; i <= 100; i += 4) {
      await new Promise((r) => setTimeout(r, 60));
      setProgress(i);
    }

    setProgress(100);
    setFiring(false);
    setFired(true);
  };

  const handleReset = () => {
    setFired(false);
    setProgress(0);
    setTarget("");
    setFiredTarget("");
  };

  return (
    <div className="h-full flex flex-col bg-bg-dark bg-grid">
      <Navbar />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* Header + Fire Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card-glow p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Zap className="w-7 h-7 text-neon-yellow" style={{ filter: "drop-shadow(0 0 8px rgba(255,230,0,0.7))" }} />
              {firing && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-neon-yellow animate-ping" />
              )}
            </div>
            <div>
              <h1 className="text-neon-yellow text-xl font-bold tracking-[0.4em]" style={{ textShadow: "0 0 12px rgba(255,230,0,0.6), 0 0 24px rgba(255,230,0,0.3)" }}>
                RAILGUN
              </h1>
              <p className="text-text-dim text-[10px] tracking-widest uppercase mt-0.5">
                Mass Impression &amp; View Injection Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-text-dim">
            {firing ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-neon-yellow animate-ping" />
                <span className="text-neon-yellow">FIRING...</span>
              </>
            ) : fired ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                <span className="text-neon-green">PAYLOAD DELIVERED</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-text-dim" />
                <span>STANDBY</span>
              </>
            )}
          </div>
        </motion.div>

        {/* Target input */}
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
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    FIRING ON @{firedTarget}...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    FIRE RAILGUN
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Progress bar */}
        <AnimatePresence>
          {(firing || fired) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="card p-4 space-y-2"
            >
              <div className="flex justify-between text-[10px] tracking-widest uppercase">
                <span className="text-neon-yellow">Impression Payload</span>
                <span className={fired ? "text-neon-green" : "text-neon-yellow"}>
                  {fired ? "DELIVERED" : `${progress}%`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-border-dim overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ background: fired ? "var(--neon-green)" : "var(--neon-yellow)", boxShadow: fired ? "0 0 8px rgba(0,255,65,0.6)" : "0 0 8px rgba(255,230,0,0.6)" }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
              {fired && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] text-neon-green"
                >
                  ✓ 2,400,000+ impressions injected on @{firedTarget} — payload complete
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card p-4 flex gap-3 border-neon-yellow/20"
          style={{ borderColor: "rgba(255,230,0,0.15)", boxShadow: "0 0 20px rgba(255,230,0,0.04), inset 0 0 20px rgba(255,230,0,0.02)" }}
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
              However, the side effect is severe: because the account gains <span className="text-neon-yellow">zero likes,
              zero comments, and zero new followers</span> alongside those impressions, Instagram's algorithm reads the
              engagement ratio as pathological. The result is an automatic and silent{" "}
              <span className="text-neon-red font-bold">shadowban</span>.
            </p>
          </div>
        </motion.div>

        {/* Shadowban breakdown cards */}
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
                    <p className="text-[11px] text-text-dim leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom note */}
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
            guaranteed recovery path once Instagram's trust score for the account drops below threshold.
          </span>
        </motion.div>
      </main>
    </div>
  );
}
