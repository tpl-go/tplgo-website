"use client";

import { useMemo, useState } from "react";
import { Clipboard, Headset, MessageCircle, Save, Send } from "lucide-react";
import {
  buildLeadSummaryText,
  buildWhatsAppPreview,
  generateExpertLeadPayload,
  generateLeadPriority,
  saveExpertLeadPayload,
  TIYA_EXPERT_LEADS_KEY,
  TIYA_LAST_EXPERT_REQUEST_KEY,
  type TiyaExpertContact,
} from "@/app/lib/ecosystem/planner/plannerExpertLeadEngine";
import { generateCheckoutDraft } from "@/app/lib/ecosystem/planner/plannerCheckoutBridge";
import type {
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import TiyaExpertRequestForm from "./TiyaExpertRequestForm";

type TiyaExpertReviewProps = {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  selectedRoute?: TiyaRouteOption;
  isGenerating?: boolean;
};

const defaultContact: TiyaExpertContact = {
  name: "",
  mobile: "",
  email: "",
  preferredContactTime: "",
  communicationMode: "Call",
  specialRequest: "",
};

export default function TiyaExpertReview({
  intent,
  plan,
  selectedRoute,
  isGenerating = false,
}: TiyaExpertReviewProps) {
  const [contact, setContact] = useState<TiyaExpertContact>(defaultContact);
  const [statusMessage, setStatusMessage] = useState("");
  const [whatsAppPreview, setWhatsAppPreview] = useState("");
  const checkoutDraft = useMemo(
    () => generateCheckoutDraft({ intent, plan }),
    [intent, plan]
  );
  const priority = useMemo(
    () =>
      generateLeadPriority({
        intent,
        checkoutDraft,
        selectedRoute,
      }),
    [checkoutDraft, intent, selectedRoute]
  );
  const leadPayload = useMemo(
    () =>
      generateExpertLeadPayload({
        intent,
        plan,
        selectedRoute,
        contact,
      }),
    [contact, intent, plan, selectedRoute]
  );
  const selectedServices = Array.isArray(checkoutDraft.bookingModules)
    ? checkoutDraft.bookingModules
    : [];
  const specialPreferences = [
    intent.smartPreferences.includeInsurance ? "Insurance" : "",
    intent.smartPreferences.includeCreatorSpots ? "Creator spots" : "",
    intent.smartPreferences.includeLocalMarket ? "Local market" : "",
    intent.smartPreferences.avoidNightTravel ? "Avoid night travel" : "",
    intent.smartPreferences.preferScenicRoute ? "Scenic route" : "",
    intent.pets ? "Pet-friendly" : "",
  ].filter(Boolean);

  async function handleCopyLeadSummary() {
    const text = buildLeadSummaryText(leadPayload);

    try {
      await navigator.clipboard.writeText(text);
      setStatusMessage("Lead summary copied");
    } catch {
      setStatusMessage(text);
    }
  }

  function handleSaveLead() {
    saveExpertLeadPayload(leadPayload);
    setStatusMessage("Expert lead draft saved");
  }

  function handleWhatsAppPreview() {
    setWhatsAppPreview(buildWhatsAppPreview(leadPayload));
    setStatusMessage("WhatsApp text preview generated");
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(14,165,233,0.22),transparent_28%),radial-gradient(circle_at_90%_14%,rgba(249,115,22,0.2),transparent_25%)]" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <Headset
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              Expert review and CRM escalation
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Expert-assisted booking handoff
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Captures a frontend-only expert review request and CRM-style lead
              payload for future TPL sales workflow integration.
            </p>
          </div>
          <div className="rounded-3xl border border-orange-300/20 bg-orange-400/10 p-3 text-xs font-black text-orange-100">
            Priority score {priority.priorityScore}/100
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              Expert review panel
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {[
                ["Trip summary", `${intent.travelStyle} · ${intent.pace}`],
                ["Route/scenario", selectedRoute?.name || checkoutDraft.route],
                ["Quote estimate", `₹${checkoutDraft.quotePreview.totalQuoteEstimate.toLocaleString("en-IN")}`],
                ["Selected bundle", checkoutDraft.selectedBundle.name],
                ["Travellers", `${checkoutDraft.travellers.total}`],
                ["Travel dates", `${checkoutDraft.dates.startDate} to ${checkoutDraft.dates.endDate}`],
                ["Budget tier", intent.budgetTier],
                ["Risk/alert summary", priority.priorityReasons.join(", ")],
                ["Services", `${selectedServices.length} matched`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/10 p-3"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                    {label}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs font-black text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(specialPreferences.length ? specialPreferences : ["Standard preferences"]).map(
                (preference) => (
                  <span
                    key={preference}
                    className="rounded-full border border-orange-300/20 bg-orange-400/10 px-3 py-2 text-xs font-black text-orange-100"
                  >
                    {preference}
                  </span>
                )
              )}
            </div>
          </div>

          <TiyaExpertRequestForm contact={contact} onChange={setContact} />
        </div>

        <aside className="grid h-fit gap-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              CRM lead payload preview
            </div>
            <div className="mt-3 grid gap-2">
              {[
                ["Lead ID", leadPayload.leadId],
                ["Planner trip ID", leadPayload.plannerTripId],
                ["Lead source", leadPayload.leadSource],
                ["Priority", `${leadPayload.priorityScore}/100`],
                ["Created", new Date(leadPayload.createdAt).toLocaleString()],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/10 p-3"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                    {label}
                  </p>
                  <p className="mt-1 break-words text-xs font-black text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2 rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <button
              type="button"
              onClick={handleSaveLead}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-white shadow-[0_12px_32px_rgba(249,115,22,0.28)] transition hover:bg-orange-600"
            >
              <Send size={15} />
              Request Expert Review
            </button>
            <button
              type="button"
              onClick={handleSaveLead}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/15"
            >
              <Save size={15} />
              Save Lead Draft
            </button>
            <button
              type="button"
              onClick={handleCopyLeadSummary}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/15"
            >
              <Clipboard size={15} />
              Copy Lead Summary
            </button>
            <button
              type="button"
              onClick={handleWhatsAppPreview}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/15"
            >
              <MessageCircle size={15} />
              WhatsApp Text Preview
            </button>
            {statusMessage ? (
              <p className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-center text-xs font-black text-emerald-100">
                {statusMessage}
              </p>
            ) : null}
          </div>

          {whatsAppPreview ? (
            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-xs font-semibold leading-5 text-cyan-50">
              {whatsAppPreview}
            </div>
          ) : null}

          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-xs font-semibold leading-5 text-cyan-50">
            Storage keys: {TIYA_EXPERT_LEADS_KEY},{" "}
            {TIYA_LAST_EXPERT_REQUEST_KEY}
          </div>
        </aside>
      </div>
    </section>
  );
}
