"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Link2, Mail, Phone, ShieldCheck } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import {
  FrequentFlyerEntry,
  ProfileFormData,
  defaultProfileData,
  getSavedProfile,
  saveProfile,
} from "@/app/lib/account/profileStorage";

const countryStateCityMap: Record<string, Record<string, string[]>> = {
  India: {
    Rajasthan: ["Jaipur", "Udaipur", "Jodhpur", "Kota"],
    Maharashtra: ["Mumbai", "Pune", "Nagpur"],
    Delhi: ["New Delhi"],
  },
  UAE: {
    Dubai: ["Dubai City"],
    AbuDhabi: ["Abu Dhabi City"],
  },
  USA: {
    California: ["Los Angeles", "San Francisco"],
    Texas: ["Houston", "Dallas"],
  },
};

const airlineOptions = [
  "Air India",
  "IndiGo",
  "Akasa Air",
  "SpiceJet",
  "Emirates",
  "Qatar Airways",
  "Singapore Airlines",
];

const API_BASE_URL = process.env.NEXT_PUBLIC_TPL_API_BASE_URL?.replace(/\/+$/, "") || "";
const AUTH_STORAGE_KEY = "tpl_auth_session_v1";

type IdentityProvider = "mobile" | "email" | "google";

type IdentityRecord = {
  provider: IdentityProvider;
  identifier: string;
  normalizedIdentifier: string;
  isVerified: boolean;
  status: "active" | "disabled" | "pending";
};

type IdentitySummary = {
  verifiedMobile: string | null;
  identities: IdentityRecord[];
};

export default function MyProfileSection() {
  const { user } = useAuth();

  const [formData, setFormData] = useState<ProfileFormData>(defaultProfileData);
  const [savedMessage, setSavedMessage] = useState("");
  const [identitySummary, setIdentitySummary] = useState<IdentitySummary | null>(null);
  const [identityStatus, setIdentityStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    const loadProfile = () => {
      let activeMobile = user?.mobile || "";
      let activeEmail = user?.email || "";

      try {
        const raw = localStorage.getItem("tpl_auth_session_v1");
        const parsed = raw ? JSON.parse(raw) : null;

        activeMobile = parsed?.user?.mobile || activeMobile;
        activeEmail = parsed?.user?.email || activeEmail;
      } catch {}

      if (!activeMobile) return;

      const saved = getSavedProfile(activeMobile);

      setFormData({
        ...saved,
        mobile: activeMobile,
        email: activeEmail || saved.email,
      });
    };

    loadProfile();

    window.addEventListener(AUTH_UPDATED_EVENT, loadProfile);
    window.addEventListener("storage", loadProfile);

    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, loadProfile);
      window.removeEventListener("storage", loadProfile);
    };
  }, [user?.mobile, user?.email]);

  useEffect(() => {
    let cancelled = false;

    async function loadIdentity() {
      if (!user?.id || !API_BASE_URL) {
        setIdentitySummary(null);
        setIdentityStatus("idle");
        return;
      }

      try {
        setIdentityStatus("loading");
        const token = readStoredAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/v1/me/identity`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || payload?.ok !== true) throw new Error("Identity details unavailable.");
        if (cancelled) return;
        setIdentitySummary(normalizeIdentitySummary(payload?.data?.identity));
        setIdentityStatus("ready");
      } catch {
        if (cancelled) return;
        setIdentitySummary(null);
        setIdentityStatus("error");
      }
    }

    void loadIdentity();
    window.addEventListener(AUTH_UPDATED_EVENT, loadIdentity);

    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_UPDATED_EVENT, loadIdentity);
    };
  }, [user?.id]);

  const identityCards = useMemo(() => buildIdentityCards(identitySummary, user), [identitySummary, user]);

  const countryOptions = Object.keys(countryStateCityMap);
  const stateOptions = formData.country
    ? Object.keys(countryStateCityMap[formData.country] || {})
    : [];
  const cityOptions =
    formData.country && formData.state
      ? countryStateCityMap[formData.country]?.[formData.state] || []
      : [];

  const updateField = (key: keyof ProfileFormData, value: string | null) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateFlyerRow = (
    id: number,
    field: keyof FrequentFlyerEntry,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      frequentFlyers: prev.frequentFlyers.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      ),
    }));
  };

  const addFlyerRow = () => {
    setFormData((prev) => ({
      ...prev,
      frequentFlyers: [
        ...prev.frequentFlyers,
        {
          id: Date.now(),
          airline: "",
          flyerNumber: "",
        },
      ],
    }));
  };

  const removeFlyerRow = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      frequentFlyers:
        prev.frequentFlyers.length === 1
          ? prev.frequentFlyers
          : prev.frequentFlyers.filter((row) => row.id !== id),
    }));
  };

  const handleSave = () => {
    const activeMobile = formData.mobile || user?.mobile;
    if (!activeMobile) return;

    saveProfile(activeMobile, formData);
    setSavedMessage("Profile saved successfully.");

    window.setTimeout(() => {
      setSavedMessage("");
    }, 2500);
  };

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
        <div>
          <h1 className="text-[18px] font-semibold text-slate-900">
            My Profile
          </h1>
          {savedMessage ? (
            <p className="mt-1 text-[12px] text-green-600">{savedMessage}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="h-10 rounded-xl bg-[#0b5fff] px-5 text-[12px] font-semibold tracking-wide text-white transition hover:bg-[#094ee0]"
        >
          SAVE
        </button>
      </div>

      <div className="space-y-8 px-6 py-6">
        <section className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4 shadow-[0_10px_28px_rgba(14,165,233,0.08)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#0b5fff]">
                Sign-in & Contact Details
              </p>
              <h2 className="mt-1 text-[16px] font-semibold text-slate-950">
                Verified login identities
              </h2>
              <p className="mt-1 max-w-2xl text-[12px] leading-5 text-slate-600">
                These details come from the TPL identity layer and control how you sign in.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Server verified
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            {identityCards.map((card) => (
              <IdentityStatusCard key={card.label} {...card} />
            ))}
          </div>

          {identityStatus === "loading" ? (
            <p className="mt-3 text-[11px] font-semibold text-slate-500">Loading verified identifiers...</p>
          ) : null}
          {identityStatus === "error" ? (
            <p className="mt-3 text-[11px] font-semibold text-amber-700">
              Verified identity details are temporarily unavailable. Your login session is unchanged.
            </p>
          ) : null}
        </section>

        <div className="flex flex-col gap-3 rounded-2xl border border-[#ddb0b0] bg-[#fff4f4] px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-[18px]">🎁</div>

            <div>
              <p className="text-[14px] font-semibold text-slate-900">
                Planning a Birthday trip?
              </p>
              <p className="mt-0.5 text-[12px] leading-5 text-slate-600">
                Please add your Date of Birth and enjoy a little surprise from us!
              </p>
            </div>
          </div>

          <button
            type="button"
            className="text-[12px] font-semibold text-[#0b5fff] hover:underline"
          >
            Add Date of Birth
          </button>
        </div>

        <section>
          <h2 className="text-[15px] font-semibold text-slate-900">
            General Information
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="FIRST & MIDDLE NAME"
              value={formData.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
            />
            <InputField
              label="LAST NAME"
              value={formData.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
            />

            <SelectField
              label="GENDER"
              value={formData.gender}
              options={["Male", "Female", "Other"]}
              onChange={(e) => updateField("gender", e.target.value)}
            />

            <InputField
              label="DATE OF BIRTH"
              type="date"
              value={formData.dob}
              onChange={(e) => updateField("dob", e.target.value)}
            />

            <SelectField
              label="NATIONALITY"
              value={formData.nationality}
              options={["Indian", "American", "British"]}
              onChange={(e) => updateField("nationality", e.target.value)}
            />

            <SelectField
              label="MARITAL STATUS"
              value={formData.maritalStatus}
              options={["Single", "Married"]}
              onChange={(e) => updateField("maritalStatus", e.target.value)}
            />

            <InputField
              label="ANNIVERSARY"
              type="date"
              value={formData.anniversary}
              onChange={(e) => updateField("anniversary", e.target.value)}
            />

            <SelectField
              label="COUNTRY"
              value={formData.country}
              options={countryOptions}
              onChange={(e) => {
                const nextCountry = e.target.value;
                const nextStates = Object.keys(
                  countryStateCityMap[nextCountry] || {}
                );

                updateField("country", nextCountry);
                updateField("state", nextStates[0] || "");
                updateField(
                  "city",
                  nextStates[0]
                    ? countryStateCityMap[nextCountry]?.[nextStates[0]]?.[0] ||
                        ""
                    : ""
                );
              }}
            />

            <SelectField
              label="STATE"
              value={formData.state}
              options={stateOptions}
              onChange={(e) => {
                const nextState = e.target.value;
                updateField("state", nextState);
                updateField(
                  "city",
                  countryStateCityMap[formData.country]?.[nextState]?.[0] || ""
                );
              }}
            />

            <SelectField
              label="CITY"
              value={formData.city}
              options={cityOptions}
              onChange={(e) => updateField("city", e.target.value)}
            />
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-slate-900">
            Contact Details
          </h2>
          <p className="mt-1 text-[12px] text-slate-500">
            Add contact information to receive booking details & other alerts
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="MOBILE NUMBER"
              value={formData.mobile}
              onChange={(e) => updateField("mobile", e.target.value)}
            />
            <InputField
              label="ADD EMAIL ID"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="name@example.com"
            />
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-slate-900">
            Document Details
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="PASSPORT NO."
              value={formData.passportNo}
              onChange={(e) => updateField("passportNo", e.target.value)}
            />
            <InputField
              label="EXPIRY DATE"
              type="date"
              value={formData.passportExpiry}
              onChange={(e) => updateField("passportExpiry", e.target.value)}
            />
            <SelectField
              label="ISSUING COUNTRY"
              value={formData.issuingCountry}
              options={countryOptions}
              onChange={(e) => updateField("issuingCountry", e.target.value)}
            />
            <InputField
              label="PAN CARD NUMBER"
              value={formData.panCard}
              onChange={(e) => updateField("panCard", e.target.value)}
            />
          </div>

          <p className="mt-2 text-[11px] text-slate-500">
            Note: Your PAN No. will only be used for international bookings as per RBI guidelines.
          </p>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-slate-900">
            Frequent Flyer Details
          </h2>

          <div className="mt-4 space-y-3">
            {formData.frequentFlyers.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]"
              >
                <SelectField
                  label="AIRLINE"
                  value={row.airline}
                  options={airlineOptions}
                  onChange={(e) =>
                    updateFlyerRow(row.id, "airline", e.target.value)
                  }
                />

                <InputField
                  label="FREQUENT FLYER NUMBER"
                  value={row.flyerNumber}
                  onChange={(e) =>
                    updateFlyerRow(row.id, "flyerNumber", e.target.value)
                  }
                />

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeFlyerRow(row.id)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 text-[16px] text-red-600 transition hover:bg-red-50"
                    title="Remove flyer"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addFlyerRow}
            className="mt-3 text-[13px] font-semibold text-[#0b5fff] hover:underline"
          >
            + Add
          </button>
        </section>
      </div>
    </div>
  );
}

function IdentityStatusCard(props: {
  label: string;
  value: string;
  status: string;
  tone: "verified" | "missing" | "connected";
  icon: React.ComponentType<{ className?: string }>;
}) {
  const Icon = props.icon;
  const isPositive = props.tone === "verified" || props.tone === "connected";

  return (
    <article className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span aria-hidden="true" className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${
          isPositive ? "bg-[#0b5fff]/10 text-[#0b5fff]" : "bg-slate-100 text-slate-500"
        }`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black ${
          isPositive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
        }`}>
          {isPositive ? <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> : null}
          {props.status}
        </span>
      </div>
      <p className="mt-3 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">{props.label}</p>
      <p className="mt-1 break-words text-[14px] font-bold text-slate-950">{props.value}</p>
    </article>
  );
}

function buildIdentityCards(identitySummary: IdentitySummary | null, user: ReturnType<typeof useAuth>["user"]) {
  const identities = identitySummary?.identities ?? [];
  const mobileIdentity = identities.find((identity) => identity.provider === "mobile" && identity.status === "active");
  const emailIdentity = identities.find((identity) => identity.provider === "email" && identity.status === "active");
  const googleIdentity = identities.find((identity) => identity.provider === "google" && identity.status === "active");
  const mobileValue = mobileIdentity?.normalizedIdentifier || identitySummary?.verifiedMobile || user?.mobile || "";
  const emailValue = emailIdentity?.normalizedIdentifier || user?.email || "";

  return [
    {
      label: "Mobile",
      value: mobileValue ? maskMobile(mobileValue) : "Not added",
      status: mobileIdentity?.isVerified || identitySummary?.verifiedMobile ? "Verified" : "Not added",
      tone: mobileValue ? "verified" as const : "missing" as const,
      icon: Phone,
    },
    {
      label: "Email",
      value: emailValue ? maskEmail(emailValue) : "Not added",
      status: emailIdentity?.isVerified ? "Verified" : "Not added",
      tone: emailValue ? "verified" as const : "missing" as const,
      icon: Mail,
    },
    {
      label: "Google",
      value: googleIdentity ? "Connected" : "Not connected",
      status: googleIdentity ? "Connected" : "Not added",
      tone: googleIdentity ? "connected" as const : "missing" as const,
      icon: Link2,
    },
  ];
}

function normalizeIdentitySummary(input: unknown): IdentitySummary {
  const record = input && typeof input === "object" && !Array.isArray(input)
    ? input as Record<string, unknown>
    : {};
  const identities = Array.isArray(record.identities)
    ? record.identities.map(normalizeIdentityRecord).filter(Boolean) as IdentityRecord[]
    : [];
  return {
    verifiedMobile: typeof record.verifiedMobile === "string" ? record.verifiedMobile : null,
    identities,
  };
}

function normalizeIdentityRecord(input: unknown): IdentityRecord | null {
  const record = input && typeof input === "object" && !Array.isArray(input)
    ? input as Record<string, unknown>
    : {};
  if (record.provider !== "mobile" && record.provider !== "email" && record.provider !== "google") return null;
  return {
    provider: record.provider,
    identifier: typeof record.identifier === "string" ? record.identifier : "",
    normalizedIdentifier: typeof record.normalizedIdentifier === "string" ? record.normalizedIdentifier : "",
    isVerified: record.isVerified === true,
    status: record.status === "active" || record.status === "disabled" || record.status === "pending" ? record.status : "pending",
  };
}

function readStoredAuthToken(): string | null {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) as { token?: string; sessionToken?: string; session?: { token?: string } } : null;
    return parsed?.token || parsed?.sessionToken || parsed?.session?.token || null;
  } catch {
    return null;
  }
}

function maskMobile(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) return "Verified mobile";
  const suffix = digits.slice(-4);
  const prefix = value.trim().startsWith("+") ? value.trim().replace(/\d(?=\d{4})/g, "•") : `•••••• ${suffix}`;
  return prefix.includes(suffix) ? prefix : `•••••• ${suffix}`;
}

function maskEmail(value: string) {
  const [name, domain] = value.split("@");
  if (!name || !domain) return "Verified email";
  return `${name.slice(0, 1)}••••@${domain}`;
}

function InputField({
  label,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </label>
      <input
        {...props}
        className={`h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-[14px] font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b5fff] ${className}`}
      />
    </div>
  );
}

function SelectField({
  label,
  options,
  className = "",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: string[];
}) {
  const selectRef = React.useRef<HTMLSelectElement | null>(null);

  const handleOpen = () => {
    if (!selectRef.current) return;

    selectRef.current.focus();

    if (
      typeof (
        selectRef.current as HTMLSelectElement & {
          showPicker?: () => void;
        }
      ).showPicker === "function"
    ) {
      (
        selectRef.current as HTMLSelectElement & {
          showPicker?: () => void;
        }
      ).showPicker?.();
    } else {
      selectRef.current.click();
    }
  };

  return (
    <div>
      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </label>

      <div
        onClick={handleOpen}
        className={`relative flex h-12 w-full cursor-pointer items-center rounded-xl border border-gray-300 bg-white px-4 text-[14px] font-medium text-slate-900 transition focus-within:border-[#0b5fff] ${className}`}
      >
        <select
          ref={selectRef}
          {...props}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-xl bg-transparent px-4 pr-10 text-[14px] font-medium text-slate-900 outline-none"
        >
          <option value="">Select</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute right-4 text-[12px] text-slate-500">
          ▼
        </span>
      </div>
    </div>
  );
}
