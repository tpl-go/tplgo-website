"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import TrainResultTopSearchBar from "@/app/components/train/result/TrainResultTopSearchBar";
import TrainResultRouteSummary from "@/app/components/train/result/TrainResultRouteSummary";
import SmartResultsOfferStrip from "@/app/components/smartOffers/SmartResultsOfferStrip";
import TrainDateStripSection from "@/app/components/train/result/TrainDateStripSection";
import TrainSortBar from "@/app/components/train/result/TrainSortBar";
import TrainSelectedFilterChips from "@/app/components/train/result/TrainSelectedFilterChips";
import TrainResultsFilters from "@/app/components/train/result/TrainResultsFilters";
import TrainResultCard from "@/app/components/train/result/TrainResultCard";

import {
  INITIAL_TRAIN_FILTERS,
  filterTrainResults,
} from "@/app/lib/train/trainFilters";
import {
  generateTrainResults,
  sortTrainResults,
} from "@/app/lib/train/trainResultHelpers";

import type {
  TrainFilterChip,
  TrainFilterState,
  TrainResultItem,
  TrainSortOption,
} from "@/app/lib/train/trainResultTypes";

const INDIAN_TRAIN_CITIES = [
  "ujjain",
  "jaipur",
  "delhi",
  "new delhi",
  "mumbai",
  "pune",
  "ahmedabad",
  "surat",
  "vadodara",
  "indore",
  "bhopal",
  "lucknow",
  "kanpur",
  "agra",
  "varanasi",
  "prayagraj",
  "patna",
  "kolkata",
  "howrah",
  "chennai",
  "bengaluru",
  "bangalore",
  "hyderabad",
  "kochi",
  "trivandrum",
  "guwahati",
  "jodhpur",
  "udaipur",
  "ajmer",
  "kota",
];

const INDIAN_TRAIN_CODES = [
  "ujn",
  "jp",
  "ndls",
  "dli",
  "bct",
  "mmct",
  "csmt",
  "pune",
  "adi",
  "st",
  "bpl",
  "indb",
  "lko",
  "cnb",
  "agra",
  "bsb",
  "pnbe",
  "hwh",
  "sdaH".toLowerCase(),
  "mas",
  "sbc",
  "ypr",
  "hyb",
  "sc",
  "ers",
  "tvc",
  "ghy",
  "ju",
  "udz",
  "aii",
  "kota",
];

function normalizeValue(value: string) {
  return String(value || "").trim().toLowerCase();
}

function isIndianTrainLocation(city: string, code: string) {
  const normalizedCity = normalizeValue(city);
  const normalizedCode = normalizeValue(code);

  if (!normalizedCity && !normalizedCode) return true;

  const cityMatched = INDIAN_TRAIN_CITIES.some(
    (item) =>
      normalizedCity === item ||
      normalizedCity.includes(item) ||
      item.includes(normalizedCity)
  );

  const codeMatched = INDIAN_TRAIN_CODES.includes(normalizedCode);

  return cityMatched || codeMatched;
}

function toggleStringValue(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function TrainResultsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const fromCity = searchParams.get("fromCity") || "Ujjain";
  const fromCode = searchParams.get("fromCode") || "UJN";
  const toCity = searchParams.get("toCity") || "Jaipur";
  const toCode = searchParams.get("toCode") || "JP";
  const date = searchParams.get("date") || "2026-05-07";
  const travelClass = searchParams.get("class") || "ALL";
  const sort = (searchParams.get("sort") as TrainSortOption) || "relevance";

  const [expandedTrainId, setExpandedTrainId] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] =
    useState<TrainFilterState>(INITIAL_TRAIN_FILTERS);

  const sourceTrains = useMemo<TrainResultItem[]>(() => {
    return generateTrainResults({
      fromCity,
      fromCode,
      toCity,
      toCode,
      date,
      travelClass,
    });
  }, [fromCity, fromCode, toCity, toCode, date, travelClass]);

  const filteredTrains = useMemo(() => {
    return filterTrainResults(sourceTrains, filters);
  }, [sourceTrains, filters]);

  const sortedTrains = useMemo(() => {
    return sortTrainResults(filteredTrains, sort);
  }, [filteredTrains, sort]);

  const offerBookingValue = useMemo(() => {
    const prices = sortedTrains
      .flatMap((train: any) =>
        Array.isArray(train.classes)
          ? train.classes.map((cls: any) =>
              Number(
                cls?.fare ||
                  cls?.price ||
                  cls?.baseFare ||
                  cls?.finalFare ||
                  cls?.amount ||
                  0
              )
            )
          : [
              Number(
                train?.fare ||
                  train?.price ||
                  train?.baseFare ||
                  train?.lowestFare ||
                  train?.finalFare ||
                  0
              ),
            ]
      )
      .filter((price) => price > 0);

    return prices.length > 0 ? Math.min(...prices) : 1200;
  }, [sortedTrains]);

  const dateFareMap = useMemo(() => {
    const fares: Record<string, number> = {};

    sourceTrains.forEach((train) => {
      train.classes.forEach((trainClass) => {
        trainClass.dateWiseAvailability.general.forEach((row) => {
          if (!row.date || !row.price) return;
          fares[row.date] = fares[row.date]
            ? Math.min(fares[row.date], row.price)
            : row.price;
        });
      });
    });

    return fares;
  }, [sourceTrains]);

  const isInternational = useMemo(() => {
    const fromIndian = isIndianTrainLocation(fromCity, fromCode);
    const toIndian = isIndianTrainLocation(toCity, toCode);

    return !fromIndian || !toIndian;
  }, [fromCity, fromCode, toCity, toCode]);

  const chips = useMemo<TrainFilterChip[]>(() => {
    const next: TrainFilterChip[] = [];

    filters.quick.forEach((value) => {
      const labelMap: Record<string, string> = {
        ac: "AC",
        available: "Available",
        departureAfter6pm: "Departure after 6 PM",
        arrivalBefore12pm: "Arrival before 12 PM",
      };

      next.push({
        type: "quick",
        value,
        label: labelMap[value] || value,
      });
    });

    filters.ticketTypes.forEach((value) => {
      const labelMap: Record<string, string> = {
        freeCancellation: "Free Cancellation",
        alternateTrip: "Alternate Trip Plan",
      };

      next.push({
        type: "ticketType",
        value,
        label: labelMap[value] || value,
      });
    });

    filters.quota.forEach((value) => {
      const labelMap: Record<string, string> = {
        general: "General Quota",
        ladies: "Ladies Quota",
      };

      next.push({
        type: "quota",
        value,
        label: labelMap[value] || value,
      });
    });

    filters.classes.forEach((value) => {
      const labelMap: Record<string, string> = {
        "1A": "1st Class AC - 1A",
        "2A": "2nd Class AC - 2A",
        "3A": "3rd Class AC - 3A",
        "3E": "AC 3 Economy - 3E",
        SL: "Sleeper - SL",
        CC: "Chair Car - CC",
        "2S": "Second Seating - 2S",
        EC: "Executive Chair Car - EC",
      };

      next.push({
        type: "class",
        value,
        label: labelMap[value] || value,
      });
    });

    filters.arrivalTime.forEach((value) => {
      const labelMap: Record<string, string> = {
        "12am-6am": "Arrival 12 AM - 6 AM",
        "6am-12pm": "Arrival 6 AM - 12 PM",
        "12pm-6pm": "Arrival 12 PM - 6 PM",
        "6pm-12am": "Arrival 6 PM - 12 AM",
      };

      next.push({
        type: "arrivalTime",
        value,
        label: labelMap[value] || value,
      });
    });

    filters.departureTime.forEach((value) => {
      const labelMap: Record<string, string> = {
        "12am-6am": "Departure 12 AM - 6 AM",
        "6am-12pm": "Departure 6 AM - 12 PM",
        "12pm-6pm": "Departure 12 PM - 6 PM",
        "6pm-12am": "Departure 6 PM - 12 AM",
      };

      next.push({
        type: "departureTime",
        value,
        label: labelMap[value] || value,
      });
    });

    filters.trainTypes.forEach((value) => {
      next.push({
        type: "trainType",
        value,
        label: `Train Type: ${value}`,
      });
    });

    filters.fromStations.forEach((value) => {
      next.push({
        type: "fromStation",
        value,
        label: value,
      });
    });

    filters.toStations.forEach((value) => {
      next.push({
        type: "toStation",
        value,
        label: value,
      });
    });

    return next;
  }, [filters]);

  function handleToggleQuick(value: string) {
    setFilters((prev) => ({
      ...prev,
      quick: toggleStringValue(prev.quick, value),
    }));
  }

  function handleToggleTicketType(value: string) {
    setFilters((prev) => ({
      ...prev,
      ticketTypes: toggleStringValue(prev.ticketTypes, value),
    }));
  }

  function handleToggleQuota(value: string) {
    setFilters((prev) => ({
      ...prev,
      quota: toggleStringValue(prev.quota, value),
    }));
  }

  function handleToggleClass(value: string) {
    setFilters((prev) => ({
      ...prev,
      classes: toggleStringValue(prev.classes, value),
    }));
  }

  function handleToggleArrivalTime(value: string) {
    setFilters((prev) => ({
      ...prev,
      arrivalTime: toggleStringValue(prev.arrivalTime, value),
    }));
  }

  function handleToggleDepartureTime(value: string) {
    setFilters((prev) => ({
      ...prev,
      departureTime: toggleStringValue(prev.departureTime, value),
    }));
  }

  function handleToggleTrainType(value: string) {
    setFilters((prev) => ({
      ...prev,
      trainTypes: toggleStringValue(prev.trainTypes, value),
    }));
  }

  function handleToggleFromStation(value: string) {
    setFilters((prev) => ({
      ...prev,
      fromStations: toggleStringValue(prev.fromStations, value),
    }));
  }

  function handleToggleToStation(value: string) {
    setFilters((prev) => ({
      ...prev,
      toStations: toggleStringValue(prev.toStations, value),
    }));
  }

  function handleClearAll() {
    setFilters(INITIAL_TRAIN_FILTERS);
  }

  function handleRemoveChip(chip: TrainFilterChip) {
    switch (chip.type) {
      case "quick":
        return handleToggleQuick(chip.value);

      case "ticketType":
        return handleToggleTicketType(chip.value);

      case "quota":
        return handleToggleQuota(chip.value);

      case "class":
        return handleToggleClass(chip.value);

      case "arrivalTime":
        return handleToggleArrivalTime(chip.value);

      case "departureTime":
        return handleToggleDepartureTime(chip.value);

      case "trainType":
        return handleToggleTrainType(chip.value);

      case "fromStation":
        return handleToggleFromStation(chip.value);

      case "toStation":
        return handleToggleToStation(chip.value);

      default:
        return;
    }
  }

  return (
    <main className="min-w-0 overflow-x-hidden bg-[#f5f7fb] text-black md:min-h-screen">
      <div className="border-b border-slate-200 bg-white px-3 py-3 md:px-4">
        <div className="mx-auto max-w-[1400px] space-y-3">
          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-bold text-slate-700 shadow-sm"
              aria-label="Go back"
            >
              ‹
            </button>

            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-black text-slate-900">
                {fromCity || "From"} → {toCity || "To"}
              </div>
              <div className="mt-0.5 text-[12px] font-semibold text-slate-500">
                {formatMobileDate(date)}
              </div>
            </div>

            <div className="rounded-full bg-sky-50 px-3 py-2 text-[12px] font-black text-sky-700">
              Modify
            </div>
          </div>

          <TrainResultTopSearchBar
            initialSearch={{
              fromCity,
              fromCode,
              toCity,
              toCode,
              date,
              class: travelClass,
            }}
          />
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-3 py-3 md:px-4 md:py-4">
        <div className="flex min-w-0 items-start gap-5">
          <div className="hidden w-[320px] shrink-0 lg:block">
            <TrainResultsFilters
              fromCity={fromCity}
              toCity={toCity}
              trains={sourceTrains}
              filters={filters}
              chips={chips}
              onToggleQuick={handleToggleQuick}
              onToggleTicketType={handleToggleTicketType}
              onToggleQuota={handleToggleQuota}
              onToggleClass={handleToggleClass}
              onToggleArrivalTime={handleToggleArrivalTime}
              onToggleDepartureTime={handleToggleDepartureTime}
              onToggleTrainType={handleToggleTrainType}
              onToggleFromStation={handleToggleFromStation}
              onToggleToStation={handleToggleToStation}
              onClearAll={handleClearAll}
            />
          </div>

          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-[280] bg-black/45 lg:hidden">
              <div className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-hidden rounded-t-[28px] bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-sky-600">
                      Train Filters
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
                  <TrainResultsFilters
                    fromCity={fromCity}
                    toCity={toCity}
                    trains={sourceTrains}
                    filters={filters}
                    chips={chips}
                    onToggleQuick={handleToggleQuick}
                    onToggleTicketType={handleToggleTicketType}
                    onToggleQuota={handleToggleQuota}
                    onToggleClass={handleToggleClass}
                    onToggleArrivalTime={handleToggleArrivalTime}
                    onToggleDepartureTime={handleToggleDepartureTime}
                    onToggleTrainType={handleToggleTrainType}
                    onToggleFromStation={handleToggleFromStation}
                    onToggleToStation={handleToggleToStation}
                    onClearAll={handleClearAll}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-3 md:space-y-4">
            <TrainResultRouteSummary
              fromCity={fromCity}
              toCity={toCity}
              date={date}
              resultsCount={sortedTrains.length}
            />

            <SmartResultsOfferStrip
              service="train"
              destination={toCity}
              bookingValue={offerBookingValue}
              isInternational={isInternational}
            />

            <TrainDateStripSection
              selectedDate={date}
              dateFares={dateFareMap}
            />

            <div className="grid min-w-0 grid-cols-1 gap-3 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-left text-sm font-black text-slate-900 shadow-sm"
              >
                Filter Trains
                {chips.length > 0 ? (
                  <span className="ml-2 rounded-full bg-sky-100 px-2 py-1 text-[11px] text-sky-700">
                    {chips.length}
                  </span>
                ) : null}
              </button>
            </div>

            <TrainSortBar
              fromCity={fromCity}
              fromCode={fromCode}
              toCity={toCity}
              toCode={toCode}
              date={date}
              travelClass={travelClass}
              activeSort={sort}
              resultsCount={sortedTrains.length}
            />

            {chips.length > 0 && (
              <TrainSelectedFilterChips
                chips={chips}
                onRemoveChip={handleRemoveChip}
                onClearAll={handleClearAll}
              />
            )}

            {sortedTrains.length === 0 ? (
              <div className="rounded-[22px] border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
                <div className="text-[22px] font-extrabold text-slate-900">
                  No trains found
                </div>
                <div className="mt-2 text-[14px] text-slate-500">
                  Try removing some filters or search again.
                </div>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-[14px] font-bold text-white"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedTrains.map((train) => (
                  <TrainResultCard
                    key={train.id}
                    train={train}
                    expandedTrainId={expandedTrainId}
                    onExpandTrain={setExpandedTrainId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function formatMobileDate(date: string) {
  if (!date) return "Date not selected";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export default function TrainResultsPage() {
  return (
    <Suspense fallback={<div />}>
      <TrainResultsPageContent />
    </Suspense>
  );
}
