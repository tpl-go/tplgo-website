"use client";

import type { CSSProperties } from "react";

type Props = {
  homestayName: string;
  city: string;
  address?: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children?: number;
  roomName?: string | null;
  specialRequest?: string;
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

function getNightCount(checkIn?: string, checkOut?: string) {
  if (!checkIn || !checkOut) return 1;

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();

  if (Number.isNaN(diff) || diff <= 0) return 1;

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function HomestayConfirmationStayCard({
  homestayName,
  city,
  address,
  checkIn,
  checkOut,
  rooms,
  adults,
  children = 0,
  roomName,
  specialRequest,
}: Props) {
  const nights = getNightCount(checkIn, checkOut);
  const totalGuests = adults + children;

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
          Stay Details
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
                {homestayName}
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

                  <div style={{ fontSize: "20px", lineHeight: 1 }}>🏡</div>

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

            <div
              style={{
                marginTop: "14px",
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {roomName ? (
                <span style={infoPillStyle}>Stay: {roomName}</span>
              ) : null}

              <span style={infoPillStyle}>
                {rooms} Room{rooms > 1 ? "s" : ""}
              </span>

              <span style={infoPillStyle}>
                {adults} Adult{adults > 1 ? "s" : ""}
              </span>

              {children > 0 ? (
                <span style={infoPillStyle}>
                  {children} Child{children > 1 ? "ren" : ""}
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
              <InfoCard title="Stay Type" value={roomName || "Homestay"} />
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