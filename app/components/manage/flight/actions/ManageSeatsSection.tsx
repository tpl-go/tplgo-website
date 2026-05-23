"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  FlightSeatOption,
  TravellerSeatSelection,
} from "@/app/lib/flights/ancillaries/ancillaryTypes";
import { FLIGHT_ANCILLARY_CATALOG } from "@/app/lib/flights/ancillaries/ancillaryCatalog";
import { assignSeatToTraveller } from "@/app/lib/flights/ancillaries/ancillarySelection";
import { formatCurrency } from "@/app/lib/manage/manageUtils";

type TravellerItem = {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  type: "adult" | "child" | "infant";
};

interface ManageSeatsSectionProps {
  travellers: TravellerItem[];
  value: TravellerSeatSelection[];
  currency?: string;
  onChange: (next: TravellerSeatSelection[]) => void;
}

const SEAT_MAP = FLIGHT_ANCILLARY_CATALOG.seats;

function getSeatDiff(oldPrice: number, newPrice: number) {
  return Number((newPrice - oldPrice).toFixed(2));
}

function getSeatBandColors(type: FlightSeatOption["type"]) {
  switch (type) {
    case "premium":
      return { bg: "#ede9fe", border: "#c4b5fd", text: "#5b21b6" };
    case "regular":
      return { bg: "#e0f2fe", border: "#7dd3fc", text: "#075985" };
    default:
      return { bg: "#ccfbf1", border: "#5eead4", text: "#115e59" };
  }
}

function getSelectionForTraveller(
  value: TravellerSeatSelection[],
  travellerId: string,
  index: number
) {
  const byId = value.find((item) => item.travellerId === travellerId);
  if (byId) return byId;
  return value[index] ?? null;
}

export default function ManageSeatsSection({
  travellers,
  value,
  currency = "INR",
  onChange,
}: ManageSeatsSectionProps) {
  const travellerIds = useMemo(() => travellers.map((item) => item.id), [travellers]);
  const [activeTravellerId, setActiveTravellerId] = useState<string>("");

  useEffect(() => {
    if (travellers.length === 0) {
      setActiveTravellerId("");
      return;
    }

    const currentStillExists = travellers.some((item) => item.id === activeTravellerId);
    if (!currentStillExists) setActiveTravellerId(travellers[0].id);
  }, [travellers, activeTravellerId]);

  const activeTravellerIndex = useMemo(() => {
    return travellers.findIndex((item) => item.id === activeTravellerId);
  }, [travellers, activeTravellerId]);

  const activeTraveller = useMemo(() => {
    return travellers.find((item) => item.id === activeTravellerId) ?? null;
  }, [activeTravellerId, travellers]);

  const activeSeatSelection = useMemo(() => {
    if (!activeTravellerId || activeTravellerIndex < 0) return null;
    return getSelectionForTraveller(value, activeTravellerId, activeTravellerIndex);
  }, [activeTravellerId, activeTravellerIndex, value]);

  const activeDiff = getSeatDiff(
    activeSeatSelection?.oldPrice ?? 0,
    activeSeatSelection?.newPrice ?? 0
  );

  const hasActiveSeatChanged =
    !!activeSeatSelection &&
    (activeSeatSelection.oldSeatCode !== activeSeatSelection.newSeatCode ||
      activeSeatSelection.oldPrice !== activeSeatSelection.newPrice ||
      activeSeatSelection.skipped);

  const totalSeatDiff = useMemo(() => {
    return value.reduce((sum, item) => sum + getSeatDiff(item.oldPrice, item.newPrice), 0);
  }, [value]);

  const hasAnyPreloadedSeat = useMemo(() => {
    return value.some((item) => item.oldSeatCode || item.newSeatCode);
  }, [value]);

  const handleSeatSelect = (seat: FlightSeatOption) => {
    if (!activeTravellerId) return;

    const nextSelections = assignSeatToTraveller({
      current: value,
      travellerIds,
      travellerId: activeTravellerId,
      seat,
    });

    onChange(nextSelections);
  };

  const handleResetSeat = (travellerId: string) => {
    const next = value.map((item) =>
      item.travellerId === travellerId
        ? {
            ...item,
            newSeatCode: item.oldSeatCode ?? null,
            newPrice: item.oldPrice,
            skipped: false,
          }
        : item
    );

    onChange(next);
  };

  const handleRemoveSeat = (travellerId: string) => {
    const next = value.map((item) =>
      item.travellerId === travellerId
        ? {
            ...item,
            newSeatCode: null,
            newPrice: 0,
            skipped: true,
          }
        : item
    );

    onChange(next);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] lg:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff6b00]">
              Manage Seats
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#111827] md:text-2xl">
              Modify traveller seat selection
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
              Existing booked seat aur new selected seat ka comparison yahin hoga.
              Fare difference auto-calculate hoke settlement summary me chala jayega.
            </p>
          </div>

          <div className="rounded-[22px] bg-[#fff7f2] px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
              Total Seat Difference
            </p>
            <p className="mt-1 text-xl font-bold text-[#111827]">
              {formatCurrency(totalSeatDiff, currency)}
            </p>
          </div>
        </div>

        {hasAnyPreloadedSeat ? (
          <div className="mt-4 rounded-[20px] border border-[#dbeafe] bg-[#f8fbff] px-4 py-3 text-sm font-medium text-[#1d4ed8]">
            Saved seat data loaded from booking. You can now modify, reset, or remove seats traveller-wise.
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="rounded-[28px] border border-black/5 bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
          <div className="border-b border-black/5 px-1 pb-4">
            <h3 className="text-base font-bold text-[#111827]">Travellers</h3>
            <p className="mt-1 text-sm text-[#6b7280]">
              Traveller choose karke seat update karo.
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {travellers.map((traveller, index) => {
              const selection = getSelectionForTraveller(value, traveller.id, index);
              const diff = selection ? getSeatDiff(selection.oldPrice, selection.newPrice) : 0;
              const isActive = traveller.id === activeTravellerId;
              const isChanged =
                !!selection &&
                (selection.oldSeatCode !== selection.newSeatCode ||
                  selection.oldPrice !== selection.newPrice ||
                  selection.skipped);

              return (
                <button
                  key={traveller.id}
                  type="button"
                  onClick={() => setActiveTravellerId(traveller.id)}
                  className={cn(
                    "w-full rounded-[22px] border px-4 py-4 text-left transition-all duration-200",
                    isActive
                      ? "border-[#ff6b00]/30 bg-[#fff7f2] shadow-[0_8px_22px_rgba(255,107,0,0.08)]"
                      : "border-black/5 bg-[#f8f9fb] hover:bg-[#f3f4f6]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">
                        {traveller.title} {traveller.firstName} {traveller.lastName}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#6b7280]">
                        Traveller {index + 1} • {traveller.type}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isChanged ? (
                        <span className="rounded-full bg-[#ff6b00] px-2.5 py-1 text-[10px] font-bold text-white">
                          Seat Changed
                        </span>
                      ) : null}

                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                          diff > 0
                            ? "bg-[#fff1f2] text-[#be123c]"
                            : diff < 0
                            ? "bg-[#ecfdf5] text-[#166534]"
                            : "bg-white text-[#6b7280]"
                        )}
                      >
                        {diff > 0
                          ? `+${formatCurrency(diff, currency)}`
                          : diff < 0
                          ? `-${formatCurrency(Math.abs(diff), currency)}`
                          : "No Change"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white px-3 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                        Booked
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#111827]">
                        {selection?.oldSeatCode ?? "Not Assigned"}
                      </p>
                    </div>

                    <div
                      className={cn(
                        "rounded-2xl px-3 py-3",
                        isChanged ? "bg-[#fff7f2] ring-1 ring-[#ff6b00]/20" : "bg-white"
                      )}
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                        Selected
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#111827]">
                        {selection?.skipped
                          ? "Skipped"
                          : selection?.newSeatCode ?? "Pending"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] lg:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff6b00]">
                  Active Traveller
                </p>
                <h3 className="mt-1 text-lg font-bold text-[#111827]">
                  {activeTraveller
                    ? `${activeTraveller.title} ${activeTraveller.firstName} ${activeTraveller.lastName}`
                    : "Select Traveller"}
                </h3>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Booked seat aur new seat yahan compare hogi.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => activeTravellerId && handleResetSeat(activeTravellerId)}
                  disabled={!activeTravellerId}
                  className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#f8f9fb] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reset to Booked
                </button>

                <button
                  type="button"
                  onClick={() => activeTravellerId && handleRemoveSeat(activeTravellerId)}
                  disabled={!activeTravellerId}
                  className="rounded-full border border-[#ef4444]/20 bg-[#fff5f5] px-4 py-2 text-sm font-semibold text-[#dc2626] transition hover:bg-[#fee2e2] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove Seat
                </button>
              </div>
            </div>

            {activeTraveller ? (
              <div
                className={cn(
                  "mt-5 rounded-[20px] border px-4 py-3 text-sm font-bold",
                  hasActiveSeatChanged
                    ? "border-[#fed7aa] bg-[#fff7f2] text-[#c2410c]"
                    : "border-[#dcfce7] bg-[#f0fdf4] text-[#166534]"
                )}
              >
                {hasActiveSeatChanged
                  ? `${activeTraveller.firstName}'s seat changed: ${
                      activeSeatSelection?.oldSeatCode ?? "Not Assigned"
                    } → ${
                      activeSeatSelection?.skipped
                        ? "Skipped"
                        : activeSeatSelection?.newSeatCode ?? "Pending"
                    } ${
                      activeDiff > 0
                        ? `(+${formatCurrency(activeDiff, currency)})`
                        : activeDiff < 0
                        ? `(-${formatCurrency(Math.abs(activeDiff), currency)})`
                        : "(No fare change)"
                    }`
                  : `${activeTraveller.firstName}'s seat has no change.`}
              </div>
            ) : null}

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <InfoCard
                label="Booked Seat"
                value={activeSeatSelection?.oldSeatCode ?? "Not Assigned"}
                subValue={formatCurrency(activeSeatSelection?.oldPrice ?? 0, currency)}
              />
              <InfoCard
                label="New Seat"
                value={
                  activeSeatSelection?.skipped
                    ? "Skipped"
                    : activeSeatSelection?.newSeatCode ?? "Pending"
                }
                subValue={formatCurrency(activeSeatSelection?.newPrice ?? 0, currency)}
              />
              <InfoCard
                label="Difference"
                value={formatCurrency(activeDiff, currency)}
                subValue="Auto calculated"
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] lg:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-bold text-[#111827]">Available Seats</h3>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Shared ancillary catalog se seat data aa raha hai. Later API se yahi replace hoga.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <LegendDot type="free" />
                <LegendDot type="regular" />
                <LegendDot type="premium" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
              {SEAT_MAP.map((seat) => {
                const colors = getSeatBandColors(seat.type);

                const usedByOtherTraveller = value.some(
                  (item) =>
                    item.travellerId !== activeTravellerId &&
                    item.newSeatCode === seat.seatCode &&
                    !item.skipped
                );

                const isSelected = activeSeatSelection?.newSeatCode === seat.seatCode;

                return (
                  <button
                    key={seat.seatCode}
                    type="button"
                    disabled={usedByOtherTraveller || !seat.available || !activeTravellerId}
                    onClick={() => handleSeatSelect(seat)}
                    className={cn(
                      "relative rounded-[22px] border p-4 text-left transition-all duration-200",
                      isSelected
                        ? "scale-[1.02] border-[#ff6b00] shadow-[0_16px_34px_rgba(255,107,0,0.22)] ring-4 ring-[#ff6b00]/15"
                        : "border-black/5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)]",
                      (usedByOtherTraveller || !seat.available || !activeTravellerId) &&
                        "cursor-not-allowed opacity-40"
                    )}
                    style={{ background: isSelected ? "#fff7f2" : colors.bg }}
                  >
                    {isSelected ? (
                      <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#ff6b00] text-xs font-black text-white shadow">
                        ✓
                      </span>
                    ) : null}

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-bold text-[#111827]">{seat.seatCode}</p>
                      </div>

                      {isSelected ? (
                        <span className="mr-8 rounded-full bg-[#111827] px-2 py-1 text-[10px] font-semibold text-white">
                          Selected
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                        Price
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#111827]">
                        {formatCurrency(seat.price, currency)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] lg:p-6">
            <h3 className="text-base font-bold text-[#111827]">Seat Change Summary</h3>

            <div className="mt-4 space-y-3">
              {travellers.map((traveller, index) => {
                const item = getSelectionForTraveller(value, traveller.id, index);
                if (!item) return null;

                const diff = getSeatDiff(item.oldPrice, item.newPrice);
                const isChanged =
                  item.oldSeatCode !== item.newSeatCode ||
                  item.oldPrice !== item.newPrice ||
                  item.skipped;

                return (
                  <div
                    key={traveller.id}
                    className={cn(
                      "flex flex-col gap-3 rounded-[22px] px-4 py-4 md:flex-row md:items-center md:justify-between",
                      isChanged
                        ? "border border-[#fed7aa] bg-[#fff7f2]"
                        : "bg-[#f8f9fb]"
                    )}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[#111827]">
                          {traveller.title} {traveller.firstName} {traveller.lastName}
                        </p>
                        {isChanged ? (
                          <span className="rounded-full bg-[#ff6b00] px-2 py-1 text-[10px] font-bold text-white">
                            Updated
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-[#6b7280]">
                        {item.oldSeatCode ?? "Not Assigned"} →{" "}
                        {item.skipped ? "Skipped" : item.newSeatCode ?? "Pending"}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                        Fare Difference
                      </p>
                      <p
                        className={cn(
                          "mt-1 text-sm font-bold",
                          diff > 0
                            ? "text-[#dc2626]"
                            : diff < 0
                            ? "text-[#166534]"
                            : "text-[#111827]"
                        )}
                      >
                        {diff > 0
                          ? `+ ${formatCurrency(diff, currency)}`
                          : diff < 0
                          ? `- ${formatCurrency(Math.abs(diff), currency)}`
                          : formatCurrency(0, currency)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="rounded-[22px] bg-[#f8f9fb] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
        {label}
      </p>
      <p className="mt-1 text-base font-bold text-[#111827]">{value}</p>
      {subValue ? <p className="mt-1 text-xs text-[#6b7280]">{subValue}</p> : null}
    </div>
  );
}

function LegendDot({ type }: { type: FlightSeatOption["type"] }) {
  const colors = getSeatBandColors(type);

  return (
    <span
      className="h-8 w-8 rounded-full border"
      style={{
        background: colors.bg,
        borderColor: colors.border,
      }}
    />
  );
}