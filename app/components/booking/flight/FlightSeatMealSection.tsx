"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FlightMealOption,
  FlightSeatOption,
  TravellerMealSelection,
  TravellerSeatSelection,
} from "@/app/lib/flights/ancillaries/ancillaryTypes";
import { FLIGHT_ANCILLARY_CATALOG } from "@/app/lib/flights/ancillaries/ancillaryCatalog";
import {
  assignSeatToTraveller,
  buildTravellerIds,
  getMealStatus,
  getSeatStatus,
  skipSeatForTraveller,
} from "@/app/lib/flights/ancillaries/ancillarySelection";
import {
  getMealTotal,
  getSeatTotal,
} from "@/app/lib/flights/ancillaries/ancillaryPricing";

type SelectedSeat = {
  travellerId: string;
  seatNumber: string;
  price: number;
};

type SelectedMeal = {
  travellerId: string;
  mealName: string;
  price: number;
};

type SeatMealPayload = {
  seats: SelectedSeat[];
  meals: SelectedMeal[];
  seatTotal: number;
  mealTotal: number;
  seatStatus: "pending" | "selected" | "skipped";
  mealStatus: "pending" | "selected" | "skipped";
};

type Props = {
  isTravellerComplete: boolean;
  travellerCount: number;
  onChange?: (payload: SeatMealPayload) => void;
};

const SEAT_MAP = FLIGHT_ANCILLARY_CATALOG.seats;
const MEALS = FLIGHT_ANCILLARY_CATALOG.meals;

function getMealById(mealId?: string | null) {
  if (!mealId) return null;
  return MEALS.find((item) => item.id === mealId) ?? null;
}

function getMealByName(name: string) {
  return MEALS.find((item) => item.name === name) ?? null;
}

export default function FlightSeatMealSection({
  isTravellerComplete,
  travellerCount,
  onChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(true);

  const [showSeatModal, setShowSeatModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showSeatSkipPopup, setShowSeatSkipPopup] = useState(false);

  const [seatSelections, setSeatSelections] = useState<TravellerSeatSelection[]>([]);
  const [mealSelections, setMealSelections] = useState<TravellerMealSelection[]>([]);
  const [mealFilter, setMealFilter] = useState<"all" | "veg" | "nonveg">("all");
  const [activeTravellerIndex, setActiveTravellerIndex] = useState(0);

  const travellerIds = useMemo(() => buildTravellerIds(travellerCount), [travellerCount]);

  useEffect(() => {
    setSeatSelections((prev) =>
      prev.filter((item) => travellerIds.includes(item.travellerId))
    );
    setMealSelections((prev) =>
      prev.filter((item) => travellerIds.includes(item.travellerId))
    );

    setActiveTravellerIndex((prev) => {
      if (travellerCount === 0) return 0;
      return Math.min(prev, travellerCount - 1);
    });
  }, [travellerCount, travellerIds]);

  const filteredMeals = useMemo(() => {
    if (mealFilter === "all") return MEALS;
    return MEALS.filter((item) => item.category === mealFilter);
  }, [mealFilter]);

  const selectedSeats: SelectedSeat[] = useMemo(() => {
    return seatSelections
      .filter((item) => item.newSeatCode)
      .map((item) => ({
        travellerId: item.travellerId,
        seatNumber: item.newSeatCode!,
        price: item.newPrice,
      }));
  }, [seatSelections]);

  const selectedMeals: SelectedMeal[] = useMemo(() => {
    return mealSelections
      .filter((item) => item.newMealId)
      .map((item) => {
        const meal = getMealById(item.newMealId);
        return {
          travellerId: item.travellerId,
          mealName: meal?.name ?? "Unknown Meal",
          price: item.newPrice,
        };
      });
  }, [mealSelections]);

  const seatStatus = useMemo<"pending" | "selected" | "skipped">(() => {
    return getSeatStatus(seatSelections, travellerCount);
  }, [seatSelections, travellerCount]);

  const mealStatus = useMemo<"pending" | "selected" | "skipped">(() => {
    return getMealStatus(mealSelections, travellerCount);
  }, [mealSelections, travellerCount]);

  const mealSelectedCount = useMemo(() => {
    return mealSelections.filter((item) => item.newMealId && !item.skipped).length;
  }, [mealSelections]);

  const mealQuantities = useMemo(() => {
    const map: Record<string, number> = {};

    mealSelections.forEach((item) => {
      const meal = getMealById(item.newMealId);
      if (!meal) return;
      map[meal.name] = (map[meal.name] || 0) + 1;
    });

    return map;
  }, [mealSelections]);

  const pushChange = (
    nextSeats: SelectedSeat[],
    nextMeals: SelectedMeal[],
    nextSeatStatus: "pending" | "selected" | "skipped",
    nextMealStatus: "pending" | "selected" | "skipped"
  ) => {
    onChange?.({
      seats: nextSeats,
      meals: nextMeals,
      seatTotal: nextSeats.reduce((sum, item) => sum + item.price, 0),
      mealTotal: nextMeals.reduce((sum, item) => sum + item.price, 0),
      seatStatus: nextSeatStatus,
      mealStatus: nextMealStatus,
    });
  };

  useEffect(() => {
    pushChange(selectedSeats, selectedMeals, seatStatus, mealStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeats, selectedMeals, seatStatus, mealStatus]);

  const handleSeatSelect = (seat: FlightSeatOption) => {
    const currentTravellerId = travellerIds[activeTravellerIndex];
    if (!currentTravellerId) return;

    const nextSelections = assignSeatToTraveller({
      current: seatSelections,
      travellerIds,
      travellerId: currentTravellerId,
      seat,
    });

    setSeatSelections(nextSelections);

    if (activeTravellerIndex < travellerCount - 1) {
      setActiveTravellerIndex((prev) => prev + 1);
    }
  };

  const handleTravellerSeatSkip = () => {
    const currentTravellerId = travellerIds[activeTravellerIndex];
    if (!currentTravellerId) return;

    const nextSelections = skipSeatForTraveller({
      current: seatSelections,
      travellerIds,
      travellerId: currentTravellerId,
    });

    setSeatSelections(nextSelections);
    setShowSeatSkipPopup(false);

    if (activeTravellerIndex < travellerCount - 1) {
      setActiveTravellerIndex((prev) => prev + 1);
    } else {
      setShowSeatModal(false);
    }
  };

  const handleRemoveSeat = (travellerId: string) => {
    const updated = seatSelections.filter((item) => item.travellerId !== travellerId);
    setSeatSelections(updated);

    const index = travellerIds.indexOf(travellerId);
    if (index >= 0) {
      setActiveTravellerIndex(index);
    }
  };

  const handleMealIncrement = (meal: FlightMealOption) => {
    if (mealSelectedCount >= travellerCount) return;

    const alreadyAssignedIds = mealSelections.map((item) => item.travellerId);
    const nextTravellerId = travellerIds.find((id) => !alreadyAssignedIds.includes(id));
    if (!nextTravellerId) return;

    const updated: TravellerMealSelection[] = [
      ...mealSelections.filter((item) => item.travellerId !== nextTravellerId),
      {
        travellerId: nextTravellerId,
        oldMealId: null,
        oldPrice: 0,
        newMealId: meal.id,
        newPrice: meal.price,
        skipped: false,
      },
    ].sort(
      (a, b) => travellerIds.indexOf(a.travellerId) - travellerIds.indexOf(b.travellerId)
    );

    setMealSelections(updated);
  };

  const handleMealDecrement = (meal: FlightMealOption) => {
    const matchingSelections = mealSelections
      .filter((item) => item.newMealId === meal.id)
      .sort(
        (a, b) => travellerIds.indexOf(b.travellerId) - travellerIds.indexOf(a.travellerId)
      );

    const lastAssigned = matchingSelections[0];
    if (!lastAssigned) return;

    const updated = mealSelections.filter(
      (item) => item.travellerId !== lastAssigned.travellerId
    );

    setMealSelections(updated);
  };

  const handleSkipMeals = () => {
    const updated: TravellerMealSelection[] = travellerIds.map((travellerId) => {
      const existing = mealSelections.find((item) => item.travellerId === travellerId);

      return {
        travellerId,
        oldMealId: existing?.oldMealId ?? null,
        oldPrice: existing?.oldPrice ?? 0,
        newMealId: null,
        newPrice: 0,
        skipped: true,
      };
    });

    setMealSelections(updated);
    setShowMealModal(false);
  };

  const handleRemoveMealByName = (mealName: string) => {
    const meal = getMealByName(mealName);
    if (!meal) return;

    const matchingSelections = mealSelections
      .filter((item) => item.newMealId === meal.id)
      .sort(
        (a, b) => travellerIds.indexOf(b.travellerId) - travellerIds.indexOf(a.travellerId)
      );

    const lastAssigned = matchingSelections[0];
    if (!lastAssigned) return;

    const updated = mealSelections.filter(
      (item) => item.travellerId !== lastAssigned.travellerId
    );

    setMealSelections(updated);
  };

  const currentTravellerSeatDecision = seatSelections.find(
    (item) => item.travellerId === travellerIds[activeTravellerIndex]
  );

  const seatSummaryText =
    seatStatus === "selected"
      ? travellerIds
          .map((travellerId, index) => {
            const item = seatSelections.find((seat) => seat.travellerId === travellerId);
            return item?.skipped
              ? `T${index + 1}: Skipped`
              : item?.newSeatCode
              ? `T${index + 1}: ${item.newSeatCode}`
              : `T${index + 1}: Pending`;
          })
          .join(" | ")
      : seatStatus === "skipped"
      ? "All traveller seats skipped"
      : "Please assign seat or skip for all travellers";

  const mealSummaryText =
    mealStatus === "selected"
      ? Object.entries(mealQuantities)
          .map(([name, qty]) => `${name} x${qty}`)
          .join(" | ")
      : mealStatus === "skipped"
      ? "Meal skipped"
      : "Please select meals for all travellers or skip";

  const seatTotal = useMemo(() => getSeatTotal(seatSelections), [seatSelections]);
  const mealTotal = useMemo(() => getMealTotal(mealSelections), [mealSelections]);

  return (
    <>
      <section id="seat-meal">
        <div style={sectionHeaderStyle} onClick={() => setIsOpen((prev) => !prev)}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "999px",
                background: isTravellerComplete ? "#22c55e" : "#d9534f",
                color: "#fff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 800,
              }}
            >
              {isTravellerComplete ? "✓" : "!"}
            </span>

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
          <div style={{ padding: "18px", background: "#ffffff", borderTop: "1px solid #e5e7eb" }}>
            {!isTravellerComplete ? (
              <div style={lockedBoxStyle}>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#111827" }}>
                  Seat & Meal locked
                </div>
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "14px",
                    color: "#6b7280",
                    lineHeight: "22px",
                  }}
                >
                  Please fill Traveller Detail first to continue with seat and meal selection.
                </div>
              </div>
            ) : (
              <div style={cardStyle}>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#111827" }}>
                  Enhance your journey
                </div>

                <div
                  style={{
                    marginTop: "14px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "14px",
                  }}
                >
                  <OptionCard
                    title="Seat Selection"
                    subtitle={seatSummaryText}
                    cta={seatStatus === "pending" ? "Add Seats" : "Edit Seats"}
                    onClick={() => setShowSeatModal(true)}
                  />
                  <OptionCard
                    title="Meal Selection"
                    subtitle={mealSummaryText}
                    cta={mealStatus === "pending" ? "Add Meals" : "Edit Meals"}
                    onClick={() => setShowMealModal(true)}
                  />
                  <OptionCard
                    title="Priority Services"
                    subtitle="Fast track assistance and quick boarding options."
                    cta="View Options"
                    onClick={() => {}}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {showSeatModal && (
        <ModalOverlay onClose={() => setShowSeatModal(false)}>
          <div style={seatModalStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#111827" }}>
                Seat Selection
              </div>

              <button type="button" onClick={() => setShowSeatModal(false)} style={closeBtnStyle}>
                ×
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              <div
                style={{
                  marginBottom: "14px",
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                Select seat for Traveller {activeTravellerIndex + 1}
              </div>

              {currentTravellerSeatDecision ? (
                <div
                  style={{
                    marginBottom: "16px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  Current:{" "}
                  {currentTravellerSeatDecision.skipped
                    ? "Skipped"
                    : currentTravellerSeatDecision.newSeatCode}
                </div>
              ) : null}

              <div style={seatLegendStyle}>
                <LegendItem label="Free" color="#4fd1c5" />
                <LegendItem label="₹ 251-500" color="#bae6fd" />
                <LegendItem label="₹ 651-4625" color="#c4b5fd" />
              </div>

              <div style={seatGridWrapStyle}>
                {SEAT_MAP.map((seat) => {
                  const usedByOtherTraveller = seatSelections.some(
                    (item) =>
                      item.travellerId !== travellerIds[activeTravellerIndex] &&
                      item.newSeatCode === seat.seatCode
                  );

                  const selectedForCurrent =
                    currentTravellerSeatDecision?.newSeatCode === seat.seatCode;

                  return (
                    <button
                      key={seat.seatCode}
                      type="button"
                      onClick={() => handleSeatSelect(seat)}
                      disabled={usedByOtherTraveller}
                      style={{
                        ...seatCellStyle,
                        background:
                          seat.type === "free"
                            ? "#4fd1c5"
                            : seat.type === "regular"
                            ? "#bae6fd"
                            : "#c4b5fd",
                        border: selectedForCurrent
                          ? "2px solid #111827"
                          : "1px solid #d1d5db",
                        cursor: usedByOtherTraveller ? "not-allowed" : "pointer",
                        opacity: usedByOtherTraveller ? 0.45 : 1,
                      }}
                    >
                      {seat.seatCode}
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: "18px" }}>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>
                  Traveller Seat Decisions
                </div>

                <div style={{ marginTop: "10px", display: "grid", gap: "10px" }}>
                  {travellerIds.map((travellerId, index) => {
                    const decision = seatSelections.find((item) => item.travellerId === travellerId);

                    return (
                      <div key={travellerId} style={selectedItemRowStyle}>
                        <span>
                          Traveller {index + 1} -{" "}
                          {!decision
                            ? "Pending"
                            : decision.skipped
                            ? "Skipped"
                            : `${decision.newSeatCode} - ₹${decision.newPrice.toLocaleString("en-IN")}`}
                        </span>

                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            type="button"
                            onClick={() => setActiveTravellerIndex(index)}
                            style={smallLinkBtnStyle}
                          >
                            Edit
                          </button>

                          {decision ? (
                            <button
                              type="button"
                              onClick={() => handleRemoveSeat(travellerId)}
                              style={smallLinkBtnStyle}
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  marginTop: "16px",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                Seat Total: ₹{seatTotal.toLocaleString("en-IN")}
              </div>

              <div style={modalFooterStyle}>
                <button
                  type="button"
                  onClick={() => setShowSeatSkipPopup(true)}
                  style={secondaryBtnStyle}
                >
                  Skip This Traveller
                </button>

                <button
                  type="button"
                  onClick={() => setShowSeatModal(false)}
                  style={primaryBtnStyle}
                >
                  Confirm Seats
                </button>
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}

      {showMealModal && (
        <ModalOverlay onClose={() => setShowMealModal(false)}>
          <div style={mealModalStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#111827" }}>
                Meal Selection
              </div>

              <button type="button" onClick={() => setShowMealModal(false)} style={closeBtnStyle}>
                ×
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              <div
                style={{
                  marginBottom: "10px",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#374151",
                }}
              >
                Select meals for all travellers. Total required: {travellerCount}
              </div>

              <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                <FilterBtn active={mealFilter === "all"} onClick={() => setMealFilter("all")}>
                  All
                </FilterBtn>
                <FilterBtn active={mealFilter === "veg"} onClick={() => setMealFilter("veg")}>
                  Veg
                </FilterBtn>
                <FilterBtn active={mealFilter === "nonveg"} onClick={() => setMealFilter("nonveg")}>
                  Non Veg
                </FilterBtn>
              </div>

              <div style={mealGridStyle}>
                {filteredMeals.map((meal) => {
                  const qty = mealQuantities[meal.name] || 0;

                  return (
                    <div key={meal.id} style={mealCardStyle}>
                      <div>
                        <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>
                          {meal.name}
                        </div>
                        <div style={{ marginTop: "10px", fontSize: "15px", fontWeight: 700 }}>
                          ₹ {meal.price.toLocaleString("en-IN")}
                        </div>
                      </div>

                      <div style={qtyControlWrapStyle}>
                        <button
                          type="button"
                          onClick={() => handleMealDecrement(meal)}
                          style={qtyBtnStyle}
                        >
                          -
                        </button>
                        <span style={qtyTextStyle}>{qty}</span>
                        <button
                          type="button"
                          onClick={() => handleMealIncrement(meal)}
                          disabled={mealSelectedCount >= travellerCount}
                          style={{
                            ...qtyBtnStyle,
                            opacity: mealSelectedCount >= travellerCount ? 0.45 : 1,
                            cursor: mealSelectedCount >= travellerCount ? "not-allowed" : "pointer",
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: "18px" }}>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>
                  Selected Meals
                </div>

                <div style={{ marginTop: "10px", display: "grid", gap: "10px" }}>
                  {Object.keys(mealQuantities).length === 0 ? (
                    <div style={{ fontSize: "14px", color: "#6b7280" }}>
                      No meal selected yet.
                    </div>
                  ) : (
                    Object.entries(mealQuantities).map(([mealName, qty]) => {
                      const meal = getMealByName(mealName);
                      const total = (meal?.price || 0) * qty;

                      return (
                        <div key={mealName} style={selectedItemRowStyle}>
                          <span>
                            {mealName} x{qty} - ₹{total.toLocaleString("en-IN")}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMealByName(mealName)}
                            style={smallLinkBtnStyle}
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div
                style={{
                  marginTop: "16px",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                Meal Total: ₹{mealTotal.toLocaleString("en-IN")}
              </div>

              <div style={modalFooterStyle}>
                <button type="button" onClick={handleSkipMeals} style={secondaryBtnStyle}>
                  Skip Meals
                </button>

                <button
                  type="button"
                  onClick={() => setShowMealModal(false)}
                  style={primaryBtnStyle}
                >
                  Confirm Meals
                </button>
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}

      {showSeatSkipPopup && (
        <ModalOverlay onClose={() => setShowSeatSkipPopup(false)}>
          <div style={skipPopupStyle}>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#111827" }}>
              Skip seat selection?
            </div>

            <div
              style={{
                marginTop: "12px",
                fontSize: "15px",
                color: "#4b5563",
                lineHeight: "24px",
              }}
            >
              If you continue without selecting this traveller&apos;s seat, random seat may be
              assigned during check-in.
            </div>

            <div style={modalFooterStyle}>
              <button
                type="button"
                onClick={() => setShowSeatSkipPopup(false)}
                style={secondaryBtnStyle}
              >
                Go Back
              </button>

              <button
                type="button"
                onClick={handleTravellerSeatSkip}
                style={primaryBtnStyle}
              >
                Continue Without Seat
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </>
  );
}

function OptionCard({
  title,
  subtitle,
  cta,
  onClick,
}: {
  title: string;
  subtitle: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <div
      style={{
        border: "1px solid #d9e2ec",
        background: "#ffffff",
        padding: "16px",
        minHeight: "150px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div style={{ fontSize: "17px", fontWeight: 800, color: "#111827" }}>{title}</div>
        <div style={{ marginTop: "8px", fontSize: "14px", color: "#4b5563", lineHeight: "22px" }}>
          {subtitle}
        </div>
      </div>

      <button type="button" onClick={onClick} style={ctaBtnStyle}>
        {cta} →
      </button>
    </div>
  );
}

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: "38px",
        padding: "0 14px",
        border: active ? "2px solid #38bdf8" : "1px solid #d1d5db",
        background: active ? "#e0f2fe" : "#ffffff",
        borderRadius: "999px",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function LegendItem({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span
        style={{
          width: "14px",
          height: "14px",
          background: color,
          borderRadius: "2px",
          display: "inline-block",
        }}
      />
      <span style={{ fontSize: "13px", color: "#374151", fontWeight: 600 }}>{label}</span>
    </div>
  );
}

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ maxHeight: "90vh", overflowY: "auto" }}>
        {children}
      </div>
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

const cardStyle: React.CSSProperties = {
  border: "1px solid #d9e2ec",
  background: "#f8fbff",
  padding: "18px",
};

const lockedBoxStyle: React.CSSProperties = {
  border: "1px solid #f3d2d0",
  background: "#fff7f7",
  padding: "18px",
};

const ctaBtnStyle: React.CSSProperties = {
  marginTop: "16px",
  alignSelf: "flex-start",
  border: "none",
  background: "transparent",
  color: "#0284c7",
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
};

const seatModalStyle: React.CSSProperties = {
  width: "980px",
  maxWidth: "100%",
  background: "#ffffff",
  borderRadius: "10px",
  overflow: "hidden",
  boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
};

const mealModalStyle: React.CSSProperties = {
  width: "1100px",
  maxWidth: "100%",
  background: "#ffffff",
  borderRadius: "10px",
  overflow: "hidden",
  boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
};

const skipPopupStyle: React.CSSProperties = {
  width: "520px",
  maxWidth: "100%",
  background: "#ffffff",
  borderRadius: "10px",
  padding: "24px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
};

const modalHeaderStyle: React.CSSProperties = {
  padding: "18px 22px",
  borderBottom: "1px solid #e5e7eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const closeBtnStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  fontSize: "34px",
  lineHeight: 1,
  cursor: "pointer",
  color: "#374151",
};

const seatLegendStyle: React.CSSProperties = {
  display: "flex",
  gap: "18px",
  flexWrap: "wrap",
  marginBottom: "18px",
};

const seatGridWrapStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(6, 1fr)",
  gap: "10px",
  background: "#eef8ff",
  padding: "20px",
  borderRadius: "8px",
};

const seatCellStyle: React.CSSProperties = {
  height: "44px",
  borderRadius: "6px",
  fontWeight: 700,
  fontSize: "13px",
};

const mealGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "14px",
};

const mealCardStyle: React.CSSProperties = {
  border: "1px solid #d9e2ec",
  borderRadius: "8px",
  padding: "16px",
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  alignItems: "center",
};

const selectedItemRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
  padding: "10px 12px",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  background: "#fafafa",
  fontSize: "14px",
  fontWeight: 600,
  color: "#111827",
};

const smallLinkBtnStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#ef4444",
  fontWeight: 700,
  cursor: "pointer",
};

const modalFooterStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  marginTop: "24px",
};

const secondaryBtnStyle: React.CSSProperties = {
  height: "44px",
  padding: "0 18px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  borderRadius: "8px",
  fontWeight: 700,
  cursor: "pointer",
};

const primaryBtnStyle: React.CSSProperties = {
  height: "44px",
  padding: "0 18px",
  border: "none",
  background: "#38bdf8",
  color: "#ffffff",
  borderRadius: "8px",
  fontWeight: 800,
  cursor: "pointer",
};

const qtyControlWrapStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const qtyBtnStyle: React.CSSProperties = {
  width: "34px",
  height: "34px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  borderRadius: "8px",
  fontWeight: 800,
  fontSize: "18px",
  cursor: "pointer",
};

const qtyTextStyle: React.CSSProperties = {
  minWidth: "18px",
  textAlign: "center",
  fontSize: "16px",
  fontWeight: 800,
  color: "#111827",
};