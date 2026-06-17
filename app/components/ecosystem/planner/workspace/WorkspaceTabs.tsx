import type { TiyaRouteOption } from "@/app/lib/ecosystem/planner/plannerTypes";

import BookingTab from "./tabs/BookingTab";
import CreatorTab from "./tabs/CreatorTab";
import HighlightsTab from "./tabs/HighlightsTab";
import ItineraryTab from "./tabs/ItineraryTab";
import LocalMarketTab from "./tabs/LocalMarketTab";
import OverviewTab from "./tabs/OverviewTab";
import PreferencesTab from "./tabs/PreferencesTab";
import RouteMapTab from "./tabs/RouteMapTab";
import { workspaceTabs, type WorkspacePreferences, type WorkspaceTab } from "./utils/workspaceTypes";

export default function WorkspaceTabs({
  activeTab,
  setActiveTab,
  selectedRoute,
  selectedTravelStyle,
  selectedBudgetVibe,
  preferences,
  fromCity,
  toCity,
  updatePreference,
  toggleInterest,
}: {
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  selectedRoute: TiyaRouteOption;
  selectedTravelStyle: string;
  selectedBudgetVibe: string;
  preferences: WorkspacePreferences;
  fromCity: string;
  toCity: string;
  updatePreference: <K extends keyof WorkspacePreferences>(
    key: K,
    value: WorkspacePreferences[K]
  ) => void;
  toggleInterest: (interest: string) => void;
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-[2rem] border border-white bg-white/95 shadow-[0_28px_85px_rgba(15,23,42,0.09)] backdrop-blur-2xl">
      <div className="sticky top-[86px] z-20 border-b border-slate-100 bg-white/92 px-5 py-3 backdrop-blur-xl">
        <div className="flex flex-wrap gap-2">
          {workspaceTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full border px-4 py-2 text-xs font-black transition ${
                activeTab === tab
                  ? "border-orange-300 bg-orange-500 text-white shadow-[0_10px_24px_rgba(249,115,22,0.22)]"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-orange-200 hover:bg-orange-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        {activeTab === "Overview" ? (
          <OverviewTab selectedRoute={selectedRoute} selectedTravelStyle={selectedTravelStyle} selectedBudgetVibe={selectedBudgetVibe} preferences={preferences} />
        ) : null}
        {activeTab === "Route Map" ? <RouteMapTab fromCity={fromCity} toCity={toCity} selectedRoute={selectedRoute} /> : null}
        {activeTab === "Highlights" ? <HighlightsTab selectedRoute={selectedRoute} preferences={preferences} selectedBudgetVibe={selectedBudgetVibe} /> : null}
        {activeTab === "Preferences" ? <PreferencesTab preferences={preferences} updatePreference={updatePreference} toggleInterest={toggleInterest} /> : null}
        {activeTab === "Itinerary" ? <ItineraryTab selectedRoute={selectedRoute} preferences={preferences} /> : null}
        {activeTab === "Booking" ? <BookingTab selectedRoute={selectedRoute} preferences={preferences} /> : null}
        {activeTab === "Creator" ? <CreatorTab /> : null}
        {activeTab === "Local Life" ? <LocalMarketTab /> : null}
      </div>
    </div>
  );
}
