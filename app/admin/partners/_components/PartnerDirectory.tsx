"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { usePartnerPublishedRead } from "./usePartnerPublishedRead";
const permissions=["partner_verification.read"];
type Directory={rows:Array<{id:string;name:string;status:string;location:string}>;hasMore:boolean;nextCursor:string|null};
export default function PartnerDirectory(){const query=useSearchParams(),view=query.get("view")??"all";const status=view==="active"?"active":view==="suspended"?"suspended":"";const [pages,setPages]=useState<Array<string|null>>([null]);const cursor=pages.at(-1);const path="/api/v1/admin/partners/workspaces?"+new URLSearchParams({...status?{status}:{},...cursor?{cursor}:{}});const {data,state,retry}=usePartnerPublishedRead<Directory>(view==="inactive"?null:path,permissions);
 if(view==="inactive")return <p className="py-6 text-sm text-slate-400">Inactive status is not configured. Draft applications remain in Applications.</p>;
 return <div className="space-y-4 pt-6">{state==="forbidden"?<p role="alert">You do not have access to the Partner directory.</p>:null}{state==="error"?<p role="alert">Partners could not be refreshed. <button onClick={retry}>Try again</button></p>:null}{state==="loading"?<p role="status">Loading Partners…</p>:null}{data?.rows.map(row=><Link className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-700 p-4 hover:bg-white/5" key={row.id} href={"/admin/partners/organizations/"+encodeURIComponent(row.id)}><div><h3 className="text-sm font-semibold text-slate-100">{row.name}</h3><p className="mt-1 text-xs text-slate-400">{row.location}</p></div><span className="text-sm capitalize text-slate-300">{row.status} · Open Partner</span></Link>)}{data&&!data.rows.length?<p>No Partners match this view.</p>:null}<div className="flex gap-4 text-sm"><button disabled={pages.length===1} onClick={()=>setPages(p=>p.slice(0,-1))}>Previous</button><span>Page {pages.length}</span><button disabled={!data?.hasMore||state!=="ready"} onClick={()=>setPages(p=>[...p,data!.nextCursor])}>Next</button></div></div>;
}
