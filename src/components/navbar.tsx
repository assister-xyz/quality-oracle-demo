"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useBackendHealth } from "@/lib/hooks";
import { BarChart3, Search, Trophy, GitCompareArrows, Layers, Swords, Crown, Menu, X, CreditCard } from "lucide-react";
import { LaurelLogo } from "@/components/laurel-logo";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/evaluate", label: "Evaluate", icon: Search },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/battle", label: "Battle", icon: Swords },
  { href: "/ladder", label: "Ladder", icon: Crown },
  { href: "/compare", label: "Compare", icon: GitCompareArrows },
  { href: "/bulk", label: "Bulk", icon: Layers },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
];

export function Navbar() {
  const pathname = usePathname();
  const { isLive } = useBackendHealth();
  const isLanding = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navBg = isLanding && !scrolled && !mobileOpen
    ? "bg-transparent border-b border-transparent"
    : "bg-[#F5F5F3]/90 backdrop-blur-xl border-b border-[#E5E3E0]";

  const textColor = isLanding && !scrolled && !mobileOpen;

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          navBg
        )}
        style={{ transitionTimingFunction: "var(--ease)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-sm transition-colors duration-300",
                textColor ? "bg-[#E2754D]/20 border border-[#E2754D]/30" : "bg-[#0E0E0C]"
              )}>
                <LaurelLogo size={20} className="text-[#F5F5F3]" />
              </div>
              <span className={cn(
                "font-display text-lg font-bold tracking-tight transition-colors duration-300",
                textColor ? "text-[#F5F5F3]" : "text-foreground"
              )}>
                Laureum
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-0.5">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[13px] font-medium transition-all duration-300",
                      isActive
                        ? "bg-[#0E0E0C] text-[#F5F5F3]"
                        : textColor
                          ? "text-[#A0A09C] hover:text-[#F5F5F3] hover:bg-white/10"
                          : "text-[#535862] hover:text-foreground hover:bg-[#0E0E0C] hover:text-[#F5F5F3]"
                    )}
                    style={{ transitionTimingFunction: "var(--ease)" }}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
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
                      : "Backend offline"
                }
              >
                {isLive === null ? (
                  <div className="h-1.5 w-1.5 rounded-full bg-[#535862]/40 animate-pulse" />
                ) : isLive ? (
                  <>
                    <div className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                    <span className="text-[10px] text-[#10b981] font-medium uppercase tracking-wider">
                      Live
                    </span>
                  </>
                ) : (
                  <>
                    <div className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
                    <span className="text-[10px] text-[#f59e0b] font-medium uppercase tracking-wider">
                      Offline
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Mobile hamburger */}
            <div className="flex md:hidden items-center gap-2">
              {/* Status dot */}
              <div className={cn(
                "h-1.5 w-1.5 rounded-full",
                isLive === null ? "bg-[#535862]/40 animate-pulse" : isLive ? "bg-[#10b981]" : "bg-[#f59e0b]"
              )} />
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={cn(
                  "p-2 rounded-sm transition-colors",
                  textColor ? "text-[#F5F5F3] hover:bg-white/10" : "text-foreground hover:bg-[#F1EFED]"
                )}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-14 left-0 right-0 bg-[#F5F5F3] border-b border-[#E5E3E0] shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#0E0E0C] text-[#F5F5F3]"
                        : "text-[#535862] hover:text-foreground hover:bg-[#F1EFED]"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
