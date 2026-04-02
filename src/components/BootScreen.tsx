"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BOOT_LINES = [
  { text: "OSROX KERNEL v4.2.0 — INITIALIZING...", delay: 200 },
  { text: "Loading encrypted modules.............. [OK]", delay: 400 },
  { text: "Bypassing firewall restrictions........ [OK]", delay: 300 },
  { text: "Establishing TOR relay chain........... [OK]", delay: 500 },
  { text: "Connecting to C2 command server........ [OK]", delay: 600 },
  { text: "Authenticating operator credentials.... [OK]", delay: 300 },
  { text: "Decrypting botnet swarm keys.......... [OK]", delay: 400 },
  { text: "Pinging global node network...", delay: 300 },
  { text: "", delay: 100 },
  { text: "  ► EU-WEST   : 247,291 nodes online", delay: 200 },
  { text: "  ► US-EAST   : 389,102 nodes online", delay: 200 },
  { text: "  ► ASIA-PAC  : 198,447 nodes online", delay: 200 },
  { text: "  ► SA-SOUTH  : 156,832 nodes online", delay: 200 },
  { text: "  ► AF-CENTRAL:  89,221 nodes online", delay: 200 },
  { text: "  ► RU-NORTH  : 167,000 nodes online", delay: 200 },
  { text: "", delay: 100 },
  { text: "TOTAL ACTIVE BOTS: 1,247,893", delay: 400 },
  { text: "SWARM STATUS: FULLY OPERATIONAL", delay: 300 },
  { text: "", delay: 200 },
  { text: "Launching OSROX Control Interface...", delay: 800 },
];

interface BootScreenProps {
  onComplete: () => void;
}

export default function BootScreen({ onComplete }: BootScreenProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const runBoot = useCallback(async () => {
    for (let i = 0; i < BOOT_LINES.length; i++) {
      await new Promise((r) => setTimeout(r, BOOT_LINES[i].delay));
      setLines((prev) => [...prev, BOOT_LINES[i].text]);
    }
    await new Promise((r) => setTimeout(r, 600));
    setDone(true);
    await new Promise((r) => setTimeout(r, 500));
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    runBoot();
  }, [runBoot]);

  return (
    <AnimatePresence>
      {!done ? (
        <motion.div
          className="fixed inset-0 z-[100] bg-black flex items-start justify-start p-8 overflow-hidden"
          exit={{ opacity: 0, scale: 1.05, filter: "brightness(3)" }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-full max-w-3xl">
            <div className="mb-6 text-neon-green text-glow-green text-lg font-bold tracking-widest">
              ╔══════════════════════════════════════════╗
              <br />
              ║&nbsp;&nbsp;&nbsp;&nbsp;O S R O X&nbsp;&nbsp;—&nbsp;&nbsp;B O T N E T&nbsp;&nbsp;C 2&nbsp;&nbsp;&nbsp;&nbsp;║
              <br />
              ╚══════════════════════════════════════════╝
            </div>

            <div className="space-y-1">
              {lines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.1 }}
                  className={`font-mono text-sm ${
                    line.includes("[OK]")
                      ? "text-neon-green"
                      : line.includes("TOTAL") || line.includes("FULLY OPERATIONAL")
                      ? "text-neon-green text-glow-green font-bold"
                      : line.includes("►")
                      ? "text-neon-cyan"
                      : "text-green-400/80"
                  }`}
                >
                  {line || "\u00A0"}
                </motion.div>
              ))}

              {!done && lines.length > 0 && (
                <span className="cursor-blink text-neon-green text-sm" />
              )}
            </div>
          </div>

          <div className="absolute bottom-4 right-6 text-text-dim text-xs">
            OSROX v4.2.0 // CLASSIFIED
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
