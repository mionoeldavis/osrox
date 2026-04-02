"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BootScreen from "@/components/BootScreen";

export default function Home() {
  const router = useRouter();
  const [showBoot, setShowBoot] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hasBooted = sessionStorage.getItem("osrox_booted");
    if (hasBooted) {
      router.replace("/dashboard");
    } else {
      setShowBoot(true);
      setReady(true);
    }
  }, [router]);

  const handleBootComplete = () => {
    sessionStorage.setItem("osrox_booted", "1");
    router.replace("/dashboard");
  };

  if (!ready) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-neon-green text-glow-green text-sm animate-pulse">
          OSROX
        </div>
      </div>
    );
  }

  return showBoot ? <BootScreen onComplete={handleBootComplete} /> : null;
}
