import { creatorTestCheckoutAllowed } from "@/app/lib/creators/creatorCommerceFlags";
import { commerceBody,commerceError,commerceOk,commerceUser,safeCommerceError } from "@/app/lib/creators/creatorCommerceApi";
import { createTestingCheckout } from "@/app/lib/creators/creatorCommerceTestingStore";
import type { CreatorCommerceSelection } from "@/app/lib/creators/creatorCommerceTypes";
export async function POST(request:Request){if(!creatorTestCheckoutAllowed())return commerceError("COMMERCE_DISABLED","Creator testing commerce is disabled.",503);const user=commerceUser(request);if(!user)return commerceError("AUTH_REQUIRED","Shared TPL login is required.",401);try{return commerceOk(createTestingCheckout((await commerceBody(request)) as CreatorCommerceSelection,user),201);}catch(error){return safeCommerceError(error);}}

