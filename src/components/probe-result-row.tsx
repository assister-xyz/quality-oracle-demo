"use client";

import { useState } from "react";
import { Check, X, ChevronRight, Wrench } from "lucide-react";
import type { ProbeResult } from "@/lib/marketplace";

/**
 * One row in the per-skill probe results table. Click expands to show the
 * judge rationale and the "How to fix" suggestion.
 */
export function ProbeResultRow({ probe }: { probe: ProbeResult }) {
  const [open, setOpen] = useState(false);
  const passed = probe.passed;

  return (
    <div className="border-b border-[#0E0E0C]/8 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 flex items-center gap-4 text-left hover:bg-[#0E0E0C]/[0.02] transition-colors"
        aria-expanded={open}
        data-testid="probe-row"
      >
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
            passed
              ? "bg-[#E2754D]/10 text-[#E2754D]"
              : "bg-[#9e3b3b]/10 text-[#9e3b3b]"
          }`}
          aria-label={passed ? "Probe passed" : "Probe failed"}
        >
          {passed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3">
            {probe.probe_id && (
              <span className="font-mono text-xs uppercase tracking-wider text-[#717069]">
                {probe.probe_id}
              </span>
            )}
            <span className="text-sm font-medium text-[#0E0E0C]">
              {probe.probe_type ?? "probe"}
            </span>
            {probe.category && (
              <span className="text-xs text-[#717069] uppercase">{probe.category}</span>
            )}
          </div>
          {probe.score != null && (
            <span className="text-xs text-[#717069] font-mono">score {Math.round(probe.score)}/100</span>
          )}
        </div>

        <ChevronRight
          className={`h-4 w-4 text-[#717069] shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 pl-[3.75rem] space-y-3 text-sm">
          {(probe.rationale ?? probe.explanation) && (
            <div>
              <div className="text-xs uppercase tracking-wider text-[#717069] mb-1">
                Judge rationale
              </div>
              <p className="text-[#0E0E0C]/80">{probe.rationale ?? probe.explanation}</p>
            </div>
          )}
          {probe.fix && (
            <div className="bg-[#E2754D]/8 border border-[#E2754D]/30 rounded-sm p-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#E2754D] mb-1">
                <Wrench className="h-3 w-3" />
                How to fix
              </div>
              <p className="text-[#0E0E0C]/85">{probe.fix}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
