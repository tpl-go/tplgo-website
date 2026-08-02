"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateFlightSearchState } from "@/app/lib/flights/flightBackendIntegration";

type Props = {
  state: any;
  variant?: "home" | "results";
  onSearchComplete?: () => void;
};

export default function SearchButton({
  state,
  variant = "home",
  onSearchComplete,
}: Props) {
  const isResults = variant === "results";
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getNormalizedMultiCitySegments = () => {
    return (state.segments || [])
      .slice(0, 5)
      .filter((seg: any) => seg?.from || seg?.to || seg?.departure);
  };

  const validateSearch = () => {
    const backendValidation = validateFlightSearchState(state);
    if (!backendValidation.ok && state.tripType === "oneway") {
      setErrorMessage(backendValidation.errors[0] || "Please check flight search details.");
      return false;
    }

    if (state.tripType === "oneway") {
      if (
        !state.segments[0]?.from ||
        !state.segments[0]?.to ||
        !state.segments[0]?.departure
      ) {
        setErrorMessage("Please fill From, To and Departure date.");
        return false;
      }
    }

    if (state.tripType === "roundtrip") {
      if (
        !state.segments[0]?.from ||
        !state.segments[0]?.to ||
        !state.segments[0]?.departure ||
        !state.returnDate
      ) {
        setErrorMessage("Please fill all Round Trip details.");
        return false;
      }

      if (new Date(state.returnDate) < new Date(state.segments[0].departure)) {
        setErrorMessage("Return date must be after Departure date.");
        return false;
      }
    }

    if (state.tripType === "multicity") {
      const multiCitySegments = getNormalizedMultiCitySegments();

      if (!multiCitySegments.length) {
        setErrorMessage("Please fill all Multi City segment details.");
        return false;
      }

      for (const seg of multiCitySegments) {
        if (!seg.from || !seg.to || !seg.departure) {
          setErrorMessage("Please fill all Multi City segment details.");
          return false;
        }
      }
    }

    if (Number(state.travellers?.infants || 0) > Number(state.travellers?.adults || 0)) {
      setErrorMessage("Infants cannot exceed adult travellers.");
      return false;
    }

    setErrorMessage("");
    return true;
  };

  const handleSearch = () => {
    if (isSubmitting) return;
    if (!validateSearch()) return;
    setIsSubmitting(true);

    const fareType = state.fareType || "Regular";
    const adults = state.travellers?.adults ?? 1;
    const children = state.travellers?.children ?? 0;
    const infants = state.travellers?.infants ?? 0;
    const cabin = state.travellers?.cabin || "Economy";

    const params = new URLSearchParams();

    params.set("tripType", state.tripType || "oneway");
    params.set("fareType", fareType);
    params.set("adults", String(adults));
    params.set("children", String(children));
    params.set("infants", String(infants));
    params.set("cabin", cabin);

    if (state.tripType === "multicity") {
      const multiCitySegments = getNormalizedMultiCitySegments();

      multiCitySegments.forEach((seg: any, index: number) => {
        if (seg.from && seg.to && seg.departure) {
          params.set(`from_${index}`, seg.from.code);
          params.set(`fromCity_${index}`, seg.from.city);
          params.set(`to_${index}`, seg.to.code);
          params.set(`toCity_${index}`, seg.to.city);
          params.set(
            `departure_${index}`,
            new Date(seg.departure).toISOString()
          );
        }
      });
    } else {
      const firstSegment = state.segments?.[0];

      const fromCode = firstSegment?.from?.code || "";
      const fromCity = firstSegment?.from?.city || "";
      const toCode = firstSegment?.to?.code || "";
      const toCity = firstSegment?.to?.city || "";

      const departure = firstSegment?.departure
        ? new Date(firstSegment.departure).toISOString()
        : "";

      const returnDate = state.returnDate
        ? new Date(state.returnDate).toISOString()
        : "";

      params.set("from", fromCode);
      params.set("fromCity", fromCity);
      params.set("to", toCode);
      params.set("toCity", toCity);
      params.set("departure", departure);
      params.set("returnDate", returnDate);
    }

    onSearchComplete?.();
    router.push(`/flights?${params.toString()}`);
    window.setTimeout(() => setIsSubmitting(false), 800);
  };

  if (isResults) {
    return (
      <div className="w-full">
        <button
          onClick={handleSearch}
          type="button"
          disabled={isSubmitting}
          className="flex h-[52px] w-full items-center justify-center rounded-lg border-none bg-[#f97316] text-[14px] font-bold text-white shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:h-[74px] sm:w-[140px]"
          style={{
            cursor: isSubmitting ? "not-allowed" : "pointer",
            alignSelf: "stretch",
          }}
        >
          {isSubmitting ? "SEARCHING" : "SEARCH"}
        </button>
        {errorMessage ? (
          <div className="mt-2 text-[12px] font-bold leading-4 text-[#b91c1c]">
            {errorMessage}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-4 flex justify-center md:mt-8">
      <button
        onClick={handleSearch}
        disabled={isSubmitting}
        className="h-11 w-full rounded-xl bg-gradient-to-r from-orange-500 to-lime-500 px-8 py-0 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 md:h-auto md:w-auto md:rounded-lg md:py-3 md:text-base"
      >
        {isSubmitting ? "SEARCHING" : "SEARCH"}
      </button>
      {errorMessage ? (
        <div className="mt-2 text-center text-[12px] font-bold leading-4 text-[#fee2e2]">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
}
