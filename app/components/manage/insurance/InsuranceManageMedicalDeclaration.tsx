"use client";

export type InsuranceManageMedicalDeclarationData = {
  hasMedicalCondition?: boolean;
  medicalConditions?: string;
  takingMedication?: boolean;
  medicationDetails?: string;
  recentHospitalization?: boolean;
  hospitalizationDetails?: string;
  doctorConsultationRequired?: boolean;
};

type Props = {
  value: InsuranceManageMedicalDeclarationData;
  onChange: (value: InsuranceManageMedicalDeclarationData) => void;
  onSave: () => void;
};

export default function InsuranceManageMedicalDeclaration({
  value,
  onChange,
  onSave,
}: Props) {
  const update = (
    key: keyof InsuranceManageMedicalDeclarationData,
    nextValue: string | boolean
  ) => {
    onChange({
      ...value,
      [key]: nextValue,
    });
  };

  return (
    <div className="min-w-0 rounded-[20px] border border-black/5 bg-white p-4 shadow-sm md:rounded-[30px] md:p-6">
      <div className="mb-4 flex flex-col gap-3 md:mb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="break-words text-lg font-black text-[#111827] md:text-xl">
            Medical Declaration
          </h2>
          <p className="break-words text-sm font-semibold leading-5 text-[#6b7280]">
            Update medical disclosure for policy support.
          </p>
        </div>

        <button
          type="button"
          onClick={onSave}
          className="h-11 w-full rounded-2xl bg-orange-500 px-5 text-sm font-black text-white hover:bg-orange-600 sm:w-auto"
        >
          Save Medical Details
        </button>
      </div>

      <div className="space-y-5">
        <ToggleCard
          title="Existing Medical Condition"
          description="Diabetes, BP, asthma, heart issue, surgery history etc."
          checked={Boolean(value.hasMedicalCondition)}
          onChange={(checked) => update("hasMedicalCondition", checked)}
        />

        {value.hasMedicalCondition && (
          <TextAreaBox
            label="Medical Condition Details"
            value={value.medicalConditions || ""}
            onChange={(text) => update("medicalConditions", text)}
          />
        )}

        <ToggleCard
          title="Regular Medication"
          description="Mention if traveller is taking regular prescribed medication."
          checked={Boolean(value.takingMedication)}
          onChange={(checked) => update("takingMedication", checked)}
        />

        {value.takingMedication && (
          <TextAreaBox
            label="Medication Details"
            value={value.medicationDetails || ""}
            onChange={(text) => update("medicationDetails", text)}
          />
        )}

        <ToggleCard
          title="Recent Hospitalization"
          description="Hospitalization or surgery in last 2 years."
          checked={Boolean(value.recentHospitalization)}
          onChange={(checked) => update("recentHospitalization", checked)}
        />

        {value.recentHospitalization && (
          <TextAreaBox
            label="Hospitalization Details"
            value={value.hospitalizationDetails || ""}
            onChange={(text) => update("hospitalizationDetails", text)}
          />
        )}

        <ToggleCard
          title="Doctor Consultation Required"
          description="Insurer may request medical approval for senior travellers or existing conditions."
          checked={Boolean(value.doctorConsultationRequired)}
          onChange={(checked) =>
            update("doctorConsultationRequired", checked)
          }
        />
      </div>
    </div>
  );
}

function ToggleCard({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="break-words text-sm font-black text-[#111827]">
            {title}
          </p>
          <p className="mt-1 break-words text-xs font-semibold leading-5 text-[#6b7280]">
            {description}
          </p>
        </div>

        <label className="flex w-fit items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-gray-700">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 accent-orange-500"
          />
          Yes
        </label>
      </div>
    </div>
  );
}

function TextAreaBox({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1 block break-words text-xs font-bold text-gray-600">
        {label}
      </label>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-400"
      />
    </div>
  );
}
