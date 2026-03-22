import { Shield, ShieldCheck, ShieldPlus, Award, Clock, Users, CheckCircle2 } from "lucide-react";
import { type TrustLevel, type QualityTier } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const LEVEL_DETAILS: Record<TrustLevel, {
  icon: React.ElementType;
  tagline: string;
  checks: string[];
}> = {
  verified: {
    icon: Shield,
    tagline: "Spot-checked for basic quality",
    checks: ["Schema validation", "Up to 3 tools tested", "Single judge scoring"],
  },
  certified: {
    icon: ShieldCheck,
    tagline: "Full test suite with safety probes",
    checks: ["All tools tested", "Adversarial safety probes", "Multi-axis scoring", "Cost-optimized judging"],
  },
  audited: {
    icon: ShieldPlus,
    tagline: "Comprehensive audit with consensus",
    checks: ["All tools tested", "Adversarial safety probes", "2-3 judge consensus", "Extended validation", "Production correlation"],
  },
};

interface TrustCertificateProps {
  level: TrustLevel;
  score: number;
  tier: QualityTier;
  serverName: string;
  evaluatedAt?: string;
  className?: string;
}

export function TrustCertificate({
  level,
  score,
  tier,
  serverName,
  evaluatedAt,
  className,
}: TrustCertificateProps) {
  const details = LEVEL_DETAILS[level];
  const Icon = details.icon;

  const formattedDate = evaluatedAt
    ? new Date(evaluatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm border p-5 bg-gradient-to-br from-[#E2754D]/[0.04] to-white",
        className
      )}
      style={{
        borderColor: "rgba(246,104,36,0.3)",
        boxShadow: "0 4px 24px rgba(246,104,36,0.08), 0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {/* Decorative corner accent — brand gradient */}
      <div
        className="absolute top-0 right-0 w-28 h-28 opacity-[0.06]"
        style={{
          background: "radial-gradient(circle at top right, #E2754D, #DB5F94 50%, transparent 70%)",
        }}
      />

      <div className="flex items-start gap-4">
        {/* Shield icon */}
        <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-sm bg-[#E2754D]/[0.08]">
          <Icon className="h-6 w-6 text-[#E2754D]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold uppercase tracking-wide text-[#0E0E0C]">
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </span>
            <Award className="h-3.5 w-3.5 text-[#E2754D] opacity-60" />
          </div>
          <p className="text-xs text-muted-foreground">{details.tagline}</p>

          {/* Check marks */}
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
            {details.checks.map((check) => (
              <span key={check} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 shrink-0 text-[#E2754D]" />
                {check}
              </span>
            ))}
          </div>
        </div>

        {/* Score + meta */}
        <div className="shrink-0 text-right">
          <div className="text-2xl font-bold tabular-nums text-[#0E0E0C]">
            {score}
          </div>
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            /100 {tier}
          </div>
          {formattedDate && (
            <div className="flex items-center gap-1 justify-end mt-1.5 text-[10px] text-muted-foreground">
              <Clock className="h-2.5 w-2.5" />
              {formattedDate}
            </div>
          )}
          {level !== "verified" && (
            <div className="flex items-center gap-1 justify-end mt-0.5 text-[10px] text-muted-foreground">
              <Users className="h-2.5 w-2.5" />
              {level === "audited" ? "2-3 judges" : "optimized"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
