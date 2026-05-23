"use client";

import { useEffect } from "react";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import { getSavedProfile } from "@/app/lib/account/profileStorage";

type Props = {
  values: {
    pickupLocation: string;
    fullName: string;
    gender: string;
    mobile: string;
    email: string;
    usePickupAsBillingAddress: boolean;
  };
  errors: Record<string, string>;
  onChange: (field: string, value: string | boolean) => void;
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
  if (!user?.mobile) return "";

  const sessionName = String(user?.fullName || "").trim();
  if (sessionName) return sessionName;

  const profile = getSavedProfile(user.mobile);
  const profileName = `${profile.firstName || ""} ${
    profile.lastName || ""
  }`.trim();

  if (profileName && profileName.toLowerCase() !== "pk") return profileName;

  return `User ${String(user.mobile).slice(-4)}`;
}

export default function CabBookingTravellerForm({
  values,
  errors,
  onChange,
}: Props) {
  useEffect(() => {
    const syncUser = () => {
      const user = getActiveUser();
      if (!user?.mobile) return;

      const profile = getSavedProfile(user.mobile);

      if (!values.fullName) {
        const displayName = getDisplayNameFromUser(user);
        if (displayName) onChange("fullName", displayName);
      }

      if (!values.mobile) {
        onChange(
          "mobile",
          String(user.mobile || "").replace(/\D/g, "").slice(0, 10)
        );
      }

      if (!values.email) {
        onChange("email", user.email || profile.email || "");
      }
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

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 text-[13px] font-semibold text-slate-700">
          Pickup Details
        </div>
        <input
          value={values.pickupLocation}
          onChange={(e) => onChange("pickupLocation", e.target.value)}
          placeholder="Enter pickup location"
          className="h-[50px] w-full rounded-xl border border-slate-300 px-4 text-[14px] outline-none"
        />
        {errors.pickupLocation ? (
          <div className="mt-1 text-[12px] font-medium text-red-500">
            {errors.pickupLocation}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InputField
          label="Full Name"
          value={values.fullName}
          onChange={(value) => onChange("fullName", value)}
          error={errors.fullName}
        />

        <div>
          <div className="mb-2 text-[13px] font-semibold text-slate-700">
            Gender
          </div>
          <select
            value={values.gender}
            onChange={(e) => onChange("gender", e.target.value)}
            className="h-[50px] w-full rounded-xl border border-slate-300 px-4 text-[14px] outline-none"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender ? (
            <div className="mt-1 text-[12px] font-medium text-red-500">
              {errors.gender}
            </div>
          ) : null}
        </div>

        <InputField
          label="Mobile No."
          value={values.mobile}
          onChange={(value) =>
            onChange("mobile", value.replace(/\D/g, "").slice(0, 10))
          }
          error={errors.mobile}
        />

        <InputField
          label="Email ID"
          value={values.email}
          onChange={(value) => onChange("email", value)}
          error={errors.email}
        />
      </div>

      <label className="flex items-center gap-3 text-[14px] text-slate-700">
        <input
          type="checkbox"
          checked={values.usePickupAsBillingAddress}
          onChange={(e) =>
            onChange("usePickupAsBillingAddress", e.target.checked)
          }
        />
        Use pickup location as billing address
      </label>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <div className="mb-2 text-[13px] font-semibold text-slate-700">
        {label}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[50px] w-full rounded-xl border border-slate-300 px-4 text-[14px] outline-none"
      />
      {error ? (
        <div className="mt-1 text-[12px] font-medium text-red-500">{error}</div>
      ) : null}
    </div>
  );
}