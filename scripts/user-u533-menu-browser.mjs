// Local production-build regression only. Build with NEXT_PUBLIC_TPL_API_BASE_URL
// set to http://127.0.0.1:3133; run next start on that loopback port.
// Every API response is synthetic; mutations and external browser requests are blocked.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base='http://127.0.0.1:3133';
const out='tmp/user-u533'; await mkdir(out,{recursive:true});
const user={id:'u533-synthetic-owner',accountType:'personal',mobile:'',email:'',fullName:'Synthetic menu QA'};
const session={token:'u533-synthetic-only',expiresAt:'2027-01-01T00:00:00Z'};
const browser=await chromium.launch({headless:true});
const results=[];
try {
for(const [width,height] of [[390,844],[768,844],[390,568]]) for(const path of ['/','/account/orders']) {
 const context=await browser.newContext({viewport:{width,height}});
 const mutations=[];
 await context.addInitScript(({user,session})=>localStorage.setItem('tpl_auth_session_v1',JSON.stringify({user,session,token:session.token})),{user,session});
 await context.route('**/*',async route=>{
  const u=new URL(route.request().url());
  if(!u.pathname.includes('/api/')) return u.origin===base?route.continue():route.abort();
  if(route.request().method()!=='GET') {mutations.push(u.pathname);return route.abort();}
  let data={};
  if(u.pathname.endsWith('/auth/session'))data={user,session};
  else if(u.pathname.endsWith('/me'))data={user};
  else if(u.pathname.endsWith('/me/profile'))data={profile:null};
  else if(u.pathname.endsWith('/me/travellers'))data={travellers:[]};
  else if(u.pathname.endsWith('/me/login-methods'))data={ownerId:user.id,methods:[],googleConnected:false};
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,data})});
 });
 const page=await context.newPage();page.setDefaultTimeout(10000);
 const result={width,height,path,checks:[]}; results.push(result);
 const shot=`${out}/${width}x${height}-${path==='/'?'home':'inner'}`;
 try {
 await page.goto(base+path,{waitUntil:'domcontentloaded'});
 const trigger=page.getByRole('button',{name:'My Account',exact:true});
 await trigger.click();
 const menu=page.getByRole('dialog',{name:'My Account menu'});
 await menu.waitFor();
 result.dialogs=await page.locator('[role=dialog]').count();
 result.geometry=await menu.evaluate(el=>({rect:el.getBoundingClientRect().toJSON(),scrollHeight:el.scrollHeight,clientHeight:el.clientHeight,bodyOverflow:document.body.style.overflow,scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}));
 await page.screenshot({path:shot+'-collapsed.png'});
 assert.equal(result.dialogs,1,'one mounted dialog');
 assert.ok(result.geometry.rect.top>=0 && result.geometry.rect.bottom<=height,'menu contained vertically');
 assert.ok(result.geometry.scrollWidth<=width,'no page overflow');
 assert.equal(result.geometry.bodyOverflow,width<768?'hidden':'');
 assert.deepEqual(await menu.locator('nav a').evaluateAll(els=>els.map(e=>e.getAttribute('href'))),['/account/profile','/account/bookings','/account/trips','/account/wallet']);
 assert.deepEqual(await menu.locator('nav a').evaluateAll(els=>els.map(e=>e.lastElementChild.textContent)),['My Profile','My Bookings','My Trips','My Wallet']);
 result.checks.push('primary');
 await menu.getByRole('button',{name:'Logout',exact:true}).focus();
 await page.keyboard.press('Tab');
 result.tabFromLogout=await page.evaluate(()=>document.activeElement?.textContent);
 assert.match(result.tabFromLogout,width<768?/Close/:/My Profile/,'Tab wraps to visible first control');
 await page.keyboard.press('Shift+Tab');
 assert.match(await page.evaluate(()=>document.activeElement?.textContent),/Logout/,'reverse focus wrap');
 result.checks.push('visible-focus-wrap');
 const more=menu.locator('button[aria-controls]');
 assert.equal(await menu.locator('#account-menu-more-links a').count(),0,'hidden links absent from focus order');
 for(let i=0;i<3;i++){
 await more.click();assert.equal(await more.getAttribute('aria-expanded'),'true');
 assert.deepEqual(await menu.locator('#account-menu-more-links a').evaluateAll(els=>els.map(e=>e.getAttribute('href'))),['/account/wishlist','/account/orders','/account/downloads','/account/medical-care']);
 assert.deepEqual(await menu.locator('#account-menu-more-links a').evaluateAll(els=>els.map(e=>e.lastElementChild.textContent)),['Wishlist','My Orders','My Downloads','Medical Care']);
 await more.click();assert.equal(await more.getAttribute('aria-expanded'),'false');
 }
 result.checks.push('toggle-x3');
 await more.click();
 await page.screenshot({path:shot+'-expanded.png'});
 result.expanded=await menu.evaluate(el=>({rect:el.getBoundingClientRect().toJSON(),scrollHeight:el.scrollHeight,clientHeight:el.clientHeight}));
 assert.ok(result.expanded.rect.top>=0 && result.expanded.rect.bottom<=height,'expanded menu contained vertically');
 assert.equal(await menu.locator('p').count(),0,'no descriptions');
 assert.doesNotMatch(await menu.innerText(),/\bsoon\b/i);
 for(const control of [menu.locator('a[href^="/creator"]'),menu.getByRole('button',{name:'Logout',exact:true}),...(width<768?[menu.getByRole('button',{name:'Close My Account menu',exact:true})]:[])]) {
  await control.scrollIntoViewIfNeeded();
  const box=await control.boundingBox();assert.ok(box && box.y>=0 && box.y+box.height<=height,'control reachable');
  if((await control.textContent()).includes('Logout'))await page.screenshot({path:shot+'-bottom-actions.png'});
 }
 const clipped=await menu.locator('a,button').evaluateAll(els=>els.filter(e=>e.getClientRects().length).some(e=>e.scrollWidth>e.clientWidth+1));
 assert.equal(clipped,false,'no clipped menu labels');
 if(width<768){
  result.preWheel=await page.evaluate(()=>({bodyInline:document.body.style.overflow,bodyComputed:getComputedStyle(document.body).overflow,htmlComputed:getComputedStyle(document.documentElement).overflow,dialogs:document.querySelectorAll('[role=dialog]').length}));
  const before=await page.evaluate(()=>window.scrollY);
  await page.mouse.move(5,5);await page.mouse.wheel(0,300);await page.waitForTimeout(150);
  assert.equal(await page.evaluate(()=>window.scrollY),before,'background wheel locked');
 }
 result.checks.push('expanded-geometry-controls-scroll-lock');
 await page.keyboard.press('Escape');
 await menu.waitFor({state:'hidden'});
 result.afterEscape=await page.evaluate(()=>({overflow:document.body.style.overflow,focus:document.activeElement?.textContent}));
 result.checks.push('escape');
 assert.equal(result.afterEscape.overflow,'','scroll unlock');
 assert.equal(await page.evaluate(()=>document.documentElement.style.overflow),'','root scroll unlock');
 assert.match(result.afterEscape.focus,/My Account/,'focus restoration');
 await trigger.click(); assert.equal(await more.getAttribute('aria-expanded'),'false');
 await more.focus(); await page.keyboard.press('Enter');
 assert.equal(await more.getAttribute('aria-expanded'),'true');
 result.checks.push('keyboard-disclosure-reopen');
 await menu.getByRole('link',{name:'My Downloads',exact:true}).click();
 await page.waitForURL('**/account/downloads');
 assert.equal(await page.getByRole('dialog',{name:'My Account menu'}).count(),0);
 await page.getByRole('button',{name:'My Account',exact:true}).click();
 const current=page.getByRole('dialog',{name:'My Account menu'}).locator('button[aria-controls]');
 assert.equal(await current.getAttribute('aria-expanded'),'false');
 assert.match(await current.getAttribute('aria-label'),/current section/);
 result.checks.push('navigation-close-reopen-active');
 await page.keyboard.press('Escape');
 if(width<768){
  await page.getByRole('button',{name:'My Account',exact:true}).click();
  await page.getByRole('button',{name:'Close My Account menu',exact:true}).click();
  assert.equal(await page.getByRole('dialog',{name:'My Account menu'}).count(),0);
  assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
 }
 await page.getByRole('button',{name:'My Account',exact:true}).click();
 await page.mouse.click(1,width<768?5:height-2);
 await page.getByRole('dialog',{name:'My Account menu'}).waitFor({state:'hidden'});
 assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
 const beforeWheel=await page.evaluate(()=>window.scrollY);
 await page.mouse.move(width/2,height-50);await page.mouse.wheel(0,300);await page.waitForTimeout(150);
 assert.ok(await page.evaluate(()=>window.scrollY)>beforeWheel,'background unlocked');
 result.checks.push('close-outside-backdrop-unlock');
 const tabRoutes=await page.locator('main a[href^="/account/"]').evaluateAll(els=>els.filter(e=>e.getClientRects().length).map(e=>e.getAttribute('href')));
 assert.deepEqual(tabRoutes,['/account/profile','/account/bookings','/account/trips','/account/wishlist','/account/wallet','/account/orders','/account/downloads','/account/medical-care']);
 assert.deepEqual(mutations,[]);
 result.checks.push('eight-account-tabs-preserved-no-mutations');
 }catch(e){result.error=e.message;await page.screenshot({path:shot+'-failure.png'}).catch(()=>{});}
 await context.close();
}
}finally{await browser.close();await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));if(results.some(r=>r.error))process.exitCode=1;}
