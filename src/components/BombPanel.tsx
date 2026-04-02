"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Bomb,
  Search,
  Loader2,
  Users,
  Heart,
  MessageCircle,
  Eye,
  RotateCcw,
  CheckCircle,
  ShieldAlert,
  AlertTriangle,
  Info,
} from "lucide-react";
import { formatNumber } from "@/lib/format";
import { useBomb, BOMB_TYPES } from "@/lib/useBomb";
import type { BombType } from "@/lib/useBomb";
import { proxyImg } from "@/lib/proxyImg";

const BOMB_ICONS: Record<BombType, typeof Users> = {
  "ghost-followers": Users,
  "comment-spam": MessageCircle,
  "like-flood": Heart,
  "view-bomb": Eye,
};

const QUANTITY_PRESETS = [
  { label: "1K", value: 1_000 },
  { label: "5K", value: 5_000 },
  { label: "10K", value: 10_000 },
  { label: "50K", value: 50_000 },
  { label: "100K", value: 100_000 },
];

export default function BombPanel() {
  const {
    username,
    setUsername,
    bombState,
    profile,
    selectedBomb,
    setSelectedBomb,
    quantity,
    setQuantity,
    bombConfig,
    summary,
    progress,
    errorMsg,
    handleScan,
    handleDeploy,
    reset,
  } = useBomb();

  const isScanning = bombState === "scanning";
  const isReady = bombState === "ready" || bombState === "deploying" || bombState === "done";
  const isDeploying = bombState === "deploying";
  const isDone = bombState === "done";
  const isError = bombState === "error";

  const progressPct =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card-glow p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ borderColor: "rgba(255,0,60,0.2)" }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bomb
              className="w-7 h-7 text-neon-red"
              style={{ filter: "drop-shadow(0 0 8px rgba(255,0,60,0.7))" }}
            />
            {isDeploying && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-neon-red animate-ping" />
            )}
          </div>
          <div>
            <h1
              className="text-neon-red text-xl font-bold tracking-[0.4em]"
              style={{ textShadow: "0 0 12px rgba(255,0,60,0.6), 0 0 24px rgba(255,0,60,0.3)" }}
            >
              BOMB
            </h1>
            <p className="text-text-dim text-[10px] tracking-widest uppercase mt-0.5">
              Imbalanced engagement injection — ratio sabotage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isReady && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-border-dim text-text-dim text-[10px] tracking-widest hover:border-neon-red/30 hover:text-neon-red/70 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              RESET
            </button>
          )}
          <div className="flex items-center gap-2 text-[10px] text-text-dim">
            {isDeploying ? (
              <><span className="w-1.5 h-1.5 rounded-full bg-neon-red animate-ping" /><span className="text-neon-red">DETONATING...</span></>
            ) : isDone ? (
              <><span className="w-1.5 h-1.5 rounded-full bg-neon-green" /><span className="text-neon-green">DETONATED</span></>
            ) : (
              <><span className="w-1.5 h-1.5 rounded-full bg-text-dim" /><span>ARMED</span></>
            )}
          </div>
        </div>
      </motion.div>

      {/* Target Acquisition */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="card-glow p-5 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-neon-cyan" />
          <span className="text-[10px] text-neon-cyan tracking-widest font-bold uppercase">
            Target Profile
          </span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isScanning && handleScan()}
            placeholder="@username"
            disabled={isScanning || isReady}
            className="flex-1 bg-black/50 border border-border-dim text-neon-cyan placeholder:text-text-dim px-3 py-2.5 text-sm focus:outline-none focus:border-neon-cyan/50 transition-colors disabled:opacity-40"
          />
          <button
            onClick={handleScan}
            disabled={isScanning || isReady || !username.trim()}
            className={`px-4 py-2 border text-xs font-bold tracking-widest transition-all flex items-center gap-1.5 ${
              isScanning
                ? "border-neon-cyan/30 text-neon-cyan/50 cursor-not-allowed"
                : isReady || !username.trim()
                  ? "border-border-dim text-text-dim cursor-not-allowed"
                  : "border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 glow-cyan cursor-pointer"
            }`}
          >
            {isScanning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            {isScanning ? "SCANNING" : "SCAN"}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isScanning && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 py-6 text-neon-cyan/70"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <p className="text-[11px] tracking-widest">SCANNING TARGET...</p>
              <p className="text-[10px] text-text-dim">This may take 15–30 seconds</p>
            </motion.div>
          )}

          {isError && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[11px] text-neon-red border border-neon-red/30 bg-neon-red/5 px-3 py-2"
            >
              ERROR: {errorMsg}
            </motion.div>
          )}

          {isReady && profile && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="border border-neon-cyan/30 bg-black/30 p-3 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 shrink-0 rounded-full border border-neon-cyan/40 bg-bg-card flex items-center justify-center overflow-hidden">
                  {proxyImg(profile.profilePicUrl) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={proxyImg(profile.profilePicUrl)!}
                      alt={profile.username}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  )}
                  <Users className="w-4 h-4 text-text-dim" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-neon-cyan font-bold">@{profile.username}</span>
                    {profile.isVerified && <CheckCircle className="w-3 h-3 text-neon-cyan shrink-0" />}
                    {profile.isPrivate && <ShieldAlert className="w-3 h-3 text-neon-yellow shrink-0" />}
                  </div>
                  {profile.fullName && (
                    <p className="text-[10px] text-text-dim truncate">{profile.fullName}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "POSTS", value: profile.postsCount },
                  { label: "FOLLOWERS", value: profile.followersCount },
                  { label: "FOLLOWING", value: profile.followingCount },
                ].map(({ label, value }) => (
                  <div key={label} className="border border-neon-cyan/20 bg-black/20 py-1.5 px-1">
                    <p className="text-xs text-neon-cyan font-bold tabular-nums">{value ?? "—"}</p>
                    <p className="text-[9px] text-text-dim tracking-widest mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bomb Type + Intensity side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        <motion.div
          className="lg:col-span-7"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="card-glow p-5 space-y-4 h-full" style={{ borderColor: "rgba(255,0,60,0.15)" }}>
            <div className="flex items-center gap-2">
              <Bomb className="w-4 h-4 text-neon-red" />
              <span className="text-[10px] text-neon-red tracking-widest font-bold uppercase">
                Bomb Type
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BOMB_TYPES.map((bomb) => {
                const Icon = BOMB_ICONS[bomb.id];
                const active = selectedBomb === bomb.id;
                return (
                  <button
                    key={bomb.id}
                    onClick={() => setSelectedBomb(bomb.id)}
                    disabled={isDeploying || isDone}
                    className={`text-left p-3 border transition-all ${
                      active
                        ? `border-neon-red/50 bg-neon-red/5 ${bomb.color}`
                        : "border-border-dim text-text-dim hover:border-neon-red/30"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold tracking-widest">{bomb.label}</span>
                    </div>
                    <p className="text-[9px] text-text-dim leading-relaxed">{bomb.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="border border-border-dim/50 bg-black/20 p-3 space-y-2">
              <span className="text-[9px] text-text-dim tracking-widest uppercase">What gets sent</span>
              <div className="flex flex-wrap gap-2">
                {(["followers", "likes", "comments", "views"] as const).map((cat) => {
                  const active = bombConfig.sends.includes(cat);
                  return (
                    <span
                      key={cat}
                      className={`text-[10px] px-2 py-0.5 border ${
                        active
                          ? "border-neon-red/40 text-neon-red bg-neon-red/10"
                          : "border-border-dim/50 text-text-dim/40 line-through"
                      }`}
                    >
                      {cat.toUpperCase()}
                    </span>
                  );
                })}
              </div>
              <p className="text-[9px] text-neon-red/60">
                Struck-through metrics stay at zero — creating a suspicious ratio mismatch
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="card-glow p-5 space-y-4 h-full" style={{ borderColor: "rgba(255,0,60,0.15)" }}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-neon-yellow" />
              <span className="text-[10px] text-neon-yellow tracking-widest font-bold uppercase">
                Intensity
              </span>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-[10px] text-text-dim tracking-widest uppercase">
                  {bombConfig.profileOrder ? "Quantity" : "Per Post"}
                </span>
                <span className="text-neon-red font-bold text-lg tracking-widest">
                  {formatNumber(quantity)}
                </span>
              </div>
              <input
                type="range"
                min={100}
                max={100_000}
                step={100}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                disabled={isDeploying || isDone}
                className="w-full accent-[#ff003c] h-1 bg-border-dim appearance-none cursor-pointer disabled:opacity-40
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-neon-red [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,0,60,0.5)]"
              />
              <div className="flex justify-between text-[9px] text-text-dim mt-1">
                <span>100</span>
                <span>100K</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {QUANTITY_PRESETS.map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => setQuantity(value)}
                  disabled={isDeploying || isDone}
                  className={`px-2.5 py-1 text-[10px] border tracking-widest transition-all ${
                    quantity === value
                      ? "border-neon-red/50 text-neon-red bg-neon-red/10"
                      : "border-border-dim text-text-dim hover:border-neon-red/30 hover:text-neon-red/70"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="border-t border-border-dim pt-3 space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-text-dim tracking-widest">PROFILE ORDERS</span>
                <span className="text-neon-red font-bold">{summary.profileOrders}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-text-dim tracking-widest">POST ORDERS</span>
                <span className="text-neon-red font-bold">{summary.postOrders}</span>
              </div>
              <div className="flex justify-between text-[10px] border-t border-border-dim/50 pt-1.5">
                <span className="text-text-dim tracking-widest">TOTAL ORDERS</span>
                <span className="text-neon-green font-bold">{summary.totalOrders}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Deploy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="card-glow p-5 space-y-4"
        style={{ borderColor: "rgba(255,0,60,0.15)" }}
      >
        <div className="flex items-center gap-2">
          <Bomb className="w-4 h-4 text-neon-red" />
          <span className="text-[10px] text-neon-red tracking-widest font-bold uppercase">
            Detonate
          </span>
        </div>

        <AnimatePresence mode="wait">
          {isDone ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-2 py-4 border border-neon-green/40 bg-neon-green/5"
            >
              <CheckCircle className="w-6 h-6 text-neon-green" />
              <span className="text-neon-green font-bold tracking-widest text-sm text-glow-green">
                BOMB DETONATED
              </span>
              <span className="text-[10px] text-text-dim">
                {summary.totalOrders} orders deployed — {bombConfig.label} on @{profile?.username}
              </span>
            </motion.div>
          ) : isDeploying ? (
            <motion.div
              key="deploying"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center justify-between text-[10px] text-text-dim">
                <span className="tracking-widest">DETONATING...</span>
                <span className="text-neon-red font-bold">
                  {progress.current}/{progress.total}
                </span>
              </div>
              <div className="h-1.5 bg-border-dim w-full">
                <motion.div
                  className="h-full bg-neon-red glow-red"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-[10px] text-neon-red/70 tracking-widest">{progress.message}</p>
            </motion.div>
          ) : (
            <motion.button
              key="deploy"
              onClick={handleDeploy}
              disabled={bombState !== "ready"}
              whileTap={bombState === "ready" ? { scale: 0.98 } : {}}
              className={`w-full py-3 border text-sm font-bold tracking-widest transition-all flex items-center justify-center gap-2 ${
                bombState !== "ready"
                  ? "border-border-dim text-text-dim cursor-not-allowed"
                  : "border-neon-red/50 text-neon-red hover:bg-neon-red/10 cursor-pointer"
              }`}
              style={
                bombState === "ready"
                  ? { boxShadow: "0 0 8px rgba(255,0,60,0.3), 0 0 30px rgba(255,0,60,0.1)" }
                  : {}
              }
            >
              <Bomb className="w-4 h-4" />
              DETONATE
            </motion.button>
          )}
        </AnimatePresence>

        {!isReady && !isDeploying && !isDone && (
          <p className="text-[10px] text-text-dim text-center">
            Scan a profile first to arm the bomb
          </p>
        )}
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="card p-4 flex gap-3"
        style={{ borderColor: "rgba(255,0,60,0.15)", boxShadow: "0 0 20px rgba(255,0,60,0.04)" }}
      >
        <Info className="w-4 h-4 text-neon-red shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <p className="text-neon-red text-xs font-bold tracking-widest uppercase">
            What Bombing Does
          </p>
          <p className="text-[11px] text-[#c9d1d9]/70 leading-relaxed">
            Bombing injects <span className="text-neon-red font-bold">only one type of engagement</span> while
            leaving everything else at zero. This creates an engagement ratio so far from human norms that
            Instagram&apos;s algorithm flags the account as manipulated.
          </p>
          <p className="text-[11px] text-[#c9d1d9]/70 leading-relaxed">
            For example, <span className="text-neon-green font-bold">50,000 followers with 0 likes per post</span> has
            a 0% engagement rate — a dead giveaway. Or <span className="text-neon-cyan font-bold">thousands of comments
            but zero likes</span> — an impossible pattern in organic growth.
          </p>
        </div>
      </motion.div>
    </>
  );
}
