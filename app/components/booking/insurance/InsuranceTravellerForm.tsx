"use client";

export type InsuranceTraveller = {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  dob: string;
  age: string;
  gender: string;
  passportNumber: string;
  passportExpiry: string;
};

type Props = {
  travellers: InsuranceTraveller[];
  onChange: (travellers: InsuranceTraveller[]) => void;
  isPassportRequired?: boolean;
};

export function createInsuranceTravellersFromAges(
  travellerAges: string[] | number[] = []
): InsuranceTraveller[] {
  const ages = travellerAges.length > 0 ? travellerAges : ["30"];

  return ages.map((age, index) => ({
    id: `traveller-${index + 1}`,
    title: "Mr",
    firstName: "",
    lastName: "",
    dob: "",
    age: String(age || ""),
    gender: "Male",
    passportNumber: "",
    passportExpiry: "",
  }));
}

export default function InsuranceTravellerForm({
  travellers,
  onChange,
  isPassportRequired = false,
}: Props) {
  const updateTraveller = (
    index: number,
    key: keyof InsuranceTraveller,
    value: string
  ) => {
    const next = [...travellers];
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  };

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-extrabold text-gray-950">
          Traveller Details
        </h2>
        <p className="text-sm font-semibold text-gray-500">
          Enter details exactly as per passport or government ID.
        </p>

        {isPassportRequired && (
          <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-xs font-extrabold text-blue-800">
              Passport details are required for international / foreign travel insurance.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-5">
        {travellers.map((traveller, index) => (
          <div
            key={traveller.id}
            className="rounded-2xl border border-orange-100 bg-orange-50/40 p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-base font-extrabold text-gray-950">
                  Traveller {index + 1}
                </p>
                <p className="text-xs font-semibold text-gray-500">
                  Age: {traveller.age || "Not added"}
                </p>
              </div>

              {Number(traveller.age) >= 60 && (
                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                  Senior Traveller
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">
                  Title
                </label>
                <select
                  value={traveller.title}
                  onChange={(e) =>
                    updateTraveller(index, "title", e.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-400"
                >
                  <option>Mr</option>
                  <option>Ms</option>
                  <option>Mrs</option>
                  <option>Master</option>
                  <option>Miss</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">
                  First Name
                </label>
                <input
                  value={traveller.firstName}
                  onChange={(e) =>
                    updateTraveller(index, "firstName", e.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-400"
                  placeholder="First name"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">
                  Last Name
                </label>
                <input
                  value={traveller.lastName}
                  onChange={(e) =>
                    updateTraveller(index, "lastName", e.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-400"
                  placeholder="Last name"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">
                  Gender
                </label>
                <select
                  value={traveller.gender}
                  onChange={(e) =>
                    updateTraveller(index, "gender", e.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-400"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={traveller.dob}
                  onChange={(e) =>
                    updateTraveller(index, "dob", e.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">
                  Age
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={traveller.age}
                  onChange={(e) =>
                    updateTraveller(index, "age", e.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-400"
                  placeholder="Age"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">
                  Passport Number{" "}
                  {isPassportRequired && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <input
                  value={traveller.passportNumber}
                  onChange={(e) =>
                    updateTraveller(index, "passportNumber", e.target.value)
                  }
                  className={`h-11 w-full rounded-xl border px-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-400 ${
                    isPassportRequired && !traveller.passportNumber
                      ? "border-red-200 bg-red-50"
                      : "border-gray-200 bg-white"
                  }`}
                  placeholder={
                    isPassportRequired
                      ? "Required for international"
                      : "Optional for domestic"
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">
                  Passport Expiry{" "}
                  {isPassportRequired && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <input
                  type="date"
                  value={traveller.passportExpiry}
                  onChange={(e) =>
                    updateTraveller(index, "passportExpiry", e.target.value)
                  }
                  className={`h-11 w-full rounded-xl border px-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-400 ${
                    isPassportRequired && !traveller.passportExpiry
                      ? "border-red-200 bg-red-50"
                      : "border-gray-200 bg-white"
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}