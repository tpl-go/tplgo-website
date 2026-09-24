import {readFileSync} from "node:fs";
import {join} from "node:path";
import {expect,test} from "vitest";

const component=readFileSync(join(process.cwd(),"app/admin/_components/ContentGovernanceCatalogue.tsx"),"utf8");
const client=readFileSync(join(process.cwd(),"app/lib/admin/adminApiClient.ts"),"utf8");
const page=readFileSync(join(process.cwd(),"app/admin/website-experience/content-catalogue/page.tsx"),"utf8");
const partnerWeb=readFileSync(join(process.cwd(),"app/components/partner/PartnerSupplyWorkspace.tsx"),"utf8");
const partnerContract=readFileSync(join(process.cwd(),"app/lib/partner/partnerSupply.ts"),"utf8");

test("keeps Pages, Services and Content governance as explicit separate authorities",()=>{
 expect(component).toContain("Pages");
 expect(component).toContain("Service Catalogue");
 expect(component).toContain("Content & Attributes");
 expect(component).toContain("Amenities and options");
 expect(page).toContain('website_experience.catalogue.read');
});

test("exposes the guarded draft review publish lifecycle and immutable history",()=>{
 expect(client).toContain("saveContentGovernanceDraft");
 expect(client).toContain("submitContentGovernanceDraft");
 expect(client).toContain("reviewContentGovernanceDraft");
 expect(client).toContain("publishContentGovernanceDraft");
 expect(client).toContain("getContentGovernanceHistory");
 expect(component).toContain("Draft saved. Partner and customer surfaces are unchanged.");
 expect(component).toContain("Approved. It is still not published.");
 expect(component).toContain("Version history and audit");
 expect(component).toContain("window.confirm");
});

test("keeps saved drafts visible and reopens the detail-first approval flow",()=>{
 expect(component).toContain('aria-label="Saved drafts"');
 expect(component).toContain("Continue catalogue work");
 expect(component).toContain("Draft → Review → Approve → Publish");
 expect(component).toContain("Open draft");
 expect(component).toContain('getContentGovernanceCatalogue({status:"DRAFT",limit:"20"})');
 expect(component).toContain('Policy Templates');
 expect(component).toContain('Inclusions');
 expect(component).toContain('Exclusions');
 expect(component).toContain('entityTypeCounts');
 expect(component).toContain('window.history.replaceState');
 expect(component).toContain('New Boolean or Enum Hotel catalogue options');
 expect(component).toContain("setEditing(false)");
 expect(component).toContain("Submit for approval");
});

test("uses a bounded searchable catalogue with safe exports and a bounded print surface",()=>{
 for(const label of ["Capability family","Service","Scope","Category","Workflow state","Next page","CSV","XLSX","PDF","Print"])expect(component).toContain(label);
 expect(component).toContain('id="content-governance-print"');
 expect(component).toContain("body *{visibility:hidden!important}");
 expect(client).toContain("content-attribute-catalogue.${format}");
});

test("renders catalogue counts with explicit high-contrast typography",()=>{
 expect(component).toContain('backgroundColor:"#071426"');
 expect(component).toContain('borderColor:"#f59e0b"');
 expect(component).toContain('text-sm font-black uppercase tracking-wide');
 expect(component).toContain('text-2xl font-black leading-none');
 expect(component).toContain('color:"#ffffff",opacity:1');
});

test("labels the Jacuzzi proof as synthetic and avoids claiming a Hotel offers it",()=>{
 expect(component).toContain("HOTEL_PROPERTY_JACUZZI_QA");
 expect(component).toContain("Synthetic staging-only catalogue option");
 expect(component).toContain("It does not claim that a Hotel offers this amenity");
 expect(component).toContain("Publishing makes an option selectable. It does not claim that any Hotel offers it.");
});

test("retains canonical Partner catalogue consumption instead of a client-only amenity list",()=>{
 expect(partnerWeb).toContain("amenityCatalogue");
 expect(partnerContract).toContain("contentCatalogueVersion");
 expect(component).not.toContain("HOTEL_PROPERTY_WIFI");
});
