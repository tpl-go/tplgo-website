"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type DayItem = {
  day: number;
  title: string;
  items: string[];
  dateLabel?: string;
  included?: {
    flights?: number;
    hotels?: number;
    transfers?: number;
    activities?: number;
    meals?: number;
  };
};

type Props = {
  itinerary: DayItem[];
  travelDate?: string;
  onChangeFlight?: () => void;
  onChangeHotel?: () => void;
  onChangeTransfer?: () => void;
  onChangeMeal?: () => void;
  onChangeActivity?: () => void;

  selectedFlightLabels?: string[];
  selectedHotelLabels?: string[];
  selectedTransferLabels?: string[];
  selectedMealLabels?: string[];
  selectedActivityLabels?: string[];

  includedFlightLabels?: string[];
  includedHotelLabels?: string[];
  includedTransferLabels?: string[];
  includedMealLabels?: string[];
  includedActivityLabels?: string[];
};

type ServiceActionKey =
  | "flight"
  | "hotel"
  | "transfer"
  | "meal"
  | "activity";

type FlowCard = {
  key: string;
  title: string;
  actionKey?: ServiceActionKey;
  description: string;
  includedLabel?: string;
  selectedLabel?: string;
  changeLabel?: string;
};

function isValidDateString(value?: string | null) {
  if (!value) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

function formatDayDate(baseDate: string, dayOffset: number) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + dayOffset);

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getItemChangeMeta(item: string) {
  const text = item.toLowerCase();

  if (
    text.includes("arrival") ||
    text.includes("departure") ||
    text.includes("flight")
  ) {
    return {
      label: "Change Flight",
      actionKey: "flight" as const,
      includedLabel: "Standard Included Flight",
    };
  }

  if (
    text.includes("transfer") ||
    text.includes("pickup") ||
    text.includes("drop") ||
    text.includes("cab")
  ) {
    return {
      label: "Change Transfer",
      actionKey: "transfer" as const,
      includedLabel: "Standard Included Transfer",
    };
  }

  if (
    text.includes("hotel") ||
    text.includes("check-in") ||
    text.includes("stay") ||
    text.includes("resort")
  ) {
    return {
      label: "Change Hotel",
      actionKey: "hotel" as const,
      includedLabel: "Standard Included Hotel",
    };
  }

  if (
    text.includes("meal") ||
    text.includes("breakfast") ||
    text.includes("lunch") ||
    text.includes("dinner")
  ) {
    return {
      label: "Change Meal",
      actionKey: "meal" as const,
      includedLabel: "Standard Included Meal Plan",
    };
  }

  if (
    text.includes("activity") ||
    text.includes("sightseeing") ||
    text.includes("tour") ||
    text.includes("excursion") ||
    text.includes("experience")
  ) {
    return {
      label: "Change Activity",
      actionKey: "activity" as const,
      includedLabel: "Standard Included Experience",
    };
  }

  return null;
}

function getItemSmartDescription(item: string, dayTitle?: string) {
  const text = item.toLowerCase();
  const dayContext = dayTitle ? ` for ${dayTitle.toLowerCase()}` : "";

  if (text.includes("arrival")) {
    return `Arrival assistance, airport or station coordination, and smooth onboarding to begin your journey${dayContext}.`;
  }

  if (text.includes("departure")) {
    return `Departure coordination with final transfer timing and exit support as per the confirmed travel plan${dayContext}.`;
  }

  if (text.includes("flight") || text.includes("air travel")) {
    return `Flight timing, sector, and fare are linked with your selected travel date and departure city. Final availability will reflect at booking.`;
  }

  if (
    text.includes("transfer") ||
    text.includes("pickup") ||
    text.includes("drop") ||
    text.includes("cab")
  ) {
    return `Transfer arrangement covers movement between key points in your itinerary with upgrade options for private and premium vehicles.`;
  }

  if (
    text.includes("hotel") ||
    text.includes("check-in") ||
    text.includes("stay") ||
    text.includes("resort")
  ) {
    return `Hotel stay details, room type, and check-in flow are aligned with the selected package plan and can be upgraded where available.`;
  }

  if (text.includes("breakfast")) {
    return `Breakfast inclusion will follow the selected meal plan and hotel policy for this day.`;
  }

  if (text.includes("lunch")) {
    return `Lunch arrangement can be included or upgraded depending on your selected meal customization.`;
  }

  if (text.includes("dinner")) {
    return `Dinner plan may include standard meal coverage or optional premium dining experiences for a richer stay.`;
  }

  if (text.includes("meal")) {
    return `Meal coverage for this part of the itinerary follows your selected meal plan and can be customized further.`;
  }

  if (
    text.includes("sightseeing") ||
    text.includes("tour") ||
    text.includes("excursion")
  ) {
    return `This sightseeing block covers the planned local highlights, with options to switch to private, premium, or signature experiences.`;
  }

  if (text.includes("activity") || text.includes("experience")) {
    return `Experience details can be customized with upgraded or signature options based on destination, theme, and package style.`;
  }

  if (text.includes("leisure")) {
    return `This is a lighter day kept flexible for rest, self-exploration, or optional add-on experiences.`;
  }

  if (text.includes("explore")) {
    return `Open exploration window with optional upgrades, curated experiences, and destination-based sightseeing choices.`;
  }

  return `Planned service and timing for this itinerary component will align with the selected date, package flow, and final operational availability.`;
}

function getServiceDescription(actionKey: ServiceActionKey) {
  if (actionKey === "flight") {
    return "Flight segment for this day based on selected route, timing and fare availability.";
  }
  if (actionKey === "hotel") {
    return "Hotel stay for this day based on your current room and stay selection.";
  }
  if (actionKey === "transfer") {
    return "Transfer arrangement for this day based on your current pickup, drop or vehicle selection.";
  }
  if (actionKey === "meal") {
    return "Meal coverage for this day based on your selected meal plan.";
  }
  return "Activity or sightseeing for this day based on your selected experience.";
}

function getServiceTitleForAction(actionKey: ServiceActionKey) {
  if (actionKey === "flight") return "Flight";
  if (actionKey === "hotel") return "Hotel";
  if (actionKey === "transfer") return "Transfer";
  if (actionKey === "meal") return "Meal";
  return "Activity";
}

function getChangeLabelForAction(actionKey: ServiceActionKey) {
  if (actionKey === "flight") return "Change Flight";
  if (actionKey === "hotel") return "Change Hotel";
  if (actionKey === "transfer") return "Change Transfer";
  if (actionKey === "meal") return "Change Meal";
  return "Change Activity";
}

function getIncludedCountForDay(day: DayItem, actionKey: ServiceActionKey) {
  if (actionKey === "flight") return day.included?.flights ?? 0;
  if (actionKey === "hotel") return day.included?.hotels ?? 0;
  if (actionKey === "transfer") return day.included?.transfers ?? 0;
  if (actionKey === "meal") return day.included?.meals ?? 0;
  return day.included?.activities ?? 0;
}

function getFallbackIncludedLabel(actionKey: ServiceActionKey) {
  if (actionKey === "flight") return "Standard Included Flight";
  if (actionKey === "hotel") return "Standard Included Hotel";
  if (actionKey === "transfer") return "Standard Included Transfer";
  if (actionKey === "meal") return "Standard Included Meal Plan";
  return "Standard Included Experience";
}

function getSafeLabelByDay(
  labels: string[],
  dayIndex: number,
  fallbackToFirst = true
) {
  if (!Array.isArray(labels) || labels.length === 0) return "";
  if (labels[dayIndex]) return labels[dayIndex];
  if (fallbackToFirst && labels.length === 1) return labels[0];
  return "";
}

export default function ItineraryTab({
  itinerary,
  travelDate,
  onChangeFlight,
  onChangeHotel,
  onChangeTransfer,
  onChangeMeal,
  onChangeActivity,
  selectedFlightLabels = [],
  selectedHotelLabels = [],
  selectedTransferLabels = [],
  selectedMealLabels = [],
  selectedActivityLabels = [],
  includedFlightLabels = [],
  includedHotelLabels = [],
  includedTransferLabels = [],
  includedMealLabels = [],
  includedActivityLabels = [],
}: Props) {
  const days = useMemo(() => {
    const rawDays = itinerary ?? [];

    if (!isValidDateString(travelDate)) {
      return rawDays;
    }

    return rawDays.map((dayItem, index) => ({
      ...dayItem,
      dateLabel: dayItem.dateLabel || formatDayDate(String(travelDate), index),
    }));
  }, [itinerary, travelDate]);

  const [activeDay, setActiveDay] = useState<number>(days?.[0]?.day ?? 1);

  useEffect(() => {
    if (!days.length) return;
    setActiveDay((prev) => {
      const exists = days.some((d) => d.day === prev);
      return exists ? prev : days[0].day;
    });
  }, [days]);

  const DAY_HEADER_TOP = 90;

  const sectionRefs = useRef<Record<number, HTMLElement | null>>({});
  const leftScrollRef = useRef<HTMLDivElement | null>(null);
  const leftItemRef = useRef<Record<number, HTMLButtonElement | null>>({});

  const goToDay = (day: number) => {
    const el = sectionRefs.current[day];
    if (!el) return;

    const y =
      el.getBoundingClientRect().top + window.scrollY - DAY_HEADER_TOP - 8;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  useEffect(() => {
    const container = leftScrollRef.current;
    const btn = leftItemRef.current[activeDay];
    if (!container || !btn) return;

    const hasOverflow = container.scrollHeight > container.clientHeight + 2;
    if (!hasOverflow) return;

    const containerRect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    const topDiff = btnRect.top - containerRect.top;
    const bottomDiff = btnRect.bottom - containerRect.bottom;

    if (topDiff < 0) {
      container.scrollTo({
        top: container.scrollTop + topDiff - 16,
        behavior: "smooth",
      });
    } else if (bottomDiff > 0) {
      container.scrollTo({
        top: container.scrollTop + bottomDiff + 16,
        behavior: "smooth",
      });
    }
  }, [activeDay]);

  useEffect(() => {
    if (!days.length) return;

    const els = days
      .map((d) => sectionRefs.current[d.day])
      .filter(Boolean) as HTMLElement[];

    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0)
          )[0];

        if (!best?.target) return;
        const dayAttr = (best.target as HTMLElement).dataset.day;
        const dayNum = dayAttr ? Number(dayAttr) : NaN;
        if (!Number.isNaN(dayNum)) setActiveDay(dayNum);
      },
      {
        root: null,
        rootMargin: `-${DAY_HEADER_TOP + 20}px 0px -40% 0px`,
        threshold: [0.2, 0.35, 0.5, 0.65],
      }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [days]);

  const leftMaxH = `clamp(340px, calc(100vh - ${DAY_HEADER_TOP + 20}px), 720px)`;

  const handleContextAction = (actionKey: ServiceActionKey) => {
    if (actionKey === "flight") onChangeFlight?.();
    if (actionKey === "hotel") onChangeHotel?.();
    if (actionKey === "transfer") onChangeTransfer?.();
    if (actionKey === "meal") onChangeMeal?.();
    if (actionKey === "activity") onChangeActivity?.();
  };

  const getSelectedLabelsForAction = (actionKey: ServiceActionKey) => {
    if (actionKey === "flight") return selectedFlightLabels;
    if (actionKey === "hotel") return selectedHotelLabels;
    if (actionKey === "transfer") return selectedTransferLabels;
    if (actionKey === "meal") return selectedMealLabels;
    if (actionKey === "activity") return selectedActivityLabels;
    return [];
  };

  const getIncludedLabelsForAction = (actionKey: ServiceActionKey) => {
    if (actionKey === "flight") return includedFlightLabels;
    if (actionKey === "hotel") return includedHotelLabels;
    if (actionKey === "transfer") return includedTransferLabels;
    if (actionKey === "meal") return includedMealLabels;
    if (actionKey === "activity") return includedActivityLabels;
    return [];
  };

  const getSelectedLabelForDay = (
    actionKey: ServiceActionKey,
    dayIndex: number
  ) => {
    const labels = getSelectedLabelsForAction(actionKey);
    return getSafeLabelByDay(labels, dayIndex, true);
  };

  const getIncludedLabelForDay = (
    actionKey: ServiceActionKey,
    dayIndex: number
  ) => {
    const labels = getIncludedLabelsForAction(actionKey);
    return getSafeLabelByDay(labels, dayIndex, true);
  };

  const serviceOrder: ServiceActionKey[] = [
    "flight",
    "transfer",
    "hotel",
    "meal",
    "activity",
  ];

  return (
    <div className="grid grid-cols-12 gap-4 lg:gap-6">
      <aside className="col-span-12 lg:col-span-3">
        <div className="lg:sticky" style={{ top: DAY_HEADER_TOP }}>
          <div className="text-base font-bold text-gray-800 mb-2 text-center">
            Day Wise Plan
          </div>

          <div className="rounded-2xl border bg-white p-3">
            <div
              ref={leftScrollRef}
              className="relative overflow-x-auto overflow-y-hidden pr-0 lg:overflow-y-auto lg:pr-2"
              style={{ maxHeight: leftMaxH }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  width: 0px;
                  height: 0px;
                }
                div {
                  scrollbar-width: none;
                }
              `}</style>

              <div className="absolute left-[10px] top-1 bottom-1 hidden w-[2px] bg-gray-200 lg:block" />

              <div className="flex gap-2 lg:block lg:space-y-2 lg:pl-6">
                {days.map((d) => {
                  const isActive = d.day === activeDay;

                  return (
                    <button
                      key={d.day}
                      ref={(el) => {
                        leftItemRef.current[d.day] = el;
                      }}
                      onClick={() => goToDay(d.day)}
                      className={`relative min-w-[150px] text-left rounded-xl px-3 py-2.5 transition lg:w-full lg:min-w-0 ${
                        isActive
                          ? "bg-[#1E3A8A] text-white"
                          : "bg-white hover:bg-gray-50 text-gray-900"
                      }`}
                    >
                      <span
                        className={`absolute left-[-18px] top-[14px] hidden h-3 w-3 rounded-full border-2 lg:block ${
                          isActive
                            ? "bg-white border-white"
                            : "bg-white border-gray-300"
                        }`}
                      />

                      <div className="flex flex-col gap-1">
                        <div className="text-xs font-bold">Day {d.day}</div>

                        {d.dateLabel ? (
                          <div
                            className={`text-[11px] leading-4 ${
                              isActive ? "text-white/85" : "text-gray-500"
                            }`}
                          >
                            {d.dateLabel}
                          </div>
                        ) : null}

                        <div
                          className={`line-clamp-1 text-[11px] ${
                            isActive ? "text-white/85" : "text-gray-600"
                          }`}
                        >
                          {d.title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="col-span-12 lg:col-span-9 space-y-5">
        {days.map((d) => {
          const dayIndex = Math.max(d.day - 1, 0);
          const usedActionKeys = new Set<ServiceActionKey>();

          const flowCards: FlowCard[] = [];

          (d.items || []).forEach((it, idx) => {
            const changeMeta = getItemChangeMeta(it);

            if (changeMeta) {
              usedActionKeys.add(changeMeta.actionKey);

              const selectedLabel = getSelectedLabelForDay(
                changeMeta.actionKey,
                dayIndex
              );
              const includedLabel =
                getIncludedLabelForDay(changeMeta.actionKey, dayIndex) ||
                changeMeta.includedLabel;

              flowCards.push({
                key: `${d.day}-${idx}-${changeMeta.actionKey}`,
                title: it,
                actionKey: changeMeta.actionKey,
                description: getItemSmartDescription(it, d.title),
                includedLabel,
                selectedLabel,
                changeLabel: changeMeta.label,
              });
            } else {
              flowCards.push({
                key: `${d.day}-${idx}-normal`,
                title: it,
                description: getItemSmartDescription(it, d.title),
              });
            }
          });

          serviceOrder.forEach((actionKey) => {
            if (usedActionKeys.has(actionKey)) return;

            const includedCount = getIncludedCountForDay(d, actionKey);
            const selectedLabel = getSelectedLabelForDay(actionKey, dayIndex);
            const includedLabel = getIncludedLabelForDay(actionKey, dayIndex);

            if (includedCount <= 0 && !selectedLabel && !includedLabel) return;

            flowCards.push({
              key: `${d.day}-extra-${actionKey}`,
              title: getServiceTitleForAction(actionKey),
              actionKey,
              description: getServiceDescription(actionKey),
              includedLabel: includedLabel || getFallbackIncludedLabel(actionKey),
              selectedLabel,
              changeLabel: getChangeLabelForAction(actionKey),
            });
          });

          return (
            <section
              key={d.day}
              ref={(el) => {
                sectionRefs.current[d.day] = el;
              }}
              data-day={d.day}
              className="rounded-2xl border bg-white"
            >
              <div
                className="bg-white border-b rounded-t-2xl lg:sticky lg:z-10"
                style={{ top: DAY_HEADER_TOP }}
              >
                <div className="px-4 py-4 lg:px-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <span className="px-3 py-1 rounded-full bg-gray-100 border text-sm font-bold text-black">
                      Day {d.day}
                    </span>

                    <div className="min-w-0">
                      <div className="text-base font-semibold text-black truncate">
                        {d.title}
                      </div>
                      {d.dateLabel ? (
                        <div className="mt-0.5 text-xs text-gray-500">
                          {d.dateLabel}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-gray-700">
                    {(d.included?.flights ?? 0) > 0 ? (
                      <span>✈ {d.included?.flights} Flight</span>
                    ) : null}
                    {(d.included?.hotels ?? 0) > 0 ? (
                      <span>🏨 {d.included?.hotels} Hotel</span>
                    ) : null}
                    {(d.included?.transfers ?? 0) > 0 ? (
                      <span>🚕 {d.included?.transfers} Transfer</span>
                    ) : null}
                    {(d.included?.activities ?? 0) > 0 ? (
                      <span>🎯 {d.included?.activities} Activities</span>
                    ) : null}
                    {(d.included?.meals ?? 0) > 0 ? (
                      <span>🍽 {d.included?.meals} Meal</span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-4 lg:p-5">
                {flowCards.map((card) => (
                  <div
                    key={card.key}
                    className="rounded-xl border bg-gray-50 px-4 py-3"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900">
                          {card.title}
                        </div>

                        <div className="mt-1 text-xs leading-5 text-gray-600">
                          {card.description}
                        </div>

                        {(card.selectedLabel || card.includedLabel) ? (
                          <div
                            className={`mt-2 inline-flex max-w-full items-center rounded-full px-3 py-1 text-[11px] font-semibold border ${
                              card.selectedLabel
                                ? "border-blue-200 bg-blue-50 text-blue-700"
                                : "border-gray-200 bg-white text-gray-700"
                            }`}
                          >
                            {card.selectedLabel
                              ? `Selected: ${card.selectedLabel}`
                              : `Included: ${card.includedLabel}`}
                          </div>
                        ) : null}
                      </div>

                      {card.actionKey && card.changeLabel ? (
                        <button
                          type="button"
                          onClick={() => card.actionKey && handleContextAction(card.actionKey)}
                          className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:text-blue-800 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:text-blue-600"
                        >
                          {card.changeLabel}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        <div style={{ height: DAY_HEADER_TOP + 120 }} />
      </main>
    </div>
  );
}
