import {describe,expect,it} from 'vitest';
import {validHotelBookingSnapshot} from './partnerHotelBookings';

const booking={
 id:'11111111-1111-4111-8111-111111111111',operationId:'22222222-2222-4222-8222-222222222222',bookingRef:'TPL-QA-HOTEL-M3A-001',hotel:'TPL Synthetic Hotel — QA Only',service:'Hotel',room:'Synthetic Deluxe Room — QA Only',serviceScopeId:'33333333-3333-4333-8333-333333333333',supplyItemId:'44444444-4444-4444-8444-444444444444',stayStart:'2026-10-01',stayEnd:'2026-10-03',nights:2,roomCount:1,guestCount:{adults:2,children:0,total:2},guestDisplayName:'Synthetic Guest — QA Only',status:'CONFIRMED',allocationState:'ALLOCATED',paymentDisclosure:'TEST_NO_PAYMENT',version:1,sourceChannel:'TPL_STAGING_FIXTURE',syntheticFixture:true,lastClientSurface:'api',createdAt:'2026-09-24T00:00:00.000Z',updatedAt:'2026-09-24T00:00:00.000Z',allowedActions:[{code:'ACKNOWLEDGE',label:'Acknowledge booking'}],timeline:[],
} as const;

describe('HOTEL-M3A partner booking contract',()=>{
 it('accepts the bounded canonical snapshot',()=>expect(validHotelBookingSnapshot({contractVersion:1,organizationId:'55555555-5555-4555-8555-555555555555',audience:'partner',canOperate:true,filters:{status:'ALL',search:'',from:null,to:null},counts:{total:1,actionRequired:1,upcoming:1,inHouse:0,completed:0,noShow:0,asOf:'2026-09-24T00:00:00.000Z'},bookings:[booking],nextCursor:null,allowedLifecycle:['CONFIRMED'],paymentBoundary:'No financial mutation.',freshness:{asOf:'2026-09-24T00:00:00.000Z',timezone:'UTC'}})).toBe(true));
 it('fails closed for a different contract or malformed version',()=>{expect(validHotelBookingSnapshot({contractVersion:2,organizationId:'x',bookings:[]})).toBe(false);expect(validHotelBookingSnapshot({contractVersion:1,organizationId:'x',bookings:[{...booking,version:1.5}]})).toBe(false);});
});
