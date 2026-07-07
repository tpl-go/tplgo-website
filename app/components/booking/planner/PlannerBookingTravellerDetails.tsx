"use client";

import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { BedDouble, LogIn, UserRoundCheck, Users } from "lucide-react";

import { useAuth } from "@/app/hooks/useAuth";
import { getSavedProfile } from "@/app/lib/account/profileStorage";
import { getLoggedInDisplayName } from "@/app/lib/auth/displayName";
import type { PlannerBookingPayload } from "./PlannerBookingPageShell";

export type PlannerTravellerType = "Adult" | "Child" | "Senior";

export type PlannerBookingTravellerForm = {
  id: string;
  label: string;
  fullName: string;
  mobile: string;
  email: string;
  gender: string;
  age: string;
  travellerType: PlannerTravellerType;
  notes: string;
};

export type PlannerTravellerValidation = {
  canProceed: boolean;
  contactDetails: {
    countryCode: string;
    email: string;
    mobile: string;
  };
  gstDetails: {
    hasGst: boolean;
    saveBillingToProfile: boolean;
    state: string;
  };
  allRequiredTravellersCompleted: boolean;
  leadTravellerComplete: boolean;
  loggedIn: boolean;
  travellers: PlannerBookingTravellerForm[];
};

function valueOrFallback(value: unknown, fallback = "Not available") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

function travellerCount(payload: PlannerBookingPayload) {
  const travellers = payload.travellers || {};
  const adults = Math.max(0, Number(travellers.adults || 0));
  const children = Math.max(0, Number(travellers.children || 0));
  const seniors = Math.max(0, Number(travellers.seniors || 0));
  const total = Math.max(0, Number(travellers.total || 0));
  return Math.max(1, adults + children + seniors || total || 1);
}

function buildTravellerRows(payload: PlannerBookingPayload): PlannerBookingTravellerForm[] {
  const travellers = payload.travellers || {};
  const adults = Math.max(0, Number(travellers.adults || 0));
  const children = Math.max(0, Number(travellers.children || 0));
  const seniors = Math.max(0, Number(travellers.seniors || 0));
  const total = travellerCount(payload);
  const rows: PlannerBookingTravellerForm[] = [];

  const pushRows = (count: number, type: PlannerTravellerType) => {
    for (let index = 0; index < count; index += 1) {
      rows.push({
        age: "",
        email: "",
        fullName: "",
        gender: "",
        id: `${type.toLowerCase()}-${index + 1}`,
        label: `${type} ${index + 1}`,
        mobile: "",
        notes: "",
        travellerType: type,
      });
    }
  };

  pushRows(adults, "Adult");
  pushRows(children, "Child");
  pushRows(seniors, "Senior");

  while (rows.length < total) {
    rows.push({
      age: "",
      email: "",
      fullName: "",
      gender: "",
      id: `traveller-${rows.length + 1}`,
      label: `Traveller ${rows.length + 1}`,
      mobile: "",
      notes: "",
      travellerType: "Adult",
    });
  }

  return rows;
}

function readSessionUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem("tpl_auth_session_v1");
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.user || null;
  } catch {
    return null;
  }
}

export default function PlannerBookingTravellerDetails({
  onValidationChange,
  payload,
}: {
  onValidationChange?: (validation: PlannerTravellerValidation) => void;
  payload: PlannerBookingPayload;
}) {
  const { isAuthenticated, openLoginModal, user } = useAuth();
  const travellers = payload.travellers || {};
  const total =
    Number(travellers.total || 0) ||
    Number(travellers.adults || 0) +
      Number(travellers.children || 0) +
      Number(travellers.seniors || 0);
  const [travellerForms, setTravellerForms] = useState<PlannerBookingTravellerForm[]>(
    () => buildTravellerRows(payload)
  );

  const payloadTravellerSignature = useMemo(
    () => JSON.stringify(payload.travellers || {}),
    [payload.travellers]
  );

  useEffect(() => {
    queueMicrotask(() => setTravellerForms(buildTravellerRows(payload)));
  }, [payload, payloadTravellerSignature]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const sessionUser = user || readSessionUser();
    const mobile = String(sessionUser?.mobile || sessionUser?.phone || "");
    const profile = mobile ? getSavedProfile(mobile) : null;
    const fullName = getLoggedInDisplayName(sessionUser);
    const email = String(sessionUser?.email || profile?.email || "");

    queueMicrotask(() => {
      setTravellerForms((current) =>
        current.map((traveller, index) => {
          if (index !== 0) return traveller;

          return {
            ...traveller,
            email: traveller.email || email,
            fullName: traveller.fullName || fullName,
            mobile:
              traveller.mobile ||
              mobile.replace(/\D/g, "").slice(-10),
          };
        })
      );
    });
  }, [isAuthenticated, user]);

  const leadTraveller = travellerForms[0];
  const leadTravellerComplete = Boolean(
    leadTraveller?.fullName.trim() &&
      leadTraveller?.mobile.trim() &&
      leadTraveller?.email.trim()
  );
  const canProceed = Boolean(isAuthenticated && leadTravellerComplete);

  useEffect(() => {
    const lead = travellerForms[0];
    onValidationChange?.({
      allRequiredTravellersCompleted: leadTravellerComplete,
      canProceed,
      contactDetails: {
        countryCode: "+91",
        email: lead?.email || "",
        mobile: lead?.mobile || "",
      },
      gstDetails: {
        hasGst: false,
        saveBillingToProfile: false,
        state: "",
      },
      leadTravellerComplete,
      loggedIn: isAuthenticated,
      travellers: travellerForms,
    });
  }, [
    canProceed,
    isAuthenticated,
    leadTravellerComplete,
    onValidationChange,
    travellerForms,
  ]);

  const updateTraveller = (
    id: string,
    field: keyof PlannerBookingTravellerForm,
    value: string
  ) => {
    setTravellerForms((current) =>
      current.map((traveller) =>
        traveller.id === id ? { ...traveller, [field]: value } : traveller
      )
    );
  };

  const cards = [
    {
      icon: <Users className="h-5 w-5 text-blue-600" />,
      label: "Total Travellers",
      value: total || "Not available",
    },
    {
      icon: <UserRoundCheck className="h-5 w-5 text-emerald-600" />,
      label: "Composition",
      value: `${Number(travellers.adults || 0)} adults • ${Number(travellers.children || 0)} children • ${Number(travellers.seniors || 0)} seniors`,
    },
    {
      icon: <BedDouble className="h-5 w-5 text-purple-600" />,
      label: "Rooms",
      value: valueOrFallback(travellers.rooms),
    },
  ];

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-950">Traveller Details</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Add traveller details before creating the Smart Planner booking draft.
          </p>
        </div>

        <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3">
          {isAuthenticated ? (
            <>
              <div className="text-sm font-black text-slate-950">
                Logged in as {getLoggedInDisplayName(user || readSessionUser())}
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-600">
                Saved traveller details and wallet benefits can be used for faster booking.
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div>
                <div className="text-sm font-black text-slate-950">
                  Login for saved traveller details
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-600">
                  Login is required before continuing.
                </div>
              </div>
              <button
                type="button"
                onClick={() => openLoginModal({ accountType: "personal", intent: "ai" })}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-orange-700 shadow-sm"
              >
                <LogIn className="h-4 w-4" />
                Login
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
              {card.icon}
              {card.label}
            </div>
            <div className="mt-2 text-sm font-black text-slate-950">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {travellerForms.map((traveller, index) => (
          <div
            key={traveller.id}
            className="rounded-2xl border border-slate-200 bg-[#fcfdff] p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-black text-slate-950">
                  {traveller.label}
                </div>
                <div className="mt-1 text-xs font-bold text-slate-500">
                  {index === 0 ? "Lead traveller" : "Companion traveller"}
                </div>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                {traveller.travellerType}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Full Name" required={index === 0}>
                <input
                  value={traveller.fullName}
                  onChange={(event) =>
                    updateTraveller(traveller.id, "fullName", event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-orange-400"
                  placeholder="Traveller full name"
                />
              </Field>

              <Field label="Mobile" required={index === 0}>
                <input
                  value={traveller.mobile}
                  onChange={(event) =>
                    updateTraveller(traveller.id, "mobile", event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-orange-400"
                  placeholder="10 digit mobile"
                />
              </Field>

              <Field label="Email" required={index === 0}>
                <input
                  value={traveller.email}
                  onChange={(event) =>
                    updateTraveller(traveller.id, "email", event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-orange-400"
                  placeholder="email@example.com"
                />
              </Field>

              <Field label="Gender">
                <select
                  value={traveller.gender}
                  onChange={(event) =>
                    updateTraveller(traveller.id, "gender", event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-orange-400"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </Field>

              <Field label="Age">
                <input
                  value={traveller.age}
                  onChange={(event) =>
                    updateTraveller(traveller.id, "age", event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-orange-400"
                  placeholder="Age"
                />
              </Field>

              <Field label="Traveller Type">
                <select
                  value={traveller.travellerType}
                  onChange={(event) =>
                    updateTraveller(
                      traveller.id,
                      "travellerType",
                      event.target.value as PlannerTravellerType
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-orange-400"
                >
                  <option value="Adult">Adult</option>
                  <option value="Child">Child</option>
                  <option value="Senior">Senior</option>
                </select>
              </Field>
            </div>

            <div className="mt-3">
              <Field label="Optional Notes / Special Requirement">
                <textarea
                  value={traveller.notes}
                  onChange={(event) =>
                    updateTraveller(traveller.id, "notes", event.target.value)
                  }
                  className="min-h-[80px] w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-orange-400"
                  placeholder="Dietary, accessibility, seating or other request"
                />
              </Field>
            </div>
          </div>
        ))}
      </div>

      {!isAuthenticated ? (
        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          Please login before continuing.
        </div>
      ) : !leadTravellerComplete ? (
        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          Lead traveller name, mobile and email are required.
        </div>
      ) : null}
    </section>
  );
}

function Field({
  children,
  label,
  required,
}: {
  children: React.ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}
