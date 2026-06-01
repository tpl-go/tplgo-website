"use client";

export type InsuranceManageTraveller = {
  id?: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  age?: string;
  gender?: string;
  passportNumber?: string;
  passportExpiry?: string;
};

type Props = {
  travellers: InsuranceManageTraveller[];
  isPassportRequired?: boolean;
  onChange: (travellers: InsuranceManageTraveller[]) => void;
  onSave: () => void;
};

export default function InsuranceManageTravellerDetails({
  travellers,
  isPassportRequired = false,
  onChange,
  onSave,
}: Props) {
  const update = (
    index: number,
    key: keyof InsuranceManageTraveller,
    value: string
  ) => {
    onChange(
      travellers.map((item, idx) =>
        idx === index ? { ...item, [key]: value } : item
      )
    );
  };

  return (
    <div className="min-w-0 rounded-[20px] border border-black/5 bg-white p-4 shadow-sm md:rounded-[30px] md:p-6">
      <div className="mb-4 flex flex-col gap-3 md:mb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="break-words text-lg font-black text-[#111827] md:text-xl">
            Traveller Details
          </h2>
          <p className="break-words text-sm font-semibold leading-5 text-[#6b7280]">
            Correct traveller details for insurance support.
          </p>
        </div>

        <button
          type="button"
          onClick={onSave}
          className="h-11 w-full rounded-2xl bg-orange-500 px-5 text-sm font-black text-white hover:bg-orange-600 sm:w-auto"
        >
          Save Traveller Details
        </button>
      </div>

      {isPassportRequired && (
        <div className="mb-4 break-words rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-bold leading-5 text-blue-800 md:mb-5">
          Passport number and expiry are required for international policies.
        </div>
      )}

      <div className="space-y-5">
        {travellers.map((traveller, index) => (
          <div
            key={traveller.id || index}
            className="min-w-0 rounded-2xl border border-orange-100 bg-orange-50/40 p-4"
          >
            <p className="mb-4 break-words text-sm font-black text-[#111827]">
              Traveller {index + 1}
            </p>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              <InputBox
                label="Title"
                value={traveller.title || ""}
                onChange={(value) => update(index, "title", value)}
              />

              <InputBox
                label="First Name"
                value={traveller.firstName || ""}
                onChange={(value) => update(index, "firstName", value)}
              />

              <InputBox
                label="Last Name"
                value={traveller.lastName || ""}
                onChange={(value) => update(index, "lastName", value)}
              />

              <InputBox
                label="Gender"
                value={traveller.gender || ""}
                onChange={(value) => update(index, "gender", value)}
              />

              <InputBox
                label="DOB"
                type="date"
                value={traveller.dob || ""}
                onChange={(value) => update(index, "dob", value)}
              />

              <InputBox
                label="Age"
                type="number"
                value={traveller.age || ""}
                onChange={(value) => update(index, "age", value)}
              />

              <InputBox
                label={`Passport Number${isPassportRequired ? " *" : ""}`}
                value={traveller.passportNumber || ""}
                onChange={(value) => update(index, "passportNumber", value)}
              />

              <InputBox
                label={`Passport Expiry${isPassportRequired ? " *" : ""}`}
                type="date"
                value={traveller.passportExpiry || ""}
                onChange={(value) => update(index, "passportExpiry", value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InputBox({
  label,
  value,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1 block break-words text-xs font-bold text-gray-600">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-400"
      />
    </div>
  );
}
