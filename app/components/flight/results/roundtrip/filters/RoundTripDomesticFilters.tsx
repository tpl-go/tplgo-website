"use client";

import { useMemo } from "react";
import type { RoundTripFiltersState } from "../RoundTripResults";

type RoundTripDomesticFiltersProps = {
  filters: RoundTripFiltersState;
  onFiltersChange: (filters: RoundTripFiltersState) => void;
  fromCity: string;
  toCity: string;
  minPrice: number;
  maxPrice: number;
};

type AppliedChip =
  | { key: string; label: string; type: "popular"; value: string }
  | { key: string; label: string; type: "onwardStop"; value: string }
  | { key: string; label: string; type: "returnStop"; value: string }
  | { key: string; label: string; type: "airline"; value: string }
  | { key: string; label: string; type: "aircraft"; value: string }
  | { key: string; label: string; type: "onwardDepartureSlot"; value: string }
  | { key: string; label: string; type: "onwardArrivalSlot"; value: string }
  | { key: string; label: string; type: "returnDepartureSlot"; value: string }
  | { key: string; label: string; type: "returnArrivalSlot"; value: string }
  | { key: string; label: string; type: "onwardDepartureAirport"; value: string }
  | { key: string; label: string; type: "onwardArrivalAirport"; value: string }
  | { key: string; label: string; type: "returnDepartureAirport"; value: string }
  | { key: string; label: string; type: "returnArrivalAirport"; value: string };

const popularFilterOptions = [
  { label: "Non Stop", price: "₹ 12,842" },
  { label: "Hide Nearby Airports", price: "₹ 6,272" },
  { label: "Refundable Fares", price: "₹ 12,842" },
  { label: "Air India", price: "₹ 14,362" },
];

const onwardStopOptions = [
  { label: "Non Stop", price: "₹ 6,187" },
  { label: "1 Stop", price: "₹ 6,956" },
  { label: "2+ Stops", price: "₹ 8,245" },
];

const returnStopOptions = [
  { label: "Non Stop", price: "₹ 6,655" },
  { label: "1 Stop", price: "₹ 7,197" },
  { label: "2+ Stops", price: "₹ 8,420" },
];

const timeSlots = [
  "Before 6 AM",
  "6 AM to 12 PM",
  "12 PM to 6 PM",
  "After 6 PM",
];

const onwardDepartureAirports = [
  "Hindon Airport (32Km)",
  "Indira Gandhi International Airport",
];

const onwardArrivalAirports = [
  "Chhatrapati Shivaji International Airport",
  "Navi Mumbai International Airport (25Km)",
];

const returnDepartureAirports = [
  "Chhatrapati Shivaji International Airport",
  "Navi Mumbai International Airport (25Km)",
];

const returnArrivalAirports = [
  "Hindon Airport (32Km)",
  "Indira Gandhi International Airport",
];

const airlines = [
  { label: "Air India", price: "₹ 14,362" },
  { label: "Air India Express", price: "₹ 13,481" },
  { label: "Akasa Air", price: "₹ 13,127" },
  { label: "IndiGo", price: "₹ 13,596" },
  { label: "SpiceJet", price: "₹ 13,654" },
];

const aircraftSizes = [
  { label: "Small / Mid-size aircraft", price: "₹ 12,927" },
  { label: "Large Aircraft", price: "₹ 14,362" },
];

function FilterCheckboxRow({
  label,
  price,
  checked,
  onChange,
}: {
  label: string;
  price?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="mt-[3px] h-4 w-4 rounded border-[#cfd8e3]"
        />
        <span className="text-[14px] font-medium leading-[20px] text-[#334155]">
          {label}
        </span>
      </div>

      {price ? (
        <span className="whitespace-nowrap text-[14px] font-medium text-[#475569]">
          {price}
        </span>
      ) : null}
    </label>
  );
}

function TimeSlotButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[72px] flex-col items-center justify-center rounded-xl border px-2 py-2 text-center transition ${
        active
          ? "border-[#0ea5e9] bg-[#eff8ff] text-[#0f172a]"
          : "border-[#d7dee7] bg-white text-[#475569] hover:bg-[#f8fafc]"
      }`}
    >
      <span className="text-[11px] font-semibold leading-[15px]">{label}</span>
    </button>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[20px] border border-[#dbe4ef] bg-white p-4 shadow-sm">
      <h3 className="text-[15px] font-semibold text-[#111827]">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function RoundTripDomesticFilters({
  filters,
  onFiltersChange,
  fromCity,
  toCity,
  minPrice,
  maxPrice,
}: RoundTripDomesticFiltersProps) {
  const updateFilters = (patch: Partial<RoundTripFiltersState>) => {
    onFiltersChange({
      ...filters,
      ...patch,
    });
  };

  const toggleInArray = (key: keyof RoundTripFiltersState, value: string) => {
    const current = filters[key] as string[];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    updateFilters({ [key]: next } as Partial<RoundTripFiltersState>);
  };

  const handlePopularFilterToggle = (value: string) => {
    const isActive = filters.popularFilters.includes(value);

    const nextPopular = isActive
      ? filters.popularFilters.filter((item) => item !== value)
      : [...filters.popularFilters, value];

    const patch: Partial<RoundTripFiltersState> = {
      popularFilters: nextPopular,
    };

    if (value === "Non Stop") {
      patch.onwardStops = isActive
        ? filters.onwardStops.filter((item) => item !== "Non Stop")
        : filters.onwardStops.includes("Non Stop")
        ? filters.onwardStops
        : [...filters.onwardStops, "Non Stop"];

      patch.returnStops = isActive
        ? filters.returnStops.filter((item) => item !== "Non Stop")
        : filters.returnStops.includes("Non Stop")
        ? filters.returnStops
        : [...filters.returnStops, "Non Stop"];
    }

    if (value === "Air India") {
      patch.airlines = isActive
        ? filters.airlines.filter((item) => item !== "Air India")
        : filters.airlines.includes("Air India")
        ? filters.airlines
        : [...filters.airlines, "Air India"];
    }

    updateFilters(patch);
  };

  const appliedFilters = useMemo<AppliedChip[]>(() => {
    const chips: AppliedChip[] = [];

    if (filters.popularFilters.includes("Non Stop")) {
      chips.push({
        key: "popular-non-stop",
        label: `${fromCity}: NON STOP`,
        type: "popular",
        value: "Non Stop",
      });
      chips.push({
        key: "popular-non-stop-return",
        label: `${toCity}: NON STOP`,
        type: "popular",
        value: "Non Stop",
      });
    } else {
      filters.onwardStops.forEach((stop) => {
        chips.push({
          key: `onward-stop-${stop}`,
          label: `${fromCity}: ${stop.toUpperCase()}`,
          type: "onwardStop",
          value: stop,
        });
      });

      filters.returnStops.forEach((stop) => {
        chips.push({
          key: `return-stop-${stop}`,
          label: `${toCity}: ${stop.toUpperCase()}`,
          type: "returnStop",
          value: stop,
        });
      });
    }

    filters.popularFilters.forEach((filter) => {
      if (filter !== "Non Stop") {
        chips.push({
          key: `popular-${filter}`,
          label: filter,
          type: "popular",
          value: filter,
        });
      }
    });

    filters.airlines.forEach((airline) => {
      chips.push({
        key: `airline-${airline}`,
        label: airline,
        type: "airline",
        value: airline,
      });
    });

    filters.aircraftSizes.forEach((size) => {
      chips.push({
        key: `aircraft-${size}`,
        label: size,
        type: "aircraft",
        value: size,
      });
    });

    filters.onwardDepartureSlots.forEach((slot) => {
      chips.push({
        key: `ods-${slot}`,
        label: `Onward Dep: ${slot}`,
        type: "onwardDepartureSlot",
        value: slot,
      });
    });

    filters.onwardArrivalSlots.forEach((slot) => {
      chips.push({
        key: `oas-${slot}`,
        label: `Onward Arr: ${slot}`,
        type: "onwardArrivalSlot",
        value: slot,
      });
    });

    filters.returnDepartureSlots.forEach((slot) => {
      chips.push({
        key: `rds-${slot}`,
        label: `Return Dep: ${slot}`,
        type: "returnDepartureSlot",
        value: slot,
      });
    });

    filters.returnArrivalSlots.forEach((slot) => {
      chips.push({
        key: `ras-${slot}`,
        label: `Return Arr: ${slot}`,
        type: "returnArrivalSlot",
        value: slot,
      });
    });

    filters.onwardDepartureAirports.forEach((airport) => {
      chips.push({
        key: `oda-${airport}`,
        label: `Onward From: ${airport}`,
        type: "onwardDepartureAirport",
        value: airport,
      });
    });

    filters.onwardArrivalAirports.forEach((airport) => {
      chips.push({
        key: `oaa-${airport}`,
        label: `Onward To: ${airport}`,
        type: "onwardArrivalAirport",
        value: airport,
      });
    });

    filters.returnDepartureAirports.forEach((airport) => {
      chips.push({
        key: `rda-${airport}`,
        label: `Return From: ${airport}`,
        type: "returnDepartureAirport",
        value: airport,
      });
    });

    filters.returnArrivalAirports.forEach((airport) => {
      chips.push({
        key: `raa-${airport}`,
        label: `Return To: ${airport}`,
        type: "returnArrivalAirport",
        value: airport,
      });
    });

    return chips;
  }, [filters, fromCity, toCity]);

  const removeAppliedChip = (chip: AppliedChip) => {
    switch (chip.type) {
      case "popular":
        if (chip.value === "Non Stop") {
          updateFilters({
            popularFilters: filters.popularFilters.filter(
              (item) => item !== "Non Stop"
            ),
            onwardStops: filters.onwardStops.filter((item) => item !== "Non Stop"),
            returnStops: filters.returnStops.filter((item) => item !== "Non Stop"),
          });
          return;
        }

        if (chip.value === "Air India") {
          updateFilters({
            popularFilters: filters.popularFilters.filter(
              (item) => item !== chip.value
            ),
            airlines: filters.airlines.filter((item) => item !== chip.value),
          });
          return;
        }

        updateFilters({
          popularFilters: filters.popularFilters.filter(
            (item) => item !== chip.value
          ),
        });
        return;

      case "onwardStop":
        updateFilters({
          onwardStops: filters.onwardStops.filter((item) => item !== chip.value),
        });
        return;

      case "returnStop":
        updateFilters({
          returnStops: filters.returnStops.filter((item) => item !== chip.value),
        });
        return;

      case "airline":
        updateFilters({
          airlines: filters.airlines.filter((item) => item !== chip.value),
          popularFilters: filters.popularFilters.filter((item) => item !== chip.value),
        });
        return;

      case "aircraft":
        updateFilters({
          aircraftSizes: filters.aircraftSizes.filter((item) => item !== chip.value),
        });
        return;

      case "onwardDepartureSlot":
        updateFilters({
          onwardDepartureSlots: filters.onwardDepartureSlots.filter(
            (item) => item !== chip.value
          ),
        });
        return;

      case "onwardArrivalSlot":
        updateFilters({
          onwardArrivalSlots: filters.onwardArrivalSlots.filter(
            (item) => item !== chip.value
          ),
        });
        return;

      case "returnDepartureSlot":
        updateFilters({
          returnDepartureSlots: filters.returnDepartureSlots.filter(
            (item) => item !== chip.value
          ),
        });
        return;

      case "returnArrivalSlot":
        updateFilters({
          returnArrivalSlots: filters.returnArrivalSlots.filter(
            (item) => item !== chip.value
          ),
        });
        return;

      case "onwardDepartureAirport":
        updateFilters({
          onwardDepartureAirports: filters.onwardDepartureAirports.filter(
            (item) => item !== chip.value
          ),
        });
        return;

      case "onwardArrivalAirport":
        updateFilters({
          onwardArrivalAirports: filters.onwardArrivalAirports.filter(
            (item) => item !== chip.value
          ),
        });
        return;

      case "returnDepartureAirport":
        updateFilters({
          returnDepartureAirports: filters.returnDepartureAirports.filter(
            (item) => item !== chip.value
          ),
        });
        return;

      case "returnArrivalAirport":
        updateFilters({
          returnArrivalAirports: filters.returnArrivalAirports.filter(
            (item) => item !== chip.value
          ),
        });
        return;
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({
      popularFilters: [],
      priceRange: [minPrice, maxPrice],

      onwardStops: [],
      onwardDepartureSlots: [],
      onwardArrivalSlots: [],
      onwardDepartureAirports: [],
      onwardArrivalAirports: [],

      returnStops: [],
      returnDepartureSlots: [],
      returnArrivalSlots: [],
      returnDepartureAirports: [],
      returnArrivalAirports: [],

      airlines: [],
      aircraftSizes: [],
    });
  };

  return (
    <aside className="h-fit w-full space-y-4">
      <FilterSection title="Applied Filters">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {appliedFilters.length > 0 ? (
              appliedFilters.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-2 rounded-full bg-[#e0f2fe] px-3 py-1 text-[12px] font-semibold text-[#0f172a]"
                >
                  {chip.label}
                  <button
                    type="button"
                    onClick={() => removeAppliedChip(chip)}
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#38bdf8] text-[10px] leading-none text-white"
                  >
                    ×
                  </button>
                </span>
              ))
            ) : (
              <span className="text-[13px] text-[#64748b]">
                No filters applied
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={clearAllFilters}
            className="shrink-0 text-[13px] font-semibold uppercase tracking-[0.02em] text-[#38bdf8]"
          >
            Clear All
          </button>
        </div>
      </FilterSection>

      <FilterSection title="Popular Filters">
        <div className="space-y-4">
          {popularFilterOptions.map((item) => (
            <FilterCheckboxRow
              key={item.label}
              label={item.label}
              price={item.price}
              checked={filters.popularFilters.includes(item.label)}
              onChange={() => handlePopularFilterToggle(item.label)}
            />
          ))}

          <button
            type="button"
            className="text-[14px] font-medium text-[#38bdf8]"
          >
            + 5 more
          </button>
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div>
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={filters.priceRange[1]}
            onChange={(e) =>
              updateFilters({
                priceRange: [minPrice, Number(e.target.value)],
              })
            }
            className="w-full"
          />
          <div className="mt-3 flex items-center justify-between text-[14px] font-medium text-[#475569]">
            <span>₹ {minPrice.toLocaleString("en-IN")}</span>
            <span>₹ {filters.priceRange[1].toLocaleString("en-IN")}</span>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Onward Journey">
        <div className="space-y-6">
          <div>
            <h4 className="text-[15px] font-semibold text-[#111827]">
              Stops From {fromCity}
            </h4>
            <div className="mt-4 space-y-4">
              {onwardStopOptions.map((item) => (
                <FilterCheckboxRow
                  key={item.label}
                  label={item.label}
                  price={item.price}
                  checked={filters.onwardStops.includes(item.label)}
                  onChange={() => toggleInArray("onwardStops", item.label)}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[15px] font-semibold text-[#111827]">
              Departure From {fromCity}
            </h4>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <TimeSlotButton
                  key={slot}
                  label={slot}
                  active={filters.onwardDepartureSlots.includes(slot)}
                  onClick={() => toggleInArray("onwardDepartureSlots", slot)}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[15px] font-semibold text-[#111827]">
              Arrival at {toCity}
            </h4>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <TimeSlotButton
                  key={slot}
                  label={slot}
                  active={filters.onwardArrivalSlots.includes(slot)}
                  onClick={() => toggleInArray("onwardArrivalSlots", slot)}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[15px] font-semibold text-[#111827]">
              Departure Airports
            </h4>
            <div className="mt-4 space-y-4">
              {onwardDepartureAirports.map((airport) => (
                <FilterCheckboxRow
                  key={airport}
                  label={airport}
                  checked={filters.onwardDepartureAirports.includes(airport)}
                  onChange={() => toggleInArray("onwardDepartureAirports", airport)}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[15px] font-semibold text-[#111827]">
              Arrival Airports
            </h4>
            <div className="mt-4 space-y-4">
              {onwardArrivalAirports.map((airport) => (
                <FilterCheckboxRow
                  key={airport}
                  label={airport}
                  checked={filters.onwardArrivalAirports.includes(airport)}
                  onChange={() => toggleInArray("onwardArrivalAirports", airport)}
                />
              ))}
            </div>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Return Journey">
        <div className="space-y-6">
          <div>
            <h4 className="text-[15px] font-semibold text-[#111827]">
              Stops From {toCity}
            </h4>
            <div className="mt-4 space-y-4">
              {returnStopOptions.map((item) => (
                <FilterCheckboxRow
                  key={item.label}
                  label={item.label}
                  price={item.price}
                  checked={filters.returnStops.includes(item.label)}
                  onChange={() => toggleInArray("returnStops", item.label)}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[15px] font-semibold text-[#111827]">
              Departure From {toCity}
            </h4>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <TimeSlotButton
                  key={slot}
                  label={slot}
                  active={filters.returnDepartureSlots.includes(slot)}
                  onClick={() => toggleInArray("returnDepartureSlots", slot)}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[15px] font-semibold text-[#111827]">
              Arrival at {fromCity}
            </h4>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <TimeSlotButton
                  key={slot}
                  label={slot}
                  active={filters.returnArrivalSlots.includes(slot)}
                  onClick={() => toggleInArray("returnArrivalSlots", slot)}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[15px] font-semibold text-[#111827]">
              Departure Airports
            </h4>
            <div className="mt-4 space-y-4">
              {returnDepartureAirports.map((airport) => (
                <FilterCheckboxRow
                  key={airport}
                  label={airport}
                  checked={filters.returnDepartureAirports.includes(airport)}
                  onChange={() => toggleInArray("returnDepartureAirports", airport)}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[15px] font-semibold text-[#111827]">
              Arrival Airports
            </h4>
            <div className="mt-4 space-y-4">
              {returnArrivalAirports.map((airport) => (
                <FilterCheckboxRow
                  key={airport}
                  label={airport}
                  checked={filters.returnArrivalAirports.includes(airport)}
                  onChange={() => toggleInArray("returnArrivalAirports", airport)}
                />
              ))}
            </div>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Airlines">
        <div className="space-y-4">
          {airlines.map((item) => (
            <FilterCheckboxRow
              key={item.label}
              label={item.label}
              price={item.price}
              checked={filters.airlines.includes(item.label)}
              onChange={() => toggleInArray("airlines", item.label)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Aircraft Size">
        <div className="space-y-4">
          {aircraftSizes.map((item) => (
            <FilterCheckboxRow
              key={item.label}
              label={item.label}
              price={item.price}
              checked={filters.aircraftSizes.includes(item.label)}
              onChange={() => toggleInArray("aircraftSizes", item.label)}
            />
          ))}
        </div>
      </FilterSection>
    </aside>
  );
}