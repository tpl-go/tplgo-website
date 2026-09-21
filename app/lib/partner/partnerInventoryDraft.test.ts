// @ts-nocheck -- the repository's Vitest v5 ambient declaration is intentionally runner-only.
import {describe,expect,it} from 'vitest';
import {emptyPartnerInventoryDraft,inventoryStableKey,validatePartnerInventoryDraft} from './partnerInventoryDraft';

const valid = () => ({...emptyPartnerInventoryDraft(),serviceScopeId:'scope-1',label:'Synthetic Deluxe Room — QA Only',capacityTotal:'6'});

describe('Partner inventory draft',()=>{
 it('derives a stable technical key without asking the Partner for one',()=>expect(inventoryStableKey(' Synthetic Deluxe Room — QA Only ')).toBe('synthetic-deluxe-room-qa-only'));
 it.each(['','-1','1.5','1000001'])('rejects invalid capacity %s',(capacityTotal:string)=>expect(validatePartnerInventoryDraft({...valid(),capacityTotal}).ok).toBe(false));
 it('preserves the stable key and optimistic version while editing',()=>expect(validatePartnerInventoryDraft({...valid(),id:'item-1',version:4,stableKey:'saved-key'})).toEqual({ok:true,body:{...valid(),id:'item-1',version:4,stableKey:'saved-key',label:'Synthetic Deluxe Room — QA Only',capacityTotal:6}}));
});
