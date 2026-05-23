"use client";

import { useState } from "react";
import { Search, MapPinned, X } from "lucide-react";
import type { Homestay } from "@/app/data/stays/types";

export type HomestayFilterState = {
  searchText: string;
  suggestedForYou: string[];
  priceRanges: string[];
  budgetMin: string;
  budgetMax: string;
  userRating: string[];
  propertyType: string[];
  topLocation: string[];
  roomViews: string[];
  roomAmenities: string[];
  hostType: string[];
  tplLuxury: boolean;
  bookingPreference: string[];
  houseRules: string[];
};

export type HomestayFilterChip =
  | { type: "searchText"; label: string }
  | { type: "suggestedForYou"; value: string; label: string }
  | { type: "priceRanges"; value: string; label: string }
  | { type: "budgetMin"; label: string }
  | { type: "budgetMax"; label: string }
  | { type: "userRating"; value: string; label: string }
  | { type: "propertyType"; value: string; label: string }
  | { type: "topLocation"; value: string; label: string }
  | { type: "roomViews"; value: string; label: string }
  | { type: "roomAmenities"; value: string; label: string }
  | { type: "hostType"; value: string; label: string }
  | { type: "tplLuxury"; label: string }
  | { type: "bookingPreference"; value: string; label: string }
  | { type: "houseRules"; value: string; label: string };

type Props = {
  city: string;
  homestays: Homestay[];
  filters: HomestayFilterState;
  chips: HomestayFilterChip[];
  onToggleArray: (
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
  ) => void;
  onSetField: (
    key: "searchText" | "budgetMin" | "budgetMax",
    value: string
  ) => void;
  onToggleLuxury: () => void;
  onClearAll: () => void;
  onRemoveChip: (chip: HomestayFilterChip) => void;
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-[#e5e7eb] pt-5 first:border-t-0 first:pt-0">
      <div className="mb-3 text-[16px] font-extrabold text-[#111827]">
        {title}
      </div>
      {children}
    </div>
  );
}

function CheckboxRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5 text-[15px] text-[#374151]">
      <span className="flex min-w-0 items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-5 w-5 rounded border border-[#cbd5e1]"
        />
        <span className="truncate">{label}</span>
      </span>

      {typeof count === "number" && (
        <span className="shrink-0 text-[14px] text-[#6b7280]">({count})</span>
      )}
    </label>
  );
}

function countByLabel(
  items: Homestay[],
  getValues: (homestay: Homestay) => string[]
) {
  const map = new Map<string, number>();

  items.forEach((homestay) => {
    const uniqueValues = Array.from(new Set(getValues(homestay).filter(Boolean)));
    uniqueValues.forEach((value) => {
      map.set(value, (map.get(value) || 0) + 1);
    });
  });

  return map;
}

export default function HomestayResultsFilters({
  city,
  homestays,
  filters,
  chips,
  onToggleArray,
  onSetField,
  onToggleLuxury,
  onClearAll,
  onRemoveChip,
}: Props) {
  const [showMap, setShowMap] = useState(false);

  const suggestedCounts = {
    "TPL Guaranteed": homestays.filter((item) => item.guaranteed).length,
    "Couple Friendly": homestays.filter((item) =>
      item.houseRules?.includes("Allows Unmarried Couples")
    ).length,
    "Free Cancellation": homestays.filter((item) =>
      item.variants.some((variant) => variant.cancellation === "Free Cancellation")
    ).length,
    "Breakfast Included": homestays.filter((item) =>
      item.variants.some((variant) => variant.mealPlan !== "EP")
    ).length,
  };

  const priceRangeOptions = [
    { label: "₹ 0 - ₹ 2000", key: "0-2000" },
    { label: "₹ 2000 - ₹ 5000", key: "2000-5000" },
    { label: "₹ 5000 - ₹ 8500", key: "5000-8500" },
    { label: "₹ 8500 - ₹ 12000", key: "8500-12000" },
    { label: "₹ 12000 - ₹ 15000", key: "12000-15000" },
    { label: "₹ 15000 - ₹ 30000", key: "15000-30000" },
    { label: "₹ 30000+", key: "30000-plus" },
  ];

  const priceRangeCounts = {
    "0-2000": homestays.filter((item) => item.pricePerNight >= 0 && item.pricePerNight < 2000).length,
    "2000-5000": homestays.filter((item) => item.pricePerNight >= 2000 && item.pricePerNight < 5000).length,
    "5000-8500": homestays.filter((item) => item.pricePerNight >= 5000 && item.pricePerNight < 8500).length,
    "8500-12000": homestays.filter((item) => item.pricePerNight >= 8500 && item.pricePerNight < 12000).length,
    "12000-15000": homestays.filter((item) => item.pricePerNight >= 12000 && item.pricePerNight < 15000).length,
    "15000-30000": homestays.filter((item) => item.pricePerNight >= 15000 && item.pricePerNight < 30000).length,
    "30000-plus": homestays.filter((item) => item.pricePerNight >= 30000).length,
  };

  const ratingCounts = {
    excellent: homestays.filter((item) => item.rating >= 4.2).length,
    veryGood: homestays.filter((item) => item.rating >= 3.5).length,
    good: homestays.filter((item) => item.rating >= 3).length,
  };

  const propertyTypeMap = countByLabel(homestays, (item) => [
    item.propertyType || "Homestay",
  ]);
  const locationMap = countByLabel(homestays, (item) => item.topLocation || []);
  const roomViewMap = countByLabel(homestays, (item) => item.roomViews || []);
  const roomAmenitiesMap = countByLabel(
    homestays,
    (item) => item.roomAmenities || []
  );
  const hostTypeMap = countByLabel(homestays, (item) =>
    item.hostType ? [item.hostType] : []
  );
  const bookingMap = countByLabel(
    homestays,
    (item) => item.bookingPreference || []
  );
  const rulesMap = countByLabel(homestays, (item) => item.houseRules || []);

  const propertyTypes = Array.from(propertyTypeMap.keys()).sort();
  const topLocations = Array.from(locationMap.keys()).sort();
  const roomViews = Array.from(roomViewMap.keys()).sort();
  const roomAmenities = Array.from(roomAmenitiesMap.keys()).sort();
  const hostTypes = Array.from(hostTypeMap.keys()).sort();
  const bookingPreferences = Array.from(bookingMap.keys()).sort();
  const houseRules = Array.from(rulesMap.keys()).sort();

  return (
    <>
      <div className="sticky top-[90px] rounded-lg border border-[#d9e2ec] bg-white p-4">
        {/* MAP */}
        <div className="mb-5 overflow-hidden rounded-xl border border-[#d9e2ec] bg-[#f8fbff]">
          <div className="h-[140px] bg-[linear-gradient(135deg,#dbeafe_0%,#eef6ff_100%)] p-3">
            <div className="flex h-full flex-col justify-between rounded-lg border border-white/70 bg-[radial-gradient(circle_at_center,#ffffff_0%,#dbeafe_100%)] px-3 py-3">
              <div className="flex items-center gap-2 text-[12px] font-bold text-[#1e3a8a]">
                <MapPinned className="h-4 w-4" />
                {city} City Map Ready
              </div>

              <div className="text-[13px] font-semibold text-[#374151]">
                {homestays.length} stays available
              </div>

              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="h-[36px] rounded-full border border-[#93c5fd] bg-white text-[13px] font-extrabold text-[#0b74ff]"
              >
                EXPLORE ON MAP
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
            <input
              type="text"
              value={filters.searchText}
              onChange={(e) => onSetField("searchText", e.target.value)}
              placeholder="Search for locality / stay / amenity"
              className="h-[44px] w-full rounded-lg border border-[#d9e2ec] bg-white pl-10 pr-3 text-[14px] outline-none placeholder:text-[#94a3b8]"
            />
          </div>
        </div>

        {/* CLEAR ALL */}
        <div className="mb-5 flex justify-end">
          <button
            type="button"
            onClick={onClearAll}
            className="text-[13px] font-bold text-[#0b74ff] hover:underline"
          >
            Clear All
          </button>
        </div>

        {/* CHIPS */}
        {chips.length > 0 && (
          <div className="mb-5">
            <div className="mb-2 text-[13px] font-bold text-[#111827]">
              Applied Filters
            </div>
            <div className="flex flex-wrap gap-2">
              {chips.map((chip, index) => (
                <button
                  key={`${chip.label}-${index}`}
                  type="button"
                  onClick={() => onRemoveChip(chip)}
                  className="inline-flex items-center gap-1 rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-3 py-1 text-[12px] font-semibold text-[#0b74ff]"
                >
                  {chip.label}
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-5">
          <Section title="Suggested For You">
            <CheckboxRow
              label="TPL Guaranteed"
              count={suggestedCounts["TPL Guaranteed"]}
              checked={filters.suggestedForYou.includes("TPL Guaranteed")}
              onChange={() =>
                onToggleArray("suggestedForYou", "TPL Guaranteed")
              }
            />
            <CheckboxRow
              label="Couple Friendly"
              count={suggestedCounts["Couple Friendly"]}
              checked={filters.suggestedForYou.includes("Couple Friendly")}
              onChange={() =>
                onToggleArray("suggestedForYou", "Couple Friendly")
              }
            />
            <CheckboxRow
              label="Free Cancellation"
              count={suggestedCounts["Free Cancellation"]}
              checked={filters.suggestedForYou.includes("Free Cancellation")}
              onChange={() =>
                onToggleArray("suggestedForYou", "Free Cancellation")
              }
            />
            <CheckboxRow
              label="Breakfast Included"
              count={suggestedCounts["Breakfast Included"]}
              checked={filters.suggestedForYou.includes("Breakfast Included")}
              onChange={() =>
                onToggleArray("suggestedForYou", "Breakfast Included")
              }
            />
          </Section>

          <Section title="Price Per Night">
            {priceRangeOptions.map((item) => (
              <CheckboxRow
                key={item.key}
                label={item.label}
                count={
                  priceRangeCounts[item.key as keyof typeof priceRangeCounts]
                }
                checked={filters.priceRanges.includes(item.key)}
                onChange={() => onToggleArray("priceRanges", item.key)}
              />
            ))}

            <div className="mt-3">
              <div className="mb-2 text-[14px] font-semibold text-[#374151]">
                Your Budget
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={filters.budgetMin}
                  onChange={(e) => onSetField("budgetMin", e.target.value)}
                  placeholder="Min"
                  className="h-[40px] w-full rounded-md border border-[#d9e2ec] px-3 text-sm outline-none"
                />
                <span className="text-sm font-semibold text-[#64748b]">to</span>
                <input
                  type="number"
                  value={filters.budgetMax}
                  onChange={(e) => onSetField("budgetMax", e.target.value)}
                  placeholder="Max"
                  className="h-[40px] w-full rounded-md border border-[#d9e2ec] px-3 text-sm outline-none"
                />
              </div>
            </div>
          </Section>

          <Section title="User Rating">
            <CheckboxRow
              label="Excellent: 4.2+"
              count={ratingCounts.excellent}
              checked={filters.userRating.includes("excellent")}
              onChange={() => onToggleArray("userRating", "excellent")}
            />
            <CheckboxRow
              label="Very Good: 3.5+"
              count={ratingCounts.veryGood}
              checked={filters.userRating.includes("veryGood")}
              onChange={() => onToggleArray("userRating", "veryGood")}
            />
            <CheckboxRow
              label="Good: 3+"
              count={ratingCounts.good}
              checked={filters.userRating.includes("good")}
              onChange={() => onToggleArray("userRating", "good")}
            />
          </Section>

          <Section title="Property Type">
            {propertyTypes.map((item) => (
              <CheckboxRow
                key={item}
                label={item}
                count={propertyTypeMap.get(item)}
                checked={filters.propertyType.includes(item)}
                onChange={() => onToggleArray("propertyType", item)}
              />
            ))}
          </Section>

          <Section title="Top Locations">
            {topLocations.map((item) => (
              <CheckboxRow
                key={item}
                label={item}
                count={locationMap.get(item)}
                checked={filters.topLocation.includes(item)}
                onChange={() => onToggleArray("topLocation", item)}
              />
            ))}
          </Section>

          <Section title="Room Views">
            {roomViews.map((item) => (
              <CheckboxRow
                key={item}
                label={item}
                count={roomViewMap.get(item)}
                checked={filters.roomViews.includes(item)}
                onChange={() => onToggleArray("roomViews", item)}
              />
            ))}
          </Section>

          <Section title="Room Amenities">
            {roomAmenities.map((item) => (
              <CheckboxRow
                key={item}
                label={item}
                count={roomAmenitiesMap.get(item)}
                checked={filters.roomAmenities.includes(item)}
                onChange={() => onToggleArray("roomAmenities", item)}
              />
            ))}
          </Section>

          <Section title="Host Type">
            {hostTypes.map((item) => (
              <CheckboxRow
                key={item}
                label={item}
                count={hostTypeMap.get(item)}
                checked={filters.hostType.includes(item)}
                onChange={() => onToggleArray("hostType", item)}
              />
            ))}
          </Section>

          <Section title="TPL Luxury Section">
            <CheckboxRow
              label="TPL Luxe Selections"
              count={homestays.filter((item) => item.luxuryTag).length}
              checked={filters.tplLuxury}
              onChange={onToggleLuxury}
            />
          </Section>

          <Section title="Booking Preference">
            {bookingPreferences.map((item) => (
              <CheckboxRow
                key={item}
                label={item}
                count={bookingMap.get(item)}
                checked={filters.bookingPreference.includes(item)}
                onChange={() => onToggleArray("bookingPreference", item)}
              />
            ))}
          </Section>

          <Section title="House Rules">
            {houseRules.map((item) => (
              <CheckboxRow
                key={item}
                label={item}
                count={rulesMap.get(item)}
                checked={filters.houseRules.includes(item)}
                onChange={() => onToggleArray("houseRules", item)}
              />
            ))}
          </Section>
        </div>
      </div>

      {/* MAP POPUP */}
      {showMap && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50">
          <div className="relative h-[80vh] w-[90%] max-w-5xl overflow-hidden rounded-xl bg-white shadow-xl">
            <button
              onClick={() => setShowMap(false)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 shadow hover:bg-gray-100"
            >
              ✕
            </button>

            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                city + " homestays"
              )}&output=embed`}
              className="h-full w-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </>
  );
}