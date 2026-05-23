"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/app/components/common/LoginModal";
import type { Homestay } from "@/app/data/stays/types";

import {
  calculateSmartOfferDiscount,
  getSmartActiveOfferItem,
  type SmartOfferItem,
} from "@/app/lib/smartOffers";

import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import { getSavedProfile } from "@/app/lib/account/profileStorage";

type Props = {
  homestay: Homestay;
};

function formatPrice(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
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

function getActiveUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("tpl_auth_session_v1");
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.user || null;
  } catch {
    return null;
  }
}

function getDisplayNameFromUser(user: any) {
  if (!user?.mobile) return "";

  const sessionName = String(user?.fullName || "").trim();

  if (sessionName) return sessionName;

  const profile = getSavedProfile(user.mobile);

  const profileName = `${profile.firstName || ""} ${
    profile.lastName || ""
  }`.trim();

  if (profileName && profileName.toLowerCase() !== "pk") {
    return profileName;
  }

  return String(user.mobile || "");
}

export default function HomestayResultCard({
  homestay,
}: Props) {
  const router = useRouter();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showRatingPopup, setShowRatingPopup] = useState(false);

  const [smartOffer, setSmartOffer] =
    useState<SmartOfferItem | null>(null);

  const [activeUser, setActiveUser] = useState<any>(null);

  useEffect(() => {
    const syncCardState = () => {
      setSmartOffer(getSmartActiveOfferItem());
      setActiveUser(getActiveUser());
    };

    syncCardState();

    window.addEventListener(
      "TPL_SMART_OFFER_UPDATED",
      syncCardState
    );

    window.addEventListener(
      "TPL_ACTIVE_OFFER_UPDATED",
      syncCardState
    );

    window.addEventListener(
      AUTH_UPDATED_EVENT,
      syncCardState
    );

    window.addEventListener("storage", syncCardState);

    return () => {
      window.removeEventListener(
        "TPL_SMART_OFFER_UPDATED",
        syncCardState
      );

      window.removeEventListener(
        "TPL_ACTIVE_OFFER_UPDATED",
        syncCardState
      );

      window.removeEventListener(
        AUTH_UPDATED_EVENT,
        syncCardState
      );

      window.removeEventListener(
        "storage",
        syncCardState
      );
    };
  }, []);

  const firstVariant = homestay.variants?.[0];

  const baseRoomPrice =
    firstVariant?.price || homestay.pricePerNight || 0;

  const smartOfferDiscount = useMemo(() => {
    if (!smartOffer) return 0;

    const serviceOk =
      smartOffer.service === "homestay" ||
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
    if (
      homestay.images?.length &&
      homestay.images.length >= 4
    ) {
      return homestay.images;
    }

    return [
      homestay.images?.[0] || "",
      homestay.images?.[1] ||
        homestay.images?.[0] ||
        "",
      homestay.images?.[2] ||
        homestay.images?.[0] ||
        "",
      homestay.images?.[3] ||
        homestay.images?.[0] ||
        "",
    ].filter(Boolean);
  }, [homestay.images]);

  const amenityLine = (
    homestay.amenities || []
  )
    .slice(0, 4)
    .join(" • ");

  const handleCardClick = () => {
    const params = new URLSearchParams(
      window.location.search
    );

    const payload = {
      homestay,
      selectedVariant: firstVariant || null,
      searchMeta: {
        city:
          params.get("city") ||
          homestay.city ||
          "",
        checkIn: params.get("checkIn") || "",
        checkOut: params.get("checkOut") || "",
        rooms: Math.max(
          Number(params.get("rooms") || "1"),
          1
        ),
        adults: Math.max(
          Number(params.get("adults") || "2"),
          1
        ),
        children: Math.max(
          Number(params.get("children") || "0"),
          0
        ),
      },
      timestamp: Date.now(),
    };

    sessionStorage.setItem(
      "tplSelectedHomestayResult",
      JSON.stringify(payload)
    );

    router.push("/homestays/booking");
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="cursor-pointer rounded-lg border border-[#d9e2ec] bg-white p-3 transition duration-200 hover:-translate-y-1 hover:border-[#0b74ff] hover:shadow-lg"
      >
        <div className="flex gap-4">
          {/* IMAGE BLOCK */}
          <div className="w-[250px] shrink-0">
            <div className="overflow-hidden rounded-md border border-[#e5e7eb] bg-[#dbeafe]">
              <div className="h-[145px] w-full overflow-hidden bg-[#dbeafe]">
                {galleryImages[0] ? (
                  <img
                    src={galleryImages[0]}
                    alt={homestay.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#2563eb]">
                    Homestay Image
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1 border-t border-[#e5e7eb] bg-white p-1">
                {galleryImages
                  .slice(1, 4)
                  .map((img, index) => (
                    <div
                      key={`${homestay.id}-thumb-${index}`}
                      className="relative h-[48px] overflow-hidden rounded-sm bg-[#eaf4ff]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowGalleryModal(true);
                      }}
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={`${homestay.title} ${
                            index + 2
                          }`}
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
              className="mt-2 text-[12px] font-bold text-[#0b74ff] hover:underline"
            >
              View All Photos
            </button>
          </div>

          {/* DETAILS */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[18px] font-extrabold leading-tight text-[#111827]">
                {homestay.title}
              </h3>

              <span className="rounded border border-[#d9e2ec] px-2 py-0.5 text-[11px] font-semibold text-[#374151]">
                {getStayTypeLabel(
                  homestay.stayType
                )}
              </span>

              <span className="rounded-full bg-[#eafaf1] px-2.5 py-1 text-[11px] font-bold text-[#15803d]">
                TPL Assured
              </span>
            </div>

            <div className="mt-1 text-[13px] font-semibold text-[#0b74ff]">
              {homestay.area}
              {homestay.locationHighlights?.[0]
                ? ` | ${homestay.locationHighlights[0]}`
                : ""}
            </div>

            {homestay.description ? (
              <div className="mt-2 line-clamp-2 text-[13px] text-[#4b5563]">
                {homestay.description}
              </div>
            ) : null}

            {!!homestay.tags?.length && (
              <div className="mt-2 flex flex-wrap gap-2">
                {homestay.tags
                  .slice(0, 3)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-[#d9e2ec] px-2 py-0.5 text-[11px] font-semibold text-[#4b5563]"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            )}

            {!!homestay.scenicTags?.length && (
              <div className="mt-2 flex flex-wrap gap-2">
                {homestay.scenicTags
                  .slice(0, 2)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-[#f8fbff] px-2.5 py-1 text-[11px] font-semibold text-[#0b74ff]"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            )}

            {amenityLine ? (
              <div className="mt-2 text-[12px] font-medium text-[#4b5563]">
                {amenityLine}
              </div>
            ) : null}

            {firstVariant ? (
              <div className="mt-3 rounded-md bg-[#f8fbff] px-3 py-2 text-[12px]">
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
          <div className="w-[170px] shrink-0 text-right">
            <div
              className="relative inline-block"
              onMouseEnter={() =>
                setShowRatingPopup(true)
              }
              onMouseLeave={() =>
                setShowRatingPopup(false)
              }
            >
              <div className="text-[15px] font-bold text-[#1f4b99]">
                Excellent
              </div>

              <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
                {homestay.rating} (
                {homestay.reviews} Ratings)
              </div>

              {showRatingPopup && (
                <div className="absolute right-0 top-full z-30 mt-2 w-[260px] rounded-lg border border-[#d9e2ec] bg-white p-4 text-left shadow-xl">
                  <div className="text-center text-[12px] font-semibold text-[#374151]">
                    Based on {homestay.reviews} Ratings
                  </div>

                  <div className="mt-3 space-y-2 text-[12px]">
                    {[
                      ["Hospitality", "4.6"],
                      ["Cleanliness", "4.5"],
                      ["Location", "4.4"],
                      ["Comfort", "4.5"],
                      ["Food", "4.2"],
                      ["Value For Money", "4.4"],
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

            <div className="mt-4 text-[18px] font-extrabold leading-none text-[#111827] sm:text-[20px]">
              {formatPrice(displayPrice)}
            </div>

            {smartOfferDiscount > 0 ? (
              <div className="mt-1 flex items-center justify-end gap-1.5">
                <span className="text-[16px] font-bold text-black line-through">
                  {formatPrice(baseRoomPrice)}
                </span>

                <span className="rounded-full bg-[#fff7ed] px-2 py-0.5 text-[10px] font-extrabold text-[#ea580c]">
                  {smartOfferCode} -
                  {formatPrice(
                    smartOfferDiscount
                  )}
                </span>
              </div>
            ) : null}

            <div className="mt-1 text-[12px] font-medium text-[#6b7280]">
              + {formatPrice(homestay.taxes)} taxes &
              fees
            </div>

            <div className="mt-1 text-[12px] font-medium text-[#6b7280]">
              Per Night
            </div>

            {firstVariant?.availableRooms ? (
              <div className="mt-3 text-[12px] font-semibold text-[#dc2626]">
                Only {firstVariant.availableRooms}{" "}
                unit
                {firstVariant.availableRooms > 1
                  ? "s"
                  : ""}{" "}
                left
              </div>
            ) : null}

            {activeUser?.mobile ? (
              <div className="mt-3 text-[11px] font-extrabold text-[#15803d]">
                Logged as{" "}
                {getDisplayNameFromUser(
                  activeUser
                )}
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
                className="mt-3 text-[11px] font-bold text-[#ea580c] hover:underline"
              >
                Login now for extra rewards
              </button>
            )}
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() =>
          setShowLoginModal(false)
        }
      />

      {showGalleryModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 py-6"
          onClick={() =>
            setShowGalleryModal(false)
          }
        >
          <div
            className="max-h-[90vh] w-full max-w-6xl overflow-auto rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-[24px] font-extrabold text-[#111827]">
                  {homestay.title}
                </div>

                <div className="mt-1 text-[13px] font-semibold text-[#4b5563]">
                  Property Photos
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowGalleryModal(false)
                }
                className="rounded-full border border-[#d9e2ec] px-3 py-1.5 text-sm font-bold text-[#374151] hover:bg-[#f8fafc]"
              >
                Close
              </button>
            </div>

            <div className="mb-4 flex flex-wrap gap-5 border-b border-[#e5e7eb] pb-3 text-[14px] font-medium text-[#374151]">
              <button className="font-bold text-[#111827]">
                Property Photos
              </button>

              <button>Room</button>
              <button>Views</button>
              <button>Outdoors</button>
              <button>Kitchen</button>
              <button>Facade</button>
              <button>Experiences</button>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {galleryImages.map((img, index) => (
                <div
                  key={`${homestay.id}-gallery-${index}`}
                  className="overflow-hidden rounded-xl bg-[#dbeafe]"
                >
                  {img ? (
                    <img
                      src={img}
                      alt={`${homestay.title} gallery ${
                        index + 1
                      }`}
                      className="h-[220px] w-full object-cover"
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
    </>
  );
}