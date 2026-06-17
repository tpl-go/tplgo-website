"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, MapPin } from "lucide-react";

import type {
  TiyaRouteOption,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import {
  SMART_PLANNER_RETURN_SEARCH_KEY,
  type SmartPlannerWorkspaceDraft,
} from "@/app/lib/ecosystem/planner/plannerRouteWorkspaceHandoff";

import { routeAccent } from "./utils/workspaceHelpers";

const tripTypeOptions = ["One Way / Destination Trip", "Round Trip", "Multi City"];
const transportOptions = [
  "Flight",
  "Train",
  "Bus",
  "Private Car",
  "Private EV",
  "Cruise",
  "Cab",
  "Bike",
  "Mixed / Let Tiya Suggest",
];
const stayOptions = [
  "Hotel",
  "Homestay",
  "Resort",
  "Budget Stay",
  "Premium Stay",
  "No Stay Needed",
];
const cabOptions = [
  "No Cab",
  "Airport / Station Transfer Only",
  "Selected Days Only",
  "Full Trip Cab",
  "Let Tiya Suggest",
];
const budgetOptions = ["Economy", "Standard", "Premium", "Luxury"];
const travelStyleOptions = [
  "Family",
  "Couple",
  "Friends",
  "Solo",
  "Adventure",
  "Spiritual",
  "Luxury",
  "Workation",
];

function mapTransportPreferenceToMode(preference: string) {
  if (preference === "Private Car") return "Self-drive Car";
  if (preference === "Private EV") return "EV";
  if (preference === "Mixed / Let Tiya Suggest") return "Mixed Mode";
  if (preference === "Cruise") return "Mixed Mode";
  return preference;
}

function mapModeToTransportPreference(mode?: string, preference?: string) {
  if (preference) return preference;
  if (mode === "Self-drive Car") return "Private Car";
  if (mode === "EV") return "Private EV";
  if (mode === "Mixed Mode") return "Mixed / Let Tiya Suggest";
  return mode || "";
}

function numberFromDraft(value?: number, fallback = 0) {
  return Number.isFinite(value) ? Number(value) : fallback;
}

export default function WorkspaceTopBar({
  routeOptions,
  selectedRoute,
  fromCity,
  toCity,
  workspaceDraft,
  onSwitchRoute,
}: {
  routeOptions: TiyaRouteOption[];
  selectedRoute: TiyaRouteOption;
  fromCity: string;
  toCity: string;
  workspaceDraft?: SmartPlannerWorkspaceDraft;
  onSwitchRoute: (routeOption: TiyaRouteOption) => void;
}) {
  const router = useRouter();
  const origin = workspaceDraft?.origin || fromCity;
  const destination = workspaceDraft?.destination || toCity;
  const sourceIntent = workspaceDraft?.tripIntent;
  const [modifySearch, setModifySearch] = useState({
    tripType: workspaceDraft?.tripType || sourceIntent?.tripType || "One Way / Destination Trip",
    fromCity: origin,
    toCity: destination,
    startDate: workspaceDraft?.startDate || sourceIntent?.startDate || "",
    endDate: workspaceDraft?.endDate || sourceIntent?.endDate || "",
    multiCityStops:
      sourceIntent?.tripType === "Multi City"
        ? (sourceIntent.multiCityStops?.length
            ? sourceIntent.multiCityStops
            : [destination]
          ).filter((stop) => stop.trim())
        : [],
    adults: numberFromDraft(workspaceDraft?.travellers?.adults, sourceIntent?.adults ?? 1),
    children: numberFromDraft(workspaceDraft?.travellers?.children, sourceIntent?.children ?? 0),
    seniors: numberFromDraft(workspaceDraft?.travellers?.seniors, sourceIntent?.seniors ?? 0),
    transportPreference: mapModeToTransportPreference(
      workspaceDraft?.transportMode || sourceIntent?.transportMode,
      sourceIntent?.transportPreference
    ),
    stayPreference: sourceIntent?.stayPreference || "",
    cabRequirement: sourceIntent?.cabRequirement || "",
    budgetTier: sourceIntent?.budgetTier || "",
    travelStyle: sourceIntent?.travelStyle || "",
    preference: selectedRoute.routeStyle || sourceIntent?.pace || selectedRoute.bestFor,
  });

  const travellerCount = Math.max(
    1,
    modifySearch.adults + modifySearch.children + modifySearch.seniors
  );
  const routePathCities =
    modifySearch.tripType === "Multi City"
      ? [modifySearch.fromCity, ...modifySearch.multiCityStops].filter((city) =>
          city.trim()
        )
      : [modifySearch.fromCity, modifySearch.toCity].filter((city) =>
          city.trim()
        );
  const visibleRouteCities = routePathCities.slice(0, 3);
  const hiddenRouteCityCount = Math.max(0, routePathCities.length - visibleRouteCities.length);

  function updateModifySearch<K extends keyof typeof modifySearch>(
    key: K,
    value: (typeof modifySearch)[K]
  ) {
    setModifySearch((current) => ({ ...current, [key]: value }));
  }

  function updateMultiCityStop(index: number, value: string) {
    setModifySearch((current) => {
      const nextStops = [...current.multiCityStops];
      nextStops[index] = value;

      return { ...current, multiCityStops: nextStops };
    });
  }

  function searchAgain() {
    if (typeof window === "undefined") return;

    const transportPreference = modifySearch.transportPreference;
    const returnIntent: Partial<TiyaTripIntent> = {
      ...(sourceIntent ?? {}),
      tripType: modifySearch.tripType,
      fromCity: modifySearch.fromCity,
      toCity:
        modifySearch.tripType === "Multi City"
          ? modifySearch.multiCityStops[0] || modifySearch.toCity
          : modifySearch.toCity,
      startDate: modifySearch.startDate,
      endDate: modifySearch.endDate,
      adults: modifySearch.adults,
      children: modifySearch.children,
      seniors: modifySearch.seniors,
      transportPreference,
      transportMode: mapTransportPreferenceToMode(transportPreference),
      stops:
        modifySearch.tripType === "Multi City"
          ? modifySearch.multiCityStops.filter((stop) => stop.trim())
          : [],
      multiCityStops:
        modifySearch.tripType === "Multi City"
          ? modifySearch.multiCityStops.filter((stop) => stop.trim())
          : [],
      stayPreference: modifySearch.stayPreference,
      cabRequirement: modifySearch.cabRequirement,
      budgetTier: modifySearch.budgetTier,
      travelStyle: modifySearch.travelStyle,
      pace:
        modifySearch.preference === "Relaxed" ||
        modifySearch.preference === "Balanced" ||
        modifySearch.preference === "Packed"
          ? modifySearch.preference
          : sourceIntent?.pace,
      returnToOrigin: modifySearch.tripType === "Round Trip",
    };

    try {
      window.sessionStorage.setItem(
        SMART_PLANNER_RETURN_SEARCH_KEY,
        JSON.stringify(returnIntent)
      );
    } catch {
      return;
    }

    router.push("/smart-planner");
  }

  return (
    <div className="sticky top-0 z-40 w-full max-w-full min-w-0 overflow-hidden bg-transparent lg:rounded-[1.7rem] lg:border lg:border-white lg:bg-white/92 lg:p-4 lg:shadow-[0_16px_50px_rgba(15,23,42,0.09)] lg:backdrop-blur-2xl">
      <div className="grid min-w-0 gap-4 lg:grid-cols-[0.9fr_2.1fr] lg:items-start">
        <div className="min-w-0 rounded-[1.45rem] border border-white bg-white/92 p-3 shadow-[0_14px_38px_rgba(15,23,42,0.08)] backdrop-blur-2xl lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
          <div className="flex items-baseline gap-1.5">
            <span className="bg-gradient-to-r from-blue-950 via-blue-800 to-blue-600 bg-clip-text font-serif text-[17px] font-black italic tracking-normal text-transparent">
              Tiya
            </span>
            <span className="text-sm font-black tracking-tight text-slate-800">
              Route Intelligence
            </span>
          </div>
          <div className="mt-2 flex max-w-full flex-wrap items-center gap-2 rounded-2xl border border-slate-100 bg-white/75 px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
            {visibleRouteCities.map((city, index) => {
              const isFirst = index === 0;
              const isLastVisible =
                index === visibleRouteCities.length - 1 && hiddenRouteCityCount === 0;

              return (
                <div
                  key={`${city}-${index}`}
                  className="flex min-w-0 items-center gap-2"
                >
                  {index > 0 ? (
                    <span className={`h-px w-7 shrink-0 border-t border-dashed sm:w-10 ${selectedRoute.id === "scenic" ? "border-orange-300" : "border-sky-300"}`} />
                  ) : null}
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <span
                      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        isFirst
                          ? "bg-sky-50 text-sky-700"
                          : isLastVisible
                            ? "bg-orange-50 text-orange-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <MapPin size={12} />
                    </span>
                    <span className="max-w-[88px] truncate text-sm font-black text-slate-950 sm:max-w-[110px]">
                      {city}
                    </span>
                  </span>
                </div>
              );
            })}
            {hiddenRouteCityCount > 0 ? (
              <>
                <span className={`h-px w-7 shrink-0 border-t border-dashed sm:w-10 ${selectedRoute.id === "scenic" ? "border-orange-300" : "border-sky-300"}`} />
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-black text-slate-600">
                  +{hiddenRouteCityCount} stops
                </span>
              </>
            ) : null}
          </div>
          <p className="mt-2 inline-flex max-w-full rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-700">
            Selected: {selectedRoute.name}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {routeOptions.map((routeOption) => {
              const active = routeOption.id === selectedRoute.id;
              const accent = routeAccent(routeOption.id);

              return (
                <button
                  key={routeOption.id}
                  type="button"
                  onClick={() => onSwitchRoute(routeOption)}
                  className={`rounded-full border px-2.5 py-1.5 text-[11px] font-black transition ${
                    active
                      ? "border-orange-300 bg-orange-50 text-orange-700 shadow-sm"
                      : "border-slate-200 bg-white/80 text-slate-700 hover:border-orange-200 hover:bg-orange-50"
                  }`}
                >
                  {active ? (
                    <Check size={12} className="mr-1 inline-block align-[-2px]" />
                  ) : (
                    <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-gradient-to-r ${accent}`} />
                  )}
                  {routeOption.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 rounded-[1.45rem] border border-white/80 bg-white/88 p-3 shadow-[0_14px_38px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-2xl lg:rounded-[1.25rem] lg:bg-white/68 lg:p-2.5 lg:shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_12px_34px_rgba(15,23,42,0.07)]">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                MODIFY SEARCH
              </p>
              {modifySearch.preference ? (
                <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-700">
                  {modifySearch.preference}
                </span>
              ) : null}
            </div>
            <p className="text-xs font-semibold leading-5 text-slate-500 lg:hidden">
              {modifySearch.fromCity || "Origin"} →{" "}
              {modifySearch.tripType === "Multi City"
                ? modifySearch.multiCityStops.filter((stop) => stop.trim()).join(" → ") || modifySearch.toCity || "Destination"
                : modifySearch.toCity || "Destination"}{" "}
              · {travellerCount} traveller{travellerCount === 1 ? "" : "s"}
            </p>
            <button
              type="button"
              onClick={searchAgain}
              className="hidden min-h-8 items-center justify-center rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-4 text-xs font-black text-white shadow-[0_14px_32px_rgba(255,123,0,0.3)] transition hover:-translate-y-0.5 hover:brightness-105 lg:inline-flex"
            >
              Modify Search
            </button>
          </div>

          <div className="mt-2 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <label className="min-w-0">
              <span className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                Trip Type
              </span>
              <select
                value={modifySearch.tripType}
                onChange={(event) => updateModifySearch("tripType", event.target.value)}
                className="mt-1 h-8 w-full rounded-xl border border-slate-200/80 bg-white/90 px-2 text-[11px] font-black text-slate-800 outline-none"
              >
                {tripTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            {[
              ["From", "fromCity"],
              ...(modifySearch.tripType === "Multi City"
                ? []
                : [["Destination", "toCity"]]),
              ["Start Date", "startDate"],
              ["End Date", "endDate"],
            ].map(([label, key]) => (
              <label key={key} className="min-w-0">
                <span className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                  {label}
                </span>
                <input
                  type={key.includes("Date") ? "date" : "text"}
                  value={String(modifySearch[key as keyof typeof modifySearch])}
                  onChange={(event) =>
                    updateModifySearch(
                      key as keyof typeof modifySearch,
                      event.target.value as never
                    )
                  }
                  className="mt-1 h-8 w-full rounded-xl border border-slate-200/80 bg-white/90 px-2 text-[11px] font-black text-slate-800 outline-none"
                />
              </label>
            ))}

            {modifySearch.tripType === "Multi City"
              ? modifySearch.multiCityStops.map((stop, index) => (
                <label key={`${stop}-${index}`} className="min-w-0">
                <span className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Stop {index + 1}
                </span>
                <input
                  type="text"
                  value={stop}
                  onChange={(event) =>
                    updateMultiCityStop(index, event.target.value)
                  }
                  className="mt-1 h-8 w-full rounded-xl border border-slate-200/80 bg-white/90 px-2 text-[11px] font-black text-slate-800 outline-none"
                />
              </label>
              ))
              : null}

            <label className="min-w-0">
              <span className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                Travellers
              </span>
              <input
                type="number"
                min={1}
                max={30}
                value={travellerCount}
                onChange={(event) =>
                  updateModifySearch(
                    "adults",
                    Math.max(1, Number(event.target.value || 1))
                  )
                }
                className="mt-1 h-8 w-full rounded-xl border border-slate-200/80 bg-white/90 px-2 text-[11px] font-black text-slate-800 outline-none"
              />
            </label>

            <label className="min-w-0">
              <span className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                Children
              </span>
              <input
                type="number"
                min={0}
                max={10}
                value={modifySearch.children}
                onChange={(event) =>
                  updateModifySearch(
                    "children",
                    Math.max(0, Number(event.target.value || 0))
                  )
                }
                className="mt-1 h-8 w-full rounded-xl border border-slate-200/80 bg-white/90 px-2 text-[11px] font-black text-slate-800 outline-none"
              />
            </label>

            <label className="min-w-0">
              <span className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                Transport
              </span>
              <select
                value={modifySearch.transportPreference}
                onChange={(event) =>
                  updateModifySearch("transportPreference", event.target.value)
                }
                className="mt-1 h-8 w-full rounded-xl border border-slate-200/80 bg-white/90 px-2 text-[11px] font-black text-slate-800 outline-none"
              >
                <option value="">Select transport</option>
                {transportOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            {[
              ["Stay Preference", "stayPreference", stayOptions],
              ["Cab Requirement", "cabRequirement", cabOptions],
              ["Budget Vibe", "budgetTier", budgetOptions],
              ["Travel Style", "travelStyle", travelStyleOptions],
            ].map(([label, key, options]) => (
              <label key={key as string} className="min-w-0">
                <span className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                  {label as string}
                </span>
                <select
                  value={String(modifySearch[key as keyof typeof modifySearch])}
                  onChange={(event) =>
                    updateModifySearch(
                      key as keyof typeof modifySearch,
                      event.target.value as never
                    )
                  }
                  className="mt-1 h-8 w-full rounded-xl border border-slate-200/80 bg-white/90 px-2 text-[11px] font-black text-slate-800 outline-none"
                >
                  <option value="">Select</option>
                  {(options as string[]).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={searchAgain}
            className="mt-3 flex min-h-11 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-4 text-sm font-black text-white shadow-[0_14px_32px_rgba(255,123,0,0.26)] transition hover:brightness-105 lg:hidden"
          >
            Modify Search
          </button>
        </div>
      </div>

    </div>
  );
}
