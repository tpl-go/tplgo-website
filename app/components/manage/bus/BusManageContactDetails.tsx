"use client";

import { useState } from "react";

type BusManageContact = {
  countryCode?: string;
  mobile: string;
  email: string;
};

type Props = {
  contact: BusManageContact;
  onChange: (contact: BusManageContact) => void;
  onSave: () => void;
};

export default function BusManageContactDetails({
  contact,
  onChange,
  onSave,
}: Props) {
  const [savedMessage, setSavedMessage] = useState("");

  const handleSave = () => {
    onSave();

    setSavedMessage("Contact details updated successfully.");

    setTimeout(() => {
      setSavedMessage("");
    }, 2600);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[24px] border border-black/5 bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.04)] sm:p-5 lg:rounded-[28px] lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff6b00]">
              Contact Details
            </p>

            <h2 className="mt-1 break-words text-xl font-bold text-[#111827] md:text-2xl">
              Update booking contact details
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
              Update mobile number and email address used for bus ticket communication.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#64748b]">
              Status
            </p>

            <p className="mt-1 text-sm font-extrabold text-green-700">
              Editable
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-black/5 bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.04)] sm:p-5 lg:rounded-[28px] lg:p-6">
        {savedMessage ? (
          <div className="mb-5 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            ✅ {savedMessage}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FieldBlock
            label="Email Address"
            value={contact.email}
            onChange={(value) =>
              onChange({
                ...contact,
                email: value,
              })
            }
            placeholder="Enter email address"
            type="email"
          />

          <FieldBlock
            label="Mobile Number"
            value={contact.mobile}
            onChange={(value) =>
              onChange({
                ...contact,
                mobile: value,
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
            label="Updated Phone"
            value={contact.mobile || "Not available"}
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="mt-6 h-[54px] w-full rounded-full bg-[#ff6b00] px-8 text-sm font-black text-white shadow-[0_12px_24px_rgba(255,107,0,0.22)] transition hover:bg-[#f06400] sm:w-auto"
        >
          Save Changes
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

export type { BusManageContact };
