"use client";

import ItineraryTab from "@/app/components/packages/details/ItineraryTab";
import type { ReactNode } from "react";
import type { CruiseDayPlanItem } from "@/app/lib/cruise/cruiseDetailTypes";

type Props = {
  itinerary: CruiseDayPlanItem[];
  mode?: "scroll" | "static";
  content?: ReactNode;
};

export default function CruiseSailingSection({
  itinerary,
  mode = "scroll",
  content,
}: Props) {
  const mapped = itinerary.map((item) => ({
    day: item.day,
    title: item.title,
    items: [item.description],
    dateLabel: item.dateLabel,
    included: {
      flights: 0,
      hotels: 0,
      transfers: 0,
      activities: 1,
      meals: 1,
    },
  }));

  if (mode === "scroll") {
    return <ItineraryTab itinerary={mapped} />;
  }

  return (
    <div className="grid grid-cols-12 gap-4 lg:gap-6">
      {/* LEFT DAY PLAN STATIC */}
      <aside className="hidden lg:col-span-3 lg:block">
        <div className="lg:sticky lg:top-[210px]">
          <div className="mb-2 text-center text-base font-bold text-gray-800">
            Day Wise Plan
          </div>

          <div className="rounded-2xl border bg-white p-3">
            <div className="relative">
              <div className="absolute left-[10px] top-1 bottom-1 w-[2px] bg-gray-200" />

              <div className="space-y-2 pl-6">
                {mapped.map((d, index) => {
                  const isActive = index === 0;

                  return (
                    <div
                      key={d.day}
                      className={`relative w-full rounded-xl px-3 py-2 ${
                        isActive
                          ? "bg-[#1E3A8A] text-white"
                          : "bg-white text-gray-900"
                      }`}
                    >
                      <span
                        className={`absolute left-[-18px] top-[14px] h-3 w-3 rounded-full border-2 ${
                          isActive
                            ? "border-white bg-white"
                            : "border-gray-300 bg-white"
                        }`}
                      />

                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-bold">Day {d.day}</div>

                        {d.dateLabel ? (
                          <div
                            className={`text-[11px] ${
                              isActive ? "text-white/85" : "text-gray-500"
                            }`}
                          >
                            {d.dateLabel}
                          </div>
                        ) : null}
                      </div>

                      <div
                        className={`mt-1 line-clamp-1 text-[11px] ${
                          isActive ? "text-white/85" : "text-gray-600"
                        }`}
                      >
                        {d.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT CONTENT STATIC */}
      <main className="col-span-12 lg:col-span-9">
        {content}
      </main>
    </div>
  );
}
