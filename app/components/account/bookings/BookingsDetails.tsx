"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import type { BookingSectionKey } from "@/app/account/bookings/page";

import UpcomingJourneySection from "@/app/components/account/bookings/sections/UpcomingJourneySection";
import CompletedJourneySection from "@/app/components/account/bookings/sections/CompletedJourneySection";
import CancelledJourneySection from "@/app/components/account/bookings/sections/CancelledJourneySection";
import RefundStatusSection from "@/app/components/account/bookings/sections/RefundStatusSection";

import {
  BOOKING_UPDATED_EVENT,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";
import { getBackendFirstBookings } from "@/app/lib/api/bookingApi";

type BookingsDetailsProps = {
  activeSection: BookingSectionKey;
};

export default function BookingsDetails({
  activeSection,
}: BookingsDetailsProps) {
  const { user } = useAuth();

  const [bookings, setBookings] = useState<BookingItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadBookings = async () => {
      if (!user?.mobile) {
        setBookings([]);
        return;
      }

      const result = await getBackendFirstBookings(user.mobile);
      if (!cancelled) setBookings(result.bookings);
    };

    void loadBookings();

    window.addEventListener(BOOKING_UPDATED_EVENT, loadBookings);
    window.addEventListener("storage", loadBookings);

    return () => {
      cancelled = true;
      window.removeEventListener(BOOKING_UPDATED_EVENT, loadBookings);
      window.removeEventListener("storage", loadBookings);
    };
  }, [user?.mobile]);

  const upcoming = bookings.filter((b) => b.status === "upcoming");
  const completed = bookings.filter((b) => b.status === "completed");
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  if (activeSection === "completed") {
    return <CompletedJourneySection bookings={completed} />;
  }

  if (activeSection === "cancelled") {
    return <CancelledJourneySection bookings={cancelled} />;
  }

  if (activeSection === "refund") {
    return <RefundStatusSection bookings={bookings.filter((b) => b.refund)} />;
  }

  return <UpcomingJourneySection bookings={upcoming} />;
}
