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
        <PolarGrid stroke="rgba(0,0,0,0.08)" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: "#535862", fontSize: 11 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: "#717680", fontSize: 9 }}
          axisLine={false}
        />
        <Radar
          name="Score"
          dataKey="value"
          stroke="#E2754D"
          fill="#E2754D"
          fillOpacity={0.15}
          strokeWidth={2}
          dot={{ r: 3, fill: "#E2754D" }}
        />
        {compareDimensions && (
          <Radar
            name="Compare"
            dataKey="compare"
            stroke="#DB5F94"
            fill="#DB5F94"
            fillOpacity={0.1}
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ r: 3, fill: "#DB5F94" }}
          />
        )}
      </RadarChart>
    </ResponsiveContainer>
  );
}
