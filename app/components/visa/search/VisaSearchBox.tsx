"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import {
  CalendarDays,
  ChevronDown,
  Globe2,
  PlaneTakeoff,
  Search,
  Users,
} from "lucide-react";

type VisaType = "Tourist" | "Business" | "Student" | "Transit";

const DESTINATION_COUNTRIES = [
  "United Arab Emirates",
  "Singapore",
  "Thailand",
  "Malaysia",
  "Vietnam",
  "Indonesia",
  "Australia",
  "United Kingdom",
  "United States",
  "Canada",
  "Schengen",
];

const NATIONALITIES = [
  "India",
  "Nepal",
  "Bangladesh",
  "Sri Lanka",
  "United Arab Emirates",
  "United States",
  "United Kingdom",
];

function formatDateToYMD(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateString: string) {
  if (!dateString) return "Select date";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Select date";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function VisaSearchBox() {
  const router = useRouter();

  const [destinationCountry, setDestinationCountry] = useState(
    "United Arab Emirates"
  );
  const [nationality, setNationality] = useState("India");
  const [travelDate, setTravelDate] = useState("");
  const [visaType, setVisaType] = useState<VisaType>("Tourist");
  const [travellers, setTravellers] = useState(1);

  const [openDestination, setOpenDestination] = useState(false);
  const [openNationality, setOpenNationality] = useState(false);
  const [openTravellers, setOpenTravellers] = useState(false);
  const [openDate, setOpenDate] = useState(false);

  const destinationRef = useRef<HTMLDivElement | null>(null);
  const nationalityRef = useRef<HTMLDivElement | null>(null);
  const travellersRef = useRef<HTMLDivElement | null>(null);
  const dateRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as Node;

      if (destinationRef.current && !destinationRef.current.contains(target)) {
        setOpenDestination(false);
      }

      if (nationalityRef.current && !nationalityRef.current.contains(target)) {
        setOpenNationality(false);
      }

      if (travellersRef.current && !travellersRef.current.contains(target)) {
        setOpenTravellers(false);
      }

      if (dateRef.current && !dateRef.current.contains(target)) {
        setOpenDate(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = () => {
    const payload = {
      destinationCountry,
      nationality,
      travelDate,
      visaType,
      travellers,
      searchedAt: new Date().toISOString(),
    };

    sessionStorage.setItem("tplVisaSearchData", JSON.stringify(payload));
    router.push("/visa/results");
  };

  return (
    <div className="mt-7 w-full rounded-3xl border border-white/40 bg-white/15 p-7 backdrop-blur-sm">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {(["Tourist", "Business", "Student", "Transit"] as VisaType[]).map(
          (type) => (
            <button
              key={type}
              type="button"
              onClick={() => setVisaType(type)}
              className={`rounded-full border px-6 py-2 text-sm font-bold transition ${
                visaType === type
                  ? "border-orange-500 bg-orange-600 text-white"
                  : "border-black bg-white/70 text-black hover:bg-white"
              }`}
            >
              {type}
            </button>
          )
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.25fr_1.05fr_1.05fr_1.05fr_1fr]">
        <div ref={destinationRef} className="relative">
          <button
            type="button"
            onClick={() => setOpenDestination((prev) => !prev)}
            className="flex min-h-[128px] w-full flex-col items-start rounded-2xl border border-black bg-white/60 p-4 text-left"
          >
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-black">
              <Globe2 size={17} />
              Destination
            </div>

            <p className="line-clamp-2 h-[40px] pr-6 text-[17px] font-extrabold leading-[22px] text-black">
  {destinationCountry}
</p>

            <p className="mt-2 text-xs text-black/70">Select visa country</p>

            <ChevronDown
              className={`absolute right-4 top-5 h-4 w-4 text-black transition ${
                openDestination ? "rotate-180" : ""
              }`}
            />
          </button>

          {openDestination && (
            <div className="absolute left-0 top-[calc(100%+10px)] z-[9999] max-h-[290px] w-full overflow-y-auto rounded-2xl border border-black bg-white p-2 text-black shadow-2xl">
              {DESTINATION_COUNTRIES.map((country) => (
                <button
                  key={country}
                  type="button"
                  onClick={() => {
                    setDestinationCountry(country);
                    setOpenDestination(false);
                  }}
                  className={`w-full rounded-xl px-3 py-3 text-left text-sm font-bold transition ${
                    destinationCountry === country
                      ? "bg-orange-500 text-white"
                      : "text-slate-800 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          )}
        </div>

        <div ref={nationalityRef} className="relative">
          <button
            type="button"
            onClick={() => setOpenNationality((prev) => !prev)}
            className="flex min-h-[128px] w-full flex-col items-start rounded-2xl border border-black bg-white/60 p-4 text-left"
          >
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-black">
              <PlaneTakeoff size={17} />
              Nationality
            </div>

            <p className="line-clamp-2 h-[40px] pr-6 text-[17px] font-extrabold leading-[22px] text-black">
  {nationality}
</p>

            <p className="mt-2 text-xs text-black/70">Passport nationality</p>

            <ChevronDown
              className={`absolute right-4 top-5 h-4 w-4 text-black transition ${
                openNationality ? "rotate-180" : ""
              }`}
            />
          </button>

          {openNationality && (
            <div className="absolute left-0 top-[calc(100%+10px)] z-[9999] max-h-[260px] w-full overflow-y-auto rounded-2xl border border-black bg-white p-2 text-black shadow-2xl">
              {NATIONALITIES.map((country) => (
                <button
                  key={country}
                  type="button"
                  onClick={() => {
                    setNationality(country);
                    setOpenNationality(false);
                  }}
                  className={`w-full rounded-xl px-3 py-3 text-left text-sm font-bold transition ${
                    nationality === country
                      ? "bg-orange-500 text-white"
                      : "text-slate-800 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          )}
        </div>

        <div ref={dateRef} className="relative">
          <button
            type="button"
            onClick={() => setOpenDate((prev) => !prev)}
            className="flex min-h-[128px] w-full flex-col items-start rounded-2xl border border-black bg-white/60 p-4 text-left"
          >
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-black">
              <CalendarDays size={17} />
              Travel Date
            </div>

            <p className="text-xl font-extrabold leading-snug text-black">
              {formatDisplayDate(travelDate)}
            </p>

            <p className="mt-2 text-xs text-black/70">Approx travel date</p>

            <ChevronDown
              className={`absolute right-4 top-5 h-4 w-4 text-black transition ${
                openDate ? "rotate-180" : ""
              }`}
            />
          </button>

          {openDate && (
            <div className="absolute left-0 top-[calc(100%+10px)] z-[9999] rounded-2xl border border-black bg-white p-3 shadow-2xl">
              <Calendar
                onChange={(date: any) => {
                  setTravelDate(formatDateToYMD(date));
                  setOpenDate(false);
                }}
                value={travelDate ? new Date(travelDate) : new Date()}
                minDate={new Date()}
                showDoubleView={false}
              />
            </div>
          )}
        </div>

        <div ref={travellersRef} className="relative">
          <button
            type="button"
            onClick={() => setOpenTravellers((prev) => !prev)}
            className="flex min-h-[128px] w-full flex-col items-start rounded-2xl border border-black bg-white/60 p-4 text-left"
          >
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-black">
              <Users size={17} />
              Travellers
            </div>

            <p className="text-xl font-extrabold leading-snug text-black">
              {travellers} Traveller{travellers > 1 ? "s" : ""}
            </p>

            <p className="mt-2 text-xs text-black/70">Applicant count</p>

            <ChevronDown
              className={`absolute right-4 top-5 h-4 w-4 text-black transition ${
                openTravellers ? "rotate-180" : ""
              }`}
            />
          </button>

          {openTravellers && (
            <div className="absolute right-0 top-[calc(100%+10px)] z-[9999] w-[280px] rounded-2xl border border-black bg-white p-4 text-black shadow-2xl">
              <p className="mb-3 text-sm font-extrabold text-slate-900">
                Select Applicants
              </p>

              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setTravellers(num);
                      setOpenTravellers(false);
                    }}
                    className={`h-11 rounded-xl border text-sm font-extrabold transition ${
                      travellers === num
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-slate-300 bg-white text-slate-800 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSearch}
          className="flex min-h-[128px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 text-lg font-extrabold text-white shadow-lg transition hover:scale-[1.02]"
        >
          <Search size={22} />
          SEARCH
        </button>
      </div>
    </div>
  );
}