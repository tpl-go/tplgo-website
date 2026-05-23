"use client";

import { useMemo, useRef, useState } from "react";
import OfferCard from "./OfferCard";
import OfferTabs from "./OfferTabs";
import useAutoScroll from "./useAutoScroll";

import { SMART_OFFERS_DATA } from "@/app/lib/smartOffers";

function getOfferType(service: string, offerType: string) {
  if (offerType === "membership") return "membership";
  if (service === "holiday") return "holiday";
  return service;
}

function mapOffer(offer: any) {
  return {
    img: "",
    type: getOfferType(offer.service, offer.offerType),
    title: offer.title,
    desc: offer.subtitle || offer.description || "Smart travel offer",
    smartOfferSlug: offer.slug,
    smartOfferCode: offer.couponCode || "",
  };
}

export default function SpecialOffersStrip() {
  const scrollRef = useRef<any>(null);
  const pauseRef = useRef(false);
  const [activeTab, setActiveTab] = useState("all");

  const allOffers = useMemo(() => {
    return SMART_OFFERS_DATA.filter((offer) => offer.active && offer.featured)
      .map(mapOffer)
      .slice(0, 40);
  }, []);

  const fallbackOffers = useMemo(() => {
    return SMART_OFFERS_DATA.filter(
      (offer) =>
        offer.active &&
        (offer.service === "all" ||
          offer.offerType === "membership" ||
          offer.featured)
    )
      .map(mapOffer)
      .slice(0, 25);
  }, []);

  const filtered = useMemo(() => {
    if (activeTab === "all") return allOffers;

    const list = allOffers.filter((offer) => offer.type === activeTab);

    if (list.length > 0) return list;

    return fallbackOffers;
  }, [activeTab, allOffers, fallbackOffers]);

  const minLoop = 8;
  let loopData = [...filtered];

  while (loopData.length < minLoop && filtered.length > 0) {
    loopData = [...loopData, ...filtered];
  }

  useAutoScroll(scrollRef, pauseRef, activeTab);

  return (
    <div
      className="relative mt-2 w-full rounded-3xl bg-cover bg-center px-8 py-6"
      style={{ backgroundImage: "url('/bg/offerbg.jpg')" }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-black/10"></div>

      <div className="relative z-10 mb-7 flex items-center justify-between gap-5">
        <OfferTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex-1 text-center">
          <h2 className="text-4xl font-black text-white drop-shadow">
            Special Offers
          </h2>
          <p className="mt-1 text-sm font-semibold text-white/80">
            Smart deals matched from TPL master offer engine
          </p>
        </div>

        <div className="w-[260px] text-right text-xs font-bold text-white/80">
          {activeTab === "all"
            ? "Showing all active offers"
            : `Showing ${activeTab} offers`}
        </div>
      </div>

      <div
        ref={scrollRef}
        data-pause="true"
        className="offer-scroll flex gap-6 overflow-x-hidden pb-3"
      >
        {loopData.map((o, i) => (
          <OfferCard key={`${o.smartOfferSlug}-${activeTab}-${i}`} o={o} />
        ))}
      </div>
    </div>
  );
}