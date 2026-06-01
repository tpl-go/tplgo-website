"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { CheckCircle2, FileText } from "lucide-react";

type Props = {
  uploadedDocsByApplicant: any[][];
};

export default function VisaConfirmationDocumentCard({
  uploadedDocsByApplicant,
}: Props) {
  return (
    <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-6">
      <h2 className="break-words text-lg font-black text-gray-950 md:text-xl">
        Uploaded Documents
      </h2>

      <div className="mt-4 space-y-4 md:mt-5">
        {(uploadedDocsByApplicant || []).map((docs, index) => (
          <div
            key={index}
            className="min-w-0 rounded-2xl border border-gray-200 bg-gray-50 p-4"
          >
            <p className="mb-3 break-words text-sm font-black text-gray-950">
              Applicant {index + 1}
            </p>

            <div className="flex flex-wrap gap-2">
              {(docs || []).map((doc: any) => (
                <span
                  key={`${doc.name}-${doc.fileName}`}
                  className="inline-flex max-w-full items-start gap-2 rounded-2xl border border-green-200 bg-green-50 px-3 py-2 text-xs font-bold leading-5 text-green-800"
                >
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                  <span className="min-w-0 break-words">{doc.name}</span>
                  <span className="min-w-0 break-words text-green-600">
                    ({doc.fileName})
                  </span>
                </span>
              ))}

              {!docs?.length && (
                <span className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                  <FileText size={14} className="shrink-0" />
                  <span className="min-w-0 break-words">
                    No document uploaded
                  </span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
