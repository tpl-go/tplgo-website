"use client";

import { CheckCircle2, FileText } from "lucide-react";

type Props = {
  uploadedDocsByApplicant: any[][];
};

export default function VisaConfirmationDocumentCard({
  uploadedDocsByApplicant,
}: Props) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black text-gray-950">
        Uploaded Documents
      </h2>

      <div className="mt-5 space-y-4">
        {(uploadedDocsByApplicant || []).map((docs, index) => (
          <div
            key={index}
            className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
          >
            <p className="mb-3 text-sm font-black text-gray-950">
              Applicant {index + 1}
            </p>

            <div className="flex flex-wrap gap-2">
              {(docs || []).map((doc: any) => (
                <span
                  key={`${doc.name}-${doc.fileName}`}
                  className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-800"
                >
                  <CheckCircle2 size={14} />
                  {doc.name}
                  <span className="text-green-600">
                    ({doc.fileName})
                  </span>
                </span>
              ))}

              {!docs?.length && (
                <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                  <FileText size={14} />
                  No document uploaded
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}