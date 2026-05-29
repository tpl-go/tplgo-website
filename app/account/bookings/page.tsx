"use client";

import { useState } from "react";
import BookingsSidebar from "@/app/components/account/bookings/BookingsSidebar";
import BookingsDetails from "@/app/components/account/bookings/BookingsDetails";

export type BookingSectionKey =
  | "upcoming"
  | "completed"
  | "cancelled"
  | "refund";

export default function BookingsPage() {
  const [activeSection, setActiveSection] =
    useState<BookingSectionKey>("upcoming");

  return (
    <div className="w-full overflow-hidden rounded-[18px] border border-gray-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.06)] md:rounded-[22px]">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <BookingsSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <BookingsDetails activeSection={activeSection} />
      </div>
    </div>
  );
}
