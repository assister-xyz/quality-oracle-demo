"use client";

import { useEffect, useState } from "react";
import { DIMENSION_CONFIG, type Dimensions } from "@/lib/mock-data";

interface DimensionBarProps {
  dimension: keyof Dimensions;
  value: number;
  compact?: boolean;
}

export function DimensionBar({ dimension, value, compact = false }: DimensionBarProps) {
  const [width, setWidth] = useState(0);
  const config = DIMENSION_CONFIG[dimension];

  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), 150);
    return () => clearTimeout(timer);
  }, [value]);

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[10px] font-mono tabular-nums leading-none" style={{ color: config.color }}>
          {value}
        </span>
        <div className="w-16 h-1.5 rounded-full bg-muted/30 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${width}%`,
              backgroundColor: config.color,
              boxShadow: `0 0 4px ${config.color}25`,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{config.label}</span>
        <span className="font-mono font-medium tabular-nums" style={{ color: config.color }}>
          {value}
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-muted/30 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${width}%`,
            backgroundColor: config.color,
            boxShadow: `0 0 4px ${config.color}25`,
          }}
        />
      </div>
    </div>
  );
}

interface DimensionRadarProps {
  dimensions: Dimensions;
}

export function DimensionBars({ dimensions }: DimensionRadarProps) {
  return (
    <div className="space-y-2.5">
      {(Object.entries(dimensions) as [keyof Dimensions, number][]).map(([key, value]) => (
        <DimensionBar key={key} dimension={key} value={value} />
      ))}
    </div>
  );
}
