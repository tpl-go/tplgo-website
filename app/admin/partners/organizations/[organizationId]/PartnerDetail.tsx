"use client";
import Link from 'next/link';
import {useState,useEffect,useRef} from 'react';
import {getAdminApiBaseUrl,readAdminSession} from '@/app/lib/admin/adminApiClient';
import {usePartnerPublishedRead} from '../../_components/usePartnerPublishedRead';
import {validCommand,type PartnerCommand,type CommandFilters} from '@/app/lib/partner/partnerCommand';
import PartnerCommandCenterView from '@/app/components/partner/PartnerCommandCenterView';
const permissions=['partner_verification.read'];
export default function PartnerDetail({organizationId}:{organizationId:string}){
 const scope=useRef(organizationId);scope.current=organizationId;const mounted=useRef(true);useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 const [query,setQuery]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const base='/api/v1/admin/partners/workspaces/'+encodeURIComponent(organizationId)+'/command-center';
 const {data,state,retry}=usePartnerPublishedRead<PartnerCommand>(base+'?'+query,permissions,validCommand);
 function filters(value:CommandFilters){setQuery(new URLSearchParams(value).toString());}
 async function download(format:string){const session=readAdminSession(),org=organizationId;if(!session)return;setBusy(true);try{const response=await fetch(getAdminApiBaseUrl()+base+'/export?'+query+'&format='+format,{headers:{Authorization:`Bearer ${session.session.token}`},cache:'no-store'});if(!response.ok)throw Error();const blob=await response.blob();if(!mounted.current||scope.current!==org||readAdminSession()?.session.token!==session.session.token)throw Error();const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='partner-workspace.'+format;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch{setNotice('The export could not be prepared. Refresh and try again.');}finally{setBusy(false);}}
 return <div className="space-y-4"><Link className="text-sm text-sky-300 print:hidden" href="/admin/partners/organizations">Back to All Partners</Link>{notice?<p role="alert">{notice}</p>:null}{state==='forbidden'?<p role="alert">You do not have access to this Partner.</p>:state==='error'?<p role="alert">Partner details could not be refreshed. <button onClick={retry}>Try again</button></p>:data?<PartnerCommandCenterView key={organizationId+query} data={data} admin busy={busy} onNavigate={section=>filters({...data.filters,section})} onFilters={filters} onRefresh={retry} onExport={f=>void download(f)}/>:<p role="status">Loading Partner…</p>}</div>;
}
