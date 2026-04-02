"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Server, Activity, Cpu, Globe } from "lucide-react";

interface Stat {
  icon: typeof Server;
  label: string;
  getValue: () => string;
  color: string;
}

const STATS: Stat[] = [
  {
    icon: Server,
    label: "NODES",
    getValue: () => (1200000 + Math.floor(Math.random() * 50000)).toLocaleString("en-US"),
    color: "text-neon-green",
  },
  {
    icon: Activity,
    label: "OPS/SEC",
    getValue: () => (45000 + Math.floor(Math.random() * 15000)).toLocaleString("en-US"),
    color: "text-neon-cyan",
  },
  {
    icon: Cpu,
    label: "LOAD",
    getValue: () => `${(Math.random() * 30 + 40).toFixed(1)}%`,
    color: "text-neon-yellow",
  },
  {
    icon: Globe,
    label: "REGIONS",
    getValue: () => "7 / 7",
    color: "text-neon-green",
  },
];

export default function StatsBar() {
  const [values, setValues] = useState<string[]>(() => ["—", "—", "—", "7 / 7"]);

  useEffect(() => {
    setValues(STATS.map((s) => s.getValue()));
    const interval = setInterval(() => {
      setValues(STATS.map((s) => s.getValue()));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {STATS.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="card-glow px-4 py-3 flex items-center gap-3">
            <Icon className={`w-4 h-4 ${stat.color} shrink-0`} />
            <div className="min-w-0">
              <div className="text-[10px] text-text-dim tracking-widest">{stat.label}</div>
              <motion.div
                key={values[i]}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className={`text-sm font-bold tabular-nums ${stat.color}`}
              >
                {values[i]}
              </motion.div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
