import { commerceError,commerceOk,commerceUser } from "@/app/lib/creators/creatorCommerceApi";
import { creatorCommerceFlags } from "@/app/lib/creators/creatorCommerceFlags";
import { creatorTestingCommerceRepository } from "@/app/lib/creators/creatorTestingCommerceRepository";
export async function GET(request:Request,{params}:{params:Promise<{orderId:string}>}){if(!creatorCommerceFlags.testOrdersEnabled())return commerceError("COMMERCE_DISABLED","Testing orders are disabled.",503);const user=commerceUser(request);if(!user)return commerceError("AUTH_REQUIRED","Shared TPL login is required.",401);const record=creatorTestingCommerceRepository.order((await params).orderId,user);return record?commerceOk(record):commerceError("ORDER_NOT_FOUND","Testing order was not found.",404);}
