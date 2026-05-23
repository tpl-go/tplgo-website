"use client";

type Passport = {
  passportNumber: string;
  issueDate: string;
  expiryDate: string;
  issuePlace: string;
};

type Props = {
  passport: Passport;
  onChange: (passport: Passport) => void;
  applicantIndex?: number;
};

export default function VisaPassportDetailsCard({
  passport,
  onChange,
  applicantIndex = 0,
}: Props) {
  const update = (key: keyof Passport, value: string) => {
    onChange({ ...passport, [key]: value });
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-extrabold text-gray-950">
        Applicant {applicantIndex + 1} Passport Details
      </h2>
      <p className="mt-1 text-sm font-semibold text-gray-600">
        Passport should be valid as per destination visa rules.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-bold text-gray-800">
            Passport Number
          </label>
          <input
            value={passport.passportNumber}
            onChange={(e) => update("passportNumber", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold uppercase text-gray-950 outline-none focus:border-orange-500"
            placeholder="Passport number"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-gray-800">
            Place of Issue
          </label>
          <input
            value={passport.issuePlace}
            onChange={(e) => update("issuePlace", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-950 outline-none focus:border-orange-500"
            placeholder="Issue place"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-gray-800">
            Issue Date
          </label>
          <input
            type="date"
            value={passport.issueDate}
            onChange={(e) => update("issueDate", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-950 outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-gray-800">
            Expiry Date
          </label>
          <input
            type="date"
            value={passport.expiryDate}
            onChange={(e) => update("expiryDate", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-950 outline-none focus:border-orange-500"
          />
        </div>
      </div>
    </div>
  );
}