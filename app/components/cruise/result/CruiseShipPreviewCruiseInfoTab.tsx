"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { CruiseResultItem } from "@/app/lib/cruise/cruiseResultTypes";
import CruiseShipPreviewInfoTabs from "./CruiseShipPreviewInfoTabs";

type Props = {
  item: CruiseResultItem;
};

type InfoTab = "shipInfo" | "gallery" | "deckPlans" | "staterooms" | "shipFacts";

export default function CruiseShipPreviewCruiseInfoTab({ item }: Props) {
  const [infoTab, setInfoTab] = useState<InfoTab>("gallery");

  const galleryImages = useMemo(() => {
    return [
      item.mapImage,
      item.mapImage,
      item.mapImage,
      item.mapImage,
      item.mapImage,
      item.mapImage,
      item.mapImage,
      item.mapImage,
    ];
  }, [item.mapImage]);

  return (
    <div className="space-y-3 md:space-y-4">
      <CruiseShipPreviewInfoTabs activeTab={infoTab} onChange={setInfoTab} />

      {infoTab === "gallery" && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_280px] md:gap-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:shadow-none">
            <div className="relative h-[220px] w-full sm:h-[280px] md:h-[420px]">
              <Image
                src={galleryImages[0]}
                alt={item.shipName}
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 md:grid-cols-2">
            {galleryImages.map((img, index) => (
              <div
                key={`${img}-${index}`}
                className="relative h-[64px] overflow-hidden rounded-xl border border-slate-200 bg-white sm:h-[78px] md:h-[98px]"
              >
                <Image
                  src={img}
                  alt={`${item.shipName}-${index}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {infoTab === "shipInfo" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-[14px] leading-6 text-slate-800 shadow-sm md:p-5 md:text-[15px] md:shadow-none">
          {item.shipName} by {item.cruiseLine}. Premium onboard experiences,
          entertainment, dining and route highlights.
        </div>
      )}

      {infoTab === "deckPlans" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-[14px] leading-6 text-slate-800 shadow-sm md:p-5 md:text-[15px] md:shadow-none">
          Deck plans will be shown here.
        </div>
      )}

      {infoTab === "staterooms" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-[14px] leading-6 text-slate-800 shadow-sm md:p-5 md:text-[15px] md:shadow-none">
          Cabin categories and details will be shown here.
        </div>
      )}

      {infoTab === "shipFacts" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-[14px] leading-6 text-slate-800 shadow-sm md:p-5 md:text-[15px] md:shadow-none">
          Ship facts, amenities, tonnage, guest capacity and service details
          will be shown here.
        </div>
      )}
    </div>
  );
}
