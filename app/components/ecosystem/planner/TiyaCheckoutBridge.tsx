"use client";

import { useMemo, useState } from "react";
import { CreditCard, Database, Send, Sparkles } from "lucide-react";
import {
  generateCheckoutChecklist,
  generateCheckoutDraft,
  saveCheckoutDraft,
  TIYA_CHECKOUT_DRAFT_KEY,
  TIYA_QUOTE_PREVIEW_KEY,
  TIYA_SELECTED_BUNDLE_KEY,
} from "@/app/lib/ecosystem/planner/plannerCheckoutBridge";
import type {
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import TiyaCheckoutChecklist from "./TiyaCheckoutChecklist";

type TiyaCheckoutBridgeProps = {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  selectedRoute?: TiyaRouteOption;
  isGenerating?: boolean;
};

export default function TiyaCheckoutBridge({
  intent,
  plan,
  selectedRoute,
  isGenerating = false,
}: TiyaCheckoutBridgeProps) {
  const draft = useMemo(
    () => generateCheckoutDraft({ intent, plan }),
    [intent, plan]
  );
  const checklist = useMemo(
    () => generateCheckoutChecklist({ intent, draft }),
    [draft, intent]
  );
  const [draftSavedAt, setDraftSavedAt] = useState<string | undefined>();
  const selectedServices = Array.isArray(draft.bookingModules)
    ? draft.bookingModules
    : [];
  const addOns = Array.isArray(draft.addOns) ? draft.addOns : [];

  function handleSaveDraft() {
    saveCheckoutDraft(draft);
    setDraftSavedAt(new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }));
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(14,165,233,0.22),transparent_28%),radial-gradient(circle_at_90%_14%,rgba(249,115,22,0.2),transparent_25%)]" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <CreditCard
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              Trip checkout flow bridge
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Tiya checkout handoff draft
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Prepares the selected trip, bundle, quote and service modules for
              a future TPL checkout flow. No payment or real booking starts here.
            </p>
          </div>
          <div className="rounded-3xl border border-orange-300/20 bg-orange-400/10 p-3 text-xs font-black text-orange-100">
            ₹{draft.quotePreview.totalQuoteEstimate.toLocaleString("en-IN")} quote preview
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <Sparkles size={15} />
              Checkout bridge panel
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {[
                ["Trip intent", `${intent.travelStyle} · ${intent.pace}`],
                ["Route/scenario", selectedRoute?.name || draft.route],
                ["Package variant", intent.budgetTier],
                ["Quote", `₹${draft.quotePreview.totalQuoteEstimate.toLocaleString("en-IN")}`],
                ["Selected bundle", draft.selectedBundle.name],
                ["Travellers", `${draft.travellers.total}`],
                ["Dates", `${draft.dates.startDate} to ${draft.dates.endDate}`],
                ["Payment", "Not started"],
                ["Draft ID", draft.plannerTripId],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/10 p-3"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                    {label}
                  </p>
                  <p className="mt-1 truncate text-xs font-black text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                Selected services
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedServices.map((service) => (
                  <span
                    key={service.id}
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white"
                  >
                    {service.serviceName}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                Add-ons
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(addOns.length ? addOns : ["No add-ons selected yet"]).map((addOn) => (
                  <span
                    key={addOn}
                    className="rounded-full border border-orange-300/20 bg-orange-400/10 px-3 py-2 text-xs font-black text-orange-100"
                  >
                    {addOn}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <TiyaCheckoutChecklist items={checklist} />
        </div>

        <aside className="grid h-fit gap-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <Database size={15} />
              Traveller handoff data
            </div>
            <div className="mt-3 grid gap-2">
              {[
                ["Route", draft.route],
                ["Bundle", draft.selectedBundle.name],
                ["Package estimate", `₹${draft.packageEstimate.toLocaleString("en-IN")}`],
                ["Modules", `${selectedServices.length}`],
                ["Payment started", "No"],
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

          <div className="grid gap-2 rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            {[
              "Review Trip Booking",
              "Send to Expert",
              "Save Checkout Draft",
              "Continue Visual-only",
            ].map((action, index) => (
              <button
                key={action}
                type="button"
                onClick={index === 2 ? handleSaveDraft : undefined}
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-black transition ${
                  index === 0
                    ? "bg-orange-500 text-white shadow-[0_12px_32px_rgba(249,115,22,0.28)] hover:bg-orange-600"
                    : "border border-white/15 bg-white/10 text-white hover:bg-white/15"
                }`}
              >
                {index === 1 ? <Send size={15} /> : null}
                {action}
              </button>
            ))}
            {draftSavedAt ? (
              <p className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-center text-xs font-black text-emerald-100">
                Checkout draft saved at {draftSavedAt}
              </p>
            ) : null}
          </div>

          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-xs font-semibold leading-5 text-cyan-50">
            Storage keys: {TIYA_CHECKOUT_DRAFT_KEY}, {TIYA_SELECTED_BUNDLE_KEY},{" "}
            {TIYA_QUOTE_PREVIEW_KEY}
          </div>
        </aside>
      </div>
    </section>
  );
}
