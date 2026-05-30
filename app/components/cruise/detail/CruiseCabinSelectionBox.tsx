"use client";

import { Plus, Trash2, Users, AlertCircle, CheckCircle2 } from "lucide-react";
import type {
  CabinNationalityOption,
  CruiseCabinSelectionRow,
} from "@/app/lib/cruise/cruiseDetailTypes";

type Props = {
  rows: CruiseCabinSelectionRow[];
  nationalityOptions: CabinNationalityOption[];
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onUpdateRow: (
    rowId: string,
    field: "adults" | "children" | "infants" | "nationality",
    value: number | string
  ) => void;
  onClearCabin?: () => void;
};

const MAX_GUESTS_PER_CABIN = 4;

function getRowTotal(row: CruiseCabinSelectionRow) {
  return row.adults + row.children + row.infants;
}

function isRowValid(row: CruiseCabinSelectionRow) {
  const total = getRowTotal(row);
  return total > 0 && row.adults >= 1 && !!row.nationality && total <= MAX_GUESTS_PER_CABIN;
}

function getRowStatus(row: CruiseCabinSelectionRow) {
  const total = getRowTotal(row);

  if (total === 0) {
    return {
      valid: false,
      label: "Add travellers",
      tone: "amber",
      message: "At least 1 adult is required.",
    };
  }

  if (row.adults < 1) {
    return {
      valid: false,
      label: "Adult required",
      tone: "amber",
      message: "Each cabin must have at least 1 adult.",
    };
  }

  if (total > MAX_GUESTS_PER_CABIN) {
    return {
      valid: false,
      label: "Too many guests",
      tone: "red",
      message: `Maximum ${MAX_GUESTS_PER_CABIN} guests allowed in one cabin.`,
    };
  }

  if (!row.nationality) {
    return {
      valid: false,
      label: "Nationality required",
      tone: "amber",
      message: "Please select nationality.",
    };
  }

  return {
    valid: true,
    label: "Ready",
    tone: "green",
    message: "Cabin details look good.",
  };
}

export default function CruiseCabinSelectionBox({
  rows,
  nationalityOptions,
  onAddRow,
  onRemoveRow,
  onUpdateRow,
  onClearCabin,
}: Props) {
  return (
    <div className="space-y-4">
      {rows.map((row, index) => {
        const total = getRowTotal(row);
        const status = getRowStatus(row);

        return (
          <div
            key={row.id}
            className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5 sm:py-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h4 className="text-[16px] font-black text-slate-900 sm:text-[18px] sm:font-bold">
                  Cabin {index + 1}
                </h4>

                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-slate-700 shadow-sm">
                  <Users size={13} />
                  {total} Guest{total !== 1 ? "s" : ""}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                    status.tone === "green"
                      ? "bg-green-100 text-green-700"
                      : status.tone === "red"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {status.label}
                </span>
              </div>

              <button
                type="button"
                onClick={onAddRow}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-[13px] font-extrabold text-purple-700 transition hover:bg-purple-50 sm:w-auto sm:text-[14px] sm:font-semibold"
              >
                <Plus size={16} />
                Add New Cabin
              </button>
            </div>

            <div className="px-3 py-4 sm:px-5 sm:py-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <FieldBlock
                  label="Adults"
                  hint="12 Years & Above"
                  value={row.adults}
                  options={[0, 1, 2, 3, 4]}
                  onChange={(value) =>
                    onUpdateRow(row.id, "adults", Number(value))
                  }
                />

                <FieldBlock
                  label="Children"
                  hint="2 Years - 12 Years"
                  value={row.children}
                  options={[0, 1, 2, 3, 4]}
                  onChange={(value) =>
                    onUpdateRow(row.id, "children", Number(value))
                  }
                />

                <FieldBlock
                  label="Infants"
                  hint="Below 2 Years"
                  value={row.infants}
                  options={[0, 1, 2]}
                  onChange={(value) =>
                    onUpdateRow(row.id, "infants", Number(value))
                  }
                />

                <div>
                  <div className="text-[14px] font-black text-slate-900 sm:text-[17px] sm:font-semibold">
                    Nationality
                  </div>
                  <div className="mb-2 text-[12px] text-slate-500">
                    Passenger nationality
                  </div>

                  <select
                    value={row.nationality}
                    onChange={(e) =>
                      onUpdateRow(row.id, "nationality", e.target.value)
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-[15px] font-medium text-slate-800 outline-none transition focus:border-sky-300 focus:bg-white sm:h-[50px]"
                  >
                    {nationalityOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 sm:px-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="text-[13px] font-semibold text-slate-800">
                      Traveller Summary
                    </div>
                    <div className="text-[12px] text-slate-600">
                      Adults: {row.adults} · Children: {row.children} · Infants: {row.infants}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 sm:items-center">
                    {status.valid ? (
                      <CheckCircle2 size={16} className="text-green-600" />
                    ) : (
                      <AlertCircle size={16} className="text-amber-600" />
                    )}

                    <div
                      className={`text-[12px] font-semibold ${
                        status.valid ? "text-green-700" : "text-amber-700"
                      }`}
                    >
                      {status.message}
                    </div>
                  </div>
                </div>

                {total > MAX_GUESTS_PER_CABIN ? (
                  <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[12px] font-medium text-red-700">
                    Maximum {MAX_GUESTS_PER_CABIN} guests allowed in one cabin.
                  </div>
                ) : null}
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={onClearCabin}
                  className="inline-flex items-center gap-2 text-[14px] font-medium text-slate-700 underline underline-offset-2 transition hover:text-slate-900"
                >
                  <Trash2 size={15} />
                  Remove Cabin
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FieldBlock({
  label,
  hint,
  value,
  options,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  options: number[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="text-[14px] font-black text-slate-900 sm:text-[17px] sm:font-semibold">{label}</div>
      <div className="mb-2 text-[12px] text-slate-500">{hint}</div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-[15px] font-medium text-slate-800 outline-none transition focus:border-sky-300 focus:bg-white sm:h-[50px]"
      >
        {options.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}
