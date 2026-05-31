"use client";

import { useEffect, useMemo, useState } from "react";
import CabModifySearchBar from "@/app/components/cab/result/CabModifySearchBar";
import CabResultCard from "@/app/components/cab/result/CabResultCard";
import CabResultFilters from "@/app/components/cab/result/CabResultFilters";
import MobileInnerBack from "@/app/components/common/mobile/MobileInnerBack";
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
    <main className="min-h-screen overflow-x-hidden bg-[#f5f7fb] text-slate-900">
      <div className="bg-[#f5f7fb] px-3 pt-3 lg:hidden">
        <MobileInnerBack title="Cab Results" />
      </div>

      <div className="mx-auto max-w-[1400px] px-3 pb-8 pt-3 md:px-4 md:pt-4">
        <div className="z-[80] -mx-1 bg-[#f5f7fb]/95 px-1 pb-3 pt-1 backdrop-blur-sm md:-mx-2 md:px-2 md:pb-4">
          <div className="rounded-[24px]">
            <CabModifySearchBar searchMeta={searchMeta} />
          </div>
        </div>

        <div className="mb-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm lg:hidden">
          <div className="text-[11px] font-black uppercase tracking-[0.14em] text-sky-600">
            Cab Results
          </div>
          <div className="mt-1 break-words text-[18px] font-black leading-6 text-slate-900">
            {offerDestination}
          </div>
          <div className="mt-1 text-[13px] font-semibold text-slate-500">
            {filteredItems.length} option{filteredItems.length === 1 ? "" : "s"} found
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-6">
          <CabResultFilters
            rideType={searchMeta.rideType}
            items={baseItems}
            onFilteredItemsChange={setFilteredItems}
          />

          <section className="min-w-0">
            <div />

            <div className="mt-4 lg:mt-0">
              <SmartResultsOfferStrip
                service="cab"
                destination={offerDestination}
                bookingValue={offerBookingValue}
                isInternational={isInternational}
              />
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[14px] font-semibold text-slate-700 shadow-sm lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none">
              {infoText}
            </div>

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

