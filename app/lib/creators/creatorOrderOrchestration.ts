import { buildCreatorAuditMetadata, buildCreatorIdempotencyMetadata, buildCreatorNotificationContract, buildCreatorOrderEvent, buildCreatorPaymentIntentPreview, buildCreatorPaymentResponsePreview, buildCreatorRetryPolicy, buildCreatorRollbackPolicy } from "./creatorOrderContracts";
import { creatorOrderStateTransitions } from "./creatorOrderState";
import { validateCreatorCheckoutForOrder } from "./creatorOrderValidation";
import type { CreatorOrderAssetItem, CreatorOrderOrchestrationInput, CreatorOrderOrchestrationResult, CreatorOrderSummary } from "./creatorOrderTypes";

function buildOrderItems(input: CreatorOrderOrchestrationInput): CreatorOrderAssetItem[] {
  return input.checkoutPreview.items.map((item, index) => ({
    orderItemId: `creator-order-item-${index + 1}-${item.id}`,
    cartItemId: item.id,
    assetSlug: item.assetSlug,
    title: item.title,
    creatorSlug: item.creatorSlug,
    selectedLicense: item.selectedLicense,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    currency: item.currency,
  }));
}

function buildSummary(items: CreatorOrderAssetItem[], total: number): CreatorOrderSummary {
  return {
    itemCount: items.length,
    assetCount: items.filter((item) => Boolean(item.assetSlug)).length,
    bundleCount: 0,
    collectionCount: 0,
    total,
    currency: "INR",
  };
}

export function createCreatorOrderPreview(input: CreatorOrderOrchestrationInput): CreatorOrderOrchestrationResult {
  const buyerUserId = input.buyerUserId || "future-tpl-user";
  const seed = input.idempotencySeed || input.checkoutPreview.previewId;
  const idempotency = buildCreatorIdempotencyMetadata(seed, input.checkoutPreview);
  const draftOrderId = `creator-draft-${idempotency.requestHash}`;
  const checkoutSessionId = `creator-checkout-${input.checkoutPreview.cartId}`;
  const assetItems = buildOrderItems(input);
  const paymentPreview = buildCreatorPaymentIntentPreview({
    amount: input.checkoutPreview.price.grandTotal,
    metadata: {
      draftOrderId,
      checkoutSessionId,
      purpose: "creator_order_preview",
    },
  });
  const now = new Date().toISOString();
  const validationIssues = validateCreatorCheckoutForOrder(input.checkoutPreview);
  const baseOrder = { draftOrderId, checkoutSessionId };

  return {
    draftOrder: {
      draftOrderId,
      checkoutSessionId,
      buyerUserId,
      state: "draft",
      assetItems,
      selectedLicenses: input.checkoutPreview.resolvedLicenses,
      pricingSnapshot: input.checkoutPreview.price,
      couponSnapshot: input.checkoutPreview.coupon,
      walletEligibility: input.checkoutPreview.wallet,
      taxSnapshot: input.checkoutPreview.tax,
      orderSummary: buildSummary(assetItems, input.checkoutPreview.price.grandTotal),
      entitlementPreview: input.checkoutPreview.entitlementPreviews,
      paymentPreview,
      paymentResponsePreview: buildCreatorPaymentResponsePreview(paymentPreview),
      certificatePreview: input.checkoutPreview.certificatePreviews,
      auditMetadata: buildCreatorAuditMetadata(draftOrderId, buyerUserId, "creator.order.previewed"),
      events: [
        buildCreatorOrderEvent(baseOrder, "creator.checkout.created"),
        buildCreatorOrderEvent(baseOrder, "creator.order.validated", { issueCount: validationIssues.length }),
        buildCreatorOrderEvent(baseOrder, "creator.payment.pending", { previewOnly: true }),
        buildCreatorOrderEvent(baseOrder, "creator.entitlement.ready", { previewOnly: true }),
      ],
      notifications: [
        buildCreatorNotificationContract(draftOrderId, buyerUserId, "creator_order_preview"),
        buildCreatorNotificationContract(draftOrderId, buyerUserId, "creator_payment_preview"),
        buildCreatorNotificationContract(draftOrderId, buyerUserId, "creator_entitlement_preview"),
      ],
      idempotency,
      retryPolicy: buildCreatorRetryPolicy(),
      rollbackPolicy: buildCreatorRollbackPolicy(),
      checkoutPreview: input.checkoutPreview,
      validationIssues,
      transactionPermissions: {
        checkoutAllowed: false,
        paymentAllowed: false,
        orderPersistenceAllowed: false,
        entitlementActivationAllowed: false,
        downloadAllowed: false,
        notificationSendAllowed: false,
        eventPublishAllowed: false,
      },
      createdAt: now,
      updatedAt: now,
    },
    allowedStateTransitions: creatorOrderStateTransitions,
  };
}
