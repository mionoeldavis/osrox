"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, RefreshCw, Trash2 } from "lucide-react";
import { injectTerminalMessage } from "./FakeTerminal";

interface StoredOrder {
  id: number;
  target: string;
  service: string;
  quantity: number;
  timestamp: number;
  serviceName: string;
}

interface OrderStatus {
  charge: string;
  start_count: string;
  status: string;
  remains: string;
  currency: string;
}

interface TrackedOrder extends StoredOrder {
  status?: string;
  remains?: number;
  charge?: string;
}

const STATUS_STYLES: Record<string, string> = {
  Pending: "text-neon-yellow status-pulse",
  "In progress": "text-neon-green status-pulse",
  Processing: "text-neon-green status-pulse",
  Completed: "text-neon-cyan",
  Canceled: "text-neon-red",
  Partial: "text-neon-yellow",
  default: "text-text-dim",
};

function StatusBadge({ status }: { status?: string }) {
  const display = status || "DEPLOYING";
  const style = STATUS_STYLES[status || ""] || STATUS_STYLES.default;
  return (
    <span className={`text-[10px] font-bold tracking-wider ${style}`}>
      {display.toUpperCase()}
    </span>
  );
}

interface OrderTrackerProps {
  refreshTrigger: number;
}

export default function OrderTracker({ refreshTrigger }: OrderTrackerProps) {
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOrders = useCallback(() => {
    const stored: StoredOrder[] = JSON.parse(
      localStorage.getItem("osrox_orders") || "[]"
    );
    setOrders(stored.reverse().map((o) => ({ ...o })));
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders, refreshTrigger]);

  const pollStatuses = useCallback(async () => {
    if (orders.length === 0) return;

    const activeOrders = orders.filter(
      (o) => !o.status || o.status === "Pending" || o.status === "In progress" || o.status === "Processing"
    );
    if (activeOrders.length === 0) return;

    setLoading(true);
    try {
      const ids = activeOrders.map((o) => o.id);
      const res = await fetch("/api/jap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status", orders: ids.join(",") }),
      });
      const data: Record<string, OrderStatus> = await res.json();

      setOrders((prev) =>
        prev.map((order) => {
          const st = data[String(order.id)];
          if (st) {
            if (st.status === "Completed" && order.status !== "Completed") {
              injectTerminalMessage(
                `[SWARM] ✓ Mission complete — Order #${order.id} — @${order.target}`
              );
            }
            return {
              ...order,
              status: st.status,
              remains: parseInt(st.remains) || 0,
              charge: st.charge,
            };
          }
          return order;
        })
      );
    } catch {
      // silent
    }
    setLoading(false);
  }, [orders]);

  useEffect(() => {
    pollStatuses();
    const interval = setInterval(pollStatuses, 10000);
    return () => clearInterval(interval);
  }, [pollStatuses]);

  const clearCompleted = () => {
    const stored: StoredOrder[] = JSON.parse(
      localStorage.getItem("osrox_orders") || "[]"
    );
    const active = stored.filter((o) => {
      const tracked = orders.find((t) => t.id === o.id);
      return !tracked?.status || tracked.status !== "Completed";
    });
    localStorage.setItem("osrox_orders", JSON.stringify(active));
    loadOrders();
  };

  const progress = (order: TrackedOrder) => {
    if (!order.remains) return 100;
    const done = order.quantity - order.remains;
    return Math.max(0, Math.min(100, Math.round((done / order.quantity) * 100)));
  };

  return (
    <div className="card-glow flex flex-col overflow-hidden h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-dim shrink-0">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-neon-green" />
          <span className="text-[10px] text-neon-green tracking-widest font-bold uppercase">
            Active Missions
          </span>
          <span className="text-[10px] text-text-dim">({orders.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {loading && <RefreshCw className="w-3 h-3 text-neon-green animate-spin" />}
          {orders.some((o) => o.status === "Completed") && (
            <button
              onClick={clearCompleted}
              className="text-[10px] text-text-dim hover:text-neon-red transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              CLEAR
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {orders.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-dim text-xs">
            No active missions. Deploy bots to begin.
          </div>
        ) : (
          <div className="divide-y divide-border-dim/50">
            <AnimatePresence>
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="px-4 py-3 hover:bg-bg-card-hover transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-text-dim">#{order.id}</span>
                      <span className="text-xs text-neon-green font-bold">
                        @{order.target}
                      </span>
                      <span className="text-[10px] text-text-dim uppercase">
                        {order.service}
                      </span>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1 bg-border-dim/50 overflow-hidden">
                      <motion.div
                        className="h-full bg-neon-green/60"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress(order)}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <span className="text-[10px] text-text-dim tabular-nums w-12 text-right">
                      {progress(order)}%
                    </span>
                    <span className="text-[10px] text-text-dim tabular-nums">
                      {order.quantity.toLocaleString("en-US")}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
