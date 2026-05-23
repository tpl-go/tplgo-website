"use client";

import { useMemo, useState } from "react";
import { X, Printer, Search, AlertCircle, CheckCircle2 } from "lucide-react";

import {
  getAllBookings,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";

import { printBookingDocument } from "@/app/lib/booking/print/bookingPrintDispatcher";

type Props = {
  open: boolean;
  onClose: () => void;
};

function normalize(value: any) {
  return String(value || "").trim().toLowerCase();
}

function getPayload(booking: BookingItem) {
  return ((booking as any)?.payload || {}) as any;
}

function resolveBookingId(booking: BookingItem) {
  return (
    (booking as any)?.bookingId ||
    (booking as any)?.id ||
    (booking as any)?.bookingRef ||
    (booking as any)?.referenceId ||
    ""
  );
}

function resolveBookingMobile(booking: BookingItem) {
  const payload = getPayload(booking);

  return (
    (booking as any)?.mobile ||
    payload?.mobile ||
    payload?.contact?.mobile ||
    payload?.traveller?.mobile ||
    payload?.travellerDetails?.mobile ||
    payload?.leadPassenger?.mobile ||
    payload?.guest?.mobile ||
    payload?.guestDetails?.mobile ||
    payload?.customer?.mobile ||
    ""
  );
}

function resolveBookingEmail(booking: BookingItem) {
  const payload = getPayload(booking);

  return (
    (booking as any)?.email ||
    payload?.email ||
    payload?.contact?.email ||
    payload?.traveller?.email ||
    payload?.travellerDetails?.email ||
    payload?.leadPassenger?.email ||
    payload?.guest?.email ||
    payload?.guestDetails?.email ||
    payload?.customer?.email ||
    ""
  );
}

function resolveBookingTitle(booking: BookingItem) {
  const payload = getPayload(booking);

  return (
    (booking as any)?.title ||
    payload?.title ||
    payload?.packageTitle ||
    payload?.hotelName ||
    payload?.homestayName ||
    payload?.cruiseName ||
    payload?.busName ||
    payload?.trainName ||
    payload?.cabName ||
    payload?.flightName ||
    `${(booking as any)?.type || "Booking"} Booking`
  );
}

function resolveBookingAmount(booking: BookingItem) {
  const payload = getPayload(booking);

  return (
    (booking as any)?.amount ||
    payload?.amount ||
    payload?.totalAmount ||
    payload?.finalPayable ||
    payload?.fareSummary?.grandTotal ||
    payload?.fareSummary?.total ||
    0
  );
}

export default function HeaderPrintModal({ open, onClose }: Props) {
  const [bookingId, setBookingId] = useState("");
  const [mobile, setMobile] = useState("");
  const [searched, setSearched] = useState(false);
  const [matchedBooking, setMatchedBooking] = useState<BookingItem | null>(null);
  const [error, setError] = useState("");

  const allBookings = useMemo(() => {
    if (!open) return [];
    return getAllBookings();
  }, [open]);

  if (!open) return null;

  const resetAndClose = () => {
    setBookingId("");
    setMobile("");
    setSearched(false);
    setMatchedBooking(null);
    setError("");
    onClose();
  };

  const handleSearch = () => {
    setSearched(true);
    setMatchedBooking(null);
    setError("");

    const inputBookingId = normalize(bookingId);
    const inputMobile = normalize(mobile);

    if (!inputBookingId || !inputMobile) {
      setError("Please enter Booking ID and Mobile Number.");
      return;
    }

    const found = allBookings.find((booking: BookingItem) => {
      const currentBookingId = normalize(resolveBookingId(booking));
      const currentMobile = normalize(resolveBookingMobile(booking));

      return currentBookingId === inputBookingId && currentMobile === inputMobile;
    });

    if (!found) {
      setError("No booking found with this Booking ID and Mobile Number.");
      return;
    }

    setMatchedBooking(found);
  };

  const handlePrint = () => {
    if (!matchedBooking) return;
    printBookingDocument(matchedBooking);
  };

  const amount = matchedBooking ? resolveBookingAmount(matchedBooking) : 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b bg-gradient-to-r from-orange-50 to-rose-50 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Print Booking</h2>
            <p className="text-sm text-gray-600">
              Enter your Booking ID and mobile number to fetch ticket or voucher.
            </p>
          </div>

          <button
            onClick={resetAndClose}
            className="rounded-full p-2 text-gray-500 hover:bg-white hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Booking ID
              </label>
              <input
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="Example: TPL12345"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Mobile Number
              </label>
              <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Registered mobile number"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow hover:bg-orange-700"
          >
            <Search size={17} />
            Fetch Booking
          </button>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={18} className="mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {searched && matchedBooking && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-green-700">
                <CheckCircle2 size={18} />
                Booking Found
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Booking ID</span>
                    <span className="font-bold text-gray-900">
                      {resolveBookingId(matchedBooking)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Service</span>
                    <span className="font-bold capitalize text-gray-900">
                      {(matchedBooking as any)?.type || "Booking"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Booking</span>
                    <span className="text-right font-bold text-gray-900">
                      {resolveBookingTitle(matchedBooking)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Mobile</span>
                    <span className="font-bold text-gray-900">
                      {resolveBookingMobile(matchedBooking)}
                    </span>
                  </div>

                  {resolveBookingEmail(matchedBooking) && (
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">Email</span>
                      <span className="text-right font-bold text-gray-900">
                        {resolveBookingEmail(matchedBooking)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between gap-4 border-t pt-3">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-bold text-gray-900">
                      ₹{Number(amount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePrint}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white hover:bg-black"
                >
                  <Printer size={17} />
                  Print Ticket / Voucher
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}