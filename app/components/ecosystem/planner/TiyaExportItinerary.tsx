"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  FileText,
  Printer,
  Share2,
  X,
} from "lucide-react";
import {
  buildPlannerExport,
  type TiyaItineraryExport,
} from "@/app/lib/ecosystem/planner/plannerExportEngine";
import type {
  TiyaPlannerSnapshot,
  TiyaRouteOption,
  TiyaSmartAlert,
} from "@/app/lib/ecosystem/planner/plannerTypes";

type TiyaExportItineraryProps = {
  snapshot: TiyaPlannerSnapshot;
  selectedRoute?: TiyaRouteOption;
  smartAlerts?: TiyaSmartAlert[];
};

type ToastState = {
  title: string;
  detail: string;
};

function ExportSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 print:border-slate-200 print:bg-white">
      <h4 className="text-sm font-black text-white print:text-slate-950">
        {title}
      </h4>
      <div className="mt-3 grid gap-2">
        {safeItems.map((item) => (
          <p
            key={item}
            className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold leading-5 text-white/72 print:border-slate-200 print:bg-slate-50 print:text-slate-700"
          >
            {item}
          </p>
        ))}
      </div>
    </section>
  );
}

function ExportPreview({ exportData }: { exportData: TiyaItineraryExport }) {
  return (
    <div className="tiya-export-print rounded-3xl border border-white/10 bg-[#071a3b] p-4 text-white shadow-[0_22px_70px_rgba(0,0,0,0.24)] print:rounded-none print:border-0 print:bg-white print:p-0 print:text-slate-950 print:shadow-none sm:p-6">
      <div className="border-b border-white/10 pb-4 print:border-slate-200">
        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100 print:text-slate-500">
          Tiya Smart Planner export
        </div>
        <h2 className="mt-2 text-2xl font-black text-white print:text-slate-950 sm:text-3xl">
          {exportData.title}
        </h2>
        <p className="mt-2 text-base font-black text-orange-100 print:text-slate-800">
          {exportData.routeLine}
        </p>
        <p className="mt-2 text-sm font-semibold leading-6 text-white/70 print:text-slate-600">
          {exportData.metaLine}
        </p>
      </div>

      <div className="mt-4 grid gap-3 print:gap-3">
        <ExportSection title="Day-wise plan" items={exportData.dayLines} />
        <ExportSection
          title="Route intelligence"
          items={exportData.routeIntelligence}
        />
        <ExportSection
          title="Booking-ready modules"
          items={exportData.bookingModules}
        />
        <ExportSection title="Creator picks" items={exportData.creatorPicks} />
        <ExportSection
          title="Local market suggestions"
          items={exportData.localMarketPicks}
        />
        <ExportSection title="Budget summary" items={exportData.budgetSummary} />
        <ExportSection title="Smart alerts" items={exportData.smartAlerts} />
      </div>
    </div>
  );
}

export default function TiyaExportItinerary({
  snapshot,
  selectedRoute,
  smartAlerts = [],
}: TiyaExportItineraryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const exportData = useMemo(
    () => buildPlannerExport(snapshot, selectedRoute, smartAlerts),
    [selectedRoute, smartAlerts, snapshot]
  );

  function showToast(nextToast: ToastState) {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 2400);
  }

  async function copySummary() {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(exportData.shareText);
      showToast({
        title: "Itinerary copied",
        detail: "Professional trip summary copied to clipboard.",
      });
      return;
    }

    showToast({
      title: "Copy unavailable",
      detail: "Clipboard support is unavailable in this browser.",
    });
  }

  async function shareSummary() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: exportData.title,
          text: exportData.shareText,
        });
        showToast({
          title: "Itinerary shared",
          detail: "Share sheet completed successfully.",
        });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }

    await copySummary();
  }

  function printItinerary() {
    window.print();
  }

  return (
    <>
      <div className="rounded-3xl border border-white/80 bg-[#061839]/95 p-4 text-white shadow-[0_22px_70px_rgba(6,24,57,0.22)] backdrop-blur-xl">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
          <FileText size={16} />
          Itinerary export
        </div>
        <p className="mt-2 rounded-2xl border border-white/10 bg-white/10 p-3 text-xs font-bold leading-5 text-white/70">
          Preview, print, copy, or share the current Tiya plan in a
          professional itinerary format.
        </p>
        <div className="mt-4 grid gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-5 py-3 text-sm font-black text-white shadow-[0_12px_28px_rgba(255,123,0,0.32)] transition hover:-translate-y-0.5"
          >
            <FileText size={17} />
            Export Preview
          </button>
          <button
            type="button"
            onClick={shareSummary}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15"
          >
            <Share2 size={17} />
            Share Itinerary
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/78 px-3 py-4 backdrop-blur-xl tiya-export-no-print sm:px-6">
          <div className="mx-auto flex min-h-full max-w-5xl items-start justify-center">
            <div className="relative w-full">
              {toast ? (
                <div className="fixed left-4 right-4 top-4 z-[60] mx-auto max-w-sm rounded-2xl border border-emerald-200/30 bg-emerald-500 px-3 py-2 text-white shadow-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="text-xs font-black">{toast.title}</p>
                      <p className="text-[11px] font-semibold text-white/80">
                        {toast.detail}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mb-3 flex flex-col gap-2 rounded-3xl border border-white/10 bg-white/[0.08] p-3 text-white backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
                    Download-ready preview
                  </p>
                  <h3 className="mt-1 text-lg font-black">
                    Professional itinerary package
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex">
                  <button
                    type="button"
                    onClick={printItinerary}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-blue-950"
                  >
                    <Printer size={15} />
                    Print
                  </button>
                  <button
                    type="button"
                    onClick={copySummary}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black text-white"
                  >
                    <Copy size={15} />
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={shareSummary}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black text-white"
                  >
                    <Share2 size={15} />
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black text-white"
                  >
                    <X size={15} />
                    Close
                  </button>
                </div>
              </div>

              <ExportPreview exportData={exportData} />
            </div>
          </div>
        </div>
      ) : null}

      {isOpen ? (
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden !important;
            }

            .tiya-export-print,
            .tiya-export-print * {
              visibility: visible !important;
            }

            .tiya-export-print {
              background: #ffffff !important;
              color: #0f172a !important;
              left: 0 !important;
              margin: 0 !important;
              max-width: none !important;
              min-height: 100vh !important;
              padding: 24px !important;
              position: absolute !important;
              top: 0 !important;
              width: 100% !important;
            }

            .tiya-export-no-print {
              background: transparent !important;
              padding: 0 !important;
            }
          }
        `}</style>
      ) : null}
    </>
  );
}
