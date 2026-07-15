import { creatorPlans } from "./creatorPlansData";
import { getCreatorAsset } from "./creatorCatalogService";
import type { CreatorCommerceCheckoutDTO, CreatorCommerceOrderDTO, CreatorCommerceSelection } from "./creatorCommerceTypes";
import { CREATOR_COMMERCE_CHECKOUT_VERSION, CREATOR_COMMERCE_ORDER_VERSION } from "./creatorCommerceTypes";

function hash(value:string){let h=0;for(const char of value){h=(h<<5)-h+char.charCodeAt(0);h|=0;}return Math.abs(h).toString(36);}
const request=(seed:string)=>`creator-commerce-${hash(seed)}`;
export function creatorCommerceIdempotencyKey(userId:string,selection:CreatorCommerceSelection){return `creator:commerce:v1:${userId}:${hash(JSON.stringify(selection))}`;}
export function buildCreatorCommerceCheckout(selection:CreatorCommerceSelection,userId:string,now=new Date()):CreatorCommerceCheckoutDTO{
  if(!userId)throw new Error("AUTH_REQUIRED");
  if(selection.productType==="creator_enterprise_inquiry")throw new Error("UNAVAILABLE_LICENSE");
  let title="";let baseAmount=0;let usageRightsSnapshot:string[]=[];let metadata:Record<string,unknown>={};let itemIdentity="";
  if(selection.productType==="creator_plan"){
    const plan=creatorPlans.find(item=>item.key===selection.planId);
    if(!plan||plan.monthlyPrice===null||plan.monthlyPrice<=0)throw new Error("INVALID_PLAN");
    const cycle=selection.billingCycle??"monthly";const monthly=cycle==="yearly"?plan.yearlyMonthlyPrice:plan.monthlyPrice;
    if(monthly===null||monthly<=0)throw new Error("INVALID_PLAN");
    baseAmount=Math.round(monthly*(cycle==="yearly"?12:1)*100);title=`${plan.name} Creator Plan`;usageRightsSnapshot=[...plan.features];metadata={planId:plan.key,billingCycle:cycle,renewalEnabled:false};itemIdentity=plan.key;
  }else{
    const asset=getCreatorAsset(selection.assetSlug??"");if(!asset)throw new Error("INVALID_ASSET");
    const extended=selection.productType==="creator_asset_extended_license";
    const option=asset.licenseOptions.find(item=>extended?["extended","extended_commercial"].includes(item.type):item.type==="commercial");
    if(!option||option.price<=0)throw new Error("UNAVAILABLE_LICENSE");
    baseAmount=Math.round(option.price*100);title=`${asset.title} — ${extended?"Extended":"Standard"} License`;usageRightsSnapshot=[...option.allowedUse];metadata={assetId:asset.id,assetSlug:asset.slug,creatorSlug:asset.creatorSlug,licenseType:extended?"extended":"standard",licenseVersion:"creator-license-policy-v1"};itemIdentity=asset.id;
  }
  if(baseAmount<=0)throw new Error("INVALID_AMOUNT");
  const taxAmount=Math.round(baseAmount*0.18);const platformFee=0;const gatewayFee=0;const totalAmount=baseAmount+taxAmount;
  const idempotencyKey=creatorCommerceIdempotencyKey(userId,selection);const checkoutId=`creator-checkout-${hash(idempotencyKey)}`;const createdAt=now.toISOString();
  const item={id:`creator-item-${hash(itemIdentity+selection.productType)}`,productType:selection.productType,title,quantity:1 as const,currency:"INR" as const,baseAmount,taxAmount,platformFee,gatewayFee,totalAmount,billingCycle:selection.billingCycle,licenseType:selection.productType.includes("extended")?"extended" as const:selection.productType.includes("standard")?"standard" as const:undefined,planId:selection.planId,assetId:typeof metadata.assetId==="string"?metadata.assetId:undefined,assetSlug:selection.assetSlug,creatorSlug:typeof metadata.creatorSlug==="string"?metadata.creatorSlug:undefined,licenseVersion:typeof metadata.licenseVersion==="string"?metadata.licenseVersion:undefined,usageRightsSnapshot,source:"testing_api" as const,metadata};
  return {version:CREATOR_COMMERCE_CHECKOUT_VERSION,checkoutId,userId,productType:selection.productType,items:[item],subtotal:baseAmount,taxAmount,platformFee,gatewayFee,totalAmount,currency:"INR",billingCycle:selection.billingCycle,licenseSnapshot:selection.productType.includes("license")?metadata:undefined,planSnapshot:selection.productType==="creator_plan"?metadata:undefined,creatorSnapshot:metadata.creatorSlug?{slug:metadata.creatorSlug}:undefined,source:"testing_api",status:"ready",requestId:request(idempotencyKey),idempotencyKey,createdAt,expiresAt:new Date(now.getTime()+30*60*1000).toISOString(),safety:{testingOnly:true,realGatewayAllowed:false,walletCreditsApplied:false,entitlementActivationAllowed:false,downloadAllowed:false}};
}
export function buildCreatorCommerceOrder(checkout:CreatorCommerceCheckoutDTO,succeeded:boolean,now=new Date()):CreatorCommerceOrderDTO{return {version:CREATOR_COMMERCE_ORDER_VERSION,orderId:`creator-order-${hash(checkout.idempotencyKey)}`,checkoutId:checkout.checkoutId,buyerId:checkout.userId,productType:checkout.productType,items:checkout.items,amounts:{subtotal:checkout.subtotal,taxAmount:checkout.taxAmount,platformFee:checkout.platformFee,gatewayFee:checkout.gatewayFee,totalAmount:checkout.totalAmount},currency:"INR",paymentStatus:succeeded?"testing_succeeded":"testing_failed",orderStatus:succeeded?"testing_confirmed":"payment_failed",entitlementStatus:"pending_testing",invoiceStatus:"not_generated",licenseCertificateStatus:"not_generated",createdAt:now.toISOString(),updatedAt:now.toISOString(),requestId:request(checkout.checkoutId+String(succeeded))};}
