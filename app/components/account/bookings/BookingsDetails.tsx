"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import type { BookingSectionKey } from "@/app/account/bookings/page";

import UpcomingJourneySection from "@/app/components/account/bookings/sections/UpcomingJourneySection";
import CompletedJourneySection from "@/app/components/account/bookings/sections/CompletedJourneySection";
import CancelledJourneySection from "@/app/components/account/bookings/sections/CancelledJourneySection";
import RefundStatusSection from "@/app/components/account/bookings/sections/RefundStatusSection";

import {
  getBookingsByMobile,
  BOOKING_UPDATED_EVENT,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";

type BookingsDetailsProps = {
  activeSection: BookingSectionKey;
};

export default function BookingsDetails({
  activeSection,
}: BookingsDetailsProps) {
  const { user } = useAuth();

  const [bookings, setBookings] = useState<BookingItem[]>([]);

  useEffect(() => {
    const loadBookings = () => {
      if (!user?.mobile) {
        setBookings([]);
        return;
      }

      const userBookings = getBookingsByMobile(user.mobile);
      setBookings(userBookings);
    };

    loadBookings();

    window.addEventListener(BOOKING_UPDATED_EVENT, loadBookings);

    return () => {
      window.removeEventListener(BOOKING_UPDATED_EVENT, loadBookings);
    };
  }, [user?.mobile]);

  const upcoming = bookings.filter((b) => b.status === "upcoming");
  const completed = bookings.filter((b) => b.status === "completed");
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  if (activeSection === "completed") {
    return <CompletedJourneySection />;
  }

  if (activeSection === "cancelled") {
    return <CancelledJourneySection />;
  }

  if (activeSection === "refund") {
    return <RefundStatusSection />;
  }

  return <UpcomingJourneySection />;
}