"use client";

import { useRouter } from "next/navigation";
import type { TrainSortOption } from "@/app/lib/train/trainResultTypes";

type Props = {
  fromCity: string;
  fromCode: string;
  toCity: string;
  toCode: string;
  date: string;
  travelClass: string;
  activeSort: TrainSortOption;
  resultsCount: number;
};

const SORT_OPTIONS: { label: string; value: TrainSortOption }[] = [
  { label: "Relevance", value: "relevance" },
  { label: "Departure", value: "departure" },
  { label: "Arrival", value: "arrival" },
  { label: "Duration", value: "duration" },
  { label: "Price", value: "price" },
];

export default function TrainSortBar({
  fromCity,
  fromCode,
  toCity,
  toCode,
  date,
  travelClass,
  activeSort,
  resultsCount,
}: Props) {
  const router = useRouter();

  function handleSortChange(sort: TrainSortOption) {
    const query = new URLSearchParams({
      fromCity,
      fromCode,
      toCity,
      toCode,
      date,
      class: travelClass,
      sort,
    });

    router.push(`/train/result?${query.toString()}`);
  }

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="text-[14px] font-bold text-slate-800">
          {resultsCount} trains found
        </div>

        <div className="flex items-center gap-5">
          <div className="text-[13px] font-bold uppercase tracking-wide text-slate-500">
            Sort By
          </div>

          <div className="flex items-center gap-2">
            {SORT_OPTIONS.map((item) => {
              const active = item.value === activeSort;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleSortChange(item.value)}
                  className={`rounded-xl px-3 py-2 text-[14px] font-semibold transition ${
                    active
                      ? "bg-sky-100 text-sky-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}