"use client";

import dynamic from "next/dynamic";
import { Shield } from "lucide-react";

const NavbarClient = dynamic(() => import("./NavbarClient"), { ssr: false });

export default function Navbar() {
  return (
    <nav className="h-14 border-b border-border-dim bg-bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-neon-green" />
          <span className="text-neon-green text-glow-green font-bold text-lg tracking-[0.3em]">
            OSROX
          </span>
        </div>

        <div className="hidden sm:block h-6 w-px bg-border-dim" />

        <div className="hidden sm:flex items-center gap-2 text-text-dim text-xs">
          <span className="text-neon-green/50">C2</span>
          <span className="text-neon-green">●</span>
          <span>CONNECTED</span>
        </div>
      </div>

      <NavbarClient />
    </nav>
  );
}
