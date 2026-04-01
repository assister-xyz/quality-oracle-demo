import type { Metadata } from "next";
import { AgentProfileClient } from "./client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const targetId = decodeURIComponent(id);

  // Infer name from URL
  let name = targetId;
  try {
    const hostname = new URL(targetId).hostname;
    name = hostname
      .replace(/^(mcp\.|docs\.|www\.)/, "")
      .replace(/\.(com|io|dev|ai|co|tech|build|markets)$/, "")
      .split(".")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  } catch {
    // Not a URL, use as-is
  }

  const ogImageUrl = `${API_URL}/v1/og/${encodeURIComponent(targetId)}.png`;

  return {
    title: `${name} — Laureum Quality Score`,
    description: `View the quality evaluation results for ${name} on Laureum.ai. Multi-judge consensus scoring across 6 dimensions.`,
    openGraph: {
      title: `${name} — Laureum Quality Score`,
      description: `Quality evaluation results for ${name}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 675,
          alt: `Laureum Quality Score for ${name}`,
        },
      ],
      type: "website",
      siteName: "Laureum.ai",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — Laureum Quality Score`,
      description: `Quality evaluation results for ${name}`,
      images: [ogImageUrl],
    },
  };
}

export default async function AgentProfilePage({ params }: Props) {
  const { id } = await params;
  return <AgentProfileClient targetId={decodeURIComponent(id)} />;
}
