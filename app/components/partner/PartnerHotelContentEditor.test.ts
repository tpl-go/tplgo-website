import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {expect,test} from 'vitest';

const editor=readFileSync(join(process.cwd(),'app/components/partner/PartnerHotelContentEditor.tsx'),'utf8');
const workspace=readFileSync(join(process.cwd(),'app/components/partner/PartnerSupplyWorkspace.tsx'),'utf8');
const command=readFileSync(join(process.cwd(),'app/components/partner/PartnerCommandCenterView.tsx'),'utf8');

test('Hotel content stays scoped, standardized and review-gated',()=>{
 expect(editor).toContain('Property details');
 expect(editor).toContain('Room details');
 expect(editor).toContain('Standard amenities');
 expect(editor).toContain('Save and send for review');
 expect(editor).toContain('Needs changes');
 expect(editor).toContain('data.canReviewContent');
 expect(editor).not.toContain('dangerouslySetInnerHTML');
 expect(workspace).toContain("base+'/content'");
 expect(workspace).toContain("'/review'");
 expect(command).toContain('mode="content"');
});
