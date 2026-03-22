"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreGauge } from "@/components/score-gauge";
import { TierBadge } from "@/components/tier-badge";
import { TrustLevelBadge } from "@/components/trust-level-badge";
import { DimensionBar } from "@/components/dimension-bar";
import { QualityRadarChart } from "@/components/radar-chart";
import {
  TIER_CONFIG,
  type ServerEvaluation,
  type QualityTier,
  type Dimensions,
} from "@/lib/mock-data";
import { useScoresList, useScoreDetail } from "@/lib/hooks";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Wrench,
  Clock,
  Shield,
  Filter,
  Trophy,
  Medal,
  ExternalLink,
} from "lucide-react";

type SortField = "score" | "name" | "tools_count" | "confidence";
type SortDir = "asc" | "desc";
type TierFilter = QualityTier | "all";

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="w-7 h-7 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-center justify-center">
        <Trophy className="h-3.5 w-3.5 text-[#f59e0b]" />
      </div>
    );
  if (rank === 2)
    return (
      <div className="w-7 h-7 rounded-full bg-[#94a3b8]/10 border border-[#94a3b8]/30 flex items-center justify-center">
        <Medal className="h-3.5 w-3.5 text-[#94a3b8]" />
      </div>
    );
  if (rank === 3)
    return (
      <div className="w-7 h-7 rounded-full bg-[#cd7c2f]/10 border border-[#cd7c2f]/30 flex items-center justify-center">
        <Medal className="h-3.5 w-3.5 text-[#cd7c2f]" />
      </div>
    );
  return (
    <div className="w-7 h-7 rounded-full bg-muted/30 flex items-center justify-center">
      <span className="text-xs font-mono text-muted-foreground">{rank}</span>
    </div>
  );
}

export default function LeaderboardPage() {
  const { servers, loading } = useScoresList({ limit: 100, sort: "score" });
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [selectedServer, setSelectedServer] = useState<ServerEvaluation | null>(null);
  const [selectedEvalId, setSelectedEvalId] = useState<string | null>(null);

  // Fetch full detail when a row is clicked
  const { detail: detailData, loading: detailLoading } = useScoreDetail(selectedEvalId);

  // Use detail data when available, otherwise use the list data
  const displayServer = detailData || selectedServer;

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/40" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3 text-[#E2754D]" />
    ) : (
      <ArrowDown className="h-3 w-3 text-[#E2754D]" />
    );
  };

  const filtered = useMemo(() => {
    let list = [...servers];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q)
      );
    }

    if (tierFilter !== "all") {
      list = list.filter((s) => s.tier === tierFilter);
    }

    list.sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });

    return list;
  }, [servers, search, sortField, sortDir, tierFilter]);

  const handleRowClick = (server: ServerEvaluation) => {
    if (selectedServer?.id === server.id) {
      setSelectedServer(null);
      setSelectedEvalId(null);
    } else {
      setSelectedServer(server);
      // Try to fetch full detail if we have an evaluation ID
      setSelectedEvalId(server.id);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Leaderboard"
        title="MCP Server"
        accent="Rankings"
        description={loading ? "Loading..." : `${servers.length} servers evaluated with multi-judge consensus scoring.`}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search servers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-border"
          />
        </div>
        <div className="flex gap-1.5">
          <Button
            variant={tierFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setTierFilter("all")}
            className={tierFilter === "all" ? "bg-[#0E0E0C] text-white border-[#0E0E0C] hover:bg-[#0E0E0C]/90" : ""}
          >
            <Filter className="h-3 w-3 mr-1" /> All
          </Button>
          {(["expert", "proficient", "basic", "failed"] as QualityTier[]).map((tier) => (
            <Button
              key={tier}
              variant={tierFilter === tier ? "default" : "outline"}
              size="sm"
              onClick={() => setTierFilter(tier)}
              style={
                tierFilter === tier
                  ? {
                      backgroundColor: TIER_CONFIG[tier].bg,
                      color: TIER_CONFIG[tier].color,
                      borderColor: TIER_CONFIG[tier].border,
                    }
                  : undefined
              }
            >
              {TIER_CONFIG[tier].label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Table */}
        <Card className="bg-white border-[#E5E3E0] overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-10">#</th>
                    <th
                      className="text-left px-4 py-3 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={() => toggleSort("name")}
                    >
                      <div className="flex items-center gap-1">
                        Server <SortIcon field="name" />
                      </div>
                    </th>
                    <th
                      className="text-center px-4 py-3 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={() => toggleSort("score")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Score <SortIcon field="score" />
                      </div>
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">Tier</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Trust</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Record</th>
                    <th
                      className="text-center px-4 py-3 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground hidden md:table-cell"
                      onClick={() => toggleSort("tools_count")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Tools <SortIcon field="tools_count" />
                      </div>
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">
                      Dimensions
                    </th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((server, index) => {
                    const isSelected = selectedServer?.id === server.id;
                    return (
                      <tr
                        key={server.id}
                        className={`border-b border-border/50 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[#0E0E0C]/5 border-[#0E0E0C]/20"
                            : "hover:bg-muted/30"
                        }`}
                        onClick={() => handleRowClick(server)}
                      >
                        <td className="px-4 py-3">
                          <RankBadge rank={index + 1} />
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-foreground">{server.name}</div>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5">
                                {server.transport === "sse" ? "SSE" : "HTTP"}
                              </Badge>
                              <span className="truncate max-w-[160px]">{server.url}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className="text-lg font-bold font-mono tabular-nums"
                            style={{ color: TIER_CONFIG[server.tier].color }}
                          >
                            {server.score}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <TierBadge tier={server.tier} />
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell">
                          {server.trust_level ? (
                            <TrustLevelBadge level={server.trust_level} showIcon={false} />
                          ) : (
                            <span className="text-[10px] text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell">
                          {server.battle_record ? (
                            <span className="text-xs font-mono text-foreground">
                              {server.battle_record.wins}-{server.battle_record.losses}-{server.battle_record.draws}
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell">
                          <span className="font-mono text-xs">{server.tools_count}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex gap-3">
                            {(Object.entries(server.dimensions) as [keyof Dimensions, number][]).map(([dim, val]) => (
                              <DimensionBar key={dim} dimension={dim} value={val} compact />
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <ChevronRight
                            className={`h-4 w-4 text-muted-foreground transition-transform ${
                              isSelected ? "rotate-90 text-[#0E0E0C]" : ""
                            }`}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          {!loading && filtered.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-12">
              {servers.length === 0
                ? "No evaluations yet. Run your first evaluation to populate the leaderboard."
                : "No servers match your filters."}
            </div>
          )}
        </Card>

        {/* Detail Sidebar */}
        <div className="space-y-4">
          {displayServer ? (
            <>
              <Card className="bg-white border-[#E5E3E0] sticky top-20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-foreground">{displayServer.name}</CardTitle>
                    <ScoreGauge
                      score={displayServer.score}
                      tier={displayServer.tier}
                      size={64}
                      strokeWidth={5}
                      showLabel={false}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <TierBadge tier={displayServer.tier} />
                    {displayServer.trust_level && <TrustLevelBadge level={displayServer.trust_level} />}
                    <span className="flex items-center gap-1">
                      <Wrench className="h-3 w-3" /> {displayServer.tools_count} tools
                    </span>
                    {displayServer.duration_ms > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {(displayServer.duration_ms / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {detailLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-48 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : (
                    <>
                      {/* Radar */}
                      {(displayServer.dimensions.accuracy > 0 || displayServer.dimensions.safety > 0) && (
                        <QualityRadarChart dimensions={displayServer.dimensions} height={220} />
                      )}

                      {/* Tool scores */}
                      {Object.keys(displayServer.tool_scores).length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-medium text-muted-foreground">Tool Scores</h4>
                          {Object.entries(displayServer.tool_scores).map(([tool, scores]) => (
                            <div key={tool} className="flex items-center gap-2">
                              <code className="text-[10px] font-mono bg-muted/50 px-1 py-0.5 rounded truncate max-w-[140px]">
                                {tool}
                              </code>
                              <div className="flex-1 h-1 rounded-full bg-muted/50 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#E2754D]"
                                  style={{ width: `${scores.score}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono text-muted-foreground w-5 text-right">
                                {scores.score}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Safety summary */}
                      {displayServer.safety_probes.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Shield className="h-3 w-3" /> Safety Probes
                          </h4>
                          <div className="flex gap-1.5 flex-wrap">
                            {displayServer.safety_probes.map((probe, idx) => (
                              <Badge
                                key={`${probe.probe_type}-${idx}`}
                                variant="outline"
                                className={`text-[9px] ${
                                  probe.passed
                                    ? "text-[#10b981] border-[#10b981]/30"
                                    : "text-[#ef4444] border-[#ef4444]/30"
                                }`}
                              >
                                {probe.passed ? "PASS" : "FAIL"}{" "}
                                {probe.probe_type.replace(/_/g, " ")}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <Link href={`/evaluate?result=${displayServer.id}`}>
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          View Full Report <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-white border-[#E5E3E0] border-dashed">
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground space-y-2">
                  <Trophy className="h-8 w-8 mx-auto opacity-30" />
                  <p className="text-sm">Click a server to see detailed evaluation results</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
