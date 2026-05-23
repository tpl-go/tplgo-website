"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FileSearch,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";

import {
  BOOKING_UPDATED_EVENT,
  getAllBookings,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";

import VisaConfirmationStatusTimeline from "@/app/components/confirmation/visa/VisaConfirmationStatusTimeline";
import VisaStatusLogCard from "@/app/components/confirmation/visa/VisaStatusLogCard";
import VisaConfirmationDocumentCard from "@/app/components/confirmation/visa/VisaConfirmationDocumentCard";

import {
  getVisaCurrentStatus,
  getVisaStatusLabel,
  getVisaStatusLogs,
  requestVisaRefund,
  updateVisaStatus,
  VISA_STATUS_OPTIONS,
  type VisaApplicationStatus,
  type VisaStatusLog,
} from "@/app/lib/visa/visaStatusStorage";

function readPayload(booking: BookingItem | null) {
  if (typeof window === "undefined" || !booking?.payloadStorageKey) return null;

  try {
    const raw = localStorage.getItem(booking.payloadStorageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function VisaStatusPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = String(searchParams.get("bookingId") || "");

  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [payload, setPayload] = useState<any>(null);
  const [status, setStatus] =
    useState<VisaApplicationStatus>("Application Submitted");
  const [logs, setLogs] = useState<VisaStatusLog[]>([]);

  const [selectedStatus, setSelectedStatus] =
    useState<VisaApplicationStatus>("Under Verification");
  const [statusMessage, setStatusMessage] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const load = () => {
    const all = getAllBookings();

    const found =
      all.find((item) => item.type === "visa" && item.id === bookingId) ||
      all.find(
        (item) =>
          item.type === "visa" &&
          (item.id.endsWith(bookingId.slice(-4)) ||
            bookingId.endsWith(item.id.slice(-4)))
      ) ||
      null;

    setBooking(found);

    if (!found) return;

    const parsed = readPayload(found);
    setPayload(parsed);

    setStatus(getVisaCurrentStatus(found.id));
    setLogs(getVisaStatusLogs(found.id));
  };

  useEffect(() => {
    load();

    window.addEventListener(BOOKING_UPDATED_EVENT, load);
    window.addEventListener("storage", load);

    return () => {
      window.removeEventListener(BOOKING_UPDATED_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, [bookingId]);

  const canRequestRefund = useMemo(() => {
    return ![
      "Submitted to Embassy/VFS",
      "Decision Awaited",
      "Approved",
      "Rejected",
      "Refund Requested",
      "Refund Under Review",
      "Refund Processed",
    ].includes(status);
  }, [status]);

  const handleUpdateStatus = () => {
    if (!booking?.id) return;

    updateVisaStatus({
      bookingId: booking.id,
      status: selectedStatus,
      message: statusMessage || `Visa status updated to ${selectedStatus}.`,
      createdBy: "visa-desk",
    });

    setStatusMessage("");
    load();
  };

  const handleRefundRequest = () => {
    if (!booking?.id || !canRequestRefund) return;

    requestVisaRefund(
      booking.id,
      refundReason ||
        "Customer requested visa application withdrawal / refund before embassy submission."
    );

    setRefundReason("");
    load();
  };

  if (!booking) {
    return (
      <main className="min-h-screen bg-[#eef3f8] px-4 py-10 text-black">
        <div className="mx-auto max-w-4xl rounded-3xl border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-black text-gray-950">
            Visa status not found
          </h1>

          <p className="mt-2 text-sm font-semibold text-gray-600">
            Application ID is missing or booking is not available.
          </p>

          <button
            type="button"
            onClick={() => router.push("/account/bookings")}
            className="mt-5 rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white"
          >
            Back to My Bookings
          </button>
        </div>
      </main>
    );
  }

  const leadApplicant = payload?.leadApplicant || payload?.applicants?.[0] || {};
  const docs = payload?.uploadedDocsByApplicant || [];
  const title = payload?.visaTitle || booking.title;
  const country = payload?.country || payload?.searchData?.destinationCountry || "";
  const applicationId = payload?.applicationId || booking.id;

  return (
    <main className="min-h-screen bg-[#eef3f8] text-black">
      <div className="flex h-[72px] items-center justify-between border-b bg-white px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/account/bookings")}
            className="rounded-full border p-2 hover:bg-gray-50"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div className="text-xl font-black text-gray-950">
              Visa Status Checker
            </div>
            <div className="text-xs font-bold text-gray-500">
              Application ID: {applicationId}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-black text-white"
        >
          <Download size={16} />
          Download Application
        </button>
      </div>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase text-orange-600">
                  Current Visa Status
                </p>

                <h1 className="mt-2 text-3xl font-black text-gray-950">
                  {getVisaStatusLabel(status)}
                </h1>

                <p className="mt-2 text-sm font-semibold text-gray-600">
                  {title}
                </p>

                {country && (
                  <p className="mt-1 text-sm font-semibold text-gray-600">
                    Destination: {country}
                  </p>
                )}
              </div>

              <div className="rounded-2xl bg-orange-50 px-5 py-4 text-right">
                <p className="text-xs font-bold text-orange-700">
                  Applicant
                </p>
                <p className="mt-1 font-black text-gray-950">
                  {`${leadApplicant?.firstName || ""} ${
                    leadApplicant?.lastName || ""
                  }`.trim() ||
                    leadApplicant?.name ||
                    booking.leadTraveller?.name ||
                    "Applicant"}
                </p>
              </div>
            </div>
          </div>

          <VisaConfirmationStatusTimeline currentStatus={status} />

          <VisaStatusLogCard logs={logs} />

          <VisaConfirmationDocumentCard uploadedDocsByApplicant={docs} />
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <FileSearch size={18} className="text-orange-600" />
              <h2 className="text-lg font-black text-gray-950">
                Status Update
              </h2>
            </div>

            <p className="mt-2 text-xs font-semibold text-gray-600">
              Temporary Visa Desk control. Later this will move to admin panel.
            </p>

            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as VisaApplicationStatus)
              }
              className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold outline-none"
            >
              {VISA_STATUS_OPTIONS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <textarea
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              rows={4}
              placeholder="Add status note..."
              className="mt-3 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold outline-none"
            />

            <button
              type="button"
              onClick={handleUpdateStatus}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white"
            >
              <RefreshCcw size={16} />
              Update Status
            </button>
          </div>

          <div className="rounded-3xl border border-purple-200 bg-purple-50 p-5 shadow-sm">
            <h2 className="text-lg font-black text-purple-900">
              Refund / Withdraw Request
            </h2>

            <p className="mt-2 text-xs font-semibold text-purple-800">
              Refund is possible only before embassy/VFS submission. After
              submission, refund depends on authority rules.
            </p>

            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              rows={4}
              disabled={!canRequestRefund}
              placeholder="Reason for refund / withdrawal..."
              className="mt-4 w-full rounded-xl border border-purple-200 px-4 py-3 text-sm font-semibold outline-none disabled:bg-gray-100"
            />

            <button
              type="button"
              onClick={handleRefundRequest}
              disabled={!canRequestRefund}
              className={`mt-3 w-full rounded-xl px-5 py-3 text-sm font-black text-white ${
                canRequestRefund
                  ? "bg-purple-700 hover:bg-purple-800"
                  : "cursor-not-allowed bg-gray-400"
              }`}
            >
              Request Refund / Withdraw
            </button>

            {!canRequestRefund && (
              <p className="mt-3 text-xs font-bold text-red-600">
                Refund request is not available at current status.
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-green-200 bg-green-50 p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-green-700" />
              <h2 className="text-lg font-black text-green-900">
                Visa Desk Note
              </h2>
            </div>

            <p className="mt-2 text-xs font-semibold leading-relaxed text-green-800">
              Final approval, rejection, stay duration and validity are subject
              to embassy, VFS or immigration authority decision.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function VisaStatusPage() {
  return (
    <Suspense fallback={<div />}>
      <VisaStatusPageContent />
    </Suspense>
  );
}