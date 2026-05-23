"use client";

import { CheckCircle2, FileText, UploadCloud, X } from "lucide-react";

export type VisaUploadedDoc = {
  name: string;
  fileName: string;
  size: number;
};

type Props = {
  documents: string[];
  acceptedDocs: string[];
  uploadedDocs: VisaUploadedDoc[];

  onAcceptedChange: (docs: string[]) => void;
  onUploadedChange: (docs: VisaUploadedDoc[]) => void;

  applicantIndex?: number;
};

export default function VisaDocumentChecklistCard({
  documents,
  acceptedDocs,
  uploadedDocs,
  onAcceptedChange,
  onUploadedChange,
  applicantIndex = 0,
}: Props) {
  const getUploadedDoc = (doc: string) => {
    return uploadedDocs.find((item) => item.name === doc) || null;
  };

  const handleUpload = (doc: string, file?: File | null) => {
    if (!file) return;

    const nextUploaded = uploadedDocs.filter((item) => item.name !== doc);

    onUploadedChange([
      ...nextUploaded,
      {
        name: doc,
        fileName: file.name,
        size: file.size,
      },
    ]);

    if (!acceptedDocs.includes(doc)) {
      onAcceptedChange([...acceptedDocs, doc]);
    }
  };

  const removeUploadedDoc = (doc: string) => {
    onUploadedChange(uploadedDocs.filter((item) => item.name !== doc));
    onAcceptedChange(acceptedDocs.filter((item) => item !== doc));
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-extrabold text-gray-950">
        Applicant {applicantIndex + 1} Document Upload
      </h2>

      <p className="mt-1 text-sm font-semibold text-gray-600">
        Upload required documents for this applicant.
      </p>

      <div className="mt-5 grid gap-3">
        {documents.map((doc) => {
          const uploaded = getUploadedDoc(doc);

          return (
            <div
              key={doc}
              className={`rounded-2xl border p-4 transition ${
                uploaded
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-extrabold text-gray-950">{doc}</p>

                  <p className="mt-1 text-xs font-semibold text-gray-600">
                    PDF, JPG or PNG preferred
                  </p>
                </div>

                {uploaded ? (
                  <CheckCircle2 size={22} className="text-green-600" />
                ) : (
                  <UploadCloud size={22} className="text-gray-500" />
                )}
              </div>

              {uploaded ? (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-green-200 bg-white px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-green-700" />

                    <div>
                      <p className="text-sm font-extrabold text-gray-950">
                        {uploaded.fileName}
                      </p>

                      <p className="text-xs font-semibold text-gray-500">
                        {(uploaded.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeUploadedDoc(doc)}
                    className="rounded-full p-2 text-red-500 hover:bg-red-50"
                  >
                    <X size={17} />
                  </button>
                </div>
              ) : (
                <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3 text-sm font-extrabold text-orange-600 hover:border-orange-400 hover:bg-orange-50">
                  <UploadCloud size={18} />

                  Upload Document

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) =>
                      handleUpload(doc, e.target.files?.[0])
                    }
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}