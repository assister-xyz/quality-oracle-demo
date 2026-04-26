"use client";

import { Sparkles } from "lucide-react";

import type { TargetType } from "@/services/discover.service";

/** A pre-defined sample input the user can click to pre-fill the form. */
export interface SampleChip {
  /** Display label, e.g. "GitMCP". */
  name: string;
  /** Pre-filled URL. */
  url: string;
  /** Hint sent to the dropdown when the chip is clicked. */
  type: TargetType;
  /** Optional sub-label for the chip (e.g. "(skill)"). */
  badge?: string;
}

/**
 * Default set of sample targets that exercise every cascade path. Lifted
 * from QO-060 spec §"Sample chips" so the marketing-friendly URLs match
 * the docs.
 */
export const DEFAULT_SAMPLES: SampleChip[] = [
  {
    name: "GitMCP",
    url: "https://gitmcp.io/anthropics/anthropic-cookbook",
    type: "mcp",
  },
  {
    name: "DeepWiki",
    url: "https://mcp.deepwiki.com/mcp",
    type: "mcp",
  },
  {
    name: "jupiter",
    url: "https://github.com/sendaifun/skills/tree/main/skills/jupiter",
    type: "skill",
    badge: "skill",
  },
  {
    name: "sample-a2a",
    url: "https://a2a-sample.example.com/.well-known/agent-card.json",
    type: "a2a",
    badge: "a2a",
  },
  {
    name: "gradio-demo",
    url: "https://hf.space/gradio/demo",
    type: "gradio",
    badge: "gradio",
  },
];

interface SampleChipsProps {
  samples: SampleChip[];
  disabled?: boolean;
  onPick: (chip: SampleChip) => void;
}

export function SampleChips({
  samples,
  disabled = false,
  onPick,
}: SampleChipsProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Sample targets"
    >
      <span className="text-[11px] uppercase tracking-wider text-[#A0A09C] font-medium inline-flex items-center gap-1.5">
        <Sparkles className="h-3 w-3" aria-hidden="true" />
        Try:
      </span>
      {samples.map((chip) => (
        <button
          key={chip.name}
          type="button"
          onClick={() => onPick(chip)}
          disabled={disabled}
          className="text-xs text-[#A0A09C] hover:text-[#E2754D] border border-[#2a2a28] hover:border-[#E2754D]/40 px-2.5 py-1 rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E2754D]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E0E0C]"
          style={{ transitionTimingFunction: "var(--ease)" }}
          data-sample-chip={chip.type}
          // Accessible name comes from visible text. Adding aria-label
          // would trigger a label-content-name-mismatch warning on chips
          // that include a parenthesized badge.
          title={`Try ${chip.name}${chip.badge ? ` (${chip.badge})` : ""}`}
        >
          {chip.name}
          {chip.badge && (
            <span className="ml-1.5 text-[10px] uppercase tracking-wide text-[#A0A09C]">
              ({chip.badge})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
