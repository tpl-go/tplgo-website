"use client";

import { useMemo, useState } from "react";

type CabinAssignmentMeta = {
  cabinId?: string;
  assignmentMode?: "auto" | "select";
  deckCabinNumber?: string | null;
};

type PricingSummary = {
  cabins?: {
    cabinKey?: string;
    cabinId?: string;
    cabinName?: string;
    adults?: number;
    children?: number;
    infants?: number;
    subtotal?: number;
  }[];
  cabinsTotal?: number;
  taxesAndFees?: number;
  grandTotal?: number;
};

type BookingData = {
  cruiseId?: string;
  title?: string;
  sailingDate?: string | null;
  sailingDateId?: string | null;
  departurePort?: string | null;
  arrivalPort?: string | null;
  route?: string | null;
  visitingPorts?: string[];
  sailingStartDate?: string | null;
  sailingEndDate?: string | null;
  selectedCabins?: {
    cabinKey?: string;
    cabinId?: string;
    rows?: {
      id?: string;
      adults?: number;
      children?: number;
      infants?: number;
      nationality?: string;
    }[];
    selectedAt?: number;
  }[];
  pricingSummary?: PricingSummary | null;
  cabinAssignmentMeta?: CabinAssignmentMeta[];
  selectedDeckCabin?: {
    deckId?: string;
    deckTitle?: string;
    cabinId?: string;
    cabinNumber?: string;
  } | null;
};

type TravellerValidation = {
  travellers?: {
    id?: string;
    label?: string;
    cabinLabel?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
  }[];
  contactDetails?: {
    countryCode?: string;
    mobile?: string;
    email?: string;
  };
};

type AdditionalInfoData = {
  notes?: string;
};

type OfferData = {
  code?: string;
  title?: string;
  description?: string;
  discountAmount?: number;
} | null;

type FareData = {
  baseFare?: number;
  taxes?: number;
  appliedOffer?: number;
  tplCredit?: number;
  insuranceTotal?: number;
  totalAmount?: number;
  totalBeforeWallet?: number;
};

type Props = {
  bookingData: BookingData;
  travellerValidation?: TravellerValidation | null;
  additionalInfoData?: AdditionalInfoData | null;
  offerData?: OfferData;
  fareData?: FareData;
};

function formatDateLabel(dateStr?: string | null) {
  if (!dateStr) return "On Request";

  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;

  return parsed.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTravellerName(traveller?: {
  firstName?: string;
  lastName?: string;
  label?: string;
}) {
  const fullName = `${traveller?.firstName || ""} ${
    traveller?.lastName || ""
  }`.trim();

  return fullName || traveller?.label || "Traveller";
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div
        className="cruise-payment-summary-head"
        style={{
          fontSize: "13px",
          color: "#6b7280",
          fontWeight: 700,
          marginBottom: "4px",
        }}
      >
        {label}
      </div>

      <div
        className="cruise-payment-summary-contact"
        style={{
          fontSize: "14px",
          color: "#1f2937",
          fontWeight: 600,
          lineHeight: "22px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "13px",
        color: "#6b7280",
        fontWeight: 700,
        marginBottom: "8px",
      }}
    >
      {children}
    </div>
  );
}

function Pill({
  label,
  background,
  color,
}: {
  label: string;
  background: string;
  color: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 12px",
        borderRadius: "999px",
        background,
        color,
        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  );
}

export default function CruisePaymentTopSummary({
  bookingData,
  travellerValidation,
  additionalInfoData,
  offerData,
  fareData,
}: Props) {
  const [showDetails, setShowDetails] = useState(false);

  const pricingSummary = bookingData?.pricingSummary;
  const cabinAssignmentMeta = bookingData?.cabinAssignmentMeta || [];
  const selectedCabins = useMemo(
    () => pricingSummary?.cabins || [],
    [pricingSummary?.cabins]
  );
  const leadTraveller = travellerValidation?.travellers?.[0];

  const totalTravellers = useMemo(() => {
    if ((travellerValidation?.travellers || []).length > 0) {
      return travellerValidation?.travellers?.length || 0;
    }

    return (selectedCabins || []).reduce(
      (sum, cabin) =>
        sum +
        (cabin.adults || 0) +
        (cabin.children || 0) +
        (cabin.infants || 0),
      0
    );
  }, [travellerValidation?.travellers, selectedCabins]);

  const extraTravellers =
    totalTravellers > 1 ? `, +${totalTravellers - 1} traveller` : "";

  const routeTitle =
    bookingData?.route ||
    `${bookingData?.departurePort || "Departure"} → ${
      bookingData?.arrivalPort || "Arrival"
    }`;

  const sailingSummary =
    bookingData?.sailingStartDate && bookingData?.sailingEndDate
      ? `${formatDateLabel(bookingData.sailingStartDate)} → ${formatDateLabel(
          bookingData.sailingEndDate
        )}`
      : formatDateLabel(bookingData?.sailingDate);

  const portsSummary =
    bookingData?.visitingPorts && bookingData.visitingPorts.length > 0
      ? bookingData.visitingPorts.join(" • ")
      : "Ports will be updated soon";

  const offerSummary = offerData?.code
  ? `${offerData.code} • Save ₹${(offerData.discountAmount || 0).toLocaleString(
      "en-IN"
    )}`
  : fareData?.appliedOffer
  ? `Cruise offer • Save ₹${Number(fareData.appliedOffer || 0).toLocaleString(
      "en-IN"
    )}`
  : "No offer applied";

  const additionalInfoSummary =
    additionalInfoData?.notes?.trim() || "No additional information added";

  return (
    <section
      id="payment-top-summary"
      style={{
        border: "1px solid #d9e2ec",
        background: "#eef6ff",
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          padding: "18px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: "28px",
              lineHeight: 1,
              marginBottom: "8px",
            }}
          >
            🚢
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: "22px",
              lineHeight: "30px",
              fontWeight: 800,
              color: "#1f2937",
            }}
          >
            {bookingData?.title || "Cruise Booking"}
          </h2>

          <div
            style={{
              marginTop: "8px",
              fontSize: "14px",
              color: "#4b5563",
              fontWeight: 600,
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              alignItems: "center",
            }}
          >
            <span>{sailingSummary}</span>
            <span>|</span>
            <span>{totalTravellers} Traveller(s)</span>
            <span>|</span>
            <span>{selectedCabins.length || bookingData?.selectedCabins?.length || 0} Cabin(s)</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDetails((prev) => !prev)}
          style={{
            border: "none",
            background: "transparent",
            color: "#1d9bf0",
            fontSize: "14px",
            fontWeight: 800,
            cursor: "pointer",
            whiteSpace: "nowrap",
            paddingTop: "6px",
          }}
        >
          {showDetails ? "HIDE DETAILS ▲" : "VIEW DETAILS ▼"}
        </button>
      </div>

      <div
        style={{
          borderTop: "1px solid #d9e2ec",
          background: "#ffffff",
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          gap: "18px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: "13px",
              color: "#6b7280",
              fontWeight: 700,
              marginBottom: "4px",
            }}
          >
            Booking details will be sent to:
          </div>

          <div
            style={{
              fontSize: "15px",
              color: "#1f2937",
              fontWeight: 700,
            }}
          >
            {formatTravellerName(leadTraveller)}
            {extraTravellers}
          </div>

          <div
            style={{
              marginTop: "4px",
              fontSize: "13px",
              color: "#4b5563",
              fontWeight: 500,
            }}
          >
            {travellerValidation?.contactDetails?.email || "email@example.com"},{" "}
            {(travellerValidation?.contactDetails?.countryCode || "+91")}-
            {travellerValidation?.contactDetails?.mobile || "0000000000"}
          </div>
        </div>

        <div style={{ minWidth: "260px" }}>
          <div
            className="cruise-payment-details-grid"
            style={{
              fontSize: "13px",
              color: "#6b7280",
              fontWeight: 700,
              marginBottom: "4px",
            }}
          >
            Cruise Route Summary
          </div>

          <div
            style={{
              fontSize: "15px",
              color: "#1f2937",
              fontWeight: 700,
            }}
          >
            {routeTitle}
          </div>

          <div
            style={{
              marginTop: "4px",
              fontSize: "13px",
              color: "#4b5563",
              fontWeight: 500,
            }}
          >
            {portsSummary}
          </div>
        </div>
      </div>

      {showDetails && (
        <div
          style={{
            borderTop: "1px solid #d9e2ec",
            background: "#f8fbff",
            padding: "16px 20px 18px 20px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: "18px",
            }}
          >
            <div>
              <SectionLabel>Cruise Sailing Summary</SectionLabel>

              <div
                style={{
                  border: "1px solid #d9e2ec",
                  background: "#ffffff",
                  borderRadius: "10px",
                  padding: "14px",
                }}
              >
                <div
                  className="cruise-payment-sailing-grid"
                  style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "#111827",
                    marginBottom: "12px",
                  }}
                >
                  {bookingData?.title || "Cruise Booking"}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "14px",
                  }}
                >
                  <InfoRow
                    label="Route"
                    value={routeTitle}
                  />
                  <InfoRow
                    label="Sailing Dates"
                    value={sailingSummary}
                  />
                  <InfoRow
                    label="Departure Port"
                    value={bookingData?.departurePort || "On Request"}
                  />
                  <InfoRow
                    label="Arrival Port"
                    value={bookingData?.arrivalPort || "On Request"}
                  />
                </div>

                <div style={{ marginTop: "14px" }}>
                  <InfoRow label="Visiting Ports" value={portsSummary} />
                </div>
              </div>

              <SectionLabel>
                Selected Cabin Summary
              </SectionLabel>

              <div style={{ display: "grid", gap: "12px" }}>
                {selectedCabins.length > 0 ? (
                  selectedCabins.map((cabin, index) => {
                    const assignmentMeta = cabinAssignmentMeta.find(
                      (item) => item.cabinId === cabin.cabinId
                    );

                    return (
                      <div
                        key={cabin.cabinKey || index}
                        style={{
                          border: "1px solid #d9e2ec",
                          background: "#ffffff",
                          borderRadius: "10px",
                          padding: "12px 14px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "12px",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: 800,
                                color: "#111827",
                              }}
                            >
                              Cabin {index + 1}
                            </div>

                            <div
                              style={{
                                marginTop: "4px",
                                fontSize: "13px",
                                color: "#374151",
                                fontWeight: 600,
                              }}
                            >
                              {cabin.cabinName || "Selected Cabin"}
                            </div>
                          </div>

                          <div
                            style={{
                              fontSize: "14px",
                              color: "#111827",
                              fontWeight: 800,
                              whiteSpace: "nowrap",
                            }}
                          >
                            ₹{(cabin.subtotal || 0).toLocaleString("en-IN")}
                          </div>
                        </div>

                        <div
                          style={{
                            marginTop: "10px",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          {(cabin.adults || 0) > 0 ? (
                            <Pill
                              label={`Adults: ${cabin.adults}`}
                              background="#dcfce7"
                              color="#166534"
                            />
                          ) : null}

                          {(cabin.children || 0) > 0 ? (
                            <Pill
                              label={`Children: ${cabin.children}`}
                              background="#dbeafe"
                              color="#1d4ed8"
                            />
                          ) : null}

                          {(cabin.infants || 0) > 0 ? (
                            <Pill
                              label={`Infants: ${cabin.infants}`}
                              background="#ffedd5"
                              color="#c2410c"
                            />
                          ) : null}

                          <Pill
                            label={
                              assignmentMeta?.assignmentMode === "select"
                                ? "Specific Cabin"
                                : "Auto Assign"
                            }
                            background="#f3f4f6"
                            color="#374151"
                          />

                          {assignmentMeta?.deckCabinNumber ? (
                            <Pill
                              label={`Cabin No. ${assignmentMeta.deckCabinNumber}`}
                              background="#f3e8ff"
                              color="#7e22ce"
                            />
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div
                    style={{
                      border: "1px solid #d9e2ec",
                      background: "#ffffff",
                      borderRadius: "10px",
                      padding: "12px 14px",
                      fontSize: "14px",
                      color: "#4b5563",
                      fontWeight: 600,
                    }}
                  >
                    Cabin details will appear here.
                  </div>
                )}
              </div>
            </div>

            <div>
              <SectionLabel>Traveller & Booking Notes</SectionLabel>

              <div
                style={{
                  border: "1px solid #d9e2ec",
                  background: "#ffffff",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  display: "grid",
                  gap: "12px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#6b7280",
                      fontWeight: 700,
                      marginBottom: "4px",
                    }}
                  >
                    Travellers
                  </div>

                  <div style={{ display: "grid", gap: "4px" }}>
                    {(travellerValidation?.travellers || []).length > 0 ? (
                      (travellerValidation?.travellers || []).map(
                        (traveller, index) => (
                          <div
                            key={traveller.id || index}
                            style={{
                              fontSize: "14px",
                              color: "#1f2937",
                              fontWeight: 600,
                              lineHeight: "22px",
                            }}
                          >
                            {formatTravellerName(traveller)}
                            {traveller.cabinLabel
                              ? ` • ${traveller.cabinLabel}`
                              : ""}
                          </div>
                        )
                      )
                    ) : (
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#1f2937",
                          fontWeight: 600,
                          lineHeight: "22px",
                        }}
                      >
                        {totalTravellers} Traveller(s)
                      </div>
                    )}
                  </div>
                </div>

                <InfoRow label="Applied Offer" value={offerSummary} />
                <InfoRow
                  label="Additional Information"
                  value={additionalInfoSummary}
                />
                <InfoRow
  label="Cruise Base Fare"
  value={`₹${Number(
    fareData?.baseFare || pricingSummary?.cabinsTotal || 0
  ).toLocaleString("en-IN")}`}
/>

<InfoRow
  label="Offer Discount"
  value={`-₹${Number(fareData?.appliedOffer || 0).toLocaleString("en-IN")}`}
/>

<InfoRow
  label="Taxes & Fees"
  value={`₹${Number(
    fareData?.taxes || pricingSummary?.taxesAndFees || 0
  ).toLocaleString("en-IN")}`}
/>

<InfoRow
  label="TPL Credit / Wallet"
  value={`-₹${Number(fareData?.tplCredit || 0).toLocaleString("en-IN")}`}
/>

<InfoRow
  label="Insurance"
  value={`₹${Number(fareData?.insuranceTotal || 0).toLocaleString("en-IN")}`}
/>

<InfoRow
  label="Payable Amount"
  value={`₹${Number(
    fareData?.totalAmount || pricingSummary?.grandTotal || 0
  ).toLocaleString("en-IN")}`}
/>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 767px) {
          .cruise-payment-summary-head {
            flex-direction: column !important;
            padding: 16px !important;
          }

          .cruise-payment-summary-head button {
            width: 100% !important;
            border-radius: 999px !important;
            background: #ffffff !important;
            padding: 10px 14px !important;
            text-align: center !important;
          }

          .cruise-payment-summary-contact {
            flex-direction: column !important;
            padding: 14px 16px !important;
          }

          .cruise-payment-summary-contact > div {
            min-width: 0 !important;
            width: 100% !important;
          }

          .cruise-payment-details-grid,
          .cruise-payment-sailing-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
