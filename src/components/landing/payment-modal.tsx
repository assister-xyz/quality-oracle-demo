"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { trackPaymentIntent, trackEmailSubmit, getVariant } from "@/lib/analytics";

interface PaymentModalProps {
  tier: string;
  onClose: () => void;
}

export function PaymentModal({ tier, onClose }: PaymentModalProps) {
  const [email, setEmail] = useState("");
  const [agentUrl, setAgentUrl] = useState("");
  const [useCase, setUseCase] = useState("");
  const [role, setRole] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);

    trackPaymentIntent(tier);
    trackEmailSubmit(!!agentUrl);

    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          agentUrl,
          useCase,
          role,
          tier,
          variant: getVariant(),
        }),
      });
    } catch {
      // Best effort
    }

    setSubmitting(false);
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#111118] border border-[#2a2a30] rounded-sm max-w-md w-full p-6 md:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#535862] hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-4">&#10003;</div>
            <h3 className="text-xl font-display font-700 text-white mb-2">
              Thanks!
            </h3>
            <p className="text-[#717069] text-sm">
              We&apos;ll reach out when {tier} launches.
            </p>
            <button
              onClick={onClose}
              className="mt-6 text-sm text-[#F97316] hover:text-[#FB923C] transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-display font-700 text-white mb-1">
              Join the waitlist for {tier}
            </h3>
            <p className="text-sm text-[#717069] mb-6">
              Be the first to know when this tier is available.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-[#717069] uppercase tracking-wider mb-1.5">
                  Email <span className="text-[#F97316]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-[#0A0A14] border border-[#2a2a30] rounded-sm px-3 py-2.5 text-sm text-white placeholder:text-[#535862] focus:outline-none focus:border-[#F97316] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-[#717069] uppercase tracking-wider mb-1.5">
                  Agent / MCP URL
                </label>
                <input
                  type="url"
                  value={agentUrl}
                  onChange={(e) => setAgentUrl(e.target.value)}
                  placeholder="https://your-server.com/mcp"
                  className="w-full bg-[#0A0A14] border border-[#2a2a30] rounded-sm px-3 py-2.5 text-sm text-white placeholder:text-[#535862] focus:outline-none focus:border-[#F97316] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-[#717069] uppercase tracking-wider mb-1.5">
                  Use case
                </label>
                <input
                  type="text"
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  placeholder="One sentence about your use case"
                  className="w-full bg-[#0A0A14] border border-[#2a2a30] rounded-sm px-3 py-2.5 text-sm text-white placeholder:text-[#535862] focus:outline-none focus:border-[#F97316] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-[#717069] uppercase tracking-wider mb-1.5">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#0A0A14] border border-[#2a2a30] rounded-sm px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F97316] transition-colors"
                >
                  <option value="">Select role (optional)</option>
                  <option value="developer">Developer</option>
                  <option value="team_lead">Team Lead</option>
                  <option value="cto">CTO</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting || !email}
                className="w-full bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-50 text-white font-semibold text-sm uppercase tracking-wider py-3 rounded-sm transition-colors"
              >
                {submitting ? "Submitting..." : "Join Waitlist"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
