"use client";

import Navbar from "@/components/Navbar";
import BombPanel from "@/components/BombPanel";

export default function BombPage() {
  return (
    <div className="h-full flex flex-col bg-bg-dark bg-grid">
      <Navbar />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <BombPanel />
      </main>
    </div>
  );
}
