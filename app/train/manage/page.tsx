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

import TrainManageLayout, {
  type TrainManageTab,
} from "@/app/components/manage/train/TrainManageLayout";

import TrainManageSummary from "@/app/components/manage/train/TrainManageSummary";

import TrainManageTravellerDetails, {
  type TrainManageTraveller,
} from "@/app/components/manage/train/TrainManageTravellerDetails";

import TrainManageContactDetails, {
  type TrainManageContact,
} from "@/app/components/manage/train/TrainManageContactDetails";

import TrainManageSpecialRequest from "@/app/components/manage/train/TrainManageSpecialRequest";

import TrainManageSeatAddons, {
  type TrainSeatQuote,
  type TrainSeatVariant,
} from "@/app/components/manage/train/TrainManageSeatAddons";

type Payload = any;

function dispatchBookingUpdate() {
  if (typeof window === "undefined")
    return;

  window.dispatchEvent(
    new Event(
      BOOKING_UPDATED_EVENT
    )
  );
}

function savePayload(
  payloadStorageKey:
    | string
    | undefined,
  payload: any
) {
  if (typeof window === "undefined")
    return false;

  if (!payloadStorageKey)
    return false;

  localStorage.setItem(
    payloadStorageKey,
    JSON.stringify(payload)
  );

  dispatchBookingUpdate();

  return true;
}

function getTravellerName(
  traveller: TrainManageTraveller
) {
  return (
    traveller?.name ||
    `${traveller?.firstName || ""} ${
      traveller?.lastName || ""
    }`.trim() ||
    "Traveller"
  );
}

function normalizeTravellers(
  payload: Payload | null
): TrainManageTraveller[] {
  const list = Array.isArray(
    payload?.travellers
  )
    ? payload.travellers
    : Array.isArray(
        payload?.bookingPayload
          ?.passengers
      )
    ? payload.bookingPayload
        .passengers
    : [];

  if (list.length) {
    return list.map(
      (
        item: any,
        index: number
      ) => ({
        ...item,

        id:
          item?.id ||
          `traveller-${
            index + 1
          }`,

        firstName:
          item?.firstName ||
          item?.name
            ?.split?.(" ")?.[0] ||
          "",

        lastName:
          item?.lastName ||
          item?.name
            ?.split?.(" ")
            ?.slice(1)
            .join(" ") ||
          "",

        name:
          item?.name ||
          `${item?.firstName || ""} ${
            item?.lastName || ""
          }`.trim(),

        gender:
          item?.gender || "",

        age: String(
          item?.age || ""
        ),

        berthPreference:
          item?.berthPreference ||
          "",

        mealPreference:
          item?.mealPreference ||
          "",
      })
    );
  }

  return [
    {
      id: "traveller-1",

      firstName: "",
      lastName: "",

      name: "Traveller",

      gender: "",
      age: "",

      berthPreference: "",
      mealPreference: "",
    },
  ];
}

function normalizeContact(
  payload: Payload | null
): TrainManageContact {
  const contact =
    payload?.contactDetails ||
    payload?.bookingPayload
      ?.contactDetails ||
    {};

  return {
    countryCode:
      contact?.countryCode ||
      "+91",

    mobile:
      contact?.mobile ||
      contact?.phone ||
      "",

    email:
      contact?.email || "",
  };
}

function formatDateOnly(
  value: string
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  )
    return value || "-";

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function TrainManagePageContent() {
  const searchParams =
    useSearchParams();

  const bookingId =
    searchParams.get(
      "bookingId"
    ) || "";

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<TrainManageTab>(
      "summary"
    );

  const [booking, setBooking] =
    useState<BookingItem | null>(
      null
    );

  const [payload, setPayload] =
    useState<Payload | null>(
      null
    );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    travellers,
    setTravellers,
  ] = useState<
    TrainManageTraveller[]
  >([]);

  const [contact, setContact] =
    useState<TrainManageContact>(
      {
        countryCode: "+91",
        mobile: "",
        email: "",
      }
    );

  const [
    specialRequest,
    setSpecialRequest,
  ] = useState("");

  const [
    activeSeatVariant,
    setActiveSeatVariant,
  ] =
    useState<TrainSeatVariant | null>(
      null
    );

  const loadBooking = () => {
    if (!bookingId) {
      setIsLoading(false);
      return;
    }

    const all =
      getAllBookings();

    const found =
      all.find(
        (item) =>
          item.id ===
            bookingId &&
          item.type ===
            "train"
      ) || null;

    setBooking(found);

    if (
      found?.payloadStorageKey
    ) {
      const savedPayload =
        getBookingPayload<Payload>(
          found.payloadStorageKey
        );

      setPayload(
        savedPayload
          ? {
              ...savedPayload,
            }
          : null
      );

      setTravellers(
        normalizeTravellers(
          savedPayload
        )
      );

      setContact(
        normalizeContact(
          savedPayload
        )
      );

      setSpecialRequest(
        savedPayload?.specialRequest ||
          ""
      );

      setActiveSeatVariant(
        savedPayload?.selectedSeat ||
          null
      );
    } else {
      setPayload(null);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadBooking();

    window.addEventListener(
      BOOKING_UPDATED_EVENT,
      loadBooking
    );

    window.addEventListener(
      "storage",
      loadBooking
    );

    window.addEventListener(
      "focus",
      loadBooking
    );

    return () => {
      window.removeEventListener(
        BOOKING_UPDATED_EVENT,
        loadBooking
      );

      window.removeEventListener(
        "storage",
        loadBooking
      );

      window.removeEventListener(
        "focus",
        loadBooking
      );
    };
  }, [bookingId]);

  const trainName =
    payload?.trainName ||
    "Train Booking";

  const trainNumber =
    payload?.trainNumber ||
    "-";

  const route =
    payload?.route || "-";

  const boardingStation =
    payload?.boardingStation ||
    "-";

  const destinationStation =
    payload?.destinationStation ||
    "-";

  const journeyDate =
    payload?.journeyDate ||
    booking?.travelDate ||
    "-";

  const departureTime =
    payload?.departureTime ||
    "-";

  const arrivalTime =
    payload?.arrivalTime ||
    "-";

  const coachClass =
    payload?.coachClass ||
    payload?.travelClass ||
    "-";

  const quota =
    payload?.quota || "-";

  const pnrNumber =
    payload?.pnrNumber ||
    payload?.pnr ||
    "-";

  const fare =
    payload?.fare || {};

  const currentSeat =
    payload?.selectedSeat ||
    {};

  const fareSummary = {
    baseFare: Number(
      fare?.baseFare || 0
    ),

    reservationCharge:
      Number(
        fare?.reservationCharge ||
          0
      ),

    superfastCharge:
      Number(
        fare?.superfastCharge ||
          0
      ),

    otherCharges: Number(
      fare?.otherCharges ||
        0
    ),

    tax: Number(
      fare?.tax || 0
    ),
  };

  const seatQuote =
    useMemo<TrainSeatQuote>(
      () => {
        const currentVariant =
          payload?.selectedSeat ||
          currentSeat ||
          {};

        const nextVariant =
          activeSeatVariant ||
          currentVariant;

        const travellerCount =
          travellers.length ||
          1;

        const oldTotal =
          (Number(
            currentVariant?.price ||
              0
          ) +
            Number(
              currentVariant?.taxes ||
                0
            )) *
          travellerCount;

        const newTotal =
          (Number(
            nextVariant?.price ||
              0
          ) +
            Number(
              nextVariant?.taxes ||
                0
            )) *
          travellerCount;

        const difference =
          newTotal -
          oldTotal;

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
      },
      [
        payload,
        currentSeat,
        activeSeatVariant,
        travellers.length,
      ]
    );

  const handleSaveTravellers =
    async () => {
      if (
        !booking?.payloadStorageKey ||
        !payload
      )
        return;

      const nextPayload = {
        ...payload,

        travellers:
          travellers.map(
            (
              traveller,
              index
            ) => ({
              ...traveller,

              id:
                traveller.id ||
                `traveller-${
                  index + 1
                }`,

              name:
                getTravellerName(
                  traveller
                ),
            })
          ),
      };

      const backendResult =
        await executeBackendSamePriceManage(
          {
            booking,
            payload,
            serviceType: "train",
            section:
              "traveller-details",
            changeType:
              "traveller_update",
            settlementMode:
              "save",
            currentAmount:
              Number(
                payload
                  ?.paymentData
                  ?.totalPaid ||
                  fare?.totalPaid ||
                  fare?.totalAmount ||
                  booking.amount ||
                  0
              ),
            requestedAmount:
              Number(
                payload
                  ?.paymentData
                  ?.totalPaid ||
                  fare?.totalPaid ||
                  fare?.totalAmount ||
                  booking.amount ||
                  0
              ),
            requestedChange: {
              travellers:
                nextPayload.travellers,
            },
            beforeSnapshot:
              payload,
            afterSnapshot:
              nextPayload,
          }
        );

      const payloadToSave =
        backendResult.ok &&
        backendResult.payload
          ? {
              ...nextPayload,
              ...backendResult.payload,
            }
          : nextPayload;

      savePayload(
        booking.payloadStorageKey,
        payloadToSave
      );

      setPayload(
        payloadToSave
      );

      alert(
        "Traveller details updated successfully."
      );
    };

  const handleSaveContact =
    async () => {
      if (
        !booking?.payloadStorageKey ||
        !payload
      )
        return;

      const nextPayload = {
        ...payload,

        contactDetails: {
          ...contact,
        },
      };

      const currentAmount =
        Number(
          payload?.paymentData
            ?.totalPaid ||
            fare?.totalPaid ||
            fare?.totalAmount ||
            booking.amount ||
            0
        );

      const backendResult =
        await executeBackendSamePriceManage(
          {
            booking,
            payload,
            serviceType: "train",
            section:
              "contact-details",
            changeType:
              "contact_update",
            settlementMode:
              "save",
            currentAmount,
            requestedAmount:
              currentAmount,
            requestedChange: {
              contactDetails:
                nextPayload.contactDetails,
            },
            beforeSnapshot:
              payload,
            afterSnapshot:
              nextPayload,
          }
        );

      const payloadToSave =
        backendResult.ok &&
        backendResult.payload
          ? {
              ...nextPayload,
              ...backendResult.payload,
            }
          : nextPayload;

      savePayload(
        booking.payloadStorageKey,
        payloadToSave
      );

      setPayload(
        payloadToSave
      );

      alert(
        "Contact details updated successfully."
      );
    };

  const handleSaveSpecialRequest =
    async () => {
      if (
        !booking?.payloadStorageKey ||
        !payload
      )
        return;

      const nextPayload = {
        ...payload,
        specialRequest,
      };

      const currentAmount =
        Number(
          payload?.paymentData
            ?.totalPaid ||
            fare?.totalPaid ||
            fare?.totalAmount ||
            booking.amount ||
            0
        );

      const backendResult =
        await executeBackendSamePriceManage(
          {
            booking,
            payload,
            serviceType: "train",
            section:
              "special-request",
            changeType:
              "add_on_update",
            settlementMode:
              "save",
            currentAmount,
            requestedAmount:
              currentAmount,
            requestedChange: {
              specialRequest,
            },
            beforeSnapshot:
              payload,
            afterSnapshot:
              nextPayload,
          }
        );

      const payloadToSave =
        backendResult.ok &&
        backendResult.payload
          ? {
              ...nextPayload,
              ...backendResult.payload,
            }
          : nextPayload;

      savePayload(
        booking.payloadStorageKey,
        payloadToSave
      );

      setPayload(
        payloadToSave
      );

      alert(
        "Special request updated successfully."
      );
    };

  const handleSeatContinue =
    async () => {
      if (
        !booking?.payloadStorageKey ||
        !payload
      )
        return;

      const selectedSeatForDraft =
        activeSeatVariant ||
        currentSeat ||
        payload?.selectedSeat ||
        null;

      if (
        !selectedSeatForDraft
      ) {
        alert(
          "Please select a seat option first."
        );

        return;
      }

      const nextPayload = {
        ...payload,

        manageDraft: {
          ...(payload.manageDraft ||
            {}),

          section:
            "seat-addons",

          selectedSeat:
            selectedSeatForDraft,

          seatQuote,
        },
      };

      const backendResult =
        await prepareBackendManageRequest(
          {
            booking,
            payload: nextPayload,
            serviceType: "train",
            section:
              "seat-addons",
            changeType:
              seatQuote
                .settlementMode ===
              "payment"
                ? "upgrade"
                : seatQuote
                    .settlementMode ===
                  "wallet_credit"
                ? "downgrade"
                : "same_price",
            settlementMode:
              seatQuote
                .settlementMode,
            currentAmount:
              seatQuote.oldTotal,
            requestedAmount:
              seatQuote.newTotal,
            requestedChange: {
              selectedSeat:
                selectedSeatForDraft,
              seatQuote,
            },
            beforeSnapshot:
              payload,
            afterSnapshot:
              nextPayload,
          }
        );

      if (
        !backendResult.ok &&
        !backendResult.fallbackAllowed
      ) {
        alert(
          backendResult.error ||
            "Backend manage booking request failed."
        );

        return;
      }

      const payloadToSave =
        backendResult.ok &&
        backendResult.payload
          ? {
              ...nextPayload,
              ...backendResult.payload,
            }
          : nextPayload;

      persistBackendManageCache(
        booking.payloadStorageKey,
        payloadToSave
      );

      window.location.href = `/manage/payment?bookingId=${encodeURIComponent(
        booking.id
      )}&section=seat-addons&type=train`;
    };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] px-3 py-6 md:px-4 md:py-10">
        <div className="mx-auto max-w-[1440px] rounded-[20px] border border-black/5 bg-white p-4 text-sm font-semibold text-[#6b7280] shadow-[0_10px_34px_rgba(15,23,42,0.05)] md:rounded-[28px] md:p-8">
          Loading train
          manage booking...
        </div>
      </main>
    );
  }

  if (
    !booking ||
    !payload
  ) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] px-3 py-6 md:px-4 md:py-10">
        <div className="mx-auto max-w-[1440px] rounded-[20px] border border-black/5 bg-white p-4 shadow-[0_10px_34px_rgba(15,23,42,0.05)] md:rounded-[28px] md:p-8">
          <h1 className="break-words text-xl font-bold text-[#111827]">
            Train booking not
            found
          </h1>
        </div>
      </main>
    );
  }

  return (
    <TrainManageLayout
      activeTab={activeTab}
      onTabChange={
        setActiveTab
      }
      bookingId={booking.id}
      trainName={`${trainName} (${trainNumber})`}
      routeLabel={route}
      journeyDateLabel={formatDateOnly(
        journeyDate
      )}
      pnrLabel={pnrNumber}
      classLabel={coachClass}
      travellersLabel={`${travellers.length} Traveller`}
    >
      {activeTab ===
        "summary" && (
        <TrainManageSummary
          bookingStatus={
            booking.status
          }
          bookedAt={
            booking.bookingDate
          }
          trainName={
            trainName
          }
          trainNumber={
            trainNumber
          }
          route={route}
          boardingStation={
            boardingStation
          }
          destinationStation={
            destinationStation
          }
          journeyDate={formatDateOnly(
            journeyDate
          )}
          departureTime={
            departureTime
          }
          arrivalTime={
            arrivalTime
          }
          coachClass={
            coachClass
          }
          quota={quota}
          pnrNumber={
            pnrNumber
          }
          travellersLabel={`${travellers.length} Traveller`}
          fareSummary={
            fareSummary
          }
          totalAmount={Number(
            payload
              ?.paymentData
              ?.totalPaid ||
              fare?.totalPaid ||
              fare?.totalAmount ||
              booking.amount ||
              0
          )}
        />
      )}

      {activeTab ===
        "traveller-details" && (
        <TrainManageTravellerDetails
          travellers={
            travellers
          }
          onChange={
            setTravellers
          }
          onSave={
            handleSaveTravellers
          }
        />
      )}

      {activeTab ===
        "contact-details" && (
        <TrainManageContactDetails
          contact={contact}
          onChange={
            setContact
          }
          onSave={
            handleSaveContact
          }
        />
      )}

      {activeTab ===
        "special-request" && (
        <TrainManageSpecialRequest
          value={
            specialRequest
          }
          onChange={
            setSpecialRequest
          }
          onSave={
            handleSaveSpecialRequest
          }
        />
      )}

      {activeTab ===
        "seat-addons" && (
        <TrainManageSeatAddons
          currentClassName={
            coachClass
          }
          travellers={
            travellers.length ||
            1
          }
          selectedSeat={
            currentSeat
          }
          variants={
            Array.isArray(
              payload?.seatVariants
            )
              ? payload.seatVariants
              : []
          }
          activeVariantId={
            activeSeatVariant?.id
          }
          onVariantChange={
            setActiveSeatVariant
          }
          quote={seatQuote}
          onContinue={
            handleSeatContinue
          }
        />
      )}
    </TrainManageLayout>
  );
}

export default function TrainManagePage() {
  return (
    <Suspense fallback={<div />}>
      <TrainManagePageContent />
    </Suspense>
  );
}
