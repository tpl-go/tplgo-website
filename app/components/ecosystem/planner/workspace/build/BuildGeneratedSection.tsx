"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Car,
  CheckCircle2,
  CloudSun,
  Hotel,
  Info,
  MapPin,
  Route,
  ShieldCheck,
  Sparkles,
  Ticket,
  WalletCards,
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

const generatedTabs: {
  id: GeneratedTab;
  icon: typeof Route;
}[] = [
  { id: "Itinerary", icon: Route },
  { id: "Budget", icon: WalletCards },
  { id: "Summary", icon: CheckCircle2 },
  { id: "Alerts", icon: Bell },
];

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
  const [activeTab, setActiveTab] = useState<GeneratedTab>("Itinerary");

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

  const summaryCards = [
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
        <div className="flex flex-col gap-4 bg-gradient-to-br from-white via-blue-50/45 to-orange-50/55 p-4 lg:flex-row lg:items-center lg:justify-between lg:p-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">
                Generated itinerary workspace
              </p>
              <span className="rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-orange-700">
                Booking ready
              </span>
            </div>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Generated Itinerary Workspace
            </h3>
            <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2 text-sm font-black text-slate-800">
              <span className="truncate rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-blue-800">
                {routeOrigin}
              </span>
              <span className="text-orange-600">→</span>
              <span className="truncate rounded-full border border-orange-100 bg-white/80 px-3 py-1.5 text-orange-800">
                {routeDestination}
              </span>
            </div>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
              Plan your journey, review budget, select booking items and track alerts.
            </p>
          </div>

          <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] lg:max-w-[620px]">
            <div className="flex min-w-max items-center gap-2 rounded-full border border-white/80 bg-white/75 p-1.5 shadow-[0_12px_34px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              {generatedTabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-xs font-black transition-all duration-300 hover:-translate-y-0.5 ${
                      isActive
                        ? "border-transparent bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] text-white shadow-[0_14px_32px_rgba(255,123,0,0.24)]"
                        : "border-transparent bg-transparent text-slate-600 hover:bg-white hover:text-orange-700"
                    }`}
                  >
                    <TabIcon size={14} />
                    <span>{tab.id}</span>
                  </button>
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
              {summaryCards.map(([label, value, Icon]) => {
                const SummaryIcon = Icon as typeof Route;

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
