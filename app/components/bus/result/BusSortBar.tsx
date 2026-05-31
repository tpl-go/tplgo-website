"use client";

type SortKey =
  | "relevance"
  | "rating"
  | "price"
  | "fastest"
  | "departure"
  | "arrival";

type Props = {
  fromCity: string;
  fromPoint?: string;
  toCity: string;
  toPoint?: string;
  date: string;
  activeSort: SortKey;
  resultsCount: number;
};

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "relevance", label: "Relevance" },
  { key: "rating", label: "Rating" },
  { key: "price", label: "Price" },
  { key: "fastest", label: "Fastest" },
  { key: "departure", label: "Departure" },
  { key: "arrival", label: "Arrival" },
];

export default function BusSortBar({
  fromCity,
  fromPoint,
  toCity,
  toPoint,
  date,
  activeSort,
  resultsCount,
}: Props) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm md:px-4 md:py-2">
      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between">
        {/* LEFT SIDE */}
        <div className="flex min-w-0 flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-5">
          <p className="text-[13px] font-semibold text-slate-600">
            {resultsCount} buses found
          </p>

          <div className="flex min-w-0 flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-4">
            <span className="shrink-0 font-semibold text-slate-700">SORT BY</span>

            <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
              {SORT_OPTIONS.map((item) => {
                const isActive = activeSort === item.key;

                const href = `/bus/result?fromCity=${encodeURIComponent(
                  fromCity
                )}&fromPoint=${encodeURIComponent(
                  fromPoint || ""
                )}&toCity=${encodeURIComponent(
                  toCity
                )}&toPoint=${encodeURIComponent(
                  toPoint || ""
                )}&date=${encodeURIComponent(
                  date
                )}&sort=${encodeURIComponent(item.key)}`;

                return (
                  <a
                    key={item.key}
                    href={href}
                    className={`min-h-9 shrink-0 rounded-md px-3 py-2 transition ${
                      isActive
                        ? "bg-blue-50 font-semibold text-blue-600"
                        : "text-slate-600 hover:text-blue-600"
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (optional future use) */}
        <div className="text-xs text-slate-400">
          {/* future controls */}
        </div>
      </div>
    </div>
  );
}
