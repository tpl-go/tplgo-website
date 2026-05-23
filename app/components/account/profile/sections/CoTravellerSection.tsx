"use client";

import React, { useEffect, useState } from "react";
import {
  CoTravellerEntry,
  FrequentFlyerEntry,
  ProfileFormData,
  defaultProfileData,
  getSavedProfile,
  saveProfile,
} from "@/app/lib/account/profileStorage";

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

const countryOptions = ["India", "UAE", "USA"];

const emptyCoTraveller = (): CoTravellerEntry => ({
  id: Date.now(),
  firstName: "",
  lastName: "",
  gender: "",
  dob: "",
  nationality: "Indian",
  relation: "",
  mobile: "",
  email: "",
  passportNo: "",
  passportExpiry: "",
  issuingCountry: "",
  panCard: "",
  frequentFlyers: [
    {
      id: Date.now() + 1,
      airline: "",
      flyerNumber: "",
    },
  ],
});

export default function CoTravellerSection() {
  const [profileData, setProfileData] = useState<ProfileFormData>(defaultProfileData);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTravellerId, setEditingTravellerId] = useState<number | null>(null);
  const [travellerForm, setTravellerForm] = useState<CoTravellerEntry>(
    emptyCoTraveller()
  );

  useEffect(() => {
    setProfileData(getSavedProfile(""));
  }, []);

  const openNewForm = () => {
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
    key: keyof CoTravellerEntry,
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

  const handleSaveTraveller = () => {
    const nextTravellers =
      editingTravellerId === null
        ? [...profileData.coTravellers, { ...travellerForm, id: Date.now() }]
        : profileData.coTravellers.map((item) =>
            item.id === editingTravellerId ? { ...travellerForm, id: editingTravellerId } : item
          );

    const nextProfile = {
      ...profileData,
      coTravellers: nextTravellers,
    };

    setProfileData(nextProfile);
    saveProfile("", nextProfile);
    closeForm();
  };

  const handleEditTraveller = (traveller: CoTravellerEntry) => {
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

  const handleDeleteTraveller = (id: number) => {
    const nextProfile = {
      ...profileData,
      coTravellers: profileData.coTravellers.filter((item) => item.id !== id),
    };

    setProfileData(nextProfile);
    saveProfile("", nextProfile);
  };

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
        <h1 className="text-[18px] font-semibold text-slate-900">
          Co Traveller
        </h1>

        <button
          type="button"
          onClick={openNewForm}
          className="h-10 rounded-xl bg-[#0b5fff] px-5 text-[12px] font-semibold tracking-wide text-white transition hover:bg-[#094ee0]"
        >
          + ADD NEW
        </button>
      </div>

      <div className="space-y-6 px-6 py-6">
        {isFormOpen && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-slate-900">
                {editingTravellerId ? "Edit Co Traveller" : "Add New Co Traveller"}
              </h2>

              <button
                type="button"
                onClick={closeForm}
                className="text-[12px] font-medium text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>

            <div className="mt-6 space-y-8">
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

                  <SelectField
                    label="NATIONALITY"
                    value={travellerForm.nationality}
                    options={["Indian", "American", "British"]}
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

              <section>
                <h3 className="text-[15px] font-semibold text-slate-900">
                  Document Details
                </h3>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputField
                    label="PASSPORT NO."
                    value={travellerForm.passportNo}
                    onChange={(e) =>
                      updateTravellerField("passportNo", e.target.value)
                    }
                  />
                  <InputField
                    label="EXPIRY DATE"
                    type="date"
                    value={travellerForm.passportExpiry}
                    onChange={(e) =>
                      updateTravellerField("passportExpiry", e.target.value)
                    }
                  />
                  <SelectField
                    label="ISSUING COUNTRY"
                    value={travellerForm.issuingCountry}
                    options={countryOptions}
                    onChange={(e) =>
                      updateTravellerField("issuingCountry", e.target.value)
                    }
                  />
                  <InputField
                    label="PAN CARD NUMBER"
                    value={travellerForm.panCard}
                    onChange={(e) =>
                      updateTravellerField("panCard", e.target.value)
                    }
                  />
                </div>
              </section>

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
                  onClick={handleSaveTraveller}
                  className="h-10 rounded-xl bg-[#0b5fff] px-5 text-[12px] font-semibold tracking-wide text-white transition hover:bg-[#094ee0]"
                >
                  SAVE CO TRAVELLER
                </button>
              </div>
            </div>
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
                    onClick={() => handleEditTraveller(traveller)}
                    className="text-[12px] font-semibold text-[#0b5fff] hover:underline"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteTraveller(traveller.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 text-[14px] text-red-600 transition hover:bg-red-50"
                    title="Delete traveller"
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