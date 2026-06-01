"use client";

import type { CSSProperties } from "react";

type Props = {
  bookingId: string;
  pnrNumber?: string; // ✅ ADD THIS
  trainName: string;
  trainNumber?: string;
  route?: string;
  boardingStation?: string;
  destinationStation?: string;
  journeyDate?: string | null;
  bookingStatus?: "confirmed" | "pending" | "failed";
  paymentStatus?: "paid" | "pending" | "failed";
  bookedAt?: string | null;
};

function formatDateTime(value?: string | null) {
  if (!value) return "Just now";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TrainConfirmationSuccessHeader({
  bookingId,
  pnrNumber, // ✅ USE HERE
  trainName,
  trainNumber,
  route,
  boardingStation,
  destinationStation,
  journeyDate,
  bookingStatus = "confirmed",
  paymentStatus = "paid",
  bookedAt,
}: Props) {
  const bookingStatusText =
    bookingStatus === "confirmed"
      ? "Booking Confirmed"
      : bookingStatus === "pending"
      ? "Booking Pending"
      : "Booking Failed";

  const paymentStatusText =
    paymentStatus === "paid"
      ? "Payment Successful"
      : paymentStatus === "pending"
      ? "Payment Pending"
      : "Payment Failed";

  const bookingStatusStyle =
    bookingStatus === "confirmed"
      ? {
          background: "#dcfce7",
          color: "#166534",
          border: "1px solid #bbf7d0",
        }
      : bookingStatus === "pending"
      ? {
          background: "#fef3c7",
          color: "#92400e",
          border: "1px solid #fde68a",
        }
      : {
          background: "#fee2e2",
          color: "#b91c1c",
          border: "1px solid #fecaca",
        };

  const paymentStatusStyle =
    paymentStatus === "paid"
      ? {
          background: "#dbeafe",
          color: "#1d4ed8",
          border: "1px solid #bfdbfe",
        }
      : paymentStatus === "pending"
      ? {
          background: "#fef3c7",
          color: "#92400e",
          border: "1px solid #fde68a",
        }
      : {
          background: "#fee2e2",
          color: "#b91c1c",
          border: "1px solid #fecaca",
        };

  return (
    <section
      style={{
        border: "1px solid #d9e2ec",
        borderRadius: "24px",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #eef6ff 0%, #f8fafc 45%, #ffffff 100%)",
        boxShadow: "0 14px 40px rgba(15,23,42,0.08)",
      }}
    >
      <div style={{ padding: "28px 26px 24px 26px", position: "relative" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {/* LEFT */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1
              style={{
                fontSize: "clamp(26px, 8vw, 34px)",
                fontWeight: 900,
                color: "#0f172a",
                lineHeight: 1.1,
                wordBreak: "break-word",
              }}
            >
              {bookingStatusText}
            </h1>

            <div style={{ marginTop: "12px", color: "#475569" }}>
              Your train reservation has been successfully created.
            </div>

            <div
              style={{
                marginTop: "22px",
                fontSize: "clamp(21px, 6vw, 28px)",
                fontWeight: 900,
                color: "#111827",
                lineHeight: 1.15,
                wordBreak: "break-word",
              }}
            >
              {trainName}
              {trainNumber ? ` (${trainNumber})` : ""}
            </div>

            <div style={{ marginTop: "12px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {route && <span style={neutralPillStyle}>{route}</span>}
              {journeyDate && (
                <span style={neutralPillStyle}>Journey: {journeyDate}</span>
              )}
              {boardingStation && (
                <span style={neutralPillStyle}>Boarding: {boardingStation}</span>
              )}
              {destinationStation && (
                <span style={neutralPillStyle}>Destination: {destinationStation}</span>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div style={rightCard}>
            <div style={label}>Booking ID</div>
            <div style={value}>{bookingId}</div>

            {/* ✅ PNR BLOCK ADDED */}
            {pnrNumber && (
              <div style={pnrBlock}>
                <div style={label}>PNR Number</div>
                <div style={pnrValue}>{pnrNumber}</div>
              </div>
            )}

            <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ ...statusPillBase, ...bookingStatusStyle }}>
                {bookingStatusText}
              </span>
              <span style={{ ...statusPillBase, ...paymentStatusStyle }}>
                {paymentStatusText}
              </span>
            </div>

            <div style={{ marginTop: "16px" }}>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                Booked On
              </div>
              <div style={{ fontWeight: 800 }}>
                {formatDateTime(bookedAt)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* styles */
const rightCard: CSSProperties = {
  minWidth: "320px",
  maxWidth: "100%",
  border: "1px solid #dbe4ee",
  borderRadius: "22px",
  background: "#fff",
  padding: "20px",
};

const label: CSSProperties = {
  fontSize: "11px",
  fontWeight: 900,
  color: "#64748b",
  textTransform: "uppercase",
};

const value: CSSProperties = {
  fontSize: "clamp(22px, 7vw, 28px)",
  fontWeight: 900,
  wordBreak: "break-word",
};

const pnrBlock: CSSProperties = {
  marginTop: "14px",
  paddingTop: "12px",
  borderTop: "1px dashed #d1d5db",
};

const pnrValue: CSSProperties = {
  fontSize: "clamp(19px, 6vw, 22px)",
  fontWeight: 900,
  color: "#111827",
  wordBreak: "break-word",
};

const statusPillBase: CSSProperties = {
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 900,
};

const neutralPillStyle: CSSProperties = {
  padding: "8px 13px",
  borderRadius: "999px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  fontSize: "12px",
  fontWeight: 800,
};
