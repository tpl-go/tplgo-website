"use client";

import { useAuth } from "@/app/hooks/useAuth";

type Props = {
  bookingId: string;
  email?: string;
  mobile?: string;

  onDownloadPDF?: () => void;
  onSendEmail?: () => void;
  onSendWhatsApp?: () => void;
  onPrint?: () => void;
  onGoToBookings?: () => void;
  onGoHome?: () => void;
};

export default function CruiseConfirmationActionsCard({
  bookingId,
  email,
  mobile,
  onDownloadPDF,
  onSendEmail,
  onSendWhatsApp,
  onPrint,
  onGoToBookings,
  onGoHome,
}: Props) {
  const { isAuthenticated, openLoginModal } = useAuth();

  const handleMyBookingsClick = () => {
    if (isAuthenticated) {
      onGoToBookings?.();
      return;
    }

    openLoginModal({
      accountType: "personal",
      intent: "booking",
    });

    setTimeout(() => {
      alert("Please login with the same mobile number used for booking");
    }, 300);
  };

  return (
    <aside
      style={{
        width: "100%",
        display: "flex",
      }}
    >
      <div
        style={{
          width: "100%",
          position: "sticky",
          top: "96px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* BOOKING REF CARD */}
        <div
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
              minHeight: "56px",
              padding: "0 18px",
              borderBottom: "1px solid #e5e7eb",
              background: "linear-gradient(180deg, #fffdf4 0%, #ffffff 100%)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "17px",
                fontWeight: 900,
                color: "#111827",
              }}
            >
              Booking Reference
            </h3>
          </div>

          <div style={{ padding: "18px" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 900,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.7px",
              }}
            >
              Booking ID
            </div>

            <div
              style={{
                marginTop: "8px",
                fontSize: "24px",
                fontWeight: 900,
                color: "#0f172a",
                lineHeight: "30px",
                wordBreak: "break-word",
              }}
            >
              {bookingId}
            </div>

            {(email || mobile) && (
              <div
                style={{
                  marginTop: "16px",
                  paddingTop: "14px",
                  borderTop: "1px dashed #d1d5db",
                  display: "grid",
                  gap: "10px",
                }}
              >
                {email ? (
                  <div>
                    <div style={miniLabelStyle}>Email</div>
                    <div style={miniValueStyle}>{email}</div>
                  </div>
                ) : null}

                {mobile ? (
                  <div>
                    <div style={miniLabelStyle}>Mobile</div>
                    <div style={miniValueStyle}>{mobile}</div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* ACTIONS CARD */}
        <div
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
              minHeight: "56px",
              padding: "0 18px",
              borderBottom: "1px solid #e5e7eb",
              background: "linear-gradient(180deg, #eef6ff 0%, #ffffff 100%)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "17px",
                fontWeight: 900,
                color: "#111827",
              }}
            >
              Quick Actions
            </h3>
          </div>

          <div
            style={{
              padding: "18px",
              display: "grid",
              gap: "12px",
            }}
          >
            <PrimaryActionButton
              label="Download Ticket PDF"
              icon="⬇️"
              onClick={onDownloadPDF}
            />

            <PrimaryActionButton
              label="Print Ticket"
              icon="🖨️"
              onClick={onPrint}
            />

            <SecondaryActionButton
              label="Share on WhatsApp"
              icon="💬"
              onClick={onSendWhatsApp}
            />

            <SecondaryActionButton
              label="Send by Email"
              icon="✉️"
              onClick={onSendEmail}
            />

            <SecondaryActionButton
              label="Go to My Bookings"
              icon="📁"
              onClick={handleMyBookingsClick}
            />

            <SecondaryActionButton
              label="Back to Home"
              icon="🏠"
              onClick={onGoHome || (() => (window.location.href = "/"))}
            />
          </div>
        </div>

        {/* SUPPORT NOTE */}
        <div
          style={{
            border: "1px solid #d9e2ec",
            borderRadius: "18px",
            background: "#ffffff",
            padding: "16px",
            boxShadow: "0 4px 14px rgba(15,23,42,0.04)",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: 900,
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            Need Help?
          </div>

          <div
            style={{
              fontSize: "13px",
              lineHeight: "21px",
              color: "#475569",
              fontWeight: 600,
            }}
          >
            Keep your booking ID ready while printing, downloading ticket,
            contacting support, or retrieving this booking later.
          </div>
        </div>
      </div>
    </aside>
  );
}

function PrimaryActionButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        minHeight: "48px",
        border: "none",
        borderRadius: "14px",
        background: "#111827",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: 900,
        cursor: "pointer",
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        boxShadow: "0 10px 24px rgba(17,24,39,0.16)",
      }}
    >
      <span style={{ fontSize: "16px" }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function SecondaryActionButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        minHeight: "46px",
        border: "1px solid #d9e2ec",
        borderRadius: "14px",
        background: "#ffffff",
        color: "#111827",
        fontSize: "14px",
        fontWeight: 800,
        cursor: "pointer",
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
      }}
    >
      <span style={{ fontSize: "15px" }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

const miniLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 800,
  color: "#64748b",
  marginBottom: "4px",
};

const miniValueStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 800,
  color: "#1f2937",
  lineHeight: "20px",
  wordBreak: "break-word",
};