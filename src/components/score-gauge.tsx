"use client";

import { useEffect, useState } from "react";
import { TIER_CONFIG, type QualityTier } from "@/lib/mock-data";

interface ScoreGaugeProps {
  score: number;
  tier: QualityTier;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export function ScoreGauge({ score, tier, size = 80, strokeWidth = 6, showLabel = true }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const config = TIER_CONFIG[tier];
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="relative inline-flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={config.color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${config.color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold font-mono tabular-nums" style={{ color: config.color }}>
          {animatedScore}
        </span>
      </div>
      {showLabel && (
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      )}
    </div>
  );
}
