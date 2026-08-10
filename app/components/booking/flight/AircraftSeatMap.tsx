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

  function selectSeat(seat: AircraftSeatOption) {
    if (!activeMap || !activeTraveller || !seat.available) return;
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
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#64748b]">
            {mode === "manage" ? "Seat change preview" : "Aircraft seat map"}
          </p>
          <h4 className="mt-1 text-base font-black text-[#111827]">
            Segment {Math.max(usableMaps.findIndex((map) => map.seatMapId === activeMap.seatMapId), 0) + 1}
            {activeMap.cabin ? ` · ${formatCabin(activeMap.cabin)}` : ""}
          </h4>
        </div>

        <div className="flex flex-wrap gap-2">
          {usableMaps.length > 1 ? (
            <select
              value={activeMap.seatMapId}
              onChange={(event) => setActiveMapId(event.target.value)}
              className="min-h-10 rounded-full border border-[#d9e2ec] bg-white px-3 text-sm font-bold text-[#111827]"
              aria-label="Select flight segment"
            >
              {usableMaps.map((map, index) => (
                <option key={map.seatMapId} value={map.seatMapId}>
                  Segment {index + 1}
                </option>
              ))}
            </select>
          ) : null}

          {travellers.length > 1 ? (
            <select
              value={activeTraveller?.id || ""}
              onChange={(event) => setActiveTravellerId(event.target.value)}
              className="min-h-10 rounded-full border border-[#d9e2ec] bg-white px-3 text-sm font-bold text-[#111827]"
              aria-label="Select traveller"
            >
              {travellers.map((traveller, index) => (
                <option key={traveller.id} value={traveller.id}>
                  {traveller.label || `Traveller ${index + 1}`}
                </option>
              ))}
            </select>
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

      <div className="overflow-x-auto rounded-[28px] border border-[#d9e2ec] bg-[#f8fbff] px-3 py-5">
        <div className="relative mx-auto min-w-max max-w-max px-10 py-2">
          <div
            className="mx-auto h-14 w-[66%] border-x-2 border-t-2 border-[#94a3b8] bg-gradient-to-b from-white to-[#f8fafc] shadow-sm"
            style={{ borderRadius: "999px 999px 18px 18px / 100% 100% 18px 18px" }}
            aria-hidden="true"
          >
            <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-[#cbd5e1]" />
          </div>

          <div className="relative">
            <div
              className="pointer-events-none absolute left-[-34px] top-[38%] h-24 w-10 rounded-l-[90%] border border-r-0 border-[#cbd5e1] bg-[#eef6ff]"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute right-[-34px] top-[38%] h-24 w-10 rounded-r-[90%] border border-l-0 border-[#cbd5e1] bg-[#eef6ff]"
              aria-hidden="true"
            />

            <div className="rounded-[34px] border-2 border-[#94a3b8] bg-[#f8fafc] p-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.82),0_16px_34px_rgba(15,23,42,0.08)]">
              <div className="rounded-[26px] border border-[#d9e2ec] bg-white px-4 py-4">
                <div className="mb-4 flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#64748b]">
                  <span className="h-px w-12 bg-[#cbd5e1]" />
                  Cabin
                  <span className="h-px w-12 bg-[#cbd5e1]" />
                </div>

                <div className="space-y-2">
                  {derived.rows.map((row) => (
                    <div
                      key={`${activeMap.seatMapId}-${row.rowNumber}`}
                      className="grid items-center gap-2"
                      style={{ gridTemplateColumns: "34px max-content 34px" }}
                    >
                      <span className="text-center text-xs font-black text-[#64748b]">{row.rowNumber}</span>
                      <div className="flex items-center gap-2">
                        {row.groups.map((group, groupIndex) => (
                          <div key={`${row.rowNumber}-${groupIndex}`} className="flex items-center gap-1.5">
                            {groupIndex > 0 ? <div className="w-7 border-t border-dashed border-[#cbd5e1]" aria-hidden="true" /> : null}
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
                                    "flex h-[52px] w-[52px] flex-col items-center justify-center rounded-[10px] border text-center transition focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:ring-offset-2",
                                    selected
                                      ? "border-[#1d9bf0] bg-[#e8f6fd] text-[#0f172a] shadow-sm"
                                      : seat.available
                                      ? "border-[#cbd5e1] bg-white text-[#0f172a] hover:border-[#1d9bf0]"
                                      : "border-[#e5e7eb] bg-[#f3f4f6] text-[#9ca3af]",
                                    usedByOtherTraveller || mode === "manage"
                                      ? "cursor-not-allowed opacity-60"
                                      : ""
                                  )}
                                >
                                  <span className="text-[12px] font-black leading-4">{seat.code || seat.label}</span>
                                  {seat.available ? (
                                    <span className="text-[9px] font-black leading-3 text-[#475569]">
                                      {Number(seat.displayPrice.amount || 0) === 0
                                        ? "Free"
                                        : formatCompactMoney(seat)}
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-black leading-3">Taken</span>
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
            className="mx-auto h-10 w-[78%] border-x-2 border-b-2 border-[#94a3b8] bg-gradient-to-b from-[#f8fafc] to-white shadow-sm"
            style={{ borderRadius: "18px 18px 999px 999px / 18px 18px 80% 80%" }}
            aria-hidden="true"
          />
          <div className="mx-auto mt-[-2px] h-4 w-[28%] rounded-b-full border-x-2 border-b-2 border-[#94a3b8] bg-white" aria-hidden="true" />
        </div>
      </div>

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

function deriveSeatMapLayout(map: AircraftSeatMapData) {
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

function buildLegendItems(layout: ReturnType<typeof deriveSeatMapLayout>) {
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
