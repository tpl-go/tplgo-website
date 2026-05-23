"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  BOOKING_UPDATED_EVENT,
  getAllBookings,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";
import { getBookingPayload } from "@/app/lib/booking/bookingActionHelpers";

import BusManageLayout, {
  type BusManageTab,
} from "@/app/components/manage/bus/BusManageLayout";
import BusManageSummary from "@/app/components/manage/bus/BusManageSummary";
import BusManageTravellerDetails, {
  type BusManageTraveller,
} from "@/app/components/manage/bus/BusManageTravellerDetails";
import BusManageContactDetails, {
  type BusManageContact,
} from "@/app/components/manage/bus/BusManageContactDetails";
import BusManageSpecialRequest from "@/app/components/manage/bus/BusManageSpecialRequest";
import BusManageSeatsAddons, {
  type BusSeatOption,
  type BusSeatQuote,
  type BusSeatSelection,
} from "@/app/components/manage/bus/BusManageSeatsAddons";

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

function getPassengerName(item: BusManageTraveller) {
  return (
    item?.fullName ||
    item?.name ||
    `${item?.firstName || ""} ${item?.lastName || ""}`.trim() ||
    "Passenger"
  );
}

function normalizeSeatNo(value: any) {
  return String(value || "").trim();
}

function sameSeat(a: any, b: any) {
  return normalizeSeatNo(a).toUpperCase() === normalizeSeatNo(b).toUpperCase();
}

function normalizeTravellers(payload: Payload | null): BusManageTraveller[] {
  const list = Array.isArray(payload?.travellers) ? payload.travellers : [];

  if (list.length) {
    return list.map((item: any, index: number) => {
      const fullName = String(item?.fullName || item?.name || "").trim();
      const parts = fullName.split(" ").filter(Boolean);

      return {
        ...item,
        id: item?.id || item?.travellerId || `passenger-${index + 1}`,
        seatNo: item?.seatNo || item?.seatNumber || item?.seat || "",
        seatNumber: item?.seatNumber || item?.seatNo || item?.seat || "",
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
      id: "passenger-1",
      firstName: "",
      lastName: "",
      name: "Passenger",
      fullName: "Passenger",
      gender: "",
      age: "",
      seatNo: "",
      seatNumber: "",
    },
  ];
}

function normalizeContact(payload: Payload | null): BusManageContact {
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

function getBookedSeatPrice(payload: Payload | null, seatNo: string) {
  const bookingPayload = payload?.bookingPayload || {};
  const selectedSeats = Array.isArray(bookingPayload?.selectedSeats)
    ? bookingPayload.selectedSeats
    : [];

  const target = normalizeSeatNo(seatNo);

  const found = selectedSeats.find((seat: any) => {
    const current =
      seat?.seatNumber ||
      seat?.seatNo ||
      seat?.number ||
      seat?.label ||
      "";

    return sameSeat(current, target);
  });

  return Number(found?.price || found?.fare || found?.amount || 0);
}

function getBookedSelectedSeats(payload: Payload | null): BusSeatOption[] {
  const bookingPayload = payload?.bookingPayload || {};
  const selectedSeats = Array.isArray(bookingPayload?.selectedSeats)
    ? bookingPayload.selectedSeats
    : [];

  return selectedSeats.map((seat: any, index: number) => {
    const seatNo =
      seat?.seatNumber ||
      seat?.seatNo ||
      seat?.number ||
      seat?.label ||
      `S${index + 1}`;

    return {
      id: `booked-current-${normalizeSeatNo(seatNo) || index + 1}`,
      seatNo,
      seatNumber: seatNo,
      label: seatNo,
      type: "Current Seat",
      deck: seat?.deck || "",
      price: Number(seat?.price || seat?.fare || seat?.amount || 0),
      available: true,
    };
  });
}

function normalizeAvailableSeats(payload: Payload | null): BusSeatOption[] {
  const bookingPayload = payload?.bookingPayload || {};
  const bus = bookingPayload?.bus || {};

  const currentBookedSeats = getBookedSelectedSeats(payload);

  const currentSeatNos = new Set(
    currentBookedSeats.map((seat) =>
      normalizeSeatNo(getSeatNo(seat)).toUpperCase()
    )
  );

  const candidates = [
    payload?.availableSeats,
    payload?.seatLayout,
    payload?.seats,
    bookingPayload?.availableSeats,
    bookingPayload?.seatLayout,
    bus?.availableSeats,
    bus?.seatLayout,
    bus?.seats,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length) {
      const mappedSeats = candidate.map((seat: any, index: number) => {
        const seatNo =
          seat?.seatNo ||
          seat?.seatNumber ||
          seat?.label ||
          seat?.number ||
          "";

        const normalizedSeatNo =
          normalizeSeatNo(seatNo).toUpperCase();

        const isCurrentSeat =
          currentSeatNos.has(normalizedSeatNo);

        const bookedPrice = isCurrentSeat
          ? getBookedSeatPrice(payload, seatNo)
          : 0;

        return {
          id:
            seat?.id ||
            seat?.seatId ||
            `seat-${normalizedSeatNo || index + 1}`,

          seatNo,

          seatNumber:
            seat?.seatNumber ||
            seat?.seatNo ||
            seat?.label ||
            seat?.number ||
            "",

          label:
            seat?.label ||
            seat?.seatNo ||
            seat?.seatNumber ||
            seat?.number ||
            "",

          type: isCurrentSeat
            ? "Current Seat"
            : seat?.type || seat?.seatType || "Available Seat",

          deck: seat?.deck || "",

          price: isCurrentSeat
            ? bookedPrice
            : Number(
                seat?.price ||
                  seat?.fare ||
                  seat?.amount ||
                  0
              ),

          available:
            typeof seat?.available === "boolean"
              ? seat.available
              : typeof seat?.isAvailable === "boolean"
              ? seat.isAvailable
              : true,
        };
      });

      const uniqueSeatsMap = new Map<string, BusSeatOption>();

      [...currentBookedSeats, ...mappedSeats].forEach((seat) => {
        const key = normalizeSeatNo(
          getSeatNo(seat)
        ).toUpperCase();

        if (!key) return;

        if (!uniqueSeatsMap.has(key)) {
          uniqueSeatsMap.set(key, seat);
        }
      });

      return Array.from(uniqueSeatsMap.values());
    }
  }

  return currentBookedSeats;
}

function normalizeSeatSelections(payload: Payload | null): BusSeatSelection[] {
  const travellers = normalizeTravellers(payload);

  return travellers.map((item, index) => {
    const seatNo = item.seatNo || item.seatNumber || "";
    const bookedSeatPrice = getBookedSeatPrice(payload, seatNo);

    const seatPrice = Number(
      bookedSeatPrice ||
        (item as any)?.seatPrice ||
        (item as any)?.price ||
        (item as any)?.fare ||
        0
    );

    return {
      travellerId: item.id || `passenger-${index + 1}`,
      travellerName: getPassengerName(item),
      oldSeatNo: seatNo,
      newSeatNo: seatNo,
      oldPrice: seatPrice,
      newPrice: seatPrice,
    };
  });
}

function buildFareSummary(payload: Payload | null, booking: BookingItem | null) {
  const fare = payload?.fare || {};
  const managePayment = payload?.managePayment || {};

  return {
    baseFare: Number(fare?.baseFare || 0),
    seatUpgradeTotal: Number(
      fare?.seatUpgradeTotal ||
        fare?.seatCharges ||
        payload?.pricing?.seatUpgradeTotal ||
        payload?.pricing?.seatCharges ||
        payload?.originalBookingBaseline?.seatUpgradeTotal ||
        0
    ),
    taxAndSurcharge: Number(fare?.taxAndSurcharge || 0),
    tripSecureTotal: Number(fare?.tripSecureTotal || 0),
    freeCancellationTotal: Number(fare?.freeCancellationTotal || 0),
    tplCredit: Number(fare?.tplCredit || 0),
    appliedOffer: Number(fare?.appliedOffer || 0),
    discount: Number(fare?.discount || 0),
    totalAmount:
      Number(managePayment?.updatedTotalAmount || 0) ||
      Number(fare?.totalPaid || fare?.totalAmount || booking?.amount || 0),
  };
}

function getSeatNo(seat: BusSeatOption) {
  return seat.seatNo || seat.seatNumber || seat.label || "";
}

function BusManagePageContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") || "";

  const [activeTab, setActiveTab] = useState<BusManageTab>("summary");
  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [travellers, setTravellers] = useState<BusManageTraveller[]>([]);
  const [contact, setContact] = useState<BusManageContact>({
    countryCode: "+91",
    mobile: "",
    email: "",
  });
  const [specialRequest, setSpecialRequest] = useState("");
  const [seatSelections, setSeatSelections] = useState<BusSeatSelection[]>([]);

  const loadBooking = () => {
    if (!bookingId) {
      setIsLoading(false);
      return;
    }

    const all = getAllBookings();
    const found =
      all.find((item) => item.id === bookingId && item.type === "bus") || null;

    setBooking(found);

    if (found?.payloadStorageKey) {
      const savedPayload = getBookingPayload<Payload>(found.payloadStorageKey);

      setPayload(savedPayload ? { ...savedPayload } : null);
      setTravellers(normalizeTravellers(savedPayload));
      setContact(normalizeContact(savedPayload));
      setSpecialRequest(savedPayload?.specialRequest || "");
      setSeatSelections(normalizeSeatSelections(savedPayload));
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

  const bookingPayload = payload?.bookingPayload || {};
  const search = bookingPayload?.search || {};
  const bus = bookingPayload?.bus || {};
  const paymentData = payload?.paymentData || {};
  const managePayment = payload?.managePayment || {};

  const busName =
    payload?.busName ||
    bus?.name ||
    bus?.busName ||
    bus?.travelsName ||
    "Bus Booking";

  const operatorName =
    payload?.operatorName || bus?.operatorName || bus?.travelsName || "";

  const fromCity = search?.fromCity || payload?.fromCity || "";
  const toCity = search?.toCity || payload?.toCity || "";
  const routeLabel =
    fromCity && toCity
      ? `${fromCity} → ${toCity}`
      : booking?.title || "Bus Journey";

  const boardingPoint =
    payload?.boardingPoint?.name ||
    bookingPayload?.selectedBoardingPoint?.name ||
    search?.fromPoint ||
    "";

  const droppingPoint =
    payload?.droppingPoint?.name ||
    bookingPayload?.selectedDroppingPoint?.name ||
    search?.toPoint ||
    "";

  const travelDate =
    payload?.travelDate || search?.date || booking?.travelDate || "";

  const departureTime =
    payload?.departureTime ||
    bookingPayload?.selectedBoardingPoint?.time ||
    bus?.departureTime ||
    "";

  const arrivalTime =
    payload?.arrivalTime ||
    bookingPayload?.selectedDroppingPoint?.time ||
    bus?.arrivalTime ||
    "";

  const duration = payload?.duration || bus?.duration || "";
  const busType = payload?.busType || bus?.busType || bus?.type || "";

  const bookedAt =
    managePayment?.paidAt ||
    paymentData?.paidAt ||
    payload?.paidAt ||
    payload?.bookedOn ||
    booking?.bookingDate ||
    "";

  const fareSummary = buildFareSummary(payload, booking);

  const availableSeats = useMemo(
    () => normalizeAvailableSeats(payload),
    [payload]
  );

  const hasSeatChanged = useMemo(() => {
    return seatSelections.some(
      (item) =>
        !sameSeat(item.oldSeatNo, item.newSeatNo) ||
        Number(item.oldPrice || 0) !== Number(item.newPrice || 0)
    );
  }, [seatSelections]);

  const seatQuote = useMemo<BusSeatQuote>(() => {
    const oldTotal = seatSelections.reduce(
      (sum, item) => sum + Number(item.oldPrice || 0),
      0
    );

    const newTotal = seatSelections.reduce(
      (sum, item) => sum + Number(item.newPrice || 0),
      0
    );

    const difference = hasSeatChanged ? Math.round(newTotal - oldTotal) : 0;

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
  }, [seatSelections, hasSeatChanged]);

  const handleSaveTravellers = () => {
    if (!booking?.payloadStorageKey || !payload) return;

    const nextTravellers = travellers.map((item, index) => ({
      ...item,
      id: item.id || `passenger-${index + 1}`,
      name: getPassengerName(item),
      fullName: getPassengerName(item),
      seatNo: item.seatNo || item.seatNumber || "",
      seatNumber: item.seatNumber || item.seatNo || "",
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

  const handleSeatChange = (travellerId: string, seat: BusSeatOption) => {
    const seatNo = getSeatNo(seat);

    setSeatSelections((prev) =>
      prev.map((item) => {
        if (item.travellerId !== travellerId) return item;

        return {
          ...item,
          newSeatNo: seatNo,
          newPrice: Number(seat.price || 0),
        };
      })
    );
  };

  const handleSeatContinue = () => {
    if (!booking?.payloadStorageKey || !payload) return;

    if (!hasSeatChanged) {
      alert("Please select a different seat before continuing.");
      return;
    }

    const selectedSeats = Array.isArray(payload?.bookingPayload?.selectedSeats)
      ? payload.bookingPayload.selectedSeats
      : [];

    const nextTravellers = normalizeTravellers(payload).map((traveller) => {
      const matched = seatSelections.find(
        (item) => item.travellerId === traveller.id
      );

      if (!matched) return traveller;

      return {
        ...traveller,
        seatNo: matched.newSeatNo,
        seatNumber: matched.newSeatNo,
      };
    });

    const nextSelectedSeats = selectedSeats.map((seat: any) => {
      const currentSeatNo =
        seat?.seatNumber ||
        seat?.seatNo ||
        seat?.number ||
        seat?.label ||
        "";

      const matched = seatSelections.find((item) =>
        sameSeat(item.oldSeatNo, currentSeatNo)
      );

      if (!matched) return seat;

      return {
        ...seat,
        seatNumber: matched.newSeatNo,
        seatNo: matched.newSeatNo,
        number: matched.newSeatNo,
        label: matched.newSeatNo,
        price: Number(matched.newPrice || 0),
      };
    });

    const nextPayload = {
      ...payload,
      manageDraft: {
        ...(payload.manageDraft || {}),
        section: "seats-addons",
        seatSelections,
        seatQuote,
      },
    };

    if (seatQuote.settlementMode === "save") {
      const directSavePayload = {
        ...nextPayload,
        travellers: nextTravellers,
        bookingPayload: {
          ...(nextPayload.bookingPayload || {}),
          selectedSeats: nextSelectedSeats,
        },
        managePayment: {
          ...(nextPayload.managePayment || {}),
          section: "seats-addons",
          settlementMode: "save",
          seatSelections,
          seatQuote,
          updatedAt: new Date().toISOString(),
        },
      };

      savePayload(booking.payloadStorageKey, directSavePayload);
      setPayload(directSavePayload);
      setTravellers(normalizeTravellers(directSavePayload));
      setSeatSelections(normalizeSeatSelections(directSavePayload));
      alert("Seat changes saved successfully.");
      return;
    }

    savePayload(booking.payloadStorageKey, nextPayload);

    window.location.href = `/manage/payment?bookingId=${encodeURIComponent(
      booking.id
    )}&section=seats-addons&type=bus`;
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] px-4 py-10">
        <div className="mx-auto max-w-[1440px] rounded-[28px] border border-black/5 bg-white p-8 text-sm text-[#6b7280]">
          Loading bus manage booking...
        </div>
      </main>
    );
  }

  if (!booking || !payload) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] px-4 py-10">
        <div className="mx-auto max-w-[1440px] rounded-[28px] border border-black/5 bg-white p-8">
          <h1 className="text-xl font-bold text-[#111827]">
            Bus booking not found
          </h1>
        </div>
      </main>
    );
  }

  return (
    <BusManageLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      bookingId={booking.id}
      busName={busName}
      routeLabel={routeLabel}
      travelDateLabel={formatDateOnly(travelDate)}
    >
      {activeTab === "summary" && (
        <BusManageSummary
          bookingStatus={booking.status}
          bookedAt={formatDateTime(bookedAt)}
          busName={busName}
          operatorName={operatorName}
          busType={busType}
          routeLabel={routeLabel}
          fromCity={fromCity}
          toCity={toCity}
          boardingPoint={boardingPoint}
          droppingPoint={droppingPoint}
          travelDate={formatDateOnly(travelDate)}
          departureTime={departureTime}
          arrivalTime={arrivalTime}
          duration={duration}
          travellersLabel={booking.travellers}
          fareSummary={fareSummary}
        />
      )}

      {activeTab === "traveller-details" && (
        <BusManageTravellerDetails
          travellers={travellers}
          onChange={setTravellers}
          onSave={handleSaveTravellers}
        />
      )}

      {activeTab === "contact-details" && (
        <BusManageContactDetails
          contact={contact}
          onChange={setContact}
          onSave={handleSaveContact}
        />
      )}

      {activeTab === "special-request" && (
        <BusManageSpecialRequest
          value={specialRequest}
          onChange={setSpecialRequest}
          onSave={handleSaveSpecialRequest}
        />
      )}

      {activeTab === "seats-addons" && (
        <BusManageSeatsAddons
          currentSeats={seatSelections}
          availableSeats={availableSeats}
          quote={seatQuote}
          onSeatChange={handleSeatChange}
          onContinue={handleSeatContinue}
        />
      )}
    </BusManageLayout>
  );
}

export default function BusManagePage() {
  return (
    <Suspense fallback={<div />}>
      <BusManagePageContent />
    </Suspense>
  );
}