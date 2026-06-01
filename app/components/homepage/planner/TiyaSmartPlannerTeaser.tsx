"use client";

import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CalendarCheck,
  Map,
  Navigation,
  Route,
  Sparkles,
} from "lucide-react";

const TIYA_BG =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80";

const TIYA_PANEL_BG =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";

export default function TiyaSmartPlannerTeaser() {
  return (
    <section className="relative bg-white px-2 py-3 md:px-3">
      <div
        className="relative mx-auto w-full overflow-hidden rounded-[24px] border border-blue-100 px-3 py-3 shadow-sm sm:rounded-[30px] sm:px-5 sm:py-5 lg:px-6 lg:py-5"
        style={{
          backgroundImage: `url(${TIYA_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/98 via-white/94 to-white/82 sm:bg-gradient-to-r sm:from-white/96 sm:via-white/88 sm:to-blue-950/34" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_14%,rgba(20,184,166,0.18),transparent_30%),radial-gradient(circle_at_68%_88%,rgba(37,99,235,0.14),transparent_30%)] sm:bg-[radial-gradient(circle_at_78%_18%,rgba(20,184,166,0.22),transparent_32%),radial-gradient(circle_at_72%_86%,rgba(37,99,235,0.18),transparent_32%)]" />

        <div className="relative mx-auto grid max-w-[1520px] items-center gap-3 sm:gap-4 lg:grid-cols-[1fr_430px] lg:gap-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700 shadow-sm">
              <Sparkles size={14} />
              TPL Flagship AI
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-2xl font-black leading-tight text-slate-950 sm:text-4xl lg:text-[42px]">
                  <span className="bg-gradient-to-r from-blue-950 via-blue-800 to-blue-600 bg-clip-text font-serif italic text-transparent">
                    Tiya
                  </span>{" "}
                  Smart Planner
                </h2>

                <p className="mt-2 max-w-2xl text-[13px] font-semibold leading-5 text-slate-800 sm:text-base sm:leading-6 sm:text-slate-700">
                  AI route planning, itinerary intelligence, and booking-ready
                  trip structure in one premium travel workspace.
                </p>
              </div>

              <Link
                href="/smart-planner"
                className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-7 py-3 text-[15px] font-black text-white shadow-[0_10px_30px_rgba(255,145,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] sm:w-auto"
              >
                Plan with Tiya
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="mt-4 grid max-w-2xl gap-2 sm:grid-cols-3">
              {["Route planning", "Itinerary intelligence", "Booking-ready flow"].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-blue-100 bg-white/84 px-3 py-2.5 text-xs font-black text-slate-700 shadow-sm backdrop-blur-md"
                  >
                    {item}
                  </div>
                )
              )}
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-[22px] border border-white/60 bg-[#061839] p-2.5 shadow-xl backdrop-blur-md sm:min-h-[245px] sm:p-3 lg:min-h-[265px]"
            style={{
              backgroundImage: `url(${TIYA_PANEL_BG})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#061839]/94 via-[#0b3b77]/78 to-[#0f766e]/58 sm:from-[#061839]/92 sm:via-[#0b3b77]/72 sm:to-[#0f766e]/52" />
            <div className="absolute inset-0 bg-black/20 sm:bg-black/10" />

            <div className="relative mb-2 rounded-2xl border border-white/20 bg-[#061839]/76 p-3 text-white shadow-lg backdrop-blur-md sm:mb-2.5 sm:bg-[#061839]/72 sm:p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
                    Tiya operating layer
                  </p>
                  <h3 className="mt-1.5 text-base font-black leading-tight sm:text-lg">
                    AI travel intelligence
                  </h3>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-md">
                  <Navigation size={20} />
                </div>
              </div>
            </div>

            <div className="relative grid gap-2 sm:grid-cols-3">
              {[
                { icon: BrainCircuit, label: "AI Fit", sub: "Trip intent" },
                { icon: Route, label: "Route Logic", sub: "Smart flow" },
                { icon: CalendarCheck, label: "Book Ready", sub: "Next steps" },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/20 bg-[#061839]/72 p-2.5 text-white shadow-sm backdrop-blur-md sm:bg-[#061839]/68"
                  >
                    <div className="flex items-center gap-2 sm:block">
                      <Icon className="h-4 w-4 shrink-0 text-emerald-100" />
                      <div>
                        <div className="text-[11px] font-black sm:mt-1.5">
                          {item.label}
                        </div>
                        <div className="mt-0.5 text-[10px] font-semibold text-white/74">
                          {item.sub}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="relative mt-2 rounded-2xl border border-white/20 bg-[#061839]/72 p-3 text-white backdrop-blur-md sm:mt-2.5 sm:bg-[#061839]/68 sm:p-3.5">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100">
                <Map size={14} />
                AI route planner
              </div>

              <div className="mt-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black">Destination plan</p>
                  <p className="mt-1 text-[11px] leading-4 text-white/82 sm:text-xs sm:leading-5 sm:text-white/78">
                    Routes, stays, experiences and booking flow aligned together.
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-700">
                  <Sparkles size={19} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
