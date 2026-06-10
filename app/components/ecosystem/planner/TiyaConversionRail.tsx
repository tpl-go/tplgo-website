"use client";

import { Sparkles } from "lucide-react";
import type {
  TiyaItineraryBookingStatus,
} from "@/app/lib/ecosystem/planner/plannerBookingBridge";
import type { TiyaUpsellItem } from "@/app/lib/ecosystem/planner/plannerConversionEngine";

type TiyaConversionRailProps = {
  statuses: TiyaItineraryBookingStatus[];
  upsells: TiyaUpsellItem[];
};

function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-black text-white">
      {label} {value}%
    </span>
  );
}

export default function TiyaConversionRail({
  statuses,
  upsells,
}: TiyaConversionRailProps) {
  const safeStatuses = Array.isArray(statuses) ? statuses : [];
  const safeUpsells = Array.isArray(upsells) ? upsells : [];

  return (
    <div className="grid gap-3">
      <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
          <Sparkles size={15} />
          Itinerary-to-booking flow
        </div>
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {safeStatuses.map((status) => (
            <article
              key={status.dayId}
              className="min-w-[260px] rounded-3xl border border-white/10 bg-white/10 p-3 sm:min-w-[300px]"
            >
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/50">
                {status.dayLabel} · {status.city}
              </p>
              <h3 className="mt-2 text-base font-black text-white">
                {status.bookingReadyStatus}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <ScorePill label="Transport" value={status.transportReadiness} />
                <ScorePill label="Stay" value={status.stayReadiness} />
                <ScorePill label="Insurance" value={status.insuranceReadiness} />
                <ScorePill label="Package" value={status.packageReadiness} />
              </div>
              <button
                type="button"
                className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-full bg-orange-500 px-3 text-xs font-black text-white transition hover:bg-orange-600"
              >
                {status.primaryCta}
              </button>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-orange-300/20 bg-orange-400/10 p-3 sm:p-4">
        <div className="text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
          Smart upsell layer
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {safeUpsells.map((upsell) => (
            <article
              key={upsell.id}
              className="rounded-2xl border border-orange-300/15 bg-white/10 p-3"
            >
              <h3 className="text-sm font-black text-white">{upsell.title}</h3>
              <p className="mt-1 text-xs font-semibold leading-5 text-orange-50/85">
                {upsell.detail}
              </p>
              <p className="mt-2 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-black text-orange-100">
                {upsell.impact}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
