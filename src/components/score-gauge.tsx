"use client";

import { useEffect, useState } from "react";
import { type QualityTier } from "@/lib/mock-data";

interface ScoreGaugeProps {
  score: number;
  tier: QualityTier;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export function ScoreGauge({ score, tier, size = 80, strokeWidth = 6, showLabel = true }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  // Single brand color for all scores — monochrome, not rainbow
  const strokeColor = "#E2754D";
  const textColor = "#0E0E0C";

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div className="relative">
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E3E0"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold font-mono tabular-nums" style={{ color: textColor }}>
            {animatedScore}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className="text-[10px] font-medium uppercase tracking-wider text-[#717069]">
          {tier}
        </span>
      )}
    </div>
  );
}
