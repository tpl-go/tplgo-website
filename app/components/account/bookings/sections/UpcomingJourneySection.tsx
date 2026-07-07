"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";

import {
  BOOKING_UPDATED_EVENT,
  cancelBooking,
  getBookingsByMobile,
  getRefundEstimate,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";

import { shareBooking } from "@/app/lib/booking/bookingActionHelpers";
import { printBookingDocument } from "@/app/lib/booking/print/bookingPrintDispatcher";
import { getBookingServiceConfig } from "@/app/lib/booking/bookingServiceConfig";

import CancelBookingModal from "@/app/components/account/bookings/CancelBookingModal";
import {
  getVisaCurrentStatus,
  getVisaStatusClass,
  getVisaStatusLabel,
} from "@/app/lib/visa/visaStatusStorage";

const DIGI_YATRA_REDIRECT_URL = "https://www.digiyatra.org.in/";

function isJourneyCompleted(travelDate: string) {
  const date = new Date(travelDate);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  date.setHours(0, 0, 0, 0);

  return date < today;
}

function resolveDisplayBookingId(booking: BookingItem) {
  const rawId = String(booking.id || "");

  if (rawId.includes("undefined")) {
    const parts = rawId.split("-");
    const lastPart = parts[parts.length - 1] || Date.now().toString().slice(-6);
    return `TPL-VSA-${lastPart}`;
  }

  return rawId;
}

function getBookingStatusLabel(booking: BookingItem) {
  if (booking.type === "visa") {
    return getVisaStatusLabel(getVisaCurrentStatus(booking.id));
  }

  return "Confirmed";
}

function getBookingStatusClass(booking: BookingItem) {
  if (booking.type === "visa") {
    return getVisaStatusClass(getVisaCurrentStatus(booking.id));
  }

  return "rounded-full bg-green-50 px-3 py-1 text-[11px] font-semibold text-green-700";
}

function getStoredBookingPayload(booking: BookingItem) {
  if (typeof window === "undefined") return null;

  try {
    if (booking.payloadStorageKey) {
      const rawByKey = localStorage.getItem(booking.payloadStorageKey);
      if (rawByKey) return JSON.parse(rawByKey);
    }

    const rawById = localStorage.getItem(`tpl_booking_payload_flight_${booking.id}`);
    if (rawById) return JSON.parse(rawById);
  } catch {}

  return null;
}

function isDomesticFlightBooking(booking: BookingItem) {
  if (booking.type !== "flight") return false;

  const payload = getStoredBookingPayload(booking);

  const tripMode = String(payload?.reviewData?.tripMode || "").toLowerCase();

  if (tripMode === "domestic") return true;

  const digiEligible = payload?.digiYatra?.eligible === true;
  if (digiEligible) return true;

  return false;
}

export default function UpcomingJourneySection() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [cancelTarget, setCancelTarget] = useState<BookingItem | null>(null);

  const { user } = useAuth();
  const router = useRouter();

  const loadBookings = () => {
    const userMobile = user?.mobile?.trim();

    if (!userMobile) {
      setBookings([]);
      return;
    }

    const all = getBookingsByMobile(userMobile);

    setBookings(
      all.filter((item) => {
        if (item.status !== "upcoming") return false;
        if (isJourneyCompleted(item.travelDate)) return false;

        return true;
      })
    );
  };

  useEffect(() => {
    loadBookings();

    const handleBookingUpdate = () => {
      loadBookings();
    };

    window.addEventListener(BOOKING_UPDATED_EVENT, handleBookingUpdate);
    window.addEventListener("storage", handleBookingUpdate);

    return () => {
      window.removeEventListener(BOOKING_UPDATED_EVENT, handleBookingUpdate);
      window.removeEventListener("storage", handleBookingUpdate);
    };
  }, [user]);

  const handleViewDetail = (booking: BookingItem) => {
    const config = getBookingServiceConfig(booking.type);
    router.push(config.detailPath(booking.id));
  };

  const handleDownloadTicket = (booking: BookingItem) => {
    printBookingDocument(booking);
  };

  const handleShare = async (booking: BookingItem) => {
    await shareBooking(booking);
  };

  const handleManageBooking = (booking: BookingItem) => {
    const config = getBookingServiceConfig(booking.type);
    router.push(config.managePath(booking.id));
  };

  const handleVisaStatusCheck = (booking: BookingItem) => {
    router.push(`/visa/status?bookingId=${encodeURIComponent(booking.id)}&from=account`);
  };

  const handleWebCheckIn = (booking: BookingItem) => {
    router.push(`/web-check-in?bookingId=${encodeURIComponent(booking.id)}`);
  };

  const handleDigiYatra = (booking: BookingItem) => {
    if (typeof window === "undefined") return;

    try {
      sessionStorage.setItem(`tpl_digi_yatra_redirected_${booking.id}`, "true");
    } catch {}

    window.open(DIGI_YATRA_REDIRECT_URL, "_blank", "noopener,noreferrer");
  };

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;

    cancelBooking(cancelTarget.id, "Cancelled by user from My Bookings");
    setCancelTarget(null);
    loadBookings();
  };

  return (
    <div className="bg-white">
      <div className="border-b border-gray-200 px-4 py-4 md:px-6 md:py-5">
        <h1 className="text-[17px] font-semibold text-slate-900 md:text-[18px]">
          Upcoming Journey
        </h1>
      </div>

      <div className="space-y-4 px-3 py-4 md:space-y-5 md:px-6 md:py-6">
        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-slate-50 px-4 py-7 text-[13px] text-slate-600 md:px-5 md:py-8">
            No upcoming bookings found.
          </div>
        ) : (
          bookings.map((booking) => {
            const config = getBookingServiceConfig(booking.type);
            const isVisa = booking.type === "visa";
            const showDigiYatra = isDomesticFlightBooking(booking);
            const isSmartPlanner = booking.type === "smart-planner";

            return (
              <div
                key={booking.id}
                className="overflow-hidden rounded-[18px] border border-gray-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:rounded-[24px]"
              >
                <div className="border-b border-gray-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-4 md:px-5">
                  <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase text-blue-700 md:px-3 md:text-[11px]">
                          {config.label}
                        </span>

                        <span className={getBookingStatusClass(booking)}>
                          {getBookingStatusLabel(booking)}
                        </span>

                        {showDigiYatra ? (
                          <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[10px] font-semibold text-orange-700 md:px-3 md:text-[11px]">
                            Digi Yatra Eligible
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-3 break-words text-[17px] font-bold leading-6 text-slate-900 md:text-[20px] md:leading-normal">
                        {booking.title}
                      </h3>

                      <div className="mt-3 grid grid-cols-1 gap-2 text-[12px] text-slate-600 sm:grid-cols-2 xl:grid-cols-4 md:text-[13px]">
                        <p className="min-w-0 break-words">
                          <span className="font-semibold text-slate-800">
                            {isVisa ? "Application ID:" : "Booking ID:"}
                          </span>{" "}
                          {resolveDisplayBookingId(booking)}
                        </p>
                        <p className="min-w-0 break-words">
                          <span className="font-semibold text-slate-800">
                            Booking Date:
                          </span>{" "}
                          {formatDateTime(booking.bookingDate)}
                        </p>
                        <p className="min-w-0 break-words">
                          <span className="font-semibold text-slate-800">
                            Travel Date:
                          </span>{" "}
                          {formatDateOnly(booking.travelDate)}
                        </p>
                        <p className="min-w-0 break-words">
                          <span className="font-semibold text-slate-800">
                            Travellers:
                          </span>{" "}
                          {booking.travellersLabel || booking.travellers}
                        </p>
                        {isSmartPlanner && booking.routeLabel ? (
                          <p className="min-w-0 break-words">
                            <span className="font-semibold text-slate-800">
                              Route:
                            </span>{" "}
                            {booking.routeLabel}
                          </p>
                        ) : null}
                        {isSmartPlanner && booking.durationLabel ? (
                          <p className="min-w-0 break-words">
                            <span className="font-semibold text-slate-800">
                              Duration:
                            </span>{" "}
                            {booking.durationLabel}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm lg:min-w-[220px] lg:w-auto lg:shrink-0 lg:py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Total Amount
                      </p>
                      <p className="mt-1 text-[23px] font-bold leading-none text-slate-900 md:text-[28px]">
                        {formatPrice(booking.amount)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-4 md:px-5">
                  <div className="grid grid-cols-2 gap-2 md:flex md:items-center md:overflow-x-auto md:pb-1">
                    <ActionButton
                      label={config.downloadLabel}
                      onClick={() => handleDownloadTicket(booking)}
                      variant="primary"
                    />

                    <ActionButton
                      label={config.shareLabel}
                      onClick={() => handleShare(booking)}
                    />

                    <ActionButton
                      label="View Detail"
                      onClick={() => handleViewDetail(booking)}
                    />

                    {isVisa ? (
                      <ActionButton
                        label="Status Checker"
                        onClick={() => handleVisaStatusCheck(booking)}
                        variant="success"
                      />
                    ) : (
                      <ActionButton
                        label="Manage Booking"
                        onClick={() => handleManageBooking(booking)}
                      />
                    )}

                    {booking.type === "flight" && (
                      <ActionButton
                        label="Web Check-in"
                        onClick={() => handleWebCheckIn(booking)}
                        variant="success"
                      />
                    )}

                    {showDigiYatra ? (
                      <ActionButton
                        label="Digi Yatra"
                        onClick={() => handleDigiYatra(booking)}
                        variant="orange"
                      />
                    ) : null}

                    {!isVisa && (
                      <ActionButton
                        label="Cancel Booking"
                        onClick={() => setCancelTarget(booking)}
                        variant="danger"
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <CancelBookingModal
        isOpen={!!cancelTarget}
        bookingTitle={cancelTarget?.title}
        bookingId={cancelTarget?.id}
        travelDate={cancelTarget ? formatDateOnly(cancelTarget.travelDate) : "-"}
        refundableAmount={
          cancelTarget ? getRefundEstimate(cancelTarget).refundableAmount : 0
        }
        cancellationCharge={
          cancelTarget ? getRefundEstimate(cancelTarget).cancellationCharge : 0
        }
        policyText={
          cancelTarget ? getRefundEstimate(cancelTarget).cancellationPolicyText : ""
        }
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  variant = "default",
}: {
  label: string;
  onClick: () => void;
  variant?: "default" | "primary" | "danger" | "success" | "orange";
}) {
  const className =
    variant === "primary"
      ? "min-h-10 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-center text-[12px] font-semibold leading-4 text-orange-700 transition hover:bg-orange-100 md:whitespace-nowrap md:shrink-0"
      : variant === "danger"
      ? "min-h-10 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-center text-[12px] font-semibold leading-4 text-orange-700 transition hover:bg-orange-100 md:whitespace-nowrap md:shrink-0"
      : variant === "success"
      ? "min-h-10 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-center text-[12px] font-semibold leading-4 text-orange-700 transition hover:bg-orange-100 md:whitespace-nowrap md:shrink-0"
      : variant === "orange"
      ? "min-h-10 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-center text-[12px] font-semibold leading-4 text-orange-700 transition hover:bg-orange-100 md:whitespace-nowrap md:shrink-0"
      : "min-h-10 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-center text-[12px] font-semibold leading-4 text-orange-700 transition hover:bg-orange-100 md:whitespace-nowrap md:shrink-0";

  return (
    <button type="button" onClick={onClick} className={className}>
      {label}
    </button>
  );
}

function formatPrice(amount: number) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDateOnly(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
