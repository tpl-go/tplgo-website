"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import IndiaBanner from "@/app/components/india/IndiaBanner";
import IndiaTabs from "@/app/components/india/IndiaTabs";
import IndiaFilters from "@/app/components/india/IndiaFilters";
import IndiaPackagesGrid from "@/app/components/india/IndiaPackagesGrid";
import MobileInnerBack from "@/app/components/common/mobile/MobileInnerBack";

function normalizeText(value?: string) {
  return decodeURIComponent(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, " ");
}

const INDIA_STATES = [
  "Rajasthan",
  "Goa",
  "Kashmir",
  "Kerala",
  "Himachal Pradesh",
  "Uttarakhand",
  "Ladakh",
  "Sikkim",
  "Meghalaya",
  "Andaman",
];

function PopularIndiaPageContent() {
  const searchParams = useSearchParams();

  const [activeState, setActiveState] = useState<string>("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [resetFilters, setResetFilters] = useState(false);
  const [isManualStateSelection, setIsManualStateSelection] = useState(false);

  const searchMode = searchParams.get("searchMode") || "";
  const destinationKind = searchParams.get("destinationKind") || "";
  const toCity = searchParams.get("toCity") || "";
  const matchedState = searchParams.get("matchedState") || "";
  const matchedCity = searchParams.get("matchedCity") || "";

  const autoDetectedState = useMemo(() => {
    const candidates = [matchedState, matchedCity, toCity].filter(Boolean);

    for (const candidate of candidates) {
      const found = INDIA_STATES.find(
        (state) => normalizeText(state) === normalizeText(candidate)
      );

      if (found) return found;
    }

    return "";
  }, [matchedState, matchedCity, toCity]);

  useEffect(() => {
    if (!autoDetectedState || isManualStateSelection) return;
    setActiveState(autoDetectedState);
  }, [autoDetectedState, isManualStateSelection]);

  const handleStateChange = (state: string) => {
    setIsManualStateSelection(true);
    setActiveState(state);
  };

  const handleClearAll = () => {
    setSelectedFilters([]);
    setActiveState("");
    setIsManualStateSelection(false);
    setResetFilters((prev) => !prev);
  };

  return (
    <main className="relative overflow-x-hidden">
      <div className="absolute left-3 top-3 z-30 lg:hidden">
        <MobileInnerBack title="Back" />
      </div>

      <IndiaBanner slug="india" />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 -mt-6 lg:-mt-10 relative z-20">
        <div className="bg-white/95 backdrop-blur border rounded-2xl shadow-sm px-3 pt-3 pb-4 lg:px-4 lg:pt-4 lg:pb-6">
          <IndiaTabs
            states={INDIA_STATES}
            activeState={activeState}
            setActiveState={handleStateChange}
          />
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-3 sm:px-4 pb-20 lg:pb-16 mt-4">
        <div className="bg-white lg:border lg:rounded-xl lg:shadow-sm lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
            <div className="lg:col-span-1 lg:sticky lg:top-32 h-fit">
              <IndiaFilters
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                states={INDIA_STATES}
                activeState={activeState}
                setActiveState={handleStateChange}
                resetFilters={resetFilters}
              />
            </div>

            <div className="lg:col-span-3">
              <IndiaPackagesGrid
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                activeState={activeState}
                setActiveState={handleStateChange}
                resetFilters={resetFilters}
                setResetFilters={setResetFilters}
                onClearAll={handleClearAll}
                searchMode={isManualStateSelection ? "" : searchMode}
                destinationKind={isManualStateSelection ? "" : destinationKind}
                requestedToCity={isManualStateSelection ? "" : toCity}
                requestedMatchedState={
                  isManualStateSelection ? "" : autoDetectedState
                }
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function PopularIndiaPage() {
  return (
    <Suspense fallback={<div />}>
      <PopularIndiaPageContent />
    </Suspense>
  );
}
