import type { Dispatch, SetStateAction } from "react";
import { BedDouble, Car, ChevronDown, MapPinned, NotebookText, Utensils, WalletCards } from "lucide-react";
import type { TiyaTripIntent } from "@/app/lib/ecosystem/planner/plannerTypes";
import {
  getDayDateLabel,
  getJourneyNodeDisplay,
  type JourneyFlowItem,
} from "../data/routePreviewData";

type ItinerarySectionProps = {
  journeyFlow: JourneyFlowItem[];
  tripIntent?: TiyaTripIntent;
  openJourneyNodeId: string | null;
  setOpenJourneyNodeId: Dispatch<SetStateAction<string | null>>;
};

export default function ItinerarySection({
  journeyFlow,
  tripIntent,
  openJourneyNodeId,
  setOpenJourneyNodeId,
}: ItinerarySectionProps) {
  return (
<div className="min-w-0 rounded-2xl border border-sky-200 bg-white/72 p-2.5 shadow-[0_12px_34px_rgba(15,23,42,0.08)] sm:p-3">
<div className="mb-3 flex flex-wrap items-center justify-between gap-2">
  <div>
    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
      Journey flow
    </p>
    <p className="mt-1 text-sm font-bold text-slate-600">
      Route-based movement, stay and local experience map
    </p>
  </div>
  <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-[11px] font-black text-cyan-700">
    {journeyFlow.length} days
  </span>
</div>

<div className="grid gap-0">
  {journeyFlow.map((item, index) => {
  const isOpen = openJourneyNodeId === item.id;
  const hasNext = index < journeyFlow.length - 1;
  const sections = [
    {
      label: "Stay",
      value: item.stay,
      icon: BedDouble,
      tone: "stay",
    },
    {
      label: "Activities",
      value: item.activities,
      icon: MapPinned,
      tone: "activities",
    },
    {
      label: "Meals",
      value: item.meals,
      icon: Utensils,
      tone: "meals",
    },
    {
      label: "Local Movement",
      value: item.localMovement,
      icon: Car,
      tone: "movement",
    },
    {
      label: "Notes",
      value: item.notes,
      icon: NotebookText,
      tone: "wide",
    },
    {
      label: "Estimated Cost",
      value: item.estimatedCost,
      icon: WalletCards,
      tone: "cost",
    },
  ];
  const regularSections = sections.filter(
    (section) =>
      section.tone !== "wide" && section.tone !== "cost"
  );
  const notesSection = sections.find(
    (section) => section.tone === "wide"
  );
  const costSection = sections.find(
    (section) => section.tone === "cost"
  );
  const toneStyles = {
    stay: {
      card: "border-blue-100 hover:border-blue-200 hover:shadow-[0_16px_34px_rgba(37,99,235,0.12)]",
      icon: "border-blue-200 bg-gradient-to-br from-blue-50 to-sky-100 text-blue-700 shadow-[0_10px_20px_rgba(37,99,235,0.12)]",
      top: "from-blue-400 to-sky-400",
      bullet: "bg-blue-500/75",
    },
    activities: {
      card: "border-teal-100 hover:border-teal-200 hover:shadow-[0_16px_34px_rgba(13,148,136,0.12)]",
      icon: "border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-100 text-teal-700 shadow-[0_10px_20px_rgba(13,148,136,0.12)]",
      top: "from-teal-400 to-cyan-400",
      bullet: "bg-teal-500/75",
    },
    meals: {
      card: "border-amber-100 hover:border-amber-200 hover:shadow-[0_16px_34px_rgba(245,158,11,0.14)]",
      icon: "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 text-amber-700 shadow-[0_10px_20px_rgba(245,158,11,0.14)]",
      top: "from-amber-400 to-orange-400",
      bullet: "bg-amber-500/75",
    },
    movement: {
      card: "border-cyan-100 hover:border-cyan-200 hover:shadow-[0_16px_34px_rgba(8,145,178,0.12)]",
      icon: "border-cyan-200 bg-gradient-to-br from-cyan-50 to-sky-100 text-cyan-700 shadow-[0_10px_20px_rgba(8,145,178,0.12)]",
      top: "from-cyan-400 to-sky-400",
      bullet: "bg-cyan-500/75",
    },
    wide: {
      card: "border-violet-100 hover:border-violet-200 hover:shadow-[0_16px_34px_rgba(124,58,237,0.12)]",
      icon: "border-violet-200 bg-gradient-to-br from-violet-50 to-slate-100 text-violet-700 shadow-[0_10px_20px_rgba(124,58,237,0.12)]",
      top: "from-violet-400 to-slate-400",
      bullet: "bg-violet-500/75",
    },
    cost: {
      card: "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 shadow-[0_16px_36px_rgba(16,185,129,0.16)] hover:border-emerald-300 hover:shadow-[0_20px_44px_rgba(16,185,129,0.22)]",
      icon: "border-emerald-200 bg-gradient-to-br from-emerald-100 to-green-50 text-emerald-700 shadow-[0_12px_24px_rgba(16,185,129,0.20)]",
      top: "from-emerald-400 to-green-400",
      bullet: "bg-emerald-500/75",
    },
  };
  const costAmount =
    item.estimatedCost.match(/₹[\d,]+/)?.[0] ??
    item.estimatedCost;
  const dayDateLabel = getDayDateLabel(
    tripIntent?.startDate,
    item.dayNumber
  );
  const notesContent = Array.isArray(notesSection?.value)
    ? notesSection.value
    : String(notesSection?.value || "")
        .split(/[.;]/)
        .map((note) => note.trim())
        .filter(Boolean);
  const nodeDisplay = getJourneyNodeDisplay(
    item.city,
    item.title,
    item.journeyType
  );

  return (
    <div
      key={item.id}
      className="relative grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-[46px_minmax(0,1fr)]"
    >
      <div className="relative hidden justify-center lg:flex">
        {hasNext ? (
          <div className="absolute bottom-0 top-12 w-[2px] rounded-full bg-gradient-to-b from-cyan-300/80 via-orange-200/85 to-cyan-200/70 shadow-[0_0_18px_rgba(34,211,238,0.24)]" />
        ) : null}
        <span className="relative z-10 mt-2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-red-100 bg-white shadow-[0_14px_28px_rgba(239,68,68,0.18)]">
          <span className="absolute h-7 w-7 rotate-45 rounded-[0.85rem_0.85rem_0.85rem_0.2rem] bg-gradient-to-br from-red-400 via-red-500 to-red-600 shadow-[0_10px_22px_rgba(239,68,68,0.36)]" />
          <span className="relative h-2.5 w-2.5 rounded-full bg-white shadow-sm" />
        </span>
      </div>

      <div className="min-w-0 pb-3">
        <button
          type="button"
          onClick={() =>
            setOpenJourneyNodeId(isOpen ? null : item.id)
          }
          className={`group w-full rounded-[1.2rem] border bg-white/92 px-4 py-4 text-left shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-[0_20px_44px_rgba(15,23,42,0.13)] lg:rounded-[1.35rem] lg:px-5 ${
            isOpen
              ? "border-orange-200 shadow-[0_16px_38px_rgba(249,115,22,0.12)]"
              : "border-sky-200"
          }`}
          aria-expanded={isOpen}
        >
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-sky-100 pb-3 lg:hidden">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-orange-600">
                {item.dayLabel}
                {dayDateLabel ? ` • ${dayDateLabel}` : ""}
              </p>
              <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                {item.dayNumber === 1 ? "Start" : "Milestone"}
              </p>
            </div>
            <span className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-100 bg-white shadow-[0_10px_22px_rgba(239,68,68,0.14)]">
              <span className="absolute h-5 w-5 rotate-45 rounded-[0.65rem_0.65rem_0.65rem_0.16rem] bg-gradient-to-br from-red-400 via-red-500 to-red-600" />
              <span className="relative h-2 w-2 rounded-full bg-white shadow-sm" />
            </span>
          </div>

          <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_130px_minmax(0,1fr)]">
            <div className="min-w-0 lg:border-r lg:border-sky-100 lg:pr-4">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-orange-600 lg:hidden">
                Location
              </p>
              <p className="mt-1 text-lg font-black leading-tight tracking-[-0.02em] text-slate-950 lg:mt-0 lg:text-[18px]">
                {item.city}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p className="text-[13px] font-medium leading-snug text-slate-500">
                  {nodeDisplay.subtitle}
                </p>
                <span className="rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-sky-700">
                  {nodeDisplay.category}
                </span>
              </div>
            </div>

            <div className="hidden justify-start lg:flex lg:justify-center">
              <span className="relative inline-flex min-w-[92px] flex-col items-center rounded-[1.15rem] border border-orange-200 bg-gradient-to-br from-white via-orange-50 to-sky-50 px-3 pb-3 pt-5 text-center shadow-[0_16px_34px_rgba(249,115,22,0.16)] transition duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_20px_44px_rgba(249,115,22,0.24)]">
                <span className="absolute -top-3 flex h-7 w-7 items-center justify-center rounded-xl border border-orange-200 bg-white shadow-[0_10px_20px_rgba(15,23,42,0.10)]">
                  <span className="h-3.5 w-3.5 rounded-[0.22rem] border border-orange-500 bg-orange-100 shadow-[inset_0_3px_0_rgba(249,115,22,0.35)]" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-red-600">
                  {item.dayLabel}
                </span>
                {dayDateLabel ? (
                  <span className="mt-1 text-xs font-semibold text-slate-700">
                    {dayDateLabel}
                  </span>
                ) : null}
                <span className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
                  {item.dayNumber === 1 ? "Start" : "Milestone"}
                </span>
              </span>
            </div>

            <div className="flex min-w-0 items-center justify-between gap-3 lg:border-l lg:border-sky-100 lg:pl-4 lg:justify-end">
              <div className="min-w-0 text-left lg:text-right">
                <div className="my-1 h-px w-full bg-sky-100 lg:hidden" />
                <p className="pt-3 text-[11px] font-black uppercase tracking-[0.14em] text-orange-600 lg:hidden">
                  Travel
                </p>
                <p className="mt-1 text-base font-black text-slate-900 lg:mt-0 lg:font-semibold">
                  {item.transferFromPrevious}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-600">
                  {item.timeWindow}
                </p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.04em] text-slate-700">
                  {item.distanceText} • {item.durationText}
                </p>
              </div>

              <ChevronDown
                size={18}
                className={`shrink-0 text-slate-500 transition-transform ${
                  isOpen ? "rotate-180 text-orange-600" : ""
                }`}
              />
            </div>
          </div>
        </button>

        <div
          className={`grid transition-all duration-300 ease-out ${
            isOpen
              ? "mt-4 grid-rows-[1fr] opacity-100"
              : "mt-0 grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="rounded-[1.15rem] border border-orange-100/80 bg-gradient-to-br from-white via-sky-50/80 to-orange-50/60 p-3 shadow-[0_20px_48px_rgba(15,23,42,0.10)] sm:rounded-[1.45rem] sm:p-5">
              <div className="grid gap-4 lg:grid-cols-2">
                {regularSections.map((section) => {
                  const Icon = section.icon;
                  const styles =
                    toneStyles[
                      section.tone as keyof typeof toneStyles
                    ] ?? toneStyles.stay;
                  const content = Array.isArray(section.value)
                    ? section.value
                    : [section.value];

                  return (
                    <div
                      key={`${item.id}-${section.label}`}
                      className={`group/detail relative min-w-0 overflow-hidden rounded-[1.2rem] border bg-white/88 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-0.5 ${styles.card}`}
                    >
                      <div
                        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${styles.top}`}
                      />
                      <div className="flex items-start gap-3">
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition duration-300 group-hover/detail:scale-105 ${styles.icon}`}
                        >
                          <Icon size={16} />
                        </span>

                        <div className="min-w-0">
                          <p className="text-[15px] font-black text-slate-950">
                            {section.label}
                          </p>

                          {Array.isArray(section.value) ? (
                            <ul className="mt-2 grid gap-1.5">
                              {content.map((value) => (
                                <li
                                  key={`${item.id}-${section.label}-${value}`}
                                  className="flex items-start gap-2 text-[13px] font-extrabold leading-5 text-slate-700"
                                >
                                  <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${styles.bullet}`} />
                                  <span>{value}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-2 text-[13px] font-extrabold leading-6 text-slate-700">
                              {section.value}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {notesSection && costSection ? (
                  <div className="grid gap-4 sm:col-span-2 lg:grid-cols-[1.4fr_0.8fr]">
                    {[
                      notesSection,
                      costSection,
                    ].map((section) => {
                      const Icon = section.icon;
                      const isCost = section.tone === "cost";
                      const styles =
                        toneStyles[
                          section.tone as keyof typeof toneStyles
                        ] ?? toneStyles.wide;

                      return (
                        <div
                          key={`${item.id}-${section.label}`}
                          className={`group/detail relative min-w-0 overflow-hidden rounded-[1.2rem] border bg-white/88 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-0.5 ${styles.card}`}
                        >
                          <div
                            className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${styles.top}`}
                          />
                          <div className="flex items-start gap-3">
                            <span
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition duration-300 group-hover/detail:scale-105 ${styles.icon}`}
                            >
                              <Icon size={16} />
                            </span>

                            <div className="min-w-0">
                              <p className="text-[15px] font-black text-slate-950">
                                {section.label}
                              </p>

                              {isCost ? (
                                <>
                                  <p className="mt-2 text-3xl font-black leading-none text-emerald-700">
                                    {costAmount}
                                  </p>
                                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">
                                    Day Estimate
                                  </p>
                                </>
                              ) : (
                                <ul className="mt-2 grid gap-1.5">
                                  {notesContent.map((note) => (
                                    <li
                                      key={`${item.id}-note-${note}`}
                                      className="flex items-start gap-2 text-[13px] font-extrabold leading-5 text-slate-700"
                                    >
                                      <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${styles.bullet}`} />
                                      <span>{note}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        </div>
    </div>
  );
})}
</div>
            </div>
  );
}
