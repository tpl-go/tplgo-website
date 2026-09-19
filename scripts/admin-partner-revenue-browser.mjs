// Local built-app tests only. Synthetic API/session fixtures never reach staging.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base='http://127.0.0.1:3142',out='.tmp/admin-partner-revenue-browser';
await mkdir(out,{recursive:true});
const admin={id:'synthetic-revenue-admin',fullName:'Synthetic Admin',status:'active',roles:[],permissions:['partner_verification.read','partner_service_catalogue.read','payments.read','partner_payout_tax.read']};
const session={admin,session:{id:'synthetic-revenue-session',token:'synthetic-local-only',expiresAt:'2099-01-01T00:00:00Z'}};
const amounts=Object.fromEntries(['gmv','revenue','payable','settled','pending','refunds','adjustments'].map(k=>[k,null]));
const overview={contractVersion:1,asOf:'2026-09-19T12:00:00Z',timezone:'UTC',currency:null,period:{from:'2026-08-21',to:'2026-09-19'},coverage:{revenue:'not_connected',settlements:'not_connected',partnerRanking:'not_connected'},amounts,trend:[],settlement:{settled:null,pending:null,payable:null,partnersAwaitingSettlement:null,failedSettlements:null,balanceAsOf:null},filterPolicy:{presets:['today','yesterday','last7','last30','thisMonth','previousMonth','thisQuarter','previousQuarter','thisYear','custom'],grains:['daily','weekly','monthly'],maxRangeDays:366}};
const domainRows=[{key:'currency',name:'Currency Exchange',...amounts},{key:'esim',name:'eSIM Provider',...amounts}];
const browser=await chromium.launch({headless:true}),results=[];
try { for(const [width,height] of [[1365,1000],[768,1024],[390,844]]) {
  const context=await browser.newContext({viewport:{width,height}});
  await context.addInitScript(s=>localStorage.setItem('tpl_admin_session_v1',JSON.stringify(s)),session);
  const requests=[],mutations=[],errors=[];let failing=false,connected=false,delay=false,deny=false;
  await context.route('**/*',async route=>{
    const request=route.request(),url=new URL(request.url()),q=url.searchParams;
    if(!url.pathname.includes('/api/')) return url.origin===base?route.continue():route.abort();
    if(request.method()!=='GET'){mutations.push(url.pathname);return route.abort();}
    requests.push({path:url.pathname,query:Object.fromEntries(q)});let data={},status=200;
    if(url.pathname.endsWith('/admin/me'))data=admin;
    else if(url.pathname.includes('/revenue/overview')){
      if(delay)await new Promise(r=>setTimeout(r,900));data=structuredClone(overview);
      if(failing)status=503;if(deny)status=403;
      if(q.get('preset')==='custom')data.period={from:q.get('from'),to:q.get('to')};
      if(connected){data.currency='INR';data.coverage={revenue:'available',settlements:'available',partnerRanking:'available'};data.amounts={gmv:1000000,revenue:120000,payable:700000,settled:500000,pending:200000,refunds:10000,adjustments:-500};data.trend=[{date:'2026-09-01',gmv:300000,revenue:40000,payable:200000},{date:'2026-09-02',gmv:700000,revenue:80000,payable:500000}];data.settlement={settled:500000,pending:200000,payable:700000,partnersAwaitingSettlement:2,failedSettlements:0,balanceAsOf:'2026-09-19T12:00:00Z'};}
    } else if(url.pathname.includes('/revenue/options')){
      data={rows:q.get('field')==='domain'?[{value:'currency',label:'Currency Exchange'},{value:'esim',label:'eSIM Provider'}]:[{value:'qa-service',label:'QA Connectivity'}],nextCursor:null};
      if(q.get('term')==='zzzz')data.rows=[];
    } else if(url.pathname.includes('/revenue/domains')){
      data={available:connected,catalogueAvailable:true,currency:connected?'INR':null,rows:q.get('domain')?domainRows.filter(r=>r.key===q.get('domain')):q.get('after')?[domainRows[1]]:[domainRows[0]],nextCursor:q.get('domain')||q.get('after')?null:'currency'};
      if(connected)data.rows=data.rows.map(r=>({...r,gmv:1000000,revenue:120000,payable:700000,settled:500000,pending:200000,refunds:10000,adjustments:-500}));
    } else if(url.pathname.includes('/revenue/partners'))data={available:connected,currency:connected?'INR':null,rows:connected?[{id:'00000000-0000-4000-a000-000000000001',name:q.get('after')?'Second Synthetic Partner':'Synthetic Revenue Partner',domain:'eSIM Provider',service:'QA Connectivity',gmv:1000000,revenue:120000,payable:700000}]:[],nextCursor:connected&&!q.get('after')?'next-rank':null};
    else if(url.pathname.includes('notifications'))data={notifications:[],unreadCount:0};
    else if(url.pathname.includes('schedules'))data={rows:[]};
    await route.fulfill({status,contentType:'application/json',body:JSON.stringify(status===200?{ok:true,data,meta:{requestId:'synthetic',apiVersion:'v1'}}:{ok:false,error:{code:status===403?'FORBIDDEN':'UNAVAILABLE',message:'Synthetic failure'},meta:{requestId:'synthetic',apiVersion:'v1'}})});
  });
  const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/admin/partners?view=revenue');await page.getByText('Revenue trends are not available yet.',{exact:true}).waitFor();
  assert.equal(await page.getByRole('region',{name:'Revenue KPIs',exact:true}).locator('article').count(),6);
  assert.equal(await page.locator('[data-partner-summary],[data-partner-performance]').count(),0);
  const domains=page.getByRole('region',{name:'Domain-wise Revenue',exact:true});await domains.getByText('Currency Exchange',{exact:true}).waitFor();
  await domains.getByRole('button',{name:'Next',exact:true}).click();await domains.getByText('eSIM Provider',{exact:true}).waitFor();await domains.getByRole('button',{name:'Previous',exact:true}).click();await domains.getByText('Currency Exchange',{exact:true}).waitFor();
  const ranking=page.getByRole('region',{name:'Top Revenue-generating Partners',exact:true});await ranking.scrollIntoViewIfNeeded();await page.getByText('Partner revenue rankings are not available yet.',{exact:true}).waitFor();
  await page.screenshot({path:`${out}/${width}-unavailable.png`,fullPage:true});
  const domain=page.getByRole('button',{name:'Domain All domains',exact:true});await domain.click();await page.getByLabel('Search Domain',{exact:true}).fill('zzzz');await page.getByText('No matching results.',{exact:true}).waitFor();await page.keyboard.press('Escape');assert.equal(await domain.getAttribute('aria-expanded'),'false');assert.equal(await domain.evaluate(el=>el===document.activeElement),true);
  await domain.click();await page.getByRole('button',{name:'eSIM Provider',exact:true}).click();await page.getByRole('button',{name:'Service All services',exact:true}).click();await page.getByRole('button',{name:'QA Connectivity',exact:true}).click();
  await page.getByRole('button',{name:'Apply Filters',exact:true}).click();await domains.getByText('eSIM Provider',{exact:true}).waitFor();assert.ok(requests.some(r=>r.path.endsWith('/overview')&&r.query.domain==='esim'&&r.query.service==='qa-service'));
  await page.getByLabel('Revenue Date Range',{exact:true}).selectOption('custom');await page.getByLabel('From',{exact:true}).fill('2026-09-01');await page.getByLabel('To',{exact:true}).fill('2026-09-18');await page.getByRole('button',{name:'Apply Filters',exact:true}).click();await page.getByText('2026-09-01 — 2026-09-18',{exact:true}).waitFor();
  await page.getByLabel('Revenue trend interval',{exact:true}).selectOption('monthly');await page.getByText('Revenue trends are not available yet.',{exact:true}).waitFor();assert.ok(requests.some(r=>r.path.endsWith('/overview')&&r.query.grain==='monthly'));
  await page.getByRole('button',{name:'Reset Filters',exact:true}).click();await domains.getByText('Currency Exchange',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Service All services',exact:true}).isDisabled(),true);
  failing=true;await page.getByRole('button',{name:'Refresh',exact:true}).click();await page.getByText('Revenue could not be loaded.',{exact:true}).waitFor();assert.equal(await page.locator('article').count(),0);failing=false;await page.getByRole('button',{name:'Retry',exact:true}).click();await page.getByText('Revenue trends are not available yet.',{exact:true}).waitFor();
  connected=true;await page.getByRole('button',{name:'Refresh',exact:true}).click();await page.getByLabel('Inspect revenue date',{exact:true}).waitFor();await page.getByRole('button',{name:'GMV',exact:true}).click();await page.getByLabel('Inspect revenue date',{exact:true}).fill('1');assert.equal(await page.getByRole('button',{name:'GMV',exact:true}).getAttribute('aria-pressed'),'true');
  await ranking.scrollIntoViewIfNeeded();await page.getByText('Synthetic Revenue Partner',{exact:true}).waitFor();await ranking.getByRole('button',{name:'Next',exact:true}).click();await page.getByText('Second Synthetic Partner',{exact:true}).waitFor();await ranking.getByRole('button',{name:'Previous',exact:true}).click();await page.getByText('Synthetic Revenue Partner',{exact:true}).waitFor();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:`${out}/${width}-synthetic-financial.png`,fullPage:true});
  deny=true;await page.getByRole('button',{name:'Refresh',exact:true}).click();await page.getByText('Revenue requires Partner financial reporting access.',{exact:true}).waitFor();assert.equal(await page.locator('article').count(),0);deny=false;
  await page.getByRole('button',{name:'Refresh',exact:true}).click();await page.getByLabel('Inspect revenue date',{exact:true}).waitFor();delay=true;await page.getByRole('button',{name:'Refresh',exact:true}).click();await page.evaluate(()=>{localStorage.removeItem('tpl_admin_session_v1');window.dispatchEvent(new StorageEvent('storage',{key:'tpl_admin_session_v1'}));});await page.waitForTimeout(1200);assert.equal(await page.locator('article').count(),0);assert.equal(await page.getByText('Synthetic Revenue Partner',{exact:true}).count(),0);
  assert.deepEqual(errors,[]);assert.deepEqual(mutations,[]);results.push({width,height,result:'PASS',mutations:0,requests:requests.length,checks:['six KPIs','unavailable not zero','published exact names','domain pagination','search/Escape/focus','dependent service','applied custom dates','interval','reset','error/retry','synthetic chart interaction','server-ranked page contract','no overflow','financial permission denial','logout delayed-response isolation']});await context.close();
}} finally {await browser.close();await writeFile(out+'/results.json',JSON.stringify(results,null,2));}
console.log(JSON.stringify(results));
