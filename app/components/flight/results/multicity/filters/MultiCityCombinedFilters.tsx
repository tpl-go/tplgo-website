"use client";

import {
  createDefaultCombinedFiltersState,
  createDefaultCombinedLegFilter,
  MultiCityCombinedFiltersState,
  CombinedTimeBucket,
} from "./filterTypes";
import { MultiCityLeg } from "../../../data/multicityFlights";

type SimpleOption = {
  id: string;
  label: string;
  price?: string;
};

type Props = {
  filters: MultiCityCombinedFiltersState;
  onFiltersChange: (filters: MultiCityCombinedFiltersState) => void;
  legs: MultiCityLeg[];
  minPrice: number;
  maxPrice: number;
  minDuration: number;
  maxDuration: number;
  minLayoverDuration: number;
  maxLayoverDuration: number;
  airlineOptions: SimpleOption[];
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

const timeOptions: {
  id: CombinedTimeBucket;
  label: string;
  icon: string;
}[] = [
  { id: "before6", label: "Before 6 AM", icon: "◔" },
  { id: "6to12", label: "6 AM to 12 PM", icon: "☼" },
  { id: "12to18", label: "12 PM to 6 PM", icon: "◡" },
  { id: "after18", label: "After 6 PM", icon: "☾" },
];

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

  if (mins === 0) return `${hrs} h`;
  return `${hrs} h ${mins} m`;
}

export default function MultiCityCombinedFilters({
  filters,
  onFiltersChange,
  legs,
  minPrice,
  maxPrice,
  minDuration,
  maxDuration,
  minLayoverDuration,
  maxLayoverDuration,
  airlineOptions,
  layoverAirportOptions,
}: Props) {
  const safeFilters =
    filters ??
    createDefaultCombinedFiltersState(
      legs.length,
      minPrice,
      maxPrice,
      minDuration,
      maxDuration,
      minLayoverDuration,
      maxLayoverDuration
    );

  const updateFilters = (next: MultiCityCombinedFiltersState) => {
    onFiltersChange(next);
  };

  const toggleCommonMultiSelect = (
    key: "popular" | "airlines" | "layoverAirports",
    value: string
  ) => {
    const currentValues = safeFilters[key];
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

    updateFilters({
      ...safeFilters,
      [key]: nextValues,
    });
  };

  const toggleLegMultiSelect = (
    legIndex: number,
    key: "stops" | "departureTime" | "arrivalTime",
    value: string
  ) => {
    const currentLeg = safeFilters.legFilters[legIndex];
    const currentValues = currentLeg[key];

    const nextValues = currentValues.includes(value as never)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value as never];

    updateFilters({
      ...safeFilters,
      legFilters: {
        ...safeFilters.legFilters,
        [legIndex]: {
          ...currentLeg,
          [key]: nextValues,
        },
      },
    });
  };

  const clearAll = () => {
    updateFilters(
      createDefaultCombinedFiltersState(
        legs.length,
        minPrice,
        maxPrice,
        minDuration,
        maxDuration,
        minLayoverDuration,
        maxLayoverDuration
      )
    );
  };

  const appliedChips: { id: string; label: string; onRemove: () => void }[] = [];

  if (safeFilters.checkInBaggage) {
    appliedChips.push({
      id: "checkInBaggage",
      label: "Check-in baggage included",
      onRemove: () =>
        updateFilters({
          ...safeFilters,
          checkInBaggage: false,
        }),
    });
  }

  safeFilters.popular.forEach((item) => {
    appliedChips.push({
      id: `popular-${item}`,
      label: popularFilters.find((filter) => filter.id === item)?.label || item,
      onRemove: () => toggleCommonMultiSelect("popular", item),
    });
  });

  safeFilters.airlines.forEach((item) => {
    appliedChips.push({
      id: `airline-${item}`,
      label: airlineOptions.find((option) => option.id === item)?.label || item,
      onRemove: () => toggleCommonMultiSelect("airlines", item),
    });
  });

  safeFilters.layoverAirports.forEach((item) => {
    appliedChips.push({
      id: `layover-${item}`,
      label:
        layoverAirportOptions.find((option) => option.id === item)?.label || item,
      onRemove: () => toggleCommonMultiSelect("layoverAirports", item),
    });
  });

  const defaultPriceRange: [number, number] = [minPrice, maxPrice];
  const defaultDurationRange: [number, number] = [minDuration, maxDuration];
  const defaultLayoverRange: [number, number] = [
    minLayoverDuration,
    maxLayoverDuration,
  ];

  if (
    safeFilters.priceRange[0] !== defaultPriceRange[0] ||
    safeFilters.priceRange[1] !== defaultPriceRange[1]
  ) {
    appliedChips.push({
      id: "priceRange",
      label: `₹ ${safeFilters.priceRange[0].toLocaleString(
        "en-IN"
      )} - ₹ ${safeFilters.priceRange[1].toLocaleString("en-IN")}`,
      onRemove: () =>
        updateFilters({
          ...safeFilters,
          priceRange: defaultPriceRange,
        }),
    });
  }

  if (
    safeFilters.durationRange[0] !== defaultDurationRange[0] ||
    safeFilters.durationRange[1] !== defaultDurationRange[1]
  ) {
    appliedChips.push({
      id: "durationRange",
      label: `Duration: ${formatMinutes(
        safeFilters.durationRange[0]
      )} - ${formatMinutes(safeFilters.durationRange[1])}`,
      onRemove: () =>
        updateFilters({
          ...safeFilters,
          durationRange: defaultDurationRange,
        }),
    });
  }

  const shouldShowLayoverChip =
  safeFilters.layoverDurationRange[0] > 0 ||
  safeFilters.layoverDurationRange[1] > 0;

if (shouldShowLayoverChip) {
  appliedChips.push({
    id: "layoverDurationRange",
    label: `Layover: ${formatMinutes(
      safeFilters.layoverDurationRange[0]
    )} - ${formatMinutes(safeFilters.layoverDurationRange[1])}`,
    onRemove: () =>
      updateFilters({
        ...safeFilters,
        layoverDurationRange: [0, 0],
      }),
  });
}

  legs.forEach((leg, legIndex) => {
  const legFilter =
    safeFilters.legFilters[legIndex] ?? createDefaultCombinedLegFilter();

  legFilter.stops.forEach((item) => {
      appliedChips.push({
        id: `leg-${legIndex}-stop-${item}`,
        label: `Flight ${legIndex + 1}: ${
          stopOptions.find((stop) => stop.id === item)?.label || item
        }`,
        onRemove: () => toggleLegMultiSelect(legIndex, "stops", item),
      });
    });

    legFilter.departureTime.forEach((item) => {
      appliedChips.push({
        id: `leg-${legIndex}-departure-${item}`,
        label: `Flight ${legIndex + 1}: Departure ${
          timeOptions.find((time) => time.id === item)?.label || item
        }`,
        onRemove: () => toggleLegMultiSelect(legIndex, "departureTime", item),
      });
    });

    legFilter.arrivalTime.forEach((item) => {
      appliedChips.push({
        id: `leg-${legIndex}-arrival-${item}`,
        label: `Flight ${legIndex + 1}: Arrival ${
          timeOptions.find((time) => time.id === item)?.label || item
        }`,
        onRemove: () => toggleLegMultiSelect(legIndex, "arrivalTime", item),
      });
    });
  });

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
                key={chip.id}
                className="flex items-center gap-2 rounded-full bg-[#e0f2fe] px-3 py-2 text-[13px] font-semibold text-[#0f172a]"
              >
                <span>{chip.label}</span>

                <button
                  type="button"
                  onClick={chip.onRemove}
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
        {sectionTitle("Check-in Baggage Filter")}

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={safeFilters.checkInBaggage}
            onChange={() =>
              updateFilters({
                ...safeFilters,
                checkInBaggage: !safeFilters.checkInBaggage,
              })
            }
            className="hidden"
          />

          <span className={checkboxClass(safeFilters.checkInBaggage)}>✓</span>

          <span className="text-[15px] text-[#111827]">
            Show flights with Check-in Baggage
          </span>
        </label>
      </div>

      <div className="space-y-4">
        {sectionTitle("Popular Filters")}

        <div className="space-y-4">
          {popularFilters.map((item) => {
            const selected = safeFilters.popular.includes(item.id);

            return (
              <label
                key={item.id}
                className="flex cursor-pointer items-center gap-3"
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleCommonMultiSelect("popular", item.id)}
                  className="hidden"
                />

                <span className={checkboxClass(selected)}>✓</span>

                <span className="text-[15px] text-[#111827]">{item.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {sectionTitle("Price")}

        <div className="space-y-4">
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={safeFilters.priceRange[1]}
            onChange={(e) =>
              updateFilters({
                ...safeFilters,
                priceRange: [minPrice, Number(e.target.value)],
              })
            }
            className="w-full accent-[#0ea5e9]"
          />

          <div className="flex items-center justify-between text-[15px] text-[#111827]">
            <span>₹ {safeFilters.priceRange[0].toLocaleString("en-IN")}</span>
            <span>₹ {safeFilters.priceRange[1].toLocaleString("en-IN")}</span>
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
            value={safeFilters.durationRange[1]}
            onChange={(e) =>
              updateFilters({
                ...safeFilters,
                durationRange: [minDuration, Number(e.target.value)],
              })
            }
            className="w-full accent-[#0ea5e9]"
          />

          <div className="flex items-center justify-between text-[15px] text-[#111827]">
            <span>{formatMinutes(safeFilters.durationRange[0])}</span>
            <span>{formatMinutes(safeFilters.durationRange[1])}</span>
          </div>
        </div>
      </div>

      {legs.map((leg, legIndex) => {
        const legFilter =
  safeFilters.legFilters[legIndex] ?? createDefaultCombinedLegFilter();

        return (
          <div key={leg.id} className="space-y-8">
            <div className="space-y-4">
              {sectionTitle(`Stops From ${leg.fromCity}`)}

              <div className="space-y-4">
                {stopOptions.map((stop) => {
                  const selected = legFilter.stops.includes(stop.id);

                  return (
                    <label
                      key={`${leg.id}-${stop.id}`}
                      className="flex cursor-pointer items-center gap-3"
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          toggleLegMultiSelect(legIndex, "stops", stop.id)
                        }
                        className="hidden"
                      />

                      <span className={checkboxClass(selected)}>✓</span>

                      <span className="text-[15px] text-[#111827]">
                        {stop.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              {sectionTitle(`Departure From ${leg.fromCity}`)}

              <div className="grid grid-cols-4 gap-2">
                {timeOptions.map((time) => {
                  const selected = legFilter.departureTime.includes(time.id);

                  return (
                    <button
                      key={`${leg.id}-departure-${time.id}`}
                      type="button"
                      onClick={() =>
                        toggleLegMultiSelect(legIndex, "departureTime", time.id)
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
              {sectionTitle(`Arrival at ${leg.toCity}`)}

              <div className="grid grid-cols-4 gap-2">
                {timeOptions.map((time) => {
                  const selected = legFilter.arrivalTime.includes(time.id);

                  return (
                    <button
                      key={`${leg.id}-arrival-${time.id}`}
                      type="button"
                      onClick={() =>
                        toggleLegMultiSelect(legIndex, "arrivalTime", time.id)
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
          </div>
        );
      })}

      <div className="space-y-4">
        {sectionTitle("Airline")}

        <div className="space-y-4">
          {airlineOptions.map((item) => {
            const selected = safeFilters.airlines.includes(item.id);

            return (
              <label
                key={item.id}
                className="flex cursor-pointer items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleCommonMultiSelect("airlines", item.id)}
                    className="hidden"
                  />

                  <span className={checkboxClass(selected)}>✓</span>

                  <span className="text-[15px] text-[#111827]">{item.label}</span>
                </div>

                {item.price ? (
                  <span className="text-[15px] text-[#111827]">
                    {item.price}
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {sectionTitle("Layover Airports")}

        <div className="space-y-4">
          {layoverAirportOptions.map((item) => {
            const selected = safeFilters.layoverAirports.includes(item.id);

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
                      toggleCommonMultiSelect("layoverAirports", item.id)
                    }
                    className="hidden"
                  />

                  <span className={checkboxClass(selected)}>✓</span>

                  <span className="text-[15px] text-[#111827]">{item.label}</span>
                </div>

                {item.price ? (
                  <span className="text-[15px] text-[#111827]">
                    {item.price}
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {sectionTitle("Layover Duration")}

        <div className="space-y-4">
          <input
            type="range"
            min={minLayoverDuration}
            max={maxLayoverDuration}
            value={safeFilters.layoverDurationRange[1]}
            onChange={(e) =>
              updateFilters({
                ...safeFilters,
                layoverDurationRange: [
                  minLayoverDuration,
                  Number(e.target.value),
                ],
              })
            }
            className="w-full accent-[#0ea5e9]"
          />

          <div className="flex items-center justify-between text-[15px] text-[#111827]">
  <span>
    {safeFilters.layoverDurationRange[0] > 0
      ? formatMinutes(safeFilters.layoverDurationRange[0])
      : "Min"}
  </span>
  <span>
    {safeFilters.layoverDurationRange[1] > 0
      ? formatMinutes(safeFilters.layoverDurationRange[1])
      : "Max"}
  </span>
</div>
        </div>
      </div>
    </div>
  );
}