import Link from "next/link";
import {
  BedDouble,
  BriefcaseBusiness,
  Car,
  MapPinned,
  Plane,
  ShieldCheck,
  Sparkles,
  Ticket,
} from "lucide-react";
import type { TiyaBookingModule } from "@/app/lib/ecosystem/planner/plannerTypes";

type TiyaBookingReadyLayerProps = {
  modules?: TiyaBookingModule[] | null;
  isGenerating?: boolean;
};

const iconMap = {
  flights: Plane,
  hotels: BedDouble,
  homestays: BedDouble,
  cabs: Car,
  packages: BriefcaseBusiness,
  experiences: Ticket,
  insurance: ShieldCheck,
  "local-market": MapPinned,
};

const readinessStyles: Record<TiyaBookingModule["readiness"], string> = {
  Ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Recommended: "border-blue-200 bg-blue-50 text-blue-700",
  Optional: "border-slate-200 bg-slate-50 text-slate-600",
  Review: "border-orange-200 bg-orange-50 text-orange-700",
};

export default function TiyaBookingReadyLayer({
  modules = [],
  isGenerating = false,
}: TiyaBookingReadyLayerProps) {
  const safeModules = Array.isArray(modules) ? modules : [];
  const readyCount = safeModules.filter((module) => module.isHighlighted).length;

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-white/75 shadow-[0_22px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="relative border-b border-blue-100/80 bg-[#061839]/95 p-4 text-white sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_86%_8%,rgba(249,115,22,0.18),transparent_26%)]" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <Sparkles
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              Booking-ready layer
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Ready to Book with TPL
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Convert the smart plan into existing TPL service searches when the
              traveller is ready.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-cyan-100">
            {readyCount} matched module{readyCount === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5 md:grid-cols-2 xl:grid-cols-4">
        {safeModules.map((module) => {
          const Icon = iconMap[module.id];

          return (
            <article
              key={module.id}
              className={`flex min-h-[230px] flex-col rounded-3xl border p-4 transition ${
                module.isHighlighted
                  ? "border-orange-200 bg-orange-50/80 shadow-[0_14px_38px_rgba(249,115,22,0.16)]"
                  : "border-blue-100 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                    module.isHighlighted
                      ? "bg-orange-500 text-white"
                      : "bg-blue-950 text-white"
                  }`}
                >
                  <Icon size={20} />
                </div>
                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${readinessStyles[module.readiness]}`}
                >
                  {module.readiness}
                </span>
              </div>

              <h3 className="mt-4 text-lg font-black text-slate-950">
                {module.serviceName}
              </h3>
              <p className="mt-2 flex-1 text-sm font-semibold leading-6 text-slate-600">
                {module.reason}
              </p>

              <Link
                href={module.href}
                className={`mt-4 inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-black transition ${
                  module.isHighlighted
                    ? "bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] text-white shadow-[0_10px_26px_rgba(249,115,22,0.28)]"
                    : "border border-blue-100 bg-blue-50 text-blue-800 hover:bg-blue-100"
                }`}
              >
                {module.cta}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
