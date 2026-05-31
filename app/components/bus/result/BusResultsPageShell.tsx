"use client";

import { useMemo, useState } from "react";
import type { BusResultItem } from "@/app/lib/bus/busTypes";
import type { BusFilters } from "@/app/lib/bus/busFilterTypes";
import { DEFAULT_BUS_FILTERS } from "@/app/lib/bus/busFilterTypes";
import { applyBusFilters } from "@/app/lib/bus/busFilterHelpers";

import BusResultRouteSummary from "./BusResultRouteSummary";
import SmartResultsOfferStrip from "@/app/components/smartOffers/SmartResultsOfferStrip";
import BusDateFareStripSection from "./BusDateFareStripSection";
import BusSortBar from "./BusSortBar";
import BusFiltersSidebar from "./BusFiltersSidebar";
import BusResultsSection from "./BusResultsSection";
import BusActiveFilterChips from "./BusActiveFilterChips";

type Props = {
  fromCity: string;
  fromPoint: string;
  toCity: string;
  toPoint: string;
  date: string;
  sort: "relevance" | "rating" | "price" | "fastest" | "departure" | "arrival";
  results: BusResultItem[];
};

const INDIAN_BUS_CITIES = [
  "delhi",
  "new delhi",
  "jaipur",
  "mumbai",
  "bangalore",
  "bengaluru",
  "hyderabad",
  "chennai",
  "kolkata",
  "pune",
  "ahmedabad",
  "udaipur",
  "jodhpur",
  "kota",
  "ajmer",
  "goa",
  "surat",
  "vadodara",
  "indore",
  "bhopal",
  "lucknow",
  "kanpur",
  "agra",
  "varanasi",
  "dehradun",
  "haridwar",
  "rishikesh",
  "chandigarh",
  "amritsar",
  "gurugram",
  "gurgaon",
  "noida",
];

function normalizeCity(value: string) {
  return String(value || "").trim().toLowerCase();
}

function isIndianBusCity(value: string) {
  const city = normalizeCity(value);

  if (!city) return true;

  return INDIAN_BUS_CITIES.some(
    (item) => city === item || city.includes(item) || item.includes(city)
  );
}

function resolveBusBaseFare(item: any) {
  return Number(
    item?.baseFare ||
      item?.fare ||
      item?.price ||
      item?.lowestFare ||
      item?.finalFare ||
      0
  );
}

export default function BusResultsPageShell({
  fromCity,
  fromPoint,
  toCity,
  toPoint,
  date,
  sort,
  results,
}: Props) {
  const [filters, setFilters] = useState<BusFilters>(DEFAULT_BUS_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [focusedBusId, setFocusedBusId] = useState<string | null>(null);

  const filteredResults = useMemo(() => {
    return applyBusFilters(results, filters);
  }, [results, filters]);

  const offerBookingValue = useMemo(() => {
    const prices = filteredResults
      .map((item) => resolveBusBaseFare(item))
      .filter((price) => price > 0);

    return prices.length > 0 ? Math.min(...prices) : 1500;
  }, [filteredResults]);

  const isInternational = useMemo(() => {
    return !isIndianBusCity(fromCity) || !isIndianBusCity(toCity);
  }, [fromCity, toCity]);

  function handleRemoveChip(category: keyof BusFilters, value: string) {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].filter((item) => item !== value),
    }));
  }

  function handleClearAll() {
    setFilters(DEFAULT_BUS_FILTERS);
  }

  return (
    <div className="flex min-w-0 items-start gap-4">
      <div className="hidden lg:block">
        <BusFiltersSidebar
          results={results}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[280] bg-black/45 lg:hidden">
          <div className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-hidden rounded-t-[28px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-sky-600">
                  Bus Filters
                </p>
                <h2 className="text-lg font-black text-slate-900">
                  Refine results
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-xl font-bold text-slate-600"
                aria-label="Close filters"
              >
                ×
              </button>
            </div>

            <div className="max-h-[calc(86vh-66px)] overflow-y-auto px-3 py-3">
              <BusFiltersSidebar
                results={results}
                filters={filters}
                onFiltersChange={setFilters}
                className="w-full border-0 p-0 shadow-none"
              />
            </div>
          </div>
        </div>
      )}

      <section className="min-w-0 flex-1 space-y-4">
        <BusResultRouteSummary
          fromCity={fromCity}
          toCity={toCity}
          date={date}
          resultsCount={filteredResults.length}
        />

        <SmartResultsOfferStrip
          service="bus"
          destination={toCity || toPoint || "Bus"}
          bookingValue={offerBookingValue}
          isInternational={isInternational}
        />

        <BusDateFareStripSection
          fromCity={fromCity}
          toCity={toCity}
          selectedDate={date}
          visibleResults={filteredResults}
          focusedBusId={focusedBusId}
          onFocusBus={setFocusedBusId}
        />

        <div className="grid min-w-0 grid-cols-1 gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-left text-sm font-black text-slate-900 shadow-sm"
          >
            Filter Buses
          </button>
        </div>

        <BusSortBar
          fromCity={fromCity}
          fromPoint={fromPoint}
          toCity={toCity}
          toPoint={toPoint}
          date={date}
          activeSort={sort}
          resultsCount={filteredResults.length}
        />

        <BusActiveFilterChips
          filters={filters}
          onRemoveChip={handleRemoveChip}
          onClearAll={handleClearAll}
        />

        {filteredResults.length > 0 ? (
          <BusResultsSection results={filteredResults} focusedBusId={focusedBusId} />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800">
              No buses found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Try changing filters, city, or date.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
