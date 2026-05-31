"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import HomestayResultsSearchBar from "@/app/components/Homestays/results/HomestayResultsSearchBar";
import HomestayResultsTopStrip from "@/app/components/Homestays/results/HomestayResultsTopStrip";
import HomestayResultsSortBar from "@/app/components/Homestays/results/HomestayResultsSortBar";
import HomestayResultCard from "@/app/components/Homestays/results/HomestayResultCard";
import HomestayResultsFilters, {
  type HomestayFilterChip,
  type HomestayFilterState,
} from "@/app/components/Homestays/results/HomestayResultsFilters";
import { homestayResultsDummy } from "@/app/data/stays/homestays/homestayResultsDummy";
import SmartResultsOfferStrip from "@/app/components/smartOffers/SmartResultsOfferStrip";

type HomestaySortOption =
  | "tplGuaranteed"
  | "popularity"
  | "priceLowToHigh"
  | "priceHighToLow"
  | "userRatingHighest"
  | "lowestPriceBestRated";

const INITIAL_FILTERS: HomestayFilterState = {
  searchText: "",
  suggestedForYou: [],
  priceRanges: [],
  budgetMin: "",
  budgetMax: "",
  userRating: [],
  propertyType: [],
  topLocation: [],
  roomViews: [],
  roomAmenities: [],
  hostType: [],
  tplLuxury: false,
  bookingPreference: [],
  houseRules: [],
};

function toggleValue<T extends string>(list: T[], value: T) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function matchesPriceRange(price: number, range: string) {
  switch (range) {
    case "0-2000":
      return price >= 0 && price < 2000;
    case "2000-5000":
      return price >= 2000 && price < 5000;
    case "5000-8500":
      return price >= 5000 && price < 8500;
    case "8500-12000":
      return price >= 8500 && price < 12000;
    case "12000-15000":
      return price >= 12000 && price < 15000;
    case "15000-30000":
      return price >= 15000 && price < 30000;
    case "30000-plus":
      return price >= 30000;
    default:
      return true;
  }
}

function HomestaysResultsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const city = searchParams.get("city") || "Goa";

  const [activeSort, setActiveSort] =
    useState<HomestaySortOption>("popularity");
  const [filters, setFilters] = useState<HomestayFilterState>(INITIAL_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const cityHomestays = useMemo(() => {
    return homestayResultsDummy.filter(
      (item) => item.city.toLowerCase() === city.toLowerCase()
    );
  }, [city]);

  const fallbackHomestays = useMemo(() => homestayResultsDummy.slice(0, 4), []);
  const sourceHomestays =
    cityHomestays.length > 0 ? cityHomestays : fallbackHomestays;

  const filteredHomestays = useMemo(() => {
    return sourceHomestays.filter((item) => {
      const searchText = filters.searchText.trim().toLowerCase();

      const searchMatch =
        !searchText ||
        [
          item.title,
          item.area,
          item.propertyType || "",
          item.description || "",
          item.hostType || "",
          ...(item.topLocation || []),
          ...(item.amenities || []),
          ...(item.roomAmenities || []),
          ...(item.searchableAmenities || []),
          ...(item.locationHighlights || []),
          ...(item.scenicTags || []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchText);

      const suggestedMatch =
        filters.suggestedForYou.length === 0 ||
        filters.suggestedForYou.every((value) => {
          if (value === "TPL Guaranteed") return item.guaranteed;
          if (value === "Couple Friendly") {
            return item.houseRules?.includes("Allows Unmarried Couples");
          }
          if (value === "Free Cancellation") {
            return item.variants.some(
              (variant) => variant.cancellation === "Free Cancellation"
            );
          }
          if (value === "Breakfast Included") {
            return item.variants.some((variant) => variant.mealPlan !== "EP");
          }
          return true;
        });

      const priceRangeMatch =
        filters.priceRanges.length === 0 ||
        filters.priceRanges.some((range) =>
          matchesPriceRange(item.pricePerNight, range)
        );

      const budgetMinMatch =
        !filters.budgetMin || item.pricePerNight >= Number(filters.budgetMin);

      const budgetMaxMatch =
        !filters.budgetMax || item.pricePerNight <= Number(filters.budgetMax);

      const userRatingMatch =
        filters.userRating.length === 0 ||
        filters.userRating.some((value) => {
          if (value === "excellent") return item.rating >= 4.2;
          if (value === "veryGood") return item.rating >= 3.5;
          if (value === "good") return item.rating >= 3;
          return true;
        });

      const propertyTypeMatch =
        filters.propertyType.length === 0 ||
        filters.propertyType.includes(item.propertyType || "Homestay");

      const topLocationMatch =
        filters.topLocation.length === 0 ||
        filters.topLocation.some((value) => item.topLocation?.includes(value));

      const roomViewsMatch =
        filters.roomViews.length === 0 ||
        filters.roomViews.some((value) => item.roomViews?.includes(value));

      const roomAmenitiesMatch =
        filters.roomAmenities.length === 0 ||
        filters.roomAmenities.some((value) =>
          item.roomAmenities?.includes(value)
        );

      const hostTypeMatch =
        filters.hostType.length === 0 ||
        filters.hostType.includes(item.hostType || "");

      const luxuryMatch = !filters.tplLuxury || item.luxuryTag;

      const bookingPreferenceMatch =
        filters.bookingPreference.length === 0 ||
        filters.bookingPreference.some((value) =>
          item.bookingPreference?.includes(value)
        );

      const rulesMatch =
        filters.houseRules.length === 0 ||
        filters.houseRules.some((value) => item.houseRules?.includes(value));

      return (
        searchMatch &&
        suggestedMatch &&
        priceRangeMatch &&
        budgetMinMatch &&
        budgetMaxMatch &&
        userRatingMatch &&
        propertyTypeMatch &&
        topLocationMatch &&
        roomViewsMatch &&
        roomAmenitiesMatch &&
        hostTypeMatch &&
        luxuryMatch &&
        bookingPreferenceMatch &&
        rulesMatch
      );
    });
  }, [sourceHomestays, filters]);

  const sortedHomestays = useMemo(() => {
    const baseList = [...filteredHomestays];

    switch (activeSort) {
      case "priceLowToHigh":
        return baseList.sort((a, b) => a.pricePerNight - b.pricePerNight);

      case "priceHighToLow":
        return baseList.sort((a, b) => b.pricePerNight - a.pricePerNight);

      case "userRatingHighest":
        return baseList.sort((a, b) => b.rating - a.rating);

      case "lowestPriceBestRated":
        return baseList.sort((a, b) => {
          const scoreA = a.pricePerNight - a.rating * 1000;
          const scoreB = b.pricePerNight - b.rating * 1000;
          return scoreA - scoreB;
        });

      case "tplGuaranteed":
        return baseList.sort((a, b) => {
          const aGuaranteed = a.guaranteed ? 1 : 0;
          const bGuaranteed = b.guaranteed ? 1 : 0;
          return bGuaranteed - aGuaranteed || b.rating - a.rating;
        });

      case "popularity":
      default:
        return baseList.sort((a, b) => b.reviews - a.reviews);
    }
  }, [filteredHomestays, activeSort]);

  const chips = useMemo<HomestayFilterChip[]>(() => {
    const next: HomestayFilterChip[] = [];

    if (filters.searchText.trim()) {
      next.push({
        type: "searchText",
        label: `Search: ${filters.searchText.trim()}`,
      });
    }

    filters.suggestedForYou.forEach((value) =>
      next.push({ type: "suggestedForYou", value, label: value })
    );

    const rangeLabelMap: Record<string, string> = {
      "0-2000": "₹ 0 - ₹ 2000",
      "2000-5000": "₹ 2000 - ₹ 5000",
      "5000-8500": "₹ 5000 - ₹ 8500",
      "8500-12000": "₹ 8500 - ₹ 12000",
      "12000-15000": "₹ 12000 - ₹ 15000",
      "15000-30000": "₹ 15000 - ₹ 30000",
      "30000-plus": "₹ 30000+",
    };

    filters.priceRanges.forEach((value) =>
      next.push({
        type: "priceRanges",
        value,
        label: rangeLabelMap[value] || value,
      })
    );

    if (filters.budgetMin) {
      next.push({ type: "budgetMin", label: `Min ₹${filters.budgetMin}` });
    }

    if (filters.budgetMax) {
      next.push({ type: "budgetMax", label: `Max ₹${filters.budgetMax}` });
    }

    const ratingLabelMap: Record<string, string> = {
      excellent: "Excellent: 4.2+",
      veryGood: "Very Good: 3.5+",
      good: "Good: 3+",
    };

    filters.userRating.forEach((value) =>
      next.push({
        type: "userRating",
        value,
        label: ratingLabelMap[value] || value,
      })
    );

    filters.propertyType.forEach((value) =>
      next.push({ type: "propertyType", value, label: value })
    );
    filters.topLocation.forEach((value) =>
      next.push({ type: "topLocation", value, label: value })
    );
    filters.roomViews.forEach((value) =>
      next.push({ type: "roomViews", value, label: value })
    );
    filters.roomAmenities.forEach((value) =>
      next.push({ type: "roomAmenities", value, label: value })
    );
    filters.hostType.forEach((value) =>
      next.push({ type: "hostType", value, label: value })
    );
    filters.bookingPreference.forEach((value) =>
      next.push({ type: "bookingPreference", value, label: value })
    );
    filters.houseRules.forEach((value) =>
      next.push({ type: "houseRules", value, label: value })
    );

    if (filters.tplLuxury) {
      next.push({ type: "tplLuxury", label: "TPL Luxe Selections" });
    }

    return next;
  }, [filters]);

  const handleToggleArray = (
    key:
      | "suggestedForYou"
      | "priceRanges"
      | "userRating"
      | "propertyType"
      | "topLocation"
      | "roomViews"
      | "roomAmenities"
      | "hostType"
      | "bookingPreference"
      | "houseRules",
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: toggleValue(prev[key] as string[], value),
    }));
  };

  const handleSetField = (
    key: "searchText" | "budgetMin" | "budgetMax",
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClearAll = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleRemoveChip = (chip: HomestayFilterChip) => {
    switch (chip.type) {
      case "searchText":
        return handleSetField("searchText", "");
      case "budgetMin":
        return handleSetField("budgetMin", "");
      case "budgetMax":
        return handleSetField("budgetMax", "");
      case "tplLuxury":
        return setFilters((prev) => ({ ...prev, tplLuxury: false }));
      default:
        return handleToggleArray(chip.type, chip.value);
    }
  };

  const totalToShow = sortedHomestays.length;

  const filtersPanel = (
    <HomestayResultsFilters
      city={city}
      homestays={sourceHomestays}
      filters={filters}
      chips={chips}
      onToggleArray={handleToggleArray}
      onSetField={handleSetField}
      onToggleLuxury={() =>
        setFilters((prev) => ({ ...prev, tplLuxury: !prev.tplLuxury }))
      }
      onClearAll={handleClearAll}
      onRemoveChip={handleRemoveChip}
    />
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f7fb] text-black">
      <div className="sticky top-0 z-40 border-b border-[#d7dce3] bg-white md:hidden">
        <div className="flex h-12 items-center gap-3 px-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e5e7eb] bg-white text-[#111827]"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-black text-[#111827]">
              Homestay Search
            </div>
            <div className="text-[11px] font-semibold text-[#64748b]">
              Modify destination, dates and guests
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-[#d7dce3] bg-white px-3 py-3 md:px-6 md:py-2">
        <div className="mx-auto max-w-7xl">
          <HomestayResultsSearchBar />
        </div>
      </div>

      <div className="border-b border-[#e5e7eb] bg-white px-3 py-3 md:hidden">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[17px] font-black text-[#111827]">
              Homestays in {city}
            </div>
            <div className="mt-0.5 text-[12px] font-semibold text-[#64748b]">
              {totalToShow} homestays available
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="relative z-10 flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-3 text-[12px] font-extrabold text-[#0b74ff]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
            {chips.length > 0 ? (
              <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0b74ff] px-1 text-[10px] text-white">
                {chips.length}
              </span>
            ) : null}
          </button>
        </div>

        {chips.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {chips.map((chip, index) => (
              <button
                key={`${chip.label}-${index}`}
                type="button"
                onClick={() => handleRemoveChip(chip)}
                className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-3 text-[12px] font-bold text-[#0b74ff]"
              >
                {chip.label}
                <span className="text-[13px] leading-none">×</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-3 py-3 md:px-4 md:py-4">
        <div className="flex gap-0 md:gap-6">
          {/* LEFT FILTER */}
          <div className="hidden w-[320px] shrink-0 md:block">
            {filtersPanel}
          </div>

          {/* RIGHT CONTENT */}
          <div className="min-w-0 flex-1">
            <HomestayResultsTopStrip city={city} total={totalToShow} />

            <HomestayResultsSortBar
              activeSort={activeSort}
              onChange={(value: HomestaySortOption) => setActiveSort(value)}
            />

            <div className="mb-4 hidden items-start gap-4 md:flex">
              <div className="min-w-0 flex-1">
                <div className="text-[20px] font-extrabold text-[#111827]">
                  Showing Homestays in {city}
                </div>

                <div className="mt-1 text-[13px] font-semibold text-[#6b7280]">
                  Curated homestays, villas & hosted stays for your destination.
                </div>
              </div>

              <div className="hidden xl:block">
                <div className="rounded-full border border-[#fed7aa] bg-[#fff7ed] px-4 py-2 text-[12px] font-black text-[#ea580c] shadow-sm">
                  AI Smart Pricing Active
                </div>
              </div>
            </div>

            <SmartResultsOfferStrip
              service="homestay"
              destination={city}
              bookingValue={
                sortedHomestays?.[0]?.pricePerNight
                  ? sortedHomestays[0].pricePerNight * 2
                  : 12000
              }
            />

            {cityHomestays.length === 0 && (
              <div className="mb-4 rounded-lg border border-[#f3e8a3] bg-[#fffbea] px-4 py-3 text-sm font-semibold text-[#92400e]">
                No exact homestay match found for{" "}
                <span className="font-extrabold">{city}</span>. Showing featured
                homestays instead.
              </div>
            )}

            {sortedHomestays.length === 0 ? (
              <div className="rounded-lg border border-[#d9e2ec] bg-white px-5 py-8 text-center">
                <div className="text-[18px] font-extrabold text-[#111827]">
                  No homestays found
                </div>
                <div className="mt-2 text-sm text-[#6b7280]">
                  Try removing some filters or use Clear All.
                </div>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="mt-4 rounded-md bg-[#0b74ff] px-4 py-2 text-sm font-bold text-white"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedHomestays.map((homestay) => (
                  <HomestayResultCard
                    key={homestay.id}
                    homestay={homestay}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[1000] md:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-black/45"
            onClick={() => setMobileFiltersOpen(false)}
          />

          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-hidden rounded-t-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
              <div>
                <div className="text-[17px] font-black text-[#111827]">
                  Filters
                </div>
                <div className="text-[12px] font-semibold text-[#64748b]">
                  {totalToShow} homestays in {city}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="h-10 rounded-full border border-[#e5e7eb] px-4 text-[13px] font-extrabold text-[#111827]"
              >
                Close
              </button>
            </div>

            <div className="max-h-[calc(88vh-126px)] overflow-y-auto px-3 py-3">
              {filtersPanel}
            </div>

            <div className="border-t border-[#e5e7eb] bg-white px-4 py-3">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="h-12 w-full rounded-xl bg-[#0b74ff] text-[14px] font-black text-white"
              >
                Show {totalToShow} Homestays
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function HomestaysResultsPage() {
  return (
    <Suspense fallback={<div />}>
      <HomestaysResultsPageContent />
    </Suspense>
  );
}
