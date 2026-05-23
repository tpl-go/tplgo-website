"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import BookingTopNav from "@/app/components/booking/packages/BookingTopNav";
import BookingPackageSummary from "@/app/components/booking/packages/BookingPackageSummary";
import BookingTravellersSection from "@/app/components/booking/packages/BookingTravellersSection";
import BookingAddOnsSection from "@/app/components/booking/packages/BookingAddOnsSection";
import BookingItinerarySection from "@/app/components/booking/packages/BookingItinerarySection";
import BookingCancellationSection from "@/app/components/booking/packages/BookingCancellationSection";
import BookingPriceCard from "@/app/components/booking/packages/BookingPriceCard";
import BookingPackageOffersSection, {
  type PackageOfferItem,
} from "@/app/components/booking/packages/BookingPackageOffersSection";
import LoginModal from "@/app/components/common/LoginModal";

import { resolvePackageBySlug } from "@/app/data/packages/resolvePackage";
import { getPackageSelectionState } from "@/app/lib/packages/packageSelectionStorage";

import { getPackageFlightOptions } from "@/app/lib/packages/packageFlightOptions";
import { getPackageHotelOptions } from "@/app/lib/packages/packageHotelOptions";
import { getPackageTransferOptions } from "@/app/lib/packages/packageTransferOptions";
import { getPackageMealOptions } from "@/app/lib/packages/packageMealOptions";
import { getPackageActivityOptions } from "@/app/lib/packages/packageActivityOptions";

import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";
import { getWallet } from "@/app/lib/wallet/walletStorage";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import { getSavedProfile } from "@/app/lib/account/profileStorage";

import {
  getSmartActiveOfferItem,
  calculateSmartOfferDiscount,
} from "@/app/lib/smartOffers";

import type {
  PackageFlightOption,
  PackageHotelOption,
  PackageTransferOption,
  PackageMealOption,
  PackageActivityOption,
} from "@/app/lib/packages/packageSelectionTypes";

type VariantKey = "withFlight" | "withoutFlight";

type Room = {
  adults: number;
  children: number;
};

type TravellerValidationPayload = {
  travellers: Array<{
    id: string;
    travellerType: "adult" | "child";
    label: string;
    firstName: string;
    lastName: string;
    gender: string;
    roomLabel?: string;
  }>;
  contactDetails: {
    countryCode: string;
    mobile: string;
    email: string;
  };
  gstDetails: {
    hasGst: boolean;
    state: string;
    saveBillingToProfile: boolean;
  };
  allRequiredTravellersCompleted: boolean;
  contactValid: boolean;
  canProceed: boolean;
};

type BookingSearchContext = {
  packageId?: string;
  packageSlug?: string;
  originCity?: string;
  travelDate?: string;
  variant?: VariantKey;
  adults?: number;
  children?: number;
  rooms?: number;
  roomDetails?: Room[];
};

type SelectionItem = {
  title?: string;
  airline?: string;
  flightNumber?: string;
  hotelName?: string;
  roomType?: string;
  city?: string;
  mealPlan?: string;
  starRating?: number;
  from?: string;
  to?: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  vehicleType?: string;
  subtitle?: string;
  description?: string;
  category?: string;
  fareDiff?: number;
  included?: boolean;
};

type PackageSelectionStateShape = {
  basePrice: number;
  selectedFlights: SelectionItem[];
  selectedHotels: SelectionItem[];
  selectedTransfers: SelectionItem[];
  selectedMeals: SelectionItem[];
  selectedActivities: SelectionItem[];
  flightFareDiff: number;
  hotelFareDiff: number;
  transferFareDiff: number;
  mealFareDiff: number;
  activityFareDiff: number;
  finalPrice: number;
};

type FareSnapshot = {
  basePrice: number;
  upgradedDiffTotal: number;
  feesAndTaxes: number;
  couponDiscount: number;
  tplCreditUsed: number;
  grandTotal: number;
  appliedCoupon: string;
};

function getActiveUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("tpl_auth_session_v1");
    return raw ? JSON.parse(raw)?.user : null;
  } catch {
    return null;
  }
}

function getDisplayNameFromUser(user: any) {
  if (!user?.mobile) return "User";

  const sessionName = String(user?.fullName || "").trim();
  if (sessionName) return sessionName;

  const profile = getSavedProfile(user.mobile);
  const profileName = `${profile.firstName || ""} ${
    profile.lastName || ""
  }`.trim();

  if (profileName && profileName.toLowerCase() !== "pk") return profileName;

  return `User ${String(user.mobile).slice(-4)}`;
}

function buildDefaultDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split("T")[0];
}

function safePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.floor(parsed);
}

function buildRoomsFromCounts(
  adultsCount: number,
  childrenCount: number,
  roomsCount: number
): Room[] {
  const safeRooms = Math.max(roomsCount, 1);
  const safeAdults = Math.max(adultsCount, 1);
  const safeChildren = Math.max(childrenCount, 0);

  const rooms: Room[] = Array.from({ length: safeRooms }, () => ({
    adults: 1,
    children: 0,
  }));

  let remainingAdults = safeAdults - safeRooms;
  let roomIndex = 0;

  while (remainingAdults > 0) {
    if (rooms[roomIndex].adults < 4) {
      rooms[roomIndex].adults += 1;
      remainingAdults -= 1;
    }
    roomIndex = (roomIndex + 1) % safeRooms;
  }

  let remainingChildren = safeChildren;
  roomIndex = 0;

  while (remainingChildren > 0) {
    if (rooms[roomIndex].adults + rooms[roomIndex].children < 6) {
      rooms[roomIndex].children += 1;
      remainingChildren -= 1;
    }
    roomIndex = (roomIndex + 1) % safeRooms;
  }

  return rooms;
}

function buildDefaultIncludedSelections<T extends { included?: boolean }>(
  options: T[],
  count: number
): T[] {
  if (!Array.isArray(options) || count <= 0) return [];

  const includedOptions = options.filter((item) => item?.included);

  if (includedOptions.length === 0) {
    return Array.from({ length: count }, () => options[0]).filter(Boolean);
  }

  return Array.from(
    { length: count },
    (_, index) => includedOptions[index] || includedOptions[0]
  ).filter(Boolean);
}

function sumFareDiff(items: Array<{ fareDiff?: number } | undefined>) {
  return items.reduce((sum, item) => sum + Number(item?.fareDiff || 0), 0);
}

function pickSelectedOrIncluded<T extends { fareDiff?: number }>(
  selectedItems: T[] | undefined,
  fallbackItems: T[],
  requiredCount: number
) {
  const cleanSelected = Array.isArray(selectedItems)
    ? selectedItems.filter(Boolean)
    : [];

  if (cleanSelected.length > 0) {
    return cleanSelected;
  }

  return fallbackItems.slice(0, requiredCount);
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const requestedVariant = searchParams.get("variant") as VariantKey | null;

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [wallet, setWallet] = useState({
    promoCredit: 0,
    earnedCredit: 0,
    refundableBalance: 0,
  });

  const [travellerValidation, setTravellerValidation] =
    useState<TravellerValidationPayload | null>(null);

  const [packageSelectionState, setPackageSelectionState] =
    useState<PackageSelectionStateShape | null>(null);

  const [selectedOffer, setSelectedOffer] =
    useState<PackageOfferItem | null>(null);

  const [fareSnapshot, setFareSnapshot] = useState<FareSnapshot>({
    basePrice: 0,
    upgradedDiffTotal: 0,
    feesAndTaxes: 2728,
    couponDiscount: 0,
    tplCreditUsed: 0,
    grandTotal: 0,
    appliedCoupon: "",
  });

  useEffect(() => {
    const syncUserAndWallet = () => {
      const user = getActiveUser();
      setActiveUser(user);

      if (user?.mobile) {
        setWallet(getWallet(user.mobile));
      } else {
        setWallet({
          promoCredit: 0,
          earnedCredit: 0,
          refundableBalance: 0,
        });
      }
    };

    syncUserAndWallet();

    window.addEventListener(AUTH_UPDATED_EVENT, syncUserAndWallet);
    window.addEventListener("storage", syncUserAndWallet);

    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, syncUserAndWallet);
      window.removeEventListener("storage", syncUserAndWallet);
    };
  }, []);

  const handleFareChange = useCallback((fare: FareSnapshot) => {
    setFareSnapshot((prev) => {
      const isSame =
        prev.basePrice === fare.basePrice &&
        prev.upgradedDiffTotal === fare.upgradedDiffTotal &&
        prev.feesAndTaxes === fare.feesAndTaxes &&
        prev.couponDiscount === fare.couponDiscount &&
        prev.tplCreditUsed === fare.tplCreditUsed &&
        prev.grandTotal === fare.grandTotal &&
        prev.appliedCoupon === fare.appliedCoupon;

      return isSame ? prev : fare;
    });
  }, []);

  const pkg = useMemo(() => {
    if (!slug) return null;
    return resolvePackageBySlug(slug);
  }, [slug]);

  const bookingContext: BookingSearchContext | null = useMemo(() => {
    if (typeof window === "undefined") return null;

    try {
      const raw = sessionStorage.getItem("packageBookingSearchContext");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const selectedVariantKey: VariantKey = useMemo(() => {
    if (!pkg?.variants) return "withFlight";

    if (
      requestedVariant &&
      (requestedVariant === "withFlight" ||
        requestedVariant === "withoutFlight") &&
      pkg.variants[requestedVariant]
    ) {
      return requestedVariant;
    }

    if (bookingContext?.variant && pkg.variants[bookingContext.variant]) {
      return bookingContext.variant;
    }

    if (pkg.variants.withFlight) return "withFlight";
    if (pkg.variants.withoutFlight) return "withoutFlight";

    return "withFlight";
  }, [pkg, requestedVariant, bookingContext]);

  const selectedVariant = pkg?.variants?.[selectedVariantKey];

  const resolvedDate = useMemo(() => {
    return (
      searchParams.get("date") ||
      bookingContext?.travelDate ||
      buildDefaultDate()
    );
  }, [searchParams, bookingContext]);

  const resolvedOriginCity = useMemo(() => {
    return (
      searchParams.get("origin") ||
      bookingContext?.originCity ||
      pkg?.defaultOriginCity ||
      pkg?.originCity ||
      pkg?.variants?.withFlight?.originCity ||
      "Delhi"
    );
  }, [searchParams, bookingContext, pkg]);

  const rooms = useMemo(() => {
    if (bookingContext?.roomDetails?.length) {
      return bookingContext.roomDetails;
    }

    const adults = Math.max(
      safePositiveInt(searchParams.get("adults"), bookingContext?.adults || 2),
      1
    );
    const children = Math.max(
      safePositiveInt(
        searchParams.get("children"),
        bookingContext?.children || 0
      ),
      0
    );
    const roomsCount = Math.max(
      safePositiveInt(searchParams.get("rooms"), bookingContext?.rooms || 1),
      1
    );

    return buildRoomsFromCounts(adults, children, roomsCount);
  }, [searchParams, bookingContext]);

  const totalAdults = useMemo(
    () => rooms.reduce((sum, room) => sum + room.adults, 0),
    [rooms]
  );

  const totalChildren = useMemo(
    () => rooms.reduce((sum, room) => sum + room.children, 0),
    [rooms]
  );

  const totalRooms = useMemo(() => rooms.length, [rooms]);

  const requiredTravellers = useMemo(() => Math.max(totalAdults, 1), [
    totalAdults,
  ]);

  const destinationCity = useMemo(() => {
    if (!pkg) return "Destination";

    if (Array.isArray(pkg.cities) && pkg.cities.length > 0) {
      return pkg.cities[0];
    }

    if (Array.isArray(pkg.route) && pkg.route.length > 0) {
      return pkg.route[0];
    }

    return "Destination";
  }, [pkg]);

  const isInternationalTrip = useMemo(() => {
    if (Array.isArray(pkg?.countries) && pkg.countries.length > 0) {
      return pkg.countries.some(
        (country: string) => String(country).trim().toLowerCase() !== "india"
      );
    }

    if ((pkg as any)?.country) {
      return String((pkg as any).country).trim().toLowerCase() !== "india";
    }

    return false;
  }, [pkg]);

  const features = useMemo(() => {
    return {
      flights: selectedVariant?.inclusions?.flights ?? 0,
      hotels: selectedVariant?.inclusions?.hotels ?? 0,
      transfers: selectedVariant?.inclusions?.transfers ?? 0,
      activities: selectedVariant?.inclusions?.activities ?? 0,
      meals: selectedVariant?.inclusions?.meals ?? 0,
    };
  }, [selectedVariant]);

  const flightOptions = useMemo(() => {
    return getPackageFlightOptions({
      originCity: resolvedOriginCity || "Delhi",
      destinationCity,
      travelDate: resolvedDate,
    });
  }, [resolvedOriginCity, destinationCity, resolvedDate]);

  const hotelOptions = useMemo(() => {
    return getPackageHotelOptions({
      city: destinationCity,
      nights: Number(pkg?.nights || 1),
    });
  }, [destinationCity, pkg?.nights]);

  const transferOptions = useMemo(() => getPackageTransferOptions(), []);
  const mealOptions = useMemo(() => getPackageMealOptions(), []);

  const activityOptions = useMemo(() => {
    return getPackageActivityOptions({
      packageSlug: pkg?.slug,
      city: destinationCity,
      theme: pkg?.theme || pkg?.category || "",
    });
  }, [pkg, destinationCity]);

  const includedFlightSelections = useMemo(() => {
    if (!selectedVariant) return [];
    return buildDefaultIncludedSelections(
      flightOptions,
      selectedVariant.inclusions?.flights || 0
    );
  }, [flightOptions, selectedVariant]);

  const includedHotelSelections = useMemo(() => {
    if (!selectedVariant) return [];
    return buildDefaultIncludedSelections(
      hotelOptions,
      selectedVariant.inclusions?.hotels || 0
    );
  }, [hotelOptions, selectedVariant]);

  const includedTransferSelections = useMemo(() => {
    if (!selectedVariant) return [];
    return buildDefaultIncludedSelections(
      transferOptions,
      selectedVariant.inclusions?.transfers || 0
    );
  }, [transferOptions, selectedVariant]);

  const includedMealSelections = useMemo(() => {
    if (!selectedVariant) return [];
    return buildDefaultIncludedSelections(
      mealOptions,
      selectedVariant.inclusions?.meals || 0
    );
  }, [mealOptions, selectedVariant]);

  const includedActivitySelections = useMemo(() => {
    if (!selectedVariant) return [];
    return buildDefaultIncludedSelections(
      activityOptions,
      selectedVariant.inclusions?.activities || 0
    );
  }, [activityOptions, selectedVariant]);

  useEffect(() => {
    if (!selectedVariant || !pkg?.slug) return;

    const stored = getPackageSelectionState(
      pkg.slug
    ) as PackageSelectionStateShape | null;

    const mergedFlights = pickSelectedOrIncluded(
      stored?.selectedFlights,
      includedFlightSelections,
      selectedVariant.inclusions?.flights || 0
    );

    const mergedHotels = pickSelectedOrIncluded(
      stored?.selectedHotels,
      includedHotelSelections,
      selectedVariant.inclusions?.hotels || 0
    );

    const mergedTransfers = pickSelectedOrIncluded(
      stored?.selectedTransfers,
      includedTransferSelections,
      selectedVariant.inclusions?.transfers || 0
    );

    const mergedMeals = pickSelectedOrIncluded(
      stored?.selectedMeals,
      includedMealSelections,
      selectedVariant.inclusions?.meals || 0
    );

    const mergedActivities = pickSelectedOrIncluded(
      stored?.selectedActivities,
      includedActivitySelections,
      selectedVariant.inclusions?.activities || 0
    );

    const nextState: PackageSelectionStateShape = {
      basePrice: Number(stored?.basePrice || selectedVariant.pricePerPerson || 0),
      selectedFlights: mergedFlights,
      selectedHotels: mergedHotels,
      selectedTransfers: mergedTransfers,
      selectedMeals: mergedMeals,
      selectedActivities: mergedActivities,
      flightFareDiff: sumFareDiff(mergedFlights),
      hotelFareDiff: sumFareDiff(mergedHotels),
      transferFareDiff: sumFareDiff(mergedTransfers),
      mealFareDiff: sumFareDiff(mergedMeals),
      activityFareDiff: sumFareDiff(mergedActivities),
      finalPrice:
        Number(stored?.basePrice || selectedVariant.pricePerPerson || 0) +
        sumFareDiff(mergedFlights) +
        sumFareDiff(mergedHotels) +
        sumFareDiff(mergedTransfers) +
        sumFareDiff(mergedMeals) +
        sumFareDiff(mergedActivities),
    };

    setPackageSelectionState(nextState);
  }, [
    slug,
    selectedVariantKey,
    selectedVariant,
    includedFlightSelections,
    includedHotelSelections,
    includedTransferSelections,
    includedMealSelections,
    includedActivitySelections,
    pkg?.slug,
  ]);

  const dayPlans = useMemo(() => {
    if (!pkg?.itinerary) return [];

    return pkg.itinerary.map((day: any, index: number) => ({
      day: day.day ?? index + 1,
      title: day.title || `Day ${day.day ?? index + 1}`,
      dateLabel: day.dateLabel || "",
      items: Array.isArray(day.items) ? day.items : [],
      included: {
        flights: day.included?.flights ?? 0,
        hotels: day.included?.hotels ?? 0,
        transfers: day.included?.transfers ?? 0,
        activities: day.included?.activities ?? 0,
        meals: day.included?.meals ?? 0,
      },
    }));
  }, [pkg]);

  const canProceedFromTravellers = useMemo(() => {
    if (!travellerValidation) return false;
    return travellerValidation.canProceed;
  }, [travellerValidation]);

  const includedFlightLabels = useMemo(() => {
    return includedFlightSelections.map(
      (flight: PackageFlightOption) =>
        `${flight.airline}${
          flight.departureTime ? ` • ${flight.departureTime}` : ""
        }${
          flight.from && flight.to ? ` • ${flight.from} → ${flight.to}` : ""
        }`
    );
  }, [includedFlightSelections]);

  const includedHotelLabels = useMemo(() => {
    return includedHotelSelections.map(
      (hotel: PackageHotelOption) =>
        `${hotel.hotelName}${hotel.roomType ? ` • ${hotel.roomType}` : ""}${
          hotel.city ? ` • ${hotel.city}` : ""
        }`
    );
  }, [includedHotelSelections]);

  const includedTransferLabels = useMemo(() => {
    return includedTransferSelections.map(
      (transfer: PackageTransferOption) =>
        `${transfer.title}${
          transfer.vehicleType ? ` • ${transfer.vehicleType}` : ""
        }`
    );
  }, [includedTransferSelections]);

  const includedMealLabels = useMemo(() => {
    return includedMealSelections.map(
      (meal: PackageMealOption) => meal.title || "Included meal"
    );
  }, [includedMealSelections]);

  const includedActivityLabels = useMemo(() => {
    return includedActivitySelections.map(
      (activity: PackageActivityOption) => activity.title || "Included activity"
    );
  }, [includedActivitySelections]);

  if (!pkg || !selectedVariant || !packageSelectionState) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] text-black flex items-center justify-center">
        <div className="text-lg font-semibold">Loading package...</div>
      </main>
    );
  }

  const benefitBaseAmount =
    Number(packageSelectionState.basePrice || selectedVariant.pricePerPerson || 0) *
    requiredTravellers;

  const smartActiveOffer = getSmartActiveOfferItem();

  const smartMappedOffer =
    smartActiveOffer && !selectedOffer
      ? {
          code: smartActiveOffer.couponCode || smartActiveOffer.slug,
          title: smartActiveOffer.title,
          description:
            smartActiveOffer.description ||
            smartActiveOffer.subtitle ||
            "Smart holiday package offer applied.",
          discountAmount: calculateSmartOfferDiscount(
            smartActiveOffer,
            benefitBaseAmount || 25000
          ),
        }
      : null;

  const finalSelectedOffer = selectedOffer || smartMappedOffer;
  const appliedOffer = finalSelectedOffer?.discountAmount || 0;

  const liveBenefitPricing = applyBenefitPricing({
    baseAmount: fareSnapshot.basePrice,
    taxes: fareSnapshot.feesAndTaxes,
    addOns: fareSnapshot.upgradedDiffTotal,
    offerDiscount: appliedOffer,
    promoCredit: wallet.promoCredit,
    earnedCredit: wallet.earnedCredit,
    refundWallet: wallet.refundableBalance,
  });

  const liveWalletCalc = {
    promoUsed: liveBenefitPricing.promoUsed,
    earnedUsed: liveBenefitPricing.earnedUsed,
    refundUsed: liveBenefitPricing.refundUsed,
    finalPayable: liveBenefitPricing.finalPayable,
  };

  const liveTplCreditUsed =
    liveBenefitPricing.promoUsed +
    liveBenefitPricing.earnedUsed +
    liveBenefitPricing.refundUsed;

  const liveTotalBeforeWallet = liveBenefitPricing.payableBeforeRefundWallet;

  const liveEarnedOnThisBooking = Math.floor(
    liveBenefitPricing.baseAfterOffer * 0.02
  );

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-black">
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#f5f7fb",
        }}
      >
        <BookingTopNav />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "16px",
          }}
        >
          <div style={{ width: "76%", minWidth: 0 }}>
            <div className="mb-4">
              <BookingPackageSummary
                packageTitle={pkg.title}
                route={pkg.route}
                nights={pkg.nights}
                days={pkg.days}
                fareSnapshot={fareSnapshot}
                variant={selectedVariantKey}
                travelDate={resolvedDate}
                originCity={resolvedOriginCity}
                rooms={rooms}
                totalAdults={totalAdults}
                totalChildren={totalChildren}
                totalRooms={totalRooms}
                pricePerPerson={selectedVariant.pricePerPerson}
                totalPrice={
                  packageSelectionState.finalPrice ||
                  selectedVariant.pricePerPerson
                }
                packageSlug={pkg.slug}
                selectionState={packageSelectionState}
                includedFlightLabels={includedFlightLabels}
                includedHotelLabels={includedHotelLabels}
                includedTransferLabels={includedTransferLabels}
                includedMealLabels={includedMealLabels}
                includedActivityLabels={includedActivityLabels}
              />
            </div>

            <div className="mb-4 rounded-2xl border border-[#f3d7c7] bg-[#fff7ed] px-5 py-3 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[15px] font-extrabold text-slate-900">
                    {activeUser?.mobile
                      ? `Logged in as ${getDisplayNameFromUser(activeUser)}`
                      : "Login Now to avail exciting offers"}
                  </div>

                  <div className="mt-1 text-[13px] text-slate-600">
                    {activeUser?.mobile
                      ? "Saved traveller details and wallet benefits can be used for faster booking."
                      : "Use saved travellers, Promo Credit, Earned Credit and Refund Wallet."}
                  </div>
                </div>

                {!activeUser?.mobile ? (
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(true)}
                    className="h-[40px] rounded-xl border border-slate-300 bg-white px-5 text-[13px] font-extrabold text-slate-900 transition hover:border-sky-400 hover:text-sky-600"
                  >
                    LOGIN
                  </button>
                ) : null}
              </div>
            </div>

            <div
              style={{
                background: "#ffffff",
                border: "1px solid #d9e2ec",
                borderRadius: "0",
                overflow: "hidden",
                boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
              }}
            >
              <BookingTravellersSection
                rooms={rooms}
                isInternationalTrip={isInternationalTrip}
                onValidationChange={setTravellerValidation}
              />

              <BookingAddOnsSection isInternationalTrip={isInternationalTrip} />

              <BookingItinerarySection
                features={features}
                dayPlans={dayPlans}
                exclusions={pkg.exclusions || []}
                packageSelectionState={packageSelectionState}
                includedFlightLabels={includedFlightLabels}
                includedHotelLabels={includedHotelLabels}
                includedTransferLabels={includedTransferLabels}
                includedMealLabels={includedMealLabels}
                includedActivityLabels={includedActivityLabels}
                travelDate={resolvedDate}
              />

              <BookingCancellationSection travelDate={resolvedDate} />
            </div>
          </div>

          <div style={{ width: "24%", minWidth: 0 }}>
            <div className="space-y-4">
              <BookingPriceCard
                packageData={pkg}
                selectedVariant={selectedVariant}
                selectedVariantKey={selectedVariantKey}
                totalAdults={requiredTravellers}
                couponDiscount={liveBenefitPricing.offerDiscount}
                couponCode={finalSelectedOffer?.code || ""}
                canProceedFromTravellers={canProceedFromTravellers}
                packageSelectionState={packageSelectionState}
                tplCreditUsed={liveTplCreditUsed}
                walletBreakdown={{
                  promoUsed: liveWalletCalc.promoUsed,
                  earnedUsed: liveWalletCalc.earnedUsed,
                  refundUsed: liveWalletCalc.refundUsed,
                }}
                earnedOnThisBooking={liveEarnedOnThisBooking}
                refundWalletAvailable={wallet.refundableBalance}
                onFareChange={handleFareChange}
                onProceed={() => {
                  const benefitPricing = applyBenefitPricing({
                    baseAmount: fareSnapshot.basePrice,
                    taxes: fareSnapshot.feesAndTaxes,
                    addOns: fareSnapshot.upgradedDiffTotal,
                    offerDiscount: appliedOffer,
                    promoCredit: wallet.promoCredit,
                    earnedCredit: wallet.earnedCredit,
                    refundWallet: wallet.refundableBalance,
                  });

                  const totalBeforeWallet =
                    benefitPricing.payableBeforeRefundWallet;

                  const walletCalc = {
                    promoUsed: benefitPricing.promoUsed,
                    earnedUsed: benefitPricing.earnedUsed,
                    refundUsed: benefitPricing.refundUsed,
                    finalPayable: benefitPricing.finalPayable,
                  };

                  const tplCreditUsed =
                    walletCalc.promoUsed +
                    walletCalc.earnedUsed +
                    walletCalc.refundUsed;

                  const finalPayable = benefitPricing.finalPayable;

                  const earnedCreditAmount = Math.floor(
                    benefitPricing.baseAfterOffer * 0.02
                  );

                  if (travellerValidation) {
                    const firstTraveller = travellerValidation.travellers?.[0];

                    const leadTravellerPayload = {
                      name: firstTraveller
                        ? `${firstTraveller.firstName} ${firstTraveller.lastName}`.trim()
                        : "Lead Traveller",
                      email: travellerValidation.contactDetails?.email || "",
                      mobile: `${
                        travellerValidation.contactDetails?.countryCode || "+91"
                      }-${travellerValidation.contactDetails?.mobile || ""}`,
                      travellers: travellerValidation.travellers || [],
                      contactDetails: travellerValidation.contactDetails || {},
                      gstDetails: travellerValidation.gstDetails || {},
                    };

                    sessionStorage.setItem(
                      "tplPaymentLeadTraveller",
                      JSON.stringify(leadTravellerPayload)
                    );
                  }

                  const bookingReviewPayload = {
                    serviceType: "package",
                    bookingType: "package",
                    bookingStatus: "draft",
                    paymentStatus: "pending",
                    manageBookingReady: true,

                    appliedOffer,
                    appliedOfferCode: finalSelectedOffer?.code || "",
                    appliedOfferTitle: finalSelectedOffer?.title || "",
                    offerData: finalSelectedOffer,

                    summary: {
                      packageSlug: pkg.slug,
                      packageTitle: pkg.title,
                      route: pkg.route,
                      nights: pkg.nights,
                      days: pkg.days,
                      variant: selectedVariantKey,
                      travelDate: resolvedDate,
                      originCity: resolvedOriginCity,
                      rooms,
                      totalAdults,
                      totalChildren,
                      totalRooms,
                      isInternationalTrip,
                      selectedVariant,
                      packageSelectionState,
                      includedFlightLabels,
                      includedHotelLabels,
                      includedTransferLabels,
                      includedMealLabels,
                      includedActivityLabels,
                      features,
                    },

                    traveller: travellerValidation || null,

                    addOn: {
                      isInternationalTrip,
                    },

                    itinerary: {
                      travelDate: resolvedDate,
                      dayPlans,
                      features,
                      packageSelectionState,
                      includedFlightLabels,
                      includedHotelLabels,
                      includedTransferLabels,
                      includedMealLabels,
                      includedActivityLabels,
                    },

                    cancellation: {
                      exclusions: pkg.exclusions || [],
                    },

                    fare: {
                      basePrice: fareSnapshot.basePrice,
                      upgradedDiffTotal: fareSnapshot.upgradedDiffTotal,
                      feesAndTaxes: fareSnapshot.feesAndTaxes,
                      couponDiscount: fareSnapshot.couponDiscount,
                      baseAfterOffer: benefitPricing.baseAfterOffer,
                      earnedCreditAmount,
                      tplCreditUsed,
                      grandTotal: finalPayable,
                      totalBeforeWallet,
                      appliedCoupon: fareSnapshot.appliedCoupon,

                      appliedOffer,
                      appliedOfferCode: finalSelectedOffer?.code || "",
                      appliedOfferTitle: finalSelectedOffer?.title || "",
                      offerData: finalSelectedOffer,

                      walletBreakdown: {
                        promoUsed: walletCalc.promoUsed,
                        earnedUsed: walletCalc.earnedUsed,
                        refundUsed: walletCalc.refundUsed,
                        promoAvailable: wallet.promoCredit,
                        earnedAvailable: wallet.earnedCredit,
                        refundWalletAvailable: wallet.refundableBalance,
                        totalWalletUsed: tplCreditUsed,
                        earnedOnThisBooking: earnedCreditAmount,
                      },
                    },

                    originalBookingBaseline: {
                      amount: finalPayable,
                      payableAmount: finalPayable,
                      totalBeforeWallet,
                      packageSlug: pkg.slug,
                      packageTitle: pkg.title,
                      variant: selectedVariantKey,
                      travelDate: resolvedDate,
                      originCity: resolvedOriginCity,
                      basePrice: fareSnapshot.basePrice,
                      upgradedDiffTotal: fareSnapshot.upgradedDiffTotal,
                      feesAndTaxes: fareSnapshot.feesAndTaxes,
                    },

                    timestamp: Date.now(),
                  };

                  sessionStorage.setItem(
                    "tplPackageBookingReview",
                    JSON.stringify(bookingReviewPayload)
                  );

                  router.push(
                    `/packages/payment/${slug}?variant=${selectedVariantKey}&date=${resolvedDate}&origin=${resolvedOriginCity}&adults=${totalAdults}&children=${totalChildren}&rooms=${totalRooms}`
                  );
                }}
              />

              <BookingPackageOffersSection
  appliedOfferCode={finalSelectedOffer?.code || ""}
  bookingValue={benefitBaseAmount || 25000}
  packageContext={{
    title: pkg.title,
    country: Array.isArray(pkg.countries) ? pkg.countries[0] : "",
    countries: Array.isArray(pkg.countries) ? pkg.countries : [],
    continent: pkg.continent || "",
    route: pkg.route || [],
    cities: Array.isArray(pkg.cities) ? pkg.cities : [],
    theme: pkg.theme || [],
    themes: Array.isArray(pkg.theme) ? pkg.theme : [],
    subThemes: Array.isArray(pkg.subThemes) ? pkg.subThemes : [],
    tags: Array.isArray(pkg.tags) ? pkg.tags : [],
    isInternationalTrip,
  }}
  onApplyOffer={(offer) => setSelectedOffer(offer)}
  onRemoveOffer={() => setSelectedOffer(null)}
/>
            </div>
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