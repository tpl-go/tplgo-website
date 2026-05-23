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

  return (
    <aside className="rounded-[22px] border border-slate-200 bg-white shadow-sm">
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
    </aside>
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