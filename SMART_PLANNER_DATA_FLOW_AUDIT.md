# Smart Planner Data Flow Audit - Phase 1

## Current Source Chain

- Search form: `TiyaDesktopEntryHero` owns `TiyaTripIntent` input.
- Route generation: `generateSmartPlannerMock(intent)` creates route options, budget, suggestions, day plans and booking modules.
- Route selection: `SmartPlannerEntry` and `TiyaRouteIntelligence` now persist selected route, route options, source intent and generated plan through `saveRouteWorkspacePayload`.
- Workspace source: `/smart-planner/workspace/page.tsx` reads the route workspace payload from session storage.
- Itinerary generation: `BuildItineraryWorkspace` now builds from the saved source intent plus workspace preference overrides.
- Booking basket: `/smart-planner/workspace/page.tsx` owns the single `bookingBasket` state and passes it to generated itinerary, day timeline and booking checkout.
- Budget, summary, alerts and planning tools: `WorkspaceAdvancedTabs` now prefers the saved/generated workspace plan before falling back to generated mock data.

## Stabilized Data Objects

- `plannerSearchData`: normalized search data from `TiyaTripIntent`.
- `selectedRouteData`: selected route metadata and cost text.
- `generatedItineraryData`: day-wise plan, total budget and booking candidate count.
- `bookingBasket`: selected booking candidates shared across itinerary, generated section and checkout basket.

## Hardcoded / Placeholder Areas Reduced

- Workspace route handoff no longer stores only route data.
- Workspace build no longer invents fixed August 2026 dates when source intent exists.
- Dynamic itinerary generation now uses actual date range, origin, destination, travellers, budget tier, travel style, transport, stay and interests.
- Generated itinerary tools no longer reconstruct a separate plan when the workspace has a current generated plan.
- Booking state no longer exists as separate local selected ids or derived generated-section basket state.

## Remaining Mock Boundaries

- Route options, budget, recommendations, creator picks, local market picks and booking modules are still mock-engine outputs.
- The mock engines are now dynamic and user-input driven, but not connected to external APIs.
- City/destination fallback labels remain only as defensive fallbacks for missing input or legacy saved payloads.
