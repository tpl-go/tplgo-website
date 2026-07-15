"use client";

import type { CSSProperties } from "react";

type Props = {
  hotelName: string;
  city: string;
  address?: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children?: number;
  childCount?: number;
  roomName?: string | null;
  specialRequest?: string;
};

function formatDate(value?: string) {
  if (!value) return "On Request";

  const parsed = parseLocalDate(value);
  if (!parsed) return value;

  return parsed.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getNightCount(checkIn?: string, checkOut?: string) {
  if (!checkIn || !checkOut) return 1;

  const start = parseLocalDate(checkIn);
  const end = parseLocalDate(checkOut);
  const diff = start && end ? end.getTime() - start.getTime() : Number.NaN;

  if (Number.isNaN(diff) || diff <= 0) return 1;

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function parseLocalDate(value: string) {
  const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = parts
    ? new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
    : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export default function HotelConfirmationStayCard({
  hotelName,
  city,
  address,
  checkIn,
  checkOut,
  rooms,
  adults,
  children: childrenCount,
  childCount,
  roomName,
  specialRequest,
}: Props) {
  const nights = getNightCount(checkIn, checkOut);
  const normalizedChildCount = childCount ?? childrenCount ?? 0;
  const totalGuests = adults + normalizedChildCount;

  return (
    <section
      className="hotel-confirmation-stay-card"
      style={{
        border: "1px solid #d9e2ec",
        borderRadius: "22px",
        overflow: "hidden",
        background: "#ffffff",
        boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
      }}
    >
      <div
        className="hotel-confirmation-card-title"
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
          Stay Details
        </h3>
      </div>

      <div className="hotel-confirmation-card-body" style={{ padding: "22px" }}>
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
                {hotelName}
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
                {city}
              </div>

              {address ? (
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
                  {address}
                </div>
              ) : null}
            </div>

            <span style={topPillStyle}>Confirmed Stay</span>
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
              <div className="hidden md:block">
                <div
                  className="hotel-confirmation-stay-name"
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
                      Check-In
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
                      {formatDate(checkIn).split(",")[0]}
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
                      Arrival
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
                      {formatDate(checkIn)}
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

                    <div style={{ fontSize: "20px", lineHeight: 1 }}>🏨</div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        fontWeight: 800,
                        textAlign: "center",
                      }}
                    >
                      {nights} Night{nights > 1 ? "s" : ""} Stay
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
                      Check-Out
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
                      {formatDate(checkOut).split(",")[0]}
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
                      Departure
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
                      {formatDate(checkOut)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex w-full min-w-0 flex-col gap-3 overflow-hidden md:hidden">
                <MobileStayDateCard
                  label="Check-In"
                  title={formatDate(checkIn).split(",")[0]}
                  subtitle="Arrival"
                  detail={formatDate(checkIn)}
                />

                <div className="flex w-full min-w-0 items-center justify-center overflow-hidden">
                  <div className="inline-flex max-w-full items-center gap-2 overflow-hidden rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-4 py-2 text-[12px] font-black text-[#1d4ed8] shadow-sm">
                    <span className="shrink-0 leading-none">🏨</span>
                    <span className="min-w-0 break-words whitespace-normal text-center leading-4">
                      {nights} Night{nights > 1 ? "s" : ""} Stay
                    </span>
                  </div>
                </div>

                <MobileStayDateCard
                  label="Check-Out"
                  title={formatDate(checkOut).split(",")[0]}
                  subtitle="Departure"
                  detail={formatDate(checkOut)}
                />
              </div>
            </div>

            <div
              className="hotel-confirmation-chip-row"
              style={{
                marginTop: "14px",
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {roomName ? (
                <span style={infoPillStyle}>Room: {roomName}</span>
              ) : null}

              <span style={infoPillStyle}>
                {rooms} Room{rooms > 1 ? "s" : ""}
              </span>

              <span style={infoPillStyle}>
                {adults} Adult{adults > 1 ? "s" : ""}
              </span>

              {normalizedChildCount > 0 ? (
                <span style={infoPillStyle}>
                  {normalizedChildCount} Child{normalizedChildCount > 1 ? "ren" : ""}
                </span>
              ) : null}

              <span style={infoPillStyle}>
                {totalGuests} Guest{totalGuests > 1 ? "s" : ""}
              </span>
            </div>

            <div
              style={{
                marginTop: "16px",
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "14px",
              }}
            >
              <InfoCard title="Check-In" value={formatDate(checkIn)} />
              <InfoCard title="Check-Out" value={formatDate(checkOut)} />
              <InfoCard
                title="Room Type"
                value={roomName || "Standard Room"}
              />
              <InfoCard
                title="Rooms & Guests"
                value={`${rooms} Room${rooms > 1 ? "s" : ""} • ${totalGuests} Guest${
                  totalGuests > 1 ? "s" : ""
                }`}
              />
            </div>

            <div
              style={{
                marginTop: "14px",
                border: "1px solid #e5e7eb",
                background: "#ffffff",
                borderRadius: "14px",
                padding: "12px 14px",
              }}
            >
              <div
                className="hotel-confirmation-date-grid"
                style={{
                  fontSize: "13px",
                  fontWeight: 900,
                  color: "#111827",
                  lineHeight: "20px",
                }}
              >
                Special Request
              </div>

            <div
              className="hotel-confirmation-info-grid"
              style={{
                  marginTop: "4px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#64748b",
                  lineHeight: "18px",
                }}
              >
                {specialRequest?.trim()
                  ? specialRequest
                  : "No special request added for this booking."}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 767px) {
          .hotel-confirmation-stay-card {
            border-radius: 18px !important;
          }

          .hotel-confirmation-card-title {
            min-height: 52px !important;
            padding: 0 14px !important;
          }

          .hotel-confirmation-card-body {
            padding: 14px !important;
          }

          .hotel-confirmation-stay-name {
            font-size: 19px !important;
            line-height: 26px !important;
          }

          .hotel-confirmation-date-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }

          .hotel-confirmation-date-grid > div {
            min-width: 0 !important;
            width: 100% !important;
            text-align: left !important;
          }

          .hotel-confirmation-date-grid > div:first-child,
          .hotel-confirmation-date-grid > div:last-child {
            border: 1px solid #e5e7eb !important;
            border-radius: 14px !important;
            background: #ffffff !important;
            padding: 12px !important;
          }

          .hotel-confirmation-date-grid > div:first-child > div:nth-child(2),
          .hotel-confirmation-date-grid > div:last-child > div:nth-child(2) {
            font-size: 22px !important;
            line-height: 28px !important;
            white-space: normal !important;
            overflow-wrap: anywhere !important;
          }

          .hotel-confirmation-date-grid > div:first-child > div,
          .hotel-confirmation-date-grid > div:last-child > div {
            max-width: 100% !important;
            white-space: normal !important;
          }

          .hotel-confirmation-date-grid > div:nth-child(2) {
            min-width: 0 !important;
            width: 100% !important;
            align-items: center !important;
            gap: 6px !important;
            border-radius: 14px !important;
            background: #f8fafc !important;
            padding: 10px 12px !important;
          }

          .hotel-confirmation-date-grid > div:nth-child(2) > div:first-child,
          .hotel-confirmation-date-grid > div:nth-child(2) > div:last-child {
            width: 100% !important;
          }

          .hotel-confirmation-info-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }

          .hotel-confirmation-chip-row {
            width: 100% !important;
            min-width: 0 !important;
            gap: 8px !important;
          }

          .hotel-confirmation-chip-row span {
            max-width: 100% !important;
            min-width: 0 !important;
            white-space: normal !important;
            overflow-wrap: anywhere !important;
          }
        }
      `}</style>
    </section>
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

function MobileStayDateCard({
  label,
  title,
  subtitle,
  detail,
}: {
  label: string;
  title: string;
  subtitle: string;
  detail: string;
}) {
  return (
    <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-[0_6px_18px_rgba(15,23,42,0.05)]">
      <div className="break-words text-[12px] font-black uppercase leading-4 tracking-[0.12em] text-[#64748b]">
        {label}
      </div>

      <div className="mt-2 min-w-0 break-words text-[22px] font-black leading-7 text-[#0f172a]">
        {title}
      </div>

      <div className="mt-2 min-w-0 break-words text-[15px] font-black leading-5 text-[#111827]">
        {subtitle}
      </div>

      <div className="mt-1 min-w-0 break-words whitespace-normal text-[13px] font-bold leading-5 text-[#475569]">
        {detail}
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
