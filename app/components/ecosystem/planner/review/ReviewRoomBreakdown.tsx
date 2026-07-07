"use client";

import { BedDouble } from "lucide-react";

import type { StayReviewItem } from "./ReviewStayCoverageCard";

type ReviewRoomBreakdownProps = {
  stays: StayReviewItem[];
  totalTravellers: number;
};

export default function ReviewRoomBreakdown({
  stays,
  totalTravellers,
}: ReviewRoomBreakdownProps) {
  return (
    <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
      <div className="flex items-center gap-2">
        <BedDouble size={18} className="text-[#4f46e5]" />
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
          Room Breakdown
        </p>
      </div>
      <div className="mt-4 grid gap-3 xl:grid-cols-3">
        {stays.length ? (
          stays.map((stay) => (
            <div key={`${stay.id}-room`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-950">{stay.propertyName}</p>
              <div className="mt-3 grid gap-2 text-xs font-bold text-slate-600">
                <p>Room Type: <span className="font-black text-slate-950">{stay.propertyType || "Not available"}</span></p>
                <p>Room Count: <span className="font-black text-slate-950">{stay.rooms || "Not available"}</span></p>
                <p>Occupancy: <span className="font-black text-slate-950">{stay.travellerCount || totalTravellers || "Not available"}</span></p>
                <p>Adults: <span className="font-black text-slate-950">{stay.adults || totalTravellers || "Not available"}</span></p>
                <p>Children: <span className="font-black text-slate-950">{stay.children || 0}</span></p>
                <p>Meal Plan: <span className="font-black text-slate-950">{stay.mealPlan || "Not available"}</span></p>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-black text-slate-500">
            No room breakdown available.
          </p>
        )}
      </div>
    </div>
  );
}
