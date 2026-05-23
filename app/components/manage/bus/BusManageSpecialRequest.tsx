"use client";

import { PrimaryButton, SectionTitle } from "./BusManageShared";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
};

export default function BusManageSpecialRequest({
  value,
  onChange,
  onSave,
}: Props) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Special Request"
        subtitle="Add or update request notes for bus travel."
      />

      <div className="rounded-[24px] border border-black/5 bg-[#f8f9fb] p-5">
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#e5e7eb] bg-white px-4 py-4">
            <p className="text-sm font-bold text-[#111827]">
              Request Notes
            </p>

            <p className="mt-1 text-sm leading-6 text-[#6b7280]">
              Add special notes like preferred boarding assistance, luggage notes,
              lower berth preference or operator instructions.
            </p>
          </div>

          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={6}
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-4 text-sm font-semibold text-[#111827] outline-none transition focus:border-[#ff6b00]"
            placeholder="Example: Lower berth preferred, extra luggage assistance required, boarding delay possibility..."
          />

          <div className="rounded-2xl bg-[#fff7f2] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff6b00]">
              Important
            </p>

            <p className="mt-2 text-sm leading-6 text-[#6b7280]">
              Special requests are subject to operator approval and seat availability.
            </p>
          </div>
        </div>
      </div>

      <PrimaryButton
        label="Save Special Request"
        onClick={onSave}
      />
    </div>
  );
}