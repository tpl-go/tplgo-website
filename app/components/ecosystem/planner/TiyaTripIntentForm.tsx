"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  BedDouble,
  Bike,
  Bot,
  Bus,
  Car,
  CircleDollarSign,
  Compass,
  Hotel,
  Map,
  Mountain,
  Plane,
  Route,
  ShieldCheck,
  Sparkles,
  Tent,
  Train,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { TiyaTripIntent } from "@/app/lib/ecosystem/planner/plannerTypes";

type TiyaTripIntentFormProps = {
  initialIntent: TiyaTripIntent;
  onSubmit: (intent: TiyaTripIntent) => void;
  isGenerating?: boolean;
};

const tripTypes = ["One-way route", "Round trip", "Multi-city", "Road trip loop"];

const transportModes: Array<{
  label: string;
  icon: LucideIcon;
  desc: string;
}> = [
  { label: "Flight", icon: Plane, desc: "Fastest" },
  { label: "Train", icon: Train, desc: "Scenic" },
  { label: "Bus", icon: Bus, desc: "Budget" },
  { label: "Cab", icon: Car, desc: "Comfort" },
  { label: "Self-drive Car", icon: Route, desc: "Freedom" },
  { label: "Bike", icon: Bike, desc: "Adventure" },
  { label: "EV", icon: Zap, desc: "Green" },
  { label: "Mixed Mode", icon: Map, desc: "AI picks" },
];

const stayPreferences: Array<{
  label: string;
  icon: LucideIcon;
}> = [
  { label: "Hotel", icon: Hotel },
  { label: "Homestay", icon: BedDouble },
  { label: "Resort", icon: Mountain },
  { label: "Hostel", icon: Users },
  { label: "Camp", icon: Tent },
  { label: "Villa", icon: BedDouble },
  { label: "No Stay Needed", icon: Route },
];

const budgetTiers: Array<{
  label: string;
  range: string;
  accent: string;
  activeClass: string;
}> = [
  {
    label: "Economy",
    range: "< ₹15K",
    accent: "text-emerald-400",
    activeClass: "border-emerald-400/70 bg-emerald-500/15",
  },
  {
    label: "Standard",
    range: "₹15–40K",
    accent: "text-blue-400",
    activeClass: "border-blue-400/70 bg-blue-500/15",
  },
  {
    label: "Premium",
    range: "₹40–80K",
    accent: "text-violet-400",
    activeClass: "border-violet-400/70 bg-violet-500/15",
  },
  {
    label: "Luxury",
    range: "₹80K+",
    accent: "text-amber-400",
    activeClass: "border-amber-400/70 bg-amber-500/15",
  },
];

const travelStyles = [
  "Family",
  "Couple",
  "Friends",
  "Solo",
  "Adventure",
  "Spiritual",
  "Luxury",
  "Workation",
];

const paces: Array<{
  label: string;
  value: TiyaTripIntent["pace"];
}> = [
  { label: "Relaxed", value: "Relaxed" },
  { label: "Balanced", value: "Balanced" },
  { label: "Packed", value: "Packed" },
];

const interestTags = [
  "Food",
  "Culture",
  "Nature",
  "Shopping",
  "Trekking",
  "Temples",
  "Nightlife",
  "Local Market",
  "Creator Spots",
];

const smartPreferenceLabels: Array<{
  key: keyof TiyaTripIntent["smartPreferences"];
  label: string;
  icon: LucideIcon;
}> = [
  { key: "includeStays", label: "Include Stays", icon: Hotel },
  { key: "includeLocalMarket", label: "Local Life", icon: CircleDollarSign },
  { key: "includeCreatorSpots", label: "Creator Spots", icon: Sparkles },
  { key: "includeInsurance", label: "Travel Insurance", icon: ShieldCheck },
  { key: "avoidNightTravel", label: "Avoid Night Travel", icon: Compass },
  { key: "preferScenicRoute", label: "Scenic Route", icon: Mountain },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
      {children}
    </span>
  );
}

function displayInterestLabel(value: string) {
  return value === "Local Market" ? "Local Life" : value;
}

function CommandSection({
  Icon,
  eyebrow,
  title,
  children,
  className = "",
}: {
  Icon: LucideIcon;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[24px] border border-white/12 bg-white/[0.055] p-4 shadow-[0_16px_42px_rgba(2,6,23,0.14)] backdrop-blur-2xl transition hover:border-white/18 sm:p-5 ${className}`}
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-950 to-slate-950 text-orange-300 shadow-md">
          <Icon size={19} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-400">
            {eyebrow}
          </p>
          <h3 className="text-[17px] font-black leading-tight text-white">
            {title}
          </h3>
        </div>
      </div>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onChange(!checked);
      }}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked
          ? "bg-gradient-to-r from-[#ff7b00] to-[#ffb300]"
          : "bg-white/15"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-1 block h-4 w-4 rounded-full bg-white shadow transition ${
          checked ? "left-[23px]" : "left-1"
        }`}
      />
    </button>
  );
}

function CounterBox({
  label,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3.5">
      <span className="text-[11px] font-black uppercase tracking-[0.1em] text-white/50">
        {label}
      </span>

      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg font-black text-white transition hover:bg-white/15"
        >
          −
        </button>

        <span className="text-[22px] font-black text-white">{value}</span>

        <button
          type="button"
          onClick={() => onChange(Math.min(20, value + 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#ff7b00] to-[#ffb300] text-lg font-black text-white shadow-md transition hover:scale-105"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function TiyaTripIntentForm({
  initialIntent,
  onSubmit,
  isGenerating = false,
}: TiyaTripIntentFormProps) {
  const [intent, setIntent] = useState<TiyaTripIntent>(initialIntent);

  const totalTravellers = intent.adults + intent.children + intent.seniors;

  const nights = useMemo(() => {
    if (!intent.startDate || !intent.endDate) return 0;

    const start = new Date(intent.startDate);
    const end = new Date(intent.endDate);
    const diff = (end.getTime() - start.getTime()) / 86_400_000;

    return Math.max(0, Math.round(diff));
  }, [intent.startDate, intent.endDate]);

  const activeTransport = transportModes.find(
    (item) => item.label === intent.transportMode
  );

  const activeStay = stayPreferences.find(
    (item) => item.label === intent.stayPreference
  );

  const activeBudget = budgetTiers.find(
    (item) => item.label === intent.budgetTier
  );

  function updateIntent<K extends keyof TiyaTripIntent>(
    key: K,
    value: TiyaTripIntent[K]
  ) {
    setIntent((current) => ({ ...current, [key]: value }));
  }

  function updateCount(
    key: "adults" | "children" | "seniors",
    nextValue: number
  ) {
    const minimum = key === "adults" ? 1 : 0;
    updateIntent(key, Math.max(minimum, Math.min(20, nextValue)));
  }

  function toggleInterest(tag: string) {
    setIntent((current) => {
      const interests = current.interests.includes(tag)
        ? current.interests.filter((item) => item !== tag)
        : [...current.interests, tag];

      return { ...current, interests };
    });
  }

  function toggleSmartPreference(
    key: keyof TiyaTripIntent["smartPreferences"]
  ) {
    setIntent((current) => ({
      ...current,
      smartPreferences: {
        ...current.smartPreferences,
        [key]: !current.smartPreferences[key],
      },
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(intent);
  }

  return (
    <section className="mx-auto max-w-[1040px] px-4 pt-5 sm:px-6 lg:px-8 lg:pt-7">
      <form
        onSubmit={handleSubmit}
        className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#060d1e] via-[#0a1628] to-[#0d0f1f] p-4 text-white shadow-[0_28px_110px_rgba(6,24,57,0.18)] sm:p-5 lg:p-6"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-28 -top-28 h-[440px] w-[440px] rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-24 h-[520px] w-[520px] rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute left-1/2 top-[38%] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="relative">
          <div className="pb-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/15 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-amber-300">
              <Sparkles size={14} />
              Tiya Command Center
            </div>

            <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-[46px]">
              Build your trip brief.
              <br />
              <span className="bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] bg-clip-text text-transparent">
                Let Tiya do the magic.
              </span>
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/55 sm:text-base">
              Fill in your journey details and get a complete AI-powered
              itinerary workspace.
            </p>
          </div>

          {(intent.fromCity || intent.toCity) && (
            <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3">
              <span className="text-sm font-black text-amber-300">
                {intent.fromCity || "—"} → {intent.toCity || "—"}
              </span>

              {nights > 0 ? (
                <span className="text-xs font-semibold text-white/50">
                  · {nights} night{nights === 1 ? "" : "s"}
                </span>
              ) : null}

              <span className="text-xs font-semibold text-white/50">
                · {totalTravellers} traveller
                {totalTravellers === 1 ? "" : "s"}
              </span>

              <span className="text-xs font-semibold text-white/50">
                · {activeTransport?.label}
              </span>

              <span className="text-xs font-semibold text-white/50">
                · {activeStay?.label}
              </span>

              <span
                className={`text-xs font-black ${
                  activeBudget?.accent || "text-amber-300"
                } sm:ml-auto`}
              >
                {activeBudget?.label} {activeBudget?.range}
              </span>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <CommandSection
              Icon={Map}
              eyebrow="Journey Brief"
              title="Where are you going?"
              className="lg:col-span-2"
            >
              <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_1fr_1fr] lg:items-end">
                <label>
                  <FieldLabel>From City</FieldLabel>
                  <input
                    value={intent.fromCity}
                    onChange={(event) =>
                      updateIntent("fromCity", event.target.value)
                    }
                    placeholder="New Delhi"
                    className="h-[52px] w-full rounded-[14px] border border-white/15 bg-white/[0.07] px-4 text-[15px] font-bold text-white outline-none transition placeholder:text-white/30 focus:border-orange-300/70 focus:bg-white/10"
                  />
                </label>

                <div className="hidden pb-3 text-2xl font-black text-white/30 lg:block">
                  →
                </div>

                <label>
                  <FieldLabel>To City</FieldLabel>
                  <input
                    value={intent.toCity}
                    onChange={(event) =>
                      updateIntent("toCity", event.target.value)
                    }
                    placeholder="Jaipur"
                    className="h-[52px] w-full rounded-[14px] border border-white/15 bg-white/[0.07] px-4 text-[15px] font-bold text-white outline-none transition placeholder:text-white/30 focus:border-orange-300/70 focus:bg-white/10"
                  />
                </label>

                <label>
                  <FieldLabel>Start Date</FieldLabel>
                  <input
                    type="date"
                    value={intent.startDate}
                    onChange={(event) =>
                      updateIntent("startDate", event.target.value)
                    }
                    className="h-[52px] w-full rounded-[14px] border border-white/15 bg-white/[0.07] px-4 text-[15px] font-bold text-white outline-none transition [color-scheme:dark] focus:border-orange-300/70 focus:bg-white/10"
                  />
                </label>

                <label>
                  <FieldLabel>End Date</FieldLabel>
                  <input
                    type="date"
                    value={intent.endDate}
                    onChange={(event) =>
                      updateIntent("endDate", event.target.value)
                    }
                    className="h-[52px] w-full rounded-[14px] border border-white/15 bg-white/[0.07] px-4 text-[15px] font-bold text-white outline-none transition [color-scheme:dark] focus:border-orange-300/70 focus:bg-white/10"
                  />
                </label>
              </div>

              <div className="mt-5">
                <FieldLabel>Trip Shape</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {tripTypes.map((type) => {
                    const selected = intent.tripType === type;

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => updateIntent("tripType", type)}
                        className={`rounded-full border px-4 py-2 text-xs font-black transition ${
                          selected
                            ? "border-orange-400 bg-orange-500/20 text-amber-300"
                            : "border-white/15 bg-white/[0.04] text-white/60 hover:border-orange-300/50 hover:text-white"
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CommandSection>

            <CommandSection
              Icon={Plane}
              eyebrow="Transport Layer"
              title="How will you travel?"
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {transportModes.map((transport) => {
                  const selected = intent.transportMode === transport.label;
                  const TransportIcon = transport.icon;

                  return (
                    <button
                      key={transport.label}
                      type="button"
                      onClick={() =>
                        updateIntent("transportMode", transport.label)
                      }
                      className={`flex min-h-[82px] flex-col items-center justify-center gap-1 rounded-[14px] border p-2 text-center transition ${
                        selected
                          ? "scale-[1.03] border-blue-400 bg-blue-500/20"
                          : "border-white/10 bg-white/[0.04] hover:border-blue-300/50 hover:bg-white/[0.07]"
                      }`}
                    >
                      <TransportIcon
                        size={22}
                        className={selected ? "text-blue-300" : "text-white/70"}
                      />
                      <span
                        className={`text-[11px] font-black ${
                          selected ? "text-blue-300" : "text-white/80"
                        }`}
                      >
                        {transport.label}
                      </span>
                      <span className="text-[9px] font-semibold text-white/40">
                        {transport.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CommandSection>

            <CommandSection
              Icon={Hotel}
              eyebrow="Stay Layer"
              title="Where will you sleep?"
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {stayPreferences.map((stay) => {
                  const selected = intent.stayPreference === stay.label;
                  const StayIcon = stay.icon;

                  return (
                    <button
                      key={stay.label}
                      type="button"
                      onClick={() =>
                        updateIntent("stayPreference", stay.label)
                      }
                      className={`flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-[14px] border p-2 text-center transition ${
                        selected
                          ? "scale-[1.03] border-amber-400 bg-amber-500/20"
                          : "border-white/10 bg-white/[0.04] hover:border-amber-300/50 hover:bg-white/[0.07]"
                      }`}
                    >
                      <StayIcon
                        size={23}
                        className={selected ? "text-amber-300" : "text-white/70"}
                      />
                      <span
                        className={`text-[11px] font-black ${
                          selected ? "text-amber-300" : "text-white/80"
                        }`}
                      >
                        {stay.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CommandSection>

            <CommandSection
              Icon={CircleDollarSign}
              eyebrow="Budget Cockpit"
              title="What's your spend band?"
            >
              <div className="mb-4 grid grid-cols-2 gap-2">
                {budgetTiers.map((budget) => {
                  const selected = intent.budgetTier === budget.label;

                  return (
                    <button
                      key={budget.label}
                      type="button"
                      onClick={() => updateIntent("budgetTier", budget.label)}
                      className={`rounded-[14px] border p-3 text-left transition ${
                        selected
                          ? budget.activeClass
                          : "border-white/10 bg-white/[0.04] hover:border-white/20"
                      }`}
                    >
                      <div
                        className={`text-sm font-black ${
                          selected ? budget.accent : "text-white/80"
                        }`}
                      >
                        {budget.label}
                      </div>
                      <div className="mt-1 text-[11px] font-semibold text-white/45">
                        {budget.range}
                      </div>
                    </button>
                  );
                })}
              </div>

              <FieldLabel>Custom Budget Cap</FieldLabel>
              <input
                value={intent.customBudgetAmount}
                onChange={(event) =>
                  updateIntent("customBudgetAmount", event.target.value)
                }
                placeholder="₹ Enter amount"
                className="h-[52px] w-full rounded-[14px] border border-white/15 bg-white/[0.07] px-4 text-[15px] font-bold text-white outline-none transition placeholder:text-white/30 focus:border-orange-300/70 focus:bg-white/10"
              />
            </CommandSection>

            <CommandSection
              Icon={Users}
              eyebrow="Traveller Profile"
              title="Who's coming along?"
            >
              <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <CounterBox
                  label="Adults"
                  value={intent.adults}
                  min={1}
                  onChange={(value) => updateCount("adults", value)}
                />
                <CounterBox
                  label="Children"
                  value={intent.children}
                  onChange={(value) => updateCount("children", value)}
                />
                <CounterBox
                  label="Seniors"
                  value={intent.seniors}
                  onChange={(value) => updateCount("seniors", value)}
                />
              </div>

              <button
                type="button"
                onClick={() => updateIntent("pets", !intent.pets)}
                className={`flex w-full items-center justify-between rounded-[14px] border px-4 py-3 transition ${
                  intent.pets
                    ? "border-amber-400 bg-amber-500/15"
                    : "border-white/10 bg-white/[0.04]"
                }`}
              >
                <span
                  className={`text-sm font-bold ${
                    intent.pets ? "text-amber-300" : "text-white/70"
                  }`}
                >
                  Travelling with pets
                </span>
                <Toggle
                  checked={intent.pets}
                  onChange={(value) => updateIntent("pets", value)}
                />
              </button>
            </CommandSection>

            <CommandSection
              Icon={Sparkles}
              eyebrow="Experience Layer"
              title="Your travel style & interests"
              className="lg:col-span-2"
            >
              <div className="grid gap-5 lg:grid-cols-3">
                <div>
                  <FieldLabel>Travel Style</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {travelStyles.map((style) => {
                      const selected = intent.travelStyle === style;

                      return (
                        <button
                          key={style}
                          type="button"
                          onClick={() => updateIntent("travelStyle", style)}
                          className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                            selected
                              ? "border-pink-400 bg-pink-500/20 text-pink-300"
                              : "border-white/15 bg-white/[0.04] text-white/60 hover:border-pink-300/50 hover:text-white"
                          }`}
                        >
                          {style}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <FieldLabel>Trip Pace</FieldLabel>
                  <div className="grid gap-2">
                    {paces.map((pace) => {
                      const selected = intent.pace === pace.value;

                      return (
                        <button
                          key={pace.value}
                          type="button"
                          onClick={() => updateIntent("pace", pace.value)}
                          className={`rounded-xl border px-4 py-2.5 text-left text-sm font-bold transition ${
                            selected
                              ? "border-white/40 bg-white/15 text-white"
                              : "border-white/10 bg-white/[0.04] text-white/55 hover:bg-white/[0.07]"
                          }`}
                        >
                          {pace.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <FieldLabel>
                    Interests ({intent.interests.length} selected)
                  </FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {interestTags.map((tag) => {
                      const selected = intent.interests.includes(tag);

                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleInterest(tag)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                            selected
                              ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                              : "border-white/15 bg-white/[0.04] text-white/55 hover:border-emerald-300/50 hover:text-white"
                          }`}
                        >
                          {displayInterestLabel(tag)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CommandSection>

            <CommandSection
              Icon={Bot}
              eyebrow="AI Rules Engine"
              title="Smart planning preferences"
              className="border-orange-400/20 bg-[#060d1e]/70 lg:col-span-2"
            >
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {smartPreferenceLabels.map((pref) => {
                  const selected = intent.smartPreferences[pref.key];
                  const PreferenceIcon = pref.icon;

                  return (
                    <button
                      key={pref.key}
                      type="button"
                      onClick={() => toggleSmartPreference(pref.key)}
                      className={`flex min-h-[58px] items-center justify-between gap-3 rounded-[14px] border px-4 py-3 transition ${
                        selected
                          ? "border-orange-400/40 bg-orange-500/10"
                          : "border-white/10 bg-white/[0.035] hover:bg-white/[0.06]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <PreferenceIcon
                          size={17}
                          className={selected ? "text-amber-300" : "text-white/50"}
                        />
                        <span
                          className={`text-left text-[13px] font-bold ${
                            selected ? "text-amber-300" : "text-white/60"
                          }`}
                        >
                          {pref.label}
                        </span>
                      </span>

                      <Toggle
                        checked={selected}
                        onChange={() => toggleSmartPreference(pref.key)}
                      />
                    </button>
                  );
                })}
              </div>
            </CommandSection>
          </div>

          <div className="mt-6 text-center">
            <button
              type="submit"
              disabled={isGenerating}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-9 py-4 text-base font-black text-white shadow-[0_16px_48px_rgba(255,123,0,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_56px_rgba(255,123,0,0.45)] disabled:cursor-wait disabled:opacity-75 sm:px-14"
            >
              <Sparkles size={18} className={isGenerating ? "animate-pulse" : undefined} />
              {isGenerating
                ? "Tiya is generating your plan"
                : "Generate Smart Plan with Tiya"}
            </button>

            <p className="mt-3 text-xs font-semibold text-white/35">
              AI will build a complete itinerary · hotels · transport ·
              activities
            </p>
          </div>
        </div>
      </form>
    </section>
  );
}
