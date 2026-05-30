"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Users, Sparkles } from "lucide-react";
import type {
  CabinNationalityOption,
  CruiseCabinSelectionRow,
  CruiseCabinType,
} from "@/app/lib/cruise/cruiseDetailTypes";
import CruiseCabinSelectionBox from "./CruiseCabinSelectionBox";
import {
  calculateSmartOfferDiscount,
  getSmartActiveOfferItem,
} from "@/app/lib/smartOffers";

import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";

type CabinAssignmentMode = "auto" | "select";

type Props = {
  cabin: CruiseCabinType;
  nationalityOptions: CabinNationalityOption[];
  isSelected: boolean;
  isExpanded?: boolean;
  initialRows?: CruiseCabinSelectionRow[];
  onExpand?: () => void;
  onCollapse?: () => void;
  onOpenDetail: (cabin: CruiseCabinType) => void;
  onOpenAmenities: (cabin: CruiseCabinType) => void;
  onChooseCabin: (
    cabin: CruiseCabinType,
    rows: CruiseCabinSelectionRow[]
  ) => void;
  onClearSelection?: (cabin: CruiseCabinType) => void;
  cabinSelectionMode?: CabinAssignmentMode;
  onCabinSelectionModeChange?: (
    cabin: CruiseCabinType,
    mode: CabinAssignmentMode
  ) => void;
  deckPlanSelectionAvailable?: boolean;
  selectedDeckCabinNumber?: string | null;
  onOpenDeckPlanSelector?: (cabin: CruiseCabinType) => void;
};

function buildDefaultRows(
  cabinId: string,
  nationalityOptions: CabinNationalityOption[]
): CruiseCabinSelectionRow[] {
  return [
    {
      id: `${cabinId}-row-1`,
      adults: 0,
      children: 0,
      infants: 0,
      nationality: nationalityOptions[0]?.id || "indian",
    },
  ];
}

function isRowsValid(rows: CruiseCabinSelectionRow[]) {
  if (!rows.length) return false;

  return rows.every((row) => {
    const total = row.adults + row.children + row.infants;
    return total > 0 && row.adults >= 1 && !!row.nationality;
  });
}

export default function CruiseCabinCard({
  cabin,
  nationalityOptions,
  isSelected,
  isExpanded = false,
  initialRows,
  onExpand,
  onCollapse,
  onOpenDetail,
  onOpenAmenities,
  onChooseCabin,
  onClearSelection,
  cabinSelectionMode = "auto",
  onCabinSelectionModeChange,
  deckPlanSelectionAvailable = false,
  selectedDeckCabinNumber = null,
  onOpenDeckPlanSelector,
}: Props) {
  const expanded = !!isExpanded;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [rows, setRows] = useState<CruiseCabinSelectionRow[]>(
    initialRows?.length
      ? initialRows
      : buildDefaultRows(cabin.id, nationalityOptions)
  );

  useEffect(() => {
    if (initialRows?.length) {
      setRows(initialRows);
    } else {
      setRows(buildDefaultRows(cabin.id, nationalityOptions));
    }
  }, [initialRows, cabin.id, nationalityOptions]);

  const images = cabin.images?.length ? cabin.images : [];
  const currentImage = images[activeImageIndex];

  const totalTravellers = useMemo(() => {
    return rows.reduce(
      (sum, row) => sum + row.adults + row.children + row.infants,
      0
    );
  }, [rows]);

  const hasValidSelection = useMemo(() => isRowsValid(rows), [rows]);
  const showSelectedState = isSelected && hasValidSelection;
  const showValidationHint = expanded && !hasValidSelection;

const smartOffer = getSmartActiveOfferItem();

const rawOfferDiscount =
  smartOffer && cabin.pricePerPerson > 0
    ? calculateSmartOfferDiscount(
        smartOffer,
        cabin.pricePerPerson
      )
    : 0;

const pricingPreview = applyBenefitPricing({
  baseAmount: cabin.pricePerPerson,
  offerDiscount: rawOfferDiscount,
  promoCredit: 0,
  earnedCredit: 0,
  refundWallet: 0,
});

const hasOffer =
  pricingPreview.offerDiscount > 0 &&
  pricingPreview.baseAfterOffer <
    pricingPreview.baseAmount;

  const syncSelectionState = (updatedRows: CruiseCabinSelectionRow[]) => {
  
  onChooseCabin(cabin, updatedRows);
};

  const updateRow = (
    rowId: string,
    field: "adults" | "children" | "infants" | "nationality",
    value: number | string
  ) => {
    const updatedRows = rows.map((row) =>
      row.id === rowId ? { ...row, [field]: value } : row
    );
    setRows(updatedRows);
    syncSelectionState(updatedRows);
  };

  const addRow = () => {
    const updatedRows = [
      ...rows,
      {
        id: `${cabin.id}-row-${rows.length + 1}`,
        adults: 0,
        children: 0,
        infants: 0,
        nationality: nationalityOptions[0]?.id || "indian",
      },
    ];
    setRows(updatedRows);
    syncSelectionState(updatedRows);
  };

  const removeRow = (rowId: string) => {
    const updatedRows =
      rows.length === 1 ? rows : rows.filter((row) => row.id !== rowId);
    setRows(updatedRows);
    syncSelectionState(updatedRows);
  };

  const handleClearCabin = () => {
    setRows(buildDefaultRows(cabin.id, nationalityOptions));
    onClearSelection?.(cabin);
    onCollapse?.();
  };

  const handleChoose = () => {
    if (!expanded) {
      onExpand?.();
      return;
    }

    if (showSelectedState) {
      onCollapse?.();
      return;
    }

    // invalid state: second click closes box
    onCollapse?.();
  };

  const goPrev = () => {
    if (!images.length) return;
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goNext = () => {
    if (!images.length) return;
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className={`overflow-hidden rounded-[18px] border bg-white shadow-sm transition-all ${
        expanded
          ? "border-purple-300 shadow-[0_10px_35px_rgba(147,51,234,0.10)]"
          : showSelectedState
          ? "border-green-300 bg-green-50/30 shadow-[0_8px_28px_rgba(34,197,94,0.08)]"
          : "border-slate-200"
      }`}
    >
      <div className="grid grid-cols-12 gap-0">
        <div className="col-span-12 md:col-span-4">
          <div className="relative m-3 overflow-hidden rounded-[14px] bg-slate-100 md:m-4">
            <div
              className="relative h-[190px] cursor-pointer sm:h-[230px] md:h-[220px]"
              onClick={() => onOpenDetail(cabin)}
            >
              {currentImage ? (
                <img
                  src={currentImage.url}
                  alt={currentImage.alt || cabin.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
                  No image
                </div>
              )}

              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goPrev();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-700 shadow-sm backdrop-blur hover:bg-white"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goNext();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-700 shadow-sm backdrop-blur hover:bg-white"
                  >
                    <ChevronRight size={18} />
                  </button>

                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/20 px-3 py-1 backdrop-blur">
                    {images.map((img, index) => (
                      <button
                        key={`${img.id}-${index}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex(index);
                        }}
                        className={`h-2.5 w-2.5 rounded-full transition ${
                          index === activeImageIndex ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-8">
          <div className="flex h-full flex-col justify-between px-3 pb-4 pt-1 md:px-4 md:pt-5 md:pl-2 md:pr-5">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-7">
                <h3 className="text-[20px] font-black leading-tight text-slate-900 md:text-[24px] md:font-bold">
                  {cabin.name}
                </h3>

                <p className="mt-2 max-w-[420px] text-[13px] font-medium leading-6 text-slate-700 md:mt-3 md:text-[14px] md:leading-8 md:text-slate-800">
                  {cabin.shortDescription}{" "}
                  <button
                    type="button"
                    onClick={() => onOpenDetail(cabin)}
                    className="font-semibold text-slate-900 underline underline-offset-2"
                  >
                    Read More
                  </button>
                </p>

                <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-[13px] font-bold text-slate-900 md:mt-4 md:border-0 md:bg-transparent md:px-0 md:py-0 md:text-[15px] md:font-semibold">
                  <Users size={18} className="text-rose-400" />
                  <span>
                    Max Capacity: {String(cabin.maxGuests).padStart(2, "0")} Guests
                  </span>
                </div>

                {showSelectedState ? (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-[12px] font-semibold text-green-700">
                      {totalTravellers > 0
                        ? `${totalTravellers} traveller selected`
                        : "Cabin selected"}
                    </span>

                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[12px] font-semibold text-slate-700">
                      {cabinSelectionMode === "select"
                        ? "Specific Cabin Selection"
                        : "Auto Assigned Cabin"}
                    </span>

                    {selectedDeckCabinNumber ? (
                      <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-[12px] font-semibold text-purple-700">
                        Cabin No. {selectedDeckCabinNumber}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-4 md:mt-8">
                  <button
                    type="button"
                    onClick={() => onOpenAmenities(cabin)}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 text-[13px] font-extrabold text-blue-700 md:h-auto md:rounded-none md:border-0 md:bg-transparent md:px-0 md:text-[16px] md:font-medium md:underline md:underline-offset-2"
                  >
                    <Sparkles size={16} />
                    View Amenities
                  </button>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-5">
                <div className="flex h-full flex-col justify-between rounded-2xl border border-orange-100 bg-orange-50/40 p-3 lg:items-end lg:border-0 lg:bg-transparent lg:p-0">
                  <div className="text-left lg:text-right">
                    <div>
  {hasOffer ? (
    <div className="text-[13px] font-bold text-black line-through lg:text-[14px]">
      ₹ {pricingPreview.baseAmount.toLocaleString("en-IN")}
    </div>
  ) : null}

  <div className="text-[24px] font-black leading-none text-slate-900 lg:text-[20px] lg:font-bold">
    ₹{" "}
    {(
      hasOffer
        ? pricingPreview.baseAfterOffer
        : pricingPreview.baseAmount
    ).toLocaleString("en-IN")}
  </div>

  {hasOffer ? (
    <div className="mt-1 inline-flex rounded-full bg-orange-50 px-2 py-1 text-[10px] font-black text-orange-700">
      Save ₹
      {pricingPreview.offerDiscount.toLocaleString("en-IN")}
    </div>
  ) : null}
</div>
                    <div className="mt-2 text-[12px] font-bold leading-5 text-slate-600 lg:mt-3 lg:text-[14px] lg:font-medium lg:leading-7 lg:text-slate-700">
                      <div>Per Person in</div>
                      <div>Double Occupancy</div>
                      <div>Excl. GST charges</div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col lg:mt-12 lg:items-end">
                    <button
                      type="button"
                      onClick={handleChoose}
                      className={`h-11 w-full rounded-full border px-4 py-2 text-[14px] font-extrabold transition lg:min-w-[200px] lg:text-[16px] lg:font-semibold ${
  expanded
    ? hasValidSelection
      ? "border-orange-500 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white shadow-md hover:opacity-95"
      : "border-orange-500 bg-white text-orange-700 hover:bg-orange-50"
    : showSelectedState
    ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-100"
    : "border-orange-500 bg-white text-orange-700 hover:bg-orange-50"
}`}
                    >
                      {showSelectedState ? "Selected" : "Choose Cabin"}
                    </button>

                    {showValidationHint ? (
                      <div className="mt-2 text-right text-[12px] font-medium text-red-600">
                        Please fill traveller details to confirm this cabin.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-slate-200 bg-white px-3 pb-4 pt-3 lg:px-5 lg:pb-5 lg:pt-4">
          <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 lg:p-4">
            <div className="text-sm font-semibold text-slate-900">
              Cabin Assignment Preference
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => onCabinSelectionModeChange?.(cabin, "auto")}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  cabinSelectionMode === "auto"
                    ? "border-purple-400 bg-white shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="text-sm font-semibold text-slate-900">
                  Auto Assign Cabin
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  Cabin number will be assigned by cruise line.
                </div>
              </button>

              <button
                type="button"
                onClick={() => onCabinSelectionModeChange?.(cabin, "select")}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  cabinSelectionMode === "select"
                    ? "border-purple-400 bg-white shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="text-sm font-semibold text-slate-900">
                  Select Cabin Number
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  Choose a specific cabin from deck plan when available.
                </div>
              </button>
            </div>

            {cabinSelectionMode === "select" ? (
              <div className="mt-4">
                {deckPlanSelectionAvailable ? (
                  <div className="flex flex-col gap-3 rounded-xl border border-purple-200 bg-purple-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                    <div>
                      <div className="text-sm font-semibold text-purple-800">
                        Specific cabin selection available
                      </div>
                      <div className="mt-1 text-xs text-purple-700">
                        {selectedDeckCabinNumber
                          ? `Selected Cabin Number: ${selectedDeckCabinNumber}`
                          : "Open deck plan and choose your cabin number."}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenDeckPlanSelector?.(cabin)}
                      className="h-10 w-full rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 sm:w-auto"
                    >
                      {selectedDeckCabinNumber
                        ? "Change Cabin Number"
                        : "Select from Deck Plan"}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    Specific cabin number selection is not available for this
                    sailing. Cabin will be assigned by cruise line after
                    booking.
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <CruiseCabinSelectionBox
            rows={rows}
            nationalityOptions={nationalityOptions}
            onAddRow={addRow}
            onRemoveRow={removeRow}
            onUpdateRow={updateRow}
            onClearCabin={handleClearCabin}
          />
        </div>
      ) : null}
    </div>
  );
}
