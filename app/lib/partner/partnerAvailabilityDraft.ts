export type PartnerAvailabilityDraft = {
  id?: string;
  version?: number;
  supplyItemId: string;
  startDate: string;
  endDate: string;
  availableCapacity: string;
  status: 'open' | 'closed';
};

export const emptyPartnerAvailabilityDraft = (): PartnerAvailabilityDraft => ({
  supplyItemId: '',
  startDate: '',
  endDate: '',
  availableCapacity: '',
  status: 'open',
});

const validDate=(value:string)=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;

export function validatePartnerAvailabilityDraft(draft:PartnerAvailabilityDraft,totalCapacity:number|undefined):{ok:true;body:Record<string,unknown>}|{ok:false;message:string}{
 if(!draft.supplyItemId)return {ok:false,message:'Choose the inventory item.'};
 if(!validDate(draft.startDate)||!validDate(draft.endDate))return {ok:false,message:'Choose valid start and end dates.'};
 if(draft.startDate>draft.endDate)return {ok:false,message:'End date must be on or after start date.'};
 if(!/^\d+$/.test(draft.availableCapacity))return {ok:false,message:'Enter available capacity as a whole number.'};
 const availableCapacity=Number(draft.availableCapacity);
 if(!Number.isSafeInteger(availableCapacity)||availableCapacity<0)return {ok:false,message:'Available capacity cannot be negative.'};
 if(totalCapacity===undefined)return {ok:false,message:'Refresh and choose an available inventory item.'};
 if(availableCapacity>totalCapacity)return {ok:false,message:`Available capacity cannot exceed total capacity (${totalCapacity}).`};
 return {ok:true,body:{...draft,availableCapacity}};
}
