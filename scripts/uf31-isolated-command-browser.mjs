// Uses the actual built Website and real isolated Fastify responses. No staging mutations.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
export async function runCommandBrowser({request,adminSession,partnerToken,organizationId,output}){
 const base='http://127.0.0.1:3162';await mkdir(output,{recursive:true});const browser=await chromium.launch({headless:true});const results=[];
 try{for(const audience of ['admin','partner'])for(const width of [1365,390]){
  const context=await browser.newContext({viewport:{width,height:950}});
  await context.addInitScript(({audience,adminSession,partnerToken,organizationId})=>{if(audience==='admin')localStorage.setItem('tpl_admin_session_v1',JSON.stringify(adminSession));else{localStorage.setItem('tpl_auth_session_v1',JSON.stringify({token:partnerToken}));sessionStorage.setItem('tpl_partner_profile_preference_v1',organizationId);}}, {audience,adminSession,partnerToken,organizationId});
  await context.route('**/*',async route=>{const req=route.request(),url=new URL(req.url());if(!url.pathname.includes('/api/'))return url.origin===base?route.continue():route.abort();const allowed=url.pathname==='/api/v1/admin/me'||url.pathname==='/api/v1/auth/session'||url.pathname.startsWith('/api/v1/partner/')||url.pathname.startsWith('/api/v1/admin/partners/workspaces');if(!allowed)return route.abort();if(req.method()!=='GET'&&url.pathname!=='/api/v1/partner/access/select')return route.abort();const r=await request({method:req.method(),url:url.pathname+url.search,headers:req.headers(),...(req.postData()?{payload:req.postData()}:{})});await route.fulfill({status:r.statusCode,headers:{'content-type':String(r.headers['content-type']??'application/json'),'cache-control':'private, no-store',...(r.headers['content-disposition']?{'content-disposition':String(r.headers['content-disposition'])}:{})},body:r.rawPayload});});
  const page=await context.newPage();await page.goto(base+(audience==='admin'?'/admin/partners/organizations/'+organizationId:'/partner-access'));
  try{await page.getByRole('heading',{name:/^Action Required/}).waitFor({timeout:25000});}catch(e){await page.screenshot({path:`${output}/failed-${audience}-${width}.png`,fullPage:true});await writeFile(`${output}/failed.txt`,await page.locator('body').innerText());throw e;}
  assert(await page.getByRole('heading',{name:'My Domains & Services',exact:true}).count()===1);
  assert(await page.getByRole('button',{name:'Activate',exact:true}).count()===0);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:`${output}/${audience}-${width}.png`,fullPage:true});
  await page.getByLabel('From date').fill('2026-09-01');await page.getByRole('button',{name:'Apply',exact:true}).click();await page.getByRole('heading',{name:'My Domains & Services',exact:true}).waitFor();
  if(audience==='admin'){await page.getByRole('button',{name:'Finance',exact:true}).first().click();await page.getByRole('button',{name:'Transactions',exact:true}).waitFor();await page.getByRole('button',{name:'Settlements',exact:true}).last().click();await page.getByText('Settlement reporting is not available for this account.',{exact:false}).waitFor();await page.getByRole('button',{name:'Activity & Reports',exact:true}).click();}
  else{if(width===390)await page.getByLabel('Toggle Partner navigation').click();await page.getByRole('button',{name:'Reports',exact:true}).first().click();}
  await page.getByRole('button',{name:'PDF',exact:true}).waitFor();
  for(const format of ['PDF','XLSX','CSV']){const pending=page.waitForEvent('download');await page.getByRole('button',{name:format,exact:true}).click();const download=await pending;assert.equal(await download.failure(),null);await download.saveAs(`${output}/${audience}-${width}.${format.toLowerCase()}`);}
  if(width===1365){await page.emulateMedia({media:'print'});await page.pdf({path:`${output}/${audience}-print.pdf`,format:'A4',printBackground:false});}
  results.push({audience,width,canonicalBackend:true,exports:'PASS',filteredNavigation:'PASS',overflow:false});await context.close();
 }}finally{await browser.close();}await writeFile(`${output}/results.json`,JSON.stringify(results,null,2));return results;
}
