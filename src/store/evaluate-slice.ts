/**
 * QO-060 — Local state slice for the multi-target /evaluate flow.
 *
 * The project doesn't carry Zustand (only React 19 + plain hooks), so this
 * exposes a lightweight `useEvaluateSlice` hook backed by `useReducer` plus
 * a stable shape that mirrors a Zustand slice. If the project later
 * adopts Zustand, the same `EvaluateSliceState` interface can be lifted
 * into a proper store with no UI churn.
 */

import { useReducer, useCallback } from "react";

import type { TargetType, DiscoveryResult } from "@/services/discover.service";

/**
 * SKILL.md drag-drop client-side preview. Filled in by the
 * `MultiTargetInput` parser, consumed by the Evaluate page when submitting
 * a skill payload.
 */
export interface SkillDropPreview {
  /** Parsed YAML frontmatter as a plain object. */
  frontmatter: Record<string, unknown>;
  /** Full markdown body (after frontmatter). */
  body: string;
  /** Filename of the dropped file (e.g. "SKILL.md"). */
  filename: string;
  /** "drag" (uploaded file) or "github" (resolved by URL). */
  source: "drag" | "github";
}

/**
 * State shape consumed by `MultiTargetInput`, `DiscoveryTimeline`, and the
 * Evaluate page. Pure-data; no React-specific values here.
 */
export interface EvaluateSliceState {
  /** User-typed URL or empty string. */
  url: string;
  /** Auto / mcp / a2a / skill / openapi / rest_chat / gradio. */
  targetTypeOverride: TargetType;
  /** Last successful discovery cascade response. */
  discoveryCascade: DiscoveryResult | null;
  /** Client-parsed SKILL.md preview, if a markdown file was dropped. */
  skillDropPreview: SkillDropPreview | null;
}

export const initialEvaluateSliceState: EvaluateSliceState = {
  url: "",
  targetTypeOverride: "auto",
  discoveryCascade: null,
  skillDropPreview: null,
};

type EvaluateAction =
  | { type: "set_url"; url: string }
  | { type: "set_target_type_override"; targetType: TargetType }
  | { type: "set_discovery_cascade"; cascade: DiscoveryResult | null }
  | { type: "set_skill_drop_preview"; preview: SkillDropPreview | null }
  | { type: "reset" };

function reducer(
  state: EvaluateSliceState,
  action: EvaluateAction,
): EvaluateSliceState {
  switch (action.type) {
    case "set_url":
      return { ...state, url: action.url };
    case "set_target_type_override":
      return { ...state, targetTypeOverride: action.targetType };
    case "set_discovery_cascade":
      return { ...state, discoveryCascade: action.cascade };
    case "set_skill_drop_preview":
      // When a user drops a skill, pre-set the override to "skill" so the
      // submit handler routes to /v1/evaluate/skill instead of /v1/evaluate.
      return {
        ...state,
        skillDropPreview: action.preview,
        targetTypeOverride:
          action.preview && state.targetTypeOverride === "auto"
            ? "skill"
            : state.targetTypeOverride,
      };
    case "reset":
      return initialEvaluateSliceState;
    default:
      return state;
  }
}

export function useEvaluateSlice(initialUrl = "") {
  const [state, dispatch] = useReducer(reducer, {
    ...initialEvaluateSliceState,
    url: initialUrl,
  });

  const setUrl = useCallback(
    (url: string) => dispatch({ type: "set_url", url }),
    [],
  );
  const setTargetTypeOverride = useCallback(
    (targetType: TargetType) =>
      dispatch({ type: "set_target_type_override", targetType }),
    [],
  );
  const setDiscoveryCascade = useCallback(
    (cascade: DiscoveryResult | null) =>
      dispatch({ type: "set_discovery_cascade", cascade }),
    [],
  );
  const setSkillDropPreview = useCallback(
    (preview: SkillDropPreview | null) =>
      dispatch({ type: "set_skill_drop_preview", preview }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: "reset" }), []);

  return {
    state,
    setUrl,
    setTargetTypeOverride,
    setDiscoveryCascade,
    setSkillDropPreview,
    reset,
  };
}

/** Minimal client-side YAML frontmatter parser for SKILL.md drag-drop. */
export function parseSkillFrontmatter(raw: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  // Match an opening `---` line, then any content, then a closing `---` line.
  const match = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: raw };
  }

  const yamlBlock = match[1];
  const body = match[2];

  // Strip YAML comments.
  const lines = yamlBlock
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+#.*$/, ""))
    .filter((l) => l.trim().length > 0);

  const frontmatter: Record<string, unknown> = {};
  let currentKey: string | null = null;
  let currentList: string[] | null = null;

  for (const line of lines) {
    // List item: "  - foo"
    const listItem = line.match(/^\s+-\s+(.*)$/);
    if (listItem && currentKey) {
      if (!currentList) {
        currentList = [];
        frontmatter[currentKey] = currentList;
      }
      currentList.push(stripQuotes(listItem[1].trim()));
      continue;
    }

    // Key/value: "key: value"
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) {
      currentKey = kv[1];
      const value = kv[2].trim();
      currentList = null;
      if (value === "" || value === "|") {
        // Empty → next lines may form a list; assign empty string for now.
        frontmatter[currentKey] = "";
      } else {
        frontmatter[currentKey] = stripQuotes(value);
      }
    }
  }

  return { frontmatter, body };
}

function stripQuotes(s: string): string {
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    return s.slice(1, -1);
  }
  return s;
}
