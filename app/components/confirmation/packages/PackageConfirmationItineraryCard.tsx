"use client";

type DayItem = {
  day?: number;
  title?: string;
  items?: string[];
  dateLabel?: string;
  included?: {
    flights?: number;
    hotels?: number;
    transfers?: number;
    activities?: number;
    meals?: number;
  };
};

type FlightItem = {
  airline?: string;
  flightNumber?: string;
  from?: string;
  to?: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
};

type HotelItem = {
  hotelName?: string;
  roomType?: string;
  city?: string;
  mealPlan?: string;
  starRating?: number;
};

type TransferItem = {
  title?: string;
  vehicleType?: string;
  subtitle?: string;
};

type MealItem = {
  title?: string;
  description?: string;
};

type ActivityItem = {
  title?: string;
  description?: string;
  category?: string;
};

type PackageSelectionStateShape = {
  selectedFlights?: FlightItem[];
  selectedHotels?: HotelItem[];
  selectedTransfers?: TransferItem[];
  selectedMeals?: MealItem[];
  selectedActivities?: ActivityItem[];
};

type PackageConfirmationItineraryCardProps = {
  title?: string;
  travelDate?: string;
  dayPlans?: DayItem[];
  features?: {
    flights?: number;
    hotels?: number;
    transfers?: number;
    activities?: number;
    meals?: number;
  };
  packageSelectionState?: PackageSelectionStateShape | null;
  includedFlightLabels?: string[];
  includedHotelLabels?: string[];
  includedTransferLabels?: string[];
  includedMealLabels?: string[];
  includedActivityLabels?: string[];
};

type DayServiceBlock = {
  type: "flight" | "hotel" | "transfer" | "meal" | "activity";
  title: string;
  subtitle?: string;
  meta?: string;
};

function normalizeItemText(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const v = value as Record<string, unknown>;
    if (typeof v.title === "string") return v.title;
    if (typeof v.name === "string") return v.name;
    if (typeof v.label === "string") return v.label;
  }
  return "";
}

function isValidDate(value?: string) {
  if (!value) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

function isGenericDayLabel(value?: string) {
  if (!value) return false;
  return /^day\s*\d+$/i.test(value.trim());
}

function formatDayDate(baseDate: string, dayOffset: number) {
  if (!isValidDate(baseDate)) return "";
  const d = new Date(baseDate);
  d.setDate(d.getDate() + dayOffset);

  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function detectServicesFromItems(items: string[]) {
  const text = items.join(" ").toLowerCase();

  return {
    hasFlight:
      text.includes("flight") ||
      text.includes("arrival") ||
      text.includes("departure"),

    hasHotel:
      text.includes("hotel") ||
      text.includes("check-in") ||
      text.includes("check in") ||
      text.includes("stay") ||
      text.includes("resort"),

    hasTransfer:
      text.includes("transfer") ||
      text.includes("pickup") ||
      text.includes("drop") ||
      text.includes("cab") ||
      text.includes("vehicle"),

    hasMeal:
      text.includes("meal") ||
      text.includes("breakfast") ||
      text.includes("lunch") ||
      text.includes("dinner"),

    hasActivity:
      text.includes("activity") ||
      text.includes("sightseeing") ||
      text.includes("tour") ||
      text.includes("excursion") ||
      text.includes("experience"),
  };
}

function pickOneOrMany<T>(items: T[], maxCount: number) {
  if (!Array.isArray(items) || items.length === 0 || maxCount <= 0) return [];
  return items.slice(0, maxCount);
}

function mapFlightBlocks(
  selectedFlights: FlightItem[],
  includedFlightLabels: string[],
  count: number
): DayServiceBlock[] {
  if (count <= 0) return [];

  const selected = pickOneOrMany(selectedFlights, count);

  if (selected.length > 0) {
    return selected.map((flight, index) => {
      const route =
        flight.from && flight.to ? `${flight.from} → ${flight.to}` : "";
      const timing =
        flight.departureTime && flight.arrivalTime
          ? `${flight.departureTime} - ${flight.arrivalTime}`
          : flight.departureTime || flight.arrivalTime || "";

      return {
        type: "flight",
        title: flight.airline || `Flight ${index + 1}`,
        subtitle: flight.flightNumber || undefined,
        meta: [timing, route, flight.duration].filter(Boolean).join(" • "),
      };
    });
  }

  return includedFlightLabels.slice(0, count).map((label) => ({
    type: "flight",
    title: label,
  }));
}

function mapHotelBlocks(
  selectedHotels: HotelItem[],
  includedHotelLabels: string[],
  count: number
): DayServiceBlock[] {
  if (count <= 0) return [];

  const selected = pickOneOrMany(selectedHotels, count);

  if (selected.length > 0) {
    return selected.map((hotel, index) => ({
      type: "hotel",
      title: hotel.hotelName || `Hotel ${index + 1}`,
      subtitle:
        typeof hotel.starRating === "number"
          ? `${hotel.starRating} Star Stay`
          : undefined,
      meta: [hotel.roomType, hotel.city, hotel.mealPlan]
        .filter(Boolean)
        .join(" • "),
    }));
  }

  return includedHotelLabels.slice(0, count).map((label) => ({
    type: "hotel",
    title: label,
  }));
}

function mapTransferBlocks(
  selectedTransfers: TransferItem[],
  includedTransferLabels: string[],
  count: number
): DayServiceBlock[] {
  if (count <= 0) return [];

  const selected = pickOneOrMany(selectedTransfers, count);

  if (selected.length > 0) {
    return selected.map((transfer, index) => ({
      type: "transfer",
      title: transfer.title || `Transfer ${index + 1}`,
      meta: [transfer.vehicleType, transfer.subtitle].filter(Boolean).join(" • "),
    }));
  }

  return includedTransferLabels.slice(0, count).map((label) => ({
    type: "transfer",
    title: label,
  }));
}

function mapMealBlocks(
  selectedMeals: MealItem[],
  includedMealLabels: string[],
  count: number
): DayServiceBlock[] {
  if (count <= 0) return [];

  const selected = pickOneOrMany(selectedMeals, count);

  if (selected.length > 0) {
    return selected.map((meal, index) => ({
      type: "meal",
      title: meal.title || `Meal ${index + 1}`,
      meta: meal.description || "",
    }));
  }

  return includedMealLabels.slice(0, count).map((label) => ({
    type: "meal",
    title: label,
  }));
}

function mapActivityBlocks(
  selectedActivities: ActivityItem[],
  includedActivityLabels: string[],
  count: number
): DayServiceBlock[] {
  if (count <= 0) return [];

  const selected = pickOneOrMany(selectedActivities, count);

  if (selected.length > 0) {
    return selected.map((activity, index) => ({
      type: "activity",
      title: activity.title || `Activity ${index + 1}`,
      meta: [activity.category, activity.description].filter(Boolean).join(" • "),
    }));
  }

  return includedActivityLabels.slice(0, count).map((label) => ({
    type: "activity",
    title: label,
  }));
}

function getTypeBadgeColors(type: DayServiceBlock["type"]) {
  if (type === "flight") {
    return {
      bg: "#eff6ff",
      border: "#bfdbfe",
      color: "#1d4ed8",
      label: "Flight",
    };
  }

  if (type === "hotel") {
    return {
      bg: "#eef2ff",
      border: "#c7d2fe",
      color: "#4338ca",
      label: "Hotel",
    };
  }

  if (type === "transfer") {
    return {
      bg: "#ecfeff",
      border: "#a5f3fc",
      color: "#0f766e",
      label: "Transfer",
    };
  }

  if (type === "meal") {
    return {
      bg: "#fffbeb",
      border: "#fde68a",
      color: "#b45309",
      label: "Meal",
    };
  }

  return {
    bg: "#ecfdf3",
    border: "#bbf7d0",
    color: "#15803d",
    label: "Activity",
  };
}

function getTimelineDescription(item: string) {
  const text = item.toLowerCase();

  if (text.includes("arrival")) {
    return "Arrival assistance and onboarding for the journey.";
  }

  if (text.includes("departure")) {
    return "Departure coordination and final movement planning.";
  }

  if (text.includes("flight")) {
    return "Flight movement as per selected route and timing.";
  }

  if (
    text.includes("transfer") ||
    text.includes("pickup") ||
    text.includes("drop")
  ) {
    return "Transfer movement as per confirmed itinerary flow.";
  }

  if (
    text.includes("hotel") ||
    text.includes("check-in") ||
    text.includes("stay")
  ) {
    return "Hotel stay and check-in flow for this stage.";
  }

  if (
    text.includes("meal") ||
    text.includes("breakfast") ||
    text.includes("lunch") ||
    text.includes("dinner")
  ) {
    return "Meal service aligned with confirmed meal coverage.";
  }

  if (
    text.includes("activity") ||
    text.includes("sightseeing") ||
    text.includes("tour")
  ) {
    return "Experience or sightseeing confirmed for this stage.";
  }

  return "Confirmed itinerary movement as per final booking flow.";
}

export default function PackageConfirmationItineraryCard({
  title = "Confirmed Itinerary",
  travelDate = "",
  dayPlans = [],
  features,
  packageSelectionState,
  includedFlightLabels = [],
  includedHotelLabels = [],
  includedTransferLabels = [],
  includedMealLabels = [],
  includedActivityLabels = [],
}: PackageConfirmationItineraryCardProps) {
  const selectedFlights = packageSelectionState?.selectedFlights || [];
  const selectedHotels = packageSelectionState?.selectedHotels || [];
  const selectedTransfers = packageSelectionState?.selectedTransfers || [];
  const selectedMeals = packageSelectionState?.selectedMeals || [];
  const selectedActivities = packageSelectionState?.selectedActivities || [];

  const normalizedDays = (dayPlans || []).map((day, dayIndex) => {
    const safeDayNumber =
      typeof day?.day === "number" && !Number.isNaN(day.day)
        ? day.day
        : dayIndex + 1;

    const cleanItems = (day.items || [])
      .map((item) => normalizeItemText(item))
      .filter(Boolean);

    const detected = detectServicesFromItems(cleanItems);

    const includedFlights = Number(day.included?.flights || 0);
    const includedHotels = Number(day.included?.hotels || 0);
    const includedTransfers = Number(day.included?.transfers || 0);
    const includedMeals = Number(day.included?.meals || 0);
    const includedActivities = Number(day.included?.activities || 0);

    const flightCount =
      includedFlights > 0 ? includedFlights : detected.hasFlight ? 1 : 0;

    const hotelCount =
      includedHotels > 0 ? includedHotels : detected.hasHotel ? 1 : 0;

    const transferCount =
      includedTransfers > 0 ? includedTransfers : detected.hasTransfer ? 1 : 0;

    const mealCount =
      includedMeals > 0 ? includedMeals : detected.hasMeal ? 1 : 0;

    const activityCount =
      includedActivities > 0 ? includedActivities : detected.hasActivity ? 1 : 0;

    const serviceBlocks: DayServiceBlock[] = [
      ...mapFlightBlocks(selectedFlights, includedFlightLabels, flightCount),
      ...mapHotelBlocks(selectedHotels, includedHotelLabels, hotelCount),
      ...mapTransferBlocks(
        selectedTransfers,
        includedTransferLabels,
        transferCount
      ),
      ...mapMealBlocks(selectedMeals, includedMealLabels, mealCount),
      ...mapActivityBlocks(
        selectedActivities,
        includedActivityLabels,
        activityCount
      ),
    ];

    const rawDateLabel =
      typeof day.dateLabel === "string" ? day.dateLabel.trim() : "";

    const finalDateLabel =
      rawDateLabel && !isGenericDayLabel(rawDateLabel)
        ? rawDateLabel
        : travelDate && isValidDate(travelDate)
        ? formatDayDate(travelDate, safeDayNumber - 1)
        : "";

    return {
      ...day,
      day: safeDayNumber,
      dayKey: `day-${safeDayNumber}-${dayIndex}`,
      cleanItems,
      serviceBlocks,
      finalDateLabel,
    };
  });

  return (
    <section
      className="pkg-confirm-itinerary"
      style={{
        border: "1px solid #d9e2ec",
        background: "#ffffff",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(15,23,42,0.05)",
      }}
    >
      <div
        className="pkg-confirm-card-head"
        style={{
          padding: "18px 20px",
          borderBottom: "1px solid #e5e7eb",
          background:
            "linear-gradient(90deg, #eef6ff 0%, #ffffff 55%, #fff7ed 100%)",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: 900,
            color: "#111827",
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: "6px",
            fontSize: "13px",
            color: "#6b7280",
            fontWeight: 500,
          }}
        >
          Day-wise confirmed itinerary and included service flow
        </div>

        <div
          style={{
            marginTop: "14px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <FeaturePill label="Flights" value={features?.flights ?? 0} />
          <FeaturePill label="Hotels" value={features?.hotels ?? 0} />
          <FeaturePill label="Transfers" value={features?.transfers ?? 0} />
          <FeaturePill label="Meals" value={features?.meals ?? 0} />
          <FeaturePill label="Activities" value={features?.activities ?? 0} />
        </div>
      </div>

      <div
        className="pkg-confirm-itinerary-body"
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        {normalizedDays.map((day) => (
          <div
            key={day.dayKey}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "18px",
              overflow: "hidden",
              background: "#ffffff",
            }}
          >
            <div
              style={{
                padding: "16px 18px",
                borderBottom: "1px solid #e5e7eb",
                background: "#f8fbff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "14px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "6px 12px",
                    borderRadius: "999px",
                    background: "#1e3a8a",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 800,
                    marginBottom: "10px",
                  }}
                >
                  Day {day.day}
                </div>

                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "#111827",
                  }}
                >
                  {day.title}
                </div>

                {day.finalDateLabel ? (
                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "13px",
                      color: "#6b7280",
                      fontWeight: 600,
                    }}
                  >
                    {day.finalDateLabel}
                  </div>
                ) : null}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                {(day.included?.flights ?? 0) > 0 ? (
                  <MiniCountPill label="Flight" value={day.included?.flights ?? 0} />
                ) : null}
                {(day.included?.hotels ?? 0) > 0 ? (
                  <MiniCountPill label="Hotel" value={day.included?.hotels ?? 0} />
                ) : null}
                {(day.included?.transfers ?? 0) > 0 ? (
                  <MiniCountPill
                    label="Transfer"
                    value={day.included?.transfers ?? 0}
                  />
                ) : null}
                {(day.included?.meals ?? 0) > 0 ? (
                  <MiniCountPill label="Meal" value={day.included?.meals ?? 0} />
                ) : null}
                {(day.included?.activities ?? 0) > 0 ? (
                  <MiniCountPill
                    label="Activity"
                    value={day.included?.activities ?? 0}
                  />
                ) : null}
              </div>
            </div>

            <div
              className="pkg-confirm-day-grid"
              style={{
                padding: "18px",
                display: "grid",
                gridTemplateColumns: "360px minmax(0, 1fr)",
                gap: "16px",
              }}
            >
              <div
                style={{
                  border: "1px solid #dbeafe",
                  borderRadius: "16px",
                  background: "#f8fbff",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid #dbeafe",
                    background: "#eef6ff",
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "#111827",
                  }}
                >
                  Confirmed Services
                </div>

                <div
                  style={{
                    padding: "14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {day.serviceBlocks.length > 0 ? (
                    day.serviceBlocks.map((service, index) => {
                      const badge = getTypeBadgeColors(service.type);

                      return (
                        <div
                          key={`${day.dayKey}-service-${service.type}-${index}`}
                          style={{
                            border: "1px solid #e5e7eb",
                            borderRadius: "14px",
                            background: "#ffffff",
                            padding: "14px",
                          }}
                        >
                          <div
                            className="pkg-confirm-service-card-row"
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: "12px",
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "5px 10px",
                                  borderRadius: "999px",
                                  background: badge.bg,
                                  border: `1px solid ${badge.border}`,
                                  color: badge.color,
                                  fontSize: "11px",
                                  fontWeight: 800,
                                  textTransform: "uppercase",
                                  marginBottom: "10px",
                                }}
                              >
                                {badge.label}
                              </div>

                              <div
                                style={{
                                  fontSize: "15px",
                                  fontWeight: 800,
                                  color: "#111827",
                                  lineHeight: 1.45,
                                  wordBreak: "break-word",
                                }}
                              >
                                {service.title}
                              </div>

                              {service.subtitle ? (
                                <div
                                  style={{
                                    marginTop: "4px",
                                    fontSize: "13px",
                                    color: "#4b5563",
                                    fontWeight: 600,
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {service.subtitle}
                                </div>
                              ) : null}

                              {service.meta ? (
                                <div
                                  style={{
                                    marginTop: "6px",
                                    fontSize: "12px",
                                    color: "#6b7280",
                                    fontWeight: 500,
                                    lineHeight: "18px",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {service.meta}
                                </div>
                              ) : null}
                            </div>

                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "5px 10px",
                                borderRadius: "999px",
                                background: "#ecfdf3",
                                border: "1px solid #bbf7d0",
                                color: "#15803d",
                                fontSize: "11px",
                                fontWeight: 800,
                                flexShrink: 0,
                              }}
                            >
                              Confirmed
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "14px",
                        background: "#ffffff",
                        padding: "14px",
                        fontSize: "13px",
                        color: "#6b7280",
                        fontWeight: 500,
                      }}
                    >
                      No mapped service blocks for this day.
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  border: "1px solid #f3e8d3",
                  borderRadius: "16px",
                  background: "#fffaf3",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid #f3e8d3",
                    background: "#fff3df",
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "#111827",
                  }}
                >
                  Day Wise Flow
                </div>

                <div style={{ padding: "16px" }}>
                  {day.cleanItems.length > 0 ? (
                    <div
                      style={{
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: "15px",
                          top: "2px",
                          bottom: "2px",
                          width: "2px",
                          background: "#cbd5e1",
                        }}
                      />

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "16px",
                        }}
                      >
                        {day.cleanItems.map((item, index) => (
                          <div
                            key={`${day.dayKey}-flow-${index}`}
                            style={{
                              position: "relative",
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "14px",
                            }}
                          >
                            <div
                              style={{
                                position: "relative",
                                zIndex: 1,
                                width: "32px",
                                height: "32px",
                                borderRadius: "999px",
                                background: "#1e3a8a",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "13px",
                                fontWeight: 800,
                                flexShrink: 0,
                                boxShadow: "0 0 0 4px #fffaf3",
                              }}
                            >
                              {index + 1}
                            </div>

                            <div
                              style={{
                                minWidth: 0,
                                flex: 1,
                                border: "1px solid #eadfcb",
                                borderRadius: "16px",
                                background: "#ffffff",
                                padding: "14px 16px",
                                boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "15px",
                                  fontWeight: 700,
                                  color: "#111827",
                                  lineHeight: 1.45,
                                  wordBreak: "break-word",
                                }}
                              >
                                {item}
                              </div>

                              <div
                                style={{
                                  marginTop: "6px",
                                  fontSize: "13px",
                                  color: "#6b7280",
                                  lineHeight: "22px",
                                  fontWeight: 500,
                                }}
                              >
                                {getTimelineDescription(item)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        fontWeight: 500,
                      }}
                    >
                      Day-wise flow not available.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 767px) {
          .pkg-confirm-itinerary {
            border-radius: 18px !important;
          }

          .pkg-confirm-card-head,
          .pkg-confirm-itinerary-body {
            padding: 16px !important;
          }

          .pkg-confirm-itinerary-body {
            gap: 14px !important;
          }

          .pkg-confirm-day-grid {
            grid-template-columns: 1fr !important;
            padding: 14px !important;
            gap: 14px !important;
          }

          .pkg-confirm-service-card-row {
            flex-direction: column !important;
          }
        }
      `}</style>
    </section>
  );
}

function FeaturePill({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "7px 12px",
        borderRadius: "999px",
        background: "#ffffff",
        border: "1px solid #d9e2ec",
        color: "#374151",
        fontSize: "12px",
        fontWeight: 800,
      }}
    >
      {label}: {value}
    </span>
  );
}

function MiniCountPill({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: "999px",
        background: "#ffffff",
        border: "1px solid #d9e2ec",
        color: "#4b5563",
        fontSize: "11px",
        fontWeight: 800,
      }}
    >
      {value} {label}
    </span>
  );
}
