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
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-5 flex-wrap">
          <p className="text-[13px] font-semibold text-slate-600">
            {resultsCount} buses found
          </p>

          <div className="flex items-center gap-4 text-sm">
            <span className="font-semibold text-slate-700">SORT BY</span>

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
                  className={`px-2 py-1 rounded-md transition ${
                    isActive
                      ? "text-blue-600 font-semibold bg-blue-50"
                      : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
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