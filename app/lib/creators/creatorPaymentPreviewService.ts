import type { CreatorDraftOrder } from "./creatorOrderTypes";
import {
  buildCreatorInvoicePreview,
  buildCreatorPaymentAttempt,
  buildCreatorPaymentAudit,
  buildCreatorPaymentEvent,
  buildCreatorPaymentIntent,
  buildCreatorPaymentNotification,
  buildCreatorPaymentRequest,
  buildCreatorPaymentResponse,
  buildCreatorPaymentSession,
} from "./creatorPaymentContracts";
import { validateCreatorPaymentPreviewInput } from "./creatorPaymentValidation";
import type { CreatorPaymentFailureContract, CreatorPaymentMethodType, CreatorPaymentPreview, CreatorPaymentProvider } from "./creatorPaymentTypes";

export function createCreatorPaymentPreview({
  draftOrder,
  provider = "mock",
  paymentMethod = "mock",
}: {
  draftOrder: CreatorDraftOrder;
  provider?: CreatorPaymentProvider;
  paymentMethod?: CreatorPaymentMethodType;
}): CreatorPaymentPreview {
  const request = buildCreatorPaymentRequest(draftOrder, provider, paymentMethod);
  const intent = buildCreatorPaymentIntent(request);
  const session = buildCreatorPaymentSession(intent);
  const response = buildCreatorPaymentResponse(intent, session);
  const validationIssues = validateCreatorPaymentPreviewInput({
    draftOrder,
    amount: request.amount,
    currency: request.currency,
    provider,
  });
  const failure: CreatorPaymentFailureContract | undefined = validationIssues.length
    ? {
        failureCode: validationIssues[0].code === "invalid_amount" ? "invalid_amount" : "payment_engine_disabled",
        message: validationIssues[0].message,
        retryable: true,
        metadata: {
          issueCount: validationIssues.length,
        },
      }
    : undefined;

  return {
    intent,
    session,
    attempt: buildCreatorPaymentAttempt(intent, response, failure),
    response,
    invoice: buildCreatorInvoicePreview(draftOrder),
    audit: buildCreatorPaymentAudit(intent, "creator.payment.previewed"),
    events: [
      buildCreatorPaymentEvent(intent, "creator.payment.intent.created"),
      buildCreatorPaymentEvent(intent, "creator.payment.started"),
      buildCreatorPaymentEvent(intent, "creator.payment.failed"),
      buildCreatorPaymentEvent(intent, "creator.payment.refund.pending"),
    ],
    notifications: [
      buildCreatorPaymentNotification(intent, "creator.payment.initiated"),
      buildCreatorPaymentNotification(intent, "creator.payment.pending"),
      buildCreatorPaymentNotification(intent, "creator.payment.failure"),
      buildCreatorPaymentNotification(intent, "creator.payment.refund.initiated"),
    ],
    validationIssues,
    paymentExecutionAllowed: false,
    walletMutationAllowed: false,
    orderPersistenceAllowed: false,
    entitlementActivationAllowed: false,
    downloadAllowed: false,
  };
}
