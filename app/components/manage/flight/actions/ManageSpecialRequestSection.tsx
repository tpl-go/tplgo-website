"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ManageSpecialRequestSectionProps {
  value: string;
  onChange: (next: string) => void;
}

export default function ManageSpecialRequestSection({
  value,
  onChange,
}: ManageSpecialRequestSectionProps) {
  const [originalRequest, setOriginalRequest] = useState(value);
  const [savedMessage, setSavedMessage] = useState("");

  const hasUnsavedChanges = value !== originalRequest;
  const characterCount = value?.length || 0;

  const handleSave = () => {
    setOriginalRequest(value);
    setSavedMessage("Special request updated successfully.");

    setTimeout(() => {
      setSavedMessage("");
    }, 2600);
  };

  const handleCancel = () => {
    onChange(originalRequest);
    setSavedMessage("");
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff6b00]">
              Special Request
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#111827] md:text-2xl">
              Update special request notes
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
              Add support notes, traveller preferences or service instructions.
              Saved changes will reflect in the booking record.
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
              {hasUnsavedChanges ? "Request pending save" : "All changes saved"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] lg:p-6">
        <div className="flex flex-col gap-4 border-b border-[#eef2f7] pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff6b00]">
              Active Request
            </p>
            <h3 className="mt-1 text-lg font-bold text-[#111827]">
              Booking support note
            </h3>
            <p className="mt-1 text-sm text-[#6b7280]">
              Update request details and click save to confirm changes.
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
            {hasUnsavedChanges ? "Unsaved Changes" : "Saved"}
          </span>
        </div>

        {savedMessage ? (
          <div className="mt-5 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            ✅ {savedMessage}
          </div>
        ) : null}

        <label className="mt-5 block">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
              Request Note
            </p>
            <p className="text-[11px] font-bold text-[#94a3b8]">
              {characterCount}/500
            </p>
          </div>

          <textarea
            value={value}
            onChange={(e) => {
              setSavedMessage("");
              onChange(e.target.value.slice(0, 500));
            }}
            placeholder="Add traveller preference, support note, wheelchair request, meal preference note, etc."
            rows={7}
            className="w-full resize-none rounded-[18px] border border-black/10 bg-white px-4 py-3 text-sm font-semibold leading-6 text-[#111827] outline-none transition focus:border-[#ff6b00]/40 focus:bg-[#fffdfb]"
          />
        </label>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_auto]">
          <div className="rounded-[22px] border border-[#e5e7eb] bg-[#f8fafc] px-4 py-4">
            <p className="text-sm font-semibold text-[#111827]">
              Updated Preview
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-6 text-[#475569]">
              {value?.trim() || "No special request added yet."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            disabled={!hasUnsavedChanges}
            className={cn(
              "h-[54px] rounded-full border px-8 text-sm font-black transition",
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
              "h-[54px] rounded-full px-8 text-sm font-black transition",
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