"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useBackendHealth } from "@/lib/hooks";
import { Shield, BarChart3, Search, Trophy, GitCompareArrows, Layers } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/evaluate", label: "Evaluate", icon: Search },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/compare", label: "Compare", icon: GitCompareArrows },
  { href: "/bulk", label: "Bulk", icon: Layers },
];

export function Navbar() {
  const pathname = usePathname();
  const { isLive } = useBackendHealth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#E9EAEB] bg-white/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#181D27]">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              AgentTrust
            </span>
            <span className="hidden sm:inline-flex items-center rounded-full bg-[#181D27] px-2 py-0.5 text-[10px] font-medium text-white">
              DEMO
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#181D27] text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-[#181D27] hover:text-white"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* Connection Status Indicator */}
            <div
              className="ml-2 flex items-center gap-1.5 rounded-lg px-2 py-1.5"
              title={
                isLive === null
                  ? "Checking backend..."
                  : isLive
                  ? "Backend connected"
                  : "Backend offline — using mock fallback"
              }
            >
              {isLive === null ? (
                <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse" />
              ) : isLive ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-[#10b981]" />
                  <span className="hidden lg:inline text-[10px] text-[#10b981] font-medium">
                    LIVE
                  </span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                  <span className="hidden lg:inline text-[10px] text-[#f59e0b] font-medium">
                    OFFLINE
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
