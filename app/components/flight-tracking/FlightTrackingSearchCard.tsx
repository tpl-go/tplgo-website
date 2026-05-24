"use client";

import { useState } from "react";
import {
  Search,
  Ticket,
  Plane,
  MapPin,
  Clock,
  AlertTriangle,
  Navigation,
  Radio,
} from "lucide-react";

type SearchType = "pnr" | "flight";

type InsightType =
  | "live"
  | "delay"
  | "tracking"
  | "airport"
  | "";

type Props = {
  onSearch: (value: string, type: SearchType) => void;
  loading?: boolean;
};

function formatFlightNumber(value: string) {
  const clean = value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  const match = clean.match(/^([A-Z0-9]{2})([0-9]{1,4})$/);

  if (match) {
    return `${match[1]} ${match[2]}`;
  }

  return clean;
}

function formatPNR(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
}

export default function FlightTrackingSearchCard({
  onSearch,
  loading = false,
}: Props) {
  const [searchType, setSearchType] =
    useState<SearchType>("flight");

  const [value, setValue] = useState("");
  const [activeInsight, setActiveInsight] =
    useState<InsightType>("");

  const formattedValue =
    searchType === "flight"
      ? formatFlightNumber(value)
      : formatPNR(value);

  const handleValueChange = (
    inputValue: string
  ) => {
    const nextValue =
      searchType === "flight"
        ? formatFlightNumber(inputValue)
        : formatPNR(inputValue);

    setValue(nextValue);
  };

  const handleTypeChange = (type: SearchType) => {
    setSearchType(type);
    setActiveInsight("");

    if (type === "flight") {
      setValue(formatFlightNumber(value));
    } else {
      setValue(formatPNR(value));
    }
  };

  const handleSearch = () => {
    if (!formattedValue.trim()) return;

    setValue(formattedValue);
    onSearch(formattedValue, searchType);
  };

  const handleInsightClick = (type: InsightType) => {
    if (!formattedValue.trim()) return;

    setActiveInsight(type);
    setValue(formattedValue);
    onSearch(formattedValue, searchType);
  };

  const insightTitle =
    activeInsight === "live"
      ? "Live status"
      : activeInsight === "delay"
      ? "Delay & gate information"
      : activeInsight === "tracking"
      ? "Real-time tracking"
      : activeInsight === "airport"
      ? "Airport updates"
      : "";

  const insightDescription =
    activeInsight === "live"
      ? `Showing latest live status for ${formattedValue}.`
      : activeInsight === "delay"
      ? `Checking delay, terminal and gate details for ${formattedValue}.`
      : activeInsight === "tracking"
      ? `Showing route movement and current flight progress for ${formattedValue}.`
      : activeInsight === "airport"
      ? `Showing airport-side updates for ${formattedValue}.`
      : "";

  return (
    <section className="relative z-10 md:-mt-16">
      <div className="max-w-5xl mx-auto px-3 md:px-6">
        <div
          className="
            rounded-[24px]
            md:rounded-[32px]
            border
            border-white/40
            bg-white/95
            backdrop-blur-xl
            shadow-xl
            md:shadow-2xl
            p-4
            md:p-8
          "
        >
          {/* Tabs */}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
            <button
              type="button"
              onClick={() =>
                handleTypeChange("flight")
              }
              className={`flex items-center justify-center gap-2 rounded-2xl md:rounded-full px-4 py-3 text-sm font-bold transition ${
                searchType === "flight"
                  ? "bg-orange-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Plane size={16} />
              Flight Number
            </button>

            <button
              type="button"
              onClick={() =>
                handleTypeChange("pnr")
              }
              className={`flex items-center justify-center gap-2 rounded-2xl md:rounded-full px-4 py-3 text-sm font-bold transition ${
                searchType === "pnr"
                  ? "bg-orange-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Ticket size={16} />
              PNR Number
            </button>
          </div>

          {/* Search Area */}
          <div className="mt-5 grid gap-3 md:mt-7 lg:grid-cols-[1fr_auto] md:gap-4">
            <div className="relative">
              <div className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-400">
                {searchType === "flight" ? (
                  <Plane size={18} />
                ) : (
                  <MapPin size={18} />
                )}
              </div>

              <input
                type="text"
                value={value}
                onChange={(e) =>
                  handleValueChange(e.target.value)
                }
                placeholder={
                  searchType === "flight"
                    ? "Enter flight number"
                    : "Enter PNR number"
                }
                className="
                  h-14
                  md:h-16
                  w-full
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  pl-12
                  md:pl-14
                  pr-4
                  md:pr-5
                  text-base
                  md:text-lg
                  font-semibold
                  text-gray-900
                  outline-none
                  transition
                  focus:border-orange-500
                "
              />
            </div>

            <button
              type="button"
              disabled={!formattedValue.trim() || loading}
              onClick={handleSearch}
              className="
                flex
                h-14
                md:h-16
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-orange-500
                px-6
                md:px-8
                text-sm
                md:text-base
                font-bold
                text-white
                transition
                hover:bg-orange-600
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <Search size={18} />

              {loading
                ? "Searching..."
                : "Track Flight"}
            </button>
          </div>

          {/* Quick Hints */}
          <div className="mt-5 md:mt-6 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max pb-1 md:flex-wrap md:min-w-0 md:gap-3">
              <button
                type="button"
                disabled={!formattedValue.trim()}
                onClick={() =>
                  handleInsightClick("live")
                }
                className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-orange-100 hover:text-orange-700 transition disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
              >
                <Radio size={14} />
                Live Status
              </button>

              <button
                type="button"
                disabled={!formattedValue.trim()}
                onClick={() =>
                  handleInsightClick("delay")
                }
                className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-orange-100 hover:text-orange-700 transition disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
              >
                <AlertTriangle size={14} />
                Delays & Gate Info
              </button>

              <button
                type="button"
                disabled={!formattedValue.trim()}
                onClick={() =>
                  handleInsightClick("tracking")
                }
                className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-orange-100 hover:text-orange-700 transition disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
              >
                <Navigation size={14} />
                Real-time Tracking
              </button>

              <button
                type="button"
                disabled={!formattedValue.trim()}
                onClick={() =>
                  handleInsightClick("airport")
                }
                className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-orange-100 hover:text-orange-700 transition disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
              >
                <Clock size={14} />
                Airport Updates
              </button>
            </div>
          </div>

          {activeInsight && (
            <div className="mt-5 md:mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-4 md:p-5">
              <div className="text-sm font-extrabold text-orange-700">
                {insightTitle}
              </div>

              <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
                {insightDescription}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}