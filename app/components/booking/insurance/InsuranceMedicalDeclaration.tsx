"use client";

export type InsuranceMedicalDeclarationData = {
  hasMedicalCondition: boolean;
  medicalConditions: string;
  takingMedication: boolean;
  medicationDetails: string;
  recentHospitalization: boolean;
  hospitalizationDetails: string;
  doctorConsultationRequired: boolean;
};

type Props = {
  value: InsuranceMedicalDeclarationData;
  onChange: (value: InsuranceMedicalDeclarationData) => void;
};

export default function InsuranceMedicalDeclaration({
  value,
  onChange,
}: Props) {
  const update = (
    key: keyof InsuranceMedicalDeclarationData,
    nextValue: string | boolean
  ) => {
    onChange({
      ...value,
      [key]: nextValue,
    });
  };

  return (
    <section className="min-w-0 rounded-[22px] border border-gray-100 bg-white p-4 shadow-sm md:rounded-3xl md:p-5">
      <div className="mb-5">
        <h2 className="break-words text-lg font-extrabold text-gray-950">
          Medical Declaration
        </h2>

        <p className="break-words text-sm font-semibold leading-5 text-gray-500">
          Medical disclosures help insurers validate eligibility and claim
          support.
        </p>
      </div>

      <div className="space-y-5">
        <div className="min-w-0 rounded-2xl border border-orange-100 bg-orange-50/40 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="break-words text-sm font-extrabold text-gray-950">
                Existing Medical Condition
              </p>

              <p className="break-words text-xs font-semibold leading-5 text-gray-500">
                Diabetes, heart issue, asthma, BP, surgery history etc.
              </p>
            </div>

            <label className="flex min-h-11 items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-bold text-gray-700 lg:bg-transparent lg:px-0 lg:py-0">
              <input
                type="checkbox"
                checked={value.hasMedicalCondition}
                onChange={(e) =>
                  update("hasMedicalCondition", e.target.checked)
                }
                className="h-4 w-4 accent-orange-500"
              />
              Yes, traveller has condition
            </label>
          </div>

          {value.hasMedicalCondition && (
            <textarea
              rows={3}
              value={value.medicalConditions}
              onChange={(e) =>
                update("medicalConditions", e.target.value)
              }
              className="mt-4 w-full min-w-0 rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-400"
              placeholder="Mention condition details"
            />
          )}
        </div>

        <div className="min-w-0 rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="break-words text-sm font-extrabold text-gray-950">
                Regular Medication
              </p>

              <p className="break-words text-xs font-semibold leading-5 text-gray-500">
                Mention if traveller is on regular prescribed medication.
              </p>
            </div>

            <label className="flex min-h-11 items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-bold text-gray-700 lg:bg-transparent lg:px-0 lg:py-0">
              <input
                type="checkbox"
                checked={value.takingMedication}
                onChange={(e) =>
                  update("takingMedication", e.target.checked)
                }
                className="h-4 w-4 accent-orange-500"
              />
              Taking medication
            </label>
          </div>

          {value.takingMedication && (
            <textarea
              rows={3}
              value={value.medicationDetails}
              onChange={(e) =>
                update("medicationDetails", e.target.value)
              }
              className="mt-4 w-full min-w-0 rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-400"
              placeholder="Medication details"
            />
          )}
        </div>

        <div className="min-w-0 rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="break-words text-sm font-extrabold text-gray-950">
                Recent Hospitalization
              </p>

              <p className="break-words text-xs font-semibold leading-5 text-gray-500">
                Hospitalization or surgery in last 2 years.
              </p>
            </div>

            <label className="flex min-h-11 items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-bold text-gray-700 lg:bg-transparent lg:px-0 lg:py-0">
              <input
                type="checkbox"
                checked={value.recentHospitalization}
                onChange={(e) =>
                  update("recentHospitalization", e.target.checked)
                }
                className="h-4 w-4 accent-orange-500"
              />
              Hospitalized recently
            </label>
          </div>

          {value.recentHospitalization && (
            <textarea
              rows={3}
              value={value.hospitalizationDetails}
              onChange={(e) =>
                update("hospitalizationDetails", e.target.value)
              }
              className="mt-4 w-full min-w-0 rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-400"
              placeholder="Hospitalization details"
            />
          )}
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={value.doctorConsultationRequired}
              onChange={(e) =>
                update(
                  "doctorConsultationRequired",
                  e.target.checked
                )
              }
              className="mt-1 h-4 w-4 accent-orange-500"
            />

            <div className="min-w-0">
              <p className="break-words text-sm font-extrabold text-gray-950">
                Doctor Consultation Recommended
              </p>

              <p className="break-words text-xs font-semibold leading-5 text-gray-600">
                Some insurers may require additional medical approval for
                senior travellers or pre-existing conditions.
              </p>
            </div>
          </label>
        </div>
      </div>
    </section>
  );
}
