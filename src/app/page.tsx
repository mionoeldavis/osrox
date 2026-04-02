"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PasswordScreen from "@/components/PasswordScreen";
import BootScreen from "@/components/BootScreen";

type Phase = "loading" | "password" | "boot";

export default function Home() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");

  useEffect(() => {
    const hasBooted = sessionStorage.getItem("osrox_booted");
    if (hasBooted) {
      router.replace("/dashboard");
      return;
    }

    const hasAuth = sessionStorage.getItem("osrox_auth");
    setPhase(hasAuth ? "boot" : "password");
  }, [router]);

  const handleAuthSuccess = () => {
    setPhase("boot");
  };

  const handleBootComplete = () => {
    sessionStorage.setItem("osrox_booted", "1");
    router.replace("/dashboard");
  };

  if (phase === "loading") {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-neon-green text-glow-green text-sm animate-pulse">
          OSROX
        </div>
      </div>
    );
  }

  if (phase === "password") {
    return <PasswordScreen onSuccess={handleAuthSuccess} />;
  }

  return <BootScreen onComplete={handleBootComplete} />;
}
