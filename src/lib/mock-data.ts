// Realistic mock data based on actual Laureum scan reports
// and API response schemas

export type QualityTier = "expert" | "proficient" | "basic" | "failed";
export type TrustLevel = "verified" | "certified" | "audited";
export type TargetType = "mcp_server" | "agent" | "skill";
export type EvalStatus = "pending" | "running" | "completed" | "failed";
export type Transport = "sse" | "streamable_http";

export interface Dimensions {
  accuracy: number;
  safety: number;
  process_quality: number;
  reliability: number;
  latency: number;
  schema_quality: number;
}

export interface ToolScore {
  score: number;
  tests_passed: number;
  tests_total: number;
}

export interface JudgeResponse {
  tool: string;
  question: string;
  score: number;
  explanation: string;
  method: "llm" | "fuzzy" | "consensus";
  test_type: string;
}

export interface SafetyProbe {
  probe_type: "prompt_injection" | "system_prompt_extraction" | "pii_leakage" | "hallucination" | "overflow";
  passed: boolean;
  score: number;
  explanation: string;
}

export interface ServerEvaluation {
  id: string;
  name: string;
  url: string;
  transport: Transport;
  target_type: TargetType;
  status: EvalStatus;
  score: number;
  tier: QualityTier;
  confidence: number;
  tools_count: number;
  questions_asked: number;
  duration_ms: number;
  manifest_score: number;
  dimensions: Dimensions;
  tool_scores: Record<string, ToolScore>;
  judge_responses: JudgeResponse[];
  safety_probes: SafetyProbe[];
  evaluated_at: string;
  evaluation_version: string;
  trust_level?: TrustLevel;
  battle_record?: { wins: number; losses: number; draws: number };
  // QO-048: Surface fields from QO-043/044/045/017/029 that backend already returns
  // Types are imported from api.ts to avoid duplication.
  agent_trap_coverage?: import("./api").AgentTrapCoverage;
  score_anomaly?: import("./api").ScoreAnomaly;
  operator_identity?: import("./api").OperatorIdentity;
  gaming_risk?: "none" | "low" | "medium" | "high";
  manifest_hash?: string;
  cost_usd?: number;
  token_usage?: import("./api").TokenUsage;
}

export interface EvalStep {
  name: string;
  status: "pending" | "running" | "done" | "error";
  detail?: string;
  score?: number;
  children?: EvalStep[];
}

function getTier(score: number): QualityTier {
  if (score >= 85) return "expert";
  if (score >= 70) return "proficient";
  if (score >= 50) return "basic";
  return "failed";
}

const TIER_CONFIG: Record<QualityTier, { color: string; bg: string; border: string; label: string }> = {
  expert: { color: "#0E0E0C", bg: "rgba(14,14,12,0.06)", border: "rgba(14,14,12,0.2)", label: "Expert" },
  proficient: { color: "#535862", bg: "rgba(83,88,98,0.08)", border: "rgba(83,88,98,0.2)", label: "Proficient" },
  basic: { color: "#717069", bg: "rgba(113,112,105,0.08)", border: "rgba(113,112,105,0.2)", label: "Basic" },
  failed: { color: "#9e3b3b", bg: "rgba(158,59,59,0.08)", border: "rgba(158,59,59,0.2)", label: "Failed" },
};

export { TIER_CONFIG };

const TRUST_LEVEL_CONFIG: Record<TrustLevel, { color: string; bg: string; border: string; label: string; description: string }> = {
  verified:  { color: "#E2754D", bg: "rgba(246,104,36,0.08)", border: "rgba(246,104,36,0.3)", label: "Verified",  description: "Spot check — Domain Validated" },
  certified: { color: "#E2754D", bg: "rgba(246,104,36,0.08)", border: "rgba(246,104,36,0.3)", label: "Certified", description: "Full test suite — Org Validated" },
  audited:   { color: "#E2754D", bg: "rgba(246,104,36,0.08)", border: "rgba(246,104,36,0.3)", label: "Audited",   description: "Comprehensive audit — Extended Validation" },
};

export { TRUST_LEVEL_CONFIG };

const DIMENSION_CONFIG: Record<keyof Dimensions, { label: string; weight: number; color: string }> = {
  accuracy: { label: "Accuracy", weight: 0.35, color: "#E2754D" },
  safety: { label: "Safety", weight: 0.20, color: "#C4614A" },
  reliability: { label: "Reliability", weight: 0.15, color: "#A85343" },
  latency: { label: "Latency", weight: 0.10, color: "#8C453C" },
  process_quality: { label: "Process Quality", weight: 0.10, color: "#703735" },
  schema_quality: { label: "Schema Quality", weight: 0.10, color: "#54292E" },
};

export { DIMENSION_CONFIG };

function generateSafetyProbes(baseScore: number): SafetyProbe[] {
  const variation = () => Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 30));
  return [
    { probe_type: "prompt_injection", passed: baseScore > 50, score: variation(), explanation: baseScore > 50 ? "Server correctly rejected injection attempt" : "Server echoed injected content" },
    { probe_type: "system_prompt_extraction", passed: baseScore > 40, score: variation(), explanation: baseScore > 40 ? "No system prompt leaked" : "Partial system prompt was revealed" },
    { probe_type: "pii_leakage", passed: baseScore > 45, score: variation(), explanation: baseScore > 45 ? "PII correctly filtered from response" : "SSN pattern detected in output" },
    { probe_type: "hallucination", passed: baseScore > 55, score: variation(), explanation: baseScore > 55 ? "Correctly declined to fabricate information" : "Fabricated answer for non-existent entity" },
    { probe_type: "overflow", passed: baseScore > 60, score: variation(), explanation: baseScore > 60 ? "Handled oversized input gracefully" : "Server returned 500 error on large input" },
  ];
}

// Based on real scan data from quality-oracle/reports/
export const MOCK_SERVERS: ServerEvaluation[] = [
  {
    id: "eval_001",
    name: "DeepWiki",
    url: "https://mcp.deepwiki.com/mcp",
    transport: "streamable_http",
    target_type: "mcp_server",
    status: "completed",
    score: 89,
    tier: "expert",
    confidence: 0.92,
    tools_count: 3,
    questions_asked: 9,
    duration_ms: 12400,
    manifest_score: 95,
    dimensions: { accuracy: 92, safety: 88, process_quality: 82, reliability: 90, latency: 85, schema_quality: 95 },
    tool_scores: {
      "read_wiki_structure": { score: 91, tests_passed: 3, tests_total: 3 },
      "read_wiki_contents": { score: 88, tests_passed: 3, tests_total: 3 },
      "ask_question": { score: 87, tests_passed: 2, tests_total: 3 },
    },
    judge_responses: [
      { tool: "read_wiki_structure", question: "Get the structure of the TensorFlow repository", score: 91, explanation: "Returned well-structured repository tree with correct hierarchy", method: "consensus", test_type: "happy_path" },
      { tool: "read_wiki_contents", question: "Read documentation for React hooks", score: 88, explanation: "Comprehensive content returned with proper formatting", method: "llm", test_type: "happy_path" },
      { tool: "ask_question", question: "How does Next.js routing work?", score: 87, explanation: "Accurate answer referencing file-based routing system", method: "consensus", test_type: "domain_knowledge" },
    ],
    safety_probes: generateSafetyProbes(88),
    evaluated_at: "2026-02-28T10:15:00Z",
    evaluation_version: "v1.0",
  },
  {
    id: "eval_002",
    name: "Context7",
    url: "https://mcp.context7.com/mcp",
    transport: "streamable_http",
    target_type: "mcp_server",
    status: "completed",
    score: 86,
    tier: "expert",
    confidence: 0.89,
    tools_count: 2,
    questions_asked: 6,
    duration_ms: 8700,
    manifest_score: 92,
    dimensions: { accuracy: 90, safety: 85, process_quality: 78, reliability: 88, latency: 82, schema_quality: 92 },
    tool_scores: {
      "resolve-library-id": { score: 88, tests_passed: 3, tests_total: 3 },
      "get-library-docs": { score: 84, tests_passed: 2, tests_total: 3 },
    },
    judge_responses: [
      { tool: "resolve-library-id", question: "Resolve the library ID for React", score: 88, explanation: "Correctly resolved to latest React library identifier", method: "consensus", test_type: "happy_path" },
      { tool: "get-library-docs", question: "Get docs for Express.js middleware", score: 84, explanation: "Good documentation returned but missing some edge cases", method: "llm", test_type: "happy_path" },
    ],
    safety_probes: generateSafetyProbes(85),
    evaluated_at: "2026-02-28T10:20:00Z",
    evaluation_version: "v1.0",
  },
  {
    id: "eval_003",
    name: "HuggingFace",
    url: "https://huggingface.co/mcp",
    transport: "streamable_http",
    target_type: "mcp_server",
    status: "completed",
    score: 82,
    tier: "proficient",
    confidence: 0.85,
    tools_count: 5,
    questions_asked: 15,
    duration_ms: 18200,
    manifest_score: 88,
    dimensions: { accuracy: 85, safety: 82, process_quality: 75, reliability: 80, latency: 78, schema_quality: 88 },
    tool_scores: {
      "search_models": { score: 85, tests_passed: 3, tests_total: 3 },
      "get_model_info": { score: 82, tests_passed: 3, tests_total: 3 },
      "search_datasets": { score: 80, tests_passed: 2, tests_total: 3 },
      "search_papers": { score: 78, tests_passed: 2, tests_total: 3 },
      "get_paper_info": { score: 84, tests_passed: 3, tests_total: 3 },
    },
    judge_responses: [
      { tool: "search_models", question: "Find transformer models for text classification", score: 85, explanation: "Returned relevant models with accurate metadata", method: "consensus", test_type: "happy_path" },
    ],
    safety_probes: generateSafetyProbes(82),
    evaluated_at: "2026-02-28T10:25:00Z",
    evaluation_version: "v1.0",
  },
  {
    id: "eval_004",
    name: "Cloudflare Docs",
    url: "https://docs.mcp.cloudflare.com/sse",
    transport: "sse",
    target_type: "mcp_server",
    status: "completed",
    score: 59,
    tier: "basic",
    confidence: 0.72,
    tools_count: 2,
    questions_asked: 6,
    duration_ms: 29274,
    manifest_score: 83,
    dimensions: { accuracy: 62, safety: 68, process_quality: 52, reliability: 55, latency: 42, schema_quality: 83 },
    tool_scores: {
      "search_cloudflare_documentation": { score: 52, tests_passed: 3, tests_total: 5 },
      "migrate_pages_to_workers_guide": { score: 95, tests_passed: 1, tests_total: 1 },
    },
    judge_responses: [
      { tool: "search_cloudflare_documentation", question: "Search for Workers KV documentation", score: 60, explanation: "Results returned but relevance was moderate", method: "llm", test_type: "happy_path" },
    ],
    safety_probes: generateSafetyProbes(59),
    evaluated_at: "2026-02-28T10:30:00Z",
    evaluation_version: "v1.0",
  },
  {
    id: "eval_005",
    name: "GitMCP",
    url: "https://gitmcp.io/mcp",
    transport: "streamable_http",
    target_type: "mcp_server",
    status: "completed",
    score: 78,
    tier: "proficient",
    confidence: 0.82,
    tools_count: 3,
    questions_asked: 9,
    duration_ms: 9800,
    manifest_score: 90,
    dimensions: { accuracy: 80, safety: 78, process_quality: 72, reliability: 82, latency: 75, schema_quality: 90 },
    tool_scores: {
      "fetch_repo_readme": { score: 85, tests_passed: 3, tests_total: 3 },
      "fetch_repo_docs": { score: 75, tests_passed: 2, tests_total: 3 },
      "search_repo_code": { score: 73, tests_passed: 2, tests_total: 3 },
    },
    judge_responses: [],
    safety_probes: generateSafetyProbes(78),
    evaluated_at: "2026-02-28T10:35:00Z",
    evaluation_version: "v1.0",
  },
  {
    id: "eval_006",
    name: "Semgrep",
    url: "https://mcp.semgrep.ai/mcp",
    transport: "streamable_http",
    target_type: "mcp_server",
    status: "completed",
    score: 91,
    tier: "expert",
    confidence: 0.94,
    tools_count: 2,
    questions_asked: 6,
    duration_ms: 6500,
    manifest_score: 97,
    dimensions: { accuracy: 94, safety: 95, process_quality: 88, reliability: 90, latency: 80, schema_quality: 97 },
    tool_scores: {
      "scan_code": { score: 92, tests_passed: 3, tests_total: 3 },
      "get_rules": { score: 90, tests_passed: 3, tests_total: 3 },
    },
    judge_responses: [
      { tool: "scan_code", question: "Scan Python code for SQL injection vulnerabilities", score: 94, explanation: "Identified all injection vectors with accurate severity ratings", method: "consensus", test_type: "domain_knowledge" },
    ],
    safety_probes: generateSafetyProbes(91),
    evaluated_at: "2026-02-28T10:40:00Z",
    evaluation_version: "v1.0",
  },
  {
    id: "eval_007",
    name: "OpenZeppelin",
    url: "https://mcp.openzeppelin.com/mcp",
    transport: "streamable_http",
    target_type: "mcp_server",
    status: "completed",
    score: 84,
    tier: "proficient",
    confidence: 0.87,
    tools_count: 4,
    questions_asked: 12,
    duration_ms: 14300,
    manifest_score: 91,
    dimensions: { accuracy: 88, safety: 90, process_quality: 76, reliability: 82, latency: 72, schema_quality: 91 },
    tool_scores: {
      "search_contracts": { score: 86, tests_passed: 3, tests_total: 3 },
      "get_contract_source": { score: 85, tests_passed: 3, tests_total: 3 },
      "audit_contract": { score: 82, tests_passed: 2, tests_total: 3 },
      "get_vulnerability_db": { score: 83, tests_passed: 3, tests_total: 3 },
    },
    judge_responses: [],
    safety_probes: generateSafetyProbes(84),
    evaluated_at: "2026-02-28T10:45:00Z",
    evaluation_version: "v1.0",
  },
  {
    id: "eval_008",
    name: "Firecrawl",
    url: "https://mcp.firecrawl.dev/mcp",
    transport: "streamable_http",
    target_type: "mcp_server",
    status: "completed",
    score: 76,
    tier: "proficient",
    confidence: 0.80,
    tools_count: 3,
    questions_asked: 9,
    duration_ms: 22100,
    manifest_score: 85,
    dimensions: { accuracy: 78, safety: 72, process_quality: 70, reliability: 80, latency: 68, schema_quality: 85 },
    tool_scores: {
      "crawl_website": { score: 78, tests_passed: 3, tests_total: 3 },
      "scrape_page": { score: 76, tests_passed: 2, tests_total: 3 },
      "search_web": { score: 74, tests_passed: 2, tests_total: 3 },
    },
    judge_responses: [],
    safety_probes: generateSafetyProbes(76),
    evaluated_at: "2026-02-28T10:50:00Z",
    evaluation_version: "v1.0",
  },
  {
    id: "eval_009",
    name: "CoinGecko",
    url: "https://mcp.coingecko.com/sse",
    transport: "sse",
    target_type: "mcp_server",
    status: "completed",
    score: 73,
    tier: "proficient",
    confidence: 0.78,
    tools_count: 6,
    questions_asked: 18,
    duration_ms: 25600,
    manifest_score: 82,
    dimensions: { accuracy: 76, safety: 74, process_quality: 65, reliability: 75, latency: 62, schema_quality: 82 },
    tool_scores: {
      "get_price": { score: 82, tests_passed: 3, tests_total: 3 },
      "get_market_chart": { score: 75, tests_passed: 2, tests_total: 3 },
      "search_coins": { score: 78, tests_passed: 3, tests_total: 3 },
      "get_trending": { score: 72, tests_passed: 2, tests_total: 3 },
      "get_exchanges": { score: 68, tests_passed: 2, tests_total: 3 },
      "get_global_data": { score: 65, tests_passed: 2, tests_total: 3 },
    },
    judge_responses: [],
    safety_probes: generateSafetyProbes(73),
    evaluated_at: "2026-02-28T10:55:00Z",
    evaluation_version: "v1.0",
  },
  {
    id: "eval_010",
    name: "Neon Database",
    url: "https://mcp.neon.tech/sse",
    transport: "sse",
    target_type: "mcp_server",
    status: "completed",
    score: 81,
    tier: "proficient",
    confidence: 0.84,
    tools_count: 4,
    questions_asked: 12,
    duration_ms: 11200,
    manifest_score: 89,
    dimensions: { accuracy: 84, safety: 80, process_quality: 75, reliability: 83, latency: 77, schema_quality: 89 },
    tool_scores: {
      "create_database": { score: 85, tests_passed: 3, tests_total: 3 },
      "run_query": { score: 82, tests_passed: 3, tests_total: 3 },
      "list_databases": { score: 80, tests_passed: 3, tests_total: 3 },
      "get_schema": { score: 78, tests_passed: 2, tests_total: 3 },
    },
    judge_responses: [],
    safety_probes: generateSafetyProbes(81),
    evaluated_at: "2026-02-28T11:00:00Z",
    evaluation_version: "v1.0",
  },
  {
    id: "eval_011",
    name: "Astro Docs",
    url: "https://docs.astro.build/mcp",
    transport: "streamable_http",
    target_type: "mcp_server",
    status: "completed",
    score: 68,
    tier: "basic",
    confidence: 0.75,
    tools_count: 2,
    questions_asked: 6,
    duration_ms: 15800,
    manifest_score: 78,
    dimensions: { accuracy: 72, safety: 70, process_quality: 58, reliability: 68, latency: 60, schema_quality: 78 },
    tool_scores: {
      "search_docs": { score: 70, tests_passed: 2, tests_total: 3 },
      "get_page": { score: 66, tests_passed: 2, tests_total: 3 },
    },
    judge_responses: [],
    safety_probes: generateSafetyProbes(68),
    evaluated_at: "2026-02-28T11:05:00Z",
    evaluation_version: "v1.0",
  },
  {
    id: "eval_012",
    name: "TweetSave",
    url: "https://mcp.tweetsave.com/sse",
    transport: "sse",
    target_type: "mcp_server",
    status: "completed",
    score: 45,
    tier: "failed",
    confidence: 0.65,
    tools_count: 2,
    questions_asked: 6,
    duration_ms: 35200,
    manifest_score: 60,
    dimensions: { accuracy: 48, safety: 42, process_quality: 35, reliability: 50, latency: 38, schema_quality: 60 },
    tool_scores: {
      "save_tweet": { score: 50, tests_passed: 1, tests_total: 3 },
      "get_tweet": { score: 40, tests_passed: 1, tests_total: 3 },
    },
    judge_responses: [
      { tool: "save_tweet", question: "Save a tweet by URL", score: 50, explanation: "Partially saved content but metadata was incomplete", method: "fuzzy", test_type: "happy_path" },
    ],
    safety_probes: generateSafetyProbes(45),
    evaluated_at: "2026-02-28T11:10:00Z",
    evaluation_version: "v1.0",
  },
  {
    id: "eval_013",
    name: "Manifold Markets",
    url: "https://manifold.markets/api/mcp",
    transport: "streamable_http",
    target_type: "mcp_server",
    status: "completed",
    score: 71,
    tier: "proficient",
    confidence: 0.77,
    tools_count: 3,
    questions_asked: 9,
    duration_ms: 13400,
    manifest_score: 84,
    dimensions: { accuracy: 74, safety: 72, process_quality: 65, reliability: 73, latency: 66, schema_quality: 84 },
    tool_scores: {
      "search_markets": { score: 75, tests_passed: 3, tests_total: 3 },
      "get_market": { score: 72, tests_passed: 2, tests_total: 3 },
      "get_positions": { score: 66, tests_passed: 2, tests_total: 3 },
    },
    judge_responses: [],
    safety_probes: generateSafetyProbes(71),
    evaluated_at: "2026-02-28T11:15:00Z",
    evaluation_version: "v1.0",
  },
  {
    id: "eval_014",
    name: "Find-A-Domain",
    url: "https://mcp.find-a-domain.com/mcp",
    transport: "streamable_http",
    target_type: "mcp_server",
    status: "completed",
    score: 42,
    tier: "failed",
    confidence: 0.60,
    tools_count: 1,
    questions_asked: 3,
    duration_ms: 18900,
    manifest_score: 55,
    dimensions: { accuracy: 44, safety: 50, process_quality: 30, reliability: 42, latency: 35, schema_quality: 55 },
    tool_scores: {
      "search_domains": { score: 42, tests_passed: 1, tests_total: 3 },
    },
    judge_responses: [],
    safety_probes: generateSafetyProbes(42),
    evaluated_at: "2026-02-28T11:20:00Z",
    evaluation_version: "v1.0",
  },
  {
    id: "eval_015",
    name: "Stripe MCP",
    url: "https://mcp.stripe.com/sse",
    transport: "sse",
    target_type: "mcp_server",
    status: "completed",
    score: 88,
    tier: "expert",
    confidence: 0.91,
    tools_count: 8,
    questions_asked: 24,
    duration_ms: 16700,
    manifest_score: 96,
    dimensions: { accuracy: 90, safety: 92, process_quality: 85, reliability: 88, latency: 78, schema_quality: 96 },
    tool_scores: {
      "create_payment_intent": { score: 92, tests_passed: 3, tests_total: 3 },
      "list_customers": { score: 90, tests_passed: 3, tests_total: 3 },
      "create_product": { score: 88, tests_passed: 3, tests_total: 3 },
      "get_balance": { score: 86, tests_passed: 3, tests_total: 3 },
      "list_invoices": { score: 85, tests_passed: 2, tests_total: 3 },
      "create_subscription": { score: 90, tests_passed: 3, tests_total: 3 },
      "search_charges": { score: 87, tests_passed: 3, tests_total: 3 },
      "refund_charge": { score: 84, tests_passed: 2, tests_total: 3 },
    },
    judge_responses: [],
    safety_probes: generateSafetyProbes(88),
    evaluated_at: "2026-02-28T11:25:00Z",
    evaluation_version: "v1.0",
  },
];

// KPI aggregate computations
export function getKPIs() {
  const completed = MOCK_SERVERS.filter(s => s.status === "completed");
  const avgScore = Math.round(completed.reduce((sum, s) => sum + s.score, 0) / completed.length);
  const passRate = Math.round((completed.filter(s => s.score >= 50).length / completed.length) * 100);
  const expertCount = completed.filter(s => s.tier === "expert").length;
  const avgLatency = Math.round(completed.reduce((sum, s) => sum + s.duration_ms, 0) / completed.length);
  const totalTools = completed.reduce((sum, s) => sum + s.tools_count, 0);

  return {
    totalEvaluations: completed.length,
    averageScore: avgScore,
    passRate,
    expertCount,
    avgLatencyMs: avgLatency,
    totalToolsTested: totalTools,
    tierDistribution: {
      expert: completed.filter(s => s.tier === "expert").length,
      proficient: completed.filter(s => s.tier === "proficient").length,
      basic: completed.filter(s => s.tier === "basic").length,
      failed: completed.filter(s => s.tier === "failed").length,
    },
  };
}

// Simulated evaluation steps for live demo
export function getEvalSteps(): EvalStep[] {
  return [
    { name: "Connecting to MCP server", status: "pending" },
    { name: "Discovering tools & manifest", status: "pending" },
    { name: "Level 1: Manifest validation", status: "pending" },
    { name: "Level 2: Functional testing", status: "pending" },
    { name: "Running adversarial probes", status: "pending", children: [
      { name: "Prompt injection", status: "pending" },
      { name: "System prompt extraction", status: "pending" },
      { name: "PII leakage", status: "pending" },
      { name: "Hallucination", status: "pending" },
      { name: "Boundary overflow", status: "pending" },
    ]},
    { name: "Multi-judge consensus scoring", status: "pending" },
    { name: "Computing 6-axis dimensions", status: "pending" },
    { name: "Generating attestation", status: "pending" },
  ];
}
