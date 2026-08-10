"use client";

import {
  formatAirportLocalDate,
  formatAirportLocalTime,
  formatDayOffset,
  formatDurationFromSchedule,
  type FlightScheduleEndpoint,
} from "@/app/lib/flights/flightScheduleTime";

type Segment = {
  airline?: string;
  flightNumber?: string;
  from?: string;
  to?: string;
  fromCode?: string;
  toCode?: string;
  departureTime?: string;
  arrivalTime?: string;
  departureDate?: string;
  arrivalDate?: string;
  duration?: string;
  cabinBaggage?: string;
  checkinBaggage?: string;
  aircraft?: string;
  terminalFrom?: string;
  terminalTo?: string;
  schedule?: {
    departure?: FlightScheduleEndpoint;
    arrival?: FlightScheduleEndpoint;
    dayOffset?: number;
  };
};

type Journey = {
  journeyLabel?: string;
  segments?: Segment[];
  layovers?: {
    airport?: string;
    code?: string;
    duration?: string;
    note?: string;
  }[];
};

type Props = {
  journeys?: Journey[];
  cabinClass?: string;
};

function formatDate(value?: string) {
  if (!value) return "Date not available";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function segmentTime(segment: Segment, endpoint: "departure" | "arrival") {
  const schedule = segment.schedule?.[endpoint];
  const fallback = endpoint === "departure" ? segment.departureTime : segment.arrivalTime;
  const offset = endpoint === "arrival" ? formatDayOffset(segment.schedule?.dayOffset) : "";
  return `${formatAirportLocalTime(schedule, fallback || "--:--")}${offset ? ` ${offset}` : ""}`;
}

function segmentDate(segment: Segment, endpoint: "departure" | "arrival") {
  const schedule = segment.schedule?.[endpoint];
  const fallback = endpoint === "departure" ? segment.departureDate : segment.arrivalDate;
  return formatAirportLocalDate(schedule, "") || formatDate(fallback);
}

function segmentDuration(segment: Segment) {
  return formatDurationFromSchedule({
    departure: segment.schedule?.departure,
    arrival: segment.schedule?.arrival,
    duration: segment.duration,
    dayOffset: segment.schedule?.dayOffset,
  }, segment.duration || "");
}

export default function FlightConfirmationJourneyCard({
  journeys = [],
  cabinClass,
}: Props) {
  return (
    <section
      className="flight-journey-card"
      style={{
        border: "1px solid #d9e2ec",
        borderRadius: "22px",
        overflow: "hidden",
        background: "#ffffff",
        boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
      }}
    >
      <div
        style={{
          minHeight: "58px",
          padding: "0 22px",
          borderBottom: "1px solid #e5e7eb",
          background: "linear-gradient(180deg, #fffdf4 0%, #ffffff 100%)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "19px",
            fontWeight: 900,
            color: "#111827",
            letterSpacing: "-0.2px",
          }}
        >
          Flight Journey Details
        </h3>
      </div>

      <div className="journey-card-body" style={{ padding: "22px" }}>
        <div style={{ display: "grid", gap: "16px" }}>
          {journeys.length > 0 ? (
            journeys.map((journey, journeyIndex) => (
              <div
                key={`${journey.journeyLabel || "journey"}-${journeyIndex}`}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "20px",
                  background: "#ffffff",
                  overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(15,23,42,0.03)",
                }}
              >
                <div
                  style={{
                    padding: "16px 18px",
                    borderBottom: "1px solid #e5e7eb",
                    background:
                      "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 900,
                        color: "#111827",
                        lineHeight: "26px",
                      }}
                    >
                      {journey.journeyLabel || `Journey ${journeyIndex + 1}`}
                    </div>

                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "13px",
                        color: "#64748b",
                        fontWeight: 700,
                      }}
                    >
                      {(journey.segments || []).length} flight segment
                      {(journey.segments || []).length > 1 ? "s" : ""}
                    </div>
                  </div>

                  {cabinClass ? (
                    <span style={topPillStyle}>{cabinClass}</span>
                  ) : null}
                </div>

                <div style={{ padding: "18px" }}>
                  <div style={{ display: "grid", gap: "16px" }}>
                    {(journey.segments || []).map((segment, segmentIndex) => (
                      <div
                        key={`${segment.flightNumber || "segment"}-${segmentIndex}`}
                        style={{
                          border:
                            segmentIndex > 0
                              ? "1px dashed #dbe4ee"
                              : "1px solid #e5e7eb",
                          borderRadius: "18px",
                          background:
                            segmentIndex === 0 ? "#ffffff" : "#fcfdff",
                          padding: "16px",
                        }}
                      >
                        {/* Airline header */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "12px",
                            flexWrap: "wrap",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: "16px",
                                fontWeight: 900,
                                color: "#111827",
                                lineHeight: "24px",
                              }}
                            >
                              {segment.airline || "Airline"} •{" "}
                              {segment.flightNumber || "Flight"}
                            </div>

                            <div
                              style={{
                                marginTop: "4px",
                                fontSize: "13px",
                                color: "#64748b",
                                fontWeight: 700,
                              }}
                            >
                              Aircraft: {segment.aircraft || "Not available"}
                            </div>
                          </div>

                          {segmentDuration(segment) ? (
                            <span style={durationPillStyle}>
                              {segmentDuration(segment)}
                            </span>
                          ) : null}
                        </div>

                        {/* Route strip */}
                        <div
                          className="route-strip"
                          style={{
                            marginTop: "16px",
                            border: "1px solid #e5e7eb",
                            borderRadius: "18px",
                            background:
                              "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
                            padding: "16px",
                          }}
                        >
                          <div
                            className="route-grid"
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr auto 1fr",
                              gap: "14px",
                              alignItems: "center",
                            }}
                          >
                            <div className="route-point">
                              <div
                                style={{
                                  fontSize: "13px",
                                  fontWeight: 800,
                                  color: "#64748b",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                Departure
                              </div>

                              <div
                                style={{
                                  marginTop: "6px",
                                  fontSize: "28px",
                                  fontWeight: 900,
                                  color: "#0f172a",
                                  lineHeight: "30px",
                                }}
                              >
                                {segmentTime(segment, "departure")}
                              </div>

                              <div
                                style={{
                                  marginTop: "8px",
                                  fontSize: "18px",
                                  fontWeight: 900,
                                  color: "#111827",
                                  lineHeight: "24px",
                                }}
                              >
                                {segment.fromCode || segment.from || "ORG"}
                              </div>

                              <div
                                style={{
                                  marginTop: "4px",
                                  fontSize: "13px",
                                  fontWeight: 700,
                                  color: "#475569",
                                  lineHeight: "20px",
                                }}
                              >
                                {segment.from || "Origin"}
                              </div>

                              <div
                                style={{
                                  marginTop: "4px",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  color: "#64748b",
                                  lineHeight: "18px",
                                }}
                              >
                                {segmentDate(segment, "departure")}
                              </div>

                              <div
                                style={{
                                  marginTop: "4px",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  color: "#64748b",
                                  lineHeight: "18px",
                                }}
                              >
                                Terminal: {segment.terminalFrom || "N/A"}
                              </div>
                            </div>

                            <div
                              className="route-middle"
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "8px",
                                minWidth: "110px",
                              }}
                            >
                              <div
                                style={{
                                  width: "100%",
                                  height: "2px",
                                  background:
                                    "linear-gradient(90deg, #bfdbfe 0%, #60a5fa 50%, #bfdbfe 100%)",
                                  borderRadius: "999px",
                                }}
                              />

                              <div
                                style={{
                                  fontSize: "20px",
                                  lineHeight: 1,
                                }}
                              >
                                ✈️
                              </div>

                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#64748b",
                                  fontWeight: 800,
                                  textAlign: "center",
                                }}
                              >
                                Non-stop / Scheduled
                              </div>

                              <div
                                style={{
                                  width: "100%",
                                  height: "2px",
                                  background:
                                    "linear-gradient(90deg, #bfdbfe 0%, #60a5fa 50%, #bfdbfe 100%)",
                                  borderRadius: "999px",
                                }}
                              />
                            </div>

                            <div className="route-point route-point-arrival" style={{ textAlign: "right" }}>
                              <div
                                style={{
                                  fontSize: "13px",
                                  fontWeight: 800,
                                  color: "#64748b",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                Arrival
                              </div>

                              <div
                                style={{
                                  marginTop: "6px",
                                  fontSize: "28px",
                                  fontWeight: 900,
                                  color: "#0f172a",
                                  lineHeight: "30px",
                                }}
                              >
                                {segmentTime(segment, "arrival")}
                              </div>

                              <div
                                style={{
                                  marginTop: "8px",
                                  fontSize: "18px",
                                  fontWeight: 900,
                                  color: "#111827",
                                  lineHeight: "24px",
                                }}
                              >
                                {segment.toCode || segment.to || "DST"}
                              </div>

                              <div
                                style={{
                                  marginTop: "4px",
                                  fontSize: "13px",
                                  fontWeight: 700,
                                  color: "#475569",
                                  lineHeight: "20px",
                                }}
                              >
                                {segment.to || "Destination"}
                              </div>

                              <div
                                style={{
                                  marginTop: "4px",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  color: "#64748b",
                                  lineHeight: "18px",
                                }}
                              >
                                {segmentDate(segment, "arrival")}
                              </div>

                              <div
                                style={{
                                  marginTop: "4px",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  color: "#64748b",
                                  lineHeight: "18px",
                                }}
                              >
                                Terminal: {segment.terminalTo || "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Baggage / service strip */}
                        <div
                          style={{
                            marginTop: "14px",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "10px",
                          }}
                        >
                          <span style={infoPillStyle}>
                            Cabin Baggage: {segment.cabinBaggage || "7 Kg"}
                          </span>

                          <span style={infoPillStyle}>
                            Check-in Baggage:{" "}
                            {segment.checkinBaggage || "15 Kg"}
                          </span>

                          {cabinClass ? (
                            <span style={infoPillStyle}>
                              Cabin Class: {cabinClass}
                            </span>
                          ) : null}
                        </div>

                        {/* Layover */}
                        {journey.layovers?.[segmentIndex] ? (
                          <div
                            style={{
                              marginTop: "14px",
                              border: "1px solid #fed7aa",
                              background: "#fff7ed",
                              borderRadius: "14px",
                              padding: "12px 14px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 900,
                                color: "#9a3412",
                                lineHeight: "20px",
                              }}
                            >
                              Layover:{" "}
                              {journey.layovers[segmentIndex]?.duration || "--"}{" "}
                              at{" "}
                              {journey.layovers[segmentIndex]?.airport || "--"}{" "}
                              {journey.layovers[segmentIndex]?.code
                                ? `(${journey.layovers[segmentIndex]?.code})`
                                : ""}
                            </div>

                            {journey.layovers[segmentIndex]?.note ? (
                              <div
                                style={{
                                  marginTop: "4px",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  color: "#b45309",
                                  lineHeight: "18px",
                                }}
                              >
                                {journey.layovers[segmentIndex]?.note}
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={emptyTextStyle}>No journey data available</div>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 767px) {
          .flight-journey-card {
            border-radius: 18px !important;
          }

          .flight-journey-card .journey-card-body {
            padding: 14px !important;
          }

          .flight-journey-card .route-strip {
            padding: 12px !important;
            border-radius: 16px !important;
          }

          .flight-journey-card .route-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 12px !important;
            align-items: stretch !important;
          }

          .flight-journey-card .route-point {
            min-width: 0 !important;
            text-align: left !important;
          }

          .flight-journey-card .route-point-arrival {
            border-top: 1px dashed #dbe4ee;
            padding-top: 12px;
          }

          .flight-journey-card .route-middle {
            min-width: 0 !important;
            width: 100% !important;
            gap: 6px !important;
            padding: 8px 0;
          }
        }
      `}</style>
    </section>
  );
}

const emptyTextStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#6b7280",
  fontWeight: 600,
};

const topPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  color: "#1d4ed8",
  fontSize: "12px",
  fontWeight: 800,
};

const durationPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "#ecfdf5",
  border: "1px solid #bbf7d0",
  color: "#166534",
  fontSize: "12px",
  fontWeight: 800,
};

const infoPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  color: "#334155",
  fontSize: "12px",
  fontWeight: 800,
};
