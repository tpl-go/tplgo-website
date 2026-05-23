"use client";

import { openPrintWindowAndPrint } from "@/app/lib/booking/print/core";
import type { BookingItem } from "@/app/lib/booking/bookingStorage";
import { getBookingServiceConfig } from "@/app/lib/booking/bookingServiceConfig";

type AnyObj = Record<string, any>;

function safe(value: any, fallback = "-") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function formatDateOnly(value: any) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: any) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatPrice(value: any) {
  const amount = Number(value || 0);
  return `₹${amount.toLocaleString("en-IN")}`;
}

function resolveLeadName(booking: BookingItem, payload: AnyObj) {
  return (
    booking.leadTraveller?.name ||
    payload?.leadGuest?.name ||
    `${payload?.leadGuest?.firstName || ""} ${
      payload?.leadGuest?.lastName || ""
    }`.trim() ||
    payload?.travellerValidation?.travellers?.[0]?.firstName ||
    "Guest"
  );
}

function resolveEmail(booking: BookingItem, payload: AnyObj) {
  return (
    booking.leadTraveller?.email ||
    payload?.leadGuest?.email ||
    payload?.travellerValidation?.contactDetails?.email ||
    payload?.guestValidation?.contactDetails?.email ||
    "-"
  );
}

function resolveMobile(booking: BookingItem, payload: AnyObj) {
  return (
    booking.leadTraveller?.mobile ||
    payload?.leadGuest?.phone ||
    payload?.travellerValidation?.contactDetails?.mobile ||
    payload?.guestValidation?.contactDetails?.mobile ||
    "-"
  );
}

export function printGenericVoucherFromBooking(params: {
  booking: BookingItem;
  payload?: AnyObj | null;
}) {
  const { booking, payload = {} } = params;
  const config = getBookingServiceConfig(booking.type);

  const html = `
    <div class="ticket-shell">
      <div class="ticket-top">
        <div class="brand-row">
          <div class="brand">TPL</div>
          <div class="status-pill">Booking Confirmed</div>
        </div>

        <div class="title">${safe(booking.title, `${config.label} Booking`)}</div>
        <div class="subtitle">
          Booking ID: ${safe(booking.id)} • Booked On: ${formatDateTime(
            booking.bookingDate
          )}
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">${config.label} Booking Summary</h3>

        <div class="grid-3">
          <div class="info-card">
            <div class="label">Service</div>
            <div class="value">${config.label}</div>
          </div>

          <div class="info-card">
            <div class="label">Booking Status</div>
            <div class="value">${safe(booking.status).toUpperCase()}</div>
          </div>

          <div class="info-card">
            <div class="label">Travel Date</div>
            <div class="value">${formatDateOnly(booking.travelDate)}</div>
          </div>

          <div class="info-card">
            <div class="label">Travellers / Guests</div>
            <div class="value">${safe(booking.travellers)}</div>
          </div>

          <div class="info-card">
            <div class="label">Lead Name</div>
            <div class="value">${safe(resolveLeadName(booking, payload))}</div>
          </div>

          <div class="info-card">
            <div class="label">Total Paid</div>
            <div class="value">${formatPrice(booking.amount)}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">Contact Details</h3>

        <div class="grid-2">
          <div class="info-card">
            <div class="label">Mobile</div>
            <div class="value">${safe(resolveMobile(booking, payload))}</div>
          </div>

          <div class="info-card">
            <div class="label">Email</div>
            <div class="value">${safe(resolveEmail(booking, payload))}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">Fare Summary</h3>

        <div class="fare-box">
          <div class="fare-row">
            <span>Total Booking Amount</span>
            <span>${formatPrice(booking.amount)}</span>
          </div>

          <div class="fare-row fare-total">
            <span>Total Paid</span>
            <span>${formatPrice(booking.amount)}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="footer-note">
          This is a system-generated ${config.label.toLowerCase()} voucher from TPL.
          Please keep your booking ID handy for support, modification, cancellation, and future retrieval.
        </div>
      </div>
    </div>
  `;

  openPrintWindowAndPrint({
    title: `${booking.id} - ${config.label} Voucher`,
    html,
  });
}