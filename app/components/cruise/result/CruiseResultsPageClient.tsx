"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import CruiseModifySearchBar from "./CruiseModifySearchBar";
import CruiseFilterSidebar from "./CruiseFilterSidebar";
import CruiseResultHeader from "./CruiseResultHeader";
import CruiseResultsList from "./CruiseResultsList";
import SmartResultsOfferStrip from "@/app/components/smartOffers/SmartResultsOfferStrip";

import {
  CruiseResultSearchMeta,
  CruiseSortKey,
} from "@/app/lib/cruise/cruiseResultTypes";
import { buildCruiseResultsFromSearch } from "@/app/lib/cruise/buildCruiseResultsFromSearch";
import {
  buildCruiseFilterSections,
  sortCruiseResults,
} from "@/app/lib/cruise/cruiseResultHelpers";
import {
  filterCruiseResults,
  initialCruiseFilterState,
} from "@/app/lib/cruise/filterCruiseResults";

type Props = {
  searchMeta: CruiseResultSearchMeta;
};

function buildMetaFromUrl(params: URLSearchParams): CruiseResultSearchMeta {
  const toNumber = (value: string | null, fallback: number) => {
    const parsed = value ? Number(value) : NaN;
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  return {
    destinationId: params.get("destination"),
    departurePortId: params.get("port"),
    sailingDate: params.get("date"),
    sailingMonth: params.get("month"),
    durationId: params.get("duration"),
    adults: toNumber(params.get("adults"), 2),
    children: toNumber(params.get("children"), 0),
    infants: toNumber(params.get("infants"), 0),
  };
}

function CruiseResultsPageClientContent({ searchMeta }: Props) {  

  const searchParams = useSearchParams();

  const paramsKey = searchParams.toString();

  const liveSearchMeta = useMemo(() => {
    if (!paramsKey) return searchMeta;
    return buildMetaFromUrl(searchParams);
  }, [paramsKey, searchMeta, searchParams]);

  const [filters, setFilters] = useState(initialCruiseFilterState);
  const [sortKey, setSortKey] = useState<CruiseSortKey>("price");

  useEffect(() => {
    setFilters(initialCruiseFilterState);
    setSortKey("price");
  }, [paramsKey]);

  const baseResults = useMemo(() => {
    return buildCruiseResultsFromSearch(liveSearchMeta);
  }, [liveSearchMeta, paramsKey]);

  const filterSections = useMemo(() => {
    return buildCruiseFilterSections(baseResults);
  }, [baseResults, paramsKey]);

  const filteredResults = useMemo(() => {
    return filterCruiseResults(baseResults, filters);
  }, [baseResults, filters, paramsKey]);

  const sortedResults = useMemo(() => {
    return sortCruiseResults(filteredResults, sortKey);
  }, [filteredResults, sortKey, paramsKey]);

  const offerBookingValue = useMemo(() => {
    const firstResult = sortedResults?.[0] as any;

    return (
      Number(firstResult?.price || 0) ||
      Number(firstResult?.startingPrice || 0) ||
      Number(firstResult?.fare || 0) ||
      50000
    );
  }, [sortedResults]);

  /* ===== INTERNATIONAL DETECTION ===== */

  const isInternational = useMemo(() => {
    const destination = String(
      liveSearchMeta.destinationId || ""
    ).toLowerCase();

    const port = String(
      liveSearchMeta.departurePortId || ""
    ).toLowerCase();

    const indianCruiseKeywords = [
      "mumbai",
      "goa",
      "kochi",
      "chennai",
      "andaman",
      "lakshadweep",
      "india",
    ];

    const isIndianDestination = indianCruiseKeywords.some(
      (item) =>
        destination.includes(item) ||
        port.includes(item)
    );

    return !isIndianDestination;
  }, [liveSearchMeta]);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full max-w-[1650px] px-4 py-4">
        <CruiseModifySearchBar
          key={`modify-${paramsKey}`}
          searchMeta={liveSearchMeta}
        />

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
          <div className="min-w-0">
            <CruiseFilterSidebar
              sections={filterSections}
              filters={filters}
              onChangeFilters={setFilters}
            />
          </div>

          <div className="min-w-0">
            <div className="space-y-4">
              <CruiseResultHeader
                sortKey={sortKey}
                onSortChange={setSortKey}
                itinerariesCount={sortedResults.length}
                sailingsCount={sortedResults.reduce(
                  (sum, item) => sum + item.sailingDates.length,
                  0
                )}
                filters={filters}
                sections={filterSections}
                onChangeFilters={setFilters}
              />

              <SmartResultsOfferStrip
                service="cruise"
                destination={
                  liveSearchMeta.destinationId ||
                  liveSearchMeta.departurePortId ||
                  "Cruise"
                }
                bookingValue={offerBookingValue}
                isInternational={isInternational}
              />

              <CruiseResultsList
                key={`results-${paramsKey}`}
                results={sortedResults}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CruiseResultsPageClient({ searchMeta }: Props) {
  return (
    <Suspense fallback={<div />}>
      <CruiseResultsPageClientContent searchMeta={searchMeta} />
    </Suspense>
  );
}