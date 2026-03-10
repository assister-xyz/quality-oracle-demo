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
import { TrustLevelBadge } from "@/components/trust-level-badge";
import { TrustCertificate } from "@/components/trust-certificate";
import { DimensionBars } from "@/components/dimension-bar";
import { QualityRadarChart } from "@/components/radar-chart";
import {
  type ServerEvaluation,
  type EvalStep,
  type TrustLevel,
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

// Map backend progress_pct to our evaluation steps
// Adversarial probes (step 4) span 60-75%, sub-steps animate within that range
function progressToSteps(pct: number): EvalStep[] {
  const steps = getEvalSteps();
  const thresholds = [10, 30, 40, 60, 75, 85, 95, 100];

  return steps.map((step, i) => {
    const parentStatus = pct >= thresholds[i]
      ? "done" as const
      : i === 0 && pct < thresholds[0]
        ? (pct > 0 ? "running" as const : "pending" as const)
        : i > 0 && pct >= thresholds[i - 1] && pct < thresholds[i]
          ? "running" as const
          : "pending" as const;

    // Animate adversarial sub-steps (step index 4, range 60-75%)
    if (step.children && i === 4) {
      const subStart = thresholds[i - 1]; // 60
      const subEnd = thresholds[i];       // 75
      const subRange = subEnd - subStart;  // 15
      const subCount = step.children.length;

      const children = step.children.map((child, ci) => {
        const childThreshold = subStart + (subRange / subCount) * (ci + 1);
        const childPrevThreshold = subStart + (subRange / subCount) * ci;
        if (pct >= childThreshold) {
          return { ...child, status: "done" as const };
        }
        if (pct >= childPrevThreshold && pct < childThreshold) {
          return { ...child, status: "running" as const };
        }
        return child;
      });

      return { ...step, status: parentStatus, children };
    }

    return { ...step, status: parentStatus };
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

function ElapsedTimer() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return (
    <span className="text-xs text-muted-foreground font-mono tabular-nums ml-auto">
      {mins > 0 ? `${mins}m ${secs.toString().padStart(2, "0")}s` : `${secs}s`}
    </span>
  );
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
  const [evalMode, setEvalMode] = useState<"verified" | "certified" | "audited">("certified");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [steps, setSteps] = useState<EvalStep[]>([]);
  const [result, setResult] = useState<ServerEvaluation | null>(null);
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
      const response = await submitEvaluation({ target_url: url.trim(), level: 2, eval_mode: evalMode });
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
  }, [url, evalMode]);

  const badgeBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002";
  const badgeSvgUrl = result ? `${badgeBaseUrl}/v1/badge/${encodeURIComponent(result.url)}.svg` : "";
  const badgeMarkdown = result ? `![AgentTrust Quality](${badgeSvgUrl})` : "";
  const badgeHtml = result ? `<a href="${badgeBaseUrl}/v1/score/${encodeURIComponent(result.url)}"><img src="${badgeSvgUrl}" alt="AgentTrust Quality Score" /></a>` : "";

  const [copiedField, setCopiedField] = useState<"markdown" | "html" | null>(null);

  const handleCopy = (text: string, field: "markdown" | "html") => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
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
      <Card className="bg-white shadow-sm border-[#E9EAEB]">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="https://mcp.example.com/sse or /mcp"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && startEvaluation()}
                className="pl-9 h-12 text-base border-[#E9EAEB] focus:border-[#181D27]"
                disabled={isEvaluating}
              />
            </div>
            <Button
              onClick={startEvaluation}
              disabled={isEvaluating || !url.trim()}
              className="h-12 px-6 bg-[#181D27] text-white font-semibold hover:bg-[#6941C6]"
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

          {/* Eval mode selector — SSL-style trust levels, unified Assisterr brand */}
          <div className="mt-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Trust Level</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                {
                  mode: "verified" as const,
                  icon: Shield,
                  label: "Verified",
                  analogy: "Domain Validated (DV)",
                  desc: "~30s \u00b7 spot check \u00b7 1 judge",
                },
                {
                  mode: "certified" as const,
                  icon: ShieldCheck,
                  label: "Certified",
                  analogy: "Org Validated (OV)",
                  desc: "~90s \u00b7 full suite \u00b7 safety probes",
                },
                {
                  mode: "audited" as const,
                  icon: ShieldAlert,
                  label: "Audited",
                  analogy: "Extended Validation (EV)",
                  desc: "~3min \u00b7 full audit \u00b7 2-3 judges",
                },
              ]).map(({ mode, icon: Icon, label, analogy, desc }) => {
                const isActive = evalMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => setEvalMode(mode)}
                    disabled={isEvaluating}
                    className={`relative rounded-lg p-3 text-left transition-all disabled:opacity-50 cursor-pointer border-[1.5px] ${
                      isActive
                        ? "bg-[#F66824]/[0.07] border-[#F66824]"
                        : "bg-muted/30 border-[#E9EAEB] hover:border-[#F66824]/40"
                    }`}
                    style={isActive ? { boxShadow: "0 0 0 1px rgba(246,104,36,0.2)" } : undefined}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-4.5 w-4.5 ${isActive ? "text-[#F66824]" : "text-[#181D27]/60"}`} />
                      <span className={`text-sm font-semibold ${isActive ? "text-[#181D27]" : "text-[#181D27]/70"}`}>{label}</span>
                    </div>
                    <p className={`text-[10px] font-medium ${isActive ? "text-[#F66824]" : "text-muted-foreground"}`}>{analogy}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
                    {isActive && (
                      <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#F66824]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick examples */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs text-muted-foreground">Try:</span>
            {EXAMPLE_URLS.map((ex) => (
              <button
                key={ex.name}
                onClick={() => setUrl(ex.url)}
                className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
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
        <Card className="bg-white shadow-sm border-[#E9EAEB]">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      )}

      {/* Evaluation Progress */}
      {steps.length > 0 && !result && !error && (
        <Card className="bg-white shadow-sm border-[#E9EAEB]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#F66824]" />
              Evaluation in Progress
              <TrustLevelBadge level={evalMode} />
              {isEvaluating && <ElapsedTimer />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {steps.map((step, i) => (
                <div key={i}>
                  <div
                    className={`flex items-center gap-3 text-sm transition-opacity ${
                      step.status === "pending" ? "opacity-40" : "opacity-100"
                    }`}
                  >
                    <StepIcon status={step.status} />
                    <span className={step.status === "running" ? "text-[#F66824] font-medium" : ""}>{step.name}</span>
                  </div>
                  {/* Adversarial sub-steps */}
                  {step.children && (step.status === "running" || step.status === "done") && (
                    <div className="ml-7 mt-1.5 mb-1 space-y-1.5 border-l-2 border-border/40 pl-3">
                      {step.children.map((child, ci) => (
                        <div
                          key={ci}
                          className={`flex items-center gap-2 text-xs transition-opacity ${
                            child.status === "pending" ? "opacity-30" : "opacity-100"
                          }`}
                        >
                          <StepIcon status={child.status} />
                          <span className={child.status === "running" ? "text-[#F66824]" : "text-muted-foreground"}>
                            {child.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
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
          <Card className="bg-white shadow-sm border-[#E9EAEB]">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-foreground">{result.name}</h2>
                    <TierBadge tier={result.tier} />
                    {result.trust_level && <TrustLevelBadge level={result.trust_level} />}
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
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      <ExternalLink className="h-3 w-3" /> {result.url}
                    </a>
                  </div>
                </div>
                <ScoreGauge score={result.score} tier={result.tier} size={100} strokeWidth={8} />
              </div>
            </CardContent>
          </Card>

          {/* Trust Certificate */}
          {result.trust_level && (
            <TrustCertificate
              level={result.trust_level}
              score={result.score}
              tier={result.tier}
              serverName={result.name}
              evaluatedAt={result.evaluated_at}
            />
          )}

          {/* 6-Axis Radar + Dimension Bars */}
          {(result.dimensions.accuracy > 0 || result.dimensions.safety > 0) && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm border-[#E9EAEB]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">6-Axis Quality Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <QualityRadarChart dimensions={result.dimensions} />
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-[#E9EAEB]">
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
              <Card className="bg-white shadow-sm border-[#E9EAEB]">
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
              <Card className="bg-white shadow-sm border-[#E9EAEB]">
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
            <Card className="bg-white shadow-sm border-[#E9EAEB]">
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
          <Card className="bg-white shadow-sm border-[#E9EAEB]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Badge & Attestation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Live badge preview */}
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={badgeSvgUrl}
                    alt="AgentTrust Quality Badge"
                    className="h-5"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Live quality badge — embed in your README or docs</p>
              </div>

              {/* Embed snippets */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-muted-foreground">Markdown</p>
                  <div className="flex items-center gap-2">
                    <code className="text-[10px] font-mono bg-muted/50 px-2.5 py-1.5 rounded border border-border/50 flex-1 truncate">
                      {badgeMarkdown}
                    </code>
                    <Button variant="outline" size="sm" onClick={() => handleCopy(badgeMarkdown, "markdown")} className="shrink-0 h-7 w-7 p-0">
                      {copiedField === "markdown" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-muted-foreground">HTML</p>
                  <div className="flex items-center gap-2">
                    <code className="text-[10px] font-mono bg-muted/50 px-2.5 py-1.5 rounded border border-border/50 flex-1 truncate">
                      {badgeHtml}
                    </code>
                    <Button variant="outline" size="sm" onClick={() => handleCopy(badgeHtml, "html")} className="shrink-0 h-7 w-7 p-0">
                      {copiedField === "html" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Attestation */}
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-1.5">Attestation (AQVC v1.0, Ed25519):</p>
                <Badge variant="outline" className="text-[10px] font-mono">
                  JWT: eyJhbGciOiJFZERTQSJ9...
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
