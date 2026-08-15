import type { CreatorPriceBreakup, CreatorTaxPlaceholder } from "./creatorCartTypes";
import type { CreatorOrderAssetItem } from "./creatorOrderTypes";

export type CreatorCurrencyCode = "INR";

export type CreatorPaymentProvider = "stripe" | "razorpay" | "cashfree" | "paypal" | "manual" | "mock";

export type CreatorPaymentStatus =
  | "draft"
  | "intent_created"
  | "awaiting_payment"
  | "payment_processing"
  | "payment_authorized"
  | "payment_captured"
  | "payment_failed"
  | "payment_cancelled"
  | "payment_expired"
  | "refund_pending"
  | "refund_completed";

export type CreatorPaymentMethodType = "card" | "upi" | "netbanking" | "wallet_future" | "manual" | "mock";

export type CreatorPaymentProviderContract = {
  provider: CreatorPaymentProvider;
  displayName: string;
  uppCompatible: true;
  sdkRequired: false;
  apiCallAllowed: false;
  credentialRequired: false;
  redirectAllowed: false;
  captureAllowed: false;
  refundAllowed: false;
  metadata: Record<string, unknown>;
};

export type CreatorPaymentRequestContract = {
  requestId: string;
  draftOrderId: string;
  checkoutSessionId: string;
  buyerUserId: string;
  amount: number;
  currency: CreatorCurrencyCode;
  paymentMethod: CreatorPaymentMethodType;
  provider: CreatorPaymentProvider;
  pricingSnapshot: CreatorPriceBreakup;
  taxSnapshot: CreatorTaxPlaceholder;
  metadata: Record<string, unknown>;
  idempotencyKey: string;
};

export type CreatorPaymentIntent = {
  paymentIntentId: string;
  request: CreatorPaymentRequestContract;
  status: CreatorPaymentStatus;
  providerContract: CreatorPaymentProviderContract;
  amount: number;
  currency: CreatorCurrencyCode;
  createdAt: string;
  expiresAt: string;
  signedPaymentAllowed: false;
  gatewayRedirectAllowed: false;
  providerCallAllowed: false;
  walletMutationAllowed: false;
  paymentPersistenceAllowed: false;
};

export type CreatorPaymentSession = {
  paymentSessionId: string;
  paymentIntentId: string;
  draftOrderId: string;
  checkoutSessionId: string;
  status: CreatorPaymentStatus;
  provider: CreatorPaymentProvider;
  retryPolicy: CreatorPaymentRetryContract;
  cancellationPolicy: CreatorPaymentCancellationContract;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
};

export type CreatorPaymentAttempt = {
  attemptId: string;
  paymentIntentId: string;
  attemptNumber: number;
  status: CreatorPaymentStatus;
  provider: CreatorPaymentProvider;
  requestHash: string;
  response?: CreatorPaymentResponseContract;
  failure?: CreatorPaymentFailureContract;
  createdAt: string;
};

export type CreatorPaymentResponseContract = {
  paymentIntentId: string;
  paymentSessionId: string;
  status: "preview_only" | "blocked";
  providerReference: null;
  amount: number;
  currency: CreatorCurrencyCode;
  metadata: Record<string, unknown>;
};

export type CreatorPaymentFailureContract = {
  failureCode: "provider_disabled" | "payment_engine_disabled" | "invalid_amount" | "invalid_currency" | "duplicate_payment" | "order_preview_invalid";
  message: string;
  retryable: boolean;
  metadata: Record<string, unknown>;
};

export type CreatorPaymentRetryContract = {
  retryAllowed: true;
  maxAttempts: number;
  backoffStrategy: "fixed";
  retryableStatuses: CreatorPaymentStatus[];
};

export type CreatorPaymentCancellationContract = {
  cancellationAllowed: true;
  cancellableStatuses: CreatorPaymentStatus[];
  providerCancellationAllowed: false;
};

export type CreatorPaymentAudit = {
  auditId: string;
  paymentIntentId: string;
  draftOrderId: string;
  action: string;
  actorType: "system_preview";
  createdAt: string;
  metadata: Record<string, unknown>;
};

export type CreatorInvoiceStatus = "preview_only" | "draft" | "void";

export type CreatorInvoicePreview = {
  invoiceId: string;
  orderId: string;
  buyerId: string;
  assetItems: CreatorOrderAssetItem[];
  licenseSnapshot: Record<string, unknown>[];
  pricingSnapshot: CreatorPriceBreakup;
  taxSnapshot: CreatorTaxPlaceholder;
  currency: CreatorCurrencyCode;
  invoiceStatus: CreatorInvoiceStatus;
  createdAt: string;
  metadata: Record<string, unknown>;
  pdfGenerated: false;
};

export type CreatorPaymentNotificationType =
  | "creator.payment.initiated"
  | "creator.payment.pending"
  | "creator.payment.success"
  | "creator.payment.failure"
  | "creator.payment.refund.initiated"
  | "creator.payment.refund.completed";

export type CreatorPaymentNotificationPayload = {
  notificationId: string;
  notificationType: CreatorPaymentNotificationType;
  buyerUserId: string;
  sendAllowed: false;
  payload: Record<string, unknown>;
};

export type CreatorPaymentEventType =
  | "creator.payment.intent.created"
  | "creator.payment.started"
  | "creator.payment.authorized"
  | "creator.payment.completed"
  | "creator.payment.failed"
  | "creator.payment.cancelled"
  | "creator.payment.refund.pending"
  | "creator.payment.refund.completed";

export type CreatorPaymentEventContract = {
  eventId: string;
  eventType: CreatorPaymentEventType;
  paymentIntentId: string;
  draftOrderId: string;
  publishAllowed: false;
  occurredAt: string;
  payload: Record<string, unknown>;
};

export type CreatorPaymentValidationIssue = {
  code:
    | "payment_engine_disabled"
    | "provider_disabled"
    | "invalid_currency"
    | "invalid_amount"
    | "license_validation_failed"
    | "pricing_snapshot_mismatch"
    | "duplicate_payment_metadata"
    | "order_preview_invalid";
  message: string;
};

export type CreatorPaymentPreview = {
  intent: CreatorPaymentIntent;
  session: CreatorPaymentSession;
  attempt: CreatorPaymentAttempt;
  response: CreatorPaymentResponseContract;
  invoice: CreatorInvoicePreview;
  audit: CreatorPaymentAudit;
  events: CreatorPaymentEventContract[];
  notifications: CreatorPaymentNotificationPayload[];
  validationIssues: CreatorPaymentValidationIssue[];
  paymentExecutionAllowed: false;
  walletMutationAllowed: false;
  orderPersistenceAllowed: false;
  entitlementActivationAllowed: false;
  downloadAllowed: false;
};
