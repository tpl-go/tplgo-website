"use client";

import { useMemo, useState } from "react";
import { FileText, Sparkles } from "lucide-react";
import {
  generateQuoteBreakup,
  generateQuoteSummary,
  generateQuoteVersions,
  generateSmartQuoteNotes,
  type TiyaQuoteVersionId,
} from "@/app/lib/ecosystem/planner/plannerQuoteEngine";
import type {
  TiyaGeneratedPlan,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import TiyaQuoteActions from "./TiyaQuoteActions";
import TiyaQuoteBreakup from "./TiyaQuoteBreakup";

type TiyaQuoteGeneratorProps = {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  isGenerating?: boolean;
};

const noteTone = {
  info: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
  warning: "border-orange-300/20 bg-orange-400/10 text-orange-100",
  success: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
};

export default function TiyaQuoteGenerator({
  intent,
  plan,
  isGenerating = false,
}: TiyaQuoteGeneratorProps) {
  const versions = useMemo(() => generateQuoteVersions(intent), [intent]);
  const initialVersionId =
    versions.find((version) => version.isRecommended)?.id ?? "standard";
  const [selectedVersionId, setSelectedVersionId] =
    useState<TiyaQuoteVersionId>(initialVersionId);
  const selectedVersion =
    versions.find((version) => version.id === selectedVersionId) ?? versions[1];
  const summary = useMemo(
    () => generateQuoteSummary({ intent, version: selectedVersion }),
    [intent, selectedVersion]
  );
  const breakup = useMemo(
    () =>
      generateQuoteBreakup({
        intent,
        plan,
        versionId: selectedVersion.id,
      }),
    [intent, plan, selectedVersion.id]
  );
  const notes = useMemo(
    () => generateSmartQuoteNotes({ intent, version: selectedVersion }),
    [intent, selectedVersion]
  );
  const safeNotes = Array.isArray(notes) ? notes : [];

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(14,165,233,0.22),transparent_28%),radial-gradient(circle_at_90%_14%,rgba(249,115,22,0.2),transparent_25%)]" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <FileText
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              Auto quote generator
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              {summary.quoteTitle}
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Professional TPL quote preview generated from the selected Tiya
              trip context. Frontend-only estimate, no live inventory or payment.
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
                Quote summary
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  ["Route", summary.route],
                  ["Variant", summary.selectedPackageVariant],
                  ["Travel style", summary.travelStyle],
                  ["Budget tier", summary.budgetTier],
                  ["Validity", "Preview only"],
                  ["Traveller count", `${summary.travellerCount}`],
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
              <p className="mt-3 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-xs font-semibold leading-5 text-cyan-50">
                {summary.validityNote}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                Quote versions
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {versions.map((version) => (
                  <button
                    key={version.id}
                    type="button"
                    onClick={() => setSelectedVersionId(version.id)}
                    className={`min-w-[220px] rounded-3xl border p-3 text-left transition ${
                      selectedVersionId === version.id
                        ? "border-orange-300/40 bg-orange-400/15"
                        : "border-white/10 bg-white/10 hover:bg-white/15"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-black text-white">
                        {version.name}
                      </h3>
                      {version.isRecommended ? (
                        <span className="rounded-full bg-orange-500 px-2 py-1 text-[10px] font-black text-white">
                          Fit
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-xs font-semibold leading-5 text-white/60">
                      {version.note}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                Smart quote notes
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {safeNotes.map((note) => (
                  <p
                    key={note.id}
                    className={`rounded-2xl border p-3 text-xs font-semibold leading-5 ${noteTone[note.tone]}`}
                  >
                    {note.text}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <TiyaQuoteBreakup breakup={breakup} />
            <TiyaQuoteActions />
          </div>
        </div>
      </div>
    </section>
  );
}
