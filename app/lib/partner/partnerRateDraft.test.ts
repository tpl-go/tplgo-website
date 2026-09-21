import {describe,expect,it} from 'vitest';
import {emptyPartnerRateDraft,minorToRateAmount,validatePartnerRateDraft} from './partnerRateDraft';
const valid=()=>({...emptyPartnerRateDraft(),supplyItemId:'item-1',name:'Synthetic Base Rate — QA Only',amount:'1250.00',validFrom:'2026-10-01',validTo:'2026-10-03'});
describe('Partner base-rate draft',()=>{
 it.each(['','-1','1.234','NaN','Infinity'])('rejects unsafe amount %s',amount=>expect(validatePartnerRateDraft({...valid(),amount},'INR',999999999999).ok).toBe(false));
 it('allows zero because the canonical database contract allows zero',()=>expect(validatePartnerRateDraft({...valid(),amount:'0'},'INR',999999999999)).toMatchObject({ok:true,body:{baseAmountMinor:0}}));
 it('converts major-unit input to exact integer minor units',()=>expect(validatePartnerRateDraft({...valid(),amount:'1275.50',id:'rate-1',version:2},'INR',999999999999)).toEqual({ok:true,body:{id:'rate-1',version:2,supplyItemId:'item-1',name:'Synthetic Base Rate — QA Only',currency:'INR',baseAmountMinor:127550,validFrom:'2026-10-01',validTo:'2026-10-03',status:'draft'}}));
 it('rejects reversed or invalid calendar dates',()=>{expect(validatePartnerRateDraft({...valid(),validFrom:'2026-10-04'},'INR',999999999999).ok).toBe(false);expect(validatePartnerRateDraft({...valid(),validFrom:'2026-02-29'},'INR',999999999999).ok).toBe(false);});
 it('formats stored minor units without floating input parsing',()=>expect(minorToRateAmount(127500)).toBe('1275.00'));
});
