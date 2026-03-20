"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreGauge } from "@/components/score-gauge";
import { TierBadge } from "@/components/tier-badge";
import { TrustLevelBadge } from "@/components/trust-level-badge";
import { TIER_CONFIG, type QualityTier, type ServerEvaluation } from "@/lib/mock-data";
import { useScoresList, useBackendHealth, useBattleList } from "@/lib/hooks";
import {
  BarChart3,
  Shield,
  Zap,
  Award,
  Clock,
  Wrench,
  ArrowRight,
  Search,
  Trophy,
  ExternalLink,
  WifiOff,
  Swords,
} from "lucide-react";

function computeKPIs(servers: ServerEvaluation[]) {
  const completed = servers.filter((s) => s.status === "completed");
  if (completed.length === 0) {
    return {
      totalEvaluations: 0,
      averageScore: 0,
      passRate: 0,
      expertCount: 0,
      avgLatencyMs: 0,
      totalToolsTested: 0,
      tierDistribution: { expert: 0, proficient: 0, basic: 0, failed: 0 },
    };
  }
  const avgScore = Math.round(completed.reduce((sum, s) => sum + s.score, 0) / completed.length);
  const passRate = Math.round((completed.filter((s) => s.score >= 50).length / completed.length) * 100);
  const expertCount = completed.filter((s) => s.tier === "expert").length;
  const withDuration = completed.filter((s) => s.duration_ms > 0);
  const avgLatency = withDuration.length > 0
    ? Math.round(withDuration.reduce((sum, s) => sum + s.duration_ms, 0) / withDuration.length)
    : 0;
  const totalTools = completed.reduce((sum, s) => sum + s.tools_count, 0);

  return {
    totalEvaluations: completed.length,
    averageScore: avgScore,
    passRate,
    expertCount,
    avgLatencyMs: avgLatency,
    totalToolsTested: totalTools,
    tierDistribution: {
      expert: completed.filter((s) => s.tier === "expert").length,
      proficient: completed.filter((s) => s.tier === "proficient").length,
      basic: completed.filter((s) => s.tier === "basic").length,
      failed: completed.filter((s) => s.tier === "failed").length,
    },
  };
}

export default function DashboardPage() {
  const { isLive } = useBackendHealth();
  const { servers, loading, error } = useScoresList({ limit: 100, sort: "score" });
  const kpis = computeKPIs(servers);
  const recentEvals = servers.slice(0, 6);

  const kpiCards = [
    { label: "Total Evaluations", value: kpis.totalEvaluations, icon: BarChart3, color: "#E2754D" },
    { label: "Average Score", value: kpis.averageScore > 0 ? `${kpis.averageScore}/100` : "--", icon: Award, color: "#10b981" },
    { label: "Pass Rate", value: kpis.passRate > 0 ? `${kpis.passRate}%` : "--", icon: Shield, color: "#DB5F94" },
    { label: "Expert Agents", value: kpis.expertCount, icon: Zap, color: "#f59e0b" },
    { label: "Avg Eval Time", value: kpis.avgLatencyMs > 0
      ? kpis.avgLatencyMs >= 60000
        ? `${(kpis.avgLatencyMs / 60000).toFixed(1)}m`
        : `${(kpis.avgLatencyMs / 1000).toFixed(0)}s`
      : "--", icon: Clock, color: "#3b82f6" },
    { label: "Tools Tested", value: kpis.totalToolsTested, icon: Wrench, color: "#6941C6" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          AgentTrust{" "}
          <span className="brand-gradient-text">Dashboard</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Pre-payment quality verification for AI agents, MCP servers, and skills.
          Multi-judge consensus scoring across 6 dimensions.
        </p>
        <div className="flex gap-3 pt-1">
          <Link href="/evaluate">
            <Button className="bg-[#0E0E0C] text-white font-semibold hover:bg-[#6941C6]">
              <Search className="h-4 w-4 mr-2" />
              Evaluate Agent
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button variant="outline">
              <Trophy className="h-4 w-4 mr-2" />
              Leaderboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Backend offline warning */}
      {isLive === false && (
        <Card className="border-[#f59e0b]/30 bg-[#f59e0b]/5">
          <CardContent className="p-4 flex items-center gap-3">
            <WifiOff className="h-5 w-5 text-[#f59e0b] shrink-0" />
            <div>
              <p className="text-sm font-medium text-[#f59e0b]">Backend Offline</p>
              <p className="text-xs text-muted-foreground">
                Cannot connect to AgentTrust backend at {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002"}.
                Start the backend to see real data.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="bg-white shadow-sm border-[#E5E3E0] card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon className="h-4 w-4" style={{ color: kpi.color }} />
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold font-mono tabular-nums text-foreground">
                  {kpi.value}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tier Distribution + Evaluation Standards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white shadow-sm border-[#E5E3E0]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tier Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : kpis.totalEvaluations === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No evaluations yet. Run your first evaluation to see tier distribution.
              </p>
            ) : (
              <div className="space-y-3">
                {(Object.entries(kpis.tierDistribution) as [QualityTier, number][]).map(([tier, count]) => {
                  const config = TIER_CONFIG[tier];
                  const pct = kpis.totalEvaluations > 0 ? Math.round((count / kpis.totalEvaluations) * 100) : 0;
                  return (
                    <div key={tier} className="flex items-center gap-3">
                      <div className="w-20">
                        <TierBadge tier={tier} />
                      </div>
                      <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: config.color }}
                        />
                      </div>
                      <span className="text-sm font-mono tabular-nums text-muted-foreground w-12 text-right">
                        {count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-[#E5E3E0]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Evaluation Standards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: "Multi-Judge Consensus", detail: "2-3 parallel LLM judges with agreement threshold", icon: Shield },
                { label: "6-Axis Scoring", detail: "Accuracy, Safety, Reliability, Latency, Process, Schema", icon: BarChart3 },
                { label: "Adversarial Probes", detail: "Injection, extraction, PII, hallucination, overflow", icon: Shield },
                { label: "AQVC Attestation", detail: "Ed25519-signed JWT with W3C VC compatibility (AgentTrust Verified)", icon: Award },
                { label: "Anti-Gaming", detail: "Question paraphrasing, canaries, production correlation", icon: Zap },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-[#F1EFED] border border-[#E5E3E0]/60">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0E0E0C] shrink-0">
                    <item.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">{item.label}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Evaluations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Evaluations</h2>
          <Link href="/leaderboard" className="text-sm text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white shadow-sm border-[#E5E3E0]">
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentEvals.length === 0 ? (
          <Card className="bg-white shadow-sm border-[#E5E3E0] border-dashed">
            <CardContent className="p-8 text-center">
              <Search className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                No evaluations yet.{" "}
                <Link href="/evaluate" className="text-foreground font-medium hover:underline">
                  Run your first evaluation
                </Link>
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentEvals.map((server) => (
              <Link key={server.id} href={`/evaluate?result=${server.id}`}>
                <Card className="bg-white shadow-sm border-[#E5E3E0] hover:border-[#D5D7DA] hover:shadow-md transition-all cursor-pointer group card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-medium group-hover:text-foreground transition-colors">{server.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                            {server.transport === "sse" ? "SSE" : "HTTP"}
                          </Badge>
                          {server.tools_count} tools
                        </div>
                      </div>
                      <ScoreGauge score={server.score} tier={server.tier} size={56} strokeWidth={4} showLabel={false} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <TierBadge tier={server.tier} />
                        {server.trust_level && <TrustLevelBadge level={server.trust_level} showIcon={false} />}
                      </div>
                      {server.duration_ms > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          {(server.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Battles */}
      <RecentBattles />

      {/* How it works */}
      <Card className="bg-white shadow-sm border-[#E5E3E0]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">How AgentTrust Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Connect", desc: "Paste any MCP server URL. We auto-detect SSE or Streamable HTTP transport." },
              { step: "2", title: "Discover", desc: "Automatically list all tools, validate manifest schema, check documentation quality." },
              { step: "3", title: "Evaluate", desc: "Run functional tests per tool. Multiple LLM judges score responses independently." },
              { step: "4", title: "Attest", desc: "Generate 6-axis quality score, tier badge, and Ed25519-signed AQVC attestation (AgentTrust Verified)." },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-2">
                <div className="mx-auto w-10 h-10 rounded-full bg-[#0E0E0C] flex items-center justify-center font-bold text-sm text-white">
                  {item.step}
                </div>
                <div className="font-medium text-foreground">{item.title}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground pt-4 pb-8 space-y-1">
        <p>AgentTrust v1.0 — Evaluation Version v1.0</p>
        <p>
          Built by{" "}
          <a href="https://assisterr.ai" target="_blank" rel="noopener" className="text-foreground font-medium hover:underline inline-flex items-center gap-0.5">
            Assisterr <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </p>
      </div>
    </div>
  );
}

function RecentBattles() {
  const { data, loading } = useBattleList(1, 5);

  if (loading) return null;
  if (!data || data.items.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Swords className="h-4 w-4" />
          Recent Battles
        </h2>
        <Link href="/battle" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.items.slice(0, 6).map((battle) => (
          <Link key={battle.battle_id} href={`/battle?id=${battle.battle_id}`}>
            <Card className="bg-white shadow-sm border-[#E5E3E0] hover:border-[#D5D7DA] hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-foreground">
                    {battle.agent_a.name || "Agent A"}
                  </div>
                  <div className="text-xs font-black text-[#ef4444]">VS</div>
                  <div className="text-sm font-medium text-foreground text-right">
                    {battle.agent_b.name || "Agent B"}
                  </div>
                </div>
                <div className="flex items-center justify-between text-lg font-bold">
                  <span className={battle.winner === "a" ? "text-[#10b981]" : "text-muted-foreground"}>
                    {battle.agent_a.overall_score}
                  </span>
                  <span className={battle.winner === "b" ? "text-[#10b981]" : "text-muted-foreground"}>
                    {battle.agent_b.overall_score}
                  </span>
                </div>
                <div className="mt-2 text-center">
                  {battle.winner ? (
                    <Badge variant="outline" className="text-[10px] border-[#10b981]/30 text-[#10b981]">
                      <Trophy className="h-3 w-3 mr-1" />
                      {battle.winner === "a" ? battle.agent_a.name : battle.agent_b.name} wins
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] border-[#3b82f6]/30 text-[#3b82f6]">Draw</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
