"use client";

import { Printer, Save, Send, Share2 } from "lucide-react";

const actions = [
  { label: "Save Quote", icon: Save, primary: true },
  { label: "Share Quote", icon: Share2, primary: false },
  { label: "Print Quote", icon: Printer, primary: false },
  { label: "Request Expert Review", icon: Send, primary: false },
  { label: "Continue to Booking", icon: Send, primary: false },
];

export default function TiyaQuoteActions() {
  return (
    <div className="grid gap-2 rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
        Quote actions
      </div>
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <button
            key={action.label}
            type="button"
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-black transition ${
              action.primary
                ? "bg-orange-500 text-white shadow-[0_12px_32px_rgba(249,115,22,0.28)] hover:bg-orange-600"
                : "border border-white/15 bg-white/10 text-white hover:bg-white/15"
            }`}
          >
            <Icon size={15} />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
