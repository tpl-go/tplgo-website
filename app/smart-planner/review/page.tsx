"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BadgeIndianRupee,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CloudSun,
  Route,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { useAuth } from "@/app/hooks/useAuth";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import {
  MY_TRIPS_ACTIVE_TRIP_ID_KEY,
  loadMyTripById,
} from "@/app/lib/ecosystem/planner/myTripsStorage";
import {
  TIYA_CHECKOUT_PAYLOAD_KEY as CHECKOUT_PAYLOAD_KEY,
  TIYA_REVIEW_DRAFT_KEY as REVIEW_DRAFT_KEY,
  TIYA_WORKSPACE_REVIEW_PAYLOAD_KEY,
  type TiyaSmartPlannerReviewPayload,
} from "@/app/lib/ecosystem/planner/plannerReviewPayload";
import {
  routeTiyaSmartBookingBasket,
  type TiyaSmartBasketItem,
} from "@/app/lib/ecosystem/planner/plannerBookingBridge";
import type {
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";

type ReviewPayload = TiyaSmartPlannerReviewPayload;
type ReviewProtectedAction = "save" | "book";

type LocalLifeReviewItem = {
  authenticityBadge?: string;
  isCreatorRecommended?: boolean;
  localRegion?: string;
  priceRange?: string;
  productName?: string;
  routeRelevance?: number;
  specialtyLabel?: string;
};

const EXPERT_REQUEST_KEY = "tpl_tiya_expert_request_v1";
const CHANGE_LOG_KEY = "tpl_tiya_change_log_v1";

function formatCurrency(value?: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function dateLabel(value?: string) {
  if (!value) return "Date pending";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function parseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readInitialReviewPayload() {
  if (typeof window === "undefined") return null;

  const payload =
    parseJson<ReviewPayload>(window.sessionStorage.getItem(CHECKOUT_PAYLOAD_KEY)) ||
    parseJson<ReviewPayload>(
      window.sessionStorage.getItem(TIYA_WORKSPACE_REVIEW_PAYLOAD_KEY)
    ) ||
    parseJson<{ checkoutPayload?: ReviewPayload }>(
      window.sessionStorage.getItem("tpl_tiya_checkout_draft_v1")
    )?.checkoutPayload ||
    parseJson<{ checkoutPayload?: ReviewPayload }>(
      window.sessionStorage.getItem(REVIEW_DRAFT_KEY)
    )?.checkoutPayload ||
    null;
  const activeTrip = loadMyTripById(window.sessionStorage.getItem(MY_TRIPS_ACTIVE_TRIP_ID_KEY));

  return payload
    ? {
        ...payload,
        savedItems: payload.savedItems || activeTrip?.savedItems || [],
      }
    : payload;
}

function flattenChanges(payload?: ReviewPayload | null) {
  const fromPayload = payload?.changeHistory
    ? Object.values(payload.changeHistory).flat()
    : [];
  const fromStorage = typeof window === "undefined"
    ? []
    : parseJson<Array<{ appliedAt?: string; summary?: string; title: string }>>(
        window.sessionStorage.getItem(CHANGE_LOG_KEY)
      ) || [];

  return [...fromPayload, ...fromStorage]
    .filter((change, index, list) => list.findIndex((item) => item.title === change.title && item.appliedAt === change.appliedAt) === index)
    .sort((a, b) => String(b.appliedAt || "").localeCompare(String(a.appliedAt || "")));
}

function asLocalLifeItem(item: unknown): LocalLifeReviewItem {
  return typeof item === "object" && item !== null ? (item as LocalLifeReviewItem) : {};
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

export default function SmartPlannerReviewPage() {
  const { isAuthenticated, openLoginModal, user } = useAuth();
  const [payload] = useState<ReviewPayload | null>(() =>
    readInitialReviewPayload()
  );
  const [openDayId, setOpenDayId] = useState<string>(
    () => readInitialReviewPayload()?.itinerary?.[0]?.id || ""
  );
  const [message, setMessage] = useState("");
  const pendingActionRef = useRef<ReviewProtectedAction | null>(null);

  const changes = useMemo(() => flattenChanges(payload), [payload]);
  const itinerary = payload?.itinerary || [];
  const estimatedTotal =
    payload?.quoteEstimate?.estimatedTotal ||
    payload?.quoteEstimate?.totalQuoteEstimate ||
    payload?.budgetEstimate?.totalEstimatedCost ||
    0;
  const routeStops = [
    payload?.trip.origin,
    ...itinerary.map((day) => day.city),
    payload?.trip.destination,
  ].filter(Boolean).filter((stop, index, list) => index === 0 || stop !== list[index - 1]);
  const readiness = {
    activities: (payload?.selectedActivities?.length || 0) > 0,
    quote: estimatedTotal > 0,
    stay: Boolean((payload?.selectedHotels?.length || 0) + (payload?.selectedHomestays?.length || 0)),
    transport: Boolean(payload?.route?.transportMode || payload?.selectedCabs?.length),
    traveller: Boolean(payload?.travellers?.profilesComplete),
  };
  const serviceCards = [
    ["Flights", payload?.route?.transportMode?.includes("Flight") ? "Ready" : "Recommended", "Origin, destination and dates available."],
    ["Hotels", (payload?.selectedHotels?.length || 0) > 0 ? "Ready" : "Recommended", "Hotel handoff uses destination, check-in and rooms."],
    ["Homestays", (payload?.selectedHomestays?.length || 0) > 0 ? "Ready" : "Optional", "Homestay handoff uses selected stay data when available."],
    ["Cabs", (payload?.selectedCabs?.length || 0) > 0 ? "Ready" : "Recommended", "Route and transfer segments are carried forward."],
    ["Activities", (payload?.selectedActivities?.length || 0) > 0 ? "Ready" : "Recommended", "Planner activities and interests are included."],
    ["Insurance", (payload?.selectedInsurance?.length || 0) > 0 ? "Ready" : "Optional", "Insurance can be added before payment."],
    ["Local Life", (payload?.selectedLocalMarketItems?.length || 0) > 0 ? "Ready" : "Optional", "Local Life picks follow itinerary places."],
  ];

  function requireLogin(action: ReviewProtectedAction) {
    if (isAuthenticated && user) return false;

    pendingActionRef.current = action;
    window.sessionStorage.setItem("tpl_pending_review_action_after_login", action);
    setMessage("Login required to continue this review action.");
    openLoginModal({ accountType: "personal", intent: "ai" });
    return true;
  }

  const performSaveDraft = useCallback(function performSaveDraft() {
    if (!payload) return;
    window.sessionStorage.setItem(REVIEW_DRAFT_KEY, JSON.stringify({
      checkoutPayload: payload,
      savedAt: new Date().toISOString(),
      source: "smart-planner",
    }));
    setMessage("Review draft saved.");
  }, [payload]);

  function saveDraft() {
    if (requireLogin("save")) return;
    performSaveDraft();
  }

  function sendExpert() {
    if (!payload) return;
    window.sessionStorage.setItem(EXPERT_REQUEST_KEY, JSON.stringify({
      budget: payload.budgetEstimate,
      createdAt: new Date().toISOString(),
      expertRequestId: `expert_${Date.now()}`,
      notes: changes,
      route: payload.route,
      selectedServices: payload.selectedServices,
      source: "smart-planner",
      travellers: payload.travellers,
      trip: payload.trip,
    }));
    setMessage("Expert request draft created.");
  }

  const performContinueBooking = useCallback(function performContinueBooking() {
    if (!payload) return;
    if ((payload.selectedBasketItems || []).length < 1) {
      setMessage("No booking basket found in the workspace payload. Add at least one item in Workspace before booking.");
      return;
    }

    window.sessionStorage.setItem(CHECKOUT_PAYLOAD_KEY, JSON.stringify({
      ...payload,
      source: "smart-planner",
      reviewedAt: new Date().toISOString(),
    }));
    const intentForBooking: TiyaTripIntent = {
      adults: payload.travellers?.adults || 1,
      budgetTier: payload.preferences?.budgetTier || "Premium",
      children: payload.travellers?.children || 0,
      customBudgetAmount: "",
      endDate: payload.trip.endDate || "",
      fromCity: payload.trip.origin || "",
      interests: [],
      pace:
        payload.trip.pace === "Relaxed" ||
        payload.trip.pace === "Packed" ||
        payload.trip.pace === "Balanced"
          ? payload.trip.pace
          : "Balanced",
      pets: Boolean(payload.travellers?.pets),
      seniors: payload.travellers?.seniors || 0,
      smartPreferences: {
        avoidNightTravel: false,
        includeCreatorSpots: (payload.selectedCreatorSpots || []).length > 0,
        includeInsurance: (payload.selectedInsurance || []).length > 0,
        includeLocalMarket: (payload.selectedLocalMarketItems || []).length > 0,
        includeStays:
          (payload.selectedHotels || []).length + (payload.selectedHomestays || []).length > 0,
        preferScenicRoute: payload.route?.routeType?.toLowerCase().includes("scenic") || false,
      },
      startDate: payload.trip.startDate || "",
      stayPreference: payload.preferences?.stayPreference || "Hotel",
      toCity: payload.trip.destination || "",
      transportMode: payload.preferences?.transportMode || payload.route?.transportMode || "Mixed",
      travelStyle: payload.trip.travelStyle || "Leisure",
      tripType: payload.trip.tripType || "Custom Trip",
    };
    const basketItems: TiyaSmartBasketItem[] = (payload.selectedBasketItems || []).map((item) => ({
      bookingType: item.serviceType || item.category || "package",
      city: item.city,
      dayLabel: item.dayLabel,
      estimatedPrice:
        item.estimatedTotal || item.estimatedPrice || item.price || 0,
      selectedOption:
        item.selectedOptionName || item.serviceLabel || item.title,
      serviceId: item.id,
      serviceName: item.serviceName || item.title,
      time: item.time,
    }));
    const bookingRoute = routeTiyaSmartBookingBasket({
      intent: intentForBooking,
      items: basketItems,
    });

    window.sessionStorage.setItem(
      "tpl_tiya_booking_route_result_v1",
      JSON.stringify(bookingRoute)
    );
    setMessage("Booking handoff prepared.");
    window.setTimeout(() => {
      window.location.href = bookingRoute.route;
    }, 250);
  }, [payload]);

  function continueBooking() {
    if (requireLogin("book")) return;
    performContinueBooking();
  }

  useEffect(() => {
    if (!pendingActionRef.current || !isAuthenticated || !user) return;
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    window.setTimeout(() => {
      if (action === "save") {
        performSaveDraft();
        return;
      }
      performContinueBooking();
    }, 0);
  }, [isAuthenticated, performContinueBooking, performSaveDraft, user]);

  useEffect(() => {
    function resumeReviewAction() {
      const action = window.sessionStorage.getItem(
        "tpl_pending_review_action_after_login"
      ) as ReviewProtectedAction | null;
      if (!action) return;
      window.sessionStorage.removeItem("tpl_pending_review_action_after_login");
      pendingActionRef.current = action;
      if (isAuthenticated && user) {
        pendingActionRef.current = null;
        window.setTimeout(() => {
          if (action === "save") {
            performSaveDraft();
            return;
          }
          performContinueBooking();
        }, 0);
      }
    }

    window.addEventListener(AUTH_UPDATED_EVENT, resumeReviewAction);

    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, resumeReviewAction);
    };
  }, [isAuthenticated, performContinueBooking, performSaveDraft, user]);

  if (!payload) {
    return (
      <main className="min-h-screen bg-[#07111F] px-5 py-8 text-white">
        <section className="mx-auto flex min-h-[520px] max-w-3xl items-center justify-center rounded-[2rem] border border-white/12 bg-[#0D1B2F] p-6 text-center">
          <div>
            <h1 className="text-3xl font-black">No trip ready for review</h1>
            <p className="mt-3 text-sm font-semibold text-white/65">
              Complete planning in Smart Planner Workspace before opening Review Trip Plan.
            </p>
            <Link href="/smart-planner/workspace" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-orange-500 px-6 text-sm font-black text-white">
              Back To Planner
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07111F] px-4 py-6 text-white sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-5">
          <section className="overflow-hidden rounded-[2rem] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_32%),linear-gradient(135deg,#102742,#0D1E35)] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-300/25 bg-orange-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-orange-100">
                  <Sparkles size={14} />
                  Review Trip Plan
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-normal sm:text-5xl">
                  {payload.trip.title || `${payload.trip.origin} to ${payload.trip.destination}`}
                </h1>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard label="Origin" value={payload.trip.origin || "Pending"} />
                  <StatCard label="Destination" value={payload.trip.destination || "Pending"} />
                  <StatCard label="Dates" value={`${dateLabel(payload.trip.startDate)} - ${dateLabel(payload.trip.endDate)}`} />
                  <StatCard label="Travellers" value={`${payload.travellers?.total || 0}`} />
                </div>
                <div className="mt-4 rounded-3xl border border-orange-300/18 bg-orange-400/10 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
                    Estimated Budget
                  </p>
                  <p className="mt-1 text-4xl font-black text-white">{formatCurrency(estimatedTotal)}</p>
                </div>
              </div>
              <div className="grid gap-3">
                <StatCard label="Trip Health" value={readiness.transport && readiness.quote ? "Good" : "Needs Review"} />
                <StatCard label="Budget Health" value={estimatedTotal > 0 ? "Estimate Ready" : "Missing"} />
                <StatCard label="Readiness Score" value={`${Object.values(readiness).filter(Boolean).length}/5 Ready`} />
                <StatCard label="Risk Level" value={changes.some((change) => change.title.toLowerCase().includes("risk")) ? "Reviewed" : "Standard"} />
                <StatCard label="Health Score" value={`${payload.plannerAudit?.healthScore || 0}%`} />
                <StatCard label="Booking Confidence" value={`${payload.plannerAudit?.bookingConfidenceScore || 0}%`} />
                <StatCard label="Final Verdict" value={payload.plannerAudit?.finalVerdict || "Needs Review"} />
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-cyan-300/12 bg-[#0D1B2F] p-5">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <Route size={15} />
              Final Journey Overview
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
                {routeStops.map((stop, index) => (
                  <div key={`${stop}-${index}`} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="h-3 w-3 rounded-full bg-orange-400" />
                      {index < routeStops.length - 1 ? <span className="h-8 w-px bg-cyan-200/30" /> : null}
                    </div>
                    <p className="pb-4 text-sm font-black text-white">{stop}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <StatCard label="Distance" value={payload.route?.distance || "Available after live route check"} />
                <StatCard label="Travel Time" value={payload.route?.duration || "Planner estimate"} />
                <StatCard label="Transport Type" value={payload.route?.transportMode || "Pending"} />
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-cyan-300/12 bg-[#0D1B2F] p-5">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <CalendarDays size={15} />
              Final Itinerary
            </div>
            <div className="mt-4 grid gap-3">
              {itinerary.map((day) => {
                const open = openDayId === day.id;
                return (
                  <article key={day.id} className="rounded-3xl border border-white/10 bg-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => setOpenDayId(open ? "" : day.id)}
                      className="flex w-full items-center justify-between gap-3 p-4 text-left"
                    >
                      <span>
                        <span className="block text-sm font-black text-white">Day {String(day.day).padStart(2, "0")} · {day.city}</span>
                        <span className="mt-1 block text-xs font-semibold text-white/55">{day.headline}</span>
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black text-cyan-100">
                        {open ? "Close" : "Open"}
                      </span>
                    </button>
                    {open ? (
                      <div className="grid gap-2 border-t border-white/10 p-4">
                        {(day.items || []).map((item) => (
                          <div key={item.id} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                            <p className="text-sm font-black text-white">{item.time} · {item.title}</p>
                            <p className="mt-1 text-xs font-semibold leading-5 text-white/62">
                              {item.type} · {item.location} · {item.description || item.detailSummary || "Planner item"}
                            </p>
                          </div>
                        ))}
                        <p className="rounded-2xl border border-cyan-300/12 bg-cyan-300/10 p-3 text-xs font-semibold text-cyan-50/80">
                          Planner Notes: {day.notes || "No additional notes added."}
                        </p>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Weather", `${(payload.changeHistory?.weatherAdjustments || []).length} adjustments`, "Weather score ready"],
              ["Risk", `${(payload.changeHistory?.riskFixes || []).length} fixes`, "Pass / Warning / Critical tracked"],
              ["Optimization", `${(payload.changeHistory?.costOptimizationChanges || []).length} applied`, "Savings carried to review"],
              ["Route", payload.route?.name || "Selected route", payload.route?.routeType || "Variant ready"],
              ["Health", `${payload.plannerAudit?.healthScore || 0}%`, payload.plannerAudit?.finalVerdict || "Final audit pending"],
              ["Readiness", `${payload.plannerAudit?.readinessScore || 0}%`, "Booking confidence included"],
            ].map(([title, value, detail]) => (
              <button key={title} type="button" className="rounded-3xl border border-white/10 bg-[#0D1B2F] p-4 text-left transition hover:border-orange-300/30 hover:bg-[#12243D]">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">{title}</p>
                <p className="mt-2 text-lg font-black text-white">{value}</p>
                <p className="mt-1 text-xs font-semibold text-white/55">{detail}</p>
              </button>
            ))}
          </section>

          <section className="rounded-[2rem] border border-cyan-300/12 bg-[#0D1B2F] p-5">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <BriefcaseBusiness size={15} />
              Booking Bundle Summary
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {serviceCards.map(([title, status, detail]) => (
                <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-sm font-black text-white">{title}</p>
                  <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black ${status === "Ready" ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100" : status === "Missing" ? "border-red-300/20 bg-red-400/10 text-red-100" : "border-orange-300/20 bg-orange-400/10 text-orange-100"}`}>
                    {status}
                  </span>
                  <p className="mt-2 text-xs font-semibold leading-5 text-white/58">{detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-cyan-300/12 bg-[#0D1B2F] p-5">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <Sparkles size={15} />
              Local Life
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {(payload.selectedLocalMarketItems || []).length ? (
                (payload.selectedLocalMarketItems || []).map((item, index) => {
                  const localLifeItem = asLocalLifeItem(item);
                  return (
                    <div key={`${localLifeItem.productName || "local-life"}-${index}`} className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
                      <p className="text-sm font-black text-white">
                        {localLifeItem.productName || "Selected Local Life item"}
                      </p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-white/58">
                        {localLifeItem.localRegion || payload.trip.destination || "Destination"} · {localLifeItem.priceRange || "Spend estimate pending"}
                      </p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        <StatCard label="Route Fit" value={`${localLifeItem.routeRelevance || 0}%`} />
                        <StatCard label="Commerce" value={localLifeItem.authenticityBadge || "Seller verified"} />
                        <StatCard label="Creator" value={localLifeItem.isCreatorRecommended ? "High" : "Optional"} />
                      </div>
                      <p className="mt-3 rounded-2xl border border-cyan-300/12 bg-cyan-300/10 p-3 text-xs font-semibold leading-5 text-cyan-50/78">
                        {localLifeItem.specialtyLabel || "Creator-friendly local culture, food, products and experiences carried to review."}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 text-sm font-semibold leading-6 text-white/58">
                  No Local Life item selected yet. The legacy local commerce payload remains available when picks are added.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-cyan-300/12 bg-[#0D1B2F] p-5">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <BriefcaseBusiness size={15} />
              Saved Items
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/58">
              Saved bookmarks stay separate from selected itinerary and checkout items.
            </p>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {(payload.savedItems || []).length ? (
                (payload.savedItems || []).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                    <p className="text-sm font-black text-white">{item.title}</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-white/58">
                      {[item.type, item.city || item.destination, item.day ? `Day ${item.day}` : "", item.sourceModule].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-sm font-semibold text-white/58">
                  No saved bookmarks attached to this active trip.
                </p>
              )}
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-cyan-300/12 bg-[#0D1B2F] p-5">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                <Users size={15} />
                Traveller Summary
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <StatCard label="Adults" value={`${payload.travellers?.adults || 0}`} />
                <StatCard label="Children" value={`${payload.travellers?.children || 0}`} />
                <StatCard label="Rooms" value={`${payload.travellers?.rooms || 0}`} />
              </div>
              <p className={`mt-3 rounded-2xl border p-3 text-sm font-black ${payload.travellers?.profilesComplete ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100" : "border-orange-300/20 bg-orange-400/10 text-orange-100"}`}>
                {payload.travellers?.profilesComplete ? "Traveller details complete" : "Traveller names, age and gender pending before live booking"}
              </p>
            </div>

            <div className="rounded-[2rem] border border-orange-300/18 bg-[linear-gradient(180deg,#173455,#132D49)] p-5">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
                <BadgeIndianRupee size={15} />
                Budget Summary
              </div>
              <div className="mt-4 grid gap-2">
                {[
                  ["Transport", payload.budgetEstimate?.transport],
                  ["Stay", payload.budgetEstimate?.stay],
                  ["Activities", payload.budgetEstimate?.activity],
                  ["Insurance", payload.budgetEstimate?.insurance],
                  ["Local Life", payload.budgetEstimate?.localMarket],
                  ["Taxes Placeholder", payload.budgetEstimate?.taxesPlaceholder],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2">
                    <span className="text-xs font-bold text-white/58">{label}</span>
                    <span className="text-sm font-black text-white">{formatCurrency(Number(value || 0))}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">Estimated Total</p>
              <p className="mt-1 text-4xl font-black text-white">{formatCurrency(estimatedTotal)}</p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-cyan-300/12 bg-[#0D1B2F] p-5">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <CloudSun size={15} />
              Change History
            </div>
            <div className="mt-4 grid gap-3">
              {changes.length ? changes.map((change, index) => (
                <div key={`${change.title}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                  <p className="text-sm font-black text-white">{change.title}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-white/58">{change.summary || "Planner change applied."}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/35">{change.appliedAt ? new Date(change.appliedAt).toLocaleString() : "Current session"}</p>
                </div>
              )) : (
                <p className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-sm font-semibold text-white/58">
                  No route, weather, risk, budget or activity changes logged yet.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-cyan-300/12 bg-[#0D1B2F] p-5">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <ShieldCheck size={15} />
              Checkout Readiness Summary
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["Traveller Ready", readiness.traveller],
                ["Stay Ready", readiness.stay],
                ["Transport Ready", readiness.transport],
                ["Activities Ready", readiness.activities],
                ["Quote Ready", readiness.quote],
              ].map(([label, ready]) => (
                <div key={label as string} className={`rounded-2xl border p-3 ${ready ? "border-emerald-300/20 bg-emerald-400/10" : "border-orange-300/20 bg-orange-400/10"}`}>
                  <CheckCircle2 size={16} className={ready ? "text-emerald-100" : "text-orange-100"} />
                  <p className="mt-2 text-xs font-black text-white">{label}</p>
                  <p className="mt-1 text-[11px] font-bold text-white/55">{ready ? "Ready" : "Needs Review"}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-[#0D1B2F] p-5">
            {message ? (
              <p className="mb-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm font-black text-emerald-100">
                {message}
              </p>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link href="/smart-planner/workspace" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/10 px-5 text-sm font-black text-white transition hover:bg-white/15">
                <ArrowLeft size={15} />
                Back To Planner
              </Link>
              <button type="button" onClick={saveDraft} className="min-h-12 rounded-full border border-white/12 bg-white/10 px-5 text-sm font-black text-white transition hover:bg-white/15">
                Save Draft
              </button>
              <button type="button" onClick={sendExpert} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/10 px-5 text-sm font-black text-white transition hover:bg-white/15">
                <Send size={15} />
                Send To Expert
              </button>
              <button type="button" onClick={continueBooking} className="min-h-12 rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-5 text-sm font-black text-white shadow-[0_18px_38px_rgba(255,123,0,0.30)] transition hover:-translate-y-0.5">
                Proceed to Book
              </button>
            </div>
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-6 rounded-[2rem] border border-white/12 bg-[#0D1B2F]/95 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.28)]">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              Trip Summary
            </p>
            <div className="mt-4 grid gap-3">
              <StatCard label="Trip Health" value={readiness.transport && readiness.quote ? "Good" : "Needs Review"} />
              <StatCard label="Budget Health" value="Estimate Ready" />
              <StatCard label="Readiness Score" value={`${Object.values(readiness).filter(Boolean).length}/5`} />
              <StatCard label="Estimated Total" value={formatCurrency(estimatedTotal)} />
            </div>
            <button type="button" onClick={continueBooking} className="mt-5 min-h-12 w-full rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-5 text-sm font-black text-white shadow-[0_18px_38px_rgba(255,123,0,0.30)]">
              Proceed to Book
            </button>
          </div>
        </aside>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#07111F]/92 p-3 backdrop-blur lg:hidden">
        <button type="button" onClick={continueBooking} className="min-h-12 w-full rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] text-sm font-black text-white">
          Proceed to Book
        </button>
      </div>
    </main>
  );
}
