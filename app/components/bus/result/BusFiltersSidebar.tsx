"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { BusResultItem } from "@/app/lib/bus/busTypes";
import type { BusFilters, BusTimeBucket } from "@/app/lib/bus/busFilterTypes";
import {
  getUniqueDropPoints,
  getUniqueOperators,
  getUniquePickupPoints,
} from "@/app/lib/bus/busFilterHelpers";

type Props = {
  results: BusResultItem[];
  filters: BusFilters;
  onFiltersChange: (filters: BusFilters) => void;
  className?: string;
};

const PICKUP_TIME_OPTIONS: { key: BusTimeBucket; label: string }[] = [
  { key: "00-06", label: "12 AM - 6 AM" },
  { key: "06-12", label: "6 AM - 12 PM" },
  { key: "12-18", label: "12 PM - 6 PM" },
  { key: "18-24", label: "6 PM - 12 AM" },
];

const DROP_TIME_OPTIONS: { key: BusTimeBucket; label: string }[] = [
  { key: "00-06", label: "12 AM - 6 AM" },
  { key: "06-12", label: "6 AM - 12 PM" },
  { key: "12-18", label: "12 PM - 6 PM" },
  { key: "18-24", label: "6 PM - 12 AM" },
];

function ToggleChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
        active
          ? "border-sky-500 bg-sky-50 text-sky-700"
          : "border-slate-200 text-slate-700 hover:border-sky-300"
      }`}
    >
      {label}
    </button>
  );
}

function SearchableCheckboxSection({
  title,
  values,
  selectedValues,
  onToggle,
  onClear,
  searchValue,
  onSearchChange,
  showCount = 4,
}: {
  title: string;
  values: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  showCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return values;
    return values.filter((item) => item.toLowerCase().includes(q));
  }, [values, searchValue]);

  const visible = expanded ? filtered : filtered.slice(0, showCount);

  return (
    <div className="border-t border-slate-200 pt-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>

        <button
          type="button"
          onClick={onClear}
          className="text-xs font-semibold text-slate-400 hover:text-sky-600"
        >
          CLEAR
        </button>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search"
          className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-sky-400"
        />
      </div>

      <div className="space-y-3">
        {visible.map((item) => {
          const checked = selectedValues.includes(item);

          return (
            <label
              key={item}
              className="flex cursor-pointer items-start gap-3 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(item)}
                className="mt-1 h-4 w-4 rounded border-slate-300"
              />
              <span className="leading-5">{item}</span>
            </label>
          );
        })}
      </div>

      {filtered.length > showCount && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-3 text-sm font-medium text-sky-600 hover:underline"
        >
          {expanded ? "Show less" : `Show all (${filtered.length})`}
        </button>
      )}
    </div>
  );
}

export default function BusFiltersSidebar({
  results,
  filters,
  onFiltersChange,
  className = "",
}: Props) {
  const [pickupSearch, setPickupSearch] = useState("");
  const [operatorSearch, setOperatorSearch] = useState("");
  const [dropSearch, setDropSearch] = useState("");

  const pickupPoints = useMemo(() => getUniquePickupPoints(results), [results]);
  const operators = useMemo(() => getUniqueOperators(results), [results]);
  const dropPoints = useMemo(() => getUniqueDropPoints(results), [results]);

  function toggleStringFilter<K extends keyof BusFilters>(
    key: K,
    value: string
  ) {
    const current = filters[key] as string[];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    onFiltersChange({
      ...filters,
      [key]: updated,
    });
  }

  function toggleTimeFilter(
    key: "pickupTimes" | "dropTimes",
    value: BusTimeBucket
  ) {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    onFiltersChange({
      ...filters,
      [key]: updated,
    });
  }

  function clearSection<K extends keyof BusFilters>(key: K) {
    onFiltersChange({
      ...filters,
      [key]: [],
    });
  }

  function clearAll() {
    onFiltersChange({
      busAcTypes: [],
      seatTypes: [],
      pickupPoints: [],
      pickupTimes: [],
      operators: [],
      dropPoints: [],
      dropTimes: [],
    });
  }

  return (
    <aside
      className={`w-[280px] shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Filters</h2>
        <button
          type="button"
          onClick={clearAll}
          className="text-sm font-semibold text-slate-400 hover:text-sky-600"
        >
          CLEAR ALL
        </button>
      </div>

      <div className="space-y-5">
        {/* AC */}
        <div className="border-t border-slate-200 pt-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">AC</h3>

          <div className="grid grid-cols-2 gap-3">
            <ToggleChip
              label="AC"
              active={filters.busAcTypes.includes("AC")}
              onClick={() => toggleStringFilter("busAcTypes", "AC")}
            />
            <ToggleChip
              label="Non-AC"
              active={filters.busAcTypes.includes("Non-AC")}
              onClick={() => toggleStringFilter("busAcTypes", "Non-AC")}
            />
          </div>
        </div>

        {/* Seat Type */}
        <div className="border-t border-slate-200 pt-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">
            Seat type
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <ToggleChip
              label="Seater"
              active={filters.seatTypes.includes("Seater")}
              onClick={() => toggleStringFilter("seatTypes", "Seater")}
            />
            <ToggleChip
              label="Sleeper"
              active={filters.seatTypes.includes("Sleeper")}
              onClick={() => toggleStringFilter("seatTypes", "Sleeper")}
            />
          </div>
        </div>

        {/* Pickup Point */}
        <SearchableCheckboxSection
          title="Pick up point"
          values={pickupPoints}
          selectedValues={filters.pickupPoints}
          onToggle={(value) => toggleStringFilter("pickupPoints", value)}
          onClear={() => clearSection("pickupPoints")}
          searchValue={pickupSearch}
          onSearchChange={setPickupSearch}
        />

        {/* Pickup Time */}
        <div className="border-t border-slate-200 pt-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-800">
              Pick up time
            </h3>
            <button
              type="button"
              onClick={() => clearSection("pickupTimes")}
              className="text-xs font-semibold text-slate-400 hover:text-sky-600"
            >
              CLEAR
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {PICKUP_TIME_OPTIONS.map((item) => (
              <ToggleChip
                key={item.key}
                label={item.label}
                active={filters.pickupTimes.includes(item.key)}
                onClick={() => toggleTimeFilter("pickupTimes", item.key)}
              />
            ))}
          </div>
        </div>

        {/* Operators */}
        <SearchableCheckboxSection
          title="Operators"
          values={operators}
          selectedValues={filters.operators}
          onToggle={(value) => toggleStringFilter("operators", value)}
          onClear={() => clearSection("operators")}
          searchValue={operatorSearch}
          onSearchChange={setOperatorSearch}
        />

        {/* Drop Point */}
        <SearchableCheckboxSection
          title="Drop point"
          values={dropPoints}
          selectedValues={filters.dropPoints}
          onToggle={(value) => toggleStringFilter("dropPoints", value)}
          onClear={() => clearSection("dropPoints")}
          searchValue={dropSearch}
          onSearchChange={setDropSearch}
        />

        {/* Drop Time */}
        <div className="border-t border-slate-200 pt-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-800">
              Drop time
            </h3>
            <button
              type="button"
              onClick={() => clearSection("dropTimes")}
              className="text-xs font-semibold text-slate-400 hover:text-sky-600"
            >
              CLEAR
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {DROP_TIME_OPTIONS.map((item) => (
              <ToggleChip
                key={item.key}
                label={item.label}
                active={filters.dropTimes.includes(item.key)}
                onClick={() => toggleTimeFilter("dropTimes", item.key)}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
