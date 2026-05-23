"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import CruiseDestinationField from "../search/CruiseDestinationField";
import CruiseDeparturePortField from "../search/CruiseDeparturePortField";
import CruiseSailingField from "../search/CruiseSailingField";
import CruiseDurationField from "../search/CruiseDurationField";
import CruiseTravellersField from "../search/CruiseTravellersField";
import CruiseSearchButton from "../search/CruiseSearchButton";

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
import type { CruiseResultSearchMeta } from "@/app/lib/cruise/cruiseResultTypes";

type Props = {
  searchMeta: CruiseResultSearchMeta;
};

type ActiveField =
  | "destination"
  | "departurePort"
  | "duration"
  | "travellers"
  | null;

function normalizeKey(value?: string | null) {
  if (!value) return "";

  return value
    .toString()
    .toLowerCase()
    .replace(/-port$/i, "")
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function mapDestinationIdToValue(
  id: string | null,
  destinations: CruiseDestination[]
): CruiseDestination | null {
  if (!id) return null;

  const key = normalizeKey(id);

  return (
    destinations.find((item) => normalizeKey(item.id) === key) ||
    destinations.find((item) => normalizeKey(item.label) === key) ||
    destinations.find((item) =>
      item.keywords?.some((keyword) => normalizeKey(keyword) === key)
    ) ||
    null
  );
}

function mapPortIdToValue(id: string | null, ports: CruisePort[]): CruisePort | null {
  if (!id) return null;

  const key = normalizeKey(id);

  return (
    ports.find((item) => normalizeKey(item.id) === key) ||
    ports.find((item) => normalizeKey(item.label) === key) ||
    ports.find((item) =>
      item.keywords?.some((keyword) => normalizeKey(keyword) === key)
    ) ||
    null
  );
}

function mapDurationIdToOption(
  id: string | null,
  durations: CruiseDurationOption[]
): CruiseDurationOption | null {
  if (!id) {
    return durations.find((item) => item.id === "any") || null;
  }

  const key = normalizeKey(id);

  return (
    durations.find((item) => normalizeKey(item.id) === key) ||
    durations.find((item) => normalizeKey(item.label) === key) ||
    durations.find((item) => item.id === "any") ||
    null
  );
}

export default function CruiseModifySearchBar({ searchMeta }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [activeField, setActiveField] = useState<ActiveField>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [destinations, setDestinations] = useState<CruiseDestination[]>([]);
  const [ports, setPorts] = useState<CruisePort[]>([]);
  const [durations, setDurations] = useState<CruiseDurationOption[]>([]);

  const [searchState, setSearchState] = useState<CruiseSearchState>({
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
  });

  const [errors, setErrors] = useState<{
    destination?: string;
    departurePort?: string;
    sailing?: string;
    travellers?: string;
  }>({});

  const paramsKey = searchParams.toString();

  const currentUrlMeta = useMemo<CruiseResultSearchMeta>(() => {
    return {
      destinationId: searchParams.get("destination"),
      departurePortId: searchParams.get("port"),
      sailingDate: searchParams.get("date"),
      sailingMonth: searchParams.get("month"),
      durationId: searchParams.get("duration"),
      adults: Number(searchParams.get("adults") || 2),
      children: Number(searchParams.get("children") || 0),
      infants: Number(searchParams.get("infants") || 0),
    };
  }, [paramsKey, searchParams]);

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

    async function loadBaseOptions() {
      const response = await fetchCruiseSearchOptions();

      if (ignore) return;

      setDestinations(response.destinations);
      setDurations(response.durations);
    }

    loadBaseOptions();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function hydrateFromUrl() {
      const response = await fetchCruiseSearchOptions({
        destinationId: currentUrlMeta.destinationId,
      });

      if (ignore) return;

      setPorts(response.ports);

      const mappedDestination = mapDestinationIdToValue(
        currentUrlMeta.destinationId,
        response.destinations
      );

      const mappedPort = mapPortIdToValue(
        currentUrlMeta.departurePortId,
        response.ports
      );

      const mappedDuration = mapDurationIdToOption(
        currentUrlMeta.durationId,
        response.durations
      );

      setSearchState({
        destination: mappedDestination,
        departurePort: mappedPort,
        sailing: {
          mode: currentUrlMeta.sailingDate ? "date" : "month",
          exactDate: currentUrlMeta.sailingDate || null,
          month: currentUrlMeta.sailingMonth || null,
        },
        duration: mappedDuration,
        travellers: {
          adults: currentUrlMeta.adults || 2,
          children: currentUrlMeta.children || 0,
          infants: currentUrlMeta.infants || 0,
        },
      });

      setErrors({});
      setActiveField(null);
    }

    if (destinations.length && durations.length) {
      hydrateFromUrl();
    }

    return () => {
      ignore = true;
    };
  }, [
    currentUrlMeta.destinationId,
    currentUrlMeta.departurePortId,
    currentUrlMeta.sailingDate,
    currentUrlMeta.sailingMonth,
    currentUrlMeta.durationId,
    currentUrlMeta.adults,
    currentUrlMeta.children,
    currentUrlMeta.infants,
    destinations.length,
    durations.length,
  ]);

  useEffect(() => {
    let ignore = false;

    async function loadPortsForSelectedDestination() {
      const response = await fetchCruiseSearchOptions({
        destinationId: searchState.destination?.id ?? null,
      });

      if (ignore) return;

      setPorts(response.ports);
    }

    loadPortsForSelectedDestination();

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
      if (payload.durationId && payload.durationId !== "any") {
        query.set("duration", payload.durationId);
      }

      query.set("adults", String(payload.adults));
      query.set("children", String(payload.children));
      query.set("infants", String(payload.infants));

      router.push(`/cruise/result?${query.toString()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={wrapperRef} className="w-full">
      <div className="w-full rounded-2xl border border-slate-200 bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#0b1220] p-3 shadow-sm">
        <div className="grid grid-cols-1 items-center gap-3 lg:grid-cols-[1.15fr_1.15fr_0.95fr_0.9fr_1fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
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

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
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

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CruiseSailingField
              value={searchState.sailing}
              onChange={handleSailingChange}
              error={errors.sailing}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CruiseDurationField
              value={searchState.duration}
              isOpen={activeField === "duration"}
              onOpen={() => openField("duration")}
              onClose={closeField}
              onSelect={handleDurationSelect}
              options={durations}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CruiseTravellersField
              value={searchState.travellers}
              isOpen={activeField === "travellers"}
              onOpen={() => openField("travellers")}
              onClose={closeField}
              onUpdate={updateTravellers}
              error={errors.travellers}
            />
          </div>

          <div className="flex h-full items-stretch">
            <CruiseSearchButton
  onClick={handleSubmit}
  loading={isSubmitting}
  label="Search"
  heightClass="h-[138px]"
/>
          </div>
        </div>
      </div>
    </div>
  );
}