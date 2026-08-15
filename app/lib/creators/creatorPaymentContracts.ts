import type { CreatorDraftOrder } from "./creatorOrderTypes";
import type {
  CreatorInvoicePreview,
  CreatorPaymentAttempt,
  CreatorPaymentAudit,
  CreatorPaymentCancellationContract,
  CreatorPaymentEventContract,
  CreatorPaymentEventType,
  CreatorPaymentFailureContract,
  CreatorPaymentIntent,
  CreatorPaymentMethodType,
  CreatorPaymentNotificationPayload,
  CreatorPaymentNotificationType,
  CreatorPaymentProvider,
  CreatorPaymentRequestContract,
  CreatorPaymentResponseContract,
  CreatorPaymentRetryContract,
  CreatorPaymentSession,
} from "./creatorPaymentTypes";
import { getCreatorPaymentProviderContract } from "./creatorPaymentProviders";

function hashText(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function buildCreatorPaymentRequest(draftOrder: CreatorDraftOrder, provider: CreatorPaymentProvider = "mock", paymentMethod: CreatorPaymentMethodType = "mock"): CreatorPaymentRequestContract {
  return {
    requestId: `creator-payment-request-${draftOrder.idempotency.requestHash}`,
    draftOrderId: draftOrder.draftOrderId,
    checkoutSessionId: draftOrder.checkoutSessionId,
    buyerUserId: draftOrder.buyerUserId,
    amount: draftOrder.pricingSnapshot.grandTotal,
    currency: draftOrder.pricingSnapshot.currency,
    paymentMethod,
    provider,
    pricingSnapshot: draftOrder.pricingSnapshot,
    taxSnapshot: draftOrder.taxSnapshot,
    metadata: {
      hiddenMode: true,
      orderPersistenceAllowed: false,
    },
    idempotencyKey: `creator:payment:intent:${draftOrder.idempotency.requestHash}`,
  };
}

export function buildCreatorPaymentRetryContract(): CreatorPaymentRetryContract {
  return {
    retryAllowed: true,
    maxAttempts: 3,
    backoffStrategy: "fixed",
    retryableStatuses: ["intent_created", "awaiting_payment", "payment_processing", "payment_failed"],
  };
}

export function buildCreatorPaymentCancellationContract(): CreatorPaymentCancellationContract {
  return {
    cancellationAllowed: true,
    cancellableStatuses: ["draft", "intent_created", "awaiting_payment"],
    providerCancellationAllowed: false,
  };
}

export function buildCreatorPaymentIntent(request: CreatorPaymentRequestContract): CreatorPaymentIntent {
  const createdAt = new Date().toISOString();
  return {
    paymentIntentId: `creator-payment-intent-${hashText(request.idempotencyKey)}`,
    request,
    status: "intent_created",
    providerContract: getCreatorPaymentProviderContract(request.provider),
    amount: request.amount,
    currency: request.currency,
    createdAt,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    signedPaymentAllowed: false,
    gatewayRedirectAllowed: false,
    providerCallAllowed: false,
    walletMutationAllowed: false,
    paymentPersistenceAllowed: false,
  };
}

export function buildCreatorPaymentSession(intent: CreatorPaymentIntent): CreatorPaymentSession {
  const now = new Date().toISOString();
  return {
    paymentSessionId: `creator-payment-session-${intent.paymentIntentId}`,
    paymentIntentId: intent.paymentIntentId,
    draftOrderId: intent.request.draftOrderId,
    checkoutSessionId: intent.request.checkoutSessionId,
    status: "awaiting_payment",
    provider: intent.request.provider,
    retryPolicy: buildCreatorPaymentRetryContract(),
    cancellationPolicy: buildCreatorPaymentCancellationContract(),
    createdAt: now,
    updatedAt: now,
    metadata: {
      previewOnly: true,
    },
  };
}

export function buildCreatorPaymentResponse(intent: CreatorPaymentIntent, session: CreatorPaymentSession): CreatorPaymentResponseContract {
  return {
    paymentIntentId: intent.paymentIntentId,
    paymentSessionId: session.paymentSessionId,
    status: "preview_only",
    providerReference: null,
    amount: intent.amount,
    currency: intent.currency,
    metadata: {
      gatewayExecuted: false,
      hiddenMode: true,
    },
  };
}

export function buildCreatorPaymentAttempt(intent: CreatorPaymentIntent, response?: CreatorPaymentResponseContract, failure?: CreatorPaymentFailureContract): CreatorPaymentAttempt {
  return {
    attemptId: `creator-payment-attempt-${intent.paymentIntentId}-1`,
    paymentIntentId: intent.paymentIntentId,
    attemptNumber: 1,
    status: failure ? "payment_failed" : "intent_created",
    provider: intent.request.provider,
    requestHash: hashText(JSON.stringify(intent.request)),
    response,
    failure,
    createdAt: new Date().toISOString(),
  };
}

export function buildCreatorInvoicePreview(draftOrder: CreatorDraftOrder): CreatorInvoicePreview {
  return {
    invoiceId: `creator-invoice-preview-${draftOrder.draftOrderId}`,
    orderId: draftOrder.draftOrderId,
    buyerId: draftOrder.buyerUserId,
    assetItems: draftOrder.assetItems,
    licenseSnapshot: draftOrder.selectedLicenses.map((license) => ({
      licenseId: license.licenseId,
      licenseType: license.licenseType,
      licenseVersion: license.licenseVersion,
      resolvedPrice: license.resolvedPrice,
    })),
    pricingSnapshot: draftOrder.pricingSnapshot,
    taxSnapshot: draftOrder.taxSnapshot,
    currency: draftOrder.pricingSnapshot.currency,
    invoiceStatus: "preview_only",
    createdAt: new Date().toISOString(),
    metadata: {
      pdfGenerated: false,
      hiddenMode: true,
    },
    pdfGenerated: false,
  };
}

export function buildCreatorPaymentAudit(intent: CreatorPaymentIntent, action: string): CreatorPaymentAudit {
  return {
    auditId: `creator-payment-audit-${intent.paymentIntentId}-${action}`,
    paymentIntentId: intent.paymentIntentId,
    draftOrderId: intent.request.draftOrderId,
    action,
    actorType: "system_preview",
    createdAt: new Date().toISOString(),
    metadata: {
      provider: intent.request.provider,
      persistenceAllowed: false,
    },
  };
}

export function buildCreatorPaymentEvent(intent: CreatorPaymentIntent, eventType: CreatorPaymentEventType): CreatorPaymentEventContract {
  return {
    eventId: `${intent.paymentIntentId}:${eventType}`,
    eventType,
    paymentIntentId: intent.paymentIntentId,
    draftOrderId: intent.request.draftOrderId,
    publishAllowed: false,
    occurredAt: new Date().toISOString(),
    payload: {
      amount: intent.amount,
      currency: intent.currency,
      provider: intent.request.provider,
    },
  };
}

export function buildCreatorPaymentNotification(intent: CreatorPaymentIntent, notificationType: CreatorPaymentNotificationType): CreatorPaymentNotificationPayload {
  return {
    notificationId: `${intent.paymentIntentId}:${notificationType}`,
    notificationType,
    buyerUserId: intent.request.buyerUserId,
    sendAllowed: false,
    payload: {
      amount: intent.amount,
      currency: intent.currency,
      provider: intent.request.provider,
    },
  };
}
