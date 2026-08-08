"use client";

import { FlightsFiltersState } from "../../FlightsFiltersSidebar";
import {
  formatFlightMoney,
  type FlightCurrency,
} from "@/app/lib/flights/flightCurrency";

type SimpleOption = {
  id: string;
  label: string;
  price?: string;
};

type Props = {
  filters: FlightsFiltersState;
  updateFilter: (key: keyof FlightsFiltersState, value: any) => void;
  resetAllFilters: (nextFilters: FlightsFiltersState) => void;
  fromCity: string;
  toCity: string;
  minPrice: number;
  maxPrice: number;
  priceCurrency?: FlightCurrency;
  minDuration: number;
  maxDuration: number;
  minLayoverDuration: number;
  maxLayoverDuration: number;
  allianceOptions: SimpleOption[];
  layoverAirportOptions: SimpleOption[];
};

const popularFilters = [
  { id: "nonstop", label: "Non Stop" },
  { id: "1stop", label: "1 Stop" },
  { id: "refundable", label: "Refundable Fares" },
  { id: "morning", label: "Morning Departures" },
  { id: "afternoon", label: "Afternoon Departures" },
  { id: "early", label: "Early Morning Departures" },
];

const stopOptions = [
  { id: "nonstop", label: "Non Stop" },
  { id: "1stop", label: "1 Stop" },
  { id: "2stop", label: "2+ Stop" },
];

const timeOptions = [
  { id: "before6", label: "Before 6 AM", icon: "◔" },
  { id: "6to12", label: "6 AM to 12 PM", icon: "☼" },
  { id: "12to18", label: "12 PM to 6 PM", icon: "◡" },
  { id: "after18", label: "After 6 PM", icon: "☾" },
];

const aircraftOptions = [
  { id: "smallmid", label: "Small / Mid-size aircraft" },
  { id: "widebody", label: "Wide-body aircraft" },
];

function ensureArray(value: any) {
  return Array.isArray(value) ? value : [];
}

function ensureRange(
  value: any,
  minValue: number,
  maxValue: number
): [number, number] {
  if (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number" &&
    !(value[0] === 0 && value[1] === 0)
  ) {
    return [value[0], value[1]];
  }

  return [minValue, maxValue];
}

function checkboxClass(selected: boolean) {
  return `flex h-6 w-6 items-center justify-center rounded border transition ${
    selected
      ? "border-[#2563eb] bg-[#2563eb] text-white"
      : "border-[#cbd5e1] bg-white text-transparent"
  }`;
}

function sectionTitle(title: string) {
  return (
    <h3 className="text-[18px] font-semibold leading-tight text-[#111827]">
      {title}
    </h3>
  );
}

function formatMinutes(minutes: number) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

export default function OneWayInternationalFilters({
  filters,
  updateFilter,
  resetAllFilters,
  fromCity,
  toCity,
  minPrice,
  maxPrice,
  priceCurrency = "INR",
  minDuration,
  maxDuration,
  minLayoverDuration,
  maxLayoverDuration,
  allianceOptions,
  layoverAirportOptions,
}: Props) {
  const defaultPriceRange: [number, number] = [minPrice, maxPrice];
  const defaultDurationRange: [number, number] = [minDuration, maxDuration];
  const defaultLayoverDurationRange: [number, number] = [
    minLayoverDuration,
    maxLayoverDuration,
  ];

  const safeFilters = filters ?? {
    popular: [],
    departureAirports: [],
    priceRange: defaultPriceRange,
    stops: [],
    departureTime: [],
    arrivalTime: [],
    airlines: [],
    aircraftSize: [],
    checkInBaggage: false,
    durationRange: defaultDurationRange,
    alliances: [],
    layoverAirports: [],
    layoverDurationRange: defaultLayoverDurationRange,
  };

  const selectedPopular = ensureArray(safeFilters.popular);
  const selectedStops = ensureArray(safeFilters.stops);
  const selectedDepartureTime = ensureArray(safeFilters.departureTime);
  const selectedArrivalTime = ensureArray(safeFilters.arrivalTime);
  const selectedAlliances = ensureArray(safeFilters.alliances);
  const selectedLayoverAirports = ensureArray(safeFilters.layoverAirports);
  const selectedAircraft = ensureArray(safeFilters.aircraftSize);

  const priceRange = ensureRange(safeFilters.priceRange, minPrice, maxPrice);
  const durationRange = ensureRange(
    safeFilters.durationRange,
    minDuration,
    maxDuration
  );
  const layoverDurationRange = ensureRange(
    safeFilters.layoverDurationRange,
    minLayoverDuration,
    maxLayoverDuration
  );

  const toggleMultiSelect = (
    key: keyof FlightsFiltersState,
    value: string,
    currentValues: string[]
  ) => {
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

    updateFilter(key, nextValues);
  };

  const removeChip = (type: keyof FlightsFiltersState, value: string) => {
    if (type === "priceRange") {
      updateFilter("priceRange", defaultPriceRange);
      return;
    }

    if (type === "durationRange") {
      updateFilter("durationRange", defaultDurationRange);
      return;
    }

    if (type === "layoverDurationRange") {
      updateFilter("layoverDurationRange", defaultLayoverDurationRange);
      return;
    }

    if (type === "checkInBaggage") {
      updateFilter("checkInBaggage", false);
      return;
    }

    const currentValues = ensureArray((filters as any)?.[type]);

    updateFilter(
      type,
      currentValues.filter((item) => item !== value)
    );
  };

  const clearAll = () => {
    resetAllFilters({
      popular: [],
      departureAirports: [],
      priceRange: defaultPriceRange,
      stops: [],
      departureTime: [],
      arrivalTime: [],
      airlines: [],
      aircraftSize: [],
      checkInBaggage: false,
      durationRange: defaultDurationRange,
      alliances: [],
      layoverAirports: [],
      layoverDurationRange: defaultLayoverDurationRange,
    });
  };

  const appliedChips: {
    key: keyof FlightsFiltersState;
    value: string;
    label: string;
  }[] = [];

  if (safeFilters.checkInBaggage) {
    appliedChips.push({
      key: "checkInBaggage",
      value: "true",
      label: "Check-in baggage included",
    });
  }

  appliedChips.push(
    ...selectedPopular.map((item) => ({
      key: "popular" as const,
      value: item,
      label: popularFilters.find((f) => f.id === item)?.label || item,
    }))
  );

  appliedChips.push(
    ...selectedStops.map((item) => ({
      key: "stops" as const,
      value: item,
      label: stopOptions.find((f) => f.id === item)?.label || item,
    }))
  );

  appliedChips.push(
    ...selectedDepartureTime.map((item) => ({
      key: "departureTime" as const,
      value: item,
      label: timeOptions.find((f) => f.id === item)?.label || item,
    }))
  );

  appliedChips.push(
    ...selectedArrivalTime.map((item) => ({
      key: "arrivalTime" as const,
      value: item,
      label: timeOptions.find((f) => f.id === item)?.label || item,
    }))
  );

  appliedChips.push(
    ...selectedAlliances.map((item) => ({
      key: "alliances" as const,
      value: item,
      label: allianceOptions.find((f) => f.id === item)?.label || item,
    }))
  );

  appliedChips.push(
    ...selectedLayoverAirports.map((item) => ({
      key: "layoverAirports" as const,
      value: item,
      label: layoverAirportOptions.find((f) => f.id === item)?.label || item,
    }))
  );

  appliedChips.push(
    ...selectedAircraft.map((item) => ({
      key: "aircraftSize" as const,
      value: item,
      label: aircraftOptions.find((f) => f.id === item)?.label || item,
    }))
  );

  const isPriceCustom =
    priceRange[0] !== defaultPriceRange[0] ||
    priceRange[1] !== defaultPriceRange[1];

  if (isPriceCustom) {
    appliedChips.push({
      key: "priceRange",
      value: "priceRange",
      label: `${formatFlightMoney(
        priceRange[0],
        priceCurrency
      )} - ${formatFlightMoney(priceRange[1], priceCurrency)}`,
    });
  }

  const isDurationCustom =
    durationRange[0] !== defaultDurationRange[0] ||
    durationRange[1] !== defaultDurationRange[1];

  if (isDurationCustom) {
    appliedChips.push({
      key: "durationRange",
      value: "durationRange",
      label: `Duration: ${formatMinutes(durationRange[0])} - ${formatMinutes(
        durationRange[1]
      )}`,
    });
  }

  const isLayoverDurationCustom =
    layoverDurationRange[0] !== defaultLayoverDurationRange[0] ||
    layoverDurationRange[1] !== defaultLayoverDurationRange[1];

  if (isLayoverDurationCustom) {
    appliedChips.push({
      key: "layoverDurationRange",
      value: "layoverDurationRange",
      label: `Layover: ${formatMinutes(
        layoverDurationRange[0]
      )} - ${formatMinutes(layoverDurationRange[1])}`,
    });
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[18px] font-semibold text-[#111827]">
            Applied Filters
          </div>
          <button
            type="button"
            onClick={clearAll}
            className="text-[13px] font-semibold text-[#2563eb]"
          >
            CLEAR ALL
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {appliedChips.length > 0 ? (
            appliedChips.map((chip) => (
              <div
                key={`${chip.key}-${chip.value}`}
                className="flex items-center gap-2 rounded-full bg-[#e0f2fe] px-3 py-2 text-[13px] font-semibold text-[#0f172a]"
              >
                <span>{chip.label}</span>
                <button
                  type="button"
                  onClick={() => removeChip(chip.key, chip.value)}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-[#3b82f6] text-[12px] text-white"
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <div className="text-[13px] text-[#6b7280]">No filters applied</div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {sectionTitle("Check-in Baggage")}
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={safeFilters.checkInBaggage}
              onChange={() =>
                updateFilter("checkInBaggage", !safeFilters.checkInBaggage)
              }
              className="hidden"
            />
            <span className={checkboxClass(safeFilters.checkInBaggage)}>✓</span>
            <span className="text-[15px] text-[#111827]">
              Show flights with check-in baggage
            </span>
          </div>
        </label>
      </div>

      <div className="space-y-4">
        {sectionTitle("Popular Filters")}
        <div className="space-y-4">
          {popularFilters.map((item) => {
            const selected = selectedPopular.includes(item.id);

            return (
              <label
                key={item.id}
                className="flex cursor-pointer items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      toggleMultiSelect("popular", item.id, selectedPopular)
                    }
                    className="hidden"
                  />
                  <span className={checkboxClass(selected)}>✓</span>
                  <span className="text-[15px] text-[#111827]">{item.label}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {sectionTitle("One Way Price")}
        <div className="space-y-4">
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={priceRange[1]}
            onChange={(e) =>
              updateFilter("priceRange", [minPrice, Number(e.target.value)])
            }
            className="w-full accent-[#0ea5e9]"
          />
          <div className="flex items-center justify-between text-[15px] text-[#111827]">
            <span>{formatFlightMoney(priceRange[0], priceCurrency)}</span>
            <span>{formatFlightMoney(priceRange[1], priceCurrency)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sectionTitle("Duration")}
        <div className="space-y-4">
          <input
            type="range"
            min={minDuration}
            max={maxDuration}
            value={durationRange[1]}
            onChange={(e) =>
              updateFilter("durationRange", [minDuration, Number(e.target.value)])
            }
            className="w-full accent-[#0ea5e9]"
          />
          <div className="flex items-center justify-between text-[15px] text-[#111827]">
            <span>{formatMinutes(durationRange[0])}</span>
            <span>{formatMinutes(durationRange[1])}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sectionTitle(`Stops From ${fromCity}`)}
        <div className="space-y-4">
          {stopOptions.map((stop) => {
            const selected = selectedStops.includes(stop.id);

            return (
              <label
                key={stop.id}
                className="flex cursor-pointer items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      toggleMultiSelect("stops", stop.id, selectedStops)
                    }
                    className="hidden"
                  />
                  <span className={checkboxClass(selected)}>✓</span>
                  <span className="text-[15px] text-[#111827]">{stop.label}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {sectionTitle(`Departure From ${fromCity}`)}
        <div className="grid grid-cols-4 gap-2">
          {timeOptions.map((time) => {
            const selected = selectedDepartureTime.includes(time.id);

            return (
              <button
                key={time.id}
                type="button"
                onClick={() =>
                  toggleMultiSelect("departureTime", time.id, selectedDepartureTime)
                }
                className={`rounded-lg border px-2 py-3 text-center text-[12px] font-medium leading-4 transition ${
                  selected
                    ? "border-[#2563eb] bg-[#eff6ff] text-[#111827]"
                    : "border-[#dbe4ef] bg-white text-[#111827]"
                }`}
              >
                <div className="mb-2 text-[16px]">{time.icon}</div>
                <div>{time.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {sectionTitle(`Arrival At ${toCity}`)}
        <div className="grid grid-cols-4 gap-2">
          {timeOptions.map((time) => {
            const selected = selectedArrivalTime.includes(time.id);

            return (
              <button
                key={time.id}
                type="button"
                onClick={() =>
                  toggleMultiSelect("arrivalTime", time.id, selectedArrivalTime)
                }
                className={`rounded-lg border px-2 py-3 text-center text-[12px] font-medium leading-4 transition ${
                  selected
                    ? "border-[#2563eb] bg-[#eff6ff] text-[#111827]"
                    : "border-[#dbe4ef] bg-white text-[#111827]"
                }`}
              >
                <div className="mb-2 text-[16px]">{time.icon}</div>
                <div>{time.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {sectionTitle("Alliance")}
        <div className="space-y-4">
          {allianceOptions.length > 0 ? (
            allianceOptions.map((item) => {
              const selected = selectedAlliances.includes(item.id);

              return (
                <label
                  key={item.id}
                  className="flex cursor-pointer items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        toggleMultiSelect("alliances", item.id, selectedAlliances)
                      }
                      className="hidden"
                    />
                    <span className={checkboxClass(selected)}>✓</span>
                    <span className="text-[15px] text-[#111827]">
                      {item.label}
                    </span>
                  </div>
                  {item.price ? (
                    <span className="text-[15px] text-[#111827]">
                      {item.price}
                    </span>
                  ) : null}
                </label>
              );
            })
          ) : (
            <div className="text-[14px] text-[#6b7280]">No alliance data</div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {sectionTitle("Layover Airport")}
        <div className="space-y-4">
          {layoverAirportOptions.length > 0 ? (
            layoverAirportOptions.map((item) => {
              const selected = selectedLayoverAirports.includes(item.id);

              return (
                <label
                  key={item.id}
                  className="flex cursor-pointer items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        toggleMultiSelect(
                          "layoverAirports",
                          item.id,
                          selectedLayoverAirports
                        )
                      }
                      className="hidden"
                    />
                    <span className={checkboxClass(selected)}>✓</span>
                    <span className="text-[15px] text-[#111827]">
                      {item.label}
                    </span>
                  </div>
                  {item.price ? (
                    <span className="text-[15px] text-[#111827]">
                      {item.price}
                    </span>
                  ) : null}
                </label>
              );
            })
          ) : (
            <div className="text-[14px] text-[#6b7280]">No layover airport data</div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {sectionTitle("Layover Duration")}
        <div className="space-y-4">
          <input
            type="range"
            min={minLayoverDuration}
            max={maxLayoverDuration}
            value={layoverDurationRange[1]}
            onChange={(e) =>
              updateFilter("layoverDurationRange", [
                minLayoverDuration,
                Number(e.target.value),
              ])
            }
            className="w-full accent-[#0ea5e9]"
          />
          <div className="flex items-center justify-between text-[15px] text-[#111827]">
            <span>{formatMinutes(layoverDurationRange[0])}</span>
            <span>{formatMinutes(layoverDurationRange[1])}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sectionTitle("Aircraft Size")}
        <div className="space-y-4">
          {aircraftOptions.map((aircraft) => {
            const selected = selectedAircraft.includes(aircraft.id);

            return (
              <label
                key={aircraft.id}
                className="flex cursor-pointer items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      toggleMultiSelect("aircraftSize", aircraft.id, selectedAircraft)
                    }
                    className="hidden"
                  />
                  <span className={checkboxClass(selected)}>✓</span>
                  <span className="text-[15px] text-[#111827]">
                    {aircraft.label}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
