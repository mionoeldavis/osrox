"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import StatsBar from "@/components/StatsBar";
import TargetPanel from "@/components/TargetPanel";
import BotMap from "@/components/BotMap";
import FakeTerminal from "@/components/FakeTerminal";
import OrderTracker from "@/components/OrderTracker";
import InstagramRecon from "@/components/InstagramRecon";


export default function DashboardPage() {
  const [orderRefresh, setOrderRefresh] = useState(0);

  return (
    <div className="h-full flex flex-col bg-bg-dark bg-grid">
      <Navbar />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StatsBar />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          <motion.div
            className="lg:col-span-4 flex flex-col gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <TargetPanel onOrderPlaced={() => setOrderRefresh((c) => c + 1)} />
            <InstagramRecon />
          </motion.div>

          <motion.div
            className="lg:col-span-8 flex flex-col gap-4 md:gap-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="h-[200px] md:h-[280px]">
              <BotMap />
            </div>
            <div className="h-[160px] md:h-[220px]">
              <FakeTerminal />
            </div>
          </motion.div>
        </div>

        <motion.div
          className="h-[240px] md:h-[320px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <OrderTracker refreshTrigger={orderRefresh} />
        </motion.div>
      </main>
    </div>
  );
}
