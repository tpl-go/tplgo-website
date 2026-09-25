import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe,expect,it} from 'vitest';
import {requestChangeSummary,validHotelBookingRequestSnapshot} from './partnerHotelBookingRequests';
const automation={mode:'MANUAL',provider:'NONE',autoDecisionEnabled:false,externalDeliveryEnabled:false};
const routing={attempts:1,routedAt:'2026-09-25T00:00:01Z',responseDueAt:'2026-09-25T00:30:01Z',respondedAt:null,reminderAt:null,escalatedAt:null,completedAt:null};
describe('HOTEL-M3B request contract',()=>{
 it('accepts only the bounded versioned routing shape',()=>{const value={contractVersion:2,audience:'partner',organizationId:'o',canSubmit:false,canReview:true,bookingEligibility:[{bookingId:'b',modificationEligibility:{allowed:false,reasonCode:'CUSTOMER_REQUEST_ONLY',explanation:'Only the customer submits.'},cancellationEligibility:{allowed:false,reasonCode:'CUSTOMER_REQUEST_ONLY',explanation:'Only the customer submits.'}}],automation,paymentBoundary:'No finance.',requests:[{id:'r',requestRef:'TPL-M3B',version:1,customerStatus:'Waiting for Hotel confirmation',routingStatus:'ROUTED',correlationId:'c',routing,automation,timeline:[]}],freshness:{asOf:'2026-09-25T00:00:00Z',timezone:'UTC'}};expect(validHotelBookingRequestSnapshot(value)).toBe(true);expect(validHotelBookingRequestSnapshot({...value,contractVersion:1})).toBe(false);});
 it('creates readable before/after labels',()=>expect(requestChangeSummary({stayStart:'2026-10-02',adults:3})).toEqual(['Check-in: 2026-10-02','Adults: 3']));
 it('keeps Admin decisions as an explicit inline two-step action',()=>{const source=readFileSync(resolve(process.cwd(),'app/components/partner/PartnerHotelBookingWorkspace.tsx'),'utf8');expect(source).toContain('Confirm approve & apply');expect(source).toContain("disabled={busy||decisionReason.trim().length<3}");expect(source).toContain('type="button"');});
 it('keeps customer submission and Hotel recommendation boundaries',()=>{const source=readFileSync(resolve(process.cwd(),'app/components/partner/PartnerHotelBookingWorkspace.tsx'),'utf8');expect(source).toContain('Only the booking customer can request a modification or cancellation from My Booking.');expect(source).toContain('Yes · Hotel can support request');expect(source).toContain('No · Hotel cannot support request');expect(source).toContain('TPL remains the final decision authority');expect(source).not.toContain('Submit modification request');expect(source).not.toContain('Submit cancellation request');expect(source).not.toContain('Withdraw my request');});
 it('keeps customer request actions in Manage Booking and polling read-only in View Details',()=>{
  const panel=readFileSync(resolve(process.cwd(),'app/components/account/HotelBookingRequestPanel.tsx'),'utf8');
  const detail=readFileSync(resolve(process.cwd(),'app/account/bookings/hotel/[bookingId]/page.tsx'),'utf8');
  const manage=readFileSync(resolve(process.cwd(),'app/hotels/manage/page.tsx'),'utf8');
  const layout=readFileSync(resolve(process.cwd(),'app/components/manage/hotel/HotelManageLayout.tsx'),'utf8');
  expect(detail).toContain('mode="status"');
  expect(manage).toContain('mode="manage"');
  expect(layout).toContain('"change-request"');
  expect(panel).toContain('initialLoading');
  expect(panel).toContain('setInterval(()=>void load(true),5_000)');
  expect(panel).toContain('Submitting once…');
  expect(panel).not.toContain("busy?'Working…'");
 });
});
