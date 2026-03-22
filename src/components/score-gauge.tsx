"use client";

import { useEffect, useState } from "react";
import { type QualityTier } from "@/lib/mock-data";

interface ScoreGaugeProps {
  score: number;
  tier: QualityTier;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  variant?: "light" | "dark";
}

export function ScoreGauge({
  score,
  tier,
  size = 80,
  strokeWidth = 6,
  showLabel = true,
  variant = "light",
}: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const isDark = variant === "dark";
  const strokeColor = "#E2754D";
  const trackColor = isDark ? "#2a2a28" : "#E5E3E0";
  const textColor = isDark ? "#F5F5F3" : "#0E0E0C";
  const labelColor = isDark ? "#717069" : "#717069";

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
            stroke={trackColor}
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
          <span
            className="font-bold font-mono tabular-nums"
            style={{
              color: textColor,
              fontSize: size >= 60 ? "1.125rem" : size >= 40 ? "0.8rem" : "0.65rem",
            }}
          >
            {animatedScore}
          </span>
        </div>
      </div>
      {showLabel && (
        <span
          className="text-[10px] font-medium uppercase tracking-wider"
          style={{ color: labelColor }}
        >
          {tier}
        </span>
      )}
    </div>
  );
}
