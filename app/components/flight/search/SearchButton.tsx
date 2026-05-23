"use client";

import { useRouter } from "next/navigation";

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

  const getNormalizedMultiCitySegments = () => {
    return (state.segments || [])
      .slice(0, 5)
      .filter((seg: any) => seg?.from || seg?.to || seg?.departure);
  };

  const validateSearch = () => {
    if (state.tripType === "oneway") {
      if (
        !state.segments[0]?.from ||
        !state.segments[0]?.to ||
        !state.segments[0]?.departure
      ) {
        alert("Please fill From, To and Departure date");
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
        alert("Please fill all Round Trip details");
        return false;
      }

      if (
        new Date(state.returnDate) < new Date(state.segments[0].departure)
      ) {
        alert("Return date must be after Departure date");
        return false;
      }
    }

    if (state.tripType === "multicity") {
      const multiCitySegments = getNormalizedMultiCitySegments();

      if (!multiCitySegments.length) {
        alert("Please fill all Multi City segment details");
        return false;
      }

      for (const seg of multiCitySegments) {
        if (!seg.from || !seg.to || !seg.departure) {
          alert("Please fill all Multi City segment details");
          return false;
        }
      }
    }

    return true;
  };

  const handleSearch = () => {
    if (!validateSearch()) return;

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
  };

  if (isResults) {
    return (
      <button
        onClick={handleSearch}
        type="button"
        style={{
          width: "140px",
          height: "74px",
          backgroundColor: "#f97316",
          color: "#ffffff",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          cursor: "pointer",
          alignSelf: "stretch",
        }}
      >
        SEARCH
      </button>
    );
  }

  return (
    <div className="mt-8 flex justify-center">
      <button
        onClick={handleSearch}
        className="rounded-lg bg-gradient-to-r from-orange-500 to-green-500 px-8 py-3 font-semibold text-white"
      >
        SEARCH
      </button>
    </div>
  );
}