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
import { tplApiRequest } from "@/app/lib/api/tplApiClient";
import { validHotelBookingModificationSummarySnapshot, type HotelBookingModificationSummary, type HotelBookingModificationSummarySnapshot } from "@/app/lib/partner/partnerHotelBookingRequests";

type BookingsDetailsProps = {
  activeSection: BookingSectionKey;
};

export default function BookingsDetails({
  activeSection,
}: BookingsDetailsProps) {
  const { authError, isAuthLoading, isAuthenticated, openLoginModal, user } = useAuth();

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [hotelModificationSummaries, setHotelModificationSummaries] = useState<Record<string, HotelBookingModificationSummary>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let sequence = 0;

    const loadBookings = async (silent = false) => {
      const request = ++sequence;
      if (isAuthLoading) return;

      if (!isAuthenticated || !user?.id) {
        setBookings([]);
        setStatus("idle");
        setErrorMessage(null);
        return;
      }

      if (!silent) setStatus("loading");
      setErrorMessage(null);
      const [result, modificationResult] = await Promise.all([
        getBackendFirstBookings(undefined, { allowLocalFallback: false }),
        tplApiRequest<HotelBookingModificationSummarySnapshot>("/api/v1/bookings/hotel-modification-summaries"),
      ]);
      if (cancelled || request !== sequence) return;
      setBookings(result.bookings);
      if (modificationResult.ok && validHotelBookingModificationSummarySnapshot(modificationResult.data)) {
        setHotelModificationSummaries(Object.fromEntries(modificationResult.data.items.flatMap(item=>[[item.bookingId,item],[item.bookingRef,item]])));
      } else if (!silent) setHotelModificationSummaries({});
      if (result.source === "backend") {
        setStatus("idle");
      } else if (!silent) {
        setStatus("error");
        setErrorMessage(result.error?.message || "We could not load your account bookings. Please retry.");
      }
    };

    const refreshBookings = () => { void loadBookings(true); };
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refreshBookings();
    };

    void loadBookings();

    const refreshTimer = window.setInterval(refreshBookings, 5000);
    window.addEventListener(BOOKING_UPDATED_EVENT, refreshBookings);
    window.addEventListener("storage", refreshBookings);
    window.addEventListener("focus", refreshBookings);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      cancelled = true;
      window.clearInterval(refreshTimer);
      window.removeEventListener(BOOKING_UPDATED_EVENT, refreshBookings);
      window.removeEventListener("storage", refreshBookings);
      window.removeEventListener("focus", refreshBookings);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [authError, isAuthLoading, isAuthenticated, user?.id]);

  const upcoming = bookings.filter((b) => b.status === "upcoming");
  const completed = bookings.filter((b) => b.status === "completed");
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  const accountNotice = renderAccountNotice({
    authError,
    errorMessage,
    isAuthLoading,
    isAuthenticated,
    onSignIn: () => openLoginModal({ intent: "booking", redirectAfterLogin: "/account/bookings" }),
    status,
  });

  if (accountNotice) return accountNotice;

  if (activeSection === "completed") {
    return <>{accountNotice}<CompletedJourneySection bookings={completed} /></>;
  }

  if (activeSection === "cancelled") {
    return <>{accountNotice}<CancelledJourneySection bookings={cancelled} /></>;
  }

  if (activeSection === "refund") {
    return <>{accountNotice}<RefundStatusSection bookings={bookings.filter((b) => b.refund)} /></>;
  }

  return (
    <>
      {accountNotice}
      <UpcomingJourneySection
        bookings={upcoming}
        serverAuthoritative
        hotelModificationSummaries={hotelModificationSummaries}
        onRefresh={() => window.dispatchEvent(new Event(BOOKING_UPDATED_EVENT))}
      />
    </>
  );
}

function renderAccountNotice({
  authError,
  errorMessage,
  isAuthLoading,
  isAuthenticated,
  onSignIn,
  status,
}: {
  authError?: string | null;
  errorMessage: string | null;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  onSignIn: () => void;
  status: "idle" | "loading" | "error";
}) {
  if (isAuthLoading || status === "loading") {
    return (
      <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-[13px] font-medium text-blue-800">
        Loading your account bookings…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
        {authError || "Sign in to view your account bookings."}{" "}
        <button type="button" onClick={onSignIn} className="font-semibold underline">
          Sign in
        </button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-800">
        {errorMessage}
        {" "}<button type="button" className="font-semibold underline" onClick={() => window.dispatchEvent(new Event(BOOKING_UPDATED_EVENT))}>Retry</button>
      </div>
    );
  }

  return null;
}
