// Local production-build harness. Synthetic sessions/content only; no live writes.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base='http://127.0.0.1:3137',out='.tmp/admin-partner-domain-browser';await mkdir(out,{recursive:true});
const admin={id:'synthetic-domain-admin',fullName:'Synthetic Admin',status:'active',roles:[],permissions:['partner_verification.read','partner_service_catalogue.read','partner_service_catalogue.manage','partner_service_catalogue.publish','website_experience.read']};
const session={admin,session:{id:'synthetic-session',token:'synthetic-local-only',expiresAt:'2099-01-01T00:00:00Z'}};
const root={id:'svc_esim-provider-root',stableCode:'esim-provider-root',domain:'esim-provider',name:'eSIM Provider',shortDescription:'eSIM connectivity providers.',icon:'briefcase',displayOrder:100,status:'inactive',published:true,countries:['IN'],individualAllowed:true,organizationAllowed:true,applicationSelectable:false,serviceApprovalRequired:true,verificationProfileKey:'manual_review',capabilities:['project_enquiries'],aliases:[]};
const content={items:[root],contentTree:{root:'Partner Experience',children:[]},workflow:{state:'approved'}};
const fixture={draft:content,published:{...content,workflow:{state:'published'}},preview:content,draftVersion:13,publishedVersion:9,status:'published',workflowState:'published',hasUnpublishedChanges:false,permissions:{canRead:true,canManage:true,canPublish:true},scheduling:{supported:true,reason:''},versions:[],audit:[],requestedServices:[],schema:{statuses:['active','inactive','archived'],capabilities:['project_enquiries'],editableFields:[],lockedFields:[],lifecycleActions:[],resolutionActions:[]}};
const browser=await chromium.launch({headless:true}),results=[];
try{for(const [width,height] of [[1365,1000],[390,844]]){
 const context=await browser.newContext({viewport:{width,height}});await context.addInitScript(s=>localStorage.setItem('tpl_admin_session_v1',JSON.stringify(s)),session);
 let workflow='published';const mutations=[],errors=[];
 await context.route('**/*',async route=>{const req=route.request(),url=new URL(req.url());if(!url.pathname.includes('/api/'))return url.origin===base?route.continue():route.abort();if(req.method()!=='GET'){mutations.push(url.pathname);return route.abort();}let data={};if(url.pathname.endsWith('/admin/me'))data=admin;else if(url.pathname.includes('service-catalogue'))data={...fixture,workflowState:workflow};else if(url.pathname.includes('schedules'))data={items:[],schedules:[],rows:[]};else if(url.pathname.includes('notifications'))data={notifications:[],unreadCount:0};return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,data,meta:{requestId:'synthetic',apiVersion:'v1'}})});});
 const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>{errors.push(e.message);console.log('SYNTHETIC_PAGE_ERROR',e.message);});page.on('dialog',dialog=>dialog.accept());
 const path='/admin/website-experience/pages/partner/service-catalogue';
 await page.goto(base+path);await page.getByText('eSIM Provider',{exact:true}).waitFor();
 await page.getByRole('link',{name:'Add Domain',exact:true}).click();await page.getByLabel('Domain name',{exact:true}).fill('eSIM & Connectivity');assert.equal(await page.getByLabel('Domain name',{exact:true}).inputValue(),'eSIM & Connectivity');
 await page.screenshot({path:`${out}/${width}-new-domain.png`,fullPage:true});
 workflow='approved';await page.reload();await page.getByLabel('Domain name',{exact:true}).waitFor();assert.equal(await page.getByLabel('Domain name',{exact:true}).isDisabled(),true);
 workflow='published';await page.reload();await page.getByLabel('Domain name',{exact:true}).fill('Next Domain');
 await page.goto(base+path+'/domains/esim-provider/services/new');const domain=page.getByRole('combobox',{name:/^Domain/});await domain.waitFor();assert.equal(await domain.inputValue(),'esim-provider');assert.equal(await domain.locator('option:checked').textContent(),'eSIM Provider');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);assert.deepEqual(mutations,[]);
 results.push({width,height,result:'PASS',checks:['exact saved domain name','new domain editable after published projection','genuine approved workflow still locked','new domain in service selector','no overflow','no mutation']});await context.close();
}}finally{await browser.close();await writeFile(out+'/results.json',JSON.stringify(results,null,2));}console.log(JSON.stringify(results));
