"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalendarDays, MapPin, Search, Sparkles, Users } from "lucide-react";
import {
  getTiyaCitySuggestions,
  type TiyaMockCity,
} from "@/app/lib/ecosystem/planner/plannerCityData";
import type { TiyaTripIntent } from "@/app/lib/ecosystem/planner/plannerTypes";

type TiyaDesktopEntryHeroProps = {
  initialIntent: TiyaTripIntent;
  onSubmit: (intent: TiyaTripIntent) => void;
  onIntentChange?: () => void;
  isGenerating?: boolean;
};

const tripTypes = [
  "One Way / Destination Trip",
  "Round Trip",
  "Multi City",
];
const budgetVibes = ["Economy", "Standard", "Premium", "Luxury"];
const transportPreferences = [
  "Flight",
  "Train",
  "Bus",
  "Private Car",
  "Private EV",
  "Cruise",
  "Cab",
  "Bike",
  "Mixed / Let Tiya Suggest",
];
const stayPreferences = [
  "Hotel",
  "Homestay",
  "Resort",
  "Budget Stay",
  "Premium Stay",
  "No Stay Needed",
];
const cabRequirements = [
  "No Cab",
  "Airport / Station Transfer Only",
  "Selected Days Only",
  "Full Trip Cab",
  "Let Tiya Suggest",
];
const styleVibes = [
  "Family",
  "Couple",
  "Friends",
  "Solo",
  "Adventure",
  "Spiritual",
  "Luxury",
  "Workation",
];

function CityComboBox({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const suggestions = useMemo(() => getTiyaCitySuggestions(value), [value]);

  function selectCity(city: TiyaMockCity) {
    onChange(city.name);
    setIsOpen(false);
  }

  return (
    <label className="relative block min-w-0">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
        {label}
      </span>

      <div className="relative">
        <Search
          size={15}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
        />
        <input
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
          className="h-11 w-full min-w-0 rounded-2xl border border-white/15 bg-white/[0.07] py-2.5 pl-10 pr-4 text-sm font-black text-white outline-none transition placeholder:text-white/30 focus:border-orange-300/70 focus:bg-white/10 sm:text-[15px]"
          placeholder={placeholder}
          autoComplete="off"
        />
      </div>

      {isOpen && suggestions.length ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 max-h-72 overflow-y-auto rounded-2xl border border-white/20 bg-white text-slate-950 shadow-[0_22px_60px_rgba(2,6,23,0.22)]">
          {suggestions.map((city) => (
            <button
              key={city.name}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectCity(city)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-orange-50"
            >
              <span>
                <span className="block text-sm font-black text-slate-950">
                  {city.name}
                </span>
                <span className="block text-xs font-bold text-slate-500">
                  {city.region}
                </span>
              </span>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-blue-700">
                mock
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </label>
  );
}

function MultiCityStopField({
  label,
  value,
  onChange,
  onRemove,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
      <CityComboBox
        label={label}
        value={value}
        placeholder="Add city"
        onChange={onChange}
      />
      <button
        type="button"
        onClick={onRemove}
        className="h-10 w-full rounded-full border border-white/15 bg-white/10 px-3 text-xs font-black text-white/70 transition hover:bg-white/15 sm:w-auto"
      >
        Remove
      </button>
    </div>
  );
}

function mapTransportPreferenceToMode(preference: string) {
  if (preference === "Private Car") return "Self-drive Car";
  if (preference === "Private EV") return "EV";
  if (preference === "Mixed / Let Tiya Suggest") return "Mixed Mode";
  if (preference === "Cruise") return "Mixed Mode";
  return preference;
}

function SelectField({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: Array<string | { label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="min-w-0">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-10 w-full min-w-0 rounded-2xl border border-white/20 bg-white px-3 py-2 text-sm font-black outline-none shadow-[0_10px_26px_rgba(2,6,23,0.12)] focus:border-orange-300/70 ${
          value ? "text-slate-950" : "text-slate-400"
        }`}
      >
        <option value="" disabled className="bg-white text-slate-400">
          {placeholder}
        </option>
        {options.map((option) => {
          const labelText = typeof option === "string" ? option : option.label;
          const optionValue = typeof option === "string" ? option : option.value;

          return (
            <option
              key={optionValue}
              value={optionValue}
              className="bg-white text-slate-950"
            >
              {labelText}
            </option>
          );
        })}
      </select>
    </label>
  );
}

export default function TiyaDesktopEntryHero({
  initialIntent,
  onSubmit,
  onIntentChange,
  isGenerating = false,
}: TiyaDesktopEntryHeroProps) {
  const [intent, setIntent] = useState<TiyaTripIntent>(initialIntent);
  const [validationMessage, setValidationMessage] = useState("");

  const travellerCount = intent.adults + intent.children + intent.seniors;

  const routeLabel = useMemo(() => {
    if (!intent.fromCity || !intent.toCity) return "Select route";

    if (intent.tripType === "Round Trip") {
      return `${intent.fromCity} to ${intent.toCity} to ${intent.fromCity}`;
    }

    if (intent.tripType === "Multi City") {
      const viaStops = (intent.multiCityStops || []).filter((stop) =>
        stop.trim()
      );

      return viaStops.length
        ? `${intent.fromCity} to ${intent.toCity} via ${viaStops.join(", ")}`
        : `${intent.fromCity} to ${intent.toCity}`;
    }

    return `${intent.fromCity} to ${intent.toCity}`;
  }, [intent.fromCity, intent.multiCityStops, intent.toCity, intent.tripType]);

  const dateLabel = useMemo(() => {
    if (!intent.startDate || !intent.endDate) return "Select dates";
    return `${intent.startDate} to ${intent.endDate}`;
  }, [intent.endDate, intent.startDate]);

  const summaryCards: Array<{
    label: string;
    value: string;
    icon: typeof MapPin;
  }> = [
    { label: "Route", value: routeLabel, icon: MapPin },
    { label: "Dates", value: dateLabel, icon: CalendarDays },
    {
      label: "Travellers",
      value: travellerCount > 0 ? `${travellerCount}` : "Add travellers",
      icon: Users,
    },
  ];

  function updateIntent<K extends keyof TiyaTripIntent>(
    key: K,
    value: TiyaTripIntent[K]
  ) {
    setIntent((current) => ({ ...current, [key]: value }));
    onIntentChange?.();
  }

  function updateTripType(value: string) {
    setIntent((current) => ({
      ...current,
      tripType: value,
      returnToOrigin: value === "Round Trip",
      multiCityStops: value === "Multi City" ? current.multiCityStops || [] : [],
      stops: value === "Multi City" ? current.stops || [] : [],
    }));
    onIntentChange?.();
  }

  function updateTransportPreference(value: string) {
    setIntent((current) => ({
      ...current,
      transportPreference: value,
      transportMode: mapTransportPreferenceToMode(value),
    }));
    onIntentChange?.();
  }

  function updateMultiCityStop(index: number, value: string) {
    setIntent((current) => {
      const nextStops = [...(current.multiCityStops || [])];
      nextStops[index] = value;

      return {
        ...current,
        multiCityStops: nextStops,
        stops: [current.toCity, ...nextStops].filter((stop) => stop.trim()),
      };
    });
    onIntentChange?.();
  }

  function addMultiCityStop() {
    setIntent((current) => ({
      ...current,
      multiCityStops: [...(current.multiCityStops || []), ""],
    }));
    onIntentChange?.();
  }

  function removeMultiCityStop(index: number) {
    setIntent((current) => {
      const nextStops = (current.multiCityStops || []).filter(
        (_stop, stopIndex) => stopIndex !== index
      );

      return {
        ...current,
        multiCityStops: nextStops,
        stops: [current.toCity, ...nextStops].filter((stop) => stop.trim()),
      };
    });
    onIntentChange?.();
  }

  function updateAdultTravellers(nextValue: number) {
    updateIntent("adults", nextValue > 0 ? Math.min(20, nextValue) : 0);
  }

  function updateChildren(nextValue: number) {
    updateIntent("children", nextValue > 0 ? Math.min(10, nextValue) : 0);
  }

  function hasRequiredTripDetails(currentIntent: TiyaTripIntent) {
    return (
      Boolean(currentIntent.fromCity.trim()) &&
      Boolean(currentIntent.toCity.trim()) &&
      Boolean(currentIntent.startDate) &&
      Boolean(currentIntent.endDate) &&
      Boolean(currentIntent.tripType) &&
      currentIntent.adults >= 1 &&
      currentIntent.children >= 0 &&
      Boolean(currentIntent.transportPreference || currentIntent.transportMode) &&
      Boolean(currentIntent.stayPreference) &&
      Boolean(currentIntent.cabRequirement) &&
      Boolean(currentIntent.budgetTier) &&
      Boolean(currentIntent.travelStyle)
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasRequiredTripDetails(intent)) {
      setValidationMessage(
        "Please fill all required trip details to generate routes."
      );
      return;
    }

    setValidationMessage("");
    const multiCityStops =
      intent.tripType === "Multi City"
        ? [intent.toCity, ...(intent.multiCityStops || [])].filter((stop) =>
            stop.trim()
          )
        : [];
    const transportPreference =
      intent.transportPreference || intent.transportMode;

    onSubmit({
      ...intent,
      transportPreference,
      transportMode: mapTransportPreferenceToMode(transportPreference),
      returnToOrigin: intent.tripType === "Round Trip",
      stops: multiCityStops,
      multiCityStops,
    });
  }

  return (
    <section className="relative overflow-hidden border-b border-white/70 bg-[#061839] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_86%_10%,rgba(249,115,22,0.18),transparent_28%),linear-gradient(135deg,#061839_0%,#0a1e42_48%,#111827_100%)]" />
      <div className="absolute left-1/2 top-0 h-px w-[min(820px,84vw)] -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />

      <div className="relative mx-auto grid max-w-7xl gap-4 px-3 py-5 sm:gap-6 sm:px-6 sm:py-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8 lg:py-10">
        <div className="max-w-2xl min-w-0">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-200/20 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100 backdrop-blur-xl sm:px-4 sm:text-[11px] sm:tracking-[0.18em]">
            <Sparkles
              size={14}
              className={isGenerating ? "animate-pulse" : undefined}
            />
            Tiya AI Travel Brief
          </div>

          <h1 className="mt-3 text-[30px] font-black leading-[1.06] tracking-normal sm:mt-4 sm:text-[42px] lg:text-[44px]">
            Choose your journey path with{" "}
            <span className="bg-gradient-to-r from-orange-200 via-orange-300 to-amber-300 bg-clip-text text-transparent">
              Tiya
            </span>
          </h1>

          <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/65 sm:mt-4 sm:text-[15px]">
            Give Tiya the essential trip brief. The workspace opens only after
            route choices are generated and a journey path is selected.
          </p>

          <div className="mt-4 hidden max-w-xl gap-2 sm:mt-5 sm:grid sm:grid-cols-3">
            {summaryCards.map(({ label, value, icon: CardIcon }) => (
              <div
                key={label}
                className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.08] p-3 backdrop-blur-xl"
              >
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">
                  <CardIcon size={13} />
                  {label}
                </div>
                <p className="mt-1.5 truncate text-xs font-black text-white sm:text-sm">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <form
          id="tiya-route-generation-form"
          onSubmit={handleSubmit}
          className="min-w-0 rounded-[1.25rem] border border-white/12 bg-white/[0.08] p-3 shadow-[0_24px_80px_rgba(2,6,23,0.26)] backdrop-blur-2xl sm:rounded-[1.7rem] sm:p-4"
        >
          <div className="grid gap-3">
            <div className="grid min-w-0 gap-3 lg:grid-cols-3">
              <SelectField
                label="Trip Type"
                value={intent.tripType}
                placeholder="Select trip type"
                options={tripTypes}
                onChange={updateTripType}
              />

              <CityComboBox
                label="From"
                value={intent.fromCity}
                placeholder="Enter origin"
                onChange={(value) => updateIntent("fromCity", value)}
              />
              <CityComboBox
                label={intent.tripType === "Multi City" ? "Stop 1" : "To / Destination"}
                value={intent.toCity}
                placeholder={
                  intent.tripType === "Multi City"
                    ? "Enter first stop"
                    : "Enter destination"
                }
                onChange={(value) => updateIntent("toCity", value)}
              />
            </div>

            {intent.tripType === "Multi City" ? (
              <div className="min-w-0 rounded-2xl border border-white/12 bg-white/[0.05] p-3">
                <div className="grid gap-3 md:grid-cols-2">
                  {(intent.multiCityStops || []).map((stop, index) => (
                    <MultiCityStopField
                      key={`multi-city-stop-${index}`}
                      label={`Stop ${index + 2}`}
                      value={stop}
                      onChange={(value) => updateMultiCityStop(index, value)}
                      onRemove={() => removeMultiCityStop(index)}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addMultiCityStop}
                  className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-full border border-orange-300/35 bg-orange-500/14 px-4 py-2 text-xs font-black text-orange-100 transition hover:bg-orange-500/20 sm:w-auto"
                >
                  Add City
                </button>
              </div>
            ) : null}

            <div className="grid min-w-0 gap-3 lg:grid-cols-3">
              <label className="min-w-0">
                <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                  Start Date
                </span>
                <input
                  type="date"
                  value={intent.startDate}
                  onChange={(event) =>
                    updateIntent("startDate", event.target.value)
                  }
                  className="h-10 w-full min-w-0 rounded-2xl border border-white/15 bg-white/[0.07] px-3 py-2 text-sm font-black text-white outline-none [color-scheme:dark] focus:border-orange-300/70"
                />
              </label>

              <label className="min-w-0">
                <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                  End Date
                </span>
                <input
                  type="date"
                  value={intent.endDate}
                  onChange={(event) =>
                    updateIntent("endDate", event.target.value)
                  }
                  className="h-10 w-full min-w-0 rounded-2xl border border-white/15 bg-white/[0.07] px-3 py-2 text-sm font-black text-white outline-none [color-scheme:dark] focus:border-orange-300/70"
                />
              </label>

              <label className="min-w-0">
                <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                  Travellers
                </span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={intent.adults || ""}
                  onChange={(event) =>
                    updateAdultTravellers(Number(event.target.value))
                  }
                  placeholder="Add travellers"
                  className="h-10 w-full min-w-0 rounded-2xl border border-white/15 bg-white/[0.07] px-3 py-2 text-sm font-black text-white outline-none focus:border-orange-300/70"
                />
              </label>
            </div>

            <div className="grid min-w-0 gap-3 lg:grid-cols-3">
              <label className="min-w-0">
                <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                  Children
                </span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={intent.children || ""}
                  onChange={(event) =>
                    updateChildren(Number(event.target.value))
                  }
                  placeholder="0"
                  className="h-10 w-full min-w-0 rounded-2xl border border-white/15 bg-white/[0.07] px-3 py-2 text-sm font-black text-white outline-none focus:border-orange-300/70"
                />
              </label>

              <SelectField
                label="Transport Preference"
                value={intent.transportPreference || intent.transportMode}
                placeholder="Select mode"
                options={transportPreferences}
                onChange={updateTransportPreference}
              />

              <SelectField
                label="Stay Preference"
                value={intent.stayPreference}
                placeholder="Select stay"
                options={stayPreferences}
                onChange={(value) => updateIntent("stayPreference", value)}
              />
            </div>

            <div className="grid min-w-0 gap-3 lg:grid-cols-3">
              <SelectField
                label="Cab Requirement"
                value={intent.cabRequirement || ""}
                placeholder="Select cab"
                options={cabRequirements}
                onChange={(value) => updateIntent("cabRequirement", value)}
              />

              <SelectField
                label="Budget Vibe"
                value={intent.budgetTier}
                placeholder="Select budget"
                options={budgetVibes}
                onChange={(value) => updateIntent("budgetTier", value)}
              />

              <SelectField
                label="Travel Style"
                value={intent.travelStyle}
                placeholder="Select style"
                options={styleVibes}
                onChange={(value) => updateIntent("travelStyle", value)}
              />
            </div>
          </div>
        </form>

        <div className="flex flex-col items-center pb-[env(safe-area-inset-bottom)] lg:col-span-2">
          <button
            type="submit"
            form="tiya-route-generation-form"
            disabled={isGenerating}
            className="inline-flex min-h-14 w-full max-w-sm items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-6 py-3 text-sm font-semibold text-white shadow-[0_22px_58px_rgba(255,123,0,0.42),0_0_34px_rgba(255,179,0,0.24)] transition duration-200 hover:-translate-y-0.5 hover:scale-[1.015] hover:brightness-105 disabled:cursor-wait disabled:opacity-75 sm:min-h-16 sm:max-w-md sm:px-8 sm:py-4 sm:text-base"
          >
            <Sparkles
              size={17}
              className={isGenerating ? "animate-pulse" : undefined}
            />
            {isGenerating ? "Tiya is scanning routes" : "Generate Routes"}
          </button>

          {validationMessage ? (
            <p className="mt-2 text-center text-xs font-black text-red-300">
              {validationMessage}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
