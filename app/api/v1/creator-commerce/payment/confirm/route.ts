import { creatorTestPaymentAllowed } from "@/app/lib/creators/creatorCommerceFlags";
import { commerceBody,commerceError,commerceOk,commerceUser } from "@/app/lib/creators/creatorCommerceApi";
import { confirmTestingPayment } from "@/app/lib/creators/creatorCommerceTestingStore";
import { creatorTestEntitlementAllowed } from "@/app/lib/creators/creatorCommerceFlags";
import { finalizeTestingEntitlement } from "@/app/lib/creators/creatorEntitlementV1Service";
export async function POST(request:Request){if(!creatorTestPaymentAllowed())return commerceError("COMMERCE_DISABLED","Creator test payment is disabled.",503);if(!commerceUser(request))return commerceError("AUTH_REQUIRED","Shared TPL login is required.",401);const body=await commerceBody(request);const outcome=body.outcome==="failure"?"failure":"success";const order=confirmTestingPayment(String(body.checkoutId??""),outcome);if(!order)return commerceError("CHECKOUT_NOT_FOUND","Testing checkout was not found.",404);if(outcome==="success"&&creatorTestEntitlementAllowed())finalizeTestingEntitlement(order);return commerceOk(order);}
