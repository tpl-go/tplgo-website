"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import { CalendarDays, ChevronDown, Search, MapPin } from "lucide-react";

import {
  COVERAGE_OPTIONS,
  INSURANCE_TYPE_OPTIONS,
  type InsuranceSearchPayload,
  type InsuranceType,
} from "@/app/lib/insurance/insuranceSearchTypes";

const DESTINATION_OPTIONS = [
  "Dubai",
  "Thailand",
  "Singapore",
  "Malaysia",
  "Bali",
  "Vietnam",
  "France",
  "Germany",
  "Italy",
  "Spain",
  "Schengen",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Domestic India",
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatDateInput(value: string) {
  if (!value) return "Select date";

  const [year, month, day] = value.split("-");
  return `${day}-${month}-${year}`;
}

function formatDateToYMD(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function InsuranceSearchBox() {
  const router = useRouter();

  const [insuranceType, setInsuranceType] = useState<InsuranceType>("travel");
  const [destination, setDestination] = useState("Dubai");
  const [startDate, setStartDate] = useState(addDaysISO(15));
  const [endDate, setEndDate] = useState(addDaysISO(22));
  const [travellerCount, setTravellerCount] = useState(1);
  const [travellerAges, setTravellerAges] = useState<number[]>([30]);
  const [coverageAmount, setCoverageAmount] = useState(100000);
  const [hasMedicalCondition, setHasMedicalCondition] = useState(false);
  const [tripPurpose, setTripPurpose] = useState("Leisure");

  const [openDestination, setOpenDestination] = useState(false);
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);
  const [openTravellers, setOpenTravellers] = useState(false);
  const [openCoverage, setOpenCoverage] = useState(false);

  const destinationRef = useRef<HTMLDivElement | null>(null);
  const startDateRef = useRef<HTMLDivElement | null>(null);
  const endDateRef = useRef<HTMLDivElement | null>(null);
  const travellersRef = useRef<HTMLDivElement | null>(null);
  const coverageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as Node;

      if (destinationRef.current && !destinationRef.current.contains(target)) {
        setOpenDestination(false);
      }

      if (startDateRef.current && !startDateRef.current.contains(target)) {
        setOpenStartDate(false);
      }

      if (endDateRef.current && !endDateRef.current.contains(target)) {
        setOpenEndDate(false);
      }

      if (travellersRef.current && !travellersRef.current.contains(target)) {
        setOpenTravellers(false);
      }

      if (coverageRef.current && !coverageRef.current.contains(target)) {
        setOpenCoverage(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const updateTravellerCount = (count: number) => {
    setTravellerCount(count);

    setTravellerAges((prev) =>
      Array.from({ length: count }, (_, index) => prev[index] || 30)
    );
  };

  const updateTravellerAge = (index: number, value: number) => {
    setTravellerAges((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const primaryAge = travellerAges[0] || 30;
  const maxTravellerAge = Math.max(
    ...travellerAges.filter(Boolean),
    primaryAge
  );

  const ageSummary = useMemo(() => {
    const filledAges = travellerAges.filter(Boolean);

    if (filledAges.length === 0) return "Add ages";

    if (filledAges.length === 1) {
      return `Age ${filledAges[0]}`;
    }

    const hasSenior = filledAges.some((item) => Number(item) >= 60);
    const hasChild = filledAges.some(
      (item) => Number(item) > 0 && Number(item) < 12
    );

    if (hasSenior) return `${filledAges.length} ages added • Senior included`;
    if (hasChild) return `${filledAges.length} ages added • Child included`;

    return `${filledAges.length} ages added`;
  }, [travellerAges]);

  const handleSearch = () => {
    const travellers = Array.from({ length: travellerCount }, (_, index) => ({
      id: `traveller-${index + 1}`,
      label: `Traveller ${index + 1}`,
      age: travellerAges[index] || primaryAge,
    }));

    const payload: InsuranceSearchPayload = {
      insuranceType,
      destination,
      startDate,
      endDate,
      travellers,
      coverageAmount,
      hasMedicalCondition,
      tripPurpose,
      source: "homepage",
    };

    sessionStorage.setItem("tplInsuranceSearchPayload", JSON.stringify(payload));

    const params = new URLSearchParams({
      type: insuranceType,
      destination,
      startDate,
      endDate,
      travellers: String(travellerCount),
      age: String(maxTravellerAge),
      travellerAges: travellerAges.join(","),
      coverage: String(coverageAmount),
      medical: hasMedicalCondition ? "yes" : "no",
      purpose: tripPurpose,
    });

    router.push(`/insurance/results?${params.toString()}`);
  };

  return (
    <div className="mt-4 md:mt-7 w-full rounded-[24px] md:rounded-[26px] border border-white/45 bg-white/20 px-3 md:px-5 py-4 shadow-xl backdrop-blur-md">
      {/* DESKTOP INSURANCE TYPE CHIPS — untouched */}
      <div className="mb-4 hidden md:flex flex-wrap items-center justify-start gap-3">
        {INSURANCE_TYPE_OPTIONS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setInsuranceType(item.value)}
            className={`h-10 rounded-full border px-5 text-sm font-bold transition ${
              insuranceType === item.value
                ? "border-orange-500 bg-orange-600 text-white shadow"
                : "border-slate-700 bg-white/80 text-slate-900 hover:bg-orange-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* MOBILE INSURANCE TYPE DROPDOWN */}
      <div className="mb-3 md:hidden">
        <label className="mb-1 block text-[11px] font-extrabold text-white">
          Insurance Type
        </label>

        <select
          value={insuranceType}
          onChange={(e) => setInsuranceType(e.target.value as InsuranceType)}
          className="h-11 w-full rounded-2xl border border-slate-700 bg-white/90 px-3 text-sm font-extrabold text-slate-900 outline-none"
        >
          {INSURANCE_TYPE_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <div ref={destinationRef} className="relative col-span-2 md:col-span-1">
          <button
            type="button"
            onClick={() => setOpenDestination((prev) => !prev)}
            className="flex h-[86px] md:h-[98px] w-full flex-col items-start rounded-2xl border border-slate-700 bg-white/60 px-3 md:px-4 py-3 text-left"
          >
            <div className="flex w-full items-start justify-between gap-2">
              <p className="text-[10px] md:text-[11px] font-bold text-slate-600">
                Destination
              </p>
              <ChevronDown
                size={16}
                className={`text-black transition ${
                  openDestination ? "rotate-180" : ""
                }`}
              />
            </div>

            <p className="mt-1 line-clamp-1 text-base md:text-lg font-extrabold text-slate-950">
              {destination}
            </p>

            <p className="mt-1 text-[10px] md:text-[11px] text-slate-600">
              Where are you travelling?
            </p>
          </button>

          {openDestination && (
            <div className="absolute left-0 top-[calc(100%+10px)] z-[9999] max-h-[260px] md:max-h-[280px] w-full overflow-y-auto rounded-2xl border border-black bg-white p-2 text-black shadow-2xl">
              {DESTINATION_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setDestination(item);
                    setOpenDestination(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${
                    destination === item
                      ? "bg-orange-500 text-white"
                      : "text-slate-800 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  <MapPin size={15} />
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        <div ref={startDateRef} className="relative">
          <button
            type="button"
            onClick={() => setOpenStartDate((prev) => !prev)}
            className="flex h-[86px] md:h-[98px] w-full flex-col items-start rounded-2xl border border-slate-700 bg-white/60 px-3 md:px-4 py-3 text-left"
          >
            <div className="flex w-full items-start justify-between gap-2">
              <p className="text-[10px] md:text-[11px] font-bold text-slate-600">
                Start Date
              </p>
              <CalendarDays size={16} className="text-black" />
            </div>

            <p className="mt-1 line-clamp-1 text-sm md:text-lg font-extrabold text-slate-950">
              {formatDateInput(startDate)}
            </p>

            <p className="mt-1 text-[10px] md:text-[11px] text-slate-600">
              {startDate}
            </p>
          </button>

          {openStartDate && (
            <div className="absolute left-0 top-[calc(100%+10px)] z-[9999] rounded-2xl border border-black bg-white p-2 md:p-3 shadow-2xl scale-[0.88] origin-top-left md:scale-100">
              <Calendar
                onChange={(date: any) => {
                  const nextStart = formatDateToYMD(date);
                  setStartDate(nextStart);

                  if (endDate < nextStart) {
                    setEndDate(nextStart);
                  }

                  setOpenStartDate(false);
                }}
                value={startDate ? new Date(startDate) : new Date()}
                minDate={new Date(todayISO())}
                showDoubleView={false}
              />
            </div>
          )}
        </div>

        <div ref={endDateRef} className="relative">
          <button
            type="button"
            onClick={() => setOpenEndDate((prev) => !prev)}
            className="flex h-[86px] md:h-[98px] w-full flex-col items-start rounded-2xl border border-slate-700 bg-white/60 px-3 md:px-4 py-3 text-left"
          >
            <div className="flex w-full items-start justify-between gap-2">
              <p className="text-[10px] md:text-[11px] font-bold text-slate-600">
                End Date
              </p>
              <CalendarDays size={16} className="text-black" />
            </div>

            <p className="mt-1 line-clamp-1 text-sm md:text-lg font-extrabold text-slate-950">
              {formatDateInput(endDate)}
            </p>

            <p className="mt-1 text-[10px] md:text-[11px] text-slate-600">
              {endDate}
            </p>
          </button>

          {openEndDate && (
            <div className="absolute right-0 md:left-0 md:right-auto top-[calc(100%+10px)] z-[9999] rounded-2xl border border-black bg-white p-2 md:p-3 shadow-2xl scale-[0.88] origin-top-right md:origin-top-left md:scale-100">
              <Calendar
                onChange={(date: any) => {
                  setEndDate(formatDateToYMD(date));
                  setOpenEndDate(false);
                }}
                value={endDate ? new Date(endDate) : new Date()}
                minDate={startDate ? new Date(startDate) : new Date(todayISO())}
                showDoubleView={false}
              />
            </div>
          )}
        </div>

        <div ref={travellersRef} className="relative">
          <button
            type="button"
            onClick={() => setOpenTravellers((prev) => !prev)}
            className="flex h-[86px] md:h-[98px] w-full flex-col items-start rounded-2xl border border-slate-700 bg-white/60 px-3 md:px-4 py-3 text-left"
          >
            <div className="flex w-full items-start justify-between gap-2">
              <p className="text-[10px] md:text-[11px] font-bold text-slate-600">
                Travellers
              </p>
              <ChevronDown
                size={16}
                className={`text-black transition ${
                  openTravellers ? "rotate-180" : ""
                }`}
              />
            </div>

            <p className="mt-1 line-clamp-1 text-sm md:text-lg font-extrabold text-slate-950">
              {travellerCount} Traveller{travellerCount > 1 ? "s" : ""}
            </p>

            <p className="mt-1 line-clamp-1 text-[10px] md:text-[11px] text-slate-600">
              {ageSummary}
            </p>
          </button>

          {openTravellers && (
            <div className="absolute right-0 top-[calc(100%+10px)] z-[9999] w-[calc(100vw-32px)] max-w-[380px] rounded-2xl border border-black bg-white p-4 text-black shadow-2xl">
              <div className="mb-4 flex items-center justify-between rounded-2xl bg-orange-50 p-3">
                <div>
                  <p className="text-sm font-extrabold text-slate-900">
                    Select Travellers
                  </p>
                  <p className="text-xs font-semibold text-slate-600">
                    Add age for every insured member
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateTravellerCount(Math.max(1, travellerCount - 1))
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-orange-200 bg-white text-lg font-bold text-orange-600"
                  >
                    -
                  </button>

                  <span className="w-6 text-center text-sm font-extrabold text-slate-900">
                    {travellerCount}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      updateTravellerCount(Math.min(9, travellerCount + 1))
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-orange-200 bg-white text-lg font-bold text-orange-600"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                {Array.from({ length: travellerCount }).map((_, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_90px] md:grid-cols-[1fr_110px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Traveller {index + 1}
                      </p>
                      <p className="text-xs font-semibold text-slate-600">
                        Age as per passport / ID
                      </p>
                    </div>

                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={travellerAges[index] || ""}
                      onChange={(e) =>
                        updateTravellerAge(index, Number(e.target.value))
                      }
                      className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-extrabold text-slate-900 outline-none focus:border-orange-400"
                      placeholder="Age"
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setOpenTravellers(false)}
                className="mt-4 w-full rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-orange-600"
              >
                Apply Travellers
              </button>
            </div>
          )}
        </div>

        <div ref={coverageRef} className="relative">
          <button
            type="button"
            onClick={() => setOpenCoverage((prev) => !prev)}
            className="flex h-[86px] md:h-[98px] w-full flex-col items-start rounded-2xl border border-slate-700 bg-white/60 px-3 md:px-4 py-3 text-left"
          >
            <div className="flex w-full items-start justify-between gap-2">
              <p className="text-[10px] md:text-[11px] font-bold text-slate-600">
                Coverage
              </p>
              <ChevronDown
                size={16}
                className={`text-black transition ${
                  openCoverage ? "rotate-180" : ""
                }`}
              />
            </div>

            <p className="mt-1 line-clamp-1 text-sm md:text-lg font-extrabold text-slate-950">
              ${coverageAmount.toLocaleString()}
            </p>

            <p className="mt-1 text-[10px] md:text-[11px] text-slate-600">
              Sum insured
            </p>
          </button>

          {openCoverage && (
            <div className="absolute right-0 top-[calc(100%+10px)] z-[9999] w-full min-w-[160px] rounded-2xl border border-black bg-white p-2 text-black shadow-2xl">
              {COVERAGE_OPTIONS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => {
                    setCoverageAmount(amount);
                    setOpenCoverage(false);
                  }}
                  className={`w-full rounded-xl px-3 py-3 text-left text-sm font-bold transition ${
                    coverageAmount === amount
                      ? "bg-orange-500 text-white"
                      : "text-slate-800 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  ${amount.toLocaleString()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP PURPOSE CHIPS — untouched */}
      <div className="mt-4 hidden md:flex flex-wrap items-center justify-start gap-3">
        {["Leisure", "Business", "Study", "Visa", "Adventure"].map(
          (purpose) => (
            <button
              key={purpose}
              type="button"
              onClick={() => setTripPurpose(purpose)}
              className={`h-9 rounded-full border px-4 text-sm font-bold ${
                tripPurpose === purpose
                  ? "border-orange-500 bg-orange-600 text-white"
                  : "border-slate-700 bg-white/75 text-slate-900"
              }`}
            >
              {purpose}
            </button>
          )
        )}

        <label className="flex h-9 cursor-pointer items-center gap-2 rounded-full border border-slate-700 bg-white/75 px-4 text-sm font-bold text-slate-900">
          <input
            type="checkbox"
            checked={hasMedicalCondition}
            onChange={(e) => setHasMedicalCondition(e.target.checked)}
          />
          Existing Medical Condition
        </label>
      </div>

      {/* MOBILE PURPOSE DROPDOWN */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:hidden">
        <div>
          <label className="mb-1 block text-[11px] font-extrabold text-white">
            Trip Purpose
          </label>

          <select
            value={tripPurpose}
            onChange={(e) => setTripPurpose(e.target.value)}
            className="h-11 w-full rounded-2xl border border-slate-700 bg-white/90 px-3 text-sm font-extrabold text-slate-900 outline-none"
          >
            {["Leisure", "Business", "Study", "Visa", "Adventure"].map(
              (purpose) => (
                <option key={purpose} value={purpose}>
                  {purpose}
                </option>
              )
            )}
          </select>
        </div>

        <label className="flex h-11 cursor-pointer items-center gap-2 rounded-2xl border border-slate-700 bg-white/90 px-3 text-sm font-bold text-slate-900">
          <input
            type="checkbox"
            checked={hasMedicalCondition}
            onChange={(e) => setHasMedicalCondition(e.target.checked)}
          />
          Existing Medical Condition
        </label>
      </div>

      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={handleSearch}
          className="flex h-11 md:h-12 w-full md:w-auto min-w-[180px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-lime-500 px-8 text-sm md:text-base font-extrabold text-white shadow-lg transition hover:scale-[1.02]"
        >
          <Search size={18} />
          SEARCH
        </button>
      </div>
    </div>
  );
}