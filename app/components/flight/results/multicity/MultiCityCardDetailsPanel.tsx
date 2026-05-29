"use client";

import { MultiCityFareOption, MultiCityFlight } from "../../data/multicityFlights";

type DetailTab = "flight" | "fare" | "rules" | "baggage";

type Props = {
  flight: MultiCityFlight;
  selectedFare: MultiCityFareOption;
  activeOffer?: ActiveOfferSnapshot | null;
  offerBaseAmount?: number;
  activeTab?: DetailTab;
  setActiveTab?: (tab: DetailTab) => void;
};

type ActiveOfferSnapshot = {
  code: string;
  title: string;
  discountType: "flat" | "percent";
  discountValue: number;
  maxDiscount: number;
  minBookingValue: number;
};

function calculateOfferDiscount(
  baseAmount: number,
  offer: ActiveOfferSnapshot | null | undefined
) {
  if (!offer || baseAmount <= 0) return 0;
  if (offer.minBookingValue > 0 && baseAmount < offer.minBookingValue) return 0;

  if (offer.discountType === "percent") {
    const value = Math.round((baseAmount * offer.discountValue) / 100);
    return offer.maxDiscount > 0 ? Math.min(value, offer.maxDiscount) : value;
  }

  return Math.min(Math.round(offer.discountValue), baseAmount);
}

export default function MultiCityCardDetailsPanel({
  flight,
  selectedFare,
  activeOffer,
  offerBaseAmount,
  activeTab = "flight",
  setActiveTab,
}: Props) {
  const openDetailedRules = () => {
    window.open("/fare-rules-details", "_blank");
  };

  const changeTab = (tab: DetailTab) => {
    if (setActiveTab) setActiveTab(tab);
  };

  const renderTabButton = (tab: DetailTab, label: string) => {
    const isActive = activeTab === tab;

    return (
      <button
        type="button"
        onClick={() => changeTab(tab)}
        className={`shrink-0 rounded-full px-3 py-2 text-[12px] font-black transition md:text-[13px] ${
          isActive
            ? "bg-slate-950 text-white shadow-sm"
            : "text-slate-600 hover:bg-white hover:text-slate-950"
        }`}
      >
        {label}
      </button>
    );
  };

  const renderTabContent = () => {
    if (activeTab === "flight") {
      return (
        <div className="px-3 py-4 sm:px-5 sm:py-5">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-[16px] font-black text-slate-950 sm:text-[18px]">
              {flight.fromCity} → {flight.toCity}
            </span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
              {flight.stopsText}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-[150px_1fr_130px_1fr] sm:items-center sm:gap-5 sm:p-4">
            <div className="rounded-2xl bg-slate-50 p-3">
              <div className="mb-2 h-10 w-10 rounded-xl bg-[#1d4ed8] shadow-sm" />
              <div className="text-[13px] font-black text-slate-950">
                {flight.flightNumber}
              </div>
              <div className="text-[12px] font-semibold text-slate-500">Economy</div>
              {flight.seatLeft ? (
                <div className="mt-2 inline-flex rounded-full bg-orange-50 px-2 py-1 text-[11px] font-bold text-orange-700">
                  CB: {flight.seatLeft} seats left
                </div>
              ) : null}
            </div>

            <div className="min-w-0">
              <div className="text-[20px] font-black leading-none text-slate-950">
                {flight.departureTime}
              </div>
              <div className="mt-2 text-[13px] font-semibold text-slate-700">
                {flight.fromCity}, {flight.fromCode}
              </div>
              <div className="text-[12px] text-slate-500">
                Departure sector
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-center">
              <div className="text-[12px] font-black uppercase tracking-[0.08em] text-slate-500">
                {flight.stopsText}
              </div>
              <div className="my-2 flex items-center gap-1">
                <div className="h-px flex-1 bg-slate-300" />
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <div className="h-px flex-1 bg-slate-300" />
              </div>
              <div className="text-[13px] font-black text-slate-900">{flight.duration}</div>
            </div>

            <div className="min-w-0 sm:text-right">
              <div className="text-[20px] font-black leading-none text-slate-950">
                {flight.arrivalTime}
              </div>
              <div className="mt-2 text-[13px] font-semibold text-slate-700">
                {flight.toCity}, {flight.toCode}
              </div>
              <div className="text-[12px] text-slate-500">
                Arrival sector
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "fare") {
      const displayBaseFare = Math.max(
        Number(offerBaseAmount || selectedFare.price || 0),
        0
      );
      const appliedOffer = calculateOfferDiscount(displayBaseFare, activeOffer);
      const baseAfterOffer = Math.max(displayBaseFare - appliedOffer, 0);

      return (
        <div className="px-3 py-4 sm:px-5 sm:py-5">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <div className="text-[15px] font-black text-slate-950">
                Fare Details for Adult
              </div>
              <div className="text-[11px] font-semibold text-slate-500">
                {selectedFare.label} · {selectedFare.subtitle}
              </div>
            </div>

            <div className="space-y-3 px-4 py-4 text-[13px] text-slate-700">
              <div className="flex items-center justify-between gap-4">
                <span>Base Fare</span>
                <span className="font-semibold text-slate-950">
                  ₹{displayBaseFare.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-emerald-700">
                <span>Offer Discount</span>
                <span className="font-semibold">
                  - ₹{appliedOffer.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between gap-4 text-[15px] font-black text-slate-950">
                  <span>Flight Price after offer</span>
                  <span>₹{baseAfterOffer.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-500 md:text-[12px]">
              Taxes & fees shown on booking page.
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "rules") {
      return (
        <div className="px-3 py-4 sm:px-5 sm:py-5">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={openDetailedRules}
              className="w-fit rounded-full bg-orange-50 px-3 py-1.5 text-[12px] font-black text-orange-700"
            >
              Detailed Rules
            </button>

            <div className="text-[12px] font-medium text-slate-700 sm:text-[13px]">
              Sorry, unable to fetch fare rules from airline. Please refer to detailed
              fare rules or contact customer service.
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="px-3 py-4 sm:px-5 sm:py-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400">Sector</div>
            <div className="mt-2 text-[13px] font-bold text-slate-950">
            {flight.fromCode}-{flight.toCode}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400">Check-in</div>
            <div className="mt-2 text-[13px] font-bold text-slate-950">{flight.baggage}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400">Cabin</div>
            <div className="mt-2 text-[13px] font-bold text-slate-950">Cabin baggage included</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 bg-slate-100/80 px-3 py-2 sm:px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {renderTabButton("flight", "Flight Details")}
        {renderTabButton("fare", "Fare Details")}
        {renderTabButton("rules", "Fare Rules")}
        {renderTabButton("baggage", "Baggage Information")}
      </div>

      {renderTabContent()}
    </div>
  );
}
