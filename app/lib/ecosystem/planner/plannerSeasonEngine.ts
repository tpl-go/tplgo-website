import type { TiyaRouteOption, TiyaTripIntent } from "./plannerTypes";

export type TiyaDestinationSeasonType =
  | "Mountain"
  | "Coastal"
  | "Desert"
  | "Spiritual"
  | "Urban";

export type TiyaSeasonReadiness = {
  selectedMonth: string;
  monthIndex: number;
  destinationType: TiyaDestinationSeasonType;
  seasonType: string;
  seasonScore: number;
  bestTravelWindow: string;
  avoidWindow: string;
  idealTripDuration: string;
  riskLabel: "Low" | "Medium" | "High";
  note: string;
};

export type TiyaBestMonthIntelligence = {
  bestMonths: string[];
  okayMonths: string[];
  avoidMonths: string[];
  festivalCrowdImpact: string;
  familySafeMonths: string[];
  adventureSafeMonths: string[];
};

export type TiyaSeasonalRouteAdvice = {
  id: string;
  title: string;
  detail: string;
  action: "Better route" | "Safer route" | "Avoid road" | "Add buffer" | "Shift timing" | "Change mode";
  severity: "Low" | "Medium" | "High";
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function clampScore(value: number) {
  return Math.max(20, Math.min(98, Math.round(value)));
}

function getMonthIndex(startDate: string) {
  const parsed = new Date(startDate);

  if (Number.isNaN(parsed.getTime())) return 0;
  return parsed.getMonth();
}

export function getDestinationSeasonType(intent: TiyaTripIntent): TiyaDestinationSeasonType {
  const text = `${intent.toCity} ${intent.interests.join(" ")} ${intent.travelStyle}`.toLowerCase();

  if (
    text.includes("ladakh") ||
    text.includes("himachal") ||
    text.includes("sikkim") ||
    text.includes("uttarakhand") ||
    text.includes("spiti") ||
    text.includes("trek")
  ) {
    return "Mountain";
  }

  if (
    text.includes("kerala") ||
    text.includes("goa") ||
    text.includes("coast") ||
    text.includes("beach")
  ) {
    return "Coastal";
  }

  if (
    text.includes("rajasthan") ||
    text.includes("jaipur") ||
    text.includes("jaisalmer") ||
    text.includes("jodhpur")
  ) {
    return "Desert";
  }

  if (intent.travelStyle === "Spiritual" || intent.interests.includes("Temples")) {
    return "Spiritual";
  }

  return "Urban";
}

function isWinter(monthIndex: number) {
  return [11, 0, 1].includes(monthIndex);
}

function isMonsoon(monthIndex: number) {
  return [5, 6, 7, 8].includes(monthIndex);
}

function isSummer(monthIndex: number) {
  return [3, 4, 5].includes(monthIndex);
}

function getSeasonType(monthIndex: number) {
  if (isWinter(monthIndex)) return "Winter";
  if (isMonsoon(monthIndex)) return "Monsoon";
  if (isSummer(monthIndex)) return "Summer";
  return "Shoulder season";
}

export function generatePlannerSeasonReadiness({
  intent,
  selectedRoute,
}: {
  intent: TiyaTripIntent;
  selectedRoute?: TiyaRouteOption;
}): TiyaSeasonReadiness {
  const monthIndex = getMonthIndex(intent.startDate);
  const destinationType = getDestinationSeasonType(intent);
  const seasonType = getSeasonType(monthIndex);
  const familyCaution = intent.children > 0 || intent.seniors > 0 ? 8 : 0;
  let score = 78;
  let bestTravelWindow = "October to March";
  let avoidWindow = "Extreme weather windows";
  let note = "Season is workable with standard route buffers.";

  if (destinationType === "Mountain") {
    bestTravelWindow = "May to June, September to October";
    avoidWindow = "January to February, July to August";
    if (isWinter(monthIndex)) {
      score = 42;
      note = "Winter mountain travel can trigger snow, pass closure and road-risk caution.";
    } else if (isMonsoon(monthIndex)) {
      score = 48;
      note = "Monsoon mountain travel needs landslide and road-buffer planning.";
    } else {
      score = 84;
      note = "Mountain season looks strong with daylight and altitude buffers.";
    }
  }

  if (destinationType === "Coastal") {
    bestTravelWindow = "November to February";
    avoidWindow = "June to September";
    if (isMonsoon(monthIndex)) {
      score = 46;
      note = "Coastal monsoon raises rain, sea and road disruption risk.";
    } else {
      score = 82;
      note = "Coastal season is comfortable with mild activity buffers.";
    }
  }

  if (destinationType === "Desert") {
    bestTravelWindow = "November to February";
    avoidWindow = "April to June";
    if (isSummer(monthIndex)) {
      score = 44;
      note = "Desert summer raises heat and daylight comfort caution.";
    } else if (isWinter(monthIndex)) {
      score = 92;
      note = "Desert winter is an excellent travel window.";
    }
  }

  if (destinationType === "Spiritual") {
    bestTravelWindow = "February to April, September to November";
    avoidWindow = "Peak festival and heavy monsoon windows";
    score = isMonsoon(monthIndex) ? 58 : 78;
    note = isMonsoon(monthIndex)
      ? "Spiritual routes need crowd and rain caution in monsoon windows."
      : "Spiritual route season is workable with crowd buffers.";
  }

  const adjustedScore = clampScore(
    score - familyCaution - (selectedRoute?.riskLevel === "High" ? 10 : 0)
  );

  return {
    selectedMonth: monthNames[monthIndex],
    monthIndex,
    destinationType,
    seasonType,
    seasonScore: adjustedScore,
    bestTravelWindow,
    avoidWindow,
    idealTripDuration:
      adjustedScore >= 80 ? "4-7 nights" : adjustedScore >= 55 ? "5-8 nights with buffers" : "Shorter route or add 1-2 buffers",
    riskLabel: adjustedScore >= 78 ? "Low" : adjustedScore >= 52 ? "Medium" : "High",
    note,
  };
}

export function generatePlannerBestMonthIntelligence(
  readiness: TiyaSeasonReadiness
): TiyaBestMonthIntelligence {
  if (readiness.destinationType === "Mountain") {
    return {
      bestMonths: ["May", "June", "September", "October"],
      okayMonths: ["April", "November"],
      avoidMonths: ["January", "February", "July", "August"],
      festivalCrowdImpact: "Summer holidays and long weekends can raise crowd pressure.",
      familySafeMonths: ["May", "June", "September"],
      adventureSafeMonths: ["June", "September", "October"],
    };
  }

  if (readiness.destinationType === "Coastal") {
    return {
      bestMonths: ["November", "December", "January", "February"],
      okayMonths: ["March", "October"],
      avoidMonths: ["June", "July", "August", "September"],
      festivalCrowdImpact: "December holidays raise hotel and beach crowd pressure.",
      familySafeMonths: ["November", "January", "February"],
      adventureSafeMonths: ["October", "November", "February"],
    };
  }

  if (readiness.destinationType === "Desert") {
    return {
      bestMonths: ["November", "December", "January", "February"],
      okayMonths: ["October", "March"],
      avoidMonths: ["April", "May", "June"],
      festivalCrowdImpact: "Winter festivals can raise demand and local traffic.",
      familySafeMonths: ["December", "January", "February"],
      adventureSafeMonths: ["November", "December", "January"],
    };
  }

  return {
    bestMonths: ["February", "March", "October", "November"],
    okayMonths: ["January", "April", "September", "December"],
    avoidMonths: ["July", "August"],
    festivalCrowdImpact: "Festival dates may increase queue and stay pressure.",
    familySafeMonths: ["February", "March", "November"],
    adventureSafeMonths: ["March", "October", "November"],
  };
}

export function generatePlannerSeasonalRouteAdvice({
  intent,
  readiness,
  selectedRoute,
}: {
  intent: TiyaTripIntent;
  readiness: TiyaSeasonReadiness;
  selectedRoute?: TiyaRouteOption;
}): TiyaSeasonalRouteAdvice[] {
  const advice: TiyaSeasonalRouteAdvice[] = [];

  if (readiness.riskLabel === "High") {
    advice.push({
      id: "safer-route",
      title: "Choose safer alternate route",
      detail: "Use lower-risk transport corridors and avoid weather-sensitive detours.",
      action: "Safer route",
      severity: "High",
    });
  }

  if (readiness.destinationType === "Mountain" && readiness.seasonType === "Winter") {
    advice.push({
      id: "avoid-pass",
      title: "Avoid pass or high-road segment",
      detail: "Winter mountain routing should avoid snow-prone road passes where possible.",
      action: "Avoid road",
      severity: "High",
    });
  }

  if (readiness.seasonType === "Monsoon") {
    advice.push({
      id: "buffer-day",
      title: "Add buffer day",
      detail: "Monsoon routes benefit from a flexible buffer before return travel.",
      action: "Add buffer",
      severity: "Medium",
    });
  }

  if (["Bike", "Self-drive Car", "EV"].includes(intent.transportMode) && readiness.riskLabel !== "Low") {
    advice.push({
      id: "change-mode",
      title: "Choose flight/train instead of road if needed",
      detail: "Road-led routing has higher seasonal exposure for this month.",
      action: "Change mode",
      severity: "Medium",
    });
  }

  advice.push({
    id: "shift-timing",
    title: "Shift travel timing to daylight",
    detail: "Start transfers early to protect route visibility and comfort.",
    action: "Shift timing",
    severity: selectedRoute?.riskLevel === "High" ? "Medium" : "Low",
  });

  return advice.slice(0, 4);
}
