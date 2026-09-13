"use client";

import React, { useState } from "react";
import type { FrequentFlyerEntry } from "@/app/lib/account/profileStorage";
import { travellerForm as toForm, travellerInput, type TravellerForm } from "@/app/lib/account/basicAccount";
import { useBasicAccount, AccountReadState, AccountDataError, SavedBasicReview } from "../../BasicAccountData";

const airlineOptions = [
  "Air India",
  "IndiGo",
  "Akasa Air",
  "SpiceJet",
  "Emirates",
  "Qatar Airways",
  "Singapore Airlines",
];

const relationOptions = [
  "Spouse",
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Son",
  "Daughter",
  "Friend",
  "Other",
];

const emptyCoTraveller = () => toForm();
export default function CoTravellerSection() {
  const { travellers } = useBasicAccount();
  const profileData = { coTravellers: travellers.rows.map(toForm) };
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTravellerId, setEditingTravellerId] = useState<string | null>(null);
  const [travellerForm, setTravellerForm] = useState<TravellerForm>(emptyCoTraveller);
  const [operation, setOperation] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [conflict, setConflict] = useState(false);
  const [latest, setLatest] = useState<TravellerForm | null>(null);
  const openNewForm = () => {
    setOperation(crypto.randomUUID()); setMessage(""); setConflict(false); setLatest(null);
    setEditingTravellerId(null);
    setTravellerForm(emptyCoTraveller());
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTravellerId(null);
    setTravellerForm(emptyCoTraveller());
  };

  const updateTravellerField = (
    key: keyof TravellerForm,
    value: string | number | FrequentFlyerEntry[]
  ) => {
    setTravellerForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const addFlyerRow = () => {
    setTravellerForm((prev) => ({
      ...prev,
      frequentFlyers: [
        ...prev.frequentFlyers,
        {
          id: Date.now(),
          airline: "",
          flyerNumber: "",
        },
      ],
    }));
  };

  const updateFlyerRow = (
    id: number,
    field: keyof FrequentFlyerEntry,
    value: string
  ) => {
    setTravellerForm((prev) => ({
      ...prev,
      frequentFlyers: prev.frequentFlyers.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      ),
    }));
  };

  const removeFlyerRow = (id: number) => {
    setTravellerForm((prev) => ({
      ...prev,
      frequentFlyers:
        prev.frequentFlyers.length === 1
          ? prev.frequentFlyers
          : prev.frequentFlyers.filter((row) => row.id !== id),
    }));
  };

  const handleSaveTraveller = async () => {
    if (saving || conflict) return;
    setSaving(true); setMessage("");
    try { await travellers.save(editingTravellerId ? "PUT" : "POST", travellerInput(travellerForm), editingTravellerId ?? undefined, operation); closeForm(); setMessage("Basic traveller details saved to your account."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Save failed. Your edits remain."); if (error instanceof AccountDataError && error.code === "USER_VERSION_CONFLICT") setConflict(true); }
    finally { setSaving(false); }
  };
  const reviewLatest = async () => {
    try { const rows = await travellers.reload(); const row = rows.find(r => r.id === editingTravellerId); if (!row) { setMessage("This traveller is no longer saved. Your edits remain below; cancel to return to the list."); return; } setLatest(toForm(row)); setMessage("Review the latest saved values against your unchanged edits before saving."); setTravellerForm(f => ({...f,version:row.version})); setConflict(false); }
    catch { setMessage("Latest details unavailable. Your edits remain; retry review."); }
  };
  const handleEditTraveller = (traveller: TravellerForm) => {
    setMessage(""); setConflict(false); setLatest(null);
    setEditingTravellerId(traveller.id);
    setTravellerForm({
      ...traveller,
      frequentFlyers:
        traveller.frequentFlyers.length > 0
          ? traveller.frequentFlyers
          : [
              {
                id: Date.now(),
                airline: "",
                flyerNumber: "",
              },
            ],
    });
    setIsFormOpen(true);
  };

  const handleDeleteTraveller = async (id: string) => {
    if (saving) return;
    const row = travellers.rows.find(r => r.id === id); if (!row) return;
    setSaving(true); setMessage("");
    try { await travellers.save("DELETE", {expectedVersion:row.version}, id); setMessage("Removed from saved travellers. Existing bookings are unchanged."); }
    catch { try { const current = await travellers.reload(); setMessage(current.some(r => r.id === id) ? "Removal was not confirmed. Review the saved details before retrying." : "This traveller is no longer in your saved list. Existing bookings are unchanged."); } catch { setMessage("Removal could not be confirmed. Retry loading the saved list."); } }
    finally { setSaving(false); }
  };
  if (travellers.status !== "ready" && !isFormOpen) return <AccountReadState resource={travellers} />;

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
        <h1 className="text-[18px] font-semibold text-slate-900">
          Co Traveller
        </h1>

        <button
          type="button"
          onClick={openNewForm} disabled={saving || isFormOpen}
          className="h-10 rounded-xl bg-[#0b5fff] px-5 text-[12px] font-semibold tracking-wide text-white transition hover:bg-[#094ee0]"
        >
          + ADD NEW
        </button>
      </div>

      <div className="space-y-6 px-6 py-6">
        <p role="status" className="text-sm">{message}</p>{conflict && <button onClick={reviewLatest} className="underline">Review latest saved details</button>}
        {latest && <SavedBasicReview details={latest} />}
        <p className="text-xs text-slate-600">Save reusable basic details only. One name is sufficient. Include + and the international phone code. Browser records are preserved and are not imported. Removing a saved traveller does not change bookings.</p>
        {isFormOpen && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-slate-900">
                {editingTravellerId ? "Edit Co Traveller" : "Add New Co Traveller"}
              </h2>

              <button
                type="button"
                onClick={closeForm} disabled={saving}
                className="text-[12px] font-medium text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>

            <fieldset disabled={saving} className="min-w-0 mt-6 space-y-8">
              <section>
                <h3 className="text-[15px] font-semibold text-slate-900">
                  General Information
                </h3>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputField
                    label="FIRST NAME"
                    value={travellerForm.firstName}
                    onChange={(e) =>
                      updateTravellerField("firstName", e.target.value)
                    }
                  />
                  <InputField
                    label="LAST NAME"
                    value={travellerForm.lastName}
                    onChange={(e) =>
                      updateTravellerField("lastName", e.target.value)
                    }
                  />

                  <SelectField
                    label="GENDER"
                    value={travellerForm.gender}
                    options={["Male", "Female", "Other"]}
                    onChange={(e) =>
                      updateTravellerField("gender", e.target.value)
                    }
                  />
                  <InputField
                    label="DATE OF BIRTH"
                    type="date"
                    value={travellerForm.dob}
                    onChange={(e) =>
                      updateTravellerField("dob", e.target.value)
                    }
                  />

                  <InputField
                    label="NATIONALITY"
                    value={travellerForm.nationality}
                    onChange={(e) =>
                      updateTravellerField("nationality", e.target.value)
                    }
                  />
                  <SelectField
                    label="RELATION"
                    value={travellerForm.relation}
                    options={relationOptions}
                    onChange={(e) =>
                      updateTravellerField("relation", e.target.value)
                    }
                  />
                </div>
              </section>

              <section>
                <h3 className="text-[15px] font-semibold text-slate-900">
                  Contact Details
                </h3>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputField
                    label="MOBILE NUMBER"
                    value={travellerForm.mobile}
                    onChange={(e) =>
                      updateTravellerField("mobile", e.target.value)
                    }
                  />
                  <InputField
                    label="EMAIL"
                    value={travellerForm.email}
                    onChange={(e) =>
                      updateTravellerField("email", e.target.value)
                    }
                  />
                </div>
              </section>

              <section><h3 className="text-[15px] font-semibold text-slate-900">Document Details</h3><p className="mt-2 text-xs text-slate-600">Passport and PAN editing are unavailable until protected storage is ready. Basic saves do not upload or change existing document values.</p></section>

              <section>
                <h3 className="text-[15px] font-semibold text-slate-900">
                  Frequent Flyer Details
                </h3>

                <div className="mt-4 space-y-3">
                  {travellerForm.frequentFlyers.map((row) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]"
                    >
                      <SelectField
                        label="AIRLINE"
                        value={row.airline}
                        options={airlineOptions}
                        onChange={(e) =>
                          updateFlyerRow(row.id, "airline", e.target.value)
                        }
                      />

                      <InputField
                        label="FREQUENT FLYER NUMBER"
                        value={row.flyerNumber}
                        onChange={(e) =>
                          updateFlyerRow(row.id, "flyerNumber", e.target.value)
                        }
                      />

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeFlyerRow(row.id)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 text-[16px] text-red-600 transition hover:bg-red-50"
                          title="Remove flyer"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addFlyerRow}
                  className="mt-3 text-[13px] font-semibold text-[#0b5fff] hover:underline"
                >
                  + Add
                </button>
              </section>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveTraveller} disabled={saving || conflict}
                  className="h-10 rounded-xl bg-[#0b5fff] px-5 text-[12px] font-semibold tracking-wide text-white transition hover:bg-[#094ee0]"
                >
                  SAVE CO TRAVELLER
                </button>
              </div>
            </fieldset>
          </div>
        )}

        {profileData.coTravellers.length === 0 && !isFormOpen ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-slate-50 px-5 py-8 text-[13px] text-slate-600">
            No co travellers added yet.
          </div>
        ) : null}

        <div className="space-y-4">
          {profileData.coTravellers
            .filter((traveller) => traveller.id !== editingTravellerId)
            .map((traveller) => (
              <div
                key={traveller.id}
                className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm"
              >
                <div>
                  <h3 className="text-[15px] font-semibold text-slate-900">
                    {[traveller.firstName, traveller.lastName]
                      .filter(Boolean)
                      .join(" ") || "Unnamed Traveller"}
                  </h3>
                  <p className="mt-1 text-[12px] text-slate-500">
                    {traveller.gender || "Gender not added"}
                    {traveller.relation ? ` • ${traveller.relation}` : ""}
                    {traveller.mobile ? ` • ${traveller.mobile}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleEditTraveller(traveller)} disabled={saving || isFormOpen}
                    className="text-[12px] font-semibold text-[#0b5fff] hover:underline"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteTraveller(traveller.id)} disabled={saving || isFormOpen}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 text-[14px] text-red-600 transition hover:bg-red-50"
                    title="Delete traveller" aria-label="Delete traveller"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </label>
      <input
        {...props}
        className={`h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-[14px] font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b5fff] ${className}`}
      />
    </div>
  );
}

function SelectField({
  label,
  options,
  className = "",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: string[];
}) {
  const selectRef = React.useRef<HTMLSelectElement | null>(null);

  const handleOpen = () => {
    if (!selectRef.current) return;

    selectRef.current.focus();

    if (
      typeof (
        selectRef.current as HTMLSelectElement & { showPicker?: () => void }
      ).showPicker === "function"
    ) {
      (
        selectRef.current as HTMLSelectElement & { showPicker?: () => void }
      ).showPicker?.();
    } else {
      selectRef.current.click();
    }
  };

  return (
    <div>
      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </label>

      <div
        onClick={handleOpen}
        className={`relative flex h-12 w-full cursor-pointer items-center rounded-xl border border-gray-300 bg-white px-4 text-[14px] font-medium text-slate-900 transition focus-within:border-[#0b5fff] ${className}`}
      >
        <select
          ref={selectRef}
          {...props}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-xl bg-transparent px-4 pr-10 text-[14px] font-medium text-slate-900 outline-none"
        >
          <option value="">Select</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute right-4 text-[12px] text-slate-500">
          ▼
        </span>
      </div>
    </div>
  );
}