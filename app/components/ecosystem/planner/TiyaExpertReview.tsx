"use client";

import { useEffect, useMemo, useState } from "react";
import { Clipboard, Headset, MessageCircle, Save, Send, X } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import {
  buildLeadSummaryText,
  buildWhatsAppPreview,
  generateExpertLeadPayload,
  generateLeadPriority,
  saveExpertLeadDraftPayload,
  saveExpertLeadPayload,
  TIYA_EXPERT_LEADS_KEY,
  TIYA_LAST_EXPERT_REQUEST_KEY,
  type TiyaExpertContact,
  type TiyaExpertLeadPayload,
} from "@/app/lib/ecosystem/planner/plannerExpertLeadEngine";
import {
  MY_TRIPS_ACTIVE_TRIP_ID_KEY,
  loadMyTripById,
  saveMyTrip,
} from "@/app/lib/ecosystem/planner/myTripsStorage";
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
  onExpertRequestSaved?: (payload: TiyaExpertLeadPayload) => void;
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
  onExpertRequestSaved,
}: TiyaExpertReviewProps) {
  const { isAuthenticated, user } = useAuth();
  const [contact, setContact] = useState<TiyaExpertContact>(defaultContact);
  const [statusMessage, setStatusMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof TiyaExpertContact, string>>
  >({});
  const [whatsAppPreview, setWhatsAppPreview] = useState("");
  const [manualCopyText, setManualCopyText] = useState("");
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
    () => {
      const payload = generateExpertLeadPayload({
        intent,
        plan,
        selectedRoute,
        contact,
      });

      return {
        ...payload,
        userId: isAuthenticated ? user?.id : undefined,
      };
    },
    [contact, intent, isAuthenticated, plan, selectedRoute, user?.id]
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

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const timer = window.setTimeout(() => {
      setContact((current) => ({
        ...current,
        name:
          current.name ||
          user.fullName ||
          [user.leadTraveller?.firstName, user.leadTraveller?.lastName]
            .filter(Boolean)
            .join(" "),
        mobile: current.mobile || user.leadTraveller?.phone || user.mobile || "",
        email: current.email || user.leadTraveller?.email || user.email || "",
      }));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isAuthenticated, user]);

  function validateContact() {
    const errors: Partial<Record<keyof TiyaExpertContact, string>> = {};
    if (!contact.name.trim()) errors.name = "Name is required.";
    if (!contact.mobile.trim()) errors.mobile = "Mobile is required.";
    if (!contact.communicationMode) {
      errors.communicationMode = "Select at least one communication mode.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function activeTripId() {
    if (typeof window === "undefined") return "";
    return window.sessionStorage.getItem(MY_TRIPS_ACTIVE_TRIP_ID_KEY) || "";
  }

  function attachExpertRequestToMyTrip(payload: TiyaExpertLeadPayload) {
    const activeTrip = loadMyTripById(activeTripId());
    if (!activeTrip) return false;
    const nextRequests = [
      payload,
      ...(activeTrip.expertRequests || []).filter(
        (request) => request.leadId !== payload.leadId
      ),
    ].slice(0, 10);

    saveMyTrip({
      ...activeTrip,
      expertRequests: nextRequests,
      updatedAt: new Date().toISOString(),
    });
    return true;
  }

  function buildLeadPayload(status: TiyaExpertLeadPayload["status"]) {
    return {
      ...leadPayload,
      status,
      updatedAt: new Date().toISOString(),
    };
  }

  function saveLead({
    payload,
    message,
    appendToLeadList,
    notifyWorkspace,
  }: {
    payload: TiyaExpertLeadPayload;
    message: string;
    appendToLeadList: boolean;
    notifyWorkspace: boolean;
  }) {
    if (appendToLeadList) {
      saveExpertLeadPayload(payload);
    } else {
      saveExpertLeadDraftPayload(payload);
    }
    const attached = attachExpertRequestToMyTrip(payload);
    if (notifyWorkspace) {
      onExpertRequestSaved?.(payload);
    }
    setStatusMessage(
      `${message}${attached ? " Attached to My Trips." : " Frontend lead draft saved. Backend/CRM sync pending."}`
    );
  }

  async function handleCopyLeadSummary() {
    const text = buildLeadSummaryText(leadPayload);

    try {
      await navigator.clipboard.writeText(text);
      setStatusMessage("Lead summary copied");
    } catch {
      setManualCopyText(text);
      setStatusMessage("Clipboard unavailable. Lead summary is ready for manual copy.");
    }
  }

  function handleSaveDraft() {
    saveLead({
      payload: buildLeadPayload("draft"),
      message: "Lead draft saved.",
      appendToLeadList: false,
      notifyWorkspace: false,
    });
  }

  function handleRequestExpertReview() {
    if (!validateContact()) {
      setStatusMessage("");
      return;
    }

    saveLead({
      payload: buildLeadPayload("submitted"),
      message: "Expert review request saved. Our travel expert will contact you.",
      appendToLeadList: true,
      notifyWorkspace: true,
    });
  }

  function handleWhatsAppPreview() {
    setWhatsAppPreview(buildWhatsAppPreview(buildLeadPayload("draft")));
    setStatusMessage("WhatsApp text preview generated");
  }

  async function handleCopyWhatsAppText() {
    try {
      await navigator.clipboard.writeText(whatsAppPreview);
      setStatusMessage("WhatsApp text copied");
    } catch {
      setManualCopyText(whatsAppPreview);
      setStatusMessage("Clipboard unavailable. WhatsApp text is ready for manual copy.");
    }
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
              Expert Review / CRM Handoff
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              This is not booking. It creates a frontend expert review request
              and CRM-style lead draft. Backend/CRM sync pending.
            </p>
          </div>
          <div className="rounded-3xl border border-orange-300/20 bg-orange-400/10 p-3 text-xs font-black text-orange-100">
            Priority score {priority.priorityScore}/100
          </div>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 p-3 sm:p-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]">
        <div className="grid min-w-0 gap-3">
          <div className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              Expert review panel
            </div>
            <div className="mt-3 grid min-w-0 grid-cols-1 gap-2 md:grid-cols-2 2xl:grid-cols-3">
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
                  className="min-w-0 rounded-2xl border border-white/10 bg-white/10 p-3"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                    {label}
                  </p>
                  <p className="mt-1 line-clamp-2 break-words text-xs font-black text-white">
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

          <TiyaExpertRequestForm
            contact={contact}
            errors={fieldErrors}
            onChange={(nextContact) => {
              setContact(nextContact);
              setFieldErrors((current) => {
                const nextErrors = { ...current };
                if (nextContact.name.trim()) delete nextErrors.name;
                if (nextContact.mobile.trim()) delete nextErrors.mobile;
                if (nextContact.communicationMode) {
                  delete nextErrors.communicationMode;
                }
                return nextErrors;
              });
            }}
          />
        </div>

        <aside className="grid h-fit min-w-0 gap-3">
          <div className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
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
                  className="min-w-0 rounded-2xl border border-white/10 bg-white/10 p-3"
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

          <div className="grid min-w-0 gap-2 rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <button
              type="button"
              onClick={handleRequestExpertReview}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-white shadow-[0_12px_32px_rgba(249,115,22,0.28)] transition hover:bg-orange-600"
            >
              <Send size={15} />
              Request Expert Review
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/15"
            >
              <Save size={15} />
              Save Lead Draft
            </button>
            <button
              type="button"
              onClick={handleCopyLeadSummary}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/15"
            >
              <Clipboard size={15} />
              Copy Lead Summary
            </button>
            <button
              type="button"
              onClick={handleWhatsAppPreview}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/15"
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

          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-xs font-semibold leading-5 text-cyan-50">
            Storage keys: {TIYA_EXPERT_LEADS_KEY},{" "}
            {TIYA_LAST_EXPERT_REQUEST_KEY}
          </div>
        </aside>
      </div>

      {whatsAppPreview ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-cyan-300/20 bg-[#07172f] shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
                  WhatsApp text preview
                </p>
                <h3 className="mt-1 text-lg font-black text-white">
                  Expert review message
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setWhatsAppPreview("")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:bg-white/15"
                aria-label="Close WhatsApp preview"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4">
              <pre className="max-h-[45vh] whitespace-pre-wrap break-words rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm font-semibold leading-6 text-cyan-50">
                {whatsAppPreview}
              </pre>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleCopyWhatsAppText}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-orange-500 px-4 text-sm font-black text-white transition hover:bg-orange-600"
                >
                  <Clipboard size={15} />
                  Copy WhatsApp Text
                </button>
                <button
                  type="button"
                  onClick={() => setWhatsAppPreview("")}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 text-sm font-black text-white transition hover:bg-white/15"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {manualCopyText ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/12 bg-[#07172f] shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
                  Manual copy
                </p>
                <h3 className="mt-1 text-lg font-black text-white">
                  Clipboard fallback
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setManualCopyText("")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:bg-white/15"
                aria-label="Close manual copy"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4">
              <textarea
                readOnly
                value={manualCopyText}
                className="min-h-[220px] w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm font-semibold leading-6 text-cyan-50 outline-none"
              />
              <button
                type="button"
                onClick={() => setManualCopyText("")}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-orange-500 px-4 text-sm font-black text-white transition hover:bg-orange-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
