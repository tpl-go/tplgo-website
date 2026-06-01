"use client";

import { useEffect } from "react";
import type { TrainContactDetails } from "@/app/lib/train/trainBookingTypes";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import { getSavedProfile } from "@/app/lib/account/profileStorage";

type Props = {
  contactDetails: TrainContactDetails;
  onChange: (next: TrainContactDetails) => void;
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

export default function TrainContactDetailsSection({
  contactDetails,
  onChange,
}: Props) {
  useEffect(() => {
    const syncUser = () => {
      const user = getActiveUser();
      if (!user?.mobile) return;

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
      window.removeEventListener(AUTH_UPDATED_EVENT, syncUser);
      window.removeEventListener("storage", syncUser);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateField(key: keyof TrainContactDetails, value: string) {
    onChange({
      ...contactDetails,
      [key]: value,
    });
  }

  return (
    <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-4 md:px-5">
        <div className="text-[19px] font-extrabold text-slate-900 md:text-[20px]">
          Contact Details
        </div>
        <div className="mt-1 text-[13px] text-slate-500">
          Booking updates and important journey communication will be sent here.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 px-4 py-4 md:grid-cols-2 md:px-5 md:py-5">
        <label className="block">
          <div className="mb-2 text-[13px] font-bold text-slate-700">
            Mobile Number
          </div>
          <input
            type="tel"
            value={contactDetails.mobile}
            onChange={(e) =>
              updateField(
                "mobile",
                e.target.value.replace(/\D/g, "").slice(0, 10)
              )
            }
            placeholder="Enter 10 digit mobile number"
            className="h-[46px] w-full rounded-xl border border-slate-300 bg-white px-3 text-[14px] font-medium text-slate-900 outline-none"
          />
        </label>

        <label className="block">
          <div className="mb-2 text-[13px] font-bold text-slate-700">
            Email Address
          </div>
          <input
            type="email"
            value={contactDetails.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="Enter email address"
            className="h-[46px] w-full rounded-xl border border-slate-300 bg-white px-3 text-[14px] font-medium text-slate-900 outline-none"
          />
        </label>
      </div>
    </section>
  );
}
