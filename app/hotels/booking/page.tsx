"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import LoginModal from "@/app/components/common/LoginModal";
import HotelBookingTopNav from "@/app/components/booking/hotel/HotelBookingTopNav";
import HotelBookingHotelDetailSection from "@/app/components/booking/hotel/HotelBookingHotelDetailSection";
import HotelBookingImportantInfoSection from "@/app/components/booking/hotel/HotelBookingImportantInfoSection";
import HotelBookingGuestDetailSection from "@/app/components/booking/hotel/HotelBookingGuestDetailSection";
import HotelBookingTripSecureSection from "@/app/components/booking/hotel/HotelBookingTripSecureSection";
import HotelBookingCabSection from "@/app/components/booking/hotel/HotelBookingCabSection";
import HotelBookingAddonsSection from "@/app/components/booking/hotel/HotelBookingAddonsSection";
import HotelBookingFareSummaryCard from "@/app/components/booking/hotel/HotelBookingFareSummaryCard";
import HotelBookingOffersSection, {
  HotelOfferItem,
} from "@/app/components/booking/hotel/HotelBookingOffersSection";
import type { Hotel, RoomVariant } from "@/app/data/stays/types";
import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";
import { getWallet } from "@/app/lib/wallet/walletStorage";
import {
  getSmartActiveOfferItem,
  calculateSmartOfferDiscount,
} from "@/app/lib/smartOffers";

function getActiveUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("tpl_auth_session_v1");
    return raw ? JSON.parse(raw)?.user : null;
  } catch {
    return null;
  }
}

type StoredHotelPayload = {
  hotel: Hotel;
  selectedVariant: RoomVariant | null;
  searchMeta: {
    city: string;
    checkIn: string;
    checkOut: string;
    rooms: number;
    adults: number;
    children?: number;
  };
  timestamp: number;
};

type SectionKey =
  | "hotelSummary"
  | "guestDetail"
  | "tripSecure"
  | "cab"
  | "addons";

type GuestValidationPayload = {
  guests?: any[];
  travellers?: any[];
  isValid: boolean;
  contactDetails?: {
    countryCode?: string;
    mobile?: string;
    email?: string;
  };
};

type TripSecurePayload = {
  tripSecureStatus: "pending" | "selected" | "skipped";
  tripSecureLabel: string;
  tripSecurePrice: number;
};

type CabPayload = {
  cabType: "airport" | "outstation" | "none";
  cabStatus: "pending" | "selected" | "skipped";
  cabLabel: string;
  cabPrice: number;
};

type AddonsPayload = {
  addonsStatus: "pending" | "selected" | "skipped";
  addonsLabel: string;
  addonsPrice: number;
  selectedItems?: string[];
};

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

const HOTEL_OFFERS: HotelOfferItem[] = [
  {
    code: "TPLWELCOME",
    title: "Hotel instant discount",
    description: "Save instantly on this hotel booking.",
    discountAmount: 300,
  },
  {
    code: "STAYMORE",
    title: "Long stay benefit",
    description: "Extra savings on selected multi-night stays.",
    discountAmount: 400,
  },
  {
    code: "LUXEDEAL",
    title: "Special hotel deal",
    description: "Limited-time value offer on curated properties.",
    discountAmount: 250,
  },
];

export default function HotelBookPage() {
  const router = useRouter();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [sessionData, setSessionData] = useState<StoredHotelPayload | null>(
    null
  );
  const [selectedVariant, setSelectedVariant] =
    useState<RoomVariant | null>(null);
  const [loading, setLoading] = useState(true);

  const [wallet, setWallet] = useState({
    promoCredit: 0,
    earnedCredit: 0,
    refundableBalance: 0,
  });

  const [guestValidation, setGuestValidation] =
    useState<GuestValidationPayload>({
      guests: [],
      travellers: [],
      isValid: false,
      contactDetails: {
        countryCode: "+91",
        mobile: "",
        email: "",
      },
    });

  const [tripSecureData, setTripSecureData] = useState<TripSecurePayload>({
    tripSecureStatus: "pending",
    tripSecureLabel: "No trip secure selected",
    tripSecurePrice: 0,
  });

  const [cabData, setCabData] = useState<CabPayload>({
    cabType: "none",
    cabStatus: "pending",
    cabLabel: "No cab selected",
    cabPrice: 0,
  });

  const [addonsData, setAddonsData] = useState<AddonsPayload>({
    addonsStatus: "pending",
    addonsLabel: "No add-ons selected",
    addonsPrice: 0,
    selectedItems: [],
  });

  const [selectedOffer, setSelectedOffer] = useState<HotelOfferItem | null>(
    null
  );

  const [specialRequest, setSpecialRequest] = useState("");
  const [timeLeft, setTimeLeft] = useState(10 * 60);

  const [activeSection, setActiveSection] =
    useState<SectionKey>("hotelSummary");

  const hotelSummaryRef = useRef<HTMLDivElement | null>(null);
  const guestDetailRef = useRef<HTMLDivElement | null>(null);
  const tripSecureRef = useRef<HTMLDivElement | null>(null);
  const cabRef = useRef<HTMLDivElement | null>(null);
  const addonsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const user = getActiveUser();

    if (user?.mobile) {
      setWallet(getWallet(user.mobile));
    }
  }, []);

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? sessionStorage.getItem("tplSelectedHotelResult")
        : null;

    if (!raw) {
      alert("No hotel selected. Please choose a hotel first.");
      router.push("/hotels/results");
      return;
    }

    try {
      const parsed: StoredHotelPayload = JSON.parse(raw);
      const isExpired = Date.now() - parsed.timestamp > 10 * 60 * 1000;

      if (isExpired) {
        sessionStorage.removeItem("tplSelectedHotelResult");
        alert("Session expired. Please select hotel again.");
        router.push("/hotels/results");
        return;
      }

      setSessionData(parsed);
      setSelectedVariant(parsed.selectedVariant || null);
      setLoading(false);
    } catch (error) {
      console.error("Failed to parse hotel session:", error);
      sessionStorage.removeItem("tplSelectedHotelResult");
      alert("Something went wrong. Please select hotel again.");
      router.push("/hotels/results");
    }
  }, [router]);

  useEffect(() => {
    if (!sessionData) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          sessionStorage.removeItem("tplSelectedHotelResult");
          alert("Session expired. Please select hotel again.");
          router.push("/hotels/results");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionData, router]);

  useEffect(() => {
    const sections = [
      { key: "hotelSummary", ref: hotelSummaryRef },
      { key: "guestDetail", ref: guestDetailRef },
      { key: "tripSecure", ref: tripSecureRef },
      { key: "cab", ref: cabRef },
      { key: "addons", ref: addonsRef },
    ] as const;

    const onScroll = () => {
      let current: SectionKey = "hotelSummary";

      for (const section of sections) {
        if (!section.ref.current) continue;
        const top = section.ref.current.getBoundingClientRect().top;

        if (top <= 180) {
          current = section.key;
        }
      }

      setActiveSection(current);
    };

    window.addEventListener("scroll", onScroll);
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSectionScroll = (key: SectionKey) => {
    const map: Record<SectionKey, React.RefObject<HTMLDivElement | null>> = {
      hotelSummary: hotelSummaryRef,
      guestDetail: guestDetailRef,
      tripSecure: tripSecureRef,
      cab: cabRef,
      addons: addonsRef,
    };

    map[key].current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const formattedTime = useMemo(() => {
    const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const ss = String(timeLeft % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [timeLeft]);

  const hotel = sessionData?.hotel || null;
  const activeVariant =
    selectedVariant || sessionData?.hotel?.variants?.[0] || null;

  const city = sessionData?.searchMeta?.city || "";
  const checkIn = sessionData?.searchMeta?.checkIn || "";
  const checkOut = sessionData?.searchMeta?.checkOut || "";
  const rooms = Math.max(Number(sessionData?.searchMeta?.rooms || 1), 1);
  const adults = Math.max(Number(sessionData?.searchMeta?.adults || 2), 1);
  const children = Math.max(Number(sessionData?.searchMeta?.children || 0), 0);

  const nights = useMemo(() => {
    return calculateNights(checkIn, checkOut);
  }, [checkIn, checkOut]);

  const roomPrice = activeVariant?.price || hotel?.pricePerNight || 0;
  const taxesPerNight = activeVariant?.taxes || hotel?.taxes || 0;

  const subtotal = roomPrice * rooms * nights;
  const totalTaxes = taxesPerNight * rooms * nights;

  const smartActiveOffer = getSmartActiveOfferItem();

  const smartMappedOffer =
    smartActiveOffer && !selectedOffer
      ? {
          code: smartActiveOffer.couponCode || smartActiveOffer.slug,
          title: smartActiveOffer.title,
          description:
            smartActiveOffer.description ||
            smartActiveOffer.subtitle ||
            "Smart hotel offer applied.",
          discountAmount: calculateSmartOfferDiscount(
            smartActiveOffer,
            subtotal
          ),
        }
      : null;

  const finalSelectedOffer = selectedOffer || smartMappedOffer;

  const appliedOffer = Number(finalSelectedOffer?.discountAmount || 0);

  const tripSecureTotal =
    tripSecureData.tripSecureStatus === "selected"
      ? tripSecureData.tripSecurePrice
      : 0;

  const cabTotal = cabData.cabStatus === "selected" ? cabData.cabPrice : 0;

  const addOnsTotal =
    addonsData.addonsStatus === "selected" ? addonsData.addonsPrice : 0;

  const benefitPricing = applyBenefitPricing({
    baseAmount: subtotal,

    taxes: totalTaxes,

    insuranceCharges: tripSecureTotal,
    cabCharges: cabTotal,
    addOns: addOnsTotal,

    offerDiscount: appliedOffer,

    promoCredit: wallet.promoCredit,
    earnedCredit: wallet.earnedCredit,
    refundWallet: wallet.refundableBalance,
  });

  const walletCalc = {
    promoUsed: benefitPricing.promoUsed,
    earnedUsed: benefitPricing.earnedUsed,
    refundUsed: benefitPricing.refundUsed,
    finalPayable: benefitPricing.finalPayable,
  };

  const tplCredit =
    benefitPricing.promoUsed +
    benefitPricing.earnedUsed;

  const totalBeforeWallet = benefitPricing.payableBeforeRefundWallet;

  const finalTotal = benefitPricing.finalPayable;

  const earnedOnThisBooking = Math.floor(
    benefitPricing.baseAfterOffer * 0.02
  );

  const isTripSecureDone = tripSecureData.tripSecureStatus !== "pending";
  const isCabDone = cabData.cabStatus !== "pending";
  const isAddonsDone = addonsData.addonsStatus !== "pending";

  const canProceed =
    guestValidation.isValid &&
    isTripSecureDone &&
    isCabDone &&
    isAddonsDone &&
    timeLeft > 0;

  const blockerMessage =
    timeLeft === 0
      ? "Session expired. Please select hotel again."
      : !guestValidation.isValid
      ? "Please fill Guest Detail section."
      : !isTripSecureDone
      ? "Please complete Trip Secure section."
      : !isCabDone
      ? "Please complete Cab section."
      : !isAddonsDone
      ? "Please complete Add-ons section."
      : "";

  if (loading || !hotel) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] text-black">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-xl border border-[#d9e2ec] bg-white p-6 text-lg font-semibold text-[#374151]">
            Loading hotel booking...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f7fb] pb-6 text-black">
      <div className="sticky top-0 z-40 border-b border-[#d7dce3] bg-white md:hidden">
        <div className="flex h-12 items-center gap-3 px-3">
          <button
            type="button"
            onClick={() => router.push("/hotels/results")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e5e7eb] bg-white text-[#111827]"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-black text-[#111827]">
              Hotel Booking
            </div>
            <div className="text-[11px] font-semibold text-[#64748b]">
              Complete guest details and payment
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-12 z-30 bg-[#f5f7fb] md:top-0">
        <HotelBookingTopNav
          timeLeft={formattedTime}
          isExpired={timeLeft === 0}
          activeSection={activeSection}
          onSectionClick={handleSectionScroll}
          sections={[
            { key: "hotelSummary", label: "Hotel Summary", completed: true },
            {
              key: "guestDetail",
              label: "Guest Detail",
              completed: guestValidation.isValid,
            },
            {
              key: "tripSecure",
              label: "Trip Secure",
              completed: isTripSecureDone,
            },
            {
              key: "cab",
              label: "Cab",
              completed: isCabDone,
            },
            {
              key: "addons",
              label: "Addons",
              completed: isAddonsDone,
            },
          ]}
        />
      </div>

      <div className="mx-auto max-w-7xl px-3 py-3 md:px-4 md:py-6">
        <div className="mb-3 flex items-start justify-between gap-3 md:mb-4 md:items-center md:gap-4">
          <button
            type="button"
            onClick={() => router.push("/hotels/results")}
            className="hidden text-[13px] font-bold text-[#0b74ff] hover:underline md:inline"
          >
            ← Modify Search
          </button>

          <div className="min-w-0 text-[12px] font-semibold text-[#6b7280] md:text-right">
            {city
              ? `${city} • ${rooms} Room${rooms > 1 ? "s" : ""}`
              : "Booking flow in progress"}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2.6fr_0.9fr] lg:gap-5">
          <div className="space-y-5">
            <div ref={hotelSummaryRef}>
              <HotelBookingHotelDetailSection
  hotel={hotel}
  selectedVariant={activeVariant}
  checkIn={checkIn}
  checkOut={checkOut}
  rooms={rooms}
  adults={adults}
  offerDiscount={benefitPricing.offerDiscount}
  onRoomChange={(variant) => setSelectedVariant(variant)}
/>
            </div>

            <HotelBookingImportantInfoSection
              coupleFriendly={hotel.coupleFriendly}
            />

            <div ref={guestDetailRef}>
              <HotelBookingGuestDetailSection
                adultCount={adults}
                childCount={children}
                tripMode="domestic"
                onValidationChange={setGuestValidation}
              />
            </div>

            <div ref={tripSecureRef}>
              <HotelBookingTripSecureSection
                isEnabled={guestValidation.isValid}
                onChange={setTripSecureData}
              />
            </div>

            <div className="rounded-xl border border-[#d9e2ec] bg-white p-3 md:p-4">
              <div className="text-[18px] font-extrabold text-[#111827] md:text-[20px]">
                Special Request
              </div>

              <textarea
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                placeholder="Any special request for hotel? Example: early check-in, anniversary setup, high floor, etc."
                className="mt-3 min-h-[110px] w-full rounded-xl border border-[#d9e2ec] p-3 text-[14px] font-medium text-[#111827] outline-none focus:border-[#0b74ff] md:mt-4 md:min-h-[120px] md:p-4"
              />
            </div>

            <div ref={cabRef}>
              <HotelBookingCabSection
                isEnabled={isTripSecureDone}
                onChange={setCabData}
              />
            </div>

            <div ref={addonsRef}>
              <HotelBookingAddonsSection
                isEnabled={isCabDone}
                onChange={setAddonsData}
              />
            </div>
          </div>

          <div className="space-y-4">
            <HotelBookingFareSummaryCard
              roomPrice={roomPrice}
              rooms={rooms}
              nights={nights}
              subtotal={subtotal}
              taxes={totalTaxes}
              tplCredit={tplCredit}
              walletBreakdown={{
                promoUsed: walletCalc.promoUsed,
                earnedUsed: walletCalc.earnedUsed,
                refundUsed: walletCalc.refundUsed,
              }}
              earnedOnThisBooking={earnedOnThisBooking}
              refundWalletAvailable={wallet.refundableBalance}
              useRefundWallet={true}
              appliedOffer={benefitPricing.offerDiscount}
              tripSecureTotal={tripSecureTotal}
              addOnsTotal={addOnsTotal}
              cabTotal={cabTotal}
              tripSecureStatus={tripSecureData.tripSecureStatus}
              cabStatus={cabData.cabStatus}
              addonsStatus={addonsData.addonsStatus}
              finalTotal={finalTotal}
              canProceed={canProceed}
              blockerMessage={blockerMessage}
              buttonLabel="Proceed to Payment"
              onProceed={() => {
                if (!canProceed) return;

                const payload = {
                  serviceType: "hotel",
                  bookingType: "hotel",
                  bookingStatus: "draft",
                  paymentStatus: "pending",

                  hotel,
                  selectedVariant: activeVariant,

                  searchMeta: {
                    city,
                    checkIn,
                    checkOut,
                    rooms,
                    adults,
                    children,
                    nights,
                  },

                  guestValidation,

                  tripSecureSelected:
                    tripSecureData.tripSecureStatus === "selected",
                  tripSecureTotal,
                  tripSecureLabel:
                    tripSecureData.tripSecureStatus === "selected"
                      ? tripSecureData.tripSecureLabel
                      : "Trip Secure skipped",

                  cabSelected: cabData.cabStatus === "selected",
                  cabTotal,
                  cabLabel:
                    cabData.cabStatus === "selected"
                      ? cabData.cabLabel
                      : "Cab skipped",

                  addonsSelected: addonsData.addonsStatus === "selected",
                  addOnsTotal,
                  addonsLabel:
                    addonsData.addonsStatus === "selected"
                      ? addonsData.addonsLabel
                      : "Add-ons skipped",
                  selectedAddonItems: addonsData.selectedItems || [],

                  appliedOffer: benefitPricing.offerDiscount,
                  appliedOfferCode: finalSelectedOffer?.code || "",
                  appliedOfferTitle: finalSelectedOffer?.title || "",
                  offerData: finalSelectedOffer
                    ? {
                        ...finalSelectedOffer,
                        discountAmount: benefitPricing.offerDiscount,
                      }
                    : null,

                  baseAfterOffer: benefitPricing.baseAfterOffer,
                  earnedCreditAmount: earnedOnThisBooking,

                  walletBreakdown: {
                    promoUsed: walletCalc.promoUsed,
                    earnedUsed: walletCalc.earnedUsed,
                    refundUsed: walletCalc.refundUsed,
                    promoAvailable: wallet.promoCredit,
                    earnedAvailable: wallet.earnedCredit,
                    refundWalletAvailable: wallet.refundableBalance,
                    totalWalletUsed:
                      walletCalc.promoUsed +
                      walletCalc.earnedUsed +
                      walletCalc.refundUsed,
                    tplCreditUsed: tplCredit,
                    earnedOnThisBooking,
                  },

                  fareBreakup: {
                    roomPrice,
                    rooms,
                    nights,
                    subtotal,
                    taxes: totalTaxes,
                    tripSecureTotal,
                    cabTotal,
                    addOnsTotal,
                    appliedOffer: benefitPricing.offerDiscount,
                    baseAfterOffer: benefitPricing.baseAfterOffer,
                    totalBeforeWallet,
                    promoUsed: walletCalc.promoUsed,
                    earnedUsed: walletCalc.earnedUsed,
                    refundUsed: walletCalc.refundUsed,
                    tplCredit,
                    finalTotal,
                  },

                  originalBookingBaseline: {
                    amount: finalTotal,
                    payableAmount: finalTotal,
                    totalBeforeWallet,
                    selectedVariantId: activeVariant?.id || "",
                    selectedVariantTitle:
                      activeVariant?.title || "Selected Room",
                    roomPrice,
                    rooms,
                    nights,
                    tripSecureTotal,
                    cabTotal,
                    addOnsTotal,
                  },

                  manageBookingReady: true,

                  specialRequest,
                  finalTotal,
                  timerLeft: timeLeft,
                  timestamp: Date.now(),
                };

                sessionStorage.setItem(
                  "tplHotelBookingData",
                  JSON.stringify(payload)
                );

                router.push("/hotels/payment");
              }}
            />

            <HotelBookingOffersSection
              offers={HOTEL_OFFERS}
              appliedOfferCode={finalSelectedOffer?.code || ""}
              onApplyOffer={(offer) => setSelectedOffer(offer)}
              onRemoveOffer={() => setSelectedOffer(null)}
            />
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </main>
  );
}
