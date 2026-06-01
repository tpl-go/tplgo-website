"use client";

export type InsuranceNominee = {
  fullName: string;
  relationship: string;
  dob: string;
  mobile: string;
  email: string;
  address: string;
};

type Props = {
  nominee: InsuranceNominee;
  onChange: (nominee: InsuranceNominee) => void;
};

export default function InsuranceNomineeForm({
  nominee,
  onChange,
}: Props) {
  const update = (key: keyof InsuranceNominee, value: string) => {
    onChange({
      ...nominee,
      [key]: value,
    });
  };

  return (
    <section className="min-w-0 rounded-[22px] border border-gray-100 bg-white p-4 shadow-sm md:rounded-3xl md:p-5">
      <div className="mb-5">
        <h2 className="break-words text-lg font-extrabold text-gray-950">
          Nominee & Emergency Contact
        </h2>

        <p className="break-words text-sm font-semibold leading-5 text-gray-500">
          Add nominee details for claim support and emergency coordination.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-600">
            Full Name
          </label>

          <input
            value={nominee.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            className="h-11 w-full min-w-0 rounded-xl border border-gray-200 px-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-400"
            placeholder="Nominee full name"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-gray-600">
            Relationship
          </label>

          <select
            value={nominee.relationship}
            onChange={(e) => update("relationship", e.target.value)}
            className="h-11 w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-400"
          >
            <option value="">Select relationship</option>
            <option>Father</option>
            <option>Mother</option>
            <option>Spouse</option>
            <option>Brother</option>
            <option>Sister</option>
            <option>Son</option>
            <option>Daughter</option>
            <option>Friend</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-gray-600">
            Date of Birth
          </label>

          <input
            type="date"
            value={nominee.dob}
            onChange={(e) => update("dob", e.target.value)}
            className="h-11 w-full min-w-0 rounded-xl border border-gray-200 px-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-400"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-gray-600">
            Mobile Number
          </label>

          <input
            value={nominee.mobile}
            onChange={(e) => update("mobile", e.target.value)}
            className="h-11 w-full min-w-0 rounded-xl border border-gray-200 px-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-400"
            placeholder="Emergency mobile"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-gray-600">
            Email Address
          </label>

          <input
            type="email"
            value={nominee.email}
            onChange={(e) => update("email", e.target.value)}
            className="h-11 w-full min-w-0 rounded-xl border border-gray-200 px-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-400"
            placeholder="Email"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-bold text-gray-600">
            Address
          </label>

          <textarea
            value={nominee.address}
            onChange={(e) => update("address", e.target.value)}
            rows={3}
            className="w-full min-w-0 rounded-2xl border border-gray-200 px-3 py-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-400"
            placeholder="Emergency contact address"
          />
        </div>
      </div>
    </section>
  );
}
