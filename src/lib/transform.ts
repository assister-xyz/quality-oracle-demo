import type {
  EvaluationStatusResponse,
  ScoresListItem,
} from "./api";
import type {
  ServerEvaluation,
  Dimensions,
  ToolScore,
  JudgeResponse,
  SafetyProbe,
  QualityTier,
  Transport,
  TargetType,
} from "./mock-data";

function inferName(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    // Remove common prefixes/suffixes
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

function inferTransport(url: string): Transport {
  if (url.endsWith("/sse") || url.includes("/sse")) return "sse";
  return "streamable_http";
}

function getTier(score: number): QualityTier {
  if (score >= 85) return "expert";
  if (score >= 70) return "proficient";
  if (score >= 50) return "basic";
  return "failed";
}

const DEFAULT_DIMENSIONS: Dimensions = {
  accuracy: 0,
  safety: 0,
  process_quality: 0,
  reliability: 0,
  latency: 0,
  schema_quality: 0,
};

function parseDimensions(raw: Record<string, number> | undefined): Dimensions {
  if (!raw) return DEFAULT_DIMENSIONS;
  return {
    accuracy: raw.accuracy ?? 0,
    safety: raw.safety ?? 0,
    process_quality: raw.process_quality ?? 0,
    reliability: raw.reliability ?? 0,
    latency: raw.latency ?? 0,
    schema_quality: raw.schema_quality ?? 0,
  };
}

function parseToolScores(
  raw: Record<string, { score: number; tests_passed: number; tests_total: number }> | undefined
): Record<string, ToolScore> {
  if (!raw) return {};
  const result: Record<string, ToolScore> = {};
  for (const [name, data] of Object.entries(raw)) {
    result[name] = {
      score: data.score ?? 0,
      tests_passed: data.tests_passed ?? 0,
      tests_total: data.tests_total ?? 0,
    };
  }
  return result;
}

function parseJudgeResponses(
  raw: EvaluationStatusResponse["report"]
): JudgeResponse[] {
  if (!raw?.level2?.judge_responses) return [];
  return raw.level2.judge_responses.map((jr) => ({
    tool: jr.tool_name || "",
    question: jr.question || "",
    score: jr.score ?? 0,
    explanation: jr.explanation || "",
    method: (jr.method as JudgeResponse["method"]) || "llm",
    test_type: jr.test_type || "happy_path",
  }));
}

function parseSafetyProbes(
  raw: unknown[] | undefined
): SafetyProbe[] {
  if (!raw || !Array.isArray(raw)) return [];

  // Parse all raw probes
  const allProbes = raw.map((probe: unknown) => {
    const p = probe as Record<string, unknown>;
    return {
      probe_type: (p.probe_type as SafetyProbe["probe_type"]) || "prompt_injection",
      passed: Boolean(p.passed),
      score: (p.score as number) ?? 0,
      explanation: (p.explanation as string) || "",
    };
  });

  // Aggregate by probe_type: worst-case pass, average score
  const grouped = new Map<string, SafetyProbe[]>();
  for (const probe of allProbes) {
    const existing = grouped.get(probe.probe_type) || [];
    existing.push(probe);
    grouped.set(probe.probe_type, existing);
  }

  return Array.from(grouped.entries()).map(([probeType, probes]) => {
    const passed = probes.every((p) => p.passed);
    const avgScore = Math.round(probes.reduce((s, p) => s + p.score, 0) / probes.length);
    const passedCount = probes.filter((p) => p.passed).length;
    const summary = probes.length > 1
      ? `${passedCount}/${probes.length} tools passed`
      : probes[0].explanation;
    return {
      probe_type: probeType as SafetyProbe["probe_type"],
      passed,
      score: avgScore,
      explanation: summary,
    };
  });
}

/**
 * Transform a full EvaluationStatusResponse into frontend ServerEvaluation.
 */
export function transformEvalStatus(
  data: EvaluationStatusResponse
): ServerEvaluation {
  const targetId = data.result?.target_id || "";
  const score = data.score ?? data.result?.score ?? 0;
  const tier = (data.tier ?? data.result?.tier ?? getTier(score)) as QualityTier;
  const scores = data.scores;
  const toolScores = parseToolScores(
    (scores?.tool_scores ?? data.result?.tool_scores) as Record<string, { score: number; tests_passed: number; tests_total: number }> | undefined
  );
  const report = data.report;
  const dimensions = parseDimensions(scores?.dimensions);
  const safetyProbes = parseSafetyProbes(
    (scores?.safety_report?.probes ?? (scores?.safety_report as Record<string, unknown>)?.results) as unknown[] | undefined
  );
  const judgeResponses = parseJudgeResponses(report);

  return {
    id: data.evaluation_id,
    name: inferName(targetId),
    url: targetId,
    transport: inferTransport(targetId),
    target_type: (data.result?.target_type as TargetType) || "mcp_server",
    status: data.status,
    score,
    tier,
    confidence: scores?.confidence ?? data.result?.confidence ?? 0,
    tools_count: Object.keys(toolScores).length || report?.level2?.tools_tested || report?.level1?.tools_count || 0,
    questions_asked: scores?.questions_asked ?? 0,
    duration_ms: data.duration_ms ?? 0,
    manifest_score: scores?.manifest_score ?? report?.level1?.manifest_score ?? 0,
    dimensions,
    tool_scores: toolScores,
    judge_responses: judgeResponses,
    safety_probes: safetyProbes,
    evaluated_at: new Date().toISOString(),
    evaluation_version: data.evaluation_version || "v1.0",
  };
}

/**
 * Transform a scores list item (from GET /v1/scores) into a partial ServerEvaluation
 * suitable for tables and list views.
 */
export function transformScoreItem(item: ScoresListItem): ServerEvaluation {
  const score = item.score ?? 0;
  const tier = (item.tier ?? getTier(score)) as QualityTier;
  const toolScores = parseToolScores(item.tool_scores);
  const dimensions = parseDimensions(item.dimensions);

  const toolCount = Object.keys(toolScores).length;
  const durationMs = item.duration_ms ?? 0;

  return {
    id: item.last_evaluation_id || item.target_id,
    name: inferName(item.target_id),
    url: item.target_id,
    transport: inferTransport(item.target_id),
    target_type: (item.target_type as TargetType) || "mcp_server",
    status: "completed",
    score,
    tier,
    confidence: item.confidence ?? 0,
    tools_count: toolCount,
    questions_asked: 0,
    duration_ms: durationMs,
    manifest_score: 0,
    dimensions,
    tool_scores: toolScores,
    judge_responses: [],
    safety_probes: parseSafetyProbes(item.safety_report),
    evaluated_at: item.last_evaluated_at || new Date().toISOString(),
    evaluation_version: "v1.0",
  };
}
