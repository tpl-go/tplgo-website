import {describe,expect,it} from 'vitest';
import {requestChangeSummary,validHotelBookingRequestSnapshot} from './partnerHotelBookingRequests';
describe('HOTEL-M3B request contract',()=>{
 it('accepts only the bounded versioned request shape',()=>{const value={contractVersion:1,audience:'partner',organizationId:'o',canSubmit:true,canReview:true,bookingEligibility:[{bookingId:'b',modificationEligibility:{allowed:false,reasonCode:'OPEN_REQUEST_EXISTS',explanation:'Resolve or withdraw the open request first.'},cancellationEligibility:{allowed:false,reasonCode:'OPEN_REQUEST_EXISTS',explanation:'Resolve or withdraw the open request first.'}}],paymentBoundary:'No finance.',requests:[{id:'r',requestRef:'TPL-M3B',version:1,timeline:[]}],freshness:{asOf:'2026-09-24T00:00:00Z',timezone:'UTC'}};expect(validHotelBookingRequestSnapshot(value)).toBe(true);expect(validHotelBookingRequestSnapshot({...value,contractVersion:2})).toBe(false);});
 it('creates readable before/after labels',()=>expect(requestChangeSummary({stayStart:'2026-10-02',adults:3})).toEqual(['Check-in: 2026-10-02','Adults: 3']));
});
