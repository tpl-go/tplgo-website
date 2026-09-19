"use client";
import { usePartnerPublishedRead } from "./usePartnerPublishedRead";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect,useId,useRef,useState,type ReactNode } from "react";
import { ChevronDown,RefreshCcw,X } from "lucide-react";
import {performanceLabels,performanceNumber} from "./partnerPerformanceContract";
import {defaultServicesFilters,servicesParams,servicesPermissions,validServicesPage,validServicesOptions,validServicesPartners,type ServicesFilters,type ServicesPage,type ServicesOptions,type ServicesPartners} from "./partnerServicesContract";
const panel = "rounded-xl border border-slate-700/55 bg-[#0c1625]";
const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300";
const button = `inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-600 px-3 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-40 ${focus}`;
const input = `h-10 w-full min-w-0 rounded-lg border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-200 ${focus}`;
type State = "loading" | "ready" | "error" | "forbidden";
function useServices<T>(path: string | null, validate: (v: unknown) => boolean) {
  return usePartnerPublishedRead<T>(path, servicesPermissions, validate);
}

function Section({ title,note,children,aside }: { title: string; note?: string; children: ReactNode; aside?: ReactNode }) {
  return <section aria-label={title} className={`${panel} min-w-0 p-4 sm:p-5`}>
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-base font-semibold text-slate-100">{title}</h3>{note && <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">{note}</p>}</div>{aside}</div>{children}
  </section>;
}
function ReadState({ state,retry,empty = false }: { state: State; retry: () => void; empty?: boolean }) {
  if (state === "ready" && !empty) return null;
  return <div role={state === "error" || state === "forbidden" ? "alert" : "status"} className="flex min-h-20 flex-wrap items-center justify-center gap-3 p-4 text-sm text-slate-400">
    <span>{state === "loading" ? "Loading…" : state === "forbidden" ? "Services requires Partner catalogue access." : state === "error" ? "Updates are unavailable. Previously loaded results may be out of date." : "No matching results."}</span>
    {state === "error" && <button type="button" className={button} onClick={retry}>Retry</button>}
  </div>;
}
function CatalogueSelect({ field,label,filters,value,onChange }: { field: "domain" | "service" | "country" | "state" | "city"; label: string; filters: ServicesFilters; value: string; onChange: (v: string) => void }) {
  const id = useId(),root = useRef<HTMLDivElement>(null),trigger = useRef<HTMLButtonElement>(null);
  const emptyLabel = {domain:"All domains",service:"All services",country:"All countries",state:"All states",city:"All cities"}[field];
  const [open,setOpen] = useState(false),[term,setTerm] = useState(""),[debounced,setDebounced] = useState(""),[after,setAfter] = useState(""),[history,setHistory] = useState<string[]>([]),[selectedLabel,setSelectedLabel] = useState("");
  useEffect(() => { const timer = setTimeout(() => setDebounced(term),250); return () => clearTimeout(timer); },[term]);
  const result = useServices<ServicesOptions>(open || value ? `/api/v1/admin/partners/service-overview/options?${servicesParams(filters,{ field,term: debounced,after,preset:"all" })}` : null,validServicesOptions);
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown",outside); return () => document.removeEventListener("pointerdown",outside);
  },[open]);
  const close = () => { setOpen(false); trigger.current?.focus(); };
  const select = (v: string,name: string) => { onChange(v); setSelectedLabel(name); close(); };
  return <div className="relative min-w-0" ref={root} onKeyDown={e => { if (e.key === "Escape" && open) { e.preventDefault(); e.stopPropagation(); close(); } }}>
    <label id={`${id}-label`} className="mb-2 block text-xs font-medium text-slate-400">{label}</label>
    <button ref={trigger} type="button" aria-labelledby={`${id}-label ${id}-value`} aria-expanded={open} aria-controls={`${id}-options`} disabled={field === "service" && !filters.domain || field === "state" && !filters.country || field === "city" && !filters.state} className={`${input} flex items-center justify-between gap-2 text-left disabled:opacity-40`} onClick={() => { setOpen(!open); setTerm(""); setDebounced(""); setAfter(""); setHistory([]); }}>
      <span id={`${id}-value`} className="truncate">{value ? result.data?.selectedLabel || selectedLabel || value : emptyLabel}</span><ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true"/>
    </button>
    {open && <div id={`${id}-options`} role="group" aria-label={`${label} choices`} className="absolute left-0 right-0 top-full z-40 mt-2 rounded-lg border border-slate-600 bg-[#111e31] p-2 shadow-xl">
      <input autoFocus aria-label={`Search ${label}`} className={input} maxLength={80} value={term} onChange={e => { setTerm(e.target.value); setAfter(""); setHistory([]); }}/>
      <div className="mt-2 max-h-52 overflow-y-auto">
        <button type="button" className={`w-full rounded px-2 py-2 text-left text-sm text-slate-300 hover:bg-white/5 ${focus}`} onClick={() => select("","")}>{emptyLabel}</button>
        {result.data?.rows.map(r => <button key={r.value} type="button" aria-pressed={value === r.value} className={`w-full break-words rounded px-2 py-2 text-left text-sm text-slate-200 hover:bg-sky-400/10 ${focus}`} onClick={() => select(r.value,r.label)}>{r.label}</button>)}
        <ReadState state={result.state} retry={result.retry} empty={!result.data?.rows.length}/>
      </div>
      <div className="mt-2 flex flex-wrap justify-between gap-2 border-t border-slate-700 pt-2">
        <button type="button" className={button} disabled={!history.length || result.state === "loading"} onClick={() => { setAfter(history.at(-1) ?? ""); setHistory(history.slice(0,-1)); }}>Back</button>
        <button type="button" className={button} disabled={!result.data?.nextCursor || result.state === "loading"} onClick={() => { setHistory([...history,after]); setAfter(result.data?.nextCursor ?? ""); }}>More</button>
        <button type="button" className={button} onClick={close} aria-label={`Close ${label} choices`}><X className="h-4 w-4"/></button>
      </div>
    </div>}
  </div>;
}
function Pager({ next,history,loading,onNext,onBack }: { next: string | null; history: string[]; loading: boolean; onNext: () => void; onBack: () => void }) {
  return <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-400"><span>Page {history.length+1} · up to 10 rows</span><div className="flex gap-2"><button className={button} disabled={loading || !history.length} onClick={onBack}>Previous</button><button className={button} disabled={loading || !next} onClick={onNext}>Next</button></div></div>;
}
function Status({value}:{value:string}) {return <span className={`inline-flex rounded-md border px-2 py-1 text-xs capitalize ${value==="active"?"border-emerald-400/25 bg-emerald-400/5 text-emerald-200":"border-slate-600 text-slate-300"}`}>{value.replaceAll("_"," ")}</span>;}
function MetricsTable({filters,onView}:{filters:ServicesFilters;onView:(domain:string,service:string)=>void}) {
  const [after,setAfter]=useState(""),[history,setHistory]=useState<string[]>([]);
  const read=useServices<ServicesPage>(`/api/v1/admin/partners/service-overview/services?${servicesParams(filters,{after})}`,validServicesPage);
  return <Section title="Service Directory" note="Published services. Active counts require both an active Partner and an active service assignment.">
    <ReadState state={read.state} retry={read.retry} empty={read.data?.rows.length===0}/>
    {read.data&&<><div className="overflow-x-auto rounded-lg border border-slate-700/50"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-slate-800/60 text-xs text-slate-400"><tr>{["Service","Partners","Active","Bookings","GMV","TPL Revenue","Status","View"].map(t=><th key={t} className="p-3 font-medium">{t}</th>)}</tr></thead><tbody>{read.data.rows.map(r=><tr key={r.key} className="border-t border-slate-700/40"><th className="max-w-64 p-3 font-medium text-slate-200">{r.name}</th><td className="p-3">{performanceNumber(r.partners)}</td><td className="p-3">{performanceNumber(r.active)}</td>{["bookings","gmv","revenue"].map(k=><td key={k} className="p-3 text-slate-500" aria-label="Unavailable">—</td>)}<td className="p-3"><Status value={r.status}/></td><td className="p-3"><button className={button} onClick={()=>onView(r.domain,r.key)} aria-label={`View partners for ${r.name}`}>View</button></td></tr>)}</tbody></table></div><Pager next={read.data.nextCursor} history={history} loading={read.state==="loading"} onNext={()=>{setHistory([...history,after]);setAfter(read.data?.nextCursor??"");}} onBack={()=>{setAfter(history.at(-1)??"");setHistory(history.slice(0,-1));}}/></>}
  </Section>;
}
function DomainOverview({filters,onDomain,onService}:{filters:ServicesFilters;onDomain:(domain:string)=>void;onService:(domain:string,service:string)=>void}) {
  const [after,setAfter]=useState(""),[history,setHistory]=useState<string[]>([]);
  const read=useServices<ServicesPage>(`/api/v1/admin/partners/service-overview/domains?${servicesParams(filters,{after,limit:"6"})}`,validServicesPage);
  return <Section title="Domain-wise Service Overview" note="Names and availability follow the published Website & Experience catalogue.">
    <ReadState state={read.state} retry={read.retry} empty={read.data?.rows.length===0}/>
    {read.data&&<><div className="grid gap-3 xl:grid-cols-2">{read.data.rows.map(d=><article key={d.key} className="min-w-0 rounded-lg border border-slate-700/60 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><button className={`text-left text-sm font-semibold text-sky-200 hover:underline ${focus}`} onClick={()=>onDomain(d.key)}>{d.name}</button><Status value={d.status}/></div><dl className="my-4 grid grid-cols-4 gap-2 text-xs">{[["Partners",performanceNumber(d.partners)],["Bookings","—"],["GMV","—"],["TPL Revenue","—"]].map(([label,value])=><div key={label}><dt className="text-slate-400">{label}</dt><dd className="mt-1 text-base text-slate-100">{value}</dd></div>)}</dl><div className="flex flex-wrap gap-2">{d.services.map(s=><button key={s.key} className={`rounded-md border border-slate-700 px-2 py-1 text-left text-xs text-slate-300 hover:bg-white/5 ${focus}`} onClick={()=>onService(d.key,s.key)}>{s.name}</button>)}</div>{!d.services.length&&<p className="text-xs text-slate-400">No published services in this selection.</p>}<button className={`${button} mt-3`} onClick={()=>onDomain(d.key)}>View services ({d.serviceCount??0})</button></article>)}</div><Pager next={read.data.nextCursor} history={history} loading={read.state==="loading"} onNext={()=>{setHistory([...history,after]);setAfter(read.data?.nextCursor??"");}} onBack={()=>{setAfter(history.at(-1)??"");setHistory(history.slice(0,-1));}}/></>}
  </Section>;
}
function PartnerList({filters,onBack}:{filters:ServicesFilters;onBack:()=>void}) {
  const [after,setAfter]=useState(""),[history,setHistory]=useState<string[]>([]);
  const read=useServices<ServicesPartners>(`/api/v1/admin/partners/service-overview/partners?${servicesParams(filters,{after})}`,validServicesPartners);
  return <Section title="Service Partners" note="Partner status and service assignment status are separate. Open the existing Partner record for review; the operational Partner Profile is not available yet." aside={<button className={button} onClick={onBack}>Back to services</button>}>
    <ReadState state={read.state} retry={read.retry} empty={read.data?.rows.length===0}/>
    {read.data&&<><div className="overflow-x-auto"><table className="w-full min-w-[540px] text-left text-sm"><thead className="bg-slate-800/60 text-xs text-slate-400"><tr>{["Partner","Partner Status","Service Assignment","View"].map(t=><th key={t} className="p-3 font-medium">{t}</th>)}</tr></thead><tbody>{read.data.rows.map(r=><tr key={r.id} className="border-b border-slate-700/40"><th className="p-3 font-medium">{r.name}</th><td className="p-3"><Status value={r.status}/></td><td className="p-3"><Status value={r.serviceStatus}/></td><td className="p-3"><Link className={button} href={r.reviewHref} prefetch={false}>Open Partner record</Link></td></tr>)}</tbody></table></div><Pager next={read.data.nextCursor} history={history} loading={read.state==="loading"} onNext={()=>{setHistory([...history,after]);setAfter(read.data?.nextCursor??"");}} onBack={()=>{setAfter(history.at(-1)??"");setHistory(history.slice(0,-1));}}/></>}
  </Section>;
}
export default function PartnerServicesDashboard() {
  const query=useSearchParams();
  const [draft,setDraft]=useState<ServicesFilters>(()=>({...defaultServicesFilters,domain:query.get("domain")??"",service:query.get("service")??""})),[applied,setApplied]=useState(draft),[revision,setRevision]=useState(0),[viewPartners,setViewPartners]=useState(false),[error,setError]=useState("");
  const key=JSON.stringify([applied,revision]);
  const select=(field:keyof ServicesFilters,value:string)=>setDraft(f=>({...f,[field]:value,...(field==="domain"?{service:""}:field==="country"?{state:"",city:""}:field==="state"?{city:""}:{})}));
  const drill=(domain:string,service="",partners=false)=>{const next={...applied,domain,service};setDraft(next);setApplied(next);setViewPartners(partners);};
  const apply=()=>{if(draft.preset==="custom"){const a=Date.parse(draft.from+"T00:00:00Z"),b=Date.parse(draft.to+"T00:00:00Z");if(!Number.isFinite(a)||!Number.isFinite(b)||b<a||b-a>=366*86400000||draft.to>new Date().toISOString().slice(0,10)){setError("Choose a valid date range of up to 366 days, ending today or earlier.");return;}}setError("");setApplied({...draft});setViewPartners(false);setRevision(r=>r+1);};
  return <div className="min-w-0 space-y-5 text-slate-300"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-xl font-semibold text-slate-100">Services</h3><p className="mt-1 text-sm text-slate-400">Explore published domains, services and their Partner network.</p></div><button className={button} onClick={()=>setRevision(r=>r+1)}><RefreshCcw className="h-4 w-4"/>Refresh</button></div>
    <Section title="Service Filters"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{(["domain","service","country","state","city"] as const).map(field=><CatalogueSelect key={`${field}-${field==="service"?draft.domain:field==="state"?draft.country:field==="city"?draft.state:""}-${revision}`} field={field} label={{domain:"Domain",service:"Service",country:"Location · Country",state:"State / Region",city:"City"}[field]} filters={draft} value={draft[field]} onChange={v=>select(field,v)}/>)}<label className="block text-xs text-slate-400">Service Status<select aria-label="Service Status" className={`${input} mt-2`} value={draft.status} onChange={e=>select("status",e.target.value)}><option value="">All statuses</option>{["active","inactive","archived"].map(s=><option key={s} value={s}>{s[0].toUpperCase()+s.slice(1)}</option>)}</select></label><label className="block text-xs text-slate-400">Date Range<select aria-label="Services Date Range" className={`${input} mt-2`} value={draft.preset} onChange={e=>select("preset",e.target.value)}><option value="all">All registration dates</option>{["today","yesterday","last7","last30","thisMonth","previousMonth","thisQuarter","previousQuarter","thisYear","custom"].map(p=><option key={p} value={p}>{performanceLabels[p]}</option>)}</select></label>{draft.preset==="custom"&&(["from","to"] as const).map(f=><label key={f} className="text-xs text-slate-400">{f==="from"?"From":"To"}<input aria-label={f==="from"?"From":"To"} className={`${input} mt-2`} type="date" value={draft[f]} max={new Date().toISOString().slice(0,10)} onChange={e=>select(f,e.target.value)}/></label>)}</div><div className="mt-4 flex flex-wrap gap-3"><button className={button} onClick={apply}>Apply Filters</button><button className={button} onClick={()=>{setDraft(defaultServicesFilters);setApplied(defaultServicesFilters);setViewPartners(false);setError("");setRevision(r=>r+1);}}>Reset Filters</button></div><p className="mt-3 text-xs leading-5 text-slate-400">Location uses the Partner’s registered address. Date filters select Partner registration dates (UTC); status filters the published catalogue. Counts include draft and active assignments. Bookings and financial reporting are unavailable, shown as —.</p>{error&&<p role="alert" className="mt-2 text-sm text-amber-200">{error}</p>}</Section>
    <nav aria-label="Service drill-down" className="flex flex-wrap items-center gap-2 text-sm"><button className={button} onClick={()=>drill("")}>All domains</button>{applied.domain&&<><span aria-hidden="true">/</span><button className={button} onClick={()=>drill(applied.domain)}>Services in selected domain</button></>}{viewPartners&&<><span aria-hidden="true">/</span><span>Partner list</span></>}</nav>
    {viewPartners?<PartnerList key={key} filters={applied} onBack={()=>setViewPartners(false)}/>:<><DomainOverview key={`domains-${key}`} filters={applied} onDomain={d=>drill(d)} onService={(d,s)=>drill(d,s,true)}/><MetricsTable key={`services-${key}`} filters={applied} onView={(d,s)=>drill(d,s,true)}/></>}
    <p className="text-xs text-slate-500">Published catalogue changes appear on refresh or within one minute. Draft changes stay hidden.</p>
  </div>;
}
