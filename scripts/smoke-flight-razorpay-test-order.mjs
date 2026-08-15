#!/usr/bin/env node

const API_BASE_URL = readEnv("API_BASE_URL", "http://127.0.0.1:4000").replace(/\/+$/, "");
const EXPECT_GATEWAY = readEnv("EXPECT_GATEWAY", "mock");
const EXPECT_CHECKOUT = readEnv("EXPECT_CHECKOUT", EXPECT_GATEWAY === "razorpay" ? "present" : "absent");
const RUN_ID = readEnv("SMOKE_RUN_ID", createRunId());

const searchBody = readJsonEnv("FLIGHT_SEARCH_BODY", {
  tripType: "oneway",
  origin: "DEL",
  destination: "BOM",
  departureDate: nextIsoDate(14),
  adults: 1,
  children: 0,
  infants: 0,
  cabinClass: "Economy",
  currency: "INR",
  nonStop: false,
  maxResults: 5
});

main().catch((error) => {
  console.error("SMOKE_FAILED");
  console.error(redactMessage(error instanceof Error ? error.message : String(error)));
  process.exit(1);
});

async function main() {
  console.log("FLIGHT_TEST_ORDER_SMOKE_START");
  console.log(maskedSummary({ apiBase: API_BASE_URL, expectGateway: EXPECT_GATEWAY, expectCheckout: EXPECT_CHECKOUT, runId: RUN_ID }));

  const search = await postJson("/api/v1/flights/search", searchBody);
  const searchId = requireValue("searchId", findFirstKey(search.body, ["searchId", "search_id"]));
  const offer = requireValue("offer", findFirstOffer(search.body));
  const offerId = requireValue("offerId", findFirstKey(offer, ["offerId", "offer_id", "id"]));
  const fareId = findFirstKey(offer, ["fareId", "fare_id"]);
  const passengers = normalizePassengerCounts(searchBody);
  const total = requireValue("total", findMoneyValue(offer));
  const currency = requireValue("currency", findFirstKey(offer, ["currency", "currencyCode"]) || "INR");

  console.log("search_ok");
  console.log(maskedSummary({ searchId, offerId, fareId, passengers, total, currency }));

  const price = await postJson(`/api/v1/flights/offers/${encodeURIComponent(offerId)}/price`, {
    searchId,
    ...(fareId ? { fareId } : {}),
    passengers,
    currency,
    clientOfferSnapshot: {
      total: Number(total),
      currency
    },
    ...readJsonEnv("FLIGHT_PRICE_BODY_EXTRA", {})
  });

  const priceConfirmationId = requireValue("priceConfirmationId", findFirstKey(price.body, [
    "priceConfirmationId",
    "price_confirmation_id",
    "pricingId",
    "pricedOfferId"
  ]));
  const pricedTotal = findMoneyValue(price.body) || total;
  const pricedCurrency = findFirstKey(price.body, ["currency", "currencyCode"]) || currency;

  console.log("price_confirm_ok");
  console.log(maskedSummary({ priceConfirmationId, total: pricedTotal, currency: pricedCurrency }));

  const simulateBody = readJsonEnv("FLIGHT_SIMULATE_BODY", {
    searchId,
    offerId,
    ...(fareId ? { fareId } : {}),
    priceConfirmationId,
    passengers,
    travellers: buildFrontendTravellers(passengers),
    contactDetails: readJsonEnv("FLIGHT_CONTACT_DETAILS", {
      countryCode: "+91",
      mobile: "9999999999",
      email: "guest@example.com"
    }),
    clientPricingSnapshot: {
      total: Number(pricedTotal),
      currency: pricedCurrency
    },
    idempotencyKey: `flight-sim:${priceConfirmationId}:${EXPECT_GATEWAY}:${RUN_ID}`,
    ...readJsonEnv("FLIGHT_SIMULATE_BODY_EXTRA", {})
  });

  requireValue("simulate.passengers", simulateBody.passengers);
  requireValue("simulate.travellers", simulateBody.travellers);
  requireValue("simulate.contactDetails", simulateBody.contactDetails);

  const simulate = await postJson("/api/v1/flights/bookings/simulate", simulateBody);
  const bookingDraftId = requireValue("bookingDraftId", findFirstKey(simulate.body, [
    "bookingDraftId",
    "booking_draft_id",
    "draftBookingId",
    "draftId",
    "id"
  ]));
  const simulationPriceConfirmationId = findFirstKey(simulate.body, ["priceConfirmationId"]) || priceConfirmationId;

  console.log("simulate_ok");
  console.log(maskedSummary({ bookingDraftId, priceConfirmationId: simulationPriceConfirmationId }));

  const testOrder = await postJson(
    `/api/v1/flights/bookings/${encodeURIComponent(bookingDraftId)}/payment/test-order`,
    {
      amount: Number(pricedTotal),
      currency: pricedCurrency,
      paymentMethod: EXPECT_GATEWAY === "razorpay" ? "razorpay" : "mock",
      contactDetails: {
        mobile: simulateBody.contactDetails.mobile,
        email: simulateBody.contactDetails.email
      },
      idempotencyKey: `flight:test-order:${bookingDraftId}:${simulationPriceConfirmationId}:${EXPECT_GATEWAY}:${RUN_ID}`,
      ...readJsonEnv("FLIGHT_TEST_ORDER_BODY_EXTRA", {})
    }
  );

  const checkout = findFirstKey(testOrder.body, ["checkout"]);
  const result = {
    gateway: findFirstKey(testOrder.body, ["gateway", "paymentGateway"]),
    checkoutPresent: Boolean(checkout && typeof checkout === "object"),
    checkoutProvider: checkout?.provider,
    checkoutMode: checkout?.mode,
    checkoutTestOnly: checkout?.testOnly,
    checkoutOrderIdPresent: Boolean(checkout?.orderId),
    checkoutPublicKeyConfigured: Boolean(checkout?.keyId),
    amount: findMoneyValue(testOrder.body),
    currency: findFirstKey(testOrder.body, ["currency", "currencyCode"])
  };

  assertEqual("gateway", result.gateway, EXPECT_GATEWAY);

  if (EXPECT_CHECKOUT === "absent") {
    assertEqual("checkoutPresent", result.checkoutPresent, false);
  } else {
    assertEqual("checkoutPresent", result.checkoutPresent, true);
    assertEqual("checkout.provider", result.checkoutProvider, "razorpay");
    assertEqual("checkout.mode", result.checkoutMode, "test");
    assertEqual("checkout.testOnly", result.checkoutTestOnly, true);
    requireValue("checkout.orderId", checkout?.orderId);
    requireValue("checkout.keyId", checkout?.keyId);
  }

  console.log("test_order_ok");
  console.log(maskedSummary(result));
  console.log("FLIGHT_TEST_ORDER_SMOKE_PASS");
}

async function postJson(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json"
    },
    body: JSON.stringify(body)
  });

  const text = await response.text();
  const parsed = parseJson(text);

  if (!response.ok) {
    throw new Error(JSON.stringify(redact({
      path,
      status: response.status,
      amount: findMoneyValue(parsed),
      currency: findFirstKey(parsed, ["currency", "currencyCode"]),
      receiptLength: String(findFirstKey(parsed, ["receipt"]) || "").length || undefined,
      providerCode: findFirstKey(parsed, ["code", "errorCode", "providerCode"]),
      providerDescription: findFirstKey(parsed, ["description", "message", "errorDescription"])
    }), null, 2));
  }

  console.log(`${path} status=${response.status}`);
  return { status: response.status, body: parsed };
}

function normalizePassengerCounts(value) {
  const nested = value?.passengers && typeof value.passengers === "object" ? value.passengers : value;
  return {
    adults: Math.max(Number(nested?.adults || 1), 1),
    children: Math.max(Number(nested?.children || 0), 0),
    infants: Math.max(Number(nested?.infants || 0), 0)
  };
}

function buildFrontendTravellers(passengers) {
  const supplied = readJsonEnv("FLIGHT_TRAVELLERS", null);
  if (Array.isArray(supplied) && supplied.length) return supplied;

  const types = [
    ...Array.from({ length: passengers.adults }, () => "adult"),
    ...Array.from({ length: passengers.children }, () => "child"),
    ...Array.from({ length: passengers.infants }, () => "infant")
  ];

  return types.map((type, index) => ({
    type,
    title: type === "adult" ? "Mr" : "Master",
    firstName: `Traveller${index + 1}`,
    lastName: ".",
    ...(type !== "adult" ? { dateOfBirth: "2018-01-01" } : {}),
    gender: "M",
    nationality: "IN"
  }));
}

function findFirstOffer(root) {
  const containers = [];
  walk(root, (value, key) => {
    if (Array.isArray(value) && ["offers", "items", "results", "flights", "data"].includes(key)) {
      containers.push(value);
    }
  });

  for (const container of containers) {
    const offer = container.find((item) => item && typeof item === "object" && findFirstKey(item, [
      "offerId",
      "offer_id",
      "id"
    ]));
    if (offer) return offer;
  }
}

function findMoneyValue(root) {
  const direct = findFirstKey(root, ["total", "grandTotal", "totalAmount", "amount"]);
  if (typeof direct === "number" || typeof direct === "string") return direct;
  if (direct && typeof direct === "object") {
    return findFirstKey(direct, ["amount", "value", "total"]);
  }
  return undefined;
}

function findFirstKey(root, names) {
  let found;
  walk(root, (value, key) => {
    if (found !== undefined) return;
    if (names.includes(key) && value !== undefined && value !== null && value !== "") {
      found = value;
    }
  });
  return found;
}

function walk(value, visit, key = "") {
  visit(value, key);
  if (Array.isArray(value)) {
    value.forEach((item) => walk(item, visit, key));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [childKey, childValue] of Object.entries(value)) {
    walk(childValue, visit, childKey);
  }
}

function readEnv(name, fallback) {
  return process.env[name] || fallback;
}

function readJsonEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`${name} must be valid JSON: ${error.message}`);
  }
}

function parseJson(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { nonJsonBodyLength: text.length };
  }
}

function requireValue(name, value) {
  if (value === undefined || value === null || value === "") {
    throw new Error(`${name} missing`);
  }
  if (Array.isArray(value) && value.length === 0) {
    throw new Error(`${name} empty`);
  }
  return value;
}

function assertEqual(name, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${name} expected ${JSON.stringify(expected)} got ${JSON.stringify(actual)}`);
  }
}

function maskedSummary(value) {
  return JSON.stringify(redact(value), null, 2);
}

function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (!value || typeof value !== "object") return value;

  const output = {};
  for (const [key, child] of Object.entries(value)) {
    if (/secret|signature|webhook|raw|providerOfferRef|providerPayload|token/i.test(key)) {
      output[key] = "[redacted]";
    } else if (/keyId/i.test(key)) {
      output[key] = maskPublicKey(child);
    } else {
      output[key] = redact(child);
    }
  }
  return output;
}

function maskPublicKey(value) {
  if (!value) return value;
  const text = String(value);
  if (text.length <= 8) return "***";
  return `${text.slice(0, 8)}...${text.slice(-4)}`;
}

function redactMessage(message) {
  return message
    .replace(/rzp_(?:live|test)_[A-Za-z0-9]+/g, (match) => maskPublicKey(match))
    .replace(/(["']?(?:secret|signature|webhookSecret|token)["']?\s*[:=]\s*["']?)[^"',\s}]+/gi, "$1[redacted]");
}

function nextIsoDate(daysFromNow) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

function createRunId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
