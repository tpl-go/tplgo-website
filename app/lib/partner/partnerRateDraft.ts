export type PartnerRateDraft={id?:string;version?:number;supplyItemId:string;name:string;amount:string;validFrom:string;validTo:string;status:'draft'|'active'|'inactive'};
export const emptyPartnerRateDraft=():PartnerRateDraft=>({supplyItemId:'',name:'',amount:'',validFrom:'',validTo:'',status:'draft'});
const validDate=(value:string)=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
export function formatPartnerRateAmount(baseAmountMinor:number,currency:string){return new Intl.NumberFormat('en-IN',{style:'currency',currency,minimumFractionDigits:2,maximumFractionDigits:2}).format(baseAmountMinor/100);}
export function minorToRateAmount(baseAmountMinor:number){return `${Math.trunc(baseAmountMinor/100)}.${String(baseAmountMinor%100).padStart(2,'0')}`;}
export function validatePartnerRateDraft(draft:PartnerRateDraft,currency:string,maxAmountMinor:number):{ok:true;body:Record<string,unknown>}|{ok:false;message:string}{
 const name=draft.name.trim();if(!draft.supplyItemId)return {ok:false,message:'Choose the inventory item.'};if(!name||name.length>100)return {ok:false,message:'Enter a rate name up to 100 characters.'};
 if(!validDate(draft.validFrom)||!validDate(draft.validTo))return {ok:false,message:'Choose valid start and end dates.'};if(draft.validFrom>draft.validTo)return {ok:false,message:'End date must be on or after start date.'};
 const amount=draft.amount.trim();if(!/^\d+(?:\.\d{1,2})?$/.test(amount))return {ok:false,message:'Enter an amount with up to two decimal places.'};const [whole,fraction='']=amount.split('.');const minor=BigInt(whole!)*100n+BigInt(fraction.padEnd(2,'0'));if(minor>BigInt(maxAmountMinor))return {ok:false,message:'The amount exceeds the supported limit.'};
 return {ok:true,body:{id:draft.id,version:draft.version,supplyItemId:draft.supplyItemId,name,currency,baseAmountMinor:Number(minor),validFrom:draft.validFrom,validTo:draft.validTo,status:draft.status}};
}
