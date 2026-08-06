"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  cancelBooking,
  getRefundEstimate,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";

import { shareBooking } from "@/app/lib/booking/bookingActionHelpers";
import { printBookingDocument } from "@/app/lib/booking/print/bookingPrintDispatcher";
import { getBookingServiceConfig } from "@/app/lib/booking/bookingServiceConfig";
import {
  formatFlightMoney,
  normalizeFlightCurrency,
} from "@/app/lib/flights/flightCurrency";

import CancelBookingModal from "@/app/components/account/bookings/CancelBookingModal";
import {
  getVisaCurrentStatus,
  getVisaStatusClass,
  getVisaStatusLabel,
} from "@/app/lib/visa/visaStatusStorage";

const DIGI_YATRA_REDIRECT_URL = "https://www.digiyatra.org.in/";

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

function isBackendTestFlightBooking(booking: BookingItem) {
  if (booking.type !== "flight") return false;
  const payload = getStoredBookingPayload(booking);
  const safetyFlags = payload?.safetyFlags || {};

  return Boolean(
    payload?.supplierBookingDisabled === true ||
      safetyFlags?.supplierBookingDisabled === true ||
      payload?.backendTestPaymentConfirmation ||
      payload?.backendSimulation ||
      payload?.testStatus === "TPL_TEST_BOOKING_CONFIRMED" ||
      booking.bookingStatus === "TPL_TEST_BOOKING_CONFIRMED"
  );
}

function isBackendTestHotelBooking(booking: BookingItem) {
  if (booking.type !== "hotel") return false;
  const payload = getStoredBookingPayload(booking);

  return Boolean(
    payload?.simulationMode === true ||
      payload?.backendHotel ||
      payload?.supplierBookingDisabled === true ||
      payload?.bookingAllowed === false ||
      booking.bookingStatus === "TPL Test Confirmed"
  );
}

function getFlightBookingCurrency(booking: BookingItem) {
  const payload = getStoredBookingPayload(booking);
  return normalizeFlightCurrency(
    payload?.pricingSnapshot?.currency ||
      payload?.paymentData?.currency ||
      payload?.priceSnapshot?.currency
  );
}

function getFlightPaymentStatus(booking: BookingItem) {
  const payload = getStoredBookingPayload(booking);
  return (
    booking.paymentStatus ||
    payload?.paymentData?.paymentStatus ||
    payload?.payment?.status ||
    "paid"
  );
}

type UpcomingJourneySectionProps = {
  bookings: BookingItem[];
};

export default function UpcomingJourneySection({
  bookings,
}: UpcomingJourneySectionProps) {
  const [cancelTarget, setCancelTarget] = useState<BookingItem | null>(null);

  const router = useRouter();

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
            const isBackendTestFlight = isBackendTestFlightBooking(booking);
            const isBackendTestHotel = isBackendTestHotelBooking(booking);
            const isBackendTestBooking =
              isBackendTestFlight || isBackendTestHotel;
            const flightPaymentStatus =
              booking.type === "flight" ? getFlightPaymentStatus(booking) : "";

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

                        {isBackendTestBooking ? (
                          <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700 md:px-3 md:text-[11px]">
                            TPL Test / Simulation
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
                        {booking.type === "flight" ? (
                          <>
                            <p className="min-w-0 break-words">
                              <span className="font-semibold text-slate-800">
                                Payment:
                              </span>{" "}
                              {String(flightPaymentStatus).toUpperCase()}
                            </p>
                            {isBackendTestFlight ? (
                              <p className="min-w-0 break-words">
                                <span className="font-semibold text-slate-800">
                                  PNR/Ticket:
                                </span>{" "}
                                Not issued in test mode
                              </p>
                            ) : null}
                          </>
                        ) : null}
                        {isBackendTestHotel ? (
                          <>
                            <p className="min-w-0 break-words">
                              <span className="font-semibold text-slate-800">
                                Payment:
                              </span>{" "}
                              {String(booking.paymentStatus || "paid").toUpperCase()}
                            </p>
                            <p className="min-w-0 break-words">
                              <span className="font-semibold text-slate-800">
                                Supplier:
                              </span>{" "}
                              Not created in test mode
                            </p>
                            <p className="min-w-0 break-words">
                              <span className="font-semibold text-slate-800">
                                Voucher:
                              </span>{" "}
                              Not issued in test mode
                            </p>
                          </>
                        ) : null}
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
                        {booking.type === "flight"
                          ? formatFlightMoney(
                              booking.amount,
                              getFlightBookingCurrency(booking)
                            )
                          : formatPrice(booking.amount)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-4 md:px-5">
                  <div className="grid grid-cols-2 gap-2 md:flex md:items-center md:overflow-x-auto md:pb-1">
                    <ActionButton
                      label={
                        isBackendTestBooking
                          ? "Test Summary Only"
                          : config.downloadLabel
                      }
                      onClick={() => handleDownloadTicket(booking)}
                      variant="primary"
                      disabled={isBackendTestBooking}
                    />

                    <ActionButton
                      label={
                        isBackendTestHotel ? "Share Test Summary" : config.shareLabel
                      }
                      onClick={() => handleShare(booking)}
                      disabled={isBackendTestHotel}
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
                        label={
                          isBackendTestBooking
                            ? "Cancellation Disabled"
                            : "Cancel Booking"
                        }
                        onClick={() => setCancelTarget(booking)}
                        variant="danger"
                        disabled={isBackendTestBooking}
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
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  variant?: "default" | "primary" | "danger" | "success" | "orange";
  disabled?: boolean;
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
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
    >
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
