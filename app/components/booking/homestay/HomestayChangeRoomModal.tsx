"use client";

import { useMemo, useState } from "react";
import type { Homestay, RoomVariant } from "@/app/data/stays/types";
import { X, Users, Utensils, ShieldCheck, BedDouble } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  homestay: Homestay;
  selectedVariant: RoomVariant | null;
  onSelectRoom: (variant: RoomVariant) => void;
};

function formatPrice(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function HomestayChangeRoomModal({
  isOpen,
  onClose,
  homestay,
  selectedVariant,
  onSelectRoom,
}: Props) {
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const fallbackImages = useMemo(() => {
    if (homestay.images?.length && homestay.images.length > 0) {
      return homestay.images;
    }
    return [""];
  }, [homestay.images]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 px-4 py-6"
        onClick={onClose}
      >
        <div
          className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e5e7eb] bg-white px-5 py-4">
            <div>
              <div className="text-[22px] font-extrabold text-[#111827]">
                Change Stay Option
              </div>
              <div className="mt-1 text-[13px] font-medium text-[#6b7280]">
                Select the stay option that fits best for your homestay
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9e2ec] text-[#374151] transition hover:bg-[#f8fafc]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ROOM / STAY LIST */}
          <div className="space-y-4 p-5">
            {homestay.variants?.map((variant, index) => {
              const isSelected = selectedVariant?.id === variant.id;
              const cardImage =
                fallbackImages[index % fallbackImages.length] ||
                fallbackImages[0] ||
                "";

              return (
                <div
                  key={variant.id}
                  className={`overflow-hidden rounded-2xl border transition ${
                    isSelected
                      ? "border-[#0b74ff] bg-[#f8fbff] shadow-[0_8px_24px_rgba(11,116,255,0.10)]"
                      : "border-[#d9e2ec] bg-white"
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_220px]">
                    {/* IMAGE */}
                    <div className="border-b border-[#e5e7eb] bg-[#eef6ff] lg:border-b-0 lg:border-r">
                      <button
                        type="button"
                        onClick={() => {
                          if (cardImage) setZoomImage(cardImage);
                        }}
                        className="block h-full w-full"
                      >
                        {cardImage ? (
                          <img
                            src={cardImage}
                            alt={variant.name}
                            className="h-[180px] w-full cursor-zoom-in object-cover transition hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="flex h-[180px] w-full items-center justify-center text-sm font-semibold text-[#2563eb]">
                            Stay Image
                          </div>
                        )}
                      </button>
                    </div>

                    {/* DETAILS */}
                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-2 text-[21px] font-extrabold text-[#111827]">
                          <BedDouble className="h-5 w-5 text-[#0b74ff]" />
                          {variant.name}
                        </div>

                        {isSelected ? (
                          <span className="rounded-full bg-[#eafaf1] px-2.5 py-1 text-[11px] font-bold text-[#15803d]">
                            Current Selection
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md border border-[#d9e2ec] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#374151]">
                          <Users className="h-3.5 w-3.5 text-[#0b74ff]" />
                          {variant.maxAdults} Adults
                          {variant.maxChildren > 0
                            ? `, ${variant.maxChildren} Children`
                            : ""}
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-md border border-[#d9e2ec] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#374151]">
                          <Utensils className="h-3.5 w-3.5 text-[#0b74ff]" />
                          {variant.mealPlan}
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-md border border-[#d9e2ec] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#374151]">
                          <ShieldCheck className="h-3.5 w-3.5 text-[#0b74ff]" />
                          {variant.cancellation}
                        </span>
                      </div>

                      {variant.amenities?.length ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {variant.amenities.map((item) => (
                            <span
                              key={item}
                              className="rounded-md border border-[#dbeafe] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#1f4b99]"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {variant.availableRooms ? (
                        <div className="mt-4 inline-block rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] font-bold text-[#dc2626]">
                          Only {variant.availableRooms} stay option
                          {variant.availableRooms > 1 ? "s" : ""} left
                        </div>
                      ) : null}
                    </div>

                    {/* PRICE */}
                    <div className="border-t border-[#e5e7eb] bg-white p-5 lg:border-l lg:border-t-0">
                      <div className="text-[12px] font-bold uppercase tracking-wide text-[#6b7280]">
                        Stay Price / Night
                      </div>

                      <div className="mt-2 text-[30px] font-extrabold leading-none text-[#111827]">
                        {formatPrice(variant.price)}
                      </div>

                      <div className="mt-2 text-[14px] font-medium text-[#6b7280]">
                        + {formatPrice(variant.taxes)} taxes & fees
                      </div>

                      <div className="mt-4 rounded-lg bg-[#f8fbff] px-3 py-2 text-[13px] font-semibold text-[#1f4b99]">
                        Fare summary updates instantly after stay selection.
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectRoom(variant);
                          onClose();
                        }}
                        className={`mt-5 h-[46px] w-full rounded-xl text-[14px] font-extrabold transition ${
                          isSelected
                            ? "border border-[#0b74ff] bg-[#eef6ff] text-[#0b74ff]"
                            : "bg-[#0b74ff] text-white hover:opacity-95"
                        }`}
                      >
                        {isSelected ? "Selected Stay" : "Select This Stay"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* IMAGE ZOOM */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/85 px-4 py-6"
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            alt="Zoomed stay"
            className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </>
  );
}