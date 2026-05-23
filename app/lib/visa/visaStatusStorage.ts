"use client";

import {
  BOOKING_UPDATED_EVENT,
  getBookingById,
  updateBooking,
} from "@/app/lib/booking/bookingStorage";

export type VisaApplicationStatus =
  | "Application Submitted"
  | "Documents Received"
  | "Under Verification"
  | "Additional Documents Required"
  | "Submitted to Embassy/VFS"
  | "Decision Awaited"
  | "Approved"
  | "Rejected"
  | "Refund Requested"
  | "Refund Under Review"
  | "Refund Processed";

export type VisaStatusLog = {
  id: string;
  status: VisaApplicationStatus;
  title: string;
  message: string;
  createdAt: string;
  createdBy: "system" | "visa-desk" | "customer";
};

export const VISA_STATUS_OPTIONS: VisaApplicationStatus[] = [
  "Application Submitted",
  "Documents Received",
  "Under Verification",
  "Additional Documents Required",
  "Submitted to Embassy/VFS",
  "Decision Awaited",
  "Approved",
  "Rejected",
  "Refund Requested",
  "Refund Under Review",
  "Refund Processed",
];

export function getVisaStatusLabel(status?: string) {
  if (status === "Approved") return "Visa Approved";
  if (status === "Rejected") return "Rejected";
  if (status === "Additional Documents Required") return "Docs Required";
  if (status === "Submitted to Embassy/VFS") return "Embassy/VFS";
  if (status === "Decision Awaited") return "Decision Awaited";
  if (status === "Refund Requested") return "Refund Requested";
  if (status === "Refund Under Review") return "Refund Review";
  if (status === "Refund Processed") return "Refund Processed";
  if (status === "Under Verification") return "Under Verification";
  if (status === "Documents Received") return "Documents Received";

  return "Application Submitted";
}

export function getVisaStatusClass(status?: string) {
  if (status === "Approved") {
    return "rounded-full bg-green-50 px-3 py-1 text-[11px] font-semibold text-green-700";
  }

  if (status === "Rejected") {
    return "rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-700";
  }

  if (
    status === "Refund Requested" ||
    status === "Refund Under Review" ||
    status === "Refund Processed"
  ) {
    return "rounded-full bg-purple-50 px-3 py-1 text-[11px] font-semibold text-purple-700";
  }

  if (status === "Additional Documents Required") {
    return "rounded-full bg-yellow-50 px-3 py-1 text-[11px] font-semibold text-yellow-700";
  }

  return "rounded-full bg-orange-50 px-3 py-1 text-[11px] font-semibold text-orange-700";
}

function createLog(
  status: VisaApplicationStatus,
  message: string,
  createdBy: VisaStatusLog["createdBy"] = "system"
): VisaStatusLog {
  return {
    id: `VSL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    status,
    title: status,
    message,
    createdAt: new Date().toISOString(),
    createdBy,
  };
}

export function readVisaPayload(bookingId: string) {
  if (typeof window === "undefined") return null;

  const booking = getBookingById(bookingId);
  if (!booking?.payloadStorageKey) return null;

  try {
    const raw = localStorage.getItem(booking.payloadStorageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getVisaCurrentStatus(bookingId: string): VisaApplicationStatus {
  const payload = readVisaPayload(bookingId);

  return (
    payload?.applicationStatus ||
    payload?.bookingStatus ||
    "Application Submitted"
  );
}

export function getVisaStatusLogs(bookingId: string): VisaStatusLog[] {
  const payload = readVisaPayload(bookingId);

  if (Array.isArray(payload?.statusLogs) && payload.statusLogs.length > 0) {
    return payload.statusLogs;
  }

  return [
    createLog(
      "Application Submitted",
      "Your visa application has been submitted successfully.",
      "system"
    ),
    createLog(
      "Documents Received",
      "Uploaded documents are attached with the application.",
      "system"
    ),
  ];
}

export function updateVisaStatus(params: {
  bookingId: string;
  status: VisaApplicationStatus;
  message?: string;
  createdBy?: VisaStatusLog["createdBy"];
}) {
  if (typeof window === "undefined") return null;

  const { bookingId, status, message, createdBy = "visa-desk" } = params;

  const booking = getBookingById(bookingId);
  if (!booking?.payloadStorageKey) return null;

  const payload = readVisaPayload(bookingId);
  if (!payload) return null;

  const nextLog = createLog(
    status,
    message || `Visa application status updated to ${status}.`,
    createdBy
  );

  const nextPayload = {
    ...payload,
    applicationStatus: status,
    visaFinalStatus:
      status === "Approved"
        ? "approved"
        : status === "Rejected"
        ? "rejected"
        : payload?.visaFinalStatus || "in_process",
    statusLogs: [...getVisaStatusLogs(bookingId), nextLog],
    lastStatusUpdatedAt: new Date().toISOString(),
  };

  localStorage.setItem(booking.payloadStorageKey, JSON.stringify(nextPayload));

  updateBooking(bookingId, {
    title: booking.title,
  });

  window.dispatchEvent(new Event(BOOKING_UPDATED_EVENT));
  window.dispatchEvent(new Event("storage"));

  return nextPayload;
}

export function requestVisaRefund(bookingId: string, reason: string) {
  return updateVisaStatus({
    bookingId,
    status: "Refund Requested",
    message:
      reason ||
      "Customer requested refund / withdrawal for this visa application.",
    createdBy: "customer",
  });
}