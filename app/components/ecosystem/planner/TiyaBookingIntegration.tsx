"use client";

import { useMemo } from "react";
import { Cable, Route } from "lucide-react";
import {
  generateBookingBridgeItems,
  generateItineraryBookingStatuses,
} from "@/app/lib/ecosystem/planner/plannerBookingBridge";
import {
  generateConversionWidgets,
  generateSmartUpsells,
} from "@/app/lib/ecosystem/planner/plannerConversionEngine";
import { generateCommerceBundles } from "@/app/lib/ecosystem/planner/plannerCommerceEngine";
import type {
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import TiyaBookingWidgets from "./TiyaBookingWidgets";
import TiyaConversionRail from "./TiyaConversionRail";
import TiyaTripCommerceLayer from "./TiyaTripCommerceLayer";

type TiyaBookingIntegrationProps = {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  days: TiyaDayPlan[];
  selectedRoute?: TiyaRouteOption;
  isGenerating?: boolean;
};

export default function TiyaBookingIntegration({
  intent,
  plan,
  days,
  selectedRoute,
  isGenerating = false,
}: TiyaBookingIntegrationProps) {
  const bookingItems = useMemo(
    () => generateBookingBridgeItems({ intent, plan, selectedRoute }),
    [intent, plan, selectedRoute]
  );
  const statuses = useMemo(
    () => generateItineraryBookingStatuses({ days, intent }),
    [days, intent]
  );
  const widgets = useMemo(
    () => generateConversionWidgets({ intent, plan, selectedRoute, bookingItems }),
    [bookingItems, intent, plan, selectedRoute]
  );
  const upsells = useMemo(
    () => generateSmartUpsells({ intent, selectedRoute }),
    [intent, selectedRoute]
  );
  const bundles = useMemo(
    () => generateCommerceBundles({ intent, plan }),
    [intent, plan]
  );
  const primaryCount = bookingItems.filter((item) => item.isPrimary).length;

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(14,165,233,0.22),transparent_28%),radial-gradient(circle_at_90%_14%,rgba(249,115,22,0.2),transparent_25%)]" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <Cable
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              Deep booking integration layer
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Tiya to TPL booking bridge
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Simulates how planner output connects to TPL flights, stays,
              packages, activities, insurance, local transport and marketplace
              journeys without backend or payment changes.
            </p>
          </div>
          <div className="rounded-3xl border border-orange-300/20 bg-orange-400/10 p-3">
            <div className="flex items-center gap-2 text-xs font-black text-orange-100">
              <Route size={15} />
              {primaryCount} high-fit booking module{primaryCount === 1 ? "" : "s"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5">
        <TiyaBookingWidgets bookingItems={bookingItems} widgets={widgets} />
        <TiyaConversionRail statuses={statuses} upsells={upsells} />
        <TiyaTripCommerceLayer bundles={bundles} />
      </div>
    </section>
  );
}
