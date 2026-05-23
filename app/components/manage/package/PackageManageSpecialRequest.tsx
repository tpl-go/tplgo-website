"use client";

import { PrimaryButton, SectionTitle } from "./PackageManageShared";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
};

export default function PackageManageSpecialRequest({
  value,
  onChange,
  onSave,
}: Props) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Special Request"
        subtitle="Add or update request notes for your package booking."
      />

      <div className="rounded-[24px] border border-black/5 bg-white p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
          Request Notes
        </p>

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          className="mt-3 w-full rounded-2xl border border-black/10 bg-[#f8f9fb] px-4 py-3 text-sm font-semibold text-[#111827] outline-none focus:border-[#ff6b00]"
          placeholder="Example: Special meal preference, room preference, celebration request, pickup note..."
        />

        <p className="mt-2 text-xs text-[#6b7280]">
          These requests will be shared with service providers where applicable.
        </p>
      </div>

      <PrimaryButton label="Save Special Request" onClick={onSave} />
    </div>
  );
}