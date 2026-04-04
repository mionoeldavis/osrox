"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, LayoutDashboard, Zap, Star, Bomb, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const NavbarClient = dynamic(() => import("./NavbarClient"), { ssr: false });

const NAV_LINKS = [
  { href: "/dashboard", label: "DASHBOARD", icon: LayoutDashboard },
  { href: "/railgun", label: "RAILGUN", icon: Zap },
  { href: "/fame", label: "FAME", icon: Star },
  { href: "/bomb", label: "BOMB", icon: Bomb },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav className="border-b border-border-dim bg-bg-card/80 backdrop-blur-sm shrink-0 relative z-50">
      <div className="h-14 flex items-center justify-between px-4 sm:px-6">
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

        <div className="flex items-center gap-3">
          <NavbarClient />
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="sm:hidden flex items-center justify-center w-8 h-8 border border-border-dim text-text-dim hover:text-neon-green hover:border-neon-green/30 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden overflow-hidden border-t border-border-dim bg-bg-card/95 backdrop-blur-sm"
          >
            <div className="flex flex-col p-2 gap-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-4 py-3 text-xs tracking-widest transition-colors ${
                      active
                        ? "text-neon-green border border-neon-green/30 bg-neon-green/5"
                        : "text-text-dim hover:text-neon-green/70 border border-transparent hover:bg-neon-green/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
