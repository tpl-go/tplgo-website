"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Fuel,
  Gauge,
  MapPinned,
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
  onRuleAction?: (rule: TiyaPlannerRule) => void;
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

const priorityRank: Record<TiyaRuleStatus, number> = {
  critical: 0,
  warning: 1,
  pass: 2,
};

function confidenceForRule(rule: TiyaPlannerRule) {
  if (rule.status === "critical") return 92;
  if (rule.status === "warning") return 78;
  return 88;
}

function consequencesForRule(rule: TiyaPlannerRule) {
  if (rule.id === "avoid-night-travel") {
    return ["Reduced visibility", "Driver fatigue", "Delayed arrival", "Safety reduction"];
  }

  if (rule.id === "overpacked-itinerary") {
    return ["Travel fatigue", "Reduced enjoyment", "Schedule instability", "Missed recovery time"];
  }

  if (rule.id === "ev-range" || rule.id === "fuel-stop") {
    return ["Range anxiety", "Remote segment exposure", "Longer unscheduled halt", "Service point uncertainty"];
  }

  if (rule.id === "permit-required") {
    return ["Entry delay", "Document rejection risk", "Route access issue", "Last-minute detour"];
  }

  if (rule.id === "weather-fallback") {
    return ["Outdoor activity disruption", "Visibility loss", "Route delay", "Backup plan needed"];
  }

  return ["Comfort reduction", "Route pressure", "Schedule instability", "Planning uncertainty"];
}

function recommendedFixesForRule(rule: TiyaPlannerRule) {
  if (rule.id === "avoid-night-travel") {
    return ["Move transfer to daylight", "Add overnight halt", "Split long route", "Add buffer time"];
  }

  if (rule.id === "overpacked-itinerary") {
    return ["Move flexible activities", "Create balanced day", "Add free time", "Reduce activity pressure"];
  }

  if (rule.id === "ev-range") {
    return ["Add charging station", "Verify next service point", "Add range buffer", "Avoid remote stretch late day"];
  }

  if (rule.id === "fuel-stop") {
    return ["Add verified stop", "Mark next service point", "Refuel before remote segment", "Add route buffer"];
  }

  if (rule.id === "permit-required") {
    return ["Add permit reminder", "Attach ID proof checklist", "Add document buffer", "Verify vehicle documents"];
  }

  if (rule.id === "weather-fallback") {
    return ["Add backup activity", "Shift outdoor block", "Keep flexible checkout", "Add daylight transfer buffer"];
  }

  return [rule.suggestedFix, "Review affected itinerary day", "Protect booking readiness", "Update route assumptions"];
}

function whyThisMatters(rule: TiyaPlannerRule) {
  if (rule.id === "avoid-night-travel") {
    return "Night travel increases fatigue risk and reduces route visibility during long or mountain transfers.";
  }

  if (rule.id === "overpacked-itinerary") {
    return "Overpacked days reduce destination experience quality and increase schedule instability.";
  }

  if (rule.id === "ev-range" || rule.id === "fuel-stop") {
    return "Long road segments need verified fuel or charging stops before remote or scenic stretches.";
  }

  if (rule.id === "permit-required") {
    return "Permit gaps can block access, delay movement and affect booked services.";
  }

  if (rule.id === "weather-fallback") {
    return "Weather-sensitive trips need backup activities and daylight buffers to protect the plan.";
  }

  return rule.reason;
}

function ifAppliedPreview(rule: TiyaPlannerRule) {
  if (rule.id === "avoid-night-travel") {
    return {
      before: "Late arrival · 8:30 PM",
      after: "Daylight arrival · 5:15 PM",
      impact: "+1 halt",
      cost: "+₹2,500",
      comfort: "+18%",
      safety: "+24%",
    };
  }

  if (rule.id === "overpacked-itinerary") {
    return {
      before: "Day 3 · 9 activities",
      after: "Day 3 · 5 activities",
      impact: "4 activities moved",
      cost: "No major change",
      comfort: "+22%",
      safety: "+12%",
    };
  }

  if (rule.id === "ev-range" || rule.id === "fuel-stop") {
    return {
      before: "Delhi → Manali · no verified stop",
      after: "Delhi → Manali · verified service stop",
      impact: "+1 stop",
      cost: "+₹800",
      comfort: "+10%",
      safety: "+18%",
    };
  }

  if (rule.id === "permit-required") {
    return {
      before: "Permit reminder missing",
      after: "Permit + ID + vehicle document checklist",
      impact: "Access risk reduced",
      cost: "No major change",
      comfort: "+8%",
      safety: "+16%",
    };
  }

  if (rule.id === "weather-fallback") {
    return {
      before: "Outdoor trek",
      after: "Indoor cultural visit backup",
      impact: "+1 backup activity",
      cost: "+₹1,200",
      comfort: "+14%",
      safety: "+18%",
    };
  }

  return {
    before: rule.affectedArea,
    after: rule.suggestedFix,
    impact: "Plan improved",
    cost: "Review at checkout",
    comfort: "+10%",
    safety: "+12%",
  };
}

function actionLabelForRule(rule: TiyaPlannerRule) {
  if (rule.id === "overpacked-itinerary") return "Create Balanced Day";
  if (rule.id === "ev-range") return "Add Charging Station";
  if (rule.id === "fuel-stop") return "Add Verified Stop";
  if (rule.status === "pass") return "Validated";
  return rule.actionLabel;
}

function RuleCard({
  onRuleAction,
  rule,
}: {
  onRuleAction?: (rule: TiyaPlannerRule) => void;
  rule: TiyaPlannerRule;
}) {
  const StatusIcon = statusIcons[rule.status];
  const preview = ifAppliedPreview(rule);
  const confidence = confidenceForRule(rule);

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
          {rule.status === "pass" ? (
            <p className="mt-2 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-100">
              ✓ Validated · No action required. Comfort confidence {confidence}%
            </p>
          ) : null}
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

      <div className="mt-3 rounded-2xl border border-white/10 bg-black/10 p-3">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-rose-100">
          Risk impact
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-2.5">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
              Affected
            </p>
            <p className="mt-1 text-xs font-black text-white">{rule.affectedArea}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-2.5">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
              Risk level
            </p>
            <p className="mt-1 text-xs font-black text-white uppercase">{rule.status}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-2.5">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
              Confidence
            </p>
            <p className="mt-1 text-xs font-black text-cyan-100">{confidence}%</p>
          </div>
        </div>
        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
          Possible consequences
        </p>
        <div className="mt-2 grid gap-1.5 text-xs font-semibold leading-5 text-amber-100 sm:grid-cols-2">
          {consequencesForRule(rule).map((item) => (
            <div key={`${rule.id}-${item}`} className="flex gap-2">
              <span>⚠</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-emerald-300/16 bg-emerald-400/10 p-3">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-100">
          Recommended fix
        </p>
        <div className="mt-2 grid gap-1.5 text-xs font-semibold leading-5 text-emerald-50/85 sm:grid-cols-2">
          {recommendedFixesForRule(rule).map((fix) => (
            <div key={`${rule.id}-${fix}`} className="flex gap-2">
              <span>✓</span>
              <span>{fix}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white">
          Estimated effectiveness {rule.status === "critical" ? "88" : rule.status === "warning" ? "74" : "92"}%
        </p>
      </div>

      <div className="mt-3 rounded-2xl border border-orange-300/16 bg-orange-400/10 p-3">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-100">
          If applied
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {[
            ["Before", preview.before],
            ["After", preview.after],
            ["Impact", preview.impact],
            ["Cost Impact", preview.cost],
            ["Comfort", preview.comfort],
            ["Safety", preview.safety],
          ].map(([label, value]) => (
            <div key={`${rule.id}-preview-${label}`} className="rounded-2xl border border-white/10 bg-white/10 p-2.5">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                {label}
              </p>
              <p className="mt-1 line-clamp-2 text-xs font-black text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {(rule.id === "ev-range" || rule.id === "fuel-stop") ? (
        <div className="mt-3 rounded-2xl border border-cyan-300/16 bg-cyan-300/10 p-3">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">
            <Fuel size={14} />
            Affected segment
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            {[
              ["Segment", "Delhi → Manali"],
              ["Distance", "245 km"],
              ["Fuel Risk", rule.status === "critical" ? "High" : "Medium"],
              ["Next Service", "84 km"],
            ].map(([label, value]) => (
              <div key={`${rule.id}-${label}`} className="rounded-2xl border border-white/10 bg-white/10 p-2.5">
                <p className="text-[10px] font-black uppercase text-white/45">{label}</p>
                <p className="mt-1 text-xs font-black text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {rule.id === "permit-required" ? (
        <div className="mt-3 rounded-2xl border border-cyan-300/16 bg-cyan-300/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">
            Permit readiness
          </p>
          <div className="mt-2 grid gap-1.5 text-xs font-semibold text-cyan-50/85 sm:grid-cols-3">
            {["Permit", "ID Proof", "Vehicle Documents"].map((doc) => (
              <div key={doc} className="flex gap-2">
                <span>✓</span>
                <span>{doc}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs font-semibold text-cyan-50/70">
            Estimated processing: 24-48 hours · Permit window: before remote segment · Risk if missed: access delay.
          </p>
        </div>
      ) : null}

      <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">
          Why this matters
        </p>
        <p className="mt-2 text-xs font-semibold leading-5 text-white/70">
          {whyThisMatters(rule)}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onRuleAction?.(rule)}
        disabled={rule.status === "pass"}
        className={`mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full px-4 py-2 text-xs font-black transition ${
          rule.status === "pass"
            ? "cursor-default border border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
            : "border border-orange-300/30 bg-orange-500/10 text-orange-100 hover:bg-orange-500/15"
        }`}
      >
        {actionLabelForRule(rule)}
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
  onRuleAction,
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
  const overallRiskScore = Math.max(
    24,
    Math.min(96, 92 - criticalCount * 18 - warningCount * 8)
  );
  const riskLabel =
    overallRiskScore >= 78 ? "LOW" : overallRiskScore >= 55 ? "MODERATE" : "HIGH";
  const fixFirst = [...safeRules]
    .filter((rule) => rule.status !== "pass")
    .sort((a, b) => priorityRank[a.status] - priorityRank[b.status])
    .slice(0, 3);
  const fixableIssues = safeRules.filter((rule) => rule.status !== "pass").length;
  const autoFixRule: TiyaPlannerRule = {
    id: "auto-safe-plan",
    title: "Apply safe plan",
    status: criticalCount > 0 ? "critical" : warningCount > 0 ? "warning" : "pass",
    reason: `Auto-fix plan can address ${fixableIssues} issue${fixableIssues === 1 ? "" : "s"} across route, pacing and readiness.`,
    suggestedFix: "Apply the safest available route, timing and buffer improvements.",
    affectedArea: "Route safety plan",
    actionLabel: "Fix Plan",
  };

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

      <div className="grid gap-3 p-3 sm:p-5">
        <div className="grid gap-3 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/10 p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                  <Gauge size={15} />
                  Overall trip risk
                </div>
                <p className="mt-2 text-3xl font-black text-white">{overallRiskScore}%</p>
                <p className="mt-1 text-sm font-black text-cyan-100">{riskLabel}</p>
              </div>
              <div className="grid gap-2 text-xs font-black text-white/80">
                <span>Critical Issues: {criticalCount}</span>
                <span>Warnings: {warningCount}</span>
                <span>Safe Checks: {passCount}</span>
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {["Route safety", "Travel duration", "Weather impact", "Activity density", "Comfort profile"].map((basis) => (
                <div key={basis} className="flex gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-cyan-50/85">
                  <span className="text-emerald-100">✓</span>
                  <span>{basis}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-orange-300/20 bg-orange-400/10 p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
              <Clock3 size={15} />
              Fix first
            </div>
            <div className="mt-3 grid gap-2">
              {(fixFirst.length ? fixFirst : safeRules.slice(0, 3)).map((rule, index) => (
                <div key={`priority-${rule.id}`} className="grid gap-2 rounded-2xl border border-white/10 bg-white/10 p-3 sm:grid-cols-[90px_minmax(0,1fr)_auto] sm:items-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                    Priority {index + 1}
                  </p>
                  <div>
                    <p className="text-sm font-black text-white">{rule.title}</p>
                    <p className="mt-1 text-xs font-semibold text-white/55">{rule.affectedArea}</p>
                  </div>
                  <span className={`w-fit rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${statusStyles[rule.status]}`}>
                    {rule.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-3 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-100">
                <MapPinned size={15} />
                Auto fix plan
              </div>
              <p className="mt-2 text-sm font-semibold leading-6 text-emerald-50/80">
                Issues fixable: {fixableIssues} · Safety +28% · Comfort +12% · Risk -38% · Cost +₹2,000 · Time +1 Day
              </p>
            </div>
            <button
              type="button"
              disabled={fixableIssues === 0}
              onClick={() => onRuleAction?.(autoFixRule)}
              className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2 text-sm font-black transition ${
                fixableIssues === 0
                  ? "cursor-default border border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                  : "bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] text-white shadow-[0_12px_28px_rgba(255,123,0,0.28)] hover:-translate-y-0.5"
              }`}
            >
              {fixableIssues === 0 ? "Safe Plan Validated" : "Apply Safe Plan"}
            </button>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
        {safeRules.map((rule) => (
          <RuleCard key={rule.id} rule={rule} onRuleAction={onRuleAction} />
        ))}
        </div>
      </div>
    </section>
  );
}
