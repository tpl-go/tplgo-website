"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  Edit3,
  Printer,
  Save,
  Send,
} from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import {
  generateExpertLeadPayload,
  saveExpertLeadPayload,
  type TiyaExpertLeadPayload,
} from "@/app/lib/ecosystem/planner/plannerExpertLeadEngine";
import {
  MY_TRIPS_ACTIVE_TRIP_ID_KEY,
  loadMyTripById,
  saveMyTrip,
} from "@/app/lib/ecosystem/planner/myTripsStorage";
import {
  confirmTripReview,
  generateReviewChecklist,
  generateTripReviewSnapshot,
  saveTripReview,
  TIYA_CONFIRMED_PLAN_KEY,
  TIYA_TRIP_REVIEW_KEY,
} from "@/app/lib/ecosystem/planner/plannerReviewEngine";
import type {
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaAIRecommendationChangeLog,
  TiyaRouteOption,
  TiyaSmartAlert,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import TiyaReviewChecklist from "./TiyaReviewChecklist";
import TiyaReviewScore from "./TiyaReviewScore";

type TiyaTripReviewProps = {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  days: TiyaDayPlan[];
  selectedRoute?: TiyaRouteOption;
  selectedScenarioId?: string;
  selectedVariantId?: string;
  smartAlerts?: TiyaSmartAlert[];
  recommendationChangeLog?: TiyaAIRecommendationChangeLog[];
  isGenerating?: boolean;
  onAction?: (action: string) => void;
  onConfirmReview?: (summary: string) => void;
  onEditShortcut?: (shortcut: string) => void;
  onExpertReviewRequested?: (payload: TiyaExpertLeadPayload) => void;
  onSaveReview?: (
    reviewSnapshot: ReturnType<typeof generateTripReviewSnapshot>
  ) => string | void;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[char] || char
  );
}

export default function TiyaTripReview({
  intent,
  plan,
  days,
  selectedRoute,
  selectedScenarioId,
  selectedVariantId,
  smartAlerts = [],
  recommendationChangeLog = [],
  isGenerating = false,
  onConfirmReview,
  onEditShortcut,
  onExpertReviewRequested,
  onSaveReview,
}: TiyaTripReviewProps) {
  const { isAuthenticated, openLoginModal, user } = useAuth();
  const [statusMessage, setStatusMessage] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.localStorage.getItem(TIYA_CONFIRMED_PLAN_KEY));
  });
  const [pendingContinue, setPendingContinue] = useState(false);
  const snapshot = useMemo(
    () =>
      generateTripReviewSnapshot({
        intent,
        plan,
        days,
        selectedRoute,
        selectedScenarioId,
        selectedVariantId,
        smartAlerts,
      }),
    [
      days,
      intent,
      plan,
      selectedRoute,
      selectedScenarioId,
      selectedVariantId,
      smartAlerts,
    ]
  );
  const checklist = useMemo(() => {
    const baseChecklist = generateReviewChecklist({ intent, plan, selectedRoute });
    return isConfirmed
      ? baseChecklist.map((item) =>
          item.id === "quote"
            ? { ...item, detail: `${item.detail} Plan confirmed.` }
            : item
        )
      : baseChecklist;
  }, [intent, isConfirmed, plan, selectedRoute]);
  const editShortcuts = [
    "Edit route",
    "Edit dates",
    "Edit travellers",
    "Edit stays",
    "Edit budget",
    "Edit activities",
    "Edit bundle",
  ];
  const reviewBlocks = [
    ["Trip intent", `${intent.travelStyle} · ${intent.pace} · ${intent.tripType}`],
    [
      "Selected route/scenario",
      `${snapshot.selectedRoute}${
        snapshot.selectedScenario ? ` · ${snapshot.selectedScenario}` : ""
      }`,
    ],
    ["Selected variant", snapshot.selectedVariant || "Base plan"],
    ["Itinerary summary", snapshot.itinerarySummary],
    ["Travel intelligence", snapshot.travelIntelligence],
    ["Selected bundle", snapshot.selectedBundle],
    ["Quote estimate", `₹${snapshot.quoteEstimate.toLocaleString("en-IN")}`],
    ["Booking readiness", snapshot.bookingReadiness],
    ["Expert review status", snapshot.expertReviewStatus],
  ];

  function handleSaveReview() {
    saveTripReview(snapshot);
    const callbackMessage = onSaveReview?.(snapshot);
    setStatusMessage(callbackMessage || "Trip review saved");
  }

  function handleConfirmPlan() {
    if (!selectedRoute || !days.length || snapshot.quoteEstimate <= 0) {
      setStatusMessage("Route, itinerary and quote are required before confirmation.");
      return;
    }

    confirmTripReview(snapshot);
    setIsConfirmed(true);
    onConfirmReview?.(
      `Confirmed ${snapshot.selectedRoute} with ${snapshot.itinerarySummary}.`
    );
    setStatusMessage("Trip plan confirmed");
  }

  function handlePrintReview() {
    const dayLines = days
      .map((day) => {
        const items = (day.items || [])
          .map((item) => `${item.time} ${item.title}`)
          .join("; ");
        return `Day ${day.day}: ${day.city} - ${day.headline}${items ? ` (${items})` : ""}`;
      })
      .join("\n");
    const checklistLines = checklist
      .map((item) => `${item.checked ? "[x]" : "[ ]"} ${item.label}: ${item.detail}`)
      .join("\n");
    const printable = [
      "TPL Smart Planner Trip Review",
      snapshot.route,
      `${intent.startDate} to ${intent.endDate}`,
      `${plan.travellerCount} travellers`,
      "",
      "Itinerary",
      dayLines || "No itinerary days available.",
      "",
      "Selected services",
      snapshot.selectedBundle,
      snapshot.bookingReadiness,
      ...(plan.bookingModules || []).map(
        (module) => `${module.serviceName}: ${module.readiness}`
      ),
      `Quote: ₹${snapshot.quoteEstimate.toLocaleString("en-IN")}`,
      "",
      "Checklist",
      checklistLines,
      "",
      "Warnings",
      snapshot.rulesWarnings.join("\n") || "No critical warnings.",
      "",
      "Creator picks",
      snapshot.creatorPicks.join(", ") || "None",
      "",
      "Local Life picks",
      snapshot.localMarketPicks.join(", ") || "None",
      "",
      `Review score: ${snapshot.scores.tripQualityScore}%`,
    ].join("\n");
    const popup = window.open("", "_blank", "noopener,noreferrer,width=820,height=900");

    if (!popup) {
      setStatusMessage(printable);
      return;
    }

    popup.document.write(`
      <html>
        <head>
          <title>TPL Trip Review</title>
          <style>
            body { font-family: Arial, sans-serif; color: #0f172a; padding: 32px; line-height: 1.55; }
            h1 { margin: 0 0 12px; font-size: 26px; }
            pre { white-space: pre-wrap; border: 1px solid #dbeafe; border-radius: 18px; padding: 18px; background: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>TPL Smart Planner Trip Review</h1>
          <pre>${escapeHtml(printable)}</pre>
          <script>window.print();</script>
        </body>
      </html>
    `);
    popup.document.close();
    setStatusMessage("Printable review opened");
  }

  function attachExpertRequestToActiveTrip(payload: TiyaExpertLeadPayload) {
    if (typeof window === "undefined") return;
    const activeTrip = loadMyTripById(
      window.sessionStorage.getItem(MY_TRIPS_ACTIVE_TRIP_ID_KEY)
    );
    if (!activeTrip) return;

    saveMyTrip({
      ...activeTrip,
      expertRequests: [
        payload,
        ...(activeTrip.expertRequests || []).filter(
          (request) => request.leadId !== payload.leadId
        ),
      ].slice(0, 10),
      updatedAt: new Date().toISOString(),
    });
  }

  function handleExpertReviewRequest() {
    const contact = {
      name:
        user?.fullName ||
        [user?.leadTraveller?.firstName, user?.leadTraveller?.lastName]
          .filter(Boolean)
          .join(" ") ||
        "",
      mobile: user?.leadTraveller?.phone || user?.mobile || "",
      email: user?.leadTraveller?.email || user?.email || "",
      preferredContactTime: "",
      communicationMode: "Call" as const,
      specialRequest: `Expert review requested from Trip Review. ${snapshot.itinerarySummary}.`,
    };
    const payload = generateExpertLeadPayload({
      intent,
      plan,
      selectedRoute,
      contact,
    });

    saveExpertLeadPayload(payload);
    attachExpertRequestToActiveTrip(payload);
    onExpertReviewRequested?.(payload);
    setStatusMessage("Expert review requested");
  }

  function handleContinueToBooking() {
    if (!isConfirmed) {
      setStatusMessage("Confirm Trip Plan before proceeding to book.");
      return;
    }

    if (!isAuthenticated || !user) {
      setPendingContinue(true);
      openLoginModal({ accountType: "personal", intent: "ai" });
      setStatusMessage("Login required to proceed to book.");
      return;
    }

    window.sessionStorage.setItem(
      "tpl_tiya_review_booking_from_trip_review",
      JSON.stringify({
        review: snapshot,
        source: "trip-review",
        savedAt: new Date().toISOString(),
      })
    );
    window.dispatchEvent(new Event("tpl:proceed-to-book"));
  }

  useEffect(() => {
    if (!pendingContinue || !isAuthenticated || !user) return;
    const timer = window.setTimeout(() => {
      setPendingContinue(false);
      handleContinueToBooking();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [pendingContinue, isAuthenticated, user]);

  return (
    <section className="w-full max-w-full min-w-0 overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(14,165,233,0.22),transparent_28%),radial-gradient(circle_at_90%_14%,rgba(249,115,22,0.2),transparent_25%)]" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <ClipboardCheck
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              AI trip review page
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Final Tiya trip review
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Final frontend review of route, itinerary, quote, bundle,
              booking readiness, creator/Local Life add-ons and expert status.
            </p>
          </div>
          <div className="break-words rounded-3xl border border-orange-300/20 bg-orange-400/10 p-3 text-xs font-black text-orange-100">
            Quality {snapshot.scores.tripQualityScore}% · {isConfirmed ? "Confirmed" : "Review ready"}
          </div>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 p-3 sm:p-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]">
        <div className="grid min-w-0 gap-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              Complete review
            </div>
            <div className="mt-3 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 2xl:grid-cols-3">
              {reviewBlocks.map(([label, value]) => (
                <div
                  key={label}
                  className="min-w-0 rounded-2xl border border-white/10 bg-white/10 p-3"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                    {label}
                  </p>
                  <p className="mt-1 line-clamp-2 break-words text-xs font-black text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                Seasonal/weather notes
              </div>
              <div className="mt-3 grid gap-2">
                {(snapshot.seasonalWeatherNotes.length
                  ? snapshot.seasonalWeatherNotes
                  : ["Seasonal simulation is within normal range."]
                ).map((note) => (
                  <p
                    key={note}
                    className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-xs font-semibold leading-5 text-cyan-50"
                  >
                    {note}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                Rules and warnings
              </div>
              <div className="mt-3 grid gap-2">
                {(snapshot.rulesWarnings.length
                  ? snapshot.rulesWarnings
                  : ["No critical warnings in final review."]
                ).map((warning) => (
                  <p
                    key={warning}
                    className="rounded-2xl border border-orange-300/20 bg-orange-400/10 p-3 text-xs font-semibold leading-5 text-orange-50"
                  >
                    {warning}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                Creator picks
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(snapshot.creatorPicks.length
                  ? snapshot.creatorPicks
                  : ["No creator pick selected"]
                ).map((pick) => (
                  <span
                    key={pick}
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white"
                  >
                    {pick}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                Local Life picks
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(snapshot.localMarketPicks.length
                  ? snapshot.localMarketPicks
                  : ["No Local Life pick selected"]
                ).map((pick) => (
                  <span
                    key={pick}
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white"
                  >
                    {pick}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              Applied AI recommendations
            </div>
            <div className="mt-3 grid gap-2">
              {recommendationChangeLog.length ? (
                recommendationChangeLog.map((change) => (
                  <div
                    key={change.id}
                    className="rounded-2xl border border-white/10 bg-white/10 p-3"
                  >
                    <p className="text-sm font-black text-white">
                      {change.summary}
                    </p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-white/60">
                      Reason: {change.reason}
                    </p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-white/60">
                      Impact: {change.impact}
                    </p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/35">
                      {new Date(change.appliedAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-white/10 bg-white/10 p-3 text-xs font-semibold text-white/58">
                  No AI recommendation has been applied yet.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <Edit3 size={15} />
              Edit shortcuts
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {editShortcuts.map((shortcut) => (
                <button
                  key={shortcut}
                  type="button"
                  onClick={() => {
                    onEditShortcut?.(shortcut);
                    setStatusMessage(`${shortcut} shortcut selected`);
                  }}
                  className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:border-orange-300/30 hover:bg-orange-400/15"
                >
                  {shortcut}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="grid h-fit min-w-0 gap-3">
          <TiyaReviewScore scores={snapshot.scores} />
          <TiyaReviewChecklist items={checklist} />
          <div className="grid gap-2 rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <button
              type="button"
              onClick={handleConfirmPlan}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-black text-white shadow-[0_12px_32px_rgba(249,115,22,0.28)] transition ${
                isConfirmed
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              <CheckCircle2 size={15} />
              {isConfirmed ? "Confirmed" : "Confirm Trip Plan"}
            </button>
            <button
              type="button"
              onClick={handleExpertReviewRequest}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/15"
            >
              <Send size={15} />
              Request Expert Review
            </button>
            <button
              type="button"
              onClick={handleContinueToBooking}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/15"
            >
              <Send size={15} />
              Proceed to Book
            </button>
            <button
              type="button"
              onClick={handleSaveReview}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/15"
            >
              <Save size={15} />
              Save Review
            </button>
            <button
              type="button"
              onClick={handlePrintReview}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/15"
            >
              <Printer size={15} />
              Print Review
            </button>
            {statusMessage ? (
              <p className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-center text-xs font-black text-emerald-100">
                {statusMessage}
              </p>
            ) : null}
          </div>
          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-xs font-semibold leading-5 text-cyan-50">
            Storage keys: {TIYA_TRIP_REVIEW_KEY}, {TIYA_CONFIRMED_PLAN_KEY}
          </div>
        </aside>
      </div>
    </section>
  );
}
