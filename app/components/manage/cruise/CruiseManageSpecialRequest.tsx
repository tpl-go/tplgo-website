"use client";

import {
  PrimaryButton,
  SectionTitle,
} from "./CruiseManageShared";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
};

export default function CruiseManageSpecialRequest({
  value,
  onChange,
  onSave,
}: Props) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Special Request"
        subtitle="Add or update request notes for cruise operations."
      />

      <div className="rounded-[24px] border border-black/5 bg-[#f8f9fb] p-5">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-4 text-sm font-semibold text-[#111827] outline-none transition focus:border-[#ff6b00]"
          placeholder="Example: Anniversary setup, dining preference, cabin location preference, wheelchair assistance..."
        />

        <div className="mt-4 rounded-2xl bg-[#fff7f2] px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff6b00]">
            Important
          </p>
          <p className="mt-2 text-sm leading-6 text-[#6b7280]">
            Cruise special requests are subject to cruise line approval and cabin/category availability.
          </p>
        </div>
      </div>

      <PrimaryButton
        label="Save Special Request"
        onClick={onSave}
      />
    </div>
  );
}