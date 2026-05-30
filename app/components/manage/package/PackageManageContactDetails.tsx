"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type PackageManageContact = {
  countryCode?: string;
  mobile: string;
  email: string;
};

type Props = {
  contact: PackageManageContact;
  onChange: (next: PackageManageContact) => void;
  onSave: () => void;
};

export default function PackageManageContactDetails({
  contact,
  onChange,
  onSave,
}: Props) {
  const [original, setOriginal] = useState<PackageManageContact>(contact);
  const [savedMessage, setSavedMessage] = useState("");

  const hasUnsavedChanges =
    contact.email !== original.email ||
    contact.mobile !== original.mobile;

  const handleSave = () => {
    setOriginal(contact);
    setSavedMessage("Contact details updated successfully.");
    onSave();

    setTimeout(() => {
      setSavedMessage("");
    }, 2500);
  };

  const handleCancel = () => {
    onChange(original);
    setSavedMessage("");
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff6b00]">
              Contact Details
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#111827] md:text-2xl">
              Update booking contact details
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
              Update email address and mobile number. Changes will reflect across booking, ticket and communication layers.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#64748b]">
              Edit Status
            </p>
            <p
              className={cn(
                "mt-1 text-sm font-extrabold",
                hasUnsavedChanges ? "text-[#ff6b00]" : "text-green-700"
              )}
            >
              {hasUnsavedChanges ? "Pending changes" : "All changes saved"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] lg:p-6">
        <div className="flex flex-col gap-4 border-b border-[#eef2f7] pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff6b00]">
              Active Contact
            </p>
            <h3 className="mt-1 text-lg font-bold text-[#111827]">
              Booking communication details
            </h3>
            <p className="mt-1 text-sm text-[#6b7280]">
              Update and save to confirm.
            </p>
          </div>

          <span
            className={cn(
              "rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em]",
              hasUnsavedChanges
                ? "bg-[#fff7f2] text-[#ff6b00]"
                : "bg-green-50 text-green-700"
            )}
          >
            {hasUnsavedChanges ? "Unsaved" : "Saved"}
          </span>
        </div>

        {savedMessage && (
          <div className="mt-5 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            ✅ {savedMessage}
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <FieldBlock
            label="Email Address"
            value={contact.email}
            onChange={(value) => {
              setSavedMessage("");
              onChange({ ...contact, email: value });
            }}
            placeholder="Enter email"
            type="email"
          />

          <FieldBlock
            label="Mobile Number"
            value={contact.mobile}
            onChange={(value) => {
              setSavedMessage("");
              onChange({ ...contact, mobile: value });
            }}
            placeholder="Enter mobile number"
            type="tel"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_auto]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PreviewCard label="Updated Email" value={contact.email || "-"} />
            <PreviewCard label="Updated Phone" value={contact.mobile || "-"} />
          </div>

          <button
            type="button"
            onClick={handleCancel}
            disabled={!hasUnsavedChanges}
            className={cn(
              "h-[54px] w-full rounded-full border px-8 text-sm font-black transition lg:w-auto",
              hasUnsavedChanges
                ? "border-[#fecaca] bg-white text-[#dc2626] hover:bg-[#fff1f2]"
                : "cursor-not-allowed border-[#e5e7eb] bg-[#f8fafc] text-[#94a3b8]"
            )}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className={cn(
              "h-[54px] w-full rounded-full px-8 text-sm font-black transition lg:w-auto",
              hasUnsavedChanges
                ? "bg-[#ff6b00] text-white shadow-[0_12px_24px_rgba(255,107,0,0.22)] hover:bg-[#f06400]"
                : "cursor-not-allowed bg-[#e5e7eb] text-[#94a3b8]"
            )}
          >
            {hasUnsavedChanges ? "Save Changes" : "Saved"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldBlock({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
        {label}
      </p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-[18px] border border-black/10 bg-white px-4 text-sm font-semibold text-[#111827] outline-none transition focus:border-[#ff6b00]/40 focus:bg-[#fffdfb]"
      />
    </label>
  );
}

function PreviewCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[#e5e7eb] bg-[#f8fafc] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-bold text-[#111827]">
        {value}
      </p>
    </div>
  );
}
