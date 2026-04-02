"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { InstagramProfile } from "@/lib/instagram";
import type { ServiceCategory, CategorizedService } from "@/lib/services";

export type BombState = "idle" | "scanning" | "ready" | "deploying" | "done" | "error";

export type BombType =
  | "ghost-followers"
  | "comment-spam"
  | "like-flood"
  | "view-bomb";

export interface BombTypeConfig {
  id: BombType;
  label: string;
  desc: string;
  sends: ServiceCategory[];
  color: string;
  profileOrder: boolean;
}

export const BOMB_TYPES: BombTypeConfig[] = [
  {
    id: "ghost-followers",
    label: "GHOST FOLLOWERS",
    desc: "Massive followers, zero engagement on posts",
    sends: ["followers"],
    color: "text-neon-green",
    profileOrder: true,
  },
  {
    id: "comment-spam",
    label: "COMMENT SPAM",
    desc: "Flood comments on every post, no likes or views",
    sends: ["comments"],
    color: "text-neon-cyan",
    profileOrder: false,
  },
  {
    id: "like-flood",
    label: "LIKE FLOOD",
    desc: "Mass likes on all posts, zero followers or views",
    sends: ["likes"],
    color: "text-neon-red",
    profileOrder: false,
  },
  {
    id: "view-bomb",
    label: "VIEW BOMB",
    desc: "Millions of views, zero likes or comments",
    sends: ["views"],
    color: "text-neon-yellow",
    profileOrder: false,
  },
];

export interface BombSummary {
  profileOrders: number;
  postOrders: number;
  totalOrders: number;
  quantity: number;
}

export interface DeployProgress {
  current: number;
  total: number;
  message: string;
}

export function useBomb() {
  const [username, setUsername] = useState("");
  const [bombState, setBombState] = useState<BombState>("idle");
  const [profile, setProfile] = useState<InstagramProfile | null>(null);
  const [selectedBomb, setSelectedBomb] = useState<BombType>("ghost-followers");
  const [quantity, setQuantity] = useState(10_000);
  const [services, setServices] = useState<Record<ServiceCategory, CategorizedService[]> | null>(null);
  const [progress, setProgress] = useState<DeployProgress>({ current: 0, total: 0, message: "" });
  const [errorMsg, setErrorMsg] = useState("");

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

  const bombConfig = useMemo(
    () => BOMB_TYPES.find((b) => b.id === selectedBomb)!,
    [selectedBomb],
  );

  const summary: BombSummary = useMemo(() => {
    const postCount = profile?.posts.length ?? 0;
    const profileOrders = bombConfig.profileOrder ? 1 : 0;
    const postOrders = bombConfig.profileOrder ? 0 : postCount * bombConfig.sends.length;
    const totalOrders = profileOrders + postOrders;
    return { profileOrders, postOrders, totalOrders, quantity };
  }, [profile, bombConfig, quantity]);

  const handleScan = useCallback(async () => {
    const clean = username.replace(/^@/, "").trim();
    if (!clean) return;

    setBombState("scanning");
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
        setErrorMsg(data.error ?? "Profile scan failed");
        setBombState("error");
        return;
      }

      setProfile(data as InstagramProfile);
      setBombState("ready");
    } catch {
      setErrorMsg("Network error. Check connection.");
      setBombState("error");
    }
  }, [username]);

  const placeOrder = useCallback(
    async (params: Record<string, string | number>): Promise<{ order?: number; error?: string }> => {
      const res = await fetch("/api/jap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", ...params }),
      });
      return res.json();
    },
    [],
  );

  const handleDeploy = useCallback(async () => {
    if (!profile || !services) return;

    const { totalOrders } = summary;
    setBombState("deploying");
    setProgress({ current: 0, total: totalOrders, message: "Arming payload..." });

    let completed = 0;
    const bump = (msg: string) => {
      completed++;
      setProgress({ current: completed, total: totalOrders, message: msg });
    };

    const clamp = (val: number, svc: CategorizedService) =>
      Math.max(svc.min, Math.min(svc.max, val));

    if (bombConfig.profileOrder) {
      for (const cat of bombConfig.sends) {
        const svc = services[cat]?.[0];
        if (svc) {
          try {
            await placeOrder({
              service: svc.id,
              link: `https://instagram.com/${profile.username}`,
              quantity: clamp(quantity, svc),
            });
          } catch { /* non-fatal */ }
        }
        bump(`${cat} → @${profile.username}`);
      }
    } else {
      const posts = profile.posts;
      for (let i = 0; i < posts.length; i++) {
        for (const cat of bombConfig.sends) {
          const svc = services[cat]?.[0];
          if (svc) {
            try {
              await placeOrder({
                service: svc.id,
                link: posts[i].url,
                quantity: clamp(quantity, svc),
              });
            } catch { /* non-fatal */ }
          }
          bump(`Post ${i + 1}/${posts.length} — ${cat} deployed`);
        }
      }
    }

    setBombState("done");
    setProgress({ current: totalOrders, total: totalOrders, message: "BOMB DETONATED" });
  }, [profile, services, bombConfig, quantity, summary, placeOrder]);

  const reset = useCallback(() => {
    setBombState("idle");
    setProfile(null);
    setUsername("");
    setErrorMsg("");
    setProgress({ current: 0, total: 0, message: "" });
    setSelectedBomb("ghost-followers");
    setQuantity(10_000);
  }, []);

  return {
    username,
    setUsername,
    bombState,
    profile,
    selectedBomb,
    setSelectedBomb,
    quantity,
    setQuantity,
    bombConfig,
    summary,
    progress,
    errorMsg,
    handleScan,
    handleDeploy,
    reset,
  };
}
