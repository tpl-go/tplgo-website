"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  getAllBookings,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";

import InsuranceConfirmationHero from "@/app/components/confirmation/insurance/InsuranceConfirmationHero";
import InsuranceConfirmationPolicyCard from "@/app/components/confirmation/insurance/InsuranceConfirmationPolicyCard";
import InsuranceConfirmationTravellerCard from "@/app/components/confirmation/insurance/InsuranceConfirmationTravellerCard";
import InsuranceConfirmationCoverageCard from "@/app/components/confirmation/insurance/InsuranceConfirmationCoverageCard";
import InsuranceConfirmationFareCard from "@/app/components/confirmation/insurance/InsuranceConfirmationFareCard";
import InsuranceConfirmationActionsCard from "@/app/components/confirmation/insurance/InsuranceConfirmationActionsCard";

type Payload = any;

function buildPaymentId() {
  return `TPL-PAY-${Date.now().toString().slice(-6)}`;
}

function cleanMobile(value?: string) {
  return String(value || "")
    .replace(/^\+91\s?/, "")
    .replace(/^\+91-?/, "")
    .replace(/\D/g, "")
    .slice(-10);
}

function safeParse(raw: string | null) {
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeMobile(value: string) {
  return String(value || "").replace(/\D/g, "").slice(-10);
}

function isInsurancePayload(parsed: any) {
  return Boolean(
    parsed?.serviceType === "insurance" ||
      parsed?.bookingType === "insurance" ||
      parsed?.bookingMeta?.serviceType === "insurance" ||
      parsed?.policyNumber ||
      parsed?.plan?.provider ||
      parsed?.provider
  );
}

function getPayloadAmount(parsed: any) {
  return Number(
    parsed?.fare?.totalPaid ||
      parsed?.fare?.totalAmount ||
      parsed?.paymentData?.totalPaid ||
      parsed?.fareBreakup?.finalTotal ||
      parsed?.finalTotal ||
      0
  );
}

function getPayloadFromBooking(booking: BookingItem | null) {
  if (typeof window === "undefined") return null;

  const bookingId = String(booking?.id || "");
  const bookingTitle = String(booking?.title || "");
  const bookingMobile = normalizeMobile(String(booking?.mobile || ""));
  const bookingAmount = Number(booking?.amount || 0);

  if (booking?.payloadStorageKey) {
    const parsed = safeParse(localStorage.getItem(booking.payloadStorageKey));
    if (parsed) return parsed;
  }

  const sessionPayload = safeParse(
    sessionStorage.getItem("tplInsuranceConfirmationData") ||
      sessionStorage.getItem("insurancePaymentSuccessData")
  );

  if (sessionPayload && isInsurancePayload(sessionPayload)) {
    const sessionBookingId = String(sessionPayload?.bookingId || "");
    const sessionPolicyNumber = String(sessionPayload?.policyNumber || "");
    const sessionMetaId = String(sessionPayload?.bookingMeta?.bookingId || "");
    const sessionMobile = normalizeMobile(
      String(
        sessionPayload?.leadTraveller?.mobile ||
          sessionPayload?.user?.mobile ||
          sessionPayload?.nominee?.mobile ||
          sessionPayload?.travellers?.[0]?.mobile ||
          ""
      )
    );
    const sessionAmount = getPayloadAmount(sessionPayload);

    if (
      sessionBookingId === bookingId ||
      sessionPolicyNumber === bookingId ||
      sessionMetaId === bookingId ||
      (bookingMobile && bookingMobile === sessionMobile) ||
      (bookingAmount > 0 && sessionAmount === bookingAmount)
    ) {
      return sessionPayload;
    }
  }

  try {
    const allKeys = Object.keys(localStorage);

    for (const key of allKeys) {
      const raw = localStorage.getItem(key);
      const parsed = safeParse(raw);

      if (!parsed || !isInsurancePayload(parsed)) continue;

      const parsedBookingId = String(parsed?.bookingId || "");
      const parsedPolicyNumber = String(parsed?.policyNumber || "");
      const parsedMetaBookingId = String(parsed?.bookingMeta?.bookingId || "");

      const parsedProvider = String(parsed?.provider || parsed?.plan?.provider || "");
      const parsedPlanName = String(parsed?.planName || parsed?.plan?.planName || "");
      const parsedDestination = String(parsed?.destination || parsed?.search?.destination || "");
      const parsedTitle = `${parsedProvider} ${parsedPlanName} - ${parsedDestination}`
        .trim()
        .replace(/\s+/g, " ");

      const parsedMobile = normalizeMobile(
        String(
          parsed?.leadTraveller?.mobile ||
            parsed?.user?.mobile ||
            parsed?.nominee?.mobile ||
            parsed?.travellers?.[0]?.mobile ||
            ""
        )
      );
      const parsedAmount = getPayloadAmount(parsed);

      const idMatch =
        parsedBookingId === bookingId ||
        parsedPolicyNumber === bookingId ||
        parsedMetaBookingId === bookingId ||
        (!!bookingId &&
          !!parsedBookingId &&
          (parsedBookingId.endsWith(bookingId.slice(-4)) ||
            bookingId.endsWith(parsedBookingId.slice(-4)))) ||
        (!!bookingId &&
          !!parsedPolicyNumber &&
          (parsedPolicyNumber.endsWith(bookingId.slice(-4)) ||
            bookingId.endsWith(parsedPolicyNumber.slice(-4))));

      const titleMatch =
        bookingTitle &&
        parsedTitle &&
        (bookingTitle.includes(parsedTitle) || parsedTitle.includes(bookingTitle));

      const mobileMatch =
        bookingMobile && parsedMobile && bookingMobile === parsedMobile;

      const amountMatch =
        bookingAmount > 0 && parsedAmount > 0 && bookingAmount === parsedAmount;

      if (idMatch || (titleMatch && mobileMatch) || (mobileMatch && amountMatch)) {
        return parsed;
      }
    }
  } catch {}

  if (booking) {
    return {
      bookingId: booking.id,
      policyNumber: booking.id,
      bookingStatus: "Policy Issued",
      policyStatus: "Active",
      paymentStatus: "Paid",
      bookedOn: booking.bookingDate,
      serviceType: "insurance",
      bookingType: "insurance",
      provider: booking.title,
      planName: "Insurance Policy",
      destination: "",
      travelDates: booking.travelDate,
      travelDate: booking.travelDate,
      travellers: [
        {
          title: "",
          firstName: booking.leadTraveller?.name || "Traveller",
          lastName: "",
          dob: "",
          gender: "",
          age: "",
          mobile: booking.mobile,
          email: booking.leadTraveller?.email || "",
        },
      ],
      nominee: {
        fullName: booking.leadTraveller?.name || "",
        mobile: booking.mobile,
        email: booking.leadTraveller?.email || "",
      },
      plan: {},
      addOns: {},
      medicalDeclaration: {},
      fare: {
        totalPaid: booking.amount,
        totalAmount: booking.amount,
      },
      paymentData: {
        totalPaid: booking.amount,
      },
    };
  }

  return null;
}

export default function InsuranceBookingDetailPage() {
  const params = useParams();
  const router = useRouter();

  const bookingId = String(params?.bookingId || "");

  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [payload, setPayload] = useState<Payload | null>(null);

  useEffect(() => {
    const all = getAllBookings();

    const found =
      all.find((item) => item.id === bookingId && item.type === "insurance") ||
      all.find(
        (item) =>
          item.type === "insurance" &&
          (item.id.endsWith(bookingId.slice(-4)) ||
            bookingId.endsWith(item.id.slice(-4)))
      ) ||
      null;

    setBooking(found);

    const parsed = getPayloadFromBooking(found);
    setPayload(parsed);
  }, [bookingId]);

  const data = payload;

  const policyNumber = useMemo(() => {
    return data?.policyNumber || data?.bookingId || booking?.id || bookingId;
  }, [data?.policyNumber, data?.bookingId, booking?.id, bookingId]);

  const paymentId = useMemo(() => {
    return data?.paymentId || data?.transactionId || buildPaymentId();
  }, [data?.paymentId, data?.transactionId]);

  if (!booking || !data) {
    return (
      <main className="min-h-screen bg-[#eef3f8] text-black">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h1 className="text-xl font-black text-gray-950">
              Insurance policy detail not found
            </h1>

            <p className="mt-2 text-sm font-semibold text-gray-600">
              The policy payload is missing or this booking is not available.
            </p>

            <button
              type="button"
              onClick={() => router.push("/account/bookings")}
              className="mt-5 rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white"
            >
              Back to My Bookings
            </button>
          </div>
        </div>
      </main>
    );
  }

  const leadTraveller = data?.leadTraveller || data?.travellers?.[0] || {};
  const nominee = data?.nominee || {};

  const mobile = cleanMobile(
    leadTraveller?.mobile || nominee?.mobile || data?.user?.mobile || booking.mobile
  );

  const email =
    leadTraveller?.email ||
    nominee?.email ||
    data?.user?.email ||
    booking.leadTraveller?.email ||
    "";

  const policyStatus = data?.policyStatus || data?.bookingStatus || "Active";
  const paymentStatus = data?.paymentStatus || "Paid";
  const bookedOn =
    data?.bookedOn || data?.paymentData?.paidAt || booking.bookingDate;

  const handlePrint = () => window.print();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef3f8] text-black">
      <div className="flex min-h-[72px] flex-col items-start justify-center gap-3 border-b bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-0">
        <div className="text-2xl font-black">TPL</div>

        <button
          type="button"
          onClick={() => router.push("/account/bookings")}
          className="rounded-full border px-4 py-2 text-sm font-bold sm:py-1"
        >
          Back to My Bookings
        </button>
      </div>

      <div className="border-b border-orange-200 bg-orange-50 py-4 text-center">
        <div className="text-lg font-black text-orange-700">
          Insurance Policy Detail
        </div>

        <div className="text-sm font-semibold text-orange-600">
          Policy Number: {policyNumber}
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-4 sm:px-4 sm:py-6 lg:flex-row">
        <div className="flex w-full flex-col gap-4 lg:w-[72%]">
          <InsuranceConfirmationHero
            policyNumber={policyNumber}
            bookingId={data?.bookingId || booking.id}
            provider={data?.provider || data?.plan?.provider || booking.title}
            planName={data?.planName || data?.plan?.planName || "Insurance Policy"}
            policyStatus={policyStatus}
            paymentStatus={paymentStatus}
            bookedOn={bookedOn}
            earnedCreditAmount={Number(data?.earnedCreditAmount || 0)}
          />

          <InsuranceConfirmationPolicyCard data={data} />

          <InsuranceConfirmationTravellerCard
            travellers={data?.travellers || []}
          />

          <InsuranceConfirmationCoverageCard data={data} />

          <InsuranceConfirmationFareCard data={data} paymentId={paymentId} />
        </div>

        <div className="w-full lg:w-[28%]">
          <InsuranceConfirmationActionsCard
            policyNumber={policyNumber}
            email={email || undefined}
            mobile={mobile ? `+91 ${mobile}` : undefined}
            onDownloadPolicy={handlePrint}
            onDownloadInvoice={handlePrint}
            onPrintPolicy={handlePrint}
            onEmailPolicy={handlePrint}
            onWhatsAppPolicy={handlePrint}
            onGoToMyBookings={() => router.push("/account/bookings")}
            onGoHome={() => router.push("/")}
          />
        </div>
      </div>
    </main>
  );
}
