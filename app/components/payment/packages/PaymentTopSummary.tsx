"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CalendarDays,
  MapPin,
  Users,
  Plane,
  Hotel,
  Car,
  UtensilsCrossed,
  Ticket,
  Shield,
  Mail,
  FileText,
  CheckCircle2,
} from "lucide-react";

type Room = {
  adults: number;
  children: number;
};

type TravellerItem = {
  id?: string;
  travellerType?: "adult" | "child";
  label?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  roomLabel?: string;
};

type TravellerPayload = {
  travellers?: TravellerItem[];
  contactDetails?: {
    countryCode?: string;
    mobile?: string;
    email?: string;
  };
  gstDetails?: {
    hasGst?: boolean;
    state?: string;
    saveBillingToProfile?: boolean;
  };
};

type AddOnPayload = {
  isInternationalTrip?: boolean;
  insuranceSelected?: boolean;
  insuranceAmount?: number;
  selectedAddons?: Array<{
    id?: string;
    title?: string;
    description?: string;
    price?: number;
  }>;
};

type SelectionStateLike = {
  selectedFlights?: Array<{
    airline?: string;
    from?: string;
    to?: string;
    departureTime?: string;
    arrivalTime?: string;
    duration?: string;
  }>;
  selectedHotels?: Array<{
    hotelName?: string;
    roomType?: string;
    city?: string;
    mealPlan?: string;
    starRating?: number;
  }>;
  selectedTransfers?: Array<{
    title?: string;
    vehicleType?: string;
    subtitle?: string;
  }>;
  selectedMeals?: Array<{
    title?: string;
    description?: string;
  }>;
  selectedActivities?: Array<{
    title?: string;
    description?: string;
    category?: string;
  }>;
};

type SummaryPayload = {
  packageSlug?: string;
  packageTitle?: string;
  route?: string[] | string;
  nights?: number;
  days?: number;
  variant?: "withFlight" | "withoutFlight";
  travelDate?: string;
  originCity?: string;
  rooms?: Room[];
  totalAdults?: number;
  totalChildren?: number;
  totalRooms?: number;
  isInternationalTrip?: boolean;
  selectedVariant?: {
    pricePerPerson?: number;
    label?: string;
  };
  packageSelectionState?: SelectionStateLike | null;
  includedFlightLabels?: string[];
  includedHotelLabels?: string[];
  includedTransferLabels?: string[];
  includedMealLabels?: string[];
  includedActivityLabels?: string[];
  features?: {
    flights?: number;
    hotels?: number;
    transfers?: number;
    activities?: number;
    meals?: number;
  };
};

type PackageDataLike = {
  title?: string;
  route?: string[] | string;
  nights?: number;
  days?: number;
};

type Props = {
  packageData?: PackageDataLike;
  bookingSummaryData?: SummaryPayload | null;
  travellerData?: TravellerPayload | null;
  addOnData?: AddOnPayload | null;
};

function formatDate(value?: string) {
  if (!value) return "Travel date not available";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value?: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function normalizeRoute(route?: string[] | string) {
  if (Array.isArray(route)) return route.join(" • ");
  return route || "Route not available";
}

function buildTravellerMixLabel(
  adults?: number,
  children?: number,
  rooms?: number
) {
  const parts: string[] = [];

  if ((adults || 0) > 0) {
    parts.push(`${adults} Adult${adults && adults > 1 ? "s" : ""}`);
  }
  if ((children || 0) > 0) {
    parts.push(`${children} Child${children && children > 1 ? "ren" : ""}`);
  }
  if ((rooms || 0) > 0) {
    parts.push(`${rooms} Room${rooms && rooms > 1 ? "s" : ""}`);
  }

  return parts.length ? parts.join(" • ") : "Traveller details unavailable";
}

function buildRoomMixLabel(rooms?: Room[]) {
  if (!Array.isArray(rooms) || rooms.length === 0) return "Room details unavailable";

  return rooms
    .map((room, index) => {
      return `R${index + 1}: ${room.adults}A${
        room.children ? `/${room.children}C` : ""
      }`;
    })
    .join(" • ");
}

function getFirstValid<T>(items?: T[]) {
  if (!Array.isArray(items)) return null;
  for (const item of items) {
    if (item) return item;
  }
  return null;
}

function getFlightLine(summary?: SummaryPayload | null) {
  const selected = getFirstValid(summary?.packageSelectionState?.selectedFlights);

  if (selected?.airline) {
    return [
      selected.airline,
      selected.departureTime,
      selected.from && selected.to ? `${selected.from} → ${selected.to}` : "",
    ]
      .filter(Boolean)
      .join(" • ");
  }

  if (summary?.includedFlightLabels?.length) {
    return summary.includedFlightLabels[0];
  }

  return summary?.variant === "withoutFlight"
    ? "Land package • Flight not included"
    : "Standard included flight";
}

function getHotelLine(summary?: SummaryPayload | null) {
  const selected = getFirstValid(summary?.packageSelectionState?.selectedHotels);

  if (selected?.hotelName) {
    return [selected.hotelName, selected.roomType, selected.city]
      .filter(Boolean)
      .join(" • ");
  }

  if (summary?.includedHotelLabels?.length) {
    return summary.includedHotelLabels[0];
  }

  return "Standard included hotel";
}

function getTransferLine(summary?: SummaryPayload | null) {
  const selected = getFirstValid(summary?.packageSelectionState?.selectedTransfers);

  if (selected?.title) {
    return [selected.title, selected.vehicleType].filter(Boolean).join(" • ");
  }

  if (summary?.includedTransferLabels?.length) {
    return summary.includedTransferLabels[0];
  }

  return "Standard included transfer";
}

function getMealLine(summary?: SummaryPayload | null) {
  const selectedMeals = Array.isArray(summary?.packageSelectionState?.selectedMeals)
    ? summary?.packageSelectionState?.selectedMeals.filter(Boolean)
    : [];

  if (selectedMeals.length === 1) return selectedMeals[0]?.title || "Selected meal";
  if (selectedMeals.length > 1) return `${selectedMeals.length} meal plans selected`;

  if (summary?.includedMealLabels?.length) {
    return summary.includedMealLabels[0];
  }

  return "Standard included meal";
}

function getActivityLine(summary?: SummaryPayload | null) {
  const selectedActivities = Array.isArray(
    summary?.packageSelectionState?.selectedActivities
  )
    ? summary?.packageSelectionState?.selectedActivities.filter(Boolean)
    : [];

  if (selectedActivities.length === 1) {
    return selectedActivities[0]?.title || "Selected activity";
  }
  if (selectedActivities.length > 1) {
    return `${selectedActivities.length} activities selected`;
  }

  if (summary?.includedActivityLabels?.length) {
    return summary.includedActivityLabels[0];
  }

  return "Standard included activity";
}

export default function PaymentTopSummary({
  packageData,
  bookingSummaryData,
  travellerData,
  addOnData,
}: Props) {
  const [showDetails, setShowDetails] = useState(false);

  const title =
    bookingSummaryData?.packageTitle || packageData?.title || "Package Booking";

  const routeLabel = useMemo(() => {
    return normalizeRoute(
      bookingSummaryData?.route || packageData?.route || "Route not available"
    );
  }, [bookingSummaryData, packageData]);

  const durationLabel = useMemo(() => {
    const nights = bookingSummaryData?.nights ?? packageData?.nights ?? 0;
    const days = bookingSummaryData?.days ?? packageData?.days ?? 0;
    return `${nights}N / ${days}D`;
  }, [bookingSummaryData, packageData]);

  const travellerMixLabel = useMemo(() => {
    return buildTravellerMixLabel(
      bookingSummaryData?.totalAdults,
      bookingSummaryData?.totalChildren,
      bookingSummaryData?.totalRooms
    );
  }, [bookingSummaryData]);

  const roomMixLabel = useMemo(() => {
    return buildRoomMixLabel(bookingSummaryData?.rooms);
  }, [bookingSummaryData]);

  const leadTravellerName = useMemo(() => {
    const first = travellerData?.travellers?.[0];
    const fullName = `${first?.firstName || ""} ${first?.lastName || ""}`.trim();
    return fullName || "Lead Traveller";
  }, [travellerData]);

  const addons = useMemo(() => {
    return Array.isArray(addOnData?.selectedAddons)
      ? addOnData?.selectedAddons.filter(Boolean)
      : [];
  }, [addOnData]);

  const serviceCards = useMemo(() => {
    return [
      {
        icon: <Plane size={16} className="text-blue-600" />,
        label: "Flight",
        value: getFlightLine(bookingSummaryData),
      },
      {
        icon: <Hotel size={16} className="text-indigo-600" />,
        label: "Hotel",
        value: getHotelLine(bookingSummaryData),
      },
      {
        icon: <Car size={16} className="text-cyan-600" />,
        label: "Transfer",
        value: getTransferLine(bookingSummaryData),
      },
      {
        icon: <UtensilsCrossed size={16} className="text-amber-600" />,
        label: "Meal",
        value: getMealLine(bookingSummaryData),
      },
      {
        icon: <Ticket size={16} className="text-emerald-600" />,
        label: "Activity",
        value: getActivityLine(bookingSummaryData),
      },
    ];
  }, [bookingSummaryData]);

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white overflow-hidden shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <div className="bg-gradient-to-r from-[#eef6ff] via-white to-[#fff5ea] border-b border-slate-200 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[12px] font-extrabold text-emerald-700">
                <CheckCircle2 size={13} className="mr-1.5" />
                Review Before Payment
              </span>

              <span className="inline-flex items-center rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-[12px] font-bold text-sky-700">
                {bookingSummaryData?.variant === "withoutFlight"
                  ? "Land Package"
                  : "With Flight"}
              </span>

              {bookingSummaryData?.packageSlug ? (
                <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-[12px] font-bold text-slate-700">
                  Code: {bookingSummaryData.packageSlug}
                </span>
              ) : null}
            </div>

            <div className="mt-3 break-words text-[22px] font-black leading-tight text-slate-900 sm:text-[24px]">
              {title}
            </div>

            <div className="mt-2 flex min-w-0 items-center gap-2 text-[14px] text-slate-600">
              <MapPin size={16} className="text-orange-500 shrink-0" />
              <span className="truncate">{routeLabel}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[420px]">
            <MiniStatCard
              icon={<CalendarDays size={15} className="text-orange-500" />}
              label="Travel Date"
              value={formatDate(bookingSummaryData?.travelDate)}
            />
            <MiniStatCard
              icon={<Plane size={15} className="text-orange-500" />}
              label="Origin"
              value={bookingSummaryData?.originCity || "Delhi"}
            />
            <MiniStatCard
              icon={<Users size={15} className="text-orange-500" />}
              label="Travellers"
              value={travellerMixLabel}
            />
            <MiniStatCard
              icon={<FileText size={15} className="text-orange-500" />}
              label="Duration"
              value={durationLabel}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <InfoStrip
            title="Lead Traveller"
            value={leadTravellerName}
            subValue={
              travellerData?.contactDetails?.mobile
                ? `${travellerData?.contactDetails?.countryCode || "+91"} ${
                    travellerData?.contactDetails?.mobile
                  }`
                : "Contact to be confirmed"
            }
            icon={<Users size={16} className="text-sky-600" />}
          />

          <InfoStrip
            title="Contact Email"
            value={travellerData?.contactDetails?.email || "Email not added"}
            subValue={
              travellerData?.gstDetails?.hasGst
                ? `GST Enabled • ${travellerData?.gstDetails?.state || "State pending"}`
                : "No GST added"
            }
            icon={<Mail size={16} className="text-indigo-600" />}
          />

          <InfoStrip
            title="Add-ons & Protection"
            value={
              addons.length > 0
                ? `${addons.length} add-on${addons.length > 1 ? "s" : ""} selected`
                : "No paid add-ons selected"
            }
            subValue={
              addOnData?.insuranceSelected
                ? `Insurance added • ${formatCurrency(addOnData?.insuranceAmount)}`
                : "Insurance not selected"
            }
            icon={<Shield size={16} className="text-emerald-600" />}
          />
        </div>
      </div>

      <div className="px-4 py-4 border-b border-slate-200 bg-white sm:px-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          {serviceCards.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-[#fcfdff] px-4 py-3"
            >
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-500">
                  {item.label}
                </span>
              </div>

              <div className="mt-2 text-[14px] font-bold leading-5 text-slate-900 break-words">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 bg-white sm:px-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <BadgeText
              label="Room Mix"
              value={roomMixLabel}
              color="slate"
            />
            <BadgeText
              label="Trip Type"
              value={
                bookingSummaryData?.isInternationalTrip
                  ? "International"
                  : "Domestic"
              }
              color={bookingSummaryData?.isInternationalTrip ? "orange" : "blue"}
            />
            <BadgeText
              label="Add-ons"
              value={
                addons.length > 0
                  ? addons.map((item) => item.title).join(", ")
                  : "None"
              }
              color="green"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 text-[13px] font-extrabold text-slate-800 transition hover:border-sky-400 hover:text-sky-700 sm:w-auto"
          >
            {showDetails ? "Hide Details" : "View Details"}
            {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {showDetails && (
          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-[#fbfdff] p-4">
              <div className="text-[15px] font-extrabold text-slate-900">
                Booking Summary Data
              </div>

              <div className="mt-4 space-y-3">
                <DetailRow label="Package" value={title} />
                <DetailRow label="Route" value={routeLabel} />
                <DetailRow label="Travel Date" value={formatDate(bookingSummaryData?.travelDate)} />
                <DetailRow label="Origin City" value={bookingSummaryData?.originCity || "Delhi"} />
                <DetailRow label="Duration" value={durationLabel} />
                <DetailRow label="Travellers" value={travellerMixLabel} />
                <DetailRow label="Room Mix" value={roomMixLabel} />
                <DetailRow
                  label="Variant"
                  value={
                    bookingSummaryData?.variant === "withoutFlight"
                      ? "Without Flight"
                      : "With Flight"
                  }
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#fbfdff] p-4">
              <div className="text-[15px] font-extrabold text-slate-900">
                Traveller Data
              </div>

              <div className="mt-4 space-y-3">
                <DetailRow label="Lead Traveller" value={leadTravellerName} />
                <DetailRow
                  label="Mobile"
                  value={
                    travellerData?.contactDetails?.mobile
                      ? `${travellerData?.contactDetails?.countryCode || "+91"} ${
                          travellerData?.contactDetails?.mobile
                        }`
                      : "Not available"
                  }
                />
                <DetailRow
                  label="Email"
                  value={travellerData?.contactDetails?.email || "Not available"}
                />
                <DetailRow
                  label="GST"
                  value={travellerData?.gstDetails?.hasGst ? "Yes" : "No"}
                />
                <DetailRow
                  label="GST State"
                  value={travellerData?.gstDetails?.state || "Not added"}
                />
              </div>

              {Array.isArray(travellerData?.travellers) &&
              travellerData?.travellers.length > 0 ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="text-[13px] font-extrabold text-slate-800 mb-3">
                    Traveller List
                  </div>

                  <div className="space-y-2">
                    {travellerData.travellers.map((traveller, index) => {
                      const name =
                        `${traveller.firstName || ""} ${traveller.lastName || ""}`.trim() ||
                        traveller.label ||
                        `Traveller ${index + 1}`;

                      return (
                        <div
                          key={traveller.id || `${name}-${index}`}
                          className="rounded-xl border border-slate-200 bg-[#fcfcfd] px-3 py-2"
                        >
                          <div className="text-[13px] font-bold text-slate-900">
                            {name}
                          </div>
                          <div className="mt-1 text-[12px] text-slate-600">
                            {[
                              traveller.travellerType,
                              traveller.gender,
                              traveller.roomLabel,
                            ]
                              .filter(Boolean)
                              .join(" • ") || "Details available"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#fbfdff] p-4">
              <div className="text-[15px] font-extrabold text-slate-900">
                Add-on Data
              </div>

              <div className="mt-4 space-y-3">
                <DetailRow
                  label="Trip Type"
                  value={
                    addOnData?.isInternationalTrip ? "International" : "Domestic"
                  }
                />
                <DetailRow
                  label="Insurance"
                  value={
                    addOnData?.insuranceSelected
                      ? `Selected • ${formatCurrency(addOnData?.insuranceAmount)}`
                      : "Not selected"
                  }
                />
                <DetailRow
                  label="Total Add-ons"
                  value={`${addons.length} selected`}
                />
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
                <div className="text-[13px] font-extrabold text-slate-800 mb-3">
                  Selected Add-ons
                </div>

                {addons.length > 0 ? (
                  <div className="space-y-2">
                    {addons.map((addon, index) => (
                      <div
                        key={addon.id || `${addon.title}-${index}`}
                        className="rounded-xl border border-slate-200 bg-[#fcfcfd] px-3 py-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[13px] font-bold text-slate-900 break-words">
                              {addon.title || `Add-on ${index + 1}`}
                            </div>
                            {addon.description ? (
                              <div className="mt-1 text-[12px] text-slate-600 break-words">
                                {addon.description}
                              </div>
                            ) : null}
                          </div>

                          <div className="shrink-0 text-[13px] font-extrabold text-slate-900">
                            {formatCurrency(addon.price)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-[#fcfcfd] px-3 py-4 text-[13px] font-medium text-slate-600">
                    No add-ons selected in booking.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function MiniStatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/80 backdrop-blur px-3 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-[13px] font-bold leading-5 text-slate-900 break-words">
        {value}
      </div>
    </div>
  );
}

function InfoStrip({
  title,
  value,
  subValue,
  icon,
}: {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-slate-500">
        {icon}
        <span>{title}</span>
      </div>

      <div className="mt-2 text-[14px] font-bold text-slate-900 break-words">
        {value}
      </div>

      {subValue ? (
        <div className="mt-1 text-[12px] font-medium text-slate-600 break-words">
          {subValue}
        </div>
      ) : null}
    </div>
  );
}

function BadgeText({
  label,
  value,
  color = "slate",
}: {
  label: string;
  value: string;
  color?: "slate" | "blue" | "orange" | "green";
}) {
  const colorMap = {
    slate: {
      box: "bg-slate-100 border-slate-200 text-slate-700",
      label: "text-slate-500",
    },
    blue: {
      box: "bg-sky-50 border-sky-200 text-sky-700",
      label: "text-sky-600",
    },
    orange: {
      box: "bg-orange-50 border-orange-200 text-orange-700",
      label: "text-orange-600",
    },
    green: {
      box: "bg-emerald-50 border-emerald-200 text-emerald-700",
      label: "text-emerald-600",
    },
  };

  return (
    <div className={`inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border px-3 py-2 ${colorMap[color].box}`}>
      <span className={`text-[11px] font-extrabold uppercase ${colorMap[color].label}`}>
        {label}
      </span>
      <span className="min-w-0 break-words text-[12px] font-bold">{value}</span>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
      <div className="text-[13px] font-semibold text-slate-500">{label}</div>
      <div className="text-[13px] font-bold text-slate-900 text-right break-words max-w-[65%]">
        {value}
      </div>
    </div>
  );
}
