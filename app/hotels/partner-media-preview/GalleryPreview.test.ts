import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {expect,test} from 'vitest';

const source=readFileSync(join(process.cwd(),'app/hotels/partner-media-preview/GalleryPreview.tsx'),'utf8');

test('staging Hotel gallery consumes only the customer-safe approved projection',()=>{
 expect(source).toContain('/api/v1/public/staging/partner-hotels/');
 expect(source).toContain('approved media only');
 expect(source).toContain('approved content only');
 expect(source).toContain('/detail');
 expect(source).toContain('About this property');
 expect(source).toContain('Room details');
 expect(source).toContain('Pending or returned media stays private');
 expect(source).not.toContain('/api/v1/partner/organizations/');
 expect(source).not.toContain('storageReference');
 expect(source).not.toContain('signed');
});
