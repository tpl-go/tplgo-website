"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BadgeIndianRupee,
  Bot,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  CloudSun,
  Route,
  Send,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  companionPrompts,
  generateCompanionResponse,
  generateCompanionSuggestions,
  generateInitialCompanionMessages,
  type TiyaCompanionMessage,
  type TiyaCompanionMode,
} from "@/app/lib/ecosystem/planner/plannerCompanionEngine";
import type {
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";

export type TiyaCoPilotActionId =
  | "reduce-fatigue"
  | "optimize-budget"
  | "safe-window"
  | "add-local-life"
  | "add-creator"
  | "booking-ready"
  | "weather-buffer";

export type TiyaCoPilotImpact = {
  comfort: number;
  budget: number;
  risk: number;
  weather: number;
  experience: number;
  localLife: number;
  creator: number;
};

export type TiyaCoPilotAction = {
  id: TiyaCoPilotActionId;
  title: string;
  detail: string;
  source: string;
  affectedModule: string;
  affectedDay: string;
  impact: TiyaCoPilotImpact;
};

type TiyaTravelCompanionProps = {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  selectedRoute?: TiyaRouteOption;
  isGenerating?: boolean;
  appliedActionIds?: string[];
  onCoPilotAction?: (action: TiyaCoPilotAction) => void;
};

const priorityTone = {
  Info: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
  Smart: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
  Important: "border-orange-300/20 bg-orange-400/10 text-orange-100",
};

function formatMoney(value: number) {
  const prefix = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${prefix}₹${Math.abs(value).toLocaleString("en-IN")}`;
}

function buildCoPilotActions({
  intent,
  plan,
  selectedRoute,
}: {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  selectedRoute?: TiyaRouteOption;
}): TiyaCoPilotAction[] {
  const hasCreator = Array.isArray(plan.creatorPicks) && plan.creatorPicks.length > 0;
  const hasLocalLife =
    Array.isArray(plan.localMarketPicks) && plan.localMarketPicks.length > 0;
  const budgetPressure =
    intent.budgetTier === "Economy" ||
    plan.budgetLines.some((line) => line.amount > plan.totalBudget * 0.38);
  const riskPressure =
    selectedRoute?.riskLevel === "High" || intent.smartPreferences.avoidNightTravel;

  return [
    {
      id: "reduce-fatigue",
      title: "Add recovery window",
      detail: "Insert a lighter evening after the highest transfer pressure point.",
      source: "Route + Trip Health",
      affectedModule: "Journey Timeline",
      affectedDay: "Day 2 evening",
      impact: { comfort: 14, budget: 0, risk: -6, weather: 2, experience: 4, localLife: 0, creator: 0 },
    },
    {
      id: "optimize-budget",
      title: "Apply budget guardrail",
      detail: budgetPressure
        ? "Reduce cost pressure with tighter local transfers and one value cluster."
        : "Keep budget healthy by locking current cost guardrails.",
      source: "Budget + Cost Optimization",
      affectedModule: "Budget Overview",
      affectedDay: "Trip-wide",
      impact: { comfort: -2, budget: -2400, risk: 0, weather: 0, experience: -1, localLife: 0, creator: 0 },
    },
    {
      id: "safe-window",
      title: "Shift to safer daylight movement",
      detail: riskPressure
        ? "Move risky transfer logic into a daylight-safe window."
        : "Protect daylight windows for the most important movement segment.",
      source: "Risk + Route",
      affectedModule: "Route Risk Analysis",
      affectedDay: "Longest travel day",
      impact: { comfort: 6, budget: 0, risk: -14, weather: 4, experience: 0, localLife: 0, creator: 0 },
    },
    {
      id: "add-local-life",
      title: "Add Local Life stop",
      detail: hasLocalLife
        ? "Place one route-fit Local Life stop near food or culture flow."
        : "Reserve a Local Life slot for destination-relevant products and food.",
      source: "Local Life + Activities",
      affectedModule: "Local Life",
      affectedDay: "Day 2 evening",
      impact: { comfort: 0, budget: 900, risk: 0, weather: 0, experience: 10, localLife: 18, creator: 2 },
    },
    {
      id: "add-creator",
      title: "Add creator opportunity",
      detail: hasCreator
        ? "Attach the highest route-fit creator stop without creating a detour."
        : "Reserve a creator capture slot around scenic or food windows.",
      source: "Creator + Route",
      affectedModule: "Creator Recommendations",
      affectedDay: "Golden-hour slot",
      impact: { comfort: 2, budget: 0, risk: 0, weather: 2, experience: 12, localLife: 4, creator: 16 },
    },
    {
      id: "booking-ready",
      title: "Close readiness gaps",
      detail: "Prepare route, stay, transport and insurance handoff checks before review.",
      source: "Booking Readiness",
      affectedModule: "Booking Readiness",
      affectedDay: "Trip-wide",
      impact: { comfort: 5, budget: 0, risk: -4, weather: 0, experience: 2, localLife: 0, creator: 0 },
    },
    {
      id: "weather-buffer",
      title: "Add weather buffer",
      detail: "Protect the best daily travel window and add contingency around outdoor blocks.",
      source: "Weather Intelligence",
      affectedModule: "Weather Intelligence",
      affectedDay: "Outdoor activity day",
      impact: { comfort: 5, budget: 0, risk: -6, weather: 12, experience: 4, localLife: 0, creator: 1 },
    },
  ];
}

function buildMonitoring(plan: TiyaGeneratedPlan, selectedRoute?: TiyaRouteOption) {
  return [
    ["Route", selectedRoute?.riskLevel === "High" ? "Needs watch" : "Stable", Route],
    ["Budget", plan.totalBudget > 0 ? "Tracking" : "Needs estimate", BadgeIndianRupee],
    ["Weather", "Season window monitored", CloudSun],
    ["Risk", selectedRoute?.riskLevel || "Medium", ShieldAlert],
    ["Stays", plan.bookingModules.some((module) => module.id === "hotels") ? "Ready signal" : "Gap watch", CalendarClock],
    ["Activities", plan.days.some((day) => day.items.some((item) => item.type === "activity")) ? "Synced" : "Gap watch", Activity],
    ["Local Life", plan.localMarketPicks.length ? "Opportunities found" : "Listening", ShoppingBag],
    ["Creator Opportunities", plan.creatorPicks.length ? "Matched" : "Listening", Sparkles],
    ["Booking Readiness", plan.bookingModules.length ? "Payload ready" : "Needs data", CheckCircle2],
  ] as const;
}

export default function TiyaTravelCompanion({
  intent,
  plan,
  selectedRoute,
  isGenerating = false,
  appliedActionIds = [],
  onCoPilotAction,
}: TiyaTravelCompanionProps) {
  const [mode, setMode] = useState<TiyaCompanionMode>("Planner Mode");
  const [input, setInput] = useState("");
  const initialMessages = useMemo(
    () => generateInitialCompanionMessages({ intent, selectedRoute }),
    [intent, selectedRoute]
  );
  const [messages, setMessages] =
    useState<TiyaCompanionMessage[]>(initialMessages);
  const suggestions = useMemo(
    () => generateCompanionSuggestions({ intent, plan, selectedRoute }),
    [intent, plan, selectedRoute]
  );
  const actions = useMemo(
    () => buildCoPilotActions({ intent, plan, selectedRoute }),
    [intent, plan, selectedRoute]
  );
  const monitoring = useMemo(
    () => buildMonitoring(plan, selectedRoute),
    [plan, selectedRoute]
  );
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];
  const safeMessages = Array.isArray(messages) ? messages : [];
  const routeRisk = selectedRoute?.riskLevel === "High" ? "risk watch" : "route stable";
  const budgetPressure = plan.totalBudget > 0 && intent.budgetTier === "Economy";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMessages(initialMessages);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [initialMessages]);

  function addCompanionExchange(promptText: string, promptMode: TiyaCompanionMode) {
    const travellerMessage: TiyaCompanionMessage = {
      id: `traveller-${Date.now()}`,
      role: "traveller",
      text: promptText,
      tag: promptMode,
    };
    const tiyaMessage: TiyaCompanionMessage = {
      id: `tiya-${Date.now()}`,
      role: "tiya",
      tag: promptMode,
      text: generateCompanionResponse({
        input: promptText,
        intent,
        mode: promptMode,
      }),
    };

    setMode(promptMode);
    setMessages((currentMessages) => [
      ...currentMessages,
      travellerMessage,
      tiyaMessage,
    ]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = input.trim();
    if (!value) return;

    addCompanionExchange(value, mode);
    setInput("");
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.24)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(14,165,233,0.22),transparent_28%),radial-gradient(circle_at_90%_14%,rgba(249,115,22,0.2),transparent_25%)]" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <Bot size={15} className={isGenerating ? "animate-pulse" : undefined} />
              Tiya Live Co-Pilot
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Operational brain of this Smart Planner
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Tiya continuously watches route, budget, weather, risk, stays,
              activities, Local Life, creators and booking readiness, then turns
              signals into measurable one-click actions.
            </p>
          </div>
          <div className="grid gap-2 rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-xs font-black text-emerald-100 sm:min-w-[230px]">
            <span>Live Monitoring Status</span>
            <span>{monitoring.length} systems watched</span>
            <span>{routeRisk} · {budgetPressure ? "budget watch" : "budget stable"}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-3 sm:p-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4">
          <section className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <BrainCircuit size={15} />
              Main Intelligence Area
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {monitoring.map(([label, status, Icon]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                    <Icon size={13} />
                    {label}
                  </p>
                  <p className="mt-1 break-words text-sm font-black text-white">{status}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-orange-300/18 bg-orange-400/10 p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
              <Wand2 size={15} />
              Tiya Action Center
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {actions.map((action) => {
                const applied = appliedActionIds.includes(action.id);

                return (
                  <article
                    key={action.id}
                    className={`rounded-3xl border p-3 ${
                      applied
                        ? "border-emerald-300/32 bg-emerald-400/12"
                        : "border-white/10 bg-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="break-words text-sm font-black text-white">
                          {action.title}
                        </h3>
                        <p className="mt-1 text-xs font-semibold leading-5 text-white/62">
                          {action.detail}
                        </p>
                      </div>
                      {applied ? (
                        <span className="rounded-full border border-emerald-300/24 bg-emerald-400/12 px-2.5 py-1 text-[10px] font-black text-emerald-100">
                          Applied
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-black text-white/72 sm:grid-cols-4">
                      <span>Comfort {action.impact.comfort > 0 ? "+" : ""}{action.impact.comfort}</span>
                      <span>Budget {formatMoney(action.impact.budget)}</span>
                      <span>Risk {action.impact.risk}</span>
                      <span>Weather +{action.impact.weather}</span>
                      <span>Experience +{action.impact.experience}</span>
                      <span>Local Life +{action.impact.localLife}</span>
                      <span>Creator +{action.impact.creator}</span>
                      <span>{action.affectedDay}</span>
                    </div>
                    <button
                      type="button"
                      disabled={applied}
                      onClick={() => onCoPilotAction?.(action)}
                      className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-full bg-orange-500 px-3 text-xs font-black text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-emerald-500/30 disabled:text-emerald-50"
                    >
                      {applied ? "Synced To Trip" : "Apply Smart Action"}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-cyan-300/14 bg-cyan-300/10 p-3 sm:p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                What Tiya Is Noticing
              </div>
              <div className="mt-3 grid gap-2">
                {[
                  `${selectedRoute?.name || "Selected route"} is being watched for ${selectedRoute?.riskLevel || "medium"} route risk.`,
                  `${plan.bookingModules.length} booking services are ready to send to review.`,
                  `${plan.creatorPicks.length} creator and ${plan.localMarketPicks.length} Local Life signals are available.`,
                  `${intent.pace} pace means fatigue and recovery timing matter.`,
                ].map((notice) => (
                  <p key={notice} className="rounded-2xl border border-white/10 bg-white/10 p-3 text-xs font-semibold leading-5 text-cyan-50/78">
                    {notice}
                  </p>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                Tiya Memory Panel
              </div>
              <div className="mt-3 grid gap-2">
                {[
                  `Traveller style: ${intent.travelStyle}`,
                  `Pace preference: ${intent.pace}`,
                  `Budget mode: ${intent.budgetTier}`,
                  `Interests: ${intent.interests.slice(0, 4).join(", ") || "Route-first travel"}`,
                ].map((memory) => (
                  <p key={memory} className="rounded-2xl border border-white/10 bg-white/10 p-3 text-xs font-black text-white/70">
                    {memory}
                  </p>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-4">
          <section className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                Ask Tiya Results Engine
              </div>
              <span className="rounded-full border border-orange-300/20 bg-orange-400/10 px-3 py-1 text-xs font-black text-orange-100">
                {mode}
              </span>
            </div>
            <form onSubmit={handleSubmit} className="mt-3 grid gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask for an operational decision"
                className="min-h-11 rounded-2xl border border-white/10 bg-white/10 px-4 text-sm font-bold text-white outline-none placeholder:text-white/40 focus:border-orange-300/45"
              />
              <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 text-sm font-black text-white shadow-[0_12px_32px_rgba(249,115,22,0.28)] transition hover:bg-orange-600">
                <Send size={16} />
                Run Tiya Analysis
              </button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              {companionPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  onClick={() => addCompanionExchange(prompt.label, prompt.mode)}
                  className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:border-orange-300/35 hover:bg-orange-400/15"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              Auto Fix Suggestions
            </div>
            <div className="mt-3 grid gap-2">
              {safeSuggestions.map((suggestion) => (
                <article key={suggestion.id} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black text-white">{suggestion.title}</h3>
                      <p className="mt-1 text-xs font-semibold leading-5 text-white/65">{suggestion.detail}</p>
                    </div>
                    <span className={`w-fit rounded-full border px-2.5 py-1 text-[11px] font-black ${priorityTone[suggestion.priority]}`}>
                      {suggestion.priority}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              Conversation Timeline
            </div>
            <div className="mt-3 grid max-h-[320px] gap-3 overflow-y-auto pr-1">
              {safeMessages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-3xl border p-3 text-sm font-semibold leading-6 ${
                    message.role === "traveller"
                      ? "ml-auto max-w-[88%] border-orange-300/20 bg-orange-500 text-white"
                      : "max-w-[94%] border-white/10 bg-white/10 text-white/75"
                  }`}
                >
                  {message.tag ? (
                    <p className="mb-1 text-[10px] font-black uppercase tracking-[0.12em] opacity-70">
                      {message.tag}
                    </p>
                  ) : null}
                  {message.text}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-emerald-300/18 bg-emerald-400/10 p-3 sm:p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-100">
              Sync Status
            </div>
            <div className="mt-3 grid gap-2 text-xs font-black text-emerald-50/78">
              <p className="rounded-2xl border border-white/10 bg-white/10 p-3">Transparent Update Integration: enabled through workspace apply log.</p>
              <p className="rounded-2xl border border-white/10 bg-white/10 p-3">Itinerary Sync: smart actions can add timeline entries.</p>
              <p className="rounded-2xl border border-white/10 bg-white/10 p-3">Basket Sync: service-affecting actions update selected trip items.</p>
              <p className="rounded-2xl border border-white/10 bg-white/10 p-3">Trip Health Sync: impacts are expressed as comfort, budget, risk, weather and experience deltas.</p>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
