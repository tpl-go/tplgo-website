"use client";

import { useMemo, useState } from "react";

type TravellerValidation = {
  travellers?: {
    id?: string;
    label?: string;
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

type ReviewSegment = {
  airline?: string;
  flightNumber?: string;
  from?: string;
  to?: string;
  fromCode?: string;
  toCode?: string;
  departureTime?: string;
  arrivalTime?: string;
  departureDate?: string;
  arrivalDate?: string;
  duration?: string;
  cabinBaggage?: string;
  checkinBaggage?: string;
  aircraft?: string;
  terminalFrom?: string;
  terminalTo?: string;
};

type ReviewJourney = {
  journeyLabel?: string;
  segments?: ReviewSegment[];
  layovers?: {
    airport?: string;
    code?: string;
    duration?: string;
    note?: string;
  }[];
};

type ReviewData = {
  bookingType?: "oneWay" | "roundTrip" | "multiCity";
  tripMode?: "domestic" | "international";
  cabinClass?: string;
  passengers?: {
    adults?: number;
    children?: number;
    infants?: number;
  };
  journeys?: ReviewJourney[];
};

type SeatMealData = {
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
  seatStatus?: "pending" | "selected" | "skipped";
  mealStatus?: "pending" | "selected" | "skipped";
};

type CabData = {
  cabType?: "airport" | "outstation" | "none";
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

type OfferData = {
  code?: string;
  title?: string;
  description?: string;
  discountAmount?: number;
} | null;

type Props = {
  reviewData: ReviewData;
  travellerValidation?: TravellerValidation | null;
  seatMealData?: SeatMealData;
  cabData?: CabData;
  insuranceData?: InsuranceData;
  addonsData?: AddonsData;
  offerData?: OfferData;
};

function formatDateLabel(dateStr?: string) {
  if (!dateStr) return "Travel Date Coming Soon";

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

function formatTravellerName(traveller?: {
  firstName?: string;
  lastName?: string;
  label?: string;
}) {
  const fullName = `${traveller?.firstName || ""} ${traveller?.lastName || ""}`.trim();
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

export default function FlightPaymentTopSummary({
  reviewData,
  travellerValidation,
  seatMealData,
  cabData,
  insuranceData,
  addonsData,
  offerData,
}: Props) {
  const [showDetails, setShowDetails] = useState(false);

  const passengers = reviewData?.passengers || {};
  const totalTravellers =
    (passengers.adults || 0) +
    (passengers.children || 0) +
    (passengers.infants || 0);

  const extraTravellers =
    totalTravellers > 1 ? `, +${totalTravellers - 1} traveller` : "";

  const journeys = reviewData?.journeys || [];
  const firstJourney = journeys[0];
  const lastJourney = journeys[journeys.length - 1];

  const firstSegment = firstJourney?.segments?.[0];
  const lastSegment =
    lastJourney?.segments?.[lastJourney?.segments?.length - 1] || firstSegment;

  const topRouteTitle =
    reviewData?.bookingType === "roundTrip"
      ? `${firstSegment?.fromCode || firstSegment?.from || "ORG"} → ${
          firstSegment?.toCode || firstSegment?.to || "DST"
        } → ${lastSegment?.toCode || lastSegment?.to || "ORG"}`
      : reviewData?.bookingType === "multiCity"
      ? "Multi City Flight Booking"
      : `${firstSegment?.fromCode || firstSegment?.from || "ORG"} → ${
          firstSegment?.toCode || firstSegment?.to || "DST"
        }`;

  const topDateLabel =
    reviewData?.bookingType === "roundTrip"
      ? `${formatDateLabel(firstSegment?.departureDate)} → ${formatDateLabel(
          lastJourney?.segments?.[0]?.departureDate
        )}`
      : formatDateLabel(firstSegment?.departureDate);

  const leadTraveller = travellerValidation?.travellers?.[0];

  const seatSummary = useMemo(() => {
    if (seatMealData?.seatStatus === "selected" && (seatMealData?.seats?.length || 0) > 0) {
      return (seatMealData.seats ?? [])
        .map((item, index) => `T${index + 1}: ${item.seatNumber}`)
        .join(" • ");
    }
    if (seatMealData?.seatStatus === "skipped") return "Skipped";
    return "Not selected";
  }, [seatMealData]);

  const mealSummary = useMemo(() => {
    if (seatMealData?.mealStatus === "selected" && (seatMealData?.meals?.length || 0) > 0) {
      return (seatMealData.meals ?? [])
        .map((item, index) => `T${index + 1}: ${item.mealName}`)
        .join(" • ");
    }
    if (seatMealData?.mealStatus === "skipped") return "Skipped";
    return "Not selected";
  }, [seatMealData]);

  const addonSummary = useMemo(() => {
    if (addonsData?.addonsStatus === "selected") {
      if (addonsData?.addonsLabel) return addonsData.addonsLabel;
      if (addonsData?.selectedItems?.length) return addonsData.selectedItems.join(", ");
      return "Selected";
    }
    if (addonsData?.addonsStatus === "skipped") return "Skipped";
    return "Not selected";
  }, [addonsData]);

  const insuranceSummary =
    insuranceData?.insuranceStatus === "selected"
      ? `${insuranceData?.insuranceLabel || "Selected"}${
          insuranceData?.insurancePrice
            ? ` • ₹${insuranceData.insurancePrice.toLocaleString("en-IN")}`
            : ""
        }`
      : insuranceData?.insuranceStatus === "skipped"
      ? "Skipped"
      : "Not selected";

  const cabSummary =
    cabData?.cabStatus === "selected"
      ? `${cabData?.cabLabel || "Selected"}${
          cabData?.cabPrice ? ` • ₹${cabData.cabPrice.toLocaleString("en-IN")}` : ""
        }`
      : cabData?.cabStatus === "skipped"
      ? "Skipped"
      : "Not selected";

  const offerSummary = offerData?.code
    ? `${offerData.code} • Save ₹${(offerData.discountAmount || 0).toLocaleString("en-IN")}`
    : "No offer applied";

  return (
    <section
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
            ✈️
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
            {topRouteTitle}
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
            <span>{topDateLabel}</span>
            <span>|</span>
            <span>{totalTravellers} Traveller(s)</span>
            <span>|</span>
            <span style={{ textTransform: "capitalize" }}>
              {reviewData?.bookingType || "oneWay"}
            </span>
            <span>|</span>
            <span>{reviewData?.cabinClass || "Economy"}</span>
          </div>
        </div>

        <button
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
            {(travellerValidation?.contactDetails?.countryCode || "+91")}
            -
            {travellerValidation?.contactDetails?.mobile || "0000000000"}
          </div>
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: "13px",
              color: "#6b7280",
              fontWeight: 700,
              marginBottom: "4px",
            }}
          >
            Flight Summary
          </div>

          <div
            style={{
              fontSize: "15px",
              color: "#1f2937",
              fontWeight: 700,
              textTransform: "capitalize",
            }}
          >
            {(reviewData?.tripMode || "domestic")} • {(reviewData?.bookingType || "oneWay")}
          </div>

          <div
            style={{
              marginTop: "4px",
              fontSize: "13px",
              color: "#4b5563",
              fontWeight: 500,
            }}
          >
            {topRouteTitle}
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
              gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
              gap: "18px",
            }}
          >
            <div>
              <SectionLabel>Flight Ticket Summary</SectionLabel>

              <div style={{ display: "grid", gap: "12px" }}>
                {journeys.map((journey, journeyIndex) => (
                  <div
                    key={`${journey.journeyLabel || "journey"}-${journeyIndex}`}
                    style={{
                      border: "1px solid #d9e2ec",
                      background: "#ffffff",
                      borderRadius: "10px",
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 800,
                        color: "#111827",
                        marginBottom: "10px",
                      }}
                    >
                      {journey.journeyLabel || `Journey ${journeyIndex + 1}`}
                    </div>

                    {(journey.segments || []).map((segment, segmentIndex) => (
                      <div
                        key={`${segment.flightNumber || "segment"}-${segmentIndex}`}
                        style={{
                          paddingTop: segmentIndex > 0 ? "10px" : 0,
                          marginTop: segmentIndex > 0 ? "10px" : 0,
                          borderTop:
                            segmentIndex > 0 ? "1px dashed #d1d5db" : "none",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#111827",
                          }}
                        >
                          {segment.airline || "Airline"} • {segment.flightNumber || "Flight"}
                        </div>

                        <div
                          style={{
                            marginTop: "4px",
                            fontSize: "13px",
                            color: "#374151",
                            lineHeight: "21px",
                          }}
                        >
                          {(segment.from || segment.fromCode || "Origin")} ({segment.fromCode || "--"})
                          {" → "}
                          {(segment.to || segment.toCode || "Destination")} ({segment.toCode || "--"})
                        </div>

                        <div
                          style={{
                            marginTop: "3px",
                            fontSize: "13px",
                            color: "#4b5563",
                            lineHeight: "21px",
                          }}
                        >
                          {formatDateLabel(segment.departureDate)} •{" "}
                          {segment.departureTime || "--"} - {segment.arrivalTime || "--"} •{" "}
                          {segment.duration || "--"}
                        </div>

                        <div
                          style={{
                            marginTop: "3px",
                            fontSize: "12px",
                            color: "#6b7280",
                            lineHeight: "20px",
                          }}
                        >
                          Cabin: {reviewData?.cabinClass || "Economy"} • Cabin Bag:{" "}
                          {segment.cabinBaggage || "7 Kg"} • Check-in:{" "}
                          {segment.checkinBaggage || "15 Kg"}
                        </div>

                        {journey.layovers?.[segmentIndex] ? (
                          <div
                            style={{
                              marginTop: "6px",
                              fontSize: "12px",
                              color: "#92400e",
                              fontWeight: 700,
                              background: "#fff7ed",
                              border: "1px solid #fed7aa",
                              borderRadius: "8px",
                              padding: "6px 10px",
                            }}
                          >
                            Layover: {journey.layovers[segmentIndex]?.duration || "--"} at{" "}
                            {journey.layovers[segmentIndex]?.airport || "--"} (
                            {journey.layovers[segmentIndex]?.code || "--"})
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SectionLabel>Traveller & Add-ons Summary</SectionLabel>

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

                  <div
                    style={{
                      display: "grid",
                      gap: "4px",
                    }}
                  >
                    {(travellerValidation?.travellers || []).length > 0 ? (
                      (travellerValidation?.travellers || []).map((traveller, index) => (
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
                        </div>
                      ))
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

                <InfoRow label="Seat Selection" value={seatSummary} />
                <InfoRow label="Meal Selection" value={mealSummary} />
                <InfoRow label="Cab" value={cabSummary} />
                <InfoRow label="Travel Insurance" value={insuranceSummary} />
                <InfoRow label="Add-ons" value={addonSummary} />
                <InfoRow label="Applied Offer" value={offerSummary} />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
