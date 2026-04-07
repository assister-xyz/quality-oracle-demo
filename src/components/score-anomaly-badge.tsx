"use client";

/**
 * QO-048: Score Anomaly Badge (QO-043 output)
 *
 * Renders a warning pill if QO-043 score anomaly detection flagged
 * the evaluation. Three anomaly types with severity colors.
 */
import { AlertTriangle, AlertCircle, AlertOctagon } from "lucide-react";
import type { ScoreAnomaly } from "@/lib/api";

const ANOMALY_LABELS: Record<ScoreAnomaly["anomaly_type"], { title: string; description: string }> = {
  first_eval_extreme: {
    title: "Unusual first-evaluation score",
    description: "First-time evaluation scored at the high extreme — flagged for review by the anti-gaming system",
  },
  z_score_deviation: {
    title: "Score deviates from history",
    description: "Score differs significantly from this server's historical baseline (>2σ)",
  },
  unchanged_manifest_jump: {
    title: "Score jumped without code changes",
    description: "Manifest hash unchanged but score moved >20 points — possible evaluation drift",
  },
};

const SEVERITY_STYLES: Record<ScoreAnomaly["severity"], { bg: string; border: string; text: string; icon: typeof AlertTriangle }> = {
  low: {
    bg: "bg-yellow-50",
    border: "border-yellow-300",
    text: "text-yellow-800",
    icon: AlertTriangle,
  },
  medium: {
    bg: "bg-orange-50",
    border: "border-orange-300",
    text: "text-orange-800",
    icon: AlertCircle,
  },
  high: {
    bg: "bg-red-50",
    border: "border-red-300",
    text: "text-red-800",
    icon: AlertOctagon,
  },
};

interface Props {
  anomaly: ScoreAnomaly;
}

export function ScoreAnomalyBadge({ anomaly }: Props) {
  const labels = ANOMALY_LABELS[anomaly.anomaly_type] ?? { title: anomaly.anomaly_type, description: "" };
  const styles = SEVERITY_STYLES[anomaly.severity] ?? SEVERITY_STYLES.medium;
  const Icon = styles.icon;

  return (
    <div className={`flex gap-3 rounded-md border ${styles.border} ${styles.bg} p-3`}>
      <Icon className={`h-5 w-5 shrink-0 ${styles.text}`} />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${styles.text}`}>
            {labels.title}
          </span>
          <span className={`rounded-full ${styles.bg} px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles.text}`}>
            {anomaly.severity}
          </span>
        </div>
        <p className={`mt-1 text-xs ${styles.text}`}>
          {labels.description}
        </p>
      </div>
    </div>
  );
}
