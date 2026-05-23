"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Camera,
  FileText,
  LayoutGrid,
  Shield,
  Ship,
} from "lucide-react";
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
    <div className="space-y-4">
      <CruiseShipPreviewInfoTabs activeTab={infoTab} onChange={setInfoTab} />

      {infoTab === "gallery" && (
        <div className="grid grid-cols-[minmax(0,1fr)_280px] gap-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="relative h-[420px] w-full">
              <Image
                src={galleryImages[0]}
                alt={item.shipName}
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {galleryImages.map((img, index) => (
              <div
                key={`${img}-${index}`}
                className="relative h-[98px] overflow-hidden rounded-xl border border-slate-200"
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
        <div className="rounded-2xl border border-slate-200 p-5 text-[15px] text-slate-800">
          {item.shipName} by {item.cruiseLine}. Premium onboard experiences,
          entertainment, dining and route highlights.
        </div>
      )}

      {infoTab === "deckPlans" && (
        <div className="rounded-2xl border border-slate-200 p-5 text-[15px] text-slate-800">
          Deck plans will be shown here.
        </div>
      )}

      {infoTab === "staterooms" && (
        <div className="rounded-2xl border border-slate-200 p-5 text-[15px] text-slate-800">
          Stateroom categories and details will be shown here.
        </div>
      )}

      {infoTab === "shipFacts" && (
        <div className="rounded-2xl border border-slate-200 p-5 text-[15px] text-slate-800">
          Ship facts, amenities, tonnage, guest capacity and service details
          will be shown here.
        </div>
      )}
    </div>
  );
}