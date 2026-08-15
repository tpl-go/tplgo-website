import { commerceError,commerceOk,commerceUser } from "@/app/lib/creators/creatorCommerceApi";
import { creatorTestCheckoutAllowed } from "@/app/lib/creators/creatorCommerceFlags";
import { testingCheckout } from "@/app/lib/creators/creatorCommerceTestingStore";
export async function GET(request:Request,{params}:{params:Promise<{checkoutId:string}>}){if(!creatorTestCheckoutAllowed())return commerceError("COMMERCE_DISABLED","Creator testing commerce is disabled.",503);if(!commerceUser(request))return commerceError("AUTH_REQUIRED","Shared TPL login is required.",401);const checkout=testingCheckout((await params).checkoutId);return checkout?commerceOk(checkout):commerceError("CHECKOUT_NOT_FOUND","Testing checkout was not found.",404);}
