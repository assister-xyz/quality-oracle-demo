"use client";

import { useState } from "react";
import { FileJson, Download, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AQVCChipProps {
  marketplaceSlug: string;
  skillSlug: string;
  /** When true, renders the verify-on-chain CTA. */
  onChainEnabled?: boolean;
}

/**
 * AQVC chip: preview + download .json + verify-on-chain CTA.
 * Consumes from QO-053-I `/v1/marketplace/{slug}/{skill}/aqvc.json`.
 */
export function AQVCChip({ marketplaceSlug, skillSlug, onChainEnabled = false }: AQVCChipProps) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002";
  const aqvcUrl = `${apiUrl}/v1/marketplace/${marketplaceSlug}/${skillSlug}/aqvc.json`;

  const onDownload = async () => {
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch(aqvcUrl);
      if (!res.ok) throw new Error(`backend ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${skillSlug}-aqvc.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="bg-white border border-[#E2754D]/30 rounded-sm p-4"
      data-testid="aqvc-chip"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-sm bg-[#E2754D]/10 flex items-center justify-center">
          <FileJson className="h-5 w-5 text-[#E2754D]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-display font-600 text-[#0E0E0C]">
            AQVC Credential
          </div>
          <div className="text-xs text-[#717069]">
            Signed by <span className="font-mono">did:web:laureum.ai</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={onDownload}
          disabled={downloading}
          className="gap-1.5"
          data-testid="aqvc-download"
        >
          <Download className="h-3.5 w-3.5" />
          {downloading ? "Downloading…" : "Download AQVC"}
        </Button>
        <Button size="sm" variant="outline" asChild>
          <a href={aqvcUrl} target="_blank" rel="noopener noreferrer" className="gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            Preview
          </a>
        </Button>
        {onChainEnabled && (
          <Button size="sm" variant="outline" disabled title="On-chain verification — coming Q2">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verify on-chain
          </Button>
        )}
      </div>

      {error && (
        <div className="mt-3 text-xs text-[#9e3b3b] bg-[#9e3b3b]/8 border border-[#9e3b3b]/30 rounded-sm px-3 py-2">
          {error}
        </div>
      )}
    </div>
  );
}
