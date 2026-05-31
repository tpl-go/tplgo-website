"use client";

import { useMemo, useState } from "react";
import type { Homestay, RoomVariant } from "@/app/data/stays/types";
import HomestayChangeRoomModal from "./HomestayChangeRoomModal";
import {
  BedDouble,
  CalendarDays,
  Users,
  Clock3,
  ShieldCheck,
  Utensils,
  BadgeCheck,
  Sparkles,
} from "lucide-react";

type Props = {
  homestay: Homestay;
  selectedVariant: RoomVariant | null;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  onRoomChange: (variant: RoomVariant) => void;
  offerDiscount?: number;
};

function formatDateValue(dateStr: string) {
  if (!dateStr) return "Not selected";

  const date = parseLocalDate(dateStr);
  if (!date) return dateStr;

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function calculateNights(checkIn: string, checkOut: string) {
  const start = parseLocalDate(checkIn);
  const end = parseLocalDate(checkOut);

  if (!start || !end) return 1;

  const diff = end.getTime() - start.getTime();
  const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 1;
}

function parseLocalDate(value: string) {
  if (!value) return null;
  const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = parts
    ? new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
    : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getStayTypeLabel(value: Homestay["stayType"]) {
  switch (value) {
    case "entire_home":
      return "Entire Home";
    case "private_room":
      return "Private Room";
    case "shared":
      return "Shared Stay";
    default:
      return "Homestay";
  }
}

export default function HomestayBookingHomestayDetailSection({
  homestay,
  selectedVariant,
  checkIn,
  checkOut,
  rooms,
  adults,
  onRoomChange,
  offerDiscount = 0,
}: Props) {
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const nights = useMemo(() => {
    return calculateNights(checkIn, checkOut);
  }, [checkIn, checkOut]);

  const activeVariant = selectedVariant || homestay.variants?.[0] || null;

  const discountedStayPrice = activeVariant
    ? Math.max(
        activeVariant.price - offerDiscount / Math.max(rooms * nights, 1),
        0
      )
    : 0;

  const galleryImages = useMemo(() => {
    if (homestay.images?.length && homestay.images.length >= 4) {
      return homestay.images;
    }

    return [
      homestay.images?.[0] || "",
      homestay.images?.[1] || homestay.images?.[0] || "",
      homestay.images?.[2] || homestay.images?.[0] || "",
      homestay.images?.[3] || homestay.images?.[0] || "",
    ].filter(Boolean);
  }, [homestay.images]);

  return (
    <>
      <div className="rounded-xl border border-[#d9e2ec] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="border-b border-[#e5e7eb] p-3 md:p-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_240px]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[21px] font-extrabold leading-tight text-[#111827] md:text-[28px]">
                  {homestay.title}
                </h1>

                <span className="rounded-full bg-[#eafaf1] px-2.5 py-1 text-[11px] font-bold text-[#15803d]">
                  TPL Assured
                </span>

                <span className="rounded-md border border-[#d9e2ec] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#374151]">
                  {getStayTypeLabel(homestay.stayType)}
                </span>
              </div>

              <div className="mt-2 text-[13px] font-semibold text-[#0b74ff] md:text-[14px]">
                {homestay.area}, {homestay.city}
              </div>

              {!!homestay.locationHighlights?.length && (
                <div className="mt-2 text-[12px] font-medium leading-5 text-[#4b5563] md:text-[13px]">
                  {homestay.locationHighlights.join(" • ")}
                </div>
              )}

              {homestay.description ? (
                <p className="mt-3 max-w-4xl text-[13px] leading-6 text-[#4b5563] md:text-[14px]">
                  {homestay.description}
                </p>
              ) : null}

              {!!homestay.scenicTags?.length && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {homestay.scenicTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-[#dbeafe] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#1f4b99]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowGalleryModal(true)}
                className="block w-full overflow-hidden rounded-xl border border-[#d9e2ec] bg-[#eef6ff] transition hover:shadow-md"
              >
                {homestay.images?.[0] ? (
                  <img
                    src={homestay.images[0]}
                    alt={homestay.title}
                    className="h-[180px] w-full object-cover md:h-[140px]"
                  />
                ) : (
                  <div className="flex h-[180px] w-full items-center justify-center text-sm font-semibold text-[#2563eb] md:h-[140px]">
                    Homestay Image
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowGalleryModal(true)}
                className="mt-2 text-[12px] font-bold text-[#0b74ff] hover:underline"
              >
                View All Photos
              </button>
            </div>
          </div>
        </div>

        <div className="border-b border-[#e5e7eb] p-3 md:p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-[#f8fbff] p-3">
              <div className="flex items-center gap-2 text-[12px] font-bold uppercase text-[#6b7280]">
                <CalendarDays className="h-4 w-4 text-[#0b74ff]" />
                Check-In
              </div>
              <div className="mt-1 text-[15px] font-bold text-[#111827]">
                {formatDateValue(checkIn)}
              </div>
            </div>

            <div className="rounded-lg bg-[#f8fbff] p-3">
              <div className="flex items-center gap-2 text-[12px] font-bold uppercase text-[#6b7280]">
                <CalendarDays className="h-4 w-4 text-[#0b74ff]" />
                Check-Out
              </div>
              <div className="mt-1 text-[15px] font-bold text-[#111827]">
                {formatDateValue(checkOut)}
              </div>
            </div>

            <div className="rounded-lg bg-[#f8fbff] p-3">
              <div className="flex items-center gap-2 text-[12px] font-bold uppercase text-[#6b7280]">
                <Users className="h-4 w-4 text-[#0b74ff]" />
                Rooms & Guests
              </div>
              <div className="mt-1 text-[15px] font-bold text-[#111827]">
                {rooms} Room{rooms > 1 ? "s" : ""}, {adults} Adult
                {adults > 1 ? "s" : ""}
              </div>
            </div>

            <div className="rounded-lg bg-[#f8fbff] p-3">
              <div className="flex items-center gap-2 text-[12px] font-bold uppercase text-[#6b7280]">
                <Clock3 className="h-4 w-4 text-[#0b74ff]" />
                Duration
              </div>
              <div className="mt-1 text-[15px] font-bold text-[#111827]">
                {nights} Night{nights > 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 md:p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
            <div className="text-[20px] font-extrabold text-[#111827] md:text-[22px]">
              Selected Stay Option
            </div>

            {homestay.variants?.length > 0 && (
              <button
                type="button"
                onClick={() => setShowRoomModal(true)}
                className="h-10 rounded-lg border border-[#0b74ff] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#0b74ff] transition hover:bg-[#eef6ff] md:py-2"
              >
                Change Stay
              </button>
            )}
          </div>

          {activeVariant ? (
            <div className="overflow-hidden rounded-2xl border border-[#bfdbfe] bg-gradient-to-br from-[#f8fbff] via-white to-[#eef6ff] shadow-[0_8px_24px_rgba(11,116,255,0.08)]">
              <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.85fr]">
                <div className="p-3 md:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-2 text-[18px] font-extrabold text-[#111827] md:text-[22px]">
                      <BedDouble className="h-5 w-5 text-[#0b74ff]" />
                      {activeVariant.name}
                    </div>

                    <span className="rounded-full bg-[#eafaf1] px-2.5 py-1 text-[11px] font-bold text-[#15803d]">
                      Selected
                    </span>

                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#1f4b99] shadow-sm">
                      Best Available
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md border border-[#d9e2ec] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#374151]">
                      <Users className="h-3.5 w-3.5 text-[#0b74ff]" />
                      {activeVariant.maxAdults} Adults
                      {activeVariant.maxChildren > 0
                        ? `, ${activeVariant.maxChildren} Children`
                        : ""}
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-md border border-[#d9e2ec] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#374151]">
                      <Utensils className="h-3.5 w-3.5 text-[#0b74ff]" />
                      {activeVariant.mealPlan}
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-md border border-[#d9e2ec] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#374151]">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#0b74ff]" />
                      {activeVariant.cancellation}
                    </span>
                  </div>

                  {activeVariant.amenities?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {activeVariant.amenities.map((item) => (
                        <span
                          key={item}
                          className="rounded-md border border-[#dbeafe] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#1f4b99]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-white bg-white/90 p-3 shadow-sm">
                      <div className="flex items-center gap-2 text-[13px] font-bold text-[#111827]">
                        <BadgeCheck className="h-4 w-4 text-[#16a34a]" />
                        Stay Benefits
                      </div>
                      <div className="mt-2 text-[13px] leading-6 text-[#4b5563]">
                        {activeVariant.cancellation} • Better host coordination •
                        Smooth check-in support
                      </div>
                    </div>

                    <div className="rounded-xl border border-white bg-white/90 p-3 shadow-sm">
                      <div className="flex items-center gap-2 text-[13px] font-bold text-[#111827]">
                        <Sparkles className="h-4 w-4 text-[#0b74ff]" />
                        TPL Note
                      </div>
                      <div className="mt-2 text-[13px] leading-6 text-[#4b5563]">
                        This stay option is mapped as a trusted homestay choice
                        for better booking confidence and smoother traveller experience.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#dbeafe] bg-white/85 p-3 md:p-5 lg:border-l lg:border-t-0">
                  <div className="rounded-2xl border border-[#d9e2ec] bg-white p-4 shadow-sm">
                    <div className="text-[12px] font-bold uppercase tracking-wide text-[#6b7280]">
                      Stay Price / Night
                    </div>

                    <div className="mt-2">
                      {offerDiscount > 0 ? (
                        <div className="mb-1 text-[18px] font-bold text-blacl line-through">
                          ₹{activeVariant.price.toLocaleString("en-IN")}
                        </div>
                      ) : null}

                      <div className="text-[28px] font-extrabold leading-none text-[#111827] md:text-[32px]">
                        ₹{Math.round(discountedStayPrice).toLocaleString("en-IN")}
                      </div>
                    </div>

                    <div className="mt-2 text-[14px] font-medium text-[#6b7280]">
                      + ₹{activeVariant.taxes.toLocaleString("en-IN")} taxes &
                      fees
                    </div>

                    <div className="mt-4 rounded-lg bg-[#f8fbff] px-3 py-2 text-[13px] font-semibold text-[#1f4b99]">
                      Total stay cost updates automatically on the right-side fare
                      summary.
                    </div>

                    {activeVariant.availableRooms ? (
                      <div className="mt-4 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] font-bold text-[#dc2626]">
                        Only {activeVariant.availableRooms} stay option
                        {activeVariant.availableRooms > 1 ? "s" : ""} left at this
                        price
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => setShowRoomModal(true)}
                      className="mt-5 h-[44px] w-full rounded-xl bg-[#0b74ff] text-[14px] font-extrabold text-white transition hover:opacity-95"
                    >
                      Change Stay Option
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-[#fffbea] p-4 text-sm font-semibold text-[#92400e]">
              No stay variant selected. Base homestay pricing is being used.
            </div>
          )}
        </div>
      </div>

      <HomestayChangeRoomModal
        isOpen={showRoomModal}
        onClose={() => setShowRoomModal(false)}
        homestay={homestay}
        selectedVariant={selectedVariant}
        onSelectRoom={onRoomChange}
      />

      {showGalleryModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/70 px-0 py-0 md:items-center md:px-4 md:py-6"
          onClick={() => setShowGalleryModal(false)}
        >
          <div
            className="max-h-[88vh] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl md:max-h-[90vh] md:max-w-6xl md:overflow-auto md:rounded-2xl md:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e5e7eb] bg-white px-4 py-4 md:static md:mb-4 md:border-b-0 md:bg-transparent md:p-0">
              <div className="min-w-0">
                <div className="truncate text-[18px] font-extrabold text-[#111827] md:text-[24px]">
                  {homestay.title}
                </div>
                <div className="mt-1 text-[13px] font-semibold text-[#4b5563]">
                  Homestay Photos
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGalleryModal(false)}
                className="ml-3 h-10 shrink-0 rounded-full border border-[#d9e2ec] px-4 text-sm font-bold text-[#374151] hover:bg-[#f8fafc] md:h-auto md:px-3 md:py-1.5"
              >
                Close
              </button>
            </div>

            <div className="mb-3 flex gap-2 overflow-x-auto border-b border-[#e5e7eb] px-4 py-3 text-[13px] font-bold text-[#374151] md:mb-4 md:flex-wrap md:gap-5 md:px-0 md:pb-3 md:pt-0 md:text-[14px] md:font-medium">
              <button className="shrink-0 rounded-full bg-[#eff6ff] px-3 py-1.5 font-bold text-[#0b74ff] md:bg-transparent md:px-0 md:py-0 md:text-[#111827]">Property Photos</button>
              <button className="shrink-0 rounded-full border border-[#e5e7eb] px-3 py-1.5 md:border-0 md:px-0 md:py-0">Room</button>
              <button className="shrink-0 rounded-full border border-[#e5e7eb] px-3 py-1.5 md:border-0 md:px-0 md:py-0">Experiences</button>
              <button className="shrink-0 rounded-full border border-[#e5e7eb] px-3 py-1.5 md:border-0 md:px-0 md:py-0">Outdoors</button>
              <button className="shrink-0 rounded-full border border-[#e5e7eb] px-3 py-1.5 md:border-0 md:px-0 md:py-0">Living Area</button>
              <button className="shrink-0 rounded-full border border-[#e5e7eb] px-3 py-1.5 md:border-0 md:px-0 md:py-0">Facade</button>
              <button className="shrink-0 rounded-full border border-[#e5e7eb] px-3 py-1.5 md:border-0 md:px-0 md:py-0">Dining</button>
            </div>

            <div className="max-h-[calc(88vh-138px)] overflow-y-auto px-4 pb-5 md:max-h-none md:grid md:grid-cols-3 md:gap-3 md:overflow-visible md:px-0 md:pb-0">
              {galleryImages.map((img, index) => (
                <div
                  key={`${homestay.id}-gallery-${index}`}
                  className="mb-3 overflow-hidden rounded-2xl bg-[#dbeafe] md:mb-0 md:rounded-xl"
                >
                  {img ? (
                    <img
                      src={img}
                      alt={`${homestay.title} gallery ${index + 1}`}
                      className="h-[210px] w-full cursor-zoom-in object-cover transition hover:scale-[1.01] md:h-[220px]"
                      onClick={() => setZoomImage(img)}
                    />
                  ) : (
                    <div className="flex h-[220px] w-full items-center justify-center text-sm font-semibold text-[#2563eb]">
                      Homestay Image
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {zoomImage && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/85 px-4 py-6"
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            alt="Zoomed homestay"
            className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </>
  );
}
