"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Wallet,
  CreditCard,
  CalendarDays,
  Crown,
  Sparkles,
} from "lucide-react";

import {
  buildFlightSmartOfferContext,
  buildSmartOfferCards,
  SmartOfferCard,
} from "@/app/lib/smartOffers";

type OfferCard = {
  id: string;
  variant:
    | "applied"
    | "bank"
    | "wallet"
    | "membership"
    | "date"
    | "generic";

  title: string;
  subtitle?: string;
  description?: string;
};

type FlightsOffersStripProps = {
  tripType?: "oneway" | "roundtrip" | "multicity";
  fromCity?: string;
  toCity?: string;
  isInternational?: boolean;
  offers?: OfferCard[];
};

function buildSafeDefaultCards({
  tripType,
  toCity,
  isInternational,
}: {
  tripType: string;
  toCity?: string;
  isInternational: boolean;
}): SmartOfferCard[] {
  return [
    {
      id: "safe-generic",
      variant: "generic",
      title: isInternational
        ? "AI International Offers"
        : "AI Smart Offers",
      description: isInternational
        ? "International deals auto-matched"
        : "Best flight offers auto-matched",
    },
    {
      id: "safe-bank",
      variant: "bank",
      title: isInternational
        ? "Save ₹3200 with ICICI"
        : "Save ₹1200 with ICICI",
      description: isInternational
        ? "International payment combo detected"
        : "Hidden bank deal available",
    },
    {
      id: "safe-wallet",
      variant: "wallet",
      title: isInternational
        ? "Use ₹1200 Wallet"
        : "Use ₹450 Wallet",
      description: "Apply TPL Credit at payment",
    },
    {
      id: "safe-date",
      variant: "date",
      title:
        tripType === "roundtrip"
          ? "Wednesday return cheaper"
          : isInternational
          ? `${toCity || "International"} fares cheaper`
          : `${toCity || "Destination"} cheaper on Tuesday`,
      description: isInternational
        ? "Save upto ₹4800"
        : "Save upto ₹900",
    },
  ];
}

export default function FlightsOffersStrip({
  tripType = "oneway",
  fromCity,
  toCity,
  isInternational = false,
  offers,
}: FlightsOffersStripProps) {
  const [mounted, setMounted] =
    useState(false);

  const [refreshKey, setRefreshKey] =
    useState(0);

  useEffect(() => {
    setMounted(true);

    const update = () => {
      setRefreshKey((value) => value + 1);
    };

    window.addEventListener(
      "TPL_SMART_OFFER_UPDATED",
      update
    );

    return () => {
      window.removeEventListener(
        "TPL_SMART_OFFER_UPDATED",
        update
      );
    };
  }, []);

  const smartContext = useMemo(() => {
    return buildFlightSmartOfferContext({
      tripType,
      fromCity,
      toCity,
      isInternational,
    });
  }, [
    tripType,
    fromCity,
    toCity,
    isInternational,
  ]);

  const resolvedOffers: OfferCard[] =
    useMemo(() => {
      if (offers) return offers;

      const cards = mounted
        ? buildSmartOfferCards(
            smartContext
          ).cards
        : buildSafeDefaultCards({
            tripType,
            toCity,
            isInternational,
          });

      return cards.map((card) => ({
        id: card.id,
        variant:
          card.variant as OfferCard["variant"],
        title: card.title,
        subtitle: card.subtitle,
        description: card.description,
      }));
    }, [
      offers,
      mounted,
      refreshKey,
      smartContext,
      tripType,
      toCity,
      isInternational,
    ]);

  return (
    <div className="grid grid-cols-1 gap-2 lg:grid-cols-[1.45fr_1fr_1fr_1fr]">
      {resolvedOffers.map((offer) => {
        if (
          offer.variant === "applied" ||
          offer.variant === "generic"
        ) {
          const isApplied =
            offer.variant ===
            "applied";

          return (
            <div
              key={offer.id}
              className="
rounded-2xl
border border-[#295fd6]
bg-gradient-to-r
from-[#081a46]
via-[#10327c]
to-[#1a4fb8]
shadow-md
shadow-blue-900/20
"
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <div
                  className="
flex h-10 w-10
items-center justify-center
rounded-xl
bg-white/10
border border-white/10
flex-shrink-0
"
                >
                  <Sparkles className="h-5 w-5 text-white" />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div
                      className="
rounded-full
bg-white/15
px-2 py-1
text-[9px]
font-black
uppercase
tracking-wider
text-white
leading-none
"
                    >
                      {isApplied
                        ? "AI Activated"
                        : "AI Matching"}
                    </div>
                  </div>

                  <div className="mt-1 text-[14px] font-black leading-tight text-white">
                    {offer.title}
                  </div>

                  <div className="mt-0.5 text-[11px] leading-tight text-blue-100">
                    {offer.description}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (offer.variant === "bank") {
          return (
            <div
              key={offer.id}
              className="
rounded-2xl
border border-[#e5ecff]
bg-white
shadow-sm
transition
hover:shadow-md
"
            >
              <div className="flex items-center gap-3 px-3 py-3">
                <div
                  className="
flex h-9 w-9
items-center justify-center
rounded-xl
bg-[#7c2d12]
text-white
flex-shrink-0
"
                >
                  <CreditCard className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <div className="text-[13px] font-bold leading-tight text-[#111827]">
                    {offer.title}
                  </div>

                  <div className="mt-0.5 text-[11px] leading-tight text-[#6b7280]">
                    {offer.description}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (offer.variant === "wallet") {
          return (
            <div
              key={offer.id}
              className="
rounded-2xl
border border-[#e5ecff]
bg-white
shadow-sm
transition
hover:shadow-md
"
            >
              <div className="flex items-center gap-3 px-3 py-3">
                <div
                  className="
flex h-9 w-9
items-center justify-center
rounded-xl
bg-[#10327c]
text-white
flex-shrink-0
"
                >
                  <Wallet className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <div className="text-[13px] font-bold leading-tight text-[#111827]">
                    {offer.title}
                  </div>

                  <div className="mt-0.5 text-[11px] leading-tight text-[#6b7280]">
                    {offer.description}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div
            key={offer.id}
            className="
rounded-2xl
border border-[#e5ecff]
bg-white
shadow-sm
transition
hover:shadow-md
"
          >
            <div className="flex items-center gap-3 px-3 py-3">
              <div
                className="
flex h-9 w-9
items-center justify-center
rounded-xl
bg-[linear-gradient(135deg,#dbeafe,#93c5fd)]
text-[#10327c]
flex-shrink-0
"
              >
                {offer.variant ===
                "membership" ? (
                  <Crown className="h-4 w-4" />
                ) : (
                  <CalendarDays className="h-4 w-4" />
                )}
              </div>

              <div className="min-w-0">
                <div className="text-[13px] font-bold leading-tight text-[#111827]">
                  {offer.title}
                </div>

                <div className="mt-0.5 text-[11px] leading-tight text-[#6b7280]">
                  {offer.description}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}