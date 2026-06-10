import type { TiyaPackingSection } from "./plannerPackingEngine";
import type { TiyaPreparationNote } from "./plannerPreparationEngine";
import type { TiyaTripIntent } from "./plannerTypes";

export type TiyaPackingReadiness = {
  packingReadiness: number;
  missingEssentials: number;
  criticalItems: number;
  optionalUpgrades: number;
  weatherReadiness: number;
  safetyReadiness: number;
};

function clampScore(value: number) {
  return Math.max(18, Math.min(98, Math.round(value)));
}

export function generatePlannerReadiness({
  intent,
  sections,
  notes,
}: {
  intent: TiyaTripIntent;
  sections: TiyaPackingSection[];
  notes: TiyaPreparationNote[];
}): TiyaPackingReadiness {
  const safeSections = Array.isArray(sections) ? sections : [];
  const safeNotes = Array.isArray(notes) ? notes : [];
  const items = safeSections.flatMap((section) =>
    Array.isArray(section.items) ? section.items : []
  );
  const criticalItems = items.filter((item) => item.priority === "Critical").length;
  const optionalUpgrades = items.filter((item) => item.priority === "Optional").length;
  const criticalNotes = safeNotes.filter((note) => note.tone === "critical").length;
  const warningNotes = safeNotes.filter((note) => note.tone === "warning").length;
  const familyLoad = intent.children + intent.seniors + (intent.pets ? 1 : 0);

  return {
    packingReadiness: clampScore(
      86 - criticalNotes * 5 - warningNotes * 3 - familyLoad * 2 + items.length * 0.3
    ),
    missingEssentials: Math.max(1, Math.round(criticalItems * 0.22 + warningNotes)),
    criticalItems,
    optionalUpgrades,
    weatherReadiness: clampScore(
      82 -
        warningNotes * 5 +
        (items.some((item) => item.id.includes("rain") || item.id.includes("thermal"))
          ? 7
          : 0)
    ),
    safetyReadiness: clampScore(
      78 +
        (intent.smartPreferences.includeInsurance ? 8 : 0) -
        criticalNotes * 4 +
        (items.some((item) => item.id === "mini-first-aid") ? 6 : 0)
    ),
  };
}
