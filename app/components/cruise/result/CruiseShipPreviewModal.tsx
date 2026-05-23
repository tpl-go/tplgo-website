"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { CruiseResultItem } from "@/app/lib/cruise/cruiseResultTypes";
import CruiseShipPreviewHeader from "./CruiseShipPreviewHeader";
import CruiseShipPreviewMainTabs from "./CruiseShipPreviewMainTabs";
import CruiseShipPreviewItineraryTab from "./CruiseShipPreviewItineraryTab";
import CruiseShipPreviewOtherDatesTab from "./CruiseShipPreviewOtherDatesTab";
import CruiseShipPreviewCruiseInfoTab from "./CruiseShipPreviewCruiseInfoTab";
import CruiseShipPreviewPoliciesTab from "./CruiseShipPreviewPoliciesTab";
import CruiseDeckPlanTab from "./CruiseDeckPlanTab";
import { cruiseDeckPlansSeed } from "@/app/lib/cruise/cruiseDeckPlanData";

type Props = {
  open: boolean;
  onClose: () => void;
  item: CruiseResultItem;
};

export type CruisePreviewMainTab =
  | "itinerary"
  | "otherDates"
  | "cruiseInfo"
  | "deckPlan"
  | "policies";

export default function CruiseShipPreviewModal({
  open,
  onClose,
  item,
}: Props) {
  const [mainTab, setMainTab] = useState<CruisePreviewMainTab>("itinerary");

  useEffect(() => {
    if (open) {
      setMainTab("itinerary");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4">
      <div className="relative h-[88vh] w-full max-w-[1180px] overflow-hidden rounded-[22px] bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-slate-100 p-2 text-slate-700 transition hover:bg-slate-200"
        >
          <X size={18} />
        </button>

        <CruiseShipPreviewHeader item={item} />

        <div className="flex h-[calc(88vh-88px)] flex-col overflow-hidden">
          <CruiseShipPreviewMainTabs
            activeTab={mainTab}
            onChange={setMainTab}
          />

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {mainTab === "itinerary" && (
              <CruiseShipPreviewItineraryTab item={item} />
            )}

            {mainTab === "otherDates" && (
              <CruiseShipPreviewOtherDatesTab item={item} />
            )}

            {mainTab === "cruiseInfo" && (
              <CruiseShipPreviewCruiseInfoTab item={item} />
            )}

            {mainTab === "deckPlan" && (
              <CruiseDeckPlanTab
                deckPlans={cruiseDeckPlansSeed}
                mode="view"
              />
            )}

            {mainTab === "policies" && (
              <CruiseShipPreviewPoliciesTab />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}