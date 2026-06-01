"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { searchVisaOptions, type VisaOption } from "@/app/lib/visa/visaCatalog";
import VisaResultsSearchBar, {
  type VisaResultsSearchData,
} from "@/app/components/visa/results/VisaResultsSearchBar";
import SmartResultsOfferStrip from "@/app/components/smartOffers/SmartResultsOfferStrip";
import VisaResultCard, {
  type VisaResultPricingSnapshot,
} from "@/app/components/visa/results/VisaResultCard";

const defaultSearchData: VisaResultsSearchData = {
  destinationCountry: "United Arab Emirates",
  nationality: "India",
  travelDate: "",
  visaType: "Tourist",
  travellers: 1,
};

type VisaOptionWithPricing = VisaOption & {
  pricingSnapshot?: VisaResultPricingSnapshot;
};

function getInitialSearchData(): VisaResultsSearchData {
  if (typeof window === "undefined") return defaultSearchData;

  const raw = sessionStorage.getItem("tplVisaSearchData");

  if (!raw) return defaultSearchData;

  try {
    const parsed = JSON.parse(raw);

    return {
      destinationCountry:
        parsed?.destinationCountry || defaultSearchData.destinationCountry,
      nationality: parsed?.nationality || defaultSearchData.nationality,
      travelDate: parsed?.travelDate || defaultSearchData.travelDate,
      visaType: parsed?.visaType || defaultSearchData.visaType,
      travellers: Number(parsed?.travellers || defaultSearchData.travellers),
    };
  } catch {
    return defaultSearchData;
  }
}

export default function VisaResultsPage() {
  const router = useRouter();

  const [searchData, setSearchData] =
    useState<VisaResultsSearchData>(getInitialSearchData);

  const results = useMemo(() => {
    return searchVisaOptions({
      country: searchData.destinationCountry,
      nationality: searchData.nationality,
      visaType: searchData.visaType,
    });
  }, [searchData]);

  const handleSearch = () => {
    sessionStorage.setItem(
      "tplVisaSearchData",
      JSON.stringify({
        ...searchData,
        searchedAt: new Date().toISOString(),
      })
    );
  };

  const handleApply = (option: VisaOptionWithPricing) => {
    sessionStorage.setItem(
      "tplSelectedVisaOption",
      JSON.stringify({
        option,
        searchData,
        pricingSnapshot: option.pricingSnapshot || null,
        selectedAt: new Date().toISOString(),
      })
    );

    router.push("/visa/application");
  };

  const offerBookingValue = useMemo(() => {
    const prices = results
      .map((item) =>
        Number(
          item?.baseVisaAmount ||
            item?.basePrice ||
            item?.visaFee ||
            item?.serviceFee ||
            item?.totalPrice ||
            item?.price ||
            0
        )
      )
      .filter((price) => price > 0);

    return prices.length > 0
      ? Math.min(...prices) * Number(searchData.travellers || 1)
      : 5000;
  }, [results, searchData.travellers]);

  const isInternational = useMemo(() => {
    return (
      String(searchData.destinationCountry || "")
        .trim()
        .toLowerCase() !== "india"
    );
  }, [searchData.destinationCountry]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-50 pb-8">
      <div className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 px-3 py-3 shadow-sm backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-xl font-black text-gray-800 shadow-sm"
            aria-label="Go back"
          >
            ‹
          </button>

          <div className="min-w-0 flex-1">
            <div className="truncate text-[16px] font-black text-gray-950">
              Visa Results
            </div>
            <div className="truncate text-[12px] font-semibold text-gray-500">
              {searchData.destinationCountry} • {searchData.visaType} Visa
            </div>
          </div>
        </div>
      </div>

      <VisaResultsSearchBar
        searchData={searchData}
        onChange={setSearchData}
        onSearch={handleSearch}
      />

      <section className="px-3 py-4 md:px-6 md:py-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[22px] border border-gray-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-6">
            <h1 className="break-words text-[22px] font-extrabold leading-7 text-gray-950 md:text-3xl">
              Visa Options
            </h1>

            <p className="mt-2 break-words text-sm font-semibold leading-5 text-gray-700">
              {searchData.destinationCountry} • {searchData.visaType} Visa •{" "}
              {searchData.travellers} Applicant
              {searchData.travellers > 1 ? "s" : ""}
            </p>
          </div>

          <SmartResultsOfferStrip
            service="visa"
            destination={searchData.destinationCountry}
            bookingValue={offerBookingValue}
            isInternational={isInternational}
          />

          {results.length === 0 ? (
            <div className="rounded-[22px] border border-gray-200 bg-white p-5 text-center shadow-sm md:rounded-3xl md:p-10">
              <h2 className="break-words text-[21px] font-extrabold leading-7 text-gray-950 md:text-2xl">
                No visa option found
              </h2>

              <p className="mt-2 break-words text-sm font-semibold leading-5 text-gray-700">
                Please change country, nationality, or visa type and search again.
              </p>

              <button
                type="button"
                onClick={() => router.push("/?service=visa")}
                className="mt-5 min-h-11 rounded-xl bg-orange-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-orange-700"
              >
                Back to Visa Search
              </button>
            </div>
          ) : (
            <div className="grid gap-5">
              {results.map((item) => (
                <VisaResultCard
                  key={item.id}
                  item={item}
                  travellers={Number(searchData.travellers || 1)}
                  onApply={handleApply}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
