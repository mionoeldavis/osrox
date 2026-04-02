"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Search,
  Loader2,
  Users,
  Heart,
  MessageCircle,
  Eye,
  Sparkles,
  RotateCcw,
  CheckCircle,
  ShieldAlert,
} from "lucide-react";
import { formatNumber } from "@/lib/format";
import { useFame } from "@/lib/useFame";

const PRESETS = [
  { label: "1K", value: 1_000 },
  { label: "5K", value: 5_000 },
  { label: "10K", value: 10_000 },
  { label: "50K", value: 50_000 },
  { label: "100K", value: 100_000 },
  { label: "500K", value: 500_000 },
  { label: "1M", value: 1_000_000 },
];

export default function FamePanel() {
  const {
    username,
    setUsername,
    fameState,
    profile,
    targetFollowers,
    setTargetFollowers,
    metrics,
    progress,
    errorMsg,
    handleScan,
    handleDeploy,
    reset,
  } = useFame();

  const isScanning = fameState === "scanning";
  const isReady = fameState === "ready" || fameState === "deploying" || fameState === "done";
  const isDeploying = fameState === "deploying";
  const isDone = fameState === "done";
  const isError = fameState === "error";

  const progressPct =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  const breakdownRows = [
    {
      icon: Users,
      label: "FOLLOWERS",
      value: `+${formatNumber(metrics.followersToAdd)}`,
      sub: `to reach ${formatNumber(targetFollowers)}`,
      color: "text-neon-green",
    },
    {
      icon: Heart,
      label: "LIKES / POST",
      value: formatNumber(metrics.likesPerPost),
      sub: profile ? `× ${profile.posts.length} posts` : "per post",
      color: "text-neon-red",
    },
    {
      icon: MessageCircle,
      label: "COMMENTS / POST",
      value: formatNumber(metrics.commentsPerPost),
      sub: profile ? `× ${profile.posts.length} posts` : "per post",
      color: "text-neon-cyan",
    },
    {
      icon: Eye,
      label: "VIEWS / POST",
      value: formatNumber(metrics.viewsPerPost),
      sub: profile ? `× ${profile.posts.length} posts` : "per post",
      color: "text-neon-yellow",
    },
    {
      icon: Sparkles,
      label: "EST. IMPRESSIONS",
      value: formatNumber(metrics.impressionsEst),
      sub: "display metric only",
      color: "text-text-dim",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto flex flex-col gap-6"
    >
      {/* Header */}
      <div className="card-glow p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Star className="w-5 h-5 text-neon-yellow" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-neon-yellow status-pulse" />
          </div>
          <div>
            <h1 className="text-neon-yellow text-glow-green font-bold tracking-[0.3em] text-lg uppercase">
              Make Famous
            </h1>
            <p className="text-[10px] text-text-dim tracking-widest mt-0.5">
              Auto-boost followers + engagement across all posts
            </p>
          </div>
        </div>
        {isReady && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border-dim text-text-dim text-[10px] tracking-widest hover:border-neon-green/30 hover:text-neon-green/70 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            RESET
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Scan + Profile */}
        <div className="flex flex-col gap-4">
          {/* Step 1: Target Input */}
          <div className="card-glow p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-neon-cyan" />
              <span className="text-[10px] text-neon-cyan tracking-widest font-bold uppercase">
                Step 1 — Target Profile
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
                  className="flex items-start gap-3 border border-neon-cyan/20 bg-neon-cyan/5 p-3"
                >
                  {profile.profilePicUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.profilePicUrl}
                      alt={profile.username}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full border border-neon-cyan/30 shrink-0 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full border border-border-dim bg-bg-card shrink-0 flex items-center justify-center">
                      <Users className="w-4 h-4 text-text-dim" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-neon-cyan font-bold">@{profile.username}</span>
                      {profile.isVerified && <CheckCircle className="w-3.5 h-3.5 text-neon-cyan shrink-0" />}
                      {profile.isPrivate && <ShieldAlert className="w-3.5 h-3.5 text-neon-yellow shrink-0" />}
                    </div>
                    <div className="flex gap-4 mt-1">
                      <span className="text-[10px] text-text-dim">
                        <span className="text-neon-green">{profile.followersCount ?? "?"}</span> followers
                      </span>
                      <span className="text-[10px] text-text-dim">
                        <span className="text-neon-green">{profile.postsCount ?? "?"}</span> posts
                      </span>
                    </div>
                    {profile.isPrivate && (
                      <p className="text-[10px] text-neon-yellow mt-1">
                        Private — post engagement will be skipped
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Post thumbnails */}
          {isReady && profile && !profile.isPrivate && profile.posts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-glow p-4 flex flex-col gap-3"
            >
              <span className="text-[10px] text-neon-green tracking-widest font-bold uppercase">
                {profile.posts.length} Posts Targeted
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {profile.posts.map((post, i) => (
                  <div
                    key={i}
                    className="relative aspect-square border border-border-dim bg-bg-card overflow-hidden"
                  >
                    {post.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.thumbnail}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover opacity-60"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[9px] text-neon-green/60">{i + 1}</span>
                    </div>
                    {isDone && (
                      <div className="absolute inset-0 bg-neon-green/20 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-neon-green" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Fame Level + Breakdown + Deploy */}
        <div className="flex flex-col gap-4">
          {/* Step 2: Fame Level */}
          <div className="card-glow p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-neon-yellow" />
              <span className="text-[10px] text-neon-yellow tracking-widest font-bold uppercase">
                Step 2 — Fame Level
              </span>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-[10px] text-text-dim tracking-widest uppercase">Target Followers</span>
                <span className="text-neon-yellow font-bold text-lg tracking-widest">
                  {formatNumber(targetFollowers)}
                </span>
              </div>
              <input
                type="range"
                min={1_000}
                max={1_000_000}
                step={1_000}
                value={targetFollowers}
                onChange={(e) => setTargetFollowers(Number(e.target.value))}
                disabled={isDeploying || isDone}
                className="w-full accent-[#ffe600] h-1 bg-border-dim appearance-none cursor-pointer disabled:opacity-40
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-neon-yellow [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,230,0,0.5)]"
              />
              <div className="flex justify-between text-[9px] text-text-dim mt-1">
                <span>1K</span>
                <span>1M</span>
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => setTargetFollowers(value)}
                  disabled={isDeploying || isDone}
                  className={`px-2.5 py-1 text-[10px] border tracking-widest transition-all ${
                    targetFollowers === value
                      ? "border-neon-yellow/50 text-neon-yellow bg-neon-yellow/10"
                      : "border-border-dim text-text-dim hover:border-neon-yellow/30 hover:text-neon-yellow/70"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown */}
          <div className="card-glow p-5 flex flex-col gap-3">
            <span className="text-[10px] text-text-dim tracking-widest uppercase font-bold">
              Auto-Calculated Breakdown
            </span>
            {breakdownRows.map(({ icon: Icon, label, value, sub, color }) => (
              <div
                key={label}
                className="flex items-center justify-between py-2 border-b border-border-dim/50 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <span className="text-[11px] text-text-dim tracking-widest">{label}</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${color}`}>{value}</span>
                  <span className="text-[9px] text-text-dim ml-2">{sub}</span>
                </div>
              </div>
            ))}
            {isReady && profile && (
              <div className="border-t border-border-dim pt-2 flex items-center justify-between">
                <span className="text-[10px] text-text-dim tracking-widest">TOTAL ORDERS</span>
                <span className="text-neon-green font-bold text-sm">{metrics.totalOrders}</span>
              </div>
            )}
          </div>

          {/* Step 3: Deploy */}
          <div className="card-glow p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neon-green" />
              <span className="text-[10px] text-neon-green tracking-widest font-bold uppercase">
                Step 3 — Deploy
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
                    FAME PROTOCOL COMPLETE
                  </span>
                  <span className="text-[10px] text-text-dim">
                    {metrics.totalOrders} orders deployed for @{profile?.username}
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
                    <span className="tracking-widest">DEPLOYING...</span>
                    <span className="text-neon-green font-bold">
                      {progress.current}/{progress.total}
                    </span>
                  </div>
                  <div className="h-1.5 bg-border-dim w-full">
                    <motion.div
                      className="h-full bg-neon-green glow-green"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-[10px] text-neon-green/70 tracking-widest">{progress.message}</p>
                </motion.div>
              ) : (
                <motion.button
                  key="deploy"
                  onClick={handleDeploy}
                  disabled={fameState !== "ready"}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 border text-sm font-bold tracking-[0.3em] transition-all flex items-center justify-center gap-2 ${
                    fameState !== "ready"
                      ? "border-border-dim text-text-dim cursor-not-allowed"
                      : "border-neon-green/50 text-neon-green hover:bg-neon-green/10 pulse-glow cursor-pointer"
                  }`}
                >
                  <Star className="w-4 h-4" />
                  MAKE FAMOUS
                </motion.button>
              )}
            </AnimatePresence>

            {!isReady && !isDeploying && !isDone && (
              <p className="text-[10px] text-text-dim text-center">
                Scan a profile first to enable deployment
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
