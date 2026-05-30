"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { UserRound, Wallet, Sparkles, BadgeCheck, Tag } from "lucide-react";
import { resolvePackageByRouteId } from "@/app/data/packages/resolvePackage";

import LoginModal from "@/app/components/common/LoginModal";
import MobileInnerBack from "@/app/components/common/mobile/MobileInnerBack";
import PackageHeader from "@/app/components/packages/details/PackageHeader";
import PackageCompactSearchBar from "@/app/components/packages/details/PackageCompactSearchBar";
import PackageTabs from "@/app/components/packages/details/PackageTabs";
import ItineraryTab from "@/app/components/packages/details/ItineraryTab";
import PoliciesTab from "@/app/components/packages/details/PoliciesTab";
import SummaryTab from "@/app/components/packages/details/SummaryTab";
import PriceSidebar from "@/app/components/packages/details/PriceSidebar";
import PackageMediaGrid from "@/app/components/packages/details/PackageMediaGrid";

import PackageChangeFlightModal from "@/app/components/packages/details/PackageChangeFlightModal";
import PackageChangeHotelModal from "@/app/components/packages/details/PackageChangeHotelModal";
import PackageChangeTransferModal from "@/app/components/packages/details/PackageChangeTransferModal";
import PackageChangeMealModal from "@/app/components/packages/details/PackageChangeMealModal";
import PackageChangeActivityModal from "@/app/components/packages/details/PackageChangeActivityModal";

import {
  getInitialPackageSelectionState,
  applyFlightSelection,
  applyHotelSelection,
  applyTransferSelection,
  applyMealSelection,
  applyActivitySelection,
} from "@/app/lib/packages/packageSelectionHelpers";

import {
  getPackageSelectionState,
  savePackageSelectionState,
} from "@/app/lib/packages/packageSelectionStorage";

import { getPackageFlightOptions } from "@/app/lib/packages/packageFlightOptions";
import { getPackageHotelOptions } from "@/app/lib/packages/packageHotelOptions";
import { getPackageTransferOptions } from "@/app/lib/packages/packageTransferOptions";
import { getPackageMealOptions } from "@/app/lib/packages/packageMealOptions";
import { getPackageActivityOptions } from "@/app/lib/packages/packageActivityOptions";
import PackageBookingOffersSection, {
  PackageOfferItem,
} from "@/app/components/packages/details/PackageBookingOffersSection";

import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import { getWallet } from "@/app/lib/wallet/walletStorage";
import { getSavedProfile } from "@/app/lib/account/profileStorage";


import type {
  PackageFlightOption,
  PackageHotelOption,
  PackageTransferOption,
  PackageMealOption,
  PackageActivityOption,
  PackageSelectionState,
} from "@/app/lib/packages/packageSelectionTypes";

type Variant = "withFlight" | "withoutFlight";
type TabKey = "itinerary" | "policies" | "summary";

type Room = {
  adults: number;
  children: number;
};

type ActiveUser = {
  name?: string;
  fullName?: string;
  mobile?: string;
  email?: string;
};

function getActiveUser(): ActiveUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("tpl_auth_session_v1");
    return raw ? JSON.parse(raw)?.user || null : null;
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

  if (profileName && profileName.toLowerCase() !== "pk") {
    return profileName;
  }

  return `User ${String(user.mobile).slice(-4)}`;
}

function formatPrice(value: number) {
  return `₹${Math.abs(Math.round(value || 0)).toLocaleString("en-IN")}`;
}

function resolveSafeVariant(
  pkg: any,
  requestedVariant: string | null
): Variant {
  if (!pkg?.variants) return "withFlight";

  if (
    requestedVariant &&
    (requestedVariant === "withFlight" ||
      requestedVariant === "withoutFlight") &&
    pkg.variants[requestedVariant]
  ) {
    return requestedVariant as Variant;
  }

  if (pkg.variants.withFlight) return "withFlight";
  if (pkg.variants.withoutFlight) return "withoutFlight";

  return "withFlight";
}

function isValidDateString(value?: string | null) {
  if (!value) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

function buildSmartDefaultDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return dateToYMD(date);
}

function dateToYMD(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function ymdToDate(value?: string | null) {
  if (!value || !isValidDateString(value)) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }

  const [y, m, d] = String(value).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function resolveSafeOriginCity(pkg: any, requestedOrigin: string | null) {
  if (requestedOrigin && requestedOrigin.trim()) return requestedOrigin.trim();

  return (
    pkg?.defaultOriginCity ||
    pkg?.originCity ||
    pkg?.variants?.withFlight?.originCity ||
    "Delhi"
  );
}

function sumFareDiff(items: Array<{ fareDiff?: number } | undefined>) {
  return items.reduce((sum, item) => sum + Number(item?.fareDiff || 0), 0);
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

export default function PackageDetailsPage() {
  const params = useParams<{ packageId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const packageId = Array.isArray(params?.packageId)
    ? params.packageId[0]
    : params?.packageId;

  const requestedVariant = searchParams.get("variant");
  const requestedDate = searchParams.get("date");
  const requestedOrigin = searchParams.get("origin");
  const requestedAdults = searchParams.get("adults");
  const requestedChildren = searchParams.get("children");
  const requestedRooms = searchParams.get("rooms");

  const [activeTab, setActiveTab] = useState<TabKey>("itinerary");
  const [variant, setVariant] = useState<Variant>("withFlight");

  const [resolvedDate, setResolvedDate] = useState<string>("");
  const [resolvedOriginCity, setResolvedOriginCity] = useState<string>("");
  const [rooms, setRooms] = useState<Room[]>([{ adults: 2, children: 0 }]);

  const [draftOriginCity, setDraftOriginCity] = useState("");
  const [draftDate, setDraftDate] = useState("");
  const [draftRooms, setDraftRooms] = useState<Room[]>([
    { adults: 2, children: 0 },
  ]);

  const [showFlightModal, setShowFlightModal] = useState(false);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const [selectionState, setSelectionState] =
    useState<PackageSelectionState | null>(null);

const [selectedOffer, setSelectedOffer] =
  useState<PackageOfferItem | null>(null);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);
  const [wallet, setWallet] = useState({
    promoCredit: 0,
    earnedCredit: 0,
    refundableBalance: 0,
  });

  const loadUserAndWallet = () => {
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

  useEffect(() => {
    loadUserAndWallet();

    window.addEventListener(AUTH_UPDATED_EVENT, loadUserAndWallet);
    window.addEventListener("storage", loadUserAndWallet);

    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, loadUserAndWallet);
      window.removeEventListener("storage", loadUserAndWallet);
    };
  }, []);

  const pkg = useMemo(() => {
    if (!packageId) return null;
    return resolvePackageByRouteId(packageId);
  }, [packageId]);

  const resolvedVariant = useMemo(() => {
    return resolveSafeVariant(pkg, requestedVariant);
  }, [pkg, requestedVariant]);

  useEffect(() => {
    setVariant(resolvedVariant);
  }, [resolvedVariant]);

  useEffect(() => {
    const finalDate = isValidDateString(requestedDate)
      ? String(requestedDate)
      : buildSmartDefaultDate();

    setResolvedDate(finalDate);
  }, [requestedDate]);

  useEffect(() => {
    const finalOrigin = resolveSafeOriginCity(pkg, requestedOrigin);
    setResolvedOriginCity(finalOrigin);
  }, [pkg, requestedOrigin]);

  useEffect(() => {
    const adults = Math.max(safePositiveInt(requestedAdults, 2), 1);
    const children = Math.max(safePositiveInt(requestedChildren, 0), 0);
    const roomsCount = Math.max(safePositiveInt(requestedRooms, 1), 1);

    setRooms(buildRoomsFromCounts(adults, children, roomsCount));
  }, [requestedAdults, requestedChildren, requestedRooms]);

  useEffect(() => {
    setDraftOriginCity(resolvedOriginCity || "");
  }, [resolvedOriginCity]);

  useEffect(() => {
    setDraftDate(resolvedDate || buildSmartDefaultDate());
  }, [resolvedDate]);

  useEffect(() => {
    setDraftRooms(rooms);
  }, [rooms]);

  const totalAdults = useMemo(() => {
    return rooms.reduce((sum, room) => sum + room.adults, 0);
  }, [rooms]);

  const totalChildren = useMemo(() => {
    return rooms.reduce((sum, room) => sum + room.children, 0);
  }, [rooms]);

  const totalRooms = useMemo(() => rooms.length, [rooms]);

  const draftAdults = useMemo(() => {
    return draftRooms.reduce((sum, room) => sum + room.adults, 0);
  }, [draftRooms]);

  const draftChildren = useMemo(() => {
    return draftRooms.reduce((sum, room) => sum + room.children, 0);
  }, [draftRooms]);

  const draftTotalRooms = useMemo(() => draftRooms.length, [draftRooms]);

  const hasPendingChanges = useMemo(() => {
    return (
      draftOriginCity !== resolvedOriginCity ||
      draftDate !== resolvedDate ||
      JSON.stringify(draftRooms) !== JSON.stringify(rooms)
    );
  }, [
    draftOriginCity,
    resolvedOriginCity,
    draftDate,
    resolvedDate,
    draftRooms,
    rooms,
  ]);

  useEffect(() => {
    if (!packageId || !pkg) return;

    const finalDate = isValidDateString(requestedDate)
      ? String(requestedDate)
      : buildSmartDefaultDate();

    const safeVariant = resolveSafeVariant(pkg, requestedVariant);
    const finalOrigin = resolveSafeOriginCity(pkg, requestedOrigin);

    const adults = Math.max(safePositiveInt(requestedAdults, 2), 1);
    const children = Math.max(safePositiveInt(requestedChildren, 0), 0);
    const roomsCount = Math.max(safePositiveInt(requestedRooms, 1), 1);

    const needsReplace =
      !requestedDate ||
      !isValidDateString(requestedDate) ||
      !requestedVariant ||
      !requestedOrigin ||
      !requestedAdults ||
      !requestedChildren ||
      !requestedRooms;

    if (needsReplace) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("variant", safeVariant);
      params.set("date", finalDate);
      params.set("origin", finalOrigin);
      params.set("adults", String(adults));
      params.set("children", String(children));
      params.set("rooms", String(roomsCount));

      router.replace(`/packages/${packageId}?${params.toString()}`);
    }
  }, [
    packageId,
    pkg,
    requestedDate,
    requestedVariant,
    requestedOrigin,
    requestedAdults,
    requestedChildren,
    requestedRooms,
    router,
    searchParams,
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [packageId]);

  const selectedVariantData = useMemo(() => {
    if (!pkg?.variants) return null;
    return pkg.variants[variant] || null;
  }, [pkg, variant]);

  const itineraryDays = useMemo(() => {
    return pkg?.itinerary?.length || 0;
  }, [pkg]);

  const durationLabel = useMemo(() => {
    if (!pkg) return "";
    return `${pkg.nights}N/${pkg.days}D`;
  }, [pkg]);

  const destinationCity = useMemo(() => {
    if (!pkg) return "Destination";
    if (Array.isArray(pkg.cities) && pkg.cities.length > 0) return pkg.cities[0];
    if (Array.isArray(pkg.route) && pkg.route.length > 0) return pkg.route[0];
    return "Destination";
  }, [pkg]);

  const draftTravelDateObj = useMemo(() => ymdToDate(draftDate), [draftDate]);

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

  const transferOptions = useMemo(() => {
    return getPackageTransferOptions();
  }, []);

  const mealOptions = useMemo(() => {
    return getPackageMealOptions();
  }, []);

  const activityOptions = useMemo(() => {
    return getPackageActivityOptions({
      packageSlug: pkg?.slug,
      city: destinationCity,
      theme: pkg?.theme || pkg?.category || "",
    });
  }, [pkg, destinationCity]);

  const packageOfferInput = useMemo(() => {
    return {
      routeId: packageId,
      id: packageId,
      slug: pkg?.slug || "",
      title: pkg?.title || "",
      country: Array.isArray(pkg?.countries) ? pkg.countries[0] : "",
      countries: Array.isArray(pkg?.countries) ? pkg.countries : [],
      continent: pkg?.continent || "",
      route: Array.isArray(pkg?.route)
        ? pkg.route.join(" ")
        : String(pkg?.route || ""),
      cities: Array.isArray(pkg?.cities) ? pkg.cities : [],
      theme: pkg?.theme || [],
      themes: Array.isArray(pkg?.theme) ? pkg.theme : [],
      subThemes: Array.isArray(pkg?.subThemes) ? pkg.subThemes : [],
      tags: Array.isArray(pkg?.tags) ? pkg.tags : [],
    };
  }, [packageId, pkg]);

  

  useEffect(() => {
    if (!selectedVariantData || !pkg?.slug) return;

    const stored = getPackageSelectionState(pkg.slug);
    const baseState =
      stored ||
      getInitialPackageSelectionState(selectedVariantData.pricePerPerson);

    const nextFlights =
      Array.isArray(baseState.selectedFlights) &&
      baseState.selectedFlights.length > 0
        ? baseState.selectedFlights
        : buildDefaultIncludedSelections(
            flightOptions,
            selectedVariantData.inclusions.flights || 0
          );

    const nextHotels =
      Array.isArray(baseState.selectedHotels) &&
      baseState.selectedHotels.length > 0
        ? baseState.selectedHotels
        : buildDefaultIncludedSelections(
            hotelOptions,
            selectedVariantData.inclusions.hotels || 0
          );

    const nextTransfers =
      Array.isArray(baseState.selectedTransfers) &&
      baseState.selectedTransfers.length > 0
        ? baseState.selectedTransfers
        : buildDefaultIncludedSelections(
            transferOptions,
            selectedVariantData.inclusions.transfers || 0
          );

    const nextMeals =
      Array.isArray(baseState.selectedMeals) &&
      baseState.selectedMeals.length > 0
        ? baseState.selectedMeals
        : buildDefaultIncludedSelections(
            mealOptions,
            selectedVariantData.inclusions.meals || 0
          );

    const nextActivities =
      Array.isArray(baseState.selectedActivities) &&
      baseState.selectedActivities.length > 0
        ? baseState.selectedActivities
        : buildDefaultIncludedSelections(
            activityOptions,
            selectedVariantData.inclusions.activities || 0
          );

    const hydratedState: PackageSelectionState = {
      ...baseState,
      basePrice: selectedVariantData.pricePerPerson,
      selectedFlights: nextFlights,
      selectedHotels: nextHotels,
      selectedTransfers: nextTransfers,
      selectedMeals: nextMeals,
      selectedActivities: nextActivities,
      flightFareDiff: sumFareDiff(nextFlights),
      hotelFareDiff: sumFareDiff(nextHotels),
      transferFareDiff: sumFareDiff(nextTransfers),
      mealFareDiff: sumFareDiff(nextMeals),
      activityFareDiff: sumFareDiff(nextActivities),
      finalPrice:
        Number(selectedVariantData.pricePerPerson || 0) +
        sumFareDiff(nextFlights) +
        sumFareDiff(nextHotels) +
        sumFareDiff(nextTransfers) +
        sumFareDiff(nextMeals) +
        sumFareDiff(nextActivities),
    };

    setSelectionState(hydratedState);
    savePackageSelectionState(pkg.slug, hydratedState);
  }, [
    selectedVariantData,
    flightOptions,
    hotelOptions,
    transferOptions,
    mealOptions,
    activityOptions,
    pkg?.slug,
  ]);

  useEffect(() => {
    if (!packageId || typeof window === "undefined") return;

    sessionStorage.setItem(
      "packageBookingSearchContext",
      JSON.stringify({
        packageId,
        packageSlug: pkg?.slug || "",
        originCity: resolvedOriginCity,
        travelDate: resolvedDate,
        variant,
        adults: totalAdults,
        children: totalChildren,
        rooms: totalRooms,
        roomDetails: rooms,
      })
    );
  }, [
    packageId,
    pkg?.slug,
    resolvedOriginCity,
    resolvedDate,
    variant,
    totalAdults,
    totalChildren,
    totalRooms,
    rooms,
  ]);

  const handleVariantChange = (nextVariant: Variant) => {
    setVariant(nextVariant);

    if (!packageId) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("variant", nextVariant);
    params.set("date", resolvedDate || buildSmartDefaultDate());
    params.set("origin", resolvedOriginCity || "Delhi");
    params.set("adults", String(totalAdults));
    params.set("children", String(totalChildren));
    params.set("rooms", String(totalRooms));

    router.replace(`/packages/${packageId}?${params.toString()}`);
  };

  const handleApplyCompactSearch = () => {
    if (!packageId) return;

    setResolvedOriginCity(draftOriginCity || "Delhi");
    setResolvedDate(draftDate || buildSmartDefaultDate());
    setRooms(draftRooms);

    const params = new URLSearchParams(searchParams.toString());
    params.set("variant", variant);
    params.set("date", draftDate || buildSmartDefaultDate());
    params.set("origin", draftOriginCity || "Delhi");
    params.set("adults", String(draftAdults));
    params.set("children", String(draftChildren));
    params.set("rooms", String(draftTotalRooms));

    router.replace(`/packages/${packageId}?${params.toString()}`);
  };

  const handleFlightSelect = (flight: PackageFlightOption, index: number) => {
    if (!selectionState || !pkg?.slug) return;
    const nextState = applyFlightSelection(selectionState, flight, index);
    setSelectionState(nextState);
    savePackageSelectionState(pkg.slug, nextState);
  };

  const handleHotelSelect = (hotel: PackageHotelOption, index: number) => {
    if (!selectionState || !pkg?.slug) return;
    const nextState = applyHotelSelection(selectionState, hotel, index);
    setSelectionState(nextState);
    savePackageSelectionState(pkg.slug, nextState);
  };

  const handleTransferSelect = (
    transfer: PackageTransferOption,
    index: number
  ) => {
    if (!selectionState || !pkg?.slug) return;
    const nextState = applyTransferSelection(selectionState, transfer, index);
    setSelectionState(nextState);
    savePackageSelectionState(pkg.slug, nextState);
  };

  const handleMealSelect = (meal: PackageMealOption, index: number) => {
    if (!selectionState || !pkg?.slug) return;
    const nextState = applyMealSelection(selectionState, meal, index);
    setSelectionState(nextState);
    savePackageSelectionState(pkg.slug, nextState);
  };

  const handleActivitySelect = (
    activity: PackageActivityOption,
    index: number
  ) => {
    if (!selectionState || !pkg?.slug) return;
    const nextState = applyActivitySelection(selectionState, activity, index);
    setSelectionState(nextState);
    savePackageSelectionState(pkg.slug, nextState);
  };

  if (!pkg || !selectedVariantData || !selectionState) {
    return <div className="p-10 text-center text-black">Loading...</div>;
  }

  return (
    <div className="relative overflow-x-hidden bg-white pb-6 lg:pb-0">
      <div className="border-b border-slate-100 bg-white px-3 py-2 lg:hidden">
        <div className="mx-auto max-w-7xl">
          <MobileInnerBack title="Back" />
        </div>
      </div>

      <div className="border-b bg-[#f3f8ff]">
        <div className="max-w-7xl mx-auto px-3 py-2 lg:px-2">
          <PackageCompactSearchBar
            originCity={draftOriginCity}
            setOriginCity={setDraftOriginCity}
            travelDate={draftTravelDateObj}
            setTravelDate={(date: Date) => setDraftDate(dateToYMD(date))}
            rooms={draftRooms}
            setRooms={setDraftRooms}
            onApply={handleApplyCompactSearch}
            hasPendingChanges={hasPendingChanges}
          />
        </div>
      </div>

      <div className="z-40 bg-white border-b shadow-sm lg:sticky lg:top-0">
        <div className="max-w-7xl mx-auto px-3 py-2 lg:px-2 lg:py-1">
          <PackageHeader
            title={pkg.title}
            durationLabel={durationLabel}
            route={pkg.route}
            packageType="Customizable"
            variant={variant}
            onVariantChange={handleVariantChange}
            travelDateLabel=""
            originCity=""
            onChangeDate={() => {}}
            onChangeCity={() => {}}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="pt-0">
          <PackageMediaGrid
            packageId={packageId}
            media={pkg.media}
            packageTitle={pkg.title}
            destinationCity={destinationCity}
            travelDate={resolvedDate}
            originCity={resolvedOriginCity}
            variant={variant}
            route={pkg.route || []}
            selectedHotel={selectionState.selectedHotels?.[0] || null}
            selectedActivity={selectionState.selectedActivities?.[0] || null}
            selectedTransfer={selectionState.selectedTransfers?.[0] || null}
          />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            {activeUser?.mobile ? (
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <UserRound className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-black uppercase tracking-wide text-blue-800">
                    Logged in as
                  </div>

                  <div className="mt-0.5 truncate text-[15px] font-extrabold text-[#111827]">
                    {getDisplayNameFromUser(activeUser)}
                  </div>

                  <div className="mt-1 text-[12px] font-semibold text-blue-700">
                    TPL Wallet benefits will be auto-applied on eligible package value.
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white">
                    <Wallet className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="text-[15px] font-extrabold text-[#111827]">
                      Login to use TPL Wallet
                    </div>

                    <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
                      Promo Credit, Earned Credit and Refund Wallet can reduce payable amount.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowLoginModal(true)}
                  className="w-full shrink-0 rounded-xl bg-orange-500 px-4 py-2.5 text-[12px] font-bold text-white hover:bg-orange-600 sm:w-auto sm:py-2"
                >
                  Login / Signup
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#d9e2ec] bg-white p-4">
            <div className="text-[12px] font-black uppercase tracking-wide text-[#6b7280]">
              Wallet Available
            </div>

            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-slate-50 px-2 py-2">
                <div className="text-[10px] font-bold text-[#6b7280]">
                  Promo
                </div>
                <div className="mt-1 text-[12px] font-black text-[#111827]">
                  {formatPrice(wallet.promoCredit)}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 px-2 py-2">
                <div className="text-[10px] font-bold text-[#6b7280]">
                  Earned
                </div>
                <div className="mt-1 text-[12px] font-black text-[#111827]">
                  {formatPrice(wallet.earnedCredit)}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 px-2 py-2">
                <div className="text-[10px] font-bold text-[#6b7280]">
                  Refund
                </div>
                <div className="mt-1 text-[12px] font-black text-[#111827]">
                  {formatPrice(wallet.refundableBalance)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-12 gap-4 lg:mt-2 lg:gap-8">
          <div className="col-span-12 lg:col-span-9">
            <div className="overflow-hidden rounded-2xl border bg-white lg:overflow-visible">
              <div className="mt-2 z-20 bg-white">
                <div className="px-3 pt-0 border-b sm:px-4">
                  <PackageTabs activeTab={activeTab} onChange={setActiveTab} />
                </div>

                {activeTab === "itinerary" && (
                  <div className="px-3 py-3 border-b bg-white sm:px-4">
                    <div className="rounded-xl border bg-[#EAF3FF] px-3 py-3 sm:px-4">
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3 items-center">
                        <button
                          type="button"
                          className="rounded-xl bg-white border border-[#d6e4f5] px-2 py-2 text-center hover:shadow-sm transition sm:px-3"
                        >
                          <div className="text-[11px] font-semibold text-[#4b5563]">
                            Day Plan
                          </div>
                          <div className="mt-1 text-[18px] font-extrabold text-[#111827]">
                            {itineraryDays > 0 ? itineraryDays : 0}
                          </div>
                          <div className="mt-1 text-[11px] font-bold text-[#6b7280]">
                            Included
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowFlightModal(true)}
                          className="rounded-xl bg-white border border-[#d6e4f5] px-2 py-2 text-center hover:shadow-sm transition sm:px-3"
                        >
                          <div className="text-[11px] font-semibold text-[#4b5563]">
                            Flights
                          </div>
                          <div className="mt-1 text-[18px] font-extrabold text-[#111827]">
                            {selectedVariantData.inclusions.flights || 0}
                          </div>
                          <div className="mt-1 text-[11px] font-bold text-blue-600">
                            Manage
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowHotelModal(true)}
                          className="rounded-xl bg-white border border-[#d6e4f5] px-2 py-2 text-center hover:shadow-sm transition sm:px-3"
                        >
                          <div className="text-[11px] font-semibold text-[#4b5563]">
                            Hotels
                          </div>
                          <div className="mt-1 text-[18px] font-extrabold text-[#111827]">
                            {selectedVariantData.inclusions.hotels || 0}
                          </div>
                          <div className="mt-1 text-[11px] font-bold text-blue-600">
                            Manage
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowTransferModal(true)}
                          className="rounded-xl bg-white border border-[#d6e4f5] px-2 py-2 text-center hover:shadow-sm transition sm:px-3"
                        >
                          <div className="text-[11px] font-semibold text-[#4b5563]">
                            Transfers
                          </div>
                          <div className="mt-1 text-[18px] font-extrabold text-[#111827]">
                            {selectedVariantData.inclusions.transfers || 0}
                          </div>
                          <div className="mt-1 text-[11px] font-bold text-blue-600">
                            Manage
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowActivityModal(true)}
                          className="rounded-xl bg-white border border-[#d6e4f5] px-2 py-2 text-center hover:shadow-sm transition sm:px-3"
                        >
                          <div className="text-[11px] font-semibold text-[#4b5563]">
                            Activities
                          </div>
                          <div className="mt-1 text-[18px] font-extrabold text-[#111827]">
                            {selectedVariantData.inclusions.activities || 0}
                          </div>
                          <div className="mt-1 text-[11px] font-bold text-blue-600">
                            Manage
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowMealModal(true)}
                          className="rounded-xl bg-white border border-[#d6e4f5] px-2 py-2 text-center hover:shadow-sm transition sm:px-3"
                        >
                          <div className="text-[11px] font-semibold text-[#4b5563]">
                            Meals
                          </div>
                          <div className="mt-1 text-[18px] font-extrabold text-[#111827]">
                            {selectedVariantData.inclusions.meals || 0}
                          </div>
                          <div className="mt-1 text-[11px] font-bold text-blue-600">
                            Manage
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-0 py-0">
                {activeTab === "itinerary" && (
                  <ItineraryTab
                    itinerary={pkg.itinerary}
                    travelDate={resolvedDate}
                    onChangeFlight={() => setShowFlightModal(true)}
                    onChangeHotel={() => setShowHotelModal(true)}
                    onChangeTransfer={() => setShowTransferModal(true)}
                    onChangeMeal={() => setShowMealModal(true)}
                    onChangeActivity={() => setShowActivityModal(true)}
                    selectedFlightLabels={(selectionState.selectedFlights || []).map(
                      (flight: PackageFlightOption) =>
                        `${flight.airline}${
                          flight.departureTime ? ` • ${flight.departureTime}` : ""
                        }`
                    )}
                    selectedHotelLabels={(selectionState.selectedHotels || []).map(
                      (hotel: PackageHotelOption) =>
                        `${hotel.hotelName}${
                          hotel.roomType ? ` • ${hotel.roomType}` : ""
                        }`
                    )}
                    selectedTransferLabels={(selectionState.selectedTransfers || []).map(
                      (transfer: PackageTransferOption) => transfer.title
                    )}
                    selectedMealLabels={(selectionState.selectedMeals || []).map(
                      (meal: PackageMealOption) => meal.title
                    )}
                    selectedActivityLabels={(
                      selectionState.selectedActivities || []
                    ).map((activity: PackageActivityOption) => activity.title)}
                    includedFlightLabels={buildDefaultIncludedSelections(
                      flightOptions,
                      selectedVariantData.inclusions.flights || 0
                    ).map(
                      (flight: PackageFlightOption) =>
                        `${flight.airline}${
                          flight.departureTime ? ` • ${flight.departureTime}` : ""
                        }`
                    )}
                    includedHotelLabels={buildDefaultIncludedSelections(
                      hotelOptions,
                      selectedVariantData.inclusions.hotels || 0
                    ).map(
                      (hotel: PackageHotelOption) =>
                        `${hotel.hotelName}${
                          hotel.roomType ? ` • ${hotel.roomType}` : ""
                        }`
                    )}
                    includedTransferLabels={buildDefaultIncludedSelections(
                      transferOptions,
                      selectedVariantData.inclusions.transfers || 0
                    ).map((transfer: PackageTransferOption) => transfer.title)}
                    includedMealLabels={buildDefaultIncludedSelections(
                      mealOptions,
                      selectedVariantData.inclusions.meals || 0
                    ).map((meal: PackageMealOption) => meal.title)}
                    includedActivityLabels={buildDefaultIncludedSelections(
                      activityOptions,
                      selectedVariantData.inclusions.activities || 0
                    ).map((activity: PackageActivityOption) => activity.title)}
                  />
                )}

                {activeTab === "policies" && <PoliciesTab />}

                {activeTab === "summary" && (
                  <SummaryTab
                    pkg={pkg}
                    itinerary={pkg.itinerary}
                    inclusions={selectedVariantData.inclusions}
                    selectionState={selectionState}
                    travelDate={resolvedDate}
                    originCity={resolvedOriginCity}
                    variant={variant}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-3">
            <div className="space-y-4">
              <PriceSidebar
  slug={pkg.slug}
  pricePerPerson={selectionState.finalPrice}
  inclusions={selectedVariantData.inclusions}
  selectionState={selectionState}
  ctaText="Proceed to Booking"
  travelDate={resolvedDate}
  originCity={resolvedOriginCity}
  variant={variant}
  packageOfferInput={packageOfferInput}
/>

<PackageBookingOffersSection
  packageOfferInput={packageOfferInput}
  baseAmount={selectionState.basePrice || 0}
  appliedOfferCode={selectedOffer?.code || ""}
  onApplyOffer={(offer) => setSelectedOffer(offer)}
  onRemoveOffer={() => setSelectedOffer(null)}
/>
            </div>
          </div>
        </div>
      </div>

      <PackageChangeFlightModal
        isOpen={showFlightModal}
        onClose={() => setShowFlightModal(false)}
        originCity={resolvedOriginCity}
        destinationCity={destinationCity}
        travelDate={resolvedDate}
        options={flightOptions}
        segmentCount={selectedVariantData.inclusions.flights || 1}
        selectedFlights={selectionState.selectedFlights || []}
        onSelectFlight={handleFlightSelect}
      />

      <PackageChangeHotelModal
        isOpen={showHotelModal}
        onClose={() => setShowHotelModal(false)}
        city={destinationCity}
        nights={Number(pkg?.nights || 1)}
        checkInDate={resolvedDate}
        options={hotelOptions}
        stayCount={selectedVariantData.inclusions.hotels || 1}
        selectedHotels={selectionState.selectedHotels || []}
        onSelectHotel={handleHotelSelect}
      />

      <PackageChangeTransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        options={transferOptions}
        transferCount={selectedVariantData.inclusions.transfers || 1}
        selectedTransfers={selectionState.selectedTransfers || []}
        onSelectTransfer={handleTransferSelect}
        city={destinationCity}
        travelDate={resolvedDate}
      />

      <PackageChangeMealModal
        isOpen={showMealModal}
        onClose={() => setShowMealModal(false)}
        options={mealOptions}
        mealCount={selectedVariantData.inclusions.meals || 1}
        selectedMeals={selectionState.selectedMeals || []}
        onSelectMeal={handleMealSelect}
        city={destinationCity}
        checkInDate={resolvedDate}
        nights={Number(pkg?.nights || 1)}
        selectedHotels={selectionState.selectedHotels || []}
        hotelOptions={hotelOptions}
      />

      <PackageChangeActivityModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        options={activityOptions}
        activityCount={selectedVariantData.inclusions.activities || 1}
        selectedActivities={selectionState.selectedActivities || []}
        onSelectActivity={handleActivitySelect}
        city={destinationCity}
        travelDate={resolvedDate}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          loadUserAndWallet();
        }}
      />
    </div>
  );
}
