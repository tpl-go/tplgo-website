// Synthetic local built-app tests only. No real sessions or Partner records.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base='http://127.0.0.1:3136', out='.tmp/admin-partner-summary-browser';await mkdir(out,{recursive:true});
const admin={id:'summary-synthetic-admin',fullName:'Synthetic Admin',email:'',status:'active',roles:[],permissions:['partner_verification.read','partner_application.read','partner_service_catalogue.read']};
const session={admin,session:{id:'synthetic-session',token:'synthetic-local-only',createdAt:'2026-01-01T00:00:00Z',expiresAt:'2099-01-01T00:00:00Z'}};
const fixture={asOf:'2026-09-19T10:00:00Z',monthStart:'2026-09-01T00:00:00Z',timezone:'UTC',maxAgeSeconds:30,partners:{total:100004,active:0,new:234,suspended:2,inactive:null,underReview:5},applications:{total:102,new:8,underReview:5,documentsPending:null,approved:84,rejected:5,pending:13},business:{total:null,completed:null,pending:null,cancelled:null,gmv:null},financial:{gmv:null,revenue:null,payable:null,settled:null,pendingSettlement:null},attention:{kyc:null,paymentIssues:null,settlementsDue:null,documentsExpiring:7,suspended:2},coverage:{applications:true,finance:false,bookings:false,inactive:false,kyc:false},domains:{available:true,restricted:false,rows:[],nextCursor:null}};
const names=['Stay & Accommodation','Travel Agency','DMC & Tour Operators','Transport & Mobility','Experiences, Activities & Adventure','Medical Tourism & Healthcare','Professional & Local Services','Currency'];
const rows=names.map((name,index)=>({key:'domain-'+index,name,partners:index+1,bookings:null,gmv:null,revenue:null}));
const results=[],browser=await chromium.launch({headless:true});
try {for(const [width,height] of [[1365,1000],[768,1024],[390,844]]){
 const context=await browser.newContext({viewport:{width,height}});await context.addInitScript(value=>localStorage.setItem('tpl_admin_session_v1',JSON.stringify(value)),session);
 let mode='ok',release;const requests=[],mutations=[],errors=[];
 await context.route('**/*',async route=>{const req=route.request(),url=new URL(req.url());if(!url.pathname.includes('/api/'))return url.origin===base?route.continue():route.abort();if(req.method()!=='GET'){mutations.push(url.pathname);return route.abort();}let data={};if(url.pathname.endsWith('/admin/me'))data=admin;else if(url.pathname.endsWith('/admin/notifications'))data={unreadCount:0,notifications:[]};else if(url.pathname.endsWith('/partners/summary')){
 requests.push({limit:url.searchParams.get('limit'),search:url.searchParams.get('search'),after:url.searchParams.get('after')});
 if(mode==='delay')await new Promise(resolve=>{release=resolve;});
 if(mode==='error'||mode==='unauthorized')return route.fulfill({status:mode==='error'?503:401,contentType:'application/json',body:JSON.stringify({ok:false,error:{code:'SYNTHETIC_UNAVAILABLE',message:'Unavailable'},meta:{requestId:'synthetic',apiVersion:'v1'}})});
 data=mode==='malformed'?{}:structuredClone(fixture);if(mode!=='malformed'){data.domains.rows=url.searchParams.get('search')?rows.filter(r=>r.name.toLowerCase().includes(url.searchParams.get('search').toLowerCase())):url.searchParams.get('after')?[{...rows[0],key:'domain-last',name:'Other / Emerging'}]:rows;data.domains.nextCursor=!url.searchParams.get('search')&&!url.searchParams.get('after')?'domain-7':null;}
 } else if(url.pathname.startsWith('/api/v1/admin/partner'))throw Error('Unexpected Partner API');
 return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,data,meta:{requestId:'synthetic',apiVersion:'v1'}})});});
 const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/admin/partners');
 const summary=page.locator('[data-partner-summary]');await summary.getByText('Updated', {exact:false}).waitFor();
 assert.equal(await page.locator('[aria-label="Key metrics"] > a').count(),8);
 assert.deepEqual(await summary.getByRole('heading',{level:3}).allTextContents(),['Partner Health','Applications','Business Snapshot','Domain Performance','Financial Snapshot','Attention Required']);
 assert.ok((await page.getByRole('region',{name:'Partner Health',exact:true}).getByRole('link',{name:/^Active 0$/}).textContent()).includes('0'));
 assert.ok(!(await summary.textContent()).includes('₹0'));
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:`${out}/${width}-summary.png`,fullPage:true});
 const domains=page.getByRole('region',{name:'Domain Performance',exact:true});
 await domains.getByRole('button',{name:'Next',exact:true}).click();await domains.getByText('Other / Emerging',{exact:true}).waitFor();assert.equal(requests.at(-1).after,'domain-7');
 await domains.getByRole('button',{name:'Previous',exact:true}).click();await domains.getByText('Stay & Accommodation',{exact:true}).waitFor();
 await domains.getByLabel('Search domains',{exact:true}).fill('currency');await domains.getByRole('button',{name:'Search',exact:true}).click();await domains.getByText('Currency',{exact:true}).waitFor();await page.waitForLoadState('networkidle');assert.equal(requests.at(-1).search,'currency');assert.equal(await domains.locator('tbody tr').count(),1);
 await domains.getByRole('link',{name:'View Currency services',exact:true}).click();await page.getByText('Selected filter: Domain: domain 7',{exact:true}).waitFor();assert.equal(new URL(page.url()).searchParams.get('view'),'services');
 await page.goto(base+'/admin/partners');await summary.getByText('Updated',{exact:false}).waitFor();
 await page.locator('[aria-label="Key metrics"]').getByRole('link',{name:'Active Partners',exact:false}).click();await page.getByRole('heading',{level:3,name:'Active',exact:true}).waitFor();assert.equal(new URL(page.url()).searchParams.get('view'),'active');
 await page.goto(base+'/admin/partners');await summary.getByText('Updated',{exact:false}).waitFor();
 await page.getByRole('region',{name:'Attention Required',exact:true}).getByRole('link',{name:'Payment Issues',exact:false}).click();await page.getByText('Selected filter: Payment issues',{exact:true}).waitFor();
 await page.goto(base+'/admin/partners');await summary.getByText('Updated',{exact:false}).waitFor();
 mode='error';await summary.getByRole('button',{name:'Refresh',exact:true}).click();await summary.getByRole('alert').waitFor();assert.ok(!(await summary.textContent()).includes('1,00,004'));
 mode='ok';await summary.getByRole('button',{name:'Refresh',exact:true}).click();await summary.getByText('Updated',{exact:false}).waitFor();
 mode='malformed';await summary.getByRole('button',{name:'Refresh',exact:true}).click();await summary.getByRole('alert').waitFor();assert.ok(!(await summary.textContent()).includes('NaN'));
 mode='ok';await summary.getByRole('button',{name:'Refresh',exact:true}).click();await summary.getByText('Updated',{exact:false}).waitFor();
 mode='delay';await summary.getByRole('button',{name:'Refresh',exact:true}).click();await summary.getByText('Updating summary…',{exact:true}).waitFor();
 await page.evaluate(value=>localStorage.setItem('tpl_admin_session_v1',JSON.stringify(value)),{...session,admin:{...admin,id:'another-synthetic-admin'},session:{...session.session,token:'another-local-test-only'}});
 while(!release)await new Promise(resolve=>setTimeout(resolve,20));mode='ok';release();await page.getByText('Partner summary requires Partner review access.',{exact:false}).waitFor();assert.equal(await page.locator('[aria-label="Key metrics"]').count(),0);
 assert.deepEqual(mutations,[]);assert.deepEqual(errors,[]);assert.ok(requests.every(r=>r.limit==='8'));
 results.push({width,height,result:'PASS',checks:['eight KPIs','section order','real zero vs unavailable','no overflow','server domain pagination/search','active/domain/alert drilldowns','error/retry','malformed response','delayed old-admin response denied'],mutations:0});await context.close();
 }}finally{await browser.close();await writeFile(out+'/results.json',JSON.stringify(results,null,2));}console.log(JSON.stringify(results));
