"use client";

import { ChevronDown } from "lucide-react";

export type HolidayFilterState = {
  durationBucket: string;
  flightPreference: "" | "withFlight" | "withoutFlight";
  budgetBucket: string;
  hotelCategory: number | null;
};

type Props = {
  showFilterPopup: boolean;
  setShowFilterPopup: (value: boolean) => void;
  filterRef: any;
  filters: HolidayFilterState;
  setFilters: (value: HolidayFilterState) => void;
};

export default function HolidayFilters({
  showFilterPopup,
  setShowFilterPopup,
  filterRef,
  filters,
  setFilters,
}: Props) {
  const activeCount = [
    filters.durationBucket,
    filters.flightPreference,
    filters.budgetBucket,
    filters.hotelCategory,
  ].filter(Boolean).length;

  const subtitle =
    activeCount > 0
      ? `${activeCount} Filter${activeCount > 1 ? "s" : ""} selected`
      : "Select Filters";

  return (
    <div ref={filterRef} className="relative shrink-0">
      <div
        onClick={() => setShowFilterPopup(!showFilterPopup)}
        className="relative flex h-[86px] w-[200px] cursor-pointer flex-col justify-center rounded-2xl border border-black bg-white/60 px-4 py-3"
      >
        <span className="text-[11px] font-bold text-slate-600">
          Filters
        </span>

        <p className="truncate pr-6 text-lg font-extrabold text-slate-950">
          {subtitle}
        </p>

        <span className="text-[11px] text-slate-600">
          Package preferences
        </span>

        <ChevronDown
          className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black transition-transform duration-300 ${
            showFilterPopup ? "rotate-180" : ""
          }`}
        />
      </div>

      {showFilterPopup && (
        <div className="absolute right-0 top-[90px] z-[9999] flex h-[360px] w-[420px] flex-col overflow-hidden rounded-2xl border border-black bg-white text-black shadow-2xl">
          <div className="overflow-y-auto p-5 text-black">
            <p className="mb-1 text-[13px] font-bold">Duration (in Nights)</p>

            <input
              type="range"
              min={1}
              max={12}
              value={
                filters.durationBucket === "<3N"
                  ? 2
                  : filters.durationBucket === "3N-4N"
                  ? 4
                  : filters.durationBucket === "4N-5N"
                  ? 5
                  : filters.durationBucket === ">5N"
                  ? 6
                  : 3
              }
              onChange={(e) => {
                const value = Number(e.target.value);

                let nextBucket = "";
                if (value <= 2) nextBucket = "<3N";
                else if (value <= 4) nextBucket = "3N-4N";
                else if (value <= 5) nextBucket = "4N-5N";
                else nextBucket = ">5N";

                setFilters({
                  ...filters,
                  durationBucket: nextBucket,
                });
              }}
              className="w-full"
            />

            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { label: "< 3N", val: "<3N" },
                { label: "3N - 4N", val: "3N-4N" },
                { label: "4N - 5N", val: "4N-5N" },
                { label: "> 5N", val: ">5N" },
              ].map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      durationBucket: d.val,
                    })
                  }
                  className={`rounded-full border px-3 py-1 text-[11px] font-bold ${
                    filters.durationBucket === d.val
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <p className="mb-1 mt-4 text-[13px] font-bold">Flights</p>

            <div className="flex gap-2">
              {[
                { label: "With Flights", val: "withFlight" },
                { label: "Without Flights", val: "withoutFlight" },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      flightPreference:
                        item.val as HolidayFilterState["flightPreference"],
                    })
                  }
                  className={`rounded-full border px-3 py-1 text-[11px] font-bold ${
                    filters.flightPreference === item.val
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <p className="mb-1 mt-4 text-[13px] font-bold">
              Budget (per person)
            </p>

            <input
              type="range"
              min={3000}
              max={50000}
              value={
                filters.budgetBucket === "<25K"
                  ? 25000
                  : filters.budgetBucket === "25K-35K"
                  ? 35000
                  : filters.budgetBucket === ">35K"
                  ? 50000
                  : 25000
              }
              onChange={(e) => {
                const value = Number(e.target.value);

                let nextBucket = "";
                if (value <= 25000) nextBucket = "<25K";
                else if (value <= 35000) nextBucket = "25K-35K";
                else nextBucket = ">35K";

                setFilters({
                  ...filters,
                  budgetBucket: nextBucket,
                });
              }}
              className="w-full"
            />

            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { label: "< ₹25K", val: "<25K" },
                { label: "₹25K - ₹35K", val: "25K-35K" },
                { label: "> ₹35K", val: ">35K" },
              ].map((b, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      budgetBucket: b.val,
                    })
                  }
                  className={`rounded-full border px-3 py-1 text-[11px] font-bold ${
                    filters.budgetBucket === b.val
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            <p className="mb-1 mt-4 text-[13px] font-bold">
              Hotel Category
            </p>

            <div className="flex flex-wrap gap-2">
              {[
                { label: "< 3 ★", val: 2 },
                { label: "3 ★", val: 3 },
                { label: "4 ★", val: 4 },
                { label: "5 ★", val: 5 },
              ].map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      hotelCategory: c.val,
                    })
                  }
                  className={`rounded-full border px-3 py-1 text-[11px] font-bold ${
                    filters.hotelCategory === c.val
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 border-t bg-white p-4">
            <button
              type="button"
              onClick={() =>
                setFilters({
                  durationBucket: "",
                  flightPreference: "",
                  budgetBucket: "",
                  hotelCategory: null,
                })
              }
              className="w-1/2 rounded-lg border border-gray-300 py-2 text-[13px] font-bold text-gray-700"
            >
              CLEAR
            </button>

            <button
              type="button"
              onClick={() => setShowFilterPopup(false)}
              className="w-1/2 rounded-lg bg-orange-600 py-2 text-[13px] font-bold text-white hover:bg-orange-700"
            >
              APPLY
            </button>
          </div>
        </div>
      )}
    </div>
  );
}