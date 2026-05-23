"use client";

import { useEffect, useMemo, useState } from "react";
import CabModifySearchBar from "@/app/components/cab/result/CabModifySearchBar";
import CabResultCard from "@/app/components/cab/result/CabResultCard";
import CabResultFilters from "@/app/components/cab/result/CabResultFilters";
import type {
  CabResultItem,
  CabResultSearchMeta,
} from "@/app/lib/cab/cabResultTypes";

import SmartResultsOfferStrip from "@/app/components/smartOffers/SmartResultsOfferStrip";

type Props = {
  searchMeta: CabResultSearchMeta;
  baseItems: CabResultItem[];
};

const INDIAN_CAB_CITIES = [
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

function isIndianCabCity(value: string) {
  const city = normalizeCity(value);

  if (!city) return true;

  return INDIAN_CAB_CITIES.some(
    (item) =>
      city === item ||
      city.includes(item) ||
      item.includes(city)
  );
}

export default function CabResultPageClient({
  searchMeta,
  baseItems,
}: Props) {
  const [filteredItems, setFilteredItems] = useState<CabResultItem[]>(baseItems);

  useEffect(() => {
    setFilteredItems(baseItems);
  }, [baseItems]);

  const infoText =
    searchMeta.rideType === "hourlyRentals"
      ? "Package-based local rental"
      : searchMeta.rideType === "airportTransfers"
      ? "Airport transfer fares"
      : searchMeta.rideType === "bikeRental"
      ? "Rental bikes available for your selected schedule"
      : "Rates for selected route and schedule";

  const offerBookingValue = useMemo(() => {
  const prices = filteredItems
    .map((item: any) =>
      Number(
        item?.baseFare ||
          item?.cabBaseFare ||
          item?.trueBaseFare ||
          item?.fare ||
          item?.price ||
          item?.estimatedFare ||
          item?.finalFare ||
          0
      )
    )
    .filter((price) => price > 0);

  return prices.length > 0 ? Math.min(...prices) : 1200;
}, [filteredItems]);

  const offerDestination =
  (searchMeta as any).dropCity ||
  (searchMeta as any).toCity ||
  (searchMeta as any).destination ||
  (searchMeta as any).pickupCity ||
  "Cab";

  const isInternational = useMemo(() => {
    const pickupCity =
  (searchMeta as any).pickupCity ||
  (searchMeta as any).fromCity ||
  "";

const dropCity =
  (searchMeta as any).dropCity ||
  (searchMeta as any).toCity ||
  (searchMeta as any).destination ||
  "";

    return !isIndianCabCity(pickupCity) || !isIndianCabCity(dropCity);
  }, [searchMeta]);

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <div className="mx-auto max-w-[1400px] px-4 pb-8 pt-4">
        <div className=" z-[80] -mx-2 bg-[#f5f7fb]/95 px-2 pb-4 pt-1 backdrop-blur-sm">
          <div className="rounded-[24px]">
            <CabModifySearchBar searchMeta={searchMeta} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <CabResultFilters
            rideType={searchMeta.rideType}
            items={baseItems}
            onFilteredItemsChange={setFilteredItems}
          />

          <section className="min-w-0">
            <div />

            <div className="mt-4">
              <SmartResultsOfferStrip
                service="cab"
                destination={offerDestination}
                bookingValue={offerBookingValue}
                isInternational={isInternational}
              />
            </div>

            <div className="mt-4 text-[14px] text-slate-700">{infoText}</div>

            <div className="mt-4 space-y-4">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <CabResultCard
                    key={item.id}
                    item={item}
                    searchMeta={searchMeta}
                  />
                ))
              ) : (
                <div className="rounded-[20px] border border-slate-200 bg-white px-6 py-10 text-center text-[14px] text-slate-500 shadow-sm">
                  No result found for selected filters.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

