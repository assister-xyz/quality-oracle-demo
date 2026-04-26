"use client";

import { useState } from "react";
import { Code2, Copy, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmbedKitProps {
  marketplaceSlug: string;
  skillSlug: string;
  skillName: string;
  score: number;
  tier: string;
}

/**
 * EmbedKit modal — single Markdown/HTML format for the Top-3 sprint.
 * Multi-format tabs (npm badge URL, PDF, SVG variants) deferred to QO-053-H2.
 */
export function EmbedKit({
  marketplaceSlug,
  skillSlug,
  skillName,
  score,
  tier,
}: EmbedKitProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002";
  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/marketplace/${marketplaceSlug}/${skillSlug}`
      : `https://laureum.ai/marketplace/${marketplaceSlug}/${skillSlug}`;
  const badgeUrl = `${apiUrl}/v1/badge/${skillSlug}.svg`;

  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
  const markdown = `[![Laureum ${tierLabel} ${score}/100](${badgeUrl})](${publicUrl})`;
  const html = `<a href="${publicUrl}"><img src="${badgeUrl}" alt="Laureum ${tierLabel} ${score}/100 — ${skillName}" height="80" /></a>`;

  const onCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-1.5"
        data-testid="embed-kit-open"
      >
        <Code2 className="h-3.5 w-3.5" />
        Embed badge
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-[#0E0E0C]/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="embed-kit-title"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-sm max-w-xl w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-[#717069] hover:text-[#0E0E0C]"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 id="embed-kit-title" className="text-lg font-display font-700 text-[#0E0E0C] mb-1">
              Embed Laureum badge
            </h2>
            <p className="text-sm text-[#717069] mb-5">
              Show your verified score on GitHub or your docs site.
            </p>

            <CopyBlock
              label="Markdown"
              code={markdown}
              copied={copied === "md"}
              onCopy={() => onCopy("md", markdown)}
            />
            <CopyBlock
              label="HTML"
              code={html}
              copied={copied === "html"}
              onCopy={() => onCopy("html", html)}
            />

            <p className="mt-3 text-xs text-[#717069]">
              Additional formats (npm badge URL, PDF export, SVG variants) ship in v1.1.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function CopyBlock({
  label,
  code,
  copied,
  onCopy,
}: {
  label: string;
  code: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs uppercase tracking-wider text-[#717069]">{label}</span>
        <button
          type="button"
          onClick={onCopy}
          className="text-xs text-[#E2754D] hover:underline flex items-center gap-1"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="bg-[#0E0E0C]/[0.04] border border-[#0E0E0C]/8 rounded-sm p-3 text-xs font-mono text-[#0E0E0C] overflow-x-auto whitespace-pre-wrap break-all">
        {code}
      </pre>
    </div>
  );
}
