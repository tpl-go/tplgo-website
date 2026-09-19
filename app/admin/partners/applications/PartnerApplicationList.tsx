"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePartnerPublishedRead } from "../_components/usePartnerPublishedRead";
import { downloadApplicationExport } from "./partnerApplicationExport";

const permissions = ["partner_application.read"] as const;
type Row = { submissionId: string; submissionReference: string; organizationName: string; country: string; entityType: string; workflowStatus: string; submittedAt: string; assignedReviewer: string | null; selectedServices: string[] };
type Page = { rows: Row[]; hasMore: boolean; nextCursor: string | null };
const states: Record<string,string> = { all: "ALL", new: "SUBMITTED", "under-review": "UNDER_REVIEW", "documents-pending": "DOCUMENTS_PENDING", approved: "APPROVED", rejected: "NOT_APPROVED" };
const field = "min-h-11 w-full rounded-lg border border-slate-600 bg-[#102035] px-3 text-sm text-slate-100 focus:outline focus:outline-2 focus:outline-sky-400";
const button = "inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-600 px-3 text-sm text-slate-200 hover:bg-white/5 focus:outline focus:outline-2 focus:outline-sky-400 disabled:opacity-40";
export default function PartnerApplicationList() {
  const query = useSearchParams();const view = query.get("view") ?? "all";
  const status = query.get("status") ?? states[view] ?? "ALL";
  const [search, setSearch] = useState("");const [country, setCountry] = useState("");const [sort, setSort] = useState("newest");
  const [filters, setFilters] = useState({ search: "", country: "", sort: "newest" });const [cursors, setCursors] = useState<string[]>([""]);
  const [notice, setNotice] = useState("");const [exporting, setExporting] = useState(false);
  useEffect(() => { setCursors([""]); }, [status]);
  const params = new URLSearchParams({ status, ...filters, limit: "25" });if(cursors.at(-1))params.set("cursor",cursors.at(-1)!);
  const {data,state,retry} = usePartnerPublishedRead<Page>("/api/v1/admin/partner-applications?"+params,permissions);
  const apply = () => { setFilters({search:search.trim(),country:country.trim(),sort});setCursors([""]);setNotice(""); };
  const exportList = async(format:"csv"|"xlsx") => {if(exporting)return;setExporting(true);setNotice("");try{const exportParams=new URLSearchParams({status,...filters,format});await downloadApplicationExport("/api/v1/admin/partner-applications/export?"+exportParams,"tpl-partner-applications."+format);}catch(error){setNotice(error instanceof Error?error.message:"Export unavailable.");}finally{setExporting(false);} };
  if(state==="forbidden")return <p role="alert" className="py-6 text-slate-300">You do not have permission to view Partner applications.</p>;
  return <div className="min-w-0 space-y-5 pt-5">
    <form onSubmit={event=>{event.preventDefault();apply();}} className="grid gap-3 rounded-xl border border-slate-700 bg-[#0b1628] p-4 sm:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_auto]">
      <label className="space-y-2 text-xs text-slate-300"><span>Business name or application ID</span><input className={field} maxLength={100} value={search} onChange={event=>setSearch(event.target.value)} /></label>
      <label className="space-y-2 text-xs text-slate-300"><span>Country</span><input className={field} maxLength={80} value={country} onChange={event=>setCountry(event.target.value)} placeholder="All countries" /></label>
      <label className="space-y-2 text-xs text-slate-300"><span>Sort by submitted date</span><select className={field} value={sort} onChange={event=>setSort(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label>
      <div className="flex items-end gap-2"><button className={button}>Apply</button><button type="button" className={button} onClick={()=>{setSearch("");setCountry("");setSort("newest");setFilters({search:"",country:"",sort:"newest"});setCursors([""]);}}>Reset</button></div>
    </form>
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-400">Latest submitted revision per application. {data?.rows.length??0} on this page.</p><div className="flex flex-wrap gap-2"><button className={button} onClick={retry}>Refresh</button><button className={button} disabled={exporting} onClick={()=>void exportList("csv")}>Export CSV</button><button className={button} disabled={exporting} onClick={()=>void exportList("xlsx")}>Export XLSX</button></div></div>
    <p className="text-xs text-slate-400">Exports use applied filters and sort; up to 500 matching applications. Refine filters for larger results.</p>
    {notice?<p role="status" className="text-sm text-amber-200">{notice}</p>:null}
    {state==="error"?<p role="alert" className="text-sm text-amber-200">Applications could not be refreshed. Any displayed results may be out of date. <button className="underline" onClick={retry}>Try again</button></p>:null}
    {state==="loading"?<p role="status" className="py-8 text-slate-300">Loading applications…</p>:data?.rows.length===0?<p className="rounded-xl border border-slate-700 p-8 text-sm text-slate-400">No applications match these filters.</p>:data?<div className="overflow-x-auto rounded-xl border border-slate-700"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-[#142238] text-xs text-slate-300"><tr>{["Application / Partner","Country / Services","Status","Submitted","Pending with",""].map(label=><th key={label} className="px-4 py-3 font-medium">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-700">{data.rows.map(row=><tr key={row.submissionId} className="text-slate-300 hover:bg-white/5"><td className="max-w-xs px-4 py-4"><span className="block font-medium text-slate-100">{row.organizationName}</span><span className="text-xs text-slate-400">{row.submissionReference}</span></td><td className="max-w-xs px-4 py-4">{row.country}<span className="block text-xs text-slate-400">{row.selectedServices.join(", ")||"No services recorded"}</span></td><td className="px-4 py-4">{row.workflowStatus.toLowerCase().replaceAll("_"," ")}</td><td className="whitespace-nowrap px-4 py-4">{new Date(row.submittedAt).toLocaleDateString()}</td><td className="px-4 py-4">{row.assignedReviewer??"Assignment required"}</td><td className="px-4 py-4"><Link className={button} href={"/admin/partners/applications/"+encodeURIComponent(row.submissionId)}>Open application</Link></td></tr>)}</tbody></table></div>:null}
    <div className="flex items-center justify-end gap-3 text-sm text-slate-300"><button className={button} disabled={cursors.length===1||state==="loading"} onClick={()=>setCursors(current=>current.slice(0,-1))}>Previous</button><span>Page {cursors.length}</span><button className={button} disabled={!data?.hasMore||state!=="ready"} onClick={()=>data?.nextCursor&&setCursors(current=>[...current,data.nextCursor!])}>Next</button></div>
  </div>;
}
