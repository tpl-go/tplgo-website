"use client";

import { ChevronDown } from "lucide-react";
import {
  CruiseFilterSectionConfig,
  CruiseFilterState,
  CruiseSortKey,
} from "@/app/lib/cruise/cruiseResultTypes";
import CruiseActiveFilterChips from "./CruiseActiveFilterChips";

type Props = {
  sortKey: CruiseSortKey;
  onSortChange: (value: CruiseSortKey) => void;
  itinerariesCount: number;
  sailingsCount: number;
  filters: CruiseFilterState;
  sections: CruiseFilterSectionConfig[];
  onChangeFilters: React.Dispatch<React.SetStateAction<CruiseFilterState>>;
};

export default function CruiseResultHeader({
  sortKey,
  onSortChange,
  itinerariesCount,
  sailingsCount,
  filters,
  sections,
  onChangeFilters,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-[14px] font-medium text-slate-700">
            Sort by:
          </div>

          <div className="relative">
            <select
              value={sortKey}
              onChange={(e) => onSortChange(e.target.value as CruiseSortKey)}
              className="h-[42px] min-w-[220px] appearance-none rounded-xl border border-slate-300 bg-white pl-4 pr-11 text-[15px] font-medium text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="duration-low-high">Duration: Shortest First</option>
              <option value="duration-high-low">Duration: Longest First</option>
              <option value="departure-az">Departure Port: A to Z</option>
              <option value="departure-za">Departure Port: Z to A</option>
              <option value="line-az">Cruise Line: A to Z</option>
              <option value="ship-az">Ship Name: A to Z</option>
            </select>

            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
              <ChevronDown size={16} />
            </div>
          </div>

          <div className="text-[14px] font-semibold text-sky-600">
            {itinerariesCount} Itineraries Found
          </div>

          <div className="text-[14px] font-semibold text-sky-600">
            {sailingsCount} Sailings Found
          </div>
        </div>
      </div>

      <CruiseActiveFilterChips
        sections={sections}
        filters={filters}
        onChangeFilters={onChangeFilters}
      />
    </div>
  );
}