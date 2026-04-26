"use client";

import { AlertTriangle, KeyRound, FileWarning } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * QO-060 — Inline error banners surfaced by the multi-target evaluate flow.
 *
 * Three flavors per spec §"Error states":
 *   - cascade-failed (10 probes returned nothing useful)
 *   - empty-manifest (manifest found, but no tools/skills)
 *   - needs-auth (401/403 along the way)
 *
 * Plus a generic fallback for anything else.
 */

export type EvaluateErrorKind =
  | "cascade-failed"
  | "empty-manifest"
  | "needs-auth"
  | "manifestless-notice"
  | "generic";

export interface EvaluateError {
  kind: EvaluateErrorKind;
  /** Optional override for the body copy. */
  message?: string;
  /** Underlying fetch/api error if any (rendered as small monospace footer). */
  detail?: string;
}

interface ErrorBannerProps {
  error: EvaluateError;
  onDismiss?: () => void;
  onRetry?: () => void;
}

const COPY: Record<
  EvaluateErrorKind,
  { title: string; body: string; tone: "danger" | "warning" | "info" }
> = {
  "cascade-failed": {
    title: "Couldn't auto-detect",
    body: "We tried 10 manifest probes and none of them matched. Pick a target type from the dropdown or paste a SKILL.md.",
    tone: "warning",
  },
  "empty-manifest": {
    title: "Manifest found, but it's empty",
    body: "Found a manifest at this URL but no tools or skills were declared. Double-check the export path.",
    tone: "warning",
  },
  "needs-auth": {
    title: "Needs auth",
    body: "The endpoint returned 401/403. Add an API key or a Bearer token via the headers field.",
    tone: "danger",
  },
  "manifestless-notice": {
    title: "Manifest-less mode",
    body: "Detected as Generic chat (REST). Note: no manifest, so latency and schema_quality axes won't be measured. Score capped at Verified tier.",
    tone: "info",
  },
  generic: {
    title: "Evaluation error",
    body: "Something went wrong. Try a different URL or check the backend status.",
    tone: "danger",
  },
};

const TONE_STYLES: Record<
  "danger" | "warning" | "info",
  { container: string; iconColor: string }
> = {
  danger: {
    container:
      "border-[#9e3b3b]/40 bg-[#9e3b3b]/8 text-[#F5F5F3]",
    iconColor: "text-[#d97757]",
  },
  warning: {
    container:
      "border-[#E2754D]/40 bg-[#E2754D]/8 text-[#F5F5F3]",
    iconColor: "text-[#E2754D]",
  },
  info: {
    container:
      "border-[#3a8a8a]/40 bg-[#3a8a8a]/8 text-[#F5F5F3]",
    iconColor: "text-[#7fb8b8]",
  },
};

function IconForKind({
  kind,
  className,
}: {
  kind: EvaluateErrorKind;
  className?: string;
}) {
  if (kind === "needs-auth")
    return <KeyRound className={className} aria-hidden="true" />;
  if (kind === "empty-manifest" || kind === "manifestless-notice")
    return <FileWarning className={className} aria-hidden="true" />;
  return <AlertTriangle className={className} aria-hidden="true" />;
}

export function ErrorBanner({ error, onDismiss, onRetry }: ErrorBannerProps) {
  const copy = COPY[error.kind];
  const styles = TONE_STYLES[copy.tone];
  const body = error.message ?? copy.body;

  return (
    <div
      role={copy.tone === "danger" ? "alert" : "status"}
      aria-live={copy.tone === "danger" ? "assertive" : "polite"}
      data-error-kind={error.kind}
      className={`flex items-start gap-3 rounded-sm border p-4 ${styles.container}`}
    >
      <IconForKind
        kind={error.kind}
        className={`h-5 w-5 shrink-0 mt-0.5 ${styles.iconColor}`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-display font-600">{copy.title}</p>
        <p className="text-xs text-[#A0A09C] mt-1 leading-relaxed">{body}</p>
        {error.detail && (
          <p className="mt-2 text-[10px] font-mono text-[#717069] break-all">
            {error.detail}
          </p>
        )}
        {(onDismiss || onRetry) && (
          <div className="mt-3 flex gap-2">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="h-7 text-xs border-[#2a2a28] text-[#F5F5F3] hover:bg-[#1a1a18]"
              >
                Retry
              </Button>
            )}
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-7 text-xs text-[#A0A09C] hover:text-[#F5F5F3]"
              >
                Dismiss
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
