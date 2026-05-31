"use client";

import { useState } from "react";
import { Search, MapPinned, X } from "lucide-react";
import type { Hotel } from "@/app/data/stays/types";

export type HotelFilterState = {
  searchText: string;
  suggestedForYou: string[];
  priceRanges: string[];
  budgetMin: string;
  budgetMax: string;
  starCategory: number[];
  userRating: string[];
  propertyType: string[];
  topLocation: string[];
  roomViews: string[];
  roomAmenities: string[];
  chains: string[];
  tplLuxury: boolean;
  bookingPreference: string[];
  hotelRules: string[];
};

export type FilterChip =
  | { type: "searchText"; label: string }
  | { type: "suggestedForYou"; value: string; label: string }
  | { type: "priceRanges"; value: string; label: string }
  | { type: "budgetMin"; label: string }
  | { type: "budgetMax"; label: string }
  | { type: "starCategory"; value: number; label: string }
  | { type: "userRating"; value: string; label: string }
  | { type: "propertyType"; value: string; label: string }
  | { type: "topLocation"; value: string; label: string }
  | { type: "roomViews"; value: string; label: string }
  | { type: "roomAmenities"; value: string; label: string }
  | { type: "chains"; value: string; label: string }
  | { type: "tplLuxury"; label: string }
  | { type: "bookingPreference"; value: string; label: string }
  | { type: "hotelRules"; value: string; label: string };

type Props = {
  city: string;
  hotels: Hotel[];
  filters: HotelFilterState;
  chips: FilterChip[];
  onToggleArray: (
    key:
      | "suggestedForYou"
      | "priceRanges"
      | "starCategory"
      | "userRating"
      | "propertyType"
      | "topLocation"
      | "roomViews"
      | "roomAmenities"
      | "chains"
      | "bookingPreference"
      | "hotelRules",
    value: string | number
  ) => void;
  onSetField: (
    key: "searchText" | "budgetMin" | "budgetMax",
    value: string
  ) => void;
  onToggleLuxury: () => void;
  onClearAll: () => void;
  onRemoveChip: (chip: FilterChip) => void;
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

function countByLabel(items: Hotel[], getValues: (hotel: Hotel) => string[]) {
  const map = new Map<string, number>();

  items.forEach((hotel) => {
    const uniqueValues = Array.from(new Set(getValues(hotel).filter(Boolean)));
    uniqueValues.forEach((value) => {
      map.set(value, (map.get(value) || 0) + 1);
    });
  });

  return map;
}

export default function HotelResultsFilters({
  city,
  hotels,
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
    "TPL Guaranteed": hotels.filter((hotel) => hotel.guaranteed).length,
    "Couple Friendly": hotels.filter((hotel) => hotel.coupleFriendly).length,
    "Free Cancellation": hotels.filter((hotel) =>
      hotel.variants.some(
        (variant) => variant.cancellation === "Free Cancellation"
      )
    ).length,
    "Breakfast Included": hotels.filter((hotel) =>
      hotel.variants.some((variant) => variant.mealPlan !== "EP")
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
    "0-2000": hotels.filter(
      (hotel) => hotel.pricePerNight >= 0 && hotel.pricePerNight < 2000
    ).length,
    "2000-5000": hotels.filter(
      (hotel) => hotel.pricePerNight >= 2000 && hotel.pricePerNight < 5000
    ).length,
    "5000-8500": hotels.filter(
      (hotel) => hotel.pricePerNight >= 5000 && hotel.pricePerNight < 8500
    ).length,
    "8500-12000": hotels.filter(
      (hotel) => hotel.pricePerNight >= 8500 && hotel.pricePerNight < 12000
    ).length,
    "12000-15000": hotels.filter(
      (hotel) => hotel.pricePerNight >= 12000 && hotel.pricePerNight < 15000
    ).length,
    "15000-30000": hotels.filter(
      (hotel) => hotel.pricePerNight >= 15000 && hotel.pricePerNight < 30000
    ).length,
    "30000-plus": hotels.filter((hotel) => hotel.pricePerNight >= 30000)
      .length,
  };

  const starCounts = {
    3: hotels.filter((hotel) => hotel.starRating === 3).length,
    4: hotels.filter((hotel) => hotel.starRating === 4).length,
    5: hotels.filter((hotel) => hotel.starRating === 5).length,
  };

  const ratingCounts = {
    excellent: hotels.filter((hotel) => hotel.rating >= 4.2).length,
    veryGood: hotels.filter((hotel) => hotel.rating >= 3.5).length,
    good: hotels.filter((hotel) => hotel.rating >= 3).length,
  };

  const propertyTypeMap = countByLabel(hotels, (hotel) => [
    hotel.propertyType || "Hotel",
  ]);
  const locationMap = countByLabel(hotels, (hotel) => hotel.topLocation || []);
  const roomViewMap = countByLabel(hotels, (hotel) => hotel.roomViews || []);
  const roomAmenitiesMap = countByLabel(
    hotels,
    (hotel) => hotel.roomAmenities || []
  );
  const chainMap = countByLabel(hotels, (hotel) =>
    hotel.chain ? [hotel.chain] : []
  );
  const bookingMap = countByLabel(
    hotels,
    (hotel) => hotel.bookingPreference || []
  );
  const rulesMap = countByLabel(hotels, (hotel) => hotel.houseRules || []);

  const propertyTypes = Array.from(propertyTypeMap.keys()).sort();
  const topLocations = Array.from(locationMap.keys()).sort();
  const roomViews = Array.from(roomViewMap.keys()).sort();
  const roomAmenities = Array.from(roomAmenitiesMap.keys()).sort();
  const chains = Array.from(chainMap.keys()).sort();
  const bookingPreferences = Array.from(bookingMap.keys()).sort();
  const hotelRules = Array.from(rulesMap.keys()).sort();

  return (
    <>
      <div className="rounded-2xl border border-[#d9e2ec] bg-white p-3 md:sticky md:top-[90px] md:rounded-lg md:p-4">
        {/* MAP */}
        <div className="mb-5 overflow-hidden rounded-xl border border-[#d9e2ec] bg-[#f8fbff]">
          <div className="h-[118px] bg-[linear-gradient(135deg,#dbeafe_0%,#eef6ff_100%)] p-3 md:h-[140px]">
            <div className="flex h-full flex-col justify-between rounded-lg border border-white/70 bg-[radial-gradient(circle_at_center,#ffffff_0%,#dbeafe_100%)] px-3 py-3">
              <div className="flex items-center gap-2 text-[12px] font-bold text-[#1e3a8a]">
                <MapPinned className="h-4 w-4" />
                {city} City Map Ready
              </div>

              <div className="text-[13px] font-semibold text-[#374151]">
                {hotels.length} properties available
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
              placeholder="Search for locality / hotel / amenity"
              className="h-[44px] w-full rounded-lg border border-[#d9e2ec] bg-white pl-10 pr-3 text-[14px] outline-none placeholder:text-[#94a3b8]"
            />
          </div>
        </div>

        {/* CLEAR ALL BELOW SEARCH */}
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

          <Section title="Star Category">
            <CheckboxRow
              label="3 Star"
              count={starCounts[3]}
              checked={filters.starCategory.includes(3)}
              onChange={() => onToggleArray("starCategory", 3)}
            />
            <CheckboxRow
              label="4 Star"
              count={starCounts[4]}
              checked={filters.starCategory.includes(4)}
              onChange={() => onToggleArray("starCategory", 4)}
            />
            <CheckboxRow
              label="5 Star"
              count={starCounts[5]}
              checked={filters.starCategory.includes(5)}
              onChange={() => onToggleArray("starCategory", 5)}
            />
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

          <Section title="Chains">
            {chains.map((item) => (
              <CheckboxRow
                key={item}
                label={item}
                count={chainMap.get(item)}
                checked={filters.chains.includes(item)}
                onChange={() => onToggleArray("chains", item)}
              />
            ))}
          </Section>

          <Section title="TPL Luxury Section">
            <CheckboxRow
              label="TPL Luxe Selections"
              count={hotels.filter((hotel) => hotel.luxuryTag).length}
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

          <Section title="Hotel Rules">
            {hotelRules.map((item) => (
              <CheckboxRow
                key={item}
                label={item}
                count={rulesMap.get(item)}
                checked={filters.hotelRules.includes(item)}
                onChange={() => onToggleArray("hotelRules", item)}
              />
            ))}
          </Section>
        </div>
      </div>

      {/* MAP POPUP */}
      {showMap && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/50 px-3">
          <div className="relative h-[78vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-xl md:h-[80vh] md:w-[90%]">
            <button
              onClick={() => setShowMap(false)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 shadow hover:bg-gray-100"
            >
              ✕
            </button>

            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                city + " hotels"
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
