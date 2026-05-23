"use client";

import { CalendarDays, Globe2, PlaneTakeoff, Search, Users } from "lucide-react";

export type VisaResultsSearchData = {
  destinationCountry: string;
  nationality: string;
  travelDate: string;
  visaType: string;
  travellers: number;
};

type Props = {
  searchData: VisaResultsSearchData;
  onChange: (data: VisaResultsSearchData) => void;
  onSearch: () => void;
};

export default function VisaResultsSearchBar({
  searchData,
  onChange,
  onSearch,
}: Props) {
  const updateField = (key: keyof VisaResultsSearchData, value: any) => {
    onChange({
      ...searchData,
      [key]: value,
    });
  };

  return (
    <div className=" z-40 border-b border-slate-200/10 bg-[#07111f]/95 px-6 py-3 shadow-[0_12px_32px_rgba(15,23,42,0.28)] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-visible rounded-2xl border border-white/10 bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#0b1220] shadow-[0_18px_45px_rgba(2,6,23,0.35)]">
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2">
            {["Tourist", "Business", "Student", "Transit"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => updateField("visaType", type)}
                className={`rounded-full border px-4 py-1.5 text-[12px] font-extrabold transition ${
                  searchData.visaType === type
                    ? "border-cyan-300 bg-cyan-400 text-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.35)]"
                    : "border-white/10 bg-white/5 text-slate-200 hover:border-cyan-300/60 hover:bg-white/10"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 overflow-visible lg:grid-cols-[1.2fr_1fr_180px_170px_155px]">
            <FieldBox label="Destination" icon={<Globe2 size={14} />}>
              <select
                value={searchData.destinationCountry}
                onChange={(e) =>
                  updateField("destinationCountry", e.target.value)
                }
                className="w-full bg-transparent text-[15px] font-extrabold text-white outline-none"
              >
                <option className="text-black">United Arab Emirates</option>
                <option className="text-black">Singapore</option>
                <option className="text-black">Thailand</option>
                <option className="text-black">Malaysia</option>
                <option className="text-black">Vietnam</option>
                <option className="text-black">Indonesia</option>
                <option className="text-black">Australia</option>
                <option className="text-black">United Kingdom</option>
                <option className="text-black">United States</option>
                <option className="text-black">Canada</option>
                <option className="text-black">Schengen</option>
              </select>
              <p className="mt-1 truncate text-[11px] font-medium text-slate-300">
                Select visa country
              </p>
            </FieldBox>

            <FieldBox label="Nationality" icon={<PlaneTakeoff size={14} />}>
              <select
                value={searchData.nationality}
                onChange={(e) => updateField("nationality", e.target.value)}
                className="w-full bg-transparent text-[15px] font-extrabold text-white outline-none"
              >
                <option className="text-black">India</option>
                <option className="text-black">Nepal</option>
                <option className="text-black">Bangladesh</option>
                <option className="text-black">Sri Lanka</option>
                <option className="text-black">United Arab Emirates</option>
                <option className="text-black">United States</option>
                <option className="text-black">United Kingdom</option>
              </select>
              <p className="mt-1 truncate text-[11px] font-medium text-slate-300">
                Passport nationality
              </p>
            </FieldBox>

            <FieldBox label="Travel Date" icon={<CalendarDays size={14} />}>
              <input
                type="date"
                value={searchData.travelDate}
                onChange={(e) => updateField("travelDate", e.target.value)}
                className="w-full bg-transparent text-[15px] font-extrabold text-white outline-none [color-scheme:dark]"
              />
              <p className="mt-1 truncate text-[11px] font-medium text-slate-300">
                Approx travel date
              </p>
            </FieldBox>

            <FieldBox label="Travellers" icon={<Users size={14} />}>
              <select
                value={searchData.travellers}
                onChange={(e) =>
                  updateField("travellers", Number(e.target.value))
                }
                className="w-full bg-transparent text-[15px] font-extrabold text-white outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <option key={num} value={num} className="text-black">
                    {num} Traveller{num > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
              <p className="mt-1 truncate text-[11px] font-medium text-slate-300">
                Applicant count
              </p>
            </FieldBox>

            <div className="flex items-center justify-center border-l border-white/10 bg-white/[0.04] px-3 py-2">
              <button
                type="button"
                onClick={onSearch}
                className="flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 text-[14px] font-black text-white shadow-[0_10px_24px_rgba(14,165,233,0.35)] transition hover:scale-[1.02] hover:from-cyan-300 hover:to-blue-500"
              >
                <Search size={17} />
                SEARCH
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldBox({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="group min-w-0 overflow-visible border-r border-white/10 bg-white/[0.035] px-3 py-2 transition hover:bg-white/[0.07]">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-300">
        {icon}
        {label}
      </div>

      <div className="overflow-visible">{children}</div>
    </div>
  );
}