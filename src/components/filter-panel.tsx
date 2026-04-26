"use client";

import { useMemo } from "react";
import { Search, AlertTriangle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { MarketplaceListItem } from "@/lib/marketplace";

export type SortKey = "recommended" | "score" | "name" | "last-eval" | "risk";
export type TierFilter = "all" | "expert" | "proficient" | "basic" | "failed";

export interface FilterState {
  query: string;
  sort: SortKey;
  tier: TierFilter;
  category: string | "all";
  minAxis: number;
  showTopRisks: boolean;
}

export const DEFAULT_FILTER: FilterState = {
  query: "",
  sort: "recommended",
  tier: "all",
  category: "all",
  minAxis: 0,
  showTopRisks: false,
};

/**
 * FilterPanel: sort + filter controls for the marketplace grid.
 * Built without shadcn `cmdk` to avoid an extra install — uses native
 * <select> + Tailwind for the Top-3 cut. Full Command palette (cmdk) is
 * deferred to QO-053-H2.
 */
export function FilterPanel({
  state,
  onChange,
  items,
}: {
  state: FilterState;
  onChange: (next: FilterState) => void;
  items: MarketplaceListItem[];
}) {
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) {
      if (it.category) set.add(it.category);
    }
    return Array.from(set).sort();
  }, [items]);

  return (
    <div className="bg-white border border-[#0E0E0C]/8 rounded-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#717069]" />
        <Input
          type="text"
          placeholder="Search skills…"
          value={state.query}
          onChange={(e) => onChange({ ...state, query: e.target.value })}
          className="pl-9"
          aria-label="Search skills"
        />
      </div>

      <SelectField
        label="Sort"
        value={state.sort}
        onChange={(v) => onChange({ ...state, sort: v as SortKey })}
        options={[
          { value: "recommended", label: "Recommended" },
          { value: "score", label: "Score (high→low)" },
          { value: "risk", label: "Risk (high→low)" },
          { value: "name", label: "Name (A→Z)" },
          { value: "last-eval", label: "Last evaluated" },
        ]}
      />

      <SelectField
        label="Tier"
        value={state.tier}
        onChange={(v) => onChange({ ...state, tier: v as TierFilter })}
        options={[
          { value: "all", label: "All tiers" },
          { value: "expert", label: "Expert" },
          { value: "proficient", label: "Proficient" },
          { value: "basic", label: "Basic" },
          { value: "failed", label: "Failed" },
        ]}
      />

      <SelectField
        label="Category"
        value={state.category}
        onChange={(v) => onChange({ ...state, category: v })}
        options={[
          { value: "all", label: "All categories" },
          ...categories.map((c) => ({ value: c, label: c })),
        ]}
      />

      <div className="flex items-center gap-2">
        <label className="text-xs text-[#717069] uppercase tracking-wider">Min axis</label>
        <input
          type="number"
          min={0}
          max={100}
          step={5}
          value={state.minAxis}
          onChange={(e) => onChange({ ...state, minAxis: Number(e.target.value) || 0 })}
          className="w-16 px-2 py-1 border border-[#0E0E0C]/12 rounded-sm font-mono text-sm"
          aria-label="Minimum per-axis score"
        />
      </div>

      <Button
        size="sm"
        variant={state.showTopRisks ? "default" : "outline"}
        onClick={() => onChange({ ...state, showTopRisks: !state.showTopRisks })}
        className="gap-1.5"
        data-testid="top-risks-toggle"
      >
        <AlertTriangle className="h-3.5 w-3.5" />
        Top 10 Risks
        {state.showTopRisks && (
          <Badge variant="secondary" className="ml-1 text-[10px]">
            ON
          </Badge>
        )}
      </Button>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="uppercase tracking-wider text-[#717069]">{label}</span>
      <span className="relative inline-block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none pl-3 pr-8 py-1.5 border border-[#0E0E0C]/12 rounded-sm bg-white text-sm font-medium text-[#0E0E0C] focus:outline-none focus:ring-2 focus:ring-[#E2754D]/40"
          aria-label={label}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#717069] pointer-events-none" />
      </span>
    </label>
  );
}

/** Apply filter+sort state to a list of marketplace items. */
export function applyFilter(
  items: MarketplaceListItem[],
  state: FilterState,
  topRiskIds: string[],
): MarketplaceListItem[] {
  const q = state.query.trim().toLowerCase();
  let filtered = items.filter((it) => {
    if (q && !it.name.toLowerCase().includes(q) && !it.slug.toLowerCase().includes(q)) {
      return false;
    }
    if (state.tier !== "all" && it.tier !== state.tier) return false;
    if (state.category !== "all" && it.category !== state.category) return false;
    if (state.minAxis > 0) {
      const axisValues = Object.entries(it.axes)
        .filter(([k]) => k !== "latency")
        .map(([, v]) => v);
      const minSeen = axisValues.length ? Math.min(...axisValues) : 0;
      if (minSeen < state.minAxis) return false;
    }
    if (state.showTopRisks && !topRiskIds.includes(it.id)) return false;
    return true;
  });

  const cmp: Record<SortKey, (a: MarketplaceListItem, b: MarketplaceListItem) => number> = {
    recommended: (a, b) => b.score - a.score,
    score: (a, b) => b.score - a.score,
    name: (a, b) => a.name.localeCompare(b.name),
    "last-eval": (a, b) => (b.last_eval_at ?? "").localeCompare(a.last_eval_at ?? ""),
    risk: (a, b) => b.r5_risk_score - a.r5_risk_score,
  };
  filtered = [...filtered].sort(cmp[state.sort]);
  return filtered;
}
