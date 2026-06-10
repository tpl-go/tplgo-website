import type {
  TiyaRouteWorkspacePayload,
  TiyaSelectedSmartPlannerTrip,
} from "@/app/lib/ecosystem/planner/plannerRouteWorkspaceHandoff";
import type {
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";

export const workspaceTabs = [
  "Overview",
  "Route Map",
  "Highlights",
  "Preferences",
  "Itinerary",
  "Booking",
  "Creator",
  "Local Market",
] as const;

export type WorkspaceTab = (typeof workspaceTabs)[number];

export type WorkspacePreferences = {
  transportMode: string;
  stayPreference: string;
  pace: string;
  comfortLevel: string;
  interests: string[];
};

export type WorkspacePayload = TiyaRouteWorkspacePayload & {
  routeOptions?: TiyaRouteOption[];
  preferences?: WorkspacePreferences;
  tripIntent?: TiyaTripIntent;
  generatedPlan?: TiyaGeneratedPlan;
  selectedSmartPlannerTrip?: TiyaSelectedSmartPlannerTrip;
};

export type SmartBuildPreferences = {
  foodPreference: string;
  adventureLevel: string;
  hiddenGems: boolean;
  creatorSpots: boolean;
  localMarket: boolean;
  familyMode: boolean;
  seniorFriendly: boolean;
  weatherSafe: boolean;
  budgetRefinement: string;
  activityIntensity: string;
};

export type BuildFlowState = "intro" | "inputs" | "generating" | "generated";

export const defaultPreferences: WorkspacePreferences = {
  transportMode: "Mixed",
  stayPreference: "Hotel",
  pace: "Balanced",
  comfortLevel: "Premium",
  interests: ["Nature", "Culture", "Local Market"],
};

export const defaultSmartBuildPreferences: SmartBuildPreferences = {
  foodPreference: "Local food",
  adventureLevel: "Balanced",
  hiddenGems: true,
  creatorSpots: true,
  localMarket: true,
  familyMode: false,
  seniorFriendly: false,
  weatherSafe: true,
  budgetRefinement: "Balanced spend",
  activityIntensity: "Balanced",
};

export const transportModes = [
  "Flight",
  "Train",
  "Bus",
  "Cab",
  "Self-drive",
  "Bike",
  "EV",
  "Mixed",
];

export const stayPreferences = [
  "Hotel",
  "Homestay",
  "Resort",
  "Hostel",
  "Camp",
  "Villa",
];

export const paceOptions = ["Relaxed", "Balanced", "Packed"];
export const comfortLevels = ["Economy", "Standard", "Premium", "Luxury"];

export const interestOptions = [
  "Food",
  "Culture",
  "Nature",
  "Shopping",
  "Trekking",
  "Temples",
  "Nightlife",
  "Local Market",
  "Creator Spots",
];

export const aiSwitches: Array<{
  label: string;
  key: keyof Pick<
    SmartBuildPreferences,
    | "hiddenGems"
    | "creatorSpots"
    | "localMarket"
    | "familyMode"
    | "seniorFriendly"
    | "weatherSafe"
  >;
}> = [
  { label: "Hidden gems", key: "hiddenGems" },
  { label: "Creator spots", key: "creatorSpots" },
  { label: "Local market", key: "localMarket" },
  { label: "Family mode", key: "familyMode" },
  { label: "Senior friendly", key: "seniorFriendly" },
  { label: "Weather-safe mode", key: "weatherSafe" },
];
