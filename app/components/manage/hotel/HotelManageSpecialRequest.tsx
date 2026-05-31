"use client";

import { PrimaryButton, SectionTitle } from "./HotelManageShared";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
};

export default function HotelManageSpecialRequest({
  value,
  onChange,
  onSave,
}: Props) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Special Request"
        subtitle="Add or update request notes for hotel operations."
      />

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        className="w-full min-w-0 resize-y rounded-2xl border border-black/10 bg-[#f8f9fb] px-4 py-3 text-sm font-semibold leading-6 text-[#111827] outline-none focus:border-[#ff6b00]"
        placeholder="Example: Early check-in, high floor room, anniversary decoration..."
      />

      <PrimaryButton label="Save Special Request" onClick={onSave} />
    </div>
  );
}
