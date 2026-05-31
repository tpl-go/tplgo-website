"use client";

import { useEffect, useMemo, useState } from "react";
import type { CabRideType } from "@/app/lib/cab/cabSearchTypes";
import type {
  CabResultFiltersState,
  CabResultItem,
} from "@/app/lib/cab/cabResultTypes";
import {
  filterCabResultItems,
  getDefaultCabResultFilters,
} from "@/app/lib/cab/cabResultHelpers";

type Props = {
  rideType: CabRideType;
  items: CabResultItem[];
  onFilteredItemsChange: (items: CabResultItem[]) => void;
};

type Chip = {
  group:
    | "vehicleTypes"
    | "brands"
    | "fuelTypes"
    | "transmissions"
    | "seats"
    | "minRating";
  label: string;
  value: string;
};

function formatVehicleType(type: string) {
  if (type === "compactsuv") return "Compact SUV";
  if (type === "scooter") return "Scooter";
  if (type === "bike") return "Bike";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatFuelType(type: string) {
  return type.toUpperCase();
}

export default function CabResultFilters({
  rideType,
  items,
  onFilteredItemsChange,
}: Props) {
  const isBike = rideType === "bikeRental";
  const [mobileOpen, setMobileOpen] = useState(false);

  const [filters, setFilters] = useState<CabResultFiltersState>(
    getDefaultCabResultFilters(items)
  );

  useEffect(() => {
    setFilters(getDefaultCabResultFilters(items));
  }, [items]);

  const vehicleTypeOptions = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item) => {
      map.set(item.vehicleType, (map.get(item.vehicleType) || 0) + 1);
    });
    return Array.from(map.entries()).map(([label, count]) => ({ label, count }));
  }, [items]);

  const brandOptions = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item) => {
      map.set(item.name, (map.get(item.name) || 0) + 1);
    });
    return Array.from(map.entries()).map(([label, count]) => ({ label, count }));
  }, [items]);

  const fuelTypeOptions = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item) => {
      const label = item.fuelType || "petrol";
      map.set(label, (map.get(label) || 0) + 1);
    });
    return Array.from(map.entries()).map(([label, count]) => ({ label, count }));
  }, [items]);

  const filteredItems = useMemo(() => {
    return filterCabResultItems(items, filters);
  }, [items, filters]);

  useEffect(() => {
    onFilteredItemsChange(filteredItems);
  }, [filteredItems, onFilteredItemsChange]);

  const activeChips = useMemo<Chip[]>(() => {
    const chips: Chip[] = [];

    filters.vehicleTypes.forEach((value) =>
      chips.push({
        group: "vehicleTypes",
        label: isBike ? "Bike Type" : "Cab Type",
        value,
      })
    );

    filters.brands.forEach((value) =>
      chips.push({
        group: "brands",
        label: isBike ? "Bike Model" : "Cab Model",
        value,
      })
    );

    filters.fuelTypes.forEach((value) =>
      chips.push({
        group: "fuelTypes",
        label: "Fuel Type",
        value,
      })
    );

    filters.transmissions.forEach((value) =>
      chips.push({
        group: "transmissions",
        label: "Transmission",
        value,
      })
    );

    filters.seats.forEach((value) =>
      chips.push({
        group: "seats",
        label: "Seats",
        value,
      })
    );

    if (filters.minRating) {
      chips.push({
        group: "minRating",
        label: "Rating",
        value: `${filters.minRating}+`,
      });
    }

    return chips;
  }, [filters, isBike]);

  function toggleArrayFilter<K extends keyof CabResultFiltersState>(
    key: K,
    value: string
  ) {
    setFilters((prev) => {
      const current = prev[key];
      if (!Array.isArray(current)) return prev;

      const exists = (current as string[]).includes(value);
      return {
        ...prev,
        [key]: exists
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  }

  function removeChip(chip: Chip) {
    if (chip.group === "minRating") {
      setFilters((prev) => ({ ...prev, minRating: null }));
      return;
    }

    setFilters((prev) => {
      const current = prev[chip.group];
      if (!Array.isArray(current)) return prev;

      return {
        ...prev,
        [chip.group]: current.filter((item) => item !== chip.value),
      };
    });
  }

  function clearGroup(group: "vehicleTypes" | "brands" | "fuelTypes") {
    setFilters((prev) => ({
      ...prev,
      [group]: [],
    }));
  }

  function clearAll() {
    setFilters(getDefaultCabResultFilters(items));
  }

  const filterPanel = (
    <>
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="text-[16px] font-extrabold text-slate-900">Filters</h2>

        <button
          type="button"
          onClick={clearAll}
          className="text-[12px] font-bold text-slate-400 transition hover:text-sky-600"
        >
          CLEAR ALL
        </button>
      </div>

      {activeChips.length > 0 ? (
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="mb-3 text-[12px] font-bold uppercase tracking-wide text-slate-500">
            Selected Filters
          </div>

          <div className="flex flex-wrap gap-2">
            {activeChips.map((chip) => (
              <button
                key={`${chip.group}-${chip.value}`}
                type="button"
                onClick={() => removeChip(chip)}
                className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[12px] font-bold text-sky-700"
              >
                <span>
                  {chip.label}:{" "}
                  {chip.group === "vehicleTypes"
                    ? formatVehicleType(chip.value)
                    : chip.group === "fuelTypes"
                    ? formatFuelType(chip.value)
                    : chip.value}
                </span>
                <span>✕</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="px-5 py-4">
        <FilterSection
          title={isBike ? "Bike Type" : "Cab Type"}
          options={vehicleTypeOptions.map((item) => ({
            ...item,
            label: formatVehicleType(item.label),
            rawValue: item.label,
          }))}
          selected={filters.vehicleTypes}
          onToggle={(value) => toggleArrayFilter("vehicleTypes", value)}
          onClear={() => clearGroup("vehicleTypes")}
        />

        <FilterSection
          title={isBike ? "Bike Model" : "Cab Model"}
          options={brandOptions.map((item) => ({
            ...item,
            rawValue: item.label,
          }))}
          selected={filters.brands}
          onToggle={(value) => toggleArrayFilter("brands", value)}
          onClear={() => clearGroup("brands")}
        />

        <FilterSection
          title="Fuel Type"
          options={fuelTypeOptions.map((item) => ({
            ...item,
            label: formatFuelType(item.label),
            rawValue: item.label,
          }))}
          selected={filters.fuelTypes}
          onToggle={(value) => toggleArrayFilter("fuelTypes", value)}
          onClear={() => clearGroup("fuelTypes")}
          isLast
        />
      </div>
    </>
  );

  return (
    <>
      <div className="lg:hidden">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="h-11 rounded-xl bg-[#0f172a] px-4 text-[13px] font-black text-white"
            >
              Filters
            </button>

            <button
              type="button"
              onClick={clearAll}
              className="h-11 rounded-xl border border-slate-200 px-4 text-[12px] font-black text-slate-500"
            >
              Clear
            </button>
          </div>

          {activeChips.length > 0 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {activeChips.map((chip) => (
                <button
                  key={`${chip.group}-${chip.value}-mobile`}
                  type="button"
                  onClick={() => removeChip(chip)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-[12px] font-bold text-sky-700"
                >
                  <span>
                    {chip.group === "vehicleTypes"
                      ? formatVehicleType(chip.value)
                      : chip.group === "fuelTypes"
                      ? formatFuelType(chip.value)
                      : chip.value}
                  </span>
                  <span>✕</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-3 text-[12px] font-semibold text-slate-500">
              No filters applied
            </div>
          )}
        </div>

        {mobileOpen ? (
          <div className="fixed inset-0 z-[150] bg-black/40">
            <div className="absolute inset-x-0 bottom-0 flex max-h-[86vh] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.14em] text-sky-600">
                    Cab
                  </div>
                  <div className="text-[18px] font-black text-slate-900">
                    Filters
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600"
                  aria-label="Close filters"
                >
                  ✕
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {filterPanel}
              </div>

              <div className="border-t border-slate-200 bg-white p-4">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="h-12 w-full rounded-2xl bg-sky-500 text-[14px] font-black text-white"
                >
                  Show Results
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <aside className="hidden rounded-[22px] border border-slate-200 bg-white shadow-sm lg:block">
        {filterPanel}
    </aside>
    </>
  );
}

function FilterSection({
  title,
  options,
  selected,
  onToggle,
  onClear,
  isLast = false,
}: {
  title: string;
  options: { label: string; rawValue: string; count: number }[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
  isLast?: boolean;
}) {
  return (
    <div className={`${isLast ? "" : "mb-6 border-b border-slate-200 pb-6"}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-extrabold text-slate-900">{title}</h3>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClear}
            className="text-[12px] font-bold text-slate-400 transition hover:text-sky-600"
          >
            CLEAR
          </button>

          <span className="text-slate-500">⌃</span>
        </div>
      </div>

      <div className="space-y-3">
        {options.map((option) => (
          <label
            key={option.rawValue}
            className="flex cursor-pointer items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selected.includes(option.rawValue)}
                onChange={() => onToggle(option.rawValue)}
                className="h-[20px] w-[20px] rounded border-slate-300"
              />
              <span className="text-[14px] text-slate-700">{option.label}</span>
            </div>

            <span className="text-[14px] text-slate-700">({option.count})</span>
          </label>
        ))}
      </div>
    </div>
  );
}
