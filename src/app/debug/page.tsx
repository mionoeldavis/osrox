"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Monitor,
  Code,
  Cpu,
  Clock,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  Loader,
  AlertTriangle,
  Link2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import type { DebugBrowserResult } from "@/app/api/debug-browser/route";

type Tab = "screenshot" | "html" | "extract";

const TAB_CONFIG: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "screenshot", label: "SCREENSHOT", icon: Monitor },
  { id: "html", label: "PAGE SOURCE", icon: Code },
  { id: "extract", label: "AI EXTRACT", icon: Cpu },
];

export default function DebugBrowserPage() {
  const [url, setUrl]               = useState("https://www.instagram.com/cristiano/");
  const [prompt, setPrompt]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [result, setResult]         = useState<DebugBrowserResult | null>(null);
  const [activeTab, setActiveTab]   = useState<Tab>("screenshot");
  const [copied, setCopied]         = useState(false);
  const inputRef                    = useRef<HTMLInputElement>(null);

  const handleRun = async () => {
    const trimmed = url.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/debug-browser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed, extractPrompt: prompt.trim() || undefined }),
      });

      const data = await res.json() as DebugBrowserResult & { error?: string };

      if (!res.ok || data.error) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      setResult(data);
      setActiveTab("screenshot");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabContent = (tab: Tab) => {
    if (!result) return null;

    if (tab === "screenshot") {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="w-full border border-border-dim overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.screenshot}
              alt="Browser screenshot"
              className="w-full h-auto block"
            />
          </div>
          <p className="text-[10px] text-text-dim text-center">
            Viewport screenshot — exactly what BrowserBase sees
          </p>
        </div>
      );
    }

    if (tab === "html") {
      return (
        <div className="relative">
          <button
            onClick={() => handleCopy(result.html)}
            className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2 py-1 border border-border-dim text-[10px] text-text-dim hover:text-neon-green hover:border-neon-green/40 transition-colors bg-bg-dark"
          >
            {copied ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3" />}
            {copied ? "COPIED" : "COPY"}
          </button>
          <pre className="text-[10px] font-mono text-text-dim leading-relaxed overflow-auto max-h-[60vh] p-4 bg-black/40 border border-border-dim whitespace-pre-wrap break-all">
            {result.html}
          </pre>
          <p className="text-[10px] text-text-dim mt-2 text-right">
            {result.html.length.toLocaleString()} chars
          </p>
        </div>
      );
    }

    if (tab === "extract") {
      return (
        <div className="relative">
          <button
            onClick={() => handleCopy(JSON.stringify(result.extract, null, 2))}
            className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2 py-1 border border-border-dim text-[10px] text-text-dim hover:text-neon-green hover:border-neon-green/40 transition-colors bg-bg-dark"
          >
            {copied ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3" />}
            {copied ? "COPIED" : "COPY"}
          </button>
          <pre className="text-[11px] font-mono text-neon-green leading-relaxed overflow-auto max-h-[60vh] p-4 bg-black/40 border border-border-dim whitespace-pre-wrap break-all">
            {JSON.stringify(result.extract, null, 2)}
          </pre>
        </div>
      );
    }
  };

  return (
    <div className="h-full flex flex-col bg-bg-dark bg-grid">
      <Navbar />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card-glow p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-neon-cyan" style={{ filter: "drop-shadow(0 0 8px rgba(0,230,255,0.6))" }} />
            <div>
              <h1 className="text-neon-cyan text-xl font-bold tracking-[0.4em]" style={{ textShadow: "0 0 12px rgba(0,230,255,0.5)" }}>
                BROWSER DEBUG
              </h1>
              <p className="text-text-dim text-[10px] tracking-widest uppercase mt-0.5">
                See exactly what BrowserBase sees
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-text-dim">
            {loading ? (
              <><Loader className="w-3 h-3 animate-spin text-neon-cyan" /><span className="text-neon-cyan">SESSION ACTIVE</span></>
            ) : result ? (
              <><span className="w-1.5 h-1.5 rounded-full bg-neon-green" /><span className="text-neon-green">COMPLETE</span></>
            ) : (
              <><span className="w-1.5 h-1.5 rounded-full bg-text-dim" /><span>STANDBY</span></>
            )}
          </div>
        </motion.div>

        {/* ── URL Input ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="card-glow p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-neon-cyan" />
            <span className="text-[10px] text-neon-cyan tracking-widest font-bold uppercase">Target URL</span>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRun()}
                placeholder="https://example.com"
                disabled={loading}
                className="w-full bg-black/50 border border-border-dim text-neon-cyan placeholder:text-text-dim pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-neon-cyan/50 transition-colors disabled:opacity-40 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-text-dim tracking-widest uppercase mb-1.5 block">
                Custom AI Extract Prompt <span className="text-text-dim/50">(optional)</span>
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRun()}
                placeholder="e.g. Extract all product names and prices from this page"
                disabled={loading}
                className="w-full bg-black/50 border border-border-dim text-text-dim placeholder:text-text-dim/50 px-3 py-2 text-xs focus:outline-none focus:border-neon-cyan/30 transition-colors disabled:opacity-40 font-mono"
              />
            </div>
          </div>

          <button
            onClick={handleRun}
            disabled={loading || !url.trim()}
            className={`w-full py-3 border text-sm font-bold tracking-widest transition-all flex items-center justify-center gap-2 ${
              loading
                ? "border-neon-cyan/40 text-neon-cyan cursor-not-allowed"
                : !url.trim()
                ? "border-border-dim text-text-dim cursor-not-allowed"
                : "border-neon-cyan/60 text-neon-cyan hover:bg-neon-cyan/10 cursor-pointer"
            }`}
            style={url.trim() && !loading ? { boxShadow: "0 0 8px rgba(0,230,255,0.2)" } : {}}
          >
            {loading ? (
              <><Loader className="w-4 h-4 animate-spin" />LAUNCHING BROWSERBASE SESSION...</>
            ) : (
              <><Monitor className="w-4 h-4" />LAUNCH &amp; CAPTURE</>
            )}
          </button>

          {loading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] text-text-dim text-center"
            >
              Spinning up a real browser in BrowserBase — this takes ~15–30s
            </motion.p>
          )}
        </motion.div>

        {/* ── Error ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="card p-4 flex gap-3 border-neon-red/30"
              style={{ boxShadow: "0 0 20px rgba(255,50,50,0.05)" }}
            >
              <AlertTriangle className="w-4 h-4 text-neon-red shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-neon-red font-bold tracking-widest uppercase">Error</p>
                <p className="text-[11px] text-text-dim mt-1 font-mono">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Result ── */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-4"
            >
              {/* Meta row */}
              <div className="card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "Page Title", value: result.title || "—", icon: Monitor },
                  { label: "Final URL", value: result.finalUrl, icon: ExternalLink },
                  { label: "Session ID", value: result.sessionId ?? "—", icon: Cpu },
                  { label: "Duration", value: `${(result.durationMs / 1000).toFixed(1)}s`, icon: Clock },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3 h-3 text-neon-cyan" />
                      <span className="text-[9px] text-text-dim tracking-widest uppercase">{label}</span>
                    </div>
                    <p className="text-[11px] text-neon-green font-mono truncate" title={value}>
                      {value}
                    </p>
                    {label === "Final URL" && (
                      <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] text-text-dim hover:text-neon-cyan transition-colors flex items-center gap-1"
                      >
                        <ChevronRight className="w-2.5 h-2.5" />open in browser
                      </a>
                    )}
                    {label === "Session ID" && result.sessionId && (
                      <a
                        href={`https://browserbase.com/sessions/${result.sessionId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] text-text-dim hover:text-neon-cyan transition-colors flex items-center gap-1"
                      >
                        <ChevronRight className="w-2.5 h-2.5" />view on BrowserBase
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {/* Tab bar */}
              <div className="flex items-center border-b border-border-dim gap-0">
                {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-bold tracking-widest transition-colors border-b-2 -mb-px ${
                      activeTab === id
                        ? "text-neon-cyan border-neon-cyan"
                        : "text-text-dim border-transparent hover:text-neon-cyan/60"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {tabContent(activeTab)}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
