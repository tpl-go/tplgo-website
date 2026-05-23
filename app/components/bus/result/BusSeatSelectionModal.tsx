"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  BusBoardingPoint,
  BusDroppingPoint,
  BusResultItem,
} from "@/app/lib/bus/busTypes";

type SeatDeck = "lower" | "upper";

type SeatItem = {
  id: string;
  number: string;
  price: number;
  available: boolean;
  selected: boolean;
  deck: SeatDeck;
  row: number;
  col: number;
  type: "seat" | "sleeper";
};

type ConfirmPayload = {
  bus: BusResultItem;
  selectedSeats: {
    seatNumber: string;
    price: number;
  }[];
  boardingPoint: BusBoardingPoint;
  droppingPoint: BusDroppingPoint;
  totalFare: number;
  travellerCount: number;
};

type Props = {
  bus: BusResultItem | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: ConfirmPayload) => void;
};

type StepKey = "seats" | "boarding" | "dropping";

const SPECIAL_ACTIVE_OFFER_PAYLOAD_KEY = "tplActiveOfferPayload";
const SMART_ACTIVE_OFFER_KEY = "tpl_smart_active_offer_v1";

function resolveBusBaseFare(bus: any) {
  return Number(
    bus?.baseFare ||
      bus?.fare ||
      bus?.lowestFare ||
      bus?.finalFare ||
      bus?.price ||
      bus?.originalPrice ||
      0
  );
}

function readActiveBusOffer() {
  if (typeof window === "undefined") return null;

  try {
    const specialRaw = sessionStorage.getItem(SPECIAL_ACTIVE_OFFER_PAYLOAD_KEY);

    if (specialRaw) {
      const special = JSON.parse(specialRaw);
      const service = String(special?.service || "").toLowerCase();

      if (!service || service === "bus" || service === "all") {
        return special;
      }
    }

    const smartRaw = sessionStorage.getItem(SMART_ACTIVE_OFFER_KEY);
    if (!smartRaw) return null;

    const smart = JSON.parse(smartRaw);
    const offer = smart?.offer || smart;
    const service = String(offer?.service || "").toLowerCase();

    if (service && service !== "bus" && service !== "all") return null;

    return offer;
  } catch {
    return null;
  }
}

function getOfferCode(offer: any) {
  return (
    offer?.couponCode ||
    offer?.code ||
    offer?.offerCode ||
    offer?.offer?.couponCode ||
    offer?.offer?.code ||
    ""
  );
}

function getOfferDiscountAmount(offer: any, baseAmount: number) {
  if (!offer || baseAmount <= 0) return 0;

  const minBookingValue = Number(
    offer?.rule?.minBookingValue ||
      offer?.minBookingValue ||
      offer?.offer?.rule?.minBookingValue ||
      offer?.offer?.minBookingValue ||
      0
  );

  if (minBookingValue > 0 && baseAmount < minBookingValue) return 0;

  const discountMode = String(
    offer?.discountMode || offer?.offer?.discountMode || ""
  ).toLowerCase();

  const discountValue = Number(
    offer?.discountValue || offer?.offer?.discountValue || 0
  );

  const maxDiscount = Number(
    offer?.maxDiscount || offer?.offer?.maxDiscount || discountValue || 0
  );

  let discount = 0;

  if (discountMode === "percent") {
    discount = Math.round((baseAmount * discountValue) / 100);
  } else {
    discount = Math.round(discountValue);
  }

  if (maxDiscount > 0) discount = Math.min(discount, maxDiscount);

  return Math.min(Math.max(discount, 0), baseAmount);
}

function getSeatUpgrade(
  row: number,
  col: number,
  deck: SeatDeck,
  isSleeper: boolean
) {
  if (deck === "lower") {
    if (row <= 2) return 0;
    return Math.max((row - 2) * 10 + (col - 1) * 20, 0);
  }

  const upperBase = isSleeper ? 80 : 50;
  return upperBase + row * 10 + (col - 1) * 20;
}

function buildSeatLayout(bus: BusResultItem): SeatItem[] {
  const isSleeper = bus.busLayoutType === "sleeper";
  const type = isSleeper ? "sleeper" : "seat";
  const basePrice = resolveBusBaseFare(bus);

  const lowerSeats: SeatItem[] = [];
  const upperSeats: SeatItem[] = [];

  const lowerRows = isSleeper ? 8 : 10;
  const upperRows = isSleeper ? 6 : 0;

  for (let row = 1; row <= lowerRows; row++) {
    for (let col = 1; col <= 3; col++) {
      const seatNumber = `L${row}${String.fromCharCode(64 + col)}`;
      const blocked = (row + col) % 5 === 0;
      const upgrade = getSeatUpgrade(row, col, "lower", isSleeper);

      lowerSeats.push({
        id: `lower-${seatNumber}`,
        number: seatNumber,
        price: basePrice + upgrade,
        available: !blocked,
        selected: false,
        deck: "lower",
        row,
        col,
        type,
      });
    }
  }

  for (let row = 1; row <= upperRows; row++) {
    for (let col = 1; col <= 3; col++) {
      const seatNumber = `U${row}${String.fromCharCode(64 + col)}`;
      const blocked = (row + col) % 4 === 0;
      const upgrade = getSeatUpgrade(row, col, "upper", isSleeper);

      upperSeats.push({
        id: `upper-${seatNumber}`,
        number: seatNumber,
        price: basePrice + upgrade,
        available: !blocked,
        selected: false,
        deck: "upper",
        row,
        col,
        type,
      });
    }
  }

  return [...lowerSeats, ...upperSeats];
}

export default function BusSeatSelectionModal({
  bus,
  open,
  onClose,
  onConfirm,
}: Props) {
  const [step, setStep] = useState<StepKey>("seats");
  const [seats, setSeats] = useState<SeatItem[]>([]);
  const [activeOffer, setActiveOffer] = useState<any>(null);
  const [selectedBoardingPoint, setSelectedBoardingPoint] =
    useState<BusBoardingPoint | null>(null);
  const [selectedDroppingPoint, setSelectedDroppingPoint] =
    useState<BusDroppingPoint | null>(null);

  useEffect(() => {
    if (!bus || !open) return;

    setSeats(buildSeatLayout(bus));
    setStep("seats");
    setSelectedBoardingPoint(null);
    setSelectedDroppingPoint(null);
    setActiveOffer(readActiveBusOffer());
  }, [bus, open]);

  const baseFare = useMemo(() => {
    return bus ? resolveBusBaseFare(bus) : 0;
  }, [bus]);

  const selectedSeats = useMemo(() => {
    return seats.filter((seat) => seat.selected);
  }, [seats]);

  const travellerCount = selectedSeats.length;

  const baseFareTotal = useMemo(() => {
    return baseFare * travellerCount;
  }, [baseFare, travellerCount]);

  const totalFare = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  }, [selectedSeats]);

  const seatDifferenceTotal = useMemo(() => {
    return Math.max(totalFare - baseFareTotal, 0);
  }, [totalFare, baseFareTotal]);

  const offerCode = useMemo(() => {
    return getOfferCode(activeOffer);
  }, [activeOffer]);

  const offerDiscountPerTraveller = useMemo(() => {
  return getOfferDiscountAmount(activeOffer, baseFare);
}, [activeOffer, baseFare]);

const offerDiscountTotal = useMemo(() => {
  return travellerCount > 0 ? offerDiscountPerTraveller : 0;
}, [offerDiscountPerTraveller, travellerCount]);

  const payableAfterOffer = useMemo(() => {
    return Math.max(baseFareTotal - offerDiscountTotal + seatDifferenceTotal, 0);
  }, [baseFareTotal, offerDiscountTotal, seatDifferenceTotal]);

  const lowerDeckSeats = useMemo(() => {
    return seats.filter((seat) => seat.deck === "lower");
  }, [seats]);

  const upperDeckSeats = useMemo(() => {
    return seats.filter((seat) => seat.deck === "upper");
  }, [seats]);

  if (!open || !bus) return null;

  function toggleSeat(id: string) {
    setSeats((prev) => {
      const currentSelectedCount = prev.filter((s) => s.selected).length;

      return prev.map((seat) => {
        if (seat.id !== id || !seat.available) return seat;

        if (!seat.selected && currentSelectedCount >= 6) {
          alert("Maximum 6 seats can be selected at a time");
          return seat;
        }

        return {
          ...seat,
          selected: !seat.selected,
        };
      });
    });
  }

  function handleNext() {
    if (step === "seats") {
      if (selectedSeats.length === 0) {
        alert("Please select at least 1 seat");
        return;
      }
      setStep("boarding");
      return;
    }

    if (step === "boarding") {
      if (!selectedBoardingPoint) {
        alert("Please select a boarding point");
        return;
      }
      setStep("dropping");
      return;
    }

    if (step === "dropping") {
      if (!selectedDroppingPoint) {
        alert("Please select a dropping point");
        return;
      }

      onConfirm({
        bus: bus as BusResultItem,
        selectedSeats: selectedSeats.map((seat) => ({
          seatNumber: seat.number,
          price: seat.price,
        })),
        boardingPoint: selectedBoardingPoint as BusBoardingPoint,
        droppingPoint: selectedDroppingPoint as BusDroppingPoint,
        totalFare,
        travellerCount,
      });
    }
  }

  function handleBack() {
    if (step === "dropping") {
      setStep("boarding");
      return;
    }

    if (step === "boarding") {
      setStep("seats");
      return;
    }

    onClose();
  }

  function renderSeatBox(seat: SeatItem) {
    const isSleeper = seat.type === "sleeper";
    const baseClass = isSleeper
      ? "h-[58px] w-[46px] rounded-2xl"
      : "h-[48px] w-[48px] rounded-2xl";

    let stateClass =
      "border-slate-300 bg-white text-slate-700 hover:border-sky-400 hover:bg-sky-50";
    if (!seat.available) {
      stateClass =
        "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300";
    } else if (seat.selected) {
      stateClass =
        "border-sky-600 bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-200";
    }

    const upgrade = Math.max(seat.price - baseFare, 0);

    return (
      <button
        key={seat.id}
        type="button"
        disabled={!seat.available}
        onClick={() => toggleSeat(seat.id)}
        className={`relative flex flex-col items-center justify-center border text-[11px] font-bold transition ${baseClass} ${stateClass}`}
      >
        {seat.available && upgrade === 0 && (
          <span className="absolute -top-2 rounded-full bg-emerald-50 px-1.5 py-[1px] text-[8px] font-black text-emerald-700">
            BASE
          </span>
        )}

        {seat.available && upgrade > 0 && (
          <span className="absolute -top-2 rounded-full bg-orange-50 px-1.5 py-[1px] text-[8px] font-black text-orange-700">
            +₹{upgrade}
          </span>
        )}

        <span>{seat.number}</span>
        <span className="mt-1 text-[9px] font-semibold">
          ₹{baseFare}
          {upgrade > 0 ? `+${upgrade}` : ""}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[320] flex items-center justify-center bg-black/45 px-4">
      <div className="flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Select Seats</h2>
            <p className="mt-1 text-sm text-slate-500">
              {bus.operatorName} • {bus.fromCity} → {bus.toCity}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-xl text-slate-600 transition hover:bg-slate-50"
          >
            ×
          </button>
        </div>

        <div className="border-b border-slate-200 px-6 py-3">
          <div className="flex items-center gap-4 text-sm font-semibold">
            <span className={step === "seats" ? "text-sky-600" : "text-slate-500"}>
              1. Seats
            </span>
            <span className={step === "boarding" ? "text-sky-600" : "text-slate-500"}>
              2. Boarding Point
            </span>
            <span className={step === "dropping" ? "text-sky-600" : "text-slate-500"}>
              3. Dropping Point
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === "seats" && (
            <div className="grid grid-cols-[1.4fr_0.9fr] gap-6">
              <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-white">
                  <div>
                    <p className="text-sm font-black">Premium Seat Map</p>
                    <p className="text-[11px] text-slate-300">
                      Base seats and upgrade seats are shown separately
                    </p>
                  </div>

                  <div className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold">
                    Base ₹{baseFare}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="mb-4 text-lg font-bold text-slate-900">
                      LOWER BERTH ({lowerDeckSeats.length})
                    </h3>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="mb-3 h-2 rounded-full bg-slate-200" />
                      <div className="grid grid-cols-3 gap-4">
                        {lowerDeckSeats.map(renderSeatBox)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-lg font-bold text-slate-900">
                      UPPER BERTH ({upperDeckSeats.length})
                    </h3>

                    {upperDeckSeats.length > 0 ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="mb-3 h-2 rounded-full bg-slate-200" />
                        <div className="grid grid-cols-3 gap-4">
                          {upperDeckSeats.map(renderSeatBox)}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                        Upper berth not available for this bus
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5">
                <h3 className="text-lg font-bold text-slate-900">Know your seats</h3>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="h-5 w-5 rounded border border-slate-300 bg-white" />
                    <span className="text-sm text-slate-600">Available</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="h-5 w-5 rounded border border-sky-500 bg-sky-500" />
                    <span className="text-sm text-slate-600">Selected</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="h-5 w-5 rounded border border-slate-200 bg-slate-100" />
                    <span className="text-sm text-slate-600">Booked</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">
                      BASE
                    </span>
                    <span className="text-sm text-slate-600">
                      No seat upgrade
                    </span>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">
                    Selected Seats
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedSeats.length > 0 ? (
                      selectedSeats.map((seat) => {
                        const upgrade = Math.max(seat.price - baseFare, 0);

                        return (
                          <span
                            key={seat.id}
                            className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700"
                          >
                            {seat.number} • ₹{baseFare}
                            {upgrade > 0 ? ` + ₹${upgrade}` : ""}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-sm text-slate-500">
                        No seats selected
                      </span>
                    )}
                  </div>

                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>Travellers</span>
                      <span>{travellerCount}</span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                      <span>Base Fare</span>
                      <span>
                        {travellerCount > 1
                          ? `${travellerCount} × ₹${baseFare} = `
                          : ""}
                        ₹{baseFareTotal}
                      </span>
                    </div>

                    {offerDiscountTotal > 0 && (
                      <div className="mt-2 flex items-center justify-between text-sm font-semibold text-emerald-700">
                        <span>Offer {offerCode ? `(${offerCode})` : ""}</span>
                        <span>-₹{offerDiscountTotal}</span>
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                      <span>Seat Upgrade</span>
                      <span>₹{seatDifferenceTotal}</span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-base font-bold text-slate-900">
                      <span>Total</span>
                      <span>₹{payableAfterOffer}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "boarding" && (
            <div className="grid grid-cols-[1fr_1fr] gap-6">
              <div className="rounded-2xl border border-slate-200 p-5">
                <h3 className="mb-4 text-lg font-bold text-slate-900">
                  Select Pickup & Drop Points
                </h3>

                <div className="space-y-3">
                  {bus.boardingPoints.map((point) => {
                    const active = selectedBoardingPoint?.id === point.id;

                    return (
                      <button
                        key={point.id}
                        type="button"
                        onClick={() => setSelectedBoardingPoint(point)}
                        className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-sky-500 bg-sky-50"
                            : "border-slate-200 hover:border-sky-300"
                        }`}
                      >
                        <span
                          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                            active
                              ? "border-sky-500 bg-sky-500"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {active && (
                            <span className="text-[13px] font-black leading-none text-white">
                              ✓
                            </span>
                          )}
                        </span>

                        <span className="min-w-0">
                          <p className="text-lg font-bold text-slate-900">
                            {point.time}
                          </p>
                          <p className="mt-1 text-base font-semibold text-slate-800">
                            {point.name}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {point.address}
                          </p>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5">
                <h3 className="text-lg font-bold text-slate-900">
                  Selected Seats Summary
                </h3>

                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedSeats.map((seat) => (
                    <span
                      key={seat.id}
                      className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700"
                    >
                      {seat.number}
                    </span>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Traveller Count</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {travellerCount}
                  </p>

                  <p className="mt-4 text-sm text-slate-600">Base Fare</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    ₹{baseFareTotal}
                  </p>

                  {offerDiscountTotal > 0 && (
                    <>
                      <p className="mt-4 text-sm text-emerald-700">
                        Offer {offerCode ? `(${offerCode})` : ""}
                      </p>
                      <p className="mt-1 text-lg font-bold text-emerald-700">
                        -₹{offerDiscountTotal}
                      </p>
                    </>
                  )}

                  <p className="mt-4 text-sm text-slate-600">Seat Upgrade</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    ₹{seatDifferenceTotal}
                  </p>

                  <p className="mt-4 text-sm text-slate-600">Total Fare</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    ₹{payableAfterOffer}
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === "dropping" && (
            <div className="grid grid-cols-[1fr_1fr] gap-6">
              <div className="rounded-2xl border border-slate-200 p-5">
                <h3 className="mb-4 text-lg font-bold text-slate-900">
                  Select Drop Point
                </h3>

                <div className="space-y-3">
                  {bus.droppingPoints.map((point) => {
                    const active = selectedDroppingPoint?.id === point.id;

                    return (
                      <button
                        key={point.id}
                        type="button"
                        onClick={() => setSelectedDroppingPoint(point)}
                        className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-sky-500 bg-sky-50"
                            : "border-slate-200 hover:border-sky-300"
                        }`}
                      >
                        <span
                          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                            active
                              ? "border-sky-500 bg-sky-500"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {active && (
                            <span className="text-[13px] font-black leading-none text-white">
                              ✓
                            </span>
                          )}
                        </span>

                        <span className="min-w-0">
                          <p className="text-lg font-bold text-slate-900">
                            {point.time}
                          </p>
                          <p className="mt-1 text-base font-semibold text-slate-800">
                            {point.name}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {point.address}
                          </p>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5">
                <h3 className="text-lg font-bold text-slate-900">
                  Booking Summary
                </h3>

                <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4">
                  <div>
                    <p className="text-sm text-slate-500">Bus</p>
                    <p className="text-base font-semibold text-slate-900">
                      {bus.operatorName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Seats</p>
                    <p className="text-base font-semibold text-slate-900">
                      {selectedSeats.map((seat) => seat.number).join(", ")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Boarding Point</p>
                    <p className="text-base font-semibold text-slate-900">
                      {selectedBoardingPoint?.name || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Dropping Point</p>
                    <p className="text-base font-semibold text-slate-900">
                      {selectedDroppingPoint?.name || "-"}
                    </p>
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>Base Fare</span>
                      <span>₹{baseFareTotal}</span>
                    </div>

                    {offerDiscountTotal > 0 && (
                      <div className="mt-2 flex items-center justify-between text-sm font-semibold text-emerald-700">
                        <span>Offer {offerCode ? `(${offerCode})` : ""}</span>
                        <span>-₹{offerDiscountTotal}</span>
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                      <span>Seat Upgrade</span>
                      <span>₹{seatDifferenceTotal}</span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm text-slate-500">Total Fare</p>
                      <p className="text-xl font-bold text-slate-900">
                        ₹{payableAfterOffer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {step === "seats" ? "Close" : "Back"}
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-500">
                Total{" "}
                {seatDifferenceTotal > 0
                  ? `(Incl. ₹${seatDifferenceTotal} seat upgrade)`
                  : ""}
              </p>
              <p className="text-xl font-bold text-slate-900">
                ₹{payableAfterOffer}
              </p>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="rounded-xl bg-orange-500 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
            >
              {step === "dropping" ? "BOOK NOW" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}