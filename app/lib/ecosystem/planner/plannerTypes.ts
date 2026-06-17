export type TiyaTimelineDetailValue = string | number | string[] | undefined;

export type TiyaTimelineServiceOption = {
  id: string;
  title: string;
  description: string;
  providerName: string;
  price: number;
  currency: "INR";
  detailSummary: string;
  details: Record<string, TiyaTimelineDetailValue>;
};

export type TiyaPriceBasis =
  | "per_traveller"
  | "per_night"
  | "per_room_night"
  | "per_day"
  | "per_transfer"
  | "per_group"
  | "per_item"
  | "per_package"
  | "fixed";

export type TiyaTimelineItem = {
  id: string;
  time: string;
  title: string;
  location: string;
  type: "stay" | "activity" | "transport" | "meal";
  category?: "Transport" | "Stay" | "Activities" | "Meals" | "Package" | "Other";
  serviceType?: string;
  description?: string;
  from?: string;
  to?: string;
  finalDestination?: string;
  date?: string;
  travellers?: number;
  rooms?: number;
  nights?: number;
  checkInDay?: number;
  checkOutDay?: number;
  checkInDate?: string;
  checkOutDate?: string;
  cabKind?: "transfer" | "local" | "full_trip";
  coverageStartDay?: number;
  coverageEndDay?: number;
  coverageStartDate?: string;
  coverageEndDate?: string;
  durationDays?: number;
  unitPrice?: number;
  priceBasis?: TiyaPriceBasis;
  displayPriceLabel?: string;
  price?: number;
  currency?: "INR";
  providerName?: string;
  detailSummary?: string;
  details?: Record<string, TiyaTimelineDetailValue>;
  options?: TiyaTimelineServiceOption[];
  bookingStatus?: "available" | "selected" | "recommended" | "optional";
};

export type TiyaDayPlan = {
  id: string;
  day: number;
  date: string;
  city: string;
  pace: "Relaxed" | "Balanced" | "Packed";
  headline: string;
  notes: string;
  items: TiyaTimelineItem[];
};

export type TiyaRouteStop = {
  city: string;
  nights: number;
  transfer: string;
};

export type TiyaSuggestion = {
  id: string;
  category: "Stay" | "Activity" | "Transport";
  title: string;
  detail: string;
  price: string;
  fit: string;
};

export type TiyaBudgetLine = {
  label: string;
  amount: number;
  tone: "blue" | "orange" | "green" | "slate";
};

export type TiyaInsight = {
  label: string;
  value: string;
  score: number;
  tone: "blue" | "orange" | "green" | "slate";
};

export type TiyaRouteOption = {
  id: "fastest" | "scenic" | "budget" | "adventure";
  name: string;
  distance: string;
  duration: string;
  difficulty: string;
  scenicScore: number;
  comfortScore: number;
  budgetFit: number;
  riskLevel: "Low" | "Medium" | "High";
  note: string;
  bestFor: string;
  routeStyle: string;
  isRecommended: boolean;
};

export type TiyaBookingModule = {
  id:
    | "flights"
    | "hotels"
    | "homestays"
    | "cabs"
    | "packages"
    | "experiences"
    | "insurance"
    | "local-market";
  serviceName: string;
  reason: string;
  readiness: "Ready" | "Recommended" | "Optional" | "Review";
  cta: string;
  href: string;
  isHighlighted: boolean;
};

export type TiyaCreatorPick = {
  id: string;
  creatorName: string;
  handle: string;
  destination: string;
  specialty: string;
  engagementScore: number;
  routeFit: number;
  recommendationNote: string;
  suggestedStopover: string;
  tags: string[];
  isVerified: boolean;
  isHighlighted: boolean;
};

export type TiyaLocalMarketPick = {
  id: string;
  productName: string;
  localRegion: string;
  description: string;
  priceRange: string;
  specialtyLabel: string;
  authenticityBadge: string;
  routeRelevance: number;
  productType:
    | "handicrafts"
    | "spices"
    | "teas"
    | "local snacks"
    | "travel essentials"
    | "creator recommended items";
  isCreatorRecommended: boolean;
  isHighlighted: boolean;
};

export type TiyaJourneyMarkerType =
  | "origin"
  | "transport"
  | "stay"
  | "activity"
  | "creator"
  | "market"
  | "food"
  | "destination";

export type TiyaJourneyTimelineDay = {
  id: string;
  day: number;
  city: string;
  routeSegment: string;
  transportUsed: string;
  stayType: string;
  quickHighlight: string;
  status: "Ready" | "In planning" | "Needs review";
  markerTypes: TiyaJourneyMarkerType[];
  notes: string;
  itineraryItems: TiyaTimelineItem[];
  creatorRecommendations: TiyaCreatorPick[];
  localMarketPicks: TiyaLocalMarketPick[];
  bookingSuggestions: TiyaBookingModule[];
};

export type TiyaJourneyMapNode = {
  id: string;
  label: string;
  subLabel: string;
  markerType: TiyaJourneyMarkerType;
  x: number;
  y: number;
};

export type TiyaJourneyMapSegment = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  transportMode: string;
  segmentStyle: "flight" | "train" | "road" | "bike" | "mixed";
};

export type TiyaJourneyMap = {
  title: string;
  transportMode: string;
  nodes: TiyaJourneyMapNode[];
  segments: TiyaJourneyMapSegment[];
};

export type TiyaJourneyStatus = {
  activePlanningStage: string;
  comfortLevel: number;
  travelIntensity: number;
  routeReadiness: number;
  weatherReadiness: number;
  bookingReadiness: number;
};

export type TiyaTripHealthMetric = {
  label: string;
  score: number;
};

export type TiyaTripHealth = {
  overallScore: number;
  recommendationNote: string;
  metrics: TiyaTripHealthMetric[];
};

export type TiyaBudgetIntelligence = {
  estimatedSpend: number;
  transportSplit: number;
  staySplit: number;
  activitySplit: number;
  foodLocalSplit: number;
  flexibilityBuffer: number;
  economyComparison: number;
  premiumComparison: number;
  risk: "safe" | "balanced" | "high spend";
};

export type TiyaSmartAlert = {
  id: string;
  title: string;
  detail: string;
  severity: "info" | "warning" | "critical";
};

export type TiyaAIRecommendationCategory =
  | "Route"
  | "Stay"
  | "Transport"
  | "Activities"
  | "Budget"
  | "Weather"
  | "Risk"
  | "Local Market"
  | "Creator";

export type TiyaAIRecommendationPriority = "High" | "Medium" | "Low";

export type TiyaAIRecommendationStatus = "active" | "applied" | "dismissed" | "saved";

export type TiyaAIRecommendation = {
  id: string;
  title: string;
  category: TiyaAIRecommendationCategory;
  priority: TiyaAIRecommendationPriority;
  confidenceScore: number;
  detail: string;
  reason: string;
  impact: string;
  impactSummary: string;
  affectedDay: string;
  affectedModule: string;
  costImpact: number;
  comfortImpact: number;
  riskImpact: number;
  budgetImpact: number;
  experienceImpact: number;
  localCommerceImpact?: number;
  itineraryImpact: string;
  whyAiSuggestsThis: {
    travellerStyle: string;
    itineraryGap: string;
    budgetFit: string;
    routeFit: string;
    weatherRiskFit?: string;
  };
  whatWillChange: {
    dayChange: string;
    added?: string[];
    removed?: string[];
    updated?: string[];
    costImpact: string;
    fatigueImpact: string;
    bookingBasketImpact: string;
  };
};

export type TiyaAIRecommendationChangeLog = {
  id: string;
  recommendationId: string;
  title: string;
  summary: string;
  reason: string;
  impact: string;
  appliedAt: string;
  category: TiyaAIRecommendationCategory;
  costDelta: number;
  actionType?: string;
  affectedDays?: string[];
  comfortImpact?: number;
  newState?: string;
  previousState?: string;
  riskImpact?: number;
  sourceModule?: string;
};

export type TiyaPlannerChangeLog = TiyaAIRecommendationChangeLog;

export type TiyaTravelStat = {
  label: string;
  value: string;
  score?: number;
};

export type TiyaTripNotes = {
  personal: string;
  packing: string;
  localTips: string;
  creatorNotes: string;
};

export type TiyaPlannerSnapshot = {
  tripId?: string;
  userId?: string;
  owner?: {
    id: string;
    mobile?: string;
    email?: string;
  };
  tripName: string;
  status?: "Draft" | "Planning" | "Ready" | "Booked" | "Completed" | "Deleted";
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  savedAt?: string;
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  itinerary: TiyaDayPlan[];
  notes: TiyaTripNotes;
  draftData?: unknown;
  plannerState?: unknown;
  workspacePayload?: unknown;
  savedItems?: unknown[];
  expertRequests?: unknown[];
  checklist?: Record<string, string[]>;
  selectedTripItems?: unknown[];
  readinessScore?: number;
  recentActivity?: {
    id: string;
    label: string;
    createdAt: string;
  }[];
  selectedRouteId?: TiyaRouteOption["id"];
  selectedCreatorPickIds: string[];
  selectedMarketPickIds: string[];
  selectedBookingModuleIds: string[];
  appliedRecommendationIds?: string[];
  savedRecommendationIds?: string[];
  dismissedRecommendationIds?: string[];
  recommendationChangeLog?: TiyaAIRecommendationChangeLog[];
};

export type TiyaTripIntent = {
  fromCity: string;
  toCity: string;
  startDate: string;
  endDate: string;
  tripType: string;
  transportMode: string;
  transportPreference?: string;
  stayPreference: string;
  cabRequirement?: string;
  returnToOrigin?: boolean;
  stops?: string[];
  multiCityStops?: string[];
  budgetTier: string;
  customBudgetAmount: string;
  adults: number;
  children: number;
  seniors: number;
  pets: boolean;
  travelStyle: string;
  pace: "Relaxed" | "Balanced" | "Packed";
  interests: string[];
  smartPreferences: {
    includeStays: boolean;
    includeLocalMarket: boolean;
    includeCreatorSpots: boolean;
    includeInsurance: boolean;
    avoidNightTravel: boolean;
    preferScenicRoute: boolean;
  };
};

export type TiyaGeneratedPlan = {
  title: string;
  subtitle: string;
  routeTitle: string;
  nights: number;
  travellerCount: number;
  routeStops: TiyaRouteStop[];
  days: TiyaDayPlan[];
  suggestions: TiyaSuggestion[];
  budgetLines: TiyaBudgetLine[];
  totalBudget: number;
  insights: TiyaInsight[];
  routeOptions: TiyaRouteOption[];
  bookingModules: TiyaBookingModule[];
  creatorPicks: TiyaCreatorPick[];
  localMarketPicks: TiyaLocalMarketPick[];
};
