"use client";

import type { BookingType } from "@/app/lib/booking/bookingStorage";

export type BookingServiceConfig = {
  type: BookingType;
  label: string;
  downloadLabel: string;
  shareLabel: string;
  detailPath: (bookingId: string) => string;
  managePath: (bookingId: string) => string;
};

export const bookingServiceConfig: Record<BookingType, BookingServiceConfig> = {
  flight: {
    type: "flight",
    label: "Flight",
    downloadLabel: "Download Ticket",
    shareLabel: "Share Ticket",
    detailPath: (bookingId) => `/account/bookings/flight/${bookingId}`,
    managePath: (bookingId) =>
      `/flights/manage?bookingId=${encodeURIComponent(bookingId)}&from=account`,
  },

  hotel: {
    type: "hotel",
    label: "Hotel",
    downloadLabel: "Download Voucher",
    shareLabel: "Share Voucher",
    detailPath: (bookingId) => `/account/bookings/hotel/${bookingId}`,
    managePath: (bookingId) =>
      `/hotels/manage?bookingId=${encodeURIComponent(bookingId)}&from=account`,
  },

  homestay: {
    type: "homestay",
    label: "Homestay",
    downloadLabel: "Download Voucher",
    shareLabel: "Share Voucher",
    detailPath: (bookingId) => `/account/bookings/homestay/${bookingId}`,
    managePath: (bookingId) =>
      `/homestays/manage?bookingId=${encodeURIComponent(
        bookingId
      )}&from=account`,
  },

  bus: {
    type: "bus",
    label: "Bus",
    downloadLabel: "Download Ticket",
    shareLabel: "Share Ticket",
    detailPath: (bookingId) => `/account/bookings/bus/${bookingId}`,
    managePath: (bookingId) =>
      `/bus/manage?bookingId=${encodeURIComponent(bookingId)}&from=account`,
  },

  train: {
    type: "train",
    label: "Train",
    downloadLabel: "Download Ticket",
    shareLabel: "Share Ticket",
    detailPath: (bookingId) => `/account/bookings/train/${bookingId}`,
    managePath: (bookingId) =>
      `/train/manage?bookingId=${encodeURIComponent(bookingId)}&from=account`,
  },

  cab: {
    type: "cab",
    label: "Cab",
    downloadLabel: "Download Voucher",
    shareLabel: "Share Voucher",
    detailPath: (bookingId) => `/account/bookings/cab/${bookingId}`,
    managePath: (bookingId) =>
      `/cab/manage?bookingId=${encodeURIComponent(bookingId)}&from=account`,
  },

  cruise: {
    type: "cruise",
    label: "Cruise",
    downloadLabel: "Download Voucher",
    shareLabel: "Share Voucher",
    detailPath: (bookingId) => `/account/bookings/cruise/${bookingId}`,
    managePath: (bookingId) =>
      `/cruise/manage?bookingId=${encodeURIComponent(bookingId)}&from=account`,
  },

  package: {
    type: "package",
    label: "Package",
    downloadLabel: "Download Voucher",
    shareLabel: "Share Voucher",
    detailPath: (bookingId) => `/account/bookings/package/${bookingId}`,
    managePath: (bookingId) =>
      `/packages/manage?bookingId=${encodeURIComponent(
        bookingId
      )}&from=account`,
  },

insurance: {
  type: "insurance",
  label: "Insurance",
  downloadLabel: "Download Policy",
  shareLabel: "Share Policy",
  detailPath: (bookingId) =>
    `/account/bookings/insurance/${bookingId}`,
  managePath: (bookingId) =>
    `/insurance/manage?bookingId=${encodeURIComponent(
      bookingId
    )}&from=account`,
},

  visa: {
    type: "visa",
    label: "Visa",
    downloadLabel: "Download Application",
    shareLabel: "Share Application",
    detailPath: (bookingId) => `/account/bookings/visa/${bookingId}`,
    managePath: (bookingId) =>
      `/visa/status?bookingId=${encodeURIComponent(bookingId)}&from=account`,
  },
};

export function getBookingServiceConfig(type: BookingType) {
  return bookingServiceConfig[type];
}