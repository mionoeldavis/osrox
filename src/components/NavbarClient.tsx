"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wifi, Activity } from "lucide-react";

function formatNumber(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function NavbarClient() {
  const [botCount, setBotCount] = useState(1247893);
  const [time, setTime] = useState("");

  useEffect(() => {
    const botInterval = setInterval(() => {
      setBotCount((c) => c + Math.floor(Math.random() * 200 - 80));
    }, 2000);

    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    tick();
    const timeInterval = setInterval(tick, 1000);

    return () => {
      clearInterval(botInterval);
      clearInterval(timeInterval);
    };
  }, []);

  return (
    <div className="flex items-center gap-6">
      <div className="hidden md:flex items-center gap-2">
        <Wifi className="w-3.5 h-3.5 text-neon-green" />
        <span className="text-neon-green text-xs font-bold">BOTS ONLINE:</span>
        <motion.span
          key={botCount}
          className="text-neon-green text-glow-green text-sm font-bold tabular-nums"
          initial={{ opacity: 0.5, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {formatNumber(botCount)}
        </motion.span>
      </div>

      <div className="flex items-center gap-2 text-text-dim text-xs">
        <Activity className="w-3.5 h-3.5 text-neon-cyan" />
        <span className="tabular-nums">{time}</span>
      </div>
    </div>
  );
}
