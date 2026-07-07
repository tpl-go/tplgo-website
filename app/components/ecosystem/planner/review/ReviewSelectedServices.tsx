"use client";

import {
  BedDouble,
  BriefcaseBusiness,
  Bus,
  Car,
  Mountain,
  PackageCheck,
  Plane,
  Sailboat,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Stamp,
  Train,
} from "lucide-react";

import ReviewServiceGroupCard from "./ReviewServiceGroupCard";
import type { ReviewServiceGroup } from "./ReviewServiceItemCard";
import type { WorkspaceBookingBasketItem } from "@/app/components/ecosystem/planner/workspace/utils/bookingBasket";
import type { TiyaSmartPlannerReviewPayload } from "@/app/lib/ecosystem/planner/plannerReviewPayload";
import type { TiyaTimelineItem } from "@/app/lib/ecosystem/planner/plannerTypes";

type ReviewSelectedServicesProps = {
  payload: TiyaSmartPlannerReviewPayload;
};

type ServiceGroupDefinition = {
  aliases: string[];
  description: string;
  icon: typeof Plane;
  id: ReviewServiceGroup["id"];
  name: string;
};

const serviceGroups: ServiceGroupDefinition[] = [
  {
    aliases: ["flight", "air", "airport"],
    description: "Flight or air transfer services selected for this trip.",
    icon: Plane,
    id: "flights",
    name: "Flights",
  },
  {
    aliases: ["hotel"],
    description: "Hotels added from itinerary, stay selection or booking basket.",
    icon: BedDouble,
    id: "hotels",
    name: "Hotels",
  },
  {
    aliases: ["homestay", "home stay"],
    description: "Homestays and local stay options linked to the itinerary.",
    icon: Mountain,
    id: "homestays",
    name: "Homestays",
  },
  {
    aliases: ["cab", "transfer", "taxi", "self-drive", "car"],
    description: "Cabs, local transfers and route mobility selections.",
    icon: Car,
    id: "cabs",
    name: "Cabs / Transfers",
  },
  {
    aliases: ["train", "rail"],
    description: "Train journeys or rail transfer references.",
    icon: Train,
    id: "train",
    name: "Train",
  },
  {
    aliases: ["bus", "coach"],
    description: "Bus or coach route services.",
    icon: Bus,
    id: "bus",
    name: "Bus",
  },
  {
    aliases: ["cruise", "sail"],
    description: "Cruise or sailing services if selected.",
    icon: Sailboat,
    id: "cruise",
    name: "Cruise",
  },
  {
    aliases: ["activity", "experience", "experiences", "tour"],
    description: "Activities, tours and destination experiences.",
    icon: Sparkles,
    id: "activities",
    name: "Activities / Experiences",
  },
  {
    aliases: ["insurance"],
    description: "Insurance selections and protection add-ons.",
    icon: ShieldCheck,
    id: "insurance",
    name: "Insurance",
  },
  {
    aliases: ["visa"],
    description: "Visa services or document assistance references.",
    icon: Stamp,
    id: "visa",
    name: "Visa",
  },
  {
    aliases: ["local life", "local-life", "commerce"],
    description: "Local culture, food, products and experiences.",
    icon: ShoppingBag,
    id: "localLife",
    name: "Local Life",
  },
  {
    aliases: ["creator", "reel", "story"],
    description: "Creator-led routes, stops and content opportunities.",
    icon: Sparkles,
    id: "creator",
    name: "Creator Experiences",
  },
  {
    aliases: ["market", "shopping", "handicraft"],
    description: "Shopping, local market and destination commerce selections.",
    icon: ShoppingBag,
    id: "localMarket",
    name: "Local Market / Shopping",
  },
  {
    aliases: ["package", "bundle"],
    description: "Packages, bundles and mixed-service booking selections.",
    icon: PackageCheck,
    id: "packages",
    name: "Packages / Bundles",
  },
];

function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function normalizeText(value: unknown) {
  return String(value || "").toLowerCase();
}

function itemHaystack(item: WorkspaceBookingBasketItem) {
  return normalizeText(
    [
      item.serviceType,
      item.serviceName,
      item.serviceLabel,
      item.category,
      item.title,
      item.description,
      item.detailSummary,
      item.meta,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function matchesGroup(
  item: WorkspaceBookingBasketItem,
  group: ServiceGroupDefinition
) {
  const text = itemHaystack(item);
  return group.aliases.some((alias) => text.includes(alias));
}

function basketItemsForGroup(
  basketItems: WorkspaceBookingBasketItem[],
  group: ServiceGroupDefinition
) {
  return basketItems.filter((item) => matchesGroup(item, group));
}

function timelineItemToServiceItem(
  item: TiyaTimelineItem,
  sourceModule: string
): ReviewServiceGroup["items"][number] {
  return {
    bookingStatus: item.bookingStatus || "recommended",
    city: item.location,
    date: item.date,
    dayLabel: "",
    estimatedValue: item.price || item.unitPrice,
    id: item.id,
    location: item.location,
    notes: item.description || item.detailSummary,
    quantityLabel: item.travellers ? `${item.travellers} traveller(s)` : "",
    sourceModule,
    time: item.time,
    title: item.title,
    typeLabel: item.serviceType || item.category || item.type,
  };
}

function unknownToServiceItem(
  value: unknown,
  sourceModule: string,
  index: number
): ReviewServiceGroup["items"][number] {
  const item =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};

  return {
    bookingStatus: "recommended",
    city: String(item.city || item.destination || item.localRegion || ""),
    date: String(item.date || item.savedAt || ""),
    dayLabel: item.day ? `Day ${item.day}` : "",
    estimatedValue: Number(item.estimatedCost || item.price || item.value || 0),
    id: String(item.id || `${sourceModule}-${index}`),
    location: String(item.location || item.city || item.destination || ""),
    notes: String(item.notes || item.description || item.reason || ""),
    quantityLabel: String(item.quantity || item.travellers || ""),
    sourceModule,
    time: String(item.time || ""),
    title: String(
      item.title ||
        item.productName ||
        item.creatorName ||
        item.name ||
        `${sourceModule} item`
    ),
    typeLabel: String(item.category || item.type || sourceModule),
  };
}

function basketToServiceItem(
  item: WorkspaceBookingBasketItem
): ReviewServiceGroup["items"][number] {
  return {
    bookingStatus: "selected",
    city: item.city,
    date: item.date,
    dayLabel: item.dayLabel,
    estimatedValue: item.estimatedTotal || item.estimatedPrice || item.price,
    id: item.id,
    location: [item.from, item.to].filter(Boolean).join(" -> ") || item.city,
    notes: item.detailSummary || item.description || item.meta,
    quantityLabel: [
      item.travellers ? `${item.travellers} traveller(s)` : "",
      item.rooms ? `${item.rooms} room(s)` : "",
      item.nights ? `${item.nights} night(s)` : "",
      item.quantity ? `${item.quantity} item(s)` : "",
    ]
      .filter(Boolean)
      .join(" · "),
    sourceModule: item.serviceLabel || item.serviceName || "Booking Basket",
    time: item.time,
    title: item.title,
    typeLabel: item.serviceName || item.serviceType || item.category,
  };
}

function serviceReferencesForGroup(
  payload: TiyaSmartPlannerReviewPayload,
  group: ServiceGroupDefinition
): ReviewServiceGroup["items"] {
  if (group.id === "hotels") {
    return safeArray(payload.selectedHotels).map((item) =>
      timelineItemToServiceItem(item, "Stay Selection")
    );
  }

  if (group.id === "homestays") {
    return safeArray(payload.selectedHomestays).map((item) =>
      timelineItemToServiceItem(item, "Stay Selection")
    );
  }

  if (group.id === "cabs") {
    return [
      ...safeArray(payload.selectedCabs),
      ...safeArray(payload.selectedTransfers),
    ].map((item) => timelineItemToServiceItem(item, "Transport Planning"));
  }

  if (group.id === "activities") {
    return safeArray(payload.selectedActivities).map((item) =>
      timelineItemToServiceItem(item, "Experiences")
    );
  }

  if (group.id === "insurance") {
    return safeArray(payload.selectedInsurance).map((item, index) =>
      unknownToServiceItem(item, "Insurance", index)
    );
  }

  if (group.id === "localLife") {
    return safeArray(payload.selectedLocalLifeItems).map((item, index) =>
      unknownToServiceItem(item, "Local Life", index)
    );
  }

  if (group.id === "localMarket") {
    return safeArray(payload.selectedLocalMarketItems).map((item, index) =>
      unknownToServiceItem(item, "Local Market / Shopping", index)
    );
  }

  if (group.id === "creator") {
    return safeArray(payload.selectedCreatorSpots).map((item, index) =>
      unknownToServiceItem(item, "Creator Recommendations", index)
    );
  }

  return [];
}

function mergeServiceItems(
  basketItems: WorkspaceBookingBasketItem[],
  referenceItems: ReviewServiceGroup["items"]
) {
  const basketMapped = basketItems.map(basketToServiceItem);
  const basketIds = new Set(basketMapped.map((item) => item.id));
  const references = referenceItems.filter((item) => !basketIds.has(item.id));
  return [...basketMapped, ...references];
}

function groupValue(items: ReviewServiceGroup["items"]) {
  return items.reduce((sum, item) => sum + Number(item.estimatedValue || 0), 0);
}

function groupReadiness(
  group: ServiceGroupDefinition,
  basketItems: WorkspaceBookingBasketItem[],
  referenceItems: ReviewServiceGroup["items"]
): ReviewServiceGroup["readiness"] {
  if (basketItems.length > 0) return "Ready";
  if (referenceItems.length > 0) return "Optional";
  if (group.id === "insurance" || group.id === "visa" || group.id === "cruise") {
    return "Not Selected";
  }
  return "Not Selected";
}

export default function ReviewSelectedServices({
  payload,
}: ReviewSelectedServicesProps) {
  const basketItems = safeArray(payload.selectedBasketItems);
  const groups: ReviewServiceGroup[] = serviceGroups.map((definition) => {
    const selectedBasketItems = basketItemsForGroup(basketItems, definition);
    const referenceItems = serviceReferencesForGroup(payload, definition);
    const items = mergeServiceItems(selectedBasketItems, referenceItems);

    return {
      description: definition.description,
      icon: definition.icon,
      id: definition.id,
      items,
      name: definition.name,
      readiness: groupReadiness(definition, selectedBasketItems, referenceItems),
      selectedBasketCount: selectedBasketItems.length,
      value: groupValue(items),
    };
  });
  const totalBasketValue = basketItems.reduce(
    (sum, item) =>
      sum + Number(item.estimatedTotal || item.estimatedPrice || item.price || 0),
    0
  );

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/70 p-6 shadow-[0_18px_54px_rgba(15,23,42,0.06)]">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#4f46e5]">
            Service Review
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950">
            Selected Services Review
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
            Review all services selected from your Smart Planner basket before
            booking.
          </p>
        </div>
        <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500 xl:inline-flex">
          <BriefcaseBusiness size={15} className="mr-2 text-[#4f46e5]" />
          {basketItems.length} basket items · {`₹${totalBasketValue.toLocaleString("en-IN")}`}
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm font-black leading-6 text-blue-800">
        Only items marked Added to Basket will continue to booking. Other
        itinerary-only suggestions remain for reference.
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        {groups.map((group) => (
          <ReviewServiceGroupCard key={group.id} group={group} />
        ))}
      </div>
    </section>
  );
}
