import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {expect,test} from 'vitest';

const editor=readFileSync(join(process.cwd(),'app/components/partner/PartnerHotelPolicyEditor.tsx'),'utf8');
const workspace=readFileSync(join(process.cwd(),'app/components/partner/PartnerSupplyWorkspace.tsx'),'utf8');
const contract=readFileSync(join(process.cwd(),'app/lib/partner/partnerSupply.ts'),'utf8');
const preview=readFileSync(join(process.cwd(),'app/hotels/partner-media-preview/GalleryPreview.tsx'),'utf8');

test('Hotel policy flow is structured, review-gated and uses the canonical Partner contract',()=>{
 for(const heading of ['Arrival & Departure','Guest & ID Rules','Children & Extra Guests','Pets, Smoking, Parties & Visitors','Quiet Hours & Other Property Rules','What’s Included','What’s Not Included'])expect(editor).toContain(heading);
 expect(editor).toContain('Save and send for review');
 expect(editor).toContain('data.canWritePolicies');
 expect(editor).toContain('data.canReviewPolicies');
 expect(editor).toContain('Approve these exact policies');
 expect(editor).not.toContain('dangerouslySetInnerHTML');
 expect(workspace).toContain("base+'/policies'");
 expect(workspace).toContain("'/review'");
 expect(contract).toContain('policyCatalogueVersion');
 expect(contract).toContain('PartnerHotelPolicyConfiguration');
 expect(contract).toContain('helpText?:string|null');
 expect(editor).toContain('Additional Published Policies');
 expect(editor).toContain('policyValues');
 expect(editor).toContain('Published options remain unselected');
 expect(preview).toContain('approved_policy_only');
 expect(preview).toContain('record.additionalPolicies?.length');
 expect(preview).toContain('Hotel policies awaiting approval');
});

test('bounded report includes canonical policies without final-price claims',()=>{
 expect(workspace).toContain('Hotel policies, inclusions &amp; exclusions');
 expect(workspace).toContain('No Hotel policy records.');
 expect(editor).toContain('No prices or final payable amount are calculated here.');
 expect(editor).not.toContain('GST');
 expect(editor).not.toContain('commission');
});
