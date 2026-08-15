import assert from "node:assert/strict";
import test from "node:test";
import { getCreatorAsset } from "./creatorCatalogService";
import { buildCreatorCheckoutPreview } from "./creatorCartPricing";
import type { CreatorCartState } from "./creatorCartTypes";
import { createCreatorOrderPreview } from "./creatorOrderOrchestration";
import { canTransitionCreatorOrder } from "./creatorOrderState";

function requireAsset(slug: string) {
  const asset = getCreatorAsset(slug);
  assert.ok(asset, `Expected Creator asset ${slug}`);
  return asset;
}

function buildCart(): CreatorCartState {
  const asset = requireAsset("cinematic-ladakh-drone-pack");
  const licenseOption = asset.licenseOptions.find((option) => option.type === "commercial");
  assert.ok(licenseOption);

  return {
    id: "test-cart",
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
        previewQuery: asset.previewQuery,
      },
    ],
  };
}

test("Creator order state machine exposes preview lifecycle transitions", () => {
  assert.equal(canTransitionCreatorOrder("draft", "checkout_preview"), true);
  assert.equal(canTransitionCreatorOrder("checkout_preview", "validation_pending"), true);
  assert.equal(canTransitionCreatorOrder("payment_processing", "payment_confirmed"), true);
  assert.equal(canTransitionCreatorOrder("completed", "payment_pending"), false);
});

test("Creator order orchestration builds preview-only draft order and validation issues", () => {
  const checkoutPreview = buildCreatorCheckoutPreview(buildCart());
  const result = createCreatorOrderPreview({ checkoutPreview, buyerUserId: "buyer-1", idempotencySeed: "seed-1" });

  assert.equal(result.draftOrder.state, "draft");
  assert.equal(result.draftOrder.assetItems.length, 1);
  assert.equal(result.draftOrder.pricingSnapshot.grandTotal, 5999);
  assert.ok(result.draftOrder.validationIssues.some((issue) => issue.code === "order_engine_disabled"));
  assert.ok(result.draftOrder.validationIssues.some((issue) => issue.code === "transaction_engine_disabled"));
});

test("Creator order orchestration prepares idempotency, retry and rollback metadata", () => {
  const checkoutPreview = buildCreatorCheckoutPreview(buildCart());
  const first = createCreatorOrderPreview({ checkoutPreview, buyerUserId: "buyer-1", idempotencySeed: "same-seed" });
  const second = createCreatorOrderPreview({ checkoutPreview, buyerUserId: "buyer-1", idempotencySeed: "same-seed" });

  assert.equal(first.draftOrder.idempotency.idempotencyKey, second.draftOrder.idempotency.idempotencyKey);
  assert.equal(first.draftOrder.idempotency.conflictPolicy, "same_key_different_hash_rejected");
  assert.equal(first.draftOrder.retryPolicy.retryAllowed, true);
  assert.equal(first.draftOrder.rollbackPolicy.rollbackAllowed, true);
  assert.equal(first.draftOrder.rollbackPolicy.mutationRollbackRequired, false);
});

test("Creator order payment, event and notification contracts remain disabled", () => {
  const checkoutPreview = buildCreatorCheckoutPreview(buildCart());
  const result = createCreatorOrderPreview({ checkoutPreview, buyerUserId: "buyer-1" });

  assert.equal(result.draftOrder.paymentPreview.gatewayCallAllowed, false);
  assert.equal(result.draftOrder.paymentPreview.walletMutationAllowed, false);
  assert.equal(result.draftOrder.paymentPreview.paymentCreationAllowed, false);
  assert.equal(result.draftOrder.paymentResponsePreview.paymentStatus, "preview_only");
  assert.ok(result.draftOrder.events.every((event) => event.publishAllowed === false));
  assert.ok(result.draftOrder.notifications.every((notification) => notification.sendAllowed === false));
});

test("Creator order transaction permissions remain fully disabled", () => {
  const checkoutPreview = buildCreatorCheckoutPreview(buildCart());
  const result = createCreatorOrderPreview({ checkoutPreview, buyerUserId: "buyer-1" });

  assert.deepEqual(result.draftOrder.transactionPermissions, {
    checkoutAllowed: false,
    paymentAllowed: false,
    orderPersistenceAllowed: false,
    entitlementActivationAllowed: false,
    downloadAllowed: false,
    notificationSendAllowed: false,
    eventPublishAllowed: false,
  });
});
