"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { TiyaBookingBridgeItem } from "@/app/lib/ecosystem/planner/plannerBookingBridge";
import type { TiyaConversionWidget } from "@/app/lib/ecosystem/planner/plannerConversionEngine";

type TiyaBookingWidgetsProps = {
  bookingItems: TiyaBookingBridgeItem[];
  widgets: TiyaConversionWidget[];
};

const readinessTone: Record<TiyaBookingBridgeItem["readiness"], string> = {
  Ready: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
  Recommended: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
  Review: "border-orange-300/20 bg-orange-400/10 text-orange-100",
  Optional: "border-white/10 bg-white/10 text-white/65",
};

export default function TiyaBookingWidgets({
  bookingItems,
  widgets,
}: TiyaBookingWidgetsProps) {
  const safeBookingItems = Array.isArray(bookingItems) ? bookingItems : [];
  const safeWidgets = Array.isArray(widgets) ? widgets : [];

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {safeBookingItems.map((item) => (
          <article
            key={item.id}
            className={`flex min-h-[230px] flex-col rounded-3xl border p-3 transition sm:p-4 ${
              item.isPrimary
                ? "border-orange-300/30 bg-orange-400/10 shadow-[0_0_34px_rgba(249,115,22,0.14)]"
                : "border-white/10 bg-white/[0.08]"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-100">
                <CheckCircle2 size={19} />
              </div>
              <span
                className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${readinessTone[item.readiness]}`}
              >
                {item.readiness}
              </span>
            </div>
            <h3 className="mt-4 text-base font-black text-white">{item.title}</h3>
            <p className="mt-2 flex-1 text-xs font-semibold leading-5 text-white/70">
              {item.statusText}
            </p>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/10 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                Prefill simulation
              </p>
              <p className="mt-1 truncate text-xs font-black text-white">
                {item.payload.from} to {item.payload.to} · {item.payload.travellers} traveller
                {item.payload.travellers === 1 ? "" : "s"}
              </p>
            </div>
            <Link
              href={item.href}
              className={`mt-4 inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-black transition ${
                item.isPrimary
                  ? "bg-orange-500 text-white shadow-[0_12px_32px_rgba(249,115,22,0.28)] hover:bg-orange-600"
                  : "border border-white/15 bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              {item.cta}
            </Link>
          </article>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {safeWidgets.map((widget) => (
          <article
            key={widget.id}
            className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-cyan-100">
                  {widget.service}
                </p>
                <h3 className="mt-2 text-base font-black text-white">
                  {widget.title}
                </h3>
              </div>
              <span className="rounded-full border border-orange-300/20 bg-orange-400/10 px-2.5 py-1 text-[11px] font-black text-orange-100">
                {widget.strength}
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/70">
              {widget.detail}
            </p>
            <Link
              href={widget.href}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/15"
            >
              {widget.cta}
              <ArrowRight size={13} />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
