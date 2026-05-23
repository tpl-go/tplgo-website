"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import CruiseDestinationField from "./CruiseDestinationField";
import CruiseDeparturePortField from "./CruiseDeparturePortField";
import CruiseSailingField from "./CruiseSailingField";
import CruiseDurationField from "./CruiseDurationField";
import CruiseTravellersField from "./CruiseTravellersField";
import CruiseSearchButton from "./CruiseSearchButton";

import {
  CruiseDestination,
  CruiseDurationOption,
  CruisePort,
  CruiseSearchState,
} from "@/app/lib/cruise/cruiseTypes";
import { prioritizePortsByDestination } from "@/app/lib/cruise/cruiseSearchHelpers";
import { validateCruiseSearch } from "@/app/lib/cruise/cruiseSearchValidation";
import { buildCruiseSearchPayload } from "@/app/lib/cruise/buildCruiseSearchPayload";
import { fetchCruiseSearchOptions } from "@/app/lib/cruise/cruiseSearchService";

type ActiveField =
  | "destination"
  | "departurePort"
  | "duration"
  | "travellers"
  | null;

const initialCruiseSearchState: CruiseSearchState = {
  destination: null,
  departurePort: null,
  sailing: {
    mode: "month",
    exactDate: null,
    month: null,
  },
  duration: null,
  travellers: {
    adults: 2,
    children: 0,
    infants: 0,
  },
};

export default function CruiseSearchBox() {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [searchState, setSearchState] =
    useState<CruiseSearchState>(initialCruiseSearchState);
  const [activeField, setActiveField] = useState<ActiveField>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [destinations, setDestinations] = useState<CruiseDestination[]>([]);
  const [ports, setPorts] = useState<CruisePort[]>([]);
  const [durations, setDurations] = useState<CruiseDurationOption[]>([]);

  const [errors, setErrors] = useState<{
    destination?: string;
    departurePort?: string;
    sailing?: string;
    travellers?: string;
  }>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current) return;

      if (!wrapperRef.current.contains(event.target as Node)) {
        setActiveField(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadInitialOptions() {
      const response = await fetchCruiseSearchOptions();

      if (ignore) return;

      setDestinations(response.destinations);
      setPorts(response.ports);
      setDurations(response.durations);
    }

    loadInitialOptions();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadPortsForDestination() {
      const response = await fetchCruiseSearchOptions({
        destinationId: searchState.destination?.id ?? null,
      });

      if (ignore) return;

      setPorts(response.ports);
    }

    loadPortsForDestination();

    return () => {
      ignore = true;
    };
  }, [searchState.destination?.id]);

  const prioritizedPorts = useMemo(() => {
    return prioritizePortsByDestination(
      ports,
      searchState.destination?.id ?? null
    );
  }, [ports, searchState.destination]);

  const openField = (field: ActiveField) => {
    setActiveField(field);
  };

  const closeField = () => {
    setActiveField(null);
  };

  const handleDestinationSelect = (destination: CruiseDestination) => {
    setSearchState((prev) => {
      const currentDeparturePort = prev.departurePort;
      const nextPorts = prioritizePortsByDestination(ports, destination.id);

      const departureStillValid = nextPorts.some(
        (port) => port.id === currentDeparturePort?.id
      );

      return {
        ...prev,
        destination,
        departurePort: departureStillValid ? currentDeparturePort : null,
      };
    });

    setErrors((prev) => ({
      ...prev,
      destination: undefined,
      departurePort: undefined,
    }));

    setActiveField(null);
  };

  const handleDeparturePortSelect = (departurePort: CruisePort) => {
    setSearchState((prev) => ({
      ...prev,
      departurePort,
    }));

    setErrors((prev) => ({
      ...prev,
      destination: undefined,
      departurePort: undefined,
    }));

    setActiveField(null);
  };

  const handleSailingChange = (payload: CruiseSearchState["sailing"]) => {
    setSearchState((prev) => ({
      ...prev,
      sailing: payload,
    }));

    setErrors((prev) => ({
      ...prev,
      sailing: undefined,
    }));
  };

  const handleDurationSelect = (duration: CruiseDurationOption) => {
    setSearchState((prev) => ({
      ...prev,
      duration,
    }));

    setActiveField(null);
  };

  const updateTravellers = (
    key: "adults" | "children" | "infants",
    delta: number
  ) => {
    setSearchState((prev) => {
      const currentValue = prev.travellers[key];
      const nextValue = currentValue + delta;

      const guardedValue =
        key === "adults" ? Math.max(1, nextValue) : Math.max(0, nextValue);

      return {
        ...prev,
        travellers: {
          ...prev.travellers,
          [key]: guardedValue,
        },
      };
    });

    setErrors((prev) => ({
      ...prev,
      travellers: undefined,
    }));
  };

  const handleSubmit = () => {
    const validation = validateCruiseSearch(searchState);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildCruiseSearchPayload(searchState);

      sessionStorage.setItem(
        "tpl_cruise_search_payload",
        JSON.stringify(payload)
      );

      const query = new URLSearchParams();

      if (payload.destinationId) query.set("destination", payload.destinationId);
      if (payload.departurePortId) query.set("port", payload.departurePortId);

      query.set("sailingMode", payload.sailingMode);

      if (payload.sailingDate) query.set("date", payload.sailingDate);
      if (payload.sailingMonth) query.set("month", payload.sailingMonth);
      if (payload.durationId) query.set("duration", payload.durationId);

      query.set("adults", String(payload.adults));
      query.set("children", String(payload.children));
      query.set("infants", String(payload.infants));

      router.push(`/cruise/result?${query.toString()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full overflow-visible">
      <div className="relative mt-7 overflow-visible rounded-[28px] border border-white/45 bg-white/20 px-5 pt-4 pb-7 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-sm">
        <div className="grid grid-cols-[1.22fr_1.12fr_1fr_0.82fr_0.9fr] items-stretch gap-3 overflow-visible">
          <div className="min-h-[132px] rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CruiseDestinationField
              value={searchState.destination}
              isOpen={activeField === "destination"}
              onOpen={() => openField("destination")}
              onClose={closeField}
              onSelect={handleDestinationSelect}
              suggestions={destinations}
              error={errors.destination}
            />
          </div>

          <div className="min-h-[132px] rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CruiseDeparturePortField
              value={searchState.departurePort}
              isOpen={activeField === "departurePort"}
              onOpen={() => openField("departurePort")}
              onClose={closeField}
              onSelect={handleDeparturePortSelect}
              suggestions={prioritizedPorts}
              error={errors.departurePort}
            />
          </div>

          <div className="min-h-[132px] rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CruiseSailingField
              value={searchState.sailing}
              onChange={handleSailingChange}
              error={errors.sailing}
            />
          </div>

          <div className="min-h-[132px] rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CruiseDurationField
              value={searchState.duration}
              isOpen={activeField === "duration"}
              onOpen={() => openField("duration")}
              onClose={closeField}
              onSelect={handleDurationSelect}
              options={durations}
            />
          </div>

          <div className="min-h-[132px] rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CruiseTravellersField
              value={searchState.travellers}
              isOpen={activeField === "travellers"}
              onOpen={() => openField("travellers")}
              onClose={closeField}
              onUpdate={updateTravellers}
              error={errors.travellers}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <CruiseSearchButton
            onClick={handleSubmit}
            loading={isSubmitting}
            label="Search Cruises"
          />
        </div>
      </div>
    </div>
  );
}