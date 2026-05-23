"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  BOOKING_UPDATED_EVENT,
  getAllBookings,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";
import { getBookingPayload } from "@/app/lib/booking/bookingActionHelpers";

import CabManageLayout, {
  type CabManageTab,
} from "@/app/components/manage/cab/CabManageLayout";
import CabManageSummary from "@/app/components/manage/cab/CabManageSummary";
import CabManageTravellerDetails, {
  type CabManageTraveller,
} from "@/app/components/manage/cab/CabManageTravellerDetails";
import CabManageContactDetails, {
  type CabManageContact,
} from "@/app/components/manage/cab/CabManageContactDetails";
import CabManageSpecialRequest from "@/app/components/manage/cab/CabManageSpecialRequest";
import CabManageAddons, {
  type CabQuote,
  type CabVariant,
} from "@/app/components/manage/cab/CabManageAddons";

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

function getTravellerName(item: CabManageTraveller) {
  return (
    item?.fullName ||
    item?.name ||
    `${item?.firstName || ""} ${item?.lastName || ""}`.trim() ||
    "Traveller"
  );
}

function normalizeTravellers(payload: Payload | null): CabManageTraveller[] {
  const list = Array.isArray(payload?.travellers) ? payload.travellers : [];

  if (list.length) {
    return list.map((item: any, index: number) => {
      const fullName = String(item?.fullName || item?.name || "").trim();
      const parts = fullName.split(" ").filter(Boolean);

      return {
        ...item,
        id: item?.id || item?.travellerId || `traveller-${index + 1}`,
        firstName: item?.firstName || parts[0] || "",
        lastName: item?.lastName || parts.slice(1).join(" ") || "",
        name:
          item?.name ||
          item?.fullName ||
          `${item?.firstName || ""} ${item?.lastName || ""}`.trim(),
        fullName:
          item?.fullName ||
          item?.name ||
          `${item?.firstName || ""} ${item?.lastName || ""}`.trim(),
        gender: item?.gender || "",
        age: String(item?.age || ""),
      };
    });
  }

  return [
    {
      id: "traveller-1",
      firstName: "",
      lastName: "",
      name: "Traveller",
      fullName: "Traveller",
      gender: "",
      age: "",
    },
  ];
}

function normalizeContact(payload: Payload | null): CabManageContact {
  const contact = payload?.contactDetails || {};

  return {
    countryCode: contact?.countryCode || "+91",
    mobile:
      contact?.mobile ||
      contact?.phone ||
      payload?.mobile ||
      payload?.phone ||
      "",
    email: contact?.email || payload?.email || "",
  };
}

function normalizeCabVariant(payload: Payload | null): CabVariant | null {
  const cab = payload?.cab || {};

  return {
    id: cab?.id || payload?.cabId || payload?.vehicleId || "current-cab",
    name:
      payload?.cabName ||
      payload?.vehicleName ||
      cab?.name ||
      cab?.brand ||
      payload?.cabType ||
      "Selected Cab",
    cabType:
      payload?.cabType ||
      payload?.vehicleType ||
      cab?.vehicleType ||
      cab?.rideType ||
      "",
    vehicleType:
      payload?.vehicleType ||
      payload?.cabType ||
      cab?.vehicleType ||
      "",
    price: Number(payload?.fare?.baseFare || cab?.price || cab?.baseFare || 0),
    taxes: Number(payload?.fare?.gst || payload?.fare?.taxesAndFees || 0),
    seats: Number(cab?.seats || payload?.seats || 0),
    luggage: Number(cab?.luggage || payload?.luggage || 0),
    fuelType: cab?.fuelType || payload?.fuelType || "",
    features: Array.isArray(cab?.features) ? cab.features : [],
  };
}

function normalizeCabVariants(payload: Payload | null): CabVariant[] {
  const cab = payload?.cab || {};
  const candidates = [
    payload?.variants,
    payload?.cabVariants,
    payload?.availableCabs,
    cab?.variants,
    cab?.availableCabs,
  ];

  for (const item of candidates) {
    if (Array.isArray(item) && item.length) {
      return item.map((variant: any, index: number) => ({
        id: variant?.id || variant?.cabId || `cab-${index + 1}`,
        name: variant?.name || variant?.vehicleName || variant?.brand || "Cab Option",
        cabType: variant?.cabType || variant?.vehicleType || "",
        vehicleType: variant?.vehicleType || variant?.cabType || "",
        price: Number(variant?.price || variant?.baseFare || 0),
        taxes: Number(variant?.taxes || variant?.gst || variant?.taxesAndFees || 0),
        seats: Number(variant?.seats || 0),
        luggage: Number(variant?.luggage || 0),
        fuelType: variant?.fuelType || "",
        features: Array.isArray(variant?.features) ? variant.features : [],
      }));
    }
  }

  const current = normalizeCabVariant(payload);
  return current ? [current] : [];
}

function buildFareSummary(payload: Payload | null, booking: BookingItem | null) {
  const fare = payload?.fare || {};
  const paymentData = payload?.paymentData || {};
  const managePayment = payload?.managePayment || {};

  return {
    baseFare: Number(fare?.baseFare || 0),
    driverAllowance: Number(fare?.driverAllowance || 0),
    nightCharge: Number(fare?.nightCharge || 0),
    tollTax: Number(fare?.tollTax || 0),
    stateTax: Number(fare?.stateTax || 0),
    parkingCharge: Number(fare?.parkingCharge || 0),
    gst: Number(fare?.gst || fare?.taxesAndFees || 0),
    tplCredit: Number(payload?.tplCredit || fare?.tplCredit || 0),
    appliedOffer: Number(payload?.appliedOffer || fare?.appliedOffer || 0),
    totalAmount:
      Number(managePayment?.updatedTotalAmount || 0) ||
      Number(
        paymentData?.totalPaid ||
          fare?.totalPaid ||
          fare?.totalAmount ||
          fare?.totalPayable ||
          booking?.amount ||
          0
      ),
  };
}

function CabManagePageContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") || "";

  const [activeTab, setActiveTab] = useState<CabManageTab>("summary");
  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [travellers, setTravellers] = useState<CabManageTraveller[]>([]);
  const [contact, setContact] = useState<CabManageContact>({
    countryCode: "+91",
    mobile: "",
    email: "",
  });
  const [specialRequest, setSpecialRequest] = useState("");
  const [activeCabVariant, setActiveCabVariant] = useState<CabVariant | null>(
    null
  );

  const loadBooking = () => {
    if (!bookingId) {
      setIsLoading(false);
      return;
    }

    const all = getAllBookings();
    const found =
      all.find((item) => item.id === bookingId && item.type === "cab") || null;

    setBooking(found);

    if (found?.payloadStorageKey) {
      const savedPayload = getBookingPayload<Payload>(found.payloadStorageKey);

      setPayload(savedPayload ? { ...savedPayload } : null);
      setTravellers(normalizeTravellers(savedPayload));
      setContact(normalizeContact(savedPayload));
      setSpecialRequest(
        savedPayload?.specialRequest ||
          (Array.isArray(savedPayload?.selectedAddons)
            ? savedPayload.selectedAddons
                .map((item: any) => item?.title)
                .filter(Boolean)
                .join(", ")
            : "")
      );
      setActiveCabVariant(normalizeCabVariant(savedPayload));
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

  const paymentData = payload?.paymentData || {};
  const fareSummary = buildFareSummary(payload, booking);

  const selectedVariant = normalizeCabVariant(payload);
  const variants = useMemo(() => normalizeCabVariants(payload), [payload]);

  const cabType =
    payload?.cabType ||
    payload?.vehicleType ||
    payload?.cab?.vehicleType ||
    payload?.cab?.rideType ||
    "Cab Booking";

  const cabName =
    payload?.cabName ||
    payload?.vehicleName ||
    payload?.cab?.name ||
    payload?.cab?.brand ||
    cabType;

  const rideId = payload?.rideId || payload?.tripId || "";

  const fromLocation =
    payload?.fromLocation ||
    payload?.pickupLocation ||
    payload?.searchMeta?.from ||
    payload?.searchMeta?.pickup ||
    payload?.traveller?.pickupLocation ||
    "";

  const toLocation =
    payload?.toLocation ||
    payload?.dropLocation ||
    payload?.searchMeta?.to ||
    payload?.searchMeta?.drop ||
    "";

  const pickupDate =
    payload?.pickupDate ||
    payload?.travelDate ||
    payload?.searchMeta?.pickupDate ||
    payload?.searchMeta?.departureDate ||
    booking?.travelDate ||
    "";

  const pickupTime = payload?.pickupTime || payload?.searchMeta?.pickupTime || "";
  const tripType = payload?.tripType || payload?.searchMeta?.rideType || "";

  const bookedAt =
    paymentData?.paidAt ||
    payload?.bookedOn ||
    payload?.paidAt ||
    booking?.bookingDate ||
    "";

  const routeLabel =
    fromLocation && toLocation
      ? `${fromLocation} → ${toLocation}`
      : booking?.title || "Cab Ride";

  const cabQuote = useMemo<CabQuote>(() => {
    const currentVariant = selectedVariant || {};
    const nextVariant = activeCabVariant || currentVariant;

    const oldTotal =
      Number(currentVariant?.price || 0) + Number(currentVariant?.taxes || 0);

    const newTotal =
      Number(nextVariant?.price || 0) + Number(nextVariant?.taxes || 0);

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
  }, [selectedVariant, activeCabVariant]);

  const handleSaveTravellers = () => {
    if (!booking?.payloadStorageKey || !payload) return;

    const nextTravellers = travellers.map((item, index) => ({
      ...item,
      id: item.id || `traveller-${index + 1}`,
      name: getTravellerName(item),
      fullName: getTravellerName(item),
    }));

    const nextPayload = {
      ...payload,
      travellers: nextTravellers,
      contactDetails: {
        ...(payload.contactDetails || {}),
        countryCode: contact.countryCode || "+91",
        mobile: contact.mobile,
        email: contact.email,
      },
    };

    savePayload(booking.payloadStorageKey, nextPayload);
    setPayload(nextPayload);
    alert("Traveller details updated successfully.");
  };

  const handleSaveContact = () => {
    if (!booking?.payloadStorageKey || !payload) return;

    const nextPayload = {
      ...payload,
      contactDetails: {
        ...(payload.contactDetails || {}),
        countryCode: contact.countryCode || "+91",
        mobile: contact.mobile,
        email: contact.email,
      },
    };

    savePayload(booking.payloadStorageKey, nextPayload);
    setPayload(nextPayload);
    alert("Contact details updated successfully.");
  };

  const handleSaveSpecialRequest = () => {
    if (!booking?.payloadStorageKey || !payload) return;

    const nextPayload = {
      ...payload,
      specialRequest,
    };

    savePayload(booking.payloadStorageKey, nextPayload);
    setPayload(nextPayload);
    alert("Special request updated successfully.");
  };

  const handleCabChangeContinue = () => {
    if (!booking?.payloadStorageKey || !payload || !activeCabVariant) return;

    const nextPayload = {
      ...payload,
      manageDraft: {
        ...(payload.manageDraft || {}),
        section: "cab-addons",
        selectedVariant: activeCabVariant,
        cabQuote,
      },
    };

    savePayload(booking.payloadStorageKey, nextPayload);

    window.location.href = `/manage/payment?bookingId=${encodeURIComponent(
      booking.id
    )}&section=cab-addons&type=cab`;
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] px-4 py-10">
        <div className="mx-auto max-w-[1440px] rounded-[28px] border border-black/5 bg-white p-8 text-sm text-[#6b7280]">
          Loading cab manage booking...
        </div>
      </main>
    );
  }

  if (!booking || !payload) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] px-4 py-10">
        <div className="mx-auto max-w-[1440px] rounded-[28px] border border-black/5 bg-white p-8">
          <h1 className="text-xl font-bold text-[#111827]">
            Cab booking not found
          </h1>
        </div>
      </main>
    );
  }

  return (
    <CabManageLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      bookingId={booking.id}
      cabName={cabName}
      routeLabel={routeLabel}
      pickupDateLabel={formatDateOnly(pickupDate)}
    >
      {activeTab === "summary" && (
        <CabManageSummary
          bookingStatus={booking.status}
          bookedAt={formatDateTime(bookedAt)}
          cabName={cabName}
          cabType={cabType}
          tripType={tripType}
          rideId={rideId}
          fromLocation={fromLocation}
          toLocation={toLocation}
          pickupDate={formatDateOnly(pickupDate)}
          pickupTime={pickupTime}
          travellersLabel={booking.travellers}
          specialRequest={specialRequest}
          fareSummary={fareSummary}
        />
      )}

      {activeTab === "traveller-details" && (
        <CabManageTravellerDetails
          travellers={travellers}
          onChange={setTravellers}
          onSave={handleSaveTravellers}
        />
      )}

      {activeTab === "contact-details" && (
        <CabManageContactDetails
          contact={contact}
          onChange={setContact}
          onSave={handleSaveContact}
        />
      )}

      {activeTab === "special-request" && (
        <CabManageSpecialRequest
          value={specialRequest}
          onChange={setSpecialRequest}
          onSave={handleSaveSpecialRequest}
        />
      )}

      {activeTab === "cab-addons" && (
        <CabManageAddons
          cabName={cabName}
          tripType={tripType}
          addOnsTotal={0}
          selectedVariant={selectedVariant}
          variants={variants}
          activeVariantId={activeCabVariant?.id || selectedVariant?.id}
          onVariantChange={setActiveCabVariant}
          quote={cabQuote}
          onContinue={handleCabChangeContinue}
        />
      )}
    </CabManageLayout>
  );
}

export default function CabManagePage() {
  return (
    <Suspense fallback={<div />}>
      <CabManagePageContent />
    </Suspense>
  );
}