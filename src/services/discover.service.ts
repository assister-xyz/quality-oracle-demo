/**
 * QO-060 — Multi-target discovery client.
 *
 * Wraps `GET /v1/discover?url=X` from QO-058. Returns the 10-step cascade
 * detection result plus the resolved target type so the UI can either kick
 * off a regular `/v1/evaluate` flow or surface a "couldn't auto-detect"
 * banner.
 *
 * The endpoint is async-friendly but lightweight: backend resolves in 1-3s
 * by hitting common manifest endpoints in order. Polling the regular
 * `/v1/evaluate/{id}/progress` then narrates the cascade in real time.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

import { ApiError } from "@/lib/api";

/**
 * Target types the multi-target evaluator understands. Mirrors backend
 * `target_resolver.TargetType`. `auto` is FE-only — sent to backend as
 * "no override" (omitted from the request).
 */
export type TargetType =
  | "auto"
  | "mcp"
  | "a2a"
  | "skill"
  | "openapi"
  | "rest_chat"
  | "gradio";

/** A single probe step in the 10-step discovery cascade. */
export interface DiscoveryProbe {
  /** Human-readable step name, e.g. "A2A agent-card.json". */
  name: string;
  /** Sequence index (1-10). */
  step: number;
  /** HTTP status if applicable, otherwise null. */
  status: number | null;
  /** Latency in milliseconds. */
  latency_ms: number;
  /** Whether this probe positively detected a target type. */
  matched: boolean;
  /** Optional error message (network failure, timeout, etc.). */
  error?: string | null;
}

/** Result of `GET /v1/discover?url=X`. */
export interface DiscoveryResult {
  url: string;
  /** Resolved target type, or `null` if cascade exhausted with no match. */
  detected_type: TargetType | null;
  /** Human-readable label, e.g. "MCP server (Streamable HTTP)". */
  detected_label: string | null;
  /** Each step the cascade tried, in order. */
  probes: DiscoveryProbe[];
  /** Whether a manifest was found (false → manifest-less mode). */
  has_manifest: boolean;
  /** Optional auth hint when the cascade saw 401/403. */
  needs_auth: boolean;
  /** Total cascade duration. */
  duration_ms: number;
}

/**
 * Discover a target's type by URL. Returns the cascade result with each
 * probe's status. Throws ApiError on non-2xx responses.
 */
export async function discoverTarget(url: string): Promise<DiscoveryResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const qs = new URLSearchParams({ url });
    const res = await fetch(`${API_URL}/v1/discover?${qs.toString()}`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      let detail = body;
      try {
        const parsed = JSON.parse(body);
        detail = parsed?.detail || body;
      } catch {
        /* not JSON, use raw body */
      }
      throw new ApiError(res.status, detail || `Discover failed (${res.status})`);
    }

    return (await res.json()) as DiscoveryResult;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Cascade probe order — used by the UI to render placeholder steps before
 * the real backend response arrives. Mirrors QO-058 `target_resolver.py`.
 */
export const DISCOVERY_STEPS: { step: number; name: string; type_hint: TargetType }[] = [
  { step: 1, name: "A2A agent-card.json", type_hint: "a2a" },
  { step: 2, name: "agents.json", type_hint: "a2a" },
  { step: 3, name: "ERC-8004 registry", type_hint: "a2a" },
  { step: 4, name: "MCP initialize", type_hint: "mcp" },
  { step: 5, name: "OpenAPI / Swagger", type_hint: "openapi" },
  { step: 6, name: "Gradio /info", type_hint: "gradio" },
  { step: 7, name: "Skill SKILL.md probe", type_hint: "skill" },
  { step: 8, name: "GitHub tree probe", type_hint: "skill" },
  { step: 9, name: "REST chat heuristic", type_hint: "rest_chat" },
  { step: 10, name: "Generic GET /", type_hint: "rest_chat" },
];
