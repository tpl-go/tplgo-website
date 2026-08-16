"use client";

import { useMemo, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { Check, ChevronRight, ImagePlus, Plus, X } from "lucide-react";
import {
  addOperatingLocation,
  calculateBusinessProfileCompletion,
  emptyPartnerOrganizationPreviewProfile,
  isRegistrationNumberRecommended,
  organizationTypeOptions,
  removeOperatingLocation,
  samplePartnerOrganizationPreviewProfile,
  validatePartnerOrganizationProfile,
  type PartnerOrganizationPreviewProfile,
  type PartnerOrganizationProfileErrors,
} from "../lib/partner/partnerOrganizationPreviewProfile";
import { selectedServicesLabel } from "../lib/partner/partnerPreviewSelection";
import type { PartnerServiceDefinition } from "../lib/partner/partnerServiceCatalog";

type PartnerBusinessProfileStepProps = {
  selectedServices: PartnerServiceDefinition[];
  profile: PartnerOrganizationPreviewProfile;
  onProfileChange: (profile: PartnerOrganizationPreviewProfile) => void;
  onBackToServices: () => void;
  onSaveDraft: () => void;
  onSaveAndContinue: () => void;
  draftSaved: boolean;
};

export function PartnerBusinessProfileStep({
  selectedServices,
  profile,
  onProfileChange,
  onBackToServices,
  onSaveDraft,
  onSaveAndContinue,
  draftSaved,
}: PartnerBusinessProfileStepProps) {
  const [touchedFields, setTouchedFields] = useState<Set<keyof PartnerOrganizationPreviewProfile>>(new Set());
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const errors = useMemo(() => validatePartnerOrganizationProfile(profile), [profile]);
  const completion = calculateBusinessProfileCompletion(profile);
  const selectedCountLabel = selectedServicesLabel(selectedServices.length);
  const displayedErrors = showAllErrors ? errors : filterTouchedErrors(errors, touchedFields);
  const registrationRecommended = isRegistrationNumberRecommended(profile.organizationType);

  function updateField<K extends keyof PartnerOrganizationPreviewProfile>(
    field: K,
    value: PartnerOrganizationPreviewProfile[K]
  ) {
    onProfileChange({ ...profile, [field]: value, savedForPreview: false });
  }

  function markTouched(field: keyof PartnerOrganizationPreviewProfile) {
    setTouchedFields((current) => new Set(current).add(field));
  }

  function handleSaveAndContinue() {
    setShowAllErrors(true);
    if (Object.keys(errors).length > 0) return;
    onSaveAndContinue();
  }

  function fillSampleBusiness() {
    onProfileChange(samplePartnerOrganizationPreviewProfile);
    setShowAllErrors(false);
    setTouchedFields(new Set());
  }

  function clearForm() {
    onProfileChange(emptyPartnerOrganizationPreviewProfile);
    setShowAllErrors(false);
    setTouchedFields(new Set());
    setLocationInput("");
  }

  function addLocation() {
    const nextLocations = addOperatingLocation(profile.operatingLocations, locationInput);
    onProfileChange({ ...profile, operatingLocations: nextLocations, savedForPreview: false });
    setLocationInput("");
  }

  return (
    <section className="grid min-w-0 gap-5">
      <div className="rounded-lg border border-[#dbe3ef] bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#eef2ff] px-3 py-1 text-[12px] font-black text-[#4338ca]">
              Step 2 of 5 - Business Profile
            </div>
            <h1 className="mt-4 text-[26px] font-black leading-9 text-[#111827] sm:text-[36px] sm:leading-10">
              Tell us about your business
            </h1>
            <p className="mt-3 max-w-3xl text-[15px] font-semibold leading-6 text-[#64748b]">
              We&apos;ll use these details across the services you selected. You can update them later.
            </p>
          </div>
          <div className="rounded-lg border border-[#dbe3ef] bg-[#fbfdff] p-4 xl:w-[340px]">
            <p className="text-[12px] font-black uppercase tracking-[0.08em] text-[#64748b]">Business Profile</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-[28px] font-black text-[#111827]">{completion}%</p>
                <p className="text-[12px] font-bold text-[#64748b]">complete</p>
              </div>
              {draftSaved || profile.savedForPreview ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-3 py-1 text-[11px] font-black uppercase text-[#15803d]">
                  <Check size={13} aria-hidden="true" />
                  Draft saved
                </span>
              ) : null}
            </div>
            <div className="mt-3 h-2 rounded-full bg-[#e2e8f0]">
              <div className="h-2 rounded-full bg-[#4f46e5]" style={{ width: `${completion}%` }} />
            </div>
          </div>
        </div>
        <OnboardingJourneyForBusiness />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid min-w-0 gap-4">
          <SelectedServicesCard selectedServices={selectedServices} onEdit={onBackToServices} />

          <FormSection title="Business Basics">
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="Business / Brand Name"
                value={profile.businessName}
                placeholder="e.g. Himalayan Hospitality"
                error={displayedErrors.businessName}
                required
                onBlur={() => markTouched("businessName")}
                onChange={(value) => updateField("businessName", value)}
              />
              <TextInput
                label="Legal Business Name"
                value={profile.legalName}
                placeholder="e.g. Himalayan Hospitality Private Limited"
                onChange={(value) => updateField("legalName", value)}
              />
              <SelectInput
                label="Organization Type"
                value={profile.organizationType}
                error={displayedErrors.organizationType}
                required
                options={organizationTypeOptions}
                onBlur={() => markTouched("organizationType")}
                onChange={(value) => updateField("organizationType", value)}
              />
              <TextInput
                label="Year established"
                value={profile.yearEstablished}
                placeholder="e.g. 2024"
                error={displayedErrors.yearEstablished}
                inputMode="numeric"
                onBlur={() => markTouched("yearEstablished")}
                onChange={(value) => updateField("yearEstablished", value)}
              />
            </div>
            <TextArea
              label="Business Description"
              value={profile.description}
              placeholder="Briefly describe what your business offers."
              hint={`${profile.description.length}/240 characters`}
              maxLength={240}
              onChange={(value) => updateField("description", value)}
            />
          </FormSection>

          <FormSection title="Primary Contact">
            <div className="rounded-lg border border-[#dbeafe] bg-[#eff6ff] p-3">
              <label className="flex min-h-10 cursor-pointer items-center gap-3 text-[13px] font-bold text-[#334155]">
                <input
                  type="checkbox"
                  checked={profile.sameAsTplAccount}
                  onChange={(event) => updateField("sameAsTplAccount", event.target.checked)}
                  className="h-4 w-4 rounded border-[#94a3b8] accent-[#4f46e5]"
                />
                <span>Same as my TPL account</span>
              </label>
              <p className="mt-1 text-[12px] font-semibold leading-5 text-[#64748b]">
                Your personal login identity and business contact can be different. This Preview does not overwrite your TPL login.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="Contact person name"
                value={profile.contactName}
                error={displayedErrors.contactName}
                required
                onBlur={() => markTouched("contactName")}
                onChange={(value) => updateField("contactName", value)}
              />
              <TextInput
                label="Designation / Role"
                value={profile.contactRole}
                placeholder="e.g. Owner, Manager, Director"
                onChange={(value) => updateField("contactRole", value)}
              />
              <TextInput
                label="Business mobile"
                value={profile.businessMobile}
                error={displayedErrors.businessMobile}
                required
                inputMode="tel"
                placeholder="+91..."
                onBlur={() => markTouched("businessMobile")}
                onChange={(value) => updateField("businessMobile", value)}
              />
              <TextInput
                label="Business email"
                value={profile.businessEmail}
                error={displayedErrors.businessEmail}
                required
                inputMode="email"
                placeholder="business@example.com"
                onBlur={() => markTouched("businessEmail")}
                onChange={(value) => updateField("businessEmail", value)}
              />
            </div>
          </FormSection>

          <FormSection title="Registered / Business Address">
            <TextInput
              label="Address line 1"
              value={profile.addressLine1}
              error={displayedErrors.addressLine1}
              required
              onBlur={() => markTouched("addressLine1")}
              onChange={(value) => updateField("addressLine1", value)}
            />
            <TextInput
              label="Address line 2"
              value={profile.addressLine2}
              placeholder="Apartment, landmark, district"
              onChange={(value) => updateField("addressLine2", value)}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="City"
                value={profile.city}
                error={displayedErrors.city}
                required
                onBlur={() => markTouched("city")}
                onChange={(value) => updateField("city", value)}
              />
              <TextInput
                label="State / Region"
                value={profile.stateRegion}
                error={displayedErrors.stateRegion}
                required
                onBlur={() => markTouched("stateRegion")}
                onChange={(value) => updateField("stateRegion", value)}
              />
              <TextInput
                label="Postal / PIN code"
                value={profile.postalCode}
                inputMode="numeric"
                onChange={(value) => updateField("postalCode", value)}
              />
              <TextInput
                label="Country"
                value={profile.country}
                error={displayedErrors.country}
                required
                onBlur={() => markTouched("country")}
                onChange={(value) => updateField("country", value)}
              />
            </div>
          </FormSection>

          <FormSection title="Business Registration">
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="PAN"
                value={profile.pan}
                error={displayedErrors.pan}
                placeholder="ABCDE1234F"
                onBlur={() => markTouched("pan")}
                onChange={(value) => updateField("pan", value.toUpperCase())}
              />
              <TextInput
                label="GSTIN"
                value={profile.gstin}
                error={displayedErrors.gstin}
                placeholder="01ABCDE1234F1Z5"
                disabled={profile.gstNotApplicable}
                onBlur={() => markTouched("gstin")}
                onChange={(value) => updateField("gstin", value.toUpperCase())}
              />
            </div>
            <label className="flex min-h-10 cursor-pointer items-center gap-3 text-[13px] font-bold text-[#334155]">
              <input
                type="checkbox"
                checked={profile.gstNotApplicable}
                onChange={(event) => updateField("gstNotApplicable", event.target.checked)}
                className="h-4 w-4 rounded border-[#94a3b8] accent-[#4f46e5]"
              />
              <span>I don&apos;t have / GST not applicable</span>
            </label>
            <TextInput
              label={registrationRecommended ? "Company / Registration Number" : "Company / Registration Number (if applicable)"}
              value={profile.registrationNumber}
              hint={registrationRecommended ? "Recommended for the selected organization type." : undefined}
              onChange={(value) => updateField("registrationNumber", value)}
            />
            <p className="text-[12px] font-semibold leading-5 text-[#64748b]">
              PAN and GSTIN checks are format-only in this Preview. Document verification happens in Step 3.
            </p>
          </FormSection>

          <FormSection title="Business Presence">
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="Website"
                value={profile.website}
                placeholder="https://..."
                inputMode="url"
                onChange={(value) => updateField("website", value)}
              />
              <TextInput
                label="Instagram / social / business page"
                value={profile.socialPage}
                placeholder="https://..."
                inputMode="url"
                onChange={(value) => updateField("socialPage", value)}
              />
            </div>
            <TextArea
              label="Short public-facing description"
              value={profile.publicDescription}
              placeholder="A short description travellers may see later."
              hint={`${profile.publicDescription.length}/180 characters`}
              maxLength={180}
              onChange={(value) => updateField("publicDescription", value)}
            />
            <LogoPreview
              logoPreviewName={profile.logoPreviewName}
              onChange={(logoPreviewName) => updateField("logoPreviewName", logoPreviewName)}
            />
          </FormSection>

          <FormSection title="Operating Locations">
            <p className="text-[13px] font-semibold leading-5 text-[#64748b]">
              Add broad locations where this organization operates. Service-specific zones and inventory come in Step 4.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="min-w-0 flex-1">
                <span className="sr-only">Operating location</span>
                <input
                  value={locationInput}
                  onChange={(event) => setLocationInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addLocation();
                    }
                  }}
                  placeholder="e.g. Srinagar"
                  className="h-11 w-full rounded-lg border border-[#cfd8e3] bg-white px-3 text-[14px] font-semibold text-[#111827] outline-none transition placeholder:text-[#94a3b8] focus:border-[#4f46e5] focus:ring-2 focus:ring-[#c7d2fe]"
                />
              </label>
              <button
                type="button"
                onClick={addLocation}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#cfd8e3] bg-white px-4 text-[13px] font-black text-[#334155] transition hover:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
              >
                <Plus size={16} aria-hidden="true" />
                Add location
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.operatingLocations.length > 0 ? (
                profile.operatingLocations.map((location) => (
                  <span key={location} className="inline-flex items-center gap-2 rounded-full bg-[#eef2ff] px-3 py-1.5 text-[12px] font-black text-[#4338ca]">
                    {location}
                    <button
                      type="button"
                      onClick={() => updateField("operatingLocations", removeOperatingLocation(profile.operatingLocations, location))}
                      className="rounded-full p-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
                      aria-label={`Remove ${location}`}
                    >
                      <X size={13} aria-hidden="true" />
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-[13px] font-semibold text-[#64748b]">No operating locations added yet.</p>
              )}
            </div>
          </FormSection>
        </div>

        <aside className="xl:sticky xl:top-4 xl:self-start">
          <div className="rounded-lg border border-[#dbe3ef] bg-white p-4 shadow-sm">
            <h2 className="text-[17px] font-black text-[#111827]">Setup Summary</h2>
            <p className="mt-1 text-[13px] font-bold text-[#4f46e5]">
              This business profile will be used for {selectedCountLabel}.
            </p>
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={fillSampleBusiness}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-[#cfd8e3] bg-white px-4 text-[13px] font-black text-[#334155] transition hover:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
              >
                Fill sample business
              </button>
              <button
                type="button"
                onClick={clearForm}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-[#fecaca] bg-white px-4 text-[13px] font-black text-[#991b1b] transition hover:bg-[#fff7f7] focus:outline-none focus:ring-2 focus:ring-[#fca5a5]"
              >
                Clear form
              </button>
            </div>
            <div className="mt-4 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
              <p className="text-[12px] font-black uppercase tracking-[0.08em] text-[#64748b]">What comes later</p>
              <p className="mt-2 text-[12px] font-semibold leading-5 text-[#64748b]">
                Rooms, vehicles, slots, prices, and service-specific operating zones are configured in Step 4.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <div className="sticky bottom-0 z-20 -mx-4 border-t border-[#dbe3ef] bg-white/95 px-4 py-3 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:static lg:mx-0 lg:rounded-lg lg:border lg:shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onBackToServices}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[#cfd8e3] bg-white px-4 text-[13px] font-black text-[#334155] transition hover:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
          >
            Back to Services
          </button>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onSaveDraft}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[#cfd8e3] bg-white px-4 text-[13px] font-black text-[#334155] transition hover:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={handleSaveAndContinue}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-5 text-[14px] font-black text-white transition hover:bg-[#4338ca] focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
            >
              Save & Continue
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BusinessProfileSavedPanel({
  selectedServices,
  onBack,
}: {
  selectedServices: PartnerServiceDefinition[];
  onBack: () => void;
}) {
  return (
    <section className="rounded-lg border border-[#c7d2fe] bg-white p-5 shadow-sm">
      <div className="inline-flex items-center gap-2 rounded-full bg-[#dcfce7] px-3 py-1 text-[12px] font-black text-[#15803d]">
        <Check size={14} aria-hidden="true" />
        Business Profile saved for Preview
      </div>
      <h1 className="mt-4 text-[26px] font-black text-[#111827]">Next: Verification</h1>
      <p className="mt-2 max-w-3xl text-[14px] font-semibold leading-6 text-[#64748b]">
        Step 3 will collect document and business verification readiness. This Preview did not create a live organization.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {selectedServices.map((serviceItem) => (
          <div key={serviceItem.id} className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-[13px] font-bold text-[#334155]">
            {serviceItem.label}
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-[#cfd8e3] bg-white px-4 text-[13px] font-black text-[#334155] transition hover:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
        >
          Back to Business Profile
        </button>
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-[#eef2ff] px-4 text-[13px] font-black text-[#4338ca] focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
        >
          Continue to Verification - Next Page / Preview
        </button>
      </div>
    </section>
  );
}

function SelectedServicesCard({
  selectedServices,
  onEdit,
}: {
  selectedServices: PartnerServiceDefinition[];
  onEdit: () => void;
}) {
  return (
    <section className="rounded-lg border border-[#dbe3ef] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[17px] font-black text-[#111827]">Services you&apos;re setting up</h2>
          <p className="mt-1 text-[13px] font-bold text-[#4f46e5]">{selectedServicesLabel(selectedServices.length)}</p>
          <p className="mt-1 text-[13px] font-semibold leading-5 text-[#64748b]">
            One business profile applies across these selected services.
          </p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-[#cfd8e3] bg-white px-4 text-[13px] font-black text-[#334155] transition hover:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
        >
          Edit services
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {selectedServices.length > 0 ? (
          selectedServices.map((serviceItem) => (
            <span key={serviceItem.id} className="rounded-full bg-[#eef2ff] px-3 py-1.5 text-[12px] font-black text-[#4338ca]">
              {serviceItem.label}
            </span>
          ))
        ) : (
          <span className="rounded-lg border border-dashed border-[#cfd8e3] bg-[#fbfdff] px-3 py-2 text-[13px] font-semibold text-[#64748b]">
            No services selected yet.
          </span>
        )}
      </div>
    </section>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 rounded-lg border border-[#dbe3ef] bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-[18px] font-black text-[#111827]">{title}</h2>
      {children}
    </section>
  );
}

function TextInput({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  disabled,
  placeholder,
  inputMode,
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  onBlur?: () => void;
}) {
  const id = toFieldId(label);
  const errorId = `${id}-error`;
  return (
    <label className="grid gap-1.5">
      <span className="text-[13px] font-black text-[#334155]">
        {label}
        {required ? <span className="text-[#dc2626]"> *</span> : null}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        inputMode={inputMode}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="h-11 rounded-lg border border-[#cfd8e3] bg-white px-3 text-[14px] font-semibold text-[#111827] outline-none transition placeholder:text-[#94a3b8] disabled:cursor-not-allowed disabled:bg-[#f1f5f9] focus:border-[#4f46e5] focus:ring-2 focus:ring-[#c7d2fe]"
      />
      {hint ? <span className="text-[12px] font-semibold text-[#64748b]">{hint}</span> : null}
      {error ? <span id={errorId} className="text-[12px] font-bold text-[#dc2626]">{error}</span> : null}
    </label>
  );
}

function SelectInput({
  label,
  value,
  options,
  onChange,
  error,
  required,
  onBlur,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: PartnerOrganizationPreviewProfile["organizationType"]) => void;
  error?: string;
  required?: boolean;
  onBlur?: () => void;
}) {
  const id = toFieldId(label);
  const errorId = `${id}-error`;
  return (
    <label className="grid gap-1.5">
      <span className="text-[13px] font-black text-[#334155]">
        {label}
        {required ? <span className="text-[#dc2626]"> *</span> : null}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as PartnerOrganizationPreviewProfile["organizationType"])}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="h-11 rounded-lg border border-[#cfd8e3] bg-white px-3 text-[14px] font-semibold text-[#111827] outline-none transition focus:border-[#4f46e5] focus:ring-2 focus:ring-[#c7d2fe]"
      >
        <option value="">Select organization type</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      {error ? <span id={errorId} className="text-[12px] font-bold text-[#dc2626]">{error}</span> : null}
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  hint,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[13px] font-black text-[#334155]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={4}
        className="min-h-28 rounded-lg border border-[#cfd8e3] bg-white px-3 py-2 text-[14px] font-semibold leading-6 text-[#111827] outline-none transition placeholder:text-[#94a3b8] focus:border-[#4f46e5] focus:ring-2 focus:ring-[#c7d2fe]"
      />
      {hint ? <span className="text-[12px] font-semibold text-[#64748b]">{hint}</span> : null}
    </label>
  );
}

function LogoPreview({
  logoPreviewName,
  onChange,
}: {
  logoPreviewName: string;
  onChange: (logoPreviewName: string) => void;
}) {
  return (
    <div className="rounded-lg border border-dashed border-[#cfd8e3] bg-[#fbfdff] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#eef2ff] text-[#4338ca]">
            <ImagePlus size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="text-[13px] font-black text-[#334155]">Business Logo</p>
            <p className="mt-1 text-[12px] font-semibold leading-5 text-[#64748b]">
              Upload will be saved after Partner backend activation.
            </p>
            {logoPreviewName ? <p className="mt-1 text-[12px] font-black text-[#4338ca]">{logoPreviewName}</p> : null}
          </div>
        </div>
        <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-[#cfd8e3] bg-white px-4 text-[13px] font-black text-[#334155] transition hover:border-[#4f46e5] focus-within:ring-2 focus-within:ring-[#818cf8]">
          Choose file
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => onChange(event.target.files?.[0]?.name ?? "")}
          />
        </label>
      </div>
    </div>
  );
}

function OnboardingJourneyForBusiness() {
  const steps = ["Choose Services", "Business Profile", "Verification", "Service Setup", "Go Live"];
  return (
    <ol className="mt-6 grid gap-2 sm:grid-cols-5" aria-label="Partner onboarding journey">
      {steps.map((step, index) => (
        <li key={step} className="flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2">
          <span
            className={
              index < 2
                ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#4f46e5] text-[12px] font-black text-white"
                : "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[12px] font-black text-[#64748b]"
            }
          >
            {index === 0 ? <Check size={13} aria-hidden="true" /> : index + 1}
          </span>
          <span className={index === 1 ? "text-[12px] font-black text-[#111827]" : "text-[12px] font-bold text-[#64748b]"}>
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}

function filterTouchedErrors(
  errors: PartnerOrganizationProfileErrors,
  touchedFields: Set<keyof PartnerOrganizationPreviewProfile>
): PartnerOrganizationProfileErrors {
  return Object.fromEntries(
    Object.entries(errors).filter(([field]) => touchedFields.has(field as keyof PartnerOrganizationPreviewProfile))
  ) as PartnerOrganizationProfileErrors;
}

function toFieldId(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
