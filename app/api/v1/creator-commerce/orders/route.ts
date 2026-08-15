import { commerceError,commerceOk,commerceUser } from "@/app/lib/creators/creatorCommerceApi";
import { creatorCommerceFlags } from "@/app/lib/creators/creatorCommerceFlags";
import { creatorTestingCommerceRepository } from "@/app/lib/creators/creatorTestingCommerceRepository";
export async function GET(request:Request){if(!creatorCommerceFlags.testOrdersEnabled())return commerceError("COMMERCE_DISABLED","Testing orders are disabled.",503);const user=commerceUser(request);if(!user)return commerceError("AUTH_REQUIRED","Shared TPL login is required.",401);return commerceOk(creatorTestingCommerceRepository.list(user).map(item=>({order:item.order,entitlementStatus:item.entitlement.status,certificateStatus:item.certificate?.status??"not_applicable"})));}
