"use client";

import type { BusFilters } from "@/app/lib/bus/busFilterTypes";

type ChipItem = {
  id: string;
  label: string;
  category:
    | "busAcTypes"
    | "seatTypes"
    | "pickupPoints"
    | "pickupTimes"
    | "operators"
    | "dropPoints"
    | "dropTimes";
  value: string;
};

type Props = {
  filters: BusFilters;
  onRemoveChip: (category: ChipItem["category"], value: string) => void;
  onClearAll: () => void;
};

function formatTimeBucket(value: string) {
  switch (value) {
    case "00-06":
      return "12 AM - 6 AM";
    case "06-12":
      return "6 AM - 12 PM";
    case "12-18":
      return "12 PM - 6 PM";
    case "18-24":
      return "6 PM - 12 AM";
    default:
      return value;
  }
}

export default function BusActiveFilterChips({
  filters,
  onRemoveChip,
  onClearAll,
}: Props) {
  const chips: ChipItem[] = [
    ...filters.busAcTypes.map((item) => ({
      id: `ac-${item}`,
      label: item,
      category: "busAcTypes" as const,
      value: item,
    })),
    ...filters.seatTypes.map((item) => ({
      id: `seat-${item}`,
      label: item,
      category: "seatTypes" as const,
      value: item,
    })),
    ...filters.pickupPoints.map((item) => ({
      id: `pickup-${item}`,
      label: item,
      category: "pickupPoints" as const,
      value: item,
    })),
    ...filters.pickupTimes.map((item) => ({
      id: `pickuptime-${item}`,
      label: formatTimeBucket(item),
      category: "pickupTimes" as const,
      value: item,
    })),
    ...filters.operators.map((item) => ({
      id: `operator-${item}`,
      label: item,
      category: "operators" as const,
      value: item,
    })),
    ...filters.dropPoints.map((item) => ({
      id: `drop-${item}`,
      label: item,
      category: "dropPoints" as const,
      value: item,
    })),
    ...filters.dropTimes.map((item) => ({
      id: `droptime-${item}`,
      label: formatTimeBucket(item),
      category: "dropTimes" as const,
      value: item,
    })),
  ];

  if (chips.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => onRemoveChip(chip.category, chip.value)}
              className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700 transition hover:border-sky-300 hover:bg-sky-100"
            >
              <span>{chip.label}</span>
              <span className="text-base leading-none">×</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClearAll}
          className="shrink-0 text-sm font-semibold text-slate-500 transition hover:text-sky-600"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}