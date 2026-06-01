"use client";

type Applicant = {
  title: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  email: string;
  mobile: string;
};

type Props = {
  applicant: Applicant;
  onChange: (applicant: Applicant) => void;
  isAuthenticated?: boolean;
  userName?: string;
  onLoginClick?: () => void;
  applicantIndex?: number;
  showLoginBox?: boolean;
};

export default function VisaApplicantDetailsCard({
  applicant,
  onChange,
  isAuthenticated,
  userName,
  onLoginClick,
  applicantIndex = 0,
  showLoginBox = true,
}: Props) {
  const update = (key: keyof Applicant, value: string) => {
    onChange({ ...applicant, [key]: value });
  };

  return (
    <div className="min-w-0 rounded-[22px] border border-gray-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="break-words text-[19px] font-extrabold leading-6 text-gray-950 md:text-xl">
            Applicant {applicantIndex + 1} Details
          </h2>
          <p className="mt-1 break-words text-sm font-semibold leading-5 text-gray-600">
            Enter details as per passport.
          </p>
        </div>

        {showLoginBox && (
          <>
            {isAuthenticated ? (
              <div className="break-words rounded-full bg-green-100 px-4 py-2 text-xs font-extrabold text-green-700">
                Logged in{userName ? ` as ${userName}` : ""}
              </div>
            ) : (
              <button
                type="button"
                onClick={onLoginClick}
                className="min-h-10 rounded-full bg-blue-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-blue-700"
              >
                Login / Signup
              </button>
            )}
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-bold text-gray-800">
            Title
          </label>
          <select
            value={applicant.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full min-w-0 rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-950 outline-none focus:border-orange-500"
          >
            <option>Mr</option>
            <option>Ms</option>
            <option>Mrs</option>
            <option>Master</option>
            <option>Miss</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-gray-800">
            Gender
          </label>
          <select
            value={applicant.gender}
            onChange={(e) => update("gender", e.target.value)}
            className="w-full min-w-0 rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-950 outline-none focus:border-orange-500"
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-gray-800">
            First Name
          </label>
          <input
            value={applicant.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            className="w-full min-w-0 rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-950 outline-none focus:border-orange-500"
            placeholder="First name"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-gray-800">
            Last Name
          </label>
          <input
            value={applicant.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            className="w-full min-w-0 rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-950 outline-none focus:border-orange-500"
            placeholder="Last name"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-gray-800">
            Date of Birth
          </label>
          <input
            type="date"
            value={applicant.dob}
            onChange={(e) => update("dob", e.target.value)}
            className="w-full min-w-0 rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-950 outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-gray-800">
            Mobile Number
          </label>
          <input
            value={applicant.mobile}
            onChange={(e) => update("mobile", e.target.value)}
            className="w-full min-w-0 rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-950 outline-none focus:border-orange-500"
            placeholder="Mobile number"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-bold text-gray-800">
            Email Address
          </label>
          <input
            value={applicant.email}
            onChange={(e) => update("email", e.target.value)}
            className="w-full min-w-0 rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-950 outline-none focus:border-orange-500"
            placeholder="Email address"
          />
        </div>
      </div>
    </div>
  );
}
