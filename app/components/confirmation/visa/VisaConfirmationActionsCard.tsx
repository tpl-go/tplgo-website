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
  onDownloadApplication,
  onDownloadInvoice,
  onPrintApplication,
  onCheckStatus,
  onGoToMyBookings,
  onGoHome,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-5 lg:sticky lg:top-5">
      <div className="break-words text-lg font-black text-gray-950 md:text-xl">
        Application Actions
      </div>

      <p className="mt-1 break-words text-xs font-semibold leading-5 text-gray-600">
        Application ID:{" "}
        <span className="break-words font-black text-gray-950">
          {applicationId}
        </span>
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 md:mt-5 lg:grid-cols-1">
        <button
          type="button"
          onClick={onDownloadApplication}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 px-3 py-2 text-sm font-black text-white hover:bg-orange-700"
        >
          <Download size={17} />
          <span className="break-words text-center">Download Application</span>
        </button>

        <button
          type="button"
          onClick={onCheckStatus}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-sm font-black text-white hover:bg-black"
        >
          <FileSearch size={17} />
          <span className="break-words text-center">Check Status</span>
        </button>

        <button
          type="button"
          onClick={onPrintApplication}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-black text-gray-900 hover:bg-gray-50"
        >
          <Printer size={17} />
          <span className="break-words text-center">Print Application</span>
        </button>

        <button
          type="button"
          onClick={onDownloadInvoice}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-black text-gray-900 hover:bg-gray-50"
        >
          <Download size={17} />
          <span className="break-words text-center">Download Invoice</span>
        </button>

        <button
          type="button"
          onClick={onGoToMyBookings}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-black text-blue-700 hover:bg-blue-100"
        >
          <FileSearch size={17} />
          <span className="break-words text-center">My Applications</span>
        </button>

        <button
          type="button"
          onClick={onGoHome}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-black text-gray-900 hover:bg-gray-50"
        >
          <Home size={17} />
          <span className="break-words text-center">Go Home</span>
        </button>
      </div>

      <div className="mt-4 rounded-2xl bg-gray-50 p-4 md:mt-5">
        <p className="text-xs font-black text-gray-950">Need help?</p>

        <div className="mt-3 space-y-2 text-xs font-semibold text-gray-600">
          <p className="flex items-start gap-2">
            <MessageCircle size={14} className="mt-0.5 shrink-0" />
            <span className="min-w-0 break-words">+91 9649400299</span>
          </p>

          <p className="flex items-start gap-2">
            <Mail size={14} className="mt-0.5 shrink-0" />
            <span className="min-w-0 break-words">support@tplgo.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}
