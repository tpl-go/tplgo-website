"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { CruiseCabinType } from "@/app/lib/cruise/cruiseDetailTypes";

type Props = {
  open: boolean;
  cabin: CruiseCabinType | null;
  onClose: () => void;
};

export default function CruiseCabinDetailModal({
  open,
  cabin,
  onClose,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!open || !cabin) return null;

  const currentImage = cabin.images[activeIndex] || cabin.images[0];

  const goPrev = () => {
    setActiveIndex((prev) =>
      prev === 0 ? cabin.images.length - 1 : prev - 1
    );
  };

  const goNext = () => {
    setActiveIndex((prev) =>
      prev === cabin.images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/45 p-4">
      <div className="relative w-full max-w-[980px] rounded-[24px] bg-white p-5 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-gray-700 hover:bg-gray-100"
        >
          <X size={22} />
        </button>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-6 relative">
            <img
              src={currentImage?.url}
              alt={currentImage?.alt || cabin.name}
              className="h-[360px] w-full rounded-2xl object-cover"
            />

            {cabin.images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            ) : null}
          </div>

          <div className="col-span-12 md:col-span-6 pr-4">
            <h3 className="text-[22px] font-semibold text-gray-900">
              {cabin.name}
            </h3>

            <p className="mt-3 text-[17px] leading-8 text-gray-700">
              {cabin.fullDescription}
            </p>

            <div className="mt-6 text-[24px] font-semibold text-gray-900">
              Amenities
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {cabin.amenities.map((amenity) => (
                <div
                  key={amenity.id}
                  className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-gray-800"
                >
                  {amenity.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}