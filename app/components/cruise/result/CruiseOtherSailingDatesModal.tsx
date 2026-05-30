"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type {
  CruiseInfoItem,
  CruiseResultItem,
} from "@/app/lib/cruise/cruiseResultTypes";
import CruiseInfoPopup from "./CruiseInfoPopup";
import CruiseOtherSailingDatesTable from "./CruiseOtherSailingDatesTable";

type Props = {
  open: boolean;
  onClose: () => void;
  item: CruiseResultItem;
  onOpenMainPreview: (tab?: "itinerary" | "otherDates") => void;
};

export default function CruiseOtherSailingDatesModal({
  open,
  onClose,
  item,
  onOpenMainPreview,
}: Props) {
  const [activeInfo, setActiveInfo] = useState<CruiseInfoItem | null>(null);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[115] h-[100dvh] overflow-hidden bg-black/45 md:hidden">
        <div className="absolute inset-x-0 bottom-0 flex h-[90dvh] max-h-[90dvh] min-h-0 flex-col overflow-hidden rounded-t-[30px] bg-white shadow-[0_-18px_44px_rgba(15,23,42,0.24)]">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-20 rounded-full bg-white p-2 text-slate-700 shadow-lg ring-1 ring-slate-200"
            aria-label="Close other sailing dates"
          >
            <X size={18} />
          </button>

          <div className="shrink-0 border-b border-slate-200 bg-white px-4 pb-4 pt-5 pr-16">
            <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-sky-700">
              Sailing Options
            </div>

            <div className="mt-3 text-[20px] font-black uppercase leading-6 tracking-tight text-slate-900">
              Other Sailing Dates
            </div>

            <div className="mt-1 line-clamp-2 text-[13px] font-semibold leading-5 text-slate-500">
              {item.shipName} • {item.tripLabel}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50 px-3 pb-[calc(env(safe-area-inset-bottom)+18px)] pt-3">
            <CruiseOtherSailingDatesTable
              item={item}
              onOpenInfo={setActiveInfo}
              onOpenItinerary={(row) => {
                onOpenMainPreview("itinerary");
              }}
            />
          </div>
        </div>
      </div>

      <div className="fixed inset-0 z-[115] hidden items-center justify-center bg-black/45 p-4 md:flex">
        <div className="relative w-full max-w-[1180px] overflow-hidden rounded-[22px] bg-white shadow-2xl">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-20 rounded-full bg-slate-100 p-2 text-slate-700 transition hover:bg-slate-200"
          >
            <X size={18} />
          </button>

          <div className="border-b border-slate-200 px-6 py-5">
            <div className="text-[20px] font-bold uppercase tracking-tight text-slate-900">
              OTHER SAILING DATES
            </div>
            <div className="mt-1 text-sm text-slate-500">
              {item.shipName} • {item.tripLabel}
            </div>
          </div>

          <div className="max-h-[78vh] overflow-y-auto p-4">
            <CruiseOtherSailingDatesTable
              item={item}
              onOpenInfo={setActiveInfo}
              onOpenItinerary={(row) => {
                onOpenMainPreview("itinerary");
              }}
            />
          </div>
        </div>
      </div>

      <div className="relative z-[160]">
        <CruiseInfoPopup
          open={!!activeInfo}
          item={activeInfo}
          onClose={() => setActiveInfo(null)}
        />
      </div>
    </>
  );
}
