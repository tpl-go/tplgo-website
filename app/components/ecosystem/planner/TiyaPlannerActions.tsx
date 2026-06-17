"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Share2,
  X,
} from "lucide-react";
import type {
  TiyaPlannerSnapshot,
  TiyaRouteOption,
  TiyaSmartAlert,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import {
  buildPlannerExport,
  type TiyaItineraryExport,
} from "@/app/lib/ecosystem/planner/plannerExportEngine";
import { savePlannerTrip } from "@/app/lib/ecosystem/planner/plannerStorage";
import { getActiveMyTrip } from "@/app/lib/ecosystem/planner/myTripsStorage";
import { buildPlannerShareText } from "@/app/lib/ecosystem/planner/plannerShareEngine";
import { useAuth } from "@/app/hooks/useAuth";

const REVIEW_DRAFT_KEY = "tpl_tiya_review_draft_v1";
const CHECKOUT_PAYLOAD_KEY = "tpl_tiya_checkout_v1";
const LAST_EXPERT_REQUEST_KEY = "tpl_tiya_last_expert_request";

type TiyaPlannerActionsProps = {
  snapshot: TiyaPlannerSnapshot;
  hasUnsavedChanges: boolean;
  lastSavedAt?: string;
  selectedRoute?: TiyaRouteOption;
  smartAlerts?: TiyaSmartAlert[];
  healthScore?: number;
  readinessScore?: number;
  onSaved: (snapshot: TiyaPlannerSnapshot) => void;
  onActionLog?: (title: string, summary: string) => void;
};

type ToastState = {
  title: string;
  detail: string;
};

type TripPack = {
  itineraryExport: TiyaItineraryExport;
  sections: {
    title: string;
    items: string[];
  }[];
  shareText: string;
};

function formatSavedAt(savedAt?: string) {
  if (!savedAt) return "Not saved yet";

  return new Date(savedAt).toLocaleString("en-IN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  });
}

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function itemTitles(items: Array<{ title?: string; name?: string; serviceName?: string }>) {
  return items
    .map((item) => item.title || item.name || item.serviceName || "")
    .filter(Boolean);
}

function checklistStats(checklist?: Record<string, string[]>) {
  const checked = Object.values(checklist || {}).flat().length;
  return checked ? [`${checked} checklist item${checked === 1 ? "" : "s"} completed`] : ["No packing checklist items completed yet"];
}

function buildTripPack({
  healthScore,
  itineraryExport,
  readinessScore,
  selectedRoute,
  snapshot,
}: {
  healthScore?: number;
  itineraryExport: TiyaItineraryExport;
  readinessScore?: number;
  selectedRoute?: TiyaRouteOption;
  snapshot: TiyaPlannerSnapshot;
}): TripPack {
  const activeTrip = getActiveMyTrip();
  const expertRequest = readJson<{
    leadId?: string;
    status?: string;
    priorityScore?: number;
    contact?: { communicationMode?: string };
    communicationMode?: string;
  }>(LAST_EXPERT_REQUEST_KEY);
  const itinerary = Array.isArray(snapshot.itinerary) ? snapshot.itinerary : [];
  const timelineItems = itinerary.flatMap((day) => day.items || []);
  const stays = timelineItems.filter((item) => item.type === "stay");
  const transports = timelineItems.filter((item) => item.type === "transport");
  const activities = timelineItems.filter((item) => item.type === "activity");
  const localLife = snapshot.plan.localMarketPicks?.filter((item) => item.isHighlighted) || [];
  const creators = snapshot.plan.creatorPicks?.filter(
    (item) => item.isHighlighted || snapshot.selectedCreatorPickIds.includes(item.id)
  ) || [];
  const selectedServices = snapshot.plan.bookingModules?.filter(
    (module) => module.isHighlighted || module.readiness === "Ready"
  ) || [];
  const notes = snapshot.notes;

  const sections = [
    {
      title: "Itinerary export section",
      items: itineraryExport.dayLines.length
        ? itineraryExport.dayLines
        : ["No itinerary days available yet."],
    },
    {
      title: "Selected route and variant",
      items: [
        selectedRoute
          ? `${selectedRoute.name}: ${selectedRoute.distance}, ${selectedRoute.duration}`
          : itineraryExport.routeLine,
        snapshot.selectedRouteId ? `Route variant: ${snapshot.selectedRouteId}` : "Route variant: current active route",
      ],
    },
    {
      title: "Budget summary",
      items: itineraryExport.budgetSummary,
    },
    {
      title: "Selected stay",
      items: itemTitles(stays).length ? itemTitles(stays) : ["No selected stay in itinerary yet."],
    },
    {
      title: "Selected transport",
      items: itemTitles(transports).length ? itemTitles(transports) : [snapshot.intent.transportMode || "Transport pending"],
    },
    {
      title: "Selected activities",
      items: itemTitles(activities).length ? itemTitles(activities) : ["No selected activities yet."],
    },
    {
      title: "Local Life picks",
      items: localLife.length
        ? localLife.map((item) => `${item.productName}: ${item.localRegion}, ${item.priceRange}`)
        : ["No Local Life picks selected yet."],
    },
    {
      title: "Creator bookmarks",
      items: creators.length
        ? creators.map((item) => `${item.creatorName} (${item.handle}) - ${item.specialty}`)
        : activeTrip?.savedItems?.filter((item) => item.type === "Creators").map((item) => item.title) || ["No creator bookmarks yet."],
    },
    {
      title: "Packing checklist",
      items: checklistStats(activeTrip?.checklist),
    },
    {
      title: "Notes",
      items: [
        notes.personal ? `Personal: ${notes.personal}` : "",
        notes.packing ? `Packing: ${notes.packing}` : "",
        notes.localTips ? `Local tips: ${notes.localTips}` : "",
        notes.creatorNotes ? `Creator: ${notes.creatorNotes}` : "",
      ].filter(Boolean).length
        ? [
            notes.personal ? `Personal: ${notes.personal}` : "",
            notes.packing ? `Packing: ${notes.packing}` : "",
            notes.localTips ? `Local tips: ${notes.localTips}` : "",
            notes.creatorNotes ? `Creator: ${notes.creatorNotes}` : "",
          ].filter(Boolean)
        : ["No trip notes added yet."],
    },
    {
      title: "Expert request summary",
      items: expertRequest?.leadId
        ? [
            `Lead: ${expertRequest.leadId}`,
            `Status: ${expertRequest.status || "saved"}`,
            `Contact mode: ${expertRequest.contact?.communicationMode || expertRequest.communicationMode || "not selected"}`,
            `Priority: ${expertRequest.priorityScore || 0}/100`,
          ]
        : ["No expert request saved yet."],
    },
    {
      title: "Trip readiness and health",
      items: [
        `Readiness: ${readinessScore ?? snapshot.readinessScore ?? 0}%`,
        `Health score: ${healthScore ?? snapshot.readinessScore ?? 0}%`,
        selectedServices.length
          ? `Selected services: ${selectedServices.map((item) => item.serviceName).join(", ")}`
          : "Selected services pending",
      ],
    },
  ];

  const shareText = [
    "TPL Smart Planner Trip Pack",
    snapshot.tripName,
    `${snapshot.intent.fromCity} to ${snapshot.intent.toCity}`,
    `${snapshot.intent.startDate} to ${snapshot.intent.endDate}`,
    `${snapshot.plan.travellerCount} travellers`,
    `Route: ${selectedRoute?.name || snapshot.plan.routeTitle}`,
    `Quote: ₹${Number(snapshot.plan.totalBudget || 0).toLocaleString("en-IN")}`,
    `Readiness: ${readinessScore ?? snapshot.readinessScore ?? 0}%`,
    `Health: ${healthScore ?? snapshot.readinessScore ?? 0}%`,
    selectedServices.length
      ? `Selected services: ${selectedServices.map((item) => item.serviceName).join(", ")}`
      : "Selected services: pending",
    "",
    buildPlannerShareText(snapshot),
  ].join("\n");

  return {
    itineraryExport,
    sections,
    shareText,
  };
}

export default function TiyaPlannerActions({
  snapshot,
  hasUnsavedChanges,
  lastSavedAt,
  selectedRoute,
  smartAlerts = [],
  healthScore,
  readinessScore,
  onSaved,
  onActionLog,
}: TiyaPlannerActionsProps) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { isAuthenticated, openLoginModal, user } = useAuth();
  const [pendingAction, setPendingAction] = useState<
    "save" | "share" | "continue" | null
  >(null);
  const itineraryExport = useMemo(
    () => buildPlannerExport(snapshot, selectedRoute, smartAlerts),
    [selectedRoute, smartAlerts, snapshot]
  );
  const tripPack = useMemo(
    () =>
      buildTripPack({
        healthScore,
        itineraryExport,
        readinessScore,
        selectedRoute,
        snapshot,
      }),
    [healthScore, itineraryExport, readinessScore, selectedRoute, snapshot]
  );

  function showToast(nextToast: ToastState) {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 2400);
  }

  function runLoginRequiredAction(action: "save" | "share" | "continue") {
    if (!isAuthenticated || !user) {
      setPendingAction(action);
      openLoginModal({ accountType: "personal", intent: "ai" });
      showToast({
        title: "Login required",
        detail:
          action === "save"
            ? "Login to save this trip to My Trips."
            : action === "share"
              ? "Login to share the complete trip pack."
              : "Login to continue to booking review.",
      });
      return false;
    }

    return true;
  }

  function handleExportPreview() {
    setIsPreviewOpen(true);
    onActionLog?.("Trip exported", "Smart Planner trip pack preview opened.");
  }

  function handleSaveTrip() {
    if (!runLoginRequiredAction("save")) return;
    const savedTrip = savePlannerTrip({
      ...snapshot,
      userId: user?.id,
      owner: {
        id: user?.id || user?.mobile || user?.email || "guest",
        mobile: user?.mobile,
        email: user?.email,
      },
      readinessScore: readinessScore ?? snapshot.readinessScore,
    } as TiyaPlannerSnapshot);
    onSaved(savedTrip);
    onActionLog?.("Trip saved", "Full Smart Planner trip pack saved.");
    showToast({
      title: "Trip saved",
      detail: "Saved to Smart Planner and My Trips where available.",
    });
  }

  async function copyText(text: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  }

  async function handleShareTrip() {
    if (!runLoginRequiredAction("share")) return;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: snapshot.tripName,
          text: tripPack.shareText,
        });
        onActionLog?.("Trip shared", "Full Smart Planner trip pack shared.");
        showToast({
          title: "Trip shared",
          detail: "Share sheet completed successfully.",
        });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }

    const copied = await copyText(tripPack.shareText);
    onActionLog?.("Trip shared", "Full Smart Planner trip pack copied for sharing.");
    showToast({
      title: copied ? "Trip copied" : "Share unavailable",
      detail: copied
        ? "Complete trip summary copied to clipboard."
        : "Clipboard support is unavailable in this browser.",
    });
  }

  function handleContinueToBooking() {
    if (!runLoginRequiredAction("continue")) return;
    const draftPayload = {
      checkoutPayload: {
        source: "smart-planner",
        trip: {
          destination: snapshot.intent.toCity,
          endDate: snapshot.intent.endDate,
          origin: snapshot.intent.fromCity,
          startDate: snapshot.intent.startDate,
          title: snapshot.tripName,
          totalDays: snapshot.itinerary.length,
          travelStyle: snapshot.intent.travelStyle,
          tripType: snapshot.intent.tripType,
        },
        route: {
          activeRouteId: selectedRoute?.id || snapshot.selectedRouteId,
          distance: selectedRoute?.distance,
          duration: selectedRoute?.duration,
          name: selectedRoute?.name || snapshot.plan.routeTitle,
          transportMode: snapshot.intent.transportMode,
        },
        itinerary: snapshot.itinerary,
        budgetEstimate: {
          totalEstimatedCost: snapshot.plan.totalBudget,
        },
        quoteEstimate: {
          estimatedTotal: snapshot.plan.totalBudget,
          totalQuoteEstimate: snapshot.plan.totalBudget,
        },
        plannerAudit: {
          healthScore: healthScore ?? snapshot.readinessScore ?? 0,
          readinessScore: readinessScore ?? snapshot.readinessScore ?? 0,
        },
        fullTripPack: tripPack,
      },
      savedAt: new Date().toISOString(),
      source: "smart-planner",
    };

    window.sessionStorage.setItem(REVIEW_DRAFT_KEY, JSON.stringify(draftPayload));
    window.sessionStorage.setItem(CHECKOUT_PAYLOAD_KEY, JSON.stringify(draftPayload.checkoutPayload));
    onActionLog?.("Proceed to Book", "Smart Planner trip pack sent to review page.");
    window.dispatchEvent(new Event("tpl:proceed-to-book"));
  }

  useEffect(() => {
    if (!pendingAction || !isAuthenticated || !user) return;
    const action = pendingAction;

    window.setTimeout(() => {
      setPendingAction(null);
      if (action === "save") handleSaveTrip();
      if (action === "share") void handleShareTrip();
      if (action === "continue") handleContinueToBooking();
    }, 0);
  }, [pendingAction, isAuthenticated, user]);

  return (
    <>
      <div className="relative rounded-3xl border border-white/80 bg-[#061839]/95 p-4 text-white shadow-[0_22px_70px_rgba(6,24,57,0.22)] backdrop-blur-xl">
        {toast ? (
          <div className="absolute -top-3 left-4 right-4 z-10 rounded-2xl border border-emerald-200/30 bg-emerald-500 px-3 py-2 text-white shadow-lg">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="text-xs font-black">{toast.title}</p>
                <p className="text-[11px] font-semibold text-white/80">
                  {toast.detail}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
          <CheckCircle2 size={16} />
          Workspace trip pack export
        </div>
        <div className="mt-2 rounded-2xl border border-white/10 bg-white/10 p-3 text-xs font-bold leading-5 text-white/70">
          Complete Smart Planner pack: route, itinerary, budget, stays,
          transport, activities, Local Life, creators, packing, notes and
          readiness. Itinerary-only export stays in the separate card above.
        </div>
        <div className="mt-2 rounded-2xl border border-white/10 bg-white/10 p-3 text-xs font-bold leading-5 text-white/70">
          {hasUnsavedChanges ? "Unsaved changes" : "Saved state active"} · Last
          saved {formatSavedAt(lastSavedAt)}
        </div>
        <div className="mt-4 grid gap-2">
          <button
            type="button"
            onClick={handleExportPreview}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-5 py-3 text-sm font-black text-white shadow-[0_12px_28px_rgba(255,123,0,0.32)] transition hover:-translate-y-0.5"
          >
            <FileText size={17} />
            Export Preview
          </button>
          <button
            type="button"
            onClick={handleSaveTrip}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15"
          >
            <Download size={17} />
            Save Trip
          </button>
          <button
            type="button"
            onClick={handleShareTrip}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15"
          >
            <Share2 size={17} />
            Share Trip
          </button>
          <button
            type="button"
            onClick={handleContinueToBooking}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-blue-900 transition hover:bg-cyan-50"
          >
            Proceed to Book
            <ArrowRight size={17} />
          </button>
        </div>
      </div>

      {isPreviewOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 px-3 py-4 backdrop-blur-xl sm:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="mb-3 flex flex-col gap-2 rounded-3xl border border-white/10 bg-white/[0.08] p-3 text-white backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
                  Smart Planner trip pack preview
                </p>
                <h3 className="mt-1 text-lg font-black">
                  Complete workspace export
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <button
                  type="button"
                  onClick={() => void copyText(tripPack.shareText)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black text-white"
                >
                  <Copy size={15} />
                  Copy
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black text-white"
                >
                  <X size={15} />
                  Close
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#071a3b] p-4 text-white shadow-[0_22px_70px_rgba(0,0,0,0.24)] sm:p-6">
              <div className="border-b border-white/10 pb-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
                  Full Smart Planner Trip Pack
                </p>
                <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                  {snapshot.tripName}
                </h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/70">
                  Includes itinerary export content without replacing the
                  existing itinerary export/share flow.
                </p>
              </div>
              <div className="mt-4 grid gap-3">
                {tripPack.sections.map((section) => (
                  <section
                    key={section.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"
                  >
                    <h4 className="text-sm font-black text-white">
                      {section.title}
                    </h4>
                    <div className="mt-3 grid gap-2">
                      {section.items.map((item) => (
                        <p
                          key={`${section.title}-${item}`}
                          className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold leading-5 text-white/72"
                        >
                          {item}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
