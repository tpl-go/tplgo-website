"use client";

/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  BOOKING_UPDATED_EVENT,
  getAllBookings,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";
import { getBookingPayload } from "@/app/lib/booking/bookingActionHelpers";

import InsuranceManageLayout, {
  type InsuranceManageTab,
} from "@/app/components/manage/insurance/InsuranceManageLayout";
import InsuranceManageSummary from "@/app/components/manage/insurance/InsuranceManageSummary";
import InsuranceManageTravellerDetails, {
  type InsuranceManageTraveller,
} from "@/app/components/manage/insurance/InsuranceManageTravellerDetails";
import InsuranceManageNomineeDetails, {
  type InsuranceManageNominee,
} from "@/app/components/manage/insurance/InsuranceManageNomineeDetails";
import InsuranceManageMedicalDeclaration, {
  type InsuranceManageMedicalDeclarationData,
} from "@/app/components/manage/insurance/InsuranceManageMedicalDeclaration";
import InsuranceManageClaimSupport from "@/app/components/manage/insurance/InsuranceManageClaimSupport";

import { formatCoverageAmount } from "@/app/lib/insurance/insurancePricing";

type Payload = any;

function dispatchBookingUpdate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(BOOKING_UPDATED_EVENT));
}

function savePayload(payloadStorageKey: string | undefined, payload: any) {
  if (typeof window === "undefined") return false;
  if (!payloadStorageKey) return false;

  localStorage.setItem(payloadStorageKey, JSON.stringify(payload));
  dispatchBookingUpdate();
  return true;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "-";

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
  if (Number.isNaN(date.getTime())) return value || "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function resolvePolicyTitle(payload: Payload | null, booking: BookingItem | null) {
  const provider = payload?.provider || payload?.plan?.provider || "";
  const planName = payload?.planName || payload?.plan?.planName || "";

  return (
    `${provider} ${planName}`.trim() ||
    booking?.title ||
    "Insurance Policy"
  );
}

function resolveDestination(payload: Payload | null) {
  return (
    payload?.destination ||
    payload?.search?.destination ||
    payload?.searchData?.destination ||
    "Destination not available"
  );
}

function resolveTravelDates(payload: Payload | null, booking: BookingItem | null) {
  return (
    payload?.travelDates ||
    payload?.search?.travelDates ||
    payload?.searchData?.travelDates ||
    booking?.travelDate ||
    "-"
  );
}

function resolveStartDate(payload: Payload | null, booking: BookingItem | null) {
  return (
    payload?.startDate ||
    payload?.search?.fromDate ||
    payload?.search?.startDate ||
    payload?.searchData?.startDate ||
    booking?.travelDate ||
    ""
  );
}

function normalizeTravellers(payload: Payload | null): InsuranceManageTraveller[] {
  const list = Array.isArray(payload?.travellers) ? payload.travellers : [];

  if (list.length) {
    return list.map((item: any, index: number) => ({
      id: item?.id || `traveller-${index + 1}`,
      title: item?.title || "",
      firstName: item?.firstName || item?.name?.split?.(" ")?.[0] || "",
      lastName:
        item?.lastName || item?.name?.split?.(" ")?.slice(1).join(" ") || "",
      dob: item?.dob || item?.dateOfBirth || "",
      age: String(item?.age || ""),
      gender: item?.gender || "",
      passportNumber: item?.passportNumber || "",
      passportExpiry: item?.passportExpiry || "",
    }));
  }

  const lead = payload?.leadTraveller || {};

  return [
    {
      id: "traveller-1",
      title: lead?.title || "",
      firstName: lead?.firstName || lead?.name?.split?.(" ")?.[0] || "",
      lastName:
        lead?.lastName || lead?.name?.split?.(" ")?.slice(1).join(" ") || "",
      dob: lead?.dob || "",
      age: String(lead?.age || ""),
      gender: lead?.gender || "",
      passportNumber: lead?.passportNumber || "",
      passportExpiry: lead?.passportExpiry || "",
    },
  ];
}

function normalizeNominee(payload: Payload | null): InsuranceManageNominee {
  const nominee = payload?.nominee || {};

  return {
    fullName: nominee?.fullName || "",
    relationship: nominee?.relationship || "",
    dob: nominee?.dob || "",
    mobile: nominee?.mobile || payload?.user?.mobile || "",
    email: nominee?.email || payload?.user?.email || "",
    address: nominee?.address || "",
  };
}

function normalizeMedical(
  payload: Payload | null
): InsuranceManageMedicalDeclarationData {
  const medical = payload?.medicalDeclaration || {};

  return {
    hasMedicalCondition: Boolean(medical?.hasMedicalCondition),
    medicalConditions: medical?.medicalConditions || "",
    takingMedication: Boolean(medical?.takingMedication),
    medicationDetails: medical?.medicationDetails || "",
    recentHospitalization: Boolean(medical?.recentHospitalization),
    hospitalizationDetails: medical?.hospitalizationDetails || "",
    doctorConsultationRequired: Boolean(medical?.doctorConsultationRequired),
  };
}

function resolveTotalAmount(payload: Payload | null, booking: BookingItem | null) {
  return Number(
    payload?.fare?.totalPaid ||
      payload?.fare?.totalAmount ||
      payload?.paymentData?.totalPaid ||
      payload?.fareBreakup?.finalTotal ||
      payload?.originalBookingBaseline?.payableAmount ||
      booking?.amount ||
      0
  );
}

function isPassportRequired(payload: Payload | null) {
  const destination = String(
    payload?.destination ||
      payload?.search?.destination ||
      payload?.searchData?.destination ||
      ""
  ).toLowerCase();

  const insuranceType = String(
    payload?.insuranceType ||
      payload?.search?.insuranceType ||
      payload?.plan?.insuranceType ||
      ""
  ).toLowerCase();

  return (
    insuranceType.includes("international") ||
    insuranceType.includes("visa") ||
    insuranceType.includes("student") ||
    destination.includes("schengen") ||
    (!destination.includes("domestic") && !destination.includes("india"))
  );
}

function InsuranceManagePageContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") || "";

  const [activeTab, setActiveTab] =
    useState<InsuranceManageTab>("summary");
  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [travellers, setTravellers] = useState<InsuranceManageTraveller[]>([]);
  const [nominee, setNominee] = useState<InsuranceManageNominee>({});
  const [medicalDeclaration, setMedicalDeclaration] =
    useState<InsuranceManageMedicalDeclarationData>({});

  const loadBooking = () => {
    if (!bookingId) {
      setIsLoading(false);
      return;
    }

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

    if (found?.payloadStorageKey) {
      const savedPayload = getBookingPayload<Payload>(found.payloadStorageKey);
      const nextPayload = savedPayload ? { ...savedPayload } : null;

      setPayload(nextPayload);
      setTravellers(normalizeTravellers(nextPayload));
      setNominee(normalizeNominee(nextPayload));
      setMedicalDeclaration(normalizeMedical(nextPayload));
    } else {
      setPayload(null);
      setTravellers([]);
      setNominee({});
      setMedicalDeclaration({});
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadBooking();

    window.addEventListener(BOOKING_UPDATED_EVENT, loadBooking);
    window.addEventListener("storage", loadBooking);
    window.addEventListener("focus", loadBooking);

    return () => {
      window.removeEventListener(BOOKING_UPDATED_EVENT, loadBooking);
      window.removeEventListener("storage", loadBooking);
      window.removeEventListener("focus", loadBooking);
    };
  }, [bookingId]);

  const policyTitle = useMemo(
    () => resolvePolicyTitle(payload, booking),
    [payload, booking]
  );

  const destination = useMemo(() => resolveDestination(payload), [payload]);

  const travelDates = useMemo(
    () => resolveTravelDates(payload, booking),
    [payload, booking]
  );

  const startDate = useMemo(
    () => resolveStartDate(payload, booking),
    [payload, booking]
  );

  const passportRequired = useMemo(
    () => isPassportRequired(payload),
    [payload]
  );

  const plan = payload?.plan || {};
  const policyNumber = payload?.policyNumber || payload?.bookingId || booking?.id || "";
  const provider = payload?.provider || plan?.provider || "Insurance Provider";
  const planName = payload?.planName || plan?.planName || "Insurance Plan";
  const bookingStatus = payload?.policyStatus || payload?.bookingStatus || booking?.status || "Active";
  const bookedAt =
    payload?.bookedOn ||
    payload?.paymentData?.paidAt ||
    booking?.bookingDate ||
    "";

  const coverageAmount = formatCoverageAmount(
    Number(payload?.coverageAmount || plan?.coverageAmount || 0)
  );

  const totalAmount = resolveTotalAmount(payload, booking);

  const handleSaveTravellers = () => {
    if (!booking?.payloadStorageKey || !payload) return;

    const nextPayload = {
      ...payload,
      travellers: travellers.map((traveller, index) => ({
        ...traveller,
        id: traveller.id || `traveller-${index + 1}`,
      })),
      leadTraveller: {
        ...(payload?.leadTraveller || {}),
        ...(travellers[0] || {}),
        name: `${travellers[0]?.firstName || ""} ${
          travellers[0]?.lastName || ""
        }`.trim(),
      },
    };

    savePayload(booking.payloadStorageKey, nextPayload);
    setPayload(nextPayload);
    alert("Traveller details updated successfully.");
  };

  const handleSaveNominee = () => {
    if (!booking?.payloadStorageKey || !payload) return;

    const nextPayload = {
      ...payload,
      nominee,
      user: {
        ...(payload?.user || {}),
        mobile: nominee.mobile || payload?.user?.mobile || "",
        email: nominee.email || payload?.user?.email || "",
      },
    };

    savePayload(booking.payloadStorageKey, nextPayload);
    setPayload(nextPayload);
    alert("Nominee / emergency contact updated successfully.");
  };

  const handleSaveMedical = () => {
    if (!booking?.payloadStorageKey || !payload) return;

    const nextPayload = {
      ...payload,
      medicalDeclaration,
    };

    savePayload(booking.payloadStorageKey, nextPayload);
    setPayload(nextPayload);
    alert("Medical declaration updated successfully.");
  };

  const handleDownloadPolicy = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-[#f8f9fb] px-3 py-6 md:px-4 md:py-10">
        <div className="mx-auto max-w-[1440px] rounded-[20px] border border-black/5 bg-white p-5 text-sm font-semibold leading-5 text-[#6b7280] md:rounded-[28px] md:p-8">
          Loading insurance manage booking...
        </div>
      </main>
    );
  }

  if (!booking || !payload) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-[#f8f9fb] px-3 py-6 md:px-4 md:py-10">
        <div className="mx-auto max-w-[1440px] rounded-[20px] border border-black/5 bg-white p-5 md:rounded-[28px] md:p-8">
          <h1 className="break-words text-xl font-bold text-[#111827]">
            Insurance booking not found
          </h1>
          <p className="mt-2 break-words text-sm font-semibold leading-5 text-[#6b7280]">
            Please open this policy from My Bookings.
          </p>
        </div>
      </main>
    );
  }

  return (
    <InsuranceManageLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      bookingId={booking.id}
      policyTitle={policyTitle}
      destination={destination}
      startDateLabel={formatDateOnly(startDate)}
    >
      {activeTab === "summary" && (
        <InsuranceManageSummary
          bookingStatus={bookingStatus}
          bookedAt={formatDateTime(bookedAt)}
          policyNumber={policyNumber}
          provider={provider}
          planName={planName}
          destination={destination}
          travelDates={travelDates}
          travellersLabel={booking.travellers}
          coverageAmount={coverageAmount}
          totalAmount={totalAmount}
        />
      )}

      {activeTab === "traveller-details" && (
        <InsuranceManageTravellerDetails
          travellers={travellers}
          isPassportRequired={passportRequired}
          onChange={setTravellers}
          onSave={handleSaveTravellers}
        />
      )}

      {activeTab === "nominee-contact" && (
        <InsuranceManageNomineeDetails
          nominee={nominee}
          onChange={setNominee}
          onSave={handleSaveNominee}
        />
      )}

      {activeTab === "medical-declaration" && (
        <InsuranceManageMedicalDeclaration
          value={medicalDeclaration}
          onChange={setMedicalDeclaration}
          onSave={handleSaveMedical}
        />
      )}

      {activeTab === "claim-support" && (
        <InsuranceManageClaimSupport
          policyNumber={policyNumber}
          provider={provider}
          emergencyHelpline={plan?.helpline || payload?.emergencyHelpline}
          insurerContact={payload?.insurerContact || plan?.insurerContact}
          onDownloadPolicy={handleDownloadPolicy}
        />
      )}

      {activeTab === "policy-download" && (
        <InsuranceManageClaimSupport
          policyNumber={policyNumber}
          provider={provider}
          emergencyHelpline={plan?.helpline || payload?.emergencyHelpline}
          insurerContact={payload?.insurerContact || plan?.insurerContact}
          onDownloadPolicy={handleDownloadPolicy}
        />
      )}
    </InsuranceManageLayout>
  );
}

export default function InsuranceManagePage() {
  return (
    <Suspense fallback={<div />}>
      <InsuranceManagePageContent />
    </Suspense>
  );
}
