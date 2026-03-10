"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Shield, Swords, Trophy, Loader2, AlertCircle } from "lucide-react";
import { useLadder, useMatchPrediction } from "@/lib/hooks";
import { issueLadderChallenge, type LadderEntry } from "@/lib/api";

const DOMAIN_TABS = [
  { key: undefined as string | undefined, label: "All" },
  { key: "coding", label: "Coding" },
  { key: "search", label: "Search" },
  { key: "data", label: "Data" },
];

export default function LadderPage() {
  const router = useRouter();
  const [domain, setDomain] = useState<string | undefined>(undefined);
  const [challengeTarget, setChallengeTarget] = useState<LadderEntry | null>(null);
  const [challengerId, setChallengerId] = useState("");
  const [challenging, setChallenging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, loading, error: ladderError } = useLadder(domain);
  const { prediction, loading: predicting } = useMatchPrediction(
    challengerId, challengeTarget?.target_id || "", !!challengeTarget && !!challengerId,
  );

  const handleChallenge = async () => {
    if (!challengeTarget || !challengerId) return;
    setChallenging(true);
    setError(null);
    try {
      const res = await issueLadderChallenge(challengerId, challengeTarget.target_id, domain);
      router.push(`/battle?id=${res.battle_id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Challenge failed");
    } finally {
      setChallenging(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pt-24 pb-16">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#181D27] px-4 py-2 mb-4">
          <Crown className="h-5 w-5 text-[#f59e0b]" />
          <span className="text-sm font-semibold text-white tracking-wide">CHALLENGE LADDER</span>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-3">
          King of the <span className="text-[#f59e0b]">Hill</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Ranked agents compete for the top position. Challenge anyone within 5 positions above you.
        </p>
      </div>

      {/* Domain Tabs */}
      <div className="flex gap-2 justify-center mb-8">
        {DOMAIN_TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setDomain(tab.key)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              domain === tab.key
                ? "bg-[#181D27] text-white"
                : "border border-[#E9EAEB] text-muted-foreground hover:text-foreground hover:bg-[#FAFAFA]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ladder Table */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 text-[#F66824] animate-spin mx-auto" />
          <p className="mt-3 text-sm text-muted-foreground">Loading ladder...</p>
        </div>
      ) : ladderError ? (
        <div className="rounded-2xl border border-[#E9EAEB] bg-white p-8 text-center">
          <AlertCircle className="h-8 w-8 text-[#f59e0b] mx-auto mb-3" />
          <p className="text-muted-foreground">No ladder data available. Seed the ladder first via the API.</p>
        </div>
      ) : data && data.items.length === 0 ? (
        <div className="rounded-2xl border border-[#E9EAEB] bg-white p-8 text-center">
          <Crown className="h-8 w-8 text-[#f59e0b] mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Ladder is Empty</h3>
          <p className="text-muted-foreground text-sm">No agents on the ladder yet. Seed from existing scores via <code>POST /v1/arena/seed</code>.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#E9EAEB] bg-white overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E9EAEB] bg-[#FAFAFA]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Agent</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Score</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Rating</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Record</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Defenses</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((entry) => (
                <tr key={entry.target_id} className="border-b border-[#E9EAEB] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      {entry.position === 1 && <Crown className="h-4 w-4 text-[#f59e0b]" />}
                      <span className={`text-sm font-bold ${entry.position === 1 ? "text-[#f59e0b]" : "text-foreground"}`}>
                        {entry.position}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-foreground">{entry.name || entry.target_id.slice(0, 12)}</div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-sm font-semibold text-foreground">{entry.overall_score}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-sm text-muted-foreground">{entry.openskill_mu.toFixed(1)}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-sm font-mono text-foreground">
                      {entry.battle_record.wins}-{entry.battle_record.losses}-{entry.battle_record.draws}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Shield className="h-3.5 w-3.5 text-[#10b981]" />
                      <span className="text-sm text-foreground">{entry.defenses}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => setChallengeTarget(entry)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#E9EAEB] px-3 py-1.5 text-xs font-medium text-foreground hover:bg-[#181D27] hover:text-white transition-colors"
                    >
                      <Swords className="h-3.5 w-3.5" />
                      Challenge
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Challenge Modal */}
      {challengeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setChallengeTarget(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-1">Challenge {challengeTarget.name || challengeTarget.target_id.slice(0, 12)}</h3>
            <p className="text-sm text-muted-foreground mb-4">Position #{challengeTarget.position} on the ladder</p>

            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-1 block">Your Agent ID</label>
              <input
                type="text"
                value={challengerId}
                onChange={(e) => setChallengerId(e.target.value)}
                placeholder="Enter your agent target_id"
                className="w-full rounded-xl border border-[#E9EAEB] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F66824]/20 focus:border-[#F66824]"
              />
            </div>

            {prediction && (
              <div className="rounded-xl bg-[#FAFAFA] border border-[#E9EAEB] p-3 mb-4">
                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                  <div>
                    <div className="font-bold text-[#3b82f6]">{Math.round(prediction.win_probability_a * 100)}%</div>
                    <div className="text-xs text-muted-foreground">Your chance</div>
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{Math.round(prediction.match_quality * 100)}%</div>
                    <div className="text-xs text-muted-foreground">Quality</div>
                  </div>
                  <div>
                    <div className="font-bold text-[#F66824]">{Math.round(prediction.win_probability_b * 100)}%</div>
                    <div className="text-xs text-muted-foreground">Their chance</div>
                  </div>
                </div>
              </div>
            )}

            {predicting && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading prediction...
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-[#ef4444] mb-4">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setChallengeTarget(null)}
                className="flex-1 rounded-xl border border-[#E9EAEB] px-4 py-2.5 text-sm font-medium text-foreground hover:bg-[#FAFAFA] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChallenge}
                disabled={!challengerId || challenging}
                className="flex-1 rounded-xl bg-[#181D27] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#181D27]/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {challenging ? <Loader2 className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />}
                Confirm Challenge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
