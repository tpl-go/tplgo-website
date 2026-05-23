"use client";

import { X } from "lucide-react";
import {
  CruiseFilterSectionConfig,
  CruiseFilterState,
} from "@/app/lib/cruise/cruiseResultTypes";

type Props = {
  sections?: CruiseFilterSectionConfig[];
  filters: CruiseFilterState;
  onChangeFilters: React.Dispatch<React.SetStateAction<CruiseFilterState>>;
};

const EMPTY_FILTERS: CruiseFilterState = {
  sailingMonths: [],
  priceRanges: [],
  durations: [],
  destinations: [],
  departurePorts: [],
  cruiseLines: [],
  cruiseShips: [],
  arrivalPorts: [],
  cabinOccupancy: [],
};

export default function CruiseActiveFilterChips({
  sections = [],
  filters,
  onChangeFilters,
}: Props) {
  const chips = sections.flatMap((section) => {
    const selected = filters[section.key] ?? [];

    return selected.map((value) => {
      const option = section.options.find((o) => o.id === value);

      return {
        key: section.key,
        value,
        label: option?.label || value,
      };
    });
  });

  function removeChip(key: keyof CruiseFilterState, value: string) {
    onChangeFilters((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).filter((v) => v !== value),
    }));
  }

  function clearAll() {
    onChangeFilters(EMPTY_FILTERS);
  }

  if (chips.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {chips.map((chip, index) => (
          <div
            key={`${chip.key}-${chip.value}-${index}`}
            className="flex items-center gap-2 rounded-full border border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50 px-3 py-1.5 text-[13px] font-medium text-slate-800 shadow-sm"
          >
            <span className="max-w-[180px] truncate">{chip.label}</span>

            <button
              type="button"
              onClick={() =>
                removeChip(chip.key as keyof CruiseFilterState, chip.value)
              }
              className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-red-50 hover:text-red-600"
              aria-label={`Remove ${chip.label}`}
            >
              <X size={12} />
            </button>
          </div>
        ))}

        <div className="ml-auto">
          <button
            type="button"
            onClick={clearAll}
            className="rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-4 py-1.5 text-[12px] font-semibold text-white shadow-sm transition hover:opacity-95"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}