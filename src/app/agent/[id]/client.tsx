"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreGauge } from "@/components/score-gauge";
import { TierBadge } from "@/components/tier-badge";
import { TrustLevelBadge } from "@/components/trust-level-badge";
import { DimensionBars } from "@/components/dimension-bar";
import { QualityRadarChart } from "@/components/radar-chart";
import { LaurelBadge } from "@/components/laurel-badge";
import { ShareButtons } from "@/components/share-buttons";
import { PageHeader } from "@/components/page-header";
import {
  getScore,
  getScoreHistory,
  getPercentile,
  type ScoreHistoryItem,
  type PercentileResponse,
} from "@/lib/api";
import type { QualityTier, TrustLevel, Dimensions } from "@/lib/mock-data";
import {
  ExternalLink,
  Clock,
  Wrench,
  Shield,
  Copy,
  Check,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface AgentData {
  target_id: string;
  score: number;
  tier: string;
  confidence: number;
  tool_scores: Record<string, { score: number; tests_passed: number; tests_total: number }>;
  evaluation_count: number;
  last_evaluated_at: string | null;
  dimensions?: Dimensions;
  trust_level?: TrustLevel;
}

function inferName(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname
      .replace(/^(mcp\.|docs\.|www\.)/, "")
      .replace(/\.(com|io|dev|ai|co|tech|build|markets)$/, "")
      .split(".")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  } catch {
    return url;
  }
}

interface AgentProfileClientProps {
  targetId: string;
}

export function AgentProfileClient({ targetId }: AgentProfileClientProps) {
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [history, setHistory] = useState<ScoreHistoryItem[]>([]);
  const [percentile, setPercentile] = useState<PercentileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<"markdown" | "html" | "shields" | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      const [scoreData, historyData, percentileData] = await Promise.all([
        getScore(targetId).catch(() => null),
        getScoreHistory(targetId).catch(() => ({ items: [] as ScoreHistoryItem[] })),
        getPercentile(targetId).catch(() => null),
      ]);

      if (cancelled) return;

      if (!scoreData) {
        setError("Agent not found or not yet evaluated");
        setLoading(false);
        return;
      }

      setAgent(scoreData as unknown as AgentData);
      setHistory(historyData.items);
      setPercentile(percentileData);
      setLoading(false);
    };

    fetchData();
    return () => { cancelled = true; };
  }, [targetId]);

  const handleCopy = useCallback((text: string, field: "markdown" | "html" | "shields") => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const name = inferName(targetId);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002";
  const badgeSvgUrl = `${apiUrl}/v1/badge/${encodeURIComponent(targetId)}.svg`;
  const profileUrl = `https://laureum.ai/agent/${encodeURIComponent(targetId)}`;
  const shieldsUrl = `https://img.shields.io/endpoint?url=${encodeURIComponent(`${apiUrl}/v1/shields/${encodeURIComponent(targetId)}.json`)}`;

  const embedMarkdown = `[![Laureum Quality](${badgeSvgUrl})](${profileUrl})`;
  const embedHtml = `<a href="${profileUrl}"><img src="${badgeSvgUrl}" alt="Laureum Quality Score" height="80" /></a>`;
  const shieldsMarkdown = `![Laureum](${shieldsUrl})`;

  if (loading) {
    return (
      <div>
        <PageHeader
          eyebrow="Agent Profile"
          title="Loading..."
          accent=""
          description="Fetching agent evaluation data"
        />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div>
        <PageHeader
          eyebrow="Agent Profile"
          title={name}
          accent=""
          description={error || "Agent not found"}
        />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-white border-[#E5E3E0]">
            <CardContent className="p-8 text-center space-y-4">
              <p className="text-muted-foreground">This agent has not been evaluated yet.</p>
              <Link href={`/evaluate`}>
                <Button className="bg-[#E2754D] text-white hover:bg-[#c9633f]">
                  Evaluate Now <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const tier = agent.tier as QualityTier;
  const dimensions: Dimensions = agent.dimensions || {
    accuracy: 0, safety: 0, process_quality: 0,
    reliability: 0, latency: 0, schema_quality: 0,
  };

  return (
    <div>
      <PageHeader
        eyebrow="Agent Profile"
        title={name}
        accent={percentile ? `Top ${percentile.top_pct}%` : ""}
        description={`Evaluated ${agent.evaluation_count} time${agent.evaluation_count !== 1 ? "s" : ""} on Laureum.ai`}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Score Summary */}
        <Card className="bg-white border-[#E5E3E0]">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-foreground">{name}</h2>
                  <TierBadge tier={tier} />
                  {agent.trust_level && <TrustLevelBadge level={agent.trust_level} />}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Wrench className="h-3 w-3" /> {Object.keys(agent.tool_scores).length} tools
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Confidence: {(agent.confidence * 100).toFixed(0)}%
                  </span>
                  {agent.last_evaluated_at && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(agent.last_evaluated_at).toLocaleDateString()}
                    </span>
                  )}
                  <a
                    href={targetId}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <ExternalLink className="h-3 w-3" /> {targetId}
                  </a>
                </div>

                {/* Percentile */}
                {percentile && (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[11px] border-[#E2754D]/30 text-[#E2754D]">
                      Top {percentile.top_pct}%
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      Rank #{percentile.rank} of {percentile.total_evaluated} evaluated agents
                    </span>
                  </div>
                )}
              </div>
              <ScoreGauge score={agent.score} tier={tier} size={100} strokeWidth={8} />
            </div>

            {/* Share */}
            <div className="pt-4 border-t border-border/50 mt-4">
              <ShareButtons
                score={agent.score}
                tier={tier}
                agentName={name}
                agentUrl={targetId}
                percentile={percentile?.percentile}
              />
            </div>
          </CardContent>
        </Card>

        {/* 6-Axis Radar + Dimensions */}
        {(dimensions.accuracy > 0 || dimensions.safety > 0) && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white border-[#E5E3E0]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">6-Axis Quality Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <QualityRadarChart dimensions={dimensions} />
              </CardContent>
            </Card>

            <Card className="bg-white border-[#E5E3E0]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Dimension Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <DimensionBars dimensions={dimensions} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tool Scores */}
        {Object.keys(agent.tool_scores).length > 0 && (
          <Card className="bg-white border-[#E5E3E0]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tool Scores ({Object.keys(agent.tool_scores).length} tools)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {Object.entries(agent.tool_scores).map(([tool, scores]) => (
                  <div key={tool} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <code className="text-xs font-mono bg-muted/50 px-1.5 py-0.5 rounded truncate max-w-[200px]">
                        {tool}
                      </code>
                      <span className="font-mono tabular-nums text-xs">
                        {scores.tests_passed}/{scores.tests_total}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#E2754D] transition-all duration-700"
                        style={{ width: `${scores.score}%` }}
                      />
                    </div>
                    <div className="text-right text-[10px] text-muted-foreground font-mono">{scores.score}/100</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Score History */}
        {history.length > 0 && (
          <Card className="bg-white border-[#E5E3E0]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Evaluation History ({history.length} evaluations)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {history.slice(0, 10).map((entry) => (
                  <div
                    key={entry.evaluation_id}
                    className="flex items-center justify-between p-2 rounded-sm bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-bold tabular-nums" style={{
                        color: entry.score >= 85 ? "#0E0E0C" : entry.score >= 70 ? "#535862" : entry.score >= 50 ? "#717069" : "#9e3b3b",
                      }}>
                        {entry.score}
                      </span>
                      <TierBadge tier={entry.tier as QualityTier} />
                      {entry.delta_from_previous != null && entry.delta_from_previous !== 0 && (
                        <Badge variant="outline" className={`text-[10px] ${
                          entry.delta_from_previous > 0
                            ? "text-green-600 border-green-200"
                            : "text-red-500 border-red-200"
                        }`}>
                          {entry.delta_from_previous > 0 ? (
                            <><TrendingUp className="h-2.5 w-2.5 mr-0.5" />+{entry.delta_from_previous}</>
                          ) : (
                            <><TrendingDown className="h-2.5 w-2.5 mr-0.5" />{entry.delta_from_previous}</>
                          )}
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(entry.recorded_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Badge Embed Instructions */}
        <Card className="bg-white border-[#E5E3E0]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Embed Badge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Badge preview */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 rounded-sm bg-[#0E0E0C] border border-[#0E0E0C]">
              <LaurelBadge
                score={agent.score}
                tier={tier}
                trustLevel={agent.trust_level}
                size="lg"
              />
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-[#F5F5F3]">Laureum Quality Badge</p>
                <p className="text-xs text-[#717069]">Embed in your README, website, or docs.</p>
              </div>
            </div>

            {/* Live SVG badge */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-muted/30 border border-border/50">
              <div className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={badgeSvgUrl}
                  alt="Laureum Quality Badge"
                  className="h-5"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Live badge (hotlinked, always up-to-date)</p>
            </div>

            {/* Embed snippets */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-muted-foreground">Markdown</p>
                <div className="flex items-center gap-2">
                  <code className="text-[10px] font-mono bg-muted/50 px-2.5 py-1.5 rounded border border-border/50 flex-1 truncate">
                    {embedMarkdown}
                  </code>
                  <Button variant="outline" size="sm" onClick={() => handleCopy(embedMarkdown, "markdown")} className="shrink-0 h-7 w-7 p-0">
                    {copiedField === "markdown" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-muted-foreground">HTML</p>
                <div className="flex items-center gap-2">
                  <code className="text-[10px] font-mono bg-muted/50 px-2.5 py-1.5 rounded border border-border/50 flex-1 truncate">
                    {embedHtml}
                  </code>
                  <Button variant="outline" size="sm" onClick={() => handleCopy(embedHtml, "html")} className="shrink-0 h-7 w-7 p-0">
                    {copiedField === "html" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-muted-foreground">shields.io</p>
                <div className="flex items-center gap-2">
                  <code className="text-[10px] font-mono bg-muted/50 px-2.5 py-1.5 rounded border border-border/50 flex-1 truncate">
                    {shieldsMarkdown}
                  </code>
                  <Button variant="outline" size="sm" onClick={() => handleCopy(shieldsMarkdown, "shields")} className="shrink-0 h-7 w-7 p-0">
                    {copiedField === "shields" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Re-evaluate CTA */}
        <div className="text-center py-4">
          <Link href={`/evaluate?url=${encodeURIComponent(targetId)}`}>
            <Button className="bg-[#E2754D] text-white hover:bg-[#c9633f]">
              Re-evaluate this agent <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
