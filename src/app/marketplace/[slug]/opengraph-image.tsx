import { ImageResponse } from "next/og";
import { fetchMarketplaceList } from "@/lib/marketplace";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Laureum public scorecard";

const SLUG_DISPLAY: Record<string, string> = {
  sendai: "SendAI",
  "anthropic-skills": "Anthropic Skills",
  "trail-of-bits": "Trail of Bits",
};

export default async function MarketplaceOgImage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await fetchMarketplaceList(params.slug).catch(() => null);
  const display = SLUG_DISPLAY[params.slug] ?? params.slug;
  const total = data?.total ?? 0;
  const avg = data?.avg_score ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0E0E0C",
          color: "#F5F5F3",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ fontSize: 24, color: "#717069", letterSpacing: 4, textTransform: "uppercase" }}>
          Laureum · Public Scorecard
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginTop: 24 }}>
          <span style={{ fontSize: 110, fontWeight: 700 }}>{display}</span>
          <span style={{ fontSize: 60, color: "#E2754D", fontWeight: 700 }}>Skills</span>
        </div>
        <div style={{ display: "flex", gap: 60, marginTop: 64 }}>
          <Stat label="Skills" value={total.toString()} />
          <Stat label="Avg Score" value={`${avg}/100`} />
          <Stat label="Activation" value="Llama-3.1-8B" mono />
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 22, color: "#A0A09C" }}>
          laureum.ai/marketplace/{params.slug}
        </div>
      </div>
    ),
    { ...size },
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span
        style={{
          fontSize: mono ? 36 : 56,
          fontFamily: mono ? "monospace" : "Inter, sans-serif",
          fontWeight: 700,
        }}
      >
        {value}
      </span>
      <span style={{ fontSize: 18, color: "#717069", letterSpacing: 3, textTransform: "uppercase" }}>
        {label}
      </span>
    </div>
  );
}
