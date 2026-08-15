import { creatorTestPaymentAllowed } from "@/app/lib/creators/creatorCommerceFlags";
import { commerceBody,commerceError,commerceOk,commerceUser } from "@/app/lib/creators/creatorCommerceApi";
import { startTestingPayment } from "@/app/lib/creators/creatorCommerceTestingStore";
export async function POST(request:Request){if(!creatorTestPaymentAllowed())return commerceError("COMMERCE_DISABLED","Creator test payment is disabled.",503);if(!commerceUser(request))return commerceError("AUTH_REQUIRED","Shared TPL login is required.",401);const body=await commerceBody(request);const checkout=startTestingPayment(String(body.checkoutId??""));return checkout?commerceOk(checkout):commerceError("CHECKOUT_NOT_FOUND","Testing checkout was not found.",404);}

