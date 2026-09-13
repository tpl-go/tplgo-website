"use client";

import React, { useEffect, useState } from "react";
import { UserSignInDetails } from "../../UserAccountTrust";
import { useBasicAccount, AccountReadState, AccountDataError, SavedBasicReview } from "../../BasicAccountData";
import { profileForm, profileInput } from "@/app/lib/account/basicAccount";
import type { FrequentFlyerEntry, ProfileFormData } from "@/app/lib/account/profileStorage";
import { countryMaster } from "@/app/lib/partner/countryMaster";

const airlineOptions = [
  "Air India",
  "IndiGo",
  "Akasa Air",
  "SpiceJet",
  "Emirates",
  "Qatar Airways",
  "Singapore Airlines",
];

export default function MyProfileSection() {
  const { profile } = useBasicAccount();
  const [formData, setFormData] = useState<ProfileFormData>(() => profileForm(null));
  const [version, setVersion] = useState<number | null>(null);
  const [savedMessage, setSavedMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [latest, setLatest] = useState<ProfileFormData | null>(null);
  useEffect(() => {
    if (profile.status === "ready" && version === null) { setFormData(profileForm(profile.rows[0] ?? null)); setVersion(profile.rows[0]?.version ?? 0); }
  }, [profile.status, profile.rows, version]);

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

  const handleSave = async () => {
    if (saving || version === null || conflict) return;
    setSaving(true); setSavedMessage("");
    try { const row = await profile.save("PUT", profileInput(formData, version)); setVersion(row.version); setSavedMessage("Basic profile details saved to your account."); setLatest(null); }
    catch (error) { if (error instanceof AccountDataError && error.code === "USER_VERSION_CONFLICT") setConflict(true); setSavedMessage(error instanceof Error ? error.message : "Save failed. Your edits are still here."); }
    finally { setSaving(false); }
  };
  const reviewLatest = async () => {
    try { const rows = await profile.reload(); setLatest(profileForm(rows[0] ?? null)); setVersion(rows[0]?.version ?? 0); setConflict(false); setSavedMessage("Review the latest saved values below against your unchanged edits before saving."); }
    catch { setSavedMessage("Latest details could not be loaded. Your edits remain; retry review."); }
  };
  if (version === null) return <AccountReadState resource={profile} />;

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
        <div>
          <h1 className="text-[18px] font-semibold text-slate-900">
            My Profile
          </h1>
          {savedMessage ? (
            <p className="mt-1 text-[12px] text-slate-700">{savedMessage}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleSave} disabled={saving || conflict}
          className="h-10 rounded-xl bg-[#0b5fff] px-5 text-[12px] font-semibold tracking-wide text-white transition hover:bg-[#094ee0]"
        >
          {saving ? "SAVING..." : "SAVE BASIC DETAILS"}
        </button>
      </div>

      <fieldset disabled={saving} className="min-w-0 space-y-8 px-6 py-6">
        {conflict && <button onClick={reviewLatest} className="underline">Review latest saved details</button>}
        {latest && <SavedBasicReview details={latest} />}
        <p className="text-xs text-slate-600">Save basic personal details only. Browser records are preserved; re-enter details you want to save. Login methods and Partner contacts stay separate.</p>
        <UserSignInDetails />

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

            <InputField
              label="NATIONALITY"
              value={formData.nationality}
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

            <InputField label="COUNTRY CODE (OPTIONAL, E.G. IN)" value={formData.country} onChange={e => updateField("country", e.target.value.toUpperCase())} maxLength={2} list="personal-countries" />
            <datalist id="personal-countries">{countryMaster.map(c => <option key={c.countryCode} value={c.countryCode}>{c.displayName}</option>)}</datalist>
            <InputField label="STATE / REGION (OPTIONAL)" value={formData.state} onChange={e => updateField("state", e.target.value)} />
            <InputField label="CITY (OPTIONAL)" value={formData.city} onChange={e => updateField("city", e.target.value)} />
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-slate-900">
            Contact Details
          </h2>
          <p className="mt-1 text-[12px] text-slate-500">
            Optional personal contacts are saved to your account. Include + and the international country code. These contacts do not add or verify login methods.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="MOBILE NUMBER"
              value={formData.mobile}
              onChange={(e) => updateField("mobile", e.target.value)}
            />
            <InputField
              label="PROFILE EMAIL (NOT VERIFIED FOR SIGN-IN)"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="name@example.com"
            />
          </div>
        </section>

        <section><h2 className="text-[15px] font-semibold text-slate-900">Document Details</h2><p className="mt-2 text-xs text-slate-600">Passport, PAN and photo editing are unavailable until protected storage is ready. Basic saves do not upload or change existing document or photo values.</p></section>

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
      </fieldset>
    </div>
  );
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
