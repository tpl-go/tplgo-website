"use client";

type Room = {
  adults?: number;
  children?: number;
};

type SummarySelectionState = {
  selectedFlights?: Array<{
    airline?: string;
    flightNumber?: string;
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

type PackageConfirmationSummaryCardProps = {
  packageTitle?: string;
  packageSlug?: string;
  route?: string[] | string;
  nights?: number;
  days?: number;
  variant?: "withFlight" | "withoutFlight" | string;
  travelDate?: string;
  originCity?: string;
  rooms?: Room[];
  totalAdults?: number;
  totalChildren?: number;
  totalRooms?: number;
  isInternationalTrip?: boolean;

  selectionState?: SummarySelectionState | null;

  includedFlightLabels?: string[];
  includedHotelLabels?: string[];
  includedTransferLabels?: string[];
  includedMealLabels?: string[];
  includedActivityLabels?: string[];

  bookingId?: string;
  bookingStatus?: string;
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

function normalizeRoute(route?: string[] | string) {
  if (Array.isArray(route)) return route.join(" • ");
  return route || "Route not available";
}

function getTravellerLabel(
  adults?: number,
  children?: number,
  rooms?: number
) {
  const parts: string[] = [];

  if ((adults || 0) > 0) {
    parts.push(`${adults} Adult${(adults || 0) > 1 ? "s" : ""}`);
  }

  if ((children || 0) > 0) {
    parts.push(`${children} Child${(children || 0) > 1 ? "ren" : ""}`);
  }

  if ((rooms || 0) > 0) {
    parts.push(`${rooms} Room${(rooms || 0) > 1 ? "s" : ""}`);
  }

  return parts.length ? parts.join(" • ") : "Traveller details unavailable";
}

function getRoomMixLabel(rooms?: Room[]) {
  if (!Array.isArray(rooms) || rooms.length === 0) {
    return "Room details unavailable";
  }

  return rooms
    .map(
      (room, index) =>
        `R${index + 1}: ${room.adults || 0}A${
          room.children ? `/${room.children}C` : ""
        }`
    )
    .join(" • ");
}

function getFirstValid<T>(items?: T[]) {
  if (!Array.isArray(items)) return null;
  for (const item of items) {
    if (item) return item;
  }
  return null;
}

function getFlightLine(
  selectionState?: SummarySelectionState | null,
  variant?: string,
  includedFlightLabels?: string[]
) {
  const selected = getFirstValid(selectionState?.selectedFlights);

  if (selected?.airline) {
    return [
      selected.airline,
      selected.departureTime,
      selected.from && selected.to ? `${selected.from} → ${selected.to}` : "",
    ]
      .filter(Boolean)
      .join(" • ");
  }

  if (includedFlightLabels?.length) return includedFlightLabels[0];

  return variant === "withoutFlight"
    ? "Land package • Flight not included"
    : "Standard included flight";
}

function getHotelLine(
  selectionState?: SummarySelectionState | null,
  includedHotelLabels?: string[]
) {
  const selected = getFirstValid(selectionState?.selectedHotels);

  if (selected?.hotelName) {
    return [selected.hotelName, selected.roomType, selected.city]
      .filter(Boolean)
      .join(" • ");
  }

  if (includedHotelLabels?.length) return includedHotelLabels[0];

  return "Standard included hotel";
}

function getTransferLine(
  selectionState?: SummarySelectionState | null,
  includedTransferLabels?: string[]
) {
  const selected = getFirstValid(selectionState?.selectedTransfers);

  if (selected?.title) {
    return [selected.title, selected.vehicleType].filter(Boolean).join(" • ");
  }

  if (includedTransferLabels?.length) return includedTransferLabels[0];

  return "Standard included transfer";
}

function getMealLine(
  selectionState?: SummarySelectionState | null,
  includedMealLabels?: string[]
) {
  const selectedMeals = Array.isArray(selectionState?.selectedMeals)
    ? selectionState?.selectedMeals.filter(Boolean)
    : [];

  if (selectedMeals.length === 1) {
    return selectedMeals[0]?.title || "Selected meal";
  }

  if (selectedMeals.length > 1) {
    return `${selectedMeals.length} meal plans selected`;
  }

  if (includedMealLabels?.length) return includedMealLabels[0];

  return "Standard included meal";
}

function getActivityLine(
  selectionState?: SummarySelectionState | null,
  includedActivityLabels?: string[]
) {
  const selectedActivities = Array.isArray(selectionState?.selectedActivities)
    ? selectionState?.selectedActivities.filter(Boolean)
    : [];

  if (selectedActivities.length === 1) {
    return selectedActivities[0]?.title || "Selected activity";
  }

  if (selectedActivities.length > 1) {
    return `${selectedActivities.length} activities selected`;
  }

  if (includedActivityLabels?.length) return includedActivityLabels[0];

  return "Standard included activity";
}

function getStatusMeta(status?: string) {
  const normalized = String(status || "confirmed").toLowerCase();

  if (normalized === "confirmed") {
    return {
      label: "Confirmed",
      bg: "#ecfdf3",
      border: "#b7ebc6",
      color: "#067647",
    };
  }

  if (normalized === "pending") {
    return {
      label: "Pending",
      bg: "#fff7ed",
      border: "#fed7aa",
      color: "#c2410c",
    };
  }

  return {
    label: status || "Confirmed",
    bg: "#eef6ff",
    border: "#cfe2ff",
    color: "#1d4ed8",
  };
}

export default function PackageConfirmationSummaryCard({
  packageTitle = "Package Booking",
  packageSlug = "",
  route,
  nights = 0,
  days = 0,
  variant = "withFlight",
  travelDate = "",
  originCity = "Delhi",
  rooms = [],
  totalAdults = 1,
  totalChildren = 0,
  totalRooms = 1,
  isInternationalTrip = false,
  selectionState,
  includedFlightLabels = [],
  includedHotelLabels = [],
  includedTransferLabels = [],
  includedMealLabels = [],
  includedActivityLabels = [],
  bookingId = "TPL-PKG-BOOKING",
  bookingStatus = "confirmed",
}: PackageConfirmationSummaryCardProps) {
  const statusMeta = getStatusMeta(bookingStatus);

  const routeLabel = normalizeRoute(route);
  const durationLabel = `${nights}N / ${days}D`;
  const travellerLabel = getTravellerLabel(
    totalAdults,
    totalChildren,
    totalRooms
  );
  const roomMixLabel = getRoomMixLabel(rooms);

  const flightLine = getFlightLine(
    selectionState,
    variant,
    includedFlightLabels
  );
  const hotelLine = getHotelLine(selectionState, includedHotelLabels);
  const transferLine = getTransferLine(selectionState, includedTransferLabels);
  const mealLine = getMealLine(selectionState, includedMealLabels);
  const activityLine = getActivityLine(selectionState, includedActivityLabels);

  return (
    <section
      className="pkg-confirm-summary"
      style={{
        border: "1px solid #d9e2ec",
        background: "#ffffff",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(15,23,42,0.05)",
      }}
    >
      <div
        className="pkg-confirm-summary-head"
        style={{
          padding: "18px 20px",
          borderBottom: "1px solid #e5e7eb",
          background:
            "linear-gradient(90deg, #eef6ff 0%, #ffffff 55%, #fff7ed 100%)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                border: `1px solid ${statusMeta.border}`,
                background: statusMeta.bg,
                color: statusMeta.color,
                padding: "6px 12px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: 800,
              }}
            >
              Booking {statusMeta.label}
            </span>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                border: "1px solid #dbeafe",
                background: "#f8fbff",
                color: "#2563eb",
                padding: "6px 12px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: 800,
              }}
            >
              {variant === "withoutFlight" ? "Land Package" : "With Flight"}
            </span>

            {packageSlug ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  border: "1px solid #e5e7eb",
                  background: "#ffffff",
                  color: "#374151",
                  padding: "6px 12px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 800,
                }}
              >
                Code: {packageSlug}
              </span>
            ) : null}
          </div>

          <div
            style={{
              fontSize: "24px",
              fontWeight: 900,
              color: "#111827",
              lineHeight: 1.2,
            }}
          >
            {packageTitle}
          </div>

          <div
            style={{
              marginTop: "8px",
              fontSize: "14px",
              color: "#6b7280",
              fontWeight: 500,
            }}
          >
            {routeLabel}
          </div>
        </div>

        <div
          className="pkg-confirm-summary-id"
          style={{
            minWidth: "220px",
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            borderRadius: "16px",
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}
          >
            Booking ID
          </div>

          <div
            style={{
              marginTop: "6px",
              fontSize: "16px",
              fontWeight: 800,
              color: "#111827",
              wordBreak: "break-word",
            }}
          >
            {bookingId}
          </div>
        </div>
      </div>

      <div
        className="pkg-confirm-summary-stats"
        style={{
          padding: "18px 20px",
          borderBottom: "1px solid #e5e7eb",
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: "12px",
        }}
      >
        <StatCard label="Travel Date" value={formatDate(travelDate)} />
        <StatCard label="Origin City" value={originCity || "Delhi"} />
        <StatCard label="Duration" value={durationLabel} />
        <StatCard label="Travellers" value={travellerLabel} />
        <StatCard label="Trip Type" value={isInternationalTrip ? "International" : "Domestic"} />
      </div>

      <div
        className="pkg-confirm-summary-services"
        style={{
          padding: "18px 20px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            fontSize: "16px",
            fontWeight: 800,
            color: "#111827",
            marginBottom: "14px",
          }}
        >
          Confirmed Package Summary
        </div>

        <div
          className="pkg-confirm-summary-services-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: "12px",
          }}
        >
          <ServiceCard label="Flight" value={flightLine} />
          <ServiceCard label="Hotel" value={hotelLine} />
          <ServiceCard label="Transfer" value={transferLine} />
          <ServiceCard label="Meal" value={mealLine} />
          <ServiceCard label="Activity" value={activityLine} />
        </div>
      </div>

      <div
        className="pkg-confirm-summary-info"
        style={{
          padding: "18px 20px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
      >
        <InfoBlock title="Room Mix" value={roomMixLabel} />
        <InfoBlock
          title="Package Mode"
          value={variant === "withoutFlight" ? "Without Flight" : "With Flight"}
        />
      </div>

      <style>{`
        @media (max-width: 767px) {
          .pkg-confirm-summary {
            border-radius: 18px !important;
          }

          .pkg-confirm-summary-head,
          .pkg-confirm-summary-services,
          .pkg-confirm-summary-info {
            padding: 16px !important;
          }

          .pkg-confirm-summary-id {
            min-width: 0 !important;
            width: 100% !important;
          }

          .pkg-confirm-summary-stats,
          .pkg-confirm-summary-services-grid,
          .pkg-confirm-summary-info {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }

          .pkg-confirm-summary-stats {
            padding: 16px !important;
          }
        }
      `}</style>
    </section>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
        borderRadius: "14px",
        padding: "12px 14px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: 800,
          color: "#6b7280",
          textTransform: "uppercase",
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "6px",
          fontSize: "14px",
          fontWeight: 800,
          color: "#111827",
          lineHeight: 1.4,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ServiceCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        background: "#ffffff",
        borderRadius: "14px",
        padding: "14px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: 800,
          color: "#6b7280",
          textTransform: "uppercase",
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "8px",
          fontSize: "14px",
          fontWeight: 800,
          color: "#111827",
          lineHeight: 1.5,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InfoBlock({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        background: "#f8fbff",
        borderRadius: "16px",
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          fontWeight: 800,
          color: "#6b7280",
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: "6px",
          fontSize: "15px",
          fontWeight: 800,
          color: "#111827",
          lineHeight: 1.5,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}
