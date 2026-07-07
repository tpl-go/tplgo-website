"use client";

import { AlertTriangle, CheckCircle2, ShoppingBag } from "lucide-react";

type ReviewLocalMarketInsightCardProps = {
  alerts: string[];
  insights: string[];
};

export default function ReviewLocalMarketInsightCard({
  alerts,
  insights,
}: ReviewLocalMarketInsightCardProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-[1.75rem] border border-orange-200 bg-orange-50 p-5 text-orange-900">
        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]">
          <ShoppingBag size={18} />
          Local Market Insights
        </div>
        <div className="mt-3 grid gap-2">
          {insights.length ? (
            insights.map((insight) => (
              <p
                key={insight}
                className="rounded-2xl border border-orange-100 bg-white px-3 py-2 text-sm font-black"
              >
                {insight}
              </p>
            ))
          ) : (
            <p className="rounded-2xl border border-orange-100 bg-white px-3 py-2 text-sm font-semibold">
              Market insights will appear when selected or saved commerce items
              exist in the payload.
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
          Local Market Gap Alert
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
              No Local Market gap detected from the current review payload.
            </p>
          )}
        </div>
      </article>
    </div>
  );
}
