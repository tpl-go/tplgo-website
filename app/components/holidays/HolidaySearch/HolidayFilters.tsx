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
    <div ref={filterRef} className="relative w-full shrink-0 md:w-auto">
      <div
        onClick={() => setShowFilterPopup(!showFilterPopup)}
        className="relative flex min-h-[86px] w-full cursor-pointer flex-col justify-center rounded-2xl border border-black bg-white/70 px-4 py-3 shadow-sm md:h-[86px] md:w-[200px] md:bg-white/60 md:shadow-none"
      >
        <span className="text-[10px] font-bold uppercase leading-none tracking-wide text-slate-600 md:text-[11px] md:normal-case md:tracking-normal">
          Filters
        </span>

        <p className="mt-1 truncate pr-6 text-[20px] font-extrabold leading-tight text-slate-950 md:text-lg">
          {subtitle}
        </p>

        <span className="mt-0.5 text-[11px] leading-none text-slate-600">
          Package preferences
        </span>

        <ChevronDown
          className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black transition-transform duration-300 ${
            showFilterPopup ? "rotate-180" : ""
          }`}
        />
      </div>

      {showFilterPopup && (
        <div className="absolute left-0 top-[92px] z-[9999] flex max-h-[72vh] w-full flex-col overflow-hidden rounded-2xl border border-black bg-white text-black shadow-2xl md:left-auto md:right-0 md:top-[90px] md:h-[360px] md:max-h-none md:w-[420px]">
          <div className="overflow-y-auto p-4 text-black md:p-5">
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

            <div className="flex flex-wrap gap-2">
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