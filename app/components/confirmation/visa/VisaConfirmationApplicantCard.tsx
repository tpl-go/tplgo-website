"use client";

import { IdCard, UserRound } from "lucide-react";

type Props = {
  applicants: any[];
  passports: any[];
};

export default function VisaConfirmationApplicantCard({
  applicants,
  passports,
}: Props) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black text-gray-950">
        Applicant Details
      </h2>

      <div className="mt-5 space-y-4">
        {(applicants || []).map((applicant, index) => {
          const passport = passports?.[index] || {};

          return (
            <div
              key={index}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-orange-600">
                    <UserRound size={18} />
                    <p className="text-sm font-black">
                      Applicant {index + 1}
                    </p>
                  </div>

                  <h3 className="text-lg font-black text-gray-950">
                    {applicant?.title} {applicant?.firstName}{" "}
                    {applicant?.lastName}
                  </h3>

                  <p className="mt-1 text-xs font-semibold text-gray-600">
                    DOB: {applicant?.dob || "N/A"} • Gender:{" "}
                    {applicant?.gender || "N/A"}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-gray-600">
                    Mobile: {applicant?.mobile || "N/A"} • Email:{" "}
                    {applicant?.email || "N/A"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4 text-right">
                  <IdCard size={18} className="ml-auto mb-2 text-orange-600" />
                  <p className="text-xs font-bold text-gray-500">
                    Passport No.
                  </p>
                  <p className="mt-1 font-black text-gray-950">
                    {passport?.passportNumber || "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-xl bg-white p-3">
                  <p className="text-xs font-bold text-gray-500">
                    Issue Date
                  </p>
                  <p className="mt-1 text-sm font-black text-gray-950">
                    {passport?.issueDate || "N/A"}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-3">
                  <p className="text-xs font-bold text-gray-500">
                    Expiry Date
                  </p>
                  <p className="mt-1 text-sm font-black text-gray-950">
                    {passport?.expiryDate || "N/A"}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-3">
                  <p className="text-xs font-bold text-gray-500">
                    Issue Place
                  </p>
                  <p className="mt-1 text-sm font-black text-gray-950">
                    {passport?.issuePlace || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}