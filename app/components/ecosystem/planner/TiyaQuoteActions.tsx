"use client";

import { useState } from "react";
import { Printer, Save, Send, Share2 } from "lucide-react";

const actions = [
  { label: "Save Quote - Feature Under Development", icon: Save, primary: true, disabled: true },
  { label: "Share Quote - Feature Under Development", icon: Share2, primary: false, disabled: true },
  { label: "Print Quote - Feature Under Development", icon: Printer, primary: false, disabled: true },
  { label: "Request Expert Review - Use Expert Assistance", icon: Send, primary: false, disabled: true },
  { label: "Proceed to Book", icon: Send, primary: false, disabled: false },
];

export default function TiyaQuoteActions() {
  const [status, setStatus] = useState("");

  function handleAction(label: string) {
    if (label === "Proceed to Book") {
      window.dispatchEvent(new Event("tpl:proceed-to-book"));
      setStatus("Proceeding through protected Smart Planner review flow.");
      return;
    }

    setStatus("Feature Under Development. Use Export & Share or Expert Assistance for production flow.");
  }

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
            disabled={action.disabled}
            onClick={() => handleAction(action.label)}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-black transition ${
              action.primary
                ? "bg-orange-500 text-white shadow-[0_12px_32px_rgba(249,115,22,0.28)] hover:bg-orange-600"
                : "border border-white/15 bg-white/10 text-white hover:bg-white/15"
            } disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-white/10`}
          >
            <Icon size={15} />
            {action.label}
          </button>
        );
      })}
      {status ? (
        <p className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-50">
          {status}
        </p>
      ) : null}
    </div>
  );
}
