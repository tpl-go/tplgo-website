import type { TiyaLocalMarketPick, TiyaTripIntent } from "./plannerTypes";

function destinationKey(destination: string) {
  return destination.toLowerCase();
}

function regionFor(destination: string) {
  const key = destinationKey(destination);

  if (key.includes("jaipur")) return "Rajasthan";
  if (key.includes("kerala")) return "Kerala";
  if (key.includes("ladakh")) return "Ladakh";
  if (key.includes("uttarakhand")) return "Uttarakhand";
  if (key.includes("himachal")) return "Himachal";
  if (key.includes("goa")) return "Goa";

  return destination || "Local region";
}

function primaryProduct(intent: TiyaTripIntent): Omit<TiyaLocalMarketPick, "id" | "localRegion" | "routeRelevance" | "isHighlighted"> {
  const destination = intent.toCity || "Destination";
  const key = destinationKey(destination);

  if (key.includes("jaipur")) {
    return {
      productName: "Block print travel stole",
      description: "Handmade textile pick aligned with Jaipur craft lanes and market stops.",
      priceRange: "₹900 - ₹2,800",
      specialtyLabel: "Handcrafted textile",
      authenticityBadge: "Artisan verified",
      productType: "handicrafts",
      isCreatorRecommended: true,
    };
  }

  if (key.includes("kerala")) {
    return {
      productName: "Kerala spice and tea set",
      description: "Compact regional spice blend for food-led and slow travel plans.",
      priceRange: "₹650 - ₹1,900",
      specialtyLabel: "Regional pantry",
      authenticityBadge: "Source checked",
      productType: "spices",
      isCreatorRecommended: intent.interests.includes("Food"),
    };
  }

  if (intent.travelStyle === "Spiritual" || intent.interests.includes("Temples")) {
    return {
      productName: "Temple route essentials kit",
      description: "Local puja and travel basics matched to devotional route timing.",
      priceRange: "₹350 - ₹1,200",
      specialtyLabel: "Spiritual essentials",
      authenticityBadge: "Local temple market",
      productType: "creator recommended items",
      isCreatorRecommended: true,
    };
  }

  if (intent.travelStyle === "Adventure" || intent.interests.includes("Trekking")) {
    return {
      productName: "Trail-ready day kit",
      description: "Weather-aware essentials for trekking windows and route stopovers.",
      priceRange: "₹1,200 - ₹3,800",
      specialtyLabel: "Travel essentials",
      authenticityBadge: "Route tested",
      productType: "travel essentials",
      isCreatorRecommended: true,
    };
  }

  return {
    productName: `${destination} local snack box`,
    description: "Destination-linked snack curation for transfer breaks and evening plans.",
    priceRange: "₹450 - ₹1,500",
    specialtyLabel: "Local snacks",
    authenticityBadge: "Local seller verified",
    productType: "local snacks",
    isCreatorRecommended: intent.smartPreferences.includeCreatorSpots,
  };
}

export function generatePlannerLocalMarketPicks(
  intent: TiyaTripIntent
): TiyaLocalMarketPick[] {
  const destination = intent.toCity.trim() || "Destination";
  const region = regionFor(destination);
  const localMarketEnabled =
    intent.smartPreferences.includeLocalMarket ||
    intent.interests.includes("Local Market") ||
    intent.interests.includes("Shopping");
  const primary = primaryProduct(intent);

  return [
    {
      id: "market-primary",
      localRegion: region,
      routeRelevance: localMarketEnabled ? 95 : 86,
      isHighlighted: localMarketEnabled || primary.isCreatorRecommended,
      ...primary,
    },
    {
      id: "market-craft",
      productName: `${region} handmade keepsake`,
      localRegion: region,
      description: "Compact souvenir pick for shopping, culture and creator-led stopovers.",
      priceRange: "₹700 - ₹2,400",
      specialtyLabel: "Handicraft pick",
      authenticityBadge: "Seller verified",
      routeRelevance: intent.interests.includes("Culture") ? 91 : 78,
      productType: "handicrafts",
      isCreatorRecommended: intent.smartPreferences.includeCreatorSpots,
      isHighlighted: intent.interests.includes("Culture") || intent.smartPreferences.includeCreatorSpots,
    },
    {
      id: "market-comfort",
      productName: "Smart route comfort pouch",
      localRegion: region,
      description: "Travel essentials for transfer days, scenic stops and market walks.",
      priceRange: "₹500 - ₹1,600",
      specialtyLabel: "Trip utility",
      authenticityBadge: "TPL route fit",
      routeRelevance: ["Self-drive Car", "Bike", "EV", "Cab"].includes(intent.transportMode) ? 90 : 76,
      productType: "travel essentials",
      isCreatorRecommended: false,
      isHighlighted: ["Self-drive Car", "Bike", "EV", "Cab"].includes(intent.transportMode),
    },
  ];
}
