import {describe,it,expect} from "vitest";
import {defaultServicesFilters,servicesParams,validServicesPage,validServicesPartners,validServicesOptions} from "./partnerServicesContract";
describe("Services contract",()=>{
 it("encodes filters, separates real zero counts from unavailable financials",()=>{expect(new URLSearchParams(servicesParams({...defaultServicesFilters,country:"IN",state:"West Region"})).get("state")).toBe("West Region");expect(validServicesPage({rows:[{key:"qa",name:"QA",domain:"qa",status:"active",partners:0,active:0,bookings:null,gmv:null,revenue:null,services:[]}],nextCursor:null,catalogueVersion:1,asOf:"2026-09-19T00:00:00Z"})).toBe(true);});
 it("rejects oversized/malformed pages and unsafe profile links",()=>{expect(validServicesPage({rows:Array(26).fill({}),nextCursor:null})).toBe(false);expect(validServicesPartners({rows:[{id:"00000000-0000-4000-a000-000000000001",name:"QA",status:"active",serviceStatus:"draft",profileHref:null,reviewHref:"https://foreign.invalid"}],nextCursor:null})).toBe(false);expect(validServicesOptions({rows:[{value:"qa",label:"Exact name"}],nextCursor:null})).toBe(true);});
});
