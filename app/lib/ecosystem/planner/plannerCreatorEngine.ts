import type { TiyaCreatorPick, TiyaTripIntent } from "./plannerTypes";

const creatorTagMap = {
  Food: ["Food", "Hidden Gems", "Local Market"],
  Adventure: ["Adventure", "Hidden Gems"],
  Spiritual: ["Spiritual", "Hidden Gems"],
  Luxury: ["Luxury", "Couple"],
  Couple: ["Couple", "Luxury"],
  Family: ["Family", "Food"],
  "Local Market": ["Local Market", "Food"],
};

function hasInterest(intent: TiyaTripIntent, interest: string) {
  return intent.interests.includes(interest) || intent.travelStyle === interest;
}

function destinationSlug(destination: string) {
  return destination.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function getPrimaryCreatorTheme(intent: TiyaTripIntent) {
  if (hasInterest(intent, "Spiritual") || intent.interests.includes("Temples")) {
    return {
      specialty: "Temple routes and soulful stopovers",
      tag: "Spiritual",
      note: "Best for verified darshan timing, quiet ghats and devotional food stops.",
    };
  }

  if (hasInterest(intent, "Adventure") || intent.interests.includes("Trekking")) {
    return {
      specialty: "Trail-first reels and terrain stories",
      tag: "Adventure",
      note: "Best for trek windows, ridge viewpoints and route-energy checks.",
    };
  }

  if (intent.travelStyle === "Couple") {
    return {
      specialty: "Romantic frames and soft-light cafes",
      tag: "Couple",
      note: "Best for golden-hour spots, boutique stays and couple-friendly stops.",
    };
  }

  if (intent.smartPreferences.includeLocalMarket || intent.interests.includes("Local Market")) {
    return {
      specialty: "Local market lanes and maker-led finds",
      tag: "Local Market",
      note: "Best for creator-vetted shops, food lanes and regional finds.",
    };
  }

  if (intent.travelStyle === "Luxury") {
    return {
      specialty: "Premium stays and curated destination frames",
      tag: "Luxury",
      note: "Best for polished reels, premium experiences and comfort-led stops.",
    };
  }

  return {
    specialty: "Hidden gems and local culture",
    tag: "Food",
    note: "Best for first-time route orientation and authentic local pockets.",
  };
}

export function generatePlannerCreatorPicks(intent: TiyaTripIntent): TiyaCreatorPick[] {
  const destination = intent.toCity.trim() || "Destination";
  const slug = destinationSlug(destination) || "tpl";
  const primary = getPrimaryCreatorTheme(intent);
  const creatorSpots = intent.smartPreferences.includeCreatorSpots;
  const localMarket = intent.smartPreferences.includeLocalMarket || intent.interests.includes("Local Market");
  const roadTrip = ["Self-drive Car", "Bike", "EV", "Cab"].includes(intent.transportMode);
  const baseTags = creatorTagMap[primary.tag as keyof typeof creatorTagMap] ?? ["Hidden Gems"];

  return [
    {
      id: "creator-primary",
      creatorName: `${destination} Lens by Tiya`,
      handle: `@${slug}.lens`,
      destination,
      specialty: primary.specialty,
      engagementScore: creatorSpots ? 94 : 88,
      routeFit: creatorSpots ? 96 : 89,
      recommendationNote: primary.note,
      suggestedStopover: localMarket ? "Creator market lane" : roadTrip ? "Scenic midway stop" : "Signature arrival pocket",
      tags: [...baseTags, creatorSpots ? "Hidden Gems" : "Food"],
      isVerified: true,
      isHighlighted: creatorSpots || primary.tag === intent.travelStyle,
    },
    {
      id: "creator-food",
      creatorName: `${destination} Local Table`,
      handle: `@eat.${slug}`,
      destination,
      specialty: "Food trails, snack stops and cafe reels",
      engagementScore: intent.interests.includes("Food") ? 91 : 82,
      routeFit: intent.interests.includes("Food") ? 93 : 84,
      recommendationNote: "Matches meal buffers and evening exploration windows in the itinerary.",
      suggestedStopover: "Regional tasting stop",
      tags: ["Food", "Local Market", "Hidden Gems"],
      isVerified: true,
      isHighlighted: intent.interests.includes("Food"),
    },
    {
      id: "creator-route",
      creatorName: `${destination} Route Stories`,
      handle: `@route.${slug}`,
      destination,
      specialty: roadTrip ? "Road-trip frames and viewpoint sequencing" : "Arrival-to-local transfer stories",
      engagementScore: roadTrip ? 90 : 81,
      routeFit: roadTrip ? 94 : 82,
      recommendationNote: roadTrip
        ? "Useful for scenic pullovers, safe daylight segments and route reels."
        : "Useful for transfer-friendly photo pockets near the stay base.",
      suggestedStopover: roadTrip ? "Viewpoint halt" : "Local transfer pocket",
      tags: roadTrip ? ["Adventure", "Hidden Gems", "Couple"] : ["Hidden Gems", "Family"],
      isVerified: true,
      isHighlighted: roadTrip,
    },
  ];
}
