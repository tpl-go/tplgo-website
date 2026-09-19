// Supported local production-build harness. All sessions/data are synthetic.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base='http://127.0.0.1:3144',out='.tmp/admin-partner-services-browser';await mkdir(out,{recursive:true});
const admin={id:'services-test-admin',fullName:'Synthetic Admin',status:'active',roles:[],permissions:['partner_verification.read','partner_service_catalogue.read']};
const session={admin,session:{id:'services-test-session',token:'local-synthetic-only',expiresAt:'2099-01-01T00:00:00Z'}};
const service={key:'qa-one',name:'Synthetic Connectivity',domain:'esim',status:'active',partners:2,active:1,bookings:null,gmv:null,revenue:null,services:[]};
const domains=[{...service,key:'esim',name:'eSIM Provider',services:[{key:'qa-one',name:service.name,status:'active'}],serviceCount:1},{...service,key:'currency',domain:'currency',name:'Currency Exchange',services:[],serviceCount:0}];
const id='00000000-0000-4000-a000-000000000001';
const browser=await chromium.launch({headless:true}),results=[];
try{for(const [width,height] of [[1365,1000],[768,1024],[390,844]]){
 const context=await browser.newContext({viewport:{width,height}});await context.addInitScript(s=>localStorage.setItem('tpl_admin_session_v1',JSON.stringify(s)),session);
 const requests=[],mutations=[];let fail=false,denied=false,delay=false,published=false;
 await context.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url()),q=u.searchParams;
  if(!u.pathname.includes('/api/'))return u.origin===base?route.continue():route.abort();
  if(req.method()!=='GET'){mutations.push(u.pathname);return route.abort();}
  requests.push({path:u.pathname,query:Object.fromEntries(q)});let status=200,data={};
  if(u.pathname.endsWith('/admin/me'))data=admin;
  else if(u.pathname.includes('/service-overview/')){
   if(delay)await new Promise(r=>setTimeout(r,900));
   if(fail)status=503;if(denied)status=403;
   data={contractVersion:1,catalogueVersion:published?2:1,asOf:'2026-09-19T12:00:00Z',nextCursor:null};
   if(u.pathname.endsWith('/options')){
    const opts={domain:[{value:'esim',label:'eSIM Provider'},{value:'currency',label:'Currency Exchange'}],service:[{value:'qa-one',label:service.name}],country:[{value:'IN',label:'India'}],state:[{value:'West Region',label:'West Region'}],city:[{value:'QA City',label:'QA City'}]};
    data.rows=opts[q.get('field')]??[];data.selectedLabel=data.rows.find(r=>r.value===q.get(q.get('field')))?.label??null;
    if(q.get('term'))data.rows=data.rows.filter(r=>r.label.toLowerCase().includes(q.get('term').toLowerCase()));
   }else if(u.pathname.endsWith('/domains'))data.rows=[...domains,...(published?[{...domains[0],key:'new',domain:'new',name:'Published Later Domain'}]:[])].filter(r=>!q.get('domain')||r.key===q.get('domain'));
   else if(u.pathname.endsWith('/services')){data.rows=[{...service,name:q.get('after')?'Second Published Service':service.name}];data.nextCursor=q.get('after')?null:'qa-one';}
   else if(u.pathname.endsWith('/partners'))data.rows=[{id,name:'Synthetic Service Partner',status:'active',serviceStatus:'draft',profileHref:null,reviewHref:`/admin/partner-verification?organizationId=${id}`}];
  }
  await route.fulfill({status,contentType:'application/json',body:JSON.stringify(status===200?{ok:true,data,meta:{requestId:'synthetic',apiVersion:'v1'}}:{ok:false,error:{code:'SYNTHETIC_TEST_ERROR',message:'Synthetic test failure'},meta:{requestId:'synthetic',apiVersion:'v1'}})});
 });
 const page=await context.newPage();await page.goto(base+'/admin/partners?view=services');
 await page.getByRole('heading',{name:'Domain-wise Service Overview',exact:true}).waitFor();
 const overview=page.getByRole('region',{name:'Domain-wise Service Overview'}),table=page.getByRole('region',{name:'Service Directory'});
 await overview.getByRole('button',{name:'eSIM Provider',exact:true}).waitFor();assert.equal(await overview.getByRole('button',{name:'Currency Exchange',exact:true}).count(),1);
 await table.getByRole('button',{name:'View partners for Synthetic Connectivity'}).waitFor();
 assert.equal(await table.getByRole('columnheader',{name:'Active',exact:true}).count(),1);
 await table.getByRole('button',{name:'Next',exact:true}).click();await table.getByRole('rowheader',{name:'Second Published Service'}).waitFor();await table.getByRole('button',{name:'Previous',exact:true}).click();
 await page.getByRole('button',{name:'Domain All domains',exact:true}).click();await page.getByRole('textbox',{name:'Search Domain'}).fill('esim');await page.waitForTimeout(350);await page.getByRole('group',{name:'Domain choices'}).getByRole('button',{name:'eSIM Provider',exact:true}).click();
 await page.getByRole('button',{name:'Service All services',exact:true}).click();await page.getByRole('group',{name:'Service choices'}).getByRole('button',{name:service.name,exact:true}).click();
 await page.getByRole('button',{name:'Location · Country All countries',exact:true}).click();await page.getByRole('button',{name:'India',exact:true}).click();
 await page.getByRole('button',{name:'State / Region All states',exact:true}).click();await page.getByRole('button',{name:'West Region',exact:true}).click();
 await page.getByRole('button',{name:'City All cities',exact:true}).click();await page.getByRole('button',{name:'QA City',exact:true}).click();
 await page.getByRole('combobox',{name:'Services Date Range',exact:true}).selectOption('custom');await page.getByLabel('From',{exact:true}).fill('2026-09-01');await page.getByLabel('To',{exact:true}).fill('2026-09-18');await page.getByRole('button',{name:'Apply Filters',exact:true}).click();
 await table.getByRole('button',{name:'View partners for Synthetic Connectivity'}).waitFor();assert(requests.some(r=>r.path.endsWith('/services')&&r.query.country==='IN'&&r.query.city==='QA City'&&r.query.from==='2026-09-01'));
 await table.getByRole('button',{name:'View partners for Synthetic Connectivity'}).click();await page.getByRole('link',{name:'Open Partner record',exact:true}).waitFor();assert.equal(await page.getByRole('link',{name:'Open Partner record',exact:true}).getAttribute('href'),`/admin/partner-verification?organizationId=${id}`);
 assert.equal(await page.getByText('Synthetic Service Partner',{exact:true}).count(),1);await page.getByRole('button',{name:'Back to services',exact:true}).click();
 await page.getByRole('button',{name:'Reset Filters',exact:true}).click();await overview.getByRole('button',{name:'Currency Exchange',exact:true}).waitFor();
 await page.getByRole('button',{name:'Domain All domains',exact:true}).click();await page.getByRole('textbox',{name:'Search Domain'}).press('Escape');assert.equal(await page.getByRole('button',{name:'Domain All domains',exact:true}).getAttribute('aria-expanded'),'false');assert(await page.getByRole('button',{name:'Domain All domains',exact:true}).evaluate(el=>el===document.activeElement));
 published=true;await page.getByRole('button',{name:'Refresh',exact:true}).click();await overview.getByRole('button',{name:'Published Later Domain',exact:true}).waitFor();
 await page.screenshot({path:`${out}/${width}.png`,fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 fail=true;await page.getByRole('button',{name:'Refresh',exact:true}).click();await page.getByText('Services could not be loaded.',{exact:true}).first().waitFor();fail=false;await page.getByRole('button',{name:'Retry',exact:true}).first().click();await overview.getByRole('button',{name:'eSIM Provider',exact:true}).waitFor();
 denied=true;await page.getByRole('button',{name:'Refresh',exact:true}).click();await page.getByText('Services requires Partner catalogue access.',{exact:true}).first().waitFor();denied=false;
 delay=true;await page.getByRole('button',{name:'Refresh',exact:true}).click();await page.evaluate(()=>{localStorage.removeItem('tpl_admin_session_v1');window.dispatchEvent(new Event('storage'));});await page.waitForTimeout(1300);assert.equal(await page.getByText('Synthetic Service Partner',{exact:true}).count(),0);assert.equal(await page.getByRole('button',{name:'eSIM Provider',exact:true}).count(),0);
 assert.equal(mutations.length,0);results.push({width,height,result:'PASS',mutations:0,checks:['published exact names','service metrics','pagination','dependent location/catalogue filters','date cohort','service-to-Partner drill-down','safe existing record link','reset','keyboard Escape/focus','new publication after refresh','no horizontal overflow','retry','RBAC denial','logout delayed-response isolation']});await context.close();
}}finally{await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));await browser.close();}console.log(JSON.stringify(results));
