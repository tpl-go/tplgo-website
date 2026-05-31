"use client";

import type { CSSProperties } from "react";

type Traveller = {
  id?: string;
  label?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
};

type ContactDetails = {
  countryCode?: string;
  mobile?: string;
  email?: string;
};

type Props = {
  travellers?: Traveller[];
  contactDetails?: ContactDetails;
};

function getFullName(t?: Traveller) {
  const name = `${t?.firstName || ""} ${t?.lastName || ""}`.trim();
  return name || t?.label || "Guest";
}

function getGenderText(value?: string) {
  if (!value) return "Guest";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function HomestayConfirmationGuestCard({
  travellers = [],
  contactDetails,
}: Props) {
  const leadGuest = travellers[0];

  return (
    <section
      className="homestay-confirmation-guest-card"
      style={{
        border: "1px solid #d9e2ec",
        borderRadius: "22px",
        overflow: "hidden",
        background: "#ffffff",
        boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
      }}
    >
      <div
        className="homestay-confirmation-card-title"
        style={{
          minHeight: "58px",
          padding: "0 22px",
          borderBottom: "1px solid #e5e7eb",
          background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
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
          Guest Details
        </h3>
      </div>

      <div className="homestay-confirmation-card-body" style={{ padding: "22px" }}>
        {leadGuest ? (
          <div
            style={{
              marginBottom: "18px",
              border: "1px solid #dbeafe",
              borderRadius: "20px",
              background:
                "linear-gradient(135deg, #eff6ff 0%, #ffffff 60%, #f8fafc 100%)",
              padding: "18px",
              boxShadow: "0 6px 18px rgba(37,99,235,0.05)",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 900,
                color: "#1d4ed8",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                marginBottom: "8px",
              }}
            >
              Lead Guest
            </div>

            <div
              style={{
                fontSize: "22px",
                fontWeight: 900,
                color: "#111827",
                lineHeight: "30px",
              }}
            >
              {getFullName(leadGuest)}
            </div>

            <div
              style={{
                marginTop: "8px",
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <span style={leadPillStyle}>
                {getGenderText(leadGuest.gender)}
              </span>

              <span style={leadPillStyle}>Primary Booking Contact</span>

              {contactDetails?.mobile ? (
                <span style={leadPillStyle}>
                  {contactDetails.countryCode || "+91"} {contactDetails.mobile}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        <div
          className="homestay-confirmation-guest-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            gap: "16px",
          }}
        >
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "18px",
              background: "#ffffff",
              padding: "16px",
              boxShadow: "0 3px 10px rgba(15,23,42,0.03)",
            }}
          >
            <div
              style={{
                fontSize: "15px",
                fontWeight: 900,
                color: "#111827",
                marginBottom: "14px",
              }}
            >
              Guest List
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              {travellers.length > 0 ? (
                travellers.map((traveller, index) => (
                  <div
                    key={traveller.id || index}
                    className="homestay-confirmation-traveller-row"
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "16px",
                      padding: "14px 16px",
                      background:
                        index === 0
                          ? "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)"
                          : "#f9fafb",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "14px",
                          background: index === 0 ? "#dbeafe" : "#eef2ff",
                          color: index === 0 ? "#1d4ed8" : "#4338ca",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px",
                          fontWeight: 900,
                          flexShrink: 0,
                          border:
                            index === 0
                              ? "1px solid #bfdbfe"
                              : "1px solid #c7d2fe",
                        }}
                      >
                        {index + 1}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "15px",
                            fontWeight: 900,
                            color: "#111827",
                            lineHeight: "22px",
                          }}
                        >
                          {getFullName(traveller)}
                        </div>

                        <div
                          style={{
                            marginTop: "6px",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          <span style={guestMetaPill}>
                            {getGenderText(traveller.gender)}
                          </span>

                          {index === 0 ? (
                            <span style={leadBadgeStyle}>Lead Guest</span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 900,
                        color: "#16a34a",
                        whiteSpace: "nowrap",
                      }}
                    >
                      CONFIRMED
                    </div>
                  </div>
                ))
              ) : (
                <div style={emptyTextStyle}>No guest data available</div>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gap: "16px" }}>
            <InfoCard
              title="Contact Details"
              rows={[
                {
                  label: "Email",
                  value: contactDetails?.email || "Not provided",
                },
                {
                  label: "Mobile",
                  value: contactDetails?.mobile
                    ? `${contactDetails?.countryCode || "+91"} ${contactDetails.mobile}`
                    : "Not provided",
                },
              ]}
            />

            <InfoCard
              title="Booking Snapshot"
              rows={[
                {
                  label: "Total Guests",
                  value: `${travellers.length || 0}`,
                },
                {
                  label: "Lead Guest",
                  value: leadGuest ? getFullName(leadGuest) : "Not available",
                },
                {
                  label: "Contact Status",
                  value:
                    contactDetails?.email || contactDetails?.mobile
                      ? "Available"
                      : "Pending",
                },
              ]}
            />
          </div>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 767px) {
          .homestay-confirmation-guest-card {
            border-radius: 18px !important;
          }

          .homestay-confirmation-card-title {
            min-height: 52px !important;
            padding: 0 14px !important;
          }

          .homestay-confirmation-card-body {
            padding: 14px !important;
          }

          .homestay-confirmation-guest-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }

          .homestay-confirmation-traveller-row {
            align-items: flex-start !important;
            flex-direction: column !important;
          }
        }
      `}</style>
    </section>
  );
}

function InfoCard({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <div
      className="homestay-confirmation-info-card"
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "18px",
        background: "#ffffff",
        padding: "16px",
        boxShadow: "0 3px 10px rgba(15,23,42,0.03)",
      }}
    >
      <div
        style={{
          fontSize: "15px",
          fontWeight: 900,
          color: "#111827",
          marginBottom: "12px",
        }}
      >
        {title}
      </div>

      <div style={{ display: "grid", gap: "12px" }}>
        {rows.map((row, index) => (
          <div
            className="homestay-confirmation-info-row"
            key={`${row.label}-${index}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              alignItems: "flex-start",
              borderTop: index === 0 ? "none" : "1px dashed #e5e7eb",
              paddingTop: index === 0 ? 0 : "12px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 800,
                color: "#64748b",
                minWidth: "110px",
              }}
            >
              {row.label}
            </div>

            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#1f2937",
                lineHeight: "20px",
                textAlign: "right",
                wordBreak: "break-word",
              }}
            >
              {row.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const emptyTextStyle: CSSProperties = {
  fontSize: "14px",
  color: "#6b7280",
  fontWeight: 600,
};

const leadPillStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "#ffffff",
  border: "1px solid #dbeafe",
  color: "#1e40af",
  fontSize: "12px",
  fontWeight: 800,
};

const guestMetaPill: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  color: "#475569",
  fontSize: "11px",
  fontWeight: 800,
};

const leadBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "#dbeafe",
  border: "1px solid #bfdbfe",
  color: "#1d4ed8",
  fontSize: "11px",
  fontWeight: 900,
};
