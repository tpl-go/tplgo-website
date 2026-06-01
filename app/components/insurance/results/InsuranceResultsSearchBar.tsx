"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  destination: string;
  insuranceType: string;
  travelDates: string;
  travellers: string;
  fromDate?: string;
  toDate?: string;
  age?: string;
  travellerAges?: string[];
  onSearchUpdate?: (data: {
    insuranceType: string;
    destination: string;
    fromDate: string;
    toDate: string;
    travellers: string;
    travellerAges: string[];
    age: string;
  }) => void;
};

const INSURANCE_TYPES = [
  "Travel Insurance",
  "International Travel",
  "Domestic Travel",
  "Student Travel",
  "Senior Citizen",
  "Family Trip",
  "Visa Insurance",
];

const DESTINATIONS = [
  "International",
  "Domestic India",
  "Dubai",
  "Thailand",
  "Singapore",
  "Malaysia",
  "Bali",
  "Vietnam",
  "Schengen",
  "France",
  "Germany",
  "Italy",
  "Spain",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
];

type FieldKey = "insuranceType" | "destination" | "dates" | "travellers";
type FormValue = string | number | string[];

function getTravellerCount(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 1;
}

function buildTravellerLabel(count: number) {
  return count === 1 ? "1 Traveller" : `${count} Travellers`;
}

function normalizeAges(count: number, currentAges: string[], fallbackAge: string) {
  return Array.from({ length: count }, (_, index) => {
    return currentAges[index] || fallbackAge || "";
  });
}

export default function InsuranceResultsSearchBar({
  destination,
  insuranceType,
  travellers,
  fromDate = "",
  toDate = "",
  age = "",
  travellerAges = [],
  onSearchUpdate,
}: Props) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [activeField, setActiveField] = useState<FieldKey | null>(null);

  const initialCount = getTravellerCount(travellers || "1 Traveller");

  const [form, setForm] = useState({
    insuranceType: insuranceType || "Travel Insurance",
    destination: destination || "International",
    fromDate,
    toDate,
    travellerCount: initialCount,
    travellerAges: normalizeAges(initialCount, travellerAges, age || "30"),
  });

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) {
        setActiveField(null);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const update = (key: keyof typeof form, value: FormValue) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateTravellerCount = (count: number) => {
    setForm((prev) => ({
      ...prev,
      travellerCount: count,
      travellerAges: normalizeAges(count, prev.travellerAges, "30"),
    }));
  };

  const updateAge = (index: number, value: string) => {
    setForm((prev) => {
      const nextAges = [...prev.travellerAges];
      nextAges[index] = value;
      return { ...prev, travellerAges: nextAges };
    });
  };

  const travellersLabel = buildTravellerLabel(form.travellerCount);

  const ageSummary = useMemo(() => {
    const filled = form.travellerAges.filter(Boolean);

    if (filled.length === 0) return "Add ages";

    if (filled.length === 1) {
      return `Age ${filled[0]}`;
    }

    const hasSenior = filled.some((item) => Number(item) >= 60);
    const hasChild = filled.some((item) => Number(item) > 0 && Number(item) < 12);

    if (hasSenior) return `${filled.length} ages added • Senior included`;
    if (hasChild) return `${filled.length} ages added • Child included`;

    return `${filled.length} ages added`;
  }, [form.travellerAges]);

  const travelDateLabel =
    form.fromDate && form.toDate
      ? `${form.fromDate} - ${form.toDate}`
      : form.fromDate
      ? form.fromDate
      : "Select Dates";

  const handleSearch = () => {
    const firstAge = form.travellerAges[0] || "";
    const maxAge =
      form.travellerAges
        .map((item) => Number(item))
        .filter((item) => !Number.isNaN(item))
        .sort((a, b) => b - a)[0] || Number(firstAge || 0);

    onSearchUpdate?.({
      insuranceType: form.insuranceType,
      destination: form.destination,
      fromDate: form.fromDate,
      toDate: form.toDate,
      travellers: travellersLabel,
      travellerAges: form.travellerAges,
      age: String(maxAge || firstAge || ""),
    });

    setActiveField(null);
  };

  return (
    <div className="z-30 border-b border-slate-200/10 bg-[#07111f]/95 px-3 py-3 shadow-[0_12px_32px_rgba(15,23,42,0.28)] backdrop-blur-xl md:px-6">
      <div className="mx-auto max-w-7xl">
        <div
          ref={boxRef}
          className="overflow-visible rounded-[22px] border border-white/10 bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#0b1220] shadow-[0_18px_45px_rgba(2,6,23,0.35)] md:rounded-2xl"
        >
          <div className="grid grid-cols-1 overflow-visible sm:grid-cols-2 lg:grid-cols-[1.15fr_1.15fr_1.35fr_1.2fr_155px]">
            <SearchFieldBox
              label="Insurance Type"
              value={form.insuranceType}
              helper="Choose plan category"
              active={activeField === "insuranceType"}
              onClick={() =>
                setActiveField(
                  activeField === "insuranceType" ? null : "insuranceType"
                )
              }
            >
              {activeField === "insuranceType" && (
                <div className="fixed inset-x-3 top-[156px] z-50 max-h-[65vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0f172a] p-2 shadow-2xl scrollbar-hide sm:absolute sm:inset-x-auto sm:left-0 sm:top-[64px] sm:w-72">
                  {INSURANCE_TYPES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        update("insuranceType", item);
                        setActiveField(null);
                      }}
                      className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
                        form.insuranceType === item
                          ? "bg-cyan-400 text-slate-950"
                          : "text-slate-200 hover:bg-white/10"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </SearchFieldBox>

            <SearchFieldBox
              label="Destination"
              value={form.destination}
              helper="Country / region"
              active={activeField === "destination"}
              onClick={() =>
                setActiveField(
                  activeField === "destination" ? null : "destination"
                )
              }
            >
              {activeField === "destination" && (
                <div className="fixed inset-x-3 top-[156px] z-50 max-h-[65vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0f172a] p-2 shadow-2xl sm:absolute sm:inset-x-auto sm:left-0 sm:top-[64px] sm:max-h-80 sm:w-80">
                  {DESTINATIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        update("destination", item);
                        setActiveField(null);
                      }}
                      className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
                        form.destination === item
                          ? "bg-cyan-400 text-slate-950"
                          : "text-slate-200 hover:bg-white/10"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </SearchFieldBox>

            <SearchFieldBox
              label="Travel Dates"
              value={travelDateLabel}
              helper="Policy validity period"
              active={activeField === "dates"}
              onClick={() =>
                setActiveField(activeField === "dates" ? null : "dates")
              }
            >
              {activeField === "dates" && (
                <div className="fixed inset-x-3 top-[156px] z-50 max-h-[65vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0f172a] p-4 shadow-2xl sm:absolute sm:inset-x-auto sm:left-0 sm:top-[64px] sm:w-[420px]">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-bold uppercase text-cyan-300">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={form.fromDate}
                        onChange={(e) => update("fromDate", e.target.value)}
                        className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-bold text-white outline-none [color-scheme:dark] focus:border-cyan-300"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-bold uppercase text-cyan-300">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={form.toDate}
                        onChange={(e) => update("toDate", e.target.value)}
                        className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-bold text-white outline-none [color-scheme:dark] focus:border-cyan-300"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveField(null)}
                    className="mt-4 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(14,165,233,0.35)] hover:from-cyan-300 hover:to-blue-500"
                  >
                    Apply Dates
                  </button>
                </div>
              )}
            </SearchFieldBox>

            <SearchFieldBox
              label="Travellers"
              value={travellersLabel}
              helper={ageSummary}
              active={activeField === "travellers"}
              onClick={() =>
                setActiveField(
                  activeField === "travellers" ? null : "travellers"
                )
              }
            >
              {activeField === "travellers" && (
                <div className="fixed inset-x-3 top-[156px] z-50 max-h-[65vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0f172a] p-4 shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-[64px] sm:w-[380px]">
                  <div className="mb-4 flex items-center justify-between rounded-2xl bg-white/5 p-3">
                    <div>
                      <p className="text-sm font-extrabold text-white">
                        Travellers
                      </p>
                      <p className="text-xs font-semibold text-slate-300">
                        Add age for every insured member
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateTravellerCount(
                            Math.max(1, form.travellerCount - 1)
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg font-bold text-cyan-300"
                      >
                        -
                      </button>

                      <span className="w-6 text-center text-sm font-extrabold text-white">
                        {form.travellerCount}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateTravellerCount(
                            Math.min(9, form.travellerCount + 1)
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg font-bold text-cyan-300"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                    {Array.from({ length: form.travellerCount }).map(
                      (_, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-white/5 p-3 sm:grid-cols-[1fr_110px] sm:items-center"
                        >
                          <div>
                            <p className="text-sm font-bold text-white">
                              Traveller {index + 1}
                            </p>
                            <p className="text-xs font-semibold text-slate-300">
                              Age as per passport / ID
                            </p>
                          </div>

                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={form.travellerAges[index] || ""}
                            onChange={(e) => updateAge(index, e.target.value)}
                            className="h-10 rounded-xl border border-white/10 bg-white px-3 text-sm font-extrabold text-gray-900 outline-none focus:border-cyan-300"
                            placeholder="Age"
                          />
                        </div>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveField(null)}
                    className="mt-4 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(14,165,233,0.35)] hover:from-cyan-300 hover:to-blue-500"
                  >
                    Apply Travellers
                  </button>
                </div>
              )}
            </SearchFieldBox>

            <div className="flex items-center justify-center border-t border-white/10 bg-white/[0.04] px-3 py-3 sm:col-span-2 lg:col-span-1 lg:border-l lg:border-t-0 lg:py-2">
              <button
                type="button"
                onClick={handleSearch}
                className="h-[48px] w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 text-[14px] font-black text-white shadow-[0_10px_24px_rgba(14,165,233,0.35)] transition hover:scale-[1.02] hover:from-cyan-300 hover:to-blue-500 lg:h-[46px]"
              >
                Modify Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchFieldBox({
  label,
  value,
  helper,
  active,
  onClick,
  children,
}: {
  label: string;
  value: string;
  helper: string;
  active: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative min-w-0 overflow-visible border-b border-white/10 bg-white/[0.035] transition hover:bg-white/[0.07] sm:border-r lg:border-b-0">
      <button
        type="button"
        onClick={onClick}
        className={`min-h-[66px] w-full px-3 py-2.5 text-left transition lg:h-[62px] lg:min-h-0 lg:py-2 ${
          active ? "bg-white/[0.08]" : ""
        }`}
      >
        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-300">
          {label}
        </p>

        <p className="break-words text-[15px] font-extrabold leading-5 text-white sm:truncate">
          {value}
        </p>

        <p className="mt-0.5 break-words text-[11px] font-medium leading-4 text-slate-300 sm:truncate">
          {helper}
        </p>
      </button>

      {children}
    </div>
  );
}
