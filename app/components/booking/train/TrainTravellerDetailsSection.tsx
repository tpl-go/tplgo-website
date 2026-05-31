"use client";

import { useEffect } from "react";
import type { TrainTravellerItem } from "@/app/lib/train/trainBookingTypes";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import { getLoggedInDisplayName } from "@/app/lib/auth/displayName";

type Props = {
  travellers: TrainTravellerItem[];
  onChange: (next: TrainTravellerItem[]) => void;
};

const BERTH_OPTIONS = [
  "No Preference",
  "Lower",
  "Middle",
  "Upper",
  "Side Lower",
  "Side Upper",
];

function getActiveUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("tpl_auth_session_v1");
    return raw ? JSON.parse(raw)?.user : null;
  } catch {
    return null;
  }
}

function getDisplayNameFromUser(user: any) {
  return getLoggedInDisplayName(user);
}

export default function TrainTravellerDetailsSection({
  travellers,
  onChange,
}: Props) {
  useEffect(() => {
    const syncUser = () => {
      const user = getActiveUser();
      if (!user?.mobile || travellers.length === 0) return;

      const displayName = getDisplayNameFromUser(user);
      if (!displayName) return;

      const firstTraveller = travellers[0];
      if (firstTraveller.fullName?.trim()) return;

      const next = travellers.map((traveller, index) =>
        index === 0
          ? {
              ...traveller,
              fullName: displayName,
            }
          : traveller
      );

      onChange(next);
    };

    syncUser();

    window.addEventListener(AUTH_UPDATED_EVENT, syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, syncUser);
      window.removeEventListener("storage", syncUser);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateTraveller(
    index: number,
    key: keyof TrainTravellerItem,
    value: string
  ) {
    const next = [...travellers];
    next[index] = {
      ...next[index],
      [key]: value,
    };
    onChange(next);
  }

  function addTraveller() {
    onChange([
      ...travellers,
      {
        fullName: "",
        age: "",
        gender: "",
        berthPreference: "",
      },
    ]);
  }

  function removeTraveller(index: number) {
    if (travellers.length === 1) return;
    onChange(travellers.filter((_, i) => i !== index));
  }

  return (
    <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[20px] font-extrabold text-slate-900">
              Traveller Details
            </div>
            <div className="mt-1 text-[13px] text-slate-500">
              Add passenger information exactly as required for train booking.
            </div>
          </div>

          <button
            type="button"
            onClick={addTraveller}
            className="rounded-xl bg-sky-600 px-4 py-2 text-[13px] font-bold text-white transition hover:bg-sky-700"
          >
            + Add Traveller
          </button>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5">
        {travellers.map((traveller, index) => (
          <div
            key={index}
            className="rounded-[18px] border border-slate-200 bg-slate-50 p-4"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="text-[16px] font-extrabold text-slate-900">
                Passenger {index + 1}
              </div>

              {travellers.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeTraveller(index)}
                  className="text-[13px] font-bold text-rose-600 transition hover:text-rose-700"
                >
                  Remove
                </button>
              ) : null}
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Field label="Full Name">
                <input
                  type="text"
                  value={traveller.fullName}
                  onChange={(e) =>
                    updateTraveller(index, "fullName", e.target.value)
                  }
                  placeholder="Enter passenger name"
                  className="h-[46px] w-full rounded-xl border border-slate-300 bg-white px-3 text-[14px] font-medium text-slate-900 outline-none"
                />
              </Field>

              <Field label="Age">
                <input
                  type="number"
                  value={traveller.age}
                  onChange={(e) => updateTraveller(index, "age", e.target.value)}
                  placeholder="Age"
                  className="h-[46px] w-full rounded-xl border border-slate-300 bg-white px-3 text-[14px] font-medium text-slate-900 outline-none"
                />
              </Field>

              <Field label="Gender">
                <select
                  value={traveller.gender}
                  onChange={(e) =>
                    updateTraveller(index, "gender", e.target.value)
                  }
                  className="h-[46px] w-full rounded-xl border border-slate-300 bg-white px-3 text-[14px] font-medium text-slate-900 outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </Field>

              <Field label="Berth Preference">
                <select
                  value={traveller.berthPreference}
                  onChange={(e) =>
                    updateTraveller(index, "berthPreference", e.target.value)
                  }
                  className="h-[46px] w-full rounded-xl border border-slate-300 bg-white px-3 text-[14px] font-medium text-slate-900 outline-none"
                >
                  <option value="">Select Preference</option>
                  {BERTH_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-[13px] font-bold text-slate-700">{label}</div>
      {children}
    </label>
  );
}
