import type { Dispatch, SetStateAction } from "react";
import type { TiyaRouteOption, TiyaTripIntent } from "@/app/lib/ecosystem/planner/plannerTypes";
import CostSection from "./CostSection";
import ItinerarySection from "./ItinerarySection";
import LocalLifeSection from "./LocalLifeSection";
import MobilityIntelligenceSection from "./MobilityIntelligenceSection";
import OverviewSection from "./OverviewSection";
import TPLCreatorsSection from "./TPLCreatorsSection";
import TravelIntelligenceSection from "./TravelIntelligenceSection";
import type { DiscoveryItem } from "../drawers/DiscoveryDrawer";
import type { SmartPlannerPreviewTab as PreviewTab } from "../types/plannerTypes";
import type {
  buildCreatorIntelligence,
  buildLocalLife,
  buildMobilityIntelligence,
  CostEstimateLine,
  getTravelIntelligenceDashboard,
  JourneyFlowItem,
  OverviewCard,
  RoutePricing,
} from "../data/routePreviewData";

type SmartPlannerRouteDetailContentProps = {
  activeTab: PreviewTab;
  routeOption: TiyaRouteOption;
  routePricing: RoutePricing;
  tripIntent?: TiyaTripIntent;
  overviewCards: OverviewCard[];
  journeyFlow: JourneyFlowItem[];
  costDistribution: CostEstimateLine[];
  travelIntelligence: ReturnType<typeof getTravelIntelligenceDashboard>;
  mobilityIntelligence: ReturnType<typeof buildMobilityIntelligence>;
  localLife: ReturnType<typeof buildLocalLife>;
  creatorIntelligence: ReturnType<typeof buildCreatorIntelligence>;
  openJourneyNodeId: string | null;
  setOpenJourneyNodeId: Dispatch<SetStateAction<string | null>>;
  openCostDay: number | null;
  setOpenCostDay: Dispatch<SetStateAction<number | null>>;
  onContinue: () => void;
  onOpenOverviewDetail: (card: OverviewCard) => void;
  onAddLocalLifeSelection?: (item: DiscoveryItem) => void;
  onSaveLocalLifeSelection?: (item: DiscoveryItem) => void;
  onAddCreatorSelection?: (item: DiscoveryItem) => void;
  onSaveCreatorSelection?: (item: DiscoveryItem) => void;
};

export default function SmartPlannerRouteDetailContent({
  activeTab,
  routeOption,
  routePricing,
  tripIntent,
  overviewCards,
  journeyFlow,
  costDistribution,
  travelIntelligence,
  mobilityIntelligence,
  localLife,
  creatorIntelligence,
  openJourneyNodeId,
  setOpenJourneyNodeId,
  openCostDay,
  setOpenCostDay,
  onContinue,
  onOpenOverviewDetail,
  onAddLocalLifeSelection,
  onSaveLocalLifeSelection,
  onAddCreatorSelection,
  onSaveCreatorSelection,
}: SmartPlannerRouteDetailContentProps) {
  if (activeTab === "Overview") {
    return (
      <div className="mt-4">
        <OverviewSection
          overviewCards={overviewCards}
          onOpenOverviewDetail={onOpenOverviewDetail}
          onContinue={onContinue}
        />
      </div>
    );
  }

  if (activeTab === "Itinerary") {
    return (
      <div className="mt-4">
        <ItinerarySection
          journeyFlow={journeyFlow}
          tripIntent={tripIntent}
          openJourneyNodeId={openJourneyNodeId}
          setOpenJourneyNodeId={setOpenJourneyNodeId}
        />
      </div>
    );
  }

  if (activeTab === "Cost") {
    return (
      <div className="mt-4">
        <CostSection
          routePricing={routePricing}
          costDistribution={costDistribution}
          openCostDay={openCostDay}
          setOpenCostDay={setOpenCostDay}
        />
      </div>
    );
  }

  if (activeTab === "Travel Intelligence") {
    return (
      <div className="mt-4">
        <TravelIntelligenceSection
          routeOption={routeOption}
          travelIntelligence={travelIntelligence}
        />
      </div>
    );
  }

  if (activeTab === "Mobility Intelligence") {
    return (
      <div className="mt-4">
        <MobilityIntelligenceSection
          routeOption={routeOption}
          tripIntent={tripIntent}
          mobilityIntelligence={mobilityIntelligence}
        />
      </div>
    );
  }

  if (activeTab === "Local Life") {
    return (
      <div className="mt-4">
        <LocalLifeSection
          routeOption={routeOption}
          tripIntent={tripIntent}
          localLife={localLife}
          onAddToTrip={onAddLocalLifeSelection}
          onSave={onSaveLocalLifeSelection}
        />
      </div>
    );
  }

  if (activeTab === "TPL Creators") {
    return (
      <div className="mt-4">
        <TPLCreatorsSection
          routeOption={routeOption}
          tripIntent={tripIntent}
          creatorIntelligence={creatorIntelligence}
          onAddToTrip={onAddCreatorSelection}
          onSave={onSaveCreatorSelection}
        />
      </div>
    );
  }

  return null;
}
