"use client";

import { Baby, BriefcaseBusiness, HeartPulse, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import ReviewTravellerCard from "./ReviewTravellerCard";
import ReviewTravellerPreferences from "./ReviewTravellerPreferences";
import ReviewTravellerRequirements from "./ReviewTravellerRequirements";
import ReviewTravellerValidation from "./ReviewTravellerValidation";
import type { ReviewTraveller, TravellerType } from "./ReviewTravellerCard";
import type { TravellerRequirement } from "./ReviewTravellerRequirements";
import type { TiyaSmartPlannerReviewPayload } from "@/app/lib/ecosystem/planner/plannerReviewPayload";

type ReviewTravellerSectionProps = {
  payload: TiyaSmartPlannerReviewPayload;
};

type UnknownRecord = Record<string, unknown>;
type PayloadWithTravellerExtras = TiyaSmartPlannerReviewPayload & {
  emergencyContact?: unknown;
  selectedVisa?: unknown[];
  travellerProfiles?: unknown[];
  travellers?: TiyaSmartPlannerReviewPayload["travellers"] & {
    emergencyContact?: unknown;
    infants?: number;
    profiles?: unknown[];
    specialRequests?: unknown[];
    travellers?: unknown[];
  };
};

function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function asRecord(value: unknown): UnknownRecord {
  return typeof value === "object" && value !== null ? (value as UnknownRecord) : {};
}

function textValue(record: UnknownRecord, keys: string[]) {
  const value = keys.map((key) => record[key]).find((item) => typeof item === "string");
  return typeof value === "string" ? value : "";
}

function numberValue(record: UnknownRecord, keys: string[]) {
  const value = keys
    .map((key) => record[key])
    .find((item) => typeof item === "number" || typeof item === "string");
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function booleanish(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (["yes", "true", "provided", "available", "ready"].includes(normalized)) return true;
    if (["no", "false", "missing", "pending"].includes(normalized)) return false;
  }
  return undefined;
}

function normalizeTravellerType(value: unknown, fallback: TravellerType): TravellerType {
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("child")) return "Child";
  if (normalized.includes("infant")) return "Infant";
  if (normalized.includes("senior")) return "Senior";
  if (normalized.includes("adult")) return "Adult";
  return fallback;
}

function travellerFromProfile(
  profile: unknown,
  index: number,
  fallback: TravellerType
): ReviewTraveller {
  const record = asRecord(profile);

  return {
    age: numberValue(record, ["age"]),
    frequentTravellerTag: textValue(record, ["frequentTravellerTag", "tag"]),
    gender: textValue(record, ["gender"]),
    id: String(record.id || `traveller-${index}`),
    name: textValue(record, ["name", "fullName", "travellerName"]),
    nationality: textValue(record, ["nationality"]),
    passportStatus:
      textValue(record, ["passportStatus"]) ||
      (booleanish(record.passportAvailable) === true
        ? "Available"
        : booleanish(record.passportAvailable) === false
          ? "Pending"
          : undefined),
    travellerType: normalizeTravellerType(record.type || record.travellerType, fallback),
    visaRequirement:
      textValue(record, ["visaRequirement", "visaStatus"]) ||
      (booleanish(record.visaAvailable) === true
        ? "Available"
        : booleanish(record.visaRequired) === true
          ? "Required"
          : undefined),
  };
}

function generatedTravellers(
  count: number,
  type: TravellerType,
  offset: number
): ReviewTraveller[] {
  return Array.from({ length: Math.max(0, count) }, (_, index) => ({
    id: `${type}-${offset + index + 1}`,
    travellerType: type,
  }));
}

function buildTravellers(payload: TiyaSmartPlannerReviewPayload): ReviewTraveller[] {
  const extended = payload as PayloadWithTravellerExtras;
  const directProfiles = [
    ...safeArray(extended.travellerProfiles),
    ...safeArray(extended.travellers?.travellers),
    ...safeArray(extended.travellers?.profiles),
  ];

  if (directProfiles.length) {
    return directProfiles.map((profile, index) =>
      travellerFromProfile(profile, index, "Adult")
    );
  }

  const adults = Number(payload.travellers?.adults || 0);
  const children = Number(payload.travellers?.children || 0);
  const seniors = Number(payload.travellers?.seniors || 0);
  const infants = Number(extended.travellers?.infants || 0);

  return [
    ...generatedTravellers(adults, "Adult", 0),
    ...generatedTravellers(children, "Child", adults),
    ...generatedTravellers(infants, "Infant", adults + children),
    ...generatedTravellers(seniors, "Senior", adults + children + infants),
  ];
}

function groupType(payload: TiyaSmartPlannerReviewPayload, travellers: ReviewTraveller[]) {
  const total = travellers.length || Number(payload.travellers?.total || 0);
  const children = travellers.filter((traveller) => traveller.travellerType === "Child").length;
  const seniors = travellers.filter((traveller) => traveller.travellerType === "Senior").length;
  const tripType = payload.trip?.tripType || payload.travellers?.travellerType;

  if (tripType) return tripType;
  if (total <= 1) return "Solo Traveller";
  if (total === 2 && children === 0 && seniors === 0) return "Couple";
  if (children > 0 || seniors > 0) return "Family";
  return "Mixed Group";
}

function preferenceTags(payload: TiyaSmartPlannerReviewPayload) {
  const tags = new Set<string>();
  const preferenceText = [
    payload.preferences?.budgetTier,
    payload.preferences?.stayPreference,
    payload.preferences?.travelStyle,
    payload.trip?.travelStyle,
    payload.trip?.pace,
    payload.trip?.tripType,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (preferenceText.includes("budget")) tags.add("Budget Traveller");
  if (preferenceText.includes("luxury") || preferenceText.includes("premium")) tags.add("Luxury Traveller");
  if (preferenceText.includes("adventure")) tags.add("Adventure Traveller");
  if (preferenceText.includes("family")) tags.add("Family Friendly");
  if (preferenceText.includes("relaxed") || preferenceText.includes("slow")) tags.add("Slow Travel");
  if (preferenceText.includes("food")) tags.add("Food Explorer");
  if (preferenceText.includes("spiritual")) tags.add("Spiritual Travel");
  if (preferenceText.includes("nature")) tags.add("Nature Lover");
  if (preferenceText.includes("shopping")) tags.add("Shopping Focused");
  if (preferenceText.includes("photo") || preferenceText.includes("creator")) tags.add("Photography Focused");
  if ((payload.selectedCreatorSpots || []).length > 0) tags.add("Creator Mode");
  if (!tags.size && payload.trip?.travelStyle) tags.add(payload.trip.travelStyle);

  return Array.from(tags);
}

function buildRequirements(payload: TiyaSmartPlannerReviewPayload): TravellerRequirement[] {
  const extended = payload as PayloadWithTravellerExtras;
  const requestText = JSON.stringify(extended.travellers?.specialRequests || "").toLowerCase();
  const hasSeniors = Number(payload.travellers?.seniors || 0) > 0;
  const hasChildren = Number(payload.travellers?.children || 0) > 0 || Number(extended.travellers?.infants || 0) > 0;

  return [
    {
      label: "Wheelchair Requirement",
      status: requestText.includes("wheelchair") ? "Provided" : "Not Required",
    },
    {
      label: "Senior Assistance",
      status: hasSeniors ? (requestText.includes("senior") ? "Provided" : "Pending") : "Not Required",
    },
    {
      label: "Infant Assistance",
      status: hasChildren && requestText.includes("infant") ? "Provided" : hasChildren ? "Pending" : "Not Required",
    },
    {
      label: "Medical Assistance",
      status: requestText.includes("medical") ? "Provided" : "Not Required",
    },
    {
      label: "Dietary Requirement",
      status: requestText.includes("diet") || requestText.includes("meal") ? "Provided" : "Not Required",
    },
    {
      label: "Special Seating",
      status: requestText.includes("seat") ? "Provided" : "Not Required",
    },
    {
      label: "Accessible Stay Requirement",
      status: requestText.includes("accessible") ? "Provided" : "Not Required",
    },
  ];
}

function readinessRows(
  payload: TiyaSmartPlannerReviewPayload,
  travellers: ReviewTraveller[]
) {
  const extended = payload as PayloadWithTravellerExtras;
  const passportRequired = Boolean(extended.selectedVisa?.length);
  const insuranceSelected = safeArray(payload.selectedInsurance).length > 0;
  const hasEmergency = Boolean(extended.emergencyContact || extended.travellers?.emergencyContact);
  const profilesComplete = Boolean(payload.travellers?.profilesComplete);
  const hasNames = travellers.length > 0 && travellers.every((traveller) => traveller.name);

  return [
    { label: "Passport Required", status: passportRequired ? "Pending" : "Ready" },
    {
      label: "Passport Available",
      status: travellers.some((traveller) => traveller.passportStatus)
        ? "Ready"
        : passportRequired
          ? "Missing"
          : "Pending",
    },
    { label: "Visa Required", status: passportRequired ? "Pending" : "Ready" },
    {
      label: "Visa Available",
      status: travellers.some((traveller) => traveller.visaRequirement?.toLowerCase().includes("available"))
        ? "Ready"
        : passportRequired
          ? "Missing"
          : "Pending",
    },
    { label: "Travel Insurance", status: insuranceSelected ? "Ready" : "Pending" },
    { label: "Emergency Contact", status: hasEmergency ? "Ready" : "Missing" },
    {
      label: "Traveller Information Complete",
      status: profilesComplete || hasNames ? "Ready" : "Pending",
    },
  ] as Array<{ label: string; status: "Ready" | "Pending" | "Missing" }>;
}

function validationGaps(
  payload: TiyaSmartPlannerReviewPayload,
  travellers: ReviewTraveller[]
) {
  const rows = readinessRows(payload, travellers);
  const gaps: string[] = [];

  if (!travellers.length) gaps.push("No traveller information available");
  if (travellers.some((traveller) => !traveller.name)) gaps.push("Missing Traveller Names");
  if (travellers.some((traveller) => !traveller.age)) gaps.push("Missing Age");
  if (rows.find((row) => row.label === "Passport Available")?.status === "Missing") {
    gaps.push("Missing Passport");
  }
  if (rows.find((row) => row.label === "Visa Available")?.status === "Missing") {
    gaps.push("Missing Visa");
  }
  if (rows.find((row) => row.label === "Emergency Contact")?.status === "Missing") {
    gaps.push("Missing Emergency Contact");
  }
  if (!payload.travellers?.profilesComplete) gaps.push("Missing Contact Details");

  return Array.from(new Set(gaps));
}

function travellerReadinessScore(
  payload: TiyaSmartPlannerReviewPayload,
  travellers: ReviewTraveller[]
) {
  const rows = readinessRows(payload, travellers);
  const readyRows = rows.filter((row) => row.status === "Ready").length;
  const profileScore = payload.travellers?.profilesComplete ? 20 : 8;
  const nameScore = travellers.length && travellers.every((traveller) => traveller.name) ? 16 : 4;
  return Math.min(100, Math.round((readyRows / rows.length) * 54 + profileScore + nameScore));
}

export default function ReviewTravellerSection({
  payload,
}: ReviewTravellerSectionProps) {
  const travellers = buildTravellers(payload);
  const adults = travellers.filter((traveller) => traveller.travellerType === "Adult").length || Number(payload.travellers?.adults || 0);
  const children = travellers.filter((traveller) => traveller.travellerType === "Child").length || Number(payload.travellers?.children || 0);
  const seniors = travellers.filter((traveller) => traveller.travellerType === "Senior").length || Number(payload.travellers?.seniors || 0);
  const infants = travellers.filter((traveller) => traveller.travellerType === "Infant").length;
  const total = travellers.length || Number(payload.travellers?.total || 0);
  const requirements = buildRequirements(payload);
  const preferences = preferenceTags(payload);
  const readiness = readinessRows(payload, travellers);
  const gaps = validationGaps(payload, travellers);
  const score = travellerReadinessScore(payload, travellers);
  const providedRequirements = requirements.filter((item) => item.status === "Provided").length;
  const hasEmergency = readiness.find((row) => row.label === "Emergency Contact")?.status === "Ready";

  const roomSummary = [
    ["Rooms", payload.travellers?.rooms || "Not available"],
    ["Occupancy", total || "Not available"],
    ["Adults Per Room", payload.travellers?.rooms ? Math.ceil(adults / payload.travellers.rooms) : "Not available"],
    ["Children Per Room", payload.travellers?.rooms ? Math.ceil(children / payload.travellers.rooms) : "Not available"],
    ["Extra Bed Requirement", children > 0 || seniors > 0 ? "Review" : "Not Required"],
    ["Meal Preference", preferences.includes("Food Explorer") ? "Food focused" : "Not available"],
  ].map(([label, value]) => ({ label: String(label), value }));
  const compositionMetrics: Array<{
    icon: LucideIcon;
    label: string;
    value: number | string;
  }> = [
    { icon: UsersRound, label: "Adults", value: adults },
    { icon: Baby, label: "Children", value: children },
    { icon: Baby, label: "Infants", value: infants },
    { icon: HeartPulse, label: "Senior Citizens", value: seniors },
    { icon: BriefcaseBusiness, label: "Group Type", value: groupType(payload, travellers) },
  ];

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/70 p-6 shadow-[0_18px_54px_rgba(15,23,42,0.06)]">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#4f46e5]">
            Human Validation Layer
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950">
            TRAVELLER REVIEW
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
            Review all traveller details, preferences and special requirements
            before proceeding to booking.
          </p>
        </div>
        <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500 xl:block">
          Read-only traveller validation
        </div>
      </div>

      <div className="mt-6 grid gap-3 xl:grid-cols-7">
        {[
          ["Adults", adults],
          ["Children", children],
          ["Senior Citizens", seniors],
          ["Infants", infants],
          ["Total Travellers", total],
          ["Special Requests", providedRequirements],
          ["Preference Tags", preferences.length],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.05)]"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              {label}
            </p>
            <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-5">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
              Traveller Composition
            </p>
            <div className="mt-4 grid gap-3 xl:grid-cols-5">
              {compositionMetrics.map(({ icon: MetricIcon, label, value }) => {
                return (
                  <div
                    key={label}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-3"
                  >
                    <MetricIcon size={17} className="text-[#4f46e5]" />
                    <p className="mt-2 text-xs font-bold text-slate-500">{label}</p>
                    <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
              Traveller Details Review
            </p>
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {travellers.length ? (
                travellers.map((traveller) => (
                  <ReviewTravellerCard key={traveller.id} traveller={traveller} />
                ))
              ) : (
                <p className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-black text-slate-500">
                  No traveller information available. Return to Workspace to add
                  traveller details.
                </p>
              )}
            </div>
          </div>
        </div>

        <aside className="grid gap-4 self-start">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
              Traveller Readiness
            </p>
            <p className="mt-3 text-5xl font-black text-slate-950">{score}%</p>
            <div className="mt-5 grid gap-2">
              {[
                ["Traveller Data Complete", payload.travellers?.profilesComplete ? "Ready" : "Pending"],
                ["Document Readiness", readiness.some((row) => row.status === "Missing") ? "Missing" : "Pending"],
                ["Special Requests Covered", providedRequirements ? "Ready" : "Pending"],
                ["Emergency Info Available", hasEmergency ? "Ready" : "Missing"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <span className="text-xs font-bold text-slate-500">{label}</span>
                  <span className="text-sm font-black text-slate-950">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-6 grid gap-5">
        <ReviewTravellerRequirements requirements={requirements} />
        <ReviewTravellerPreferences
          preferences={preferences}
          roomSummary={roomSummary}
        />
        <ReviewTravellerValidation gaps={gaps} readiness={readiness} />
      </div>
    </section>
  );
}
