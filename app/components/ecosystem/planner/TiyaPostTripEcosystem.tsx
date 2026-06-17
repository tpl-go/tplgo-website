"use client";

import { useMemo, useState } from "react";
import {
  Camera,
  CheckCircle2,
  Gift,
  Heart,
  Info,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import {
  generateDefaultTripMemory,
  generateNextTripSuggestions,
  generatePostTripProducts,
  generatePostTripSummary,
  type TiyaNextTripSuggestion,
  type TiyaPostTripProduct,
  type TiyaTripMemoryCapture,
} from "@/app/lib/ecosystem/planner/plannerPostTripEngine";
import type {
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import type { MyTripSavedItem } from "@/app/lib/ecosystem/planner/myTripsStorage";

type TiyaPostTripEcosystemProps = {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  days: TiyaDayPlan[];
  selectedRoute?: TiyaRouteOption;
  isGenerating?: boolean;
  onAction?: (action: string) => void;
};

type PanelState =
  | null
  | {
      title: string;
      detail: string;
      mode?: "rating" | "info";
    };

const MEMORY_PROFILE_KEY = "tpl_tiya_memory_profile";
const POST_TRIP_RECOMMENDATIONS_KEY = "tpl_tiya_post_trip_recommendations";
const POST_TRIP_ADDONS_KEY = "tpl_tiya_post_trip_addons";
const POST_TRIP_ACTIONS_KEY = "tpl_tiya_post_trip_actions";
const CREATOR_UPLOAD_DRAFTS_KEY = "tpl_tiya_creator_upload_drafts";
const CREATOR_LICENSE_REQUESTS_KEY = "tpl_tiya_creator_license_requests";

function canUseStorage() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local storage can be unavailable in restricted browser modes.
  }
}

function appendLocalRecord<T extends Record<string, unknown>>(key: string, record: T) {
  const existing = readJson<T[]>(key, []);
  writeJson(key, [record, ...existing].slice(0, 30));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("tpl_tiya_workspace_payload_updated"));
    window.dispatchEvent(new Event("tpl_tiya_saved_trips_updated"));
  }
}

function productSavedItem(
  product: TiyaPostTripProduct,
  intent: TiyaTripIntent
): MyTripSavedItem {
  return {
    id: `post-trip-local:${product.id}`,
    type: "Local Life",
    title: product.title,
    subtitle: product.detail,
    category: product.tag,
    sourceModule: "Post Trip Insights",
    city: product.region || intent.toCity,
    destination: intent.toCity,
    day: "Post-trip",
    estimatedCost: undefined,
    metadata: {
      region: product.region,
      tag: product.tag,
      postTripFollowUp: true,
    },
    savedAt: new Date().toISOString(),
  };
}

export default function TiyaPostTripEcosystem({
  intent,
  plan,
  days,
  selectedRoute,
  isGenerating = false,
  onAction,
}: TiyaPostTripEcosystemProps) {
  const summary = useMemo(
    () => generatePostTripSummary({ intent, plan, days, selectedRoute }),
    [days, intent, plan, selectedRoute]
  );
  const defaultMemory = useMemo(
    () => generateDefaultTripMemory({ intent, plan, days, selectedRoute }),
    [days, intent, plan, selectedRoute]
  );
  const [memory, setMemory] = useState<TiyaTripMemoryCapture>(defaultMemory);
  const [rating, setRating] = useState(0);
  const [panel, setPanel] = useState<PanelState>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [savedProductIds, setSavedProductIds] = useState<string[]>([]);
  const [addedProductIds, setAddedProductIds] = useState<string[]>([]);
  const [savedSuggestionIds, setSavedSuggestionIds] = useState<string[]>([]);
  const products = useMemo(
    () => generatePostTripProducts({ intent, plan }),
    [intent, plan]
  );
  const nextTrips = useMemo(
    () => generateNextTripSuggestions({ intent, selectedRoute }),
    [intent, selectedRoute]
  );
  const safeProducts = Array.isArray(products) ? products : [];
  const safeNextTrips = Array.isArray(nextTrips) ? nextTrips : [];

  function updateMemory(value: Partial<TiyaTripMemoryCapture>) {
    setMemory((current) => ({ ...current, ...value }));
  }

  function showStatus(message: string) {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(""), 2600);
  }

  function handleRateTrip() {
    appendLocalRecord(POST_TRIP_ACTIONS_KEY, {
      action: "Rate trip plan",
      destination: intent.toCity,
      rating,
      route: selectedRoute?.name || plan.routeTitle,
      savedAt: new Date().toISOString(),
      sourceModule: "Post Trip Insights",
    });
    setPanel({
      title: "Rate trip plan",
      detail: "Trip rating draft saved locally for the current Smart Planner trip. It will sync to CRM/backend when that service is available.",
      mode: "rating",
    });
    showStatus("Trip rating draft saved.");
    onAction?.("Rate trip plan");
  }

  function handleSaveTravelMemory() {
    const profile = readJson<Record<string, unknown>>(MEMORY_PROFILE_KEY, {});
    const nextProfile = {
      ...profile,
      lastTripMemory: {
        ...memory,
        destination: intent.toCity,
        experienceScore: summary.experienceScore,
        route: selectedRoute?.name || plan.routeTitle,
        savedAt: new Date().toISOString(),
      },
      memorySources: [
        ...((profile.memorySources as unknown[]) || []),
        {
          source: "Post Trip Insights",
          destination: intent.toCity,
          learnedAt: new Date().toISOString(),
        },
      ].slice(-20),
      updatedAt: new Date().toISOString(),
    };

    writeJson(MEMORY_PROFILE_KEY, nextProfile);
    appendLocalRecord(POST_TRIP_ACTIONS_KEY, {
      action: "Save as travel memory",
      destination: intent.toCity,
      route: selectedRoute?.name || plan.routeTitle,
      savedAt: new Date().toISOString(),
      sourceModule: "Post Trip Insights",
    });
    showStatus("Travel memory saved.");
    onAction?.("Save as travel memory");
  }

  function handleRecommendSimilarRoute() {
    const payload = {
      id: `post-trip-route-${Date.now()}`,
      destination: intent.toCity,
      route: selectedRoute?.name || plan.routeTitle,
      travelStyle: intent.travelStyle,
      budgetTier: intent.budgetTier,
      createdAt: new Date().toISOString(),
      suggestions: safeNextTrips,
    };
    const existing = readJson<unknown[]>(POST_TRIP_RECOMMENDATIONS_KEY, []);

    writeJson(POST_TRIP_RECOMMENDATIONS_KEY, [payload, ...existing].slice(0, 12));
    appendLocalRecord(POST_TRIP_ACTIONS_KEY, {
      action: "Recommend similar route",
      recommendationId: payload.id,
      destination: intent.toCity,
      savedAt: new Date().toISOString(),
      sourceModule: "Post Trip Insights",
    });
    showStatus("Similar route recommendation saved.");
    onAction?.("Recommend similar route");
  }

  function handleWalletInfo() {
    setPanel({
      title: "Wallet and credit placeholder",
      detail: "Frontend simulation only. No real wallet credit, loyalty points or payment value is issued from this module.",
      mode: "info",
    });
    onAction?.("Wallet/credit placeholder");
  }

  function handleUploadMedia() {
    appendLocalRecord(CREATOR_UPLOAD_DRAFTS_KEY, {
      id: `creator-upload-${Date.now()}`,
      destination: intent.toCity,
      route: selectedRoute?.name || plan.routeTitle,
      status: "draft",
      sourceModule: "Post Trip Insights",
      createdAt: new Date().toISOString(),
    });
    setPanel({
      title: "Creator upload draft saved",
      detail: "A creator upload draft was saved locally for this trip. Media files are not uploaded until the creator backend is connected.",
      mode: "info",
    });
    showStatus("Creator upload draft saved.");
    onAction?.("Upload media");
  }

  function handleBecomeCreator() {
    onAction?.("Become creator");
    if (typeof window !== "undefined") {
      window.location.href = "/creators";
    }
  }

  function handleLicenseContent() {
    appendLocalRecord(CREATOR_LICENSE_REQUESTS_KEY, {
      id: `content-license-${Date.now()}`,
      destination: intent.toCity,
      route: selectedRoute?.name || plan.routeTitle,
      status: "draft",
      sourceModule: "Post Trip Insights",
      createdAt: new Date().toISOString(),
    });
    setPanel({
      title: "Content licensing draft saved",
      detail: "A local licensing draft was saved for this trip. Backend review and legal workflow can attach to this record later.",
      mode: "info",
    });
    showStatus("Content licensing draft saved.");
    onAction?.("License content");
  }

  function handleSaveProduct(product: TiyaPostTripProduct) {
    const savedItem = productSavedItem(product, intent);

    setSavedProductIds((current) =>
      current.includes(product.id) ? current : [...current, product.id]
    );
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tpl:save-planner-item-to-my-trips", {
          detail: savedItem,
        })
      );
    }
    showStatus(`${product.title} saved to My Trips.`);
    onAction?.(`Local Life saved: ${product.title}`);
  }

  function handleAddProduct(product: TiyaPostTripProduct) {
    const existing = readJson<unknown[]>(POST_TRIP_ADDONS_KEY, []);
    const addon = {
      id: product.id,
      title: product.title,
      region: product.region,
      detail: product.detail,
      tag: product.tag,
      addedAt: new Date().toISOString(),
      sourceModule: "Post Trip Insights",
    };

    writeJson(POST_TRIP_ADDONS_KEY, [
      addon,
      ...existing.filter((item) =>
        typeof item === "object" && item !== null
          ? (item as { id?: string }).id !== product.id
          : true
      ),
    ]);
    appendLocalRecord(POST_TRIP_ACTIONS_KEY, {
      action: "Local Life added",
      productId: product.id,
      destination: intent.toCity,
      savedAt: new Date().toISOString(),
      sourceModule: "Post Trip Insights",
    });
    setAddedProductIds((current) =>
      current.includes(product.id) ? current : [...current, product.id]
    );
    showStatus(`${product.title} added to post-trip add-ons.`);
    onAction?.(`Local Life added: ${product.title}`);
  }

  function handleSaveNextTrip(suggestion: TiyaNextTripSuggestion) {
    const existing = readJson<unknown[]>(POST_TRIP_RECOMMENDATIONS_KEY, []);
    const payload = {
      ...suggestion,
      sourceModule: "Post Trip Insights",
      currentDestination: intent.toCity,
      savedAt: new Date().toISOString(),
    };

    writeJson(POST_TRIP_RECOMMENDATIONS_KEY, [payload, ...existing].slice(0, 12));
    appendLocalRecord(POST_TRIP_ACTIONS_KEY, {
      action: "Next trip saved",
      suggestionId: suggestion.id,
      destination: intent.toCity,
      savedAt: new Date().toISOString(),
      sourceModule: "Post Trip Insights",
    });
    setSavedSuggestionIds((current) =>
      current.includes(suggestion.id) ? current : [...current, suggestion.id]
    );
    showStatus(`${suggestion.title} saved as next-trip idea.`);
    onAction?.(`Next trip saved: ${suggestion.title}`);
  }

  return (
    <section className="w-full max-w-full min-w-0 overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(14,165,233,0.22),transparent_28%),radial-gradient(circle_at_90%_14%,rgba(249,115,22,0.2),transparent_25%)]" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <RotateCcw
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              Post-booking and post-trip ecosystem
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Post-trip memory and ecosystem loop
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Frontend simulation for the post-booking layer: trip memory,
              creator uploads, Local Life follow-up, loyalty placeholders and
              next-trip intelligence.
            </p>
          </div>
          <div className="w-fit shrink-0 rounded-3xl border border-orange-300/20 bg-orange-400/10 p-3 text-xs font-black text-orange-100">
            Experience score {summary.experienceScore}%
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-3 p-3 sm:p-5">
        <div className="w-full min-w-0 overflow-hidden rounded-3xl border border-orange-300/20 bg-[linear-gradient(135deg,rgba(249,115,22,0.16),rgba(14,165,233,0.1))] p-4 shadow-[0_18px_60px_rgba(249,115,22,0.08)] sm:p-5">
          <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-center">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
                <Camera size={15} />
                Creator upload CTA
              </div>
              <h3 className="mt-3 break-words text-xl font-black text-white sm:text-2xl">
                Camera on. Creator ecosystem ready.
              </h3>
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-orange-50/85">
                Upload trip photos/videos, become a TPL creator or license
                route content after booking. This is a post-trip ecosystem
                layer, separate from review and loyalty actions.
              </p>
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                ["Upload media", handleUploadMedia],
                ["Become creator", handleBecomeCreator],
                ["License content", handleLicenseContent],
              ].map(([action, handler]) => (
                <button
                  key={action as string}
                  type="button"
                  onClick={handler as () => void}
                  className="inline-flex min-h-11 w-full min-w-0 items-center justify-center rounded-full border border-orange-300/25 bg-white/10 px-4 text-center text-xs font-black text-white transition hover:border-orange-200/50 hover:bg-white/15"
                >
                  <span className="min-w-0 break-words">{action as string}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {statusMessage ? (
          <div className="flex min-w-0 items-start justify-between gap-3 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 p-3 text-xs font-black text-emerald-100">
            <span className="min-w-0 break-words">{statusMessage}</span>
            <button
              type="button"
              onClick={() => setStatusMessage("")}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-emerald-200/20 bg-emerald-200/10 text-emerald-50 transition hover:bg-emerald-200/20"
              aria-label="Dismiss post-trip action status"
            >
              <X size={14} />
            </button>
          </div>
        ) : null}

        <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[
            ["Completed trip", summary.completedTripSnapshot],
            ["Route covered", summary.routeCovered],
            ["Days travelled", `${summary.daysTravelled}`],
            ["Creator/Local Life", summary.creatorLocalMarketEngagement],
            ["Estimated spend", `₹${summary.estimatedSpend.toLocaleString("en-IN")}`],
            ["Experience score", `${summary.experienceScore}%`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                {label}
              </p>
              <p className="mt-2 break-words text-sm font-black text-white">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
          <div className="grid min-w-0 gap-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                <Heart size={15} />
                Trip memory capture
              </div>
              <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  ["Favourite stop", "favouriteStop"],
                  ["Favourite stay", "favouriteStay"],
                  ["Favourite activity", "favouriteActivity"],
                  ["Route feedback", "routeFeedback"],
                  ["Budget feedback", "budgetFeedback"],
                  ["Safety feedback", "safetyFeedback"],
                ].map(([label, key]) => (
                  <label
                    key={key}
                    className="grid min-w-0 gap-1 text-xs font-black text-white"
                  >
                    {label}
                    <input
                      value={memory[key as keyof TiyaTripMemoryCapture]}
                      onChange={(event) =>
                        updateMemory({
                          [key]: event.target.value,
                        } as Partial<TiyaTripMemoryCapture>)
                      }
                      className="min-h-11 w-full min-w-0 rounded-2xl border border-white/10 bg-white/10 px-3 text-sm font-bold text-white outline-none placeholder:text-white/40 focus:border-orange-300/45"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                <Gift size={15} />
                Review and loyalty layer
              </div>
              <p className="mt-2 text-sm font-semibold leading-6 text-white/65">
                Rate the plan, save memory signals and keep loyalty placeholders
                separate from creator upload actions.
              </p>
              <div className="mt-3 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  ["Rate trip plan", handleRateTrip],
                  ["Save as travel memory", handleSaveTravelMemory],
                  ["Recommend similar route", handleRecommendSimilarRoute],
                  ["Wallet/credit placeholder", handleWalletInfo],
                ].map(([action, handler]) => (
                  <button
                    key={action as string}
                    type="button"
                    onClick={handler as () => void}
                    className="inline-flex min-h-10 w-full min-w-0 items-center justify-center rounded-full border border-white/15 bg-white/10 px-3 text-center text-xs font-black text-white transition hover:bg-white/15"
                  >
                    <span className="min-w-0 break-words">{action as string}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="grid h-fit min-w-0 gap-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                <ShoppingBag size={15} />
                Local Life follow-up
              </div>
              <div className="mt-3 grid gap-2">
                {safeProducts.map((product) => (
                  <article
                    key={product.id}
                    className={`rounded-2xl border p-3 ${
                      addedProductIds.includes(product.id) ||
                      savedProductIds.includes(product.id)
                        ? "border-emerald-300/30 bg-emerald-400/10"
                        : "border-white/10 bg-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="break-words text-sm font-black text-white">
                          {product.title}
                        </h3>
                        <p className="mt-1 text-xs font-semibold leading-5 text-white/60">
                          {product.region} · {product.detail}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-orange-400/15 px-2.5 py-1 text-[10px] font-black text-orange-100">
                        {product.tag}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddProduct(product)}
                        className="min-h-9 rounded-full bg-orange-500 px-3 text-xs font-black text-white transition hover:bg-orange-600"
                      >
                        {addedProductIds.includes(product.id) ? "Added" : "Add"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveProduct(product)}
                        className="min-h-9 rounded-full border border-white/15 bg-white/10 px-3 text-xs font-black text-white transition hover:bg-white/15"
                      >
                        {savedProductIds.includes(product.id) ? "Saved" : "Save"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <Sparkles size={15} />
            Next trip suggestions
          </div>
          <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-4">
            {safeNextTrips.map((suggestion) => (
              <article
                key={suggestion.id}
                className={`rounded-3xl border p-3 ${
                  savedSuggestionIds.includes(suggestion.id)
                    ? "border-emerald-300/30 bg-emerald-400/10"
                    : "border-white/10 bg-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <Star className="h-4 w-4 shrink-0 text-orange-100" />
                  <span className="rounded-full bg-cyan-300/10 px-2.5 py-1 text-[11px] font-black text-cyan-100">
                    {suggestion.fit}% fit
                  </span>
                </div>
                <h3 className="mt-3 break-words text-base font-black text-white">
                  {suggestion.title}
                </h3>
                <p className="mt-2 text-xs font-semibold leading-5 text-white/65">
                  {suggestion.detail}
                </p>
                <button
                  type="button"
                  onClick={() => handleSaveNextTrip(suggestion)}
                  className="mt-3 min-h-9 w-full rounded-full border border-white/15 bg-white/10 px-3 text-xs font-black text-white transition hover:bg-white/15"
                >
                  {savedSuggestionIds.includes(suggestion.id)
                    ? "Saved"
                    : "Save idea"}
                </button>
              </article>
            ))}
          </div>
        </div>
      </div>

      {panel ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#071a3b] p-4 text-white shadow-[0_28px_90px_rgba(0,0,0,0.42)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                  {panel.mode === "rating" ? <Star size={15} /> : <Info size={15} />}
                  Post-trip action
                </div>
                <h3 className="mt-2 text-xl font-black text-white">
                  {panel.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPanel(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-white/70">
              {panel.detail}
            </p>
            {panel.mode === "rating" ? (
              <div className="mt-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setRating(value);
                        onAction?.(`Trip rated: ${value}/5`);
                        showStatus(`Trip plan rated ${value}/5.`);
                      }}
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${
                        rating >= value
                          ? "border-orange-300/35 bg-orange-500 text-white"
                          : "border-white/10 bg-white/10 text-white/65"
                      }`}
                    >
                      <Star size={17} />
                    </button>
                  ))}
                </div>
                {rating ? (
                  <div className="mt-3 flex items-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-xs font-black text-emerald-100">
                    <CheckCircle2 size={15} />
                    Rating saved locally: {rating}/5
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
