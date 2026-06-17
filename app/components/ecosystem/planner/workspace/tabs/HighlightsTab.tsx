import type { TiyaRouteOption } from "@/app/lib/ecosystem/planner/plannerTypes";

import HighlightBlock from "../shared/HighlightBlock";
import { transportHint } from "../utils/workspaceHelpers";
import type { WorkspacePreferences } from "../utils/workspaceTypes";

export default function HighlightsTab({
  selectedRoute,
  preferences,
  selectedBudgetVibe,
}: {
  selectedRoute: TiyaRouteOption;
  preferences: WorkspacePreferences;
  selectedBudgetVibe: string;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <HighlightBlock
        title="Scenic highlights"
        items={["View corridors", "Photo halts", "Slow route windows"]}
      />
      <HighlightBlock
        title="Food / Local Life"
        items={["Local food", "Market stop", "Regional tasting"]}
      />
      <HighlightBlock
        title="Creator spots"
        items={["Creator viewpoint", "Viral route stop", "Golden hour angle"]}
      />
      <HighlightBlock
        title="Stay vibe"
        items={[preferences.stayPreference, selectedBudgetVibe, "Recovery stay"]}
      />
      <HighlightBlock
        title="Transport assumption"
        items={[
          transportHint(selectedRoute),
          preferences.transportMode,
          selectedRoute.difficulty,
        ]}
      />
      <HighlightBlock
        title="Weather / permit"
        items={[`${selectedRoute.riskLevel} risk`, "Permit review", "Season check"]}
      />
    </div>
  );
}
