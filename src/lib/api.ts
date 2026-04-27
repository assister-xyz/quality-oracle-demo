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
  eval_mode?: "verified" | "certified" | "audited";
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

// QO-060: Submit a Claude Skill via drag-drop (frontmatter + body) instead
// of a URL. Backend persists the skill bundle and returns a regular
// evaluation_id to poll.
export interface SubmitSkillRequest {
  frontmatter: Record<string, unknown>;
  body: string;
  source: "drag" | "github";
  /** Optional original filename for traceability. */
  filename?: string;
  level?: number;
  eval_mode?: "verified" | "certified" | "audited";
}

export function submitSkillEvaluation(
  req: SubmitSkillRequest,
): Promise<SubmitEvalResponse> {
  return apiFetch<SubmitEvalResponse>("/v1/evaluate/skill", {
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
  eval_mode: string | null;
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
    // QO-045: Agent Trap Coverage (DeepMind taxonomy)
    agent_trap_coverage?: AgentTrapCoverage;
    // QO-017: Token & cost tracking
    token_usage?: TokenUsage;
    cost_usd?: number;
    shadow_cost_usd?: number;
    // QO-051: CPCR block
    cpcr?: CPCRScores;
    // QO-029: Code integrity
    manifest_hash?: string;
    detected_domain?: string;
    // QO-044: Anti-gaming signals
    gaming_risk?: "none" | "low" | "medium" | "high";
  } | null;
  // QO-043: Score anomaly detection
  score_anomaly?: ScoreAnomaly;
  // QO-044/046: Operator identity (when battle / verified flow used)
  operator_identity?: OperatorIdentity;
  attestation_jwt: string | null;
  badge_url: string | null;
  error: string | null;
  error_type: string | null;
  duration_ms: number | null;
}

// ── QO-045: Agent Trap Coverage (DeepMind taxonomy) ─────────────────────────

export interface AgentTrapCoverage {
  taxonomy_version: "deepmind_2026_v1";
  total_trap_types: number;
  total_testable: number;
  total_covered: number;
  total_passed: number | null;
  coverage_pct: number;
  categories: Record<string, TrapCategoryCoverage>;
}

export interface TrapCategoryCoverage {
  testable: number;
  covered: number;
  passed: number | null;
  coverage_pct: number;
  traps: Record<string, TrapInfo>;
}

export interface TrapInfo {
  status: "covered" | "new" | "deferred" | "n/a";
  description: string;
  probes: string[];
  passed: boolean | null;
}

// ── QO-043: Score Anomaly ───────────────────────────────────────────────────

export interface ScoreAnomaly {
  anomaly_type: "first_eval_extreme" | "z_score_deviation" | "unchanged_manifest_jump";
  severity: "low" | "medium" | "high";
  target_id: string;
  current_score: number;
  details: Record<string, unknown>;
  detected_at: string;
}

// ── QO-044/046: Operator Identity ───────────────────────────────────────────

export interface OperatorIdentity {
  operator_id: string;
  display_name: string;
  github_username?: string;
  github_avatar_url?: string;
  email?: string;
  verified: boolean;
  agent_count?: number;
}

// ── QO-017: Token Usage & Cost ──────────────────────────────────────────────

export interface TokenUsage {
  total_input_tokens: number;
  total_output_tokens: number;
  by_provider?: Record<string, { input: number; output: number; calls: number }>;
  by_phase?: Record<string, { input: number; output: number }>;
  optimization?: {
    llm_calls?: number;
    fuzzy_routed?: number;
    cache_hits?: number;
  };
}

// ── QO-051: Cost per Correct Response ───────────────────────────────────────

export interface CPCRScores {
  correct_threshold: number;
  correct_count: number;
  total_responses: number;
  // All three nullable — null means "not enough correct responses to measure".
  cpcr: number | null;
  weighted_cpcr: number | null;
  // shadow_cpcr is the canonical public value (uses market rates so free-tier
  // evals aren't artificially $0).
  shadow_cpcr: number | null;
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
  last_eval_mode?: string | null;
  // QO-051: CPCR for leaderboard Value sort
  cost_usd?: number | null;
  shadow_cost_usd?: number | null;
  cpcr?: CPCRScores | null;
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
    // QO-051
    cost_usd?: number | null;
    shadow_cost_usd?: number | null;
    cpcr?: CPCRScores | null;
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

// ---------- Battle Arena ----------
export interface BattleParticipant {
  target_id: string;
  target_url: string;
  name: string;
  overall_score: number;
  scores: Record<string, number>;
  rating_before?: { mu: number; sigma: number } | null;
  rating_after?: { mu: number; sigma: number } | null;
}

export interface BattleResult {
  battle_id: string;
  agent_a: BattleParticipant;
  agent_b: BattleParticipant;
  winner: "a" | "b" | null;
  margin: number;
  photo_finish: boolean;
  match_quality: number;
  status: "pending" | "running" | "completed" | "failed";
  duration_ms: number;
  created_at: string;
  error?: string | null;
}

export interface BattleListResponse {
  items: BattleResult[];
  total: number;
  page: number;
  limit: number;
}

export function createBattle(agentAUrl: string, agentBUrl: string, options?: { domain?: string; challenge_count?: number }): Promise<{ battle_id: string; status: string; poll_url: string }> {
  return apiFetch("/v1/battle", {
    method: "POST",
    body: JSON.stringify({ agent_a_url: agentAUrl, agent_b_url: agentBUrl, ...options }),
  });
}

export function getBattle(battleId: string): Promise<BattleResult> {
  return apiFetch<BattleResult>(`/v1/battle/${battleId}`);
}

export function listBattles(page = 1, limit = 20): Promise<BattleListResponse> {
  return apiFetch<BattleListResponse>(`/v1/battles?page=${page}&limit=${limit}`);
}

// ---------- Percentile & Share ----------
export interface PercentileResponse {
  target_id: string;
  score: number;
  percentile: number;
  rank: number;
  total_evaluated: number;
  tier: string;
  top_pct: number;
}

export function getPercentile(targetId: string): Promise<PercentileResponse> {
  return apiFetch<PercentileResponse>(`/v1/stats/percentile/${encodeURIComponent(targetId)}`);
}

export interface ShareDataResponse {
  target_id: string;
  name: string;
  score: number;
  tier: string;
  percentile: number;
  top_pct: number;
  total_evaluated: number;
  tweet_text: string;
  linkedin_text: string;
  profile_url: string;
  og_image_url: string;
  badge_svg_url: string;
  shields_url: string;
  shields_badge: { schemaVersion: number; label: string; message: string; color: string };
  embed_markdown: string;
  embed_html: string;
}

export function getShareData(targetId: string): Promise<ShareDataResponse> {
  return apiFetch<ShareDataResponse>(`/v1/score/${encodeURIComponent(targetId)}/share`);
}

// ---------- Arena (Ladder) ----------
export interface LadderEntry {
  target_id: string;
  domain: string | null;
  position: number;
  name: string;
  overall_score: number;
  openskill_mu: number;
  openskill_sigma: number;
  battle_record: { wins: number; losses: number; draws: number };
  defenses: number;
  last_challenge_at: string | null;
}

export interface LadderResponse {
  items: LadderEntry[];
  domain: string | null;
  count: number;
}

export interface MatchPrediction {
  agent_a_id: string;
  agent_b_id: string;
  win_probability_a: number;
  win_probability_b: number;
  match_quality: number;
  recommendation: "good_match" | "one_sided" | "too_unbalanced";
}

export function getLadder(domain?: string): Promise<LadderResponse> {
  const path = domain ? `/v1/arena/ladder/${encodeURIComponent(domain)}` : "/v1/arena/ladder";
  return apiFetch<LadderResponse>(path);
}

export function issueLadderChallenge(challengerId: string, targetId: string, domain?: string): Promise<{ battle_id: string; status: string; poll_url: string }> {
  return apiFetch("/v1/arena/challenge", {
    method: "POST",
    body: JSON.stringify({ challenger_id: challengerId, target_id: targetId, domain }),
  });
}

export function getMatchPrediction(idA: string, idB: string): Promise<MatchPrediction> {
  return apiFetch<MatchPrediction>(`/v1/arena/predict/${encodeURIComponent(idA)}/${encodeURIComponent(idB)}`);
}
