"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import MobileInnerBack from "@/app/components/common/mobile/MobileInnerBack";
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
    <div className="min-h-screen overflow-x-hidden bg-slate-100">
      <div className="mx-auto w-full max-w-[1650px] px-3 pb-8 pt-3 sm:px-4 sm:py-4">
        <div className="mb-3 lg:hidden">
          <MobileInnerBack title="Cruise Results" />
        </div>

        <div className="min-w-0">
          <CruiseModifySearchBar
            key={`modify-${paramsKey}`}
            searchMeta={liveSearchMeta}
          />
        </div>

        <div className="mt-3 lg:mt-4">
          <button
            type="button"
            onClick={() => setShowMobileFilters(true)}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-white px-4 text-[14px] font-extrabold text-sky-700 shadow-sm lg:hidden"
          >
            <SlidersHorizontal size={17} />
            Filter cruises
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 lg:mt-4 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-4">
          <div className="hidden min-w-0 lg:block">
            <CruiseFilterSidebar
              sections={filterSections}
              filters={filters}
              onChangeFilters={setFilters}
            />
          </div>

          <div className="min-w-0">
            <div className="space-y-3 lg:space-y-4">
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

      {showMobileFilters ? (
        <div className="fixed inset-0 z-50 h-[100dvh] overflow-hidden lg:hidden">
          <button
            type="button"
            aria-label="Close cruise filters"
            className="absolute inset-0 h-full w-full bg-slate-950/45"
            onClick={() => setShowMobileFilters(false)}
          />

          <div className="absolute inset-x-0 bottom-0 flex h-[88dvh] max-h-[88dvh] min-h-0 flex-col overflow-hidden rounded-t-[28px] border border-slate-200 bg-slate-100 shadow-[0_-18px_40px_rgba(15,23,42,0.22)]">
            <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[16px] font-black text-slate-900">
                    Filter cruises
                  </div>
                  <div className="mt-0.5 text-[12px] font-semibold text-slate-500">
                    Refine itinerary, cruise line and sailing options
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm"
                  aria-label="Close filters"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden px-3 pt-3">
              <CruiseFilterSidebar
                sections={filterSections}
                filters={filters}
                onChangeFilters={setFilters}
              />
            </div>

            <div className="shrink-0 border-t border-slate-200 bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFilters(initialCruiseFilterState)}
                  className="h-11 rounded-2xl border border-slate-300 bg-white text-[14px] font-extrabold text-slate-800 shadow-sm"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="h-11 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 text-[14px] font-extrabold text-white shadow-[0_10px_22px_rgba(14,165,233,0.28)]"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
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
