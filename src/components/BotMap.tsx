"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { formatNumber } from "@/lib/format";

interface BotNode {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  region: string;
}

const REGIONS = [
  { name: "NA", xRange: [60, 250], yRange: [180, 340] },
  { name: "SA", xRange: [210, 370], yRange: [400, 590] },
  { name: "EU", xRange: [420, 560], yRange: [220, 340] },
  { name: "AF", xRange: [440, 600], yRange: [360, 540] },
  { name: "RU", xRange: [560, 880], yRange: [60, 230] },
  { name: "AS", xRange: [660, 860], yRange: [300, 450] },
  { name: "OC", xRange: [810, 950], yRange: [460, 580] },
];

function generateNodes(count: number): BotNode[] {
  const nodes: BotNode[] = [];
  for (let i = 0; i < count; i++) {
    const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
    nodes.push({
      id: i,
      x: region.xRange[0] + Math.random() * (region.xRange[1] - region.xRange[0]),
      y: region.yRange[0] + Math.random() * (region.yRange[1] - region.yRange[0]),
      size: 2 + Math.random() * 2.5,
      delay: Math.random() * 4,
      region: region.name,
    });
  }
  return nodes;
}

export default function BotMap() {
  const nodes = useMemo(() => generateNodes(80), []);
  const [activeCount, setActiveCount] = useState(1247893);
  const [signalTarget, setSignalTarget] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCount((c) => c + Math.floor(Math.random() * 300 - 100));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const sourceNode = nodes[Math.floor(Math.random() * nodes.length)];
      setSignalTarget({ x: sourceNode.x, y: sourceNode.y });
      setTimeout(() => setSignalTarget(null), 1500);
    }, 4000);
    return () => clearInterval(interval);
  }, [nodes]);

  return (
    <div className="card-glow relative overflow-hidden h-full">
      <div className="absolute top-3 left-4 z-10 flex items-center gap-3">
        <span className="text-[10px] text-text-dim tracking-widest uppercase">
          Global Botnet
        </span>
        <span className="text-[10px] text-neon-green font-bold">
          ACTIVE NODES: {formatNumber(activeCount)}
        </span>
      </div>

      <svg
        viewBox="0 0 1010 666"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="nodeGlow">
            <stop offset="0%" stopColor="var(--neon-green)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--neon-green)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="signalGlow">
            <stop offset="0%" stopColor="var(--neon-cyan)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--neon-cyan)" stopOpacity="0" />
          </radialGradient>
          <filter id="mapGreen" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.02
                      1 1 1 0 0.12
                      0 0 0 0 0.04
                      0 0 0 0.6 0"
            />
          </filter>
        </defs>

        <image
          href="/world.svg"
          x="0"
          y="0"
          width="1010"
          height="666"
          filter="url(#mapGreen)"
        />

        {nodes.map((node) => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r={node.size * 3}
              fill="url(#nodeGlow)"
              opacity={0.3}
            >
              <animate
                attributeName="opacity"
                values="0.1;0.4;0.1"
                dur={`${2 + node.delay}s`}
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx={node.x}
              cy={node.y}
              r={node.size}
              fill="var(--neon-green)"
              opacity={0.7}
            >
              <animate
                attributeName="opacity"
                values="0.4;1;0.4"
                dur={`${2 + node.delay}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="r"
                values={`${node.size};${node.size * 1.3};${node.size}`}
                dur={`${2 + node.delay}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}

        {signalTarget && (
          <motion.circle
            cx={signalTarget.x}
            cy={signalTarget.y}
            r={5}
            fill="none"
            stroke="var(--neon-cyan)"
            strokeWidth={1.5}
            initial={{ r: 5, opacity: 1 }}
            animate={{ r: 50, opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        )}
      </svg>

      <div className="absolute bottom-3 right-4 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-neon-green animate-pulse" />
        <span className="text-[10px] text-text-dim">LIVE</span>
      </div>
    </div>
  );
}
