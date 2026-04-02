"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";

interface BalanceCardProps {
  refreshTrigger: number;
}

export default function BalanceCard({ refreshTrigger }: BalanceCardProps) {
  const [balance, setBalance] = useState<string | null>(null);
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/jap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "balance" }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.balance) {
          setBalance(parseFloat(data.balance).toFixed(2));
          if (data.currency) setCurrency(data.currency);
        }
      })
      .catch(() => setBalance("-.--"))
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  return (
    <div className="card-glow px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Wallet className="w-4 h-4 text-neon-cyan" />
        <span className="text-[10px] text-text-dim tracking-widest uppercase">
          Credits
        </span>
      </div>
      <motion.div
        key={balance}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm text-neon-cyan text-glow-cyan font-bold tabular-nums"
      >
        {loading ? (
          <span className="text-text-dim animate-pulse">LOADING...</span>
        ) : (
          `${currency} $${balance}`
        )}
      </motion.div>
    </div>
  );
}
