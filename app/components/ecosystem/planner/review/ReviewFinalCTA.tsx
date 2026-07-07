"use client";

import Link from "next/link";
import {
  ArrowLeft,
  FileDown,
  LockKeyhole,
  Printer,
  Save,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import ReviewProceedGuard from "./ReviewProceedGuard";
import ReviewProceedStatus from "./ReviewProceedStatus";
import ReviewStickyBookingPanel from "./ReviewStickyBookingPanel";
import type { ReviewProceedController } from "./useReviewProceedToBook";
import {
  TIYA_REVIEW_DRAFT_KEY,
  type TiyaSmartPlannerReviewPayload,
} from "@/app/lib/ecosystem/planner/plannerReviewPayload";
import {
  buildPlannerDetailId,
  cleanupPlannerTempStorage,
  compactPlannerPayload,
  savePlannerDetailPayload,
} from "@/app/lib/ecosystem/planner/plannerPayloadStorage";

type ReviewFinalCTAProps = {
  payload: TiyaSmartPlannerReviewPayload;
  proceed: ReviewProceedController;
};

export default function ReviewFinalCTA({
  payload,
  proceed,
}: ReviewFinalCTAProps) {
  const trustNotes: Array<{ icon: LucideIcon; label: string }> = [
    { icon: ShieldCheck, label: "Secure booking handoff" },
    { icon: LockKeyhole, label: "Existing TPL booking flow" },
    { icon: FileDown, label: "Payment on next steps" },
    { icon: ShieldCheck, label: "Confirmation after payment" },
  ];

  function saveReviewDraft() {
    const draft = {
      checkoutPayload: payload,
      savedAt: new Date().toISOString(),
      source: "smart-planner",
    };
    window.sessionStorage.setItem(TIYA_REVIEW_DRAFT_KEY, JSON.stringify(draft));
    const detail = savePlannerDetailPayload(
      buildPlannerDetailId("manual_review_draft", payload),
      payload
    );
    const compactDraft = {
      ...draft,
      checkoutPayload: compactPlannerPayload(payload, detail.key || undefined),
      detailStorageKey: detail.key || undefined,
    };
    try {
      window.localStorage.setItem(TIYA_REVIEW_DRAFT_KEY, JSON.stringify(compactDraft));
    } catch {
      cleanupPlannerTempStorage();
      try {
        window.localStorage.setItem(TIYA_REVIEW_DRAFT_KEY, JSON.stringify(compactDraft));
      } catch {
        // Session draft is primary for the active review page.
      }
    }
  }

  function printReview() {
    window.print();
  }

  return (
    <section className="rounded-[2rem] border border-orange-200 bg-[linear-gradient(180deg,#fff7ed,#ffffff)] p-6 shadow-[0_18px_54px_rgba(154,52,18,0.08)]">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-700">
            Existing TPL Booking Handoff
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950">
            SMART PLANNER FINAL CTA
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-stone-700">
            Proceed to the existing TPL booking ecosystem with your selected
            Smart Planner basket.
          </p>
        </div>
        <div className="hidden rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-orange-700 xl:block">
          Payment on next steps
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-5">
          <ReviewProceedGuard blockers={proceed.blockers} />
          <ReviewProceedStatus
            message={proceed.statusMessage}
            state={proceed.statusState}
          />

          <div className="rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-[0_18px_54px_rgba(154,52,18,0.07)]">
            <div className="grid gap-3 xl:grid-cols-4">
              {trustNotes.map(({ icon: TrustIcon, label }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-orange-100 bg-orange-50/70 p-3"
                >
                  <TrustIcon size={17} className="text-orange-700" />
                  <p className="mt-2 text-xs font-black text-stone-700">{label}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={proceed.onProceed}
              disabled={proceed.isProcessing}
              className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-7 text-base font-black text-white shadow-[0_18px_38px_rgba(255,123,0,0.30)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {proceed.isProcessing
                ? "Preparing your booking handoff..."
                : "Proceed To Book"}
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Link
              href="/smart-planner/workspace"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-black text-slate-700"
            >
              <ArrowLeft size={15} />
              Back to Workspace
            </Link>
            <button
              type="button"
              onClick={saveReviewDraft}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-black text-slate-700"
            >
              <Save size={15} />
              Save Review Draft
            </button>
            <button
              type="button"
              onClick={printReview}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-black text-slate-700"
            >
              <Printer size={15} />
              Print Review
            </button>
          </div>
        </div>

        <ReviewStickyBookingPanel
          basketItemsCount={proceed.basketItemsCount}
          basketValue={proceed.basketValue}
          isProcessing={proceed.isProcessing}
          onProceed={proceed.onProceed}
          readiness={proceed.readiness}
          tripMode={
            proceed.mode === "FULL_TRIP_BOOKING"
              ? "Full Trip Booking"
              : "Partial Trip Booking"
          }
          warningsCount={proceed.warningsCount}
        />
      </div>
    </section>
  );
}
