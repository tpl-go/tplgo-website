"use client";

import { useMemo, useState } from "react";
import {
  Camera,
  Gift,
  Heart,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Star,
} from "lucide-react";
import {
  generateDefaultTripMemory,
  generateNextTripSuggestions,
  generatePostTripProducts,
  generatePostTripSummary,
  type TiyaTripMemoryCapture,
} from "@/app/lib/ecosystem/planner/plannerPostTripEngine";
import type {
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";

type TiyaPostTripEcosystemProps = {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  days: TiyaDayPlan[];
  selectedRoute?: TiyaRouteOption;
  isGenerating?: boolean;
};

export default function TiyaPostTripEcosystem({
  intent,
  plan,
  days,
  selectedRoute,
  isGenerating = false,
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

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(14,165,233,0.22),transparent_28%),radial-gradient(circle_at_90%_14%,rgba(249,115,22,0.2),transparent_25%)]" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <RotateCcw
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              Smart post-trip ecosystem
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Post-trip memory and ecosystem loop
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Captures trip memory, creator upload prompts, local market
              follow-up, loyalty signals and next-trip suggestions. Frontend
              only.
            </p>
          </div>
          <div className="rounded-3xl border border-orange-300/20 bg-orange-400/10 p-3 text-xs font-black text-orange-100">
            Experience score {summary.experienceScore}%
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-3">
          {[
            ["Completed trip", summary.completedTripSnapshot],
            ["Route covered", summary.routeCovered],
            ["Days travelled", `${summary.daysTravelled}`],
            ["Creator/local market", summary.creatorLocalMarketEngagement],
            ["Estimated spend", `₹${summary.estimatedSpend.toLocaleString("en-IN")}`],
            ["Experience score", `${summary.experienceScore}%`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                {label}
              </p>
              <p className="mt-2 text-sm font-black text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 xl:grid-cols-[1fr_360px]">
          <div className="grid gap-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                <Heart size={15} />
                Trip memory capture
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
                    className="grid gap-1 text-xs font-black text-white"
                  >
                    {label}
                    <input
                      value={memory[key as keyof TiyaTripMemoryCapture]}
                      onChange={(event) =>
                        updateMemory({
                          [key]: event.target.value,
                        } as Partial<TiyaTripMemoryCapture>)
                      }
                      className="min-h-11 rounded-2xl border border-white/10 bg-white/10 px-3 text-sm font-bold text-white outline-none placeholder:text-white/40 focus:border-orange-300/45"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-3xl border border-orange-300/20 bg-orange-400/10 p-3 sm:p-4">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
                  <Camera size={15} />
                  Creator upload CTA
                </div>
                <h3 className="mt-3 text-xl font-black text-white">
                  Camera on. Revenue strong.
                </h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-orange-50/85">
                  Upload trip photos/videos, become a TPL creator and license
                  travel content from this route.
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {["Upload media", "Become creator", "License content"].map(
                    (action) => (
                      <button
                        key={action}
                        type="button"
                        className="min-h-10 rounded-full border border-orange-300/20 bg-white/10 px-3 text-xs font-black text-white transition hover:bg-white/15"
                      >
                        {action}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                  <Gift size={15} />
                  Review and loyalty layer
                </div>
                <div className="mt-3 grid gap-2">
                  {[
                    "Rate trip plan",
                    "Save as travel memory",
                    "Recommend similar route",
                    "Wallet/credit placeholder",
                  ].map((action) => (
                    <button
                      key={action}
                      type="button"
                      className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/15 bg-white/10 px-3 text-xs font-black text-white transition hover:bg-white/15"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="grid h-fit gap-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                <ShoppingBag size={15} />
                Local market follow-up
              </div>
              <div className="mt-3 grid gap-2">
                {safeProducts.map((product) => (
                  <article
                    key={product.id}
                    className="rounded-2xl border border-white/10 bg-white/10 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black text-white">
                          {product.title}
                        </h3>
                        <p className="mt-1 text-xs font-semibold leading-5 text-white/60">
                          {product.region} · {product.detail}
                        </p>
                      </div>
                      <span className="rounded-full bg-orange-400/15 px-2.5 py-1 text-[10px] font-black text-orange-100">
                        {product.tag}
                      </span>
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
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {safeNextTrips.map((suggestion) => (
              <article
                key={suggestion.id}
                className="rounded-3xl border border-white/10 bg-white/10 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <Star className="h-4 w-4 shrink-0 text-orange-100" />
                  <span className="rounded-full bg-cyan-300/10 px-2.5 py-1 text-[11px] font-black text-cyan-100">
                    {suggestion.fit}% fit
                  </span>
                </div>
                <h3 className="mt-3 text-base font-black text-white">
                  {suggestion.title}
                </h3>
                <p className="mt-2 text-xs font-semibold leading-5 text-white/65">
                  {suggestion.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
