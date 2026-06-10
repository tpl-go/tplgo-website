# TPL Smart Planner / Tiya Ecosystem Architecture Audit

Audit date: 2026-06-04

Scope: current files under `app/smart-planner`, `app/tiya`, `app/components/ecosystem/planner`, `app/lib/ecosystem/planner`, and `types/ecosystem/planner`.

This audit is read-only against source code. The only file created is this requested audit report.

---

## Part 1 - File Inventory + Data Flow

### Section 1 - Complete File Inventory

#### Pages & Routes

| File | Purpose | Current status | Dependencies |
|---|---|---|---|
| `app/smart-planner/page.tsx` | Route entry for Smart Planner. Renders `SmartPlannerLanding`. | Working route shell. | `SmartPlannerLanding` |
| `app/smart-planner/workspace/page.tsx` | New route-intelligence workspace opened from selected route preview. Orchestrates topbar, hero, media, build CTA/input/generated flow, tabs. | Working client route; uses route handoff session storage. Generated itinerary is lightweight/local, not full engine-backed yet. | Workspace modules, `workspaceStorage`, `workspaceTypes`, `TiyaRouteOption` |
| `app/tiya/workspace/[routeId]/page.tsx` | Legacy dynamic route workspace that reads route handoff payload and shows route details for `[routeId]`. | Working but separate from new `/smart-planner/workspace` flow. | `readRouteWorkspacePayload`, route handoff types |

#### Route Intelligence Components

| File | Purpose | Current status | Dependencies |
|---|---|---|---|
| `app/components/ecosystem/planner/TiyaRouteIntelligence.tsx` | Full route selection, route preview tabs, route comparison modal, and continue-to-workspace handoff. | Working, large component. Saves route payload and navigates to `/smart-planner/workspace`. | `useRouter`, `saveRouteWorkspacePayload`, `TiyaRouteOption`, `lucide-react` |
| `app/components/ecosystem/planner/TiyaRouteSummary.tsx` | Sidebar route stop summary. | Working and reused in full planner workspace sidebar. | `TiyaRouteStop` |
| `app/components/ecosystem/planner/TiyaRouteThinking.tsx` | Generating/thinking visual state. | Working polish state. | Icons |
| `app/components/ecosystem/planner/TiyaRouteClusterMap.tsx` | Expedition/cluster route map. | Working visualization. | `plannerExpeditionEngine` |
| `app/components/ecosystem/planner/TiyaRouteVisualizer.tsx` | Segment-style visual renderer for map/route lines. | Working reusable visual helper. | `TiyaJourneyMapSegment` |

#### Workspace Components

| File | Purpose | Current status | Dependencies |
|---|---|---|---|
| `app/components/ecosystem/planner/TiyaPlannerWorkspace.tsx` | Original full Smart Planner studio. Owns main state, generated mock plan, route selection, modules, saved drafts, sidebar, and advanced ecosystem panels. | Fully wired mock-driven planner shell; very feature-rich. | Many planner engines, storage, planner components |
| `app/components/ecosystem/planner/TiyaWorkspaceHeader.tsx` | Header summary for generated plan/workspace. | Available reusable header. | `TiyaGeneratedPlan`, `TiyaTripIntent` |
| `app/components/ecosystem/planner/workspace/WorkspaceTopBar.tsx` | New workspace sticky route selector, route chips, change search button. | Working extracted module. | `Link`, `Compass`, `routeAccent`, `TiyaRouteOption` |
| `app/components/ecosystem/planner/workspace/WorkspaceRouteHero.tsx` | New workspace selected route heading, route bullets/status cards, route chips. | Working extracted module. | `TiyaRouteOption`, workspace helpers |
| `app/components/ecosystem/planner/workspace/WorkspaceMediaGrid.tsx` | New workspace gallery/video/highlights/map/activity/property block. | Working extracted module. | `TPLDynamicImage`, `MiniStaticMap`, `TiyaRouteOption` |
| `app/components/ecosystem/planner/workspace/WorkspaceTabs.tsx` | New workspace post-generation tabs orchestrator. | Working but tab content is mostly lightweight/placeholder. | Overview/Map/Highlights/Preferences/Itinerary/Booking/Creator/LocalMarket tabs |
| `app/components/ecosystem/planner/workspace/shared/PreferenceGroup.tsx` | Shared preference option group. | Working small UI helper. | none |
| `app/components/ecosystem/planner/workspace/shared/HighlightBlock.tsx` | Shared chip block. | Working small UI helper. | none |
| `app/components/ecosystem/planner/workspace/shared/MiniStaticMap.tsx` | Static mini route map. | Working visual helper. | `routeAccent`, `TiyaRouteOption` |

#### Build Journey Components

| File | Purpose | Current status | Dependencies |
|---|---|---|---|
| `app/components/ecosystem/planner/workspace/build/BuildItineraryWorkspace.tsx` | Owns new workspace build flow state: `intro`, `inputs`, `generating`, `generated`. Computes lightweight budget lines, insights, and 3-day timeline. | Working local flow. Not connected to full `TiyaGeneratedPlan` / `generateSmartPlannerMock`. | `BuildIntroSection`, `BuildInputsSection`, `BuildGeneratingSection`, `BuildGeneratedSection`, workspace helpers/types |
| `app/components/ecosystem/planner/workspace/build/BuildIntroSection.tsx` | Centered CTA conversion banner. | Working CTA. | Icons |
| `app/components/ecosystem/planner/workspace/build/BuildInputsSection.tsx` | Compact wizard for travel style, stay style, trip mood, interests, review, advanced controls, generate button. | Working UI and handlers; uses parent preference update callbacks. | React state/memo, workspace constants, icons |
| `app/components/ecosystem/planner/workspace/build/BuildGeneratingSection.tsx` | Generation progress step list. | Working visual state. | none |
| `app/components/ecosystem/planner/workspace/build/BuildGeneratedSection.tsx` | Displays local generated route blocks, `TiyaBudgetPreview`, `TiyaAIInsights`, alerts. | Working lightweight generated section. | `TiyaBudgetPreview`, `TiyaAIInsights`, planner types |

#### Itinerary Components

| File | Purpose | Current status | Dependencies |
|---|---|---|---|
| `app/components/ecosystem/planner/TiyaDynamicItinerary.tsx` | Wrapper over `TiyaItineraryTimeline`. | Working. | `TiyaItineraryTimeline`, `TiyaDayPlan` |
| `app/components/ecosystem/planner/TiyaItineraryTimeline.tsx` | Editable day-wise itinerary timeline with item editing behavior. | Working and highly reusable. | React, icons, `TiyaDayPlan`, polish states |
| `app/components/ecosystem/planner/TiyaDynamicItineraryEngine.tsx` | Advanced adaptive itinerary engine panel with dynamic plans, fatigue, group and recovery insights. | Working in original planner workspace. | Dynamic itinerary, group, recovery engines, adaptive cards |
| `app/components/ecosystem/planner/TiyaAdaptiveDayCard.tsx` | Expandable adaptive day card. | Working reusable day card. | `TiyaAdaptiveDay` |
| `app/components/ecosystem/planner/TiyaTimelineDayCard.tsx` | Journey timeline day card for route/timeline map layer. | Working reusable card. | `TiyaJourneyTimelineDay` |
| `app/components/ecosystem/planner/TiyaJourneyTimeline.tsx` | Timeline + journey map shell. | Working in original workspace. | `TiyaJourneyMap`, `TiyaTimelineDayCard` |
| `app/components/ecosystem/planner/workspace/tabs/ItineraryTab.tsx` | New workspace simple itinerary tab cards. | Placeholder/lightweight only. | route helpers, icons |

#### Maps Components

| File | Purpose | Current status | Dependencies |
|---|---|---|---|
| `app/components/ecosystem/planner/TiyaJourneyMap.tsx` | Journey map node and segment visualization. | Working and reusable. | `TiyaJourneyMap`, `TiyaRouteVisualizer` |
| `app/components/ecosystem/planner/TiyaRouteVisualizer.tsx` | Segment visual primitive. | Working. | `TiyaJourneyMapSegment` |
| `app/components/ecosystem/planner/TiyaRouteClusterMap.tsx` | Expedition route/cluster map. | Working. | expedition engine |
| `app/components/ecosystem/planner/workspace/shared/MiniStaticMap.tsx` | Lightweight static map for route workspace. | Working. | workspace helpers |
| `app/components/ecosystem/planner/workspace/tabs/RouteMapTab.tsx` | New workspace route map tab. | Working but simple. | `MiniStaticMap` |

#### Budget Components

| File | Purpose | Current status | Dependencies |
|---|---|---|---|
| `app/components/ecosystem/planner/TiyaBudgetPreview.tsx` | Budget line preview card. | Working and reused in full and new workspace. | `TiyaBudgetLine` |
| `app/components/ecosystem/planner/TiyaBudgetIntelligence.tsx` | Budget intelligence panel. | Working in operating dashboard. | `TiyaBudgetIntelligence` |
| `app/components/ecosystem/planner/TiyaCostOptimization.tsx` | Cost optimization module. | Working in original workspace. | optimization engine, savings meter, compare component |
| `app/components/ecosystem/planner/TiyaSavingsMeter.tsx` | Savings meter visual. | Working. | savings engine |
| `app/components/ecosystem/planner/TiyaOptimizationCompare.tsx` | Optimization comparison cards. | Working. | optimization engine |
| `app/lib/ecosystem/planner/plannerBudgetEngine.ts` | Budget total and budget line generation. | Working deterministic engine. | `TiyaTripIntent`, `TiyaBudgetLine` |
| `app/lib/ecosystem/planner/plannerBudgetInsightEngine.ts` | Budget intelligence calculation. | Working deterministic engine. | `TiyaBudgetIntelligence`, budget lines |
| `app/lib/ecosystem/planner/plannerSavingsEngine.ts` | Savings meter calculations. | Working. | `TiyaBudgetLine`, route/intent types |
| `app/lib/ecosystem/planner/plannerOptimizationEngine.ts` | Optimization plan and budget/comfort comparison. | Working. | comfort balancer, savings engine, day/budget/route types |

#### AI Components

| File | Purpose | Current status | Dependencies |
|---|---|---|---|
| `app/components/ecosystem/planner/TiyaAIInsights.tsx` | Score/insight card list. | Working and reused in both workspaces. | `TiyaInsight` |
| `app/components/ecosystem/planner/TiyaAIRecommendationRail.tsx` | AI recommendations rail. | Working. | `TiyaAIRecommendation` |
| `app/components/ecosystem/planner/TiyaOperatingDashboard.tsx` | Combined health, budget, alerts, stats, recommendations. | Working in original workspace. | health/budget/alerts/recommendation components |
| `app/components/ecosystem/planner/TiyaTravelCompanion.tsx` | AI companion chat/suggestion surface. | Working simulated companion. | companion engine, plan/route/intent |
| `app/components/ecosystem/planner/TiyaMemoryDashboard.tsx` | Memory profile, habit insights, recommendation continuity. | Working local memory module. | memory/recommendation/personality engines |
| `app/lib/ecosystem/planner/plannerInsightEngine.ts` | Generates basic `TiyaInsight[]`. | Working. | `TiyaTripIntent` |
| `app/lib/ecosystem/planner/plannerRecommendationEngine.ts` | Generates AI recommendations. | Working. | route/intent |
| `app/lib/ecosystem/planner/plannerCompanionEngine.ts` | Companion modes, prompts, messages, suggestions. | Working mock AI behavior. | plan/route/intent |
| `app/lib/ecosystem/planner/services/plannerAIService.ts` | Mock service bridge for AI workspace payload. | Available service adapter. | API types, agent registry, service types |
| `app/lib/ecosystem/planner/services/plannerAgentRegistry.ts` | Agent catalog and request/result types. | Available. | planner types |

#### Creator Integration

| File | Purpose | Current status | Dependencies |
|---|---|---|---|
| `app/components/ecosystem/planner/TiyaCreatorPicks.tsx` | Creator recommendation cards. | Working and reusable. | `TiyaCreatorPick`, polish states |
| `app/components/ecosystem/planner/workspace/tabs/CreatorTab.tsx` | New workspace creator tab placeholder. | Placeholder only. | none |
| `app/lib/ecosystem/planner/plannerCreatorEngine.ts` | Generates creator picks from intent. | Working deterministic engine. | `TiyaCreatorPick`, `TiyaTripIntent` |
| `app/lib/ecosystem/planner/services/plannerCreatorService.ts` | Mock creator recommendation service adapter. | Available service adapter. | API types, service types |

#### Local Market Integration

| File | Purpose | Current status | Dependencies |
|---|---|---|---|
| `app/components/ecosystem/planner/TiyaLocalMarketPicks.tsx` | Local market product recommendation cards. | Working and reusable. | `TiyaLocalMarketPick`, polish states |
| `app/components/ecosystem/planner/workspace/tabs/LocalMarketTab.tsx` | New workspace local market tab placeholder. | Placeholder only. | none |
| `app/lib/ecosystem/planner/plannerLocalMarketEngine.ts` | Generates local market picks from intent. | Working deterministic engine. | `TiyaLocalMarketPick`, `TiyaTripIntent` |
| `app/lib/ecosystem/planner/services/plannerMarketplaceService.ts` | Mock marketplace recommendation service adapter. | Available service adapter. | API types, service types |

#### Booking Integration

| File | Purpose | Current status | Dependencies |
|---|---|---|---|
| `app/components/ecosystem/planner/TiyaBookingIntegration.tsx` | Booking bridge, widgets, conversion rail and commerce layer. | Working in original planner workspace. | booking bridge, conversion engine, commerce engine |
| `app/components/ecosystem/planner/TiyaBookingReadyLayer.tsx` | Booking modules readiness cards. | Working. | `TiyaBookingModule`, `Link` |
| `app/components/ecosystem/planner/TiyaBookingWidgets.tsx` | Booking bridge item + conversion widget UI. | Working. | booking bridge, conversion engine |
| `app/components/ecosystem/planner/TiyaCheckoutBridge.tsx` | Checkout draft generation, save action, checklist. | Working local/session storage bridge. | checkout bridge, planner types |
| `app/components/ecosystem/planner/TiyaCheckoutChecklist.tsx` | Checkout checklist UI. | Working. | checkout bridge |
| `app/components/ecosystem/planner/TiyaPackageBuilder.tsx` | Package variants/components/price assembly. | Working. | package builder engine |
| `app/components/ecosystem/planner/TiyaQuoteGenerator.tsx` | Quote versions, breakup, actions. | Working. | quote engine |
| `app/components/ecosystem/planner/TiyaSmartBundleEngine.tsx` | Bundle cards and comparison. | Working. | bundle engine |
| `app/components/ecosystem/planner/workspace/tabs/BookingTab.tsx` | New workspace lightweight booking prep tab. | Placeholder/lightweight only. | route helpers |
| `app/lib/ecosystem/planner/plannerBookingEngine.ts` | Generates booking module readiness. | Working. | `TiyaBookingModule`, intent |
| `app/lib/ecosystem/planner/plannerBookingBridge.ts` | Generates bridge items and itinerary booking statuses. | Working. | plan/days/route |
| `app/lib/ecosystem/planner/plannerCheckoutBridge.ts` | Checkout draft/checklist/storage. | Working. | budget, bundle, quote, plan |
| `app/lib/ecosystem/planner/plannerConversionEngine.ts` | Conversion widgets and upsells. | Working. | booking bridge, plan/route/intent |
| `app/lib/ecosystem/planner/plannerCommerceEngine.ts` | Commerce bundle generation. | Working. | plan, creator, market |
| `app/lib/ecosystem/planner/services/plannerBookingService.ts` | Mock booking service adapter. | Available. | API contracts, service types |

#### Storage / Session Layer

| File | Storage keys used | Purpose |
|---|---|---|
| `app/lib/ecosystem/planner/plannerRouteWorkspaceHandoff.ts` | `tpl_tiya_selected_route_preview`, `tpl_tiya_workspace_draft` | Session handoff from route intelligence to `/smart-planner/workspace`; stores selected route and route options. |
| `app/components/ecosystem/planner/workspace/utils/workspaceStorage.ts` | `tpl_tiya_workspace_draft`, `tpl_tiya_selected_route_preview` | Reads/writes new workspace draft payload with preferences merged in. |
| `app/lib/ecosystem/planner/plannerStorage.ts` | `tpl_tiya_saved_trips`, `tpl_tiya_last_trip`, `tpl_tiya_trip_draft` | Local storage for full planner saved trips, last trip, autosaved draft. |
| `app/lib/ecosystem/planner/plannerCheckoutBridge.ts` | `tpl_tiya_checkout_draft`, `tpl_tiya_selected_bundle`, `tpl_tiya_quote_preview` | Persists checkout draft in session storage; selected bundle and quote preview in local storage. |
| `app/lib/ecosystem/planner/plannerExpertLeadEngine.ts` | `tpl_tiya_expert_leads`, `tpl_tiya_last_expert_request` | Local storage for expert lead submissions and latest request. |
| `app/lib/ecosystem/planner/plannerMemoryEngine.ts` | `tpl_tiya_memory_profile`, reads `tpl_tiya_saved_trips` | Local memory profile built from intent and saved trips. |
| `app/lib/ecosystem/planner/plannerReviewEngine.ts` | `tpl_tiya_trip_review`, `tpl_tiya_confirmed_plan`, also reads `tpl_tiya_last_expert_request` | Local trip review snapshot and confirmed plan persistence. |

#### Helpers / Utilities and Engines

| File | Purpose | Dependencies |
|---|---|---|
| `plannerMockGenerator.ts` | Generates full `TiyaGeneratedPlan` from `TiyaTripIntent`. | route, budget, insights, booking, creator, market engines |
| `plannerRouteEngine.ts` | Generates fastest/scenic/budget/adventure route options. | city data, planner types |
| `plannerCityData.ts` | Mock city profiles and city suggestions. | none |
| `plannerTimelineEngine.ts` | Builds journey timeline and journey status. | planner types |
| `plannerJourneyMapEngine.ts` | Builds `TiyaJourneyMap` from days and intent. | planner types |
| `plannerHealthEngine.ts` | Trip health and travel stats. | planner types |
| `plannerAlertEngine.ts` | Smart alerts. | planner types |
| `plannerDraftEngine.ts` | Builds trip names and planner snapshots. | planner types |
| `plannerRulesEngine.ts` | Rules and safety checks. | density engine, planner types |
| `plannerScenarioEngine.ts` | Multi-route scenario generation. | planner types |
| `plannerVariantEngine.ts` | Trip variants and intent transformations. | planner types |
| `plannerDynamicItineraryEngine.ts` | Adaptive day generation. | group, density, fatigue, planner types |
| `plannerDensityEngine.ts` | Day density. | group, planner types |
| `plannerFatigueEngine.ts` | Day and trip fatigue. | group, density, planner types |
| `plannerRecoveryEngine.ts` | Recovery suggestions. | dynamic itinerary, planner types |
| `plannerComfortBalancer.ts` | Comfort balancing. | planner types |
| `plannerActivityBalanceEngine.ts` | Activity balance insights. | experience engine, planner types |
| `plannerExperienceEngine.ts` | Experience suggestions. | planner types |
| `plannerExpeditionEngine.ts` | Expedition destinations and region intelligence. | planner types |
| `plannerClusterEngine.ts` | Destination clusters and expedition timeline. | expedition engine, planner types |
| `plannerExpeditionSummaryEngine.ts` | Expedition summary. | expedition/cluster engines |
| `plannerSeasonEngine.ts` | Season readiness, months and seasonal route advice. | planner types |
| `plannerSeasonalPackingEngine.ts` | Seasonal packing hints. | season engine, planner types |
| `plannerWeatherSimulationEngine.ts` | Weather simulation cards. | season engine, planner types |
| `plannerPackingEngine.ts` | Packing sections and preparation profile. | planner types |
| `plannerPreparationEngine.ts` | Preparation and risk notes. | packing engine, planner types |
| `plannerReadinessEngine.ts` | Readiness meter. | packing/preparation engines |
| `plannerGroupEngine.ts` | Group members and averages. | planner types |
| `plannerGroupInsightEngine.ts` | Group insights and suggestions. | group/conflict engines |
| `plannerConflictEngine.ts` | Group/variant conflicts. | scenario, variant, group, planner types |
| `plannerMemoryEngine.ts` | Memory profile. | storage, planner types |
| `plannerRecommendationMemory.ts` | Memory-based recommendations. | memory engine, planner types |
| `plannerTravelPersonalityEngine.ts` | Personality and habit metrics. | memory engine |
| `plannerPackageBuilder.ts` | Package components, variants, prices. | budget engine, planner types |
| `plannerQuoteEngine.ts` | Quote versions, summary, breakup, notes. | package builder, planner types |
| `plannerBundleEngine.ts` | Smart bundles. | budget engine, planner types |
| `plannerPostTripEngine.ts` | Post-trip summary, products, next-trip suggestions. | review engine, planner types |
| `plannerExportEngine.ts` | Exportable itinerary artifact text/data. | planner types |
| `plannerShareEngine.ts` | Share text. | planner types |
| `plannerApiBridge.ts` | API envelope, full sync payload and DB normalization. | API types, planner types, service context |
| `plannerEvents.ts` | Planner event bus and typed events. | API types, planner types |
| `plannerSessionLifecycle.ts` | Session state/progress helpers. | API types, planner types |
| `services/*` | Mock service adapters for route, AI, booking, creator, marketplace, weather, optimization, CRM. | API contracts and service types |
| `workspace/utils/workspaceHelpers.ts` | New route workspace UI helpers for accent, budget, transport, bullets, budget lines, insights. | planner types, workspace types |
| `workspace/utils/workspaceTypes.ts` | New route workspace tabs/preferences/build constants and types. | route handoff, route option |

#### Type Files

| File | Exported types | Current usage |
|---|---|---|
| `app/lib/ecosystem/planner/plannerTypes.ts` | Core planner domain types: timeline, day, route, budget, insight, booking, creator, market, journey map/status, health, alerts, recommendations, snapshot, intent, generated plan. | Used broadly by components and engines. |
| `types/ecosystem/planner/api/index.ts` | Re-exports API contracts and DB models. | Used by service and API bridge imports. |
| `types/ecosystem/planner/api/plannerApiContracts.ts` | API envelopes and payload contracts for itinerary/scenario/variant/rules/weather/optimization/bundle/quote/checkout/CRM/creator/marketplace/AI/full sync. | Used by service adapters and API bridge. |
| `types/ecosystem/planner/api/plannerDbModels.ts` | Normalized DB record models for trip, itinerary days/items, experiences, bundles, quotes, traveller profiles, creators, marketplace, normalized graph. | Used by API bridge normalization. |

### Section 2 - Data Flow Audit

#### Current primary full planner flow (`/smart-planner`)

```text
app/smart-planner/page.tsx
  ↓
SmartPlannerLanding
  ↓
TiyaPlannerWorkspace
  ↓
TiyaDesktopEntryHero / TiyaTripIntentForm
  ↓
generateSmartPlannerMock(intent)
  ↓
routeOptions + days + budgetLines + insights + bookingModules + creatorPicks + localMarketPicks
  ↓
TiyaRouteIntelligence
  ↓
Route selected
  ↓
Full planner modules open in-page OR Continue with this Route writes route handoff and navigates
```

| Step | Input | Processing | Output | Storage keys | Types used | Components used | Handoff |
|---|---|---|---|---|---|---|---|
| Search Input | `TiyaTripIntent` from `TiyaDesktopEntryHero` or `TiyaTripIntentForm` | Form state, city suggestions, submit callback | Intent passed to `handleGenerate` | none at submit; later draft autosave | `TiyaTripIntent` | `TiyaDesktopEntryHero`, `TiyaTripIntentForm` | `TiyaPlannerWorkspace.handleGenerate` |
| Route Intelligence | `generatedPlan.routeOptions` | `TiyaRouteIntelligence` sorts recommended route, supports selection/compare/detail tabs | selected route id; route preview | On continue: `tpl_tiya_selected_route_preview`, `tpl_tiya_workspace_draft` | `TiyaRouteOption` | `TiyaRouteIntelligence` | `saveRouteWorkspacePayload`, optional `/smart-planner/workspace` navigation |
| Route Selection | route id or route option | In full workspace: `handleRouteChange` sets route id and opens modules. In route intelligence continue: saves selected route and pushes route workspace. | selected route, route workspace open | full planner draft later: `tpl_tiya_trip_draft` | `TiyaRouteOption["id"]` | `TiyaRouteIntelligence`, `TiyaPlannerWorkspace` | state or route handoff |
| Workspace Handoff | selected route + route options | `plannerRouteWorkspaceHandoff.saveRouteWorkspacePayload` serializes payload | `TiyaRouteWorkspacePayload` in session | `tpl_tiya_selected_route_preview`, `tpl_tiya_workspace_draft` | `TiyaRouteWorkspacePayload` | `TiyaRouteIntelligence` | `/smart-planner/workspace` |
| Build Journey | New workspace selected route and preferences | `BuildItineraryWorkspace` manages local wizard state and local budget/insight/timeline generation | generated local route blocks and unlocks tabs | workspace preferences saved back to two session keys | `WorkspacePreferences`, `SmartBuildPreferences`, `TiyaBudgetLine`, `TiyaInsight` | `BuildIntroSection`, `BuildInputsSection`, `BuildGeneratingSection`, `BuildGeneratedSection` | `onGenerated` sets `itineraryGenerated` and active tab |
| Generated Itinerary | Full planner: `TiyaGeneratedPlan.days`; new workspace: local 3-item timeline | Full planner uses `TiyaDynamicItinerary`/advanced engines; new workspace displays local blocks | editable days in full planner; static generated blocks in new workspace | full planner autosaves `tpl_tiya_trip_draft`; new workspace keeps route/prefs only | `TiyaDayPlan`, `TiyaGeneratedPlan`; new route workspace uses local timeline item shape | `TiyaItineraryTimeline`, `TiyaDynamicItineraryEngine`, `BuildGeneratedSection` | Full planner passes state to downstream modules |
| Budget Layer | `budgetLines`, `totalBudget`, intent/preferences | Budget engine/insight engine or new workspace helper | budget preview/intelligence | draft/snapshot if saved | `TiyaBudgetLine`, `TiyaBudgetIntelligence` | `TiyaBudgetPreview`, `TiyaBudgetIntelligence`, `TiyaCostOptimization` | original planner dashboard/sidebar |
| AI Layer | intent, route, generated plan, status | insight, recommendation, companion, memory engines | insights, recs, companion suggestions | memory profile key for memory module | `TiyaInsight`, `TiyaAIRecommendation`, `TiyaTripHealth` | `TiyaAIInsights`, `TiyaOperatingDashboard`, `TiyaTravelCompanion`, `TiyaMemoryDashboard` | full planner modules |
| Creator Layer | intent, plan | creator engine generates picks; creator cards display | creator recommendations | included in saved snapshots and API sync payloads | `TiyaCreatorPick` | `TiyaCreatorPicks`; new workspace `CreatorTab` placeholder | full planner ecosystem module |
| Local Market Layer | intent, plan | local market engine generates picks; market cards display | local product recs | included in saved snapshots and API sync payloads | `TiyaLocalMarketPick` | `TiyaLocalMarketPicks`; new workspace `LocalMarketTab` placeholder | full planner ecosystem module |
| Booking Layer | intent, plan, days, route | booking modules, bridge items, conversion widgets, checkout drafts, quotes, bundles | booking-ready modules, checkout draft, quote preview | checkout/review/expert storage keys | `TiyaBookingModule`, bridge/checkout/quote/bundle types | `TiyaBookingIntegration`, `TiyaBookingReadyLayer`, `TiyaCheckoutBridge`, `TiyaQuoteGenerator`, `TiyaPackageBuilder`, `TiyaSmartBundleEngine` | full planner booking/package/checkout modules |

#### New route workspace flow (`/smart-planner/workspace`)

```text
TiyaRouteIntelligence
  ↓ saveRouteWorkspacePayload()
sessionStorage:
  tpl_tiya_selected_route_preview
  tpl_tiya_workspace_draft
  ↓
app/smart-planner/workspace/page.tsx
  ↓
WorkspaceTopBar → WorkspaceRouteHero → WorkspaceMediaGrid
  ↓
BuildItineraryWorkspace
  ↓
BuildIntroSection → BuildInputsSection → BuildGeneratingSection → BuildGeneratedSection
  ↓
WorkspaceTabs
```

Important distinction: this route currently does not call `generateSmartPlannerMock`, `plannerTimelineEngine`, `plannerBookingEngine`, `plannerCreatorEngine`, or `plannerLocalMarketEngine`. It uses route handoff data plus local preferences and helper-generated budget/insight/timeline data.

---

## Part 2 - Type Audit + Reuse Audit

### Section 3 - `plannerTypes.ts` Type Audit

| Type | Purpose | Current usage | Used in files | Partially used | Not used | Future reuse potential |
|---|---|---|---|---|---|---|
| `TiyaTimelineItem` | Single timeline item in a day. | Used in day plans, DB model, mock generator. | `plannerTypes`, `plannerMockGenerator`, API DB/contracts. | Yes: richer item metadata missing for advanced itinerary. | No | High |
| `TiyaDayPlan` | Canonical generated day. | Widely used by full planner itinerary, engines, API, review/export. | `TiyaPlannerWorkspace`, `TiyaItineraryTimeline`, `plannerMockGenerator`, many engines. | Yes: current new workspace does not use it. | No | Very high |
| `TiyaRouteStop` | Route stop summary. | Used in generated plan and route summary. | `plannerTypes`, `plannerMockGenerator`, `TiyaRouteSummary`. | Mostly complete. | No | Medium |
| `TiyaSuggestion` | Stay/activity/transport suggestion. | Used in suggestion cards and mock plan. | `TiyaSuggestionCards`, `plannerMockGenerator`. | Basic. | No | Medium |
| `TiyaBudgetLine` | Budget split row. | Used in budget preview and budget engines; new workspace helper also returns it. | `TiyaBudgetPreview`, `plannerBudgetEngine`, workspace helpers. | Complete for display; limited metadata. | No | High |
| `TiyaInsight` | AI score insight. | Used in AI insights and insight engines; new workspace helper uses it. | `TiyaAIInsights`, `plannerInsightEngine`, workspace helpers. | Basic. | No | High |
| `TiyaRouteOption` | Canonical route option. | Used extensively in route intelligence, workspaces and engines. | `TiyaRouteIntelligence`, `plannerRouteEngine`, route workspace, many modules. | Complete enough for current route UI. | No | Very high |
| `TiyaBookingModule` | Booking service readiness module. | Used in booking ready layer, booking engine, checkout bridge, timeline, health. | `TiyaBookingReadyLayer`, `plannerBookingEngine`, `plannerBookingBridge`, `plannerHealthEngine`. | Strong. | No | Very high |
| `TiyaCreatorPick` | Creator recommendation. | Used in creator cards, creator engine, commerce/package/experience/API. | `TiyaCreatorPicks`, `plannerCreatorEngine`, `plannerExperienceEngine`, API DB/contracts. | Strong. | No | High |
| `TiyaLocalMarketPick` | Marketplace/local product recommendation. | Used in local market cards, market engine, commerce/package/API. | `TiyaLocalMarketPicks`, `plannerLocalMarketEngine`, `plannerCommerceEngine`, API DB/contracts. | Strong. | No | High |
| `TiyaJourneyMarkerType` | Marker taxonomy for timeline/map. | Used by journey day/map types and engines. | `plannerTimelineEngine`, `plannerJourneyMapEngine`, map/timeline components. | Complete. | No | High |
| `TiyaJourneyTimelineDay` | Enriched timeline day with status, markers, creator/market/booking suggestions. | Used by `TiyaTimelineDayCard`, journey timeline engine. | `TiyaTimelineDayCard`, `TiyaJourneyTimeline`, `plannerTimelineEngine`. | Yes: not used by new workspace generated tabs. | No | Very high |
| `TiyaJourneyMapNode` | Map node. | Used inside `TiyaJourneyMap`. | `plannerJourneyMapEngine`, `TiyaJourneyMap`. | Complete for static visualization. | No | High |
| `TiyaJourneyMapSegment` | Map segment. | Used by journey map and route visualizer. | `plannerJourneyMapEngine`, `TiyaRouteVisualizer`. | Complete for visual route style. | No | High |
| `TiyaJourneyMap` | Journey map graph. | Used by journey timeline/map components. | `TiyaJourneyTimeline`, `TiyaJourneyMap`, `plannerJourneyMapEngine`. | Yes: not wired into new route workspace. | No | Very high |
| `TiyaJourneyStatus` | Readiness scores for route/weather/booking etc. | Used by journey timeline and health engines. | `TiyaJourneyTimeline`, `plannerTimelineEngine`, `plannerHealthEngine`. | Strong. | No | High |
| `TiyaTripHealthMetric` | Health metric row. | Used inside `TiyaTripHealth`. | `TiyaTripHealth`, `plannerHealthEngine`. | Complete. | No | Medium |
| `TiyaTripHealth` | Overall trip health. | Used in operating dashboard. | `TiyaOperatingDashboard`, `TiyaTripHealth`, `plannerHealthEngine`. | Strong in full planner. | No | High |
| `TiyaBudgetIntelligence` | Budget intelligence summary. | Used in operating dashboard. | `TiyaBudgetIntelligence`, `plannerBudgetInsightEngine`, `TiyaOperatingDashboard`. | Strong. | No | High |
| `TiyaSmartAlert` | Alert item. | Used in smart alerts, review/export, API. | `TiyaSmartAlerts`, `plannerAlertEngine`, `plannerReviewEngine`, `plannerExportEngine`, API contracts. | Strong. | No | High |
| `TiyaAIRecommendation` | AI recommendation. | Used in AI recommendation rail and operating dashboard. | `TiyaAIRecommendationRail`, `plannerRecommendationEngine`, `TiyaOperatingDashboard`. | Strong. | No | High |
| `TiyaTravelStat` | Travel stat display row. | Used by travel stats. | `TiyaTravelStats`, `plannerHealthEngine`. | Basic. | No | Medium |
| `TiyaTripNotes` | User notes. | Used in planner snapshots and notes component. | `TiyaTripNotes`, `TiyaPlannerWorkspace`, `plannerStorage`. | Strong. | No | Medium |
| `TiyaPlannerSnapshot` | Saved/draft trip payload. | Used in storage, actions, library, share/export/API bridge. | `plannerStorage`, `TiyaPlannerActions`, `TiyaSavedTripLibrary`, `plannerApiBridge`. | Strong for original full planner. | No | Very high |
| `TiyaTripIntent` | Search/input brief. | Foundational intent type for almost every engine. | `TiyaDesktopEntryHero`, `TiyaPlannerWorkspace`, `plannerMockGenerator`, many engines. | Strong; new workspace has separate narrower preferences type. | No | Very high |
| `TiyaGeneratedPlan` | Main generated plan. | Central plan in full workspace. | `TiyaPlannerWorkspace`, `plannerMockGenerator`, booking/package/quote/experience/review engines. | Strong; not used by new route workspace build output yet. | No | Very high |

Special audit conclusion: the type system already contains most of the advanced itinerary foundation. The gap is not type availability; it is integration of the new `/smart-planner/workspace` build flow with canonical `TiyaTripIntent`, `TiyaGeneratedPlan`, `TiyaDayPlan`, `TiyaJourneyTimelineDay`, `TiyaJourneyMap`, booking, creator and market engines.

### Section 4 - Component Reuse Audit

| Component category | Existing component(s) | Current usage | Reuse score | Can reuse for advanced itinerary? |
|---|---|---|---:|---|
| Day Cards | `TiyaAdaptiveDayCard`, `TiyaTimelineDayCard` | Dynamic itinerary engine and journey timeline. | 85% | Yes |
| Timeline Cards | `TiyaItineraryTimeline`, `TiyaJourneyTimeline`, `TiyaTimelineDayCard` | Full planner itinerary/timeline. | 90% | Yes |
| Route Cards | `TiyaRouteIntelligence`, `WorkspaceRouteHero`, `WorkspaceTopBar` | Route selection and route workspace. | 80% | Yes |
| Accordions | Local `PlannerModule` inside `TiyaPlannerWorkspace`; expandable `TiyaAdaptiveDayCard`. | Full planner module shell and day cards. | 65% | Yes, but `PlannerModule` is local and not separately exported. |
| Expandable Panels | `TiyaAdaptiveDayCard`, `TiyaItineraryTimeline`, `TiyaScenarioEngine`, `BuildInputsSection` advanced controls. | Multiple. | 70% | Yes |
| Booking Cards | `TiyaBookingReadyLayer`, `TiyaBookingWidgets`, `TiyaCheckoutChecklist` | Original planner booking flow. | 85% | Yes |
| Creator Cards | `TiyaCreatorPicks` | Original ecosystem module. | 95% | Yes |
| Local Market Cards | `TiyaLocalMarketPicks` | Original ecosystem module. | 95% | Yes |
| Alert Cards | `TiyaSmartAlerts`, `TiyaConflictInsights`, `TiyaFatigueInsights`, `TiyaRecoverySuggestions` | Operating dashboard/dynamic itinerary/group. | 85% | Yes |
| Budget Cards | `TiyaBudgetPreview`, `TiyaBudgetIntelligence`, `TiyaSavingsMeter`, `TiyaPackagePriceCard` | Sidebar, operating dashboard, package/optimization. | 90% | Yes |
| Insight Cards | `TiyaAIInsights`, `TiyaAIRecommendationRail`, `TiyaOperatingDashboard` | Sidebar and dashboard. | 90% | Yes |
| Summary Cards | `TiyaRouteSummary`, `TiyaWorkspaceHeader`, `TiyaQuoteBreakup`, `TiyaReviewScore` | Sidebar/header/quote/review. | 75% | Yes |
| Status Cards | `TiyaTripHealth`, `TiyaTravelStats`, `TiyaReadinessMeter`, `TiyaJourneyTimeline` status area | Operating dashboard and prep modules. | 80% | Yes |
| Map Cards | `TiyaJourneyMap`, `MiniStaticMap`, `TiyaRouteClusterMap` | Full planner and route workspace. | 80% | Yes |
| Empty/Skeleton | `TiyaEmptyState`, `TiyaAISkeleton` | Creator, market, saved trips, suggestions, itinerary. | 85% | Yes |

---

## Part 3 - Storage, Capability, Readiness, Recommendation

### Section 5 - Storage & Session Audit

| Key | File where written | File where read | Purpose | Stored data structure |
|---|---|---|---|---|
| `tpl_tiya_selected_route_preview` | `plannerRouteWorkspaceHandoff.ts`, `workspaceStorage.ts` | `plannerRouteWorkspaceHandoff.ts`, `workspaceStorage.ts`, `/smart-planner/workspace/page.tsx` indirectly | Route preview handoff to route workspace. | `TiyaRouteWorkspacePayload`, later extended by `WorkspacePayload` with preferences/tripIntent. |
| `tpl_tiya_workspace_draft` | `plannerRouteWorkspaceHandoff.ts`, `workspaceStorage.ts` | `workspaceStorage.ts`, `plannerRouteWorkspaceHandoff.ts` fallback | Route workspace autosaved draft. | `WorkspacePayload`: route id, selected route, route options, generatedAt/source, optional preferences/tripIntent. |
| `tpl_tiya_saved_trips` | `plannerStorage.ts` | `plannerStorage.ts`, `plannerMemoryEngine.ts` | Saved trip library. | `TiyaPlannerSnapshot[]`. |
| `tpl_tiya_last_trip` | `plannerStorage.ts` | `plannerStorage.ts`, `TiyaPlannerWorkspace` via load helper | Last saved/restored trip. | `TiyaPlannerSnapshot`. |
| `tpl_tiya_trip_draft` | `plannerStorage.ts` | `plannerStorage.ts`, `TiyaPlannerWorkspace` via load helper | Autosaved full planner draft. | `TiyaPlannerSnapshot`. |
| `tpl_tiya_checkout_draft` | `plannerCheckoutBridge.ts` | `TiyaCheckoutBridge` displays key; save occurs in bridge | Checkout draft. | `TiyaCheckoutDraft`. |
| `tpl_tiya_selected_bundle` | `plannerCheckoutBridge.ts` | `TiyaCheckoutBridge` displays key | Selected bundle preview. | `TiyaSmartBundle`. |
| `tpl_tiya_quote_preview` | `plannerCheckoutBridge.ts` | `TiyaCheckoutBridge` displays key | Quote preview. | Quote preview object from checkout draft. |
| `tpl_tiya_expert_leads` | `plannerExpertLeadEngine.ts` | `plannerExpertLeadEngine.ts`, `TiyaExpertReview` displays key | Expert lead submissions. | `TiyaExpertLeadPayload[]`. |
| `tpl_tiya_last_expert_request` | `plannerExpertLeadEngine.ts`, read in review engine by raw key | `plannerExpertLeadEngine.ts`, `plannerReviewEngine.ts`, `TiyaExpertReview` displays key | Last expert request. | `TiyaExpertLeadPayload`. |
| `tpl_tiya_memory_profile` | `plannerMemoryEngine.ts` | `plannerMemoryEngine.ts`, `TiyaMemoryDashboard` displays key | Traveller memory profile. | `TiyaTravelMemoryProfile`. |
| `tpl_tiya_trip_review` | `plannerReviewEngine.ts` | `plannerReviewEngine.ts`, `TiyaTripReview` displays key | Review snapshot. | `TiyaTripReviewSnapshot`. |
| `tpl_tiya_confirmed_plan` | `plannerReviewEngine.ts` | `TiyaTripReview` displays key | Confirmed plan. | object with review snapshot and confirmed timestamp/status. |

Storage gaps for requested future build:

- No dedicated key exists for new workspace generated journey.
- No dedicated key exists for build wizard preferences apart from being merged into `tpl_tiya_workspace_draft`.
- New `/smart-planner/workspace` does not persist a canonical `TiyaGeneratedPlan`.

### Section 6 - Current Capability Report

#### Fully Working

- Route Intelligence: route generation, route selection, route detail preview, comparison modal, route handoff.
- Original full planner workspace: mock-driven plan generation, route workspace open/closed state, saved draft restore, autosave.
- Budget: budget lines, total, budget intelligence, savings and optimization modules.
- AI Insights: insights, operating dashboard recommendations, companion simulation, memory profile.
- Creator Layer: creator pick generation and cards in original workspace.
- Local Market Layer: local product generation and cards in original workspace.
- Booking Layer: booking modules, booking bridge items, conversion widgets, checkout draft, quote, package, bundles.
- Maps: journey map, route visualizer, static mini map, route cluster map.
- Trip Health/Journey Status: engines and dashboard components are wired in original workspace.
- Saved Trip Library: save/draft/restore/rename/duplicate/delete exists for original workspace.

#### Partially Built

- New `/smart-planner/workspace`: route handoff, topbar, hero, media, build wizard and generated section work, but generated output is local/lightweight and not canonical.
- New workspace tabs: Overview/Route Map/Highlights/Preferences/Itinerary/Booking are lightweight; Creator and Local Market are placeholders.
- Build Journey in new workspace: wizard works visually and mutates preferences, but does not call full generation engines.
- API/service layer: contracts and mock service adapters exist, but no observed backend integration from pages.

#### Placeholder Only

- New workspace `CreatorTab.tsx`.
- New workspace `LocalMarketTab.tsx`.
- New workspace `BookingTab.tsx` is only prep cards, not the full booking integration.
- New workspace `ItineraryTab.tsx` is simple cards, not canonical editable itinerary.

#### Missing

- Canonical generated journey state in `/smart-planner/workspace`.
- Bridge from `WorkspacePreferences` / build wizard output to `TiyaTripIntent`.
- Invocation of `generateSmartPlannerMock` or equivalent advanced itinerary engine from new workspace.
- Persistence for new generated plan/journey snapshot in route workspace.
- Reuse of `TiyaDynamicItinerary`, `TiyaJourneyTimeline`, `TiyaCreatorPicks`, `TiyaLocalMarketPicks`, and `TiyaBookingIntegration` inside new workspace tabs.
- Clear single itinerary data contract for advanced generated itinerary in the new workspace route.

### Section 7 - Itinerary Readiness Report

Can advanced itinerary be built mostly using existing architecture?

Yes. The original Smart Planner already contains most domain engines, canonical types, and reusable UI components needed for an advanced itinerary. The new route workspace mainly needs integration, state modeling, and reuse of existing modules rather than invention of a new ecosystem.

Estimated current existence:

- Domain types: 85% already exists.
- Generation engines: 75% already exists.
- Itinerary UI: 80% already exists.
- Budget/AI/creator/market/booking modules: 80-90% already exists in original workspace.
- New route workspace integration: 35-45% complete.

Estimated required new code:

- 20-30% for adapters, canonical state, persistence, and composition inside `/smart-planner/workspace`.
- More if the future engine requires real API/backend calls rather than current deterministic/mock engines.

Files that should definitely be reused:

- `plannerTypes.ts`
- `plannerMockGenerator.ts`
- `plannerRouteEngine.ts`
- `plannerBudgetEngine.ts`
- `plannerBudgetInsightEngine.ts`
- `plannerTimelineEngine.ts`
- `plannerJourneyMapEngine.ts`
- `plannerHealthEngine.ts`
- `plannerAlertEngine.ts`
- `plannerCreatorEngine.ts`
- `plannerLocalMarketEngine.ts`
- `plannerBookingEngine.ts`
- `plannerBookingBridge.ts`
- `plannerCheckoutBridge.ts`
- `TiyaItineraryTimeline.tsx`
- `TiyaDynamicItinerary.tsx`
- `TiyaJourneyTimeline.tsx`
- `TiyaJourneyMap.tsx`
- `TiyaBudgetPreview.tsx`
- `TiyaAIInsights.tsx`
- `TiyaOperatingDashboard.tsx`
- `TiyaCreatorPicks.tsx`
- `TiyaLocalMarketPicks.tsx`
- `TiyaBookingIntegration.tsx`
- `TiyaBookingReadyLayer.tsx`

Files that should not be touched first:

- `TiyaRouteIntelligence.tsx`: large and working; risk is high.
- `TiyaPlannerWorkspace.tsx`: very large original workspace; use as reference and source of composition patterns.
- `plannerTypes.ts`: avoid type churn until integration contract is clear.
- `plannerStorage.ts`: stable full planner storage; do not mix new workspace generated data into it without a migration plan.
- `plannerRouteWorkspaceHandoff.ts`: stable route handoff; only extend carefully if needed.

Safe extension points:

- `app/components/ecosystem/planner/workspace/build/BuildItineraryWorkspace.tsx`
- `app/components/ecosystem/planner/workspace/tabs/*`
- `app/components/ecosystem/planner/workspace/utils/workspaceTypes.ts`
- `app/components/ecosystem/planner/workspace/utils/workspaceHelpers.ts`
- A future adapter utility that maps `WorkspacePayload + WorkspacePreferences + SmartBuildPreferences` to `TiyaTripIntent`
- A future route-workspace generated snapshot storage helper, if needed

Cleanest architecture path:

1. Keep `/smart-planner/workspace/page.tsx` as orchestrator.
2. Add a route workspace adapter that converts selected route + workspace preferences + smart build preferences into canonical `TiyaTripIntent`.
3. Generate a canonical `TiyaGeneratedPlan` using existing engines.
4. Store generated plan/day state locally in `BuildItineraryWorkspace` or lift it to page state.
5. Replace lightweight generated/tabs with reused canonical modules:
   - Itinerary: `TiyaDynamicItinerary` / `TiyaItineraryTimeline`
   - Timeline/Map: `TiyaJourneyTimeline`
   - Budget/AI: `TiyaBudgetPreview`, `TiyaAIInsights`, `TiyaOperatingDashboard`
   - Creator/Market: `TiyaCreatorPicks`, `TiyaLocalMarketPicks`
   - Booking: `TiyaBookingIntegration`, `TiyaBookingReadyLayer`
6. Add persistence for generated route workspace only after canonical state is settled.

### Section 8 - Final Recommendation

#### Existing Assets

- Mature mock generation engine: `generateSmartPlannerMock`.
- Canonical plan/day/route/budget/booking/creator/market types.
- Full planner state orchestration in `TiyaPlannerWorkspace`.
- Rich reusable modules for itinerary, budget, AI, creator, market, booking, checkout, review, map and trip health.
- New route workspace shell with clean modular structure.

#### Reusable Assets

- High reuse: itinerary timeline, journey timeline/map, budget preview, AI insights/dashboard, creator picks, local market picks, booking integration, booking ready layer.
- Medium reuse: route intelligence details, planner module accordion pattern, quote/package/checkout modules.
- Low reuse: new workspace placeholder tabs as-is; they are better replaced/composed with canonical modules.

#### Missing Pieces

- Canonical generated plan in new route workspace.
- Adapter from route workspace build wizard to `TiyaTripIntent`.
- Generated journey persistence for new workspace.
- Wiring of existing full planner modules into new workspace tabs.
- Clear route-change invalidation of canonical generated plan once implemented.

#### Recommended Build Order

1. Define new workspace generated state contract using existing `TiyaGeneratedPlan` and `TiyaDayPlan`.
2. Build adapter from `WorkspacePayload` + `WorkspacePreferences` + `SmartBuildPreferences` to `TiyaTripIntent`.
3. Generate plan using `generateSmartPlannerMock` first; only later replace/augment with advanced engine/API.
4. Wire generated itinerary tab to `TiyaDynamicItinerary`.
5. Wire map/timeline to `plannerTimelineEngine` + `plannerJourneyMapEngine` + `TiyaJourneyTimeline`.
6. Wire budget/AI to existing preview/dashboard components.
7. Wire creator/local market tabs to existing pick components.
8. Wire booking tab to booking integration and ready layer.
9. Add persistence for generated route workspace snapshot.
10. Only after stable local architecture, consider API/service-backed advanced engine.

#### Risk Areas

- `TiyaRouteIntelligence.tsx` and `TiyaPlannerWorkspace.tsx` are large; avoid invasive edits.
- New workspace currently uses a different, lighter data model than the original planner.
- Storage keys are split between session route handoff and local full planner snapshots; mixing them casually can create stale or incompatible data.
- Placeholder tabs may create a false sense of completeness.
- Many service files are mock adapters; real backend behavior is not proven from current code.

#### Estimates

- Estimated reuse potential: 75-85%.
- Estimated new code required: 15-25% for a mock/local advanced itinerary integration; 30-40% if real API orchestration and persistence are included.
- Estimated complexity: Medium-high. The source assets are strong, but integration complexity is high because there are two planner workspace architectures: original full studio and new route-handoff workspace.

Final recommendation: build the advanced itinerary engine by reusing the original `TiyaPlannerWorkspace` domain engines and UI modules inside the new modular `/smart-planner/workspace` shell. Do not create another independent itinerary model unless the existing `TiyaGeneratedPlan` and `TiyaDayPlan` are proven insufficient.
