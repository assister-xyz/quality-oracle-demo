"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreGauge } from "@/components/score-gauge";
import { TierBadge } from "@/components/tier-badge";
import { TrustLevelBadge } from "@/components/trust-level-badge";
import { QualityRadarChart } from "@/components/radar-chart";
import {
  TIER_CONFIG,
  DIMENSION_CONFIG,
  type ServerEvaluation,
  type Dimensions,
} from "@/lib/mock-data";
import { useScoresList } from "@/lib/hooks";
import {
  ChevronDown,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  Clock,
  Minus,
  TrendingUp,
  TrendingDown,
  GitCompareArrows,
} from "lucide-react";

function ServerSelector({
  selected,
  onSelect,
  label,
  color,
  servers,
  loading,
}: {
  selected: ServerEvaluation | null;
  onSelect: (server: ServerEvaluation) => void;
  label: string;
  color: string;
  servers: ServerEvaluation[];
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg border bg-white transition-colors" 
        style={{
          borderColor: selected ? `${color}40` : undefined,
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${color}15`,
              color: color,
            }}
          >
            {label}
          </span>
          {selected ? (
            <div className="text-left min-w-0">
              <div className="font-medium truncate text-foreground">{selected.name}</div>
              <div className="text-[10px] text-muted-foreground truncate">
                {selected.url}
              </div>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">
              {loading ? "Loading servers..." : "Select a server..."}
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-white shadow-xl max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : servers.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No evaluated servers yet
            </div>
          ) : (
            servers.map((server) => (
              <button
                key={server.id}
                onClick={() => {
                  onSelect(server);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-muted/30 transition-colors border-b border-border/30 last:border-0"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate text-foreground">
                    {server.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {server.url}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <TierBadge tier={server.tier} />
                  <span
                    className="text-sm font-bold font-mono"
                    style={{ color: TIER_CONFIG[server.tier].color }}
                  >
                    {server.score}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function DeltaIndicator({ value }: { value: number }) {
  if (value === 0) return <Minus className="h-3 w-3 text-muted-foreground" />;
  if (value > 0)
    return (
      <span className="flex items-center gap-0.5 text-[#10b981] text-xs font-mono">
        <TrendingUp className="h-3 w-3" />+{value}
      </span>
    );
  return (
    <span className="flex items-center gap-0.5 text-[#ef4444] text-xs font-mono">
      <TrendingDown className="h-3 w-3" />
      {value}
    </span>
  );
}

function DimensionCompareRow({
  dim,
  valueA,
  valueB,
}: {
  dim: keyof Dimensions;
  valueA: number;
  valueB: number;
}) {
  const config = DIMENSION_CONFIG[dim];
  const delta = valueA - valueB;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">
          {config.label}
        </span>
        <DeltaIndicator value={delta} />
      </div>
      <div className="flex gap-1 items-center">
        <div className="flex-1 flex justify-end">
          <div className="w-full h-2 rounded-full bg-muted/30 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${valueA}%`,
                backgroundColor: "#E2754D",
              }}
            />
          </div>
        </div>
        <div className="w-14 text-center">
          <span className="text-[10px] font-mono text-[#E2754D]">
            {valueA}
          </span>
          <span className="text-[10px] text-muted-foreground mx-0.5">vs</span>
          <span className="text-[10px] font-mono text-[#DB5F94]">
            {valueB}
          </span>
        </div>
        <div className="flex-1">
          <div className="w-full h-2 rounded-full bg-muted/30 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${valueB}%`,
                backgroundColor: "#DB5F94",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  const { servers, loading } = useScoresList({ limit: 100, sort: "score" });
  const [serverA, setServerA] = useState<ServerEvaluation | null>(null);
  const [serverB, setServerB] = useState<ServerEvaluation | null>(null);

  const hasComparison = serverA && serverB;

  const toolsA = serverA ? Object.keys(serverA.tool_scores) : [];
  const toolsB = serverB ? Object.keys(serverB.tool_scores) : [];
  const allTools = [...new Set([...toolsA, ...toolsB])];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Compare <span className="brand-gradient-text">Servers</span>
        </h1>
        <p className="text-muted-foreground">
          Side-by-side comparison of two MCP server evaluations across all
          quality dimensions.
        </p>
      </div>

      {/* Server Selectors */}
      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-start">
        <ServerSelector
          selected={serverA}
          onSelect={setServerA}
          label="A"
          color="#E2754D"
          servers={servers}
          loading={loading}
        />
        <div className="hidden md:flex items-center justify-center pt-3">
          <GitCompareArrows className="h-5 w-5 text-muted-foreground" />
        </div>
        <ServerSelector
          selected={serverB}
          onSelect={setServerB}
          label="B"
          color="#DB5F94"
          servers={servers}
          loading={loading}
        />
      </div>

      {!hasComparison && (
        <Card className="bg-white border-[#E5E3E0] border-dashed">
          <CardContent className="p-12 text-center">
            <GitCompareArrows className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              {servers.length === 0 && !loading
                ? "No evaluated servers yet. Run evaluations first."
                : "Select two servers above to compare their evaluation results"}
            </p>
          </CardContent>
        </Card>
      )}

      {hasComparison && (
        <div className="space-y-6 animate-fade-up">
          {/* Score Comparison Header */}
          <Card className="bg-white border-[#E5E3E0]">
            <CardContent className="p-6">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
                {/* Server A */}
                <div className="flex items-center gap-4">
                  <ScoreGauge
                    score={serverA.score}
                    tier={serverA.tier}
                    size={80}
                    strokeWidth={6}
                  />
                  <div className="min-w-0">
                    <div className="font-semibold truncate text-foreground">{serverA.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <TierBadge tier={serverA.tier} />
                      {serverA.trust_level && <TrustLevelBadge level={serverA.trust_level} />}
                      <Badge variant="outline" className="text-[10px]">
                        {serverA.transport === "sse" ? "SSE" : "HTTP"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                      <span className="flex items-center gap-0.5">
                        <Wrench className="h-2.5 w-2.5" /> {serverA.tools_count}
                      </span>
                      {serverA.duration_ms > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />{" "}
                          {(serverA.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* VS */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground/30">
                    VS
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <DeltaIndicator value={serverA.score - serverB.score} />
                  </div>
                </div>

                {/* Server B */}
                <div className="flex items-center gap-4 justify-end">
                  <div className="min-w-0 text-right">
                    <div className="font-semibold truncate text-foreground">{serverB.name}</div>
                    <div className="flex items-center gap-2 mt-1 justify-end">
                      <Badge variant="outline" className="text-[10px]">
                        {serverB.transport === "sse" ? "SSE" : "HTTP"}
                      </Badge>
                      <TierBadge tier={serverB.tier} />
                      {serverB.trust_level && <TrustLevelBadge level={serverB.trust_level} />}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1 justify-end">
                      <span className="flex items-center gap-0.5">
                        <Wrench className="h-2.5 w-2.5" /> {serverB.tools_count}
                      </span>
                      {serverB.duration_ms > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />{" "}
                          {(serverB.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                  </div>
                  <ScoreGauge
                    score={serverB.score}
                    tier={serverB.tier}
                    size={80}
                    strokeWidth={6}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Radar + Dimensions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white border-[#E5E3E0]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Quality Profile Overlay
                </CardTitle>
                <div className="flex items-center gap-4 text-[10px]">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 bg-[#E2754D] rounded-full" />
                    {serverA.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 bg-[#DB5F94] rounded-full" />
                    {serverB.name}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <QualityRadarChart
                  dimensions={serverA.dimensions}
                  compareDimensions={serverB.dimensions}
                  height={300}
                />
              </CardContent>
            </Card>

            <Card className="bg-white border-[#E5E3E0]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Dimension Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(
                    Object.keys(DIMENSION_CONFIG) as (keyof Dimensions)[]
                  ).map((dim) => (
                    <DimensionCompareRow
                      key={dim}
                      dim={dim}
                      valueA={serverA.dimensions[dim]}
                      valueB={serverB.dimensions[dim]}
                    />
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Dimensions won
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#E2754D] font-mono font-bold">
                        {
                          (
                            Object.keys(
                              DIMENSION_CONFIG
                            ) as (keyof Dimensions)[]
                          ).filter(
                            (d) =>
                              serverA.dimensions[d] > serverB.dimensions[d]
                          ).length
                        }
                      </span>
                      <span className="text-muted-foreground">-</span>
                      <span className="text-[#DB5F94] font-mono font-bold">
                        {
                          (
                            Object.keys(
                              DIMENSION_CONFIG
                            ) as (keyof Dimensions)[]
                          ).filter(
                            (d) =>
                              serverB.dimensions[d] > serverA.dimensions[d]
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tool Scores Comparison */}
          {allTools.length > 0 && (
            <Card className="bg-white border-[#E5E3E0]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Tool Scores Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allTools.map((tool) => {
                    const scoreA = serverA.tool_scores[tool]?.score;
                    const scoreB = serverB.tool_scores[tool]?.score;
                    return (
                      <div key={tool} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <code className="text-[11px] font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                            {tool}
                          </code>
                          <div className="flex items-center gap-3 text-[11px] font-mono">
                            {scoreA !== undefined ? (
                              <span className="text-[#E2754D]">{scoreA}</span>
                            ) : (
                              <span className="text-muted-foreground/40">
                                --
                              </span>
                            )}
                            <span className="text-muted-foreground/30">|</span>
                            {scoreB !== undefined ? (
                              <span className="text-[#DB5F94]">{scoreB}</span>
                            ) : (
                              <span className="text-muted-foreground/40">
                                --
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#E2754D] transition-all duration-700"
                              style={{
                                width: scoreA !== undefined ? `${scoreA}%` : "0%",
                              }}
                            />
                          </div>
                          <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#DB5F94] transition-all duration-700"
                              style={{
                                width: scoreB !== undefined ? `${scoreB}%` : "0%",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Safety Probes Comparison */}
          {serverA.safety_probes.length > 0 && serverB.safety_probes.length > 0 && (
            <Card className="bg-white border-[#E5E3E0]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Safety Probes Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2 text-xs font-medium text-muted-foreground">
                          Probe
                        </th>
                        <th className="text-center py-2 text-xs font-medium text-[#E2754D] w-24">
                          {serverA.name}
                        </th>
                        <th className="text-center py-2 text-xs font-medium text-[#DB5F94] w-24">
                          {serverB.name}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {serverA.safety_probes.map((probeA, i) => {
                        const probeB = serverB.safety_probes[i];
                        const label = probeA.probe_type
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase());
                        return (
                          <tr
                            key={probeA.probe_type}
                            className="border-b border-border/30"
                          >
                            <td className="py-2.5 text-xs">{label}</td>
                            <td className="py-2.5 text-center">
                              <div className="inline-flex items-center gap-1">
                                {probeA.passed ? (
                                  <ShieldCheck className="h-3.5 w-3.5 text-[#10b981]" />
                                ) : (
                                  <ShieldAlert className="h-3.5 w-3.5 text-[#ef4444]" />
                                )}
                                <Badge
                                  variant="outline"
                                  className={`text-[9px] ${
                                    probeA.passed
                                      ? "text-[#10b981] border-[#10b981]/30"
                                      : "text-[#ef4444] border-[#ef4444]/30"
                                  }`}
                                >
                                  {probeA.passed ? "PASS" : "FAIL"}
                                </Badge>
                              </div>
                            </td>
                            <td className="py-2.5 text-center">
                              {probeB && (
                                <div className="inline-flex items-center gap-1">
                                  {probeB.passed ? (
                                    <ShieldCheck className="h-3.5 w-3.5 text-[#10b981]" />
                                  ) : (
                                    <ShieldAlert className="h-3.5 w-3.5 text-[#ef4444]" />
                                  )}
                                  <Badge
                                    variant="outline"
                                    className={`text-[9px] ${
                                      probeB.passed
                                        ? "text-[#10b981] border-[#10b981]/30"
                                        : "text-[#ef4444] border-[#ef4444]/30"
                                    }`}
                                  >
                                    {probeB.passed ? "PASS" : "FAIL"}
                                  </Badge>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Verdict */}
          <Card className="bg-white border-[#E5E3E0]">
            <CardContent className="p-6">
              <div className="text-center space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Verdict
                </h3>
                {serverA.score === serverB.score ? (
                  <p className="text-lg font-semibold text-foreground">
                    It&apos;s a <span className="text-[#f59e0b]">tie</span> at{" "}
                    <span className="font-mono">{serverA.score}/100</span>
                  </p>
                ) : (
                  <p className="text-lg font-semibold text-foreground">
                    <span
                      style={{
                        color:
                          serverA.score > serverB.score
                            ? "#E2754D"
                            : "#DB5F94",
                      }}
                    >
                      {serverA.score > serverB.score
                        ? serverA.name
                        : serverB.name}
                    </span>{" "}
                    wins by{" "}
                    <span className="font-mono">
                      {Math.abs(serverA.score - serverB.score)} points
                    </span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Based on weighted 6-axis multi-judge consensus evaluation
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
