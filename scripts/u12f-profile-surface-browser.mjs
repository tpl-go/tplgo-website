import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const base=process.env.U12F_BASE_URL??"http://127.0.0.1:3100";
const out="reports/artifacts/u1-2f";
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[];

try{
  for(const viewport of [{width:390,height:844},{width:768,height:1024},{width:1365,height:900}]){
    const context=await browser.newContext({viewport});
    const requests=[];context.on("request",request=>{if(request.url().includes("/api/"))requests.push(`${request.method()} ${request.url()}`);});
    await context.addInitScript(()=>localStorage.setItem("tpl_auth_session_v1",JSON.stringify({token:"synthetic-profile-session",session:{token:"synthetic-profile-session",expiresAt:"2099-01-01T00:00:00.000Z"},user:{id:"00000000-0000-4000-8000-000000000111",accountType:"personal"}})));
    let photo=null,uploadPut=0,photoRemoved=0,savedBody=null,storageUnavailable=false,unavailableObserved=false;
    const countries=[{value:"IN",label:"India",detail:"IN"},{value:"US",label:"United States",detail:"US"},...Array.from({length:220},(_,index)=>({value:`X${String(index).padStart(3,"0")}`,label:`Test country ${String(index).padStart(3,"0")}`})),{value:"ZW",label:"Zimbabwe",detail:"ZW"}];
    await context.route(/\/api\/v1\//,async route=>{
      const request=route.request(),url=new URL(request.url()),path=url.pathname;
      const success=(data,status=200)=>route.fulfill({status,contentType:"application/json",body:JSON.stringify({ok:true,data,meta:{requestId:"synthetic-u12f",apiVersion:"v1"}})});
      if(path.endsWith("/api/v1/auth/session"))return success({user:{id:"00000000-0000-4000-8000-000000000111",accountType:"personal",mobile:"synthetic"},session:{token:"synthetic-profile-session",expiresAt:"2099-01-01T00:00:00.000Z"}});
      if(path.endsWith("/api/v1/auth/me"))return success({user:{id:"00000000-0000-4000-8000-000000000111",accountType:"personal",mobile:"synthetic"}});
      if(path.endsWith("/api/v1/me/profile")){
        if(request.method()==="PUT"){savedBody=request.postDataJSON();return success({profile:{...profile(),...savedBody,version:4}});}
        return success({profile:profile()});
      }
      if(path.endsWith("/api/v1/me/travellers"))return success({travellers:[]});
      if(path.endsWith("/api/v1/me/profile/photo")){
        if(request.method()==="PUT"){uploadPut+=1;if(storageUnavailable)return route.fulfill({status:503,contentType:"application/json",body:JSON.stringify({ok:false,error:{code:"USER_PHOTO_STORAGE_UNAVAILABLE",message:"Photo updates are temporarily unavailable. Please try again later."},meta:{requestId:"synthetic-u12f",apiVersion:"v1"}})});photo={version:2,thumbnailUrl:"/testimonials/user1.jpg?v=2",displayUrl:"/testimonials/user1.jpg?v=2",updatedAt:"2026-09-18T00:00:00.000Z",expiresAt:"2099-01-01T00:00:00.000Z"};return success({photo});}
        if(request.method()==="DELETE"){photoRemoved+=1;photo=null;return success({removed:true});}
        return success({photo});
      }
      if(path.endsWith("/api/v1/me/login-methods"))return success({methods:[]});
      if(path.endsWith("/api/v1/me/device-sessions"))return success({deviceSessions:[]});
      if(path.endsWith("/api/v1/reference/profile-locations")){
        const level=url.searchParams.get("level");
        if(level==="countries")return success({version:"country-state-city@3.2.1",level,options:countries});
        if(level==="regions")return success({version:"country-state-city@3.2.1",level,options:url.searchParams.get("country")==="US"?[{value:"California",label:"California",detail:"CA"}]:[{value:"Delhi",label:"Delhi",detail:"DL"}]});
        return success({version:"country-state-city@3.2.1",level,options:[{value:"Los Angeles",label:"Los Angeles"},{value:"San Francisco",label:"San Francisco"}]});
      }
      if(path.includes("/api/v1/wallet"))return success({promoCredit:0,earnedCredit:0,refundableBalance:0});
      return success({});
    });
    const page=await context.newPage();
    await page.goto(`${base}/account/profile`,{waitUntil:"networkidle"});
    try{await page.getByRole("heading",{name:"General Information"}).waitFor({timeout:30000});}catch(cause){throw new Error(`Profile did not render at ${page.url()}: ${(await page.locator("body").innerText()).slice(0,800)}; requests=${requests.join(" | ")}`,{cause});}
    const country=page.getByRole("button",{name:"COUNTRY"});
    await country.scrollIntoViewIfNeeded();await country.click();
    const countryDialog=page.getByRole("dialog",{name:"COUNTRY options"});
    const geometry=await Promise.all([country.boundingBox(),countryDialog.boundingBox()]);
    const scrolling=await countryDialog.getByRole("listbox").evaluate(node=>({clientHeight:node.clientHeight,scrollHeight:node.scrollHeight}));
    await page.getByLabel("Search COUNTRY").fill("Zimbabwe");
    await page.getByRole("option",{name:/Zimbabwe/}).click();
    await country.click();await page.getByLabel("Search COUNTRY").fill("United States");await page.getByRole("option",{name:/United States/}).click();
    const state=page.getByRole("button",{name:"STATE / REGION"});await state.click();await page.getByLabel("Search STATE / REGION").fill("California");await page.getByRole("option",{name:/California/}).click();
    const city=page.getByRole("button",{name:"CITY"});await city.click();await page.getByLabel("Search CITY").fill("Los Angeles");await page.getByRole("option",{name:/Los Angeles/}).click();
    await city.click();await page.keyboard.press("Escape");const escapeFocus=await city.evaluate(node=>node===document.activeElement);
    await country.click();await page.getByRole("heading",{name:"My Profile"}).click();const outsideClosed=await country.getAttribute("aria-expanded")==="false";
    if(viewport.width===1365){
      await page.getByLabel("Choose a profile photo").setInputFiles({name:"qa.png",mimeType:"image/png",buffer:Buffer.from("synthetic-image")});
      await page.getByText("Profile photo updated.").first().waitFor();
      const lowerPhotoHeading=await page.getByRole("heading",{name:"Profile photo"}).count();
      page.once("dialog",dialog=>dialog.accept());await page.getByRole("button",{name:"Remove photo"}).first().click();await page.getByText("Profile photo removed.").first().waitFor();
      storageUnavailable=true;await page.getByLabel("Choose a profile photo").setInputFiles({name:"qa.png",mimeType:"image/png",buffer:Buffer.from("synthetic-image")});await page.getByText("Photo updates are temporarily unavailable. Please try again later.").first().waitFor();unavailableObserved=true;
      if(lowerPhotoHeading!==0)throw new Error("Duplicate lower-page photo controls remain.");
    }
    await page.getByRole("button",{name:"SAVE BASIC DETAILS"}).click();await page.getByText("Basic profile details saved to your account.").waitFor();
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);
    await page.screenshot({path:`${out}/profile-${viewport.width}x${viewport.height}.png`,fullPage:true});
    const entry={viewport,dob:await page.getByLabel("DATE OF BIRTH").inputValue(),anniversary:await page.getByLabel("ANNIVERSARY").inputValue(),country:await country.textContent(),region:await state.textContent(),city:await city.textContent(),anchored:Boolean(geometry[0]&&geometry[1]&&Math.abs(geometry[0].x-geometry[1].x)<2&&Math.abs(geometry[0].width-geometry[1].width)<2&&geometry[1].y>=geometry[0].y+geometry[0].height),scrolling:scrolling.scrollHeight>scrolling.clientHeight,escapeFocus,outsideClosed,overflow,heroPhotoAction:await page.getByRole("button",{name:/profile photo/}).first().isVisible(),uploadPut,photoRemoved,unavailableObserved,savedBody};
    results.push(entry);
    await context.close();
  }
  for(const result of results){if(result.dob!=="2000-02-29"||result.anniversary!=="2024-03-01"||result.country?.trim()!=="United States⌄"||result.region?.trim()!=="California⌄"||result.city?.trim()!=="Los Angeles⌄"||!result.anchored||!result.scrolling||!result.escapeFocus||!result.outsideClosed||result.overflow||!result.heroPhotoAction)throw new Error(`Profile surface assertion failed: ${JSON.stringify(result)}`);if(result.savedBody?.dateOfBirth!=="2000-02-29"||result.savedBody?.preferences?.personal?.anniversary!=="2024-03-01")throw new Error(`Date-only request changed: ${JSON.stringify(result.savedBody)}`);}
  const desktop=results.find(result=>result.viewport.width===1365);if(!desktop||desktop.uploadPut!==2||desktop.photoRemoved!==1||!desktop.unavailableObserved)throw new Error(`Photo contract assertion failed: ${JSON.stringify(desktop)}`);
  console.log(JSON.stringify({ok:true,results:results.map(({savedBody,...result})=>({...result,dateRequest:{dateOfBirth:savedBody?.dateOfBirth,anniversary:savedBody?.preferences?.personal?.anniversary}}))},null,2));
}finally{await browser.close();}

function profile(){return{id:"00000000-0000-4000-8000-000000000222",userId:"00000000-0000-4000-8000-000000000111",version:3,firstName:"Synthetic",lastName:"Profile",gender:"Other",dateOfBirth:"2000-02-29",email:"profile@example.test",mobile:"+442079460123",address:{countryCode:"IN",region:"Delhi",city:"New Delhi"},preferences:{personal:{nationality:"Indian",maritalStatus:"Married",anniversary:"2024-03-01"},frequentFlyers:[]},updatedAt:"2026-09-18T00:00:00.000Z"};}
