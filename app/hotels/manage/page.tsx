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

import HotelManageLayout, {
  type HotelManageTab,
} from "@/app/components/manage/hotel/HotelManageLayout";
import HotelManageSummary from "@/app/components/manage/hotel/HotelManageSummary";
import HotelManageGuestDetails, {
  type HotelManageGuest,
} from "@/app/components/manage/hotel/HotelManageGuestDetails";
import HotelManageContactDetails, {
  type HotelManageContact,
} from "@/app/components/manage/hotel/HotelManageContactDetails";
import HotelManageSpecialRequest from "@/app/components/manage/hotel/HotelManageSpecialRequest";
import HotelManageRoomAddons, {
  type HotelRoomQuote,
  type HotelRoomVariant,
} from "@/app/components/manage/hotel/HotelManageRoomAddons";

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

function resolveHotelName(payload: any) {
  const hotel = payload?.hotel || {};

  return (
    payload?.hotelName ||
    hotel?.title ||
    hotel?.name ||
    hotel?.hotelName ||
    hotel?.propertyName ||
    "Hotel Booking"
  );
}

function resolveHotelCity(payload: any) {
  const hotel = payload?.hotel || {};
  const searchMeta = payload?.searchMeta || {};

  return (
    payload?.city ||
    payload?.location ||
    hotel?.city ||
    searchMeta?.city ||
    "City not available"
  );
}

function getGuestName(guest: HotelManageGuest) {
  return (
    guest?.name ||
    `${guest?.firstName || ""} ${guest?.lastName || ""}`.trim() ||
    "Guest"
  );
}

function normalizeGuests(payload: Payload | null): HotelManageGuest[] {
  const list = Array.isArray(payload?.guestList) ? payload.guestList : [];

  if (list.length) {
    return list.map((item: any, index: number) => ({
      ...item,
      id: item?.id || `guest-${index + 1}`,
      firstName: item?.firstName || item?.name?.split?.(" ")?.[0] || "",
      lastName:
        item?.lastName || item?.name?.split?.(" ")?.slice(1).join(" ") || "",
      name:
        item?.name || `${item?.firstName || ""} ${item?.lastName || ""}`.trim(),
      gender: item?.gender || "",
      age: item?.age || "",
    }));
  }

  const lead = payload?.leadGuest || {};

  return [
    {
      id: "guest-1",
      firstName: lead?.firstName || lead?.name?.split?.(" ")?.[0] || "",
      lastName:
        lead?.lastName || lead?.name?.split?.(" ")?.slice(1).join(" ") || "",
      name:
        lead?.name ||
        `${lead?.firstName || ""} ${lead?.lastName || ""}`.trim() ||
        "Guest",
      gender: lead?.gender || "",
      age: lead?.age || "",
    },
  ];
}

function normalizeContact(payload: Payload | null): HotelManageContact {
  const lead = payload?.leadGuest || {};
  const contact = payload?.guestValidation?.contactDetails || {};

  return {
    countryCode: "+91",
    mobile: lead?.phone
      ? String(lead.phone).replace(/^\+91\s?/, "").trim()
      : contact?.mobile || "",
    email: lead?.email || contact?.email || "",
  };
}

function buildFareSummary(payload: Payload | null, booking: BookingItem | null) {
  const fare = payload?.fare || {};
  const selectedVariant = payload?.selectedVariant || {};
  const hotel = payload?.hotel || {};
  const searchMeta = payload?.searchMeta || {};
  const tripSecureData = payload?.tripSecureData || {};
  const cabData = payload?.cabData || {};
  const addonsData = payload?.addonsData || {};
  const managePayment = payload?.managePayment || {};

  const rooms = Number(payload?.rooms || searchMeta?.rooms || 1);
  const nights = Number(payload?.nights || 1);
  const subtotal = Number(fare?.baseFare || 0);
  const taxes = Number(fare?.taxesAndFees || 0);

  return {
    roomPrice:
      rooms > 0 && nights > 0
        ? Math.round(subtotal / (rooms * nights))
        : Number(selectedVariant?.price || hotel?.pricePerNight || 0),
    rooms,
    nights,
    subtotal,
    taxes,
    tripSecureTotal: Number(tripSecureData?.amount || 0),
    cabTotal: Number(cabData?.amount || 0),
    addOnsTotal: Number(addonsData?.amount || 0),
    tplCredit: Number(payload?.tplCredit || fare?.tplCredit || 0),
    appliedOffer: Number(payload?.appliedOffer || 0),
    totalAmount:
      Number(managePayment?.updatedTotalAmount || 0) ||
      Number(fare?.totalPaid || fare?.totalAmount || booking?.amount || 0),
  };
}

function HotelManagePageContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") || "";

  const [activeTab, setActiveTab] = useState<HotelManageTab>("summary");
  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [guests, setGuests] = useState<HotelManageGuest[]>([]);
  const [contact, setContact] = useState<HotelManageContact>({
    countryCode: "+91",
    mobile: "",
    email: "",
  });
  const [specialRequest, setSpecialRequest] = useState("");
  const [activeRoomVariant, setActiveRoomVariant] =
    useState<HotelRoomVariant | null>(null);

  const loadBooking = () => {
    if (!bookingId) {
      setIsLoading(false);
      return;
    }

    const all = getAllBookings();
    const found =
      all.find((item) => item.id === bookingId && item.type === "hotel") ||
      null;

    setBooking(found);

    if (found?.payloadStorageKey) {
      const savedPayload = getBookingPayload<Payload>(found.payloadStorageKey);
      setPayload(savedPayload ? { ...savedPayload } : null);
      setGuests(normalizeGuests(savedPayload));
      setContact(normalizeContact(savedPayload));
      setSpecialRequest(savedPayload?.specialRequest || "");
      setActiveRoomVariant(savedPayload?.selectedVariant || null);
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

  const hotelName = useMemo(() => resolveHotelName(payload), [payload]);
  const city = useMemo(() => resolveHotelCity(payload), [payload]);

  const searchMeta = payload?.searchMeta || {};
  const selectedVariant = payload?.selectedVariant || {};
  const hotel = payload?.hotel || {};
  const managePayment = payload?.managePayment || {};
  const paymentData = payload?.paymentData || {};

  const roomName =
    payload?.roomType ||
    selectedVariant?.name ||
    selectedVariant?.roomType ||
    selectedVariant?.title ||
    "Selected Room";

  const checkIn =
    payload?.checkInDate || searchMeta?.checkIn || booking?.travelDate || "";
  const checkOut = payload?.checkOutDate || searchMeta?.checkOut || "";

  const nights = Number(payload?.nights || 1);
  const rooms = Number(payload?.rooms || searchMeta?.rooms || 1);

  const fareSummary = buildFareSummary(payload, booking);

  const roomQuote = useMemo<HotelRoomQuote>(() => {
    const currentVariant = payload?.selectedVariant || {};
    const nextVariant = activeRoomVariant || currentVariant;

    const oldTotal =
      (Number(currentVariant?.price || 0) +
        Number(currentVariant?.taxes || 0)) *
      rooms *
      nights;

    const newTotal =
      (Number(nextVariant?.price || 0) + Number(nextVariant?.taxes || 0)) *
      rooms *
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
  }, [payload?.selectedVariant, activeRoomVariant, rooms, nights]);

  const bookedAt =
    managePayment?.paidAt ||
    paymentData?.paidAt ||
    payload?.bookedOn ||
    payload?.paidAt ||
    booking?.bookingDate ||
    "";

  const handleSaveGuests = async () => {
    if (!booking?.payloadStorageKey || !payload) return;

    const nextPayload = {
      ...payload,
      guestList: guests.map((guest, index) => ({
        ...guest,
        id: guest.id || `guest-${index + 1}`,
        name: getGuestName(guest),
      })),
      leadGuest: {
        ...(payload?.leadGuest || {}),
        firstName: guests[0]?.firstName || "",
        lastName: guests[0]?.lastName || "",
        name: getGuestName(guests[0] || {}),
        gender: guests[0]?.gender || "",
        phone: contact.mobile || payload?.leadGuest?.phone || "",
        email: contact.email || payload?.leadGuest?.email || "",
      },
    };

    const backendResult = await executeBackendSamePriceManage({
      booking,
      payload,
      serviceType: "hotel",
      section: "guest-details",
      changeType: "traveller_update",
      settlementMode: "save",
      currentAmount: fareSummary.totalAmount,
      requestedAmount: fareSummary.totalAmount,
      requestedChange: { guestList: nextPayload.guestList, leadGuest: nextPayload.leadGuest },
      beforeSnapshot: payload,
      afterSnapshot: nextPayload,
    });

    const payloadToSave =
      backendResult.ok && backendResult.payload
        ? { ...nextPayload, ...backendResult.payload }
        : nextPayload;

    savePayload(booking.payloadStorageKey, payloadToSave);
    setPayload(payloadToSave);
    alert("Guest details updated successfully.");
  };

  const handleSaveContact = async () => {
    if (!booking?.payloadStorageKey || !payload) return;

    const nextPayload = {
      ...payload,
      leadGuest: {
        ...(payload?.leadGuest || {}),
        phone: contact.mobile,
        email: contact.email,
      },
      guestValidation: {
        ...(payload?.guestValidation || {}),
        contactDetails: {
          ...(payload?.guestValidation?.contactDetails || {}),
          countryCode: contact.countryCode || "+91",
          mobile: contact.mobile,
          email: contact.email,
        },
      },
    };

    const backendResult = await executeBackendSamePriceManage({
      booking,
      payload,
      serviceType: "hotel",
      section: "contact-details",
      changeType: "contact_update",
      settlementMode: "save",
      currentAmount: fareSummary.totalAmount,
      requestedAmount: fareSummary.totalAmount,
      requestedChange: {
        leadGuest: nextPayload.leadGuest,
        guestValidation: nextPayload.guestValidation,
      },
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
      serviceType: "hotel",
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

  const handleRoomChangeContinue = async () => {
    if (!booking?.payloadStorageKey || !payload || !activeRoomVariant) return;

    const nextPayload = {
      ...payload,
      manageDraft: {
        ...(payload.manageDraft || {}),
        section: "room-addons",
        selectedVariant: activeRoomVariant,
        roomQuote,
      },
    };

    const backendResult = await prepareBackendManageRequest({
      booking,
      payload: nextPayload,
      serviceType: "hotel",
      section: "room-addons",
      changeType:
        roomQuote.settlementMode === "payment"
          ? "upgrade"
          : roomQuote.settlementMode === "wallet_credit"
          ? "downgrade"
          : "same_price",
      settlementMode: roomQuote.settlementMode,
      currentAmount: roomQuote.oldTotal,
      requestedAmount: roomQuote.newTotal,
      requestedChange: {
        selectedVariant: activeRoomVariant,
        roomQuote,
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
    )}&section=room-addons&type=hotel`;
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] px-4 py-10">
        <div className="mx-auto max-w-[1440px] rounded-[28px] border border-black/5 bg-white p-8 text-sm text-[#6b7280]">
          Loading hotel manage booking...
        </div>
      </main>
    );
  }

  if (!booking || !payload) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] px-4 py-10">
        <div className="mx-auto max-w-[1440px] rounded-[28px] border border-black/5 bg-white p-8">
          <h1 className="text-xl font-bold text-[#111827]">
            Hotel booking not found
          </h1>
        </div>
      </main>
    );
  }

  return (
    <HotelManageLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      bookingId={booking.id}
      hotelName={hotelName}
      city={city}
      checkInLabel={formatDateOnly(checkIn)}
    >
      {activeTab === "summary" && (
        <HotelManageSummary
          bookingStatus={booking.status}
          bookedAt={formatDateTime(bookedAt)}
          checkIn={formatDateOnly(checkIn)}
          checkOut={formatDateOnly(checkOut)}
          hotelName={hotelName}
          city={city}
          roomName={roomName}
          guestsLabel={booking.travellers}
          rooms={rooms}
          nights={nights}
          fareSummary={{
            roomPrice: fareSummary.roomPrice,
            taxes: fareSummary.taxes,
            totalAmount: fareSummary.totalAmount,
          }}
        />
      )}

      {activeTab === "guest-details" && (
        <HotelManageGuestDetails
          guests={guests}
          onChange={setGuests}
          onSave={handleSaveGuests}
        />
      )}

      {activeTab === "contact-details" && (
        <HotelManageContactDetails
          contact={contact}
          onChange={setContact}
          onSave={handleSaveContact}
        />
      )}

      {activeTab === "special-request" && (
        <HotelManageSpecialRequest
          value={specialRequest}
          onChange={setSpecialRequest}
          onSave={handleSaveSpecialRequest}
        />
      )}

      {activeTab === "room-addons" && (
        <HotelManageRoomAddons
          roomName={roomName}
          rooms={rooms}
          nights={nights}
          addOnsTotal={fareSummary.addOnsTotal}
          selectedVariant={selectedVariant}
          variants={Array.isArray(hotel?.variants) ? hotel.variants : []}
          activeVariantId={activeRoomVariant?.id || selectedVariant?.id}
          onVariantChange={setActiveRoomVariant}
          quote={roomQuote}
          onContinue={handleRoomChangeContinue}
        />
      )}
    </HotelManageLayout>
  );
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

export default function HotelManagePage() {
  return (
    <Suspense fallback={<div />}>
      <HotelManagePageContent />
    </Suspense>
  );
}
