import { Bot, Navigation, Sparkles, Users } from "lucide-react";
import type { TiyaGeneratedPlan, TiyaTripIntent } from "@/app/lib/ecosystem/planner/plannerTypes";

type TiyaWorkspaceHeaderProps = {
  plan: TiyaGeneratedPlan;
  intent: TiyaTripIntent;
  isGenerating?: boolean;
};

export default function TiyaWorkspaceHeader({
  plan,
  intent,
  isGenerating = false,
}: TiyaWorkspaceHeaderProps) {
  const summaryItems = [
    ["Route", plan.routeTitle],
    ["Nights", `${plan.nights}`],
    ["Travellers", `${plan.travellerCount}`],
    ["Mode", intent.transportMode],
    ["Stay", intent.stayPreference],
    ["Budget", intent.budgetTier],
    ["Style", intent.travelStyle],
  ];

  return (
    <section className="relative overflow-hidden border-b border-blue-100/80">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(14,116,144,0.15),transparent_30%),radial-gradient(circle_at_86%_4%,rgba(249,115,22,0.16),transparent_28%)]" />
      <div className="absolute left-1/2 top-0 h-px w-[min(720px,84vw)] -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/85 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-blue-700 shadow-sm backdrop-blur-xl">
              <Sparkles size={14} className={isGenerating ? "animate-pulse" : undefined} />
              TPL Smart Planner
            </div>
            <h1 className="mt-4 text-3xl font-black leading-[1.04] tracking-normal text-slate-950 sm:text-5xl lg:text-[56px]">
              <span className="mr-2 inline-flex items-center rounded-2xl bg-blue-950 px-3 py-1 text-white shadow-[0_18px_44px_rgba(15,23,42,0.16)]">
                <Bot size={28} className="mr-2 text-orange-300" />
                Tiya
              </span>
              <span className="bg-gradient-to-r from-blue-950 via-blue-800 to-blue-600 bg-clip-text text-transparent">
                {plan.title}
              </span>
            </h1>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-600 sm:text-base sm:leading-7">
              {plan.subtitle}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 lg:w-[470px]">
            {[
              ["Trip", intent.toCity || "Destination"],
              ["Duration", `${plan.nights} night${plan.nights === 1 ? "" : "s"}`],
              ["Travellers", plan.travellerCount.toString()],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/75 bg-white/82 p-3 shadow-[0_12px_34px_rgba(15,23,42,0.06)] backdrop-blur-xl"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  {label}
                </p>
                <p className="mt-1 truncate text-base font-black text-slate-950">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-2 md:grid-cols-4 lg:grid-cols-7">
          {summaryItems.map(([label, value]) => (
            <div
              key={label}
              className="min-w-0 rounded-2xl border border-white/75 bg-white/75 p-3 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl transition hover:border-orange-200 hover:bg-white/90"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">
                {label}
              </p>
              <p className="mt-1 truncate text-sm font-black text-slate-950">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-blue-100 bg-white/78 p-3 text-sm font-bold leading-6 text-slate-600 shadow-[0_12px_36px_rgba(37,99,235,0.06)] backdrop-blur-xl">
          <Navigation size={16} className="text-blue-700" />
          <span>{plan.routeTitle}</span>
          <span className="text-slate-300">·</span>
          <Users size={16} className="text-orange-600" />
          <span>
            {plan.nights} Nights · {plan.travellerCount} Travellers ·{" "}
            {intent.transportMode} · {intent.budgetTier}
          </span>
        </div>
      </div>
    </section>
  );
}
