"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  Users,
  Image as ImageIcon,
  Link,
  BookOpen,
  ShieldAlert,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import type { InstagramProfile } from "@/lib/instagram";
import { proxyImg } from "@/lib/proxyImg";

type ScanState = "idle" | "scanning" | "done" | "error";

export default function InstagramRecon() {
  const [username, setUsername] = useState("");
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [profile, setProfile] = useState<InstagramProfile | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleScan = async () => {
    const clean = username.replace(/^@/, "").trim();
    if (!clean) return;

    setScanState("scanning");
    setProfile(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/ig-scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: clean }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error ?? "Scan failed");
        setScanState("error");
        return;
      }

      setProfile(data as InstagramProfile);
      setScanState("done");
    } catch {
      setErrorMsg("Network error. Check connection.");
      setScanState("error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleScan();
  };

  return (
    <div className="card-glow p-5 flex flex-col gap-4 h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 shrink-0">
        <Search className="w-4 h-4 text-neon-cyan" />
        <span className="text-xs text-neon-cyan tracking-widest font-bold uppercase">
          Instagram Recon
        </span>
      </div>

      {/* Input Row */}
      <div className="flex gap-2 shrink-0">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="@username"
          disabled={scanState === "scanning"}
          className="flex-1 bg-black/50 border border-border-dim text-neon-cyan placeholder:text-text-dim px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan/50 transition-colors disabled:opacity-50"
        />
        <button
          onClick={handleScan}
          disabled={scanState === "scanning" || !username.trim()}
          className={`px-4 py-2 border text-xs font-bold tracking-widest transition-all flex items-center gap-1.5 ${
            scanState === "scanning"
              ? "border-neon-cyan/30 text-neon-cyan/50 cursor-not-allowed"
              : !username.trim()
                ? "border-border-dim text-text-dim cursor-not-allowed"
                : "border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 glow-cyan cursor-pointer"
          }`}
        >
          {scanState === "scanning" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5" />
          )}
          {scanState === "scanning" ? "SCANNING" : "SCAN"}
        </button>
      </div>

      {/* Scanning state */}
      <AnimatePresence mode="wait">
        {scanState === "scanning" && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-3 py-8 text-neon-cyan/70"
          >
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-xs tracking-widest">
              BROWSER SESSION INITIALIZING...
            </p>
            <p className="text-[10px] text-text-dim">
              This may take 15–30 seconds
            </p>
          </motion.div>
        )}

        {scanState === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[11px] text-neon-red text-glow-red border border-neon-red/30 bg-neon-red/5 px-3 py-2"
          >
            ERROR: {errorMsg}
          </motion.div>
        )}

        {scanState === "done" && profile && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4 overflow-y-auto min-h-0 flex-1"
          >
            {/* Profile Header */}
            <div className="flex items-start gap-3 border border-border-dim p-3 bg-black/30">
              {proxyImg(profile.profilePicUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={proxyImg(profile.profilePicUrl)!}
                  alt={profile.username}
                  className="w-12 h-12 rounded-full border border-neon-cyan/30 shrink-0 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.removeAttribute("hidden");
                  }}
                />
              ) : null}
              <div
                hidden={!!profile.profilePicUrl}
                className="w-12 h-12 rounded-full border border-border-dim bg-bg-card shrink-0 flex items-center justify-center"
              >
                <Users className="w-5 h-5 text-text-dim" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm text-neon-cyan font-bold">
                    @{profile.username}
                  </span>
                  {profile.isVerified && (
                    <CheckCircle className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
                  )}
                  {profile.isPrivate && (
                    <ShieldAlert className="w-3.5 h-3.5 text-neon-yellow shrink-0" />
                  )}
                </div>
                {profile.fullName && (
                  <p className="text-[11px] text-text-dim mt-0.5 truncate">
                    {profile.fullName}
                  </p>
                )}
                {profile.bio && (
                  <p className="text-[10px] text-text-dim/80 mt-1 line-clamp-2">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "POSTS", value: profile.postsCount, icon: ImageIcon },
                { label: "FOLLOWERS", value: profile.followersCount, icon: Users },
                { label: "FOLLOWING", value: profile.followingCount, icon: Users },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="border border-border-dim bg-black/30 p-2 flex flex-col items-center gap-1"
                >
                  <Icon className="w-3 h-3 text-text-dim" />
                  <span className="text-sm text-neon-cyan font-bold leading-none">
                    {value ?? "—"}
                  </span>
                  <span className="text-[9px] text-text-dim tracking-widest">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Private Account Notice */}
            {profile.isPrivate && (
              <div className="border border-neon-yellow/30 bg-neon-yellow/5 px-3 py-2 text-[10px] text-neon-yellow flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                Private account — posts and highlights not accessible
              </div>
            )}

            {/* Last 6 Posts */}
            {!profile.isPrivate && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Link className="w-3 h-3 text-neon-green" />
                  <span className="text-[10px] text-neon-green tracking-widest uppercase font-bold">
                    Last {profile.posts.length} Post
                    {profile.posts.length !== 1 ? "s" : ""} Links
                  </span>
                </div>
                {profile.posts.length === 0 ? (
                  <p className="text-[10px] text-text-dim">No posts found</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {profile.posts.map((post, i) => (
                      <a
                        key={i}
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 border border-border-dim bg-black/20 px-2.5 py-1.5 text-[11px] text-neon-green hover:border-neon-green/40 hover:bg-neon-green/5 transition-all group"
                      >
                        <div className="w-7 h-7 shrink-0 relative border border-border-dim bg-bg-card flex items-center justify-center">
                          {proxyImg(post.thumbnail) && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={proxyImg(post.thumbnail)!}
                              alt=""
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          )}
                          <ImageIcon className="w-3.5 h-3.5 text-text-dim" />
                        </div>
                        <span className="truncate flex-1 font-mono">
                          {post.url}
                        </span>
                        <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Story Highlights */}
            {!profile.isPrivate && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <BookOpen className="w-3 h-3 text-neon-yellow" />
                  <span className="text-[10px] text-neon-yellow tracking-widest uppercase font-bold">
                    Story Highlights (
                    {profile.storyHighlights.length})
                  </span>
                </div>
                {profile.storyHighlights.length === 0 ? (
                  <p className="text-[10px] text-text-dim">
                    No story highlights found
                  </p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {profile.storyHighlights.map((hl, i) => (
                      <a
                        key={i}
                        href={hl.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 border border-border-dim bg-black/20 px-2.5 py-1.5 text-[11px] text-neon-yellow hover:border-neon-yellow/40 hover:bg-neon-yellow/5 transition-all group"
                      >
                        <BookOpen className="w-3 h-3 shrink-0 text-neon-yellow/70" />
                        <span className="truncate flex-1 font-mono">{hl.title}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
