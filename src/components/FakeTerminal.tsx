"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const IP_PREFIXES = [
  "185.220", "91.132", "45.153", "103.214", "178.62",
  "159.89", "167.71", "206.189", "64.225", "142.93",
  "104.248", "188.166", "139.59", "68.183", "157.245",
];

const REGIONS = ["EU-WEST", "US-EAST", "ASIA-PAC", "RU-NORTH", "SA-SOUTH", "AF-CENTRAL", "OC-EAST"];

const ACTIONS = [
  (id: string, ip: string) => `[BOT-${id}] Connected from ${ip}`,
  (id: string) => `[NODE-${REGIONS[Math.floor(Math.random() * REGIONS.length)]}-${id}] Task acknowledged`,
  (id: string, ip: string) => `[BOT-${id}] Proxy rotated → ${ip}`,
  () => `[SWARM] Heartbeat OK — ${(1200000 + Math.floor(Math.random() * 50000)).toLocaleString("en-US")} active`,
  (id: string) => `[BOT-${id}] Session refreshed — cookies valid`,
  (id: string) => `[NODE-${REGIONS[Math.floor(Math.random() * REGIONS.length)]}-${id}] Dispatching batch #${Math.floor(Math.random() * 9999)}`,
  () => `[C2] Encrypted channel verified — latency ${Math.floor(Math.random() * 50 + 5)}ms`,
  (id: string) => `[BOT-${id}] Fingerprint spoofed — device profile loaded`,
  () => `[SWARM] Queue depth: ${Math.floor(Math.random() * 500 + 10)} tasks pending`,
  (id: string, ip: string) => `[BOT-${id}] Outbound via ${ip}:${Math.floor(Math.random() * 60000 + 1024)}`,
];

function randomIp() {
  const prefix = IP_PREFIXES[Math.floor(Math.random() * IP_PREFIXES.length)];
  return `${prefix}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function randomId() {
  return String(Math.floor(Math.random() * 9999)).padStart(4, "0");
}

function generateLine(): string {
  const fn = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  return fn(randomId(), randomIp());
}

interface TerminalLine {
  id: number;
  text: string;
  timestamp: string;
  type: "system" | "inject";
}

const MAX_LINES = 50;
let lineCounter = 0;

export function injectTerminalMessage(text: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("osrox-terminal", { detail: text }));
  }
}

export default function FakeTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const addLine = useCallback((text: string, type: "system" | "inject" = "system") => {
    const now = new Date();
    const ts = now.toLocaleTimeString("en-US", { hour12: false });
    setLines((prev) => {
      const next = [
        ...prev,
        { id: lineCounter++, text, timestamp: ts, type },
      ];
      return next.slice(-MAX_LINES);
    });
  }, []);

  useEffect(() => {
    for (let i = 0; i < 5; i++) {
      addLine(generateLine());
    }

    const interval = setInterval(() => {
      addLine(generateLine());
    }, 800 + Math.random() * 1200);

    return () => clearInterval(interval);
  }, [addLine]);

  useEffect(() => {
    const handler = (e: Event) => {
      const text = (e as CustomEvent).detail;
      addLine(text, "inject");
    };
    window.addEventListener("osrox-terminal", handler);
    return () => window.removeEventListener("osrox-terminal", handler);
  }, [addLine]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="card-glow flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-dim shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <span className="text-[10px] text-text-dim tracking-widest uppercase">
            Live Feed
          </span>
        </div>
        <span className="text-[10px] text-text-dim">{lines.length} entries</span>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-3 space-y-0.5 text-[11px] leading-relaxed"
      >
        {lines.map((line) => (
          <div
            key={line.id}
            className={`flex gap-2 ${
              line.type === "inject"
                ? "text-neon-cyan text-glow-cyan"
                : "text-green-500/70"
            }`}
          >
            <span className="text-text-dim shrink-0">{line.timestamp}</span>
            <span>{line.text}</span>
          </div>
        ))}
        <span className="cursor-blink text-neon-green" />
      </div>
    </div>
  );
}
