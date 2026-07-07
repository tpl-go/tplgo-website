"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  BOOKING_UPDATED_EVENT,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";
import {
  isChunkedBookingDetailKey,
  saveChunkedBookingDetail,
} from "@/app/lib/booking/chunkedBookingStorage";
import {
  normalizeSmartPlannerBooking,
  type NormalizedSmartPlannerItem,
} from "@/app/lib/ecosystem/planner/smartPlannerBookingNormalizer";
import {
  resolveSmartPlannerBooking,
  type SmartPlannerBookingResolveResult,
} from "@/app/lib/ecosystem/planner/smartPlannerBookingResolver";
import { getSmartPlannerPayloadCompleteness } from "@/app/lib/ecosystem/planner/booking/smartPlannerBookingPayload";

type RecordValue = Record<string, unknown>;
type PlannerManageTab =
  | "summary"
  | "travellers"
  | "contact"
  | "services"
  | "notes"
  | "intelligence";

type TravellerForm = {
  age: string;
  email: string;
  firstName: string;
  fullName: string;
  gender: string;
  id: string;
  lastName: string;
  mobile: string;
  travellerType: string;
};

type ContactForm = {
  countryCode: string;
  email: string;
  mobile: string;
};

const tabs: Array<{ desc: string; key: PlannerManageTab; label: string }> = [
  { key: "summary", label: "Trip Summary", desc: "Review confirmed Smart Planner trip" },
  { key: "travellers", label: "Traveller Details", desc: "Update traveller information" },
  { key: "contact", label: "Contact Details", desc: "Update email and phone" },
  { key: "services", label: "Selected Services", desc: "Review selected basket and services" },
  { key: "notes", label: "Trip Notes", desc: "Update Smart Planner notes" },
  { key: "intelligence", label: "Planner Intelligence", desc: "Audit and readiness reference" },
];

function asRecord(value: unknown): RecordValue {
  return typeof value === "object" && value !== null ? (value as RecordValue) : {};
}

function safeArray(value: unknown): RecordValue[] {
  return Array.isArray(value)
    ? value.filter((item): item is RecordValue => typeof item === "object" && item !== null)
    : [];
}

function text(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" || typeof value === "number") {
      const result = String(value).trim();
      if (result) return result;
    }
  }
  return "";
}

function numberValue(...values: unknown[]) {
  for (const value of values) {
    const numeric = Number(value ?? 0);
    if (Number.isFinite(numeric) && numeric > 0) return numeric;
  }
  return 0;
}

function formatPrice(value: unknown) {
  return `₹${numberValue(value).toLocaleString("en-IN")}`;
}

function formatDate(value: unknown) {
  const raw = text(value);
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: unknown) {
  const raw = text(value);
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function displayValue(value: unknown) {
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? "" : "s"}`;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString("en-IN");
  if (typeof value === "string") return value.trim();
  if (typeof value === "object" && value !== null) return "Available";
  return "";
}

function itemTitle(item: RecordValue | NormalizedSmartPlannerItem) {
  const record = asRecord(item);
  return (
    text(
      record.displayName,
      record.title,
      record.name,
      record.label,
      record.serviceName,
      record.serviceLabel,
      record.hotelName,
      record.stayName,
      record.activityName,
      record.mealName,
      record.marketName,
      record.creatorName
    ) || "Selected Smart Planner item"
  );
}

function itemMeta(item: RecordValue | NormalizedSmartPlannerItem) {
  const record = asRecord(item);
  return [
    text(record.dayLabel) || (record.day ? `Day ${record.day}` : ""),
    text(record.date),
    text(record.time),
    text(record.city) || text(record.location),
    text(record.type) || text(record.serviceType) || text(record.category),
  ]
    .filter(Boolean)
    .join(" • ");
}

function itemAmount(item: RecordValue | NormalizedSmartPlannerItem) {
  const record = asRecord(item);
  return numberValue(
    record.amount,
    record.value,
    record.price,
    record.estimatedValue,
    record.estimatedCost,
    record.total,
    record.totalPrice
  );
}

function fullPayloadFrom(payload: RecordValue | null) {
  const record = asRecord(payload);
  return asRecord(record.fullPayload || record.originalPayload || record.__rawPayload || record);
}

function firstRecord(...values: unknown[]) {
  for (const value of values) {
    const record = asRecord(value);
    if (Object.keys(record).length) return record;
  }
  return {};
}

function firstArray(...values: unknown[]) {
  for (const value of values) {
    const array = safeArray(value);
    if (array.length) return array;
  }
  return [];
}

function travellerName(traveller: TravellerForm) {
  return (
    traveller.fullName ||
    `${traveller.firstName} ${traveller.lastName}`.trim() ||
    "Traveller"
  );
}

function normalizeTravellers(payload: RecordValue, booking: BookingItem | null): TravellerForm[] {
  const normalized = normalizeSmartPlannerBooking({ booking, payload });
  const travellerBlock = asRecord(normalized.travellers);
  const rawTravellers = firstArray(
    travellerBlock.list,
    payload.travellers,
    asRecord(payload.travellers).list,
    asRecord(payload.traveller).travellers,
    asRecord(payload.smartPlannerPayload).travellers
  );
  const list = rawTravellers.length
    ? rawTravellers
    : [asRecord(travellerBlock.leadTraveller || booking?.leadTraveller)];

  return list.map((item, index) => {
    const fullName = text(item.fullName, item.name);
    const parts = fullName.split(" ").filter(Boolean);
    return {
      age: text(item.age),
      email: text(item.email),
      firstName: text(item.firstName) || parts[0] || "",
      fullName: fullName || text(item.firstName, item.lastName) || "Traveller",
      gender: text(item.gender),
      id: text(item.id) || `traveller-${index + 1}`,
      lastName: text(item.lastName) || parts.slice(1).join(" "),
      mobile: text(item.mobile, item.phone),
      travellerType: text(item.travellerType, item.type) || "adult",
    };
  });
}

function normalizeContact(payload: RecordValue, booking: BookingItem | null): ContactForm {
  const normalized = normalizeSmartPlannerBooking({ booking, payload });
  const travellerBlock = asRecord(normalized.travellers);
  const contact = firstRecord(
    travellerBlock.contactDetails,
    payload.contactDetails,
    asRecord(payload.traveller).contactDetails,
    asRecord(payload.smartPlannerPayload).contactDetails,
    travellerBlock.leadTraveller,
    booking?.leadTraveller
  );

  return {
    countryCode: text(contact.countryCode) || "+91",
    email: text(contact.email),
    mobile: text(contact.mobile, contact.phone),
  };
}

function selectedServicesFromPayload(payload: RecordValue) {
  const selectedServices = asRecord(payload.selectedServices);
  const smartPayload = asRecord(payload.smartPlannerPayload);
  const smartServices = asRecord(smartPayload.selectedServices);

  return {
    activities: firstArray(selectedServices.selectedActivities, smartServices.selectedActivities, payload.selectedActivities),
    cabs: firstArray(selectedServices.selectedCabs, smartServices.selectedCabs, payload.selectedCabs),
    creator: firstArray(selectedServices.selectedCreatorSpots, smartServices.selectedCreatorSpots, payload.selectedCreatorSpots),
    hotels: firstArray(selectedServices.selectedHotels, smartServices.selectedHotels, payload.selectedHotels),
    homestays: firstArray(selectedServices.selectedHomestays, smartServices.selectedHomestays, payload.selectedHomestays),
    localLife: firstArray(selectedServices.selectedLocalLifeItems, smartServices.selectedLocalLifeItems, payload.selectedLocalLifeItems),
    localMarket: firstArray(selectedServices.selectedLocalMarketItems, smartServices.selectedLocalMarketItems, payload.selectedLocalMarketItems),
    meals: firstArray(selectedServices.selectedMeals, smartServices.selectedMeals, payload.selectedMeals),
    transfers: firstArray(selectedServices.selectedTransfers, smartServices.selectedTransfers, payload.selectedTransfers),
  };
}

function dispatchBookingUpdate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(BOOKING_UPDATED_EVENT));
}

function savePlannerManagePayload(booking: BookingItem | null, payload: RecordValue) {
  if (typeof window === "undefined" || !booking?.payloadStorageKey) return false;

  if (isChunkedBookingDetailKey(booking.payloadStorageKey)) {
    const result = saveChunkedBookingDetail(booking.id, payload, { service: "smart-planner" });
    if (!result.ok) return false;
    dispatchBookingUpdate();
    return true;
  }

  try {
    localStorage.setItem(booking.payloadStorageKey, JSON.stringify(payload));
    dispatchBookingUpdate();
    return true;
  } catch {
    return false;
  }
}

function buildManagedPayload(params: {
  booking: BookingItem;
  contact: ContactForm;
  existingPayload: RecordValue;
  notes?: string;
  section: string;
  travellers?: TravellerForm[];
}) {
  const now = new Date().toISOString();
  const smartPayload = asRecord(params.existingPayload.smartPlannerPayload);
  const travellerList = params.travellers?.map((traveller) => ({
    ...traveller,
    fullName: travellerName(traveller),
    name: travellerName(traveller),
  }));
  const lead = travellerList?.[0];
  const contactDetails = {
    countryCode: params.contact.countryCode || "+91",
    email: params.contact.email,
    mobile: params.contact.mobile,
  };
  const existingTraveller = asRecord(params.existingPayload.traveller);

  return {
    ...params.existingPayload,
    bookingMeta: {
      ...asRecord(params.existingPayload.bookingMeta),
      bookingId: params.booking.id,
      serviceType: "smart-planner",
      smartPlannerBookingId: params.booking.id,
      updatedAt: now,
    },
    leadTraveller: lead
      ? {
          ...asRecord(params.existingPayload.leadTraveller),
          ...lead,
          email: contactDetails.email || lead.email,
          mobile: contactDetails.mobile || lead.mobile,
        }
      : params.existingPayload.leadTraveller,
    manageDraft: {
      ...asRecord(params.existingPayload.manageDraft),
      changeSummary: {
        section: params.section,
        status: "draft-saved",
        updatedAt: now,
      },
      originalSmartPlannerBookingPayload: params.existingPayload,
      settlement: {
        differenceAmount: 0,
        earnedCreditGeneration: 0,
        refundWalletAllowed: true,
        samePrice: true,
        status: "same-price",
      },
      updatedPayload: {
        contactDetails,
        notes: params.notes,
        travellers: travellerList,
      },
    },
    notes: params.notes ?? params.existingPayload.notes,
    rawPayloads: params.existingPayload.rawPayloads,
    selectedBasketItems: params.existingPayload.selectedBasketItems,
    smartPlannerPayload: {
      ...smartPayload,
      contactDetails,
      notes: params.notes ?? smartPayload.notes,
      travellers: travellerList || smartPayload.travellers,
    },
    traveller: {
      ...existingTraveller,
      contactDetails,
      travellers: travellerList || safeArray(existingTraveller.travellers),
    },
    travellers: travellerList || params.existingPayload.travellers,
    updatedAt: now,
  };
}

function InfoPill({ label, subValue, value }: { label: string; subValue?: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-black/5 bg-[#f8f9fb] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-[#111827]">{value || "-"}</p>
      {subValue ? <p className="mt-0.5 truncate text-xs text-[#6b7280]">{subValue}</p> : null}
    </div>
  );
}

function SectionTitle({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff6b00]">
        Smart Planner Manage
      </p>
      <h2 className="mt-1 text-xl font-bold text-[#111827]">{title}</h2>
      <p className="mt-1 text-sm text-[#6b7280]">{subtitle}</p>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-[#111827]">{value || "-"}</p>
    </div>
  );
}

function TextInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-[#111827] outline-none focus:border-[#ff6b00]"
      />
    </label>
  );
}

function PrimaryButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-12 w-full rounded-full bg-[#ff6b00] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 md:w-auto"
    >
      {label}
    </button>
  );
}

function ServiceList({
  empty,
  items,
}: {
  empty: string;
  items: Array<RecordValue | NormalizedSmartPlannerItem>;
}) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-black/5 bg-[#f8f9fb] p-4 text-sm font-semibold text-[#6b7280]">
        {empty}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {items.map((item, index) => (
        <div
          key={`${itemTitle(item)}-${index}`}
          className="rounded-2xl border border-black/5 bg-[#f8f9fb] p-4"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#111827]">{itemTitle(item)}</p>
              {itemMeta(item) ? (
                <p className="mt-1 break-words text-sm text-[#6b7280]">{itemMeta(item)}</p>
              ) : null}
            </div>
            <p className="shrink-0 text-sm font-black text-[#111827]">
              {formatPrice(itemAmount(item))}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function InsightGrid({ rows }: { rows: Array<{ label: string; value: unknown }> }) {
  const visible = rows
    .map((row) => ({ ...row, value: displayValue(row.value) }))
    .filter((row) => row.value);

  if (!visible.length) {
    return (
      <div className="rounded-2xl border border-black/5 bg-[#f8f9fb] p-4 text-sm font-semibold text-[#6b7280]">
        Planner intelligence data is not available for this booking.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {visible.map((row) => (
        <InfoCard key={row.label} label={row.label} value={row.value} />
      ))}
    </div>
  );
}

export default function SmartPlannerManageBookingPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = String(params?.bookingId || "");
  const [activeTab, setActiveTab] = useState<PlannerManageTab>("summary");
  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [payload, setPayload] = useState<RecordValue | null>(null);
  const [debugInfo, setDebugInfo] = useState<SmartPlannerBookingResolveResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [travellers, setTravellers] = useState<TravellerForm[]>([]);
  const [contact, setContact] = useState<ContactForm>({
    countryCode: "+91",
    email: "",
    mobile: "",
  });
  const [notes, setNotes] = useState("");

  const loadBooking = useCallback(() => {
    if (!bookingId) {
      setIsLoading(false);
      return;
    }

    const resolved = resolveSmartPlannerBooking(bookingId);
    const fullPayload = fullPayloadFrom(resolved.payload);
    setBooking(resolved.booking);
    setPayload(resolved.booking ? fullPayload : null);
    setDebugInfo(resolved);
    setTravellers(normalizeTravellers(fullPayload, resolved.booking));
    setContact(normalizeContact(fullPayload, resolved.booking));
    setNotes(text(fullPayload.notes, asRecord(fullPayload.smartPlannerPayload).notes));
    setIsLoading(false);
  }, [bookingId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadBooking, 0);
    window.addEventListener(BOOKING_UPDATED_EVENT, loadBooking);
    window.addEventListener("storage", loadBooking);
    window.addEventListener("focus", loadBooking);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener(BOOKING_UPDATED_EVENT, loadBooking);
      window.removeEventListener("storage", loadBooking);
      window.removeEventListener("focus", loadBooking);
    };
  }, [loadBooking]);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" || !payload) return;
    if (payload.serviceType !== "smart-planner" && !payload.smartPlannerBookingId) return;
    if (!Array.isArray(payload.selectedBasketItems)) return;
    console.info(
      "[SmartPlanner] manage payload completeness",
      getSmartPlannerPayloadCompleteness(payload as any)
    );
  }, [payload]);

  const normalized = useMemo(
    () => normalizeSmartPlannerBooking({ booking, payload: payload || {} }),
    [booking, payload]
  );
  const selectedServices = useMemo(
    () => selectedServicesFromPayload(asRecord(payload)),
    [payload]
  );
  const fareSummary = asRecord(payload?.fareSummary || payload?.pricing);
  const paymentSummary = asRecord(payload?.paymentSummary);
  const walletSummary = asRecord(payload?.walletSummary);
  const smartPayload = asRecord(payload?.smartPlannerPayload);
  const routeData = firstRecord(
    payload?.routeData,
    smartPayload.routeData,
    payload?.selectedRoute,
    smartPayload.selectedRoute,
    payload?.route,
    smartPayload.route
  );
  const readinessStatus = firstRecord(payload?.readinessStatus, smartPayload.readinessStatus);
  const plannerAudit = firstRecord(payload?.plannerAudit, smartPayload.plannerAudit);
  const plannerIntelligence = firstRecord(payload?.plannerIntelligence, smartPayload.plannerIntelligence);
  const selectedBasketItems = firstArray(
    normalized.selectedBasketItems,
    payload?.selectedBasketItems,
    smartPayload.selectedBasketItems
  );
  const dayPlans = firstArray(normalized.itineraryDays, payload?.dayPlans, smartPayload.dayPlans);
  const totalAmount = numberValue(
    normalized.totalAmount,
    fareSummary.finalPayable,
    fareSummary.finalPayableAmount,
    paymentSummary.amountPaid,
    paymentSummary.finalPayable,
    booking?.amount
  );
  const tripTitle = normalized.tripTitle || booking?.title || "Smart Planner Trip";
  const routeLabel = normalized.routeLabel || text(routeData.routeLabel) || "Smart Planner Route";
  const travelDate = normalized.travelDate || booking?.travelDate || "";
  const travellerLabel = booking?.travellers || normalized.travellers.label || `${travellers.length || 1} Traveller`;

  const saveManagedPayload = (params: { notes?: string; section: string; travellers?: TravellerForm[] }) => {
    if (!booking || !payload) return false;
    const nextPayload = buildManagedPayload({
      booking,
      contact,
      existingPayload: payload,
      notes: params.notes,
      section: params.section,
      travellers: params.travellers,
    });
    const saved = savePlannerManagePayload(booking, nextPayload);
    if (saved) {
      setPayload(nextPayload);
      return true;
    }
    return false;
  };

  const handleSaveTravellers = () => {
    const saved = saveManagedPayload({ section: "traveller-details", travellers });
    alert(saved ? "Traveller details updated successfully." : "Unable to save traveller details.");
  };

  const handleSaveContact = () => {
    const saved = saveManagedPayload({ section: "contact-details" });
    alert(saved ? "Contact details updated successfully." : "Unable to save contact details.");
  };

  const handleSaveNotes = () => {
    const saved = saveManagedPayload({ notes, section: "notes" });
    alert(saved ? "Trip notes updated successfully." : "Unable to save trip notes.");
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] px-4 py-10">
        <div className="mx-auto max-w-[1440px] rounded-[28px] border border-black/5 bg-white p-8 text-sm text-[#6b7280]">
          Loading Smart Planner manage booking...
        </div>
      </main>
    );
  }

  if (!booking || !payload) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] px-4 py-10">
        <div className="mx-auto max-w-[1440px] rounded-[28px] border border-black/5 bg-white p-8">
          <h1 className="text-xl font-bold text-[#111827]">
            Smart Planner booking not found
          </h1>
          {process.env.NODE_ENV === "development" && debugInfo ? (
            <div className="mt-4 rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-700">
              <div>Requested: {debugInfo.requestedBookingId}</div>
              <div>Checked: {debugInfo.checkedStorageKeys.join(", ")}</div>
              <div>Available: {debugInfo.availableBookingIds.join(", ") || "none"}</div>
            </div>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f8f9fb]">
      <div className="mx-auto w-full max-w-[1440px] px-3 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6">
        <div className="mb-4 rounded-[20px] border border-black/5 bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:mb-5 md:rounded-[28px] md:p-5 lg:p-6">
          <button
            type="button"
            onClick={() => router.push("/account/bookings")}
            className="hidden min-h-10 items-center gap-2 rounded-full border border-[#d9e2ec] bg-white px-4 py-2 text-[12px] font-extrabold text-[#111827] shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition hover:border-[#bfd3ea] hover:bg-[#f8fbff] md:inline-flex md:px-5 md:text-[13px]"
          >
            <span style={{ fontSize: "14px", lineHeight: 1 }}>←</span>
            <span>Back to My Bookings</span>
          </button>

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff6b00]">
                Manage Trip Plan
              </p>
              <h1 className="mt-1 text-[20px] font-bold leading-7 text-[#111827] md:text-2xl">
                Manage Your Smart Planner Booking
              </h1>
              <p className="mt-1 text-[13px] leading-5 text-[#6b7280] md:text-sm">
                Update traveller details, contact details, trip notes and review selected Smart Planner services.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 lg:w-auto lg:gap-3">
              <InfoPill label="Booking ID" value={booking.id} />
              <InfoPill label="Smart Planner" value={tripTitle} />
              <InfoPill label="Travel Date" value={formatDate(travelDate)} subValue={routeLabel} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-4 lg:self-start">
            <div className="overflow-hidden rounded-[20px] border border-black/5 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:rounded-[28px]">
              <div className="border-b border-black/5 px-4 py-3 md:px-5 md:py-4">
                <h2 className="text-base font-bold text-[#111827]">Manage Actions</h2>
                <p className="mt-1 text-sm text-[#6b7280]">Select what you want to manage.</p>
              </div>

              <div className="p-3 lg:hidden">
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-[#ff6b00]">
                  Manage Action
                </label>
                <select
                  value={activeTab}
                  onChange={(event) => setActiveTab(event.target.value as PlannerManageTab)}
                  className="h-12 w-full rounded-2xl border border-[#ff6b00]/20 bg-[#fff7f2] px-4 text-sm font-bold text-[#111827] outline-none shadow-[0_8px_24px_rgba(255,107,0,0.08)]"
                  aria-label="Select Smart Planner manage action"
                >
                  {tabs.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <nav className="hidden p-3 lg:block lg:overflow-visible">
                <div className="space-y-2">
                  {tabs.map((item) => {
                    const isActive = activeTab === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setActiveTab(item.key)}
                        className={`flex min-w-[172px] items-center justify-between rounded-2xl border px-3 py-3 text-left transition-all duration-200 lg:w-full lg:min-w-0 lg:px-4 ${
                          isActive
                            ? "border-[#ff6b00]/20 bg-[#fff7f2] shadow-[0_8px_24px_rgba(255,107,0,0.08)]"
                            : "border-transparent bg-[#f8f9fb] hover:border-black/5 hover:bg-[#f3f4f6]"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className={`truncate text-sm font-semibold ${isActive ? "text-[#ff6b00]" : "text-[#111827]"}`}>
                            {item.label}
                          </p>
                          <p className="mt-0.5 hidden text-xs text-[#6b7280] lg:block">{item.desc}</p>
                        </div>
                        <span className={`ml-3 h-2.5 w-2.5 shrink-0 rounded-full ${isActive ? "bg-[#ff6b00]" : "bg-[#d1d5db]"}`} />
                      </button>
                    );
                  })}
                </div>
              </nav>

              <div className="hidden border-t border-black/5 bg-[#fcfcfd] px-5 py-4 lg:block">
                <div className="rounded-2xl bg-[#f8f9fb] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                    Important
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#4b5563]">
                    Same-price Smart Planner updates are saved directly. Payment settlement for paid trip-plan updates is prepared for the next phase.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="rounded-[20px] border border-black/5 bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:rounded-[28px] md:p-5 lg:p-6">
              {activeTab === "summary" ? (
                <div className="space-y-5">
                  <SectionTitle title="Smart Planner Booking Summary" subtitle="Current confirmed Smart Planner booking snapshot." />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <InfoCard label="Booking Status" value={booking.status} />
                    <InfoCard label="Payment Status" value={text(paymentSummary.paymentStatus, normalized.paymentStatus) || "Paid"} />
                    <InfoCard label="Booked On" value={formatDateTime(booking.bookingDate)} />
                    <InfoCard label="Travel Date" value={formatDate(travelDate)} />
                    <InfoCard label="Trip Plan" value={tripTitle} />
                    <InfoCard label="Route" value={routeLabel} />
                    <InfoCard label="Travellers" value={travellerLabel} />
                    <InfoCard label="Trip Value" value={formatPrice(totalAmount)} />
                  </div>

                  <div className="rounded-[24px] border border-black/5 bg-[#f8f9fb] p-5">
                    <h3 className="text-base font-bold text-[#111827]">Route Plan Snapshot</h3>
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                      <InfoCard label="Selected Route" value={text(routeData.title, routeData.name, routeData.routeLabel, routeLabel)} />
                      <InfoCard label="Duration" value={normalized.durationLabel || `${dayPlans.length} Days`} />
                      <InfoCard label="Day Plans" value={`${dayPlans.length}`} />
                      <InfoCard label="Selected Services" value={`${selectedBasketItems.length}`} />
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-black/5 bg-[#f8f9fb] p-5">
                    <h3 className="text-base font-bold text-[#111827]">Pricing / Update Summary</h3>
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                      <InfoCard label="Selected Basket Value" value={formatPrice(normalized.priceSummary.selectedBasketValue || fareSummary.selectedBasketValue)} />
                      <InfoCard label="Offer Discount" value={formatPrice(normalized.priceSummary.offerDiscount || fareSummary.offerDiscount)} />
                      <InfoCard label="Taxes / Fees" value={formatPrice(normalized.priceSummary.taxesAndFees || fareSummary.taxesAndFees)} />
                      <InfoCard label="Current Total" value={formatPrice(totalAmount)} />
                      <InfoCard label="Update Difference" value={formatPrice(0)} />
                      <InfoCard label="Settlement Status" value="Same price update" />
                      <InfoCard label="Refund Wallet" value={formatPrice(walletSummary.refundWalletUsed)} />
                      <InfoCard label="Earned Credit on Update" value={formatPrice(0)} />
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === "travellers" ? (
                <div className="space-y-5">
                  <SectionTitle title="Traveller Details" subtitle="Update traveller information without changing the original Smart Planner payload." />
                  <div className="grid gap-4">
                    {travellers.map((traveller, index) => (
                      <div key={traveller.id} className="rounded-[24px] border border-black/5 bg-[#f8f9fb] p-5">
                        <p className="mb-4 text-sm font-bold text-[#111827]">Traveller {index + 1}</p>
                        <div className="grid gap-4 md:grid-cols-2">
                          <TextInput label="Full Name" value={traveller.fullName} onChange={(value) => setTravellers((prev) => prev.map((item, i) => i === index ? { ...item, fullName: value } : item))} />
                          <TextInput label="Mobile" value={traveller.mobile} onChange={(value) => setTravellers((prev) => prev.map((item, i) => i === index ? { ...item, mobile: value } : item))} />
                          <TextInput label="Email" value={traveller.email} onChange={(value) => setTravellers((prev) => prev.map((item, i) => i === index ? { ...item, email: value } : item))} />
                          <TextInput label="Gender" value={traveller.gender} onChange={(value) => setTravellers((prev) => prev.map((item, i) => i === index ? { ...item, gender: value } : item))} />
                          <TextInput label="Age" value={traveller.age} onChange={(value) => setTravellers((prev) => prev.map((item, i) => i === index ? { ...item, age: value } : item))} />
                          <TextInput label="Traveller Type" value={traveller.travellerType} onChange={(value) => setTravellers((prev) => prev.map((item, i) => i === index ? { ...item, travellerType: value } : item))} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <PrimaryButton label="Save Traveller Details" onClick={handleSaveTravellers} />
                </div>
              ) : null}

              {activeTab === "contact" ? (
                <div className="space-y-5">
                  <SectionTitle title="Contact Details" subtitle="Update contact information for Smart Planner booking communication." />
                  <div className="grid gap-4 md:grid-cols-3">
                    <TextInput label="Country Code" value={contact.countryCode} onChange={(value) => setContact((prev) => ({ ...prev, countryCode: value }))} />
                    <TextInput label="Mobile" value={contact.mobile} onChange={(value) => setContact((prev) => ({ ...prev, mobile: value }))} />
                    <TextInput label="Email" value={contact.email} onChange={(value) => setContact((prev) => ({ ...prev, email: value }))} />
                  </div>
                  <PrimaryButton label="Save Contact Details" onClick={handleSaveContact} />
                </div>
              ) : null}

              {activeTab === "services" ? (
                <div className="space-y-5">
                  <SectionTitle title="Selected Services" subtitle="Read-only Smart Planner basket and selected service reference." />
                  <div className="grid gap-5">
                    <ServiceList items={selectedBasketItems} empty="No selected basket items found." />
                    <div className="grid gap-5 lg:grid-cols-2">
                      <ServiceList items={[...selectedServices.transfers, ...selectedServices.cabs]} empty="No transport selections found." />
                      <ServiceList items={[...selectedServices.hotels, ...selectedServices.homestays]} empty="No stay selections found." />
                      <ServiceList items={selectedServices.activities} empty="No activity selections found." />
                      <ServiceList items={selectedServices.meals} empty="No meal selections found." />
                      <ServiceList items={selectedServices.localMarket} empty="No local market selections found." />
                      <ServiceList items={selectedServices.creator} empty="No creator selections found." />
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === "notes" ? (
                <div className="space-y-5">
                  <SectionTitle title="Trip Notes" subtitle="Save Smart Planner notes while preserving the complete booking payload." />
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
                      Notes / Special Requirement
                    </span>
                    <textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      className="mt-2 min-h-[160px] w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-[#111827] outline-none focus:border-[#ff6b00]"
                    />
                  </label>
                  <PrimaryButton label="Save Trip Notes" onClick={handleSaveNotes} />
                </div>
              ) : null}

              {activeTab === "intelligence" ? (
                <div className="space-y-5">
                  <SectionTitle title="Planner Intelligence" subtitle="Read-only readiness, audit and route intelligence from Smart Planner." />
                  <InsightGrid
                    rows={[
                      { label: "Readiness Status", value: text(readinessStatus.status, readinessStatus.label, readinessStatus.overallStatus) },
                      { label: "Planner Audit", value: text(plannerAudit.status, plannerAudit.summary, plannerAudit.auditStatus) },
                      { label: "Route Alerts", value: plannerAudit.routeAlerts || plannerIntelligence.routeAlerts },
                      { label: "Recommendations", value: plannerIntelligence.recommendations || plannerIntelligence.notes },
                      { label: "Raw Payload", value: debugInfo?.rawPayloadAvailable ? "Full Smart Planner payload loaded" : "" },
                      { label: "Selected Route Variants", value: payload.routeVariants },
                    ]}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
