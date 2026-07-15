"use client";

import { useMemo } from "react";

export type TimeSlot =
  | "Before 6 AM"
  | "6 AM to 12 PM"
  | "12 PM to 6 PM"
  | "After 6 PM";

export type AllianceType = "SkyTeam" | "Star Alliance" | "Oneworld" | "None";
export type AircraftSizeType = "Small / Mid-size aircraft" | "Large Aircraft" | string;

export type RoundTripInternationalFiltersValue = {
  hasCheckInBaggage: boolean;
  popularFilters: string[];
  maxRoundTripPrice: number;

  onwardStops: string[];
  onwardMaxDuration: number;
  onwardDepartureSlots: TimeSlot[];
  onwardArrivalSlots: TimeSlot[];
  onwardDepartureAirports: string[];
  onwardArrivalAirports: string[];
  onwardLayoverAirports: string[];
  onwardMaxLayoverDuration: number;

  returnStops: string[];
  returnMaxDuration: number;
  returnDepartureSlots: TimeSlot[];
  returnArrivalSlots: TimeSlot[];
  returnDepartureAirports: string[];
  returnArrivalAirports: string[];
  returnLayoverAirports: string[];
  returnMaxLayoverDuration: number;

  alliances: AllianceType[];
  airlines: string[];
  aircraftSizes: AircraftSizeType[];
};

type OptionWithPrice = {
  label: string;
  price?: number;
};

type AppliedChip = {
  key: string;
  label: string;
  onRemove: () => void;
};

type RoundTripInternationalFiltersProps = {
  filters: RoundTripInternationalFiltersValue;
  onChange: (next: RoundTripInternationalFiltersValue) => void;

  fromCity: string;
  toCity: string;

  minRoundTripPrice: number;
  maxRoundTripPrice: number;

  minOnwardDuration: number;
  maxOnwardDuration: number;

  minReturnDuration: number;
  maxReturnDuration: number;

  minOnwardLayoverDuration: number;
  maxOnwardLayoverDuration: number;

  minReturnLayoverDuration: number;
  maxReturnLayoverDuration: number;

  onwardStopOptions: OptionWithPrice[];
  returnStopOptions: OptionWithPrice[];

  onwardDepartureAirportOptions: string[];
  onwardArrivalAirportOptions: string[];
  onwardLayoverAirportOptions: OptionWithPrice[];

  returnDepartureAirportOptions: string[];
  returnArrivalAirportOptions: string[];
  returnLayoverAirportOptions: OptionWithPrice[];

  airlineOptions: OptionWithPrice[];
  aircraftSizeOptions: OptionWithPrice[];
};

const popularFilterOptions: OptionWithPrice[] = [
  { label: "Non Stop" },
  { label: "Hide Nearby Airports" },
  { label: "Refundable Fares" },
];

const timeSlots: TimeSlot[] = [
  "Before 6 AM",
  "6 AM to 12 PM",
  "12 PM to 6 PM",
  "After 6 PM",
];

const allianceOptions: AllianceType[] = [
  "SkyTeam",
  "Star Alliance",
  "Oneworld",
];

function formatPrice(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  return `₹ ${value.toLocaleString("en-IN")}`;
}

function formatDuration(minutes: number) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs} h ${mins} m`;
}

function removeValue<T extends string>(items: T[], value: T) {
  return items.filter((item) => item !== value);
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

function FilterCheckboxRow({
  label,
  price,
  checked,
  onChange,
}: {
  label: string;
  price?: number;
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

      {typeof price === "number" ? (
        <span className="whitespace-nowrap text-[14px] font-medium text-[#475569]">
          {formatPrice(price)}
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
  const [topLine, bottomLine] = label.includes(" to ")
    ? label.split(" to ")
    : [label, ""];

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
      <span className="text-[11px] font-semibold leading-[15px]">{topLine}</span>
      {bottomLine ? (
        <span className="mt-0.5 text-[11px] font-semibold leading-[15px]">
          to {bottomLine}
        </span>
      ) : null}
    </button>
  );
}

export default function RoundTripInternationalFilters({
  filters,
  onChange,
  fromCity,
  toCity,

  minRoundTripPrice,
  maxRoundTripPrice,

  minOnwardDuration,
  maxOnwardDuration,

  minReturnDuration,
  maxReturnDuration,

  minOnwardLayoverDuration,
  maxOnwardLayoverDuration,

  minReturnLayoverDuration,
  maxReturnLayoverDuration,

  onwardStopOptions,
  returnStopOptions,

  onwardDepartureAirportOptions,
  onwardArrivalAirportOptions,
  onwardLayoverAirportOptions,

  returnDepartureAirportOptions,
  returnArrivalAirportOptions,
  returnLayoverAirportOptions,

  airlineOptions,
  aircraftSizeOptions,
}: RoundTripInternationalFiltersProps) {
  const setFilters = (
    patch:
      | Partial<RoundTripInternationalFiltersValue>
      | ((prev: RoundTripInternationalFiltersValue) => RoundTripInternationalFiltersValue)
  ) => {
    if (typeof patch === "function") {
      onChange(patch(filters));
      return;
    }

    onChange({
      ...filters,
      ...patch,
    });
  };

  const toggleStringArray = (
    key:
      | "popularFilters"
      | "onwardStops"
      | "returnStops"
      | "onwardDepartureSlots"
      | "onwardArrivalSlots"
      | "returnDepartureSlots"
      | "returnArrivalSlots"
      | "onwardDepartureAirports"
      | "onwardArrivalAirports"
      | "returnDepartureAirports"
      | "returnArrivalAirports"
      | "onwardLayoverAirports"
      | "returnLayoverAirports"
      | "airlines"
      | "aircraftSizes"
      | "alliances",
    value: string
  ) => {
    const current = filters[key] as string[];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    setFilters({ [key]: next } as Partial<RoundTripInternationalFiltersValue>);
  };

  const appliedFilters = useMemo<AppliedChip[]>(() => {
    const chips: AppliedChip[] = [];

    if (filters.hasCheckInBaggage) {
      chips.push({
        key: "checkin-baggage",
        label: "Check-in Baggage",
        onRemove: () => setFilters({ hasCheckInBaggage: false }),
      });
    }

    filters.popularFilters.forEach((item) => {
      chips.push({
        key: `popular-${item}`,
        label: item,
        onRemove: () =>
          setFilters({
            popularFilters: removeValue(filters.popularFilters, item),
          }),
      });
    });

    filters.onwardStops.forEach((item) => {
      chips.push({
        key: `onward-stop-${item}`,
        label: `${fromCity}: ${item.toUpperCase()}`,
        onRemove: () =>
          setFilters({
            onwardStops: removeValue(filters.onwardStops, item),
          }),
      });
    });

    filters.returnStops.forEach((item) => {
      chips.push({
        key: `return-stop-${item}`,
        label: `${toCity}: ${item.toUpperCase()}`,
        onRemove: () =>
          setFilters({
            returnStops: removeValue(filters.returnStops, item),
          }),
      });
    });

    filters.onwardDepartureSlots.forEach((item) => {
      chips.push({
        key: `ods-${item}`,
        label: `Onward Departure: ${item}`,
        onRemove: () =>
          setFilters({
            onwardDepartureSlots: removeValue(filters.onwardDepartureSlots, item),
          }),
      });
    });

    filters.onwardArrivalSlots.forEach((item) => {
      chips.push({
        key: `oas-${item}`,
        label: `Onward Arrival: ${item}`,
        onRemove: () =>
          setFilters({
            onwardArrivalSlots: removeValue(filters.onwardArrivalSlots, item),
          }),
      });
    });

    filters.returnDepartureSlots.forEach((item) => {
      chips.push({
        key: `rds-${item}`,
        label: `Return Departure: ${item}`,
        onRemove: () =>
          setFilters({
            returnDepartureSlots: removeValue(filters.returnDepartureSlots, item),
          }),
      });
    });

    filters.returnArrivalSlots.forEach((item) => {
      chips.push({
        key: `ras-${item}`,
        label: `Return Arrival: ${item}`,
        onRemove: () =>
          setFilters({
            returnArrivalSlots: removeValue(filters.returnArrivalSlots, item),
          }),
      });
    });

    filters.onwardDepartureAirports.forEach((item) => {
      chips.push({
        key: `oda-${item}`,
        label: `Onward Dep Airport: ${item}`,
        onRemove: () =>
          setFilters({
            onwardDepartureAirports: removeValue(
              filters.onwardDepartureAirports,
              item
            ),
          }),
      });
    });

    filters.onwardArrivalAirports.forEach((item) => {
      chips.push({
        key: `oaa-${item}`,
        label: `Onward Arr Airport: ${item}`,
        onRemove: () =>
          setFilters({
            onwardArrivalAirports: removeValue(filters.onwardArrivalAirports, item),
          }),
      });
    });

    filters.returnDepartureAirports.forEach((item) => {
      chips.push({
        key: `rda-${item}`,
        label: `Return Dep Airport: ${item}`,
        onRemove: () =>
          setFilters({
            returnDepartureAirports: removeValue(
              filters.returnDepartureAirports,
              item
            ),
          }),
      });
    });

    filters.returnArrivalAirports.forEach((item) => {
      chips.push({
        key: `raa-${item}`,
        label: `Return Arr Airport: ${item}`,
        onRemove: () =>
          setFilters({
            returnArrivalAirports: removeValue(filters.returnArrivalAirports, item),
          }),
      });
    });

    filters.onwardLayoverAirports.forEach((item) => {
      chips.push({
        key: `ola-${item}`,
        label: `Onward Layover: ${item}`,
        onRemove: () =>
          setFilters({
            onwardLayoverAirports: removeValue(filters.onwardLayoverAirports, item),
          }),
      });
    });

    filters.returnLayoverAirports.forEach((item) => {
      chips.push({
        key: `rla-${item}`,
        label: `Return Layover: ${item}`,
        onRemove: () =>
          setFilters({
            returnLayoverAirports: removeValue(filters.returnLayoverAirports, item),
          }),
      });
    });

    filters.airlines.forEach((item) => {
      chips.push({
        key: `airline-${item}`,
        label: item,
        onRemove: () =>
          setFilters({
            airlines: removeValue(filters.airlines, item),
          }),
      });
    });

    filters.aircraftSizes.forEach((item) => {
      chips.push({
        key: `aircraft-${item}`,
        label: item,
        onRemove: () =>
          setFilters({
            aircraftSizes: removeValue(filters.aircraftSizes, item),
          }),
      });
    });

    filters.alliances.forEach((item) => {
      chips.push({
        key: `alliance-${item}`,
        label: item,
        onRemove: () =>
          setFilters({
            alliances: removeValue(filters.alliances, item),
          }),
      });
    });

    return chips;
  }, [filters, fromCity, toCity]);

  const clearAll = () => {
    onChange({
      hasCheckInBaggage: false,
      popularFilters: [],
      maxRoundTripPrice: maxRoundTripPrice,

      onwardStops: [],
      onwardMaxDuration: maxOnwardDuration,
      onwardDepartureSlots: [],
      onwardArrivalSlots: [],
      onwardDepartureAirports: [],
      onwardArrivalAirports: [],
      onwardLayoverAirports: [],
      onwardMaxLayoverDuration: maxOnwardLayoverDuration,

      returnStops: [],
      returnMaxDuration: maxReturnDuration,
      returnDepartureSlots: [],
      returnArrivalSlots: [],
      returnDepartureAirports: [],
      returnArrivalAirports: [],
      returnLayoverAirports: [],
      returnMaxLayoverDuration: maxReturnLayoverDuration,

      alliances: [],
      airlines: [],
      aircraftSizes: [],
    });
  };

  return (
  <aside className="sticky top-[82px] h-fit max-h-[calc(100vh-96px)] w-full space-y-4 overflow-y-auto pr-1 scrollbar-hide">
      <FilterSection title="Applied Filters">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {appliedFilters.length > 0 ? (
              appliedFilters.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onRemove}
                  className="inline-flex items-center gap-2 rounded-full bg-[#e0f2fe] px-3 py-1 text-[12px] font-semibold text-[#0f172a]"
                >
                  <span>{chip.label}</span>
                  <span className="text-[12px] leading-none">×</span>
                </button>
              ))
            ) : (
              <span className="text-[13px] text-[#64748b]">No filters applied</span>
            )}
          </div>

          <button
            type="button"
            onClick={clearAll}
            className="shrink-0 text-[13px] font-semibold uppercase tracking-[0.02em] text-[#38bdf8]"
          >
            Clear All
          </button>
        </div>
      </FilterSection>

      <FilterSection title="Check-in Baggage Filter">
        <FilterCheckboxRow
          label="Show flights with Check-in Baggage"
          checked={filters.hasCheckInBaggage}
          onChange={() =>
            setFilters({ hasCheckInBaggage: !filters.hasCheckInBaggage })
          }
        />
      </FilterSection>

      <FilterSection title="Popular Filters">
        <div className="space-y-4">
          {popularFilterOptions.map((item) => (
            <FilterCheckboxRow
              key={item.label}
              label={item.label}
              checked={filters.popularFilters.includes(item.label)}
              onChange={() => toggleStringArray("popularFilters", item.label)}
            />
          ))}

          {airlineOptions.slice(0, 1).map((item) => (
            <FilterCheckboxRow
              key={item.label}
              label={item.label}
              price={item.price}
              checked={filters.airlines.includes(item.label)}
              onChange={() => toggleStringArray("airlines", item.label)}
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

      <FilterSection title="Round-trip Price">
        <div>
          <input
            type="range"
            min={minRoundTripPrice}
            max={maxRoundTripPrice}
            value={filters.maxRoundTripPrice}
            onChange={(e) =>
              setFilters({ maxRoundTripPrice: Number(e.target.value) })
            }
            className="w-full"
          />
          <div className="mt-3 flex items-center justify-between text-[14px] font-medium text-[#475569]">
            <span>{formatPrice(minRoundTripPrice)}</span>
            <span>{formatPrice(maxRoundTripPrice)}</span>
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
                  onChange={() => toggleStringArray("onwardStops", item.label)}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[15px] font-semibold text-[#111827]">
              Onward Journey Duration
            </h4>
            <div className="mt-4">
              <input
                type="range"
                min={minOnwardDuration}
                max={maxOnwardDuration}
                value={filters.onwardMaxDuration}
                onChange={(e) =>
                  setFilters({ onwardMaxDuration: Number(e.target.value) })
                }
                className="w-full"
              />
              <div className="mt-3 flex items-center justify-between text-[14px] font-medium text-[#475569]">
                <span>{formatDuration(minOnwardDuration)}</span>
                <span>{formatDuration(maxOnwardDuration)}</span>
              </div>
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
                  onClick={() => toggleStringArray("onwardDepartureSlots", slot)}
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
                  onClick={() => toggleStringArray("onwardArrivalSlots", slot)}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[15px] font-semibold text-[#111827]">
              Departure Airports
            </h4>
            <div className="mt-4 space-y-4">
              {onwardDepartureAirportOptions.map((airport) => (
                <FilterCheckboxRow
                  key={airport}
                  label={airport}
                  checked={filters.onwardDepartureAirports.includes(airport)}
                  onChange={() =>
                    toggleStringArray("onwardDepartureAirports", airport)
                  }
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[15px] font-semibold text-[#111827]">
              Arrival Airports
            </h4>
            <div className="mt-4 space-y-4">
              {onwardArrivalAirportOptions.map((airport) => (
                <FilterCheckboxRow
                  key={airport}
                  label={airport}
                  checked={filters.onwardArrivalAirports.includes(airport)}
                  onChange={() =>
                    toggleStringArray("onwardArrivalAirports", airport)
                  }
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[15px] font-semibold text-[#111827]">
              Layover Airports
            </h4>
            <div className="mt-4 space-y-4">
              {onwardLayoverAirportOptions.slice(0, 2).map((airport) => (
                <FilterCheckboxRow
                  key={airport.label}
                  label={airport.label}
                  price={airport.price}
                  checked={filters.onwardLayoverAirports.includes(airport.label)}
                  onChange={() =>
                    toggleStringArray("onwardLayoverAirports", airport.label)
                  }
                />
              ))}

              {onwardLayoverAirportOptions.length > 2 ? (
                <button
                  type="button"
                  className="text-[14px] font-medium text-[#38bdf8]"
                >
                  + {onwardLayoverAirportOptions.length - 2} more
                </button>
              ) : null}
            </div>
          </div>

          <div>
            <h4 className="text-[15px] font-semibold text-[#111827]">
              Layover Duration
            </h4>
            <div className="mt-4">
              <input
                type="range"
                min={minOnwardLayoverDuration}
                max={maxOnwardLayoverDuration}
                value={filters.onwardMaxLayoverDuration}
                onChange={(e) =>
                  setFilters({
                    onwardMaxLayoverDuration: Number(e.target.value),
                  })
                }
                className="w-full"
              />
              <div className="mt-3 flex items-center justify-between text-[14px] font-medium text-[#475569]">
                <span>{formatDuration(minOnwardLayoverDuration)}</span>
                <span>{formatDuration(maxOnwardLayoverDuration)}</span>
              </div>
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
                  onChange={() => toggleStringArray("returnStops", item.label)}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[15px] font-semibold text-[#111827]">
              Return Journey Duration
            </h4>
            <div className="mt-4">
              <input
                type="range"
                min={minReturnDuration}
                max={maxReturnDuration}
                value={filters.returnMaxDuration}
                onChange={(e) =>
                  setFilters({ returnMaxDuration: Number(e.target.value) })
                }
                className="w-full"
              />
              <div className="mt-3 flex items-center justify-between text-[14px] font-medium text-[#475569]">
                <span>{formatDuration(minReturnDuration)}</span>
                <span>{formatDuration(maxReturnDuration)}</span>
              </div>
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
                  onClick={() => toggleStringArray("returnDepartureSlots", slot)}
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
                  onClick={() => toggleStringArray("returnArrivalSlots", slot)}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[15px] font-semibold text-[#111827]">
              Departure Airports
            </h4>
            <div className="mt-4 space-y-4">
              {returnDepartureAirportOptions.map((airport) => (
                <FilterCheckboxRow
                  key={airport}
                  label={airport}
                  checked={filters.returnDepartureAirports.includes(airport)}
                  onChange={() =>
                    toggleStringArray("returnDepartureAirports", airport)
                  }
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[15px] font-semibold text-[#111827]">
              Arrival Airports
            </h4>
            <div className="mt-4 space-y-4">
              {returnArrivalAirportOptions.map((airport) => (
                <FilterCheckboxRow
                  key={airport}
                  label={airport}
                  checked={filters.returnArrivalAirports.includes(airport)}
                  onChange={() =>
                    toggleStringArray("returnArrivalAirports", airport)
                  }
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[15px] font-semibold text-[#111827]">
              Layover Airports
            </h4>
            <div className="mt-4 space-y-4">
              {returnLayoverAirportOptions.slice(0, 2).map((airport) => (
                <FilterCheckboxRow
                  key={airport.label}
                  label={airport.label}
                  price={airport.price}
                  checked={filters.returnLayoverAirports.includes(airport.label)}
                  onChange={() =>
                    toggleStringArray("returnLayoverAirports", airport.label)
                  }
                />
              ))}

              {returnLayoverAirportOptions.length > 2 ? (
                <button
                  type="button"
                  className="text-[14px] font-medium text-[#38bdf8]"
                >
                  + {returnLayoverAirportOptions.length - 2} more
                </button>
              ) : null}
            </div>
          </div>

          <div>
            <h4 className="text-[15px] font-semibold text-[#111827]">
              Layover Duration
            </h4>
            <div className="mt-4">
              <input
                type="range"
                min={minReturnLayoverDuration}
                max={maxReturnLayoverDuration}
                value={filters.returnMaxLayoverDuration}
                onChange={(e) =>
                  setFilters({
                    returnMaxLayoverDuration: Number(e.target.value),
                  })
                }
                className="w-full"
              />
              <div className="mt-3 flex items-center justify-between text-[14px] font-medium text-[#475569]">
                <span>{formatDuration(minReturnLayoverDuration)}</span>
                <span>{formatDuration(maxReturnLayoverDuration)}</span>
              </div>
            </div>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Alliances & Airlines">
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-2">
            {allianceOptions.map((alliance) => (
              <button
                key={alliance}
                type="button"
                onClick={() => toggleStringArray("alliances", alliance)}
                className={`rounded-lg border px-3 py-3 text-[12px] font-medium transition ${
                  filters.alliances.includes(alliance)
                    ? "border-[#0ea5e9] bg-[#eff8ff] text-[#0f172a]"
                    : "border-[#d7dee7] bg-white text-[#475569]"
                }`}
              >
                {alliance}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {airlineOptions.slice(0, 6).map((item) => (
              <FilterCheckboxRow
                key={item.label}
                label={item.label}
                price={item.price}
                checked={filters.airlines.includes(item.label)}
                onChange={() => toggleStringArray("airlines", item.label)}
              />
            ))}
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Aircraft Size">
        <div className="space-y-4">
          {aircraftSizeOptions.map((item) => (
            <FilterCheckboxRow
              key={item.label}
              label={item.label}
              price={item.price}
              checked={filters.aircraftSizes.includes(item.label)}
              onChange={() => toggleStringArray("aircraftSizes", item.label)}
            />
          ))}
        </div>
      </FilterSection>
    </aside>
  );
}
