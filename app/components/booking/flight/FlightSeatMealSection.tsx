"use client";

import { useEffect, useState } from "react";
import { formatFlightMoney, type FlightCurrency } from "@/app/lib/flights/flightCurrency";

export type FlightReviewAncillaryOption = {
  id: string;
  label: string;
  code?: string;
  available: boolean;
  displayPrice: {
    amount: number;
    currency: FlightCurrency;
  };
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
  isLoadingAncillaries?: boolean;
  ancillaryMessage?: string;
  onAncillaryToggle?: (id: string) => void;
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
  isLoadingAncillaries = false,
  ancillaryMessage = "",
  onAncillaryToggle,
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
                  onToggle={onAncillaryToggle}
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
  onToggle,
}: {
  seatMaps: FlightReviewSeatMap[];
  selectedIds: string[];
  onToggle?: (id: string) => void;
}) {
  return (
    <div style={{ marginTop: "12px", display: "grid", gap: "14px" }}>
      {seatMaps.map((seatMap, index) => (
        <div key={seatMap.seatMapId} style={seatMapPanelStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13px", fontWeight: 900, color: "#111827" }}>
              Segment {index + 1}
            </span>
            {seatMap.cabin ? (
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#4b5563", textTransform: "capitalize" }}>
                {seatMap.cabin.replace(/_/g, " ")}
              </span>
            ) : null}
          </div>

          <div style={{ marginTop: "10px", display: "grid", gap: "8px" }}>
            {seatMap.rows.map((row) => (
              <div key={`${seatMap.seatMapId}-${row.rowNumber}`} style={seatMapRowStyle}>
                <span style={seatMapRowLabelStyle}>{row.rowNumber}</span>
                <div style={seatMapSeatGridStyle}>
                  {row.seats.map((seat) => {
                    const selected = selectedIds.includes(seat.id);
                    const isFree = Number(seat.displayPrice.amount || 0) === 0;
                    return (
                      <button
                        key={seat.id}
                        type="button"
                        disabled={!seat.available}
                        onClick={() => onToggle?.(seat.id)}
                        title={seat.available ? `${seat.label} ${formatFlightMoney(seat.displayPrice.amount, seat.displayPrice.currency)}` : `${seat.label} unavailable`}
                        style={{
                          ...seatButtonStyle,
                          border: selected ? "2px solid #1d9bf0" : "1px solid #d9e2ec",
                          background: !seat.available ? "#f3f4f6" : selected ? "#eef8fb" : "#ffffff",
                          color: seat.available ? "#111827" : "#9ca3af",
                          cursor: seat.available ? "pointer" : "not-allowed",
                        }}
                      >
                        <span style={{ fontSize: "12px", fontWeight: 900 }}>{seat.code || seat.label}</span>
                        {seat.available ? (
                          <span style={{ fontSize: "10px", fontWeight: 800 }}>
                            {isFree ? "Free" : formatFlightMoney(seat.displayPrice.amount, seat.displayPrice.currency)}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
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

const seatMapPanelStyle: React.CSSProperties = {
  border: "1px solid #d9e2ec",
  background: "#ffffff",
  padding: "12px",
};

const seatMapRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "32px minmax(0, 1fr)",
  alignItems: "center",
  gap: "8px",
};

const seatMapRowLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 900,
  color: "#4b5563",
  textAlign: "center",
};

const seatMapSeatGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(54px, 1fr))",
  gap: "8px",
};

const seatButtonStyle: React.CSSProperties = {
  minHeight: "48px",
  padding: "6px 4px",
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "2px",
  textAlign: "center",
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
