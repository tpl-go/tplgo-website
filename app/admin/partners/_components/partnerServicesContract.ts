export type ServicesFilters={domain:string;service:string;country:string;state:string;city:string;status:string;preset:string;from:string;to:string};
export const defaultServicesFilters:ServicesFilters={domain:"",service:"",country:"",state:"",city:"",status:"",preset:"all",from:"",to:""};
export const servicesPermissions=["partner_verification.read","partner_service_catalogue.read"];
export const servicesParams=(f:ServicesFilters,extra:Record<string,string>={})=>{const q=new URLSearchParams();for(const [k,v] of Object.entries({...f,...extra}))if(v)q.set(k,v);return q.toString();};
export type ServicesRow={key:string;name:string;domain:string;status:string;partners:number;active:number;bookings:null;gmv:null;revenue:null;services:Array<{key:string;name:string;status:string}>;serviceCount?:number};
export type ServicesPage={rows:ServicesRow[];nextCursor:string|null;catalogueVersion:number|null;asOf:string};
export type ServicesOptions={rows:Array<{value:string;label:string}>;nextCursor:string|null;selectedLabel?:string|null};
export type ServicesPartners={rows:Array<{id:string;name:string;status:string;serviceStatus:string;profileHref:null;reviewHref:string}>;nextCursor:string|null};
const obj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==="object";
const str=(v:unknown)=>typeof v==="string"&&v.length<=500;
const cursor=(v:unknown)=>v===null||typeof v==="string"&&v.length<=180;
const count=(v:unknown):v is number=>typeof v==="number"&&Number.isSafeInteger(v)&&v>=0;
export function validServicesPage(v:unknown):v is ServicesPage{return obj(v)&&Array.isArray(v.rows)&&v.rows.length<=25&&cursor(v.nextCursor)&&(v.catalogueVersion===null||count(v.catalogueVersion))&&str(v.asOf)&&v.rows.every(r=>obj(r)&&[r.key,r.name,r.domain,r.status].every(str)&&count(r.partners)&&count(r.active)&&r.active<=r.partners&&[r.bookings,r.gmv,r.revenue].every(n=>n===null)&&Array.isArray(r.services)&&r.services.length<=5&&r.services.every(s=>obj(s)&&[s.key,s.name,s.status].every(str)));}
export function validServicesOptions(v:unknown):v is ServicesOptions{return obj(v)&&Array.isArray(v.rows)&&v.rows.length<=25&&cursor(v.nextCursor)&&v.rows.every(r=>obj(r)&&str(r.value)&&str(r.label));}
export function validServicesPartners(v:unknown):v is ServicesPartners{return obj(v)&&Array.isArray(v.rows)&&v.rows.length<=25&&cursor(v.nextCursor)&&v.rows.every(r=>obj(r)&&[r.id,r.name,r.status,r.serviceStatus].every(str)&&typeof r.id==="string"&&/^[0-9a-f-]{36}$/i.test(r.id)&&r.reviewHref===`/admin/partner-verification?organizationId=${r.id}`&&r.profileHref===null);}
