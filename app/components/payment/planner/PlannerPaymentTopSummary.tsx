"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Bus,
  CalendarDays,
  Car,
  CheckCircle2,
  FileText,
  Hotel,
  Mail,
  MapPin,
  Plane,
  Shield,
  Ship,
  ShoppingBag,
  Sparkles,
  Ticket,
  Train,
  UtensilsCrossed,
  Users,
} from "lucide-react";

type RecordValue = Record<string, unknown>;

type TravellerPayload = {
  travellers?: Array<{
    age?: string;
    email?: string;
    firstName?: string;
    fullName?: string;
    gender?: string;
    lastName?: string;
    mobile?: string;
    name?: string;
    notes?: string;
    roomLabel?: string;
    travellerType?: string;
  }>;
  contactDetails?: {
    countryCode?: string;
    email?: string;
    mobile?: string;
  };
  gstDetails?: {
    hasGst?: boolean;
    state?: string;
  };
};

type AddOnPayload = {
  insuranceAmount?: number;
  insuranceSelected?: boolean;
  plannerAddOns?: unknown[];
  selectedAddons?: unknown[];
  selectedInsurance?: unknown[];
};

type Props = {
  bookingSummaryData?: RecordValue | null;
  travellerData?: TravellerPayload | null;
  addOnData?: AddOnPayload | null;
};

function safeArray(value: unknown): RecordValue[] {
  return Array.isArray(value)
    ? value.filter((item): item is RecordValue => typeof item === "object" && item !== null)
    : [];
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }

  return "";
}

function formatDate(value?: unknown) {
  if (!value) return "Travel date not available";

  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return String(value);

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    weekday: "short",
    year: "numeric",
  });
}

function formatCurrency(value?: unknown) {
  const amount = Number(value || 0);
  return amount > 0 ? `₹${amount.toLocaleString("en-IN")}` : "";
}

function normalizeRoute(route?: unknown) {
  if (Array.isArray(route)) {
    return route.map(String).filter(Boolean).join(" • ") || "Route not available";
  }

  return firstText(route) || "Route not available";
}

function buildTravellerMixLabel(summary?: RecordValue | null) {
  const adults = Number(summary?.totalAdults || 0);
  const children = Number(summary?.totalChildren || 0);
  const rooms = Number(summary?.totalRooms || 0);
  const parts: string[] = [];

  if (adults > 0) parts.push(`${adults} Adult${adults > 1 ? "s" : ""}`);
  if (children > 0) parts.push(`${children} Child${children > 1 ? "ren" : ""}`);
  if (rooms > 0) parts.push(`${rooms} Room${rooms > 1 ? "s" : ""}`);

  return parts.length ? parts.join(" • ") : "Traveller details unavailable";
}

function buildRoomMixLabel(summary?: RecordValue | null) {
  const rooms = safeArray(summary?.rooms);
  if (!rooms.length) return "Room details unavailable";

  return rooms
    .map((room, index) => {
      const adults = Number(room.adults || 0);
      const children = Number(room.children || 0);
      return `R${index + 1}: ${adults}A${children ? `/${children}C` : ""}`;
    })
    .join(" • ");
}

function resolveServiceGroup(item: RecordValue) {
  const strong = [
    item.serviceType,
    item.serviceName,
    item.serviceLabel,
    item.type,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const fallback = [item.category, item.title].filter(Boolean).join(" ").toLowerCase();
  const raw = `${strong} ${fallback}`;

  const test = (pattern: RegExp) => pattern.test(strong) || pattern.test(raw);

  if (/\btrain\b|\brail\b/.test(strong)) return "Train";
  if (/\bbus\b|\bcoach\b/.test(strong)) return "Bus";
  if (/\bflight\b|\bair\b|\bairline\b/.test(strong)) return "Flight";
  if (/\bcruise\b|\bship\b/.test(strong)) return "Cruise";
  if (/\bprivate\s*ev\b|\belectric\b|\bev\b/.test(strong)) return "Private EV";
  if (/\bprivate\s*car\b|\bself\s*drive\b/.test(strong)) return "Private Car";
  if (/\bcab\b|\btaxi\b|\btransfer\b/.test(strong)) return "Cab / Transfer";
  if (test(/\bhomestay\b/)) return "Homestay";
  if (test(/\bhotel\b|\bstay\b|\bresort\b|\bvilla\b|\bcamp\b/)) return "Hotel";
  if (test(/\bmeal\b|\bfood\b|\bdinner\b|\bbreakfast\b|\blunch\b|\bdining\b|\bcafe\b/)) {
    return "Meal";
  }
  if (test(/\bactivity\b|\bexperience\b|\btour\b|\bsightseeing\b/)) return "Activity";
  if (test(/\blocal[-\s]*life\b/)) return "Local Life";
  if (test(/\bcreator\b/)) return "Creator";
  if (test(/\blocal[-\s]*market\b|\bshopping\b|\bsouvenir\b/)) return "Local Market";
  if (test(/\binsurance\b/)) return "Insurance";
  if (test(/\bvisa\b/)) return "Visa";

  return "Other";
}

function serviceIcon(label: string) {
  const className = "h-4 w-4";
  if (label === "Train") return <Train className={`${className} text-violet-600`} />;
  if (label === "Bus") return <Bus className={`${className} text-cyan-600`} />;
  if (label === "Flight") return <Plane className={`${className} text-blue-600`} />;
  if (label === "Cruise") return <Ship className={`${className} text-sky-600`} />;
  if (label === "Hotel" || label === "Homestay") {
    return <Hotel className={`${className} text-indigo-600`} />;
  }
  if (label.includes("Transfer") || label.includes("Car") || label.includes("EV")) {
    return <Car className={`${className} text-cyan-600`} />;
  }
  if (label === "Meal") return <UtensilsCrossed className={`${className} text-amber-600`} />;
  if (label === "Activity") return <Ticket className={`${className} text-emerald-600`} />;
  if (label === "Local Market") return <ShoppingBag className={`${className} text-orange-600`} />;
  if (label === "Local Life" || label === "Creator") {
    return <Sparkles className={`${className} text-purple-600`} />;
  }
  if (label === "Insurance" || label === "Visa") {
    return <Shield className={`${className} text-emerald-600`} />;
  }

  return <FileText className={`${className} text-slate-600`} />;
}

function itemValue(item: RecordValue) {
  return (
    formatCurrency(
      item.total ||
        item.totalPrice ||
        item.estimatedTotal ||
        item.estimatedPrice ||
        item.price ||
        item.value ||
        item.amount ||
        item.cost
    ) || "Value pending"
  );
}

export default function PlannerPaymentTopSummary({
  bookingSummaryData,
  travellerData,
  addOnData,
}: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const basketItems = useMemo(
    () => safeArray(bookingSummaryData?.selectedBasketItems),
    [bookingSummaryData]
  );
  const title = firstText(bookingSummaryData?.packageTitle) || "Smart Planner Trip";
  const routeLabel = useMemo(
    () => normalizeRoute(bookingSummaryData?.route),
    [bookingSummaryData]
  );
  const travellerMixLabel = useMemo(
    () => buildTravellerMixLabel(bookingSummaryData),
    [bookingSummaryData]
  );
  const roomMixLabel = useMemo(
    () => buildRoomMixLabel(bookingSummaryData),
    [bookingSummaryData]
  );
  const leadTravellerName = useMemo(() => {
    const first = travellerData?.travellers?.[0];
    const direct = firstText(first?.fullName, first?.name);
    const joined = `${first?.firstName || ""} ${first?.lastName || ""}`.trim();
    return direct || joined || "Lead Traveller";
  }, [travellerData]);
  const leadTraveller = travellerData?.travellers?.[0];
  const leadMobile =
    firstText(travellerData?.contactDetails?.mobile) ||
    firstText(leadTraveller?.mobile);
  const leadEmail =
    firstText(travellerData?.contactDetails?.email) ||
    firstText(leadTraveller?.email);
  const addOns = [
    ...safeArray(addOnData?.plannerAddOns),
    ...safeArray(addOnData?.selectedAddons),
    ...safeArray(addOnData?.selectedInsurance),
  ];

  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-200 bg-gradient-to-r from-[#eef6ff] via-white to-[#fff5ea] px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[12px] font-extrabold text-emerald-700">
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                Review Before Payment
              </span>

              <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[12px] font-bold text-sky-700">
                Smart Planner Trip
              </span>
            </div>

            <div className="mt-3 break-words text-[22px] font-black leading-tight text-slate-900 sm:text-[24px]">
              {title}
            </div>

            <div className="mt-2 flex min-w-0 items-center gap-2 text-[14px] text-slate-600">
              <MapPin className="h-4 w-4 shrink-0 text-orange-500" />
              <span className="truncate">{routeLabel}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[420px]">
            <MiniStatCard
              icon={<CalendarDays className="h-4 w-4 text-orange-500" />}
              label="Travel Date"
              value={formatDate(bookingSummaryData?.travelDate)}
            />
            <MiniStatCard
              icon={<MapPin className="h-4 w-4 text-orange-500" />}
              label="Origin"
              value={firstText(bookingSummaryData?.originCity) || "Origin pending"}
            />
            <MiniStatCard
              icon={<Users className="h-4 w-4 text-orange-500" />}
              label="Travellers"
              value={travellerMixLabel}
            />
            <MiniStatCard
              icon={<FileText className="h-4 w-4 text-orange-500" />}
              label="Duration"
              value={firstText(bookingSummaryData?.durationLabel) || "Duration not available"}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <InfoStrip
            title="Lead Traveller"
            value={leadTravellerName}
            subValue={
              leadMobile
                ? `${travellerData?.contactDetails?.countryCode || "+91"} ${leadMobile}`
                : "Mobile number pending"
            }
            icon={<Users className="h-4 w-4 text-sky-600" />}
          />

          <InfoStrip
            title="Contact Email"
            value={leadEmail || "Email pending"}
            subValue={
              travellerData?.gstDetails?.hasGst
                ? `GST Enabled • ${travellerData.gstDetails.state || "State pending"}`
                : "No GST added"
            }
            icon={<Mail className="h-4 w-4 text-indigo-600" />}
          />

          <InfoStrip
            title="Planner Add-ons"
            value={
              addOns.length > 0
                ? `${addOns.length} planner add-on${addOns.length > 1 ? "s" : ""}`
                : "No planner add-ons selected"
            }
            subValue={
              addOnData?.insuranceSelected
                ? `Insurance added • ${formatCurrency(addOnData.insuranceAmount)}`
                : "Insurance only if selected in planner basket"
            }
            icon={<Shield className="h-4 w-4 text-emerald-600" />}
          />
        </div>
      </div>

      <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
        {basketItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {basketItems.map((item, index) => {
              const label = resolveServiceGroup(item);
              const titleText =
                firstText(item.title, item.name, item.label, item.serviceName) ||
                `${label} selection`;
              const meta = [
                firstText(item.dayLabel) || (item.day ? `Day ${item.day}` : ""),
                firstText(item.date),
                firstText(item.time),
              ].filter(Boolean);

              return (
                <div
                  key={`${label}-${titleText}-${index}`}
                  className="min-w-0 rounded-2xl border border-slate-200 bg-[#fcfdff] px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    {serviceIcon(label)}
                    <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-500">
                      {label}
                    </span>
                  </div>

                  <div className="mt-2 break-words text-[14px] font-bold leading-5 text-slate-900">
                    {titleText}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] font-bold text-slate-500">
                    {meta.length ? <span>{meta.join(" • ")}</span> : null}
                    <span className="rounded-full bg-orange-50 px-2 py-0.5 text-orange-700">
                      {itemValue(item)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-[14px] font-bold text-slate-600">
            No Smart Planner basket items found for payment.
          </div>
        )}
      </div>

      <div className="bg-white px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <BadgeText label="Room Mix" value={roomMixLabel} />
            <BadgeText
              label="Trip Type"
              value={firstText(bookingSummaryData?.bookingMode) || "Smart Planner"}
            />
            <BadgeText label="Basket Items" value={`${basketItems.length} selected`} />
          </div>

          <button
            className="rounded-full border border-slate-200 px-4 py-2 text-[13px] font-extrabold text-slate-700 hover:bg-slate-50"
            onClick={() => setShowDetails((current) => !current)}
            type="button"
          >
            {showDetails ? "Hide Details" : "View Details"}
          </button>
        </div>

        {showDetails ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[13px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
              Booking Summary Data
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <DetailLine label="Trip" value={title} />
              <DetailLine label="Route" value={routeLabel} />
              <DetailLine label="Travel Date" value={formatDate(bookingSummaryData?.travelDate)} />
              <DetailLine label="Travellers" value={travellerMixLabel} />
              <DetailLine
                label="Traveller Data"
                value={`${leadTravellerName} • ${leadMobile || "Mobile pending"} • ${
                  leadEmail || "Email pending"
                }`}
              />
              <DetailLine
                label="Add-on Data"
                value={
                  addOns.length > 0
                    ? `${addOns.length} planner add-on${addOns.length > 1 ? "s" : ""}`
                    : "No planner add-ons selected"
                }
              />
            </div>
            {travellerData?.travellers?.length ? (
              <div className="mt-4">
                <div className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                  Traveller List
                </div>
                <div className="mt-2 grid grid-cols-1 gap-3">
                  {travellerData.travellers.map((traveller, index) => {
                    const name =
                      firstText(traveller.fullName, traveller.name) ||
                      `${traveller.firstName || ""} ${traveller.lastName || ""}`.trim() ||
                      `Traveller ${index + 1}`;
                    const meta = [
                      firstText(traveller.travellerType) || "Traveller",
                      firstText(traveller.gender),
                      traveller.age ? `Age ${traveller.age}` : "",
                      firstText(traveller.roomLabel),
                    ].filter(Boolean);
                    const contact = [
                      firstText(traveller.mobile) || (index === 0 ? leadMobile : ""),
                      firstText(traveller.email) || (index === 0 ? leadEmail : ""),
                    ].filter(Boolean);

                    return (
                      <div
                        key={`${name}-${index}`}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                      >
                        <div className="text-[13px] font-black text-slate-900">
                          {name}
                        </div>
                        <div className="mt-1 text-[12px] font-semibold text-slate-500">
                          {meta.length ? meta.join(" • ") : "Traveller details"}
                        </div>
                        {contact.length ? (
                          <div className="mt-1 text-[12px] font-semibold text-slate-600">
                            {contact.join(" • ")}
                          </div>
                        ) : null}
                        {traveller.notes ? (
                          <div className="mt-1 text-[12px] font-semibold text-slate-500">
                            {traveller.notes}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
            {!leadMobile || !leadEmail ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-bold text-amber-800">
                Traveller contact data is incomplete. Payment can continue, but booking
                support may require mobile and email confirmation.
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function MiniStatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white px-3 py-3">
      <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-1 truncate text-[13px] font-black text-slate-900">{value}</div>
    </div>
  );
}

function InfoStrip({
  icon,
  subValue,
  title,
  value,
}: {
  icon: ReactNode;
  subValue: string;
  title: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-slate-500">
        {icon}
        {title}
      </div>
      <div className="mt-1 truncate text-[14px] font-black text-slate-900">{value}</div>
      <div className="mt-0.5 truncate text-[12px] font-semibold text-slate-500">
        {subValue}
      </div>
    </div>
  );
}

function BadgeText({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] font-bold text-slate-700">
      <span className="text-slate-500">{label}:</span>
      <span className="text-slate-900">{value}</span>
    </span>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
      <div className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 break-words text-[13px] font-bold text-slate-900">{value}</div>
    </div>
  );
}
