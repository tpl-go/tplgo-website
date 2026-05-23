"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();

  const fromCity = searchParams.get("fromCity") || "Ujjain";
  const fromCode = searchParams.get("fromCode") || "UJN";
  const toCity = searchParams.get("toCity") || "Jaipur";
  const toCode = searchParams.get("toCode") || "JP";
  const date = searchParams.get("date") || "2026-05-07";
  const travelClass = searchParams.get("class") || "ALL";
  const sort = (searchParams.get("sort") as TrainSortOption) || "relevance";

  const [expandedTrainId, setExpandedTrainId] = useState<string | null>(null);
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
    <main className="min-h-screen bg-[#f5f7fb] text-black">
      <div className=" border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-[1400px]">
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

      <div className="mx-auto max-w-[1400px] px-4 py-4">
        <div className="flex items-start gap-5">
          <div className="w-[320px] shrink-0">
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

          <div className="min-w-0 flex-1 space-y-4">
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

            <TrainDateStripSection selectedDate={date} />

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

export default function TrainResultsPage() {
  return (
    <Suspense fallback={<div />}>
      <TrainResultsPageContent />
    </Suspense>
  );
}