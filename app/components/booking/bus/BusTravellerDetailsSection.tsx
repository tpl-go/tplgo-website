"use client";

import { useEffect } from "react";
import type { BusTravellerItem } from "@/app/lib/bus/busBookingTypes";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import { getLoggedInDisplayName } from "@/app/lib/auth/displayName";

type Props = {
  travellers: BusTravellerItem[];
  onChange: (travellers: BusTravellerItem[]) => void;
};

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

export default function BusTravellerDetailsSection({
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

      const updated = travellers.map((traveller, index) =>
        index === 0
          ? {
              ...traveller,
              fullName: displayName,
            }
          : traveller
      );

      onChange(updated);
    };

    syncUser();

    window.addEventListener(AUTH_UPDATED_EVENT, syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, [travellers, onChange]);

  function updateTraveller(
    index: number,
    key: keyof BusTravellerItem,
    value: string
  ) {
    const updated = travellers.map((traveller, i) =>
      i === index ? { ...traveller, [key]: value } : traveller
    );
    onChange(updated);
  }

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <h2 className="text-[18px] font-extrabold text-slate-900">
        Traveller Details
      </h2>

      <div className="mt-5 space-y-4">
        {travellers.map((traveller, index) => (
          <div
            key={traveller.seatNumber}
            className="grid min-w-0 grid-cols-1 gap-4 rounded-xl border border-slate-200 px-4 py-4 md:grid-cols-[90px_1.4fr_120px_220px] md:items-center"
          >
            <div className="text-[14px] font-semibold text-slate-700">
              Seat {traveller.seatNumber}
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-semibold text-slate-700">
                Name
              </label>
              <input
                value={traveller.fullName}
                onChange={(e) =>
                  updateTraveller(index, "fullName", e.target.value)
                }
                placeholder="Type here"
                className="h-[44px] w-full rounded-lg border border-slate-300 px-3 text-[13px] outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-semibold text-slate-700">
                Age*
              </label>
              <input
                value={traveller.age}
                onChange={(e) => updateTraveller(index, "age", e.target.value)}
                placeholder="eg : 24"
                className="h-[44px] w-full rounded-lg border border-slate-300 px-3 text-[13px] outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-semibold text-slate-700">
                Gender
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateTraveller(index, "gender", "Male")}
                  className={`h-[44px] rounded-lg border text-[13px] font-semibold ${
                    traveller.gender === "Male"
                      ? "border-sky-500 bg-sky-50 text-sky-700"
                      : "border-slate-300 text-slate-700"
                  }`}
                >
                  Male
                </button>

                <button
                  type="button"
                  onClick={() => updateTraveller(index, "gender", "Female")}
                  className={`h-[44px] rounded-lg border text-[13px] font-semibold ${
                    traveller.gender === "Female"
                      ? "border-sky-500 bg-sky-50 text-sky-700"
                      : "border-slate-300 text-slate-700"
                  }`}
                >
                  Female
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
