"use client";

type RecordValue = Record<string, unknown>;

type Props = {
  items?: RecordValue[];
};

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function value(item: RecordValue) {
  const amount = Number(
    item.total ||
      item.totalPrice ||
      item.estimatedTotal ||
      item.estimatedPrice ||
      item.price ||
      item.value ||
      item.amount ||
      0
  );
  return amount > 0 ? `₹${amount.toLocaleString("en-IN")}` : "Value pending";
}

function serviceLabel(item: RecordValue) {
  const raw = [item.serviceType, item.type, item.category, item.title]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (/\btrain\b|\brail\b/.test(raw)) return "Train";
  if (/\bflight\b|\bair\b/.test(raw)) return "Flight";
  if (/\bbus\b|\bcoach\b/.test(raw)) return "Bus";
  if (/\bcab\b|\btaxi\b|\btransfer\b/.test(raw)) return "Cab / Transfer";
  if (/\bhomestay\b/.test(raw)) return "Homestay";
  if (/\bhotel\b|\bstay\b|\bresort\b|\bvilla\b/.test(raw)) return "Hotel";
  if (/\bmeal\b|\bfood\b|\bdinner\b|\bbreakfast\b|\blunch\b/.test(raw)) return "Meal";
  if (/\bactivity\b|\bexperience\b|\btour\b/.test(raw)) return "Activity";
  if (/\blocal[-\s]*life\b/.test(raw)) return "Local Life";
  if (/\bcreator\b/.test(raw)) return "Creator";
  if (/\blocal[-\s]*market\b|\bshopping\b|\bsouvenir\b/.test(raw)) return "Local Market";
  if (/\binsurance\b/.test(raw)) return "Insurance";
  if (/\bvisa\b/.test(raw)) return "Visa";
  if (/\bcruise\b/.test(raw)) return "Cruise";
  return "Other";
}

export default function PlannerConfirmationBasketCard({ items = [] }: Props) {
  return (
    <section className="rounded-[24px] border border-[#d9e2ec] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-[21px] font-black text-slate-950">Selected Basket Items</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Exact Smart Planner items confirmed for booking.
          </p>
        </div>
        <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
          {items.length} selected
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {items.length ? (
          items.map((item, index) => {
            const title = text(item.title) || text(item.name) || `${serviceLabel(item)} item`;
            const meta = [
              text(item.dayLabel) || (item.day || item.dayNumber ? `Day ${item.day || item.dayNumber}` : ""),
              text(item.date),
              text(item.time),
              text(item.city) || text(item.location),
            ].filter(Boolean);

            return (
              <div key={`${title}-${index}`} className="rounded-2xl border border-slate-200 bg-[#fcfdff] px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-blue-700">
                    {serviceLabel(item)}
                  </span>
                  <span className="text-sm font-black text-orange-700">{value(item)}</span>
                </div>
                <div className="mt-2 break-words text-sm font-black text-slate-950">{title}</div>
                {meta.length ? (
                  <div className="mt-1 text-xs font-bold text-slate-500">{meta.join(" • ")}</div>
                ) : null}
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm font-bold text-slate-600">
            No selected basket items found.
          </div>
        )}
      </div>
    </section>
  );
}
