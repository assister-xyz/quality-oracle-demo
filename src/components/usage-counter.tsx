"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const FREE_TIER_LIMIT = 5;
const STORAGE_KEY = "laureum_eval_count";
const MONTH_KEY = "laureum_eval_month";

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getLocalUsage(): number {
  if (typeof window === "undefined") return 0;
  const storedMonth = localStorage.getItem(MONTH_KEY);
  const currentMonth = getCurrentMonth();

  // Reset counter on new month
  if (storedMonth !== currentMonth) {
    localStorage.setItem(MONTH_KEY, currentMonth);
    localStorage.setItem(STORAGE_KEY, "0");
    return 0;
  }

  return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
}

export function incrementLocalUsage(): void {
  if (typeof window === "undefined") return;
  const currentMonth = getCurrentMonth();
  localStorage.setItem(MONTH_KEY, currentMonth);
  const current = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
  localStorage.setItem(STORAGE_KEY, String(current + 1));
}

export function UsageCounter() {
  const [used, setUsed] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setUsed(getLocalUsage());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Hide counter for first-visit users (no evaluations run yet).
  // Showing "0/5 evaluations used" on first paint creates loss-aversion friction
  // that suppresses the funnel. Reveal only after the user commits to an eval.
  if (used === 0) return null;

  const remaining = Math.max(0, FREE_TIER_LIMIT - used);
  const atLimit = remaining === 0;
  const nearLimit = remaining <= 2 && remaining > 0;

  return (
    <div
      className={`flex items-center justify-between rounded-sm border px-4 py-2.5 text-sm ${
        atLimit
          ? "border-[#ef4444]/30 bg-[#ef4444]/5"
          : nearLimit
          ? "border-[#f59e0b]/30 bg-[#f59e0b]/5"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Usage bar */}
        <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              atLimit
                ? "bg-[#ef4444]"
                : nearLimit
                ? "bg-[#f59e0b]"
                : "bg-[#10b981]"
            }`}
            style={{ width: `${Math.min(100, (used / FREE_TIER_LIMIT) * 100)}%` }}
          />
        </div>
        <span className="text-muted-foreground">
          <span className="font-mono font-medium text-foreground">{used}</span>
          <span className="mx-0.5">/</span>
          <span className="font-mono">{FREE_TIER_LIMIT}</span>
          {" "}evaluations used this month
        </span>
      </div>

      {atLimit ? (
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#F97316] hover:text-[#FB923C] uppercase tracking-wider transition-colors"
        >
          Upgrade
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      ) : nearLimit ? (
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1 text-xs text-[#f59e0b] hover:text-[#fbbf24] transition-colors"
        >
          {remaining} remaining
        </Link>
      ) : null}
    </div>
  );
}
