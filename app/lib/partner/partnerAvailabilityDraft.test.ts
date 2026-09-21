import {describe,expect,it} from 'vitest';
import {emptyPartnerAvailabilityDraft,validatePartnerAvailabilityDraft} from './partnerAvailabilityDraft';

const valid=()=>({...emptyPartnerAvailabilityDraft(),supplyItemId:'item-1',startDate:'2026-10-01',endDate:'2026-10-03',availableCapacity:'6'});
describe('Partner availability draft',()=>{
 it.each([['2026-02-29','2026-03-01'],['2026-10-03','2026-10-01']])('rejects invalid date range %s to %s',(startDate,endDate)=>expect(validatePartnerAvailabilityDraft({...valid(),startDate,endDate},8).ok).toBe(false));
 it.each(['','-1','1.5','9'])('rejects invalid or excessive capacity %s',(availableCapacity)=>expect(validatePartnerAvailabilityDraft({...valid(),availableCapacity},8).ok).toBe(false));
 it('preserves optimistic version and date-only fields while editing',()=>expect(validatePartnerAvailabilityDraft({...valid(),id:'availability-1',version:2,status:'closed'},8)).toEqual({ok:true,body:{...valid(),id:'availability-1',version:2,status:'closed',availableCapacity:6}}));
});
