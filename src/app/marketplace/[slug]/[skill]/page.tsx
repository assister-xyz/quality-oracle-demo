import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, ChevronRight } from "lucide-react";
import { fetchSkillDetail } from "@/lib/marketplace";
import { TierBadge } from "@/components/tier-badge";
import { ScoreDelta } from "@/components/score-delta";
import { ProbeResultRow } from "@/components/probe-result-row";
import { AQVCChip } from "@/components/aqvc-chip";
import { EmbedKit } from "@/components/embed-kit";
import { RadarWithNA } from "@/components/radar-with-na";
import type { QualityTier } from "@/lib/mock-data";

export const revalidate = 86400;

interface PageProps {
  params: Promise<{ slug: string; skill: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, skill } = await params;
  const detail = await fetchSkillDetail(slug, skill);
  if (!detail) return { title: "Skill not found — Laureum" };
  return {
    title: `${detail.name} — Laureum Scorecard (${detail.score}/100)`,
    description: `${detail.name} scored ${detail.score}/100 on Laureum. Activation: ${detail.activation_provider}. Last evaluated ${detail.last_eval_at ?? "—"}.`,
    openGraph: {
      title: `${detail.name} — ${detail.score}/100 (${detail.tier})`,
      description: `Verified by Laureum under ${detail.activation_provider}`,
    },
  };
}

export default async function SkillDetailPage({ params }: PageProps) {
  const { slug, skill } = await params;
  const detail = await fetchSkillDetail(slug, skill);
  if (!detail) notFound();

  const baselineAxes =
    detail.delta_vs_baseline != null && detail.baseline_score != null
      ? Object.fromEntries(
          Object.entries(detail.axes).map(([k, v]) => [
            k,
            Math.max(0, Math.min(100, v - detail.delta_vs_baseline!)),
          ]),
        )
      : undefined;

  const lastEval = detail.last_eval_at
    ? new Date(detail.last_eval_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      {/* Header */}
      <div className="bg-[#0E0E0C] pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-[#717069] mb-4">
            <Link href="/" className="hover:text-[#F5F5F3]">
              Laureum
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/marketplace/${slug}`} className="hover:text-[#F5F5F3]">
              /marketplace/{slug}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#F5F5F3]">{detail.name}</span>
          </nav>

          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-5xl font-display font-700 text-[#F5F5F3] tracking-tight">
                {detail.name}
              </h1>
              <p className="font-mono text-xs text-[#717069] mt-2 uppercase tracking-wider">
                {detail.activation_provider}
              </p>
              {detail.github_url && (
                <a
                  href={detail.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[#A0A09C] hover:text-[#E2754D] mt-3"
                >
                  {detail.owner ?? "GitHub"} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-5xl font-bold text-[#F5F5F3]">{detail.score}</span>
                <span className="text-lg text-[#717069]">/100</span>
              </div>
              <TierBadge tier={detail.tier as QualityTier} />
              <div className="text-xs text-[#717069] font-mono">Last eval {lastEval}</div>
            </div>
          </div>

          <p className="mt-6 text-xs text-[#A0A09C] max-w-2xl">
            Scored under{" "}
            <span className="text-[#F5F5F3] font-mono">Llama-3.1-8B</span> activation; Claude Code
            activation available at Audited tier.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Differential / Radar */}
          {baselineAxes ? (
            <ScoreDelta
              activatedAxes={detail.axes}
              baselineAxes={baselineAxes}
              naAxes={detail.na_axes}
              delta={detail.delta_vs_baseline}
              baselineScore={detail.baseline_score}
              activatedScore={detail.score}
            />
          ) : (
            <div className="bg-white border border-[#0E0E0C]/8 rounded-sm p-5">
              <h3 className="text-sm font-display font-600 uppercase tracking-wider text-[#717069] mb-3">
                Quality Profile
              </h3>
              <RadarWithNA axes={detail.axes} naAxes={detail.na_axes} height={320} />
            </div>
          )}

          {/* Probe results */}
          <div className="bg-white border border-[#0E0E0C]/8 rounded-sm">
            <div className="px-5 py-4 border-b border-[#0E0E0C]/8">
              <h3 className="text-sm font-display font-600 uppercase tracking-wider text-[#717069]">
                Probe Results
              </h3>
              <p className="text-xs text-[#717069] mt-1">
                R5 §12 attack surface + skill-spec compliance probes.
              </p>
            </div>
            <div data-testid="probe-list">
              {detail.probe_results.length === 0 ? (
                <div className="px-5 py-6 text-sm text-[#717069]">
                  No probe results recorded for this evaluation.
                </div>
              ) : (
                detail.probe_results.map((p, i) => (
                  <ProbeResultRow key={p.probe_id ?? `${p.probe_type}-${i}`} probe={p} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="bg-white border border-[#0E0E0C]/8 rounded-sm p-5">
            <h3 className="text-sm font-display font-600 uppercase tracking-wider text-[#717069] mb-3">
              R5 Risk Score
            </h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span
                className={`font-mono text-4xl font-bold ${
                  detail.r5_risk_score >= 7 ? "text-[#9e3b3b]" : "text-[#0E0E0C]"
                }`}
              >
                {detail.r5_risk_score.toFixed(1)}
              </span>
              <span className="text-sm text-[#717069]">/10</span>
            </div>
            <p className="text-xs text-[#717069]">
              Higher = more attack surface. Tooltip: per Drift Apr 2026 vector — see R5 §12.
            </p>
          </div>

          <AQVCChip marketplaceSlug={slug} skillSlug={skill} />

          <div className="bg-white border border-[#0E0E0C]/8 rounded-sm p-5">
            <h3 className="text-sm font-display font-600 uppercase tracking-wider text-[#717069] mb-3">
              Embed
            </h3>
            <EmbedKit
              marketplaceSlug={slug}
              skillSlug={skill}
              skillName={detail.name}
              score={detail.score}
              tier={detail.tier}
            />
          </div>

          {/* Activation provider transparency footer */}
          <div className="bg-[#E2754D]/8 border border-[#E2754D]/30 rounded-sm p-4">
            <div className="text-xs uppercase tracking-wider text-[#E2754D] mb-1">
              Activation provider
            </div>
            <div className="font-mono text-sm text-[#0E0E0C]">{detail.activation_provider}</div>
            <p className="text-xs text-[#717069] mt-2">
              Scored under {detail.activation_provider}; upgrade to{" "}
              <span className="font-mono">anthropic:claude-sonnet-4-5</span> for higher-fidelity at
              the Audited tier.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
