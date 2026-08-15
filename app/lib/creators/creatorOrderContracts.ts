import type {
  CreatorDraftOrder,
  CreatorGatewayProvider,
  CreatorIdempotencyMetadata,
  CreatorNotificationContract,
  CreatorOrderAuditMetadata,
  CreatorOrderEventContract,
  CreatorOrderEventType,
  CreatorPaymentIntentPreview,
  CreatorPaymentMethod,
  CreatorPaymentResponsePreview,
  CreatorRetryPolicy,
  CreatorRollbackPolicy,
} from "./creatorOrderTypes";

function hashText(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function buildCreatorIdempotencyMetadata(seed: string, payload: unknown): CreatorIdempotencyMetadata {
  const requestHash = hashText(JSON.stringify(payload));
  return {
    idempotencyKey: `creator:order:${seed}:${requestHash}`,
    dedupeKey: `creator:order:${requestHash}`,
    requestHash,
    replayAllowed: true,
    conflictPolicy: "same_key_different_hash_rejected",
  };
}

export function buildCreatorRetryPolicy(): CreatorRetryPolicy {
  return {
    retryAllowed: true,
    maxAttempts: 3,
    backoffStrategy: "fixed",
    retryableStates: ["checkout_preview", "validation_pending", "payment_pending", "payment_processing", "failed"],
  };
}

export function buildCreatorRollbackPolicy(): CreatorRollbackPolicy {
  return {
    rollbackAllowed: true,
    rollbackStates: ["validation_pending", "validated", "payment_pending", "payment_processing", "failed"],
    rollbackActions: ["discard_preview_order", "clear_preview_payment", "preserve_cart_session"],
    mutationRollbackRequired: false,
  };
}

export function buildCreatorPaymentIntentPreview({
  amount,
  paymentMethod = "none",
  gatewayProvider = "none",
  metadata = {},
}: {
  amount: number;
  paymentMethod?: CreatorPaymentMethod;
  gatewayProvider?: CreatorGatewayProvider;
  metadata?: Record<string, unknown>;
}): CreatorPaymentIntentPreview {
  return {
    paymentIntentPreviewId: `creator-payment-preview-${hashText(JSON.stringify({ amount, metadata }))}`,
    paymentMethod,
    gatewayProvider,
    amount,
    currency: "INR",
    metadata,
    gatewayCallAllowed: false,
    walletMutationAllowed: false,
    paymentCreationAllowed: false,
  };
}

export function buildCreatorPaymentResponsePreview(paymentPreview: CreatorPaymentIntentPreview): CreatorPaymentResponsePreview {
  return {
    paymentIntentPreviewId: paymentPreview.paymentIntentPreviewId,
    paymentStatus: "preview_only",
    providerReference: null,
    metadata: {
      paymentDisabled: true,
      gatewayCallAllowed: false,
    },
  };
}

export function buildCreatorAuditMetadata(draftOrderId: string, buyerUserId: string, action: string): CreatorOrderAuditMetadata {
  return {
    auditId: `creator-audit-${draftOrderId}-${action}`,
    actorType: "system_preview",
    buyerUserId,
    action,
    createdAt: new Date().toISOString(),
    metadata: {
      hiddenMode: true,
      persistenceAllowed: false,
    },
  };
}

export function buildCreatorOrderEvent(draftOrder: Pick<CreatorDraftOrder, "draftOrderId" | "checkoutSessionId">, eventType: CreatorOrderEventType, payload: Record<string, unknown> = {}): CreatorOrderEventContract {
  return {
    eventId: `${draftOrder.draftOrderId}:${eventType}`,
    eventType,
    draftOrderId: draftOrder.draftOrderId,
    checkoutSessionId: draftOrder.checkoutSessionId,
    occurredAt: new Date().toISOString(),
    publishAllowed: false,
    payload,
  };
}

export function buildCreatorNotificationContract(draftOrderId: string, buyerUserId: string, notificationType: CreatorNotificationContract["notificationType"]): CreatorNotificationContract {
  return {
    notificationId: `${draftOrderId}:${notificationType}`,
    notificationType,
    channel: "none",
    recipientUserId: buyerUserId,
    sendAllowed: false,
    payload: {
      hiddenMode: true,
    },
  };
}
