const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
        ...options?.headers,
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      let detail = body;
      try {
        detail = JSON.parse(body).detail || body;
      } catch {}
      throw new ApiError(res.status, detail);
    }

    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

// ---------- Health ----------
export interface HealthResponse {
  status: string;
  version?: string;
  uptime_seconds?: number;
}

export function getHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/health");
}

// ---------- Evaluate ----------
export interface SubmitEvalRequest {
  target_url: string;
  target_type?: string;
  level?: number;
  domains?: string[];
}

export interface SubmitEvalResponse {
  evaluation_id: string;
  status: string;
  estimated_time_seconds: number;
  poll_url: string;
  message: string;
}

export function submitEvaluation(req: SubmitEvalRequest): Promise<SubmitEvalResponse> {
  return apiFetch<SubmitEvalResponse>("/v1/evaluate", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export interface EvaluationStatusResponse {
  evaluation_id: string;
  status: "pending" | "running" | "completed" | "failed";
  progress_pct: number;
  score: number | null;
  tier: string | null;
  evaluation_version: string | null;
  report: {
    level1?: {
      manifest_score: number;
      checks: Record<string, boolean>;
      issues: string[];
      tools_count?: number;
    };
    level2?: {
      tools_tested: number;
      tools_passed: number;
      tools_failed: number;
      avg_latency_ms: number;
      tool_details: {
        tool_name: string;
        score: number;
        tests_passed: number;
        tests_total: number;
        avg_latency_ms: number;
        responses: Record<string, unknown>[];
      }[];
      judge_responses: {
        tool_name?: string;
        question?: string;
        score?: number;
        explanation?: string;
        method?: string;
        test_type?: string;
      }[];
    };
    level3?: {
      domain_scores: Record<string, number>;
      questions_asked: number;
      judge_responses: unknown[];
    };
  } | null;
  result: {
    target_id: string;
    target_type: string;
    score: number;
    tier: string;
    confidence: number;
    domains: string[];
    tool_scores: Record<string, { score: number; tests_passed: number; tests_total: number }>;
    evaluation_count: number;
    evaluation_version: string | null;
  } | null;
  scores: {
    overall_score?: number;
    tier?: string;
    functional_score?: number;
    manifest_score?: number;
    confidence?: number;
    dimensions?: Record<string, number>;
    tool_scores?: Record<string, { score: number; tests_passed?: number; tests_total?: number; questions_asked?: number }>;
    safety_report?: { overall_safety_score?: number; probes?: unknown[] };
    process_quality_report?: Record<string, unknown>;
    latency_stats?: { avg_ms?: number; p50_ms?: number; p95_ms?: number };
    questions_asked?: number;
  } | null;
  attestation_jwt: string | null;
  badge_url: string | null;
  error: string | null;
  duration_ms: number | null;
}

export function getEvaluationStatus(evaluationId: string): Promise<EvaluationStatusResponse> {
  return apiFetch<EvaluationStatusResponse>(`/v1/evaluate/${evaluationId}`);
}

// ---------- Scores ----------
export interface ScoresListParams {
  limit?: number;
  offset?: number;
  sort?: "score" | "name" | "date";
  min_score?: number;
  tier?: string;
}

export interface ScoresListItem {
  target_id: string;
  target_type: string;
  score: number;
  tier: string;
  confidence: number;
  evaluation_count: number;
  last_evaluated_at: string | null;
  last_evaluation_id: string | null;
  dimensions: Record<string, number>;
  tool_scores: Record<string, { score: number; tests_passed: number; tests_total: number }>;
  safety_report: unknown[];
  latency_stats?: { avg_ms?: number; p50_ms?: number; p95_ms?: number; p99_ms?: number };
  duration_ms?: number | null;
}

export interface ScoresListResponse {
  items: ScoresListItem[];
  total: number;
  limit: number;
  offset: number;
}

export function listScores(params?: ScoresListParams): Promise<ScoresListResponse> {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.offset) qs.set("offset", String(params.offset));
  if (params?.sort) qs.set("sort", params.sort);
  if (params?.min_score) qs.set("min_score", String(params.min_score));
  if (params?.tier) qs.set("tier", params.tier);
  const query = qs.toString();
  return apiFetch<ScoresListResponse>(`/v1/scores${query ? `?${query}` : ""}`);
}

export function getScore(targetId: string) {
  return apiFetch<{
    target_id: string;
    target_type: string;
    score: number;
    tier: string;
    confidence: number;
    tool_scores: Record<string, { score: number; tests_passed: number; tests_total: number }>;
    evaluation_count: number;
    evaluation_version: string | null;
    last_evaluated_at: string | null;
  }>(`/v1/score/${encodeURIComponent(targetId)}`);
}

export interface ScoreHistoryItem {
  target_id: string;
  evaluation_id: string;
  score: number;
  tier: string;
  confidence: number;
  recorded_at: string;
  delta_from_previous: number | null;
}

export function getScoreHistory(targetId: string): Promise<{ items: ScoreHistoryItem[] }> {
  return apiFetch<{ items: ScoreHistoryItem[] }>(`/v1/score/${encodeURIComponent(targetId)}/history`);
}
