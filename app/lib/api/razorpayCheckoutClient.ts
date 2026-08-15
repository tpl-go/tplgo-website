import type { BackendFlightRazorpayTestCheckout } from "./flightTestPaymentApi";

type RazorpayCheckoutResponse = {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: "INR";
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  handler: (response: RazorpayCheckoutResponse) => void;
};

type RazorpayCheckoutInstance = {
  open: () => void;
};

type RazorpayConstructor = new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const RAZORPAY_CHECKOUT_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

let razorpayScriptPromise: Promise<void> | null = null;

export type RazorpayTestCheckoutResult = {
  gatewayPaymentId: string;
  gatewayOrderId: string;
  gatewaySignature: string;
};

export function isRazorpayTestCheckoutEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_TEST_ENABLED === "true" &&
    process.env.NEXT_PUBLIC_RAZORPAY_CHECKOUT_ENABLED === "true"
  );
}

export function isValidRazorpayTestCheckoutPayload(
  checkout: BackendFlightRazorpayTestCheckout | undefined
): checkout is BackendFlightRazorpayTestCheckout {
  if (!checkout) return false;

  const gatewayOrderId = getCheckoutOrderId(checkout);
  const amountMinor = getCheckoutAmountMinor(checkout);

  return Boolean(
    checkout.provider === "razorpay" &&
      checkout.mode === "test" &&
      checkout.testOnly === true &&
      checkout.keyId &&
      gatewayOrderId &&
      amountMinor > 0 &&
      checkout.currency === "INR"
  );
}

export async function openRazorpayTestCheckout(
  checkout: BackendFlightRazorpayTestCheckout
): Promise<RazorpayTestCheckoutResult> {
  if (!isRazorpayTestCheckoutEnabled()) {
    throw new Error("Razorpay test checkout is disabled.");
  }
  if (!isValidRazorpayTestCheckoutPayload(checkout)) {
    throw new Error("Invalid Razorpay test checkout payload.");
  }
  if (typeof window === "undefined") {
    throw new Error("Razorpay checkout can only run in a browser.");
  }

  await loadRazorpayCheckoutScript();

  if (!window.Razorpay) {
    throw new Error("Razorpay checkout script did not initialize.");
  }
  const Razorpay = window.Razorpay;

  return new Promise((resolve, reject) => {
    let settled = false;
    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      reject(new Error(message));
    };

    const gatewayOrderId = getCheckoutOrderId(checkout);
    const amountMinor = getCheckoutAmountMinor(checkout);

    prepareRazorpayViewport();

    const razorpay = new Razorpay({
      key: checkout.keyId,
      amount: amountMinor,
      currency: checkout.currency,
      name: checkout.name,
      description: checkout.description,
      order_id: gatewayOrderId,
      prefill: checkout.prefill,
      notes: sanitizeCheckoutNotes(checkout.notes),
      theme: {
        color: "#ef4444",
      },
      modal: {
        ondismiss: () => fail("Razorpay test checkout was cancelled."),
      },
      handler: (response) => {
        if (settled) return;
        if (
          !response.razorpay_payment_id ||
          !response.razorpay_order_id ||
          !response.razorpay_signature
        ) {
          fail("Razorpay test checkout returned an incomplete confirmation.");
          return;
        }
        settled = true;
        resolve({
          gatewayPaymentId: response.razorpay_payment_id,
          gatewayOrderId: response.razorpay_order_id,
          gatewaySignature: response.razorpay_signature,
        });
      },
    });

    razorpay.open();
  });
}

function prepareRazorpayViewport() {
  if (typeof document === "undefined") return;

  document.documentElement.style.overflowX = "hidden";
  document.body.style.overflowX = "hidden";
  document.body.style.overflowY = "auto";
  document.body.style.maxWidth = "100vw";
}

function getCheckoutOrderId(checkout: BackendFlightRazorpayTestCheckout): string {
  return String(checkout.gatewayOrderId || checkout.orderId || "").trim();
}

function getCheckoutAmountMinor(checkout: BackendFlightRazorpayTestCheckout): number {
  const amountMinor = Number(checkout.amountMinor || 0);
  if (Number.isFinite(amountMinor) && amountMinor > 0) return amountMinor;

  const amount = Number(checkout.amount || 0);
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount) : 0;
}

function sanitizeCheckoutNotes(notes: BackendFlightRazorpayTestCheckout["notes"]): Record<string, string> {
  const safeNotes: Record<string, string> = {
    testOnly: "true",
    source: "tpl_flight_test_checkout",
  };

  if (!notes) return safeNotes;

  for (const [key, value] of Object.entries(notes)) {
    if (typeof value === "string" && key.length <= 40 && value.length <= 120) {
      safeNotes[key] = value;
    }
  }

  return safeNotes;
}

function loadRazorpayCheckoutScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay checkout can only run in a browser."));
  }
  if (window.Razorpay) return Promise.resolve();
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_CHECKOUT_SCRIPT_URL}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay checkout.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout."));
    document.head.appendChild(script);
  });

  return razorpayScriptPromise;
}
