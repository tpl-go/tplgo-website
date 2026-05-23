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
    <aside className="sticky top-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
          <ShieldCheck size={24} />
        </div>

        <h2 className="mt-3 text-lg font-black text-gray-950">
          Policy Actions
        </h2>

        <p className="mt-1 break-all text-xs font-semibold text-gray-500">
          Policy No: {policyNumber}
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={onDownloadPolicy}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-black text-white hover:bg-orange-600"
        >
          <Download size={17} />
          Download Policy
        </button>

        <button
          type="button"
          onClick={onDownloadInvoice}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 text-sm font-black text-orange-700 hover:bg-orange-100"
        >
          <Download size={17} />
          Download Invoice
        </button>

        <button
          type="button"
          onClick={onPrintPolicy}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-700 hover:bg-gray-50"
        >
          <Printer size={17} />
          Print Policy
        </button>

        <button
          type="button"
          onClick={onEmailPolicy}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-700 hover:bg-gray-50"
        >
          <Mail size={17} />
          Email Policy
        </button>

        <button
          type="button"
          onClick={onWhatsAppPolicy}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 text-sm font-black text-green-700 hover:bg-green-100"
        >
          <MessageCircle size={17} />
          WhatsApp Policy
        </button>

        <button
          type="button"
          onClick={onGoToMyBookings}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 text-sm font-black text-blue-700 hover:bg-blue-100"
        >
          <UserRound size={17} />
          Go to My Bookings
        </button>

        <button
          type="button"
          onClick={onGoHome}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-700 hover:bg-gray-50"
        >
          <Home size={17} />
          Go Home
        </button>
      </div>

      <div className="mt-5 rounded-2xl bg-gray-50 p-4">
        <p className="text-xs font-black text-gray-700">Delivery Details</p>
        <p className="mt-2 text-xs font-semibold text-gray-500">
          {email ? `Email: ${email}` : "Email not available"}
        </p>
        <p className="mt-1 text-xs font-semibold text-gray-500">
          {mobile ? `Mobile: ${mobile}` : "Mobile not available"}
        </p>
      </div>
    </aside>
  );
}