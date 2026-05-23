"use client";

type FiltersState = {
  popular: string[];
  departureAirports: string[];
  priceRange: [number, number];
  stops: string[];
  departureTime: string[];
  arrivalTime: string[];
  airlines: string[];
  aircraftSize: string[];
};

type AirportOption = {
  id: string;
  label: string;
  price?: string;
};

type Props = {
  filters: FiltersState;
  updateFilter: (key: keyof FiltersState, value: any) => void;
  resetAllFilters: (nextFilters: FiltersState) => void;
  fromCity: string;
  toCity: string;
  minPrice: number;
  maxPrice: number;
  departureAirportOptions: AirportOption[];
};

const popularFilters = [
  { id: "nonstop", label: "Non Stop", price: "₹ 10,310" },
  { id: "nearby", label: "Hide Nearby Airports", price: "₹ 8,743" },
  { id: "refundable", label: "Refundable Fares", price: "₹ 8,743" },
  { id: "indigo", label: "IndiGo", price: "₹ 10,075", color: "#1d4ed8" },
  { id: "airindia", label: "Air India", price: "₹ 9,923", color: "#7f1d1d" },
  { id: "akasa", label: "Akasa Air", price: "₹ 10,310", color: "#f97316" },
  { id: "spicejet", label: "SpiceJet", price: "₹ 8,743", color: "#dc2626" },
  { id: "morning", label: "Morning Departures", price: "₹ 9,447" },
  { id: "afternoon", label: "Afternoon Departures", price: "₹ 10,639" },
  { id: "early", label: "Early Morning Departures", price: "₹ 8,724" },
];

const stopOptions = [
  { id: "nonstop", label: "Non Stop", price: "₹ 10,310" },
  { id: "1stop", label: "1 Stop", price: "₹ 8,743" },
  { id: "2stop", label: "2+ Stop", price: "₹ 8,743" },
];

const timeOptions = [
  { id: "before6", label: "Before 6 AM", icon: "◔" },
  { id: "6to12", label: "6 AM to 12 PM", icon: "☼" },
  { id: "12to18", label: "12 PM to 6 PM", icon: "◡" },
  { id: "after18", label: "After 6 PM", icon: "☾" },
];

const airlineOptions = [
  { id: "airindia", label: "Air India", price: "₹ 9,923", color: "#7f1d1d" },
  {
    id: "aiexpress",
    label: "Air India Express",
    price: "₹ 8,858",
    color: "#b91c1c",
  },
  { id: "akasa", label: "Akasa Air", price: "₹ 10,310", color: "#f97316" },
  { id: "indigo", label: "IndiGo", price: "₹ 10,075", color: "#1d4ed8" },
  { id: "spicejet", label: "SpiceJet", price: "₹ 8,743", color: "#dc2626" },
];

const aircraftOptions = [
  { id: "smallmid", label: "Small / Mid-size aircraft", price: "₹ 8,743" },
];

function ensureArray(value: any) {
  return Array.isArray(value) ? value : [];
}

function ensurePriceRange(
  value: any,
  minPrice: number,
  maxPrice: number
): [number, number] {
  if (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number" &&
    !(value[0] === 0 && value[1] === 0)
  ) {
    return value as [number, number];
  }

  return [minPrice, maxPrice];
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

export default function MultiCityDomesticFilters({
  filters,
  updateFilter,
  resetAllFilters,
  fromCity,
  toCity,
  minPrice,
  maxPrice,
  departureAirportOptions,
}: Props) {
  const dynamicDefaultPriceRange: [number, number] = [minPrice, maxPrice];

  const safeFilters = filters ?? {
    popular: [],
    departureAirports: [],
    priceRange: dynamicDefaultPriceRange,
    stops: [],
    departureTime: [],
    arrivalTime: [],
    airlines: [],
    aircraftSize: [],
  };

  const selectedPopular = ensureArray(safeFilters.popular);
  const selectedDepartureAirports = ensureArray(safeFilters.departureAirports);
  const selectedStops = ensureArray(safeFilters.stops);
  const selectedDepartureTime = ensureArray(safeFilters.departureTime);
  const selectedArrivalTime = ensureArray(safeFilters.arrivalTime);
  const selectedAirlines = ensureArray(safeFilters.airlines);
  const selectedAircraft = ensureArray(safeFilters.aircraftSize);
  const priceRange = ensurePriceRange(
    safeFilters.priceRange,
    minPrice,
    maxPrice
  );

  const visiblePopular = selectedPopular.includes("__show_all_popular__")
    ? popularFilters
    : popularFilters.slice(0, 4);

  const showAllPopular = selectedPopular.includes("__show_all_popular__");

  const toggleMultiSelect = (
    key: keyof FiltersState,
    value: string,
    currentValues: string[]
  ) => {
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

    updateFilter(key, nextValues);
  };

  const togglePopular = (value: string) => {
    if (value === "__show_all_popular__") {
      const next = showAllPopular
        ? selectedPopular.filter((item) => item !== "__show_all_popular__")
        : [
            ...selectedPopular.filter((item) => item !== "__show_all_popular__"),
            "__show_all_popular__",
          ];

      updateFilter("popular", next);
      return;
    }

    toggleMultiSelect("popular", value, selectedPopular);
  };

  const removeChip = (type: keyof FiltersState, value: string) => {
    if (type === "priceRange") {
      updateFilter("priceRange", dynamicDefaultPriceRange);
      return;
    }

    const currentValues = ensureArray(filters?.[type]);

    updateFilter(
      type,
      currentValues.filter((item) => item !== value)
    );
  };

  const appliedChips: { key: keyof FiltersState; value: string; label: string }[] = [
    ...selectedPopular
      .filter((item) => item !== "__show_all_popular__")
      .map((item) => ({
        key: "popular" as const,
        value: item,
        label:
          popularFilters.find((filter) => filter.id === item)?.label || item,
      })),

    ...selectedDepartureAirports.map((item) => ({
      key: "departureAirports" as const,
      value: item,
      label:
        departureAirportOptions.find((airport) => airport.id === item)?.label ||
        item,
    })),

    ...selectedStops.map((item) => ({
      key: "stops" as const,
      value: item,
      label: stopOptions.find((stop) => stop.id === item)?.label || item,
    })),

    ...selectedDepartureTime.map((item) => ({
      key: "departureTime" as const,
      value: item,
      label: timeOptions.find((time) => time.id === item)?.label || item,
    })),

    ...selectedArrivalTime.map((item) => ({
      key: "arrivalTime" as const,
      value: item,
      label: timeOptions.find((time) => time.id === item)?.label || item,
    })),

    ...selectedAirlines.map((item) => ({
      key: "airlines" as const,
      value: item,
      label:
        airlineOptions.find((airline) => airline.id === item)?.label || item,
    })),

    ...selectedAircraft.map((item) => ({
      key: "aircraftSize" as const,
      value: item,
      label:
        aircraftOptions.find((aircraft) => aircraft.id === item)?.label || item,
    })),
  ];

  const isPriceCustom =
    priceRange[0] !== dynamicDefaultPriceRange[0] ||
    priceRange[1] !== dynamicDefaultPriceRange[1];

  if (isPriceCustom) {
    appliedChips.push({
      key: "priceRange",
      value: "priceRange",
      label: `₹ ${priceRange[0].toLocaleString(
        "en-IN"
      )} - ₹ ${priceRange[1].toLocaleString("en-IN")}`,
    });
  }

  const clearAll = () => {
    resetAllFilters({
      popular: [],
      departureAirports: [],
      priceRange: dynamicDefaultPriceRange,
      stops: [],
      departureTime: [],
      arrivalTime: [],
      airlines: [],
      aircraftSize: [],
    });
  };

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
        {sectionTitle("Popular Filters")}

        <div className="space-y-4">
          {visiblePopular.map((item) => {
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
                    onChange={() => togglePopular(item.id)}
                    className="hidden"
                  />

                  <span className={checkboxClass(selected)}>✓</span>

                  <div className="flex items-center gap-2 text-[15px] text-[#111827]">
                    {item.color ? (
                      <span
                        className="h-3 w-3 rounded-sm"
                        style={{ backgroundColor: item.color }}
                      />
                    ) : null}
                    <span>{item.label}</span>
                  </div>
                </div>

                <span className="text-[15px] text-[#111827]">{item.price}</span>
              </label>
            );
          })}

          {popularFilters.length > 4 && (
            <button
              type="button"
              onClick={() => togglePopular("__show_all_popular__")}
              className="text-[15px] font-medium text-[#2563eb]"
            >
              {showAllPopular ? "less" : `+${popularFilters.length - 4} more`}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {sectionTitle(`Departure Airports (${fromCity})`)}

        <div className="space-y-4">
          {departureAirportOptions.map((airport) => {
            const selected = selectedDepartureAirports.includes(airport.id);

            return (
              <label
                key={airport.id}
                className="flex cursor-pointer items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      toggleMultiSelect(
                        "departureAirports",
                        airport.id,
                        selectedDepartureAirports
                      )
                    }
                    className="hidden"
                  />

                  <span className={`${checkboxClass(selected)} mt-0.5`}>✓</span>

                  <span className="max-w-[180px] text-[15px] leading-6 text-[#111827]">
                    {airport.label}
                  </span>
                </div>

                <span className="text-[15px] text-[#111827]">
                  {airport.price || ""}
                </span>
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
            <span>₹ {priceRange[0].toLocaleString("en-IN")}</span>
            <span>₹ {priceRange[1].toLocaleString("en-IN")}</span>
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

                <span className="text-[15px] text-[#111827]">{stop.price}</span>
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
        {sectionTitle("Airlines")}

        <div className="space-y-4">
          {airlineOptions.map((airline) => {
            const selected = selectedAirlines.includes(airline.id);

            return (
              <label
                key={airline.id}
                className="flex cursor-pointer items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      toggleMultiSelect("airlines", airline.id, selectedAirlines)
                    }
                    className="hidden"
                  />

                  <span className={checkboxClass(selected)}>✓</span>

                  <div className="flex items-center gap-3 text-[15px] text-[#111827]">
                    <span
                      className="h-4 w-4 rounded-sm"
                      style={{ backgroundColor: airline.color }}
                    />
                    <span>{airline.label}</span>
                  </div>
                </div>

                <span className="text-[15px] text-[#111827]">{airline.price}</span>
              </label>
            );
          })}
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
                      toggleMultiSelect(
                        "aircraftSize",
                        aircraft.id,
                        selectedAircraft
                      )
                    }
                    className="hidden"
                  />

                  <span className={checkboxClass(selected)}>✓</span>

                  <span className="text-[15px] text-[#111827]">
                    {aircraft.label}
                  </span>
                </div>

                <span className="text-[15px] text-[#111827]">
                  {aircraft.price}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}