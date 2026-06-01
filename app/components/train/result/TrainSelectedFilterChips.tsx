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
      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
        <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
          {chips.map((chip) => (
            <button
              key={`${chip.type}-${chip.value}`}
              type="button"
              onClick={() => onRemoveChip(chip)}
              className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-[13px] font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100"
            >
              <span>{chip.label}</span>
              <span className="text-[14px] leading-none">×</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClearAll}
          className="min-h-10 shrink-0 self-start text-[13px] font-bold text-slate-700 transition hover:text-red-500 md:min-h-0"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
