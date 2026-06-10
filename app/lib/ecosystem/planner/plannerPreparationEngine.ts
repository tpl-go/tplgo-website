import {
  getPlannerPreparationProfile,
  type TiyaDestinationPreparationProfile,
} from "./plannerPackingEngine";
import type { TiyaRouteOption, TiyaTripIntent } from "./plannerTypes";

export type TiyaPreparationNote = {
  id: string;
  title: string;
  detail: string;
  tone: "info" | "warning" | "critical" | "success";
};

function note(
  id: string,
  title: string,
  detail: string,
  tone: TiyaPreparationNote["tone"] = "info"
): TiyaPreparationNote {
  return { id, title, detail, tone };
}

export function generatePlannerPreparationNotes({
  intent,
  selectedRoute,
}: {
  intent: TiyaTripIntent;
  selectedRoute?: TiyaRouteOption;
}): TiyaPreparationNote[] {
  const profile = getPlannerPreparationProfile(intent);
  const notes: TiyaPreparationNote[] = [
    note(
      "luggage-weight",
      "Keep luggage transfer-friendly",
      "Avoid heavy luggage when the route includes multiple city changes or local transfers.",
      "info"
    ),
    note(
      "offline-readiness",
      "Download offline copies",
      "Keep IDs, bookings, route notes and emergency contacts available without network.",
      "success"
    ),
  ];

  if (profile.destinationType === "Mountain") {
    notes.push(
      note(
        "altitude-prep",
        "Altitude preparation",
        "Carry altitude medicine guidance and avoid aggressive back-to-back movement on high routes.",
        "critical"
      )
    );
  }

  if (profile.seasonRisk === "Rain") {
    notes.push(
      note(
        "rain-protection",
        "Rain protection strongly recommended",
        "Use waterproof pouches for documents, electronics and day-trip essentials.",
        "warning"
      )
    );
  }

  if (profile.seasonRisk === "Heat") {
    notes.push(
      note(
        "heat-prep",
        "Heat-ready travel timing",
        "Carry hydration support and avoid peak afternoon outdoor movement.",
        "warning"
      )
    );
  }

  if (intent.transportMode === "Bike") {
    notes.push(
      note(
        "bike-prep",
        "Bike route safety kit",
        "Use riding protection, rain cover, quick repair kit and hydration support.",
        "critical"
      )
    );
  }

  if (intent.transportMode === "EV") {
    notes.push(
      note(
        "ev-prep",
        "EV charging preparation",
        "Keep charging stops, backup range and stay charging options planned before departure.",
        "warning"
      )
    );
  }

  if (intent.children > 0 || intent.seniors > 0 || intent.travelStyle === "Family") {
    notes.push(
      note(
        "family-kit",
        "Family comfort kit recommended",
        "Carry regular medicines, snacks, light layers and rest-day essentials.",
        "success"
      )
    );
  }

  if (intent.pets) {
    notes.push(
      note(
        "pet-docs",
        "Pet document check",
        "Keep vaccination proof, pet food and pet-friendly stay confirmations ready.",
        "critical"
      )
    );
  }

  if (intent.smartPreferences.includeInsurance) {
    notes.push(
      note(
        "insurance",
        "Insurance copy ready",
        "Keep policy details and emergency assistance numbers available offline.",
        "success"
      )
    );
  }

  if (selectedRoute?.riskLevel === "High") {
    notes.push(
      note(
        "route-risk",
        "Route risk preparation",
        "High-risk route selected. Add emergency contacts, fuel stops and backup transfer options.",
        "critical"
      )
    );
  }

  return notes;
}

export function generatePlannerRiskPreparation({
  intent,
  profile,
}: {
  intent: TiyaTripIntent;
  profile?: TiyaDestinationPreparationProfile;
}) {
  const activeProfile = profile ?? getPlannerPreparationProfile(intent);

  return [
    {
      label: "Weather risk prep",
      value:
        activeProfile.seasonRisk === "Rain"
          ? "Rain gear and waterproofing"
          : activeProfile.seasonRisk === "Heat"
            ? "Hydration and sun protection"
            : "Layered clothing backup",
    },
    {
      label: "Fatigue prep",
      value:
        intent.pace === "Packed"
          ? "Add snacks and recovery kit"
          : "Balanced rest buffer",
    },
    {
      label: "Motion sickness prep",
      value:
        intent.transportMode === "Bike" ||
        intent.transportMode === "Self-drive Car" ||
        activeProfile.destinationType === "Mountain"
          ? "Recommended"
          : "Optional",
    },
    {
      label: "Remote-area prep",
      value:
        activeProfile.destinationType === "Mountain" ||
        intent.travelStyle === "Adventure"
          ? "Offline maps and emergency sheet"
          : "Standard city readiness",
    },
    {
      label: "Low-network prep",
      value:
        activeProfile.destinationType === "Mountain" ||
        activeProfile.destinationType === "Desert"
          ? "Download all key documents"
          : "Keep route summary offline",
    },
  ];
}
