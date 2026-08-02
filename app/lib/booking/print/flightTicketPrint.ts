"use client";

import { openPrintWindowAndPrint } from "@/app/lib/booking/print/core";

type AnyObj = Record<string, any>;

function safe(value: any, fallback = "-") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function formatDateTime(value: any) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDateOnly(value: any) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(value: any) {
  const amount = Number(value || 0);
  return `₹${amount.toLocaleString("en-IN")}`;
}

function buildTravellerName(traveller: AnyObj) {
  return `${traveller?.title || ""} ${traveller?.firstName || ""} ${
    traveller?.lastName || ""
  }`
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(value: any) {
  return String(value || "").toLowerCase().replace(/\s+/g, "").trim();
}

function getTravellerKeys(traveller: AnyObj, index: number) {
  const name = buildTravellerName(traveller);

  return [
    traveller?.id,
    traveller?.travellerId,
    traveller?.passengerId,
    traveller?.key,
    traveller?.mobile,
    traveller?.email,
    name,
    normalize(name),
    String(index),
    index,
  ].filter((item) => item !== undefined && item !== null && item !== "");
}

function pickFromAnyShape(source: any, traveller: AnyObj, index: number) {
  if (!source) return null;

  const keys = getTravellerKeys(traveller, index);

  if (Array.isArray(source)) {
    return source[index] || source.find((item: AnyObj) => {
      const itemName = buildTravellerName(item);
      return keys.some(
        (key) =>
          item?.id === key ||
          item?.travellerId === key ||
          item?.passengerId === key ||
          item?.mobile === key ||
          item?.email === key ||
          normalize(itemName) === normalize(key)
      );
    });
  }

  if (typeof source === "object") {
    for (const key of keys) {
      if (source[key as any]) return source[key as any];
    }

    const values = Object.values(source);

    return values.find((item: any) => {
      if (!item || typeof item !== "object") return false;

      const itemName = buildTravellerName(item);
      return keys.some(
        (key) =>
          item?.id === key ||
          item?.travellerId === key ||
          item?.passengerId === key ||
          item?.mobile === key ||
          item?.email === key ||
          normalize(itemName) === normalize(key)
      );
    });
  }

  return null;
}

function resolveSeat(seatMealData: AnyObj, traveller: AnyObj, index: number) {
  const directTravellerSeat =
    traveller?.seat ||
    traveller?.seatNumber ||
    traveller?.selectedSeat ||
    traveller?.selectedSeatNumber;

  if (directTravellerSeat) return directTravellerSeat;

  const sources = [
    seatMealData?.selectedSeats,
    seatMealData?.seats,
    seatMealData?.seatSelections,
    seatMealData?.travellerSeats,
    seatMealData?.passengerSeats,
    seatMealData?.seatMap,
  ];

  for (const source of sources) {
    const item = pickFromAnyShape(source, traveller, index);

    const value =
      item?.seatNumber ||
      item?.seatNo ||
      item?.seat ||
      item?.label ||
      item?.name ||
      item?.code ||
      item?.value;

    if (value) return value;
  }

  return "-";
}

function resolveMeal(seatMealData: AnyObj, traveller: AnyObj, index: number) {
  const directTravellerMeal =
    traveller?.meal ||
    traveller?.mealName ||
    traveller?.selectedMeal ||
    traveller?.selectedMealName;

  if (directTravellerMeal) return directTravellerMeal;

  const sources = [
    seatMealData?.selectedMeals,
    seatMealData?.meals,
    seatMealData?.mealSelections,
    seatMealData?.travellerMeals,
    seatMealData?.passengerMeals,
    seatMealData?.mealMap,
  ];

  for (const source of sources) {
    const item = pickFromAnyShape(source, traveller, index);

    const value =
      item?.mealName ||
      item?.mealTitle ||
      item?.meal ||
      item?.title ||
      item?.label ||
      item?.name ||
      item?.code ||
      item?.value;

    if (value) return value;
  }

  return "-";
}

function buildRouteCards(reviewData: AnyObj) {
  const journeys = reviewData?.journeys || [];

  return journeys
    .map((journey: AnyObj, journeyIndex: number) => {
      const segments = journey?.segments || [];

      return segments
        .map((segment: AnyObj, segmentIndex: number) => {
          const fromCode = safe(segment?.fromCode || segment?.from, "ORG");
          const toCode = safe(segment?.toCode || segment?.to, "DST");

          return `
            <div class="route-card">
              <div class="route-top">
                <div>
                  <div class="route-airline">${safe(segment?.airline, "Flight")}</div>
                  <div class="route-flight">${safe(segment?.flightNumber, "-")}</div>
                </div>
                <div class="label">Journey ${journeyIndex + 1} • Segment ${segmentIndex + 1}</div>
              </div>

              <div class="route-grid">
                <div class="route-point">
                  <div class="route-code">${fromCode}</div>
                  <div class="route-city">${safe(segment?.from, "-")}</div>
                  <div class="route-time">${safe(segment?.departureTime, "-")}</div>
                  <div class="label">${formatDateOnly(segment?.departureDate)}</div>
                </div>

                <div class="route-arrow">✈</div>

                <div class="route-point" style="text-align:right;">
                  <div class="route-code">${toCode}</div>
                  <div class="route-city">${safe(segment?.to, "-")}</div>
                  <div class="route-time">${safe(segment?.arrivalTime, "-")}</div>
                  <div class="label">${formatDateOnly(segment?.arrivalDate || segment?.departureDate)}</div>
                </div>
              </div>
            </div>
          `;
        })
        .join("");
    })
    .join("");
}

function buildPassengerRows(travellerValidation: AnyObj, seatMealData: AnyObj) {
  const travellers = travellerValidation?.travellers || [];

  if (!travellers.length) {
    return `
      <tr>
        <td colspan="5">No passenger details available.</td>
      </tr>
    `;
  }

  return travellers
    .map((traveller: AnyObj, index: number) => {
      const fullName = buildTravellerName(traveller);

      const seat = resolveSeat(seatMealData, traveller, index);
      const meal = resolveMeal(seatMealData, traveller, index);

      return `
        <tr>
          <td>${safe(fullName, "Traveller")}</td>
          <td>${safe(traveller?.gender, "-")}</td>
          <td>${safe(traveller?.type || traveller?.travellerType, "-")}</td>
          <td>${safe(seat, "-")}</td>
          <td>${safe(meal, "-")}</td>
        </tr>
      `;
    })
    .join("");
}

function buildFareRows(priceBreakup: AnyObj) {
  const rows = [
    ["Base Fare", priceBreakup?.baseFare || 0],
    ["Tax", priceBreakup?.tax || 0],
    ["Surcharge", priceBreakup?.surcharge || 0],
    ["Seat Charges", priceBreakup?.seatTotal || 0],
    ["Meal Charges", priceBreakup?.mealTotal || 0],
    ["Cab Add-on", priceBreakup?.cabTotal || 0],
    ["Insurance", priceBreakup?.insuranceTotal || 0],
    ["Other Add-ons", priceBreakup?.addonsTotal || 0],
    ["Offer Discount", -(priceBreakup?.appliedOffer || 0)],
    ["Discount", -(priceBreakup?.discount || 0)],
    ["TPL Credit", -(priceBreakup?.tplCredit || 0)],
  ];

  return rows
    .filter(([, value]) => Number(value) !== 0)
    .map(
      ([label, value]) => `
        <div class="fare-row">
          <span>${label}</span>
          <span>${Number(value) < 0 ? `- ${formatPrice(Math.abs(Number(value)))}` : formatPrice(value)}</span>
        </div>
      `
    )
    .join("");
}

export function printFlightTicketFromConfirmation(params: {
  bookingId: string;
  data: AnyObj;
  priceBreakup: AnyObj;
}) {
  const { bookingId, data, priceBreakup } = params;

  const reviewData = data?.reviewData || {};
  const travellerValidation = data?.travellerValidation || {};
  const paymentData = data?.paymentData || {};
  const seatMealData = data?.seatMealData || {};
  const contact = travellerValidation?.contactDetails || {};
  const isBackendTestBooking = Boolean(
    data?.backendTestPaymentConfirmation ||
      data?.backendSimulation ||
      data?.supplierBookingDisabled === true ||
      data?.testStatus === "TPL_TEST_BOOKING_CONFIRMED"
  );

  const firstJourney = reviewData?.journeys?.[0];
  const firstSegment = firstJourney?.segments?.[0];
  const lastJourney = reviewData?.journeys?.[reviewData?.journeys?.length - 1];
  const lastSegment =
    lastJourney?.segments?.[lastJourney?.segments?.length - 1] || firstSegment;

  const routeTitle =
    reviewData?.bookingType === "roundTrip"
      ? `${safe(firstSegment?.fromCode || firstSegment?.from, "ORG")} → ${safe(
          firstSegment?.toCode || firstSegment?.to,
          "DST"
        )} → ${safe(lastSegment?.toCode || lastSegment?.to, "ORG")}`
      : reviewData?.bookingType === "multiCity"
      ? "Multi City Flight Booking"
      : `${safe(firstSegment?.fromCode || firstSegment?.from, "ORG")} → ${safe(
          firstSegment?.toCode || firstSegment?.to,
          "DST"
        )}`;

  const html = `
    <div class="ticket-shell">
      <div class="ticket-top">
          <div class="brand-row">
            <div class="brand">TPL</div>
          <div class="status-pill">${isBackendTestBooking ? "Test Confirmation" : "Booking Confirmed"}</div>
        </div>

        <div class="title">${routeTitle}</div>
        <div class="subtitle">
          Booking ID: ${bookingId} • Booked On: ${formatDateTime(
            paymentData?.paidAt || new Date().toISOString()
          )}
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">Booking Summary</h3>
        <div class="grid-3">
          <div class="info-card">
            <div class="label">Booking Type</div>
            <div class="value">${safe(reviewData?.bookingType, "-")}</div>
          </div>
          <div class="info-card">
            <div class="label">Trip Mode</div>
            <div class="value">${safe(reviewData?.tripMode, "-")}</div>
          </div>
          <div class="info-card">
            <div class="label">Cabin Class</div>
            <div class="value">${safe(reviewData?.cabinClass, "-")}</div>
          </div>
        </div>
      </div>

      ${
        isBackendTestBooking
          ? `<div class="section">
              <div class="footer-note">
                TPL test/simulation confirmation only. Supplier booking, PNR,
                ticketing, live payment capture, cancellation, and refund
                execution are disabled. PNR: Not issued in test mode. Ticket:
                Not issued in test mode.
              </div>
            </div>`
          : ""
      }

      <div class="section">
        <h3 class="section-title">Journey Details</h3>
        <div style="display:grid; gap:14px;">
          ${buildRouteCards(reviewData)}
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">Passenger Details</h3>
        <table class="passenger-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Gender</th>
              <th>Type</th>
              <th>Seat</th>
              <th>Meal</th>
            </tr>
          </thead>
          <tbody>
            ${buildPassengerRows(travellerValidation, seatMealData)}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h3 class="section-title">Contact Details</h3>
        <div class="grid-2">
          <div class="info-card">
            <div class="label">Email</div>
            <div class="value">${safe(contact?.email, "-")}</div>
          </div>
          <div class="info-card">
            <div class="label">Mobile</div>
            <div class="value">${contact?.mobile ? `${safe(contact?.countryCode, "+91")} ${contact?.mobile}` : "-"}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">Fare Summary</h3>
        <div class="fare-box">
          ${buildFareRows(priceBreakup)}
          <div class="fare-row fare-total">
            <span>Total Paid</span>
            <span>${formatPrice(priceBreakup?.totalAmount || 0)}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="footer-note">
          Keep this ${isBackendTestBooking ? "test confirmation summary" : "ticket"} with your booking ID for support and future retrieval.
          Please verify flight timings and airline rules before departure.
        </div>
      </div>
    </div>
  `;

  openPrintWindowAndPrint({
    title: `${bookingId} - Flight Ticket`,
    html,
  });
}
