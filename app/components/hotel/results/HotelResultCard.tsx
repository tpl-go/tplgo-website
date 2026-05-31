"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/app/components/common/LoginModal";
import type { Hotel } from "@/app/data/stays/types";

import {
  calculateSmartOfferDiscount,
  getSmartActiveOfferItem,
  type SmartOfferItem,
} from "@/app/lib/smartOffers";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import { getLoggedInDisplayName } from "@/app/lib/auth/displayName";

type Props = {
  hotel: Hotel;
};

type ActiveUser = {
  mobile?: string;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
};

function formatPrice(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function parseLocalDate(value: string | null) {
  if (!value) return null;
  const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = parts
    ? new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
    : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getActiveUser(): ActiveUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("tpl_auth_session_v1");
    const parsed = raw ? (JSON.parse(raw) as { user?: ActiveUser }) : null;
    return parsed?.user || null;
  } catch {
    return null;
  }
}

function getDisplayNameFromUser(user: ActiveUser | null) {
  return getLoggedInDisplayName(user);
}



export default function HotelResultCard({ hotel }: Props) {
  const router = useRouter();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showRatingPopup, setShowRatingPopup] = useState(false);

  const [smartOffer, setSmartOffer] = useState<SmartOfferItem | null>(null);
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);

  useEffect(() => {
  const syncCardState = () => {
    setSmartOffer(getSmartActiveOfferItem());
    setActiveUser(getActiveUser());
  };

  syncCardState();

  window.addEventListener("TPL_SMART_OFFER_UPDATED", syncCardState);
  window.addEventListener("TPL_ACTIVE_OFFER_UPDATED", syncCardState);
  window.addEventListener(AUTH_UPDATED_EVENT, syncCardState);
  window.addEventListener("storage", syncCardState);

  return () => {
    window.removeEventListener("TPL_SMART_OFFER_UPDATED", syncCardState);
    window.removeEventListener("TPL_ACTIVE_OFFER_UPDATED", syncCardState);
    window.removeEventListener(AUTH_UPDATED_EVENT, syncCardState);
    window.removeEventListener("storage", syncCardState);
  };
}, []);

  const firstVariant = hotel.variants?.[0];

  const baseRoomPrice = firstVariant?.price || hotel.pricePerNight || 0;

  const smartOfferDiscount = useMemo(() => {
    if (!smartOffer) return 0;

    const serviceOk =
      smartOffer.service === "hotel" ||
      smartOffer.service === "all";

    if (!serviceOk) return 0;

    return calculateSmartOfferDiscount(
      smartOffer,
      baseRoomPrice
    );
  }, [smartOffer, baseRoomPrice]);

  const displayPrice = Math.max(
    baseRoomPrice - smartOfferDiscount,
    0
  );

  const smartOfferCode =
    smartOffer?.couponCode || smartOffer?.slug || "";

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

  const amenityLine = (hotel.amenities || []).slice(0, 4).join(" • ");

  const handleCardClick = () => {
    const params = new URLSearchParams(window.location.search);
    const city = params.get("city") || hotel.city || "";
    const checkIn = params.get("checkIn") || "";
    const checkOut = params.get("checkOut") || "";
    const rooms = Number(params.get("rooms") || "0");
    const adults = Number(params.get("adults") || "0");
    const checkInDate = parseLocalDate(checkIn);
    const checkOutDate = parseLocalDate(checkOut);
    const hasValidSearch =
      city.trim() &&
      checkInDate &&
      checkOutDate &&
      checkOutDate > checkInDate &&
      Number.isFinite(rooms) &&
      rooms >= 1 &&
      Number.isFinite(adults) &&
      adults >= 1 &&
      firstVariant;

    if (!hasValidSearch) {
      alert("Please select destination, dates and guests before booking.");
      return;
    }

    const payload = {
      hotel,
      selectedVariant: firstVariant || null,
      searchMeta: {
        city,
        checkIn,
        checkOut,
        rooms: Math.max(rooms, 1),
        adults: Math.max(adults, 1),
        children: Math.max(Number(params.get("children") || "0"), 0),
      },
      timestamp: Date.now(),
    };

    sessionStorage.setItem(
      "tplSelectedHotelResult",
      JSON.stringify(payload)
    );

    router.push("/hotels/booking");
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="cursor-pointer overflow-hidden rounded-2xl border border-[#d9e2ec] bg-white p-0 shadow-[0_1px_10px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-1 hover:border-[#0b74ff] hover:shadow-lg md:rounded-lg md:p-3 md:shadow-none"
      >
        <div className="flex flex-col gap-0 md:flex-row md:gap-4">
          {/* IMAGE BLOCK */}
          <div className="relative w-full shrink-0 md:w-[250px]">
            <div className="overflow-hidden rounded-none border-0 border-[#e5e7eb] bg-[#dbeafe] md:rounded-md md:border">
              <div className="h-[190px] w-full overflow-hidden bg-[#dbeafe] md:h-[145px]">
                {galleryImages[0] ? (
                  <img
                    src={galleryImages[0]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#2563eb]">
                    Hotel Image
                  </div>
                )}
              </div>

              <div className="hidden grid-cols-3 gap-1 border-t border-[#e5e7eb] bg-white p-1 md:grid">
                {galleryImages.slice(1, 4).map((img, index) => (
                  <div
                    key={`${hotel.id}-thumb-${index}`}
                    className="relative h-[48px] overflow-hidden rounded-sm bg-[#eaf4ff]"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowGalleryModal(true);
                    }}
                  >
                    {img ? (
                      <img
                        src={img}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-[#dbeafe]" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowGalleryModal(true);
              }}
              className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-extrabold text-white shadow-sm md:static md:mt-2 md:bg-transparent md:px-0 md:py-0 md:text-[12px] md:font-bold md:text-[#0b74ff] md:shadow-none md:hover:underline"
            >
              <span className="md:hidden">Photos</span>
              <span className="hidden md:inline">View All Photos</span>
            </button>
          </div>

          {/* DETAILS */}
          <div className="min-w-0 flex-1 px-3 pt-3 md:px-0 md:pt-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="min-w-0 text-[17px] font-extrabold leading-tight text-[#111827] md:text-[18px]">
                {hotel.title}
              </h3>

              {hotel.starRating ? (
                <span className="text-[12px] font-bold text-[#111827] md:text-[14px]">
                  {"★".repeat(hotel.starRating)}
                </span>
              ) : null}

              <span className="rounded-full bg-[#eafaf1] px-2.5 py-1 text-[11px] font-bold text-[#15803d]">
                TPL Assured
              </span>
            </div>

            <div className="mt-1 text-[12px] font-semibold leading-snug text-[#0b74ff] md:text-[13px]">
              {hotel.area}
              {hotel.locationHighlights?.[0]
                ? ` | ${hotel.locationHighlights[0]}`
                : ""}
            </div>

            {hotel.description ? (
              <div className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-[#4b5563] md:text-[13px]">
                {hotel.description}
              </div>
            ) : null}

            {!!hotel.tags?.length && (
              <div className="mt-2 flex flex-wrap gap-2">
                {hotel.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-[#d9e2ec] px-2 py-0.5 text-[11px] font-semibold text-[#4b5563]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {amenityLine ? (
              <div className="mt-2 line-clamp-1 text-[12px] font-medium text-[#4b5563]">
                {amenityLine}
              </div>
            ) : null}

            {firstVariant ? (
              <div className="mt-3 rounded-xl bg-[#f8fbff] px-3 py-2 text-[12px] md:rounded-md">
                <div className="font-bold text-[#111827]">
                  {firstVariant.name}
                </div>

                <div className="mt-1 text-[#4b5563]">
                  {firstVariant.maxAdults} Adults
                  {firstVariant.maxChildren > 0
                    ? `, ${firstVariant.maxChildren} Children`
                    : ""}
                  {" • "}
                  {firstVariant.mealPlan}
                  {" • "}
                  {firstVariant.cancellation}
                </div>
              </div>
            ) : null}
          </div>

          {/* PRICE BLOCK */}
          <div className="mt-3 w-full shrink-0 border-t border-[#eef2f7] px-3 pb-3 pt-3 text-left md:mt-0 md:w-[170px] md:border-t-0 md:px-0 md:pb-0 md:pt-0 md:text-right">
            <div
              className="relative inline-flex items-center gap-2 md:inline-block"
              onMouseEnter={() => setShowRatingPopup(true)}
              onMouseLeave={() => setShowRatingPopup(false)}
            >
              <div className="rounded-full bg-[#eaf4ff] px-2.5 py-1 text-[12px] font-extrabold text-[#1f4b99] md:bg-transparent md:px-0 md:py-0 md:text-[15px] md:font-bold">
                Excellent
              </div>

              <div className="text-[12px] font-semibold text-[#6b7280] md:mt-1">
                {hotel.rating} ({hotel.reviews} Ratings)
              </div>

              {showRatingPopup && (
                <div className="absolute right-0 top-full z-30 mt-2 w-[260px] rounded-lg border border-[#d9e2ec] bg-white p-4 text-left shadow-xl">
                  <div className="text-center text-[12px] font-semibold text-[#374151]">
                    Based on {hotel.reviews} Ratings
                  </div>

                  <div className="mt-3 space-y-2 text-[12px]">
                    {[
                      ["Hospitality", "4.5"],
                      ["Facilities", "4.4"],
                      ["Food", "4.2"],
                      ["Room", "4.5"],
                      ["Cleanliness", "4.4"],
                      ["Value For Money", "4.3"],
                    ].map(([label, score]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="text-[#4b5563]">
                          {label}
                        </span>

                        <span className="font-bold text-[#111827]">
                          {score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 md:mt-4">
              <div>
                <div className="text-[21px] font-extrabold leading-none text-[#111827] md:text-[20px]">
                  {formatPrice(displayPrice)}
                </div>

                {smartOfferDiscount > 0 ? (
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 md:justify-end">
                    <span className="text-[13px] font-bold text-black line-through md:text-[16px]">
                      {formatPrice(baseRoomPrice)}
                    </span>

                    <span className="rounded-full bg-[#fff7ed] px-2 py-0.5 text-[10px] font-extrabold text-[#ea580c]">
                      {smartOfferCode} -{formatPrice(smartOfferDiscount)}
                    </span>
                  </div>
                ) : null}

                <div className="mt-1 text-[12px] font-medium text-[#6b7280]">
                  + {formatPrice(hotel.taxes)} taxes & fees
                </div>

                <div className="mt-1 text-[12px] font-medium text-[#6b7280]">
                  Per Night
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="mt-3 h-11 w-full rounded-xl bg-[#0b74ff] px-4 text-[13px] font-black text-white md:hidden"
            >
              View Detail
            </button>

            {firstVariant?.availableRooms ? (
              <div className="mt-3 text-[12px] font-semibold text-[#dc2626]">
                Only {firstVariant.availableRooms} room
                {firstVariant.availableRooms > 1 ? "s" : ""}
                {" "}left
              </div>
            ) : null}

            {activeUser?.mobile ? (
              <div className="mt-3 rounded-full bg-[#eafaf1] px-3 py-1.5 text-[11px] font-extrabold text-[#15803d] md:bg-transparent md:px-0 md:py-0">
                Logged as {getDisplayNameFromUser(activeUser)}
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();

                  if (!activeUser?.mobile) {
                    setShowLoginModal(true);
                  }
                }}
                className="mt-3 rounded-full bg-[#fff7ed] px-3 py-1.5 text-[11px] font-bold text-[#ea580c] hover:underline md:bg-transparent md:px-0 md:py-0"
              >
                Login now for extra rewards
              </button>
            )}
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
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
                  {hotel.title}
                </div>

                <div className="mt-1 text-[13px] font-semibold text-[#4b5563]">
                  Property Photos
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
              <button className="shrink-0 rounded-full bg-[#eff6ff] px-3 py-1.5 font-bold text-[#0b74ff] md:bg-transparent md:px-0 md:py-0 md:text-[#111827]">
                Property Photos
              </button>

              <button className="shrink-0 rounded-full border border-[#e5e7eb] px-3 py-1.5 md:border-0 md:px-0 md:py-0">Room</button>
              <button className="shrink-0 rounded-full border border-[#e5e7eb] px-3 py-1.5 md:border-0 md:px-0 md:py-0">Experiences</button>
              <button className="shrink-0 rounded-full border border-[#e5e7eb] px-3 py-1.5 md:border-0 md:px-0 md:py-0">Swimming Pool</button>
              <button className="shrink-0 rounded-full border border-[#e5e7eb] px-3 py-1.5 md:border-0 md:px-0 md:py-0">Outdoors</button>
              <button className="shrink-0 rounded-full border border-[#e5e7eb] px-3 py-1.5 md:border-0 md:px-0 md:py-0">Facade</button>
              <button className="shrink-0 rounded-full border border-[#e5e7eb] px-3 py-1.5 md:border-0 md:px-0 md:py-0">Restaurant</button>
            </div>

            <div className="max-h-[calc(88vh-138px)] overflow-y-auto px-4 pb-5 md:max-h-none md:grid md:grid-cols-3 md:gap-3 md:overflow-visible md:px-0 md:pb-0">
              {galleryImages.map((img, index) => (
                <div
                  key={`${hotel.id}-gallery-${index}`}
                  className="mb-3 overflow-hidden rounded-2xl bg-[#dbeafe] md:mb-0 md:rounded-xl"
                >
                  {img ? (
                    <img
                      src={img}
                      alt=""
                      className="h-[210px] w-full object-cover md:h-[220px]"
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
    </>
  );
}
