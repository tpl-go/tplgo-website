"use client";

import type { TrainFilterChip } from "@/app/lib/train/trainResultTypes";

type Props = {
  chips: TrainFilterChip[];
  onRemoveChip: (chip: TrainFilterChip) => void;
  onClearAll: () => void;
};

export default function TrainSelectedFilterChips({
  chips,
  onRemoveChip,
  onClearAll,
}: Props) {
  if (!chips.length) return null;

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={`${chip.type}-${chip.value}`}
              type="button"
              onClick={() => onRemoveChip(chip)}
              className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-[13px] font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100"
            >
              <span>{chip.label}</span>
              <span className="text-[14px] leading-none">×</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClearAll}
          className="shrink-0 text-[13px] font-bold text-slate-700 transition hover:text-red-500"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}