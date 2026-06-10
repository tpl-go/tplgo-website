"use client";

import Link from "next/link";
import { useState } from "react";
import { Compass, MapPinned, Sparkles, WalletCards } from "lucide-react";
import TPLDynamicImage from "@/app/components/common/TPLDynamicImage";
import DiscoveryDrawer, {
  type AnchorRect,
  type DiscoveryItem,
} from "@/app/components/ecosystem/planner/smart-planner/drawers/DiscoveryDrawer";
import { resolveDynamicImage } from "@/app/lib/images/dynamicImageEngine";
import { getSmartDestinationImage } from "@/app/lib/images/smartPackageImageResolver";
import type { TiyaRouteOption, TiyaTripIntent } from "@/app/lib/ecosystem/planner/plannerTypes";

type LocalLifeData = {
  sections: Array<[string, string]>;
  cta: string;
};

function localSectionDetail(
  sections: Array<[string, string]>,
  title: string,
  fallback: string
) {
  return sections.find(([sectionTitle]) => sectionTitle === title)?.[1] ?? fallback;
}

function splitLocalDetail(detail: string) {
  return detail
    .split("•")
    .map((item) => item.trim())
    .filter(Boolean);
}

function localDestinationName(tripIntent?: TiyaTripIntent) {
  return (tripIntent?.toCity || "Destination").trim();
}

function normalizeLocalImageKey(value?: string | null) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");
}

const localLifeImageAliasMap: Record<string, string> = {
  leh: "ladakh",
  lehladakh: "ladakh",
  ladakh: "ladakh",
  pangong: "pangong-lake",
  pangonglake: "pangong-lake",
  pangongtso: "pangong-lake",
  nubra: "nubra-valley",
  nubravalley: "nubra-valley",
  sham: "sham-valley",
  shamvalley: "sham-valley",
  jaipur: "jaipur",
  manali: "manali",
  srinagar: "kashmir",
  kashmir: "kashmir",
  agra: "agra",
  tajmahal: "agra",
};

const localLifeRegionFallbackMap: Record<string, string> = {
  ladakh: "ladakh",
  "pangong-lake": "ladakh",
  "nubra-valley": "ladakh",
  "sham-valley": "ladakh",
  kashmir: "kashmir",
  jaipur: "rajasthan",
  manali: "himachalpradesh",
};

const localLifePlaceQueryMap: Record<string, string> = {
  ladakh: "ladakh mountain road trip india",
  "pangong-lake": "pangong lake ladakh blue lake mountains india",
  "nubra-valley": "nubra valley ladakh sand dunes mountains india",
  "sham-valley": "sham valley ladakh monastery mountains india",
  jaipur: "jaipur travel destination",
  manali: "manali travel destination",
  kashmir: "kashmir valley snow mountains",
  rajasthan: "rajasthan palace desert india",
  himachalpradesh: "himachal mountains manali india",
  agra: "agra taj mahal india travel",
};

const localLifeThemeFallbackMap: Record<string, string> = {
  food: "indian food street market travel",
  market: "india local culture heritage market",
  products: "india local culture heritage market",
  shopping: "india local culture heritage market",
  culture: "india local culture heritage market",
  scenic: "road trip scenic highway mountains india",
  hidden: "nature eco retreat mountains india",
};

function localLifePlaceKey(value?: string | null) {
  const normalized = normalizeLocalImageKey(value);
  if (!normalized) return "";

  for (const [match, alias] of Object.entries(localLifeImageAliasMap)) {
    if (normalized.includes(match)) return alias;
  }

  return normalized;
}

function knownLocalLifePlaceKey(value?: string | null) {
  const normalized = normalizeLocalImageKey(value);
  if (!normalized) return "";

  for (const [match, alias] of Object.entries(localLifeImageAliasMap)) {
    if (normalized.includes(match)) return alias;
  }

  return "";
}

function localLifeThemeQuery(value?: string | null) {
  const normalized = normalizeLocalImageKey(value);

  for (const [match, query] of Object.entries(localLifeThemeFallbackMap)) {
    if (normalized.includes(match)) return query;
  }

  return "premium travel destination landscape vacation";
}

function resolveLocalLifeImage({
  destination,
  routeOption,
  imageContext,
  preferRouteNode = false,
}: {
  destination: string;
  routeOption?: TiyaRouteOption;
  imageContext?: string;
  preferRouteNode?: boolean;
}) {
  const destinationKey = localLifePlaceKey(destination);
  const routeNodeKey = preferRouteNode ? knownLocalLifePlaceKey(imageContext) : "";
  const exactKey = routeNodeKey || destinationKey;
  const regionKey = localLifeRegionFallbackMap[exactKey] || "";
  const exactQuery = localLifePlaceQueryMap[exactKey];
  const regionQuery = localLifePlaceQueryMap[regionKey];
  const themeQuery = localLifeThemeQuery(imageContext || routeOption?.routeStyle);
  const imageQuery = exactQuery || regionQuery || themeQuery;
  const fallbackQuery = regionQuery || themeQuery;
  const smartImage = getSmartDestinationImage({
    title: destination,
    route: `${destination} ${routeOption?.name || ""}`,
    cities: [destination],
    country: "India",
    themes: [routeOption?.routeStyle || "culture"],
  });

  return {
    src: "",
    imageQuery,
    fallbackSrc: smartImage.fallbackSrc,
    fallbackQuery,
    preferDynamic: true,
  };
}

function buildLocalCards(
  detail: string,
  fallbacks: string[],
  categories: string[]
) {
  const names = splitLocalDetail(detail);
  const cardNames = names.length ? names : fallbacks;

  return cardNames.slice(0, 6).map((name, index) => ({
    name,
    category: categories[index % categories.length],
    description:
      index % 3 === 0
        ? "A strong local flavour marker for this route."
        : index % 3 === 1
          ? "Good fit for slow exploration and creator-led stops."
          : "Best discovered with time to walk, taste and observe.",
    popularity: index % 3 === 0 ? "Local favourite" : index % 3 === 1 ? "Creator pick" : "Worth a detour",
  }));
}

function DestinationImagePlaceholder({
  label,
  destination,
  routeOption,
  imageContext,
  tone = "emerald",
}: {
  label: string;
  destination: string;
  routeOption?: TiyaRouteOption;
  imageContext?: string;
  tone?: "emerald" | "orange" | "cyan" | "violet" | "slate";
}) {
  const tones = {
    emerald: "from-emerald-700 via-teal-600 to-slate-900",
    orange: "from-orange-700 via-amber-600 to-slate-900",
    cyan: "from-cyan-700 via-sky-600 to-slate-900",
    violet: "from-violet-700 via-fuchsia-700 to-slate-900",
    slate: "from-slate-700 via-zinc-700 to-slate-950",
  };
  const smartImage = resolveLocalLifeImage({
    destination,
    routeOption,
    imageContext: `${imageContext || ""} ${label}`,
    preferRouteNode: true,
  });

  return (
    <div className={`relative min-h-[118px] overflow-hidden rounded-[1.1rem] bg-gradient-to-br sm:min-h-[132px] sm:rounded-[1.2rem] ${tones[tone]}`}>
      <TPLDynamicImage
        src={smartImage.src}
        imageQuery={smartImage.imageQuery}
        fallbackSrc={smartImage.fallbackSrc}
        fallbackQuery={smartImage.fallbackQuery}
        alt={`${destination} ${label}`}
        className="absolute inset-0 h-full w-full"
        imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        preferDynamic={smartImage.preferDynamic}
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      <div className="absolute inset-0 bg-black/18" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.24),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.12),transparent_44%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black/40 to-transparent" />
      <div className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-white/14 px-3 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white backdrop-blur">
        {label}
      </div>
    </div>
  );
}

function LocalLifeVibeBanner({
  destination,
  routeOption,
}: {
  destination: string;
  routeOption: TiyaRouteOption;
}) {
  const smartImage = resolveLocalLifeImage({
    destination,
    routeOption,
    imageContext: "local life culture food markets hidden gems",
  });
  const heroImage = resolveDynamicImage({
    imageQuery: smartImage.imageQuery,
    fallbackImage: smartImage.fallbackSrc,
    imageAlt: `${destination} local life`,
    preferDynamic: smartImage.preferDynamic,
  });

  return (
    <div className="relative min-h-[220px] overflow-hidden rounded-[1.25rem] border border-emerald-200 bg-slate-950 p-4 text-white shadow-[0_24px_64px_rgba(15,23,42,0.22)] sm:min-h-[270px] sm:rounded-[1.55rem] sm:p-5 lg:min-h-[290px]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${heroImage.src}")` }}
        aria-label={heroImage.alt}
      />
      <div className="absolute inset-0 bg-black/18" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.86)_0%,rgba(15,23,42,0.58)_42%,rgba(15,23,42,0.10)_100%),linear-gradient(0deg,rgba(2,6,23,0.76)_0%,rgba(2,6,23,0.28)_44%,rgba(2,6,23,0.06)_100%)]" />
      <div className="relative flex min-h-[188px] max-w-3xl flex-col justify-end sm:min-h-[230px] lg:min-h-[250px]">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100/80">
          DESTINATION VIBE
        </p>
        <h5 className="mt-2 text-4xl font-black leading-tight text-white sm:text-5xl">
          {destination.toUpperCase()} LOCAL LIFE
        </h5>
        <p className="mt-3 text-sm font-semibold text-white/76">
          Local culture • food • markets • hidden gems
        </p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {[
            "Local food",
            "Markets",
            "Hidden gems",
            "Culture",
            "Creator-friendly stops",
          ].map((tag) => (
            <span
              key={`local-vibe-${tag}`}
              className="rounded-full border border-white/16 bg-white/12 px-3 py-1.5 text-[10px] font-black text-white backdrop-blur"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-5">
          <Link
            href="/local-market"
            className="inline-flex w-full justify-center rounded-full border border-white/24 bg-white px-4 py-2 text-xs font-black text-slate-950 shadow-[0_12px_26px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-emerald-50 sm:w-auto"
          >
            Explore More Local Experiences -&gt;
          </Link>
        </div>
      </div>
    </div>
  );
}

function LocalDiscoveryCard({
  card,
  destination,
  routeOption,
  tone,
  onExplore,
}: {
  card: ReturnType<typeof buildLocalCards>[number];
  destination: string;
  routeOption: TiyaRouteOption;
  tone: "emerald" | "orange" | "cyan" | "violet" | "slate";
  onExplore: (anchor: HTMLElement) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(event) => onExplore(event.currentTarget)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onExplore(event.currentTarget);
        }
      }}
      className="group rounded-[1.35rem] border border-slate-200 bg-white/92 p-3 shadow-[0_14px_34px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_46px_rgba(15,23,42,0.14)]"
    >
      <DestinationImagePlaceholder
        label={card.category}
        destination={destination}
        routeOption={routeOption}
        imageContext={`${card.name} ${card.category}`}
        tone={tone}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-700">
          {card.category}
        </span>
        <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-orange-700">
          {card.popularity}
        </span>
      </div>
      <p className="mt-3 text-base font-black leading-snug text-slate-950">
        {card.name}
      </p>
      <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">
        {card.description}
      </p>
    </div>
  );
}

function LocalSectionHeader({
  eyebrow,
  title,
  detail,
}: {
  eyebrow: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
          {eyebrow}
        </p>
        <h5 className="mt-1 text-xl font-black text-slate-950">{title}</h5>
      </div>
      <p className="max-w-md text-xs font-semibold leading-5 text-slate-600">
        {detail}
      </p>
    </div>
  );
}

function LocalMarketCard({
  name,
  destination,
  routeOption,
  index,
  onExplore,
}: {
  name: string;
  destination: string;
  routeOption: TiyaRouteOption;
  index: number;
  onExplore: (anchor: HTMLElement) => void;
}) {
  const marketTypes = ["Traditional Market", "Night Market", "Handicraft Market", "Food Market"];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(event) => onExplore(event.currentTarget)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onExplore(event.currentTarget);
        }
      }}
      className="group overflow-hidden rounded-[1.35rem] border border-cyan-100 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_46px_rgba(15,23,42,0.14)]"
    >
      <DestinationImagePlaceholder
        label={marketTypes[index % marketTypes.length]}
        destination={destination}
        routeOption={routeOption}
        imageContext={`${name} local market`}
        tone={index % 2 === 0 ? "cyan" : "orange"}
      />
      <div className="p-4">
        <p className="text-base font-black text-slate-950">{name}</p>
        <div className="mt-3 grid gap-2 text-xs font-bold text-slate-600">
          <span>Best time: Evening walk</span>
          <span>Known for: Local products and street atmosphere</span>
          <span>Walking time: 45-90 min</span>
        </div>
        <span className="mt-3 inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-cyan-700">
          Market vibe
        </span>
      </div>
    </div>
  );
}

type HiddenGemDiscovery = {
  name: string;
  description: string;
  bestTime: string;
  distance: string;
  badge: string;
};

function buildHiddenGemDiscoveries(
  destination: string,
  rawItems: string[],
  routeOption: TiyaRouteOption
): HiddenGemDiscovery[] {
  const genericItems = [
    "secret viewpoints",
    "hidden cafes",
    "less crowded spots",
    "local shortcuts",
    "underrated experiences",
  ];
  const isGeneric = (value: string) =>
    genericItems.some((item) => normalizeLocalImageKey(value) === normalizeLocalImageKey(item));
  const destinationTemplates: HiddenGemDiscovery[] = [
    {
      name: destination.toLowerCase().includes("leh")
        ? "Magnetic Hill Viewpoint"
        : `${destination} Quiet Viewpoint`,
      description: destination.toLowerCase().includes("leh")
        ? "Less crowded viewpoint near the Leh route."
        : `Less crowded viewpoint near ${destination}.`,
      bestTime: "Sunset",
      distance: destination.toLowerCase().includes("leh")
        ? "18 km"
        : routeOption.id === "fastest"
          ? "20-35 min"
          : "Short detour",
      badge: "Secret viewpoint",
    },
    {
      name: destination.toLowerCase().includes("leh")
        ? "Shanti Stupa Sunset Point"
        : `${destination} Sunset Point`,
      description: destination.toLowerCase().includes("leh")
        ? "Quiet sunset deck overlooking Leh town."
        : `Calm sunset spot with softer crowds.`,
      bestTime: "Golden hour",
      distance: destination.toLowerCase().includes("leh") ? "5 km" : "Near city hub",
      badge: "Less crowded spot",
    },
    {
      name: destination.toLowerCase().includes("leh")
        ? "Local Cafe View Deck"
        : `${destination} Local Cafe View Deck`,
      description: destination.toLowerCase().includes("leh")
        ? "Creator-friendly cafe stop with mountain views."
        : `Creator-friendly cafe stop with local views.`,
      bestTime: "Late afternoon",
      distance: destination.toLowerCase().includes("leh") ? "Old Leh area" : "Main market area",
      badge: "Hidden cafe",
    },
    {
      name: `${destination} Underrated Experience Pocket`,
      description: `Underrated local stop beyond the standard checklist.`,
      bestTime: "Morning",
      distance: routeOption.id === "adventure" ? "Route-side halt" : "10-25 min from hub",
      badge: "Underrated experience",
    },
  ];
  const specificItems = rawItems.filter((item) => item && !isGeneric(item));
  const sourceItems = specificItems.length ? specificItems : [];

  return (sourceItems.length ? sourceItems : destinationTemplates.map((item) => item.name))
    .slice(0, 6)
    .map((name, index) => {
      const template = destinationTemplates[index % destinationTemplates.length];
      const specific = specificItems.length > 0;

      return {
        name: specific ? name : template.name,
        description: specific
          ? `${name} adds a quieter discovery layer to ${destination}, with better pacing than the standard tourist circuit.`
          : template.description,
        bestTime: template.bestTime,
        distance: template.distance,
        badge: template.badge,
      };
    });
}

function HiddenGemCard({
  gem,
  destination,
  routeOption,
  onExplore,
}: {
  gem: HiddenGemDiscovery;
  destination: string;
  routeOption: TiyaRouteOption;
  onExplore: (anchor: HTMLElement) => void;
}) {
  const smartImage = resolveLocalLifeImage({
    destination,
    routeOption,
    imageContext: `${gem.name} ${gem.badge}`,
    preferRouteNode: true,
  });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(event) => onExplore(event.currentTarget)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onExplore(event.currentTarget);
        }
      }}
      className="group overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_46px_rgba(15,23,42,0.14)]"
    >
      <div className="relative h-40 overflow-hidden bg-slate-100">
        <TPLDynamicImage
          src={smartImage.src}
          imageQuery={smartImage.imageQuery}
          fallbackSrc={smartImage.fallbackSrc}
          fallbackQuery={smartImage.fallbackQuery}
          alt={`${destination} ${gem.name}`}
          className="absolute inset-0 h-full w-full"
          imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          preferDynamic={smartImage.preferDynamic}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-700 shadow-sm">
          Hidden gem
        </div>
      </div>
      <div className="p-4">
        <p className="text-base font-black leading-snug text-slate-950">
          {gem.name}
        </p>
        <p className="mt-1 line-clamp-1 text-xs font-semibold leading-5 text-slate-600">
          {gem.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
            Best: {gem.bestTime}
          </span>
          <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-black text-sky-700">
            Distance: {gem.distance}
          </span>
        </div>
        <button
          type="button"
          className="mt-4 text-xs font-black text-orange-700 transition hover:text-orange-800"
        >
          Explore -&gt;
        </button>
      </div>
    </div>
  );
}

function LocalRecommendationCard({
  title,
  detail,
  index,
  onExplore,
}: {
  title: string;
  detail: string;
  index: number;
  onExplore: (anchor: HTMLElement) => void;
}) {
  const recommendations = [
    "Best evening market",
    "Best local breakfast",
    "Best sunset cafe",
    "Best creator-friendly street",
    "Best local experience",
  ];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(event) => onExplore(event.currentTarget)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onExplore(event.currentTarget);
        }
      }}
      className="rounded-[1.25rem] border border-orange-100 bg-white/92 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.07)]"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-orange-700">
          <Sparkles size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.13em] text-orange-600">
            {recommendations[index % recommendations.length]}
          </p>
          <p className="mt-1 text-sm font-black leading-snug text-slate-950">
            {title}
          </p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
            {detail}
          </p>
        </div>
      </div>
    </div>
  );
}

function discoveryImageQuery(
  destination: string,
  routeOption: TiyaRouteOption,
  imageContext: string
) {
  const smartImage = resolveLocalLifeImage({
    destination,
    routeOption,
    imageContext,
    preferRouteNode: true,
  });

  return smartImage.imageQuery || smartImage.fallbackQuery || smartImage.fallbackSrc;
}

function makeDiscoveryItem({
  destination,
  routeOption,
  category,
  title,
  description,
  distance,
  bestTime,
  duration,
  difficulty,
  imageContext,
}: {
  destination: string;
  routeOption: TiyaRouteOption;
  category: string;
  title: string;
  description: string;
  distance?: string;
  bestTime?: string;
  duration?: string;
  difficulty?: string;
  imageContext?: string;
}): DiscoveryItem {
  const slug = normalizeLocalImageKey(`${category}-${title}`) || "local-life";

  return {
    id: `${normalizeLocalImageKey(destination) || "destination"}-${slug}`,
    category,
    title,
    image: discoveryImageQuery(
      destination,
      routeOption,
      imageContext || `${title} ${category}`
    ),
    description,
    distance,
    bestTime,
    duration: duration || "1 Hour",
    difficulty: difficulty || "Easy",
    googleRating: "4.5 placeholder",
    weatherStatus: "Clear window",
    crowdLevel: category === "Hidden Gem" ? "Emerging" : "Moderate",
    creatorReviews: "Creator-ready",
    openStatus: "Check before visit",
    bestPhotographyTime: bestTime || "Golden hour",
    nearbyFood: [`${destination} local breakfast`, "Creator-friendly cafe"],
    nearbyMarket: [`${destination} market lane`, "Local product pocket"],
  };
}

export default function LocalLifeSection({
  routeOption,
  tripIntent,
  localLife,
}: {
  routeOption: TiyaRouteOption;
  tripIntent?: TiyaTripIntent;
  localLife: LocalLifeData;
}) {
  const destination = localDestinationName(tripIntent);
  const [selectedDiscovery, setSelectedDiscovery] = useState<DiscoveryItem | null>(null);
  const [discoveryAnchor, setDiscoveryAnchor] = useState<AnchorRect | null>(null);
  const foodCards = buildLocalCards(
    localSectionDetail(localLife.sections, "Local Food", ""),
    ["Local cuisine", "Street food", "Cafe culture", "Must try dishes", "Food streets", "Creator recommended cafes"],
    ["Local Cuisine", "Street Food", "Cafe Culture", "Must Try", "Food Street", "Creator Cafe"]
  );
  const productCards = buildLocalCards(
    localSectionDetail(localLife.sections, "Local Products", ""),
    ["Handicrafts", "Regional products", "Souvenirs", "Local specialties", "Creator picks"],
    ["Handicrafts", "Regional Product", "Souvenir", "Local Specialty", "Creator Pick"]
  );
  const marketItems = splitLocalDetail(
    localSectionDetail(localLife.sections, "Local Markets", "Traditional Market • Night Market • Handicraft Market • Food Market")
  );
  const hiddenGems = splitLocalDetail(
    localSectionDetail(localLife.sections, "Hidden Gems", "Secret viewpoints • Hidden cafes • Less crowded spots • Local shortcuts • Underrated experiences")
  );
  const hiddenGemDiscoveries = buildHiddenGemDiscoveries(
    destination,
    hiddenGems,
    routeOption
  );
  const cultureItems = splitLocalDetail(
    localSectionDetail(localLife.sections, "Culture Experiences", "Local traditions • Local etiquette • Festivals • Community experiences • Dress suggestions • Cultural notes")
  );
  const shoppingItems = splitLocalDetail(
    localSectionDetail(localLife.sections, "Shopping Areas", "What to buy • Best shopping areas • Price expectations • Authentic local products")
  );
  const recommendationItems = splitLocalDetail(
    localSectionDetail(localLife.sections, "Local Recommendations", "")
  );
  const openDiscovery = (
    item: Omit<Parameters<typeof makeDiscoveryItem>[0], "destination" | "routeOption">,
    anchor: HTMLElement
  ) => {
    const rect = anchor.getBoundingClientRect();
    setDiscoveryAnchor({
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    });
    setSelectedDiscovery(
      makeDiscoveryItem({
        destination,
        routeOption,
        ...item,
      })
    );
  };

  return (
    <div className="grid min-w-0 gap-4 sm:gap-5">
      <LocalLifeVibeBanner destination={destination} routeOption={routeOption} />

      <section className="grid gap-4">
        <LocalSectionHeader
          eyebrow="Local food"
          title="Taste the destination"
          detail="Food cards built from the current local food intelligence."
        />
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {foodCards.map((card) => (
            <LocalDiscoveryCard
              key={`local-food-${card.name}`}
              card={card}
              destination={destination}
              routeOption={routeOption}
              tone="orange"
              onExplore={(anchor) =>
                openDiscovery({
                  category: card.category,
                  title: card.name,
                  description: card.description,
                  bestTime: "Morning",
                  distance: "Near local hub",
                  imageContext: `${card.name} ${card.category} local food`,
                }, anchor)
              }
            />
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <LocalSectionHeader
          eyebrow="Local products"
          title="Marketplace discoveries"
          detail="Regional products, souvenirs and creator-friendly local picks."
        />
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {productCards.map((card) => (
            <div
              key={`local-product-${card.name}`}
              role="button"
              tabIndex={0}
              onClick={(event) =>
                openDiscovery({
                  category: card.category,
                  title: card.name,
                  description: "Regional product with strong local relevance and shopping value.",
                  bestTime: "Afternoon",
                  distance: "Market area",
                  imageContext: `${card.name} local products souvenirs`,
                }, event.currentTarget)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  openDiscovery({
                    category: card.category,
                    title: card.name,
                    description: "Regional product with strong local relevance and shopping value.",
                    bestTime: "Afternoon",
                    distance: "Market area",
                    imageContext: `${card.name} local products souvenirs`,
                  }, event.currentTarget);
                }
              }}
              className="min-w-0 rounded-[1.15rem] border border-emerald-100 bg-white/92 p-3 shadow-[0_14px_34px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_46px_rgba(15,23,42,0.14)] sm:rounded-[1.3rem] sm:p-4"
            >
              <DestinationImagePlaceholder
                label={card.category}
                destination={destination}
                routeOption={routeOption}
                imageContext={`${card.name} local products souvenirs`}
                tone="emerald"
              />
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                  <WalletCards size={18} />
                </span>
                <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-orange-700">
                  {card.popularity}
                </span>
              </div>
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.13em] text-emerald-700">
                {card.category}
              </p>
              <p className="mt-1 text-lg font-black text-slate-950">{card.name}</p>
              <div className="mt-3 grid gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Popularity</span>
                  <span>High</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-emerald-500 to-orange-400" />
                </div>
                <p className="text-xs font-semibold leading-5 text-slate-600">
                  Local relevance: Strong regional identity for the route.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <LocalSectionHeader
          eyebrow="Local markets"
          title="Walkable market trails"
          detail="Destination cards for markets, timing, known-for cues and local vibe."
        />
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {(marketItems.length ? marketItems : ["Traditional Market", "Night Market", "Handicraft Market", "Food Market"]).slice(0, 4).map((name, index) => (
            <LocalMarketCard
              key={`local-market-${name}`}
              name={name}
              destination={destination}
              routeOption={routeOption}
              index={index}
              onExplore={(anchor) =>
                openDiscovery({
                  category: "Local Market",
                  title: name,
                  description: `${name} is a walkable local discovery stop for products, food and street atmosphere.`,
                  bestTime: "Evening",
                  distance: "45-90 min walk",
                  duration: "1-2 Hours",
                  imageContext: `${name} local market`,
                }, anchor)
              }
            />
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
              Hidden gems
            </p>
            <h5 className="mt-1 text-xl font-black text-slate-950">
              Secret viewpoints, quiet cafes and underrated experiences
            </h5>
          </div>
          <p className="max-w-md text-xs font-semibold leading-5 text-slate-600">
            Hidden Gems around {destination} with clear timing, distance and exploration cues.
          </p>
        </div>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {hiddenGemDiscoveries.map((gem) => (
            <HiddenGemCard
              key={`hidden-gem-${gem.name}`}
              gem={gem}
              destination={destination}
              routeOption={routeOption}
              onExplore={(anchor) =>
                openDiscovery({
                  category: "Hidden Gem",
                  title: gem.name,
                  description: gem.description,
                  bestTime: gem.bestTime,
                  distance: gem.distance,
                  imageContext: `${gem.name} ${gem.badge}`,
                }, anchor)
              }
            />
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <LocalSectionHeader
          eyebrow="Culture and life"
          title="How the place lives"
          detail="Traditions, etiquette, festivals, community experiences and cultural notes."
        />
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {(cultureItems.length ? cultureItems : ["Local traditions", "Local etiquette", "Festivals", "Community experiences", "Dress suggestions", "Cultural notes"]).slice(0, 6).map((item, index) => (
            <div
              key={`culture-life-${item}`}
              role="button"
              tabIndex={0}
              onClick={(event) =>
                openDiscovery({
                  category: "Culture & Life",
                  title: item,
                  description: `${item} helps travellers understand the local traditions, etiquette and everyday rhythm of ${destination}.`,
                  bestTime: "Daytime",
                  distance: "Local area",
                  imageContext: `${item} local culture traditions`,
                }, event.currentTarget)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  openDiscovery({
                    category: "Culture & Life",
                    title: item,
                    description: `${item} helps travellers understand the local traditions, etiquette and everyday rhythm of ${destination}.`,
                    bestTime: "Daytime",
                    distance: "Local area",
                    imageContext: `${item} local culture traditions`,
                  }, event.currentTarget);
                }
              }}
              className="rounded-[1.25rem] border border-cyan-100 bg-white/92 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.07)]"
            >
              <DestinationImagePlaceholder
                label="Culture"
                destination={destination}
                routeOption={routeOption}
                imageContext={`${item} local culture traditions`}
                tone="cyan"
              />
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-700">
                <Compass size={18} />
              </span>
              <p className="mt-3 text-[10px] font-black uppercase tracking-[0.13em] text-cyan-700">
                Cultural note {index + 1}
              </p>
              <p className="mt-1 text-sm font-black leading-snug text-slate-950">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <LocalSectionHeader
          eyebrow="Shopping and souvenirs"
          title="What to take home"
          detail="Authentic products, buying areas and price expectation cues."
        />
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          {(shoppingItems.length ? shoppingItems : ["What to buy", "Best shopping areas", "Price expectations", "Authentic local products"]).slice(0, 4).map((item, index) => (
            <div
              key={`shopping-souvenir-${item}`}
              role="button"
              tabIndex={0}
              onClick={(event) =>
                openDiscovery({
                  category: "Shopping Area",
                  title: item,
                  description: `${item} gives travellers a practical local shopping cue for authentic products and souvenirs.`,
                  bestTime: "Afternoon",
                  distance: "Market belt",
                  imageContext: `${item} shopping souvenirs authentic products`,
                }, event.currentTarget)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  openDiscovery({
                    category: "Shopping Area",
                    title: item,
                    description: `${item} gives travellers a practical local shopping cue for authentic products and souvenirs.`,
                    bestTime: "Afternoon",
                    distance: "Market belt",
                    imageContext: `${item} shopping souvenirs authentic products`,
                  }, event.currentTarget);
                }
              }}
              className="rounded-[1.25rem] border border-orange-100 bg-white/92 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.07)]"
            >
              <DestinationImagePlaceholder
                label="Souvenirs"
                destination={destination}
                routeOption={routeOption}
                imageContext={`${item} shopping souvenirs authentic products`}
                tone="orange"
              />
              <div className="mt-3 flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-orange-700">
                  <MapPinned size={18} />
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.13em] text-orange-700">
                    Shopping cue {index + 1}
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-950">{item}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                    Check authenticity, compare prices and prefer locally relevant products.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <LocalSectionHeader
          eyebrow="Local recommendations"
          title="AI picks for local exploration"
          detail="Recommendation cards for food, streets, markets, sunset and creator-friendly experiences."
        />
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {(recommendationItems.length ? recommendationItems : ["Best evening market", "Best local breakfast", "Best sunset cafe", "Best creator-friendly street", "Best local experience"]).slice(0, 6).map((item, index) => (
            <LocalRecommendationCard
              key={`local-recommendation-${item}`}
              title={item}
              detail="Use this as a local exploration prompt inside the future TPL Local ecosystem."
              index={index}
              onExplore={(anchor) =>
                openDiscovery({
                  category: "Local Recommendation",
                  title: item,
                  description: "AI-ready local exploration prompt for food, markets, creator streets and destination experiences.",
                  bestTime: "Flexible",
                  distance: "Nearby",
                  imageContext: `${item} local recommendation`,
                }, anchor)
              }
            />
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <Link
          href="/local-market"
          className="w-full rounded-full border border-orange-200 bg-orange-50 px-5 py-3 text-xs font-black text-orange-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-100 sm:w-auto"
        >
          Explore More Local Experiences
        </Link>
      </div>

      <DiscoveryDrawer
        item={selectedDiscovery}
        isOpen={Boolean(selectedDiscovery)}
        anchorRect={discoveryAnchor}
        onClose={() => {
          setSelectedDiscovery(null);
          setDiscoveryAnchor(null);
        }}
        onAddToTrip={() => undefined}
        onSave={() => undefined}
        onCreatorTips={() => undefined}
      />
    </div>
  );
}
