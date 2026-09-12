import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const browser=await chromium.launch({headless:true});
const evidence=[];
await mkdir('tmp/s8e722-artifacts',{recursive:true});
try {
 for(const width of [1363,768,390]) for(const channel of ['mobile','email']) {
  const context=await browser.newContext({viewport:{width,height:950}});
  const page=await context.newPage(); const calls={start:0,verify:0,complete:0,resolver:0}; let canonical=false;
  const safeUser=()=>({id:canonical?'canonical-fixture':'source-fixture',publicId:'QA',mobile:'',email:'',fullName:'Recovery QA',accountType:'partner',capabilities:[]});
  const expiresAt=new Date(Date.now()+300000).toISOString();
  await context.route('https://api-staging.tplgo.com/**',async route=>{
   const path=new URL(route.request().url()).pathname; let data={};
   if(path==='/api/v1/auth/session'||path==='/api/v1/me') data={user:safeUser(),session:{token:'synthetic-browser-session',expiresAt}};
   if(path==='/api/v1/partner/access') { calls.resolver++; data={outcome:'NO_LINKED_PROFILE',organizationId:null,step:null}; }
   if(path==='/api/v1/partner/application/submission') data={latestSubmission:null,readiness:{organizationId:'00000000-0000-4000-8000-000000000002',applicationStatus:'APPROVED',organization:{brandName:'Recovery Fixture Business',legalName:'Recovery Fixture Business'}}};
   if(path.endsWith('/recovery/start')) {calls.start++; data={accepted:true,challenge:'00000000-0000-4000-8000-000000000001',expiresAt,resendAvailableAt:new Date(Date.now()+60000).toISOString()};}
   if(path.endsWith('/recovery/verify')) {calls.verify++;data={displayName:'Recovery Fixture Business',reference:null,statusLabel:'Application in progress'};}
   if(path.endsWith('/recovery/complete')) {calls.complete++;canonical=true;data={session:{token:'synthetic-canonical-session',expiresAt},access:{outcome:'ACTIVE',organizationId:'00000000-0000-4000-8000-000000000002',step:null}};}
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,data,meta:{requestId:'browser-fixture',apiVersion:'v1'}})});
  });
  await page.goto('http://127.0.0.1:3122/partner-access');
  await page.getByRole('button',{name:'Recover existing application',exact:true}).click();
  await page.getByRole('heading',{name:'Find your Partner application'}).waitFor();
  await page.getByRole('combobox',{name:'Registered contact'}).selectOption(channel);
  await page.getByLabel(channel==='mobile'?'Registered mobile number':'Registered email',{exact:true}).fill(channel==='mobile'?'+999123456789':'old@recovery.example.test');
  await page.getByRole('button',{name:'Send verification code',exact:true}).dblclick();
  await page.getByRole('heading',{name:'Verify ownership'}).waitFor();
  assert.equal(calls.start,1);assert.equal(await page.getByRole('button',{name:/Resend in/}).isDisabled(),true);
  await page.getByLabel('Verification code',{exact:true}).fill('123456');
  await page.getByRole('button',{name:'Verify code',exact:true}).dblclick();
  await page.getByRole('heading',{name:'Confirm account recovery'}).waitFor();
  assert.equal(calls.verify,1);assert.equal(calls.complete,0);
  const body=await page.locator('body').innerText();
  for(const forbidden of ['My Account','My Bookings','NO_LINKED_PROFILE','DRAFT_INCOMPLETE','old@recovery.example.test','+999123456789']) assert.ok(!body.includes(forbidden));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
  await page.screenshot({path:`tmp/s8e722-artifacts/confirmation-${channel}-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:'Confirm recovery',exact:true}).dblclick();
  try { await page.getByText('Your Partner account is active',{exact:true}).waitFor({timeout:10000}); } catch(error) { console.log(JSON.stringify({safeSyntheticBody:await page.locator('body').innerText(),calls})); throw error; }
  assert.equal(calls.complete,1);assert.equal(calls.resolver,1);
  evidence.push({width,channel,explicitConfirmation:true,singleRequests:true,canonicalSessionBeforeResume:true,noConsumerShell:true,noOverflow:true});
  await context.close();
 }
 for(const mode of ['attempts','expiry','review','cancel']) {
  const context=await browser.newContext({viewport:{width:390,height:950}});const page=await context.newPage();await page.clock.install();let starts=0;
  await context.route('https://api-staging.tplgo.com/**',async route=>{
   const path=new URL(route.request().url()).pathname;let data={},status=200;
   if(path==='/api/v1/auth/session'||path==='/api/v1/me') data={user:{id:'negative-fixture',fullName:'Recovery QA',mobile:'',email:'',accountType:'partner'},session:{token:'synthetic-session',expiresAt:'2030-01-01T00:00:00Z'}};
   if(path==='/api/v1/partner/access') data={outcome:'NO_LINKED_PROFILE',organizationId:null,step:null};
   if(path.endsWith('/recovery/start')) { starts++;data={accepted:true,challenge:'00000000-0000-4000-8000-000000000001',expiresAt:new Date(Date.now()+(mode==='expiry'?-1000:300000)).toISOString(),resendAvailableAt:new Date(Date.now()+60000).toISOString()}; }
   if(path.endsWith('/recovery/verify')) status=mode==='review'?409:400;
   await route.fulfill({status,contentType:'application/json',body:JSON.stringify(status===200?{ok:true,data}:{ok:false,error:{code:'PRIVATE_COLLISION',message:'private contact detail'}})});
  });
  await page.goto('http://127.0.0.1:3122/partner-access');await page.getByRole('button',{name:'Recover existing application',exact:true}).click();
  await page.getByLabel('Registered mobile number',{exact:true}).fill('+999123456789');await page.getByRole('button',{name:'Send verification code'}).click();
  if(mode==='attempts'||mode==='review') {
   for(let attempt=0;attempt<(mode==='attempts'?5:1);attempt++){await page.getByLabel('Verification code',{exact:true}).fill('111111');await page.getByRole('button',{name:'Verify code',exact:true}).click(); if(mode==='attempts') await page.getByText('We could not verify this request. Please try again.',{exact:true}).waitFor();}
   if(mode==='attempts'){await page.getByText('Request a new code to try again.').waitFor();assert.ok(await page.getByRole('button',{name:'Verify code',exact:true}).isDisabled());}
   else await page.getByText('We could not complete automatic recovery safely. Contact Partner Support for a reviewed recovery.',{exact:true}).waitFor();
  }
  if(mode==='expiry'){await page.getByText('This code has expired. Request a new code.').waitFor();assert.ok(await page.getByRole('button',{name:'Verify code',exact:true}).isDisabled());await page.clock.fastForward(61000);await page.getByRole('button',{name:'Resend code',exact:true}).click();assert.equal(starts,2);}
  await page.getByRole('button',{name:'Cancel',exact:true}).click();await page.getByRole('heading',{name:'No Partner application found'}).waitFor();
  assert.equal(new URL(page.url()).pathname,'/partner-access');assert.ok(!(await page.locator('body').innerText()).includes('private contact detail'));
  evidence.push({mode,genericErrors:true,partnerCancel:true});await context.close();
 }
 console.log(JSON.stringify({status:'BROWSER_RECOVERY_FLOW_PASS',syntheticApi:true,evidence}));
}finally{await browser.close();}
