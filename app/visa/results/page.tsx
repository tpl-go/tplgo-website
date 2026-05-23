"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function VisaResultsPage() {
  const router = useRouter();

  const [searchData, setSearchData] =
    useState<VisaResultsSearchData>(defaultSearchData);

  useEffect(() => {
    const raw = sessionStorage.getItem("tplVisaSearchData");

    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);

      setSearchData({
        destinationCountry:
          parsed?.destinationCountry || defaultSearchData.destinationCountry,
        nationality: parsed?.nationality || defaultSearchData.nationality,
        travelDate: parsed?.travelDate || defaultSearchData.travelDate,
        visaType: parsed?.visaType || defaultSearchData.visaType,
        travellers: Number(parsed?.travellers || defaultSearchData.travellers),
      });
    } catch {
      setSearchData(defaultSearchData);
    }
  }, []);

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
      .map((item: any) =>
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
    <main className="min-h-screen bg-gray-50">
      <VisaResultsSearchBar
        searchData={searchData}
        onChange={setSearchData}
        onSearch={handleSearch}
      />

      <section className="px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h1 className="text-3xl font-extrabold text-gray-950">
              Visa Options
            </h1>

            <p className="mt-2 text-sm font-semibold text-gray-700">
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
            <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <h2 className="text-2xl font-extrabold text-gray-950">
                No visa option found
              </h2>

              <p className="mt-2 text-sm font-semibold text-gray-700">
                Please change country, nationality, or visa type and search again.
              </p>

              <button
                type="button"
                onClick={() => router.push("/?service=visa")}
                className="mt-5 rounded-xl bg-orange-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-orange-700"
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