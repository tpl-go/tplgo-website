import type { TiyaTripIntent } from "./plannerTypes";

export type TiyaExpeditionMode =
  | "Scenic Expedition"
  | "Fast Circuit"
  | "Cultural Circuit"
  | "Spiritual Circuit"
  | "Adventure Expedition"
  | "Luxury Expedition"
  | "Explorer Mode";

export type TiyaExpeditionDestination = {
  id: string;
  name: string;
  region: string;
  role: "Origin" | "Gateway" | "Core" | "Halt" | "Finale";
  stayNights: number;
  intensity: "Low" | "Medium" | "High";
};

export type TiyaExpeditionStop = TiyaExpeditionDestination;

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function destinationType(intent: TiyaTripIntent) {
  const text = `${intent.toCity} ${intent.interests.join(" ")} ${intent.travelStyle}`.toLowerCase();

  if (text.includes("ladakh") || text.includes("leh")) return "ladakh";
  if (text.includes("kerala")) return "kerala";
  if (text.includes("rajasthan") || text.includes("jaipur")) return "rajasthan";
  if (text.includes("char dham") || text.includes("uttarakhand") || text.includes("spiritual")) return "spiritual";
  if (text.includes("northeast") || text.includes("sikkim")) return "northeast";
  return "generic";
}

export function getDefaultExpeditionDestinations(
  intent: TiyaTripIntent
): TiyaExpeditionDestination[] {
  const origin = intent.fromCity || "Origin";
  const destination = intent.toCity || "Destination";
  const type = destinationType(intent);
  const chains: Record<string, string[]> = {
    ladakh: [origin, "Manali", "Sissu", "Leh"],
    kerala: [origin, "Kochi", "Munnar", "Thekkady", "Alleppey"],
    rajasthan: [origin, "Jaipur", "Jodhpur", "Jaisalmer"],
    spiritual: [origin, "Haridwar", "Guptkashi", "Kedarnath", "Badrinath"],
    northeast: [origin, "Guwahati", "Shillong", "Cherrapunji", "Kaziranga"],
    generic: [origin, "Regional gateway", destination],
  };
  const names = chains[type] ?? chains.generic;

  return names.map((name, index) => ({
    id: `${slug(name)}-${index}`,
    name,
    region: type === "generic" ? destination : type,
    role:
      index === 0
        ? "Origin"
        : index === 1
          ? "Gateway"
          : index === names.length - 1
            ? "Finale"
            : index % 2 === 0
              ? "Core"
              : "Halt",
    stayNights: index === 0 ? 0 : index === names.length - 1 ? 2 : 1,
    intensity:
      type === "ladakh" || type === "spiritual" || type === "northeast"
        ? "High"
        : type === "kerala"
          ? "Low"
          : "Medium",
  }));
}

export function getRecommendedExpeditionMode(intent: TiyaTripIntent): TiyaExpeditionMode {
  if (intent.travelStyle === "Spiritual" || intent.interests.includes("Temples")) return "Spiritual Circuit";
  if (intent.travelStyle === "Adventure" || intent.transportMode === "Bike" || intent.interests.includes("Trekking")) return "Adventure Expedition";
  if (intent.travelStyle === "Luxury" || intent.budgetTier === "Luxury") return "Luxury Expedition";
  if (intent.interests.includes("Culture")) return "Cultural Circuit";
  if (intent.pace === "Packed") return "Fast Circuit";
  if (intent.smartPreferences.preferScenicRoute) return "Scenic Expedition";
  return "Explorer Mode";
}

export function getRegionIntelligence(intent: TiyaTripIntent) {
  const type = destinationType(intent);

  if (type === "ladakh" || type === "northeast") {
    return {
      regionType: "Mountain region",
      note: "Use altitude, weather and road-buffer logic with recovery halts.",
      transferStyle: "staged road movement",
    };
  }

  if (type === "kerala") {
    return {
      regionType: "Coastal region",
      note: "Cluster hills, backwaters and coastal stays to reduce backtracking.",
      transferStyle: "mixed cab and local transfer",
    };
  }

  if (type === "rajasthan") {
    return {
      regionType: "Desert region",
      note: "Keep heat-aware daylight windows and fort/culture clusters.",
      transferStyle: "city-to-city road circuit",
    };
  }

  if (type === "spiritual") {
    return {
      regionType: "Spiritual route",
      note: "Prioritize early starts, queue buffers and recovery stays.",
      transferStyle: "pilgrimage transfer chain",
    };
  }

  return {
    regionType: "Mixed region",
    note: "Build regional grouping around the destination gateway.",
    transferStyle: "multi-transport flow",
  };
}
