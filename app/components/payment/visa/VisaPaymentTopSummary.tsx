"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  CheckCircle2,
  Clock,
  FileCheck2,
  Globe2,
  IdCard,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

type Props = {
  payload: any;
};

export default function VisaPaymentTopSummary({ payload }: Props) {
  const option = payload?.option || {};
  const searchData = payload?.searchData || {};
  const applicants = payload?.applicants || [];
  const passports = payload?.passports || [];
  const uploadedDocsByApplicant = payload?.uploadedDocsByApplicant || [];

  return (
    <div className="min-w-0 rounded-2xl border border-[#d9e2ec] bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] md:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-extrabold uppercase tracking-wide text-[#ea580c]">
            Visa Application Payment
          </div>

          <h1 className="mt-1 break-words text-[21px] font-black leading-7 text-[#111827] md:text-[24px] md:leading-8">
            {option?.title || "Visa Application"}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] font-bold text-[#4b5563] md:gap-3 md:text-[13px]">
            <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#fff7ed] px-2.5 py-1 text-[#9a3412]">
              <Globe2 size={15} />
              <span className="min-w-0 break-words">
                {option?.country || searchData?.destinationCountry || "Destination"}
              </span>
            </span>

            <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#f8fafc] px-2.5 py-1">
              <FileCheck2 size={15} />
              <span className="min-w-0 break-words">
                {option?.visaType || searchData?.visaType || "Visa"}
              </span>
            </span>

            <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#f8fafc] px-2.5 py-1">
              <Users size={15} />
              <span>
                {payload?.travellers || applicants.length || 1} Applicant
                {(payload?.travellers || applicants.length || 1) > 1 ? "s" : ""}
              </span>
            </span>
          </div>
        </div>

        <div className="w-full rounded-2xl bg-[#f8fafc] px-4 py-3 text-left sm:w-auto sm:text-right">
          <div className="text-[12px] font-bold text-[#64748b]">
            Application Stage
          </div>
          <div className="text-[15px] font-black text-[#111827]">
            Ready for Payment
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 md:mt-5 md:grid-cols-4">
        <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4">
          <Clock size={17} className="mb-2 text-[#ea580c]" />
          <div className="text-[12px] font-bold text-[#6b7280]">
            Processing Time
          </div>
          <div className="mt-1 break-words text-[14px] font-black text-[#111827]">
            {option?.processingTime || "As per embassy"}
          </div>
        </div>

        <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4">
          <ShieldCheck size={17} className="mb-2 text-[#ea580c]" />
          <div className="text-[12px] font-bold text-[#6b7280]">Validity</div>
          <div className="mt-1 break-words text-[14px] font-black text-[#111827]">
            {option?.validity || "As approved"}
          </div>
        </div>

        <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4">
          <IdCard size={17} className="mb-2 text-[#ea580c]" />
          <div className="text-[12px] font-bold text-[#6b7280]">
            Stay Duration
          </div>
          <div className="mt-1 break-words text-[14px] font-black text-[#111827]">
            {option?.stayDuration || "As approved"}
          </div>
        </div>

        <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4">
          <Globe2 size={17} className="mb-2 text-[#ea580c]" />
          <div className="text-[12px] font-bold text-[#6b7280]">
            Nationality
          </div>
          <div className="mt-1 break-words text-[14px] font-black text-[#111827]">
            {searchData?.nationality || "Not available"}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] p-4 md:mt-5">
        <div className="mb-3 flex items-center gap-2">
          <UserRound size={18} className="text-[#ea580c]" />
          <h2 className="text-[16px] font-black text-[#111827]">
            Applicant & Document Summary
          </h2>
        </div>

        <div className="grid gap-3">
          {applicants.map((applicant: any, index: number) => {
            const passport = passports?.[index] || {};
            const docs = uploadedDocsByApplicant?.[index] || [];

            return (
              <div
                key={index}
                className="min-w-0 rounded-xl border border-[#e5e7eb] bg-white p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-black text-[#ea580c]">
                      Applicant {index + 1}
                    </div>

                    <div className="mt-1 break-words text-[17px] font-black leading-6 text-[#111827]">
                      {applicant?.title} {applicant?.firstName}{" "}
                      {applicant?.lastName}
                    </div>

                    <div className="mt-1 break-words text-[12px] font-semibold leading-5 text-[#6b7280]">
                      DOB: {applicant?.dob || "Not available"} • Gender:{" "}
                      {applicant?.gender || "Not available"}
                    </div>

                    <div className="mt-1 break-words text-[12px] font-semibold leading-5 text-[#6b7280]">
                      Mobile: {applicant?.mobile || "Not available"} • Email:{" "}
                      {applicant?.email || "Not available"}
                    </div>
                  </div>

                  <div className="w-full rounded-xl bg-[#f9fafb] px-3 py-2 text-left sm:w-auto sm:text-right">
                    <div className="text-[11px] font-bold text-[#6b7280]">
                      Passport No.
                    </div>
                    <div className="break-words text-[13px] font-black text-[#111827]">
                      {passport?.passportNumber || "Not available"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-lg bg-[#f9fafb] px-3 py-2">
                    <div className="text-[11px] font-bold text-[#6b7280]">
                      Issue Date
                    </div>
                    <div className="break-words text-[12px] font-black text-[#111827]">
                      {passport?.issueDate || "Not available"}
                    </div>
                  </div>

                  <div className="rounded-lg bg-[#f9fafb] px-3 py-2">
                    <div className="text-[11px] font-bold text-[#6b7280]">
                      Expiry Date
                    </div>
                    <div className="break-words text-[12px] font-black text-[#111827]">
                      {passport?.expiryDate || "Not available"}
                    </div>
                  </div>

                  <div className="rounded-lg bg-[#f9fafb] px-3 py-2">
                    <div className="text-[11px] font-bold text-[#6b7280]">
                      Issue Place
                    </div>
                    <div className="break-words text-[12px] font-black text-[#111827]">
                      {passport?.issuePlace || "Not available"}
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="mb-2 text-[12px] font-black text-[#111827]">
                    Uploaded Documents
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {docs.length > 0 ? (
                      docs.map((doc: any) => (
                        <span
                          key={`${index}-${doc.name}-${doc.fileName}`}
                          className="inline-flex max-w-full items-center gap-1 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[11px] font-bold text-green-800"
                        >
                          <CheckCircle2 size={13} />
                          <span className="min-w-0 break-words">{doc.name}</span>
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-bold text-red-700">
                        No documents uploaded
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {payload?.specialRequest && (
        <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="text-[13px] font-black text-[#111827]">
            Special Request
          </div>
          <p className="mt-1 text-[13px] font-semibold text-[#6b7280]">
            {payload.specialRequest}
          </p>
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50 p-4">
        <div className="text-[13px] font-black text-[#111827]">
          Important Visa Note
        </div>
        <p className="mt-1 text-[12px] font-semibold leading-relaxed text-[#6b7280]">
          Visa approval, validity and stay duration are subject to embassy,
          immigration or VFS decision. TPL will verify documents and support the
          submission process after successful payment.
        </p>
      </div>
    </div>
  );
}
