import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const base='http://127.0.0.1:3129';
const browser=await chromium.launch({headless:true});
const user={id:'synthetic-owner-a',mobile:'',email:'',fullName:'',accountType:'personal',verifiedLoginEmails:['synthetic@example.test']};
const session={token:'synthetic-u41-session',expiresAt:'2027-01-01T00:00:00Z'};
const record=(owner,fields={})=>({id:'00000000-0000-4000-8000-000000000041',userId:owner,version:1,updatedAt:'2026-09-13T00:00:00Z',firstName:'',lastName:'',email:null,mobile:null,gender:null,dateOfBirth:null,address:{},preferences:{},metadata:{},...fields});
const field=(page,label)=>page.locator('label').filter({hasText:new RegExp('^'+(label==='FIRST NAME'?'FIRST(?: & MIDDLE)? NAME':label)+'$')}).locator('..').locator('input');
let passed=0;
async function scenario(name,width,setup,check){
 const context=await browser.newContext({viewport:{width,height:950}});
 const state={user:{...user},profile:null,travellers:[],failSave:false,failRead:false,delay:0,requests:[],signedOut:false,...setup};
 await context.addInitScript(({user,session})=>{localStorage.setItem('tpl_auth_session_v1',JSON.stringify({user,session,token:session.token}));localStorage.setItem('tpl_profile_v1_ambiguous',JSON.stringify({firstName:'LegacyPrivate',passportNo:'SYNTHETIC-DOCUMENT'}));},{user:state.user,session});
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url()),path=url.pathname,method=route.request().method();
  if(!path.includes('/api/'))return url.hostname==='127.0.0.1'?route.continue():route.abort();
  const reply=(data,status=200,code='UNAVAILABLE')=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(status<400?{ok:true,data}:{ok:false,error:{code,message:'Synthetic unavailable; your edits remain. Retry.'}})}).catch(()=>{});
  if(path==='/api/v1/auth/session')return reply({user:state.user,session},state.signedOut?401:200);
  if(path==='/api/v1/auth/logout'){state.signedOut=true;return reply({revoked:true});}
  if(path==='/api/v1/me')return reply({user:state.user});
  if(path==='/api/v1/me/login-methods')return reply({ownerId:state.user.id,methods:[{id:'mobile',provider:'mobile',label:'+******0123',verified:true}]});
  if(path==='/api/v1/me/profile'){
   if(method==='GET'){const profile=state.profile;if(state.delay)await new Promise(r=>setTimeout(r,state.delay));return reply({profile},state.failRead?503:200);}
   const body=route.request().postDataJSON();state.requests.push(body);
   const requestOwner=state.user.id;
   if(state.saveDelay)await new Promise(r=>setTimeout(r,state.saveDelay));
   if(state.user.id!==requestOwner)return reply({profile:record(requestOwner,{...body,version:2})});
   if(state.failSave)return reply({},503);
   if(body.expectedVersion!==(state.profile?.version??0))return reply({},409,'USER_VERSION_CONFLICT');
   state.profile=record(state.user.id,{...state.profile,...body,version:(state.profile?.version??0)+1});return reply({profile:state.profile});
  }
  if(path.startsWith('/api/v1/me/travellers')){
   if(method==='GET')return reply({travellers:state.travellers},state.failRead?503:200);
   const body=route.request().postDataJSON();state.requests.push(body);
   if(state.failSave)return reply({},503);
   const id=path.split('/').at(-1);
   if(method==='DELETE'){state.travellers=state.travellers.filter(t=>t.id!==id);return state.lostDelete ? route.abort() : reply({deleted:true,id});}
   const t=record(state.user.id,{...body,id:method==='POST'?'00000000-0000-4000-8000-000000000042':id,version:body.expectedVersion?body.expectedVersion+1:1});
   state.travellers=[...state.travellers.filter(r=>r.id!==t.id),t];return reply({traveller:t});
  }
  if(path.endsWith('/wallet'))return reply({promoCredit:0,earnedCredit:0,refundableBalance:0});
  if(path.endsWith('/bookings')||path.endsWith('/wallet/ledger'))return reply([]);
  return reply({});
 });
 const page=await context.newPage();page.setDefaultTimeout(20000);
 try{await page.goto(base+'/account/profile');await check(page,state);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('tpl_profile_v1_ambiguous')).firstName),'LegacyPrivate');console.log(JSON.stringify({name,width,result:'PASS',synthetic:true}));passed++;}
 finally{await context.close();}
}
try{
 for(const width of [1363,768,390])await scenario('canonical-profile-traveller-save-refresh',width,{},async(page,state)=>{
  await field(page,'FIRST NAME').waitFor();assert.equal(await field(page,'FIRST NAME').inputValue(),'');
  assert.equal(await field(page,'MOBILE NUMBER').inputValue(),'');assert.equal(await field(page,'NATIONALITY').inputValue(),'');
  await field(page,'FIRST NAME').fill('Synthetic Person');await field(page,'MOBILE NUMBER').fill('+442079460123');
  await page.getByRole('button',{name:'SAVE BASIC DETAILS',exact:true}).click();await page.getByText('Basic profile details saved to your account.',{exact:true}).waitFor();
  assert(!state.requests.some(b=>'passportNo'in b||'documents'in b||'photo'in b));
  await page.reload();await field(page,'FIRST NAME').waitFor();assert.equal(await field(page,'FIRST NAME').inputValue(),'Synthetic Person');assert.equal(await field(page,'MOBILE NUMBER').inputValue(),'+442079460123');
  assert.equal(await field(page,'PASSPORT NO\.').count(),0);
  await page.getByRole('button',{name:/Co Traveller/}).click();await page.getByRole('button',{name:'+ ADD NEW',exact:true}).click();
  await field(page,'FIRST NAME').fill('Single');await page.getByRole('button',{name:'SAVE CO TRAVELLER',exact:true}).click();await page.getByText('Basic traveller details saved to your account.',{exact:true}).waitFor();
  assert.equal(state.travellers.length,1);assert.equal(state.travellers[0].lastName,'');
  await page.reload();await page.getByRole('button',{name:/Co Traveller/}).click();await page.getByText('Single',{exact:true}).waitFor();
 });
 await scenario('failed-save-retains-edits-and-retry-acknowledges',1363,{failSave:true},async(page,state)=>{
  await field(page,'FIRST NAME').fill('Retained');await page.getByRole('button',{name:'SAVE BASIC DETAILS',exact:true}).click();
  await page.getByText('Synthetic unavailable; your edits remain. Retry.',{exact:true}).waitFor();assert.equal(await field(page,'FIRST NAME').inputValue(),'Retained');assert.equal(state.profile,null);
  state.failSave=false;await page.getByRole('button',{name:'SAVE BASIC DETAILS',exact:true}).click();await page.getByText('Basic profile details saved to your account.',{exact:true}).waitFor();
 });
 await scenario('read-failure-no-private-local-fallback',390,{failRead:true},async page=>{
  await page.getByRole('status').filter({hasText:'Your saved details are unavailable.'}).waitFor();assert.equal(await field(page,'FIRST NAME').count(),0);assert.doesNotMatch(await page.locator('body').innerText(),/LegacyPrivate|SYNTHETIC-DOCUMENT|\bPK\b/);
 });
 await scenario('delayed-owner-read-isolation',1363,{delay:1500,profile:record(user.id,{firstName:'OldPrivate'})},async(page,state)=>{
  await page.getByText('Loading your saved details…',{exact:true}).waitFor();
  state.user={...user,id:'synthetic-owner-b'};state.profile=record(state.user.id,{firstName:'NewOwner'});state.delay=0;
  await page.evaluate(({user,session})=>{localStorage.setItem('tpl_auth_session_v1',JSON.stringify({user,session,token:session.token}));window.dispatchEvent(new Event('TPL_AUTH_UPDATED'));},{user:state.user,session});
  await field(page,'FIRST NAME').waitFor();await page.waitForTimeout(1800);assert.equal(await field(page,'FIRST NAME').inputValue(),'NewOwner');assert.doesNotMatch(await page.locator('body').innerText(),/OldPrivate/);
 });
 await scenario('logout-back-refresh-private-fields-absent',1363,{profile:record(user.id,{firstName:'PrivateBeforeLogout'})},async page=>{
  await field(page,'FIRST NAME').waitFor();await page.getByRole('button',{name:/Log out/i}).click();await page.getByRole('button',{name:/Yes, Logout/i}).click();await page.waitForURL(base+'/');await page.goBack();await page.reload();
  await page.getByText('Sign in to view your account.',{exact:true}).waitFor();assert.equal(await field(page,'FIRST NAME').count(),0);assert.doesNotMatch(await page.locator('body').innerText(),/PrivateBeforeLogout|0000000000|Available/);
 });
 await scenario('conflict-review-keeps-edits',1363,{profile:record(user.id,{firstName:'Original'})},async(page,state)=>{
  await field(page,'FIRST NAME').fill('My edits');state.profile={...state.profile,version:2,firstName:'Other window'};
  await page.getByRole('button',{name:'SAVE BASIC DETAILS',exact:true}).click();await page.getByRole('button',{name:'Review latest saved details',exact:true}).click();
  await page.getByRole('region',{name:'Latest saved details'}).getByText('Other window',{exact:true}).waitFor();assert.equal(await field(page,'FIRST NAME').inputValue(),'My edits');
  await page.getByRole('button',{name:'SAVE BASIC DETAILS',exact:true}).click();await page.getByText('Basic profile details saved to your account.',{exact:true}).waitFor();assert.equal(state.profile.version,3);
 });
 await scenario('delayed-save-cannot-publish-to-next-owner',1363,{saveDelay:1500},async(page,state)=>{
  await field(page,'FIRST NAME').fill('Old owner edit');await page.getByRole('button',{name:'SAVE BASIC DETAILS',exact:true}).click();
  while(!state.requests.length)await page.waitForTimeout(10);
  state.user={...user,id:'synthetic-next-owner'};state.profile=record(state.user.id,{firstName:'Next owner'});
  await page.evaluate(({user,session})=>{localStorage.setItem('tpl_auth_session_v1',JSON.stringify({user,session,token:session.token}));window.dispatchEvent(new Event('TPL_AUTH_UPDATED'));},{user:state.user,session});
  await field(page,'FIRST NAME').waitFor();await page.waitForTimeout(1800);assert.equal(await field(page,'FIRST NAME').inputValue(),'Next owner');assert.doesNotMatch(await page.locator('body').innerText(),/Basic profile details saved to your account|Old owner edit/);
 });
 await scenario('lost-delete-response-reconciles-owned-list',1363,{lostDelete:true,travellers:[record(user.id,{firstName:'Remove synthetic'})]},async page=>{
  await field(page,'FIRST NAME').waitFor();await page.getByRole('button',{name:/Co Traveller/}).click();await page.getByTitle('Delete traveller').click();
  await page.getByText('This traveller is no longer in your saved list. Existing bookings are unchanged.',{exact:true}).waitFor();assert.equal(await page.getByText('Remove synthetic',{exact:true}).count(),0);
 });
 await scenario('fresh-validated-session-restores-saved-server-values',1363,{profile:record(user.id,{firstName:'Server saved'})},async(page,state)=>{
  await field(page,'FIRST NAME').waitFor();await page.getByRole('button',{name:/Log out/i}).click();await page.getByRole('button',{name:/Yes, Logout/i}).click();await page.waitForURL(base+'/');
  state.signedOut=false;
  await page.evaluate(({user,session})=>localStorage.setItem('tpl_auth_session_v1',JSON.stringify({user,session,token:session.token})),{user:state.user,session:{...session,token:'synthetic-u41-new-session'}});
  await page.goto(base+'/account/profile');await field(page,'FIRST NAME').waitFor();assert.equal(await field(page,'FIRST NAME').inputValue(),'Server saved');
 });
 console.log(JSON.stringify({passed,liveProof:false}));
}finally{await browser.close();}
