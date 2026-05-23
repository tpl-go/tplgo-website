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
      <div className="fixed inset-0 z-[115] flex items-center justify-center bg-black/45 p-4">
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