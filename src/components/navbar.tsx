"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useBackendHealth } from "@/lib/hooks";
import { BarChart3, Search, Trophy, GitCompareArrows, Layers, Swords, Crown } from "lucide-react";
import { LaurelLogo } from "@/components/laurel-logo";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/evaluate", label: "Evaluate", icon: Search },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/battle", label: "Battle", icon: Swords },
  { href: "/ladder", label: "Ladder", icon: Crown },
  { href: "/compare", label: "Compare", icon: GitCompareArrows },
  { href: "/bulk", label: "Bulk", icon: Layers },
];

export function Navbar() {
  const pathname = usePathname();
  const { isLive } = useBackendHealth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#E5E3E0] bg-[#F5F5F3]/90 backdrop-blur-xl" style={{ transition: "background-color 0.4s var(--ease)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0E0E0C]">
              <LaurelLogo size={16} className="text-[#F5F5F3]" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-foreground">
              Laureum
            </span>
          </Link>

          <div className="flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-all duration-300",
                    isActive
                      ? "bg-[#0E0E0C] text-[#F5F5F3]"
                      : "text-[#535862] hover:text-foreground hover:bg-[#0E0E0C] hover:text-[#F5F5F3]"
                  )}
                  style={{ transitionTimingFunction: "var(--ease)" }}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* Connection Status */}
            <div
              className="ml-2 flex items-center gap-1.5 px-2 py-1.5"
              title={
                isLive === null
                  ? "Checking backend..."
                  : isLive
                  ? "Backend connected"
                  : "Backend offline — using mock fallback"
              }
            >
              {isLive === null ? (
                <div className="h-1.5 w-1.5 rounded-full bg-[#535862]/40 animate-pulse" />
              ) : isLive ? (
                <>
                  <div className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                  <span className="hidden lg:inline text-[10px] text-[#10b981] font-medium uppercase tracking-wider">
                    Live
                  </span>
                </>
              ) : (
                <>
                  <div className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
                  <span className="hidden lg:inline text-[10px] text-[#f59e0b] font-medium uppercase tracking-wider">
                    Offline
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
