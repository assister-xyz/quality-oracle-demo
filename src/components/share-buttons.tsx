"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, Linkedin } from "lucide-react";

// X/Twitter icon as inline SVG (lucide doesn't have the X logo)
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface ShareButtonsProps {
  score: number;
  tier: string;
  agentName: string;
  agentUrl: string;
  percentile?: number;
  className?: string;
}

export function ShareButtons({
  score,
  tier,
  agentName,
  agentUrl,
  percentile,
  className = "",
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const profileUrl = `https://laureum.ai/agent/${encodeURIComponent(agentUrl)}`;
  const topPct = percentile != null ? Math.max(1, 100 - percentile) : null;

  const tierLabel = tier === "failed" ? "Evaluated" : tier.charAt(0).toUpperCase() + tier.slice(1);

  const tweetText = [
    `${agentName} scored ${score}/100 on @LaureumAI`,
    topPct != null ? `— Top ${topPct}%!` : `— ${tierLabel}`,
    `\n\nEvaluate yours:`,
  ].join(" ");

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(profileUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [profileUrl]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-medium mr-1">
        Share
      </span>

      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs"
        asChild
      >
        <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
          <XIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Post</span>
        </a>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs"
        asChild
      >
        <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
          <Linkedin className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Share</span>
        </a>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs"
        onClick={handleCopyLink}
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-green-600" />
            <span className="hidden sm:inline">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Copy Link</span>
          </>
        )}
      </Button>
    </div>
  );
}
