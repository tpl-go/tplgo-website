"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { UserRound, Wallet } from "lucide-react";
import LoginModal from "@/app/components/common/LoginModal";
import MobileInnerBack from "@/app/components/common/mobile/MobileInnerBack";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import { getWallet } from "@/app/lib/wallet/walletStorage";
import { getLoggedInDisplayName } from "@/app/lib/auth/displayName";

import CruiseDetailHeader from "./CruiseDetailHeader";
import CruiseDetailTabs from "./CruiseDetailTabs";
import CruiseDetailMediaGrid from "./CruiseDetailMediaGrid";
import CruisePriceSidebar from "./CruisePriceSidebar";
import CruiseDetailOfferSection from "./CruiseDetailOfferSection";
import CruiseInfoTab from "./CruiseInfoTab";
import CruisePoliciesTab from "./CruisePoliciesTab";
import CruiseShipPreviewModal from "../result/CruiseShipPreviewModal";
import CruiseCabinTab from "./CruiseCabinTab";
import CruiseDeckPlanTab from "../result/CruiseDeckPlanTab";
import SmartResultsOfferStrip from "@/app/components/smartOffers/SmartResultsOfferStrip";
import {
  getSmartActiveOfferItem,
  calculateSmartOfferDiscount,
} from "@/app/lib/smartOffers";
import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";
import {
  resolveCruiseDetailFromSelection,
  type CruiseDetailResolved,
} from "@/app/lib/cruise/resolveCruiseDetail";
import { buildCruiseResultsFromSearch } from "@/app/lib/cruise/buildCruiseResultsFromSearch";
import {
  cruiseCabinTypesSeed,
  cruiseNationalityOptions,
  cruiseSailingPlanSeed,
} from "@/app/lib/cruise/cruiseCabinData";
import { cruiseDeckPlansSeed } from "@/app/lib/cruise/cruiseDeckPlanData";
import type { CruiseResultItem } from "@/app/lib/cruise/cruiseResultTypes";
import type { CruiseMainTabKey } from "@/app/lib/cruise/cruiseDetailTypes";
import type { CruiseCabinPricingSummary } from "@/app/lib/cruise/cruiseCabinPricing";

type SelectedCabinItem = {
  cabinKey: string;
  cabinId: string;
  rows: {
    id: string;
    adults: number;
    children: number;
    infants: number;
    nationality: string;
  }[];
  selectedAt: number;
};

type CabinAssignmentMeta = {
  cabinId: string;
  assignmentMode: "auto" | "select";
  deckCabinNumber?: string | null;
};

type Props = {
  cruiseId?: string;
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
  return getLoggedInDisplayName(user);
}

function formatPrice(value: number) {
  return `₹${Math.abs(Math.round(value || 0)).toLocaleString("en-IN")}`;
}

function buildCabinsFromDetailRates(
  baseCabins: typeof cruiseCabinTypesSeed,
  rates: CruiseDetailResolved["rates"]
) {
  const templates: Record<string, any> = {
    inside: {
      id: "inside-cabin",
      code: "IN",
      name: "Inside Cabin",
      shortDescription: "Comfortable interior cabin for value-focused sailing.",
      fullDescription:
        "A smart and comfortable interior cabin designed for restful nights and practical cruise stays.",
      tags: ["Inside", "Value"],
    },
    outside: {
      id: "outside-cabin",
      code: "OUT",
      name: "Outside Cabin",
      shortDescription: "Ocean-view cabin with comfortable onboard space.",
      fullDescription:
        "Enjoy natural light and outside views with a comfortable cabin layout for your cruise journey.",
      tags: ["Outside", "Ocean View"],
    },
    balcony: {
      id: "balcony-cabin",
      code: "BAL",
      name: "Balcony Cabin",
      shortDescription: "Private balcony cabin with sea-view comfort.",
      fullDescription:
        "A premium balcony cabin with private outdoor space, sea views, and upgraded comfort.",
      tags: ["Balcony", "Premium"],
    },
    suite: {
      id: "suite-cabin",
      code: "STE",
      name: "Suite",
      shortDescription: "Spacious suite with premium cruise comfort.",
      fullDescription:
        "A spacious suite cabin with premium comfort, upgraded space, and elevated onboard experience.",
      tags: ["Suite", "Luxury"],
    },
  };

  const fallbackImages = baseCabins[0]?.images || [];

  const generatedCabins = (
    [
      ["inside", rates.inside],
      ["outside", rates.outside],
      ["balcony", rates.balcony],
      ["suite", rates.suite],
    ] as const
  )
    .filter(([, price]) => Number(price || 0) > 0)
    .map(([key, price], index) => {
      const template = templates[key];

      return {
        ...baseCabins[index % baseCabins.length],
        ...template,
        pricePerPerson: Number(price || 0),
        images: baseCabins[index % baseCabins.length]?.images || fallbackImages,
        maxAdults: baseCabins[index % baseCabins.length]?.maxAdults || 4,
        maxChildren: baseCabins[index % baseCabins.length]?.maxChildren || 2,
        maxInfants: baseCabins[index % baseCabins.length]?.maxInfants || 1,
        maxGuests: baseCabins[index % baseCabins.length]?.maxGuests || 4,
        deckInfo:
          baseCabins[index % baseCabins.length]?.deckInfo ||
          "Deck allocation subject to availability",
        amenities:
          baseCabins[index % baseCabins.length]?.amenities ||
          baseCabins[0]?.amenities ||
          [],
      };
    });

  return generatedCabins.length > 0 ? generatedCabins : baseCabins;
}

function isCabinRowsValid(
  rows: {
    id: string;
    adults: number;
    children: number;
    infants: number;
    nationality: string;
  }[]
) {
  if (!rows.length) return false;

  return rows.every((row) => {
    const total = row.adults + row.children + row.infants;
    return total > 0 && row.adults >= 1 && !!row.nationality;
  });
}

export default function CruiseDetailPage({ cruiseId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ cruiseId: string }>();

  const resolvedCruiseId =
    (typeof cruiseId === "string" && cruiseId) ||
    (typeof params?.cruiseId === "string" ? params.cruiseId : "");

  const [activeTab, setActiveTab] = useState<CruiseMainTabKey>("cabin");
  const [detail, setDetail] = useState<CruiseDetailResolved | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<CruiseResultItem | null>(null);

  const [selectedCabins, setSelectedCabins] = useState<SelectedCabinItem[]>([]);
  const [pricingSummary, setPricingSummary] =
    useState<CruiseCabinPricingSummary | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(0);

  const [isMounted, setIsMounted] = useState(false);
  const [offerRefreshKey, setOfferRefreshKey] = useState(0);
  const [appliedCruiseOffer, setAppliedCruiseOffer] = useState<any | null>(null);

  const [showLoginModal, setShowLoginModal] = useState(false);
const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);
const [wallet, setWallet] = useState({
  promoCredit: 0,
  earnedCredit: 0,
  refundableBalance: 0,
});

  const [cabinAssignmentMeta, setCabinAssignmentMeta] = useState<
    CabinAssignmentMeta[]
  >([]);

  const [selectedDeckCabin, setSelectedDeckCabin] = useState<{
    deckId: string;
    deckTitle: string;
    cabinId: string;
    cabinNumber: string;
  } | null>(null);

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

  const selectedDate = searchParams.get("date");
  const selectedSailingId = searchParams.get("sailingId");

  useEffect(() => {
    setIsMounted(true);

    const refreshOffer = () => setOfferRefreshKey((prev) => prev + 1);

    window.addEventListener("TPL_ACTIVE_OFFER_UPDATED", refreshOffer);
    window.addEventListener("TPL_SMART_OFFER_UPDATED", refreshOffer);
    window.addEventListener("storage", refreshOffer);

    return () => {
      window.removeEventListener("TPL_ACTIVE_OFFER_UPDATED", refreshOffer);
      window.removeEventListener("TPL_SMART_OFFER_UPDATED", refreshOffer);
      window.removeEventListener("storage", refreshOffer);
    };
  }, []);

useEffect(() => {
  loadUserAndWallet();

  window.addEventListener(AUTH_UPDATED_EVENT, loadUserAndWallet);
  window.addEventListener("storage", loadUserAndWallet);

  return () => {
    window.removeEventListener(AUTH_UPDATED_EVENT, loadUserAndWallet);
    window.removeEventListener("storage", loadUserAndWallet);
  };
}, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [resolvedCruiseId, selectedDate, selectedSailingId]);

  useEffect(() => {
    if (!resolvedCruiseId) {
      setDetail(null);
      return;
    }

    const resolved = resolveCruiseDetailFromSelection(
      resolvedCruiseId,
      selectedDate
    );
    setDetail(resolved);
  }, [resolvedCruiseId, selectedDate, selectedSailingId]);

  const selectedCabinSummary = useMemo(() => {
    if (!detail) return [];

    return [
      { label: "Inside", value: detail.rates.inside },
      { label: "Outside", value: detail.rates.outside },
      { label: "Balcony", value: detail.rates.balcony },
      { label: "Suite", value: detail.rates.suite },
    ];
  }, [detail]);

  const cabinTabData = useMemo(() => {
    if (!detail) return null;

    return {
      cabins: buildCabinsFromDetailRates(cruiseCabinTypesSeed, detail.rates),
      nationalityOptions: cruiseNationalityOptions,
      sailingPlan:
        detail.itinerary?.length
          ? detail.itinerary.map((item, index) => ({
              day: item.day ?? index + 1,
              title: item.title,
              description:
                item.description || "Cruise day details will appear here.",
              dateLabel: item.dateLabel,
            }))
          : cruiseSailingPlanSeed,
      diningHighlights: detail.diningHighlights || [
        "Multi-cuisine dining venues available onboard.",
        "Selected sailings may include buffet and specialty dining options.",
        "Dining schedules may vary by sailing date and itinerary.",
      ],
      entertainmentHighlights: detail.entertainmentHighlights || [
        "Live shows and onboard performances.",
        "Deck activities and family entertainment zones.",
        "Evening experiences and leisure options onboard.",
      ],
      cabinPolicies:
        detail.policies?.map((item) => item.description) || [
          "Cabin allotment is subject to availability.",
          "Fare rules and cancellation terms apply as per selected cabin type.",
          "Nationality and occupancy rules may impact final pricing.",
        ],
      deckPlans: detail.deckPlans || cruiseDeckPlansSeed,
      cruiseInfoBlocks: detail.cruiseInfoBlocks || [
        { title: "Cruise Line", value: detail.cruiseLine },
        { title: "Ship", value: detail.shipName },
        { title: "Departure Port", value: detail.departurePort },
        { title: "Arrival Port", value: detail.arrivalPort },
        { title: "Sailing Date", value: detail.sailingDate || "On Request" },
      ],
    };
  }, [detail]);

  const allSelectedCabinsValid =
    selectedCabins.length > 0 &&
    selectedCabins.every((item) => isCabinRowsValid(item.rows));

  const bookingEnabled =
    !!pricingSummary?.cabins?.length &&
    allSelectedCabinsValid &&
    timerSecondsLeft > 0;

  const startingSidebarPriceOptions = [
    Number(detail?.rates?.inside || 0),
    Number(detail?.rates?.outside || 0),
    Number(detail?.rates?.balcony || 0),
    Number(detail?.rates?.suite || 0),
  ].filter((price) => price > 0);

  const startingSidebarPrice =
    startingSidebarPriceOptions.length > 0
      ? Math.min(...startingSidebarPriceOptions)
      : 0;

  const cruiseBaseAmount = pricingSummary?.cabinsTotal || startingSidebarPrice || 0;

  const cruiseTaxesAmount = pricingSummary?.taxesAndFees || 0;

  const smartActiveOffer = useMemo(() => {
  if (appliedCruiseOffer) return appliedCruiseOffer;
  if (!isMounted) return null;
  return getSmartActiveOfferItem();
}, [isMounted, offerRefreshKey, appliedCruiseOffer]);

  const activeOfferCode =
    smartActiveOffer?.couponCode || smartActiveOffer?.slug || "";

  const activeOfferDiscount = useMemo(() => {
    if (!smartActiveOffer || cruiseBaseAmount <= 0) return 0;

    const offerService = String(
      (smartActiveOffer as any)?.service || ""
    ).toLowerCase();

    const allowed =
      offerService === "cruise" ||
      offerService === "all" ||
      !offerService;

    if (!allowed) return 0;

    return Math.min(
      calculateSmartOfferDiscount(smartActiveOffer, cruiseBaseAmount),
      cruiseBaseAmount
    );
  }, [smartActiveOffer, cruiseBaseAmount]);

  const cruisePricingRuleSummary = useMemo(() => {
    return applyBenefitPricing({
      baseAmount: cruiseBaseAmount,
      taxes: cruiseTaxesAmount,
      offerDiscount: activeOfferDiscount,
      promoCredit: 0,
      earnedCredit: 0,
      refundWallet: 0,
    });
  }, [cruiseBaseAmount, cruiseTaxesAmount, activeOfferDiscount]);

  const sidebarPrice =
    bookingEnabled && pricingSummary?.grandTotal
      ? pricingSummary.grandTotal
      : startingSidebarPrice || 0;

  function handleProceedToBooking() {
    if (!detail || !bookingEnabled) return;

    const itineraryDates = (detail.itinerary || [])
      .map((item) => item.dateLabel)
      .filter(Boolean) as string[];

    const sailingStartDate = itineraryDates[0] || detail.sailingDate || null;
    const sailingEndDate =
      itineraryDates[itineraryDates.length - 1] || detail.sailingDate || null;

    const visitingPorts =
      detail.routeMap
        ?.map((item) => item.name?.trim())
        .filter(
          (name): name is string =>
            !!name &&
            !/^cruising$/i.test(name) &&
            !/^mid sailing$/i.test(name)
        )
        .filter((name, index, arr) => arr.indexOf(name) === index) || [];

    const payload = {
      cruiseId: detail.cruiseId,
      title: detail.title,

      appliedOffer: cruisePricingRuleSummary.offerDiscount,
      appliedOfferCode: activeOfferCode,
      appliedOfferTitle: smartActiveOffer?.title || "",
      offerData: smartActiveOffer || null,

      pricingRuleSummary: cruisePricingRuleSummary,
      baseAmount: cruisePricingRuleSummary.baseAmount,
      baseAfterOffer: cruisePricingRuleSummary.baseAfterOffer,
      totalBeforeWallet: cruisePricingRuleSummary.payableBeforeRefundWallet,
      finalPayable: cruisePricingRuleSummary.finalPayable,
      earnedCreditAmount: Math.floor(
        cruisePricingRuleSummary.baseAfterOffer * 0.02
      ),

      sailingDate: detail.sailingDate || null,
      sailingDateId: detail.sailingDateId || null,
      departurePort: detail.departurePort || null,
      arrivalPort: detail.arrivalPort || null,
      route: detail.route || null,
      visitingPorts,
      sailingStartDate,
      sailingEndDate,

      selectedCabins,
      pricingSummary,
      cabinAssignmentMeta,
      selectedDeckCabin,

      timerLeft: timerSecondsLeft,
    };

    sessionStorage.setItem("tplCruiseBookingDraft", JSON.stringify(payload));

    router.push(`/cruise/booking?cruiseId=${detail.cruiseId}`);
  }

  function handleOpenGallery() {
    if (!detail) return;

    const resultItems = buildCruiseResultsFromSearch({
      destinationId: null,
      departurePortId: null,
      sailingDate: detail.sailingDate,
      sailingMonth: detail.sailingDate ? detail.sailingDate.slice(0, 7) : null,
      durationId: null,
      adults: 2,
      children: 0,
      infants: 0,
    });

    const matched =
      resultItems.find((item) => item.id === detail.cruiseId) ||
      resultItems.find((item) => detail.cruiseId.startsWith(item.id)) ||
      resultItems[0] ||
      null;

    if (matched) {
      setPreviewItem(matched);
      setPreviewOpen(true);
    }
  }

  if (!detail || !cabinTabData) {
    return (
      <div className="bg-white p-10 text-center text-black">
        Cruise details not found
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden bg-white pb-[calc(env(safe-area-inset-bottom)+128px)] lg:pb-0">
      <div className="border-b bg-white lg:sticky lg:top-0 lg:z-40">
        <div className="mx-auto max-w-7xl px-3 pb-0 pt-3 lg:px-2 lg:py-1">
          <div className="mb-3 lg:hidden">
            <MobileInnerBack title="Cruise Details" />
          </div>

          <CruiseDetailHeader
            title={detail.title}
            tripLabel={detail.tripLabel}
            durationLabel={detail.durationLabel}
            route={detail.route}
            cruiseLine={detail.cruiseLine}
            shipName={detail.shipName}
            sailingDate={detail.sailingDate}
            departurePort={detail.departurePort}
            arrivalPort={detail.arrivalPort}
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 lg:px-4">
        <div className="pt-0">
          <CruiseDetailMediaGrid
            cruiseId={detail.cruiseId}
            media={{
              coverImage: detail.media?.[0],
              videoUrl: detail.videoUrl || "",
              cruiseHighlights: detail.cruiseHighlights || [],
              activitiesLabel: "Activities",
              propertyLabel: "Ship Areas",
              routeMap: detail.routeMap || [],
            }}
            onOpenGallery={handleOpenGallery}
          />

          <div className="mt-3">
            <SmartResultsOfferStrip
              service="cruise"
              destination={detail.departurePort || detail.route || detail.title}
              bookingValue={cruiseBaseAmount || detail.rates?.inside || 50000}
            />
          </div>
<div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr]">
  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3 lg:p-4">
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
            TPL Wallet benefits will be auto-applied on eligible cruise value.
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
          className="h-11 w-full shrink-0 rounded-xl bg-orange-500 px-4 py-2 text-[12px] font-bold text-white hover:bg-orange-600 sm:w-auto"
        >
          Login / Signup
        </button>
      </div>
    )}
  </div>

  <div className="rounded-2xl border border-[#d9e2ec] bg-white p-3 lg:p-4">
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

        </div>

        <div className="mt-3 grid grid-cols-12 gap-4 lg:mt-2 lg:gap-8">
          <div className="col-span-12 lg:col-span-9">
            <div className="overflow-visible rounded-2xl border bg-white">
              <div className="sticky top-0 z-30 mt-0 bg-white lg:top-[90px] lg:mt-2">
                <div className="border-b px-3 pt-2 lg:px-4 lg:pt-0">
                  <CruiseDetailTabs
                    activeTab={activeTab}
                    onChange={setActiveTab}
                  />
                </div>
              </div>

              <div className="px-0 py-0">
                {activeTab === "cabin" ? (
                  <div className="p-3 lg:p-4">
                    <CruiseCabinTab
                      data={cabinTabData}
                      onCabinSelectionChange={setSelectedCabins}
                      onPricingSummaryChange={setPricingSummary}
                      onTimerStateChange={setTimerSecondsLeft}
                      onCabinAssignmentMetaChange={setCabinAssignmentMeta}
                      offerDiscount={cruisePricingRuleSummary.offerDiscount}
                    />
                  </div>
                ) : null}

                {activeTab === "cruiseInfo" ? (
                  <CruiseInfoTab
                    overview={detail.overview}
                    cruiseLine={detail.cruiseLine}
                    shipName={detail.shipName}
                    departurePort={detail.departurePort}
                    arrivalPort={detail.arrivalPort}
                    sailingDate={detail.sailingDate}
                    cabinSummary={selectedCabinSummary}
                  />
                ) : null}

                {activeTab === "cruiseDeckPlan" ? (
                  <div className="p-3 lg:p-4">
                    <CruiseDeckPlanTab
                      deckPlans={cabinTabData.deckPlans}
                      mode="view"
                      selectedCabinNumber={selectedDeckCabin?.cabinNumber || null}
                      onCabinSelect={(payload) => setSelectedDeckCabin(payload)}
                    />
                  </div>
                ) : null}

                {activeTab === "policy" ? (
                  <CruisePoliciesTab policies={detail.policies} />
                ) : null}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-3">
            <div className="w-full space-y-4">
              <CruisePriceSidebar
                cruiseId={detail.cruiseId}
                title={detail.tripLabel}
                sailingDate={detail.sailingDate}
                price={sidebarPrice}
                taxesText={
                  bookingEnabled && pricingSummary?.taxesAndFees
                    ? `Excludes taxes and fees: ₹${pricingSummary.taxesAndFees.toLocaleString(
                        "en-IN"
                      )}`
                    : "Excludes taxes and fees: ₹0"
                }
                ctaText={
                  bookingEnabled
                    ? `Proceed to Booking (${Math.floor(
                        timerSecondsLeft / 60
                      )}:${String(timerSecondsLeft % 60).padStart(2, "0")})`
                    : "Choose Cabin to Continue"
                }
                onProceed={handleProceedToBooking}
                disabled={!bookingEnabled}
                pricingSummary={pricingSummary}
                offerCode={activeOfferCode}
                offerTitle={smartActiveOffer?.title || "Best Cruise Offer Activated"}
                offerDiscount={cruisePricingRuleSummary.offerDiscount}
                cabinAssignmentMeta={cabinAssignmentMeta}
                wallet={wallet}
activeUserMobile={activeUser?.mobile || ""}
              />

              <CruiseDetailOfferSection
  cruiseOfferInput={{
    cruiseId: detail.cruiseId,
    title: detail.title,
    route: detail.route,
    departurePort: detail.departurePort,
    arrivalPort: detail.arrivalPort,
    cruiseLine: detail.cruiseLine,
    shipName: detail.shipName,
  }}
  baseAmount={cruisePricingRuleSummary.baseAmount}
  appliedOfferCode={activeOfferCode}
  onApplyOffer={(offer) => {
    setAppliedCruiseOffer(offer.offer || null);
    setOfferRefreshKey((prev) => prev + 1);
  }}
  onRemoveOffer={() => {
    setAppliedCruiseOffer(null);
    setOfferRefreshKey((prev) => prev + 1);
  }}
/>
            </div>
          </div>
        </div>
      </div>

      {previewItem ? (
        <CruiseShipPreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          item={previewItem}
        />
      ) : null}

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
