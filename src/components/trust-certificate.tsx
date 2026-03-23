import { Clock, Users, CheckCircle2 } from "lucide-react";
import { type TrustLevel, type QualityTier } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const TIER_LEVEL: Record<string, TrustLevel> = {
  expert: "audited",
  proficient: "certified",
  basic: "verified",
  failed: "verified",
};

const LEVEL_COLORS: Record<string, string> = {
  verified: "#C38133",
  certified: "#A8A8A8",
  audited: "#D4AF37",
};

const LEVEL_DETAILS: Record<TrustLevel, {
  tagline: string;
  checks: string[];
}> = {
  verified: {
    tagline: "Spot-checked for basic quality",
    checks: ["Schema validation", "Up to 3 tools tested", "Single judge scoring"],
  },
  certified: {
    tagline: "Full test suite with safety probes",
    checks: ["All tools tested", "Adversarial safety probes", "Multi-axis scoring"],
  },
  audited: {
    tagline: "Comprehensive audit with consensus",
    checks: ["All tools tested", "Safety probes", "2-3 judge consensus", "Extended validation"],
  },
};

/* Mini wreath for the certificate — same paths, smaller */
function MiniWreath({ color }: { color: string }) {
  return (
    <svg width="48" height="48" viewBox="0 0 200 200" fill="none" className="shrink-0">
      <path d="M82 178 C40 155, 22 110, 55 42" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.2" />
      <path d="M78 172 C66 167, 52 175, 48 182 C58 181, 72 175, 78 172Z" fill={color} opacity="0.8" />
      <path d="M64 155 C50 154, 34 164, 30 174 C42 170, 58 159, 64 155Z" fill={color} opacity="0.7" />
      <path d="M50 136 C36 138, 20 150, 18 160 C30 154, 44 142, 50 136Z" fill={color} opacity="0.6" />
      <path d="M40 116 C28 122, 16 138, 16 148 C26 138, 36 124, 40 116Z" fill={color} opacity="0.45" />
      <path d="M44 60 C38 68, 34 82, 38 92 C42 82, 42 68, 44 60Z" fill={color} opacity="0.25" />
      <path d="M118 178 C160 155, 178 110, 145 42" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.2" />
      <path d="M122 172 C134 167, 148 175, 152 182 C142 181, 128 175, 122 172Z" fill={color} opacity="0.8" />
      <path d="M136 155 C150 154, 166 164, 170 174 C158 170, 142 159, 136 155Z" fill={color} opacity="0.7" />
      <path d="M150 136 C164 138, 180 150, 182 160 C170 154, 156 142, 150 136Z" fill={color} opacity="0.6" />
      <path d="M160 116 C172 122, 184 138, 184 148 C174 138, 164 124, 160 116Z" fill={color} opacity="0.45" />
      <path d="M156 60 C162 68, 166 82, 162 92 C158 82, 158 68, 156 60Z" fill={color} opacity="0.25" />
      <path d="M82 178 C90 184, 96 186, 100 186 C104 186, 110 184, 118 178" stroke={color} strokeWidth="2" fill="none" opacity="0.3" strokeLinecap="round" />
    </svg>
  );
}

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
  const wreathLevel = TIER_LEVEL[tier] || level;
  const color = LEVEL_COLORS[wreathLevel];

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
        "relative overflow-hidden rounded-sm bg-[#0E0E0C] p-5",
        className
      )}
      style={{
        border: `1px solid ${color}25`,
      }}
    >
      {/* Subtle glow */}
      <div
        className="absolute top-0 left-0 w-32 h-32 opacity-[0.08] pointer-events-none"
        style={{
          background: `radial-gradient(circle at top left, ${color}, transparent 70%)`,
        }}
      />

      <div className="relative flex items-start gap-4">
        {/* Wreath icon — replaces shield */}
        <MiniWreath color={color} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-display font-700 uppercase tracking-wider text-[#F5F5F3]">
              {level}
            </span>
          </div>
          <p className="text-xs text-[#717069]">{details.tagline}</p>

          {/* Check marks */}
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
            {details.checks.map((check) => (
              <span key={check} className="flex items-center gap-1 text-[11px] text-[#535862]">
                <CheckCircle2 className="h-3 w-3 shrink-0" style={{ color }} />
                {check}
              </span>
            ))}
          </div>
        </div>

        {/* Score + meta */}
        <div className="shrink-0 text-right">
          <div className="text-3xl font-mono font-bold tabular-nums" style={{ color }}>
            {score}
          </div>
          <div className="text-[10px] text-[#535862] font-medium uppercase tracking-wider">
            /100 {tier}
          </div>
          {formattedDate && (
            <div className="flex items-center gap-1 justify-end mt-1.5 text-[10px] text-[#535862]">
              <Clock className="h-2.5 w-2.5" />
              {formattedDate}
            </div>
          )}
          {level !== "verified" && (
            <div className="flex items-center gap-1 justify-end mt-0.5 text-[10px] text-[#535862]">
              <Users className="h-2.5 w-2.5" />
              {level === "audited" ? "2-3 judges" : "optimized"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
