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
    <div className="fixed inset-0 z-[145] flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-[760px] rounded-[22px] bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-gray-700 hover:bg-gray-100"
        >
          <X size={20} />
        </button>

        <h3 className="text-[24px] font-semibold text-gray-900">
          {cabin.name} Amenities
        </h3>

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          {cabin.amenities.map((amenity) => (
            <div
              key={amenity.id}
              className="rounded-xl border bg-slate-50 px-4 py-3 text-base font-medium text-gray-800"
            >
              {amenity.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}