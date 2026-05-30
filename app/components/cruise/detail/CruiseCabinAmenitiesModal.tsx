"use client";

import { X } from "lucide-react";
import type { CruiseCabinType } from "@/app/lib/cruise/cruiseDetailTypes";

type Props = {
  open: boolean;
  cabin: CruiseCabinType | null;
  onClose: () => void;
};

export default function CruiseCabinAmenitiesModal({
  open,
  cabin,
  onClose,
}: Props) {
  if (!open || !cabin) return null;

  return (
    <div className="fixed inset-0 z-[145] flex items-end justify-center bg-black/40 p-0 md:items-center md:p-4">
      <div className="relative flex max-h-[88dvh] w-full max-w-[760px] flex-col overflow-hidden rounded-t-[26px] bg-white shadow-2xl md:rounded-[22px] md:p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-slate-100 p-2 text-gray-700 hover:bg-gray-100 md:right-5 md:top-5"
        >
          <X size={20} />
        </button>

        <div className="shrink-0 border-b border-slate-100 px-4 py-4 pr-14 md:border-0 md:p-0 md:pr-14">
          <h3 className="text-[20px] font-black text-gray-900 md:text-[24px] md:font-semibold">
            {cabin.name} Amenities
          </h3>
        </div>

        <div className="min-h-0 overflow-y-auto px-4 py-4 md:mt-6 md:grid md:grid-cols-2 md:gap-3 md:overflow-visible md:p-0">
          {cabin.amenities.map((amenity) => (
            <div
              key={amenity.id}
              className="mb-3 rounded-xl border bg-slate-50 px-4 py-3 text-sm font-bold text-gray-800 last:mb-0 md:mb-0 md:text-base md:font-medium"
            >
              {amenity.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
