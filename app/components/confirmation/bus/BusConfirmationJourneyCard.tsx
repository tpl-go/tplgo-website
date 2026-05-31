"use client";

import type { CSSProperties } from "react";

type Point = {
  name?: string;
  address?: string;
  time?: string;
};

type Props = {
  busName: string;
  operatorName?: string;
  busType?: string;
  fromCity: string;
  toCity: string;
  fromPoint?: string;
  toPoint?: string;
  travelDate?: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  boardingPoint?: Point;
  droppingPoint?: Point;
};

function formatDate(value?: string) {
  if (!value) return "On Request";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function BusConfirmationJourneyCard({
  busName,
  operatorName,
  busType,
  fromCity,
  toCity,
  fromPoint,
  toPoint,
  travelDate,
  departureTime,
  arrivalTime,
  duration,
  boardingPoint,
  droppingPoint,
}: Props) {
  return (
    <section
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
          Journey Details
        </h3>
      </div>

      <div style={{ padding: "22px" }}>
        <div
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
              background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 900,
                  color: "#111827",
                  lineHeight: "30px",
                }}
              >
                {busName}
              </div>

              <div
                style={{
                  marginTop: "6px",
                  fontSize: "14px",
                  color: "#2563eb",
                  fontWeight: 800,
                  lineHeight: "22px",
                }}
              >
                {[operatorName, busType].filter(Boolean).join(" • ")}
              </div>

              {(boardingPoint?.address || droppingPoint?.address) && (
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "13px",
                    color: "#64748b",
                    fontWeight: 700,
                    lineHeight: "20px",
                    maxWidth: "780px",
                  }}
                >
                  {boardingPoint?.address || droppingPoint?.address}
                </div>
              )}
            </div>

            <span style={topPillStyle}>Confirmed Journey</span>
          </div>

          <div className="bus-confirmation-journey-body" style={{ padding: "18px" }}>
            <div
              className="hidden md:block"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "18px",
                background:
                  "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
                padding: "16px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  gap: "14px",
                  alignItems: "center",
                }}
              >
                <div>
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
                    {departureTime || "--:--"}
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
                    {fromCity}
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
                    {fromPoint || boardingPoint?.name || "Boarding Point"}
                  </div>
                </div>

                <div
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

                  <div style={{ fontSize: "20px", lineHeight: 1 }}>🚌</div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: 800,
                      textAlign: "center",
                    }}
                  >
                    {duration || "Bus Journey"}
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

                <div style={{ textAlign: "right" }}>
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
                    {arrivalTime || "--:--"}
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
                    {toCity}
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
                    {toPoint || droppingPoint?.name || "Dropping Point"}
                  </div>
                </div>
              </div>
            </div>

            <div className="md:hidden">
              <div className="rounded-[18px] border border-[#e5e7eb] bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_100%)] p-4">
                <MobileTimelineCard
                  label="Departure"
                  time={departureTime || "--:--"}
                  city={fromCity}
                  point={fromPoint || boardingPoint?.name || "Boarding Point"}
                />

                <div className="my-3 flex justify-center">
                  <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-3 py-2 text-center text-[12px] font-extrabold text-[#1d4ed8]">
                    <span>🚌</span>
                    <span className="break-words">{duration || "Bus Journey"}</span>
                  </div>
                </div>

                <MobileTimelineCard
                  label="Arrival"
                  time={arrivalTime || "--:--"}
                  city={toCity}
                  point={toPoint || droppingPoint?.name || "Dropping Point"}
                />
              </div>
            </div>

            <div
              style={{
                marginTop: "14px",
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {busType ? <span style={infoPillStyle}>{busType}</span> : null}
              {travelDate ? (
                <span style={infoPillStyle}>Journey: {formatDate(travelDate)}</span>
              ) : null}
              {boardingPoint?.name ? (
                <span style={infoPillStyle}>
                  Boarding: {boardingPoint.name}
                </span>
              ) : null}
              {droppingPoint?.name ? (
                <span style={infoPillStyle}>
                  Dropping: {droppingPoint.name}
                </span>
              ) : null}
            </div>

            <div
              className="bus-confirmation-info-grid"
              style={{
                marginTop: "16px",
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "14px",
              }}
            >
              <InfoCard title="Travel Date" value={formatDate(travelDate)} />
              <InfoCard title="Duration" value={duration || "On route"} />
              <InfoCard
                title="Boarding Point"
                value={boardingPoint?.name || fromPoint || "Not available"}
              />
              <InfoCard
                title="Dropping Point"
                value={droppingPoint?.name || toPoint || "Not available"}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 767px) {
          .bus-confirmation-journey-body {
            padding: 14px !important;
          }

          .bus-confirmation-info-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

function MobileTimelineCard({
  label,
  time,
  city,
  point,
}: {
  label: string;
  time: string;
  city: string;
  point: string;
}) {
  return (
    <div className="w-full min-w-0 rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-[0_4px_14px_rgba(15,23,42,0.04)]">
      <div className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#64748b]">
        {label}
      </div>
      <div className="mt-2 break-words text-[28px] font-black leading-[30px] text-[#0f172a]">
        {time}
      </div>
      <div className="mt-2 break-words text-[18px] font-black leading-[24px] text-[#111827]">
        {city}
      </div>
      <div className="mt-1 break-words text-[12px] font-bold leading-[18px] text-[#64748b]">
        {point}
      </div>
    </div>
  );
}

function InfoCard({
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
        borderRadius: "16px",
        background: "#ffffff",
        padding: "14px",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 800,
          color: "#64748b",
          marginBottom: "6px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "15px",
          fontWeight: 900,
          color: "#111827",
          lineHeight: "22px",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

const topPillStyle: CSSProperties = {
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

const infoPillStyle: CSSProperties = {
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
