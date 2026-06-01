"use client";

import type { CSSProperties } from "react";

type Props = {
  trainName: string;
  trainNumber?: string;
  route?: string;
  boardingStation?: string;
  destinationStation?: string;
  journeyDate?: string;
  departureTime?: string;
  arrivalTime?: string;
  coachClass?: string;
  quota?: string;
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

export default function TrainConfirmationJourneyCard({
  trainName,
  trainNumber,
  route,
  boardingStation,
  destinationStation,
  journeyDate,
  departureTime,
  arrivalTime,
  coachClass,
  quota,
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

      <div className="p-4 md:p-[22px]">
        <div className="md:hidden">
          <div className="overflow-hidden rounded-[20px] border border-[#dbe4ee] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.06)]">
            <div className="border-b border-[#e5e7eb] bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_100%)] p-4">
              <div className="min-w-0">
                <div className="break-words text-[19px] font-black leading-6 text-[#111827]">
                  {trainName}
                </div>
                {trainNumber ? (
                  <div className="mt-1 text-[13px] font-extrabold text-[#64748b]">
                    Train No. {trainNumber}
                  </div>
                ) : null}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-[#15803d]">
                  Confirmed
                </span>
                {coachClass ? (
                  <span className="rounded-full border border-[#dbeafe] bg-[#eff6ff] px-3 py-1.5 text-[11px] font-black text-[#1d4ed8]">
                    {coachClass}
                  </span>
                ) : null}
                {quota ? (
                  <span className="rounded-full border border-[#e5e7eb] bg-[#f8fafc] px-3 py-1.5 text-[11px] font-black text-[#475569]">
                    {quota}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="p-4">
              <div className="rounded-2xl border border-[#dbeafe] bg-[#f8fbff] px-4 py-3">
                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#64748b]">
                  Route
                </div>
                <div className="mt-1 break-words text-[15px] font-black leading-5 text-[#111827]">
                  {boardingStation || "Boarding"} →{" "}
                  {destinationStation || "Destination"}
                </div>
                {route ? (
                  <div className="mt-1 break-words text-[12px] font-bold leading-4 text-[#2563eb]">
                    {route}
                  </div>
                ) : null}
              </div>

              <div className="my-4 flex items-center gap-3 text-[#64748b]">
                <div className="h-px flex-1 bg-[#dbe4ee]" />
                <div className="rounded-full border border-[#dbeafe] bg-white px-3 py-1 text-[11px] font-black">
                  Train Journey
                </div>
                <div className="h-px flex-1 bg-[#dbe4ee]" />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <MobileTimeCard
                  label="Departure"
                  time={departureTime || "--:--"}
                  station={boardingStation || "Boarding"}
                  date={formatDate(journeyDate)}
                />
                <MobileTimeCard
                  label="Arrival"
                  time={arrivalTime || "--:--"}
                  station={destinationStation || "Destination"}
                  date={formatDate(journeyDate)}
                  alignRight
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <MobileMiniCard label="Journey Date" value={formatDate(journeyDate)} />
                <MobileMiniCard label="Train Number" value={trainNumber || "N/A"} />
              </div>
            </div>
          </div>
        </div>

        <div
          className="hidden md:block"
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
                  fontSize: "clamp(18px, 5vw, 22px)",
                  fontWeight: 900,
                  color: "#111827",
                  lineHeight: "30px",
                  wordBreak: "break-word",
                }}
              >
                {trainName}
                {trainNumber ? ` (${trainNumber})` : ""}
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
                {route || "Train Journey"}
              </div>
            </div>

            <span style={topPillStyle}>Confirmed Journey</span>
          </div>

          <div style={{ padding: "18px" }}>
            <div
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
                  gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)",
                  gap: "14px",
                  alignItems: "center",
                }}
              >
                <div style={{ minWidth: 0 }}>
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
                      fontSize: "clamp(22px, 7vw, 28px)",
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
                      fontSize: "clamp(14px, 4.5vw, 18px)",
                      fontWeight: 900,
                      color: "#111827",
                      lineHeight: "24px",
                      wordBreak: "break-word",
                    }}
                  >
                    {boardingStation || "Boarding"}
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
                    {formatDate(journeyDate)}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    minWidth: "72px",
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

                  <div style={{ fontSize: "20px", lineHeight: 1 }}>🚆</div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: 800,
                      textAlign: "center",
                    }}
                  >
                    Train Journey
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

                <div style={{ textAlign: "right", minWidth: 0 }}>
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
                      fontSize: "clamp(22px, 7vw, 28px)",
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
                      fontSize: "clamp(14px, 4.5vw, 18px)",
                      fontWeight: 900,
                      color: "#111827",
                      lineHeight: "24px",
                      wordBreak: "break-word",
                    }}
                  >
                    {destinationStation || "Destination"}
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
                    {formatDate(journeyDate)}
                  </div>
                </div>
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
              {coachClass ? (
                <span style={infoPillStyle}>Class: {coachClass}</span>
              ) : null}
              {quota ? <span style={infoPillStyle}>Quota: {quota}</span> : null}
              {route ? <span style={infoPillStyle}>{route}</span> : null}
              {journeyDate ? (
                <span style={infoPillStyle}>Journey: {formatDate(journeyDate)}</span>
              ) : null}
            </div>

            <div
              style={{
                marginTop: "16px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "14px",
              }}
            >
              <InfoCard title="Journey Date" value={formatDate(journeyDate)} />
              <InfoCard title="Train Number" value={trainNumber || "N/A"} />
              <InfoCard
                title="Boarding Station"
                value={boardingStation || "Not available"}
              />
              <InfoCard
                title="Destination Station"
                value={destinationStation || "Not available"}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileTimeCard({
  label,
  time,
  station,
  date,
  alignRight = false,
}: {
  label: string;
  time: string;
  station: string;
  date: string;
  alignRight?: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-[#e5e7eb] bg-white p-4 ${alignRight ? "sm:text-right" : ""}`}>
      <div className="text-[11px] font-black uppercase tracking-[0.14em] text-[#64748b]">
        {label}
      </div>
      <div className="mt-2 text-[25px] font-black leading-7 text-[#0f172a]">
        {time}
      </div>
      <div className="mt-2 break-words text-[14px] font-black leading-5 text-[#111827]">
        {station}
      </div>
      <div className="mt-1 break-words text-[12px] font-bold leading-4 text-[#64748b]">
        {date}
      </div>
    </div>
  );
}

function MobileMiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] px-3 py-3">
      <div className="text-[10px] font-black uppercase tracking-[0.12em] text-[#64748b]">
        {label}
      </div>
      <div className="mt-1 break-words text-[12px] font-black leading-4 text-[#111827]">
        {value}
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
