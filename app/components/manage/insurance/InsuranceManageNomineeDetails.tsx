"use client";

export type InsuranceManageNominee = {
  fullName?: string;
  relationship?: string;
  dob?: string;
  mobile?: string;
  email?: string;
  address?: string;
};

type Props = {
  nominee: InsuranceManageNominee;
  onChange: (nominee: InsuranceManageNominee) => void;
  onSave: () => void;
};

export default function InsuranceManageNomineeDetails({
  nominee,
  onChange,
  onSave,
}: Props) {
  const update = (key: keyof InsuranceManageNominee, value: string) => {
    onChange({
      ...nominee,
      [key]: value,
    });
  };

  return (
    <div className="rounded-[30px] border border-black/5 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-black text-[#111827]">
            Nominee / Emergency Contact
          </h2>
          <p className="text-sm font-semibold text-[#6b7280]">
            Update nominee and emergency contact details.
          </p>
        </div>

        <button
          type="button"
          onClick={onSave}
          className="h-11 rounded-2xl bg-orange-500 px-5 text-sm font-black text-white hover:bg-orange-600"
        >
          Save Nominee Details
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InputBox
          label="Full Name"
          value={nominee.fullName || ""}
          onChange={(value) => update("fullName", value)}
        />

        <div>
          <label className="mb-1 block text-xs font-bold text-gray-600">
            Relationship
          </label>
          <select
            value={nominee.relationship || ""}
            onChange={(e) => update("relationship", e.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-400"
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

        <InputBox
          label="Date of Birth"
          type="date"
          value={nominee.dob || ""}
          onChange={(value) => update("dob", value)}
        />

        <InputBox
          label="Mobile Number"
          value={nominee.mobile || ""}
          onChange={(value) => update("mobile", value)}
        />

        <InputBox
          label="Email Address"
          type="email"
          value={nominee.email || ""}
          onChange={(value) => update("email", value)}
        />

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-bold text-gray-600">
            Address
          </label>
          <textarea
            value={nominee.address || ""}
            onChange={(e) => update("address", e.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-400"
            placeholder="Emergency contact address"
          />
        </div>
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
    <div>
      <label className="mb-1 block text-xs font-bold text-gray-600">
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