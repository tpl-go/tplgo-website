"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Camera,
  CloudSun,
  DollarSign,
  Eye,
  Heart,
  Moon,
  Route,
  Sparkles,
  Star,
  Upload,
  Users,
  Utensils,
  WalletCards,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import TPLDynamicImage from "@/app/components/common/TPLDynamicImage";
import DiscoveryDrawer, {
  type AnchorRect,
  type DiscoveryItem,
} from "@/app/components/ecosystem/planner/smart-planner/drawers/DiscoveryDrawer";
import type { TiyaRouteOption, TiyaTripIntent } from "@/app/lib/ecosystem/planner/plannerTypes";

type CreatorIntelligenceData = {
  sections: Array<[string, string]>;
  cta: string;
};

function getRouteCities(tripIntent?: TiyaTripIntent) {
  const origin = tripIntent?.fromCity?.trim() || "your origin";
  const destination = tripIntent?.toCity?.trim() || "the destination";
  const stops =
    tripIntent?.tripType === "Multi City"
      ? (tripIntent.multiCityStops || []).filter((stop) => stop.trim())
      : [];
  return { origin, destination, stops };
}

function stopsHint(routeOption: TiyaRouteOption) {
  return routeOption.routeStyle || "Route highlights";
}

type CreatorVisualItem = {
  id: string;
  title: string;
  handle: string;
  creatorName: string;
  views: string;
  rating: string;
  category: string;
  imageQuery: string;
  avatarTone: string;
  creatorId: string;
  routeId?: string;
  engagementScore: number;
  bestShootTime: string;
  contentType: string;
  categoryIds: string[];
};

type CreatorCategoryItem = {
  id: string;
  title: string;
  detail: string;
  imageQuery: string;
  Icon: typeof Camera;
  signal: string;
};

function creatorDestinationLabel(tripIntent?: TiyaTripIntent) {
  const destination = getRouteCities(tripIntent).destination;
  return destination && destination !== "the destination" ? destination : "Destination";
}

function creatorInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function buildCreatorVisuals(
  routeOption: TiyaRouteOption,
  tripIntent?: TiyaTripIntent
) {
  const destination = creatorDestinationLabel(tripIntent);
  const stopHint = stopsHint(routeOption);
  const routeName =
    stopHint && stopHint !== "Route highlights"
      ? stopHint
      : `${destination} Creator Circuit`;

  const featured: CreatorVisualItem[] = [
    {
      id: "sunset-point",
      title: `${destination} Sunset Point`,
      handle: "@HimalayanFrames",
      creatorName: "Aarav Mehta",
      views: "2.1M",
      rating: "4.9",
      category: "Golden Hour",
      imageQuery: `${destination} sunset viewpoint travel`,
      avatarTone: "from-orange-400 via-rose-400 to-fuchsia-500",
      creatorId: "creator_himalayan_frames",
      routeId: `${routeOption.id}_sunset_point`,
      engagementScore: 94,
      bestShootTime: "Sunset",
      contentType: "Photo + Reel",
      categoryIds: ["photography-locations", "sunset-points", "viral-reel-locations"],
    },
    {
      id: "viral-reel-location",
      title: "Viral Reel Location",
      handle: "@RideWithIndia",
      creatorName: "Kabir Sethi",
      views: "1.7M",
      rating: "4.8",
      category: "Viral Reel",
      imageQuery: `${destination} scenic road reel location`,
      avatarTone: "from-cyan-400 via-blue-500 to-violet-500",
      creatorId: "creator_ride_with_india",
      routeId: `${routeOption.id}_viral_reel`,
      engagementScore: 91,
      bestShootTime: "Golden hour",
      contentType: "Short-form Reel",
      categoryIds: ["viral-reel-locations", "creator-routes", "photography-locations"],
    },
    {
      id: "hidden-drone-spot",
      title: "Hidden Drone Spot",
      handle: "@NomadRahul",
      creatorName: "Rahul Verma",
      views: "850K",
      rating: "4.7",
      category: "Drone Spot",
      imageQuery: `${destination} aerial viewpoint hidden travel`,
      avatarTone: "from-emerald-400 via-teal-500 to-sky-500",
      creatorId: "creator_nomad_rahul",
      routeId: `${routeOption.id}_drone_spot`,
      engagementScore: 88,
      bestShootTime: "Early morning",
      contentType: "Drone + Route Story",
      categoryIds: ["photography-locations", "sunrise-points", "creator-routes"],
    },
  ];

  const categories: CreatorCategoryItem[] = [
    {
      id: "photography-locations",
      title: "Photography Locations",
      detail: "Frames, angles and landmark shots",
      imageQuery: `${destination} photography locations travel`,
      Icon: Camera,
      signal: "Creator frames",
    },
    {
      id: "viral-reel-locations",
      title: "Viral Reel Locations",
      detail: "Short-form ready travel moments",
      imageQuery: `${destination} viral travel reels location`,
      Icon: Sparkles,
      signal: "High reach",
    },
    {
      id: "sunrise-points",
      title: "Sunrise Points",
      detail: "Early light and quiet viewpoints",
      imageQuery: `${destination} sunrise viewpoint`,
      Icon: CloudSun,
      signal: "Morning light",
    },
    {
      id: "sunset-points",
      title: "Sunset Points",
      detail: "Golden hour and evening routes",
      imageQuery: `${destination} sunset point travel`,
      Icon: Moon,
      signal: "Golden hour",
    },
    {
      id: "creator-cafes",
      title: "Creator Cafes",
      detail: "Work, shoot and edit friendly stops",
      imageQuery: `${destination} cafe travel creator`,
      Icon: Utensils,
      signal: "Cafe culture",
    },
    {
      id: "creator-routes",
      title: "Creator Routes",
      detail: "Route-first stories and stopovers",
      imageQuery: `${destination} scenic route travel`,
      Icon: Route,
      signal: "Route story",
    },
  ];

  const trendingRoute = {
    routeId: `${routeOption.id}_creator_route`,
    creatorId: "creator_ride_with_india",
    routeName,
    creatorName: "Kabir Sethi",
    handle: "@RideWithIndia",
    views: "12.4M",
    rating: "4.8",
    engagementScore: 96,
    imageQuery: `${destination} ${routeName} creator route`,
    creatorImageQuery: `${destination} travel creator portrait`,
  };

  return { destination, featured, categories, trendingRoute };
}

function CreatorAvatar({
  name,
  tone,
}: {
  name: string;
  tone: string;
}) {
  return (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br ${tone} text-sm font-black text-white shadow-[0_12px_28px_rgba(15,23,42,0.28)]`}
      aria-label={`${name} avatar`}
    >
      {creatorInitials(name)}
    </div>
  );
}

function FeaturedCreatorCard({
  item,
  destination,
  isHighlighted,
  onOpen,
}: {
  item: CreatorVisualItem;
  destination: string;
  isHighlighted?: boolean;
  onOpen: (item: CreatorVisualItem, anchor: HTMLElement) => void;
}) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={(event) => onOpen(item, event.currentTarget)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(item, event.currentTarget);
        }
      }}
      className={`group min-w-0 cursor-pointer overflow-hidden rounded-[1.2rem] border bg-white shadow-[0_18px_42px_rgba(15,23,42,0.11)] outline-none transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_64px_rgba(15,23,42,0.18)] sm:rounded-[1.35rem] ${
        isHighlighted
          ? "border-violet-300 ring-4 ring-violet-100"
          : "border-white/70 focus-visible:border-violet-300 focus-visible:ring-4 focus-visible:ring-violet-100"
      }`}
    >
      <div className="relative h-44 overflow-hidden bg-slate-100 sm:h-52">
        <TPLDynamicImage
          imageQuery={item.imageQuery}
          fallbackQuery={`${destination} creator travel`}
          alt={item.title}
          className="absolute inset-0 h-full w-full"
          imgClassName="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          preferDynamic
          sizes="(min-width: 1280px) 31vw, (min-width: 640px) 50vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/84 via-slate-950/18 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full border border-white/30 bg-white/16 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white backdrop-blur">
          {item.category}
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h4 className="text-xl font-black leading-tight text-white">
                {item.title}
              </h4>
              <p className="mt-1 text-xs font-bold text-white/78">
                By {item.handle}
              </p>
            </div>
            <CreatorAvatar name={item.creatorName} tone={item.avatarTone} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5 p-3 sm:gap-2 sm:p-4">
        <div className="rounded-2xl bg-slate-50 p-3">
          <Eye size={15} className="text-slate-500" />
          <p className="mt-1 text-sm font-black text-slate-950">{item.views}</p>
          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
            Views
          </p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-3">
          <Star size={15} className="text-amber-500" />
          <p className="mt-1 text-sm font-black text-slate-950">{item.rating}</p>
          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-amber-600">
            Rating
          </p>
        </div>
        <div className="rounded-2xl bg-violet-50 p-3">
          <Zap size={15} className="text-violet-600" />
          <p className="mt-1 text-sm font-black text-slate-950">
            {item.engagementScore}
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-violet-600">
            Engage
          </p>
        </div>
      </div>
    </article>
  );
}

function creatorDiscoveryAnchor(anchor: HTMLElement): AnchorRect {
  const rect = anchor.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  };
}

function creatorSpotToDiscoveryItem(
  spot: CreatorVisualItem,
  destination: string
): DiscoveryItem {
  return {
    id: `creator-${spot.id}`,
    category: spot.category,
    title: spot.title,
    image: spot.imageQuery,
    description: `${spot.handle} recommends this ${spot.contentType.toLowerCase()} spot for high visual recall, strong route context and creator-friendly timing in ${destination}.`,
    distance: "Route linked",
    bestTime: spot.bestShootTime,
    duration: "45-60 min",
    difficulty: "Easy",
    crowdLevel: `${spot.views} views`,
    creatorReviews: `${spot.engagementScore} engagement`,
    bestPhotographyTime: spot.bestShootTime,
    nearbyFood: ["Creator-friendly cafe", "Local snack stop"],
    nearbyMarket: [`${destination} creator route`, "Local photo lane"],
  };
}

function creatorCategoryToDiscoveryItem(
  category: CreatorCategoryItem,
  matchingSpots: CreatorVisualItem[],
  destination: string
): DiscoveryItem {
  return {
    id: `creator-category-${category.id}`,
    category: "Creator Category",
    title: category.title,
    image: category.imageQuery,
    description: `${category.detail}. Best for ${category.signal.toLowerCase()} with matching creator stops like ${
      matchingSpots.map((spot) => spot.title).join(", ") || `${destination} route spots`
    }.`,
    distance: "Across route",
    bestTime: category.signal,
    duration: "Flexible",
    difficulty: "Easy",
    crowdLevel: "Creator-ready",
    creatorReviews: "Category match",
    bestPhotographyTime: category.signal,
    nearbyFood: matchingSpots.slice(0, 2).map((spot) => spot.title),
    nearbyMarket: [`${destination} creator content`, "Route discovery"],
  };
}

function creatorRouteToDiscoveryItem(
  route: ReturnType<typeof buildCreatorVisuals>["trendingRoute"],
  destination: string
): DiscoveryItem {
  return {
    id: `creator-route-${route.routeId}`,
    category: "Creator Route",
    title: route.routeName,
    image: route.imageQuery,
    description: `${route.handle} route with scenic stopover frames, golden-hour content and route-first storytelling for ${destination}.`,
    distance: "Full route",
    bestTime: "Golden hour",
    duration: "Half day",
    difficulty: "Moderate",
    crowdLevel: `${route.views} views`,
    creatorReviews: `${route.engagementScore} engagement`,
    bestPhotographyTime: "Golden hour",
    nearbyFood: ["Creator cafe stop", "Route snack halt"],
    nearbyMarket: [`${destination} creator route`, "Local content stops"],
  };
}

function CreatorWaitlistModal({
  isSubmitted,
  onClose,
  onSubmit,
}: {
  isSubmitted: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  useEffect(() => {
    if (typeof document === "undefined") return;

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
  }, []);

  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center overflow-hidden bg-slate-950/28 p-0 sm:items-center sm:p-3">
      <button
        type="button"
        aria-label="Close waiting list modal"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="TPL Creator waiting list"
        className="relative flex max-h-[85vh] w-full max-w-[420px] flex-col overflow-hidden rounded-t-[28px] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)] sm:rounded-[1.45rem]"
      >
        <div className="flex shrink-0 justify-center pt-2 sm:hidden">
          <span className="h-1.5 w-12 rounded-full bg-slate-300" />
        </div>
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 p-4 sm:border-b-0 sm:p-5 sm:pb-0">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-700">
              TPL Creator Program
            </p>
            <h5 className="mt-1 text-xl font-black text-slate-950">
              Join Waiting List
            </h5>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600"
          >
            <X size={16} />
          </button>
        </div>

        {isSubmitted ? (
          <div className="m-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-black text-emerald-800 sm:m-5">
            You are added to TPL Creator waiting list
          </div>
        ) : (
          <form
            className="grid min-h-0 flex-1 gap-3 overflow-y-auto overscroll-contain p-4 pb-[calc(1rem_+_env(safe-area-inset-bottom))] sm:p-5"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
          >
            <label className="grid gap-1 text-xs font-black text-slate-700">
              Name
              <input
                required
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                placeholder="Your name"
              />
            </label>
            <label className="grid gap-1 text-xs font-black text-slate-700">
              Mobile or Email
              <input
                required
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                placeholder="mobile number or email"
              />
            </label>
            <label className="grid gap-1 text-xs font-black text-slate-700">
              Creator Type
              <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100">
                <option>Travel Reels Creator</option>
                <option>Photography Creator</option>
                <option>YouTube Travel Creator</option>
                <option>Local Guide</option>
              </select>
            </label>
            <button
              type="submit"
              className="sticky bottom-0 mt-2 rounded-full bg-slate-950 px-5 py-3 text-xs font-black text-white shadow-[0_12px_28px_rgba(15,23,42,0.18)]"
            >
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function TPLCreatorsSection({
  routeOption,
  tripIntent,
  creatorIntelligence,
  onAddToTrip,
  onSave,
}: {
  routeOption: TiyaRouteOption;
  tripIntent?: TiyaTripIntent;
  creatorIntelligence: CreatorIntelligenceData;
  onAddToTrip?: (item: DiscoveryItem) => void;
  onSave?: (item: DiscoveryItem) => void;
}) {
  const router = useRouter();
  const [selectedDiscovery, setSelectedDiscovery] =
    useState<DiscoveryItem | null>(null);
  const [discoveryAnchor, setDiscoveryAnchor] = useState<AnchorRect | null>(null);
  const [selectedCreatorCategory, setSelectedCreatorCategory] =
    useState<string | null>(null);
  const [creatorMessage, setCreatorMessage] = useState<string | null>(null);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [isWaitlistSubmitted, setIsWaitlistSubmitted] = useState(false);
  const { destination, featured, categories, trendingRoute } = buildCreatorVisuals(
    routeOption,
    tripIntent
  );
  const selectedCategoryTitle =
    categories.find((category) => category.id === selectedCreatorCategory)?.title || "";
  const showCreatorMessage = (message: string) => {
    setCreatorMessage(message);
    window.setTimeout(() => setCreatorMessage(null), 2400);
  };
  const openCreatorDiscovery = (item: DiscoveryItem, anchor: HTMLElement) => {
    setSelectedDiscovery(item);
    setDiscoveryAnchor(creatorDiscoveryAnchor(anchor));
  };
  const closeCreatorDiscovery = () => {
    setSelectedDiscovery(null);
    setDiscoveryAnchor(null);
  };

  return (
    <div className="relative grid min-w-0 gap-4 sm:gap-5">
      {creatorMessage ? (
        <div className="fixed left-3 right-3 top-4 z-[160] rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-center text-xs font-black text-emerald-800 shadow-[0_14px_34px_rgba(15,23,42,0.14)] sm:left-auto sm:right-4 sm:text-left">
          {creatorMessage}
        </div>
      ) : null}

      <section className="min-w-0 overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:rounded-[1.6rem]">
        <div className="relative px-4 py-5 sm:px-5">
          <div className="absolute inset-0 opacity-45">
            <TPLDynamicImage
              imageQuery={`${destination} travel creator landscape`}
              fallbackQuery={`${destination} scenic travel`}
              alt={`${destination} creator ecosystem`}
              className="absolute inset-0 h-full w-full"
              imgClassName="h-full w-full object-cover"
              preferDynamic
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/80 to-slate-950/46" />
          </div>
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-200">
                TPL Creators
              </p>
              <h4 className="mt-2 max-w-2xl text-xl font-black leading-tight text-white sm:text-3xl">
                Creator routes, viral spots and destination stories for {destination}
              </h4>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/72">
                Instagram-style discovery, YouTube travel routes and creator-led stopovers prepared for the future TPL Creators ecosystem.
              </p>
            </div>
            <Link
              href="/explore"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white px-4 py-2 text-xs font-black text-slate-950 shadow-[0_14px_34px_rgba(0,0,0,0.24)] transition hover:bg-orange-50 sm:w-auto"
            >
              {creatorIntelligence.cta}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-700">
              Featured Creator Picks
            </p>
            <h5 className="mt-1 text-xl font-black text-slate-950">
              High-signal places creators would shoot first
            </h5>
          </div>
          <div className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700">
            API-ready creator feed
          </div>
        </div>
        <div className="grid min-w-0 gap-4 lg:grid-cols-3">
          {featured.map((item) => (
            <FeaturedCreatorCard
              key={item.id}
              item={item}
              destination={destination}
              isHighlighted={
                !selectedCreatorCategory ||
                item.categoryIds.includes(selectedCreatorCategory)
              }
              onOpen={(spot, anchor) =>
                openCreatorDiscovery(
                  creatorSpotToDiscoveryItem(spot, destination),
                  anchor
                )
              }
            />
          ))}
        </div>
        {selectedCreatorCategory ? (
          <p className="text-xs font-bold text-slate-500">
            Highlighting creator spots for {selectedCategoryTitle}.
          </p>
        ) : null}
      </section>

      <section className="grid gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-700">
            Creator Discovery Categories
          </p>
          <h5 className="mt-1 text-xl font-black text-slate-950">
            Find the right creator angle
          </h5>
        </div>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map(({ id, title, detail, imageQuery, Icon, signal }) => (
            <article
              key={id}
              role="button"
              tabIndex={0}
              onClick={(event) => {
                setSelectedCreatorCategory(id);
                openCreatorDiscovery(
                  creatorCategoryToDiscoveryItem(
                    { id, title, detail, imageQuery, Icon, signal },
                    featured.filter((spot) => spot.categoryIds.includes(id)),
                    destination
                  ),
                  event.currentTarget
                );
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedCreatorCategory(id);
                  openCreatorDiscovery(
                    creatorCategoryToDiscoveryItem(
                      { id, title, detail, imageQuery, Icon, signal },
                      featured.filter((spot) => spot.categoryIds.includes(id)),
                      destination
                    ),
                    event.currentTarget
                  );
                }
              }}
              className={`group relative min-h-[172px] cursor-pointer overflow-hidden rounded-[1.25rem] border bg-slate-900 outline-none shadow-[0_16px_36px_rgba(15,23,42,0.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_52px_rgba(15,23,42,0.18)] ${
                selectedCreatorCategory === id
                  ? "border-violet-300 ring-4 ring-violet-100"
                  : "border-white/70 focus-visible:border-violet-300 focus-visible:ring-4 focus-visible:ring-violet-100"
              }`}
            >
              <TPLDynamicImage
                imageQuery={imageQuery}
                fallbackQuery={`${destination} travel creator`}
                alt={title}
                className="absolute inset-0 h-full w-full"
                imgClassName="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                preferDynamic
                sizes="(min-width: 1280px) 31vw, (min-width: 640px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/88 via-slate-950/34 to-transparent" />
              <div className="relative flex min-h-[172px] flex-col justify-between p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/18 text-white backdrop-blur">
                    <Icon size={18} />
                  </div>
                  <span className="rounded-full border border-white/20 bg-white/16 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white backdrop-blur">
                    {signal}
                  </span>
                </div>
                <div>
                  <h6 className="text-lg font-black leading-tight text-white">
                    {title}
                  </h6>
                  <p className="mt-1 text-xs font-semibold leading-5 text-white/76">
                    {detail}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="min-w-0 overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-[0_22px_58px_rgba(15,23,42,0.12)] sm:rounded-[1.6rem]">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative min-h-[240px] overflow-hidden bg-slate-100 sm:min-h-[320px]">
            <TPLDynamicImage
              imageQuery={trendingRoute.imageQuery}
              fallbackQuery={`${destination} creator route travel`}
              alt={trendingRoute.routeName}
              className="absolute inset-0 h-full w-full"
              imgClassName="h-full w-full object-cover"
              preferDynamic
              sizes="(min-width: 1024px) 58vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/86 via-slate-950/16 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <span className="rounded-full border border-white/24 bg-white/16 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white backdrop-blur">
                Trending Creator Route
              </span>
              <h5 className="mt-3 max-w-xl text-xl font-black leading-tight text-white sm:text-3xl">
                {trendingRoute.routeName}
              </h5>
              <p className="mt-2 text-sm font-bold text-white/78">
                By {trendingRoute.handle}
              </p>
            </div>
          </div>
          <div className="flex min-w-0 flex-col justify-between gap-4 p-4 sm:gap-5 sm:p-5">
            <div>
              <div className="flex items-center gap-3">
                <CreatorAvatar
                  name={trendingRoute.creatorName}
                  tone="from-cyan-400 via-blue-500 to-violet-500"
                />
                <div>
                  <p className="text-sm font-black text-slate-950">
                    {trendingRoute.creatorName}
                  </p>
                  <p className="text-xs font-bold text-slate-500">
                    {trendingRoute.handle}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-1.5 sm:mt-5 sm:gap-2">
                {([
                  ["Views", trendingRoute.views, Eye],
                  ["Rating", trendingRoute.rating, Star],
                  ["Engage", trendingRoute.engagementScore, Zap],
                ] as Array<readonly [string, string, LucideIcon]>).map(([label, value, Icon]) => (
                  <div
                    key={`trending-${label}`}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-3"
                  >
                    <Icon size={15} className="text-violet-600" />
                    <p className="mt-2 text-sm font-black text-slate-950">
                      {value}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-700">
                  Future API fields
                </p>
                <div className="mt-2 grid gap-1 text-xs font-bold text-slate-700">
                  <span>creatorId: {trendingRoute.creatorId}</span>
                  <span>routeId: {trendingRoute.routeId}</span>
                  <span>viewCount: {trendingRoute.views}</span>
                  <span>engagementScore: {trendingRoute.engagementScore}</span>
                </div>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={(event) =>
                  openCreatorDiscovery(
                    creatorRouteToDiscoveryItem(trendingRoute, destination),
                    event.currentTarget
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-xs font-black text-white shadow-[0_14px_34px_rgba(15,23,42,0.22)] transition hover:bg-slate-800"
              >
                Open Creator Route
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => {
                  onSave?.(creatorRouteToDiscoveryItem(trendingRoute, destination));
                  showCreatorMessage("Saved");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-800 transition hover:bg-slate-50"
              >
                <Heart size={14} />
                Save Route
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="min-w-0 overflow-hidden rounded-[1.25rem] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-sky-50 p-4 shadow-[0_20px_54px_rgba(15,23,42,0.09)] sm:rounded-[1.6rem] sm:p-5">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-700">
              Become a TPL Creator
            </p>
            <h5 className="mt-2 text-xl font-black leading-tight text-slate-950 sm:text-2xl">
              Turn travel stories into creator commerce
            </h5>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              Future-ready ecosystem teaser for creator profiles, paid content, route licensing, brand collaborations and local discovery.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {([
              ["Upload Travel Videos", Upload, "Build a destination video library"],
              ["Sell Travel Content", DollarSign, "License footage, guides and routes"],
              ["Build Community", Users, "Grow followers around travel niches"],
              ["Earn Revenue", WalletCards, "Creator earnings and brand deals"],
            ] as Array<readonly [string, LucideIcon, string]>).map(([title, Icon, detail]) => (
              <div
                key={`creator-cta-${title}`}
                className="rounded-2xl border border-white bg-white/88 p-4 shadow-sm"
              >
                <Icon size={18} className="text-orange-600" />
                <p className="mt-3 text-sm font-black text-slate-950">{title}</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                  {detail}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setIsWaitlistSubmitted(false);
              setIsWaitlistOpen(true);
            }}
            className="w-full rounded-full bg-slate-950 px-5 py-3 text-xs font-black text-white shadow-[0_14px_34px_rgba(15,23,42,0.22)] sm:w-auto"
          >
            Join Waiting List
          </button>
          <Link
            href="/explore"
            className="w-full rounded-full border border-orange-200 bg-white px-5 py-3 text-xs font-black text-orange-700 shadow-sm sm:w-auto"
          >
            Explore Creator Program
          </Link>
        </div>
      </section>

      <DiscoveryDrawer
        item={selectedDiscovery}
        isOpen={Boolean(selectedDiscovery)}
        anchorRect={discoveryAnchor}
        onClose={closeCreatorDiscovery}
        onAddToTrip={(item) => {
          onAddToTrip?.(item);
          showCreatorMessage("Added to trip draft");
        }}
        onSave={(item) => {
          onSave?.(item);
          showCreatorMessage("Saved");
        }}
        onCreatorTips={() => router.push("/explore")}
      />

      {isWaitlistOpen ? (
        <CreatorWaitlistModal
          isSubmitted={isWaitlistSubmitted}
          onClose={() => setIsWaitlistOpen(false)}
          onSubmit={() => setIsWaitlistSubmitted(true)}
        />
      ) : null}
    </div>
  );
}
