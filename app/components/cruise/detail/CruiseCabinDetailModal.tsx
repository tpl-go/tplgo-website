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
    <div className="fixed inset-0 z-[140] flex items-end justify-center bg-black/45 p-0 md:items-center md:p-4">
      <div className="relative flex max-h-[92dvh] w-full max-w-[980px] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl md:max-h-[88vh] md:rounded-[24px] md:p-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-white/95 p-2 text-gray-700 shadow-sm hover:bg-gray-100 md:right-5 md:top-5 md:bg-transparent md:shadow-none"
        >
          <X size={22} />
        </button>

        <div className="min-h-0 overflow-y-auto p-4 md:p-0">
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="relative col-span-12 md:col-span-6">
            <img
              src={currentImage?.url}
              alt={currentImage?.alt || cabin.name}
              className="h-[240px] w-full rounded-2xl object-cover sm:h-[300px] md:h-[360px]"
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

          <div className="col-span-12 pr-0 md:col-span-6 md:pr-4">
            <h3 className="text-[20px] font-black text-gray-900 md:text-[22px] md:font-semibold">
              {cabin.name}
            </h3>

            <p className="mt-3 text-[14px] font-medium leading-6 text-gray-700 md:text-[17px] md:font-normal md:leading-8">
              {cabin.fullDescription}
            </p>

            <div className="mt-5 text-[18px] font-black text-gray-900 md:mt-6 md:text-[24px] md:font-semibold">
              Amenities
            </div>

            <div className="mt-3 flex flex-wrap gap-2 md:mt-4 md:gap-3">
              {cabin.amenities.map((amenity) => (
                <div
                  key={amenity.id}
                  className="rounded-full bg-sky-50 px-3 py-2 text-xs font-bold text-gray-800 md:px-4 md:text-sm md:font-medium"
                >
                  {amenity.label}
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
