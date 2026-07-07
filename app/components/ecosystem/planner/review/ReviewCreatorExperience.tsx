"use client";

import {
  Camera,
  Clapperboard,
  MapPinned,
  Route,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { WorkspaceBookingBasketItem } from "@/app/components/ecosystem/planner/workspace/utils/bookingBasket";
import type { MyTripSavedItem } from "@/app/lib/ecosystem/planner/myTripsStorage";
import type { TiyaSmartPlannerReviewPayload } from "@/app/lib/ecosystem/planner/plannerReviewPayload";
import type { TiyaTimelineItem } from "@/app/lib/ecosystem/planner/plannerTypes";
import { getReviewStatusVisual } from "./reviewStatusStyles";

type ReviewCreatorExperienceProps = {
  payload: TiyaSmartPlannerReviewPayload;
};

type CreatorStatus = "Added to Booking" | "Saved" | "Itinerary Only" | "Recommended";

type CreatorReviewItem = {
  city?: string;
  creatorName?: string;
  day?: number | string;
  id: string;
  location?: string;
  source: string;
  specialty?: string;
  status: CreatorStatus;
  time?: string;
  title: string;
};

type UnknownRecord = Record<string, unknown>;

function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function asRecord(value: unknown): UnknownRecord {
  return typeof value === "object" && value !== null ? (value as UnknownRecord) : {};
}

function textValue(record: UnknownRecord, keys: string[]) {
  const value = keys.map((key) => record[key]).find((item) => typeof item === "string");
  return typeof value === "string" ? value : "";
}

function normalizeText(value: unknown) {
  return String(value || "").toLowerCase();
}

function itemHaystack(value: unknown) {
  const record = asRecord(value);
  return normalizeText(
    [
      record.type,
      record.category,
      record.sourceModule,
      record.source,
      record.serviceType,
      record.serviceLabel,
      record.serviceName,
      record.title,
      record.creatorName,
      record.handle,
      record.specialty,
      record.description,
      record.meta,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function isCreatorSignal(value: unknown) {
  const text = itemHaystack(value);
  return (
    text.includes("creator") ||
    text.includes("reel") ||
    text.includes("story") ||
    text.includes("photo") ||
    text.includes("content")
  );
}

function normalizeCreatorPayloadItem(
  item: unknown,
  index: number
): CreatorReviewItem {
  const record = asRecord(item);
  const title =
    textValue(record, ["title", "placeName", "spotName", "specialty"]) ||
    textValue(record, ["creatorName", "handle"]) ||
    `Creator experience ${index + 1}`;

  return {
    city: textValue(record, ["city", "destination", "location"]),
    creatorName: textValue(record, ["creatorName", "name", "handle"]),
    day: textValue(record, ["day", "dayNumber"]),
    id: `creator-${String(record.id || title)}-${index}`,
    location: textValue(record, ["location", "destination"]),
    source: textValue(record, ["source", "sourceModule"]) || "Creator Recommendation",
    specialty: textValue(record, ["specialty", "category", "theme"]),
    status: "Recommended",
    time: textValue(record, ["time", "bestTime"]),
    title,
  };
}

function normalizeBasketItem(item: WorkspaceBookingBasketItem): CreatorReviewItem | null {
  if (!isCreatorSignal(item)) return null;

  return {
    city: item.city || item.to,
    day: item.day,
    id: `basket-creator-${item.id}`,
    location: item.city || item.to || item.from,
    source: item.serviceLabel || item.serviceName || "Workspace",
    specialty: item.serviceType || item.category,
    status: "Added to Booking",
    time: item.time,
    title: item.selectedOptionName || item.title,
  };
}

function normalizeSavedItem(item: MyTripSavedItem): CreatorReviewItem | null {
  if (item.type !== "Creators" && !isCreatorSignal(item)) return null;

  return {
    city: item.city || item.destination,
    day: item.day,
    id: `saved-creator-${item.id}`,
    location: item.city || item.destination,
    source: item.sourceModule || "My Trips",
    specialty: item.category,
    status: "Saved",
    time: item.time,
    title: item.title,
  };
}

function normalizeTimelineItem(
  item: TiyaTimelineItem,
  city: string,
  day: number
): CreatorReviewItem | null {
  if (!isCreatorSignal(item)) return null;

  return {
    city,
    day,
    id: `timeline-creator-${day}-${item.id}`,
    location: item.location || city,
    source: "Workspace",
    specialty: item.category || item.serviceType || item.type,
    status: "Itinerary Only",
    time: item.time,
    title: item.title,
  };
}

function buildCreatorItems(payload: TiyaSmartPlannerReviewPayload) {
  const basketItems = safeArray(payload.selectedBasketItems)
    .map(normalizeBasketItem)
    .filter(Boolean) as CreatorReviewItem[];
  const savedItems = safeArray(payload.savedItems)
    .map(normalizeSavedItem)
    .filter(Boolean) as CreatorReviewItem[];
  const payloadItems = safeArray(payload.selectedCreatorSpots).map(normalizeCreatorPayloadItem);
  const timelineItems = safeArray(payload.itinerary).flatMap((day) =>
    safeArray(day.items)
      .map((item) => normalizeTimelineItem(item, day.city, day.day))
      .filter(Boolean)
  ) as CreatorReviewItem[];

  const priority: Record<CreatorStatus, number> = {
    "Added to Booking": 4,
    Saved: 3,
    "Itinerary Only": 2,
    Recommended: 1,
  };
  const byKey = new Map<string, CreatorReviewItem>();

  [...basketItems, ...savedItems, ...timelineItems, ...payloadItems].forEach((item) => {
    const key = normalizeText(`${item.title}|${item.city || ""}|${item.day || ""}`);
    const existing = byKey.get(key);
    if (!existing || priority[item.status] > priority[existing.status]) {
      byKey.set(key, item);
    }
  });

  return Array.from(byKey.values());
}

function statusClass(status: CreatorStatus) {
  return getReviewStatusVisual(status).badgeClass;
}

export default function ReviewCreatorExperience({
  payload,
}: ReviewCreatorExperienceProps) {
  const items = buildCreatorItems(payload);
  const added = items.filter((item) => item.status === "Added to Booking").length;
  const saved = items.filter((item) => item.status === "Saved").length;
  const itineraryOnly = items.filter((item) => item.status === "Itinerary Only").length;
  const cities = new Set(items.map((item) => item.city).filter(Boolean)).size;

  return (
    <section className="rounded-[2rem] border border-violet-200 bg-[linear-gradient(180deg,#faf5ff,#ffffff)] p-6 shadow-[0_18px_54px_rgba(88,28,135,0.08)]">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-violet-700">
            Creator Discovery Layer
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950">
            CREATOR EXPERIENCE REVIEW
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-violet-900/70">
            Review creator recommended places, routes, experiences, photo spots,
            reels and story moments selected for this Smart Planner trip.
          </p>
        </div>
        <div className="hidden rounded-full border border-violet-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-violet-700 xl:block">
          Read-only creator validation
        </div>
      </div>

      <div className="mt-6 grid gap-3 xl:grid-cols-5">
        {[
          ["Creator Recommended Places", items.length],
          ["Creator Routes", items.filter((item) => normalizeText(item.specialty).includes("route")).length],
          ["Creator Experiences", items.filter((item) => !normalizeText(item.specialty).includes("route")).length],
          ["Photo / Reel / Story Spots", items.filter((item) => /photo|reel|story/i.test(`${item.title} ${item.specialty}`)).length],
          ["Cities Covered", cities],
        ].map(([label, value]) => (
          <article
            key={label}
            className="rounded-3xl border border-violet-100 bg-white p-4 shadow-[0_12px_34px_rgba(88,28,135,0.05)]"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-500">
              {label}
            </p>
            <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[1.75rem] border border-violet-100 bg-white p-5 shadow-[0_18px_54px_rgba(88,28,135,0.07)]">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-violet-500">
            Creator Experience Items
          </p>
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {items.length ? (
              items.map((item) => {
                const statusVisual = getReviewStatusVisual(item.status);
                const detailRows: Array<{
                  icon: LucideIcon;
                  label: string;
                  value: string;
                }> = [
                  {
                    icon: UserRound,
                    label: "Creator",
                    value: item.creatorName || "Creator details pending",
                  },
                  {
                    icon: MapPinned,
                    label: "City / Location",
                    value:
                      [item.city, item.location].filter(Boolean).join(" · ") ||
                      "Not available",
                  },
                  {
                    icon: Clapperboard,
                    label: "Day / Time",
                    value: `${item.day ? `Day ${item.day}` : "Day pending"} · ${
                      item.time || "Time pending"
                    }`,
                  },
                  { icon: Sparkles, label: "Source", value: item.source },
                ];

                return (
                  <article
                    key={item.id}
                    className={`rounded-3xl border border-violet-100 p-4 ${statusVisual.cardClass}`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusClass(item.status)}`}>
                        {item.status}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-white px-3 py-1 text-xs font-black text-violet-700">
                        <Camera size={13} />
                        {item.specialty || "Creator spot"}
                      </span>
                    </div>
                    <h3 className="mt-3 break-words text-lg font-black text-slate-950">
                      {item.title}
                    </h3>
                    <div className="mt-3 grid gap-2 text-xs">
                      {detailRows.map(({ icon: RowIcon, label, value }) => (
                        <div
                          key={label}
                          className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2"
                        >
                          <span className="inline-flex items-center gap-1.5 font-bold text-violet-700">
                            <RowIcon size={13} />
                            {label}
                          </span>
                          <span className="text-right font-black text-slate-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="rounded-3xl border border-dashed border-violet-200 bg-violet-50 p-8 text-center text-sm font-black leading-6 text-violet-800">
                No creator experiences selected yet.
                <br />
                Creator recommendations from Workspace will appear here.
              </p>
            )}
          </div>
        </div>

        <aside className="grid gap-4 self-start">
          <div className="rounded-[1.75rem] border border-violet-100 bg-white p-5 shadow-[0_18px_54px_rgba(88,28,135,0.07)]">
            <div className="flex items-center gap-2">
              <Route size={18} className="text-violet-700" />
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-violet-500">
                Creator Booking Clarity
              </p>
            </div>
            <div className="mt-4 grid gap-2">
              {[
                ["Added to Booking", added],
                ["Saved", saved],
                ["Itinerary Only", itineraryOnly],
                ["Recommended", items.filter((item) => item.status === "Recommended").length],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-violet-100 bg-violet-50/70 px-3 py-2"
                >
                  <span className="text-xs font-bold text-violet-700">{label}</span>
                  <span className="text-sm font-black text-slate-950">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
