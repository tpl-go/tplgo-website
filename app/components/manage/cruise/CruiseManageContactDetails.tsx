"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type CruiseManageContact = {
  countryCode?: string;
  mobile: string;
  email: string;
};

interface Props {
  contact: CruiseManageContact;
  onChange: (next: CruiseManageContact) => void;
  onSave: () => void;
}

export default function CruiseManageContactDetails({
  contact,
  onChange,
  onSave,
}: Props) {
  const [savedMessage, setSavedMessage] = useState("");

  const hasValidData =
    Boolean(contact?.mobile?.trim()) || Boolean(contact?.email?.trim());

  const handleSave = () => {
    onSave();

    setSavedMessage("Contact details updated successfully.");

    setTimeout(() => {
      setSavedMessage("");
    }, 2600);
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
              Update cruise contact details
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
              Saved changes will reflect across cruise booking,
              voucher and future communication.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#64748b]">
              Booking Contact
            </p>

            <p className="mt-1 text-sm font-extrabold text-green-700">
              Active & Editable
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] lg:p-6">
        <div className="flex flex-col gap-4 border-b border-[#eef2f7] pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff6b00]">
              Cruise Contact
            </p>

            <h3 className="mt-1 text-lg font-bold text-[#111827]">
              Traveller communication details
            </h3>

            <p className="mt-1 text-sm text-[#6b7280]">
              Update mobile number and email address.
            </p>
          </div>

          <span
            className={cn(
              "rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em]",
              hasValidData
                ? "bg-green-50 text-green-700"
                : "bg-[#fff7f2] text-[#ff6b00]"
            )}
          >
            {hasValidData ? "Ready to Save" : "Incomplete"}
          </span>
        </div>

        {savedMessage ? (
          <div className="mt-5 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            ✅ {savedMessage}
          </div>
        ) : null}

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <FieldBlock
            label="Email Address"
            value={contact.email}
            onChange={(next) =>
              onChange({
                ...contact,
                email: next,
              })
            }
            placeholder="Enter email address"
            type="email"
          />

          <FieldBlock
            label="Mobile Number"
            value={contact.mobile}
            onChange={(next) =>
              onChange({
                ...contact,
                mobile: next,
              })
            }
            placeholder="Enter mobile number"
            type="tel"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <PreviewCard
            label="Updated Email"
            value={contact.email || "Not available"}
          />

          <PreviewCard
            label="Updated Mobile"
            value={contact.mobile || "Not available"}
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="mt-6 h-[54px] w-full rounded-full bg-[#ff6b00] px-8 text-sm font-black text-white shadow-[0_12px_24px_rgba(255,107,0,0.22)] transition hover:bg-[#f06400] md:w-auto"
        >
          Save Contact Details
        </button>
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

function PreviewCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
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
