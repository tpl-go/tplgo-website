"use client";

import {
  CruiseFilterSectionConfig,
  CruiseFilterState,
} from "@/app/lib/cruise/cruiseResultTypes";
import CruiseFilterSection from "./CruiseFilterSection";

type Props = {
  sections: CruiseFilterSectionConfig[];
  filters: CruiseFilterState;
  onChangeFilters: React.Dispatch<React.SetStateAction<CruiseFilterState>>;
};

export default function CruiseFilterSidebar({
  sections,
  filters,
  onChangeFilters,
}: Props) {
  function updateFilterValue(
    key: keyof CruiseFilterState,
    value: string,
    checked: boolean
  ) {
    onChangeFilters((prev) => {
      const current = prev[key] ?? [];

      const next = checked
        ? current.includes(value)
          ? current
          : [...current, value]
        : current.filter((item) => item !== value);

      return {
        ...prev,
        [key]: next,
      };
    });
  }

  return (
    <div className="flex max-h-[calc(86vh-65px)] min-h-0 flex-col lg:block lg:max-h-none lg:space-y-3">
      <div className="mb-3 shrink-0 overflow-hidden rounded-2xl shadow-[0_6px_18px_rgba(37,99,235,0.18)] lg:mb-0">
        <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 px-4 py-3">
          <div className="text-[18px] font-bold text-white">
            Filter Your Search
          </div>
          <div className="mt-0.5 text-[12px] text-blue-100">
            Refine cruises faster
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pb-6 pr-1 lg:overflow-visible lg:pb-0 lg:pr-0">
        {sections.map((section) => (
          <CruiseFilterSection
            key={section.key}
            section={section}
            selectedValues={filters[section.key] ?? []}
            onToggleValue={(value, checked) =>
              updateFilterValue(section.key, value, checked)
            }
          />
        ))}
      </div>
    </div>
  );
}
