import type { TiyaRouteOption, TiyaTripIntent } from "./plannerTypes";

export type TiyaPackingCategory =
  | "Clothing"
  | "Travel essentials"
  | "Gadgets"
  | "Medicines"
  | "Trek/adventure gear"
  | "Family/kids essentials"
  | "Pet essentials"
  | "Documents"
  | "Safety items";

export type TiyaPackingItem = {
  id: string;
  label: string;
  priority: "Critical" | "Recommended" | "Optional";
  reason: string;
};

export type TiyaPackingSection = {
  id: string;
  category: TiyaPackingCategory;
  items: TiyaPackingItem[];
};

export type TiyaDestinationPreparationProfile = {
  destinationType: "Mountain" | "Coastal" | "Desert" | "Spiritual" | "Urban" | "Mixed";
  seasonRisk: "Altitude" | "Rain" | "Heat" | "Crowd" | "Balanced";
  durationDays: number;
};

function getMonth(intent: TiyaTripIntent) {
  const month = Number(intent.startDate?.slice(5, 7));
  return Number.isFinite(month) && month >= 1 && month <= 12 ? month : 8;
}

export function getPlannerPreparationProfile(
  intent: TiyaTripIntent
): TiyaDestinationPreparationProfile {
  const text = `${intent.toCity} ${intent.travelStyle} ${intent.interests.join(" ")}`.toLowerCase();
  const month = getMonth(intent);
  const startDate = new Date(intent.startDate);
  const endDate = new Date(intent.endDate);
  const durationDays =
    Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())
      ? 5
      : Math.max(
          1,
          Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1
        );

  if (
    text.includes("ladakh") ||
    text.includes("leh") ||
    text.includes("manali") ||
    text.includes("himachal") ||
    text.includes("uttarakhand") ||
    text.includes("trek")
  ) {
    return {
      destinationType: "Mountain",
      seasonRisk: month <= 2 || month === 12 ? "Altitude" : month >= 6 && month <= 8 ? "Rain" : "Balanced",
      durationDays,
    };
  }

  if (text.includes("kerala") || text.includes("goa") || text.includes("coastal")) {
    return {
      destinationType: "Coastal",
      seasonRisk: month >= 6 && month <= 9 ? "Rain" : "Balanced",
      durationDays,
    };
  }

  if (
    text.includes("rajasthan") ||
    text.includes("jaipur") ||
    text.includes("jodhpur") ||
    text.includes("jaisalmer")
  ) {
    return {
      destinationType: "Desert",
      seasonRisk: month >= 4 && month <= 7 ? "Heat" : "Balanced",
      durationDays,
    };
  }

  if (text.includes("spiritual") || text.includes("temples") || text.includes("char dham")) {
    return {
      destinationType: "Spiritual",
      seasonRisk: "Crowd",
      durationDays,
    };
  }

  return {
    destinationType: text.includes("city") ? "Urban" : "Mixed",
    seasonRisk: "Balanced",
    durationDays,
  };
}

function item(
  id: string,
  label: string,
  priority: TiyaPackingItem["priority"],
  reason: string
): TiyaPackingItem {
  return { id, label, priority, reason };
}

function section(
  category: TiyaPackingCategory,
  items: TiyaPackingItem[]
): TiyaPackingSection {
  return {
    id: category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    category,
    items,
  };
}

export function generatePlannerPackingSections({
  intent,
  selectedRoute,
}: {
  intent: TiyaTripIntent;
  selectedRoute?: TiyaRouteOption;
}): TiyaPackingSection[] {
  const profile = getPlannerPreparationProfile(intent);
  const sections: TiyaPackingSection[] = [
    section("Clothing", [
      item("comfortable-layers", "Comfortable travel layers", "Critical", "Base clothing for transfers and city movement."),
      item("walking-shoes", "Comfort walking shoes", "Critical", "Needed for itinerary days and local exploration."),
      item("evening-layer", "Evening backup layer", "Recommended", "Useful for early starts and changing route weather."),
    ]),
    section("Travel essentials", [
      item("daypack", "Compact daypack", "Critical", "Keeps route movement light during multi-stop days."),
      item("reusable-bottle", "Reusable water bottle", "Recommended", "Supports long transfers and sightseeing clusters."),
      item("snack-kit", "Snack and hydration kit", "Recommended", "Helps with fatigue between transfers."),
    ]),
    section("Gadgets", [
      item("power-bank", "Power bank", "Critical", "Useful for low-network and long-transfer routes."),
      item("chargers", "Chargers and cables", "Critical", "Required for phones, camera and travel documents."),
      item("offline-maps", "Offline maps downloaded", "Recommended", "Supports remote-area or low-network movement."),
    ]),
    section("Medicines", [
      item("basic-meds", "Basic medicine pouch", "Critical", "Covers fever, stomach, cold and minor pain needs."),
      item("motion-sickness", "Motion sickness support", "Recommended", "Helpful for road, hill and multi-transfer journeys."),
      item("prescriptions", "Personal prescriptions", "Critical", "Important for seniors, children and long trips."),
    ]),
    section("Documents", [
      item("govt-id", "Government ID", "Critical", "Needed for stays, transport and entry checks."),
      item("insurance-copy", "Insurance copy", intent.smartPreferences.includeInsurance ? "Critical" : "Recommended", "Useful for trip safety readiness."),
      item("booking-copies", "Offline booking copies", "Recommended", "Keeps check-ins smooth when network is weak."),
    ]),
    section("Safety items", [
      item("mini-first-aid", "Mini first-aid kit", "Critical", "Covers cuts, blisters and quick response needs."),
      item("emergency-contacts", "Emergency contact card", "Recommended", "Useful for group and remote movement."),
      item("torch", "Small torch", "Optional", "Helpful for early starts, power cuts and remote stays."),
    ]),
  ];

  if (profile.destinationType === "Mountain" || profile.seasonRisk === "Altitude") {
    sections[0]?.items.push(
      item("thermal-layer", "Thermal or heavy layer", "Critical", "Mountain routes can shift temperature quickly."),
      item("windproof-jacket", "Windproof jacket", "Recommended", "Protects during high-altitude movement.")
    );
    sections[3]?.items.push(
      item("altitude-medicine", "Altitude medicine guidance", "Critical", "Useful for Ladakh, high passes and mountain stays.")
    );
  }

  if (profile.seasonRisk === "Rain") {
    sections[0]?.items.push(
      item("rain-jacket", "Rain jacket or poncho", "Critical", "Monsoon or coastal risk requires rain protection."),
      item("quick-dry", "Quick-dry clothing", "Recommended", "Reduces luggage problems during wet routes.")
    );
    sections[1]?.items.push(
      item("waterproof-pouch", "Waterproof pouch", "Critical", "Protects documents and gadgets.")
    );
  }

  if (profile.destinationType === "Desert" || profile.seasonRisk === "Heat") {
    sections[0]?.items.push(
      item("cotton-layers", "Light cotton layers", "Critical", "Better for desert or high-heat days."),
      item("sun-hat", "Sun hat or cap", "Recommended", "Reduces heat stress during outdoor movement.")
    );
    sections[1]?.items.push(
      item("hydration-salts", "Hydration salts", "Recommended", "Helpful for hot route days.")
    );
  }

  if (
    intent.travelStyle === "Adventure" ||
    intent.interests.includes("Trekking") ||
    intent.transportMode === "Bike"
  ) {
    sections.push(
      section("Trek/adventure gear", [
        item("trek-shoes", "Trek-ready shoes", "Critical", "Required for trekking, uneven terrain and adventure stops."),
        item("headlamp", "Headlamp or route torch", "Recommended", "Useful for early starts and low-light trails."),
        item("riding-gloves", intent.transportMode === "Bike" ? "Riding gloves and guards" : "Grip gloves", "Recommended", "Supports adventure movement safety."),
      ])
    );
  }

  if (intent.children > 0 || intent.seniors > 0 || intent.travelStyle === "Family") {
    sections.push(
      section("Family/kids essentials", [
        item("comfort-kit", "Family comfort kit", "Critical", "Adds snacks, wipes, light blanket and routine medicines."),
        item("senior-support", "Senior support medicines", intent.seniors > 0 ? "Critical" : "Recommended", "Improves comfort on long transfer days."),
        item("kid-entertainment", "Kids travel activity kit", intent.children > 0 ? "Recommended" : "Optional", "Keeps long waits easier for children."),
      ])
    );
  }

  if (intent.pets) {
    sections.push(
      section("Pet essentials", [
        item("pet-food", "Pet food and collapsible bowl", "Critical", "Required for pet-friendly route movement."),
        item("pet-docs", "Pet vaccination documents", "Critical", "Useful for stays and travel checks."),
        item("pet-comfort", "Pet comfort mat", "Recommended", "Keeps transit and stay changes easier."),
      ])
    );
  }

  if (profile.destinationType === "Spiritual" || intent.travelStyle === "Spiritual") {
    sections[0]?.items.push(
      item("modest-clothing", "Comfortable modest clothing", "Recommended", "Better suited for temple and spiritual routes.")
    );
    sections[6]?.items.push(
      item("permit-darshan-docs", "Permit or darshan document copies", "Recommended", "Helpful for controlled pilgrimage routes.")
    );
  }

  if (selectedRoute?.riskLevel === "High") {
    sections[5]?.items.push(
      item("route-backup", "Route backup contact sheet", "Critical", "Recommended for high-risk route movement.")
    );
  }

  return sections.map((packingSection) => ({
    ...packingSection,
    items: packingSection.items.filter(
      (packingItem, index, safeItems) =>
        safeItems.findIndex((itemData) => itemData.id === packingItem.id) === index
    ),
  }));
}
