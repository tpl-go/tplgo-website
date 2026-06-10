"use client";

import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Send, Sparkles } from "lucide-react";
import {
  calculatePackagePrice,
  generatePackageComponents,
  generatePackageVariants,
  getPackageSummary,
  type TiyaPackageComponent,
  type TiyaPackageVariantId,
} from "@/app/lib/ecosystem/planner/plannerPackageBuilder";
import type {
  TiyaGeneratedPlan,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import TiyaPackageComponents from "./TiyaPackageComponents";
import TiyaPackagePriceCard from "./TiyaPackagePriceCard";

type TiyaPackageBuilderProps = {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  isGenerating?: boolean;
};

export default function TiyaPackageBuilder({
  intent,
  plan,
  isGenerating = false,
}: TiyaPackageBuilderProps) {
  const initialComponents = useMemo(
    () => generatePackageComponents({ intent, plan }),
    [intent, plan]
  );
  const variants = useMemo(() => generatePackageVariants(intent), [intent]);
  const initialVariantId =
    variants.find((variant) => variant.highlight)?.id ?? "standard";
  const [components, setComponents] =
    useState<TiyaPackageComponent[]>(initialComponents);
  const [selectedVariantId, setSelectedVariantId] =
    useState<TiyaPackageVariantId>(initialVariantId);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setComponents(initialComponents);
      setSelectedVariantId(initialVariantId);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [initialComponents, initialVariantId]);

  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) ?? variants[1];
  const safeComponents = useMemo(
    () => (Array.isArray(components) ? components : []),
    [components]
  );
  const summary = useMemo(() => getPackageSummary(intent), [intent]);
  const price = useMemo(
    () =>
      calculatePackagePrice({
        components: safeComponents,
        variant: selectedVariant,
      }),
    [safeComponents, selectedVariant]
  );
  const selectedActivities = safeComponents.filter(
    (component) => component.type === "activity" && component.included
  );
  const selectedCreators = safeComponents.filter(
    (component) => component.type === "creator" && component.included
  );
  const selectedMarket = safeComponents.filter(
    (component) => component.type === "market" && component.included
  );

  function handleToggleComponent(componentId: string) {
    setComponents((currentComponents) =>
      currentComponents.map((component) =>
        component.id === componentId
          ? { ...component, included: !component.included }
          : component
      )
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(14,165,233,0.22),transparent_28%),radial-gradient(circle_at_90%_14%,rgba(249,115,22,0.2),transparent_25%)]" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <BriefcaseBusiness
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              Dynamic package builder
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              {summary.name}
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Convert the Tiya trip plan into a customizable TPL package with
              visual-only component selection and pricing simulation.
            </p>
          </div>
          <div className="rounded-3xl border border-orange-300/20 bg-orange-400/10 p-3 text-xs font-black text-orange-100">
            {summary.duration} · {summary.travellerCount} traveller
            {summary.travellerCount === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5">
        <div className="grid gap-3 xl:grid-cols-[1fr_340px]">
          <div className="grid gap-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                <Sparkles size={15} />
                Package summary
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  ["Route", summary.route],
                  ["Budget", summary.budgetTier],
                  ["Transport", summary.selectedTransport],
                  ["Stay", summary.selectedStay],
                  ["Activities", `${selectedActivities.length} bundle`],
                  ["Creator/Market", `${selectedCreators.length + selectedMarket.length} add-on`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/10 p-3"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                      {label}
                    </p>
                    <p className="mt-1 text-xs font-black text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                Package variants
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`min-w-[220px] rounded-3xl border p-3 text-left transition ${
                      selectedVariantId === variant.id
                        ? "border-orange-300/40 bg-orange-400/15"
                        : "border-white/10 bg-white/10 hover:bg-white/15"
                    }`}
                  >
                    <h3 className="text-sm font-black text-white">
                      {variant.name}
                    </h3>
                    <p className="mt-2 text-xs font-semibold leading-5 text-white/65">
                      {variant.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <TiyaPackageComponents
              components={safeComponents}
              onToggleComponent={handleToggleComponent}
            />
          </div>

          <div className="grid gap-3">
            <TiyaPackagePriceCard price={price} />
            <div className="grid gap-2 rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
              {[
                "Customize Package",
                "Save Package",
                "Request Expert Review",
                "Continue to Booking",
              ].map((action, index) => (
                <button
                  key={action}
                  type="button"
                  className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-black transition ${
                    index === 0
                      ? "bg-orange-500 text-white shadow-[0_12px_32px_rgba(249,115,22,0.28)] hover:bg-orange-600"
                      : "border border-white/15 bg-white/10 text-white hover:bg-white/15"
                  }`}
                >
                  {index === 2 ? <Send size={15} /> : null}
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
