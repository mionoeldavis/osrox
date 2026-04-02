"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { InstagramProfile } from "@/lib/instagram";
import type { ServiceCategory, CategorizedService } from "@/lib/services";

export type FameState = "idle" | "scanning" | "ready" | "deploying" | "done" | "error";

export interface FameMetrics {
  currentFollowers: number;
  followersToAdd: number;
  likesPerPost: number;
  commentsPerPost: number;
  viewsPerPost: number;
  impressionsEst: number;
  totalOrders: number;
}

export interface DeployProgress {
  current: number;
  total: number;
  message: string;
}

export function useFame() {
  const [username, setUsername] = useState("");
  const [fameState, setFameState] = useState<FameState>("idle");
  const [profile, setProfile] = useState<InstagramProfile | null>(null);
  const [targetFollowers, setTargetFollowers] = useState(10_000);
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

  const metrics: FameMetrics = useMemo(() => {
    const currentFollowers = parseInt(profile?.followersCount ?? "0") || 0;
    const followersToAdd = Math.max(100, targetFollowers - currentFollowers);
    const likesPerPost = Math.max(10, Math.round(targetFollowers * 0.03));
    const commentsPerPost = Math.max(5, Math.round(targetFollowers * 0.005));
    const viewsPerPost = Math.max(50, Math.round(targetFollowers * 0.05));
    const impressionsEst = Math.round(targetFollowers * 0.1);
    const postCount = profile?.posts.length ?? 0;
    const totalOrders = 1 + postCount * 3;

    return { currentFollowers, followersToAdd, likesPerPost, commentsPerPost, viewsPerPost, impressionsEst, totalOrders };
  }, [profile, targetFollowers]);

  const handleScan = useCallback(async () => {
    const clean = username.replace(/^@/, "").trim();
    if (!clean) return;

    setFameState("scanning");
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
        setFameState("error");
        return;
      }

      setProfile(data as InstagramProfile);
      setFameState("ready");
    } catch {
      setErrorMsg("Network error. Check connection.");
      setFameState("error");
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
    []
  );

  const handleDeploy = useCallback(async () => {
    if (!profile || !services) return;

    const { followersToAdd, likesPerPost, commentsPerPost, viewsPerPost } = metrics;
    const posts = profile.posts;
    const totalOrders = 1 + posts.length * 3;

    setFameState("deploying");
    setProgress({ current: 0, total: totalOrders, message: "Initializing fame protocol..." });

    let completed = 0;

    const bump = (msg: string) => {
      completed++;
      setProgress({ current: completed, total: totalOrders, message: msg });
    };

    const clamp = (val: number, min: number, max: number) =>
      Math.max(min, Math.min(max, val));

    // 1. Followers order
    const followerSvc = services.followers?.[0];
    if (followerSvc) {
      try {
        await placeOrder({
          service: followerSvc.id,
          link: `https://instagram.com/${profile.username}`,
          quantity: clamp(followersToAdd, followerSvc.min, followerSvc.max),
        });
      } catch {
        // non-fatal: continue with other orders
      }
    }
    bump(`Followers queued → @${profile.username}`);

    // 2. Per-post orders: likes, comments, views
    const likesSvc = services.likes?.[0];
    const commentsSvc = services.comments?.[0];
    const viewsSvc = services.views?.[0];

    for (let i = 0; i < posts.length; i++) {
      const postUrl = posts[i].url;

      if (likesSvc) {
        try {
          await placeOrder({
            service: likesSvc.id,
            link: postUrl,
            quantity: clamp(likesPerPost, likesSvc.min, likesSvc.max),
          });
        } catch { /* non-fatal */ }
      }
      bump(`Post ${i + 1}/${posts.length} — likes deployed`);

      if (commentsSvc) {
        try {
          await placeOrder({
            service: commentsSvc.id,
            link: postUrl,
            quantity: clamp(commentsPerPost, commentsSvc.min, commentsSvc.max),
          });
        } catch { /* non-fatal */ }
      }
      bump(`Post ${i + 1}/${posts.length} — comments deployed`);

      if (viewsSvc) {
        try {
          await placeOrder({
            service: viewsSvc.id,
            link: postUrl,
            quantity: clamp(viewsPerPost, viewsSvc.min, viewsSvc.max),
          });
        } catch { /* non-fatal */ }
      }
      bump(`Post ${i + 1}/${posts.length} — views deployed`);
    }

    setFameState("done");
    setProgress({ current: totalOrders, total: totalOrders, message: "FAME PROTOCOL COMPLETE" });
  }, [profile, services, metrics, placeOrder]);

  const reset = useCallback(() => {
    setFameState("idle");
    setProfile(null);
    setUsername("");
    setErrorMsg("");
    setProgress({ current: 0, total: 0, message: "" });
    setTargetFollowers(10_000);
  }, []);

  return {
    username,
    setUsername,
    fameState,
    profile,
    targetFollowers,
    setTargetFollowers,
    metrics,
    progress,
    errorMsg,
    handleScan,
    handleDeploy,
    reset,
  };
}
