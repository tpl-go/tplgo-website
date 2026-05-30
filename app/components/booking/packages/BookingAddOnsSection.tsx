"use client";

import { useState } from "react";

type Props = {
  isInternationalTrip?: boolean;
};

export default function BookingAddOnsSection({
  isInternationalTrip = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [isInsuranceSelected, setIsInsuranceSelected] = useState(true);
  const [isVisaSelected, setIsVisaSelected] = useState(true);

  const [showInsuranceDetails, setShowInsuranceDetails] = useState(false);
  const [showVisaDetails, setShowVisaDetails] = useState(false);

  return (
    <>
      <section id="package-addons">
        {/* HEADER */}
        <div
          style={headerStyle}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <h3 style={titleStyle}>2. Package Add-Ons</h3>

          <span
            style={{
              ...arrowStyle,
              transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
            }}
          >
            ˅
          </span>
        </div>

        {isOpen && (
          <div style={{ background: "#ffffff" }}>
            {/* ✅ VISA PROTECT (TOP) */}
            {isInternationalTrip && (
              <div style={pinkStrip}>
                <AddonCard
                  icon="🛂"
                  title="Visa Protect"
                  subtitle="Protect your trip if visa is not approved"
                >
                  <CardContent
                    title="Visa Protect Cover"
                    badge="Recommended"
                    subText="Covers your package if visa is not granted"
                    onViewDetails={() => setShowVisaDetails(true)}
                    selected={isVisaSelected}
                    onToggle={() => setIsVisaSelected((prev) => !prev)}
                    items={[
                      "🛂 Coverage if visa is not approved before travel",
                      "💸 Refund protection on eligible package components",
                      "✈ Flight & visa fees may remain non-refundable",
                    ]}
                  />
                </AddonCard>
              </div>
            )}

            {/* INSURANCE */}
            <div style={pinkStrip}>
              <AddonCard
                icon="🛡"
                title="Travel + Medical Insurance"
                subtitle="Secure your trip and travel worry free"
              >
                <CardContent
                  title="Reliance - ₹500k Travel Insurance"
                  badge="Most Popular"
                  subText="99% Claims Settled"
                  onViewDetails={() => setShowInsuranceDetails(true)}
                  selected={isInsuranceSelected}
                  onToggle={() => setIsInsuranceSelected((prev) => !prev)}
                  items={[
                    "🧳 Trip Delay - Flat Rs. 1,500",
                    "🧾 Trip Cancellation - Up to Rs. 10,000",
                    "🎒 Baggage Loss - Up to Rs. 8,500",
                  ]}
                />
              </AddonCard>
            </div>
          </div>
        )}
      </section>

      {/* INSURANCE MODAL */}
      {showInsuranceDetails && (
        <div
          className="booking-addon-modal-overlay"
          onClick={() => setShowInsuranceDetails(false)}
          style={modalOverlay}
        >
          <div
            className="booking-addon-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={modalBox}
          >
            <div style={modalHeader}>
              <h3 style={{ margin: 0 }}>Insurance Details</h3>
              <button
                onClick={() => setShowInsuranceDetails(false)}
                style={closeBtn}
              >
                ×
              </button>
            </div>

            <div style={modalContent}>
              Full insurance coverage details, exclusions, claim process etc.
              yaha backend se connect hoga later.
            </div>
          </div>
        </div>
      )}

      {/* VISA MODAL */}
      {showVisaDetails && (
        <div
          className="booking-addon-modal-overlay"
          onClick={() => setShowVisaDetails(false)}
          style={modalOverlay}
        >
          <div
            className="booking-addon-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={modalBox}
          >
            <div style={modalHeader}>
              <h3 style={{ margin: 0 }}>Visa Protect Details</h3>
              <button
                onClick={() => setShowVisaDetails(false)}
                style={closeBtn}
              >
                ×
              </button>
            </div>

            <div style={modalContent}>
              Visa Protect helps secure your international package in case your
              visa is not approved before departure. Eligible refundable
              components of your package may be covered. Flight fares, embassy
              fees, visa charges, and other non-refundable elements may remain
              excluded as per final policy terms.
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 767px) {
          .booking-addon-modal-overlay {
            align-items: stretch !important;
            padding: 0 !important;
            z-index: 1300 !important;
          }

          .booking-addon-modal-box {
            display: flex !important;
            width: 100% !important;
            min-height: 100dvh !important;
            flex-direction: column !important;
            border-radius: 0 !important;
          }

          .booking-addon-card-top {
            flex-direction: column !important;
            gap: 12px !important;
          }

          .booking-addon-card-action {
            text-align: left !important;
          }

          .booking-addon-select-btn {
            width: 100% !important;
          }
        }
      `}</style>
    </>
  );
}

/* ---------- COMPONENTS ---------- */

function AddonCard({ icon, title, subtitle, children }: any) {
  return (
    <div style={addonWrapper}>
      <div style={{ display: "flex", gap: "14px" }}>
        <div style={iconStyle}>{icon}</div>

        <div>
          <h4 style={addonTitle}>{title}</h4>
          <p style={addonSub}>{subtitle}</p>
        </div>
      </div>

      <div style={{ marginTop: "18px" }}>{children}</div>
    </div>
  );
}

function CardContent({
  title,
  badge,
  subText,
  items,
  selected,
  onToggle,
  onViewDetails,
}: any) {
  return (
    <div style={cardBox}>
      <div className="booking-addon-card-top" style={cardTop}>
        <div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <h5 style={cardTitle}>{title}</h5>
            {badge && <span style={badgeStyle}>{badge}</span>}
          </div>

          <p style={subTextStyle}>{subText}</p>
        </div>

        {onViewDetails && (
          <button onClick={onViewDetails} style={linkBtn}>
            View Details
          </button>
        )}
      </div>

      <div style={{ marginTop: "14px" }}>
        {items.map((item: string, i: number) => (
          <div key={i} style={listItem}>
            {item}
          </div>
        ))}
      </div>

      <div
        className="booking-addon-card-action"
        style={{ marginTop: "18px", textAlign: "right" }}
      >
        <button
          className="booking-addon-select-btn"
          onClick={onToggle}
          style={{
            ...selectBtn,
            background: selected ? "#dff6ff" : "#fff",
            color: selected ? "#2a9fe8" : "#4b5563",
          }}
        >
          {selected ? "✓ SELECTED" : "SELECT"}
        </button>
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */

const headerStyle = {
  minHeight: "58px",
  padding: "0 18px",
  borderTop: "1px solid #d9e2ec",
  borderBottom: "1px solid #d9e2ec",
  background: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
};

const titleStyle = {
  margin: 0,
  fontSize: "18px",
  fontWeight: 800,
};

const arrowStyle = {
  fontSize: "18px",
  color: "#55a8d8",
};

const pinkStrip = {
  background: "#fff3f5",
  padding: "20px",
};

const addonWrapper = {
  background: "#fff",
  borderRadius: "14px",
  padding: "18px",
};

const iconStyle = {
  width: "26px",
  height: "26px",
  borderRadius: "50%",
  background: "#e5fff2",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const addonTitle = {
  margin: 0,
  fontSize: "18px",
  fontWeight: 700,
};

const addonSub = {
  margin: 0,
  fontSize: "14px",
  color: "#4b5563",
};

const cardBox = {
  background: "#fff",
  border: "1px solid #d5e1ea",
  borderRadius: "14px",
  padding: "16px",
};

const cardTop = {
  display: "flex",
  justifyContent: "space-between",
};

const cardTitle = {
  margin: 0,
  fontWeight: 800,
};

const badgeStyle = {
  fontSize: "11px",
  border: "1px solid #8aa1f2",
  padding: "2px 8px",
  borderRadius: "999px",
};

const subTextStyle = {
  fontSize: "13px",
  color: "#6b7280",
};

const listItem = {
  fontSize: "14px",
  marginTop: "6px",
};

const selectBtn = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "1px solid #b6c3cf",
  fontWeight: 700,
  cursor: "pointer",
};

const linkBtn = {
  border: "none",
  background: "transparent",
  color: "#2a9fe8",
  cursor: "pointer",
};

const modalOverlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalBox = {
  width: "600px",
  background: "#fff",
  borderRadius: "12px",
};

const modalHeader = {
  padding: "16px",
  borderBottom: "1px solid #eee",
  display: "flex",
  justifyContent: "space-between",
};

const modalContent = {
  padding: "16px",
};

const closeBtn = {
  border: "none",
  background: "transparent",
  fontSize: "24px",
};
