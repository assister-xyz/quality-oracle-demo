"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface RadarWithNAProps {
  axes: Record<string, number>;
  /** Axes to grey-out as N/A (e.g. latency on L1 evals). */
  naAxes?: string[];
  compareAxes?: Record<string, number>;
  height?: number;
}

const AXIS_ORDER = [
  { key: "accuracy", label: "Accuracy" },
  { key: "safety", label: "Safety" },
  { key: "reliability", label: "Reliability" },
  { key: "latency", label: "Latency" },
  { key: "process_quality", label: "Process" },
  { key: "schema_quality", label: "Schema" },
] as const;

/**
 * RadarChart variant that supports greyed-out N/A axes (QO-053-C re-weighting).
 * When `naAxes` includes an axis name, that axis renders as a dashed grey
 * marker at radius 0 with an "N/A" tick label — making it visually clear that
 * the score is not 0 but rather "not measured at this evaluation level".
 */
export function RadarWithNA({ axes, naAxes = [], compareAxes, height = 280 }: RadarWithNAProps) {
  const data = AXIS_ORDER.map(({ key, label }) => {
    const isNA = naAxes.includes(key);
    const value = isNA ? null : (axes[key] ?? 0);
    const compare = compareAxes ? (compareAxes[key] ?? 0) : undefined;
    return {
      axis: isNA ? `${label} (N/A)` : label,
      value,
      compare,
      isNA,
      fullMark: 100,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="rgba(0,0,0,0.08)" />
        <PolarAngleAxis
          dataKey="axis"
          tick={({ payload, x, y, textAnchor }) => {
            const isNA = data.find((d) => d.axis === payload.value)?.isNA;
            return (
              <text
                x={x}
                y={y}
                textAnchor={textAnchor}
                fill={isNA ? "#A0A09C" : "#535862"}
                fontSize={11}
                fontStyle={isNA ? "italic" : "normal"}
              >
                {payload.value}
              </text>
            );
          }}
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
        {compareAxes && (
          <Radar
            name="Baseline"
            dataKey="compare"
            stroke="#535862"
            fill="#535862"
            fillOpacity={0.08}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={{ r: 3, fill: "#535862" }}
          />
        )}
      </RadarChart>
    </ResponsiveContainer>
  );
}
