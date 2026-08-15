import type { CreatorCommerceCheckoutDTO,CreatorCommerceOrderDTO,CreatorCommerceSelection } from "./creatorCommerceTypes";
import { buildCreatorCommerceCheckout,buildCreatorCommerceOrder } from "./creatorCommerceService";
const root=globalThis as typeof globalThis&{__creatorCommerceTesting?:{checkouts:Map<string,CreatorCommerceCheckoutDTO>;orders:Map<string,CreatorCommerceOrderDTO>}};
const store=root.__creatorCommerceTesting??={checkouts:new Map(),orders:new Map()};
export function createTestingCheckout(selection:CreatorCommerceSelection,userId:string){const checkout=buildCreatorCommerceCheckout(selection,userId);const existing=[...store.checkouts.values()].find(item=>item.idempotencyKey===checkout.idempotencyKey);if(existing)return existing;store.checkouts.set(checkout.checkoutId,checkout);return checkout;}
export function testingCheckout(id:string){return store.checkouts.get(id)??null;}
export function startTestingPayment(id:string){const checkout=store.checkouts.get(id);if(!checkout)return null;const next={...checkout,status:"payment_started" as const};store.checkouts.set(id,next);return next;}
export function confirmTestingPayment(id:string,outcome:"success"|"failure"){const checkout=store.checkouts.get(id);if(!checkout)return null;const order=buildCreatorCommerceOrder(checkout,outcome==="success");store.orders.set(order.orderId,order);store.checkouts.set(id,{...checkout,status:outcome==="success"?"confirmation_pending":"payment_failed"});return order;}
