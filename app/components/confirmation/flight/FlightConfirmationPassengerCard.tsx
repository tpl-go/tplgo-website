"use client";

type Traveller = {
  id?: string;
  label?: string;
  travellerType?: "adult" | "child" | "infant";
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: string;
  cabinLabel?: string;
};

type ContactDetails = {
  countryCode?: string;
  mobile?: string;
  email?: string;
};

type GstDetails = {
  hasGst?: boolean;
  state?: string;
  saveBillingToProfile?: boolean;
};

type TravellerValidation = {
  travellers?: Traveller[];
  contactDetails?: ContactDetails;
  gstDetails?: GstDetails;
};

type SeatMealData = {
  seatStatus?: "pending" | "selected" | "skipped";
  mealStatus?: "pending" | "selected" | "skipped";
  seats?: {
    travellerId: string;
    seatNumber: string;
    price: number;
  }[];
  meals?: {
    travellerId: string;
    mealName: string;
    price: number;
  }[];
};

type CabData = {
  cabStatus?: "pending" | "selected" | "skipped";
  cabLabel?: string;
  cabPrice?: number;
};

type InsuranceData = {
  insuranceStatus?: "pending" | "selected" | "skipped";
  insuranceLabel?: string;
  insurancePrice?: number;
};

type AddonsData = {
  addonsStatus?: "pending" | "selected" | "skipped";
  addonsLabel?: string;
  addonsPrice?: number;
  selectedItems?: string[];
};

type Props = {
  travellerValidation?: TravellerValidation | null;
  seatMealData?: SeatMealData;
  cabData?: CabData;
  insuranceData?: InsuranceData;
  addonsData?: AddonsData;
};

function getFullName(t?: Traveller) {
  const name = [t?.firstName, t?.middleName, t?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || t?.label || "Traveller";
}

function getGenderText(value?: string) {
  if (!value) return "Gender";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getTravellerTypeText(value?: Traveller["travellerType"]) {
  if (!value) return "Traveller";
  if (value === "adult") return "Adult";
  if (value === "child") return "Child";
  return "Infant";
}

export default function FlightConfirmationPassengerCard({
  travellerValidation,
  seatMealData,
  cabData,
  insuranceData,
  addonsData,
}: Props) {
  const travellers = travellerValidation?.travellers || [];
  const contact = travellerValidation?.contactDetails;
  const gst = travellerValidation?.gstDetails;
  const leadTraveller = travellers[0];

  const seatSummary =
    seatMealData?.seatStatus === "selected" &&
    (seatMealData?.seats?.length || 0) > 0
      ? seatMealData?.seats
          ?.map((seat, index) => `T${index + 1}: ${seat.seatNumber}`)
          .join(" • ")
      : seatMealData?.seatStatus === "skipped"
      ? "Skipped"
      : "Not selected";

  const mealSummary =
    seatMealData?.mealStatus === "selected" &&
    (seatMealData?.meals?.length || 0) > 0
      ? seatMealData?.meals
          ?.map((meal, index) => `T${index + 1}: ${meal.mealName}`)
          .join(" • ")
      : seatMealData?.mealStatus === "skipped"
      ? "Skipped"
      : "Not selected";

  const cabSummary =
    cabData?.cabStatus === "selected"
      ? `${cabData?.cabLabel || "Cab Selected"}${
          cabData?.cabPrice
            ? ` • ₹${cabData.cabPrice.toLocaleString("en-IN")}`
            : ""
        }`
      : cabData?.cabStatus === "skipped"
      ? "Skipped"
      : "Not selected";

  const insuranceSummary =
    insuranceData?.insuranceStatus === "selected"
      ? `${insuranceData?.insuranceLabel || "Insurance Selected"}${
          insuranceData?.insurancePrice
            ? ` • ₹${insuranceData.insurancePrice.toLocaleString("en-IN")}`
            : ""
        }`
      : insuranceData?.insuranceStatus === "skipped"
      ? "Skipped"
      : "Not selected";

  const addonsSummary =
    addonsData?.addonsStatus === "selected"
      ? addonsData?.addonsLabel ||
        (addonsData?.selectedItems?.length
          ? addonsData.selectedItems.join(", ")
          : "Selected")
      : addonsData?.addonsStatus === "skipped"
      ? "Skipped"
      : "Not selected";

  return (
    <section
      className="flight-passenger-card"
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
          Passenger & Booking Details
        </h3>
      </div>

      <div className="passenger-card-body" style={{ padding: "22px" }}>
        {leadTraveller ? (
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
                {getTravellerTypeText(leadTraveller.travellerType)}
              </span>
              <span style={leadPillStyle}>
                {getGenderText(leadTraveller.gender)}
              </span>
              <span style={leadPillStyle}>Primary Booking Contact</span>
              {contact?.mobile ? (
                <span style={leadPillStyle}>
                  {contact?.countryCode || "+91"} {contact.mobile}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        <div
          className="passenger-layout-grid"
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
              Traveller List
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              {travellers.length > 0 ? (
                travellers.map((traveller, index) => (
                  <div
                    className="traveller-row"
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
                    }}
                  >
                    <div
                      className="traveller-main"
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
                          <span style={travellerMetaPill}>
                            {getTravellerTypeText(traveller.travellerType)}
                          </span>

                          <span style={travellerMetaPill}>
                            {getGenderText(traveller.gender)}
                          </span>

                          {traveller.cabinLabel ? (
                            <span style={travellerMetaPill}>
                              {traveller.cabinLabel}
                            </span>
                          ) : null}

                          {index === 0 ? (
                            <span style={leadBadgeStyle}>Lead Traveller</span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div
                      className="traveller-status"
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
                <div style={emptyTextStyle}>No passenger data available</div>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gap: "16px" }}>
            <InfoCard
              title="Contact Details"
              rows={[
                {
                  label: "Email",
                  value: contact?.email || "Not provided",
                },
                {
                  label: "Mobile",
                  value: contact?.mobile
                    ? `${contact?.countryCode || "+91"} ${contact.mobile}`
                    : "Not provided",
                },
              ]}
            />

            <InfoCard
              title="GST Details"
              rows={[
                {
                  label: "GST Applied",
                  value: gst?.hasGst ? "Yes" : "No",
                },
                {
                  label: "State",
                  value: gst?.state || "Not provided",
                },
                {
                  label: "Save Billing",
                  value: gst?.saveBillingToProfile ? "Yes" : "No",
                },
              ]}
            />

            <InfoCard
              title="Add-on Snapshot"
              rows={[
                {
                  label: "Seat Selection",
                  value: seatSummary || "Not selected",
                },
                {
                  label: "Meal Selection",
                  value: mealSummary || "Not selected",
                },
                {
                  label: "Cab",
                  value: cabSummary || "Not selected",
                },
                {
  label: "Travel Insurance",
  value: insuranceSummary || "Not selected",
},
                {
                  label: "Add-ons",
                  value: addonsSummary || "Not selected",
                },
              ]}
            />
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 767px) {
          .flight-passenger-card {
            border-radius: 18px !important;
          }

          .flight-passenger-card .passenger-card-body {
            padding: 14px !important;
          }

          .flight-passenger-card .passenger-layout-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 14px !important;
          }

          .flight-passenger-card .traveller-row {
            align-items: flex-start !important;
            flex-direction: column !important;
            gap: 10px !important;
          }

          .flight-passenger-card .traveller-main {
            width: 100%;
          }

          .flight-passenger-card .traveller-status {
            white-space: normal !important;
            align-self: flex-start;
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
      className="flight-info-card"
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
      className="info-card-row"
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
              className="info-card-label"
              style={{
                fontSize: "13px",
                fontWeight: 800,
                color: "#64748b",
                minWidth: "120px",
              }}
            >
              {row.label}
            </div>

            <div
              className="info-card-value"
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
      <style>{`
        @media (max-width: 767px) {
          .flight-info-card .info-card-row {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 4px !important;
          }

          .flight-info-card .info-card-label {
            min-width: 0 !important;
          }

          .flight-info-card .info-card-value {
            text-align: left !important;
            min-width: 0 !important;
          }
        }
      `}</style>
    </div>
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
