"use client";

import {
  Download,
  Home,
  Mail,
  MessageCircle,
  Printer,
  ShieldCheck,
  UserRound,
} from "lucide-react";

type Props = {
  policyNumber: string;
  email?: string;
  mobile?: string;
  onDownloadPolicy: () => void;
  onDownloadInvoice: () => void;
  onPrintPolicy: () => void;
  onEmailPolicy?: () => void;
  onWhatsAppPolicy?: () => void;
  onGoToMyBookings: () => void;
  onGoHome: () => void;
};

export default function InsuranceConfirmationActionsCard({
  policyNumber,
  email,
  mobile,
  onDownloadPolicy,
  onDownloadInvoice,
  onPrintPolicy,
  onEmailPolicy,
  onWhatsAppPolicy,
  onGoToMyBookings,
  onGoHome,
}: Props) {
  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-5 lg:sticky lg:top-6">
      <div className="mb-4 md:mb-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
          <ShieldCheck size={24} />
        </div>

        <h2 className="mt-3 break-words text-lg font-black text-gray-950">
          Policy Actions
        </h2>

        <p className="mt-1 break-words text-xs font-semibold leading-5 text-gray-500">
          Policy No: {policyNumber}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:block lg:space-y-3">
        <button
          type="button"
          onClick={onDownloadPolicy}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-sm font-black text-white hover:bg-orange-600"
        >
          <Download size={17} />
          <span className="break-words text-center">Download Policy</span>
        </button>

        <button
          type="button"
          onClick={onDownloadInvoice}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-black text-orange-700 hover:bg-orange-100"
        >
          <Download size={17} />
          <span className="break-words text-center">Download Invoice</span>
        </button>

        <button
          type="button"
          onClick={onPrintPolicy}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-black text-gray-700 hover:bg-gray-50"
        >
          <Printer size={17} />
          <span className="break-words text-center">Print Policy</span>
        </button>

        <button
          type="button"
          onClick={onEmailPolicy}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-black text-gray-700 hover:bg-gray-50"
        >
          <Mail size={17} />
          <span className="break-words text-center">Email Policy</span>
        </button>

        <button
          type="button"
          onClick={onWhatsAppPolicy}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-black text-green-700 hover:bg-green-100"
        >
          <MessageCircle size={17} />
          <span className="break-words text-center">WhatsApp Policy</span>
        </button>

        <button
          type="button"
          onClick={onGoToMyBookings}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-black text-blue-700 hover:bg-blue-100"
        >
          <UserRound size={17} />
          <span className="break-words text-center">Go to My Bookings</span>
        </button>

        <button
          type="button"
          onClick={onGoHome}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-black text-gray-700 hover:bg-gray-50"
        >
          <Home size={17} />
          <span className="break-words text-center">Go Home</span>
        </button>
      </div>

      <div className="mt-4 rounded-2xl bg-gray-50 p-4 md:mt-5">
        <p className="text-xs font-black text-gray-700">Delivery Details</p>
        <p className="mt-2 break-words text-xs font-semibold leading-5 text-gray-500">
          {email ? `Email: ${email}` : "Email not available"}
        </p>
        <p className="mt-1 break-words text-xs font-semibold leading-5 text-gray-500">
          {mobile ? `Mobile: ${mobile}` : "Mobile not available"}
        </p>
      </div>
    </aside>
  );
}
