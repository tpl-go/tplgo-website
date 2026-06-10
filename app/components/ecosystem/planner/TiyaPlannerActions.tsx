"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Download, Share2 } from "lucide-react";
import { useState } from "react";
import type { TiyaPlannerSnapshot } from "@/app/lib/ecosystem/planner/plannerTypes";
import { savePlannerTrip } from "@/app/lib/ecosystem/planner/plannerStorage";
import { sharePlannerTrip } from "@/app/lib/ecosystem/planner/plannerShareEngine";

type TiyaPlannerActionsProps = {
  snapshot: TiyaPlannerSnapshot;
  hasUnsavedChanges: boolean;
  lastSavedAt?: string;
  onSaved: (snapshot: TiyaPlannerSnapshot) => void;
};

type ToastState = {
  title: string;
  detail: string;
};

function formatSavedAt(savedAt?: string) {
  if (!savedAt) return "Not saved yet";

  return new Date(savedAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TiyaPlannerActions({
  snapshot,
  hasUnsavedChanges,
  lastSavedAt,
  onSaved,
}: TiyaPlannerActionsProps) {
  const [toast, setToast] = useState<ToastState | null>(null);

  function showToast(nextToast: ToastState) {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 2400);
  }

  function handleSaveTrip() {
    const savedTrip = savePlannerTrip(snapshot);
    onSaved(savedTrip);
    showToast({
      title: "Trip saved",
      detail: "Saved locally in Tiya Smart Planner.",
    });
  }

  async function handleShareTrip() {
    const result = await sharePlannerTrip(snapshot);

    if (result === "shared") {
      showToast({
        title: "Trip shared",
        detail: "Share sheet completed successfully.",
      });
      return;
    }

    if (result === "copied") {
      showToast({
        title: "Trip copied",
        detail: "Summary copied to clipboard.",
      });
      return;
    }

    if (result !== "cancelled") {
      showToast({
        title: "Share unavailable",
        detail: "Copy support is unavailable in this browser.",
      });
    }
  }

  return (
    <div className="relative rounded-3xl border border-white/80 bg-[#061839]/95 p-4 text-white shadow-[0_22px_70px_rgba(6,24,57,0.22)] backdrop-blur-xl">
      {toast ? (
        <div className="absolute -top-3 left-4 right-4 z-10 rounded-2xl border border-emerald-200/30 bg-emerald-500 px-3 py-2 text-white shadow-lg">
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

      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
        <CheckCircle2 size={16} />
        Trip actions
      </div>
      <div className="mt-2 rounded-2xl border border-white/10 bg-white/10 p-3 text-xs font-bold leading-5 text-white/70">
        {hasUnsavedChanges ? "Unsaved changes" : "Saved state active"} · Last
        saved {formatSavedAt(lastSavedAt)}
      </div>
      <div className="mt-4 grid gap-2">
        <button
          type="button"
          onClick={handleSaveTrip}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-5 py-3 text-sm font-black text-white shadow-[0_12px_28px_rgba(255,123,0,0.32)] transition hover:-translate-y-0.5"
        >
          <Download size={17} />
          Save Trip
        </button>
        <button
          type="button"
          onClick={handleShareTrip}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15"
        >
          <Share2 size={17} />
          Share Trip
        </button>
        <Link
          href="/holidays"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-blue-900 transition hover:bg-cyan-50"
        >
          Continue to Booking
          <ArrowRight size={17} />
        </Link>
      </div>
    </div>
  );
}
