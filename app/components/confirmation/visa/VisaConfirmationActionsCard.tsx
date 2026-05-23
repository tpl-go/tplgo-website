"use client";

import {
  Download,
  FileSearch,
  Home,
  Mail,
  MessageCircle,
  Printer,
} from "lucide-react";

type Props = {
  applicationId: string;
  email?: string;
  mobile?: string;
  onDownloadApplication: () => void;
  onDownloadInvoice: () => void;
  onPrintApplication: () => void;
  onCheckStatus: () => void;
  onGoToMyBookings: () => void;
  onGoHome: () => void;
};

export default function VisaConfirmationActionsCard({
  applicationId,
  email,
  mobile,
  onDownloadApplication,
  onDownloadInvoice,
  onPrintApplication,
  onCheckStatus,
  onGoToMyBookings,
  onGoHome,
}: Props) {
  return (
    <div className="sticky top-5 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="text-xl font-black text-gray-950">
        Application Actions
      </div>

      <p className="mt-1 text-xs font-semibold text-gray-600">
        Application ID:{" "}
        <span className="font-black text-gray-950">{applicationId}</span>
      </p>

      <div className="mt-5 grid gap-3">
        <button
          type="button"
          onClick={onDownloadApplication}
          className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-black text-white hover:bg-orange-700"
        >
          <Download size={17} />
          Download Application
        </button>

        <button
          type="button"
          onClick={onCheckStatus}
          className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-black text-white hover:bg-black"
        >
          <FileSearch size={17} />
          Check Status
        </button>

        <button
          type="button"
          onClick={onPrintApplication}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-black text-gray-900 hover:bg-gray-50"
        >
          <Printer size={17} />
          Print Application
        </button>

        <button
          type="button"
          onClick={onDownloadInvoice}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-black text-gray-900 hover:bg-gray-50"
        >
          <Download size={17} />
          Download Invoice
        </button>

        <button
          type="button"
          onClick={onGoToMyBookings}
          className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-black text-blue-700 hover:bg-blue-100"
        >
          <FileSearch size={17} />
          My Applications
        </button>

        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-black text-gray-900 hover:bg-gray-50"
        >
          <Home size={17} />
          Go Home
        </button>
      </div>

      <div className="mt-5 rounded-2xl bg-gray-50 p-4">
        <p className="text-xs font-black text-gray-950">Need help?</p>

        <div className="mt-3 space-y-2 text-xs font-semibold text-gray-600">
          {mobile && (
            <p className="flex items-center gap-2">
              <MessageCircle size={14} />
              {mobile}
            </p>
          )}

          {email && (
            <p className="flex items-center gap-2">
              <Mail size={14} />
              {email}
            </p>
          )}

          {!mobile && !email && (
            <p>TPL Visa Desk will contact you for updates.</p>
          )}
        </div>
      </div>
    </div>
  );
}