"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Car,
  CloudSun,
  Hotel,
  Info,
  MapPin,
  Route,
  ShieldCheck,
  Sparkles,
  Ticket,
  Zap,
} from "lucide-react";

import TiyaAIInsights from "@/app/components/ecosystem/planner/TiyaAIInsights";
import TiyaBudgetPreview from "@/app/components/ecosystem/planner/TiyaBudgetPreview";
import TiyaDynamicItinerary from "@/app/components/ecosystem/planner/TiyaDynamicItinerary";
import type {
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";

import { transportHint } from "../utils/workspaceHelpers";
import type { WorkspacePreferences } from "../utils/workspaceTypes";
import type {
  WorkspaceBookingBasketItem,
} from "../utils/bookingBasket";

type GeneratedTab = "Itinerary" | "Summary" | "Budget" | "Alerts";

export default function BuildGeneratedSection({
  selectedRoute,
  preferences,
  generatedPlan,
  editableDays,
  sourceIntent,
  onDaysChange,
  bookingBasket,
  setBookingBasket,
}: {
  selectedRoute: TiyaRouteOption;
  preferences: WorkspacePreferences;
  generatedPlan: TiyaGeneratedPlan;
  editableDays: TiyaDayPlan[];
  sourceIntent?: TiyaTripIntent;
  onDaysChange: (days: TiyaDayPlan[]) => void;
  bookingBasket: WorkspaceBookingBasketItem[];
  setBookingBasket: Dispatch<SetStateAction<WorkspaceBookingBasketItem[]>>;
}) {
  const [activeTab] = useState<GeneratedTab>("Itinerary");

  const totalActivities = editableDays.reduce(
    (sum, day) =>
      sum + day.items.filter((item) => item.type === "activity").length,
    0
  );

  const totalTransfers = editableDays.reduce(
    (sum, day) =>
      sum + day.items.filter((item) => item.type === "transport").length,
    0
  );

  const totalStays = editableDays.reduce(
    (sum, day) => sum + day.items.filter((item) => item.type === "stay").length,
    0
  );

  const cities = Array.from(new Set(editableDays.map((day) => day.city))).filter(
    Boolean
  );
  const routeOrigin =
    sourceIntent?.fromCity ||
    generatedPlan.routeTitle.split("→")[0]?.trim() ||
    generatedPlan.routeStops[0]?.city ||
    "Origin";
  const routeDestination =
    sourceIntent?.toCity ||
    generatedPlan.routeTitle.split("→")[1]?.trim() ||
    generatedPlan.routeStops.find((stop) => stop.nights > 0)?.city ||
    cities[cities.length - 1] ||
    "Destination";
  const routePathCities =
    sourceIntent?.tripType === "Multi City"
      ? [routeOrigin, ...(sourceIntent.multiCityStops || [])].filter((city) =>
          city.trim()
        )
      : [routeOrigin, routeDestination].filter((city) => city.trim());
  const transportName = transportHint(selectedRoute);

  const smartAlerts = [
    {
      icon: AlertTriangle,
      title: `${selectedRoute.riskLevel} route risk`,
      detail: selectedRoute.note,
      tone: "orange",
    },
    {
      icon: CloudSun,
      title: "Weather buffer advised",
      detail:
        "Keep flexible windows for inter-city movement, outdoor activities and local transfers.",
      tone: "blue",
    },
    {
      icon: ShieldCheck,
      title: "Permit review before booking",
      detail:
        "Check destination permits, ID rules and route restrictions before final checkout.",
      tone: "emerald",
    },
    ...(selectedRoute.id === "adventure" ||
    transportName.toLowerCase().includes("self-drive")
      ? [
          {
            icon: Zap,
            title: "EV / self-drive charging note",
            detail:
              "Validate fuel or charging halts before locking the drive route.",
            tone: "violet",
          },
        ]
      : []),
    {
      icon: Info,
      title: "Booking readiness note",
      detail:
        "Review itinerary, selected transport, stay, activities and budget before final booking.",
      tone: "slate",
    },
  ];

  const summaryCards: Array<[string, string, typeof Route]> = [
    ["Route", selectedRoute.name, Route],
    ["Stay Style", preferences.stayPreference, Hotel],
    ["Pace", preferences.pace, Sparkles],
    ["Cities", cities.join(", ") || "Route cities", MapPin],
    ["Days", `${editableDays.length}`, CalendarDays],
    ["Transfers", `${totalTransfers}`, Car],
    ["Stays", `${totalStays}`, Hotel],
    ["Activities", `${totalActivities}`, Ticket],
  ];

  return (
    <div className="grid gap-4 p-3 sm:p-4 lg:p-5">
      <div className="overflow-hidden rounded-[1.6rem] border border-slate-200/80 bg-white/95 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
        <div className="flex flex-col gap-3 bg-gradient-to-br from-white via-blue-50/45 to-orange-50/55 p-4 lg:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="flex flex-wrap items-baseline gap-1.5 text-[10px] font-black tracking-[0.16em] text-blue-700">
                <span className="bg-gradient-to-r from-blue-950 via-blue-800 to-blue-600 bg-clip-text font-serif text-[17px] font-black italic tracking-normal text-transparent">
                  Tiya
                </span>
                <span>Travel Intelligence Plan™</span>
              </p>
              <h3 className="mt-2 max-w-3xl text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                One Intelligent Journey
              </h3>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              {[
                ["Booking Ready", "bg-emerald-50 text-emerald-700 border-emerald-100", "bg-emerald-500"],
                ["Editable", "bg-blue-50 text-blue-700 border-blue-100", "bg-blue-500"],
                ["AI Assisted", "bg-violet-50 text-violet-700 border-violet-100", "bg-violet-500"],
              ].map(([badge, tone, dot]) => (
                <span
                  key={badge}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${tone}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="max-w-full overflow-x-auto pb-1 [scrollbar-width:none]">
            <div className="flex min-w-max items-center gap-2 rounded-2xl border border-slate-100 bg-white/82 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_12px_30px_rgba(15,23,42,0.06)]">
              {routePathCities.map((city, index) => {
                const isFirst = index === 0;
                const isLast = index === routePathCities.length - 1;

                return (
                  <div key={`${city}-${index}`} className="group flex min-w-0 items-center gap-2">
                    {index > 0 ? (
                      <span className="relative flex h-5 w-12 items-center sm:w-16">
                        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200" />
                        <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500 shadow-[0_0_14px_rgba(251,146,60,0.55)]" />
                      </span>
                    ) : null}
                    <span className="inline-flex min-w-0 items-center gap-2 rounded-full border border-transparent px-1.5 py-1 transition group-hover:border-orange-100 group-hover:bg-orange-50/70">
                      <span
                        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border shadow-[0_0_18px_rgba(251,146,60,0.16)] ${
                          isFirst
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : isLast
                              ? "border-orange-200 bg-orange-50 text-orange-700"
                              : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${isFirst ? "bg-blue-600" : isLast ? "bg-orange-600" : "bg-slate-500"}`} />
                      </span>
                      <span className="whitespace-nowrap text-sm font-black text-slate-950">
                        {city}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {activeTab === "Itinerary" ? (
        <div className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-[#0B0F1A] shadow-[0_22px_70px_rgba(15,23,42,0.16)]">
          <TiyaDynamicItinerary
            days={editableDays}
            onDaysChange={onDaysChange}
            bookingBasket={bookingBasket}
            setBookingBasket={setBookingBasket}
          />
        </div>
      ) : null}

      {activeTab === "Summary" ? (
        <div className="grid gap-4">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">
              Trip summary
            </p>
            <h3 className="mt-1 text-2xl font-black text-slate-950">
              {routeOrigin} → {routeDestination}
            </h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {summaryCards.map(([label, value, SummaryIcon]) => {
                return (
                  <div
                    key={String(label)}
                    className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white via-blue-50/40 to-orange-50/30 p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-700">
                        <SummaryIcon size={14} />
                      </span>
                      {label}
                    </div>
                    <p className="mt-3 text-base font-black leading-6 text-slate-950">
                      {value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === "Budget" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <TiyaBudgetPreview
            lines={generatedPlan.budgetLines}
            total={generatedPlan.totalBudget}
            budgetRange={preferences.comfortLevel}
          />
          <TiyaAIInsights insights={generatedPlan.insights} />
        </div>
      ) : null}

      {activeTab === "Alerts" ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {smartAlerts.map((alert) => {
            const AlertIcon = alert.icon;

            return (
              <div
                key={alert.title}
                className={`rounded-3xl border bg-white p-4 shadow-sm ${
                  alert.tone === "orange"
                    ? "border-orange-200"
                    : alert.tone === "blue"
                      ? "border-blue-200"
                      : alert.tone === "emerald"
                        ? "border-emerald-200"
                        : alert.tone === "violet"
                          ? "border-violet-200"
                          : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                      alert.tone === "orange"
                        ? "border-orange-100 bg-orange-50 text-orange-700"
                        : alert.tone === "blue"
                          ? "border-blue-100 bg-blue-50 text-blue-700"
                          : alert.tone === "emerald"
                            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                            : alert.tone === "violet"
                              ? "border-violet-100 bg-violet-50 text-violet-700"
                              : "border-slate-100 bg-slate-50 text-slate-700"
                    }`}
                  >
                    <AlertIcon size={18} />
                  </span>

                  <div>
                    <h4 className="text-base font-black text-slate-950">
                      {alert.title}
                    </h4>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                      {alert.detail}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
