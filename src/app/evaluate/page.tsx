"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreGauge } from "@/components/score-gauge";
import { TierBadge } from "@/components/tier-badge";
import { DimensionBars } from "@/components/dimension-bar";
import { QualityRadarChart } from "@/components/radar-chart";
import {
  type ServerEvaluation,
  type EvalStep,
  getEvalSteps,
} from "@/lib/mock-data";
import { submitEvaluation, getEvaluationStatus, ApiError } from "@/lib/api";
import { transformEvalStatus } from "@/lib/transform";
import {
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Circle,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Wrench,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

const EXAMPLE_URLS = [
  { name: "GitMCP", url: "https://gitmcp.io/anthropics/anthropic-cookbook" },
  { name: "Cloudflare", url: "https://docs.mcp.cloudflare.com/sse" },
  { name: "TweetSave", url: "https://mcp.tweetsave.org/sse" },
  { name: "HuggingFace", url: "https://huggingface.co/mcp" },
  { name: "DeepWiki", url: "https://mcp.deepwiki.com/mcp" },
  { name: "Manifold", url: "https://api.manifold.markets/v0/mcp" },
  { name: "Ferryhopper", url: "https://mcp.ferryhopper.com/mcp" },
  { name: "Context7", url: "https://mcp.context7.com/mcp" },
];

// Map backend progress_pct to our 8 evaluation steps
function progressToSteps(pct: number): EvalStep[] {
  const steps = getEvalSteps();
  const thresholds = [10, 30, 40, 60, 75, 85, 95, 100];

  return steps.map((step, i) => {
    if (pct >= thresholds[i]) {
      return { ...step, status: "done" as const };
    }
    if (i === 0 && pct < thresholds[0]) {
      return { ...step, status: pct > 0 ? "running" as const : "pending" as const };
    }
    if (i > 0 && pct >= thresholds[i - 1] && pct < thresholds[i]) {
      return { ...step, status: "running" as const };
    }
    return step;
  });
}

function StepIcon({ status }: { status: EvalStep["status"] }) {
  switch (status) {
    case "done":
      return <CheckCircle2 className="h-4 w-4 text-[#10b981]" />;
    case "running":
      return <Loader2 className="h-4 w-4 text-[#F66824] animate-spin" />;
    case "error":
      return <XCircle className="h-4 w-4 text-[#ef4444]" />;
    default:
      return <Circle className="h-4 w-4 text-muted-foreground/30" />;
  }
}

function ProbeIcon({ passed }: { passed: boolean }) {
  return passed ? (
    <ShieldCheck className="h-4 w-4 text-[#10b981]" />
  ) : (
    <ShieldAlert className="h-4 w-4 text-[#ef4444]" />
  );
}

const PROBE_LABELS: Record<string, string> = {
  prompt_injection: "Prompt Injection",
  system_prompt_extraction: "System Prompt Extraction",
  pii_leakage: "PII Leakage",
  hallucination: "Hallucination",
  overflow: "Boundary Overflow",
};

export default function EvaluatePage() {
  return (
    <Suspense>
      <EvaluateContent />
    </Suspense>
  );
}

function EvaluateContent() {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [steps, setSteps] = useState<EvalStep[]>([]);
  const [result, setResult] = useState<ServerEvaluation | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluationId, setEvaluationId] = useState<string | null>(null);
  const [loadingResult, setLoadingResult] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  // Load result from URL param (?result=), reconnect from ?eval=, or recover from sessionStorage
  useEffect(() => {
    // Skip if already evaluating (prevents reconnect banner flash during active eval)
    if (isEvaluating || evaluationId) return;

    const resultId = searchParams.get("result");
    const evalId = searchParams.get("eval") || sessionStorage.getItem("qo_eval_id");

    if (resultId) {
      setLoadingResult(true);
      getEvaluationStatus(resultId)
        .then((data) => {
          if (data.status === "completed") {
            const transformed = transformEvalStatus(data);
            setResult(transformed);
            setUrl(transformed.url);
          }
        })
        .catch((err) => {
          setError(err instanceof ApiError ? err.message : "Failed to load evaluation");
        })
        .finally(() => setLoadingResult(false));
    } else if (evalId) {
      // Reconnect to an in-progress evaluation (from URL param or sessionStorage)
      setReconnecting(true);
      setUrl(sessionStorage.getItem("qo_eval_url") || "");
      getEvaluationStatus(evalId)
        .then((data) => {
          if (data.status === "running" || data.status === "pending") {
            setIsEvaluating(true);
            setSteps(progressToSteps(data.progress_pct));
            setEvaluationId(evalId); // arms polling
            window.history.replaceState(null, "", `/evaluate?eval=${evalId}`);
          } else if (data.status === "completed") {
            const transformed = transformEvalStatus(data);
            setResult(transformed);
            setUrl(transformed.url);
            window.history.replaceState(null, "", `/evaluate?result=${data.evaluation_id}`);
            sessionStorage.removeItem("qo_eval_url");
            sessionStorage.removeItem("qo_eval_id");
          } else if (data.status === "failed") {
            setError(data.error || "Evaluation failed");
            window.history.replaceState(null, "", "/evaluate");
            sessionStorage.removeItem("qo_eval_url");
            sessionStorage.removeItem("qo_eval_id");
          }
        })
        .catch((err) => {
          setError(err instanceof ApiError ? err.message : "Failed to reconnect to evaluation");
          window.history.replaceState(null, "", "/evaluate");
          sessionStorage.removeItem("qo_eval_url");
          sessionStorage.removeItem("qo_eval_id");
        })
        .finally(() => setReconnecting(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isEvaluating, evaluationId]);

  // Poll when we have an evaluationId
  useEffect(() => {
    if (!evaluationId) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const data = await getEvaluationStatus(evaluationId);
        if (cancelled) return;

        // Update steps based on progress
        setSteps(progressToSteps(data.progress_pct));

        if (data.status === "completed") {
          clearInterval(interval);
          const transformed = transformEvalStatus(data);
          setResult(transformed);
          setIsEvaluating(false);
          setEvaluationId(null);
          // Update URL for sharing
          window.history.replaceState(null, "", `/evaluate?result=${data.evaluation_id}`);
          sessionStorage.removeItem("qo_eval_url");
          sessionStorage.removeItem("qo_eval_id");
        } else if (data.status === "failed") {
          clearInterval(interval);
          setError(data.error || "Evaluation failed");
          setIsEvaluating(false);
          setEvaluationId(null);
          window.history.replaceState(null, "", "/evaluate");
          sessionStorage.removeItem("qo_eval_url");
          sessionStorage.removeItem("qo_eval_id");
          setSteps((prev) => {
            const next = [...prev];
            const runningIdx = next.findIndex((s) => s.status === "running");
            if (runningIdx >= 0) next[runningIdx] = { ...next[runningIdx], status: "error" };
            return next;
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Polling failed");
        }
      }
    };

    // Immediate first poll for faster feedback
    poll();
    const interval = setInterval(poll, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [evaluationId]);

  const startEvaluation = useCallback(async () => {
    if (!url.trim()) return;

    setIsEvaluating(true);
    setResult(null);
    setError(null);
    setSteps(getEvalSteps());

    try {
      const response = await submitEvaluation({ target_url: url.trim(), level: 2 });
      setEvaluationId(response.evaluation_id);
      // Persist to URL and sessionStorage for reconnection
      window.history.replaceState(null, "", `/evaluate?eval=${response.evaluation_id}`);
      sessionStorage.setItem("qo_eval_url", url.trim());
      sessionStorage.setItem("qo_eval_id", response.evaluation_id);
      // Set first step to running
      setSteps((prev) => {
        const next = [...prev];
        next[0] = { ...next[0], status: "running" };
        return next;
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit evaluation");
      setIsEvaluating(false);
      setSteps((prev) => {
        const next = [...prev];
        next[0] = { ...next[0], status: "error" };
        return next;
      });
    }
  }, [url]);

  const handleCopyBadge = () => {
    if (!result) return;
    navigator.clipboard.writeText(
      `![Quality Score](https://quality-oracle.assisterr.ai/v1/badge/${encodeURIComponent(result.url)}.svg)`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Evaluate <span className="brand-gradient-text">Agent Quality</span>
        </h1>
        <p className="text-muted-foreground">
          Paste any MCP server URL to run a comprehensive quality evaluation with multi-judge consensus.
        </p>
      </div>

      {/* URL Input */}
      <Card className="bg-white shadow-sm border-border/60">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="https://mcp.example.com/sse or /mcp"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && startEvaluation()}
                className="pl-9 h-12 text-base border-border focus:border-[#F66824]"
                disabled={isEvaluating}
              />
            </div>
            <Button
              onClick={startEvaluation}
              disabled={isEvaluating || !url.trim()}
              className="h-12 px-6 bg-gradient-to-r from-[#F66824] to-[#DB5F94] text-white font-semibold hover:from-[#F66824CC] hover:to-[#DB5F94CC]"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Evaluating...
                </>
              ) : (
                "Evaluate"
              )}
            </Button>
          </div>

          {/* In-progress banner */}
          {isEvaluating && (
            <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-md bg-[#F66824]/5 border border-[#F66824]/20">
              <Loader2 className="h-3 w-3 animate-spin text-[#F66824]" />
              <span className="text-xs text-[#F66824]">Evaluation in progress — scroll down to see progress</span>
            </div>
          )}

          {/* Quick examples */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs text-muted-foreground">Try:</span>
            {EXAMPLE_URLS.map((ex) => (
              <button
                key={ex.name}
                onClick={() => setUrl(ex.url)}
                className="text-xs text-[#F66824]/70 hover:text-[#F66824] underline-offset-2 hover:underline transition-colors"
                disabled={isEvaluating}
              >
                {ex.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Banner */}
      {error && (
        <Card className="border-[#ef4444]/30 bg-[#ef4444]/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[#ef4444] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#ef4444]">Evaluation Error</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setError(null);
                  setSteps([]);
                }}
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reconnecting banner */}
      {reconnecting && (
        <Card className="border-[#F66824]/30 bg-[#F66824]/5">
          <CardContent className="p-4 flex items-center gap-3">
            <RefreshCw className="h-4 w-4 text-[#F66824] animate-spin" />
            <span className="text-sm text-[#F66824]">Reconnecting to evaluation...</span>
          </CardContent>
        </Card>
      )}

      {/* Loading result from URL param */}
      {loadingResult && (
        <Card className="bg-white shadow-sm border-border/60">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      )}

      {/* Evaluation Progress */}
      {steps.length > 0 && !result && !error && (
        <Card className="bg-white shadow-sm border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#F66824]" />
              Evaluation in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 text-sm transition-opacity ${
                    step.status === "pending" ? "opacity-40" : "opacity-100"
                  }`}
                >
                  <StepIcon status={step.status} />
                  <span className={step.status === "running" ? "text-[#F66824] font-medium" : ""}>{step.name}</span>
                </div>
              ))}
            </div>
            {evaluationId && (
              <p className="mt-3 text-[10px] text-muted-foreground/50 font-mono">
                ID: {evaluationId}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fade-up">
          {/* Summary Header */}
          <Card className="bg-white shadow-sm border-border/60">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-foreground">{result.name}</h2>
                    <TierBadge tier={result.tier} />
                    <Badge variant="outline" className="text-xs">
                      {result.transport === "sse" ? "SSE" : "Streamable HTTP"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Wrench className="h-3 w-3" /> {result.tools_count} tools
                    </span>
                    {result.duration_ms > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {(result.duration_ms / 1000).toFixed(1)}s
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" /> Confidence: {(result.confidence * 100).toFixed(0)}%
                    </span>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener"
                      className="flex items-center gap-1 hover:text-[#F66824]"
                    >
                      <ExternalLink className="h-3 w-3" /> {result.url}
                    </a>
                  </div>
                </div>
                <ScoreGauge score={result.score} tier={result.tier} size={100} strokeWidth={8} />
              </div>
            </CardContent>
          </Card>

          {/* 6-Axis Radar + Dimension Bars */}
          {(result.dimensions.accuracy > 0 || result.dimensions.safety > 0) && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">6-Axis Quality Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <QualityRadarChart dimensions={result.dimensions} />
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Dimension Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <DimensionBars dimensions={result.dimensions} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tool Scores + Safety */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tool Scores */}
            {Object.keys(result.tool_scores).length > 0 && (
              <Card className="bg-white shadow-sm border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tool Scores ({Object.keys(result.tool_scores).length} tools)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(result.tool_scores).map(([tool, scores]) => (
                      <div key={tool} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <code className="text-xs font-mono bg-muted/50 px-1.5 py-0.5 rounded">{tool}</code>
                          <span className="font-mono tabular-nums text-xs">
                            {scores.tests_passed}/{scores.tests_total} passed
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#F66824] transition-all duration-700"
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

            {/* Safety Probes */}
            {result.safety_probes.length > 0 && (
              <Card className="bg-white shadow-sm border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Adversarial Safety Probes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.safety_probes.map((probe, idx) => (
                      <div
                        key={`${probe.probe_type}-${idx}`}
                        className="flex items-start gap-3 p-2 rounded-lg bg-muted/30"
                      >
                        <ProbeIcon passed={probe.passed} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {PROBE_LABELS[probe.probe_type]}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                probe.passed
                                  ? "text-[#10b981] border-[#10b981]/30"
                                  : "text-[#ef4444] border-[#ef4444]/30"
                              }`}
                            >
                              {probe.passed ? "PASS" : "FAIL"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{probe.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Judge Responses */}
          {result.judge_responses.length > 0 && (
            <Card className="bg-white shadow-sm border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Judge Consensus Responses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.judge_responses.map((jr, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono bg-muted/50 px-1.5 py-0.5 rounded">{jr.tool}</code>
                          <Badge variant="outline" className="text-[10px]">
                            {jr.method}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {jr.test_type}
                          </Badge>
                        </div>
                        <span className="text-sm font-bold font-mono" style={{
                          color: jr.score >= 85 ? "#10b981" : jr.score >= 70 ? "#3b82f6" : jr.score >= 50 ? "#f59e0b" : "#ef4444",
                        }}>
                          {jr.score}/100
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground italic">&ldquo;{jr.question}&rdquo;</p>
                      <p className="text-xs text-foreground/80">{jr.explanation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Badge & Attestation */}
          <Card className="bg-white shadow-sm border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Badge & Attestation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Embed this quality badge in your README:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-[11px] font-mono bg-muted/50 px-3 py-1.5 rounded border border-border/50 max-w-md truncate">
                      ![Quality Score](https://quality-oracle.assisterr.ai/v1/badge/{encodeURIComponent(result.url)}.svg)
                    </code>
                    <Button variant="outline" size="sm" onClick={handleCopyBadge} className="shrink-0">
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Attestation (UAQA v1.0, Ed25519):</p>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    JWT: eyJhbGciOiJFZERTQSJ9...
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
