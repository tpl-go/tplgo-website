import assert from "node:assert/strict";
import test from "node:test";
import { getCreatorAsset } from "./creatorCatalogService";
import { buildCreatorCheckoutPreview } from "./creatorCartPricing";
import type { CreatorCartState } from "./creatorCartTypes";
import { createCreatorOrderPreview } from "./creatorOrderOrchestration";
import { canTransitionCreatorPayment } from "./creatorPaymentState";
import { listCreatorPaymentProviderContracts } from "./creatorPaymentProviders";
import { createCreatorPaymentPreview } from "./creatorPaymentPreviewService";

function buildCart(): CreatorCartState {
  const asset = getCreatorAsset("cinematic-ladakh-drone-pack");
  assert.ok(asset);
  const licenseOption = asset.licenseOptions.find((option) => option.type === "commercial");
  assert.ok(licenseOption);

  return {
    id: "payment-test-cart",
    schemaVersion: 1,
    persistence: "session",
    updatedAt: "2026-01-01T00:00:00.000Z",
    items: [
      {
        id: "asset:cinematic-ladakh-drone-pack:commercial",
        itemType: "asset",
        assetSlug: asset.slug,
        title: asset.title,
        creatorSlug: asset.creatorSlug,
        creatorName: asset.creatorName,
        selectedLicense: "commercial",
        licenseOption,
        quantity: 1,
        unitPrice: licenseOption.price,
        currency: "INR",
        source: "manual",
      },
    ],
  };
}

function buildDraftOrder() {
  const checkoutPreview = buildCreatorCheckoutPreview(buildCart());
  return createCreatorOrderPreview({ checkoutPreview, buyerUserId: "buyer-1", idempotencySeed: "payment-seed" }).draftOrder;
}

test("Creator payment state machine exposes preview transitions", () => {
  assert.equal(canTransitionCreatorPayment("draft", "intent_created"), true);
  assert.equal(canTransitionCreatorPayment("intent_created", "awaiting_payment"), true);
  assert.equal(canTransitionCreatorPayment("payment_authorized", "payment_captured"), true);
  assert.equal(canTransitionCreatorPayment("refund_pending", "refund_completed"), true);
  assert.equal(canTransitionCreatorPayment("payment_captured", "payment_processing"), false);
});

test("Creator payment provider abstraction is UPP-compatible and disabled", () => {
  const providers = listCreatorPaymentProviderContracts();
  assert.deepEqual(
    providers.map((provider) => provider.provider),
    ["stripe", "razorpay", "cashfree", "paypal", "manual", "mock"]
  );
  assert.ok(providers.every((provider) => provider.uppCompatible));
  assert.ok(providers.every((provider) => provider.apiCallAllowed === false));
  assert.ok(providers.every((provider) => provider.credentialRequired === false));
});

test("Creator payment preview builds intent, session, retry and invoice readiness", () => {
  const payment = createCreatorPaymentPreview({ draftOrder: buildDraftOrder(), provider: "mock", paymentMethod: "mock" });

  assert.equal(payment.intent.status, "intent_created");
  assert.equal(payment.session.status, "awaiting_payment");
  assert.equal(payment.session.retryPolicy.retryAllowed, true);
  assert.equal(payment.session.cancellationPolicy.providerCancellationAllowed, false);
  assert.equal(payment.invoice.invoiceStatus, "preview_only");
  assert.equal(payment.invoice.pdfGenerated, false);
});

test("Creator payment validation keeps feature flags and transactions disabled", () => {
  const payment = createCreatorPaymentPreview({ draftOrder: buildDraftOrder() });

  assert.ok(payment.validationIssues.some((issue) => issue.code === "payment_engine_disabled"));
  assert.ok(payment.validationIssues.some((issue) => issue.code === "provider_disabled"));
  assert.equal(payment.paymentExecutionAllowed, false);
  assert.equal(payment.walletMutationAllowed, false);
  assert.equal(payment.orderPersistenceAllowed, false);
  assert.equal(payment.entitlementActivationAllowed, false);
  assert.equal(payment.downloadAllowed, false);
});

test("Creator payment events and notifications are contract-only", () => {
  const payment = createCreatorPaymentPreview({ draftOrder: buildDraftOrder(), provider: "razorpay", paymentMethod: "upi" });

  assert.ok(payment.events.some((event) => event.eventType === "creator.payment.intent.created"));
  assert.ok(payment.events.every((event) => event.publishAllowed === false));
  assert.ok(payment.notifications.some((notification) => notification.notificationType === "creator.payment.pending"));
  assert.ok(payment.notifications.every((notification) => notification.sendAllowed === false));
  assert.equal(payment.intent.providerContract.provider, "razorpay");
  assert.equal(payment.intent.providerCallAllowed, false);
});
