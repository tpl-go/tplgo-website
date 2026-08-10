"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ManageBookingLayout from "@/app/components/manage/flight/ManageBookingLayout";
import ManageBookingDetails from "@/app/components/manage/flight/ManageBookingDetails";
import ManageActionPanel from "@/app/components/manage/flight/ManageActionPanel";

import ManageTravellerDetailsSection from "@/app/components/manage/flight/actions/ManageTravellerDetailsSection";
import ManageContactDetailsSection from "@/app/components/manage/flight/actions/ManageContactDetailsSection";
import ManageSpecialRequestSection from "@/app/components/manage/flight/actions/ManageSpecialRequestSection";
import ManageSeatsSection from "@/app/components/manage/flight/actions/ManageSeatsSection";
import ManageMealsSection from "@/app/components/manage/flight/actions/ManageMealsSection";
import ManageBaggageSection, {
  TravellerBaggageSelection,
} from "@/app/components/manage/flight/actions/ManageBaggageSection";
import CancelBookingEntrySection from "@/app/components/manage/flight/actions/CancelBookingEntrySection";

import { buildManageQuote } from "@/app/lib/manage/managePricing";
import { FlightManageBookingRecord } from "@/app/lib/manage/manageTypes";

import {
  TravellerSeatSelection,
  TravellerMealSelection,
} from "@/app/lib/flights/ancillaries/ancillaryTypes";
import { FLIGHT_ANCILLARY_CATALOG } from "@/app/lib/flights/ancillaries/ancillaryCatalog";

import {
  cancelBooking,
  getAllBookings,
  getRefundEstimate,
  updateBooking,
  BOOKING_UPDATED_EVENT,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";
import { getBookingPayload } from "@/app/lib/booking/bookingActionHelpers";
import { getBackendFirstBookingPayload } from "@/app/lib/api/bookingApi";
import { resolveFlightBookingSource } from "@/app/lib/booking/resolvers/flightResolver";
import {
  saveFlightSeatChanges,
  saveFlightMealChanges,
  saveFlightBaggageChanges,
} from "@/app/lib/booking/flightManageUpdate";
import {
  executeBackendFlightCancellation,
  executeBackendSamePriceManage,
  prepareBackendManageRequest,
  persistBackendManageCache,
} from "@/app/lib/manage/backendManageBookingIntegration";

type SidebarKey =
  | "summary"
  | "traveller-details"
  | "contact-details"
  | "special-request"
  | "seats"
  | "meals"
  | "baggage"
  | "cancel-booking";

type ManageTraveller = {
  id: string;
  title: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  type: "adult" | "child" | "infant";
};

type ManageContact = {
  email: string;
  phone: string;
};

type FlightManagePayload = Record<string, unknown> & {
  travellerValidation?: Record<string, unknown> & {
    travellers?: Array<Record<string, unknown>>;
    contactDetails?: Record<string, unknown>;
  };
  reviewData?: Record<string, unknown>;
  managePayment?: Record<string, unknown>;
  paymentData?: Record<string, unknown>;
  fare?: Record<string, unknown>;
  manageDraft?: Record<string, unknown>;
};

const emptyBookingSummary: FlightManageBookingRecord = {
  bookingId: "",
  pnr: "",
  bookingStatus: "confirmed",
  origin: "",
  destination: "",
  travelDate: "",
  airlineName: "",
  flightNumber: "",
  travellers: [],
  contact: {
    email: "",
    phone: "",
  },
  specialRequest: "",
  seats: [],
  meals: [],
  baggage: [],
  baseFareSnapshot: {
    totalPaidAmount: 0,
    currency: "INR",
  },
};

function getTitleFromTraveller(item: { title?: string; gender?: string }) {
  if (item.title?.trim()) return item.title.trim();
  if (item.gender === "female") return "Ms";
  return "Mr";
}

function normalizeTravellerType(value?: string): "adult" | "child" | "infant" {
  if (value === "child") return "child";
  if (value === "infant") return "infant";
  return "adult";
}

function mapMealNameToCatalogId(mealName?: string | null) {
  if (!mealName) return null;

  const matched = FLIGHT_ANCILLARY_CATALOG.meals.find(
    (item) => item.name.trim().toLowerCase() === mealName.trim().toLowerCase()
  );

  return matched?.id ?? null;
}

function findSeatByTravellerOrIndex(
  seats: Array<{ travellerId?: string; seatNumber?: string; price?: number }> = [],
  travellerId: string,
  index: number
) {
  const byId = seats.find((item) => item?.travellerId === travellerId);
  if (byId) return byId;
  return seats[index] ?? null;
}

function findMealByTravellerOrIndex(
  meals: Array<{ travellerId?: string; mealName?: string; price?: number }> = [],
  travellerId: string,
  index: number
) {
  const byId = meals.find((item) => item?.travellerId === travellerId);
  if (byId) return byId;
  return meals[index] ?? null;
}

function findBaggageByTravellerOrIndex(
  baggage: Array<{
    travellerId?: string;
    baggageCode?: string;
    code?: string;
    price?: number;
  }> = [],
  travellerId: string,
  index: number
) {
  const byId = baggage.find((item) => item?.travellerId === travellerId);
  if (byId) return byId;
  return baggage[index] ?? null;
}

function dispatchBookingUpdate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(BOOKING_UPDATED_EVENT));
}

function savePayloadToStorage(
  payloadStorageKey: string | undefined,
  payload: FlightManagePayload
) {
  if (typeof window === "undefined") return;
  if (!payloadStorageKey) return;

  localStorage.setItem(payloadStorageKey, JSON.stringify(payload));
  dispatchBookingUpdate();
}

function getFlightManageCurrentAmount(
  payload: FlightManagePayload,
  booking: BookingItem
) {
  return Number(
    payload?.managePayment?.updatedTotalAmount ||
      payload?.paymentData?.totalPaid ||
      payload?.fare?.totalPaid ||
      payload?.fare?.totalAmount ||
      booking.amount ||
      0
  );
}

function buildTravellerPayload(
  payload: FlightManagePayload,
  travellers: ManageTraveller[]
) {
  const existingTravellers = payload?.travellerValidation?.travellers || [];

  return {
    ...payload,
    travellerValidation: {
      ...(payload.travellerValidation || {}),
      travellers: travellers.map((item, index) => {
        const existing = existingTravellers[index] || {};

        return {
          ...existing,
          id: item.id,
          title: item.title,
          firstName: item.firstName,
          middleName: item.middleName || "",
          lastName: item.lastName,
          travellerType: item.type,
        };
      }),
    },
  };
}

function buildContactPayload(payload: FlightManagePayload, contact: ManageContact) {
  return {
    ...payload,
    travellerValidation: {
      ...(payload.travellerValidation || {}),
      contactDetails: {
        ...(payload.travellerValidation?.contactDetails || {}),
        email: contact.email,
        mobile: contact.phone,
      },
    },
  };
}

function buildSpecialRequestPayload(
  payload: FlightManagePayload,
  specialRequest: string
) {
  return {
    ...payload,
    reviewData: {
      ...(payload.reviewData || {}),
      specialRequest,
    },
  };
}

function buildManageStateFromResolvedFlightSource(
  booking: BookingItem,
  source: ReturnType<typeof resolveFlightBookingSource>
): {
  summary: FlightManageBookingRecord;
  travellers: ManageTraveller[];
  contact: ManageContact;
  specialRequest: string;
  seats: TravellerSeatSelection[];
  meals: TravellerMealSelection[];
  baggage: TravellerBaggageSelection[];
} {
  const travellers: ManageTraveller[] = (
    source.travellerValidation?.travellers || []
  ).map((item, index) => ({
    id: item.id || `traveller-${index + 1}`,
    title: getTitleFromTraveller(item),
    firstName: item.firstName || "Traveller",
    middleName: (item as { middleName?: string }).middleName || "",
    lastName: item.lastName || `${index + 1}`,
    type: normalizeTravellerType(item.travellerType),
  }));

  const contact: ManageContact = {
    email: source.travellerValidation?.contactDetails?.email || "",
    phone: source.travellerValidation?.contactDetails?.mobile || "",
  };

  const seats: TravellerSeatSelection[] = travellers.map((traveller, index) => {
    const seat = findSeatByTravellerOrIndex(
      source.seatMealData?.seats || [],
      traveller.id,
      index
    );

    return {
      travellerId: traveller.id,
      oldSeatCode: seat?.seatNumber ?? null,
      newSeatCode: seat?.seatNumber ?? null,
      oldPrice: seat?.price ?? 0,
      newPrice: seat?.price ?? 0,
      skipped: false,
    };
  });

  const meals: TravellerMealSelection[] = travellers.map((traveller, index) => {
    const meal = findMealByTravellerOrIndex(
      source.seatMealData?.meals || [],
      traveller.id,
      index
    );

    const mappedMealId = mapMealNameToCatalogId(meal?.mealName ?? null);

    return {
      travellerId: traveller.id,
      oldMealId: mappedMealId,
      newMealId: mappedMealId,
      oldPrice: meal?.price ?? 0,
      newPrice: meal?.price ?? 0,
      skipped: false,
    };
  });

  const baggage: TravellerBaggageSelection[] = travellers.map(
    (traveller, index) => {
      const item = findBaggageByTravellerOrIndex(
        source.addonsData?.baggageSelections || [],
        traveller.id,
        index
      );

      return {
        travellerId: traveller.id,
        oldBaggageCode: item?.baggageCode ?? item?.code ?? "BG0",
        newBaggageCode: item?.baggageCode ?? item?.code ?? "BG0",
        oldPrice: item?.price ?? 0,
        newPrice: item?.price ?? 0,
        skipped: false,
      };
    }
  );

  const isBackendTestBooking = Boolean(
    source.payload?.backendTestPaymentConfirmation ||
      source.payload?.backendSimulation ||
      source.payload?.bookingMeta?.supplierBookingDisabled ||
      source.supplierBookingDisabled ||
      source.testStatus === "TPL_TEST_BOOKING_CONFIRMED"
  );
  const summary: FlightManageBookingRecord = {
    bookingId: booking.id,
    pnr:
      isBackendTestBooking
        ? "Not issued in test mode"
        :
      source.payload?.confirmationData?.pnr ||
      source.payload?.pnr ||
      "PNR Pending",
    bookingStatus: "confirmed",
    bookingType: source.reviewData?.bookingType || "oneWay",
    origin: source.firstSegment?.fromCode || source.firstSegment?.from || "",
    destination:
      source.reviewData?.bookingType === "roundTrip" ||
      source.reviewData?.bookingType === "multiCity"
        ? source.lastSegment?.toCode || source.lastSegment?.to || ""
        : source.firstSegment?.toCode || source.firstSegment?.to || "",
    travelDate: source.journeyDateLabel || booking.travelDate,
    airlineName: source.firstSegment?.airline || "Flight",
    flightNumber: source.firstSegment?.flightNumber || "Flight Number Pending",
    travellers,
    contact,
    specialRequest: source.reviewData?.specialRequest || "",
    seats: seats.map((item) => ({
      travellerId: item.travellerId,
      oldSeatCode: item.oldSeatCode ?? undefined,
      newSeatCode: item.newSeatCode ?? undefined,
      oldPrice: item.oldPrice,
      newPrice: item.newPrice,
    })),
    meals: meals.map((item) => ({
      travellerId: item.travellerId,
      oldMealCode: item.oldMealId ?? undefined,
      newMealCode: item.newMealId ?? undefined,
      oldPrice: item.oldPrice,
      newPrice: item.newPrice,
    })),
    baggage: baggage.map((item) => ({
      travellerId: item.travellerId,
      oldBaggageCode: item.oldBaggageCode ?? undefined,
      newBaggageCode: item.newBaggageCode ?? undefined,
      oldPrice: item.oldPrice,
      newPrice: item.newPrice,
    })),
    baseFareSnapshot: {
      totalPaidAmount: source.priceBreakup.totalAmount || booking.amount || 0,
      currency:
        (source.priceBreakup as { currency?: string }).currency ||
        (source.payload?.pricingSnapshot as { currency?: string } | undefined)?.currency ||
        "INR",
    },
    paymentStatus:
      source.paymentData?.paymentStatus ||
      booking.paymentStatus ||
      (isBackendTestBooking ? "paid" : undefined),
    paymentRef:
      source.paymentData?.paymentRef ||
      source.payload?.paymentRef ||
      booking.paymentId,
    testStatus:
      source.testStatus ||
      source.payload?.backendTestPaymentConfirmation?.status ||
      source.payload?.backendSimulation?.status,
    supplierBookingDisabled: isBackendTestBooking,
    bookingAllowed: source.bookingAllowed,
    ticketingAllowed: source.ticketingAllowed,
    paymentCaptureAllowed: source.paymentCaptureAllowed,
    ticketNumber: source.ticketNumber,
  };

  return {
    summary,
    travellers,
    contact,
    specialRequest: summary.specialRequest || "",
    seats,
    meals,
    baggage,
  };
}

function FlightManagePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookingId = searchParams.get("bookingId") || "";

  const [activeTab, setActiveTab] = useState<SidebarKey>("summary");
  const [isLoading, setIsLoading] = useState(true);
  const [bookingItem, setBookingItem] = useState<BookingItem | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [manageSummary, setManageSummary] =
    useState<FlightManageBookingRecord>(emptyBookingSummary);

  const [travellers, setTravellers] = useState<ManageTraveller[]>([]);
  const [contact, setContact] = useState<ManageContact>({
    email: "",
    phone: "",
  });
  const [specialRequest, setSpecialRequest] = useState("");

  const [seatSelections, setSeatSelections] = useState<TravellerSeatSelection[]>([]);
  const [mealSelections, setMealSelections] = useState<TravellerMealSelection[]>([]);
  const [baggageSelections, setBaggageSelections] = useState<
    TravellerBaggageSelection[]
  >([]);

  useEffect(() => {
    let cancelled = false;

    if (!bookingId) {
      setIsLoading(false);
      return;
    }

    const loadBooking = async () => {
      const allBookings = getAllBookings();
      let matchedBooking = allBookings.find(
        (item) =>
          item.type === "flight" &&
          [
            item.id,
            item.bookingId,
            item.backendBookingId,
            item.backendBookingRef,
            item.legacyFrontendId,
          ]
            .map((value) => String(value || "").trim())
            .includes(bookingId)
      );

      let payload = matchedBooking
        ? getBookingPayload<FlightManagePayload>(matchedBooking.payloadStorageKey)
        : null;

      if (!matchedBooking || !payload) {
        const backendResult = await getBackendFirstBookingPayload<FlightManagePayload>(
          bookingId,
          "flight"
        );
        if (backendResult.booking) matchedBooking = backendResult.booking;
        if (backendResult.payload) payload = backendResult.payload;
      }

      if (cancelled) return;

      if (!matchedBooking) {
        setBookingItem(null);
        setIsLoading(false);
        return;
      }

      const resolvedSource = resolveFlightBookingSource(matchedBooking, payload);
      const hydrated = buildManageStateFromResolvedFlightSource(
        matchedBooking,
        resolvedSource
      );

      setBookingItem(matchedBooking);
      setManageSummary(hydrated.summary);
      setTravellers(hydrated.travellers);
      setContact(hydrated.contact);
      setSpecialRequest(hydrated.specialRequest);
      setSeatSelections(hydrated.seats);
      setMealSelections(hydrated.meals);
      setBaggageSelections(hydrated.baggage);
      setIsLoading(false);
    };

    void loadBooking();

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  const bookingForSummary = useMemo<FlightManageBookingRecord>(() => {
    return {
      ...manageSummary,
      travellers,
      contact,
      specialRequest,
      seats: seatSelections.map((item) => ({
        travellerId: item.travellerId,
        oldSeatCode: item.oldSeatCode ?? undefined,
        newSeatCode: item.newSeatCode ?? undefined,
        oldPrice: item.oldPrice,
        newPrice: item.newPrice,
      })),
      meals: mealSelections.map((item) => ({
        travellerId: item.travellerId,
        oldMealCode: item.oldMealId ?? undefined,
        newMealCode: item.newMealId ?? undefined,
        oldPrice: item.oldPrice,
        newPrice: item.newPrice,
      })),
      baggage: baggageSelections.map((item) => ({
        travellerId: item.travellerId,
        oldBaggageCode: item.oldBaggageCode ?? undefined,
        newBaggageCode: item.newBaggageCode ?? undefined,
        oldPrice: item.oldPrice,
        newPrice: item.newPrice,
      })),
    };
  }, [
    manageSummary,
    travellers,
    contact,
    specialRequest,
    seatSelections,
    mealSelections,
    baggageSelections,
  ]);

  const bookingTypeLabel =
    manageSummary.bookingType === "roundTrip"
      ? "Round Trip"
      : manageSummary.bookingType === "multiCity"
      ? "Multi City"
      : "One Way";

  const seatQuote = useMemo(() => {
    return buildManageQuote({
      seats: seatSelections.map((item) => ({
        travellerId: item.travellerId,
        oldSeatCode: item.oldSeatCode ?? undefined,
        newSeatCode: item.newSeatCode ?? undefined,
        oldPrice: item.oldPrice,
        newPrice: item.newPrice,
      })),
      meals: [],
      baggage: [],
      airlineCharges: 0,
    });
  }, [seatSelections]);

  const mealQuote = useMemo(() => {
    return buildManageQuote({
      seats: [],
      meals: mealSelections.map((item) => ({
        travellerId: item.travellerId,
        oldMealCode: item.oldMealId ?? undefined,
        newMealCode: item.newMealId ?? undefined,
        oldPrice: item.oldPrice,
        newPrice: item.newPrice,
      })),
      baggage: [],
      airlineCharges: 0,
    });
  }, [mealSelections]);

  const baggageQuote = useMemo(() => {
    return buildManageQuote({
      seats: [],
      meals: [],
      baggage: baggageSelections.map((item) => ({
        travellerId: item.travellerId,
        oldBaggageCode: item.oldBaggageCode ?? undefined,
        newBaggageCode: item.newBaggageCode ?? undefined,
        oldPrice: item.oldPrice,
        newPrice: item.newPrice,
      })),
      airlineCharges: 0,
    });
  }, [baggageSelections]);

  const handleMoneyContinue = async (
    section: "seats" | "meals" | "baggage",
    mode: "save" | "payment" | "wallet_credit"
  ) => {
    if (!bookingItem) return;

    try {
      if (mode === "payment" || mode === "wallet_credit") {
        const payload = getBookingPayload<FlightManagePayload>(
          bookingItem.payloadStorageKey
        );

        if (!payload || !bookingItem.payloadStorageKey) {
          alert("Booking payload not found.");
          return;
        }

        payload.manageDraft = {
          seats: seatSelections,
          meals: mealSelections,
          baggage: baggageSelections,
          section,
        };

        const sectionQuote =
          section === "seats"
            ? seatQuote
            : section === "meals"
            ? mealQuote
            : baggageQuote;

        const backendResult = await prepareBackendManageRequest({
          booking: bookingItem,
          payload,
          serviceType: "flight",
          section,
          changeType:
            sectionQuote.settlementMode === "payment"
              ? "upgrade"
              : sectionQuote.settlementMode === "wallet_credit"
              ? "downgrade"
              : "same_price",
          settlementMode: sectionQuote.settlementMode,
          currentAmount:
            sectionQuote.settlementMode === "wallet_credit"
              ? Number(sectionQuote.walletCredit || 0)
              : 0,
          requestedAmount:
            sectionQuote.settlementMode === "payment"
              ? Number(sectionQuote.netPayable || 0)
              : 0,
          requestedChange: {
            seats: seatSelections,
            meals: mealSelections,
            baggage: baggageSelections,
            section,
          },
          beforeSnapshot: payload,
          afterSnapshot: payload,
        });

        if (!backendResult.ok && !backendResult.fallbackAllowed) {
          alert(backendResult.error || "Backend manage booking request failed.");
          return;
        }

        const payloadToSave =
          backendResult.ok && backendResult.payload
            ? { ...payload, ...backendResult.payload }
            : payload;

        persistBackendManageCache(bookingItem.payloadStorageKey, payloadToSave);

        router.push(
          `/manage/payment?bookingId=${encodeURIComponent(
            bookingItem.id
          )}&section=${section}&type=flight`
        );
        return;
      }

      const payload = getBookingPayload<FlightManagePayload>(
        bookingItem.payloadStorageKey
      );
      if (!payload) {
        alert("Booking payload not found.");
        return;
      }

      const backendResult = await executeBackendSamePriceManage({
        booking: bookingItem,
        payload,
        serviceType: "flight",
        section,
        changeType:
          section === "seats"
            ? "seat_update"
            : section === "meals"
            ? "meal_update"
            : "baggage_update",
        settlementMode: "save",
        currentAmount: 0,
        requestedAmount: 0,
        requestedChange: {
          seats: seatSelections,
          meals: mealSelections,
          baggage: baggageSelections,
          section,
        },
        beforeSnapshot: payload,
        afterSnapshot: {
          ...payload,
          manageDraft: {
            ...(payload.manageDraft || {}),
            seats: seatSelections,
            meals: mealSelections,
            baggage: baggageSelections,
            section,
          },
        },
      });

      if (!backendResult.ok && !backendResult.fallbackAllowed) {
        alert(backendResult.error || "Backend manage booking request failed.");
        return;
      }

      if (section === "seats") {
        saveFlightSeatChanges({
          bookingId: bookingItem.id,
          payloadStorageKey: bookingItem.payloadStorageKey,
          seats: seatSelections,
        });
      }

      if (section === "meals") {
        saveFlightMealChanges({
          bookingId: bookingItem.id,
          payloadStorageKey: bookingItem.payloadStorageKey,
          meals: mealSelections,
          mealCatalog: FLIGHT_ANCILLARY_CATALOG.meals,
        });
      }

      if (section === "baggage") {
        saveFlightBaggageChanges({
          bookingId: bookingItem.id,
          payloadStorageKey: bookingItem.payloadStorageKey,
          baggage: baggageSelections,
        });
      }

      if (backendResult.ok && backendResult.payload) {
        const updatedPayload =
          getBookingPayload<FlightManagePayload>(bookingItem.payloadStorageKey) ||
          payload;
        persistBackendManageCache(bookingItem.payloadStorageKey, {
          ...updatedPayload,
          ...backendResult.payload,
        });
      }

      alert(`${section} updated successfully.`);

      const allBookings = getAllBookings();
      const refreshedBooking =
        allBookings.find(
          (item) => item.id === bookingItem.id && item.type === "flight"
        ) || bookingItem;

      const refreshedPayload = getBookingPayload<FlightManagePayload>(
        refreshedBooking.payloadStorageKey
      );
      const refreshedSource = resolveFlightBookingSource(
        refreshedBooking,
        refreshedPayload
      );
      const refreshedHydrated = buildManageStateFromResolvedFlightSource(
        refreshedBooking,
        refreshedSource
      );

      setBookingItem(refreshedBooking);
      setManageSummary(refreshedHydrated.summary);
      setTravellers(refreshedHydrated.travellers);
      setContact(refreshedHydrated.contact);
      setSpecialRequest(refreshedHydrated.specialRequest);
      setSeatSelections(refreshedHydrated.seats);
      setMealSelections(refreshedHydrated.meals);
      setBaggageSelections(refreshedHydrated.baggage);
    } catch (error) {
      console.error(error);
      alert(`Unable to update ${section}. Please try again.`);
    }
  };

  const handleTravellerChange = async (next: ManageTraveller[]) => {
    setTravellers(next);

    if (!bookingItem?.payloadStorageKey) return;
    const payload = getBookingPayload<FlightManagePayload>(
      bookingItem.payloadStorageKey
    );
    if (!payload) return;

    const nextPayload = buildTravellerPayload(payload, next);
    const currentAmount = getFlightManageCurrentAmount(payload, bookingItem);
    const backendResult = await executeBackendSamePriceManage({
      booking: bookingItem,
      payload,
      serviceType: "flight",
      section: "traveller-details",
      changeType: "traveller_update",
      settlementMode: "save",
      currentAmount,
      requestedAmount: currentAmount,
      requestedChange: { travellerValidation: nextPayload.travellerValidation },
      beforeSnapshot: payload,
      afterSnapshot: nextPayload,
    });

    const payloadToSave =
      backendResult.ok && backendResult.payload
        ? { ...nextPayload, ...backendResult.payload }
        : nextPayload;

    savePayloadToStorage(bookingItem.payloadStorageKey, payloadToSave);
  };

  const handleContactChange = async (next: ManageContact) => {
    setContact(next);

    if (!bookingItem?.payloadStorageKey) return;
    const payload = getBookingPayload<FlightManagePayload>(
      bookingItem.payloadStorageKey
    );
    if (!payload) return;

    const nextPayload = buildContactPayload(payload, next);
    const currentAmount = getFlightManageCurrentAmount(payload, bookingItem);
    const backendResult = await executeBackendSamePriceManage({
      booking: bookingItem,
      payload,
      serviceType: "flight",
      section: "contact-details",
      changeType: "contact_update",
      settlementMode: "save",
      currentAmount,
      requestedAmount: currentAmount,
      requestedChange: { travellerValidation: nextPayload.travellerValidation },
      beforeSnapshot: payload,
      afterSnapshot: nextPayload,
    });

    const payloadToSave =
      backendResult.ok && backendResult.payload
        ? { ...nextPayload, ...backendResult.payload }
        : nextPayload;

    savePayloadToStorage(bookingItem.payloadStorageKey, payloadToSave);
  };

  const handleSpecialRequestChange = async (next: string) => {
    setSpecialRequest(next);

    if (!bookingItem?.payloadStorageKey) return;
    const payload = getBookingPayload<FlightManagePayload>(
      bookingItem.payloadStorageKey
    );
    if (!payload) return;

    const nextPayload = buildSpecialRequestPayload(payload, next);
    const currentAmount = getFlightManageCurrentAmount(payload, bookingItem);
    const backendResult = await executeBackendSamePriceManage({
      booking: bookingItem,
      payload,
      serviceType: "flight",
      section: "special-request",
      changeType: "add_on_update",
      settlementMode: "save",
      currentAmount,
      requestedAmount: currentAmount,
      requestedChange: { specialRequest: next },
      beforeSnapshot: payload,
      afterSnapshot: nextPayload,
    });

    const payloadToSave =
      backendResult.ok && backendResult.payload
        ? { ...nextPayload, ...backendResult.payload }
        : nextPayload;

    savePayloadToStorage(bookingItem.payloadStorageKey, payloadToSave);
  };

  const handleCancelBooking = async () => {
    if (!bookingItem || isCancelling) return;
    if (manageSummary.supplierBookingDisabled) {
      alert("Cancellation is disabled for TPL flight test bookings.");
      return;
    }

    const confirmed = window.confirm(
      "Cancel this flight booking? Refund will be tracked against the original payment method."
    );
    if (!confirmed) return;

    const reason = "Cancelled by user from Manage Booking";
    const estimate = getRefundEstimate(bookingItem);
    const payload = getBookingPayload<FlightManagePayload>(
      bookingItem.payloadStorageKey
    );

    setIsCancelling(true);
    try {
      const backendResult = await executeBackendFlightCancellation({
        booking: bookingItem,
        reason,
        payload,
      });

      if (!backendResult.ok && !backendResult.fallbackAllowed) {
        alert(backendResult.error || "Backend cancellation request failed.");
        return;
      }

      if (!backendResult.ok) {
        const cancelled = cancelBooking(bookingItem.id, reason);
        if (cancelled) {
          setBookingItem(cancelled);
          setManageSummary((current) => ({
            ...current,
            bookingStatus: "cancelled",
          }));
        }
        alert("Booking cancelled locally. Backend cancellation was unavailable.");
        return;
      }

      const refs = backendResult.payload;
      const now = new Date().toISOString();
      const nextBooking = updateBooking(bookingItem.id, {
        status: "cancelled",
        bookingStatus: normalizeManageBookingStatus(refs?.backendCancellationStatus),
        cancelMeta: {
          canCancel: false,
          cancellationPolicyText: estimate.cancellationPolicyText,
          refundableAmount:
            Number(refs?.backendRefundAmount || 0) || estimate.refundableAmount,
          cancellationCharge: estimate.cancellationCharge,
          cancelledAt: now,
          cancelReason: reason,
          backendCancellationId: refs?.backendCancellationId,
          backendCancellationStatus: refs?.backendCancellationStatus || "cancelled",
          supplierCancellationExecuted: refs?.supplierCancellationExecuted === true,
        },
        refund: {
          amount: Number(refs?.backendRefundAmount || 0) || estimate.refundableAmount,
          status: normalizeRefundStatus(refs?.backendRefundStatus),
          initiatedAt: now,
          method: refs?.backendRefundMethod || "original_payment",
          backendRefundId: refs?.backendRefundId,
          backendRefundStatus: refs?.backendRefundStatus || "processing",
          backendPaymentId: refs?.backendRefundPaymentId,
          liveProviderRefundExecuted: refs?.liveProviderRefundExecuted === true,
        },
      });

      if (payload && bookingItem.payloadStorageKey) {
        savePayloadToStorage(bookingItem.payloadStorageKey, {
          ...payload,
          cancellationData: {
            ...(payload.cancellationData as Record<string, unknown> | undefined),
            backendCancellationId: refs?.backendCancellationId,
            backendCancellationStatus: refs?.backendCancellationStatus || "cancelled",
            backendRefundId: refs?.backendRefundId,
            backendRefundStatus: refs?.backendRefundStatus || "processing",
            backendRefundMethod: refs?.backendRefundMethod || "original_payment",
            backendFullCancellationWalletCredit: 0,
            liveProviderRefundExecuted: refs?.liveProviderRefundExecuted === true,
            supplierCancellationExecuted: refs?.supplierCancellationExecuted === true,
          },
        });
      }

      if (nextBooking) setBookingItem(nextBooking);
      setManageSummary((current) => ({
        ...current,
        bookingStatus: normalizeManageBookingStatus(refs?.backendCancellationStatus),
      }));
      alert("Booking cancellation recorded. Refund is processing to original payment method.");
    } catch (error) {
      console.error(error);
      alert("Unable to cancel booking. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };
  if (isLoading) {
    return (
      <section className="bg-[#f8f9fb] px-4 py-10">
        <div className="mx-auto max-w-[1440px] rounded-[28px] border border-black/5 bg-white p-8 text-sm text-[#6b7280] shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
          Loading manage booking...
        </div>
      </section>
    );
  }

  if (!bookingId || !bookingItem) {
    return (
      <section className="bg-[#f8f9fb] px-4 py-10">
        <div className="mx-auto max-w-[1440px] rounded-[28px] border border-black/5 bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
          <h1 className="text-xl font-bold text-[#111827]">Booking not found</h1>
          <p className="mt-2 text-sm text-[#6b7280]">
            Requested manage booking record load nahi ho paaya.
          </p>
          <button
            type="button"
            onClick={() => router.push("/account/bookings")}
            className="mt-5 rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white"
          >
            Back to My Bookings
          </button>
        </div>
      </section>
    );
  }

  return (
    <ManageBookingLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      bookingId={manageSummary.bookingId}
      pnr={manageSummary.pnr}
      tripLabel={`${manageSummary.origin} → ${manageSummary.destination}`}
      journeyLabel={`${travellers.length} Traveller • ${bookingTypeLabel}`}
      sidebarItems={[
        { key: "summary", label: "Booking Summary" },
        { key: "traveller-details", label: "Traveller Details" },
        { key: "contact-details", label: "Contact Details" },
        { key: "special-request", label: "Special Request" },
        { key: "seats", label: "Seats", badge: "Paid" },
        { key: "meals", label: "Meals", badge: "Paid" },
        { key: "baggage", label: "Baggage", badge: "Paid" },
        {
          key: "cancel-booking",
          label: manageSummary.supplierBookingDisabled
            ? "Cancellation Disabled"
            : "Cancel Booking",
          disabled: manageSummary.supplierBookingDisabled,
        },
      ]}
    >
      {activeTab === "summary" && (
        <ManageBookingDetails booking={bookingForSummary} />
      )}

      {activeTab === "traveller-details" && (
        <ManageTravellerDetailsSection
          travellers={travellers}
          onChange={(next) => {
            void handleTravellerChange(next);
          }}
        />
      )}

      {activeTab === "contact-details" && (
        <ManageContactDetailsSection
          value={contact}
          onChange={(next) => {
            void handleContactChange(next);
          }}
        />
      )}

      {activeTab === "special-request" && (
        <ManageSpecialRequestSection
          value={specialRequest}
          onChange={(next) => {
            void handleSpecialRequestChange(next);
          }}
        />
      )}

      {activeTab === "seats" && (
        <ManageSeatsSection
          travellers={travellers}
          value={seatSelections}
          onChange={setSeatSelections}
        />
      )}

      {activeTab === "meals" && (
        <div className="space-y-5">
          <ManageMealsSection
            travellers={travellers}
            value={mealSelections}
            onChange={setMealSelections}
          />
          <ManageActionPanel
            quote={mealQuote}
            onContinue={() =>
              handleMoneyContinue("meals", mealQuote.settlementMode)
            }
          />
        </div>
      )}

      {activeTab === "baggage" && (
        <div className="space-y-5">
          <ManageBaggageSection
            travellers={travellers}
            value={baggageSelections}
            onChange={setBaggageSelections}
          />
          <ManageActionPanel
            quote={baggageQuote}
            onContinue={() =>
              handleMoneyContinue("baggage", baggageQuote.settlementMode)
            }
          />
        </div>
      )}

      {activeTab === "cancel-booking" && (
        <CancelBookingEntrySection
          bookingId={bookingItem.backendBookingRef || manageSummary.bookingId}
          pnr={manageSummary.pnr}
          refundableAmount={
            bookingItem.refund?.amount ||
            bookingItem.cancelMeta?.refundableAmount ||
            getRefundEstimate(bookingItem).refundableAmount
          }
          deductionAmount={
            bookingItem.cancelMeta?.cancellationCharge ||
            getRefundEstimate(bookingItem).cancellationCharge
          }
          onContinue={handleCancelBooking}
          isSubmitting={isCancelling}
          cancellationStatus={
            bookingItem.cancelMeta?.backendCancellationStatus || bookingItem.bookingStatus
          }
          refundStatus={bookingItem.refund?.backendRefundStatus || bookingItem.refund?.status}
          refundMethod={bookingItem.refund?.method || "original_payment"}
          disableContinue={bookingItem.status === "cancelled"}
        />
      )}
    </ManageBookingLayout>
  );
}

function normalizeManageBookingStatus(value?: string): "confirmed" | "changed" | "cancelled" {
  const normalized = String(value || "cancelled").toLowerCase();
  if (normalized.includes("cancel")) return "cancelled";
  if (normalized.includes("chang") || normalized.includes("modif")) return "changed";
  return "confirmed";
}
function normalizeRefundStatus(value?: string): "processing" | "processed" | "failed" {
  const normalized = String(value || "processing").toLowerCase();
  if (normalized === "processed" || normalized === "completed" || normalized === "success") {
    return "processed";
  }
  if (normalized === "failed") return "failed";
  return "processing";
}
export default function FlightManagePage() {
  return (
    <Suspense fallback={<div />}>
      <FlightManagePageContent />
    </Suspense>
  );
}
