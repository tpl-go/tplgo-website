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
    <div className="min-w-0 rounded-[22px] border border-gray-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-6">
      <h2 className="break-words text-[19px] font-extrabold leading-6 text-gray-950 md:text-xl">
        Applicant {applicantIndex + 1} Passport Details
      </h2>
      <p className="mt-1 break-words text-sm font-semibold leading-5 text-gray-600">
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
            className="w-full min-w-0 rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold uppercase text-gray-950 outline-none focus:border-orange-500"
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
            className="w-full min-w-0 rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-950 outline-none focus:border-orange-500"
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
            className="w-full min-w-0 rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-950 outline-none focus:border-orange-500"
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
            className="w-full min-w-0 rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-950 outline-none focus:border-orange-500"
          />
        </div>
      </div>
    </div>
  );
}
