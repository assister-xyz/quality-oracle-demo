import { ImageResponse } from "next/og";
import { fetchSkillDetail } from "@/lib/marketplace";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Laureum skill scorecard";

const TIER_COLOR: Record<string, string> = {
  expert: "#FFD700",
  proficient: "#C0C0C0",
  basic: "#C38133",
  failed: "#9e3b3b",
};

export default async function SkillOgImage({
  params,
}: {
  params: { slug: string; skill: string };
}) {
  const detail = await fetchSkillDetail(params.slug, params.skill).catch(() => null);
  const name = detail?.name ?? params.skill;
  const score = detail?.score ?? 0;
  const tier = detail?.tier ?? "failed";
  const provider = detail?.activation_provider ?? "cerebras:llama3.1-8b";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0E0E0C",
          color: "#F5F5F3",
          display: "flex",
          padding: "80px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 22,
              color: "#717069",
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            Laureum · {params.slug}
          </div>
          <div style={{ fontSize: 88, fontWeight: 700, marginTop: 28, lineHeight: 1.05 }}>
            {name}
          </div>
          <div style={{ fontSize: 22, color: "#A0A09C", fontFamily: "monospace", marginTop: 12 }}>
            {provider}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 20, color: "#A0A09C" }}>
            laureum.ai/marketplace/{params.slug}/{params.skill}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 200, fontWeight: 800, fontFamily: "monospace" }}>{score}</span>
            <span style={{ fontSize: 40, color: "#717069" }}>/100</span>
          </div>
          <div
            style={{
              fontSize: 28,
              padding: "10px 24px",
              border: `2px solid ${TIER_COLOR[tier]}`,
              color: TIER_COLOR[tier],
              borderRadius: 6,
              textTransform: "uppercase",
              letterSpacing: 4,
              fontWeight: 700,
            }}
          >
            {tier}
          </div>
          {/* Laurel marker (simple SVG-as-text glyph) */}
          <div style={{ fontSize: 50, color: TIER_COLOR[tier] }}>🏛</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
