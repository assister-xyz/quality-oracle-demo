"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreGauge } from "@/components/score-gauge";
import { TierBadge } from "@/components/tier-badge";
import {
  TIER_CONFIG,
  type ServerEvaluation,
} from "@/lib/mock-data";
import { submitEvaluation, getEvaluationStatus, ApiError } from "@/lib/api";
import { transformEvalStatus } from "@/lib/transform";
import {
  Upload,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Circle,
  Clock,
  Wrench,
  Download,
  Trash2,
  Plus,
  BarChart3,
  Shield,
  Zap,
  ExternalLink,
  ListPlus,
} from "lucide-react";

interface BulkItem {
  id: string;
  url: string;
  status: "queued" | "running" | "completed" | "error";
  evaluationId?: string;
  progressPct?: number;
  currentStep?: string;
  result?: ServerEvaluation;
  error?: string;
}

function StatusIcon({ status }: { status: BulkItem["status"] }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-[#10b981]" />;
    case "running":
      return <Loader2 className="h-4 w-4 text-[#00f0ff] animate-spin" />;
    case "error":
      return <XCircle className="h-4 w-4 text-[#ef4444]" />;
    default:
      return <Circle className="h-4 w-4 text-muted-foreground/30" />;
  }
}

const STEP_LABELS = [
  "Connecting...",
  "Discovering tools...",
  "Manifest validation...",
  "Functional testing...",
  "Adversarial probes...",
  "Consensus scoring...",
  "Computing dimensions...",
  "Generating attestation...",
];

function pctToStepLabel(pct: number): string {
  const thresholds = [10, 30, 40, 60, 75, 85, 95, 100];
  for (let i = 0; i < thresholds.length; i++) {
    if (pct < thresholds[i]) return STEP_LABELS[i];
  }
  return STEP_LABELS[STEP_LABELS.length - 1];
}

const PRESET_LISTS = [
  {
    name: "Local Mock Server",
    urls: ["http://localhost:8010/sse"],
  },
  {
    name: "Top Scored (80+)",
    urls: [
      "https://mcp.tweetsave.org/sse",
      "https://docs.mcp.cloudflare.com/sse",
      "https://gitmcp.io/anthropics/anthropic-cookbook",
      "https://huggingface.co/mcp",
    ],
  },
  {
    name: "Documentation Servers",
    urls: [
      "https://mcp.deepwiki.com/mcp",
      "https://mcp.context7.com/mcp",
      "https://gitmcp.io/docs",
    ],
  },
  {
    name: "Marketplaces & APIs",
    urls: [
      "https://api.manifold.markets/v0/mcp",
      "https://mcp.ferryhopper.com/mcp",
    ],
  },
];

export default function BulkPage() {
  const [urlText, setUrlText] = useState("");
  const [items, setItems] = useState<BulkItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [concurrency, setConcurrency] = useState(3);
  const abortRef = useRef(false);

  const parseUrls = (text: string): string[] => {
    return text
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0 && (u.startsWith("http") || u.startsWith("/")));
  };

  const addUrls = useCallback(() => {
    const urls = parseUrls(urlText);
    if (urls.length === 0) return;

    const newItems: BulkItem[] = urls.map((url, i) => ({
      id: `bulk_${Date.now()}_${i}`,
      url,
      status: "queued",
    }));

    setItems((prev) => [...prev, ...newItems]);
    setUrlText("");
  }, [urlText]);

  const loadPreset = (urls: string[]) => {
    const newItems: BulkItem[] = urls.map((url, i) => ({
      id: `preset_${Date.now()}_${i}`,
      url,
      status: "queued",
    }));
    setItems(newItems);
    setUrlText("");
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    if (!isRunning) {
      setItems([]);
    }
  };

  const evaluateOne = async (item: BulkItem): Promise<ServerEvaluation> => {
    // Submit evaluation
    const response = await submitEvaluation({ target_url: item.url, level: 2 });
    const evalId = response.evaluation_id;

    setItems((prev) =>
      prev.map((it) =>
        it.id === item.id
          ? { ...it, status: "running" as const, evaluationId: evalId, currentStep: "Submitting..." }
          : it
      )
    );

    // Poll until complete — progressive backoff to reduce load
    const maxWait = 300_000; // 5 min timeout (LLM judges can be slow)
    const start = Date.now();

    while (Date.now() - start < maxWait) {
      if (abortRef.current) throw new Error("Aborted");
      const elapsed = Date.now() - start;
      const delay = elapsed < 30_000 ? 2000 : elapsed < 120_000 ? 4000 : 8000;
      await new Promise((r) => setTimeout(r, delay));

      const status = await getEvaluationStatus(evalId);

      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? {
                ...it,
                progressPct: status.progress_pct,
                currentStep: pctToStepLabel(status.progress_pct),
              }
            : it
        )
      );

      if (status.status === "completed") {
        return transformEvalStatus(status);
      }
      if (status.status === "failed") {
        throw new Error(status.error || "Evaluation failed");
      }
    }

    throw new Error(`Evaluation timed out after 5 min (eval ID: ${evalId})`);
  };

  const runBulk = useCallback(async () => {
    abortRef.current = false;
    setIsRunning(true);

    const queued = items.filter((i) => i.status === "queued");
    const chunks: BulkItem[][] = [];
    for (let i = 0; i < queued.length; i += concurrency) {
      chunks.push(queued.slice(i, i + concurrency));
    }

    for (const chunk of chunks) {
      if (abortRef.current) break;

      await Promise.all(
        chunk.map(async (item) => {
          try {
            const result = await evaluateOne(item);
            setItems((prev) =>
              prev.map((it) =>
                it.id === item.id
                  ? { ...it, status: "completed" as const, result, currentStep: undefined }
                  : it
              )
            );
          } catch (err) {
            const msg = err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Failed";
            setItems((prev) =>
              prev.map((it) =>
                it.id === item.id
                  ? {
                      ...it,
                      status: "error" as const,
                      error: msg,
                      currentStep: undefined,
                    }
                  : it
              )
            );
          }
        })
      );
    }

    setIsRunning(false);
  }, [items, concurrency]);

  const stopBulk = () => {
    abortRef.current = true;
  };

  const exportResults = () => {
    const completed = items.filter((i) => i.status === "completed" && i.result);
    const csv = [
      "Name,URL,Score,Tier,Confidence,Tools,Accuracy,Safety,Reliability,Latency,Process,Schema",
      ...completed.map((i) => {
        const r = i.result!;
        const d = r.dimensions;
        return `"${r.name}","${r.url}",${r.score},${r.tier},${r.confidence},${r.tools_count},${d.accuracy},${d.safety},${d.reliability},${d.latency},${d.process_quality},${d.schema_quality}`;
      }),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quality-oracle-bulk-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stats
  const completedItems = items.filter((i) => i.status === "completed" && i.result);
  const avgScore =
    completedItems.length > 0
      ? Math.round(
          completedItems.reduce((s, i) => s + i.result!.score, 0) /
            completedItems.length
        )
      : 0;
  const passCount = completedItems.filter((i) => i.result!.score >= 50).length;
  const expertCount = completedItems.filter(
    (i) => i.result!.tier === "expert"
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Bulk <span className="text-[#00f0ff]">Evaluation</span>
        </h1>
        <p className="text-muted-foreground">
          Evaluate multiple MCP servers in parallel. Paste URLs, upload a list,
          or use a preset.
        </p>
      </div>

      {/* URL Input */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-3">
            <textarea
              placeholder="Paste MCP server URLs (one per line or comma-separated)&#10;https://mcp.example.com/mcp&#10;https://another-server.com/sse"
              value={urlText}
              onChange={(e) => setUrlText(e.target.value)}
              className="flex-1 min-h-[100px] rounded-lg border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono resize-y focus:outline-none focus:border-primary placeholder:text-muted-foreground/50"
              disabled={isRunning}
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={addUrls}
                disabled={isRunning || !urlText.trim()}
                className="bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 hover:bg-[#00f0ff]/20"
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isRunning}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = ".txt,.csv";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setUrlText(ev.target?.result as string);
                      };
                      reader.readAsText(file);
                    }
                  };
                  input.click();
                }}
              >
                <Upload className="h-4 w-4 mr-1" /> File
              </Button>
            </div>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground py-1">
              Presets:
            </span>
            {PRESET_LISTS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => loadPreset(preset.urls)}
                disabled={isRunning}
                className="text-xs text-primary/70 hover:text-primary underline-offset-2 hover:underline transition-colors disabled:opacity-40"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Queue Controls */}
      {items.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <ListPlus className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono">
              {items.length} server{items.length !== 1 ? "s" : ""}
            </span>
            <span className="text-muted-foreground">
              ({completedItems.length} done,{" "}
              {items.filter((i) => i.status === "running").length} running,{" "}
              {items.filter((i) => i.status === "queued").length} queued)
            </span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <label>Concurrency:</label>
            <select
              value={concurrency}
              onChange={(e) => setConcurrency(Number(e.target.value))}
              disabled={isRunning}
              className="bg-card border border-border/50 rounded px-2 py-1 text-xs"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={5}>5</option>
            </select>
          </div>

          {!isRunning ? (
            <>
              <Button
                onClick={runBulk}
                disabled={items.filter((i) => i.status === "queued").length === 0}
                className="bg-gradient-to-r from-[#00f0ff] to-[#a855f7] text-black font-semibold hover:opacity-90"
              >
                <Play className="h-4 w-4 mr-1" /> Run All
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                <Trash2 className="h-3 w-3 mr-1" /> Clear
              </Button>
            </>
          ) : (
            <Button variant="destructive" size="sm" onClick={stopBulk}>
              Stop
            </Button>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {completedItems.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-[#00f0ff]" />
                <span className="text-xs text-muted-foreground">Avg Score</span>
              </div>
              <div
                className="text-2xl font-bold font-mono"
                style={{
                  color:
                    avgScore >= 85
                      ? "#10b981"
                      : avgScore >= 70
                      ? "#3b82f6"
                      : avgScore >= 50
                      ? "#f59e0b"
                      : "#ef4444",
                }}
              >
                {avgScore}/100
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-[#a855f7]" />
                <span className="text-xs text-muted-foreground">Pass Rate</span>
              </div>
              <div className="text-2xl font-bold font-mono text-[#a855f7]">
                {completedItems.length > 0
                  ? Math.round((passCount / completedItems.length) * 100)
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-[#f59e0b]" />
                <span className="text-xs text-muted-foreground">Expert Tier</span>
              </div>
              <div className="text-2xl font-bold font-mono text-[#f59e0b]">
                {expertCount}/{completedItems.length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Download className="h-4 w-4 text-[#10b981]" />
                <span className="text-xs text-muted-foreground">Export</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={exportResults}
                className="mt-1"
              >
                <Download className="h-3 w-3 mr-1" /> CSV
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Queue / Results Grid */}
      {items.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className={`border-border/50 bg-card/50 backdrop-blur-sm transition-all ${
                item.status === "completed"
                  ? "border-[#10b981]/20"
                  : item.status === "running"
                  ? "border-[#00f0ff]/20 glow-cyan"
                  : item.status === "error"
                  ? "border-[#ef4444]/20"
                  : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <StatusIcon status={item.status} />
                    <div className="min-w-0">
                      {item.result ? (
                        <div className="font-medium text-sm truncate">
                          {item.result.name}
                        </div>
                      ) : (
                        <div className="font-medium text-sm truncate">
                          {(() => {
                            try {
                              return new URL(item.url).hostname;
                            } catch {
                              return item.url;
                            }
                          })()}
                        </div>
                      )}
                      <div className="text-[10px] text-muted-foreground truncate">
                        {item.url}
                      </div>
                    </div>
                  </div>

                  {item.status === "queued" && !isRunning && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground/40 hover:text-[#ef4444] transition-colors shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {item.result && (
                    <ScoreGauge
                      score={item.result.score}
                      tier={item.result.tier}
                      size={48}
                      strokeWidth={3}
                      showLabel={false}
                    />
                  )}
                </div>

                {/* Progress */}
                {item.status === "running" && (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#00f0ff]">
                        {item.currentStep || "Starting..."}
                      </span>
                      <span className="text-muted-foreground font-mono">
                        {item.progressPct || 0}%
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-muted/30 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#00f0ff] transition-all duration-300"
                        style={{
                          width: `${item.progressPct || 0}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Completed Result */}
                {item.result && item.status === "completed" && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <TierBadge tier={item.result.tier} />
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Wrench className="h-3 w-3" />{" "}
                        {item.result.tools_count} tools
                        {item.result.duration_ms > 0 && (
                          <>
                            <Clock className="h-3 w-3 ml-1" />{" "}
                            {(item.result.duration_ms / 1000).toFixed(1)}s
                          </>
                        )}
                      </span>
                    </div>

                    {/* Mini dimension bars */}
                    <div className="flex gap-0.5">
                      {(
                        Object.entries(item.result.dimensions) as [
                          string,
                          number
                        ][]
                      ).map(([key, val]) => (
                        <div
                          key={key}
                          className="flex-1 h-1 rounded-full bg-muted/20 overflow-hidden"
                          title={`${key}: ${val}`}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${val}%`,
                              backgroundColor:
                                TIER_CONFIG[item.result!.tier].color,
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    <Link
                      href={`/evaluate?result=${item.result.id}`}
                      className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                    >
                      View Details{" "}
                      <ExternalLink className="h-2.5 w-2.5" />
                    </Link>
                  </div>
                )}

                {/* Error */}
                {item.status === "error" && (
                  <div className="mt-2 text-xs text-[#ef4444]">
                    {item.error || "Evaluation failed"}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm border-dashed">
          <CardContent className="p-12 text-center">
            <ListPlus className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              Add MCP server URLs to start bulk evaluation
            </p>
            <div className="flex justify-center gap-2">
              {PRESET_LISTS.slice(0, 2).map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  onClick={() => loadPreset(preset.urls)}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
