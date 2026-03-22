"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Swords, Zap, Trophy, Copy, Image, Clock, AlertCircle, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { createBattle, getBattle, getMatchPrediction, type BattleResult, type MatchPrediction } from "@/lib/api";
import { useBattleStatus } from "@/lib/hooks";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002";

const AXES: { key: string; label: string; color: string }[] = [
  { key: "accuracy", label: "Accuracy", color: "#E2754D" },
  { key: "safety", label: "Safety", color: "#DB5F94" },
  { key: "process_quality", label: "Process", color: "#8b5cf6" },
  { key: "reliability", label: "Reliability", color: "#3b82f6" },
  { key: "latency", label: "Latency", color: "#10b981" },
  { key: "schema_quality", label: "Schema", color: "#f59e0b" },
];

function BattleContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const existingBattleId = searchParams.get("id");

  const [urlA, setUrlA] = useState("");
  const [urlB, setUrlB] = useState("");
  const [prediction, setPrediction] = useState<MatchPrediction | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [battleId, setBattleId] = useState<string | null>(existingBattleId);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"input" | "vs" | "running" | "result">(existingBattleId ? "running" : "input");
  const [copied, setCopied] = useState(false);

  const { battle, error: pollError } = useBattleStatus(battleId);

  // Phase transitions based on battle status
  if (battle?.status === "completed" && phase !== "result") {
    setPhase("result");
  }
  if (battle?.status === "running" && phase === "vs") {
    setPhase("running");
  }

  const handlePredict = async () => {
    setError(null);
    setPredicting(true);
    try {
      // For prediction, we'd need target IDs. Use a simple hash approach for now.
      const pred = await getMatchPrediction(
        btoa(urlA).slice(0, 16),
        btoa(urlB).slice(0, 16),
      );
      setPrediction(pred);
    } catch {
      // Prediction is optional — show a neutral prediction if API unavailable
      setPrediction({
        agent_a_id: "a",
        agent_b_id: "b",
        win_probability_a: 0.5,
        win_probability_b: 0.5,
        match_quality: 0.75,
        recommendation: "good_match",
      });
    } finally {
      setPredicting(false);
    }
  };

  const handleStartBattle = async () => {
    setError(null);
    setStarting(true);
    try {
      const res = await createBattle(urlA, urlB);
      setBattleId(res.battle_id);
      setPhase("vs");
      // Transition to running after brief VS display
      setTimeout(() => setPhase("running"), 2000);
      router.replace(`/battle?id=${res.battle_id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to start battle");
    } finally {
      setStarting(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/battle?id=${battleId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── INPUT PHASE ──
  if (phase === "input") {
    return (
      <div>
        <PageHeader
          eyebrow="Battle Arena"
          title="Head-to-Head"
          accent="Battle"
          description="Pit two AI agents against each other with identical challenges. See who comes out on top."
        />
        <div className="mx-auto max-w-3xl px-4 py-8">

        <div className="rounded-sm border border-[#E5E3E0] bg-white p-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-6 items-end">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Agent A</label>
              <input
                type="url"
                value={urlA}
                onChange={(e) => setUrlA(e.target.value)}
                placeholder="https://agent-a.example.com/mcp"
                className="w-full rounded-sm border border-[#E5E3E0] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E2754D]/20 focus:border-[#E2754D]"
              />
            </div>
            <div className="flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-[#0E0E0C] flex items-center justify-center">
                <span className="text-lg font-black text-[#ef4444]">VS</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Agent B</label>
              <input
                type="url"
                value={urlB}
                onChange={(e) => setUrlB(e.target.value)}
                placeholder="https://agent-b.example.com/mcp"
                className="w-full rounded-sm border border-[#E5E3E0] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E2754D]/20 focus:border-[#E2754D]"
              />
            </div>
          </div>

          {/* Prediction */}
          {prediction && (
            <div className="mt-6 rounded-sm border border-[#E5E3E0] bg-[#F1EFED] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">Match Prediction</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  prediction.recommendation === "good_match"
                    ? "bg-[#10b981]/10 text-[#10b981]"
                    : prediction.recommendation === "one_sided"
                    ? "bg-[#f59e0b]/10 text-[#f59e0b]"
                    : "bg-[#ef4444]/10 text-[#ef4444]"
                }`}>
                  {prediction.recommendation === "good_match" ? "Good Match" :
                   prediction.recommendation === "one_sided" ? "One-Sided" : "Too Unbalanced"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-[#3b82f6]">{Math.round(prediction.win_probability_a * 100)}%</div>
                  <div className="text-xs text-muted-foreground">Agent A wins</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{Math.round(prediction.match_quality * 100)}%</div>
                  <div className="text-xs text-muted-foreground">Match Quality</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#E2754D]">{Math.round(prediction.win_probability_b * 100)}%</div>
                  <div className="text-xs text-muted-foreground">Agent B wins</div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-2 text-sm text-[#ef4444]">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-3 justify-center">
            {!prediction && (
              <button
                onClick={handlePredict}
                disabled={!urlA || !urlB || predicting}
                className="rounded-sm border border-[#E5E3E0] px-6 py-3 text-sm font-medium text-foreground hover:bg-[#F1EFED] transition-colors disabled:opacity-40"
              >
                {predicting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 inline mr-2" />}
                Predict Match
              </button>
            )}
            <button
              onClick={handleStartBattle}
              disabled={!urlA || !urlB || starting}
              className="rounded-sm bg-[#0E0E0C] px-8 py-3 text-sm font-semibold text-white hover:bg-[#0E0E0C]/90 transition-colors disabled:opacity-40"
            >
              {starting ? <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> : <Swords className="h-4 w-4 inline mr-2" />}
              Start Battle
            </button>
          </div>
        </div>
        </div>
      </div>
    );
  }

  // ── VS SCREEN ──
  if (phase === "vs") {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#0f172a]">
        <div className="text-center">
          <div className="flex items-center gap-12">
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{nameFromUrl(urlA || battle?.agent_a.name || "Agent A")}</div>
            </div>
            <div className="text-6xl font-black text-[#ef4444] animate-pulse">VS</div>
            <div className="text-left">
              <div className="text-2xl font-bold text-white">{nameFromUrl(urlB || battle?.agent_b.name || "Agent B")}</div>
            </div>
          </div>
          <p className="mt-6 text-[#94a3b8] text-sm animate-pulse">Preparing battle...</p>
        </div>
      </div>
    );
  }

  // ── RUNNING PHASE ── (dark themed)
  if (phase === "running") {
    const statusText = battle?.status === "pending" ? "Preparing challenges..."
      : battle?.status === "running" ? "Evaluating agents..."
      : "Loading...";

    return (
      <div>
        <div className="bg-[#0E0E0C] pt-24 pb-16 min-h-svh flex items-center justify-center">
          <div className="max-w-md mx-auto px-4 text-center">
            <Loader2 className="h-10 w-10 text-[#E2754D] animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-display font-700 text-[#F5F5F3] mb-2">Battle in Progress</h2>
            <p className="text-sm text-[#717069] mb-8">{statusText}</p>
            <div className="flex items-center justify-center gap-8 text-sm">
              <div>
                <div className="font-display font-600 text-[#F5F5F3]">{battle?.agent_a.name || nameFromUrl(urlA)}</div>
                <div className="text-[#535862] text-xs">Agent A</div>
              </div>
              <div className="text-lg font-display font-800 text-[#E2754D]">VS</div>
              <div>
                <div className="font-display font-600 text-[#F5F5F3]">{battle?.agent_b.name || nameFromUrl(urlB)}</div>
                <div className="text-[#535862] text-xs">Agent B</div>
              </div>
            </div>
            {pollError && (
              <div className="mt-4 text-sm text-[#9e3b3b]">{pollError}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT PHASE ── (brand-aligned)
  if (phase === "result" && battle) {
    const isAWinner = battle.winner === "a";
    const isBWinner = battle.winner === "b";
    const isDraw = battle.winner === null;

    return (
      <div>
        {/* Dark header with result */}
        <div className="bg-[#0E0E0C] pt-24 pb-12">
          <div className="max-w-4xl mx-auto px-4">
            {/* Result banner */}
            <div className="text-center mb-10">
              {isDraw ? (
                <div className="inline-flex items-center gap-2 rounded-sm border border-[#535862]/30 px-6 py-2 bg-[#1a1a18]">
                  <span className="text-lg font-display font-700 text-[#A0A09C]">DRAW</span>
                </div>
              ) : battle.photo_finish ? (
                <div className="inline-flex items-center gap-2 rounded-sm border border-[#E2754D]/30 px-6 py-2 bg-[#E2754D]/10">
                  <Zap className="h-5 w-5 text-[#E2754D]" />
                  <span className="text-lg font-display font-700 text-[#E2754D]">PHOTO FINISH</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-sm border border-[#E2754D]/30 px-6 py-2 bg-[#E2754D]/10">
                  <Trophy className="h-5 w-5 text-[#E2754D]" />
                  <span className="text-lg font-display font-700 text-[#F5F5F3]">
                    {isAWinner ? battle.agent_a.name : battle.agent_b.name} <span className="text-[#E2754D]">wins</span> by {battle.margin} pts
                  </span>
                </div>
              )}
            </div>

            {/* Score comparison — dark, no cards */}
            <div className="grid grid-cols-[1fr,auto,1fr] gap-6 items-center">
              {/* Agent A */}
              <div className={`text-center py-8 rounded-sm ${isAWinner ? "border border-[#E2754D]/30 bg-[#E2754D]/5" : "border border-[#2a2a28]"}`}>
                {isAWinner && <Trophy className="h-5 w-5 text-[#E2754D] mx-auto mb-2" />}
                <div className="text-xs text-[#535862] uppercase tracking-wider mb-1">Agent A</div>
                <div className="text-base font-display font-600 text-[#F5F5F3] mb-3">{battle.agent_a.name || "Agent A"}</div>
                <div className={`text-5xl font-mono font-black ${isAWinner ? "text-[#E2754D]" : "text-[#535862]"}`}>
                  {battle.agent_a.overall_score}
                </div>
              </div>

              {/* VS */}
              <div className="text-xl font-display font-800 text-[#535862]">VS</div>

              {/* Agent B */}
              <div className={`text-center py-8 rounded-sm ${isBWinner ? "border border-[#E2754D]/30 bg-[#E2754D]/5" : "border border-[#2a2a28]"}`}>
                {isBWinner && <Trophy className="h-5 w-5 text-[#E2754D] mx-auto mb-2" />}
                <div className="text-xs text-[#535862] uppercase tracking-wider mb-1">Agent B</div>
                <div className="text-base font-display font-600 text-[#F5F5F3] mb-3">{battle.agent_b.name || "Agent B"}</div>
                <div className={`text-5xl font-mono font-black ${isBWinner ? "text-[#E2754D]" : "text-[#535862]"}`}>
                  {battle.agent_b.overall_score}
                </div>
              </div>
            </div>

            {/* Match stats — inline, no cards */}
            <div className="flex items-center justify-center gap-8 mt-8 text-sm">
              <div className="text-center">
                <div className="text-[#535862] text-xs uppercase tracking-wider">Quality</div>
                <div className="text-lg font-mono font-bold text-[#F5F5F3]">{Math.round(battle.match_quality * 100)}%</div>
              </div>
              <div className="w-px h-8 bg-[#2a2a28]" />
              <div className="text-center">
                <div className="text-[#535862] text-xs uppercase tracking-wider">Margin</div>
                <div className="text-lg font-mono font-bold text-[#F5F5F3]">{battle.margin} pts</div>
              </div>
              <div className="w-px h-8 bg-[#2a2a28]" />
              <div className="text-center">
                <div className="text-[#535862] text-xs uppercase tracking-wider">Duration</div>
                <div className="text-lg font-mono font-bold text-[#F5F5F3]">
                  {battle.duration_ms > 60000 ? `${(battle.duration_ms / 60000).toFixed(1)}m` : `${(battle.duration_ms / 1000).toFixed(1)}s`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Light section — score breakdown + actions */}
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* 6-Axis Comparison — brand orange bars */}
          <div>
            <p className="label-xs mb-4">Score Breakdown</p>
            <div className="space-y-3">
              {AXES.map(({ key, label }) => {
                const valA = getAxisScore(battle.agent_a.scores, key);
                const valB = getAxisScore(battle.agent_b.scores, key);
                return (
                  <div key={key} className="grid grid-cols-[50px,1fr,60px,1fr,50px] gap-2 items-center">
                    <div className={`text-right text-sm font-mono font-bold ${valA >= valB ? "text-[#E2754D]" : "text-[#717069]"}`}>{valA}</div>
                    <div className="h-2 rounded-sm bg-[#F1EFED] overflow-hidden flex justify-end">
                      <div className="h-full rounded-sm bg-[#E2754D] transition-all duration-700" style={{ width: `${valA}%`, opacity: valA >= valB ? 1 : 0.4 }} />
                    </div>
                    <div className="text-center text-[10px] font-medium uppercase tracking-wider text-[#717069]">{label}</div>
                    <div className="h-2 rounded-sm bg-[#F1EFED] overflow-hidden">
                      <div className="h-full rounded-sm bg-[#E2754D] transition-all duration-700" style={{ width: `${valB}%`, opacity: valB >= valA ? 1 : 0.4 }} />
                    </div>
                    <div className={`text-left text-sm font-mono font-bold ${valB >= valA ? "text-[#E2754D]" : "text-[#717069]"}`}>{valB}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Share Actions */}
          <div className="flex gap-3 justify-center pt-4">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 rounded-sm border border-[#E5E3E0] px-5 py-2.5 text-sm font-medium text-foreground hover:bg-[#F1EFED] transition-colors"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <a
              href={`${API_URL}/v1/battle/${battleId}/card.svg`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-sm bg-[#0E0E0C] text-[#F5F5F3] px-5 py-2.5 text-sm font-medium hover:bg-[#1a1a18] transition-colors"
            >
              <Image className="h-4 w-4" />
              SVG Card
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function nameFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^(mcp\.|www\.)/, "").split(".")[0];
  } catch {
    return url.slice(0, 20);
  }
}

function getAxisScore(scores: Record<string, number> | undefined, key: string): number {
  if (!scores) return 0;
  const val = scores[key];
  if (typeof val === "number") return val;
  if (typeof val === "object" && val !== null) return (val as Record<string, number>).score ?? 0;
  return 0;
}

export default function BattlePage() {
  return (
    <Suspense fallback={<div className="pt-24 text-center text-muted-foreground">Loading...</div>}>
      <BattleContent />
    </Suspense>
  );
}
