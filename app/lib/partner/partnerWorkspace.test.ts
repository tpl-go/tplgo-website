import {describe,it,expect} from 'vitest';
import {validWorkspace} from './partnerWorkspace';
describe('Partner workspace version boundary',()=>{
 it('rejects an old or malformed contract rather than treating it as permission',()=>{expect(validWorkspace(null)).toBe(false);expect(validWorkspace({contractVersion:2})).toBe(false);expect(validWorkspace({contractVersion:1,organization:{id:'test',name:'Synthetic'}})).toBe(false);});
});
