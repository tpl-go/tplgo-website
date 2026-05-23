"use client";

import { useEffect } from "react";
import type { BusContactDetails } from "@/app/lib/bus/busBookingTypes";
import { BUS_STATES } from "@/app/lib/bus/busBookingHelpers";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import { getSavedProfile } from "@/app/lib/account/profileStorage";

type Props = {
  contactDetails: BusContactDetails;
  onChange: (contactDetails: BusContactDetails) => void;
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

export default function BusContactDetailsSection({
  contactDetails,
  onChange,
}: Props) {
  useEffect(() => {
  let mounted = true;

  const syncUser = () => {
    const user = getActiveUser();
    if (!user?.mobile || !mounted) return;

    const profile = getSavedProfile(user.mobile);

    const nextMobile = String(user.mobile || "")
      .replace(/\D/g, "")
      .slice(0, 10);

    const nextEmail = user.email || profile.email || "";

    const shouldUpdateMobile = !contactDetails.mobile && nextMobile;
    const shouldUpdateEmail = !contactDetails.email && nextEmail;

    if (!shouldUpdateMobile && !shouldUpdateEmail) return;

    onChange({
      ...contactDetails,
      mobile: shouldUpdateMobile ? nextMobile : contactDetails.mobile,
      email: shouldUpdateEmail ? nextEmail : contactDetails.email,
    });
  };

  syncUser();

  window.addEventListener(AUTH_UPDATED_EVENT, syncUser);
  window.addEventListener("storage", syncUser);

  return () => {
    mounted = false;
    window.removeEventListener(AUTH_UPDATED_EVENT, syncUser);
    window.removeEventListener("storage", syncUser);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  function update<K extends keyof BusContactDetails>(
    key: K,
    value: BusContactDetails[K]
  ) {
    onChange({
      ...contactDetails,
      [key]: value,
    });
  }

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <h2 className="text-[18px] font-extrabold text-slate-900">
            Contact Details
          </h2>
          <span className="text-[13px] text-slate-500">
            We’ll send your ticket here
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-[12px] font-semibold text-slate-700">
              Email Id*
            </label>
            <input
              value={contactDetails.email}
              onChange={(e) => update("email", e.target.value)}
              className="h-[46px] w-full rounded-lg border border-slate-300 px-3 text-[13px] outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-[12px] font-semibold text-slate-700">
              Mobile Number*
            </label>
            <input
              value={contactDetails.mobile}
              onChange={(e) =>
                update("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              placeholder="Type here"
              className="h-[46px] w-full rounded-lg border border-slate-300 px-3 text-[13px] outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="mt-5 border-t border-slate-200 pt-4">
          <label className="flex items-center gap-3 text-[14px] text-slate-700">
            <input
              type="checkbox"
              checked={contactDetails.hasGst}
              onChange={(e) => update("hasGst", e.target.checked)}
            />
            <span>Enter GST details (optional)</span>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <h2 className="text-[17px] font-extrabold text-slate-900">
            Your pincode and state
          </h2>
          <span className="text-[12px] text-slate-500">
            (Required for GST purpose on your tax invoice)
          </span>
        </div>

        <div className="mt-4 max-w-[380px]">
          <label className="mb-2 block text-[12px] font-semibold text-slate-700">
            Select the State
          </label>

          <select
            value={contactDetails.state}
            onChange={(e) => update("state", e.target.value)}
            className="h-[46px] w-full rounded-lg border border-slate-300 px-3 text-[13px] outline-none focus:border-sky-500"
          >
            {BUS_STATES.map((state) => (
              <option key={state}>{state}</option>
            ))}
          </select>
        </div>

        <label className="mt-4 flex items-center gap-3 text-[14px] text-slate-700">
          <input
            type="checkbox"
            checked={contactDetails.saveBilling}
            onChange={(e) => update("saveBilling", e.target.checked)}
          />
          <span>Confirm and save billing details to your profile</span>
        </label>
      </section>
    </>
  );
}