"use client";

import { useSyncExternalStore } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Compass, Route, Sparkles } from "lucide-react";
import {
  readRouteWorkspacePayload,
  type TiyaRouteWorkspacePayload,
} from "@/app/lib/ecosystem/planner/plannerRouteWorkspaceHandoff";

const workspaceSections = [
  "Itinerary builder",
  "Transport mode",
  "Stay style",
  "Creator routes",
  "Local market",
  "Editable journey",
  "Bookings",
];

export default function TiyaWorkspaceRoutePage() {
  const params = useParams<{ routeId: string }>();
  const payload = useSyncExternalStore<TiyaRouteWorkspacePayload | null>(
    () => () => undefined,
    readRouteWorkspacePayload,
    () => null
  );

  const routeId = params?.routeId;
  const selectedRoute = payload?.selectedRoute;
  const routeMatchesPayload = selectedRoute?.id === routeId;

  return (
    <main className="min-h-screen bg-[#071226] px-6 py-8 text-white">
      <section className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(135deg,#10284f_0%,#123d69_46%,#172033_100%)] shadow-[0_30px_110px_rgba(2,6,23,0.36)]">
        <div className="relative border-b border-white/10 p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_88%_16%,rgba(249,115,22,0.16),transparent_25%)]" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
                <Compass size={15} />
                Tiya journey workspace
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-normal lg:text-5xl">
                {selectedRoute?.name ?? "Route workspace"}
              </h1>
              <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-white/68">
                Initial workspace shell for the selected Tiya route. Deeper
                itinerary, creator, market, stay, and booking modules will load
                here progressively.
              </p>
            </div>

            <div className="rounded-2xl border border-orange-300/24 bg-orange-500/12 px-4 py-3 text-sm font-black text-orange-100">
              Route ID: {routeId}
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[1.5rem] border border-white/12 bg-white/[0.08] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-300/24 bg-orange-500/14 text-orange-100">
                <Route size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
                  Selected route summary
                </p>
                <h2 className="mt-1 text-2xl font-black">
                  {selectedRoute?.routeStyle ?? "Awaiting route handoff"}
                </h2>
              </div>
            </div>

            {selectedRoute ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                {[
                  ["Duration", selectedRoute.duration],
                  ["Distance", selectedRoute.distance],
                  ["Difficulty", selectedRoute.difficulty],
                  ["Risk", selectedRoute.riskLevel],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-black/14 px-3 py-3"
                  >
                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/42">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-black text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.07] p-4 text-sm font-bold text-white/68">
                No selected route payload found. Return to Smart Planner and
                continue with a selected route.
              </div>
            )}
          </div>

          <div className="rounded-[1.5rem] border border-white/12 bg-white/[0.08] p-5">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <Sparkles size={14} />
              Handoff status
            </div>
            <div className="mt-4 space-y-3">
              {[
                ["Route payload", Boolean(payload)],
                ["Route ID matched", routeMatchesPayload],
                ["Workspace shell", true],
              ].map(([label, done]) => (
                <div
                  key={String(label)}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/14 px-3 py-3"
                >
                  <span className="text-sm font-bold text-white/72">
                    {label}
                  </span>
                  <CheckCircle2
                    size={18}
                    className={done ? "text-emerald-300" : "text-white/24"}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-6 pt-0 md:grid-cols-2 xl:grid-cols-4">
          {workspaceSections.map((section) => (
            <div
              key={section}
              className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/42">
                Workspace module
              </p>
              <h3 className="mt-2 text-base font-black text-white">
                {section}
              </h3>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
