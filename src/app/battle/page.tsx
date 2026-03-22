"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Swords, Zap, Trophy, Copy, Image, Clock, AlertCircle, Loader2 } from "lucide-react";
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
      <div className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0E0E0C] px-4 py-2 mb-4">
            <Swords className="h-5 w-5 text-[#E2754D]" />
            <span className="text-sm font-semibold text-white tracking-wide">BATTLE ARENA</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Head-to-Head <span className="text-[#E2754D]">Battle</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Pit two AI agents against each other with identical challenges. See who comes out on top.
          </p>
        </div>

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

  // ── RUNNING PHASE ──
  if (phase === "running") {
    const statusText = battle?.status === "pending" ? "Preparing challenges..."
      : battle?.status === "running" ? "Evaluating agents..."
      : "Loading...";

    return (
      <div className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        <div className="rounded-sm border border-[#E5E3E0] bg-white p-8 text-center">
          <Loader2 className="h-12 w-12 text-[#E2754D] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Battle in Progress</h2>
          <p className="text-sm text-muted-foreground mb-4">{statusText}</p>
          <div className="flex items-center justify-center gap-8 text-sm">
            <div>
              <div className="font-semibold text-foreground">{battle?.agent_a.name || nameFromUrl(urlA)}</div>
              <div className="text-muted-foreground">Agent A</div>
            </div>
            <div className="text-lg font-black text-[#ef4444]">VS</div>
            <div>
              <div className="font-semibold text-foreground">{battle?.agent_b.name || nameFromUrl(urlB)}</div>
              <div className="text-muted-foreground">Agent B</div>
            </div>
          </div>
          {pollError && (
            <div className="mt-4 text-sm text-[#ef4444]">{pollError}</div>
          )}
        </div>
      </div>
    );
  }

  // ── RESULT PHASE ──
  if (phase === "result" && battle) {
    const winnerColor = "#10b981";
    const loserColor = "#94a3b8";
    const isAWinner = battle.winner === "a";
    const isBWinner = battle.winner === "b";
    const isDraw = battle.winner === null;

    return (
      <div className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        {/* Winner Banner */}
        <div className="text-center mb-8">
          {isDraw ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-[#3b82f6]/10 px-6 py-2">
              <span className="text-lg font-bold text-[#3b82f6]">DRAW</span>
            </div>
          ) : battle.photo_finish ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f59e0b]/10 px-6 py-2">
              <Zap className="h-5 w-5 text-[#f59e0b]" />
              <span className="text-lg font-bold text-[#f59e0b]">PHOTO FINISH</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full bg-[#10b981]/10 px-6 py-2">
              <Trophy className="h-5 w-5 text-[#10b981]" />
              <span className="text-lg font-bold text-[#10b981]">
                {isAWinner ? battle.agent_a.name : battle.agent_b.name} wins by {battle.margin} pts
              </span>
            </div>
          )}
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-[1fr,auto,1fr] gap-4 mb-8">
          {/* Agent A */}
          <div className={`rounded-sm border-2 p-6 text-center ${
            isAWinner ? "border-[#10b981] bg-[#10b981]/5" : "border-[#E5E3E0] bg-white"
          }`}>
            {isAWinner && <Trophy className="h-6 w-6 text-[#10b981] mx-auto mb-2" />}
            <div className="text-sm text-muted-foreground mb-1">Agent A</div>
            <div className="text-lg font-bold text-foreground mb-2">{battle.agent_a.name || "Agent A"}</div>
            <div className={`text-5xl font-black ${isAWinner ? "text-[#10b981]" : isDraw ? "text-[#3b82f6]" : "text-muted-foreground"}`}>
              {battle.agent_a.overall_score}
            </div>
          </div>

          {/* VS */}
          <div className="flex items-center justify-center">
            <div className="text-2xl font-black text-[#ef4444]">VS</div>
          </div>

          {/* Agent B */}
          <div className={`rounded-sm border-2 p-6 text-center ${
            isBWinner ? "border-[#10b981] bg-[#10b981]/5" : "border-[#E5E3E0] bg-white"
          }`}>
            {isBWinner && <Trophy className="h-6 w-6 text-[#10b981] mx-auto mb-2" />}
            <div className="text-sm text-muted-foreground mb-1">Agent B</div>
            <div className="text-lg font-bold text-foreground mb-2">{battle.agent_b.name || "Agent B"}</div>
            <div className={`text-5xl font-black ${isBWinner ? "text-[#10b981]" : isDraw ? "text-[#3b82f6]" : "text-muted-foreground"}`}>
              {battle.agent_b.overall_score}
            </div>
          </div>
        </div>

        {/* 6-Axis Comparison Bars */}
        <div className="rounded-sm border border-[#E5E3E0] bg-white p-6 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Score Breakdown</h3>
          <div className="space-y-4">
            {AXES.map(({ key, label, color }) => {
              const valA = getAxisScore(battle.agent_a.scores, key);
              const valB = getAxisScore(battle.agent_b.scores, key);
              return (
                <div key={key} className="grid grid-cols-[60px,1fr,40px,1fr,60px] gap-2 items-center">
                  <div className="text-right text-sm font-medium" style={{ color: valA > valB ? winnerColor : valA < valB ? loserColor : "#64748b" }}>{valA}</div>
                  <div className="h-3 rounded-full bg-[#f1f5f9] overflow-hidden flex justify-end">
                    <div className="h-full rounded-full" style={{ width: `${valA}%`, backgroundColor: color, opacity: 0.8 }} />
                  </div>
                  <div className="text-center text-xs font-semibold text-muted-foreground">{label}</div>
                  <div className="h-3 rounded-full bg-[#f1f5f9] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${valB}%`, backgroundColor: color, opacity: 0.8 }} />
                  </div>
                  <div className="text-left text-sm font-medium" style={{ color: valB > valA ? winnerColor : valB < valA ? loserColor : "#64748b" }}>{valB}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Match Info */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-sm border border-[#E5E3E0] bg-white p-4 text-center">
            <div className="text-sm text-muted-foreground">Match Quality</div>
            <div className="text-xl font-bold text-foreground">{Math.round(battle.match_quality * 100)}%</div>
          </div>
          <div className="rounded-sm border border-[#E5E3E0] bg-white p-4 text-center">
            <div className="text-sm text-muted-foreground">Margin</div>
            <div className="text-xl font-bold text-foreground">{battle.margin} pts</div>
          </div>
          <div className="rounded-sm border border-[#E5E3E0] bg-white p-4 text-center">
            <div className="text-sm text-muted-foreground">Duration</div>
            <div className="text-xl font-bold text-foreground flex items-center justify-center gap-1">
              <Clock className="h-4 w-4" />
              {battle.duration_ms > 60000 ? `${(battle.duration_ms / 60000).toFixed(1)}m` : `${(battle.duration_ms / 1000).toFixed(1)}s`}
            </div>
          </div>
        </div>

        {/* Share Actions */}
        <div className="flex gap-3 justify-center">
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
            className="flex items-center gap-2 rounded-sm border border-[#E5E3E0] px-5 py-2.5 text-sm font-medium text-foreground hover:bg-[#F1EFED] transition-colors"
          >
            <Image className="h-4 w-4" />
            SVG Card
          </a>
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
