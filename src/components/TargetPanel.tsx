"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Users, Heart, MessageCircle, Eye, Zap, Loader2 } from "lucide-react";
import { injectTerminalMessage } from "./FakeTerminal";
import type { ServiceCategory } from "@/lib/services";
import type { CategorizedService } from "@/lib/services";

interface StoredOrder {
  id: number;
  target: string;
  service: ServiceCategory;
  quantity: number;
  timestamp: number;
  serviceName: string;
}

const SERVICE_META: Record<ServiceCategory, { icon: typeof Users; label: string; color: string }> = {
  followers: { icon: Users, label: "FOLLOWERS", color: "text-neon-green" },
  likes: { icon: Heart, label: "LIKES", color: "text-neon-red" },
  comments: { icon: MessageCircle, label: "COMMENTS", color: "text-neon-cyan" },
  views: { icon: Eye, label: "VIEWS", color: "text-neon-yellow" },
};

interface TargetPanelProps {
  onOrderPlaced?: () => void;
}

export default function TargetPanel({ onOrderPlaced }: TargetPanelProps) {
  const [target, setTarget] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>("followers");
  const [quantity, setQuantity] = useState(1000);
  const [deploying, setDeploying] = useState(false);
  const [services, setServices] = useState<Record<ServiceCategory, CategorizedService[]> | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/jap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "services" }),
    })
      .then((r) => r.json())
      .then(setServices)
      .catch(() => {});
  }, []);

  const isPostUrl = target.includes("instagram.com/p/") || target.includes("instagram.com/reel/");

  const getLink = useCallback(() => {
    if (isPostUrl) return target;
    const username = target.replace("@", "").trim();
    return `https://instagram.com/${username}`;
  }, [target, isPostUrl]);

  const handleDeploy = async () => {
    if (!target.trim()) return;
    setDeploying(true);
    setError("");
    setShowSuccess(false);

    const cleanTarget = target.replace("@", "").trim();

    injectTerminalMessage(`[C2] NEW MISSION — Target: ${cleanTarget} | Type: ${selectedCategory.toUpperCase()} | Qty: ${quantity.toLocaleString("en-US")}`);
    injectTerminalMessage(`[SWARM] Allocating ${quantity.toLocaleString("en-US")} bots for operation...`);

    await new Promise((r) => setTimeout(r, 1500));

    const selectedService = services?.[selectedCategory]?.[0];
    if (!selectedService) {
      injectTerminalMessage(`[ERROR] No service available for ${selectedCategory}`);
      setError("No service available for this category. Check your API services.");
      setDeploying(false);
      return;
    }

    try {
      const clampedQty = Math.max(selectedService.min, Math.min(selectedService.max, quantity));

      const res = await fetch("/api/jap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          service: selectedService.id,
          link: getLink(),
          quantity: clampedQty,
        }),
      });
      const data = await res.json();

      if (data.error) {
        injectTerminalMessage(`[ERROR] Mission failed — ${data.error}`);
        setError(data.error);
      } else {
        injectTerminalMessage(`[SWARM] ✓ DEPLOYED — Order #${data.order} — ${quantity.toLocaleString("en-US")} bots en route to @${cleanTarget}`);
        injectTerminalMessage(`[C2] Estimated completion: ${Math.ceil(quantity / 500)} minutes`);

        const orders: StoredOrder[] = JSON.parse(localStorage.getItem("osrox_orders") || "[]");
        orders.push({
          id: data.order,
          target: cleanTarget,
          service: selectedCategory,
          quantity: clampedQty,
          timestamp: Date.now(),
          serviceName: selectedService.name,
        });
        localStorage.setItem("osrox_orders", JSON.stringify(orders));

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        onOrderPlaced?.();
      }
    } catch {
      injectTerminalMessage("[ERROR] Connection to swarm lost — retrying...");
      setError("Network error. Check connection.");
    }

    setDeploying(false);
  };

  return (
    <div className="card-glow p-5 flex flex-col gap-5 h-full">
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-neon-green" />
        <span className="text-xs text-neon-green tracking-widest font-bold uppercase">
          Target Acquisition
        </span>
      </div>

      <div>
        <label className="text-[10px] text-text-dim tracking-widest uppercase mb-1 block">
          Instagram Target
        </label>
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="@username or post URL"
          className="w-full bg-black/50 border border-border-dim text-neon-green placeholder:text-text-dim px-3 py-2.5 text-sm focus:outline-none focus:border-neon-green/50 transition-colors"
        />
        {target && (
          <div className="text-[10px] text-text-dim mt-1">
            Mode: {isPostUrl ? "POST ENGAGEMENT" : "PROFILE TARGET"}
          </div>
        )}
      </div>

      <div>
        <label className="text-[10px] text-text-dim tracking-widest uppercase mb-2 block">
          Attack Vector
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(SERVICE_META) as [ServiceCategory, typeof SERVICE_META.followers][]).map(
            ([key, meta]) => {
              const Icon = meta.icon;
              const isSelected = selectedCategory === key;
              const isDisabled =
                !isPostUrl && (key === "likes" || key === "comments" || key === "views");

              return (
                <button
                  key={key}
                  onClick={() => !isDisabled && setSelectedCategory(key)}
                  disabled={isDisabled}
                  className={`flex items-center gap-2 px-3 py-2 border text-xs transition-all ${
                    isDisabled
                      ? "border-border-dim/30 text-text-dim/30 cursor-not-allowed"
                      : isSelected
                      ? `border-neon-green/50 ${meta.color} glow-green`
                      : "border-border-dim text-text-dim hover:border-neon-green/30"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{meta.label}</span>
                </button>
              );
            }
          )}
        </div>
        {!isPostUrl && (
          <div className="text-[10px] text-text-dim/50 mt-1">
            Paste a post URL to unlock likes, comments, views
          </div>
        )}
      </div>

      <div>
        <label className="text-[10px] text-text-dim tracking-widest uppercase mb-1 block">
          Bot Count: {quantity.toLocaleString("en-US")}
        </label>
        <input
          type="range"
          min={100}
          max={100000}
          step={100}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full accent-[#00ff41] h-1 bg-border-dim appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-neon-green [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,255,65,0.5)]"
        />
        <div className="flex justify-between text-[10px] text-text-dim mt-1">
          <span>100</span>
          <span>100,000</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full py-3 bg-neon-green/10 border border-neon-green/50 text-neon-green text-center text-sm glow-green"
          >
            BOTS DEPLOYED SUCCESSFULLY
          </motion.div>
        ) : (
          <motion.button
            key="deploy"
            onClick={handleDeploy}
            disabled={deploying || !target.trim()}
            className={`w-full py-3 border text-sm font-bold tracking-widest transition-all flex items-center justify-center gap-2 ${
              deploying
                ? "border-neon-yellow/50 text-neon-yellow"
                : !target.trim()
                ? "border-border-dim text-text-dim cursor-not-allowed"
                : "border-neon-green/50 text-neon-green hover:bg-neon-green/10 pulse-glow cursor-pointer"
            }`}
            whileTap={{ scale: 0.98 }}
          >
            {deploying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                DEPLOYING SWARM...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                DEPLOY BOTS
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {error && (
        <div className="text-[10px] text-neon-red text-glow-red">
          ERROR: {error}
        </div>
      )}
    </div>
  );
}
