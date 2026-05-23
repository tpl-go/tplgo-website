"use client";

export type InsuranceAddOnKey =
  | "adventureCover"
  | "cruiseCover"
  | "gadgetCover"
  | "tripCancellation"
  | "flightDelay"
  | "baggageLoss"
  | "covidUpgrade";

export type InsuranceAddOnsState = Record<InsuranceAddOnKey, boolean>;

export const defaultInsuranceAddOns: InsuranceAddOnsState = {
  adventureCover: false,
  cruiseCover: false,
  gadgetCover: false,
  tripCancellation: false,
  flightDelay: false,
  baggageLoss: false,
  covidUpgrade: false,
};

export const insuranceAddOnPricing: Record<InsuranceAddOnKey, number> = {
  adventureCover: 899,
  cruiseCover: 699,
  gadgetCover: 499,
  tripCancellation: 999,
  flightDelay: 349,
  baggageLoss: 399,
  covidUpgrade: 599,
};

type Props = {
  value: InsuranceAddOnsState;
  onChange: (value: InsuranceAddOnsState) => void;
};

const ADD_ONS = [
  {
    key: "adventureCover",
    title: "Adventure Sports Cover",
    description: "Trekking, skiing, scuba, adventure activity protection",
  },
  {
    key: "cruiseCover",
    title: "Cruise Cover",
    description: "Cruise cancellation and onboard medical support",
  },
  {
    key: "gadgetCover",
    title: "Gadget Protection",
    description: "Mobile, laptop and gadget protection during travel",
  },
  {
    key: "tripCancellation",
    title: "Trip Cancellation",
    description: "Extra cancellation protection before departure",
  },
  {
    key: "flightDelay",
    title: "Flight Delay Protection",
    description: "Compensation for delayed or missed flights",
  },
  {
    key: "baggageLoss",
    title: "Baggage Loss Cover",
    description: "Protection against baggage delay or loss",
  },
  {
    key: "covidUpgrade",
    title: "Covid Upgrade Cover",
    description: "Enhanced covid quarantine and medical support",
  },
] as const;

export default function InsuranceAddOns({
  value,
  onChange,
}: Props) {
  const toggle = (key: InsuranceAddOnKey) => {
    onChange({
      ...value,
      [key]: !value[key],
    });
  };

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-extrabold text-gray-950">
          Insurance Add-ons
        </h2>

        <p className="text-sm font-semibold text-gray-500">
          Enhance your coverage with premium protection add-ons.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {ADD_ONS.map((item) => {
          const checked = value[item.key];

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => toggle(item.key)}
              className={`rounded-2xl border p-4 text-left transition ${
                checked
                  ? "border-orange-400 bg-orange-50"
                  : "border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-gray-950">
                    {item.title}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-gray-500">
                    {item.description}
                  </p>
                </div>

                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-extrabold ${
                    checked
                      ? "border-orange-500 bg-orange-500 text-white"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  {checked ? "✓" : ""}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500">
                  Add-on Premium
                </p>

                <p className="text-sm font-extrabold text-orange-700">
                  ₹
                  {insuranceAddOnPricing[item.key].toLocaleString("en-IN")}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}