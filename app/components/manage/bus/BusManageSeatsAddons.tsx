"use client";

import { useMemo } from "react";
import { SectionTitle, formatPrice } from "./BusManageShared";

export type BusSeatOption = {
  id?: string;
  seatNo?: string;
  seatNumber?: string;
  label?: string;
  type?: string;
  deck?: string;
  price?: number;
  available?: boolean;
};

export type BusSeatSelection = {
  travellerId?: string;
  travellerName?: string;
  oldSeatNo?: string;
  newSeatNo?: string;
  oldPrice?: number;
  newPrice?: number;
};

export type BusSeatQuote = {
  oldTotal: number;
  newTotal: number;
  difference: number;
  settlementMode: "save" | "payment" | "wallet_credit";
};

type Props = {
  currentSeats: BusSeatSelection[];
  availableSeats?: BusSeatOption[];
  quote: BusSeatQuote;
  onSeatChange: (travellerId: string, seat: BusSeatOption) => void;
  onContinue: () => void;
};

function normalizeSeat(value?: string) {
  return String(value || "").trim().toUpperCase();
}

function getSeatNo(seat: BusSeatOption) {
  return seat.seatNo || seat.seatNumber || seat.label || "";
}

function buildSeatKey(seat: BusSeatOption) {
  const seatNo = normalizeSeat(getSeatNo(seat));
  const price = Number(seat.price || 0);
  return `${seatNo}-${price}`;
}

export default function BusManageSeatsAddons({
  currentSeats,
  availableSeats = [],
  quote,
  onSeatChange,
  onContinue,
}: Props) {
  const uniqueAvailableSeats = useMemo(() => {
    const map = new Map<string, BusSeatOption>();

    availableSeats.forEach((seat) => {
      const seatNo = normalizeSeat(getSeatNo(seat));
      if (!seatNo) return;

      const key = buildSeatKey(seat);

      if (!map.has(key)) {
        map.set(key, seat);
      }
    });

    return Array.from(map.values());
  }, [availableSeats]);

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Seats / Add-ons"
        subtitle="Modify passenger seats and review fare difference before confirmation."
      />

      <div className="rounded-[24px] border border-black/5 bg-[#f8f9fb] p-4 sm:p-5">
        <p className="text-base font-bold text-[#111827]">
          Current Passenger Seats
        </p>

        <div className="mt-4 space-y-3">
          {currentSeats.length === 0 ? (
            <div className="rounded-2xl border border-black/5 bg-white p-4 text-sm font-semibold text-[#6b7280]">
              Seat details not available in payload.
            </div>
          ) : (
            currentSeats.map((item, index) => {
              const currentSeatNo = item.oldSeatNo || "";
              const selectedSeatNo = item.newSeatNo || item.oldSeatNo || "";

              return (
                <div
                  key={`${item.travellerId || "traveller"}-${index}`}
                  className="rounded-2xl border border-black/5 bg-white p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#111827]">
                        {item.travellerName || `Passenger ${index + 1}`}
                      </p>

                      <p className="mt-1 text-sm text-[#6b7280]">
                        Current Seat:{" "}
                        <span className="font-bold text-[#111827]">
                          {currentSeatNo || "-"}
                        </span>
                      </p>

                      <p className="mt-1 text-xs font-semibold text-[#6b7280]">
                        Current Price:{" "}
                        <span className="font-bold text-[#111827]">
                          {formatPrice(Number(item.oldPrice || 0))}
                        </span>
                      </p>
                    </div>

                    <div className="w-full rounded-xl bg-[#f8f9fb] px-4 py-3 md:w-auto">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                        Selected Seat
                      </p>

                      <p className="mt-1 text-sm font-black text-[#111827]">
                        {selectedSeatNo || "-"}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-[#6b7280]">
                        {formatPrice(Number(item.newPrice || 0))}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {uniqueAvailableSeats.length === 0 ? (
                      <div className="col-span-2 rounded-2xl border border-black/5 bg-[#f8f9fb] p-4 text-sm font-semibold text-[#6b7280] sm:col-span-3 md:col-span-4">
                        Available seats not found in payload.
                      </div>
                    ) : (
                      uniqueAvailableSeats.map((seat, seatIndex) => {
                        const seatNo = getSeatNo(seat);

                        const normalizedSeatNo = normalizeSeat(seatNo);
                        const normalizedCurrentSeat = normalizeSeat(
                          item.oldSeatNo
                        );
                        const normalizedSelectedSeat = normalizeSeat(
                          item.newSeatNo || item.oldSeatNo
                        );

                        const isSelected =
                          normalizedSelectedSeat === normalizedSeatNo;

                        const isCurrent =
                          normalizedCurrentSeat === normalizedSeatNo;

                        const disabled =
                          seat.available === false && !isCurrent;

                        return (
                          <button
                            key={`${item.travellerId || index}-${seatIndex}-${normalizedSeatNo}-${Number(
                              seat.price || 0
                            )}`}
                            type="button"
                            disabled={disabled}
                            onClick={() =>
                              item.travellerId &&
                              onSeatChange(item.travellerId, seat)
                            }
                            className={`min-h-[108px] rounded-2xl border px-3 py-3 text-left transition ${
                              disabled
                                ? "cursor-not-allowed border-black/5 bg-gray-100 opacity-50"
                                : isSelected
                                ? "border-[#ff6b00] bg-[#fff7f2] shadow-[0_8px_24px_rgba(255,107,0,0.08)]"
                                : "border-black/5 bg-white hover:border-[#ff6b00]/30"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="break-words text-sm font-black text-[#111827]">
                                  {seatNo || "-"}
                                </p>

                                <p className="mt-1 break-words text-xs font-semibold text-[#6b7280]">
                                  {isCurrent
                                    ? "Current Seat"
                                    : "Available Seat"}
                                  {seat.deck ? ` • ${seat.deck}` : ""}
                                </p>
                              </div>

                              {isCurrent ? (
                                <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-green-700">
                                  Current
                                </span>
                              ) : null}
                            </div>

                            <p className="mt-3 text-sm font-bold text-[#111827]">
                              {formatPrice(Number(seat.price || 0))}
                            </p>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="rounded-[24px] border border-black/5 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff6b00]">
          Settlement Summary
        </p>

        <h3 className="mt-1 text-lg font-bold text-[#111827]">
          {getSettlementTitle(quote.settlementMode)}
        </h3>

        <p className="mt-2 text-sm text-[#6b7280]">
          {getSettlementDescription(quote.settlementMode)}
        </p>

        <div className="mt-5 space-y-3">
          <Row label="Current Seat Total" value={formatPrice(quote.oldTotal)} />
          <Row label="New Seat Total" value={formatPrice(quote.newTotal)} />

          <Row
            label="Difference"
            value={
              quote.difference < 0
                ? `- ${formatPrice(Math.abs(quote.difference))}`
                : formatPrice(quote.difference)
            }
          />
        </div>

        <div className="mt-5 rounded-2xl bg-[#fff7f2] p-4">
          {quote.settlementMode === "payment" && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                  Net Payable
                </p>

                <p className="mt-1 text-xl font-bold text-[#111827]">
                  {formatPrice(quote.difference)}
                </p>
              </div>

              <button
                type="button"
                onClick={onContinue}
                className="min-h-[48px] w-full rounded-full bg-[#ff6b00] px-5 py-3 text-sm font-semibold text-white sm:w-auto"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {quote.settlementMode === "wallet_credit" && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                  Refund Wallet Credit
                </p>

                <p className="mt-1 text-xl font-bold text-[#111827]">
                  {formatPrice(Math.abs(quote.difference))}
                </p>
              </div>

              <button
                type="button"
                onClick={onContinue}
                className="min-h-[48px] w-full rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white sm:w-auto"
              >
                Save Changes
              </button>
            </div>
          )}

          {quote.settlementMode === "save" && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#111827]">
                  No payment required
                </p>

                <p className="mt-1 text-sm text-[#6b7280]">
                  Same seat price. Changes can be saved directly.
                </p>
              </div>

              <button
                type="button"
                onClick={onContinue}
                className="min-h-[48px] w-full rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white sm:w-auto"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#f8f9fb] px-4 py-3">
      <p className="min-w-0 break-words text-sm text-[#4b5563]">{label}</p>

      <p className="shrink-0 text-sm font-semibold text-[#111827]">{value}</p>
    </div>
  );
}

function getSettlementTitle(mode: BusSeatQuote["settlementMode"]) {
  if (mode === "payment") return "Seat Change Payment Required";
  if (mode === "wallet_credit") return "Refund Available";
  return "Direct Save Available";
}

function getSettlementDescription(mode: BusSeatQuote["settlementMode"]) {
  if (mode === "payment") {
    return "Selected seats are higher priced. Continue to payment to confirm this change.";
  }

  if (mode === "wallet_credit") {
    return "Selected seats are lower priced. Difference will be credited to Refund Wallet.";
  }

  return "Selected seats have the same total price.";
}
