"use client";

/**
 * QO-048: Gaming Risk Indicator (QO-044 output)
 *
 * Pill showing the gaming risk level detected by anti-gaming.
 * Hidden when risk == "none".
 */
import { AlertTriangle, Activity } from "lucide-react";

interface Props {
  risk?: "none" | "low" | "medium" | "high" | null;
}

const STYLES = {
  none: { bg: "bg-[#F1EFED]", text: "text-[#6B6964]", label: "No risk" },
  low: { bg: "bg-yellow-50", text: "text-yellow-800", label: "Low gaming risk" },
  medium: { bg: "bg-orange-50", text: "text-orange-800", label: "Medium gaming risk" },
  high: { bg: "bg-red-50", text: "text-red-800", label: "High gaming risk" },
};

export function GamingRiskIndicator({ risk }: Props) {
  if (!risk || risk === "none") return null;

  const styles = STYLES[risk] ?? STYLES.none;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full ${styles.bg} px-2.5 py-1 text-[11px] font-semibold ${styles.text}`}
      title="Anti-gaming detection: response fingerprinting + timing analysis"
    >
      {risk === "high" || risk === "medium" ? (
        <AlertTriangle className="h-3 w-3" />
      ) : (
        <Activity className="h-3 w-3" />
      )}
      <span className="uppercase tracking-wider">{styles.label}</span>
    </div>
  );
}
