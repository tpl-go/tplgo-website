import type { CreatorCheckoutPreview, CreatorCouponPlaceholder, CreatorPriceBreakup, CreatorTaxPlaceholder, CreatorWalletEligibilityPlaceholder } from "./creatorCartTypes";
import type { CreatorEntitlement } from "./creatorEntitlementTypes";
import type { CreatorLicenseCertificatePreview, CreatorResolvedLicense } from "./creatorLicenseTypes";

export type CreatorOrderState =
  | "draft"
  | "checkout_preview"
  | "validation_pending"
  | "validated"
  | "payment_pending"
  | "payment_processing"
  | "payment_confirmed"
  | "entitlement_pending"
  | "completed"
  | "cancelled"
  | "failed"
  | "rolled_back";

export type CreatorPaymentMethod = "none" | "card" | "upi" | "netbanking" | "wallet" | "mock";

export type CreatorGatewayProvider = "none" | "tpl_mock" | "upp_ready";

export type CreatorOrderAssetItem = {
  orderItemId: string;
  cartItemId: string;
  assetSlug?: string;
  title: string;
  creatorSlug?: string;
  selectedLicense: string;
  quantity: 1;
  unitPrice: number;
  currency: "INR";
};

export type CreatorPaymentIntentPreview = {
  paymentIntentPreviewId: string;
  paymentMethod: CreatorPaymentMethod;
  gatewayProvider: CreatorGatewayProvider;
  amount: number;
  currency: "INR";
  metadata: Record<string, unknown>;
  gatewayCallAllowed: false;
  walletMutationAllowed: false;
  paymentCreationAllowed: false;
};

export type CreatorPaymentResponsePreview = {
  paymentIntentPreviewId: string;
  paymentStatus: "preview_only" | "not_started" | "blocked";
  providerReference: null;
  metadata: Record<string, unknown>;
};

export type CreatorOrderSummary = {
  itemCount: number;
  assetCount: number;
  bundleCount: number;
  collectionCount: number;
  total: number;
  currency: "INR";
};

export type CreatorOrderAuditMetadata = {
  auditId: string;
  actorType: "system_preview" | "buyer";
  buyerUserId: string;
  action: string;
  createdAt: string;
  metadata: Record<string, unknown>;
};

export type CreatorOrderEventType =
  | "creator.checkout.created"
  | "creator.order.validated"
  | "creator.payment.pending"
  | "creator.payment.confirmed"
  | "creator.entitlement.ready"
  | "creator.download.ready"
  | "creator.order.completed"
  | "creator.order.failed";

export type CreatorOrderEventContract = {
  eventId: string;
  eventType: CreatorOrderEventType;
  draftOrderId: string;
  checkoutSessionId: string;
  occurredAt: string;
  publishAllowed: false;
  payload: Record<string, unknown>;
};

export type CreatorNotificationContract = {
  notificationId: string;
  notificationType: "creator_order_preview" | "creator_payment_preview" | "creator_entitlement_preview" | "creator_order_failed";
  channel: "none" | "email" | "in_app";
  recipientUserId: string;
  sendAllowed: false;
  payload: Record<string, unknown>;
};

export type CreatorIdempotencyMetadata = {
  idempotencyKey: string;
  dedupeKey: string;
  requestHash: string;
  replayAllowed: true;
  conflictPolicy: "same_key_different_hash_rejected";
};

export type CreatorRetryPolicy = {
  retryAllowed: true;
  maxAttempts: number;
  backoffStrategy: "fixed" | "exponential";
  retryableStates: CreatorOrderState[];
};

export type CreatorRollbackPolicy = {
  rollbackAllowed: true;
  rollbackStates: CreatorOrderState[];
  rollbackActions: string[];
  mutationRollbackRequired: false;
};

export type CreatorDraftOrder = {
  draftOrderId: string;
  checkoutSessionId: string;
  buyerUserId: string;
  state: CreatorOrderState;
  assetItems: CreatorOrderAssetItem[];
  selectedLicenses: CreatorResolvedLicense[];
  pricingSnapshot: CreatorPriceBreakup;
  couponSnapshot: CreatorCouponPlaceholder;
  walletEligibility: CreatorWalletEligibilityPlaceholder;
  taxSnapshot: CreatorTaxPlaceholder;
  orderSummary: CreatorOrderSummary;
  entitlementPreview: CreatorEntitlement[];
  paymentPreview: CreatorPaymentIntentPreview;
  paymentResponsePreview: CreatorPaymentResponsePreview;
  certificatePreview: CreatorLicenseCertificatePreview[];
  auditMetadata: CreatorOrderAuditMetadata;
  events: CreatorOrderEventContract[];
  notifications: CreatorNotificationContract[];
  idempotency: CreatorIdempotencyMetadata;
  retryPolicy: CreatorRetryPolicy;
  rollbackPolicy: CreatorRollbackPolicy;
  checkoutPreview: CreatorCheckoutPreview;
  validationIssues: CreatorOrderValidationIssue[];
  transactionPermissions: {
    checkoutAllowed: false;
    paymentAllowed: false;
    orderPersistenceAllowed: false;
    entitlementActivationAllowed: false;
    downloadAllowed: false;
    notificationSendAllowed: false;
    eventPublishAllowed: false;
  };
  createdAt: string;
  updatedAt: string;
};

export type CreatorOrderValidationIssue = {
  code:
    | "order_engine_disabled"
    | "transaction_engine_disabled"
    | "empty_cart"
    | "asset_missing"
    | "unsupported_license"
    | "duplicate_asset"
    | "bundle_not_enabled"
    | "collection_not_enabled"
    | "checkout_preview_invalid";
  message: string;
  itemId?: string;
};

export type CreatorOrderOrchestrationInput = {
  checkoutPreview: CreatorCheckoutPreview;
  buyerUserId?: string;
  idempotencySeed?: string;
};

export type CreatorOrderOrchestrationResult = {
  draftOrder: CreatorDraftOrder;
  allowedStateTransitions: Array<{ from: CreatorOrderState; to: CreatorOrderState }>;
};
