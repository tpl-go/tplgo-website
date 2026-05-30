"use client";

type CruiseBookingPayload = {
  cruiseId: string;
  title: string;
  sailingDate: string | null;
  selectedCabins: number;
  cabinId?: string | null;
  deckId?: string | null;
  deckCabinId?: string | null;
  cabinNumber?: string | null;

  route?: string | null;
  visitingPorts?: string[];
  sailingStartDate?: string | null;
  sailingEndDate?: string | null;
  departurePort?: string | null;
  arrivalPort?: string | null;

  pricingSummary?: {
    cabins: {
      cabinKey: string;
      cabinId: string;
      cabinName: string;
      adults: number;
      children: number;
      infants: number;
      subtotal: number;
    }[];
    cabinsTotal: number;
    taxesAndFees: number;
    grandTotal: number;
  } | null;
  cabinAssignmentMeta?: {
    cabinId: string;
    assignmentMode: "auto" | "select";
    deckCabinNumber?: string | null;
  }[];
};

type Props = {
  bookingData: CruiseBookingPayload;
  resolvedTotalAmount?: number;
  fareBreakup?: {
    baseFare: number;
    appliedOffer: number;
    baseAfterOffer: number;
    tplCredit: number;
    totalBeforeWallet: number;
    finalPayable: number;
  };
};

function formatJourneyDate(value?: string | null) {
  if (!value) return "On Request";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  const dayName = parsed.toLocaleDateString("en-GB", {
    weekday: "short",
    timeZone: "UTC",
  });

  const dateText = parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  return `${dayName}, ${dateText}`;
}

function buildRouteText(bookingData: CruiseBookingPayload) {
  if (bookingData.route?.trim()) return bookingData.route;

  if (bookingData.departurePort && bookingData.arrivalPort) {
    return `${bookingData.departurePort} → ${bookingData.arrivalPort}`;
  }

  return "Route details will appear here";
}

function buildVisitingPortsText(bookingData: CruiseBookingPayload) {
  if (bookingData.visitingPorts?.length) {
    return bookingData.visitingPorts.join(" • ");
  }

  return "Visiting ports will appear here";
}

export default function CruiseTripSummarySection({
  bookingData,
  resolvedTotalAmount,
  fareBreakup,
}: Props) {
  const pricingSummary = bookingData.pricingSummary;
  const cabinAssignmentMeta = bookingData.cabinAssignmentMeta || [];
  const finalDisplayTotal =
    typeof resolvedTotalAmount === "number"
      ? resolvedTotalAmount
      : pricingSummary?.grandTotal || 0;
  const originalCabinTotal = fareBreakup?.baseFare ?? pricingSummary?.cabinsTotal ?? 0;
  const offerSaving = fareBreakup?.appliedOffer ?? 0;
  const offerAppliedTotal =
    fareBreakup?.baseAfterOffer ??
    Math.max(originalCabinTotal - offerSaving, 0);
  const tplCreditUsed = fareBreakup?.tplCredit ?? 0;

  const selectedCabinCount =
    pricingSummary?.cabins?.length || bookingData.selectedCabins || 0;

  const routeText = buildRouteText(bookingData);
  const visitingPortsText = buildVisitingPortsText(bookingData);

  return (
    <section id="trip-summary">
      <div
        style={{
          minHeight: "50px",
          padding: "0 16px",
          borderBottom: "1px solid #d9e2ec",
          background: "#fffdf4",
          display: "flex",
          alignItems: "center",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: 800,
            color: "#1f2937",
          }}
        >
          Cruise Details
        </h3>
      </div>

      <div
        style={{
          padding: "16px",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            border: "1px solid #d9e2ec",
            borderRadius: "16px",
            overflow: "hidden",
            background: "#ffffff",
            boxShadow: "0 8px 28px rgba(15,23,42,0.06)",
          }}
        >
          <div
            style={{
              padding: "18px",
              borderBottom: "1px solid #e5e7eb",
              background:
                "linear-gradient(180deg, #f8fbff 0%, #ffffff 55%, #fcfcff 100%)",
            }}
          >
            <div
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: "#111827",
                lineHeight: "30px",
                letterSpacing: "-0.2px",
              }}
            >
              {bookingData.title || "Cruise Booking"}
            </div>

            <div
              style={{
                marginTop: "10px",
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "7px 13px",
                  borderRadius: "999px",
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                Sailing: {formatJourneyDate(bookingData.sailingDate)}
              </span>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "7px 13px",
                  borderRadius: "999px",
                  background: "#f0fdf4",
                  color: "#15803d",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                Selected Cabins: {selectedCabinCount}
              </span>

              {bookingData.cabinNumber ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "7px 13px",
                    borderRadius: "999px",
                    background: "#faf5ff",
                    color: "#7e22ce",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  Cabin No: {bookingData.cabinNumber}
                </span>
              ) : null}
            </div>
          </div>

          <div
            style={{
              padding: "18px",
            }}
          >
            <div
              className="cruise-trip-info-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "14px",
                marginBottom: "16px",
              }}
            >
              <div style={infoCardStyle}>
                <div style={infoLabelStyle}>Route</div>
                <div style={infoValueStyle}>{routeText}</div>
              </div>

              <div style={infoCardStyle}>
                <div style={infoLabelStyle}>Visiting Ports</div>
                <div style={infoValueStyle}>{visitingPortsText}</div>
              </div>

              <div style={infoCardStyle}>
                <div style={infoLabelStyle}>Sailing Start</div>
                <div style={infoValueStyle}>
                  {formatJourneyDate(
                    bookingData.sailingStartDate || bookingData.sailingDate
                  )}
                </div>
              </div>

              <div style={infoCardStyle}>
                <div style={infoLabelStyle}>Sailing End</div>
                <div style={infoValueStyle}>
                  {formatJourneyDate(
                    bookingData.sailingEndDate || bookingData.sailingDate
                  )}
                </div>
              </div>
            </div>

            {pricingSummary?.cabins?.length ? (
              <div
                className="cruise-trip-cabin-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "14px",
                }}
              >
                {pricingSummary.cabins.map((cabin, index) => {
                  const assignmentMeta = cabinAssignmentMeta.find(
                    (item) => item.cabinId === cabin.cabinId
                  );

                  return (
                    <div
                      key={cabin.cabinKey}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "14px",
                        background:
                          "linear-gradient(180deg, #fcfcfd 0%, #f9fafb 100%)",
                        padding: "15px",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
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
                              fontWeight: 600,
                              color: "#374151",
                            }}
                          >
                            {cabin.cabinName}
                          </div>
                        </div>

                        <div
                          style={{
                            fontSize: "15px",
                            fontWeight: 800,
                            color: "#111827",
                            whiteSpace: "nowrap",
                          }}
                        >
                          ₹{cabin.subtotal.toLocaleString("en-IN")}
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: "12px",
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        {cabin.adults > 0 ? (
                          <span style={pillStyleGreen}>
                            Adults: {cabin.adults}
                          </span>
                        ) : null}

                        {cabin.children > 0 ? (
                          <span style={pillStyleBlue}>
                            Children: {cabin.children}
                          </span>
                        ) : null}

                        {cabin.infants > 0 ? (
                          <span style={pillStyleOrange}>
                            Infants: {cabin.infants}
                          </span>
                        ) : null}
                      </div>

                      <div
                        style={{
                          marginTop: "12px",
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        <span style={pillStyleNeutral}>
                          {assignmentMeta?.assignmentMode === "select"
                            ? "Specific Cabin"
                            : "Auto Assign"}
                        </span>

                        {assignmentMeta?.deckCabinNumber ? (
                          <span style={pillStylePurple}>
                            Cabin No. {assignmentMeta.deckCabinNumber}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "14px",
                  background: "#f9fafb",
                  padding: "16px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#4b5563",
                }}
              >
                Cruise booking details are ready. Cabin breakup will appear here
                once full booking payload is connected.
              </div>
            )}

            <div
              className="cruise-trip-total-grid"
              style={{
                marginTop: "18px",
                borderTop: "1px solid #e5e7eb",
                paddingTop: "16px",
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "12px",
              }}
            >
              <div style={summaryBoxStyle}>
                <div style={summaryLabelStyle}>Cabin Total</div>
                <div style={summaryValueStyle}>
                  ₹{originalCabinTotal.toLocaleString("en-IN")}
                </div>
                {offerSaving > 0 ? (
                  <div style={summaryHintStyle}>
                    Original cabin fare before offer
                  </div>
                ) : null}
              </div>

              <div style={summaryBoxStyle}>
                <div style={summaryLabelStyle}>After Offer</div>
                <div style={summaryValueStyle}>
                  ₹{offerAppliedTotal.toLocaleString("en-IN")}
                </div>
                {offerSaving > 0 ? (
                  <div style={summarySavingStyle}>
                    Saved ₹{offerSaving.toLocaleString("en-IN")}
                  </div>
                ) : (
                  <div style={summaryHintStyle}>No offer discount applied</div>
                )}
              </div>

              <div style={summaryBoxStyle}>
                <div style={summaryLabelStyle}>Taxes & Fees</div>
                <div style={summaryValueStyle}>
                  ₹{(pricingSummary?.taxesAndFees || 0).toLocaleString("en-IN")}
                </div>
              </div>

              {tplCreditUsed > 0 ? (
                <div style={summaryBoxStyle}>
                  <div style={summaryLabelStyle}>TPL Credit</div>
                  <div style={summaryCreditStyle}>
                    -₹{tplCreditUsed.toLocaleString("en-IN")}
                  </div>
                  <div style={summaryHintStyle}>
                    Wallet benefit applied
                  </div>
                </div>
              ) : null}

              <div style={summaryBoxStyle}>
                <div style={summaryLabelStyle}>Final Payable</div>
                <div style={summaryValueStyle}>
                  ₹{finalDisplayTotal.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 767px) {
          .cruise-trip-info-grid,
          .cruise-trip-cabin-grid,
          .cruise-trip-total-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

const infoCardStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
  padding: "14px",
  minHeight: "88px",
  boxShadow: "0 2px 10px rgba(15,23,42,0.04)",
};

const infoLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 700,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.4px",
};

const infoValueStyle: React.CSSProperties = {
  marginTop: "8px",
  fontSize: "15px",
  fontWeight: 700,
  color: "#111827",
  lineHeight: "22px",
};

const summaryBoxStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
  padding: "14px",
  boxShadow: "0 2px 10px rgba(15,23,42,0.04)",
};

const summaryLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 700,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.4px",
};

const summaryValueStyle: React.CSSProperties = {
  marginTop: "6px",
  fontSize: "19px",
  fontWeight: 800,
  color: "#111827",
};

const summaryHintStyle: React.CSSProperties = {
  marginTop: "6px",
  fontSize: "11px",
  fontWeight: 700,
  color: "#6b7280",
  lineHeight: "16px",
};

const summarySavingStyle: React.CSSProperties = {
  marginTop: "6px",
  fontSize: "12px",
  fontWeight: 800,
  color: "#ea580c",
};

const summaryCreditStyle: React.CSSProperties = {
  marginTop: "6px",
  fontSize: "19px",
  fontWeight: 800,
  color: "#16a34a",
};

const pillBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "5px 10px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: 700,
};

const pillStyleGreen: React.CSSProperties = {
  ...pillBase,
  background: "#dcfce7",
  color: "#166534",
};

const pillStyleBlue: React.CSSProperties = {
  ...pillBase,
  background: "#dbeafe",
  color: "#1d4ed8",
};

const pillStyleOrange: React.CSSProperties = {
  ...pillBase,
  background: "#ffedd5",
  color: "#c2410c",
};

const pillStylePurple: React.CSSProperties = {
  ...pillBase,
  background: "#f3e8ff",
  color: "#7e22ce",
};

const pillStyleNeutral: React.CSSProperties = {
  ...pillBase,
  background: "#f3f4f6",
  color: "#374151",
};
