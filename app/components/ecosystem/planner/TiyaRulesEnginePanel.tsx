"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  generatePlannerRules,
  type TiyaPlannerRule,
  type TiyaRuleStatus,
} from "@/app/lib/ecosystem/planner/plannerRulesEngine";
import type {
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";

type TiyaRulesEnginePanelProps = {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  days: TiyaDayPlan[];
  selectedRoute?: TiyaRouteOption;
  isGenerating?: boolean;
};

const statusStyles: Record<TiyaRuleStatus, string> = {
  pass: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
  warning: "border-orange-300/20 bg-orange-400/10 text-orange-100",
  critical: "border-rose-300/20 bg-rose-400/10 text-rose-100",
};

const statusIcons: Record<TiyaRuleStatus, typeof CheckCircle2> = {
  pass: CheckCircle2,
  warning: AlertTriangle,
  critical: ShieldAlert,
};

function RuleCard({ rule }: { rule: TiyaPlannerRule }) {
  const StatusIcon = statusIcons[rule.status];

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 transition hover:bg-white/10 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <StatusIcon className="h-4 w-4 shrink-0 text-cyan-100" />
            <h3 className="truncate text-base font-black text-white">
              {rule.title}
            </h3>
          </div>
          <p className="mt-2 text-xs font-semibold leading-5 text-white/70">
            {rule.reason}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 text-[11px] font-black uppercase ${statusStyles[rule.status]}`}
        >
          {rule.status}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
            Affected
          </p>
          <p className="mt-1 text-xs font-black text-white">
            {rule.affectedArea}
          </p>
        </div>
        <div className="rounded-2xl border border-orange-300/15 bg-orange-500/10 p-3">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-orange-100" />
            <p className="text-xs font-semibold leading-5 text-orange-50/90">
              {rule.suggestedFix}
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-white transition hover:bg-white/15"
      >
        {rule.actionLabel}
      </button>
    </article>
  );
}

export default function TiyaRulesEnginePanel({
  intent,
  plan,
  days,
  selectedRoute,
  isGenerating = false,
}: TiyaRulesEnginePanelProps) {
  const rules = useMemo(
    () => generatePlannerRules({ intent, plan, days, selectedRoute }),
    [days, intent, plan, selectedRoute]
  );
  const safeRules = Array.isArray(rules) ? rules : [];
  const passCount = safeRules.filter((rule) => rule.status === "pass").length;
  const warningCount = safeRules.filter((rule) => rule.status === "warning").length;
  const criticalCount = safeRules.filter(
    (rule) => rule.status === "critical"
  ).length;

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_90%_12%,rgba(249,115,22,0.18),transparent_25%)]" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <ShieldCheck
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              Smart constraint and rules engine
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Practical travel rule checks
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Validates the live plan against safety, comfort, budget, route,
              weather and transport constraints.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2">
              <p className="text-lg font-black text-emerald-100">{passCount}</p>
              <p className="text-[10px] font-black uppercase text-emerald-100/70">
                Pass
              </p>
            </div>
            <div className="rounded-2xl border border-orange-300/20 bg-orange-400/10 px-3 py-2">
              <p className="text-lg font-black text-orange-100">
                {warningCount}
              </p>
              <p className="text-[10px] font-black uppercase text-orange-100/70">
                Warn
              </p>
            </div>
            <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-3 py-2">
              <p className="text-lg font-black text-rose-100">{criticalCount}</p>
              <p className="text-[10px] font-black uppercase text-rose-100/70">
                Critical
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5 lg:grid-cols-2">
        {safeRules.map((rule) => (
          <RuleCard key={rule.id} rule={rule} />
        ))}
      </div>
    </section>
  );
}
