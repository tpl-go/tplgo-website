"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type TravellerItem = {
  id: string;
  title: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  type: "adult" | "child" | "infant";
};

interface ManageTravellerDetailsSectionProps {
  travellers: TravellerItem[];
  onChange: (next: TravellerItem[]) => void;
}

export default function ManageTravellerDetailsSection({
  travellers,
  onChange,
}: ManageTravellerDetailsSectionProps) {
  const [activeTravellerId, setActiveTravellerId] = useState<string>(
    travellers[0]?.id ?? ""
  );
  const [dirtyTravellerIds, setDirtyTravellerIds] = useState<string[]>([]);
  const [savedMessage, setSavedMessage] = useState("");
  const [originalTravellers, setOriginalTravellers] =
    useState<TravellerItem[]>(travellers);

  const activeTraveller = useMemo(() => {
    return travellers.find((item) => item.id === activeTravellerId) ?? null;
  }, [activeTravellerId, travellers]);

  const hasUnsavedChanges = activeTraveller
    ? dirtyTravellerIds.includes(activeTraveller.id)
    : false;

  const handleFieldChange = (
    travellerId: string,
    field: keyof TravellerItem,
    value: string
  ) => {
    const next = travellers.map((traveller) =>
      traveller.id === travellerId
        ? {
            ...traveller,
            [field]: value,
          }
        : traveller
    );

    if (!dirtyTravellerIds.includes(travellerId)) {
      setDirtyTravellerIds((prev) => [...prev, travellerId]);
    }

    setSavedMessage("");
    onChange(next);
  };

  const handleSaveTraveller = () => {
    if (!activeTraveller) return;

    setOriginalTravellers(travellers);

    setDirtyTravellerIds((prev) =>
      prev.filter((id) => id !== activeTraveller.id)
    );

    setSavedMessage(
      `${activeTraveller.firstName} ${activeTraveller.lastName} details updated.`
    );

    setTimeout(() => {
      setSavedMessage("");
    }, 2600);
  };

  const handleCancelTraveller = () => {
    if (!activeTraveller) return;

    const originalTraveller = originalTravellers.find(
      (item) => item.id === activeTraveller.id
    );

    if (!originalTraveller) return;

    const next = travellers.map((traveller) =>
      traveller.id === activeTraveller.id ? originalTraveller : traveller
    );

    onChange(next);

    setDirtyTravellerIds((prev) =>
      prev.filter((id) => id !== activeTraveller.id)
    );

    setSavedMessage("");
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff6b00]">
              Traveller Details
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#111827] md:text-2xl">
              Update traveller profile details
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
              Update name, title and traveller type. Saved changes will reflect
              in the booking record.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#64748b]">
              Edit Status
            </p>
            <p
              className={cn(
                "mt-1 text-sm font-extrabold",
                dirtyTravellerIds.length > 0 ? "text-[#ff6b00]" : "text-green-700"
              )}
            >
              {dirtyTravellerIds.length > 0
                ? `${dirtyTravellerIds.length} traveller pending save`
                : "All changes saved"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="rounded-[28px] border border-black/5 bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
          <div className="border-b border-black/5 px-1 pb-4">
            <h3 className="text-base font-bold text-[#111827]">Travellers</h3>
            <p className="mt-1 text-sm text-[#6b7280]">
              Select a traveller to edit profile details.
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {travellers.map((traveller, index) => {
              const isActive = traveller.id === activeTravellerId;
              const isDirty = dirtyTravellerIds.includes(traveller.id);

              return (
                <button
                  key={traveller.id}
                  type="button"
                  onClick={() => setActiveTravellerId(traveller.id)}
                  className={cn(
                    "w-full rounded-[22px] border px-4 py-4 text-left transition-all duration-200",
                    isActive
                      ? "border-[#ff6b00]/30 bg-[#fff7f2] shadow-[0_8px_22px_rgba(255,107,0,0.08)]"
                      : "border-black/5 bg-[#f8f9fb] hover:bg-[#f3f4f6]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">
                        {traveller.title} {traveller.firstName}{" "}
                        {traveller.middleName ? `${traveller.middleName} ` : ""}
                        {traveller.lastName}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#6b7280]">
                        Traveller {index + 1} • {traveller.type}
                      </p>
                    </div>

                    {isDirty ? (
                      <span className="rounded-full bg-[#ff6b00] px-2.5 py-1 text-[10px] font-bold text-white">
                        Edited
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700">
                        Saved
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] lg:p-6">
          {activeTraveller ? (
            <>
              <div className="flex flex-col gap-4 border-b border-[#eef2f7] pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff6b00]">
                    Active Traveller
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-[#111827]">
                    {activeTraveller.title} {activeTraveller.firstName}{" "}
                    {activeTraveller.middleName
                      ? `${activeTraveller.middleName} `
                      : ""}
                    {activeTraveller.lastName}
                  </h3>
                  <p className="mt-1 text-sm text-[#6b7280]">
                    Update details and click save to confirm changes.
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

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <SelectBlock
                  label="Title"
                  value={activeTraveller.title}
                  onChange={(value) =>
                    handleFieldChange(activeTraveller.id, "title", value)
                  }
                  options={["Mr", "Mrs", "Ms", "Master", "Dr"]}
                />

                <SelectBlock
                  label="Traveller Type"
                  value={activeTraveller.type}
                  onChange={(value) =>
                    handleFieldChange(activeTraveller.id, "type", value)
                  }
                  options={["adult", "child", "infant"]}
                />

                <FieldBlock
                  label="First Name"
                  value={activeTraveller.firstName}
                  onChange={(value) =>
                    handleFieldChange(activeTraveller.id, "firstName", value)
                  }
                  placeholder="First name"
                />

                <FieldBlock
                  label="Middle Name"
                  value={activeTraveller.middleName || ""}
                  onChange={(value) =>
                    handleFieldChange(activeTraveller.id, "middleName", value)
                  }
                  placeholder="Middle name optional"
                />

                <FieldBlock
                  label="Last Name"
                  value={activeTraveller.lastName}
                  onChange={(value) =>
                    handleFieldChange(activeTraveller.id, "lastName", value)
                  }
                  placeholder="Last name"
                />
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_auto]">
                <div className="rounded-[22px] border border-[#e5e7eb] bg-[#f8fafc] px-4 py-4">
                  <p className="text-sm font-semibold text-[#111827]">
                    Updated Preview
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#475569]">
                    {activeTraveller.title} {activeTraveller.firstName}{" "}
                    {activeTraveller.middleName
                      ? `${activeTraveller.middleName} `
                      : ""}
                    {activeTraveller.lastName} • {activeTraveller.type}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCancelTraveller}
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
                  onClick={handleSaveTraveller}
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
            </>
          ) : (
            <div className="text-sm text-[#6b7280]">No traveller selected.</div>
          )}
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
        {label}
      </p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-[18px] border border-black/10 bg-white px-4 text-sm font-semibold text-[#111827] outline-none transition focus:border-[#ff6b00]/40 focus:bg-[#fffdfb]"
      />
    </label>
  );
}

function SelectBlock({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: any) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
        {label}
      </p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-[18px] border border-black/10 bg-white px-4 text-sm font-semibold text-[#111827] outline-none transition focus:border-[#ff6b00]/40 focus:bg-[#fffdfb]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </option>
        ))}
      </select>
    </label>
  );
}