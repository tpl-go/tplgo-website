"use client";

import type { CSSProperties } from "react";

type Props = {
  bookingId: string;
  homestayName: string;
  city?: string;
  address?: string;
  bookingStatus?: "confirmed" | "pending" | "failed";
  paymentStatus?: "paid" | "pending" | "failed";
  bookedAt?: string | null;
  roomName?: string | null;
  roomCount?: number;
  checkIn?: string | null;
  checkOut?: string | null;
  nights?: number;
  earnedOnThisBooking?: number;
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

function formatDate(value?: string | null) {
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

function parseLocalDate(value: string) {
  const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = parts
    ? new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
    : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export default function HomestayConfirmationSuccessHeader({
  bookingId,
  homestayName,
  city,
  address,
  bookingStatus = "confirmed",
  paymentStatus = "paid",
  bookedAt,
  roomName,
  roomCount = 1,
  checkIn,
  checkOut,
  nights,
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
      className="homestay-confirmation-success"
      style={{
        border: "1px solid #d9e2ec",
        borderRadius: "24px",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #eef6ff 0%, #f8fafc 45%, #ffffff 100%)",
        boxShadow: "0 14px 40px rgba(15,23,42,0.08)",
      }}
    >
      <div
        className="homestay-confirmation-success-pad"
        style={{
          padding: "28px 26px 24px 26px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="homestay-confirmation-success-layout"
          style={{
            position: "absolute",
            top: "-42px",
            right: "-42px",
            width: "180px",
            height: "180px",
            borderRadius: "999px",
            background: "rgba(37,99,235,0.08)",
            filter: "blur(2px)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "-36px",
            left: "-16px",
            width: "130px",
            height: "130px",
            borderRadius: "999px",
            background: "rgba(14,165,233,0.08)",
            filter: "blur(2px)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 15px",
                borderRadius: "999px",
                background: "#ecfdf5",
                border: "1px solid #bbf7d0",
                color: "#166534",
                fontSize: "13px",
                fontWeight: 900,
                boxShadow: "0 4px 12px rgba(22,101,52,0.08)",
              }}
            >
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "999px",
                  background: "#16a34a",
                  color: "#ffffff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                ✓
              </span>
              Success
            </div>

            <h1
              className="homestay-confirmation-success-title"
              style={{
                margin: "16px 0 0 0",
                fontSize: "34px",
                lineHeight: "42px",
                fontWeight: 900,
                color: "#0f172a",
                letterSpacing: "-0.6px",
              }}
            >
              {bookingStatusText}
            </h1>

            <div
              className="homestay-confirmation-success-copy"
              style={{
                marginTop: "12px",
                fontSize: "16px",
                lineHeight: "27px",
                color: "#475569",
                fontWeight: 500,
                maxWidth: "860px",
              }}
            >
              Your homestay reservation has been successfully created. Keep your
              booking ID handy for voucher download, print, support and future
              booking retrieval.
            </div>

            <div
              className="homestay-confirmation-property-title"
              style={{
                marginTop: "22px",
                fontSize: "28px",
                lineHeight: "36px",
                fontWeight: 900,
                color: "#111827",
                maxWidth: "900px",
                letterSpacing: "-0.4px",
              }}
            >
              {homestayName}
            </div>

            {address ? (
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "14px",
                  lineHeight: "22px",
                  fontWeight: 700,
                  color: "#475569",
                  maxWidth: "860px",
                }}
              >
                {address}
              </div>
            ) : null}

            <div
              style={{
                marginTop: "12px",
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {city ? <span style={neutralPillStyle}>{city}</span> : null}

              {roomName ? (
                <span style={neutralPillStyle}>
                  {roomName}
                  {roomCount > 1 ? ` • ${roomCount} Rooms` : ""}
                </span>
              ) : null}

              {checkIn ? (
                <span style={neutralPillStyle}>
                  Check-in: {formatDate(checkIn)}
                </span>
              ) : null}

              {checkOut ? (
                <span style={neutralPillStyle}>
                  Check-out: {formatDate(checkOut)}
                </span>
              ) : null}

              {typeof nights === "number" ? (
                <span style={neutralPillStyle}>
                  {nights} Night{nights > 1 ? "s" : ""}
                </span>
              ) : null}
            </div>
          </div>

          <div
            className="homestay-confirmation-booking-card"
            style={{
              minWidth: "320px",
              maxWidth: "100%",
              border: "1px solid #dbe4ee",
              borderRadius: "22px",
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(10px)",
              padding: "20px 20px 18px 20px",
              boxShadow: "0 10px 26px rgba(15,23,42,0.06)",
            }}
          >
            <div
              className="homestay-confirmation-booking-id"
              style={{
                fontSize: "11px",
                fontWeight: 900,
                color: "#64748b",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              Booking ID
            </div>

            <div
              style={{
                fontSize: "28px",
                fontWeight: 900,
                color: "#0f172a",
                letterSpacing: "0.3px",
                wordBreak: "break-word",
                lineHeight: "34px",
              }}
            >
              {bookingId}
            </div>

            <div
              style={{
                marginTop: "16px",
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <span
                style={{
                  ...statusPillBase,
                  ...bookingStatusStyle,
                }}
              >
                {bookingStatusText}
              </span>

              <span
                style={{
                  ...statusPillBase,
                  ...paymentStatusStyle,
                }}
              >
                {paymentStatusText}
              </span>
            </div>

            <div
              style={{
                marginTop: "16px",
                paddingTop: "14px",
                borderTop: "1px dashed #d1d5db",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                Booked On
              </div>

              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#1f2937",
                  lineHeight: "22px",
                }}
              >
                {formatDateTime(bookedAt)}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 767px) {
          .homestay-confirmation-success {
            border-radius: 18px !important;
          }

          .homestay-confirmation-success-pad {
            padding: 18px 14px !important;
          }

          .homestay-confirmation-success-layout {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }

          .homestay-confirmation-success-title {
            font-size: 26px !important;
            line-height: 32px !important;
            letter-spacing: 0 !important;
          }

          .homestay-confirmation-success-copy {
            font-size: 13px !important;
            line-height: 21px !important;
          }

          .homestay-confirmation-property-title {
            font-size: 21px !important;
            line-height: 28px !important;
            letter-spacing: 0 !important;
          }

          .homestay-confirmation-booking-card {
            min-width: 0 !important;
            width: 100% !important;
            padding: 16px !important;
            border-radius: 18px !important;
          }

          .homestay-confirmation-booking-id {
            font-size: 22px !important;
            line-height: 28px !important;
          }
        }
      `}</style>
    </section>
  );
}

const statusPillBase: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 900,
};

const neutralPillStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 13px",
  borderRadius: "999px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  color: "#334155",
  fontSize: "12px",
  fontWeight: 800,
};
