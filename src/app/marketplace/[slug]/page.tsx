import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchMarketplaceList } from "@/lib/marketplace";
import { MarketplaceBanner } from "@/components/marketplace-banner";
import { MarketplaceGridClient } from "@/components/marketplace-grid-client";

// QO-053-H — daily ISR cadence; QO-053-F batch runner pings revalidatePath
// after persist so pages refresh sooner than 24h when a new batch lands.
export const revalidate = 86400;

const SLUG_DISPLAY: Record<string, string> = {
  sendai: "SendAI",
  "anthropic-skills": "Anthropic Skills",
  "trail-of-bits": "Trail of Bits",
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const display = SLUG_DISPLAY[slug] ?? slug;
  return {
    title: `${display} Skills — Laureum Public Scorecard`,
    description: `Continuously evaluated quality scores for ${display} agent skills. R5 §12 risk surface, 6-axis quality scoring, AQVC verifiable credentials.`,
    openGraph: {
      title: `${display} Skills — Laureum Public Scorecard`,
      description: `Continuously evaluated quality scores for ${display} agent skills.`,
    },
  };
}

export default async function MarketplacePage({ params }: PageProps) {
  const { slug } = await params;
  const data = await fetchMarketplaceList(slug);
  if (!data || data.total === 0) {
    notFound();
  }
  const display = SLUG_DISPLAY[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      <MarketplaceBanner data={data} displayName={display} />
      <MarketplaceGridClient data={data} />
    </main>
  );
}
