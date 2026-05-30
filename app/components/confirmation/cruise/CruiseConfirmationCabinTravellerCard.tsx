"use client";

type Traveller = {
  id?: string;
  label?: string;
  cabinLabel?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
};

type Cabin = {
  cabinKey?: string;
  cabinId?: string;
  cabinName?: string;
  adults?: number;
  children?: number;
  infants?: number;
  subtotal?: number;
};

type ContactDetails = {
  countryCode?: string;
  mobile?: string;
  email?: string;
};

type Props = {
  cabins?: Cabin[];
  travellers?: Traveller[];
  contactDetails?: ContactDetails;
};

function getFullName(t?: Traveller) {
  const name = `${t?.firstName || ""} ${t?.lastName || ""}`.trim();
  return name || t?.label || "Traveller";
}

function getGenderText(value?: string) {
  if (!value) return "Gender";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function CruiseConfirmationCabinTravellerCard({
  cabins = [],
  travellers = [],
  contactDetails,
}: Props) {
  const leadTraveller = travellers[0];

  const primaryContactNumber =
    contactDetails?.mobile
      ? `${contactDetails?.countryCode || "+91"} ${contactDetails.mobile}`
      : "";

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
          background: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "19px",
            fontWeight: 900,
            color: "#065f46",
            letterSpacing: "-0.2px",
          }}
        >
          Cabin & Traveller Details
        </h3>
      </div>

      <div style={{ padding: "22px" }}>
        {leadTraveller ? (
          <div
            style={{
              marginBottom: "18px",
              border: "1px solid #dbeafe",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 60%, #f8fafc 100%)",
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
              Lead Traveller
            </div>

            <div
              style={{
                fontSize: "22px",
                fontWeight: 900,
                color: "#111827",
                lineHeight: "30px",
              }}
            >
              {getFullName(leadTraveller)}
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
                {leadTraveller.cabinLabel || "Cabin"}
              </span>
              <span style={leadPillStyle}>
                {getGenderText(leadTraveller.gender)}
              </span>
              <span style={leadPillStyle}>
                Primary Booking Contact
              </span>
              {primaryContactNumber ? (
                <span style={leadPillStyle}>
                  {primaryContactNumber}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        <div style={{ marginBottom: "22px" }}>
          <div
            style={{
              fontSize: "15px",
              fontWeight: 900,
              color: "#111827",
              marginBottom: "14px",
            }}
          >
            Selected Cabins
          </div>

          <div
            className="cruise-confirm-cabin-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "14px",
            }}
          >
            {cabins.length > 0 ? (
              cabins.map((cabin, index) => {
                const totalPax =
                  (cabin.adults || 0) +
                  (cabin.children || 0) +
                  (cabin.infants || 0);

                return (
                  <div
                    className="cruise-confirm-cabin-card"
                    key={cabin.cabinKey || index}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "18px",
                      background: "#ffffff",
                      padding: "16px",
                      boxShadow: "0 3px 10px rgba(15,23,42,0.03)",
                    }}
                  >
                    <div
                      className="cruise-confirm-cabin-head"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <div
                          className="cruise-confirm-cabin-price"
                          style={{
                            fontSize: "12px",
                            fontWeight: 800,
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Cabin {index + 1}
                        </div>

                        <div
                          style={{
                            marginTop: "6px",
                            fontSize: "17px",
                            fontWeight: 900,
                            color: "#111827",
                            lineHeight: "24px",
                          }}
                        >
                          {cabin.cabinName || "Cabin"}
                        </div>
                      </div>

                      {cabin.subtotal ? (
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: 900,
                            color: "#0f172a",
                            whiteSpace: "nowrap",
                          }}
                        >
                          ₹{cabin.subtotal.toLocaleString("en-IN")}
                        </div>
                      ) : null}
                    </div>

                    <div
                      className="cruise-confirm-cabin-chip-wrap"
                      style={{
                        marginTop: "14px",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <span style={pillBlue}>Travellers: {totalPax}</span>

                      {(cabin.adults || 0) > 0 ? (
                        <span style={pillGreen}>Adults: {cabin.adults}</span>
                      ) : null}

                      {(cabin.children || 0) > 0 ? (
                        <span style={pillOrange}>Children: {cabin.children}</span>
                      ) : null}

                      {(cabin.infants || 0) > 0 ? (
                        <span style={pillPurple}>Infants: {cabin.infants}</span>
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={emptyTextStyle}>No cabin data available</div>
            )}
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: "15px",
              fontWeight: 900,
              color: "#111827",
              marginBottom: "14px",
            }}
          >
            Traveller List
          </div>

          <div style={{ display: "grid", gap: "12px" }}>
            {travellers.length > 0 ? (
              travellers.map((traveller, index) => (
                <div
                  className="cruise-confirm-traveller-row"
                  key={traveller.id || index}
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
                    boxShadow:
                      index === 0
                        ? "0 4px 14px rgba(37,99,235,0.04)"
                        : "none",
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
                        className="cruise-confirm-traveller-main"
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
                        className="cruise-confirm-traveller-chip-wrap"
                        style={{
                          marginTop: "6px",
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        <span style={travellerMetaPill}>
                          {traveller.cabinLabel || "Cabin"}
                        </span>

                        <span style={travellerMetaPill}>
                          {getGenderText(traveller.gender)}
                        </span>

                        {index === 0 ? (
                          <span style={leadBadgeStyle}>Lead Traveller</span>
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
              <div style={emptyTextStyle}>No traveller data available</div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 767px) {
          .cruise-confirm-cabin-grid {
            grid-template-columns: 1fr !important;
          }

          .cruise-confirm-cabin-card {
            padding: 14px !important;
          }

          .cruise-confirm-cabin-head {
            align-items: flex-start !important;
            flex-direction: column !important;
            gap: 10px !important;
          }

          .cruise-confirm-cabin-price {
            white-space: normal !important;
            align-self: flex-start !important;
            border-radius: 999px !important;
            background: #f8fafc !important;
            padding: 6px 10px !important;
            font-size: 14px !important;
          }

          .cruise-confirm-cabin-chip-wrap,
          .cruise-confirm-traveller-chip-wrap {
            width: 100% !important;
            gap: 7px !important;
          }

          .cruise-confirm-traveller-row {
            align-items: flex-start !important;
            flex-direction: column !important;
            gap: 12px !important;
            padding: 14px !important;
          }

          .cruise-confirm-traveller-main {
            align-items: flex-start !important;
            width: 100% !important;
          }

          .cruise-confirm-traveller-main > div:last-child {
            min-width: 0 !important;
            width: 100% !important;
          }

          .cruise-confirm-traveller-row > div:last-child {
            align-self: flex-start !important;
            border-radius: 999px !important;
            background: #dcfce7 !important;
            padding: 5px 9px !important;
          }
        }
      `}</style>
    </section>
  );
}

const emptyTextStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#6b7280",
  fontWeight: 600,
};

const leadPillStyle: React.CSSProperties = {
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

const pillBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "7px 11px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 800,
};

const pillBlue: React.CSSProperties = {
  ...pillBase,
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  color: "#1d4ed8",
};

const pillGreen: React.CSSProperties = {
  ...pillBase,
  background: "#ecfdf5",
  border: "1px solid #bbf7d0",
  color: "#166534",
};

const pillOrange: React.CSSProperties = {
  ...pillBase,
  background: "#fff7ed",
  border: "1px solid #fdba74",
  color: "#c2410c",
};

const pillPurple: React.CSSProperties = {
  ...pillBase,
  background: "#f5f3ff",
  border: "1px solid #c4b5fd",
  color: "#6d28d9",
};

const travellerMetaPill: React.CSSProperties = {
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

const leadBadgeStyle: React.CSSProperties = {
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
