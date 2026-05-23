"use client";

import { useMemo, useState } from "react";
import type { Hotel, RoomVariant } from "@/app/data/stays/types";
import HotelChangeRoomModal from "./HotelChangeRoomModal";
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
  hotel: Hotel;
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

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function calculateNights(checkIn: string, checkOut: string) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;

  const diff = end.getTime() - start.getTime();
  const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 1;
}

export default function HotelBookingHotelDetailSection({
  hotel,
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

  const activeVariant = selectedVariant || hotel.variants?.[0] || null;

  const galleryImages = useMemo(() => {
    if (hotel.images?.length && hotel.images.length >= 4) {
      return hotel.images;
    }

    return [
      hotel.images?.[0] || "",
      hotel.images?.[1] || hotel.images?.[0] || "",
      hotel.images?.[2] || hotel.images?.[0] || "",
      hotel.images?.[3] || hotel.images?.[0] || "",
    ].filter(Boolean);
  }, [hotel.images]);

const discountedRoomPrice = Math.max(
  activeVariant.price - offerDiscount / Math.max(rooms * nights, 1),
  0
);

  return (
    <>
      <div className="rounded-xl border border-[#d9e2ec] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        {/* HOTEL TOP */}
        <div className="border-b border-[#e5e7eb] p-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_240px]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[28px] font-extrabold text-[#111827]">
                  {hotel.title}
                </h1>

                {hotel.starRating ? (
                  <span className="text-[15px] font-bold text-[#111827]">
                    {"★".repeat(hotel.starRating)}
                  </span>
                ) : null}

                <span className="rounded-full bg-[#eafaf1] px-2.5 py-1 text-[11px] font-bold text-[#15803d]">
                  TPL Assured
                </span>

                {hotel.coupleFriendly ? (
                  <span className="rounded-md border border-[#d9e2ec] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#374151]">
                    Couple Friendly
                  </span>
                ) : null}
              </div>

              <div className="mt-2 text-[14px] font-semibold text-[#0b74ff]">
                {hotel.area}, {hotel.city}
              </div>

              {!!hotel.locationHighlights?.length && (
                <div className="mt-2 text-[13px] font-medium text-[#4b5563]">
                  {hotel.locationHighlights.join(" • ")}
                </div>
              )}

              {hotel.description ? (
                <p className="mt-3 max-w-4xl text-[14px] leading-6 text-[#4b5563]">
                  {hotel.description}
                </p>
              ) : null}
            </div>

            {/* CLICKABLE IMAGE */}
            <div>
              <button
                type="button"
                onClick={() => setShowGalleryModal(true)}
                className="block w-full overflow-hidden rounded-xl border border-[#d9e2ec] bg-[#eef6ff] transition hover:shadow-md"
              >
                {hotel.images?.[0] ? (
                  <img
                    src={hotel.images[0]}
                    alt={hotel.title}
                    className="h-[140px] w-full object-cover"
                  />
                ) : (
                  <div className="flex h-[140px] w-full items-center justify-center text-sm font-semibold text-[#2563eb]">
                    Hotel Image
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

        {/* STAY DETAILS */}
        <div className="border-b border-[#e5e7eb] p-5">
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

        {/* SELECTED ROOM STRONG BLOCK */}
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="text-[22px] font-extrabold text-[#111827]">
              Selected Room
            </div>

            {hotel.variants?.length > 0 && (
              <button
                type="button"
                onClick={() => setShowRoomModal(true)}
                className="rounded-lg border border-[#0b74ff] bg-[#f8fbff] px-4 py-2 text-[13px] font-bold text-[#0b74ff] transition hover:bg-[#eef6ff]"
              >
                Change Room
              </button>
            )}
          </div>

          {activeVariant ? (
            <div className="overflow-hidden rounded-2xl border border-[#bfdbfe] bg-gradient-to-br from-[#f8fbff] via-white to-[#eef6ff] shadow-[0_8px_24px_rgba(11,116,255,0.08)]">
              <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.85fr]">
                {/* LEFT CONTENT */}
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-2 text-[22px] font-extrabold text-[#111827]">
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
                        Room Benefits
                      </div>
                      <div className="mt-2 text-[13px] leading-6 text-[#4b5563]">
                        {activeVariant.cancellation} • Better confirmation flow •
                        Smooth check-in support
                      </div>
                    </div>

                    <div className="rounded-xl border border-white bg-white/90 p-3 shadow-sm">
                      <div className="flex items-center gap-2 text-[13px] font-bold text-[#111827]">
                        <Sparkles className="h-4 w-4 text-[#0b74ff]" />
                        TPL Note
                      </div>
                      <div className="mt-2 text-[13px] leading-6 text-[#4b5563]">
                        This room is mapped as a trusted stay option for better
                        booking confidence and smoother traveller experience.
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT PRICE PANEL */}
                <div className="border-t border-[#dbeafe] bg-white/85 p-5 lg:border-l lg:border-t-0">
                  <div className="rounded-2xl border border-[#d9e2ec] bg-white p-4 shadow-sm">
                    <div className="text-[12px] font-bold uppercase tracking-wide text-[#6b7280]">
                      Room Price / Night
                    </div>

                    <div className="mt-2">
  {offerDiscount > 0 && (
    <div className="mb-1 text-[18px] font-bold text-black line-through">
      ₹{activeVariant.price.toLocaleString("en-IN")}
    </div>
  )}

  <div className="text-[32px] font-extrabold leading-none text-[#111827]">
    ₹{Math.round(discountedRoomPrice).toLocaleString("en-IN")}
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
                        Only {activeVariant.availableRooms} room
                        {activeVariant.availableRooms > 1 ? "s" : ""} left at this
                        price
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => setShowRoomModal(true)}
                      className="mt-5 h-[44px] w-full rounded-xl bg-[#0b74ff] text-[14px] font-extrabold text-white transition hover:opacity-95"
                    >
                      Change Room Option
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-[#fffbea] p-4 text-sm font-semibold text-[#92400e]">
              No room variant selected. Base hotel pricing is being used.
            </div>
          )}
        </div>
      </div>

      {/* CHANGE ROOM MODAL */}
      <HotelChangeRoomModal
        isOpen={showRoomModal}
        onClose={() => setShowRoomModal(false)}
        hotel={hotel}
        selectedVariant={selectedVariant}
        onSelectRoom={onRoomChange}
      />

      {/* GALLERY MODAL */}
      {showGalleryModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 py-6"
          onClick={() => setShowGalleryModal(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-6xl overflow-auto rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-[24px] font-extrabold text-[#111827]">
                  {hotel.title}
                </div>
                <div className="mt-1 text-[13px] font-semibold text-[#4b5563]">
                  Property Photos
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGalleryModal(false)}
                className="rounded-full border border-[#d9e2ec] px-3 py-1.5 text-sm font-bold text-[#374151] hover:bg-[#f8fafc]"
              >
                Close
              </button>
            </div>

            <div className="mb-4 flex flex-wrap gap-5 border-b border-[#e5e7eb] pb-3 text-[14px] font-medium text-[#374151]">
              <button className="font-bold text-[#111827]">Property Photos</button>
              <button>Room</button>
              <button>Experiences</button>
              <button>Swimming Pool</button>
              <button>Outdoors</button>
              <button>Facade</button>
              <button>Restaurant</button>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {galleryImages.map((img, index) => (
                <div
                  key={`${hotel.id}-gallery-${index}`}
                  className="overflow-hidden rounded-xl bg-[#dbeafe]"
                >
                  {img ? (
                    <img
                      src={img}
                      alt={`${hotel.title} gallery ${index + 1}`}
                      className="h-[220px] w-full cursor-zoom-in object-cover transition hover:scale-[1.01]"
                      onClick={() => setZoomImage(img)}
                    />
                  ) : (
                    <div className="flex h-[220px] w-full items-center justify-center text-sm font-semibold text-[#2563eb]">
                      Hotel Image
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* IMAGE ZOOM */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/85 px-4 py-6"
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            alt="Zoomed hotel"
            className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </>
  );
}