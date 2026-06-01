"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

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
    <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-6">
      <h2 className="break-words text-lg font-black text-gray-950 md:text-xl">
        Applicant Details
      </h2>

      <div className="mt-4 space-y-4 md:mt-5">
        {(applicants || []).map((applicant, index) => {
          const passport = passports?.[index] || {};

          return (
            <div
              key={index}
              className="min-w-0 rounded-2xl border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2 text-orange-600">
                    <UserRound size={18} />
                    <p className="break-words text-sm font-black">
                      Applicant {index + 1}
                    </p>
                  </div>

                  <h3 className="break-words text-lg font-black leading-6 text-gray-950">
                    {applicant?.title} {applicant?.firstName}{" "}
                    {applicant?.lastName}
                  </h3>

                  <p className="mt-1 break-words text-xs font-semibold leading-5 text-gray-600">
                    DOB: {applicant?.dob || "N/A"} • Gender:{" "}
                    {applicant?.gender || "N/A"}
                  </p>

                  <p className="mt-1 break-words text-xs font-semibold leading-5 text-gray-600">
                    Mobile: {applicant?.mobile || "N/A"} • Email:{" "}
                    {applicant?.email || "N/A"}
                  </p>
                </div>

                <div className="w-full rounded-2xl bg-white p-4 text-left md:w-auto md:text-right">
                  <IdCard size={18} className="mb-2 text-orange-600 md:ml-auto" />
                  <p className="text-xs font-bold text-gray-500">
                    Passport No.
                  </p>
                  <p className="mt-1 break-words font-black text-gray-950">
                    {passport?.passportNumber || "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-white p-3">
                  <p className="text-xs font-bold text-gray-500">
                    Issue Date
                  </p>
                  <p className="mt-1 break-words text-sm font-black text-gray-950">
                    {passport?.issueDate || "N/A"}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-3">
                  <p className="text-xs font-bold text-gray-500">
                    Expiry Date
                  </p>
                  <p className="mt-1 break-words text-sm font-black text-gray-950">
                    {passport?.expiryDate || "N/A"}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-3">
                  <p className="text-xs font-bold text-gray-500">
                    Issue Place
                  </p>
                  <p className="mt-1 break-words text-sm font-black text-gray-950">
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
