"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  Coffee,
  Compass,
  Hotel,
  Landmark,
  MapPin,
  Mountain,
  Plane,
  ShoppingBag,
  Sparkles,
  Train,
  TreePalm,
  WandSparkles,
} from "lucide-react";

import {
  aiSwitches,
  comfortLevels,
  interestOptions,
  stayPreferences,
  type SmartBuildPreferences,
  type WorkspacePreferences,
} from "../utils/workspaceTypes";

type WizardStep = 0 | 1 | 2 | 3 | 4;
type IconType = typeof Plane;

const steps = ["Travel Style", "Stay Style", "Trip Mood", "Interests", "Review"] as const;

const travelStyleOptions = [
  {
    label: "Fastest Route",
    value: "Flight",
    title: "Flight + fast transfers",
    desc: "Tiya prioritizes speed, low waiting time and smooth transfers.",
    icon: Plane,
  },
  {
    label: "Scenic Route",
    value: "Train",
    title: "Train + scenic movement",
    desc: "Better for views, slower travel and relaxed route experience.",
    icon: Train,
  },
  {
    label: "Road Explorer",
    value: "Self-drive",
    title: "Self-drive + Bike + EV ready",
    desc: "Best for flexible road trips, stopovers and route freedom.",
    icon: Bike,
  },
  {
    label: "Comfort First",
    value: "Cab",
    title: "Cab + premium comfort",
    desc: "Door-to-door comfort with less planning stress.",
    icon: Compass,
  },
  {
    label: "Let Tiya Decide",
    value: "Mixed",
    title: "Smart transport mix",
    desc: "Tiya chooses the best transport based on route and budget.",
    icon: BrainCircuit,
  },
] as const;

const stayStyleOptions = [
  {
    label: "Comfort Stay",
    value: "Hotel",
    desc: "Reliable hotel stay with comfort and convenience.",
    icon: Hotel,
  },
  {
    label: "Local Experience",
    value: "Homestay",
    desc: "Authentic local stay with cultural experience.",
    icon: TreePalm,
  },
  {
    label: "Relax & Luxury",
    value: "Resort",
    desc: "Premium stay, leisure, recovery and comfort.",
    icon: Sparkles,
  },
  {
    label: "Private Stay",
    value: "Villa",
    desc: "Private premium stay for family or groups.",
    icon: Landmark,
  },
  {
    label: "Smart Mix",
    value: "Hotel",
    desc: "Tiya will balance comfort, location and budget.",
    icon: BrainCircuit,
  },
] as const;

const moodOptions = [
  {
    label: "Slow & Relaxed",
    pace: "Relaxed",
    comfort: "Premium",
    adventure: "Light",
    activity: "Light",
    budget: "Premium comfort",
    desc: "Few places, more comfort and recovery time.",
    icon: TreePalm,
  },
  {
    label: "Balanced Explorer",
    pace: "Balanced",
    comfort: "Premium",
    adventure: "Balanced",
    activity: "Balanced",
    budget: "Balanced spend",
    desc: "Best mix of sightseeing, comfort and budget.",
    icon: Compass,
  },
  {
    label: "Maximum Coverage",
    pace: "Packed",
    comfort: "Standard",
    adventure: "Balanced",
    activity: "Packed",
    budget: "Balanced spend",
    desc: "See more places in less time.",
    icon: MapPin,
  },
  {
    label: "Adventure Seeker",
    pace: "Packed",
    comfort: "Standard",
    adventure: "High",
    activity: "Packed",
    budget: "Best available",
    desc: "Activities, terrain and high-energy stops first.",
    icon: Mountain,
  },
] as const;

const smartInterestOptions = [
  { label: "Nature", value: "Nature", icon: Mountain },
  { label: "Culture", value: "Culture", icon: Landmark },
  { label: "Food", value: "Food", icon: Coffee },
  { label: "Shopping", value: "Shopping", icon: ShoppingBag },
  { label: "Creator Spots", value: "Creator Spots", icon: Sparkles },
  { label: "Local Life", value: "Local Market", icon: ShoppingBag },
  { label: "Trekking", value: "Trekking", icon: Mountain },
  { label: "Temples", value: "Temples", icon: Landmark },
].filter((item) => interestOptions.includes(item.value));

function displayValue(value: string) {
  return value === "Mixed" ? "Auto Decide by Tiya" : value;
}

function displayInterestLabel(value: string) {
  return value === "Local Market" ? "Local Life" : value;
}

function getMoodLabel(preferences: WorkspacePreferences) {
  if (preferences.pace === "Relaxed") return "Slow & Relaxed";
  if (preferences.pace === "Packed") return "Maximum Coverage";
  return "Balanced Explorer";
}

function getSmartTripStyle(preferences: WorkspacePreferences) {
  const hasCreator = preferences.interests.includes("Creator Spots");
  const hasLocal = preferences.interests.includes("Local Market");
  const hasNature = preferences.interests.includes("Nature");

  if (hasCreator) return "Creator Route + Local Discovery";
  if (hasLocal) return "Local Life + Culture Discovery";
  if (hasNature) return "Nature + Scenic Discovery";
  return "Balanced Smart Journey";
}

function WizardChoiceCard({
  label,
  title,
  desc,
  icon: Icon,
  selected,
  onClick,
}: {
  label: string;
  title?: string;
  desc: string;
  icon: IconType;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[1.15rem] border p-3 text-left transition duration-300 hover:-translate-y-0.5 ${
        selected
          ? "border-orange-300 bg-gradient-to-br from-orange-50 via-white to-amber-50 shadow-[0_18px_42px_rgba(249,115,22,0.16)]"
          : "border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.05)] hover:border-orange-200 hover:bg-orange-50/40"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
            selected
              ? "bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] text-white shadow-[0_12px_26px_rgba(249,115,22,0.22)]"
              : "bg-blue-950 text-orange-300 group-hover:bg-orange-500 group-hover:text-white"
          }`}
        >
          <Icon size={17} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-black leading-tight text-slate-950">
                {label}
              </p>
              {title ? (
                <p className="mt-0.5 text-[11px] font-black text-blue-700">
                  {title}
                </p>
              ) : null}
            </div>

            {selected ? (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
                <CheckCircle2 size={14} />
              </span>
            ) : null}
          </div>

          <p className="mt-1.5 text-[11px] font-semibold leading-4 text-slate-600">
            {desc}
          </p>
        </div>
      </div>
    </button>
  );
}

function InterestPill({
  label,
  icon: Icon,
  selected,
  disabled,
  onClick,
}: {
  label: string;
  icon: IconType;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled && !selected}
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black transition ${
        selected
          ? "border-orange-300 bg-orange-50 text-orange-700 shadow-sm"
          : disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
            : "border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50"
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function ReviewChip({
  label,
  value,
  tone = "orange",
}: {
  label: string;
  value: string;
  tone?: "orange" | "blue" | "green";
}) {
  const toneClass =
    tone === "blue"
      ? "border-blue-100 bg-blue-50 text-blue-700"
      : tone === "green"
        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
        : "border-orange-200 bg-orange-50 text-orange-700";

  return (
    <span className={`rounded-full border px-3 py-1.5 text-[11px] font-black ${toneClass}`}>
      {label}: {value}
    </span>
  );
}

export default function BuildInputsSection({
  preferences,
  smartBuildPreferences,
  updatePreference,
  updateSmartBuild,
  toggleInterest,
  generateSmartItinerary,
}: {
  preferences: WorkspacePreferences;
  smartBuildPreferences: SmartBuildPreferences;
  updatePreference: <K extends keyof WorkspacePreferences>(
    key: K,
    value: WorkspacePreferences[K]
  ) => void;
  updateSmartBuild: <K extends keyof SmartBuildPreferences>(
    key: K,
    value: SmartBuildPreferences[K]
  ) => void;
  toggleInterest: (interest: string) => void;
  generateSmartItinerary: () => void;
}) {
  const [step, setStep] = useState<WizardStep>(0);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const selectedInterests = preferences.interests || [];
  const progress = useMemo(
    () => Math.round(((step + 1) / steps.length) * 100),
    [step]
  );

  function goNext() {
    setStep((current) => Math.min(4, current + 1) as WizardStep);
  }

  function goBack() {
    setStep((current) => Math.max(0, current - 1) as WizardStep);
  }

  function applyMood(mood: (typeof moodOptions)[number]) {
    updatePreference("pace", mood.pace);
    updatePreference("comfortLevel", mood.comfort);
    updateSmartBuild("adventureLevel", mood.adventure);
    updateSmartBuild("activityIntensity", mood.activity);
    updateSmartBuild("budgetRefinement", mood.budget);
  }

  function selectedMood(mood: (typeof moodOptions)[number]) {
    return (
      preferences.pace === mood.pace &&
      preferences.comfortLevel === mood.comfort &&
      smartBuildPreferences.activityIntensity === mood.activity
    );
  }

  function handleInterestClick(interest: string) {
    const selected = selectedInterests.includes(interest);

    if (!selected && selectedInterests.length >= 3) {
      return;
    }

    toggleInterest(interest);
  }

  return (
    <div className="p-3 sm:p-4">
      <section className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_28px_90px_rgba(15,23,42,0.10)]">
        <div className="relative overflow-hidden border-b border-slate-100 bg-[radial-gradient(circle_at_10%_20%,rgba(249,115,22,0.14),transparent_28%),radial-gradient(circle_at_92%_12%,rgba(14,165,233,0.16),transparent_28%),linear-gradient(135deg,#fff7ed_0%,#ffffff_45%,#eef7ff_100%)] px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
                Smart journey wizard
              </p>
              <h3 className="mt-1.5 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                Tiya will build this trip step by step
              </h3>
              <p className="mt-1.5 max-w-3xl text-xs font-semibold leading-5 text-slate-600 sm:text-sm">
                Choose simple travel styles. Tiya will convert them into
                transport, stay, budget, activities, alerts and editable itinerary.
              </p>
            </div>

            <div className="rounded-xl border border-white/80 bg-white/85 px-3 py-2 shadow-sm backdrop-blur-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                Current step
              </p>
              <p className="mt-0.5 text-xs font-black text-slate-950">
                {step + 1}/{steps.length} · {steps[step]}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-[11px] font-black text-slate-500">
              <span>{steps[step]}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/80 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-2.5 hidden gap-1.5 lg:flex">
              {steps.map((item, index) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setStep(index as WizardStep)}
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-black transition ${
                    index === step
                      ? "border-orange-300 bg-orange-50 text-orange-700"
                      : index < step
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white/80 text-slate-500"
                  }`}
                >
                  {index + 1}. {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="min-h-[280px] bg-gradient-to-b from-white to-slate-50/80 p-4 sm:p-5">
          {step === 0 ? (
            <div>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Plane size={19} className="text-orange-600" />
                    <h4 className="text-xl font-black text-slate-950">
                      Choose your travel style
                    </h4>
                  </div>
                  <p className="mt-1.5 text-xs font-semibold text-slate-600 sm:text-sm">
                    Transport technical nahi, travel style choose karo. Tiya
                    backend me best mode manage karegi.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                {travelStyleOptions.map((option) => (
                  <WizardChoiceCard
                    key={option.value}
                    label={option.label}
                    title={option.title}
                    desc={option.desc}
                    icon={option.icon}
                    selected={preferences.transportMode === option.value}
                    onClick={() => updatePreference("transportMode", option.value)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div>
              <div className="flex items-center gap-2">
                <Hotel size={19} className="text-orange-600" />
                <h4 className="text-xl font-black text-slate-950">
                  Choose your stay style
                </h4>
              </div>
              <p className="mt-1.5 text-xs font-semibold text-slate-600 sm:text-sm">
                Tiya stay preference ke hisab se hotel, homestay, resort aur
                booking modules tune karegi.
              </p>

              <div className="mt-4 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                {stayStyleOptions.map((option) => (
                  <WizardChoiceCard
                    key={`${option.label}-${option.value}`}
                    label={option.label}
                    title={option.value}
                    desc={option.desc}
                    icon={option.icon}
                    selected={preferences.stayPreference === option.value}
                    onClick={() => updatePreference("stayPreference", option.value)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={19} className="text-orange-600" />
                <h4 className="text-xl font-black text-slate-950">
                  Pick your trip mood
                </h4>
              </div>
              <p className="mt-1.5 text-xs font-semibold text-slate-600 sm:text-sm">
                Mood se pace, activity load, comfort aur budget balancing set hoga.
              </p>

              <div className="mt-4 grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
                {moodOptions.map((mood) => (
                  <WizardChoiceCard
                    key={mood.label}
                    label={mood.label}
                    title={`${mood.comfort} · ${mood.activity}`}
                    desc={mood.desc}
                    icon={mood.icon}
                    selected={selectedMood(mood)}
                    onClick={() => applyMood(mood)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin size={19} className="text-orange-600" />
                    <h4 className="text-xl font-black text-slate-950">
                      Select up to 3 focus areas
                    </h4>
                  </div>
                  <p className="mt-1.5 text-xs font-semibold text-slate-600 sm:text-sm">
                    Tiya itinerary me in interests ko priority degi.
                  </p>
                </div>

                <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-black text-blue-700">
                  {selectedInterests.length}/3 selected
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {smartInterestOptions.map((interest) => {
                  const selected = selectedInterests.includes(interest.value);
                  const disabled = selectedInterests.length >= 3;

                  return (
                    <InterestPill
                      key={interest.value}
                      label={interest.label}
                      icon={interest.icon}
                      selected={selected}
                      disabled={disabled}
                      onClick={() => handleInterestClick(interest.value)}
                    />
                  );
                })}
              </div>

              <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50/70 p-3">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-700">
                  Food preference
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {["Local food", "Cafe trail", "Fine dining", "Street food"].map(
                    (food) => {
                      const selected = smartBuildPreferences.foodPreference === food;

                      return (
                        <button
                          key={food}
                          type="button"
                          onClick={() => updateSmartBuild("foodPreference", food)}
                          className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black transition ${
                            selected
                              ? "border-orange-300 bg-white text-orange-700 shadow-sm"
                              : "border-orange-100 bg-white/60 text-slate-700 hover:bg-white"
                          }`}
                        >
                          <Coffee size={14} />
                          {food}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
                    Review
                  </p>
                  <h4 className="mt-1 text-xl font-black text-slate-950">
                    Your Smart Trip Setup
                  </h4>
                  <p className="mt-1.5 text-xs font-semibold text-slate-600 sm:text-sm">
                    Review selected choices. Change any step from above, then generate.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-[0_12px_32px_rgba(15,23,42,0.05)] sm:p-4">
                <div className="flex flex-wrap gap-2">
                  <ReviewChip label="Travel" value={displayValue(preferences.transportMode)} />
                  <ReviewChip label="Stay" value={preferences.stayPreference} />
                  <ReviewChip label="Mood" value={getMoodLabel(preferences)} />
                  <ReviewChip label="Comfort" value={preferences.comfortLevel} tone="blue" />
                  <ReviewChip
                    label="Food"
                    value={smartBuildPreferences.foodPreference}
                    tone="green"
                  />
                  <ReviewChip
                    label="Budget"
                    value={smartBuildPreferences.budgetRefinement}
                    tone="blue"
                  />

                  {selectedInterests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-black text-blue-700"
                    >
                      {displayInterestLabel(interest)}
                    </span>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                    Estimated style
                  </p>
                  <h5 className="mt-1 text-lg font-black text-slate-950">
                    {getSmartTripStyle(preferences)}
                  </h5>
                  <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-600 sm:text-sm">
                    Tiya will build route, stay, transport, activities, food,
                    Local Life, creator spots, budget and route alerts in one
                    editable journey plan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAdvancedOpen((current) => !current)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-700 hover:bg-orange-50"
                >
                  Advanced AI Controls
                  <ChevronDown
                    size={14}
                    className={`transition ${advancedOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {advancedOpen ? (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="grid gap-2.5 md:grid-cols-2 lg:grid-cols-3">
                      {aiSwitches.map(({ label, key }) => {
                        const enabled = smartBuildPreferences[key];

                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => updateSmartBuild(key, !enabled)}
                            className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-black transition ${
                              enabled
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50"
                            }`}
                          >
                            {label}
                            <span>{enabled ? "ON" : "OFF"}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {comfortLevels.map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => updatePreference("comfortLevel", level)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-black ${
                            preferences.comfortLevel === level
                              ? "border-orange-300 bg-orange-50 text-orange-700"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          {level}
                        </button>
                      ))}

                      {stayPreferences.map((stay) => (
                        <button
                          key={stay}
                          type="button"
                          onClick={() => updatePreference("stayPreference", stay)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-black ${
                            preferences.stayPreference === stay
                              ? "border-orange-300 bg-orange-50 text-orange-700"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          {stay}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={generateSmartItinerary}
                    className="inline-flex min-h-12 min-w-[280px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-7 py-3 text-sm font-black text-white shadow-[0_16px_38px_rgba(255,123,0,0.30)] transition hover:scale-[1.02]"
                  >
                    <WandSparkles size={18} />
                    Generate My Smart Itinerary
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft size={15} />
              Back
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-blue-950 px-5 py-2 text-sm font-black text-white shadow-[0_12px_28px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5"
              >
                Next
                <ArrowRight size={15} />
              </button>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
