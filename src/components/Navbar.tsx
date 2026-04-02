"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, LayoutDashboard, Zap } from "lucide-react";

const NavbarClient = dynamic(() => import("./NavbarClient"), { ssr: false });

const NAV_LINKS = [
  { href: "/dashboard", label: "DASHBOARD", icon: LayoutDashboard },
  { href: "/railgun", label: "RAILGUN", icon: Zap },
];

export default function Navbar() {
  const pathname = usePathname();

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

        <div className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1 text-[11px] tracking-widest transition-colors ${
                  active
                    ? "text-neon-green border border-neon-green/30 bg-neon-green/5"
                    : "text-text-dim hover:text-neon-green/70 border border-transparent"
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      <NavbarClient />
    </nav>
  );
}
