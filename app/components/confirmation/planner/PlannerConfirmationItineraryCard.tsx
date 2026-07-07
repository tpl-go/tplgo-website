"use client";

type RecordValue = Record<string, unknown>;

type Props = {
  days?: RecordValue[];
  selectedBasketItems?: RecordValue[];
};

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function safeArray(value: unknown): RecordValue[] {
  return Array.isArray(value)
    ? value.filter((item): item is RecordValue => typeof item === "object" && item !== null)
    : [];
}

function dayNumber(day: RecordValue, index: number) {
  return Number(day.day || day.dayNumber || day.number || index + 1);
}

function dayItems(day: RecordValue) {
  return [
    ...safeArray(day.items),
    ...safeArray(day.activities),
    ...safeArray(day.itineraryItems),
    ...safeArray(day.schedule),
  ];
}

export default function PlannerConfirmationItineraryCard({
  days = [],
  selectedBasketItems = [],
}: Props) {
  return (
    <section className="rounded-[24px] border border-[#d9e2ec] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
      <h2 className="text-[21px] font-black text-slate-950">Day-wise Planner Itinerary</h2>
      <p className="mt-1 text-sm font-semibold text-slate-500">
        Confirmed Smart Planner itinerary and day-linked basket items.
      </p>

      <div className="mt-4 space-y-3">
        {days.length ? (
          days.map((day, index) => {
            const number = dayNumber(day, index);
            const basketForDay = selectedBasketItems.filter(
              (item) => Number(item.day || item.dayNumber) === number
            );
            const items = dayItems(day);

            return (
              <div key={`${number}-${text(day.title)}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-black text-slate-950">
                      Day {String(number).padStart(2, "0")} · {text(day.title) || text(day.city) || "Planner Day"}
                    </div>
                    <div className="mt-1 text-xs font-bold text-slate-500">
                      {[text(day.date), text(day.city) || text(day.destination)].filter(Boolean).join(" • ") || "Day details"}
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                    {basketForDay.length} basket item{basketForDay.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2">
                  {[...basketForDay, ...items].slice(0, 8).map((item, itemIndex) => (
                    <div key={`${text(item.title) || "item"}-${itemIndex}`} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                      <div className="text-sm font-bold text-slate-900">
                        {text(item.title) || text(item.name) || "Itinerary item"}
                      </div>
                      <div className="mt-0.5 text-xs font-semibold text-slate-500">
                        {[text(item.time), text(item.type) || text(item.serviceType), text(item.location) || text(item.city)]
                          .filter(Boolean)
                          .join(" • ") || "Planner itinerary"}
                      </div>
                    </div>
                  ))}
                  {!basketForDay.length && !items.length ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-3 py-3 text-sm font-bold text-slate-500">
                      No detailed items available for this day.
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm font-bold text-slate-600">
            Smart Planner itinerary details are not available.
          </div>
        )}
      </div>
    </section>
  );
}
