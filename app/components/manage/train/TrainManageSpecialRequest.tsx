"use client";

import {
  PrimaryButton,
  SectionTitle,
} from "./TrainManageShared";

type Props = {
  value: string;

  onChange: (
    value: string
  ) => void;

  onSave: () => void;
};

export default function TrainManageSpecialRequest({
  value,
  onChange,
  onSave,
}: Props) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Special Request"
        subtitle="Add special request notes for your train journey."
      />

      <div className="min-w-0 rounded-[20px] border border-black/5 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)] md:rounded-[24px] md:p-5">
        <textarea
          value={value}
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
          rows={7}
          placeholder="Example: Lower berth request, senior citizen assistance, meal request..."
          className="w-full min-w-0 resize-y rounded-2xl border border-black/10 bg-[#f8fafc] px-4 py-4 text-sm font-semibold leading-6 text-[#111827] outline-none transition focus:border-[#ff6b00]"
        />
      </div>

      <PrimaryButton
        label="Save Special Request"
        onClick={onSave}
      />
    </div>
  );
}
