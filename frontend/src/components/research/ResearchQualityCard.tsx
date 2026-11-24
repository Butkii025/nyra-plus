
"use client";

import { ShieldCheck, CheckCircle2, AlertCircle, CircleHelp } from "lucide-react";

interface ResearchQualityCardProps {
  qualityScore?: number;
  qualityDetails?: {
    score: number;
    total_claims: number;
    checked_claims: number;
    verification_coverage: number;
    status_counts: {
      supported: number;
      partially_supported: number;
      unverified: number;
      not_checked: number;
    };
    score_type: string;
  };
}

export default function ResearchQualityCard({
  qualityScore = 0,
  qualityDetails,
}: ResearchQualityCardProps) {
  if (!qualityDetails) return null;

  const score = Math.max(0, Math.min(100, qualityScore));
  const counts = qualityDetails.status_counts;

  const stats = [
    {
      label: "Supported",
      value: counts.supported,
      icon: CheckCircle2,
    },
    {
      label: "Partially Supported",
      value: counts.partially_supported,
      icon: AlertCircle,
    },
    {
      label: "Unverified",
      value: counts.unverified,
      icon: CircleHelp,
    },
    {
      label: "Not Checked",
      value: counts.not_checked,
      icon: CircleHelp,
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-700/60 bg-[#0A1024] p-5 shadow-lg space-y-5">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-blue-500/10 p-2.5">
          <ShieldCheck className="h-6 w-6 text-blue-400" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white">
            Research Quality
          </h2>
          <p className="text-sm text-slate-400">
            Evidence matching overview
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="min-w-32">
          <p className="text-4xl font-bold text-white">
            {score.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Evidence match score
          </p>
        </div>

        <div className="flex-1">
          <div className="mb-2 flex justify-between text-xs text-slate-400">
            <span>Quality score</span>
            <span>{score.toFixed(1)}%</span>
          </div>

          <div
            className="h-3 overflow-hidden rounded-full bg-slate-800"
            role="progressbar"
            aria-label="Research evidence match score"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700"
              style={{ width: `${score}%` }}
            />
          </div>

          <p className="mt-2 text-xs text-slate-400">
            {qualityDetails.checked_claims} of{" "}
            {qualityDetails.total_claims} claims checked
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-700/50 bg-[#101A35] p-3"
            >
              <Icon className="mb-2 h-4 w-4 text-slate-400" />

              <p className="text-xl font-semibold text-white">
                {stat.value}
              </p>

              <p className="text-xs text-slate-400">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-slate-700/60 pt-4">
        <span className="text-sm text-slate-400">
          Verification coverage
        </span>

        <span className="text-sm font-semibold text-white">
          {qualityDetails.verification_coverage.toFixed(1)}%
        </span>
      </div>

      <p className="text-xs leading-relaxed text-slate-500">
        This score measures keyword-based evidence matching.
        It is not a probability that the claims are factually true.
      </p>
    </section>
  );
}
