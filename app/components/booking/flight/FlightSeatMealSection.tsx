"use client";

import { useEffect, useState } from "react";
import { formatFlightMoney, type FlightCurrency } from "@/app/lib/flights/flightCurrency";
import AircraftSeatMap, {
  type AircraftSeatAssignment,
} from "@/app/components/booking/flight/AircraftSeatMap";

export type FlightReviewAncillaryOption = {
  id: string;
  label: string;
  code?: string;
  available: boolean;
  travellerRefs?: string[];
  segmentRefs?: string[];
  displayPrice: {
    amount: number;
    currency: FlightCurrency;
  };
  details?: Record<string, unknown>;
};

export type FlightReviewSeatMap = {
  seatMapId: string;
  segmentRef: string;
  cabin?: string;
  rows: Array<{
    rowNumber: string;
    seats: FlightReviewAncillaryOption[];
  }>;
};

type SeatMealPayload = {
  seats: {
    travellerId: string;
    seatNumber: string;
    price: number;
  }[];
  meals: {
    travellerId: string;
    mealName: string;
    price: number;
  }[];
  seatTotal: number;
  mealTotal: number;
  seatStatus: "pending" | "selected" | "skipped";
  mealStatus: "pending" | "selected" | "skipped";
};

type Props = {
  isTravellerComplete: boolean;
  travellerCount: number;
  seatOptions?: FlightReviewAncillaryOption[];
  seatMaps?: FlightReviewSeatMap[];
  mealOptions?: FlightReviewAncillaryOption[];
  selectedAncillaryIds?: string[];
  selectedSeatAssignments?: AircraftSeatAssignment[];
  isLoadingAncillaries?: boolean;
  ancillaryMessage?: string;
  onAncillaryToggle?: (id: string) => void;
  onSeatAssignmentsChange?: (assignments: AircraftSeatAssignment[]) => void;
  onChange?: (payload: SeatMealPayload) => void;
};

const EMPTY_SEAT_MEAL_PAYLOAD: SeatMealPayload = {
  seats: [],
  meals: [],
  seatTotal: 0,
  mealTotal: 0,
  seatStatus: "skipped",
  mealStatus: "skipped",
};

export default function FlightSeatMealSection({
  isTravellerComplete,
  travellerCount,
  seatOptions = [],
  seatMaps = [],
  mealOptions = [],
  selectedAncillaryIds = [],
  selectedSeatAssignments = [],
  isLoadingAncillaries = false,
  ancillaryMessage = "",
  onAncillaryToggle,
  onSeatAssignmentsChange,
  onChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const hasRealSeats = seatOptions.some((item) => item.available);
  const hasRealSeatMap = seatMaps.some((map) => map.rows.some((row) => row.seats.length > 0));
  const hasRealMeals = mealOptions.some((item) => item.available);

  useEffect(() => {
    onChange?.(EMPTY_SEAT_MEAL_PAYLOAD);
  }, [onChange, travellerCount]);

  return (
    <section id="seat-meal">
      <div
        className="max-md:px-3"
        style={sectionHeaderStyle}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={statusDotStyle}>i</span>

          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#1f2937" }}>
            Seat & Meal
          </h3>
        </div>

        <span
          style={{
            fontSize: "18px",
            color: "#55a8d8",
            fontWeight: 700,
            transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.2s ease",
          }}
        >
          ˅
        </span>
      </div>

      {isOpen && (
        <div
          className="max-md:p-3"
          style={{ padding: "18px", background: "#ffffff", borderTop: "1px solid #e5e7eb" }}
        >
          {!isTravellerComplete ? (
            <div style={lockedBoxStyle}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#111827" }}>
                Seat & Meal available after traveller details
              </div>
              <div style={bodyCopyStyle}>
                Seat and meal selection is not required to continue. Supplier-priced options
                will be shown here only after backend quote support is available.
              </div>
            </div>
          ) : (
            <div style={cardStyle}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#111827" }}>
                Seat selection
              </div>
              {isLoadingAncillaries ? (
                <div style={bodyCopyStyle}>Checking supplier seat availability.</div>
              ) : hasRealSeatMap ? (
                <SeatMapView
                  seatMaps={seatMaps}
                  selectedIds={selectedAncillaryIds}
                  selectedAssignments={selectedSeatAssignments}
                  travellerCount={travellerCount}
                  onToggle={onAncillaryToggle}
                  onAssignmentsChange={onSeatAssignmentsChange}
                />
              ) : hasRealSeats ? (
                <OptionList
                  options={seatOptions}
                  selectedIds={selectedAncillaryIds}
                  onToggle={onAncillaryToggle}
                />
              ) : (
                <div style={bodyCopyStyle}>
                  Not available for this fare yet. No seat numbers or seat prices have been
                  added to your total.
                </div>
              )}

              <div style={{ ...dividerStyle, marginTop: "16px" }} />

              <div style={{ marginTop: "16px", fontSize: "18px", fontWeight: 800, color: "#111827" }}>
                Meal preference
              </div>
              {isLoadingAncillaries ? (
                <div style={bodyCopyStyle}>Checking supplier meal availability.</div>
              ) : hasRealMeals ? (
                <OptionList
                  options={mealOptions}
                  selectedIds={selectedAncillaryIds}
                  onToggle={onAncillaryToggle}
                />
              ) : (
                <div style={bodyCopyStyle}>
                  Not available for this fare. Meal products and prices will appear only when
                  confirmed by the supplier through a backend quote.
                </div>
              )}

              {ancillaryMessage ? (
                <div style={{ ...bodyCopyStyle, color: "#92400e" }}>{ancillaryMessage}</div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function SeatMapView({
  seatMaps,
  selectedIds,
  selectedAssignments,
  travellerCount,
  onToggle,
  onAssignmentsChange,
}: {
  seatMaps: FlightReviewSeatMap[];
  selectedIds: string[];
  selectedAssignments: AircraftSeatAssignment[];
  travellerCount: number;
  onToggle?: (id: string) => void;
  onAssignmentsChange?: (assignments: AircraftSeatAssignment[]) => void;
}) {
  return (
    <AircraftSeatMap
      seatMaps={seatMaps}
      selectedSeatIds={selectedIds}
      selectedAssignments={selectedAssignments}
      travellers={Array.from({ length: Math.max(travellerCount, 1) }, (_, index) => ({
        id: `traveller-${index + 1}`,
        label: `Traveller ${index + 1}`,
      }))}
      onSeatToggle={onToggle}
      onSelectionChange={onAssignmentsChange}
      unavailableMessage="Seat selection is not available for this fare."
    />
  );
}

function OptionList({
  options,
  selectedIds,
  onToggle,
}: {
  options: FlightReviewAncillaryOption[];
  selectedIds: string[];
  onToggle?: (id: string) => void;
}) {
  return (
    <div style={{ marginTop: "12px", display: "grid", gap: "10px" }}>
      {options.filter((item) => item.available).map((item) => {
        const selected = selectedIds.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggle?.(item.id)}
            style={{
              minHeight: "44px",
              border: selected ? "2px solid #1d9bf0" : "1px solid #d9e2ec",
              background: selected ? "#eef8fb" : "#ffffff",
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: 800, color: "#111827" }}>
              {item.label}
            </span>
            <span style={{ whiteSpace: "nowrap", fontSize: "13px", fontWeight: 800, color: "#374151" }}>
              {formatFlightMoney(item.displayPrice.amount, item.displayPrice.currency)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

const sectionHeaderStyle: React.CSSProperties = {
  minHeight: "58px",
  padding: "0 18px",
  borderTop: "1px solid #d9e2ec",
  borderBottom: "1px solid #d9e2ec",
  background: "#fffdf4",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  cursor: "pointer",
};

const statusDotStyle: React.CSSProperties = {
  width: "18px",
  height: "18px",
  borderRadius: "999px",
  background: "#94a3b8",
  color: "#fff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "12px",
  fontWeight: 900,
  fontFamily: "Arial, sans-serif",
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #d9e2ec",
  background: "#f8fbff",
  padding: "18px",
};

const lockedBoxStyle: React.CSSProperties = {
  border: "1px solid #d9e2ec",
  background: "#f8fbff",
  padding: "18px",
};

const bodyCopyStyle: React.CSSProperties = {
  marginTop: "8px",
  fontSize: "14px",
  color: "#4b5563",
  lineHeight: "22px",
};

const dividerStyle: React.CSSProperties = {
  height: "1px",
  background: "#d9e2ec",
};
