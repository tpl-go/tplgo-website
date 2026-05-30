"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import type {
  CruiseCabinSectionKey,
  CruiseCabinSelectionRow,
  CruiseCabinType,
  CruiseDetailExtraData,
} from "@/app/lib/cruise/cruiseDetailTypes";
import CruiseCabinSectionTabs from "./CruiseCabinSectionTabs";
import CruiseCabinCard from "./CruiseCabinCard";
import CruiseCabinDetailModal from "./CruiseCabinDetailModal";
import CruiseCabinAmenitiesModal from "./CruiseCabinAmenitiesModal";
import CruiseSailingSection from "./CruiseSailingSection";
import CruiseDiningSection from "./CruiseDiningSection";
import CruiseEntertainmentSection from "./CruiseEntertainmentSection";
import CruiseCabinPoliciesSection from "./CruiseCabinPoliciesSection";
import CruiseDeckPlanTab from "../result/CruiseDeckPlanTab";
import {
  buildCruisePricingSummary,
  type CruiseCabinPricingSummary,
} from "@/app/lib/cruise/cruiseCabinPricing";

type SelectedCabinItem = {
  cabinKey: string;
  cabinId: string;
  rows: CruiseCabinSelectionRow[];
  selectedAt: number;
};

type CabinAssignmentMode = "auto" | "select";

type SelectedDeckCabin = {
  deckId: string;
  deckTitle: string;
  cabinId: string;
  cabinNumber: string;
};

type CabinAssignmentMeta = {
  cabinId: string;
  assignmentMode: "auto" | "select";
  deckCabinNumber?: string | null;
};

type Props = {
  data: CruiseDetailExtraData;
  onCabinSelectionChange?: (selection: SelectedCabinItem[]) => void;
  onPricingSummaryChange?: (summary: CruiseCabinPricingSummary) => void;
  onTimerStateChange?: (secondsLeft: number) => void;
  onCabinAssignmentMetaChange?: (meta: CabinAssignmentMeta[]) => void;
  offerDiscount?: number;
};

function isCabinRowsValid(rows: CruiseCabinSelectionRow[]) {
  if (!rows.length) return false;

  return rows.every((row) => {
    const total = row.adults + row.children + row.infants;
    return total > 0 && row.adults >= 1 && !!row.nationality;
  });
}

function buildSelectedItemsFromRows(
  cabin: CruiseCabinType,
  rows: CruiseCabinSelectionRow[]
): SelectedCabinItem[] {
  return rows.map((row) => ({
    cabinKey: row.id.replace("-row-", "-cabin-"),
    cabinId: cabin.id,
    rows: [row],
    selectedAt: Date.now(),
  }));
}

export default function CruiseCabinTab({
  data,
  onCabinSelectionChange,
  onPricingSummaryChange,
  onTimerStateChange,
  onCabinAssignmentMetaChange,
  offerDiscount = 0,
}: Props) {
  const [activeSection, setActiveSection] =
    useState<CruiseCabinSectionKey>("cabins");

  const [detailModalCabin, setDetailModalCabin] =
    useState<CruiseCabinType | null>(null);
  const [amenitiesModalCabin, setAmenitiesModalCabin] =
    useState<CruiseCabinType | null>(null);

  const [selectedCabins, setSelectedCabins] = useState<SelectedCabinItem[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [activeExpandedCabinKey, setActiveExpandedCabinKey] = useState<
    string | null
  >(null);

  const [cabinAssignmentModes, setCabinAssignmentModes] = useState<
    Record<string, CabinAssignmentMode>
  >({});

  const [selectedDeckCabinsByCabinId, setSelectedDeckCabinsByCabinId] =
    useState<Record<string, SelectedDeckCabin | null>>({});

  const [deckPlanSelectorCabin, setDeckPlanSelectorCabin] =
    useState<CruiseCabinType | null>(null);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    onCabinSelectionChange?.(selectedCabins);
  }, [selectedCabins, onCabinSelectionChange]);

  const sortedCabins = useMemo(() => {
    const selectedCabinIdsInOrder: string[] = [];

    selectedCabins.forEach((item) => {
      if (!selectedCabinIdsInOrder.includes(item.cabinId)) {
        selectedCabinIdsInOrder.push(item.cabinId);
      }
    });

    const selectedList = selectedCabinIdsInOrder
      .map((cabinId) => data.cabins.find((cabin) => cabin.id === cabinId))
      .filter(Boolean) as CruiseCabinType[];

    const unselectedList = data.cabins.filter(
      (cabin) => !selectedCabinIdsInOrder.includes(cabin.id)
    );

    return [...selectedList, ...unselectedList];
  }, [data.cabins, selectedCabins]);

  const deckPlanSelectionAvailable = useMemo(() => {
    return data.deckPlans.some(
      (deck) =>
        deck.selectionAvailable === true &&
        Array.isArray(deck.cabins) &&
        deck.cabins.length > 0
    );
  }, [data.deckPlans]);

  const dynamicTaxesAndFees = useMemo(() => {
    const cabinsTotal = selectedCabins.reduce((sum, selected) => {
      const cabin = data.cabins.find((item) => item.id === selected.cabinId);
      if (!cabin) return sum;

      const row = selected.rows[0];
      if (!row) return sum;

      const adultFare = row.adults * cabin.pricePerPerson;
      const childFare = row.children * Math.round(cabin.pricePerPerson * 0.75);
      const infantFare = row.infants * Math.round(cabin.pricePerPerson * 0.2);

      return sum + adultFare + childFare + infantFare;
    }, 0);

    if (!cabinsTotal) return 0;
    return Math.round(cabinsTotal * 0.08) + 1500;
  }, [selectedCabins, data.cabins]);

  const pricingSummary = useMemo(() => {
    return buildCruisePricingSummary(
      selectedCabins,
      data.cabins,
      dynamicTaxesAndFees
    );
  }, [selectedCabins, data.cabins, dynamicTaxesAndFees]);

  const safeOfferDiscount = Math.min(
    Math.max(Number(offerDiscount || 0), 0),
    pricingSummary.cabinsTotal || 0
  );

  const displayCabinsTotal = Math.max(
    (pricingSummary.cabinsTotal || 0) - safeOfferDiscount,
    0
  );

  const displayGrandTotal =
    displayCabinsTotal + (pricingSummary.taxesAndFees || 0);

  useEffect(() => {
    onPricingSummaryChange?.(pricingSummary);
  }, [pricingSummary, onPricingSummaryChange]);

  useEffect(() => {
    const assignmentMeta: CabinAssignmentMeta[] = [];

    selectedCabins.forEach((item) => {
      if (assignmentMeta.some((meta) => meta.cabinId === item.cabinId)) return;

      assignmentMeta.push({
        cabinId: item.cabinId,
        assignmentMode: cabinAssignmentModes[item.cabinId] || "auto",
        deckCabinNumber:
          selectedDeckCabinsByCabinId[item.cabinId]?.cabinNumber || null,
      });
    });

    onCabinAssignmentMetaChange?.(assignmentMeta);
  }, [
    selectedCabins,
    cabinAssignmentModes,
    selectedDeckCabinsByCabinId,
    onCabinAssignmentMetaChange,
  ]);

  useEffect(() => {
    const hasAnySelected = selectedCabins.length > 0;
    if (!hasAnySelected) {
      setSecondsLeft(0);
      return;
    }

    setSecondsLeft(600);

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [selectedCabins.length]);

  useEffect(() => {
    onTimerStateChange?.(secondsLeft);
  }, [secondsLeft, onTimerStateChange]);

  const dayCountLabel = `${data.sailingPlan.length || 0} DAY PLAN`;

  const handleChooseCabin = (
    cabin: CruiseCabinType,
    rows: CruiseCabinSelectionRow[]
  ) => {
    const nextItems = buildSelectedItemsFromRows(cabin, rows);

    setSelectedCabins((prev) => {
      const remaining = prev.filter((item) => item.cabinId !== cabin.id);
      return [...remaining, ...nextItems];
    });

    setCabinAssignmentModes((prev) => ({
      ...prev,
      [cabin.id]: prev[cabin.id] || "auto",
    }));

    // yahi main fix hai: same cabin par add/update ke baad box close na ho
    setActiveExpandedCabinKey(cabin.id);
  };

  const handleRemoveCabin = (cabinKey: string) => {
    const target = selectedCabins.find((item) => item.cabinKey === cabinKey);

    setSelectedCabins((prev) => {
      const updated = prev.filter((item) => item.cabinKey !== cabinKey);

      if (target?.cabinId) {
        const stillExistsForSameCabin = updated.some(
          (item) => item.cabinId === target.cabinId
        );

        if (!stillExistsForSameCabin) {
          setCabinAssignmentModes((prevModes) => {
            const copy = { ...prevModes };
            delete copy[target.cabinId];
            return copy;
          });

          setSelectedDeckCabinsByCabinId((prevDeck) => {
            const copy = { ...prevDeck };
            delete copy[target.cabinId];
            return copy;
          });

          setActiveExpandedCabinKey((prevExpanded) =>
            prevExpanded === target.cabinId ? null : prevExpanded
          );
        } else {
          // same cabin ke aur rows/cabins bache hain to expanded hi rakho
          setActiveExpandedCabinKey(target.cabinId);
        }
      }

      return updated;
    });
  };

  const handleClearSelectionByCabin = (cabin: CruiseCabinType) => {
    setSelectedCabins((prev) =>
      prev.filter((item) => item.cabinId !== cabin.id)
    );

    setCabinAssignmentModes((prev) => {
      const copy = { ...prev };
      delete copy[cabin.id];
      return copy;
    });

    setSelectedDeckCabinsByCabinId((prev) => {
      const copy = { ...prev };
      delete copy[cabin.id];
      return copy;
    });

    setActiveExpandedCabinKey((prev) => (prev === cabin.id ? null : prev));

    setDeckPlanSelectorCabin((prev) => (prev?.id === cabin.id ? null : prev));
  };

  const handleOpenCabinFromChip = (cabinId: string) => {
    setActiveExpandedCabinKey(cabinId);

    const element = cardRefs.current[cabinId];
    if (!element) return;

    const y = element.getBoundingClientRect().top + window.scrollY - 170;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const handleCabinSelectionModeChange = (
    cabin: CruiseCabinType,
    mode: CabinAssignmentMode
  ) => {
    setCabinAssignmentModes((prev) => ({
      ...prev,
      [cabin.id]: mode,
    }));

    if (mode === "auto") {
      setSelectedDeckCabinsByCabinId((prev) => ({
        ...prev,
        [cabin.id]: null,
      }));
    } else if (mode === "select" && deckPlanSelectionAvailable) {
      setDeckPlanSelectorCabin(cabin);
    }
  };

  const handleDeckCabinSelect = (payload: SelectedDeckCabin) => {
    if (!deckPlanSelectorCabin) return;

    setSelectedDeckCabinsByCabinId((prev) => ({
      ...prev,
      [deckPlanSelectorCabin.id]: payload,
    }));

    setCabinAssignmentModes((prev) => ({
      ...prev,
      [deckPlanSelectorCabin.id]: "select",
    }));

    setDeckPlanSelectorCabin(null);
  };

  const getCabinSummaryLabel = (selected: SelectedCabinItem) => {
    const cabin = data.cabins.find((item) => item.id === selected.cabinId);
    if (!cabin) {
      return {
        title: "Selected Cabin",
        travellers: "",
        amount: 0,
        originalAmount: 0,
        offerDiscount: 0,
        deckCabinNumber: null as string | null,
        assignmentMode: "auto" as CabinAssignmentMode,
      };
    }

    const row = selected.rows[0];
    const adults = row?.adults || 0;
    const children = row?.children || 0;
    const infants = row?.infants || 0;

    const summaryParts: string[] = [];
    if (adults > 0) summaryParts.push(`${adults}A`);
    if (children > 0) summaryParts.push(`${children}C`);
    if (infants > 0) summaryParts.push(`${infants}I`);

    const pricingItem = pricingSummary.cabins.find(
      (item) => item.cabinKey === selected.cabinKey
    );
    const rawAmount = pricingItem?.subtotal || 0;
    const totalBase = pricingSummary.cabinsTotal || 0;
    const cabinOfferDiscount =
      totalBase > 0 && safeOfferDiscount > 0
        ? Math.min(
            rawAmount,
            Math.round((rawAmount / totalBase) * safeOfferDiscount)
          )
        : 0;
    const amountAfterOffer = Math.max(rawAmount - cabinOfferDiscount, 0);

    return {
      title: cabin.name,
      travellers: summaryParts.join(" "),
      amount: amountAfterOffer,
      originalAmount: rawAmount,
      offerDiscount: cabinOfferDiscount,
      deckCabinNumber:
        selectedDeckCabinsByCabinId[selected.cabinId]?.cabinNumber || null,
      assignmentMode: cabinAssignmentModes[selected.cabinId] || "auto",
    };
  };

  const allSelectedCabinsValid =
    selectedCabins.length > 0 &&
    selectedCabins.every((selected) => isCabinRowsValid(selected.rows));

  return (
    <div className="space-y-3 lg:space-y-4">
      <CruiseCabinSectionTabs
        activeSection={activeSection}
        onChange={setActiveSection}
        dayCountLabel={dayCountLabel}
      />

      {secondsLeft > 0 ? (
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-3 text-[13px] font-extrabold text-orange-700 lg:px-4 lg:text-sm lg:font-semibold">
          Cabin hold timer: {Math.floor(secondsLeft / 60)}:
          {String(secondsLeft % 60).padStart(2, "0")}
        </div>
      ) : null}

      {pricingSummary.cabins.length > 0 ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-3 lg:px-4">
          <div className="text-[13px] font-extrabold leading-5 text-green-700 lg:text-sm lg:font-semibold">
            Selected cabins total: ₹
            {displayCabinsTotal.toLocaleString("en-IN")} | Taxes & Fees:
            ₹{pricingSummary.taxesAndFees.toLocaleString("en-IN")} | Grand total:
            ₹{displayGrandTotal.toLocaleString("en-IN")}
            {safeOfferDiscount > 0 ? (
              <span className="ml-1 text-orange-700">
                (Offer saved ₹{safeOfferDiscount.toLocaleString("en-IN")})
              </span>
            ) : null}
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0">
            {selectedCabins.map((selected, index) => {
              const summary = getCabinSummaryLabel(selected);
              const valid = isCabinRowsValid(selected.rows);

              return (
                <button
                  key={selected.cabinKey}
                  type="button"
                  onClick={() => handleOpenCabinFromChip(selected.cabinId)}
                  className={`inline-flex max-w-[calc(100vw-42px)] shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[12px] font-bold transition lg:max-w-none lg:text-sm lg:font-semibold ${
                    activeExpandedCabinKey === selected.cabinId
                      ? "border-green-400 bg-white text-green-800"
                      : "border-green-300 bg-white/80 text-green-700 hover:bg-white"
                  }`}
                >
                  <span className="min-w-0 truncate">
                    Cabin {index + 1} · {summary.title}
                  </span>

                  {summary.travellers ? (
                    <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-800">
                      {summary.travellers}
                    </span>
                  ) : null}

                  <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-slate-700">
                    {summary.assignmentMode === "select"
                      ? "Specific Cabin"
                      : "Auto Assign"}
                  </span>

                  {summary.deckCabinNumber ? (
                    <span className="shrink-0 rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-700">
                      {summary.deckCabinNumber}
                    </span>
                  ) : null}

                  <span className="whitespace-nowrap text-[12px] font-bold text-green-800">
                    ₹{summary.amount.toLocaleString("en-IN")}
                  </span>

                  {summary.offerDiscount > 0 ? (
                    <span className="whitespace-nowrap rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-black text-orange-700">
                      after offer
                    </span>
                  ) : null}

                  {!valid ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      Incomplete
                    </span>
                  ) : null}

                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCabin(selected.cabinKey);
                    }}
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-800 hover:bg-green-200"
                  >
                    <X size={12} />
                  </span>
                </button>
              );
            })}
          </div>

          {!allSelectedCabinsValid ? (
            <div className="mt-3 text-xs font-semibold text-amber-700">
              Fill all selected cabin traveller details to enable booking.
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-2xl border bg-white p-3 lg:p-4">
        {activeSection === "cabins" ? (
          <CruiseSailingSection
            itinerary={data.sailingPlan}
            mode="static"
            content={
              <div className="space-y-4 lg:space-y-5">
                {sortedCabins.map((cabin) => {
                  const selectedRowsForThisCabin = selectedCabins
                    .filter((item) => item.cabinId === cabin.id)
                    .map((item) => item.rows[0])
                    .filter(Boolean) as CruiseCabinSelectionRow[];

                  return (
                    <div
                      key={cabin.id}
                      ref={(el) => {
                        cardRefs.current[cabin.id] = el;
                      }}
                    >
                      <CruiseCabinCard
                        cabin={cabin}
                        nationalityOptions={data.nationalityOptions}
                        isSelected={selectedRowsForThisCabin.length > 0}
                        isExpanded={activeExpandedCabinKey === cabin.id}
                        initialRows={selectedRowsForThisCabin}
                        onExpand={() => setActiveExpandedCabinKey(cabin.id)}
                        onCollapse={() =>
                          setActiveExpandedCabinKey((prev) =>
                            prev === cabin.id ? null : prev
                          )
                        }
                        onOpenDetail={setDetailModalCabin}
                        onOpenAmenities={setAmenitiesModalCabin}
                        onChooseCabin={handleChooseCabin}
                        onClearSelection={handleClearSelectionByCabin}
                        cabinSelectionMode={
                          cabinAssignmentModes[cabin.id] || "auto"
                        }
                        onCabinSelectionModeChange={
                          handleCabinSelectionModeChange
                        }
                        deckPlanSelectionAvailable={deckPlanSelectionAvailable}
                        selectedDeckCabinNumber={
                          selectedDeckCabinsByCabinId[cabin.id]?.cabinNumber ||
                          null
                        }
                        onOpenDeckPlanSelector={(selectedCabin) => {
                          setDeckPlanSelectorCabin(selectedCabin);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            }
          />
        ) : null}

        {activeSection === "sailing" ? (
          <CruiseSailingSection itinerary={data.sailingPlan} mode="scroll" />
        ) : null}

        {activeSection === "dining" ? (
          <CruiseSailingSection
            itinerary={data.sailingPlan}
            mode="static"
            content={<CruiseDiningSection items={data.diningHighlights} />}
          />
        ) : null}

        {activeSection === "entertainment" ? (
          <CruiseSailingSection
            itinerary={data.sailingPlan}
            mode="static"
            content={
              <CruiseEntertainmentSection
                items={data.entertainmentHighlights}
              />
            }
          />
        ) : null}

        {activeSection === "policies" ? (
          <CruiseSailingSection
            itinerary={data.sailingPlan}
            mode="static"
            content={<CruiseCabinPoliciesSection items={data.cabinPolicies} />}
          />
        ) : null}
      </div>

      {deckPlanSelectorCabin ? (
        <div className="fixed inset-0 z-[140] flex items-end justify-center bg-black/45 p-0 md:items-center md:p-4">
          <div className="relative flex h-[92dvh] w-full max-w-[1180px] flex-col overflow-hidden rounded-t-[26px] bg-white shadow-2xl md:h-[88vh] md:rounded-[22px]">
            <button
              type="button"
              onClick={() => setDeckPlanSelectorCabin(null)}
              className="absolute right-4 top-4 z-20 rounded-full bg-slate-100 p-2 text-slate-700 transition hover:bg-slate-200"
            >
              <X size={18} />
            </button>

            <div className="shrink-0 border-b px-4 py-4 pr-16 md:px-6">
              <div className="text-base font-black text-slate-900 md:text-lg md:font-bold">
                Select Cabin Number
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-600 md:text-sm md:font-normal">
                {deckPlanSelectorCabin.name} · Choose a specific cabin from deck
                plan
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3 md:p-4">
              <CruiseDeckPlanTab
                deckPlans={data.deckPlans}
                mode="select"
                selectedCabinNumber={
                  selectedDeckCabinsByCabinId[deckPlanSelectorCabin.id]
                    ?.cabinNumber || null
                }
                onCabinSelect={handleDeckCabinSelect}
              />
            </div>
          </div>
        </div>
      ) : null}

      <CruiseCabinDetailModal
        open={!!detailModalCabin}
        cabin={detailModalCabin}
        onClose={() => setDetailModalCabin(null)}
      />

      <CruiseCabinAmenitiesModal
        open={!!amenitiesModalCabin}
        cabin={amenitiesModalCabin}
        onClose={() => setAmenitiesModalCabin(null)}
      />
    </div>
  );
}
