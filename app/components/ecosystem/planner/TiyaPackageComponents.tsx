"use client";

import { CheckCircle2, Circle, PackagePlus } from "lucide-react";
import type { TiyaPackageComponent } from "@/app/lib/ecosystem/planner/plannerPackageBuilder";

type TiyaPackageComponentsProps = {
  components: TiyaPackageComponent[];
  onToggleComponent: (componentId: string) => void;
};

const typeLabel: Record<TiyaPackageComponent["type"], string> = {
  transport: "Transport",
  stay: "Stay",
  activity: "Activity",
  transfer: "Transfer",
  insurance: "Insurance",
  creator: "Creator",
  market: "Market",
};

export default function TiyaPackageComponents({
  components,
  onToggleComponent,
}: TiyaPackageComponentsProps) {
  const safeComponents = Array.isArray(components) ? components : [];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
        <PackagePlus size={15} />
        Package components
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {safeComponents.map((component) => {
          const Icon = component.included ? CheckCircle2 : Circle;

          return (
            <article
              key={component.id}
              className={`rounded-3xl border p-3 transition sm:p-4 ${
                component.included
                  ? "border-orange-300/30 bg-orange-400/10"
                  : "border-white/10 bg-white/10"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="rounded-full bg-cyan-300/10 px-2.5 py-1 text-[11px] font-black text-cyan-100">
                    {typeLabel[component.type]}
                  </span>
                  <h3 className="mt-3 text-base font-black text-white">
                    {component.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleComponent(component.id)}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition ${
                    component.included
                      ? "border-orange-300/30 bg-orange-500 text-white"
                      : "border-white/10 bg-white/10 text-white/60 hover:bg-white/15"
                  }`}
                  aria-label={`${component.included ? "Remove" : "Add"} ${component.title}`}
                >
                  <Icon size={18} />
                </button>
              </div>
              <p className="mt-3 text-xs font-semibold leading-5 text-white/70">
                {component.detail}
              </p>
              <p className="mt-3 text-sm font-black text-orange-100">
                ₹{component.estimate.toLocaleString("en-IN")}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
