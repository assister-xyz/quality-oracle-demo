import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/tier-badge";
import { ExternalLink, TrendingDown, TrendingUp } from "lucide-react";

type Dimensions = {
  accuracy?: number;
  safety?: number;
  process_quality?: number;
  reliability?: number;
  latency?: number;
  schema_quality?: number;
};

type ScoreItem = {
  target_id: string;
  target_type: string;
  score: number;
  tier: "expert" | "proficient" | "basic" | "failed";
  confidence?: number;
  dimensions?: Dimensions;
  last_evaluated_at?: string;
};

type ScoresResponse = {
  items: ScoreItem[];
  total: number;
  limit: number;
  offset: number;
};

export const metadata: Metadata = {
  title: "April 2026 MCP Quality Report — Laureum",
  description:
    "Independent quality scoring of 30+ public MCP servers. 6-axis evaluation — accuracy, safety, reliability, process quality, latency, schema quality — with adversarial probes. Updated April 2026.",
  openGraph: {
    title: "April 2026 MCP Quality Report — Laureum",
    description:
      "How the most-used public MCP servers score on safety, reliability, and process quality.",
    images: ["/og-image.png"],
  },
};

export const revalidate = 3600;

async function getScores(): Promise<ScoresResponse | null> {
  const base = process.env.NEXT_PUBLIC_API_URL?.trim();
  const key = process.env.NEXT_PUBLIC_API_KEY?.trim();
  if (!base || !key) return null;

  try {
    const res = await fetch(`${base}/v1/scores?limit=100`, {
      headers: { "X-API-Key": key },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as ScoresResponse;
  } catch {
    return null;
  }
}

const DIMENSION_META: Array<{
  key: keyof Dimensions;
  label: string;
  weight: number;
  description: string;
}> = [
  { key: "accuracy", label: "Accuracy", weight: 35, description: "Tool-call correctness across 6-axis judge consensus" },
  { key: "safety", label: "Safety", weight: 20, description: "Adversarial probes — injection, PII, overflow, hallucination" },
  { key: "reliability", label: "Reliability", weight: 15, description: "Consistency across repeated invocations" },
  { key: "process_quality", label: "Process Quality", weight: 10, description: "Error handling, input validation, response structure" },
  { key: "latency", label: "Latency", weight: 10, description: "Response time distribution under realistic load" },
  { key: "schema_quality", label: "Schema Quality", weight: 10, description: "Tool descriptions, input schemas, manifest completeness" },
];

export default async function Report() {
  const data = await getScores();

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0a08] text-[#E5E5E3]">
        <PageHeader eyebrow="Quality Report" title="April 2026 MCP Quality Report" />
        <div className="max-w-4xl mx-auto px-6 py-16">
          <Card className="bg-[#1a1a18] border-[#2a2a28]">
            <CardContent className="p-8">
              <p className="text-[#A0A09C]">
                Report data is temporarily unavailable. Please try again in a few minutes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const items = data.items || [];
  const valid = items.filter((it) => it.score > 0);
  const experts = valid.filter((it) => it.tier === "expert" && it.score >= 85).sort((a, b) => b.score - a.score);
  const proficient = valid.filter((it) => it.tier === "proficient").length;
  const basic = valid.filter((it) => it.tier === "basic").length;
  const failed = valid.filter((it) => it.tier === "failed").length;

  const avgScore =
    valid.length > 0
      ? Math.round((valid.reduce((s, it) => s + it.score, 0) / valid.length) * 10) / 10
      : 0;

  const dimensionAverages: Record<string, number> = {};
  for (const meta of DIMENSION_META) {
    const values = valid
      .map((it) => it.dimensions?.[meta.key])
      .filter((v): v is number => typeof v === "number");
    dimensionAverages[meta.key] =
      values.length > 0
        ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
        : 0;
  }

  const weakestDim = [...DIMENSION_META].sort(
    (a, b) => dimensionAverages[a.key] - dimensionAverages[b.key],
  )[0];
  const strongestDim = [...DIMENSION_META].sort(
    (a, b) => dimensionAverages[b.key] - dimensionAverages[a.key],
  )[0];

  const top10 = [...valid].sort((a, b) => b.score - a.score).slice(0, 10);

  function renderHost(url: string): string {
    try {
      const u = new URL(url);
      return `${u.host}${u.pathname}`.replace(/\/$/, "");
    } catch {
      return url;
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a08] text-[#E5E5E3]">
      <PageHeader eyebrow="Quality Report" title="April 2026 MCP Quality Report" />

      <main className="max-w-5xl mx-auto px-6 pb-24">
        {/* Hero */}
        <section className="pt-8 pb-12 border-b border-[#2a2a28]">
          <Badge className="bg-[#E2754D]/10 text-[#E2754D] border-[#E2754D]/20 mb-4">
            Published April 2026
          </Badge>
          <h1 className="text-3xl md:text-4xl font-display font-600 text-[#F5F5F3] mb-4">
            {valid.length} public MCP servers, scored on 6 dimensions
          </h1>
          <p className="text-[#A0A09C] text-lg leading-relaxed mb-6">
            Laureum evaluates MCP servers with a multi-judge LLM consensus pipeline and
            OWASP-aligned adversarial probes. This report covers the state of the public
            MCP ecosystem as of April 2026 — {valid.length} live, publicly-reachable
            servers evaluated via our{" "}
            <Link href="/evaluate" className="text-[#E2754D] hover:underline">
              Quick Scan
            </Link>{" "}
            pipeline.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/evaluate"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#E2754D] text-white rounded-sm hover:bg-[#D66540] transition-colors font-medium"
            >
              Scan your server free
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 px-4 py-2 border border-[#2a2a28] hover:border-[#535862] rounded-sm text-[#E5E5E3] transition-colors"
            >
              Full leaderboard
            </Link>
          </div>
        </section>

        {/* Headline numbers */}
        <section className="py-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[#1a1a18] border-[#2a2a28]">
            <CardContent className="p-5">
              <div className="text-xs uppercase tracking-wider text-[#535862] mb-2">
                Servers scored
              </div>
              <div className="text-3xl font-mono font-500 text-[#F5F5F3]">
                {valid.length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a18] border-[#2a2a28]">
            <CardContent className="p-5">
              <div className="text-xs uppercase tracking-wider text-[#535862] mb-2">
                Average score
              </div>
              <div className="text-3xl font-mono font-500 text-[#F5F5F3]">
                {avgScore}
                <span className="text-sm text-[#535862]">/100</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a18] border-[#2a2a28]">
            <CardContent className="p-5">
              <div className="text-xs uppercase tracking-wider text-[#535862] mb-2">
                Expert tier (≥85)
              </div>
              <div className="text-3xl font-mono font-500 text-[#E2754D]">
                {experts.length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a18] border-[#2a2a28]">
            <CardContent className="p-5">
              <div className="text-xs uppercase tracking-wider text-[#535862] mb-2">
                Weakest dimension
              </div>
              <div className="text-2xl font-mono font-500 text-[#F5F5F3]">
                {dimensionAverages[weakestDim.key]}
              </div>
              <div className="text-xs text-[#A0A09C] mt-1">{weakestDim.label}</div>
            </CardContent>
          </Card>
        </section>

        {/* Tier distribution */}
        <section className="py-8">
          <h2 className="text-xl font-display font-600 text-[#F5F5F3] mb-4">
            Tier distribution
          </h2>
          <div className="grid grid-cols-4 gap-3">
            <TierCard label="Expert" count={experts.length} total={valid.length} color="#E2754D" range="85–100" />
            <TierCard label="Proficient" count={proficient} total={valid.length} color="#F59E0B" range="70–84" />
            <TierCard label="Basic" count={basic} total={valid.length} color="#71717A" range="50–69" />
            <TierCard label="Failed" count={failed} total={valid.length} color="#9e3b3b" range="0–49" />
          </div>
        </section>

        {/* Dimension averages */}
        <section className="py-8">
          <h2 className="text-xl font-display font-600 text-[#F5F5F3] mb-2">
            6-dimension ecosystem averages
          </h2>
          <p className="text-sm text-[#A0A09C] mb-6">
            Weighted composite across {valid.length} servers. Weakest:{" "}
            <span className="text-[#F5F5F3] font-mono">
              {weakestDim.label} ({dimensionAverages[weakestDim.key]})
            </span>
            . Strongest:{" "}
            <span className="text-[#F5F5F3] font-mono">
              {strongestDim.label} ({dimensionAverages[strongestDim.key]})
            </span>
            .
          </p>
          <div className="space-y-3">
            {DIMENSION_META.map((meta) => {
              const value = dimensionAverages[meta.key];
              const isWeakest = meta.key === weakestDim.key;
              const isStrongest = meta.key === strongestDim.key;
              return (
                <div key={meta.key} className="p-4 bg-[#1a1a18] border border-[#2a2a28] rounded-sm">
                  <div className="flex items-baseline justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#F5F5F3]">{meta.label}</span>
                      <span className="text-xs text-[#535862] font-mono">({meta.weight}% weight)</span>
                      {isWeakest && (
                        <Badge variant="outline" className="border-[#9e3b3b]/40 text-[#9e3b3b] text-[10px]">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          weakest
                        </Badge>
                      )}
                      {isStrongest && (
                        <Badge variant="outline" className="border-[#E2754D]/40 text-[#E2754D] text-[10px]">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          strongest
                        </Badge>
                      )}
                    </div>
                    <span className="text-base font-mono text-[#F5F5F3]">
                      {value}
                      <span className="text-xs text-[#535862]">/100</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#2a2a28] rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full ${
                        isWeakest ? "bg-[#9e3b3b]" : isStrongest ? "bg-[#E2754D]" : "bg-[#F59E0B]"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#A0A09C]">{meta.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Top 10 */}
        <section className="py-8">
          <h2 className="text-xl font-display font-600 text-[#F5F5F3] mb-4">Top 10</h2>
          <Card className="bg-[#1a1a18] border-[#2a2a28]">
            <CardContent className="p-0">
              <div className="divide-y divide-[#2a2a28]">
                {top10.map((it, i) => (
                  <a
                    key={it.target_id}
                    href={it.target_id}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 hover:bg-[#0f0f0d] transition-colors"
                  >
                    <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[#2a2a28] text-xs font-mono text-[#F5F5F3]">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-[#F5F5F3] truncate font-mono">
                        {renderHost(it.target_id)}
                      </div>
                    </div>
                    <TierBadge tier={it.tier} />
                    <div className="text-right min-w-[64px]">
                      <div className="text-lg font-mono font-500 text-[#F5F5F3]">
                        {it.score}
                      </div>
                      <div className="text-[10px] text-[#535862]">/100</div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-[#535862] flex-shrink-0" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="mt-3 text-center">
            <Link
              href="/leaderboard"
              className="text-sm text-[#E2754D] hover:underline inline-flex items-center gap-1"
            >
              See full leaderboard →
            </Link>
          </div>
        </section>

        {/* Methodology */}
        <section className="py-8 border-t border-[#2a2a28]">
          <h2 className="text-xl font-display font-600 text-[#F5F5F3] mb-4">Methodology</h2>
          <div className="prose prose-invert max-w-none text-[#A0A09C] space-y-4">
            <p>
              Every server is evaluated with a 3-level pipeline: manifest validation (schema
              completeness, tool descriptions), functional testing (live tool calls with
              auto-generated inputs, scored by multi-judge LLM consensus), and adversarial
              probes aligned with the OWASP LLM Top 10 — prompt injection, sensitive
              information disclosure, system prompt leakage, hallucination, and boundary
              overflow.
            </p>
            <p>
              Judges rotate across Cerebras (<code>llama3.1-8b</code>), Groq (<code>llama-3.1-8b-instant</code>),
              and OpenRouter (<code>qwen3-next-80b-a3b</code>) with fuzzy fallback. When two
              judges agree within 15 points, their average is used; when they disagree, a
              third tiebreaker judge is called and the median is taken.
            </p>
            <p>
              The 6-axis score is a weighted composite: accuracy (35%), safety (20%),
              reliability (15%), process quality (10%), latency (10%), schema quality
              (10%). Process quality itself decomposes into error handling (40%), input
              validation (30%), and response structure (30%).
            </p>
            <p>
              Servers are scored as live services over HTTPS. Servers requiring API-key
              signup are excluded from this report. All data is sourced from our
              production API and refreshes hourly.
            </p>
            <p className="text-xs text-[#535862]">
              Questions about this report? <Link href="/evaluate" className="text-[#E2754D] hover:underline">
                Run your own evaluation
              </Link>{" "}
              or DM{" "}
              <a href="https://x.com/laureum_ai" className="text-[#E2754D] hover:underline">
                @laureum_ai
              </a>
              .
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

function TierCard({
  label,
  count,
  total,
  color,
  range,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  range: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <Card className="bg-[#1a1a18] border-[#2a2a28]">
      <CardContent className="p-4">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-sm font-medium text-[#F5F5F3]">{label}</span>
          <span className="text-xs text-[#535862] font-mono">{range}</span>
        </div>
        <div className="text-2xl font-mono font-500" style={{ color }}>
          {count}
        </div>
        <div className="text-xs text-[#535862] mt-1">{pct}% of scored</div>
      </CardContent>
    </Card>
  );
}
