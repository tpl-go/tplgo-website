function enabled(name:string){return process.env[name]==="true";}
export const creatorCommerceFlags={
  commerceEnabled:()=>enabled("NEXT_PUBLIC_TPL_CREATOR_COMMERCE_ENABLED"),
  testCommerceEnabled:()=>enabled("NEXT_PUBLIC_TPL_CREATOR_TEST_COMMERCE_ENABLED"),
  checkoutEnabled:()=>enabled("NEXT_PUBLIC_TPL_CREATOR_CHECKOUT_ENABLED"),
  testPaymentEnabled:()=>enabled("NEXT_PUBLIC_TPL_CREATOR_TEST_PAYMENT_ENABLED"),
  fallbackEnabled:()=>enabled("NEXT_PUBLIC_TPL_CREATOR_COMMERCE_FALLBACK_ENABLED"),
  sourceBadgeEnabled:()=>enabled("NEXT_PUBLIC_TPL_CREATOR_COMMERCE_SOURCE_BADGE_ENABLED"),
  certificationMode:()=>enabled("NEXT_PUBLIC_TPL_CREATOR_COMMERCE_CERTIFICATION_MODE"),
  testOrdersEnabled:()=>enabled("NEXT_PUBLIC_TPL_CREATOR_TEST_ORDERS_ENABLED"),
  testEntitlementsEnabled:()=>enabled("NEXT_PUBLIC_TPL_CREATOR_TEST_ENTITLEMENTS_ENABLED"),
  libraryTestApiEnabled:()=>enabled("NEXT_PUBLIC_TPL_CREATOR_LIBRARY_TEST_API_ENABLED"),
  certificatePreviewEnabled:()=>enabled("NEXT_PUBLIC_TPL_CREATOR_CERTIFICATE_PREVIEW_ENABLED"),
  testDownloadsEnabled:()=>enabled("NEXT_PUBLIC_TPL_CREATOR_TEST_DOWNLOADS_ENABLED"),
  testDeliveryEnabled:()=>enabled("NEXT_PUBLIC_TPL_CREATOR_TEST_DELIVERY_ENABLED"),
  downloadHistoryEnabled:()=>enabled("NEXT_PUBLIC_TPL_CREATOR_DOWNLOAD_HISTORY_ENABLED"),
  watermarkPolicyEnabled:()=>enabled("NEXT_PUBLIC_TPL_CREATOR_WATERMARK_POLICY_ENABLED"),
  downloadSourceBadgeEnabled:()=>enabled("NEXT_PUBLIC_TPL_CREATOR_DOWNLOAD_SOURCE_BADGE_ENABLED"),
  testDbPersistenceEnabled:()=>enabled("NEXT_PUBLIC_TPL_CREATOR_TEST_DB_PERSISTENCE_ENABLED"),
  testFormatFixturesEnabled:()=>enabled("NEXT_PUBLIC_TPL_CREATOR_TEST_FORMAT_FIXTURES_ENABLED"),
  downloadCertificationMode:()=>enabled("NEXT_PUBLIC_TPL_CREATOR_DOWNLOAD_CERTIFICATION_MODE"),
};
export function creatorTestCheckoutAllowed(){return creatorCommerceFlags.commerceEnabled()&&creatorCommerceFlags.testCommerceEnabled()&&creatorCommerceFlags.checkoutEnabled();}
export function creatorTestPaymentAllowed(){return creatorTestCheckoutAllowed()&&creatorCommerceFlags.testPaymentEnabled();}
export function creatorTestEntitlementAllowed(){return creatorTestPaymentAllowed()&&creatorCommerceFlags.testOrdersEnabled()&&creatorCommerceFlags.testEntitlementsEnabled();}
export function creatorTestDeliveryAllowed(){return creatorTestEntitlementAllowed()&&creatorCommerceFlags.testDownloadsEnabled()&&creatorCommerceFlags.testDeliveryEnabled();}
