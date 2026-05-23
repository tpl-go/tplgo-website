"use client";

type PackageConfirmationActionsCardProps = {
  bookingId?: string;
  paymentId?: string;
  invoiceNumber?: string;
  email?: string;
  mobile?: string;
  supportNumber?: string;

  onDownloadTicket?: () => void;
  onDownloadInvoice?: () => void;
  onPrintTicket?: () => void;
  onShareWhatsApp?: () => void;
  onSendEmail?: () => void;
  onGoToMyBookings?: () => void;
  onGoHome?: () => void;
};

export default function PackageConfirmationActionsCard({
  bookingId = "TPL-PKG-BOOKING",
  paymentId = "TPL-PAYMENT-ID",
  invoiceNumber = "TPL-INV-001",
  email,
  mobile,
  supportNumber = "+91 99999 99999",
  onDownloadTicket,
  onDownloadInvoice,
  onPrintTicket,
  onShareWhatsApp,
  onSendEmail,
  onGoToMyBookings,
  onGoHome,
}: PackageConfirmationActionsCardProps) {
  return (
    <aside
      style={{
        width: "100%",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: "96px",
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* MAIN ACTIONS */}
        <div
          style={{
            border: "1px solid #d9e2ec",
            background: "#ffffff",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(15,23,42,0.05)",
          }}
        >
          <div
            style={{
              padding: "18px 18px 14px 18px",
              borderBottom: "1px solid #e5e7eb",
              background: "linear-gradient(90deg, #eef6ff 0%, #ffffff 55%, #fff7ed 100%)",
            }}
          >
            <div
              style={{
                fontSize: "20px",
                fontWeight: 900,
                color: "#111827",
              }}
            >
              Booking Actions
            </div>

            <div
              style={{
                marginTop: "6px",
                fontSize: "13px",
                lineHeight: "20px",
                color: "#6b7280",
                fontWeight: 500,
              }}
            >
              Download, print, share and manage your package booking instantly
            </div>
          </div>

          <div
            style={{
              padding: "16px",
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "12px",
            }}
          >
            <ActionButton
              label="Download Package Ticket"
              sublabel="Get booking ticket / travel summary"
              onClick={onDownloadTicket}
              variant="primary"
            />

            <ActionButton
              label="Download Invoice"
              sublabel="Get payment invoice / bill copy"
              onClick={onDownloadInvoice}
              variant="secondary"
            />

            <ActionButton
              label="Print Booking"
              sublabel="Print your package booking details"
              onClick={onPrintTicket}
              variant="secondary"
            />

            <ActionButton
              label="Share on WhatsApp"
              sublabel="Send booking details on WhatsApp"
              onClick={onShareWhatsApp}
              variant="secondary"
            />

            <ActionButton
              label="Send to Email"
              sublabel="Mail booking copy to traveller"
              onClick={onSendEmail}
              variant="secondary"
            />
          </div>
        </div>

        {/* QUICK BOOKING META */}
        <div
          style={{
            border: "1px solid #d9e2ec",
            background: "#ffffff",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #e5e7eb",
              background: "#f8fbff",
              fontSize: "15px",
              fontWeight: 800,
              color: "#111827",
            }}
          >
            Quick Reference
          </div>

          <div style={{ padding: "16px" }}>
            <MetaRow label="Booking ID" value={bookingId} />
            <MetaRow label="Payment ID" value={paymentId} />
            <MetaRow label="Invoice No." value={invoiceNumber} />
            <MetaRow label="Email" value={email || "Not available"} />
            <MetaRow label="Mobile" value={mobile || "Not available"} />
          </div>
        </div>

        {/* SUPPORT CARD */}
        <div
          style={{
            border: "1px solid #dbeafe",
            background: "#f8fbff",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
          }}
        >
          <div
            style={{
              padding: "16px",
            }}
          >
            <div
              style={{
                fontSize: "16px",
                fontWeight: 900,
                color: "#111827",
              }}
            >
              Need Help?
            </div>

            <div
              style={{
                marginTop: "6px",
                fontSize: "13px",
                lineHeight: "20px",
                color: "#4b5563",
                fontWeight: 500,
              }}
            >
              For package changes, cancellation help, vouchers or invoice support,
              contact our team.
            </div>

            <div
              style={{
                marginTop: "12px",
                fontSize: "14px",
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              Support: {supportNumber}
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <div
          style={{
            border: "1px solid #d9e2ec",
            background: "#ffffff",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
          }}
        >
          <div
            style={{
              padding: "16px",
              display: "grid",
              gap: "10px",
            }}
          >
            <ActionButton
              label="Go to My Bookings"
              sublabel="View all confirmed bookings"
              onClick={onGoToMyBookings}
              variant="secondary"
            />

            <ActionButton
              label="Back to Home"
              sublabel="Return to homepage"
              onClick={onGoHome}
              variant="ghost"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

function ActionButton({
  label,
  sublabel,
  onClick,
  variant,
}: {
  label: string;
  sublabel?: string;
  onClick?: () => void;
  variant: "primary" | "secondary" | "ghost";
}) {
  const styles =
    variant === "primary"
      ? {
          background: "#ef4444",
          color: "#ffffff",
          border: "1px solid #ef4444",
        }
      : variant === "secondary"
      ? {
          background: "#ffffff",
          color: "#111827",
          border: "1px solid #d9e2ec",
        }
      : {
          background: "#f8fafc",
          color: "#111827",
          border: "1px solid #e5e7eb",
        };

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        borderRadius: "16px",
        padding: "14px 14px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        ...styles,
      }}
    >
      <div
        style={{
          fontSize: "15px",
          fontWeight: 800,
          lineHeight: 1.3,
        }}
      >
        {label}
      </div>

      {sublabel ? (
        <div
          style={{
            marginTop: "4px",
            fontSize: "12px",
            lineHeight: "18px",
            opacity: variant === "primary" ? 0.9 : 0.7,
            fontWeight: 500,
          }}
        >
          {sublabel}
        </div>
      ) : null}
    </button>
  );
}

function MetaRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "12px",
        paddingBottom: "10px",
        marginBottom: "10px",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          color: "#6b7280",
          fontWeight: 700,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "13px",
          color: "#111827",
          fontWeight: 800,
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}