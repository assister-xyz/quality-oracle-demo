"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { DIMENSION_CONFIG, type Dimensions } from "@/lib/mock-data";

interface RadarChartProps {
  dimensions: Dimensions;
  compareDimensions?: Dimensions;
  height?: number;
}

export function QualityRadarChart({ dimensions, compareDimensions, height = 280 }: RadarChartProps) {
  const data = (Object.entries(DIMENSION_CONFIG) as [keyof Dimensions, typeof DIMENSION_CONFIG[keyof Dimensions]][]).map(
    ([key, config]) => ({
      axis: config.label,
      value: dimensions[key],
      compare: compareDimensions ? compareDimensions[key] : undefined,
      fullMark: 100,
    })
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: "#64748b", fontSize: 9 }}
          axisLine={false}
        />
        <Radar
          name="Score"
          dataKey="value"
          stroke="#00f0ff"
          fill="#00f0ff"
          fillOpacity={0.15}
          strokeWidth={2}
          dot={{ r: 3, fill: "#00f0ff" }}
        />
        {compareDimensions && (
          <Radar
            name="Compare"
            dataKey="compare"
            stroke="#a855f7"
            fill="#a855f7"
            fillOpacity={0.1}
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ r: 3, fill: "#a855f7" }}
          />
        )}
      </RadarChart>
    </ResponsiveContainer>
  );
}
