import { commerceError,commerceOk,commerceUser } from "@/app/lib/creators/creatorCommerceApi";
import { creatorCommerceFlags } from "@/app/lib/creators/creatorCommerceFlags";
import { creatorTestingCommerceRepository } from "@/app/lib/creators/creatorTestingCommerceRepository";
export async function GET(request:Request){if(!creatorCommerceFlags.testEntitlementsEnabled())return commerceError("COMMERCE_DISABLED","Testing entitlements are disabled.",503);const user=commerceUser(request);if(!user)return commerceError("AUTH_REQUIRED","Shared TPL login is required.",401);return commerceOk(creatorTestingCommerceRepository.list(user).map(item=>item.entitlement));}
