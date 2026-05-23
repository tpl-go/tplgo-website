"use client";

import type { CruiseResultItem } from "@/app/lib/cruise/cruiseResultTypes";

type Props = {
  item: CruiseResultItem;
};

export default function CruiseShipPreviewItineraryTab({ item }: Props) {
  const itinerary = (item as any)?.itinerary || [];

  if (!itinerary.length) {
    return (
      <div className="p-4 text-slate-500 text-sm">
        No itinerary available.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {itinerary.map((day: any, index: number) => (
        <div key={index} className="text-[14px] text-slate-800">
          <div className="font-semibold">
            Day {index + 1}: {day.location}
          </div>

          {day.depart && (
            <div className="text-slate-600">
              Depart {day.depart}
            </div>
          )}

          {day.arrive && (
            <div className="text-slate-600">
              Arrive {day.arrive}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}