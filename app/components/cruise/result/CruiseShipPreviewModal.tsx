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

const mobileTabOptions: { key: CruisePreviewMainTab; label: string }[] = [
  { key: "itinerary", label: "Itinerary" },
  { key: "otherDates", label: "Other Sailing Dates" },
  { key: "cruiseInfo", label: "Cruise Info" },
  { key: "deckPlan", label: "Deck Plan" },
  { key: "policies", label: "Policies" },
];

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

  const activeMobileLabel =
    mobileTabOptions.find((tab) => tab.key === mainTab)?.label || "Itinerary";

  return (
    <>
      <div className="fixed inset-0 z-[120] h-[100dvh] overflow-hidden bg-black/45 md:hidden">
        <div className="absolute inset-x-0 bottom-0 flex h-[92dvh] max-h-[92dvh] min-h-0 flex-col overflow-hidden rounded-t-[30px] bg-white shadow-[0_-18px_44px_rgba(15,23,42,0.24)]">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-30 rounded-full bg-white p-2 text-slate-700 shadow-lg ring-1 ring-slate-200"
            aria-label="Close cruise preview"
          >
            <X size={18} />
          </button>

          <div className="shrink-0 border-b border-slate-200 bg-white">
            <CruiseShipPreviewHeader item={item} />

            <div className="px-4 pb-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                  View section
                </label>

                <select
                  value={mainTab}
                  onChange={(event) =>
                    setMainTab(event.target.value as CruisePreviewMainTab)
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-[14px] font-extrabold text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                >
                  {mobileTabOptions.map((tab) => (
                    <option key={tab.key} value={tab.key}>
                      {tab.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50 px-3 pb-[calc(env(safe-area-inset-bottom)+18px)] pt-3">
            <div className="mb-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                Showing
              </div>
              <div className="mt-1 text-[16px] font-black text-slate-900">
                {activeMobileLabel}
              </div>
            </div>

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

      <div className="fixed inset-0 z-[120] hidden items-center justify-center bg-black/45 p-4 md:flex">
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
    </>
  );
}
