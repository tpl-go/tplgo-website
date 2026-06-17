"use client";

import { useMemo, useState } from "react";
import { Boxes, Sparkles } from "lucide-react";
import {
  generateSmartBundles,
  type TiyaBundleId,
} from "@/app/lib/ecosystem/planner/plannerBundleEngine";
import type {
  TiyaGeneratedPlan,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import TiyaBundleCard from "./TiyaBundleCard";
import TiyaBundleCompare from "./TiyaBundleCompare";

type TiyaSmartBundleEngineProps = {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  isGenerating?: boolean;
};

export default function TiyaSmartBundleEngine({
  intent,
  plan,
  isGenerating = false,
}: TiyaSmartBundleEngineProps) {
  const bundles = useMemo(
    () => generateSmartBundles({ intent, plan }),
    [intent, plan]
  );
  const recommendedBundle = bundles.find((bundle) => bundle.isRecommended);
  const [selectedBundleId, setSelectedBundleId] = useState<TiyaBundleId>(
    recommendedBundle?.id ?? "comfort"
  );
  const [actionStatus, setActionStatus] = useState("");
  const safeBundles = Array.isArray(bundles) ? bundles : [];
  const selectedBundle =
    safeBundles.find((bundle) => bundle.id === selectedBundleId) ??
    recommendedBundle ??
    safeBundles[0];

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(14,165,233,0.22),transparent_28%),radial-gradient(circle_at_90%_14%,rgba(249,115,22,0.2),transparent_25%)]" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <Boxes
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              Smart bundle engine
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Intelligent TPL travel bundles
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Bundles transport, stays, transfers, activities, insurance,
              creator experiences and Local Life add-ons into OTA-ready
              package structures. Frontend-only simulation.
            </p>
          </div>
          {selectedBundle ? (
            <div className="rounded-3xl border border-orange-300/20 bg-orange-400/10 p-3 text-xs font-black text-orange-100">
              Selected: {selectedBundle.name}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5">
        <TiyaBundleCompare
          bundles={safeBundles}
          selectedBundle={selectedBundle}
        />

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {safeBundles.map((bundle) => (
            <TiyaBundleCard
              key={bundle.id}
              bundle={bundle}
              isSelected={selectedBundle?.id === bundle.id}
              onSelect={setSelectedBundleId}
            />
          ))}
        </div>

        <div className="grid gap-2 rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:grid-cols-4 sm:p-4">
          {[
            { label: "Compare Bundles - Feature Under Development", disabled: true },
            { label: "Customize Bundle - Feature Under Development", disabled: true },
            { label: "Proceed to Book", disabled: false },
            { label: "Request Expert Review - Use Expert Assistance", disabled: true },
          ].map((action, index) => (
            <button
              key={action.label}
              type="button"
              disabled={action.disabled}
              onClick={() => {
                if (action.label === "Proceed to Book") {
                  window.dispatchEvent(new Event("tpl:proceed-to-book"));
                  setActionStatus("Proceeding through protected Smart Planner review flow.");
                  return;
                }
                setActionStatus("Feature Under Development. Current bundle cards remain selectable for preview only.");
              }}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-black transition ${
                index === 2
                  ? "bg-orange-500 text-white shadow-[0_12px_32px_rgba(249,115,22,0.28)] hover:bg-orange-600"
                  : "border border-white/15 bg-white/10 text-white hover:bg-white/15"
              } disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-white/10`}
            >
              {index === 0 ? <Sparkles size={15} /> : null}
              {action.label}
            </button>
          ))}
          {actionStatus ? (
            <p className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-50 sm:col-span-4">
              {actionStatus}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
