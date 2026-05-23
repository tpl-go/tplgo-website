"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CruiseSuggestionDropdown from "./CruiseSuggestionDropdown";
import { CruiseDestination } from "@/app/lib/cruise/cruiseTypes";
import { searchCruiseDestinations } from "@/app/lib/cruise/cruiseSearchHelpers";

type CruiseDestinationFieldProps = {
  value: CruiseDestination | null;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (destination: CruiseDestination) => void;
  suggestions: CruiseDestination[];
  error?: string;
};

export default function CruiseDestinationField({
  value,
  isOpen,
  onOpen,
  onClose,
  onSelect,
  suggestions,
  error,
}: CruiseDestinationFieldProps) {
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (
        fieldRef.current &&
        !fieldRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  const filteredSuggestions = useMemo(() => {
    return searchCruiseDestinations(suggestions, query);
  }, [suggestions, query]);

  return (
    <div ref={fieldRef} className="relative">
      <button
        type="button"
        onClick={() => (isOpen ? onClose() : onOpen())}
        className="flex h-[132px] w-full flex-col items-start justify-center rounded-2xl px-4 py-4 text-left transition hover:bg-white/75"
      >
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
          Destination
        </span>

        <span className="mt-2 line-clamp-2 text-[16px] font-extrabold leading-[22px] text-slate-950">
          {value?.label || "Where do you want to cruise?"}
        </span>

        <span className="mt-2 truncate text-[12px] text-slate-600">
          Search destination or region
        </span>
      </button>

      {error ? <p className="mt-1 px-2 text-xs text-red-500">{error}</p> : null}

      {isOpen ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-[9999] w-full">
          <div className="overflow-hidden rounded-2xl border border-black bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-4 py-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search destination, region, route"
                className="h-7 w-full bg-transparent text-sm font-semibold text-black outline-none placeholder:text-slate-400"
              />
            </div>

            <CruiseSuggestionDropdown
              items={filteredSuggestions.map((item) => ({
                ...item,
                description: item.type === "region" ? "Region" : "Destination",
              }))}
              onSelect={(item) => {
                onSelect(item);
                setQuery("");
              }}
              emptyText="No matching destinations found."
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}