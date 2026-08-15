"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  BOOKING_UPDATED_EVENT,
  getAllBookings,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";
import { getBookingPayload } from "@/app/lib/booking/bookingActionHelpers";
import {
  executeBackendSamePriceManage,
  prepareBackendManageRequest,
  persistBackendManageCache,
} from "@/app/lib/manage/backendManageBookingIntegration";

import CruiseManageLayout, {
  type CruiseManageTab,
} from "@/app/components/manage/cruise/CruiseManageLayout";
import CruiseManageSummary from "@/app/components/manage/cruise/CruiseManageSummary";
import CruiseManageTravellerDetails, {
  type CruiseManageTraveller,
} from "@/app/components/manage/cruise/CruiseManageTravellerDetails";
import CruiseManageContactDetails, {
  type CruiseManageContact,
} from "@/app/components/manage/cruise/CruiseManageContactDetails";
import CruiseManageSpecialRequest from "@/app/components/manage/cruise/CruiseManageSpecialRequest";
import CruiseManageCabinAddons, {
  type CruiseCabinQuote,
  type CruiseCabinVariant,
} from "@/app/components/manage/cruise/CruiseManageCabinAddons";

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

function getTravellerName(traveller: CruiseManageTraveller) {
  return (
    traveller?.name ||
    `${traveller?.firstName || ""} ${traveller?.lastName || ""}`.trim() ||
    "Traveller"
  );
}

function normalizeTravellers(payload: Payload | null): CruiseManageTraveller[] {
  const list = Array.isArray(payload?.travellers?.list)
    ? payload.travellers.list
    : [];

  if (list.length) {
    return list.map((item: any, index: number) => ({
      ...item,
      id: item?.id || `traveller-${index + 1}`,
      firstName: item?.firstName || item?.name?.split?.(" ")?.[0] || "",
      lastName:
        item?.lastName || item?.name?.split?.(" ")?.slice(1).join(" ") || "",
      name:
        item?.name ||
        `${item?.firstName || ""} ${item?.lastName || ""}`.trim(),
      gender: item?.gender || "",
      age: String(item?.age || ""),
      passportNumber: item?.passportNumber || "",
    }));
  }

  return [
    {
      id: "traveller-1",
      firstName: "",
      lastName: "",
      name: "Traveller",
      gender: "",
      age: "",
      passportNumber: "",
    },
  ];
}

function normalizeContact(payload: Payload | null): CruiseManageContact {
  const contact = payload?.travellers?.contact || {};

  return {
    countryCode: contact?.countryCode || "+91",
    mobile: contact?.mobile || contact?.phone || "",
    email: contact?.email || "",
  };
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

function extractCruiseLine(title: string) {
  const parts = String(title || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  return parts[2] || parts[1] || "";
}

function extractShipName(title: string) {
  const parts = String(title || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  return parts[3] || "";
}

function CruiseManagePageContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") || "";

  const [activeTab, setActiveTab] = useState<CruiseManageTab>("summary");
  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [travellers, setTravellers] = useState<CruiseManageTraveller[]>([]);
  const [contact, setContact] = useState<CruiseManageContact>({
    countryCode: "+91",
    mobile: "",
    email: "",
  });
  const [specialRequest, setSpecialRequest] = useState("");
  const [activeCabinVariant, setActiveCabinVariant] =
    useState<CruiseCabinVariant | null>(null);

  const loadBooking = () => {
    if (!bookingId) {
      setIsLoading(false);
      return;
    }

    const all = getAllBookings();
    const found =
      all.find((item) => item.id === bookingId && item.type === "cruise") ||
      null;

    setBooking(found);

    if (found?.payloadStorageKey) {
      const savedPayload = getBookingPayload<Payload>(found.payloadStorageKey);

      setPayload(savedPayload ? { ...savedPayload } : null);
      setTravellers(normalizeTravellers(savedPayload));
      setContact(normalizeContact(savedPayload));
      setSpecialRequest(savedPayload?.specialRequest || "");
      setActiveCabinVariant(savedPayload?.selectedCabin || null);
    } else {
      setPayload(null);
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

  const cruise = payload?.cruise || {};
  const pricingSummary = payload?.cabins?.pricingSummary || {};

  const currentCabin =
    payload?.selectedCabin || pricingSummary?.cabins?.[0] || {};

  const cabinName =
    currentCabin?.name || currentCabin?.cabinName || "Selected Cabin";

  const cruiseTitleRaw =
    cruise?.title ||
    cruise?.name ||
    payload?.cruiseTitle ||
    payload?.title ||
    "Cruise Booking";

  const cruiseLine =
    cruise?.cruiseLine ||
    cruise?.line ||
    cruise?.lineName ||
    cruise?.operator ||
    cruise?.operatorName ||
    payload?.cruiseLine ||
    payload?.cruiseOperator ||
    extractCruiseLine(cruiseTitleRaw) ||
    "-";

  const shipName =
    cruise?.shipName ||
    cruise?.ship ||
    cruise?.vesselName ||
    cruise?.vessel ||
    payload?.shipName ||
    payload?.vesselName ||
    extractShipName(cruiseTitleRaw) ||
    "-";

  const cruiseTitle = cruiseTitleRaw || "Cruise Booking";

  const sailingDate = cruise?.sailingDate || cruise?.sailingStartDate || "-";

  const departurePort =
    cruise?.departurePort || cruise?.fromPort || cruise?.startPort || "-";

  const arrivalPort =
    cruise?.arrivalPort || cruise?.toPort || cruise?.endPort || "-";

  const sailingEndDate =
    cruise?.sailingEndDate || cruise?.returnDate || cruise?.endDate || "-";

  const cabins = Number(pricingSummary?.cabinsCount || 1);

  const nights = Number(
    cruise?.nights ||
      cruise?.durationNights ||
      cruise?.duration ||
      cruise?.durationLabel?.match?.(/\d+/)?.[0] ||
      1
  );

  const fareSummary = {
    baseFare: Number(pricingSummary?.cabinsTotal || 0),
    taxes: Number(pricingSummary?.taxesAndFees || 0),
    portCharges: Number(pricingSummary?.portCharges || 0),
    gratuityCharges: Number(pricingSummary?.gratuityCharges || 0),
    totalAmount: Number(
      payload?.managePayment?.updatedTotalAmount ||
        payload?.paymentData?.finalPayableAmount ||
        payload?.paymentData?.totalPaid ||
        pricingSummary?.grandTotal ||
        booking?.amount ||
        0
    ),
  };

  const cabinQuote = useMemo<CruiseCabinQuote>(() => {
    const currentVariant = payload?.selectedCabin || currentCabin || {};
    const nextVariant = activeCabinVariant || currentVariant;

    const oldTotal =
      (Number(currentVariant?.price || 0) +
        Number(currentVariant?.taxes || 0)) *
      cabins *
      nights;

    const newTotal =
      (Number(nextVariant?.price || 0) + Number(nextVariant?.taxes || 0)) *
      cabins *
      nights;

    const difference = newTotal - oldTotal;

    return {
      oldTotal,
      newTotal,
      difference,
      settlementMode:
        difference > 0
          ? "payment"
          : difference < 0
          ? "wallet_credit"
          : "save",
    };
  }, [payload, currentCabin, activeCabinVariant, cabins, nights]);

  const handleSaveTravellers = async () => {
    if (!booking?.payloadStorageKey || !payload) return;

    const nextPayload = {
      ...payload,
      travellers: {
        ...(payload?.travellers || {}),
        list: travellers.map((traveller, index) => ({
          ...traveller,
          id: traveller.id || `traveller-${index + 1}`,
          name: getTravellerName(traveller),
        })),
      },
    };

    const backendResult = await executeBackendSamePriceManage({
      booking,
      payload,
      serviceType: "cruise",
      section: "traveller-details",
      changeType: "traveller_update",
      settlementMode: "save",
      currentAmount: fareSummary.totalAmount,
      requestedAmount: fareSummary.totalAmount,
      requestedChange: { travellers: nextPayload.travellers },
      beforeSnapshot: payload,
      afterSnapshot: nextPayload,
    });

    const payloadToSave =
      backendResult.ok && backendResult.payload
        ? { ...nextPayload, ...backendResult.payload }
        : nextPayload;

    savePayload(booking.payloadStorageKey, payloadToSave);
    setPayload(payloadToSave);
    alert("Traveller details updated successfully.");
  };

  const handleSaveContact = async () => {
    if (!booking?.payloadStorageKey || !payload) return;

    const nextPayload = {
      ...payload,
      travellers: {
        ...(payload?.travellers || {}),
        contact: {
          ...(payload?.travellers?.contact || {}),
          countryCode: contact.countryCode || "+91",
          mobile: contact.mobile,
          email: contact.email,
        },
      },
    };

    const backendResult = await executeBackendSamePriceManage({
      booking,
      payload,
      serviceType: "cruise",
      section: "contact-details",
      changeType: "contact_update",
      settlementMode: "save",
      currentAmount: fareSummary.totalAmount,
      requestedAmount: fareSummary.totalAmount,
      requestedChange: { travellers: nextPayload.travellers },
      beforeSnapshot: payload,
      afterSnapshot: nextPayload,
    });

    const payloadToSave =
      backendResult.ok && backendResult.payload
        ? { ...nextPayload, ...backendResult.payload }
        : nextPayload;

    savePayload(booking.payloadStorageKey, payloadToSave);
    setPayload(payloadToSave);
    alert("Contact details updated successfully.");
  };

  const handleSaveSpecialRequest = async () => {
    if (!booking?.payloadStorageKey || !payload) return;

    const nextPayload = {
      ...payload,
      specialRequest,
    };

    const backendResult = await executeBackendSamePriceManage({
      booking,
      payload,
      serviceType: "cruise",
      section: "special-request",
      changeType: "add_on_update",
      settlementMode: "save",
      currentAmount: fareSummary.totalAmount,
      requestedAmount: fareSummary.totalAmount,
      requestedChange: { specialRequest },
      beforeSnapshot: payload,
      afterSnapshot: nextPayload,
    });

    const payloadToSave =
      backendResult.ok && backendResult.payload
        ? { ...nextPayload, ...backendResult.payload }
        : nextPayload;

    savePayload(booking.payloadStorageKey, payloadToSave);
    setPayload(payloadToSave);
    alert("Special request updated successfully.");
  };

  const handleCabinContinue = async () => {
    if (!booking?.payloadStorageKey || !payload) return;

    const selectedCabinForDraft =
      activeCabinVariant || currentCabin || payload?.selectedCabin || null;

    if (!selectedCabinForDraft) {
      alert("Please select a cabin option first.");
      return;
    }

    const nextPayload = {
      ...payload,
      manageDraft: {
        ...(payload.manageDraft || {}),
        section: "cabin-addons",
        selectedCabin: selectedCabinForDraft,
        cabinQuote,
      },
    };

    const backendResult = await prepareBackendManageRequest({
      booking,
      payload: nextPayload,
      serviceType: "cruise",
      section: "cabin-addons",
      changeType:
        cabinQuote.settlementMode === "payment"
          ? "upgrade"
          : cabinQuote.settlementMode === "wallet_credit"
          ? "downgrade"
          : "same_price",
      settlementMode: cabinQuote.settlementMode,
      currentAmount: cabinQuote.oldTotal,
      requestedAmount: cabinQuote.newTotal,
      requestedChange: {
        selectedCabin: selectedCabinForDraft,
        cabinQuote,
      },
      beforeSnapshot: payload,
      afterSnapshot: nextPayload,
    });

    if (!backendResult.ok && !backendResult.fallbackAllowed) {
      alert(backendResult.error || "Backend manage booking request failed.");
      return;
    }

    const payloadToSave =
      backendResult.ok && backendResult.payload
        ? { ...nextPayload, ...backendResult.payload }
        : nextPayload;

    persistBackendManageCache(booking.payloadStorageKey, payloadToSave);

    window.location.href = `/manage/payment?bookingId=${encodeURIComponent(
      booking.id
    )}&section=cabin-addons&type=cruise`;
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] px-4 py-10">
        <div className="mx-auto max-w-[1440px] rounded-[28px] border border-black/5 bg-white p-8 text-sm text-[#6b7280]">
          Loading cruise manage booking...
        </div>
      </main>
    );
  }

  if (!booking || !payload) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] px-4 py-10">
        <div className="mx-auto max-w-[1440px] rounded-[28px] border border-black/5 bg-white p-8">
          <h1 className="text-xl font-bold text-[#111827]">
            Cruise booking not found
          </h1>
        </div>
      </main>
    );
  }

  return (
    <CruiseManageLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      bookingId={booking.id}
      cruiseTitle={cruiseTitle}
      routeLabel={cruise?.route || "-"}
      sailingDateLabel={formatDateOnly(sailingDate)}
    >
      {activeTab === "summary" && (
        <CruiseManageSummary
          bookingStatus={booking.status}
          bookedAt={booking.bookingDate}
          cruiseTitle={cruiseTitle}
          cruiseLine={cruiseLine}
          shipName={shipName}
          route={cruise?.route || "-"}
          departurePort={departurePort}
          arrivalPort={arrivalPort}
          sailingDate={formatDateOnly(sailingDate)}
          sailingEndDate={formatDateOnly(sailingEndDate)}
          cabinName={cabinName}
          travellersLabel={`${travellers.length || 1} Traveller`}
          totalTravellers={travellers.length}
          fareSummary={fareSummary}
          totalAmount={fareSummary.totalAmount}
        />
      )}

      {activeTab === "traveller-details" && (
        <CruiseManageTravellerDetails
          travellers={travellers}
          onChange={setTravellers}
          onSave={handleSaveTravellers}
        />
      )}

      {activeTab === "contact-details" && (
        <CruiseManageContactDetails
          contact={contact}
          onChange={setContact}
          onSave={handleSaveContact}
        />
      )}

      {activeTab === "special-request" && (
        <CruiseManageSpecialRequest
          value={specialRequest}
          onChange={setSpecialRequest}
          onSave={handleSaveSpecialRequest}
        />
      )}

      {activeTab === "cabin-addons" && (
        <CruiseManageCabinAddons
          currentCabinName={cabinName}
          cabins={cabins}
          nights={nights}
          selectedCabin={currentCabin}
          variants={
            Array.isArray(pricingSummary?.cabins) ? pricingSummary.cabins : []
          }
          activeVariantId={activeCabinVariant?.id}
          onVariantChange={setActiveCabinVariant}
          quote={cabinQuote}
          onContinue={handleCabinContinue}
        />
      )}
    </CruiseManageLayout>
  );
}

export default function CruiseManagePage() {
  return (
    <Suspense fallback={<div />}>
      <CruiseManagePageContent />
    </Suspense>
  );
}
