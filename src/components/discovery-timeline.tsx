"use client";

import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";

import {
  DISCOVERY_STEPS,
  type DiscoveryProbe,
  type DiscoveryResult,
} from "@/services/discover.service";

interface DiscoveryTimelineProps {
  /** Most recent cascade result, or null while polling. */
  cascade: DiscoveryResult | null;
  /** True while the cascade is still in flight. */
  active: boolean;
}

type StepStatus = "pending" | "running" | "done" | "error" | "skipped";

interface RenderedStep {
  step: number;
  name: string;
  status: StepStatus;
  probe?: DiscoveryProbe;
}

/**
 * Renders the 10-step QO-058 discovery cascade as a vertical timeline.
 * Reuses the same look-and-feel as the existing eval-progress card so the
 * two timelines can sit on the same page without visual conflict.
 *
 * Accessibility (AC9): wrapper is `aria-live="polite"` so screen readers
 * narrate each new probe result. Each step is announced with its name and
 * status.
 */
export function DiscoveryTimeline({ cascade, active }: DiscoveryTimelineProps) {
  const probesByStep = new Map<number, DiscoveryProbe>();
  if (cascade) {
    for (const probe of cascade.probes) {
      probesByStep.set(probe.step, probe);
    }
  }

  const steps: RenderedStep[] = DISCOVERY_STEPS.map((s) => {
    const probe = probesByStep.get(s.step);
    if (probe) {
      const status: StepStatus = probe.matched
        ? "done"
        : probe.error
          ? "error"
          : "skipped";
      return { step: s.step, name: s.name, status, probe };
    }
    if (active) {
      // Find the next pending step → mark as running.
      const lastDoneStep = cascade?.probes?.length ?? 0;
      const isNext = s.step === lastDoneStep + 1;
      return {
        step: s.step,
        name: s.name,
        status: isNext ? "running" : "pending",
      };
    }
    return { step: s.step, name: s.name, status: "pending" };
  });

  const detected = cascade?.detected_label ?? null;
  const detectionFailed =
    cascade !== null && !active && cascade.detected_type === null;

  return (
    <section
      data-testid="discovery-timeline"
      aria-label="Target discovery cascade"
      aria-live="polite"
      aria-busy={active}
      className="rounded-sm bg-[#0E0E0C] border border-[#2a2a28] p-5 md:p-6"
    >
      <header className="mb-4 flex items-center gap-3">
        {active ? (
          <Loader2
            className="h-4 w-4 animate-spin text-[#E2754D]"
            aria-hidden="true"
          />
        ) : detected ? (
          <CheckCircle2
            className="h-4 w-4 text-[#E2754D]"
            aria-hidden="true"
          />
        ) : detectionFailed ? (
          <XCircle className="h-4 w-4 text-[#9e3b3b]" aria-hidden="true" />
        ) : (
          <Circle className="h-4 w-4 text-[#535862]" aria-hidden="true" />
        )}
        <h3 className="text-sm font-display font-600 text-[#F5F5F3]">
          Discovery cascade
        </h3>
        {detected && (
          <span className="ml-auto text-xs text-[#E2754D] font-mono">
            Detected: {detected}
          </span>
        )}
      </header>

      <ol className="space-y-1">
        {steps.map((step) => (
          <DiscoveryStepRow key={step.step} step={step} />
        ))}
      </ol>

      {detectionFailed && (
        <p className="mt-4 pt-3 border-t border-[#2a2a28] text-xs text-[#A0A09C]">
          All 10 probes returned without a match. Pick a target type from the
          dropdown or paste a SKILL.md.
        </p>
      )}
    </section>
  );
}

function DiscoveryStepRow({ step }: { step: RenderedStep }) {
  const statusLabel =
    step.status === "done"
      ? "Detected"
      : step.status === "running"
        ? "Probing…"
        : step.status === "error"
          ? "Error"
          : step.status === "skipped"
            ? "No match"
            : "Pending";

  return (
    <li
      className={`flex items-center gap-3 py-1.5 text-sm transition-opacity duration-200 ${
        step.status === "pending" ? "opacity-30" : "opacity-100"
      }`}
      data-step-status={step.status}
      data-step={step.step}
    >
      <StepIcon status={step.status} />
      <span
        className={`flex-1 ${
          step.status === "running"
            ? "text-[#E2754D] font-display font-600"
            : step.status === "done"
              ? "text-[#F5F5F3]"
              : "text-[#A0A09C]"
        }`}
      >
        {step.name}
      </span>
      {step.probe && (
        <span className="font-mono text-xs text-[#A0A09C] tabular-nums">
          {step.probe.status !== null ? step.probe.status : "—"}
          <span className="ml-2 text-[#A0A09C]/70">
            {step.probe.latency_ms}ms
          </span>
        </span>
      )}
      <span className="sr-only">{statusLabel}</span>
    </li>
  );
}

function StepIcon({ status }: { status: StepStatus }) {
  switch (status) {
    case "done":
      return (
        <CheckCircle2 className="h-4 w-4 text-[#E2754D]" aria-hidden="true" />
      );
    case "running":
      return (
        <Loader2
          className="h-4 w-4 text-[#E2754D] animate-spin"
          aria-hidden="true"
        />
      );
    case "error":
      return (
        <XCircle className="h-4 w-4 text-[#9e3b3b]" aria-hidden="true" />
      );
    case "skipped":
      return (
        <Circle className="h-4 w-4 text-[#535862]" aria-hidden="true" />
      );
    default:
      return (
        <Circle className="h-4 w-4 text-[#2a2a28]" aria-hidden="true" />
      );
  }
}
