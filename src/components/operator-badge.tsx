"use client";

/**
 * QO-048: Operator Badge (QO-044/046 output)
 *
 * Renders a verified operator pill with GitHub avatar + username.
 * Falls back to "Anonymous" if no operator_identity is set.
 */
import { ShieldCheck, User } from "lucide-react";
import type { OperatorIdentity } from "@/lib/api";

interface Props {
  operator?: OperatorIdentity | null;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function OperatorBadge({ operator, size = "md", showLabel = true }: Props) {
  const avatarSize = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  const textSize = size === "sm" ? "text-[11px]" : "text-xs";

  if (!operator) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full bg-[#F1EFED] px-2 py-0.5 ${textSize} text-[#6B6964]`}>
        <User className={iconSize} />
        {showLabel && <span>Anonymous</span>}
      </div>
    );
  }

  const isVerified = operator.verified && operator.github_username;

  return (
    <div className="inline-flex items-center gap-1.5">
      {operator.github_avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={operator.github_avatar_url}
          alt={operator.github_username || operator.display_name}
          className={`${avatarSize} rounded-full border border-[#E5E3E0]`}
        />
      ) : (
        <div className={`${avatarSize} rounded-full bg-[#F1EFED] flex items-center justify-center`}>
          <User className={iconSize} />
        </div>
      )}
      {showLabel && (
        <>
          <span className={`${textSize} font-medium text-[#0E0E0C]`}>
            {operator.github_username || operator.display_name}
          </span>
          {isVerified && (
            <span title="Verified by GitHub">
              <ShieldCheck className={`${iconSize} text-[#10b981]`} />
            </span>
          )}
        </>
      )}
    </div>
  );
}
