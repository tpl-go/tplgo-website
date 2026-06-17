"use client";

import { useState } from "react";
import {
  BookOpenCheck,
  Clipboard,
  Download,
  Lightbulb,
  MapPinned,
  PencilLine,
} from "lucide-react";
import type {
  TiyaPlannerSnapshot,
  TiyaTripNotes,
} from "@/app/lib/ecosystem/planner/plannerTypes";

type TiyaTripNotesProps = {
  notes: TiyaTripNotes;
  activeTrip?: TiyaPlannerSnapshot | null;
  onChange: (notes: TiyaTripNotes) => void;
  onNoteActivity?: (label: string) => void;
};

const noteFields = [
  {
    key: "personal",
    label: "Personal notes",
    icon: PencilLine,
    placeholder: "Add traveller preferences, reminders or trip context.",
  },
  {
    key: "packing",
    label: "Packing reminders",
    icon: BookOpenCheck,
    placeholder: "Jackets, charger, ID proof, walking shoes...",
  },
  {
    key: "localTips",
    label: "Local tips",
    icon: MapPinned,
    placeholder: "Local timings, market lanes, route cautions...",
  },
  {
    key: "creatorNotes",
    label: "Creator notes",
    icon: Lightbulb,
    placeholder: "Reel ideas, photo stops, creator recommendations...",
  },
] as const;

function buildSuggestions(activeTrip?: TiyaPlannerSnapshot | null) {
  const text =
    `${activeTrip?.intent?.toCity || ""} ${activeTrip?.intent?.travelStyle || ""} ${activeTrip?.intent?.interests?.join(" ") || ""} ${activeTrip?.plan?.routeTitle || ""}`.toLowerCase();
  const suggestions: string[] = [];

  if (
    text.includes("mountain") ||
    text.includes("darjeeling") ||
    text.includes("ladakh") ||
    text.includes("himachal") ||
    text.includes("uttarakhand")
  ) {
    suggestions.push("Carry warm layers");
  }

  if (activeTrip?.intent?.smartPreferences?.includeCreatorSpots) {
    suggestions.push("Best sunrise reel point");
  }

  if (activeTrip?.intent?.smartPreferences?.includeLocalMarket) {
    suggestions.push("Check local handicraft timing");
  }

  return suggestions.length
    ? suggestions
    : ["Keep ID, charger and emergency contacts easy to access"];
}

function buildNotesText(
  notes: TiyaTripNotes,
  activeTrip?: TiyaPlannerSnapshot | null
) {
  return [
    "TPL Smart Planner Notes",
    activeTrip ? `Trip: ${activeTrip.tripName}` : "Trip: Current draft",
    activeTrip
      ? `Route: ${activeTrip.intent.fromCity} to ${activeTrip.intent.toCity}`
      : "",
    "",
    "Personal Notes",
    notes.personal || "-",
    "",
    "Packing Notes",
    notes.packing || "-",
    "",
    "Local Tips",
    notes.localTips || "-",
    "",
    "Creator Notes",
    notes.creatorNotes || "-",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export default function TiyaTripNotes({
  notes,
  activeTrip,
  onChange,
  onNoteActivity,
}: TiyaTripNotesProps) {
  const [statusMessage, setStatusMessage] = useState("");
  const suggestions = buildSuggestions(activeTrip);

  function updateNotes(nextNotes: TiyaTripNotes, label: string) {
    onChange(nextNotes);
    onNoteActivity?.(`${label} note added`);
  }

  async function copyNotes() {
    const text = buildNotesText(notes, activeTrip);

    try {
      await navigator.clipboard.writeText(text);
      setStatusMessage("Notes copied.");
    } catch {
      setStatusMessage(text);
    }
  }

  function downloadNotes() {
    const blob = new Blob([buildNotesText(notes, activeTrip)], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tpl-trip-notes-${activeTrip?.tripName || "draft"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setStatusMessage("Notes exported.");
  }

  function printNotesPdfStyle() {
    const popup = window.open("", "_blank", "noopener,noreferrer,width=720,height=900");
    if (!popup) {
      setStatusMessage("Popup blocked. Use Copy or TXT export.");
      return;
    }

    popup.document.write(`
      <html>
        <head>
          <title>TPL Trip Notes</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; line-height: 1.55; }
            h1 { font-size: 24px; margin-bottom: 4px; }
            pre { white-space: pre-wrap; font: inherit; border: 1px solid #dbeafe; border-radius: 16px; padding: 18px; background: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>TPL Smart Planner Notes</h1>
          <pre>${buildNotesText(notes, activeTrip).replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[char] || char)}</pre>
          <script>window.print();</script>
        </body>
      </html>
    `);
    popup.document.close();
    setStatusMessage("PDF print view opened.");
  }

  return (
    <section className="rounded-3xl border border-white/80 bg-white/75 p-3 shadow-[0_18px_70px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
            <PencilLine size={15} />
            Trip notes
          </div>
          <h2 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
            Notes and reminders
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyNotes}
            className="inline-flex min-h-9 items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 text-xs font-black text-blue-700"
          >
            <Clipboard size={13} />
            Copy
          </button>
          <button
            type="button"
            onClick={downloadNotes}
            className="inline-flex min-h-9 items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 text-xs font-black text-orange-700"
          >
            <Download size={13} />
            TXT
          </button>
          <button
            type="button"
            onClick={printNotesPdfStyle}
            className="inline-flex min-h-9 items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 text-xs font-black text-emerald-700"
          >
            <Download size={13} />
            PDF
          </button>
          <span className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-700">
            Trip auto-saved
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-3">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-700">
          Smart note suggestions
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() =>
                updateNotes(
                  {
                    ...notes,
                    packing: notes.packing
                      ? `${notes.packing}\n${suggestion}`
                      : suggestion,
                  },
                  "Packing"
                )
              }
              className="rounded-full border border-white bg-white px-3 py-1.5 text-xs font-black text-blue-700 shadow-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {noteFields.map((field) => {
          const Icon = field.icon;

          return (
            <label
              key={field.key}
              className="rounded-2xl border border-blue-100 bg-white p-3 shadow-sm"
            >
              <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-blue-700">
                <Icon size={14} />
                {field.label}
              </span>
              <textarea
                value={notes[field.key]}
                onChange={(event) =>
                  updateNotes(
                    { ...notes, [field.key]: event.target.value },
                    field.label.replace(" reminders", "").replace(" notes", "")
                  )
                }
                rows={3}
                placeholder={field.placeholder}
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
              />
            </label>
          );
        })}
      </div>

      {statusMessage ? (
        <p className="mt-3 whitespace-pre-wrap rounded-2xl border border-blue-100 bg-blue-50 p-3 text-xs font-bold text-blue-700">
          {statusMessage}
        </p>
      ) : null}
    </section>
  );
}
