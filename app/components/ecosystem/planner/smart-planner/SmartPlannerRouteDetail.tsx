"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useRouter } from "next/navigation";
import {
  Compass,
  Route,
  Sparkles,
  X,
} from "lucide-react";
import SmartPlannerRouteDetailContent from "./sections/SmartPlannerRouteDetailContent";
import SmartPlannerTabs from "./tabs/SmartPlannerTabs";
import type { DiscoveryItem } from "./drawers/DiscoveryDrawer";
import {
  buildInitialBookingBasket,
  type WorkspaceBookingBasketItem,
} from "@/app/components/ecosystem/planner/workspace/utils/bookingBasket";
import {
  buildCreatorIntelligence,
  buildJourneyFlow,
  buildLocalLife,
  buildMobilityIntelligence,
  buildOverviewCards,
  buildRouteHighlights,
  buildRoutePathCities,
  buildRoutePricing,
  formatCurrency,
  getCostDistribution,
  getRoutePersonality,
  getTravelIntelligenceDashboard,
  permitHint,
  riskStyles,
  routeCountLabel,
  shortNote,
  stopsHint,
  transportHint,
  type OverviewCard,
  type RoutePricing,
} from "./data/routePreviewData";
import { saveRouteWorkspacePayload } from "@/app/lib/ecosystem/planner/plannerRouteWorkspaceHandoff";
import { useAuth } from "@/app/hooks/useAuth";
import {
  loadMyTripById,
  loadMyTrips,
  MY_TRIPS_ACTIVE_TRIP_ID_KEY,
  MY_TRIPS_RESTORE_BASKET_KEY,
  myTripOwnerKey,
  saveMyTrip,
  type MyTripSavedItem,
  type MyTripSavedItemType,
} from "@/app/lib/ecosystem/planner/myTripsStorage";
import {
  buildSmartPlannerReviewPayload,
  persistSmartPlannerReviewPayload,
} from "@/app/lib/ecosystem/planner/plannerReviewPayload";
import type {
  TiyaCreatorPick,
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaLocalMarketPick,
  TiyaRouteOption,
  TiyaTimelineItem,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import type {
  SmartPlannerPreviewTab as PreviewTab,
  SmartPlannerRouteDetailProps,
} from "./types/plannerTypes";

const SMART_PLANNER_GUEST_DISCOVERY_SAVES_KEY =
  "tpl_smart_planner_guest_discovery_saves_v1";

function discoveryKey(item: DiscoveryItem) {
  return `${item.category}:${item.id}`;
}

function uniqueDiscoveryItems(items: DiscoveryItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = discoveryKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function discoveryPrice(item: DiscoveryItem, isCreator: boolean) {
  if (isCreator) return 0;
  const text = `${item.category} ${item.title}`.toLowerCase();
  if (text.includes("food") || text.includes("snack")) return 800;
  if (text.includes("market") || text.includes("shopping")) return 1200;
  if (text.includes("culture") || text.includes("walk")) return 1500;
  return 1000;
}

function discoveryToTimelineItem(
  item: DiscoveryItem,
  isCreator: boolean,
  index: number
): TiyaTimelineItem {
  const price = discoveryPrice(item, isCreator);

  return {
    id: `${isCreator ? "creator" : "local-life"}-${item.id}`,
    time: item.bestTime || (isCreator ? "Golden hour" : "Evening"),
    title: item.title,
    location: item.distance || "Route stop",
    type: "activity",
    category: "Activities",
    serviceType: isCreator ? "Creator Spot" : "Local Life",
    description: item.description,
    durationDays: 1,
    unitPrice: price,
    price,
    priceBasis: isCreator ? "fixed" : "per_item",
    displayPriceLabel: price
      ? `₹${price.toLocaleString("en-IN")} estimate`
      : "No cost estimate",
    currency: "INR",
    providerName: isCreator ? "TPL Creators" : "TPL Local Life",
    detailSummary: isCreator
      ? "Creator discovery added from Smart Planner route preview."
      : "Local Life discovery added from Smart Planner route preview.",
    details: {
      category: item.category,
      order: index + 1,
      source: "Smart Planner discovery",
    },
    bookingStatus: "selected",
  };
}

function discoveryToLocalLifePick(item: DiscoveryItem): TiyaLocalMarketPick {
  return {
    id: `local-life-${item.id}`,
    productName: item.title,
    localRegion: item.distance || "Route area",
    description: item.description,
    priceRange: `₹${discoveryPrice(item, false).toLocaleString("en-IN")} estimate`,
    specialtyLabel: item.category || "Local Life",
    authenticityBadge: "Route matched",
    routeRelevance: 88,
    productType: item.category.toLowerCase().includes("food")
      ? "local snacks"
      : item.category.toLowerCase().includes("travel")
        ? "travel essentials"
        : "creator recommended items",
    isCreatorRecommended: Boolean(item.creatorReviews),
    isHighlighted: true,
  };
}

function discoveryToCreatorPick(item: DiscoveryItem): TiyaCreatorPick {
  return {
    id: `creator-${item.id}`,
    creatorName: item.creatorReviews || item.title,
    handle: `@${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24) || "tplcreator"}`,
    destination: item.distance || "Route stop",
    specialty: item.category || "Creator route",
    engagementScore: 84,
    routeFit: 90,
    recommendationNote: item.description,
    suggestedStopover: item.title,
    tags: [item.category, item.bestTime || "Creator ready"].filter(Boolean),
    isVerified: true,
    isHighlighted: true,
  };
}

function enrichPlanWithDiscoverySelections({
  creatorSelections,
  localLifeSelections,
  plan,
}: {
  creatorSelections: DiscoveryItem[];
  localLifeSelections: DiscoveryItem[];
  plan: TiyaGeneratedPlan;
}) {
  const days = Array.isArray(plan.days) ? plan.days : [];
  if (!days.length) return plan;

  const targetDayIndex = Math.min(1, days.length - 1);
  const selectedTimelineItems = [
    ...uniqueDiscoveryItems(localLifeSelections).map((item, index) =>
      discoveryToTimelineItem(item, false, index)
    ),
    ...uniqueDiscoveryItems(creatorSelections).map((item, index) =>
      discoveryToTimelineItem(item, true, index)
    ),
  ];
  const selectedIds = new Set(selectedTimelineItems.map((item) => item.id));
  const nextDays = days.map((day, index): TiyaDayPlan => {
    if (index !== targetDayIndex) return day;

    const existingItems = Array.isArray(day.items) ? day.items : [];
    const keptItems = existingItems.filter((item) => !selectedIds.has(item.id));

    return {
      ...day,
      items: [...keptItems, ...selectedTimelineItems],
      notes: [
        day.notes,
        selectedTimelineItems.length
          ? "Smart Planner discovery selections added to this day."
          : "",
      ]
        .filter(Boolean)
        .join(" "),
    };
  });

  const localLifePicks = [
    ...uniqueDiscoveryItems(localLifeSelections).map(discoveryToLocalLifePick),
    ...(Array.isArray(plan.localMarketPicks) ? plan.localMarketPicks : []),
  ].filter(
    (item, index, array) =>
      array.findIndex((entry) => entry.id === item.id) === index
  );
  const creatorPicks = [
    ...uniqueDiscoveryItems(creatorSelections).map(discoveryToCreatorPick),
    ...(Array.isArray(plan.creatorPicks) ? plan.creatorPicks : []),
  ].filter(
    (item, index, array) =>
      array.findIndex((entry) => entry.id === item.id) === index
  );

  return {
    ...plan,
    creatorPicks,
    days: nextDays,
    localMarketPicks: localLifePicks,
  };
}

function saveGuestDiscoveryPreference(item: DiscoveryItem) {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(SMART_PLANNER_GUEST_DISCOVERY_SAVES_KEY);
    const current = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(current) ? current : [];
    const next = [
      {
        ...item,
        savedAt: new Date().toISOString(),
      },
      ...list.filter(
        (entry: Partial<DiscoveryItem>) =>
          entry.id !== item.id || entry.category !== item.category
      ),
    ];

    window.localStorage.setItem(
      SMART_PLANNER_GUEST_DISCOVERY_SAVES_KEY,
      JSON.stringify(next)
    );
    window.dispatchEvent(new Event("tpl_tiya_workspace_payload_updated"));
    window.dispatchEvent(new Event("tpl_tiya_my_trips_updated"));
  } catch {
    return;
  }
}

function clearGuestDiscoveryPreferences() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(SMART_PLANNER_GUEST_DISCOVERY_SAVES_KEY);
  } catch {
    return;
  }
}

function readGuestDiscoveryPreferences(): DiscoveryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(SMART_PLANNER_GUEST_DISCOVERY_SAVES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];

    return uniqueDiscoveryItems(
      parsed.filter(
        (item: Partial<DiscoveryItem>) =>
          typeof item?.id === "string" &&
          typeof item?.title === "string" &&
          typeof item?.category === "string"
      ) as DiscoveryItem[]
    );
  } catch {
    return [];
  }
}

function ScoreGauge({
  label,
  score,
  accent,
}: {
  label: string;
  score: number;
  accent: "scenic" | "comfort";
}) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const rotation = -90 + clampedScore * 1.8;
  const gradient =
    accent === "scenic"
      ? "from-cyan-300 via-orange-300 to-orange-500"
      : "from-cyan-300 via-emerald-300 to-blue-500";

  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.08] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/45">
        {label}
      </p>
      <div className="relative mx-auto mt-2 h-16 w-28 overflow-hidden">
        <div className="absolute left-0 top-0 h-28 w-28 rounded-full border-[9px] border-white/10" />
        <div
          className={`absolute left-0 top-0 h-28 w-28 rounded-full bg-gradient-to-r ${gradient}`}
          style={{
            clipPath: "polygon(0 50%, 100% 50%, 100% 0, 0 0)",
            transform: `rotate(${rotation}deg)`,
          }}
        />
        <div className="absolute left-[9px] top-[9px] h-[94px] w-[94px] rounded-full bg-[#12315f]" />
        <div className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-white/85 shadow-[0_0_18px_rgba(255,255,255,0.35)]" />
        <p className="absolute bottom-1 left-0 right-0 text-center text-2xl font-black text-white">
          {clampedScore}
        </p>
      </div>
    </div>
  );
}

function RoutePathBar({ cities }: { cities: string[] }) {
  if (!cities.length) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 rounded-[1.25rem] border border-white/12 bg-white/[0.07] p-3 shadow-[0_16px_44px_rgba(2,6,23,0.16)] backdrop-blur-xl">
      {cities.map((city, index) => (
        <div key={`${city}-${index}`} className="flex min-w-0 items-center gap-2">
          {index > 0 ? (
            <span className="h-px w-10 shrink-0 border-t border-dashed border-cyan-100/55 sm:w-14" />
          ) : null}
          <span className="inline-flex max-w-[190px] items-center gap-2 rounded-full border border-white/14 bg-white/[0.11] px-3 py-2 text-xs font-black text-white shadow-[0_10px_26px_rgba(2,6,23,0.18)]">
            <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
              <span className="absolute h-4 w-4 rotate-45 rounded-[0.55rem_0.55rem_0.55rem_0.12rem] bg-red-500 shadow-[0_6px_14px_rgba(239,68,68,0.35)]" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            <span className="truncate">{city}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function RoutePreviewDetailPanel({
  routeOption,
  routePricing,
  activeTab,
  onTabChange,
  onContinue,
  onOpenOverviewDetail,
  tripIntent,
  onAddLocalLifeSelection,
  onSaveLocalLifeSelection,
  onAddCreatorSelection,
  onSaveCreatorSelection,
}: {
  routeOption: TiyaRouteOption;
  routePricing: RoutePricing;
  activeTab: PreviewTab;
  onTabChange: (tab: PreviewTab) => void;
  onContinue: () => void;
  onOpenOverviewDetail: (card: OverviewCard) => void;
  tripIntent?: TiyaTripIntent;
  onAddLocalLifeSelection?: (item: DiscoveryItem) => void;
  onSaveLocalLifeSelection?: (item: DiscoveryItem) => void;
  onAddCreatorSelection?: (item: DiscoveryItem) => void;
  onSaveCreatorSelection?: (item: DiscoveryItem) => void;
}) {
  const overviewCards = buildOverviewCards(routeOption, tripIntent);
  const journeyFlow = buildJourneyFlow(routeOption, tripIntent, routePricing);
  const costDistribution = getCostDistribution(routePricing);
  const travelIntelligence = getTravelIntelligenceDashboard(routeOption);
  const mobilityIntelligence = buildMobilityIntelligence(routeOption, tripIntent);
  const localLife = buildLocalLife(routeOption, tripIntent);
  const creatorIntelligence = buildCreatorIntelligence(routeOption);
  const [openJourneyNodeId, setOpenJourneyNodeId] = useState<string | null>(null);
  const [openCostDay, setOpenCostDay] = useState<number | null>(null);

  return (
    <div className="min-w-0 border-t border-sky-200/55 bg-gradient-to-br from-sky-50 via-blue-50 to-slate-100 p-2.5 text-slate-950 sm:p-4">
      <div className="min-w-0 rounded-[1.15rem] border border-sky-200/80 bg-white/78 p-3 shadow-[0_18px_54px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:rounded-[1.5rem] sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
              Smart route detail
            </p>
            <h4 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
              {routeOption.name} preview
            </h4>
            <p className="mt-1 text-sm font-bold text-slate-600">
              {shortNote(routeOption.note)}
            </p>
          </div>
          <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-700">
            {routeOption.bestFor}
          </span>
        </div>

        <SmartPlannerTabs activeTab={activeTab} onTabChange={onTabChange} />

        <SmartPlannerRouteDetailContent
          activeTab={activeTab}
          routeOption={routeOption}
          routePricing={routePricing}
          tripIntent={tripIntent}
          overviewCards={overviewCards}
          journeyFlow={journeyFlow}
          costDistribution={costDistribution}
          travelIntelligence={travelIntelligence}
          mobilityIntelligence={mobilityIntelligence}
          localLife={localLife}
          creatorIntelligence={creatorIntelligence}
          openJourneyNodeId={openJourneyNodeId}
          setOpenJourneyNodeId={setOpenJourneyNodeId}
          openCostDay={openCostDay}
          setOpenCostDay={setOpenCostDay}
          onContinue={onContinue}
          onOpenOverviewDetail={onOpenOverviewDetail}
          onAddLocalLifeSelection={onAddLocalLifeSelection}
          onSaveLocalLifeSelection={onSaveLocalLifeSelection}
          onAddCreatorSelection={onAddCreatorSelection}
          onSaveCreatorSelection={onSaveCreatorSelection}
        />

      </div>
    </div>
  );
}

export default function TiyaRouteIntelligence({
  routeOptions,
  isGenerating = false,
  selectedRouteId,
  selectionConfirmed = true,
  tripIntent,
  generatedPlan,
  onSelectedRouteChange,
}: SmartPlannerRouteDetailProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const safeRouteOptions = useMemo(
    () => (Array.isArray(routeOptions) ? routeOptions : []),
    [routeOptions]
  );

  const recommendedRoute = useMemo(
    () =>
      safeRouteOptions.find((route) => route.isRecommended) ??
      safeRouteOptions[0],
    [safeRouteOptions]
  );

  const [internalSelectedRouteId, setInternalSelectedRouteId] = useState(
    recommendedRoute?.id ?? "fastest"
  );
  const [compareRouteIds, setCompareRouteIds] = useState<
    TiyaRouteOption["id"][]
  >([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [activeOverviewCard, setActiveOverviewCard] =
    useState<OverviewCard | null>(null);
  const [activePreviewTab, setActivePreviewTab] =
    useState<PreviewTab>("Overview");
  const [localLifeSelections, setLocalLifeSelections] = useState<DiscoveryItem[]>(
    () =>
      readGuestDiscoveryPreferences().filter(
        (item) => !item.category.toLowerCase().includes("creator")
      )
  );
  const [creatorSelections, setCreatorSelections] = useState<DiscoveryItem[]>(
    () =>
      readGuestDiscoveryPreferences().filter((item) =>
        item.category.toLowerCase().includes("creator")
      )
  );

  useEffect(() => {
    if ((!isCompareOpen && !activeOverviewCard) || typeof document === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    if (!mediaQuery.matches) return;

    const originalOverflow = document.body.style.overflow;
    const originalOverscrollBehavior = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "contain";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscrollBehavior;
    };
  }, [activeOverviewCard, isCompareOpen]);

  const activeSelectedRouteId = selectionConfirmed
    ? selectedRouteId ?? internalSelectedRouteId
    : undefined;

  const selectedRoute =
    safeRouteOptions.find((route) => route.id === activeSelectedRouteId) ??
    recommendedRoute ??
    safeRouteOptions[0];

  const selectedRouteIdForDisplay = selectedRoute?.id;
  const routePathCities = useMemo(
    () => buildRoutePathCities(tripIntent),
    [tripIntent]
  );

  const validCompareRouteIds = compareRouteIds.filter((routeId) =>
    safeRouteOptions.some((route) => route.id === routeId)
  );

  const compareRoutes = safeRouteOptions.filter((routeOption) =>
    validCompareRouteIds.includes(routeOption.id)
  );

  function selectRoute(routeId: TiyaRouteOption["id"]) {
    setInternalSelectedRouteId(routeId);
    onSelectedRouteChange?.(routeId);
  }

  function compareAllRoutes() {
    setCompareRouteIds(safeRouteOptions.map((routeOption) => routeOption.id));
    setIsCompareOpen(true);
  }

  function storeUniqueSelection(
    item: DiscoveryItem,
    setter: Dispatch<SetStateAction<DiscoveryItem[]>>
  ) {
    setter((current) =>
      current.some(
        (selection) =>
          selection.id === item.id && selection.category === item.category
      )
        ? current
        : [...current, item]
    );
  }

  function syncDiscoveryToWorkspaceDraft({
    creatorItems,
    localLifeItems,
    routeOption,
  }: {
    creatorItems: DiscoveryItem[];
    localLifeItems: DiscoveryItem[];
    routeOption?: TiyaRouteOption;
  }) {
    if (!routeOption || !tripIntent || !generatedPlan) {
      return {
        basket: [] as WorkspaceBookingBasketItem[],
        plan: generatedPlan,
      };
    }

    const enrichedPlan = enrichPlanWithDiscoverySelections({
      creatorSelections: creatorItems,
      localLifeSelections: localLifeItems,
      plan: generatedPlan,
    });
    const routePricing = buildRoutePricing(routeOption, tripIntent);
    const travelIntelligence = getTravelIntelligenceDashboard(routeOption);
    const mobilityIntelligence = buildMobilityIntelligence(routeOption, tripIntent);

    saveRouteWorkspacePayload(
      routeOption,
      safeRouteOptions,
      tripIntent,
      enrichedPlan,
      {
        costSummary: {
          activityCost: routePricing.activityCost,
          budgetType: routePricing.budgetType,
          bufferCost: routePricing.bufferCost,
          dayWiseCosts: routePricing.dayWiseCosts,
          perDayCost: routePricing.perDayCost,
          perPersonCost: routePricing.perPersonCost,
          savings: routePricing.savings,
          stayCost: routePricing.stayCost,
          totalCost: routePricing.totalCost,
          transportCost: routePricing.transportCost,
          travellerCount: routePricing.travellerCount,
          tripDays: routePricing.tripDays,
        },
        creatorSelections: creatorItems,
        localLifeSelections: localLifeItems,
        mobilityIntelligence,
        notes: routeOption.note,
        routeSummary: {
          bestFor: routeOption.bestFor,
          difficulty: routeOption.difficulty,
          distance: routeOption.distance,
          duration: routeOption.duration,
          id: routeOption.id,
          name: routeOption.name,
          note: routeOption.note,
          riskLevel: routeOption.riskLevel,
          routeStyle: routeOption.routeStyle,
        },
        travelIntelligence,
      }
    );

    const basket = buildInitialBookingBasket(enrichedPlan.days || [], enrichedPlan);
    const workspacePayload = {
      generatedAt: new Date().toISOString(),
      generatedPlan: enrichedPlan,
      routeId: routeOption.id,
      routeOptions: safeRouteOptions,
      selectedRoute: routeOption,
      source: "route-intelligence" as const,
      tripIntent,
    };
    const reviewPayload = buildSmartPlannerReviewPayload({
      bookingBasket: basket,
      intent: tripIntent,
      plan: enrichedPlan,
      selectedRoute: routeOption,
      workspace: workspacePayload,
    });

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        MY_TRIPS_RESTORE_BASKET_KEY,
        JSON.stringify(basket)
      );
      window.dispatchEvent(new Event("tpl_tiya_workspace_payload_updated"));
      window.dispatchEvent(new Event("tpl_tiya_review_payload_updated"));
    }

    if (reviewPayload) {
      persistSmartPlannerReviewPayload(reviewPayload);
    }

    return { basket, plan: enrichedPlan };
  }

  function addDiscoveryToTrip(item: DiscoveryItem) {
    const isCreator = item.category.toLowerCase().includes("creator");
    const nextLocalLifeSelections = isCreator
      ? localLifeSelections
      : uniqueDiscoveryItems([...localLifeSelections, item]);
    const nextCreatorSelections = isCreator
      ? uniqueDiscoveryItems([...creatorSelections, item])
      : creatorSelections;

    setLocalLifeSelections(nextLocalLifeSelections);
    setCreatorSelections(nextCreatorSelections);
    syncDiscoveryToWorkspaceDraft({
      creatorItems: nextCreatorSelections,
      localLifeItems: nextLocalLifeSelections,
      routeOption: selectedRoute,
    });
  }

  function discoverySavedItem(item: DiscoveryItem): MyTripSavedItem {
    const isCreator = item.category.toLowerCase().includes("creator");
    const type: MyTripSavedItemType = isCreator ? "Creators" : "Local Life";

    return {
      id: `${isCreator ? "creator" : "local-life"}:${item.id}`,
      type,
      title: item.title,
      subtitle: item.description,
      category: isCreator ? "Creator" : "Local Life",
      sourceModule: isCreator ? "Creator Recommendations" : "Local Life",
      destination: tripIntent?.toCity,
      city: tripIntent?.toCity,
      day: "Route preview",
      time: item.bestTime,
      image: item.image,
      metadata: {
        category: item.category,
        distance: item.distance,
        duration: item.duration,
        routeId: selectedRoute?.id,
        routeName: selectedRoute?.name,
      },
      savedAt: new Date().toISOString(),
    };
  }

  function saveDiscoveryToMyTrips(item: DiscoveryItem) {
    const isCreator = item.category.toLowerCase().includes("creator");
    storeUniqueSelection(
      item,
      isCreator ? setCreatorSelections : setLocalLifeSelections
    );

    if (!selectedRoute || !tripIntent || !generatedPlan) {
      saveGuestDiscoveryPreference(item);
      return;
    }

    if (!isAuthenticated || !user) {
      saveGuestDiscoveryPreference(item);
      return;
    }

    const savedItem = discoverySavedItem(item);
    const activeTripId =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem(MY_TRIPS_ACTIVE_TRIP_ID_KEY)
        : null;
    const activeTrip = activeTripId ? loadMyTripById(activeTripId) : null;
    const ownerKey = myTripOwnerKey(user);
    const matchingTrip =
      activeTrip && myTripOwnerKey(activeTrip.owner) === ownerKey
        ? activeTrip
        : loadMyTrips(user).find(
            (trip) =>
              trip.workspacePayload?.routeId === selectedRoute.id &&
              trip.origin === tripIntent.fromCity &&
              trip.destination === tripIntent.toCity &&
              trip.startDate === tripIntent.startDate
          );
    const now = new Date().toISOString();
    const workspacePayload = {
      routeId: selectedRoute.id,
      selectedRoute,
      routeOptions: safeRouteOptions,
      tripIntent,
      generatedPlan,
      generatedAt: now,
      source: "route-intelligence" as const,
    };
    const savedItems = [
      savedItem,
      ...(matchingTrip?.savedItems || []).filter((existing) => existing.id !== savedItem.id),
    ];

    saveMyTrip({
      id: matchingTrip?.id || `trip-${now}`,
      tripName:
        matchingTrip?.tripName ||
        `${tripIntent.fromCity || "Origin"} to ${tripIntent.toCity || "Destination"} ${selectedRoute.name}`,
      origin: tripIntent.fromCity,
      destination: tripIntent.toCity,
      startDate: tripIntent.startDate,
      endDate: tripIntent.endDate,
      duration: `${generatedPlan.days?.length || 0} Day${(generatedPlan.days?.length || 0) === 1 ? "" : "s"}`,
      travellerCount: Math.max(
        1,
        Number(tripIntent.adults || 0) +
          Number(tripIntent.children || 0) +
          Number(tripIntent.seniors || 0)
      ),
      selectedItemsCount: matchingTrip?.selectedItemsCount || 0,
      estimatedTripValue: generatedPlan.totalBudget || matchingTrip?.estimatedTripValue || 0,
      status: matchingTrip?.status || "Draft",
      createdAt: matchingTrip?.createdAt || now,
      updatedAt: now,
      owner: {
        id: user.id,
        mobile: user.mobile,
        email: user.email,
      },
      workspacePayload,
      itineraryDays: generatedPlan.days || [],
      dayStatuses: matchingTrip?.dayStatuses || {},
      selectedTripItems: matchingTrip?.selectedTripItems || [],
      savedItems,
      expertRequests: matchingTrip?.expertRequests || [],
      checklist: matchingTrip?.checklist || {},
      notes: matchingTrip?.notes,
      generatedJourneyData: matchingTrip?.generatedJourneyData || generatedPlan,
    });

    const reviewPayload = buildSmartPlannerReviewPayload({
      bookingBasket: matchingTrip?.selectedTripItems || [],
      intent: tripIntent,
      plan: generatedPlan,
      savedItems,
      selectedRoute,
      workspace: workspacePayload,
    });

    if (reviewPayload) {
      persistSmartPlannerReviewPayload(reviewPayload);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("tpl_tiya_my_trips_updated"));
      window.dispatchEvent(new Event("tpl_tiya_review_payload_updated"));
      window.dispatchEvent(new Event("tpl_tiya_workspace_payload_updated"));
    }
  }

  function continueWithRoute(routeOption: TiyaRouteOption) {
    const routePricing = buildRoutePricing(routeOption, tripIntent);
    const travelIntelligence = getTravelIntelligenceDashboard(routeOption);
    const mobilityIntelligence = buildMobilityIntelligence(routeOption, tripIntent);
    const enrichedPlan = generatedPlan
      ? enrichPlanWithDiscoverySelections({
          creatorSelections,
          localLifeSelections,
          plan: generatedPlan,
        })
      : generatedPlan;
    const basket = enrichedPlan
      ? buildInitialBookingBasket(enrichedPlan.days || [], enrichedPlan)
      : [];

    saveRouteWorkspacePayload(
      routeOption,
      safeRouteOptions,
      tripIntent,
      enrichedPlan,
      {
        routeSummary: {
          id: routeOption.id,
          name: routeOption.name,
          distance: routeOption.distance,
          duration: routeOption.duration,
          difficulty: routeOption.difficulty,
          riskLevel: routeOption.riskLevel,
          bestFor: routeOption.bestFor,
          routeStyle: routeOption.routeStyle,
          note: routeOption.note,
        },
        costSummary: {
          totalCost: routePricing.totalCost,
          perPersonCost: routePricing.perPersonCost,
          perDayCost: routePricing.perDayCost,
          transportCost: routePricing.transportCost,
          stayCost: routePricing.stayCost,
          activityCost: routePricing.activityCost,
          bufferCost: routePricing.bufferCost,
          travellerCount: routePricing.travellerCount,
          tripDays: routePricing.tripDays,
          budgetType: routePricing.budgetType,
          dayWiseCosts: routePricing.dayWiseCosts,
          savings: routePricing.savings,
        },
        travelIntelligence,
        mobilityIntelligence,
        localLifeSelections,
        creatorSelections,
        notes: routeOption.note,
      }
    );
    const workspacePayload = enrichedPlan
      ? {
          generatedAt: new Date().toISOString(),
          generatedPlan: enrichedPlan,
          routeId: routeOption.id,
          routeOptions: safeRouteOptions,
          selectedRoute: routeOption,
          source: "route-intelligence" as const,
          tripIntent,
        }
      : null;
    const reviewPayload =
      workspacePayload && enrichedPlan
        ? buildSmartPlannerReviewPayload({
            bookingBasket: basket,
            intent: tripIntent,
            plan: enrichedPlan,
            selectedRoute: routeOption,
            workspace: workspacePayload,
          })
        : null;

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        MY_TRIPS_RESTORE_BASKET_KEY,
        JSON.stringify(basket)
      );
      window.dispatchEvent(new Event("tpl_tiya_workspace_payload_updated"));
      window.dispatchEvent(new Event("tpl_tiya_review_payload_updated"));
    }

    if (reviewPayload) {
      persistSmartPlannerReviewPayload(reviewPayload);
    }
    router.push("/smart-planner/workspace");
  }

  const syncDiscoveryToWorkspaceDraftRef = useRef(syncDiscoveryToWorkspaceDraft);
  const saveDiscoveryToMyTripsRef = useRef(saveDiscoveryToMyTrips);

  useEffect(() => {
    syncDiscoveryToWorkspaceDraftRef.current = syncDiscoveryToWorkspaceDraft;
    saveDiscoveryToMyTripsRef.current = saveDiscoveryToMyTrips;
  });

  useEffect(() => {
    if (!selectedRoute || !tripIntent || !generatedPlan) return;

    const guestSaves = readGuestDiscoveryPreferences();
    if (!guestSaves.length) return;

    const localItems = uniqueDiscoveryItems(
      guestSaves.filter((item) => !item.category.toLowerCase().includes("creator"))
    );
    const creatorItems = uniqueDiscoveryItems(
      guestSaves.filter((item) => item.category.toLowerCase().includes("creator"))
    );

    syncDiscoveryToWorkspaceDraftRef.current({
      creatorItems: uniqueDiscoveryItems([...creatorSelections, ...creatorItems]),
      localLifeItems: uniqueDiscoveryItems([...localLifeSelections, ...localItems]),
      routeOption: selectedRoute,
    });
  }, [creatorSelections, generatedPlan, localLifeSelections, selectedRoute, tripIntent]);

  useEffect(() => {
    if (!isAuthenticated || (!user?.id && !user?.mobile)) return;

    const guestSaves = readGuestDiscoveryPreferences();
    if (!guestSaves.length) return;

    guestSaves.forEach((item) => saveDiscoveryToMyTripsRef.current(item));
    clearGuestDiscoveryPreferences();
  }, [isAuthenticated, user?.id, user?.mobile]);

  return (
    <section className="min-w-0 overflow-hidden rounded-[1.4rem] border border-sky-100/35 bg-[#dff4ff] text-white shadow-[0_28px_100px_rgba(6,24,57,0.18)] sm:rounded-[2rem]">
      <div className="relative rounded-[1.4rem] bg-[linear-gradient(135deg,#10284f_0%,#123d69_46%,#172033_100%)] sm:rounded-[2rem]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(34,211,238,0.13),transparent_28%),radial-gradient(circle_at_90%_12%,rgba(249,115,22,0.16),transparent_25%)]" />

        <div className="relative border-b border-white/10 p-3 sm:p-4 lg:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
                <Compass
                  size={15}
                  className={isGenerating ? "animate-pulse" : undefined}
                />
                Tiya
              </div>

              <h2 className="mt-2 text-xl font-black tracking-normal text-white sm:text-2xl lg:text-3xl">
                {routeCountLabel(safeRouteOptions.length)}
              </h2>

              <RoutePathBar cities={routePathCities} />
            </div>
          </div>

          {selectedRoute ? (
            <div className="relative mt-3 grid min-w-0 gap-2 sm:grid-cols-[1.15fr_repeat(3,minmax(0,1fr))]">
              <label className="rounded-xl border border-orange-300/24 bg-orange-500/12 px-3 py-2">
                <span className="text-[9px] font-black uppercase tracking-[0.14em] text-orange-100/75">
                  Selected Route
                </span>
                <select
                  value={selectedRouteIdForDisplay ?? ""}
                  onChange={(event) =>
                    selectRoute(event.target.value as TiyaRouteOption["id"])
                  }
                  className="mt-1 w-full cursor-pointer rounded-lg border border-orange-200/20 bg-[#fff7ed] px-2 py-1.5 text-xs font-black text-slate-950 outline-none transition focus:border-orange-400"
                >
                  {safeRouteOptions.map((routeOption) => (
                    <option
                      key={`selected-route-${routeOption.id}`}
                      value={routeOption.id}
                      className="bg-white text-slate-950"
                    >
                      {routeOption.name}
                    </option>
                  ))}
                </select>
              </label>

              {[
                ["Distance", selectedRoute.distance],
                ["Duration", selectedRoute.duration],
                ["Risk", selectedRoute.riskLevel],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2"
                >
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/45">
                    {label}
                  </p>
                  <p className="mt-0.5 truncate text-xs font-black text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative grid min-w-0 items-start gap-3 overflow-visible p-3 sm:gap-4 sm:p-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-4 lg:p-6">
          <div className="min-w-0 lg:sticky lg:top-[110px] lg:self-start lg:z-30">
            <aside className="min-w-0">
              <div className="relative overflow-hidden rounded-[1.35rem] border border-cyan-100/28 bg-[linear-gradient(145deg,rgba(255,255,255,0.28),rgba(255,255,255,0.10)_46%,rgba(14,165,233,0.10))] p-3 shadow-[0_24px_70px_rgba(2,6,23,0.28),inset_0_1px_0_rgba(255,255,255,0.34)] backdrop-blur-2xl sm:rounded-[1.55rem] lg:overflow-visible">
              <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
              <div className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-cyan-200/14 blur-2xl" />

              <div className="relative flex items-center justify-between gap-3 lg:block">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white">
                    Routes
                  </p>
                  <p className="mt-1 text-xs font-bold text-cyan-50/60 lg:hidden">
                    Swipe to switch route
                  </p>
                </div>
                <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-black text-cyan-50 lg:hidden">
                  {safeRouteOptions.length} options
                </span>
              </div>

              <div className="relative -mx-3 mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:gap-3 lg:mx-0 lg:grid lg:snap-none lg:grid-cols-1 lg:overflow-visible lg:px-0 lg:pb-0">
                {safeRouteOptions.map((routeOption, index) => {
                  const selected = selectedRouteIdForDisplay === routeOption.id;

                  return (
                    <button
                      key={`route-table-${routeOption.id}`}
                      type="button"
                      onClick={() => {
                        selectRoute(routeOption.id);
                        setActivePreviewTab("Overview");
                      }}
                      className={`min-h-[132px] w-[78vw] max-w-[320px] shrink-0 snap-start rounded-2xl border px-3 py-3 text-left shadow-[0_14px_32px_rgba(2,6,23,0.16)] transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_18px_42px_rgba(2,6,23,0.20)] sm:w-[44vw] lg:min-h-0 lg:w-full lg:max-w-none ${
                        selected
                          ? "border-cyan-300 bg-white shadow-[0_18px_46px_rgba(34,211,238,0.22),0_0_0_1px_rgba(14,165,233,0.18)] ring-2 ring-cyan-300/30 lg:ring-0"
                          : "border-white/70 bg-white/88 hover:border-cyan-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] shadow-sm ${
                            selected
                              ? "border-cyan-200 bg-cyan-50 text-cyan-800"
                              : "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          Route {index + 1}
                        </span>
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            selected ? "bg-cyan-500 shadow-[0_0_16px_rgba(6,182,212,0.75)]" : "bg-slate-300"
                          }`}
                        />
                      </div>
                      <p className="mt-2 truncate text-sm font-black text-slate-950">
                        {routeOption.name}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-slate-500">
                        {routeOption.routeStyle || routeOption.bestFor}
                      </p>
                      <div className="mt-3 grid grid-cols-3 gap-1.5 lg:hidden">
                        {[
                          ["Score", `${routeOption.comfortScore}`],
                          ["Time", routeOption.duration],
                          ["Type", routeOption.bestFor || routeOption.routeStyle],
                        ].map(([label, value]) => (
                          <span
                            key={`${routeOption.id}-${label}`}
                            className={`min-w-0 rounded-xl border px-2 py-1.5 ${
                              selected
                                ? "border-cyan-100 bg-cyan-50 text-cyan-900"
                                : "border-slate-100 bg-slate-50 text-slate-700"
                            }`}
                          >
                            <span className="block text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
                              {label}
                            </span>
                            <span className="mt-0.5 block truncate text-[11px] font-black">
                              {value}
                            </span>
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={compareAllRoutes}
                className="sticky bottom-[calc(0.75rem_+_env(safe-area-inset-bottom))] z-20 mb-4 mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-4 py-2 text-xs font-black text-white shadow-[0_14px_34px_rgba(255,123,0,0.22)] transition hover:-translate-y-0.5 hover:brightness-105 lg:relative lg:bottom-auto lg:mb-0 lg:mt-3 lg:min-h-11"
              >
                Compare all routes
              </button>
              </div>
            </aside>
          </div>

          <main className="min-w-0">
            {selectedRoute ? [selectedRoute].map((routeOption) => {
              const selected = selectedRouteIdForDisplay === routeOption.id;
              const routeIndex = safeRouteOptions.findIndex(
                (item) => item.id === routeOption.id
              );
              const personality = getRoutePersonality(
                routeOption.id,
                Math.max(routeIndex, 0)
              );
              const routePricing = buildRoutePricing(routeOption, tripIntent);

              return (
                <div key={routeOption.id}>
                  <article
                    className={`group relative min-w-0 overflow-hidden rounded-[1.35rem] border transition-all duration-300 sm:rounded-[1.65rem] ${
                      selected
                        ? `translate-y-[-2px] ${personality.base} ${personality.accent} ${personality.glow}`
                        : `border-white/18 ${personality.base} shadow-[0_22px_64px_rgba(2,6,23,0.24)] hover:-translate-y-0.5`
                    }`}
                  >
                  <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/28 to-transparent" />
                  <div
                    className={`pointer-events-none absolute inset-y-5 left-0 w-1 rounded-r-full bg-gradient-to-b ${personality.line}`}
                  />

                  <div className="grid min-w-0 gap-3 p-3 sm:gap-4 sm:p-4 lg:grid-cols-[minmax(0,1fr)_330px] lg:p-4">
                    <div className="min-w-0">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border sm:h-12 sm:w-12 ${personality.badge}`}
                          >
                            <Route size={18} className={personality.icon} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3
                                className={`text-xl font-black leading-tight sm:text-2xl ${personality.title}`}
                              >
                                {routeOption.name}
                              </h3>

                              {routeOption.isRecommended ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200/20 bg-cyan-300/16 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.14)] lg:normal-case lg:tracking-normal">
                                  <Sparkles size={12} />
                                  Tiya recommends
                                </span>
                              ) : null}
                            </div>

                            <p className="mt-1 text-sm font-bold text-white/62">
                              {routeOption.routeStyle}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`w-fit shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-black ${riskStyles[routeOption.riskLevel]}`}
                        >
                          {routeOption.riskLevel} risk
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/42">
                            Duration
                          </p>
                          <p className="mt-1 text-base font-black text-white">
                            {routeOption.duration}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/42">
                            Budget
                          </p>
                          <p className="mt-1 truncate text-base font-black text-white">
                            {formatCurrency(routePricing.totalCost)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/12 bg-white/[0.09] px-3 py-1.5 text-xs font-black text-white/76">
                          {routeOption.distance}
                        </span>
                        <span className="rounded-full border border-white/12 bg-white/[0.09] px-3 py-1.5 text-xs font-black text-white/76">
                          {routeOption.difficulty}
                        </span>
                        <span
                          className={`rounded-full border px-3 py-1.5 text-xs font-black ${personality.badge}`}
                        >
                          {transportHint(routeOption)}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3">
                        <ScoreGauge
                          label="Scenic Score"
                          score={routeOption.scenicScore}
                          accent="scenic"
                        />
                        <ScoreGauge
                          label="Comfort Score"
                          score={routeOption.comfortScore}
                          accent="comfort"
                        />
                      </div>
                    </div>

                    <div className="relative min-w-0 overflow-hidden rounded-[1.2rem] border border-white/12 bg-white/[0.09] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur sm:rounded-[1.4rem] sm:p-4">
                      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/28 to-transparent" />
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/48">
                        Route Highlights
                      </p>

                      <ul className="mt-3 grid gap-2.5">
                        {buildRouteHighlights(routeOption).map((highlight) => (
                          <li
                            key={`${routeOption.id}-${highlight}`}
                            className="flex items-start gap-2 rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-2 text-xs font-bold leading-5 text-white/78"
                          >
                            <span className={`mt-1 h-2 w-2 shrink-0 rounded-full bg-gradient-to-r ${personality.line} shadow-[0_0_14px_rgba(34,211,238,0.28)]`} />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div
                    className="grid grid-rows-[1fr] opacity-100"
                  >
                    <div className="overflow-hidden">
                      <RoutePreviewDetailPanel
                        routeOption={routeOption}
                        routePricing={routePricing}
                        activeTab={activePreviewTab}
                        onTabChange={setActivePreviewTab}
                        onContinue={() => continueWithRoute(routeOption)}
                        onOpenOverviewDetail={setActiveOverviewCard}
                        tripIntent={tripIntent}
                        onAddLocalLifeSelection={(item) =>
                          addDiscoveryToTrip(item)
                        }
                        onSaveLocalLifeSelection={(item) =>
                          saveDiscoveryToMyTrips(item)
                        }
                        onAddCreatorSelection={(item) =>
                          addDiscoveryToTrip(item)
                        }
                        onSaveCreatorSelection={(item) =>
                          saveDiscoveryToMyTrips(item)
                        }
                      />
                    </div>
                  </div>
                  </article>
                </div>
              );
            }) : null}
          </main>
        </div>

      </div>

      {isCompareOpen ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center overflow-hidden bg-slate-950/72 p-0 backdrop-blur-md sm:items-center sm:p-4 lg:p-8">
          <button
            type="button"
            aria-label="Close route comparison"
            className="absolute inset-0 sm:hidden"
            onClick={() => setIsCompareOpen(false)}
          />
          <div className="relative flex max-h-[85vh] w-full max-w-7xl flex-col overflow-hidden rounded-t-[28px] border border-orange-300/24 bg-[linear-gradient(135deg,#10284f_0%,#123d69_48%,#172033_100%)] text-white shadow-[0_32px_120px_rgba(2,6,23,0.48)] sm:max-h-[calc(100vh-24px)] sm:rounded-[2rem] lg:max-h-[calc(100vh-64px)]">
            <div className="flex shrink-0 justify-center pt-2 sm:hidden">
              <span className="h-1.5 w-12 rounded-full bg-white/28" />
            </div>
            <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-white/10 bg-[#10284f]/95 p-3 backdrop-blur-xl sm:p-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-100">
                  Tiya route comparison
                </p>
                <h3 className="mt-1 text-xl font-black sm:text-2xl">Compare Routes</h3>
              </div>

              <button
                type="button"
                onClick={() => setIsCompareOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-orange-200/25 bg-orange-500/15 text-orange-50 shadow-[0_10px_26px_rgba(249,115,22,0.16)] transition hover:bg-orange-500/25"
                aria-label="Close route comparison"
              >
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overscroll-contain overflow-y-auto p-3 pb-[calc(1rem_+_env(safe-area-inset-bottom))] sm:p-4">
              <div className="overflow-visible sm:overflow-x-auto">
                <div
                  className="grid grid-cols-1 gap-3 sm:min-w-[760px] sm:[grid-template-columns:repeat(var(--route-count),minmax(220px,1fr))]"
                  style={{
                    "--route-count": Math.max(compareRoutes.length, 1),
                  } as CSSProperties}
                >
                  {compareRoutes.length === 0 ? (
                    <div className="rounded-3xl border border-white/12 bg-white/[0.07] p-5 text-sm font-bold text-white/72">
                      Select at least two routes to compare.
                    </div>
                  ) : null}

                  {compareRoutes.map((routeOption, index) => {
                    const personality = getRoutePersonality(
                      routeOption.id,
                      index
                    );
                    const selected = selectedRouteIdForDisplay === routeOption.id;
                    const routePricing = buildRoutePricing(routeOption, tripIntent);

                    return (
                      <div
                        key={`modal-${routeOption.id}`}
                        className={`rounded-3xl border p-4 transition ${
                          selected
                            ? `${personality.base} ${personality.accent} shadow-[0_0_38px_rgba(255,123,0,0.18)]`
                            : `${personality.base} border-white/12`
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-lg font-black ${personality.title}`}>
                            {routeOption.name}
                          </h4>
                          {routeOption.isRecommended ? (
                            <Sparkles size={16} className="text-cyan-100" />
                          ) : null}
                        </div>

                        <p className="mt-1 text-xs font-bold text-white/58">
                          {routeOption.bestFor}
                        </p>

                        <div className="mt-4 grid gap-2 text-xs font-bold text-white/74">
                          {[
                            ["Duration", routeOption.duration],
                            ["Distance", routeOption.distance],
                            ["Budget", formatCurrency(routePricing.totalCost)],
                            ["Scenic", `${routeOption.scenicScore}`],
                            ["Comfort", `${routeOption.comfortScore}`],
                            ["Difficulty", routeOption.difficulty],
                            ["Stops", stopsHint(routeOption)],
                            ["Weather risk", routeOption.riskLevel],
                            ["Permits", permitHint(routeOption)],
                            ["Transport", transportHint(routeOption)],
                            ["Route vibe", routeOption.routeStyle],
                            [
                              "AI recommendation",
                              routeOption.isRecommended
                                ? "Recommended by Tiya"
                                : "Alternative fit",
                            ],
                          ].map(([label, value]) => (
                            <div
                              key={`${routeOption.id}-${label}`}
                              className="rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-2"
                            >
                              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/42">
                                {label}
                              </p>
                              <p className="mt-1 text-white">{value}</p>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            selectRoute(routeOption.id);
                            setIsCompareOpen(false);
                          }}
                          className={`mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-full px-4 py-2 text-xs font-black transition ${
                            selected
                              ? "bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] text-white shadow-[0_12px_28px_rgba(255,123,0,0.24)]"
                              : "border border-white/16 bg-white/11 text-white hover:bg-white/16"
                          }`}
                        >
                          {selected ? "Selected Route" : "Select this Route"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {activeOverviewCard ? (
        <div className="fixed inset-0 z-[140] flex items-end justify-center bg-slate-950/75 p-0 backdrop-blur-md sm:items-center sm:p-4">
          <button
            type="button"
            aria-label="Close overview detail"
            className="absolute inset-0 sm:hidden"
            onClick={() => setActiveOverviewCard(null)}
          />
          <div className="relative max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-t-[28px] border border-sky-200 bg-white text-slate-950 shadow-[0_30px_100px_rgba(2,6,23,0.38)] sm:rounded-[1.75rem]">
            <div className="flex justify-center bg-white pt-2 sm:hidden">
              <span className="h-1.5 w-12 rounded-full bg-slate-300" />
            </div>
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-orange-50 p-3 sm:gap-4 sm:p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-white text-cyan-700 shadow-sm">
                  <activeOverviewCard.icon size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
                    Route overview detail
                  </p>
                  <h5 className="mt-1 text-xl font-black text-slate-950">
                    {activeOverviewCard.title}
                  </h5>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveOverviewCard(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-orange-200 bg-orange-50 text-orange-700 transition hover:bg-orange-100"
                aria-label="Close overview detail"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[calc(85vh-84px)] overflow-y-auto overscroll-contain p-3 pb-[calc(1rem_+_env(safe-area-inset-bottom))] sm:p-5">
              <div className="whitespace-pre-line rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-sm font-bold leading-7 text-slate-700">
                {activeOverviewCard.detail}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
