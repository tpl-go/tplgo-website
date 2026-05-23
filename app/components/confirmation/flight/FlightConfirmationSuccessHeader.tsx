"use client";

type Props = {
  bookingId: string;
  bookingStatus?: "confirmed" | "pending" | "failed";
  paymentStatus?: "paid" | "pending" | "failed";
  bookedAt?: string | null;

  bookingType?: "oneWay" | "roundTrip" | "multiCity";
  tripMode?: "domestic" | "international";
  cabinClass?: string;

  airlineSummary?: string | null;
  routeTitle?: string | null;
  journeyDateLabel?: string | null;
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

export default function FlightConfirmationSuccessHeader({
  bookingId,
  bookingStatus = "confirmed",
  paymentStatus = "paid",
  bookedAt,
  bookingType = "oneWay",
  tripMode = "domestic",
  cabinClass,
  airlineSummary,
  routeTitle,
  journeyDateLabel,
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
      <div
        style={{
          padding: "28px 26px 24px 26px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
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
              style={{
                marginTop: "12px",
                fontSize: "16px",
                lineHeight: "27px",
                color: "#475569",
                fontWeight: 500,
                maxWidth: "860px",
              }}
            >
              Your flight booking has been successfully created. Keep your
              booking ID handy for ticket download, print, support and future
              booking retrieval.
            </div>

            {routeTitle ? (
              <div
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
                {routeTitle}
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
              {airlineSummary ? (
                <span style={neutralPillStyle}>{airlineSummary}</span>
              ) : null}

              {journeyDateLabel ? (
                <span style={neutralPillStyle}>
                  Journey: {journeyDateLabel}
                </span>
              ) : null}

              <span style={neutralPillStyle}>
                {bookingType === "roundTrip"
                  ? "Round Trip"
                  : bookingType === "multiCity"
                  ? "Multi City"
                  : "One Way"}
              </span>

              <span style={neutralPillStyle}>
                {tripMode === "international" ? "International" : "Domestic"}
              </span>

              {cabinClass ? (
                <span style={neutralPillStyle}>{cabinClass}</span>
              ) : null}
            </div>
          </div>

          <div
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
    </section>
  );
}

const statusPillBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 900,
};

const neutralPillStyle: React.CSSProperties = {
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