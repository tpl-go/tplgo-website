"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  getAllBookings,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";

import VisaConfirmationHero from "@/app/components/confirmation/visa/VisaConfirmationHero";
import VisaConfirmationStatusTimeline from "@/app/components/confirmation/visa/VisaConfirmationStatusTimeline";
import VisaConfirmationApplicationCard from "@/app/components/confirmation/visa/VisaConfirmationApplicationCard";
import VisaConfirmationApplicantCard from "@/app/components/confirmation/visa/VisaConfirmationApplicantCard";
import VisaConfirmationDocumentCard from "@/app/components/confirmation/visa/VisaConfirmationDocumentCard";
import VisaConfirmationFareCard from "@/app/components/confirmation/visa/VisaConfirmationFareCard";
import VisaConfirmationActionsCard from "@/app/components/confirmation/visa/VisaConfirmationActionsCard";
import VisaStatusLogCard from "@/app/components/confirmation/visa/VisaStatusLogCard";

import {
  getVisaCurrentStatus,
  getVisaStatusLogs,
  type VisaApplicationStatus,
  type VisaStatusLog,
} from "@/app/lib/visa/visaStatusStorage";

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

function safeNumber(value: any, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? Math.round(num) : fallback;
}

function isVisaPayload(parsed: any) {
  return Boolean(
    parsed?.serviceType === "visa" ||
      parsed?.bookingType === "visa" ||
      parsed?.bookingMeta?.serviceType === "visa" ||
      parsed?.option?.visaType ||
      parsed?.visaTitle ||
      parsed?.applicationId
  );
}

function getPayloadAmount(parsed: any) {
  return Number(
    parsed?.fare?.totalPaid ||
      parsed?.fare?.totalAmount ||
      parsed?.paymentData?.totalPaid ||
      parsed?.fareBreakup?.finalTotal ||
      parsed?.pricingSnapshot?.finalTotal ||
      parsed?.finalTotal ||
      0
  );
}

function normalizeMobile(value: string) {
  return String(value || "").replace(/\D/g, "").slice(-10);
}

function normalizeVisaDetailPricingPayload(parsed: any, booking?: BookingItem | null) {
  if (!parsed) return parsed;

  const fare = parsed?.fare || {};
  const fareBreakup = parsed?.fareBreakup || {};
  const pricingSnapshot = parsed?.pricingSnapshot || fareBreakup || {};
  const walletBreakdown =
    parsed?.walletBreakdown || fare?.walletBreakdown || {};
  const benefitPricing =
    pricingSnapshot?.benefitPricing ||
    fareBreakup?.benefitPricing ||
    fare?.benefitPricing ||
    {};

  const travellers = safeNumber(
    pricingSnapshot?.travellers ||
      fareBreakup?.travellers ||
      fare?.travellers ||
      parsed?.travellers ||
      parsed?.applicants?.length ||
      1,
    1
  );

  const visaFee = safeNumber(
    pricingSnapshot?.visaFee ||
      fareBreakup?.visaFee ||
      fare?.visaFee ||
      parsed?.option?.embassyFee ||
      0
  );

  const serviceFee = safeNumber(
    pricingSnapshot?.serviceFee ||
      fareBreakup?.serviceFee ||
      fare?.serviceFee ||
      parsed?.option?.serviceFee ||
      0
  );

  const perApplicantTotal = safeNumber(
    pricingSnapshot?.perApplicantTotal ||
      fareBreakup?.perApplicantTotal ||
      fare?.perApplicantTotal ||
      parsed?.option?.totalPrice ||
      visaFee + serviceFee
  );

  const baseVisaAmount = safeNumber(
    pricingSnapshot?.baseVisaAmount ||
      fareBreakup?.baseVisaAmount ||
      fare?.baseVisaAmount ||
      benefitPricing?.baseAmount ||
      serviceFee * travellers
  );

  const grossTotal = safeNumber(
    pricingSnapshot?.grossTotal ||
      pricingSnapshot?.grossAmount ||
      fareBreakup?.grossTotal ||
      fare?.grossTotal ||
      benefitPricing?.grossAmount ||
      perApplicantTotal * travellers ||
      booking?.amount ||
      0
  );

  const totalVisaFees = safeNumber(
    pricingSnapshot?.totalVisaFees ||
      fareBreakup?.totalVisaFees ||
      fare?.totalVisaFees ||
      visaFee * travellers
  );

  const totalServiceFees = Math.max(
    safeNumber(
      pricingSnapshot?.totalServiceFees ||
        fareBreakup?.totalServiceFees ||
        fare?.totalServiceFees,
      grossTotal - totalVisaFees
    ),
    0
  );

  const nonBenefitTotal = safeNumber(
    pricingSnapshot?.nonBenefitTotal ||
      pricingSnapshot?.nonBenefitAmount ||
      fareBreakup?.nonBenefitTotal ||
      fare?.nonBenefitTotal ||
      benefitPricing?.nonBenefitAmount ||
      grossTotal - baseVisaAmount
  );

  const appliedOfferAmount = safeNumber(
    pricingSnapshot?.appliedOfferAmount ||
      fareBreakup?.appliedOfferAmount ||
      fare?.appliedOfferAmount ||
      fare?.offerApplied ||
      benefitPricing?.offerDiscount ||
      parsed?.appliedOffer?.discountAmount ||
      parsed?.offerData?.discountAmount ||
      0
  );

  const baseAfterOffer = safeNumber(
    pricingSnapshot?.baseAfterOffer ||
      fareBreakup?.baseAfterOffer ||
      fare?.baseAfterOffer ||
      benefitPricing?.baseAfterOffer ||
      baseVisaAmount - appliedOfferAmount
  );

  const totalBeforeWallet = safeNumber(
    pricingSnapshot?.totalBeforeWallet ||
      fareBreakup?.totalBeforeWallet ||
      fare?.totalBeforeWallet ||
      grossTotal - appliedOfferAmount
  );

  const promoUsed = safeNumber(
    pricingSnapshot?.promoUsed ||
      fareBreakup?.promoUsed ||
      fare?.promoUsed ||
      walletBreakdown?.promoUsed ||
      benefitPricing?.promoUsed ||
      0
  );

  const earnedUsed = safeNumber(
    pricingSnapshot?.earnedUsed ||
      fareBreakup?.earnedUsed ||
      fare?.earnedUsed ||
      walletBreakdown?.earnedUsed ||
      benefitPricing?.earnedUsed ||
      0
  );

  const refundUsed = safeNumber(
    pricingSnapshot?.refundUsed ||
      fareBreakup?.refundUsed ||
      fare?.refundUsed ||
      walletBreakdown?.refundUsed ||
      benefitPricing?.refundUsed ||
      0
  );

  const tplCredit = promoUsed + earnedUsed + refundUsed;

  const finalTotal = safeNumber(
    pricingSnapshot?.finalTotal ||
      fareBreakup?.finalTotal ||
      fare?.totalPaid ||
      fare?.totalAmount ||
      parsed?.paymentData?.totalPaid ||
      parsed?.finalTotal ||
      benefitPricing?.finalPayable ||
      booking?.amount ||
      totalBeforeWallet - tplCredit
  );

  const earnedOnThisBooking = safeNumber(
    pricingSnapshot?.earnedOnThisBooking ||
      fareBreakup?.earnedOnThisBooking ||
      fare?.walletBreakdown?.earnedOnThisBooking ||
      walletBreakdown?.earnedOnThisBooking ||
      parsed?.earnedCreditAmount ||
      Math.round(baseAfterOffer * 0.02)
  );

  const appliedOfferCode =
    pricingSnapshot?.appliedOfferCode ||
    fareBreakup?.appliedOfferCode ||
    fare?.appliedOfferCode ||
    parsed?.appliedOfferCode ||
    parsed?.appliedOffer?.code ||
    parsed?.offerData?.code ||
    "";

  const appliedOfferTitle =
    pricingSnapshot?.appliedOfferTitle ||
    fareBreakup?.appliedOfferTitle ||
    fare?.appliedOfferTitle ||
    parsed?.appliedOfferTitle ||
    parsed?.appliedOffer?.title ||
    parsed?.offerData?.title ||
    "";

  const offerData =
    pricingSnapshot?.offerData ||
    fareBreakup?.offerData ||
    fare?.offerData ||
    parsed?.offerData ||
    parsed?.appliedOffer ||
    null;

  const normalizedBenefitPricing = {
    ...benefitPricing,
    baseAmount: baseVisaAmount,
    visaCharges: nonBenefitTotal,
    nonBenefitAmount: nonBenefitTotal,
    grossAmount: grossTotal,
    offerDiscount: appliedOfferAmount,
    baseAfterOffer,
    promoUsed,
    earnedUsed,
    tplCreditUsed: promoUsed + earnedUsed,
    payableBeforeRefundWallet: totalBeforeWallet - promoUsed - earnedUsed,
    refundUsed,
    finalPayable: finalTotal,
  };

  const normalizedPricingSnapshot = {
    ...pricingSnapshot,

    visaFee,
    serviceFee,
    perApplicantTotal,
    travellers,

    baseVisaAmount,
    baseAfterOffer,

    totalVisaFees,
    totalServiceFees,
    nonBenefitTotal,

    grossTotal,
    totalBeforeOffer: grossTotal,

    appliedOfferAmount,
    appliedOfferCode,
    appliedOfferTitle,
    offerData,

    totalBeforeWallet,

    promoUsed,
    earnedUsed,
    refundUsed,
    tplCredit,
    finalTotal,

    earnedOnThisBooking,

    benefitPricing: normalizedBenefitPricing,
  };

  const normalizedWalletBreakdown = {
    ...walletBreakdown,
    promoUsed,
    earnedUsed,
    refundUsed,
    totalWalletUsed: tplCredit,
    earnedOnThisBooking,
  };

  return {
    ...parsed,
    pricingSnapshot: normalizedPricingSnapshot,
    fareBreakup: normalizedPricingSnapshot,
    walletBreakdown: normalizedWalletBreakdown,
    earnedCreditAmount: parsed?.earnedCreditAmount || earnedOnThisBooking,
    finalTotal,
    fare: {
      ...fare,
      visaFee,
      serviceFee,
      perApplicantTotal,
      travellers,

      baseVisaAmount,
      baseAfterOffer,
      nonBenefitTotal,

      totalVisaFees,
      totalServiceFees,

      grossTotal,
      offerApplied: appliedOfferAmount,
      appliedOfferAmount,
      appliedOfferCode,
      appliedOfferTitle,
      offerData,

      totalBeforeWallet,
      walletUsed: tplCredit,
      promoUsed,
      earnedUsed,
      refundUsed,
      totalPaid: finalTotal,
      totalAmount: finalTotal,

      benefitPricing: normalizedBenefitPricing,

      walletBreakdown: normalizedWalletBreakdown,
    },
    paymentData: {
      ...(parsed?.paymentData || {}),
      totalPaid: finalTotal,
      walletUsed: tplCredit,
      promoUsed,
      earnedUsed,
      refundUsed,
      appliedOfferAmount,
      appliedOfferCode,
      appliedOfferTitle,
      offerData,
      benefitPricing: normalizedBenefitPricing,
    },
    originalBookingBaseline: {
      ...(parsed?.originalBookingBaseline || {}),
      amount: finalTotal,
      payableAmount: finalTotal,
      totalBeforeWallet,
      grossTotal,
      baseVisaAmount,
      baseAfterOffer,
      nonBenefitTotal,
      appliedOfferAmount,
      travellers,
    },
  };
}

function getPayloadFromBooking(booking: BookingItem | null) {
  if (typeof window === "undefined") return null;

  const bookingId = String(booking?.id || "");
  const bookingTitle = String(booking?.title || "");
  const bookingMobile = normalizeMobile(String(booking?.mobile || ""));
  const bookingAmount = Number(booking?.amount || 0);

  if (booking?.payloadStorageKey) {
    const parsed = safeParse(localStorage.getItem(booking.payloadStorageKey));
    if (parsed) return normalizeVisaDetailPricingPayload(parsed, booking);
  }

  const sessionPayload = safeParse(
    sessionStorage.getItem("tplVisaConfirmationData") ||
      sessionStorage.getItem("visaPaymentSuccessData")
  );

  if (sessionPayload && isVisaPayload(sessionPayload)) {
    const sessionBookingId = String(sessionPayload?.bookingId || "");
    const sessionApplicationId = String(sessionPayload?.applicationId || "");
    const sessionMetaId = String(sessionPayload?.bookingMeta?.bookingId || "");
    const sessionMobile = normalizeMobile(
      String(
        sessionPayload?.leadApplicant?.mobile ||
          sessionPayload?.user?.mobile ||
          sessionPayload?.applicants?.[0]?.mobile ||
          ""
      )
    );
    const sessionAmount = getPayloadAmount(sessionPayload);

    if (
      sessionBookingId === bookingId ||
      sessionApplicationId === bookingId ||
      sessionMetaId === bookingId ||
      (bookingMobile && bookingMobile === sessionMobile) ||
      (bookingAmount > 0 && sessionAmount === bookingAmount)
    ) {
      return normalizeVisaDetailPricingPayload(sessionPayload, booking);
    }
  }

  try {
    const allKeys = Object.keys(localStorage);

    for (const key of allKeys) {
      const raw = localStorage.getItem(key);
      const parsed = safeParse(raw);

      if (!parsed || !isVisaPayload(parsed)) continue;

      const parsedBookingId = String(parsed?.bookingId || "");
      const parsedApplicationId = String(parsed?.applicationId || "");
      const parsedMetaBookingId = String(parsed?.bookingMeta?.bookingId || "");

      const parsedTitle = String(parsed?.visaTitle || parsed?.option?.title || "");
      const parsedMobile = normalizeMobile(
        String(
          parsed?.leadApplicant?.mobile ||
            parsed?.user?.mobile ||
            parsed?.applicants?.[0]?.mobile ||
            ""
        )
      );
      const parsedAmount = getPayloadAmount(parsed);

      const idMatch =
        parsedBookingId === bookingId ||
        parsedApplicationId === bookingId ||
        parsedMetaBookingId === bookingId ||
        (!!bookingId &&
          !!parsedBookingId &&
          (parsedBookingId.endsWith(bookingId.slice(-4)) ||
            bookingId.endsWith(parsedBookingId.slice(-4)))) ||
        (!!bookingId &&
          !!parsedApplicationId &&
          (parsedApplicationId.endsWith(bookingId.slice(-4)) ||
            bookingId.endsWith(parsedApplicationId.slice(-4))));

      const titleMatch =
        bookingTitle &&
        parsedTitle &&
        (bookingTitle.includes(parsedTitle) || parsedTitle.includes(bookingTitle));

      const mobileMatch =
        bookingMobile && parsedMobile && bookingMobile === parsedMobile;

      const amountMatch =
        bookingAmount > 0 && parsedAmount > 0 && bookingAmount === parsedAmount;

      if (idMatch || (titleMatch && mobileMatch) || (mobileMatch && amountMatch)) {
        return normalizeVisaDetailPricingPayload(parsed, booking);
      }
    }
  } catch {}

  if (booking) {
    const fallbackPayload = {
      bookingId: booking.id,
      applicationId: booking.id,
      bookingStatus: "Application Submitted",
      applicationStatus: "Application Submitted",
      paymentStatus: "Paid",
      bookedOn: booking.bookingDate,
      serviceType: "visa",
      bookingType: "visa",
      visaTitle: booking.title,
      country: "",
      nationality: "",
      visaType: "Visa",
      travelDate: booking.travelDate,
      travellers: 1,
      leadApplicant: {
        firstName: booking.leadTraveller?.name || "Applicant",
        lastName: "",
        mobile: booking.mobile,
        email: booking.leadTraveller?.email || "",
      },
      applicants: [
        {
          title: "",
          firstName: booking.leadTraveller?.name || "Applicant",
          lastName: "",
          dob: "",
          gender: "",
          mobile: booking.mobile,
          email: booking.leadTraveller?.email || "",
        },
      ],
      passports: [],
      uploadedDocsByApplicant: [],
      fare: {
        totalPaid: booking.amount,
        totalAmount: booking.amount,
        travellers: 1,
      },
      paymentData: {
        totalPaid: booking.amount,
      },
    };

    return normalizeVisaDetailPricingPayload(fallbackPayload, booking);
  }

  return null;
}

export default function VisaBookingDetailPage() {
  const params = useParams();
  const router = useRouter();

  const bookingId = String(params?.bookingId || "");

  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [status, setStatus] =
    useState<VisaApplicationStatus>("Application Submitted");
  const [logs, setLogs] = useState<VisaStatusLog[]>([]);

  useEffect(() => {
    const all = getAllBookings();

    const found =
      all.find((item) => item.id === bookingId && item.type === "visa") ||
      all.find(
        (item) =>
          item.type === "visa" &&
          (item.id.endsWith(bookingId.slice(-4)) ||
            bookingId.endsWith(item.id.slice(-4)))
      ) ||
      null;

    setBooking(found);

    const parsed = getPayloadFromBooking(found);
    setPayload(parsed);

    if (found) {
      setStatus(getVisaCurrentStatus(found.id));
      setLogs(getVisaStatusLogs(found.id));
    }
  }, [bookingId]);

  const data = payload;

  const applicationId = useMemo(() => {
    return data?.applicationId || data?.bookingId || booking?.id || bookingId;
  }, [data?.applicationId, data?.bookingId, booking?.id, bookingId]);

  const paymentId = useMemo(() => {
    return data?.paymentId || data?.transactionId || buildPaymentId();
  }, [data?.paymentId, data?.transactionId]);

  if (!booking || !data) {
    return (
      <main className="min-h-screen bg-[#eef3f8] text-black">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h1 className="text-xl font-black text-gray-950">
              Visa application detail not found
            </h1>

            <p className="mt-2 text-sm font-semibold text-gray-600">
              The application payload is missing or this booking is not available.
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

  const leadApplicant = data?.leadApplicant || data?.applicants?.[0] || {};
  const mobile = cleanMobile(leadApplicant?.mobile);
  const email = leadApplicant?.email || "";

  const applicationStatus = status;
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
          Visa Application Detail
        </div>

        <div className="text-sm font-semibold text-orange-600">
          Application ID: {applicationId}
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-4 sm:px-4 sm:py-6 lg:flex-row">
        <div className="flex w-full flex-col gap-4 lg:w-[72%]">
          <VisaConfirmationHero
            applicationId={applicationId}
            visaTitle={data?.visaTitle || booking.title || "Visa Application"}
            country={data?.country || data?.searchData?.destinationCountry || ""}
            applicationStatus={applicationStatus}
            paymentStatus={paymentStatus}
            bookedOn={bookedOn}
          />

          <VisaConfirmationStatusTimeline currentStatus={applicationStatus} />

          <VisaStatusLogCard logs={logs} />

          <VisaConfirmationApplicationCard data={data} />

          <VisaConfirmationApplicantCard
            applicants={data?.applicants || []}
            passports={data?.passports || []}
          />

          <VisaConfirmationDocumentCard
            uploadedDocsByApplicant={data?.uploadedDocsByApplicant || []}
          />

          <VisaConfirmationFareCard data={data} paymentId={paymentId} />

          {data?.specialRequest && (
            <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
              <h2 className="text-xl font-black text-gray-950">
                Special Request
              </h2>
              <p className="mt-2 text-sm font-semibold text-gray-700">
                {data.specialRequest}
              </p>
            </div>
          )}
        </div>

        <div className="w-full lg:w-[28%]">
          <VisaConfirmationActionsCard
            applicationId={applicationId}
            email={email || undefined}
            mobile={mobile ? `+91 ${mobile}` : undefined}
            onDownloadApplication={handlePrint}
            onDownloadInvoice={handlePrint}
            onPrintApplication={handlePrint}
            onCheckStatus={() =>
              router.push(
                `/visa/status?bookingId=${encodeURIComponent(
                  booking.id
                )}&from=account`
              )
            }
            onGoToMyBookings={() => router.push("/account/bookings")}
            onGoHome={() => router.push("/")}
          />
        </div>
      </div>
    </main>
  );
}
