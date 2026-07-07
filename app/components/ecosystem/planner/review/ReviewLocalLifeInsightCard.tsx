"use client";

import { AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";

type ReviewLocalLifeInsightCardProps = {
  alerts: string[];
  insights: string[];
};

export default function ReviewLocalLifeInsightCard({
  alerts,
  insights,
}: ReviewLocalLifeInsightCardProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5 text-amber-900">
        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]">
          <Sparkles size={18} />
          Local Life Intelligence Insights
        </div>
        <div className="mt-3 grid gap-2">
          {insights.length ? (
            insights.map((insight) => (
              <p
                key={insight}
                className="rounded-2xl border border-amber-100 bg-white px-3 py-2 text-sm font-black"
              >
                {insight}
              </p>
            ))
          ) : (
            <p className="rounded-2xl border border-amber-100 bg-white px-3 py-2 text-sm font-semibold">
              Local Life insights will appear when the payload contains selected
              or saved local experiences.
            </p>
          )}
        </div>
      </article>

      <article
        className={`rounded-[1.75rem] border p-5 ${
          alerts.length
            ? "border-red-200 bg-red-50 text-red-800"
            : "border-emerald-200 bg-emerald-50 text-emerald-800"
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]">
          {alerts.length ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          Local Life Gap Alert
        </div>
        <div className="mt-3 grid gap-2">
          {alerts.length ? (
            alerts.map((alert) => (
              <p
                key={alert}
                className="rounded-2xl border border-red-100 bg-white px-3 py-2 text-sm font-black"
              >
                {alert}
              </p>
            ))
          ) : (
            <p className="rounded-2xl border border-emerald-100 bg-white px-3 py-2 text-sm font-semibold">
              No Local Life gap detected from the current review payload.
            </p>
          )}
        </div>
      </article>
    </div>
  );
}
