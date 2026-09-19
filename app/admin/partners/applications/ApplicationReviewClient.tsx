"use client";
import { useState } from "react";
import { adminApiRequest } from "@/app/lib/admin/adminApiClient";
import { usePartnerPublishedRead } from "../_components/usePartnerPublishedRead";
import { Detail, type DetailResponse } from "./AdminPartnerApplicationsClient";
import { downloadApplicationExport } from "./partnerApplicationExport";
const permissions=["partner_application.read"];
const managePermissions=["partner_application.manage"];
const button="min-h-10 rounded border border-slate-500 px-4 py-2 text-sm disabled:opacity-40";
export default function ApplicationReviewClient({submissionId}:{submissionId:string}) {
 const {data,state,retry}=usePartnerPublishedRead<DetailResponse>("/api/v1/admin/partner-applications/"+encodeURIComponent(submissionId),permissions);
 const [notice,setNotice]=useState("");const [exporting,setExporting]=useState(false);
 const download=async()=>{setExporting(true);try{await downloadApplicationExport("/api/v1/admin/partner-applications/"+encodeURIComponent(submissionId)+"/export","tpl-application-review.pdf");}catch(e){setNotice(e instanceof Error?e.message:"Export unavailable.");}finally{setExporting(false);}};
 if(state==="forbidden")return <p role="alert">You do not have permission to review this application.</p>;
 if(!data)return <p role={state==="error"?"alert":"status"}>{state==="error"?"The application could not be loaded.":"Loading application…"} <button className={button} onClick={retry}>Refresh</button></p>;
 return <div className="space-y-4">
  <div className="flex flex-wrap gap-3 print:hidden"><button className={button} onClick={retry}>Refresh</button><button className={button} disabled={exporting} onClick={()=>void download()}>Export PDF</button><button className={button} onClick={()=>window.print()}>Print summary</button></div>
  {state==="error"?<p role="alert">Refresh failed. Actions are hidden until the application is refreshed.</p>:null}
  {notice?<p role="status" className="print:hidden">{notice}</p>:null}
  <div className="print:hidden">{data.permissions.canManage&&["SUBMITTED","RESUBMITTED"].includes(data.submission.workflowStatus)?<Assignment key={submissionId+":"+(data.assignment?.version??0)} detail={data} refresh={retry}/>:null}
  {state==="ready"?<Detail key={submissionId+":"+data.submission.transitionVersion} detail={data} qa={false} notice={notice} onNotice={setNotice} onReload={retry} onQaAction={()=>false}/>:null}</div>
  <article className="application-print-summary hidden text-black print:block">
   <h1>TPL — Partner application review</h1><p>Private summary · Generated {new Date().toLocaleDateString()} · Revision {data.submission.submissionRevision}</p>
   <h2>{data.organization.legalName}</h2><p>{data.organization.country} · {data.organization.entityType}</p><p>Status: {data.submission.workflowStatus.replaceAll("_"," ")}</p><p>Submitted: {new Date(data.submission.submittedAt).toLocaleString()}</p>
   <p>{data.orderedReview?.pendingWith} · {data.orderedReview?.requiredAction}</p><h2>Services</h2><p>{data.snapshot.selectedServices.join(", ")}</p>
   <table><thead><tr><th>Application section</th><th>Review status</th></tr></thead><tbody>{data.snapshot.steps.map(step=><tr key={step.step}><td>{step.label}</td><td>{step.status.replaceAll("_"," ")} — {step.reason}</td></tr>)}</tbody></table>
   <h2>Document evidence</h2>{data.snapshot.verificationRequirements.map((item,index)=><p key={index}>{item.title}: {item.status.replaceAll("_"," ")}</p>)}
   <h2>Requested correction / decision</h2><p>{data.messages.partnerVisible??"No correction requested."}</p><h2>Review history</h2>{data.timeline.filter(item=>item.action!=="private_note").map(item=><p key={item.id}>{new Date(item.occurredAt).toLocaleString()} — {item.label}</p>)}
   <p>Application approval does not activate services or payouts.</p>
  </article>
  <style>{`@media print { body * { visibility:hidden; } .application-print-summary, .application-print-summary * {visibility:visible;} .application-print-summary {display:block!important;position:absolute;inset:0;background:white;padding:12mm;font:11pt Arial;} .application-print-summary table{width:100%;border-collapse:collapse;} .application-print-summary th,.application-print-summary td{border-bottom:1px solid #bbb;padding:8px;text-align:left;} .application-print-summary thead{display:table-header-group;} .application-print-summary tr{break-inside:avoid;} .application-print-summary h2{break-after:avoid;margin:14pt 0 6pt;} @page{size:A4;margin:12mm;} }`}</style>
 </div>;
}
function Assignment({detail,refresh}:{detail:DetailResponse;refresh:()=>void}) {
 const {data,state}=usePartnerPublishedRead<Array<{id:string;name:string;finalApprover:boolean}>>("/api/v1/admin/partner-applications/reviewers",managePermissions);
 const [reviewers,setReviewers]=useState<string[]>(detail.assignment?.reviewers??["","",""]);const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");

 const save=async()=>{if(busy)return;setBusy(true);const result=await adminApiRequest("/api/v1/admin/partner-applications/"+encodeURIComponent(detail.submission.id)+"/assignment",{method:"POST",body:{reviewers,expectedVersion:detail.assignment?.version??0}});setBusy(false);setMessage(result.ok?"Reviewers assigned in the specified reporting order.":result.error.message);if(result.ok)refresh();};
 return <section className="space-y-3 rounded-xl border border-slate-600 p-4"><h2 className="font-semibold">Reviewer assignment</h2><p className="text-sm text-slate-400">Choose the employee, that employee’s senior and the next senior. Three different active reviewers are required. No reviewer is assigned automatically.</p>
 <div className="grid gap-3 md:grid-cols-3">{["Level 1 — Employee","Level 2 — Employee’s senior","Level 3 — Next senior"].map((label,index)=><label key={label} className="space-y-2 text-sm"><span>{label}</span><select aria-label={label} className="min-h-11 w-full rounded border border-slate-500 bg-slate-900 px-3" value={reviewers[index]} onChange={event=>setReviewers(current=>current.map((value,i)=>i===index?event.target.value:value))}><option value="">Select reviewer</option>{data?.filter(item=>index!==2||item.finalApprover).map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>)}</div>
 <button className={button} disabled={busy||state!=="ready"||reviewers.some(value=>!value)||new Set(reviewers).size!==3} onClick={()=>void save()}>Save reviewer assignment</button>{message?<p role="status">{message}</p>:null}{state==="error"?<p role="alert">Eligible reviewers could not be loaded.</p>:null}</section>;
}
