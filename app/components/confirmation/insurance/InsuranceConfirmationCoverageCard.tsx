"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Props = {
  data: any;
};

const addOnLabels: Record<string, string> = {
  adventureCover: "Adventure Sports Cover",
  cruiseCover: "Cruise Cover",
  gadgetCover: "Gadget Protection",
  tripCancellation: "Trip Cancellation",
  flightDelay: "Flight Delay Protection",
  baggageLoss: "Baggage Loss Cover",
  covidUpgrade: "Covid Upgrade Cover",
};

export default function InsuranceConfirmationCoverageCard({ data }: Props) {
  const plan = data?.plan || {};
  const addOns = data?.addOns || {};
  const medicalDeclaration = data?.medicalDeclaration || {};

  const selectedAddOns = Object.entries(addOns)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([key]) => addOnLabels[key] || key);

  return (
    <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-5">
      <div className="mb-4 md:mb-5">
        <h2 className="break-words text-lg font-black text-gray-950">
          Coverage & Add-ons
        </h2>
        <p className="break-words text-sm font-semibold leading-5 text-gray-500">
          Included benefits, add-ons and medical declaration summary.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {(plan?.features || []).map((feature: string) => (
          <div
            key={feature}
            className="min-w-0 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm font-bold leading-5 text-green-800"
          >
            <span className="break-words">✅ {feature}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 p-4 md:mt-5">
        <p className="text-sm font-black text-gray-950">Selected Add-ons</p>

        {selectedAddOns.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedAddOns.map((item) => (
              <span
                key={item}
                className="max-w-full rounded-full bg-white px-3 py-1.5 text-xs font-bold leading-5 text-orange-700 shadow-sm"
              >
                <span className="break-words">{item}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm font-semibold text-gray-500">
            No additional add-ons selected.
          </p>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 md:mt-5">
        <p className="break-words text-sm font-black text-gray-950">
          Medical Declaration
        </p>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="min-w-0 rounded-xl bg-white/70 p-3 md:bg-transparent md:p-0">
            <p className="text-xs font-bold text-gray-500">
              Existing Condition
            </p>
            <p className="break-words text-sm font-black text-gray-950">
              {medicalDeclaration?.hasMedicalCondition ? "Yes" : "No"}
            </p>
          </div>

          <div className="min-w-0 rounded-xl bg-white/70 p-3 md:bg-transparent md:p-0">
            <p className="text-xs font-bold text-gray-500">
              Regular Medication
            </p>
            <p className="break-words text-sm font-black text-gray-950">
              {medicalDeclaration?.takingMedication ? "Yes" : "No"}
            </p>
          </div>

          <div className="min-w-0 rounded-xl bg-white/70 p-3 md:bg-transparent md:p-0">
            <p className="text-xs font-bold text-gray-500">
              Recent Hospitalization
            </p>
            <p className="break-words text-sm font-black text-gray-950">
              {medicalDeclaration?.recentHospitalization ? "Yes" : "No"}
            </p>
          </div>
        </div>

        {medicalDeclaration?.medicalConditions && (
          <p className="mt-3 break-words rounded-xl bg-white p-3 text-xs font-semibold leading-5 text-gray-700">
            {medicalDeclaration.medicalConditions}
          </p>
        )}
      </div>

      {(plan?.exclusions || []).length > 0 && (
        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 md:mt-5">
          <p className="break-words text-sm font-black text-red-800">
            Important Exclusions
          </p>

          <div className="mt-3 space-y-2">
            {plan.exclusions.map((item: string) => (
              <p key={item} className="break-words text-xs font-bold leading-5 text-red-700">
                ⚠ {item}
              </p>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
