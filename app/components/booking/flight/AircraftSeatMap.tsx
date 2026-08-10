"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { formatFlightMoney, type FlightCurrency } from "@/app/lib/flights/flightCurrency";

export type AircraftSeatOption = {
  id: string;
  label: string;
  code?: string;
  available: boolean;
  segmentRefs?: string[];
  travellerRefs?: string[];
  displayPrice: {
    amount: number;
    currency: FlightCurrency;
  };
  details?: Record<string, unknown>;
};

export type AircraftSeatMapData = {
  seatMapId: string;
  segmentRef: string;
  cabin?: string;
  rows: Array<{
    rowNumber: string;
    seats: AircraftSeatOption[];
  }>;
};

export type AircraftSeatAssignment = {
  id: string;
  travellerRef: string;
  segmentRef: string;
};

type TravellerContext = {
  id: string;
  label: string;
  subLabel?: string;
};

type Props = {
  seatMaps: AircraftSeatMapData[];
  selectedAssignments?: AircraftSeatAssignment[];
  selectedSeatIds?: string[];
  travellers?: TravellerContext[];
  currentSeatCodeByTraveller?: Record<string, string | null | undefined>;
  mode?: "review" | "manage";
  unavailableMessage?: string;
  onSelectionChange?: (assignments: AircraftSeatAssignment[]) => void;
  onSeatToggle?: (seatId: string) => void;
};

type SeatPosition = "window" | "aisle" | "middle";

type DerivedSeatRow = {
  rowNumber: string;
  seats: AircraftSeatOption[];
  groups: AircraftSeatOption[][];
};

type DerivedSeatLayout = {
  allLetters: string[];
  rows: DerivedSeatRow[];
};

const FEATURE_LABELS: Record<string, string> = {
  window: "Window",
  aisle: "Aisle",
  middle: "Middle",
  extraLegroom: "Extra legroom",
  exitRow: "Exit row",
  bulkhead: "Bulkhead",
  free: "Free",
  paid: "Paid",
  unavailable: "Unavailable",
  selected: "Selected",
};

export default function AircraftSeatMap({
  seatMaps,
  selectedAssignments = [],
  selectedSeatIds = [],
  travellers = [{ id: "traveller-1", label: "Traveller 1" }],
  currentSeatCodeByTraveller = {},
  mode = "review",
  unavailableMessage = "Seat selection is not available for this fare.",
  onSelectionChange,
  onSeatToggle,
}: Props) {
  const usableMaps = seatMaps.filter((map) => map.rows.some((row) => row.seats.length > 0));
  const [activeTravellerId, setActiveTravellerId] = useState(travellers[0]?.id || "traveller-1");
  const [activeMapId, setActiveMapId] = useState(usableMaps[0]?.seatMapId || "");
  const [focusedSeatId, setFocusedSeatId] = useState<string | null>(null);

  const activeMap = usableMaps.find((map) => map.seatMapId === activeMapId) || usableMaps[0] || null;
  const activeTraveller = travellers.find((item) => item.id === activeTravellerId) || travellers[0] || null;

  const derived = useMemo(() => activeMap ? deriveSeatMapLayout(activeMap) : null, [activeMap]);
  const selectedIds = useMemo(() => {
    const ids = new Set(selectedSeatIds);
    for (const item of selectedAssignments) ids.add(item.id);
    return ids;
  }, [selectedAssignments, selectedSeatIds]);

  if (!activeMap || !derived) {
    return (
      <div className="mt-3 rounded-2xl border border-[#d9e2ec] bg-white px-4 py-4 text-sm font-semibold text-[#4b5563]">
        {unavailableMessage}
      </div>
    );
  }

  const legendItems = buildLegendItems(derived);
  const activeMapIndex = Math.max(usableMaps.findIndex((map) => map.seatMapId === activeMap.seatMapId), 0);
  const focusedSeat = focusedSeatId ? findSeatInLayout(derived, focusedSeatId) : null;
  const selectedForTraveller = activeTraveller
    ? selectedAssignments.find(
        (item) => item.travellerRef === activeTraveller.id && item.segmentRef === activeMap.segmentRef
      )
    : null;
  const fallbackSelectedSeat = selectedForTraveller ? findSeatInLayout(derived, selectedForTraveller.id) : null;
  const detailSeat = focusedSeat || fallbackSelectedSeat || findFirstAvailableSeat(derived);
  const selectedSummary = buildSelectedSummary(usableMaps, travellers, selectedAssignments, selectedSeatIds);

  function handleTravellerChange(travellerId: string) {
    setActiveTravellerId(travellerId);
    const travellerSeat = selectedAssignments.find(
      (item) => item.travellerRef === travellerId && item.segmentRef === activeMap?.segmentRef
    );
    setFocusedSeatId(travellerSeat?.id || null);
  }

  function handleSegmentChange(mapId: string) {
    const nextMap = usableMaps.find((map) => map.seatMapId === mapId) || usableMaps[0] || null;
    setActiveMapId(mapId);
    const travellerSeat = selectedAssignments.find(
      (item) => item.travellerRef === activeTraveller?.id && item.segmentRef === nextMap?.segmentRef
    );
    setFocusedSeatId(travellerSeat?.id || null);
  }

  function selectSeat(seat: AircraftSeatOption) {
    setFocusedSeatId(seat.id);
    if (!activeMap || !activeTraveller || !seat.available || mode === "manage") return;
    const segmentRef = seat.segmentRefs?.[0] || activeMap.segmentRef;
    const nextAssignment = {
      id: seat.id,
      travellerRef: activeTraveller.id,
      segmentRef,
    };
    const isAlreadySelectedForTraveller = selectedAssignments.some(
      (item) =>
        item.id === seat.id &&
        item.travellerRef === activeTraveller.id &&
        item.segmentRef === segmentRef
    );

    if (onSelectionChange) {
      const withoutCurrentTravellerSegment = selectedAssignments.filter(
        (item) => !(item.travellerRef === activeTraveller.id && item.segmentRef === segmentRef)
      );
      onSelectionChange(isAlreadySelectedForTraveller ? withoutCurrentTravellerSegment : [...withoutCurrentTravellerSegment, nextAssignment]);
      return;
    }

    onSeatToggle?.(seat.id);
  }

  return (
    <div className="mt-3 space-y-4" data-testid="aircraft-seat-map">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#64748b]">
            {mode === "manage" ? "Seat change preview" : "Aircraft seat map"}
          </p>
          <h4 className="mt-1 text-base font-black text-[#111827]">
            Segment {activeMapIndex + 1}
            {activeMap.cabin ? ` · ${formatCabin(activeMap.cabin)}` : ""}
          </h4>
        </div>

        <div className="flex min-w-0 flex-col gap-2 md:items-end">
          {usableMaps.length > 1 ? (
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Seat map flight segments">
              {usableMaps.map((map, index) => {
                const selected = map.seatMapId === activeMap.seatMapId;
                return (
                  <button
                    key={map.seatMapId}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => handleSegmentChange(map.seatMapId)}
                    className={cn(
                      "min-h-10 shrink-0 rounded-full border px-3 text-xs font-black transition focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:ring-offset-2",
                      selected
                        ? "border-[#1d9bf0] bg-[#e8f6fd] text-[#0f172a]"
                        : "border-[#d9e2ec] bg-white text-[#475569] hover:border-[#93c5fd]"
                    )}
                  >
                    Segment {index + 1}
                  </button>
                );
              })}
            </div>
          ) : null}

          {travellers.length > 1 ? (
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Seat traveller selection">
              {travellers.map((traveller, index) => {
                const selected = traveller.id === activeTraveller?.id;
                const assigned = getAssignedSeatCode(usableMaps, selectedAssignments, traveller.id, activeMap.segmentRef);
                return (
                  <button
                    key={traveller.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => handleTravellerChange(traveller.id)}
                    className={cn(
                      "min-h-10 shrink-0 rounded-full border px-3 text-left text-xs font-black transition focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:ring-offset-2",
                      selected
                        ? "border-[#1d9bf0] bg-[#e8f6fd] text-[#0f172a]"
                        : "border-[#d9e2ec] bg-white text-[#475569] hover:border-[#93c5fd]"
                    )}
                  >
                    {traveller.label || `Traveller ${index + 1}`}
                    {assigned ? <span className="ml-2 text-[#1d9bf0]">{assigned}</span> : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {activeTraveller ? (
        <div className="rounded-2xl border border-[#d9e2ec] bg-[#f8fbff] px-4 py-3 text-sm font-semibold text-[#334155]">
          {activeTraveller.label}
          {activeTraveller.subLabel ? ` · ${activeTraveller.subLabel}` : ""}
          {currentSeatCodeByTraveller[activeTraveller.id] ? (
            <span className="ml-2 text-[#64748b]">
              Current seat {currentSeatCodeByTraveller[activeTraveller.id]}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-[28px] border border-[#d9e2ec] bg-[#eef6ff] px-2 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] md:px-4">
        <div className="relative mx-auto min-w-max max-w-max px-14 py-3">
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-20 w-[62%] -translate-x-1/2 border-x-2 border-t-2 border-[#7f8fa6] bg-gradient-to-b from-white via-[#f8fbff] to-[#e6eef8] shadow-[0_10px_22px_rgba(15,23,42,0.08)]"
            style={{ borderRadius: "52% 52% 18px 18px / 100% 100% 18px 18px" }}
            aria-hidden="true"
          >
            <div className="mx-auto mt-4 grid w-20 grid-cols-2 gap-2 px-3">
              <span className="h-5 rounded-full border border-[#b7c4d6] bg-[#dbeafe]" />
              <span className="h-5 rounded-full border border-[#b7c4d6] bg-[#dbeafe]" />
            </div>
          </div>

          <div className="relative pt-[58px]">
            <div
              className="pointer-events-none absolute left-[-78px] top-[43%] z-0 h-28 w-28 -translate-y-1/2 border border-[#c1ccda] bg-gradient-to-r from-[#dbeafe] to-[#f8fbff] shadow-sm"
              style={{ clipPath: "polygon(100% 0, 100% 100%, 0 78%, 0 52%)" }}
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute right-[-78px] top-[43%] z-0 h-28 w-28 -translate-y-1/2 border border-[#c1ccda] bg-gradient-to-l from-[#dbeafe] to-[#f8fbff] shadow-sm"
              style={{ clipPath: "polygon(0 0, 0 100%, 100% 78%, 100% 52%)" }}
              aria-hidden="true"
            />

            <div className="relative z-10 rounded-[46px] border-2 border-[#7f8fa6] bg-gradient-to-b from-[#f8fbff] via-white to-[#edf4fb] p-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.86),0_22px_44px_rgba(15,23,42,0.12)]">
              <div className="rounded-[36px] border border-[#c7d3e2] bg-white px-4 py-5 shadow-[inset_0_10px_28px_rgba(148,163,184,0.12)]">
                <div className="mb-4 flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#64748b]">
                  <span className="h-px w-14 bg-[#cbd5e1]" />
                  Cabin
                  <span className="h-px w-14 bg-[#cbd5e1]" />
                </div>

                <div className="space-y-2.5">
                  {derived.rows.map((row) => (
                    <div
                      key={`${activeMap.seatMapId}-${row.rowNumber}`}
                      className="grid items-center gap-2"
                      style={{ gridTemplateColumns: "36px max-content 36px" }}
                    >
                      <span className="text-center text-xs font-black text-[#64748b]">{row.rowNumber}</span>
                      <div className="flex items-center gap-2.5">
                        {row.groups.map((group, groupIndex) => (
                          <div key={`${row.rowNumber}-${groupIndex}`} className="flex items-center gap-1.5">
                            {groupIndex > 0 ? (
                              <div className="flex w-10 items-center justify-center" aria-hidden="true">
                                <span className="h-px w-full border-t border-dashed border-[#b8c4d4]" />
                              </div>
                            ) : null}
                            {group.map((seat) => {
                              const selected = selectedIds.has(seat.id);
                              const usedByOtherTraveller = selectedAssignments.some(
                                (item) =>
                                  item.id === seat.id &&
                                  item.segmentRef === (seat.segmentRefs?.[0] || activeMap.segmentRef) &&
                                  item.travellerRef !== activeTraveller?.id
                              );
                              const stateLabel = seat.available
                                ? selected
                                  ? "selected"
                                  : Number(seat.displayPrice.amount || 0) === 0
                                  ? "free"
                                  : "paid"
                                : "unavailable";
                              const featureLabels = getSeatFeatureLabels(seat, row, derived);
                              const disabled = !seat.available || usedByOtherTraveller || mode === "manage";
                              const isFocused = focusedSeatId === seat.id;

                              return (
                                <button
                                  key={seat.id}
                                  type="button"
                                  disabled={disabled}
                                  aria-pressed={selected}
                                  aria-label={buildSeatAriaLabel(seat, stateLabel, featureLabels, usedByOtherTraveller)}
                                  title={buildSeatAriaLabel(seat, stateLabel, featureLabels, usedByOtherTraveller)}
                                  onClick={() => selectSeat(seat)}
                                  className={cn(
                                    "relative flex h-[58px] w-[56px] flex-col items-center justify-center overflow-hidden rounded-[14px] border text-center transition focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:ring-offset-2",
                                    "before:absolute before:left-2 before:right-2 before:top-1 before:h-1 before:rounded-full before:content-['']",
                                    selected
                                      ? "border-[#1d9bf0] bg-[#e8f6fd] text-[#0f172a] shadow-[0_8px_18px_rgba(29,155,240,0.18)] before:bg-[#1d9bf0]"
                                      : seat.available
                                      ? "border-[#b8c4d4] bg-white text-[#0f172a] shadow-sm hover:border-[#1d9bf0] hover:shadow-md before:bg-[#d9e2ec]"
                                      : "border-[#e5e7eb] bg-[#f1f5f9] text-[#94a3b8] before:bg-[#cbd5e1]",
                                    isFocused && !selected ? "ring-2 ring-[#93c5fd] ring-offset-1" : "",
                                    usedByOtherTraveller || mode === "manage"
                                      ? "cursor-not-allowed opacity-65"
                                      : "",
                                    !seat.available
                                      ? "after:absolute after:h-px after:w-16 after:rotate-45 after:bg-[#cbd5e1] after:content-['']"
                                      : ""
                                  )}
                                >
                                  <span className="relative z-10 text-[12px] font-black leading-4">{seat.code || seat.label}</span>
                                  {seat.available ? (
                                    <span className="relative z-10 mt-0.5 rounded-full bg-[#f8fafc] px-1.5 text-[9px] font-black leading-4 text-[#475569]">
                                      {Number(seat.displayPrice.amount || 0) === 0
                                        ? "Free"
                                        : formatCompactMoney(seat)}
                                    </span>
                                  ) : (
                                    <span className="relative z-10 mt-0.5 text-[9px] font-black leading-3">Taken</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                      <span className="text-center text-xs font-black text-[#64748b]">{row.rowNumber}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            className="relative mx-auto h-16 w-[72%] border-x-2 border-b-2 border-[#7f8fa6] bg-gradient-to-b from-[#edf4fb] to-white shadow-sm"
            style={{ borderRadius: "18px 18px 70% 70% / 18px 18px 100% 100%" }}
            aria-hidden="true"
          >
            <div
              className="absolute left-1/2 top-8 h-12 w-20 -translate-x-1/2 border-x-2 border-b-2 border-[#7f8fa6] bg-white"
              style={{ borderRadius: "8px 8px 999px 999px / 8px 8px 90% 90%" }}
            />
            <div
              className="absolute left-1/2 top-10 h-9 w-32 -translate-x-1/2 border-b-2 border-[#9aa8bb]"
              style={{ borderRadius: "0 0 999px 999px" }}
            />
          </div>
        </div>
      </div>

      {detailSeat ? (
        <SeatDetailCard
          seat={detailSeat.seat}
          row={detailSeat.row}
          layout={derived}
          selected={selectedIds.has(detailSeat.seat.id)}
          travellerLabel={activeTraveller?.label || "Traveller"}
          segmentLabel={`Segment ${activeMapIndex + 1}`}
          mode={mode}
          usedByOtherTraveller={selectedAssignments.some(
            (item) =>
              item.id === detailSeat.seat.id &&
              item.segmentRef === (detailSeat.seat.segmentRefs?.[0] || activeMap.segmentRef) &&
              item.travellerRef !== activeTraveller?.id
          )}
          onSelect={() => selectSeat(detailSeat.seat)}
        />
      ) : null}

      <SelectedSeatSummary rows={selectedSummary} />

      <div className="flex flex-wrap gap-2">
        {legendItems.map((item) => (
          <span
            key={item}
            className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[#d9e2ec] bg-white px-3 text-xs font-bold text-[#334155]"
          >
            <span className={cn("h-2.5 w-2.5 rounded-full", legendDotClass(item))} />
            {FEATURE_LABELS[item]}
          </span>
        ))}
      </div>
    </div>
  );
}

function SeatDetailCard({
  seat,
  row,
  layout,
  selected,
  travellerLabel,
  segmentLabel,
  mode,
  usedByOtherTraveller,
  onSelect,
}: {
  seat: AircraftSeatOption;
  row: DerivedSeatRow;
  layout: DerivedSeatLayout;
  selected: boolean;
  travellerLabel: string;
  segmentLabel: string;
  mode: "review" | "manage";
  usedByOtherTraveller: boolean;
  onSelect: () => void;
}) {
  const featureLabels = getSeatFeatureLabels(seat, row, layout)
    .map((item) => FEATURE_LABELS[item])
    .filter(Boolean);
  const disabled = !seat.available || usedByOtherTraveller || mode === "manage";

  return (
    <div className="grid gap-3 rounded-2xl border border-[#d9e2ec] bg-white p-4 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#64748b]">Seat detail</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-xl bg-[#0f172a] px-3 py-2 text-base font-black text-white">{seat.code || seat.label}</span>
          <span className="rounded-full border border-[#d9e2ec] px-3 py-1 text-xs font-black text-[#334155]">
            {seat.available ? (Number(seat.displayPrice.amount || 0) === 0 ? "Free" : formatFlightMoney(seat.displayPrice.amount, seat.displayPrice.currency)) : "Unavailable"}
          </span>
          {selected ? (
            <span className="rounded-full bg-[#e8f6fd] px-3 py-1 text-xs font-black text-[#075985]">Selected</span>
          ) : null}
          {usedByOtherTraveller ? (
            <span className="rounded-full bg-[#fff7ed] px-3 py-1 text-xs font-black text-[#9a3412]">Assigned</span>
          ) : null}
        </div>
        <p className="mt-2 text-sm font-semibold text-[#475569]">
          {travellerLabel} · {segmentLabel}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {featureLabels.map((label) => (
            <span key={label} className="rounded-full border border-[#d9e2ec] bg-[#f8fbff] px-3 py-1 text-xs font-bold text-[#334155]">
              {label}
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onSelect}
        className={cn(
          "min-h-11 rounded-full px-5 text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:ring-offset-2",
          selected
            ? "border border-[#1d9bf0] bg-[#e8f6fd] text-[#075985]"
            : disabled
            ? "cursor-not-allowed border border-[#d9e2ec] bg-[#f1f5f9] text-[#94a3b8]"
            : "bg-[#ff6b00] text-white shadow-sm hover:bg-[#e85f00]"
        )}
      >
        {mode === "manage" ? "Preview only" : selected ? "Selected" : "Select"}
      </button>
    </div>
  );
}

function SelectedSeatSummary({ rows }: { rows: Array<{ key: string; traveller: string; segment: string; seat: string; type: string; price: string }> }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white px-4 py-3 text-sm font-semibold text-[#64748b]">
        No seat selected yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#d9e2ec] bg-white p-3 shadow-sm">
      <p className="px-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#64748b]">Selected seats</p>
      <div className="mt-2 grid gap-2 md:grid-cols-2">
        {rows.map((row) => (
          <div key={row.key} className="grid grid-cols-[1fr_auto] gap-3 rounded-xl bg-[#f8fbff] px-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-[#111827]">{row.traveller}</p>
              <p className="mt-0.5 text-xs font-semibold text-[#64748b]">{row.segment} · {row.type}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-[#111827]">{row.seat}</p>
              <p className="mt-0.5 text-xs font-black text-[#475569]">{row.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function deriveSeatMapLayout(map: AircraftSeatMapData): DerivedSeatLayout {
  const allLetters = Array.from(
    new Set(
      map.rows.flatMap((row) =>
        row.seats.map((seat) => getSeatLetter(seat)).filter((value): value is string => Boolean(value))
      )
    )
  ).sort(compareSeatLetters);
  const rowLayouts = map.rows.map((row) => {
    const seats = [...row.seats].sort((a, b) => compareSeatLetters(getSeatLetter(a) || "", getSeatLetter(b) || ""));
    return {
      rowNumber: row.rowNumber,
      seats,
      groups: groupSeatsByAisle(seats, allLetters),
    };
  });
  return { allLetters, rows: rowLayouts };
}

function groupSeatsByAisle(seats: AircraftSeatOption[], allLetters: string[]) {
  if (seats.length <= 2) return [seats];
  const indexes = seats.map((seat) => Math.max(allLetters.indexOf(getSeatLetter(seat) || ""), 0));
  const groups: AircraftSeatOption[][] = [[]];
  seats.forEach((seat, index) => {
    if (index > 0 && indexes[index] - indexes[index - 1] > 1) {
      groups.push([]);
    }
    groups[groups.length - 1].push(seat);
  });
  if (groups.length > 1) return groups;

  if (seats.length === 4) return [seats.slice(0, 2), seats.slice(2)];
  if (seats.length === 6) return [seats.slice(0, 3), seats.slice(3)];
  if (seats.length >= 9) {
    const left = 3;
    const right = seats.length >= 10 ? 3 : 2;
    return [seats.slice(0, left), seats.slice(left, seats.length - right), seats.slice(seats.length - right)];
  }
  const midpoint = Math.ceil(seats.length / 2);
  return [seats.slice(0, midpoint), seats.slice(midpoint)];
}

function findSeatInLayout(layout: DerivedSeatLayout, seatId: string) {
  for (const row of layout.rows) {
    for (const group of row.groups) {
      const seat = group.find((candidate) => candidate.id === seatId);
      if (seat) return { seat, row };
    }
  }
  return null;
}

function findFirstAvailableSeat(layout: DerivedSeatLayout) {
  for (const row of layout.rows) {
    for (const group of row.groups) {
      const seat = group.find((candidate) => candidate.available);
      if (seat) return { seat, row };
    }
  }
  return null;
}

function buildSelectedSummary(
  maps: AircraftSeatMapData[],
  travellers: TravellerContext[],
  assignments: AircraftSeatAssignment[],
  selectedSeatIds: string[]
) {
  const rows: Array<{ key: string; traveller: string; segment: string; seat: string; type: string; price: string }> = [];
  const added = new Set<string>();

  for (const assignment of assignments) {
    const map = maps.find((item) => item.segmentRef === assignment.segmentRef) || maps[0];
    const layout = map ? deriveSeatMapLayout(map) : null;
    const found = layout ? findSeatInLayout(layout, assignment.id) : null;
    if (!found || !map) continue;
    const traveller = travellers.find((item) => item.id === assignment.travellerRef);
    const row = {
      key: `${assignment.travellerRef}-${assignment.segmentRef}-${assignment.id}`,
      traveller: traveller?.label || assignment.travellerRef,
      segment: `Segment ${Math.max(maps.findIndex((item) => item.seatMapId === map.seatMapId), 0) + 1}`,
      seat: found.seat.code || found.seat.label,
      type: FEATURE_LABELS[getSeatPosition(found.seat, found.row)],
      price: seatPriceLabel(found.seat),
    };
    rows.push(row);
    added.add(assignment.id);
  }

  for (const seatId of selectedSeatIds) {
    if (added.has(seatId)) continue;
    const foundMap = maps
      .map((map) => ({ map, layout: deriveSeatMapLayout(map) }))
      .map(({ map, layout }) => ({ map, layout, found: findSeatInLayout(layout, seatId) }))
      .find((item) => item.found);
    if (!foundMap?.found) continue;
    rows.push({
      key: `selected-${seatId}`,
      traveller: "Selected",
      segment: `Segment ${Math.max(maps.findIndex((item) => item.seatMapId === foundMap.map.seatMapId), 0) + 1}`,
      seat: foundMap.found.seat.code || foundMap.found.seat.label,
      type: FEATURE_LABELS[getSeatPosition(foundMap.found.seat, foundMap.found.row)],
      price: seatPriceLabel(foundMap.found.seat),
    });
  }

  return rows;
}

function getAssignedSeatCode(
  maps: AircraftSeatMapData[],
  assignments: AircraftSeatAssignment[],
  travellerId: string,
  segmentRef: string
) {
  const assignment = assignments.find((item) => item.travellerRef === travellerId && item.segmentRef === segmentRef);
  if (!assignment) return "";
  const map = maps.find((item) => item.segmentRef === segmentRef) || maps[0];
  if (!map) return "";
  const found = findSeatInLayout(deriveSeatMapLayout(map), assignment.id);
  return found?.seat.code || found?.seat.label || "";
}

function getSeatLetter(seat: AircraftSeatOption) {
  const value = seat.code || seat.label || "";
  const match = value.match(/[A-Z]+$/i);
  return match?.[0]?.toUpperCase() || "";
}

function compareSeatLetters(a: string, b: string) {
  return a.localeCompare(b, "en", { sensitivity: "base" });
}

function getSeatFeatureLabels(
  seat: AircraftSeatOption,
  row: { groups: AircraftSeatOption[][] },
  layout: { rows: Array<{ groups: AircraftSeatOption[][] }> }
) {
  const features = new Set<string>();
  const position = getSeatPosition(seat, row);
  features.add(position);
  const text = String(seat.details?.characteristics || "").toLowerCase();
  if (text.includes("extra") || text.includes("legroom")) features.add("extraLegroom");
  if (text.includes("exit")) features.add("exitRow");
  if (text.includes("bulkhead")) features.add("bulkhead");
  if (Number(seat.displayPrice.amount || 0) === 0 && seat.available) features.add("free");
  if (Number(seat.displayPrice.amount || 0) > 0 && seat.available) features.add("paid");
  if (!seat.available) features.add("unavailable");
  if (layout.rows.some((item) => item.groups.some((group) => group.some((candidate) => candidate.id === seat.id)))) {
    return Array.from(features);
  }
  return Array.from(features);
}

function getSeatPosition(seat: AircraftSeatOption, row: { groups: AircraftSeatOption[][] }): SeatPosition {
  const group = row.groups.find((item) => item.some((candidate) => candidate.id === seat.id));
  if (!group) return "middle";
  const index = group.findIndex((candidate) => candidate.id === seat.id);
  const groupIndex = row.groups.indexOf(group);
  if ((groupIndex === 0 && index === 0) || (groupIndex === row.groups.length - 1 && index === group.length - 1)) {
    return "window";
  }
  if (index === 0 || index === group.length - 1) return "aisle";
  return "middle";
}

function buildLegendItems(layout: DerivedSeatLayout) {
  const items = new Set<string>(["available", "selected", "unavailable"]);
  for (const row of layout.rows) {
    for (const group of row.groups) {
      for (const seat of group) {
        for (const label of getSeatFeatureLabels(seat, row, layout)) items.add(label);
      }
    }
  }
  items.delete("available");
  return Array.from(items).filter((item) => FEATURE_LABELS[item]);
}

function legendDotClass(item: string) {
  if (item === "selected") return "bg-[#1d9bf0]";
  if (item === "unavailable") return "bg-[#cbd5e1]";
  if (item === "free") return "bg-[#22c55e]";
  if (item === "paid") return "bg-[#f97316]";
  if (item === "window") return "bg-[#38bdf8]";
  if (item === "aisle") return "bg-[#a855f7]";
  return "bg-[#64748b]";
}

function formatCabin(value: string) {
  return value.replace(/_/g, " ").toLowerCase();
}

function formatCompactMoney(seat: AircraftSeatOption) {
  return formatFlightMoney(seat.displayPrice.amount, seat.displayPrice.currency).replace(/\s+/g, "");
}

function seatPriceLabel(seat: AircraftSeatOption) {
  return Number(seat.displayPrice.amount || 0) === 0
    ? "Free"
    : formatFlightMoney(seat.displayPrice.amount, seat.displayPrice.currency);
}

function buildSeatAriaLabel(
  seat: AircraftSeatOption,
  stateLabel: string,
  featureLabels: string[],
  usedByOtherTraveller: boolean
) {
  const price = seat.available
    ? Number(seat.displayPrice.amount || 0) === 0
      ? "free"
      : formatFlightMoney(seat.displayPrice.amount, seat.displayPrice.currency)
    : "unavailable";
  const features = featureLabels.map((item) => FEATURE_LABELS[item]).filter(Boolean).join(", ");
  return `${seat.code || seat.label}, ${usedByOtherTraveller ? "already assigned" : FEATURE_LABELS[stateLabel] || stateLabel}, ${price}${features ? `, ${features}` : ""}`;
}
