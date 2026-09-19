"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowRight, BarChart3, ChevronDown, RefreshCcw, SlidersHorizontal, X } from "lucide-react";
import { adminApiRequest, readAdminSession } from "@/app/lib/admin/adminApiClient";
import { performanceLabels, performanceNumber } from "./partnerPerformanceContract";
import {
  defaultRevenueFilters, revenueMoney, revenueParams, revenuePermissions,
  validRevenueDomains, validRevenueOptions, validRevenueOverview, validRevenuePartners,
  type RevenueDomainPage, type RevenueFilters, type RevenueOptions, type RevenueOverview,
  type RevenuePartnerPage, type RevenueTrendPoint,
} from "./partnerRevenueContract";

const panel = "rounded-xl border border-slate-700/55 bg-[#0c1625]";
const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300";
const button = `inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-600 px-3 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-40 ${focus}`;
const input = `h-10 w-full min-w-0 rounded-lg border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-200 ${focus}`;
type State = "loading" | "ready" | "error" | "forbidden";
function ownerKey() { const s = readAdminSession(); return s ? JSON.stringify([s.admin.id,s.session.id,s.session.token,s.admin.permissions]) : ""; }
function useRevenue<T>(path: string | null, validate: (v: unknown) => v is T) {
  const [result,setResult] = useState<{ key: string; state: State; data: T | null }>({ key: "",state: "loading",data: null });
  const [tick,setTick] = useState(0); const sequence = useRef(0);
  useEffect(() => {
    if (!path) return;
    const counter = sequence, ticket = ++counter.current, owner = ownerKey(); let live = true;
    const current = readAdminSession();
    const allowed = !!current && revenuePermissions.every(p => current.admin.permissions.includes(p));
    const clear = () => { if (ownerKey() !== owner) { counter.current++; setResult({ key: path,state: "forbidden",data: null }); } };
    window.addEventListener("storage",clear); window.addEventListener("focus",clear);
    const timer = window.setInterval(clear,1000);
    const start = window.setTimeout(() => {
      setResult({ key: path,state: allowed ? "loading" : "forbidden",data: null });
      if (!allowed) return;
      void adminApiRequest<T>(path).then(r => {
        if (!live || ticket !== counter.current || ownerKey() !== owner) return;
        const valid = r.ok && validate(r.data);
        setResult({ key: path,state: valid ? "ready" : !r.ok && [401,403].includes(r.status) ? "forbidden" : "error",data: valid && r.ok ? r.data : null });
      }).catch(() => { if (live && ticket === counter.current) setResult({ key: path,state: "error",data: null }); });
    },0);
    return () => { live = false; counter.current++; clearInterval(timer); clearTimeout(start); window.removeEventListener("storage",clear); window.removeEventListener("focus",clear); };
  },[path,tick,validate]);
  return { data: result.key === path ? result.data : null,state: result.key === path ? result.state : "loading" as State,retry: useCallback(() => setTick(t => t+1),[]) };
}
function Section({ title,note,children,aside }: { title: string; note?: string; children: ReactNode; aside?: ReactNode }) {
  return <section aria-label={title} className={`${panel} min-w-0 p-4 sm:p-5`}>
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-base font-semibold text-slate-100">{title}</h3>{note && <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">{note}</p>}</div>{aside}</div>{children}
  </section>;
}
function ReadState({ state,retry,empty = false }: { state: State; retry: () => void; empty?: boolean }) {
  if (state === "ready" && !empty) return null;
  return <div role={state === "error" || state === "forbidden" ? "alert" : "status"} className="flex min-h-20 flex-wrap items-center justify-center gap-3 p-4 text-sm text-slate-400">
    <span>{state === "loading" ? "Loading…" : state === "forbidden" ? "Revenue requires Partner financial reporting access." : state === "error" ? "Revenue could not be loaded." : "No matching results."}</span>
    {state === "error" && <button type="button" className={button} onClick={retry}>Retry</button>}
  </div>;
}
function CatalogueSelect({ field,label,filters,value,onChange }: { field: "domain" | "service"; label: string; filters: RevenueFilters; value: string; onChange: (v: string) => void }) {
  const id = useId(),root = useRef<HTMLDivElement>(null),trigger = useRef<HTMLButtonElement>(null);
  const [open,setOpen] = useState(false),[term,setTerm] = useState(""),[debounced,setDebounced] = useState(""),[after,setAfter] = useState(""),[history,setHistory] = useState<string[]>([]),[selectedLabel,setSelectedLabel] = useState("");
  useEffect(() => { const timer = setTimeout(() => setDebounced(term),250); return () => clearTimeout(timer); },[term]);
  const result = useRevenue<RevenueOptions>(open ? `/api/v1/admin/partners/revenue/options?${revenueParams(filters,{ field,term: debounced,optionAfter: after })}` : null,validRevenueOptions);
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown",outside); return () => document.removeEventListener("pointerdown",outside);
  },[open]);
  const close = () => { setOpen(false); trigger.current?.focus(); };
  const select = (v: string,name: string) => { onChange(v); setSelectedLabel(name); close(); };
  return <div className="relative min-w-0" ref={root} onKeyDown={e => { if (e.key === "Escape" && open) { e.preventDefault(); e.stopPropagation(); close(); } }}>
    <label id={`${id}-label`} className="mb-2 block text-xs font-medium text-slate-400">{label}</label>
    <button ref={trigger} type="button" aria-labelledby={`${id}-label ${id}-value`} aria-expanded={open} aria-controls={`${id}-options`} disabled={field === "service" && !filters.domain} className={`${input} flex items-center justify-between gap-2 text-left disabled:opacity-40`} onClick={() => { setOpen(!open); setTerm(""); setDebounced(""); setAfter(""); setHistory([]); }}>
      <span id={`${id}-value`} className="truncate">{value ? selectedLabel || value : `All ${field}s`}</span><ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true"/>
    </button>
    {open && <div id={`${id}-options`} role="group" aria-label={`${label} choices`} className="absolute left-0 right-0 top-full z-40 mt-2 rounded-lg border border-slate-600 bg-[#111e31] p-2 shadow-xl">
      <input autoFocus aria-label={`Search ${label}`} className={input} maxLength={80} value={term} onChange={e => { setTerm(e.target.value); setAfter(""); setHistory([]); }}/>
      <div className="mt-2 max-h-52 overflow-y-auto">
        <button type="button" className={`w-full rounded px-2 py-2 text-left text-sm text-slate-300 hover:bg-white/5 ${focus}`} onClick={() => select("","")}>All {field}s</button>
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
function RevenueTrend({ points,currency,available }: { points: RevenueTrendPoint[]; currency: string | null; available: boolean }) {
  const [series,setSeries] = useState<"gmv" | "revenue" | "payable">("revenue"),[selected,setSelected] = useState(0);
  const names = { gmv: "GMV",revenue: "TPL Revenue",payable: "Partner Payable" };
  const index = Math.min(selected,Math.max(0,points.length-1)),values = points.map(p => p[series]).filter((v): v is number => v !== null);
  const min = Math.min(0,...values),max = Math.max(1,...values),y = (v: number) => 175-(v-min)/(max-min)*150;
  const path = points.map((p,i) => p[series] == null ? "" : `${i === 0 || points[i-1][series] == null ? "M" : "L"}${36+i/Math.max(1,points.length-1)*648},${y(p[series]!)}`).join(" ");
  return <><div className="mb-4 flex flex-wrap gap-2" aria-label="Revenue trend metric">{(Object.keys(names) as Array<keyof typeof names>).map(key => <button type="button" key={key} disabled={!available} aria-pressed={key === series} className={`${button} ${key === series ? "border-sky-500/40 bg-sky-500/10 text-sky-200" : ""}`} onClick={() => setSeries(key)}>{names[key]}</button>)}</div>
    {!available ? <div className="flex min-h-44 items-center justify-center gap-3 rounded-lg border border-dashed border-slate-700 bg-slate-950/20 p-5"><BarChart3 aria-hidden="true" className="h-6 w-6 shrink-0 text-slate-500"/><div><p className="text-sm text-slate-300">Revenue trends are not available yet.</p><p className="mt-1 text-xs text-slate-500">They will appear when Partner financial reporting is connected.</p></div></div>
      : !points.length ? <p className="py-12 text-center text-sm text-slate-400">No revenue activity recorded for this period.</p>
      : <><svg className="max-h-56 w-full" viewBox="0 0 720 208" role="img" aria-label={`${names[series]} trend`}>
        <line x1="36" y1={y(0)} x2="684" y2={y(0)} stroke="#334155"/>
        <path d={path} fill="none" stroke="#38bdf8" strokeWidth="2.5"/>
        {points.length === 1 && points[0][series] !== null && <circle cx="36" cy={y(points[0][series]!)} r="3" fill="#38bdf8"/>}
        <text x="36" y="203" fill="#94a3b8" fontSize="11">{points[0].date}</text><text x="684" y="203" textAnchor="end" fill="#94a3b8" fontSize="11">{points.at(-1)?.date}</text>
      </svg><label className="mt-2 block text-xs text-slate-400">Inspect date<input type="range" aria-label="Inspect revenue date" min="0" max={points.length-1} value={index} onChange={e => setSelected(+e.target.value)} className="mt-2 w-full"/></label><p className="mt-3 text-sm text-slate-300">{points[index].date} <span className="mx-2 text-slate-600">·</span>{names[series]} <strong className="ml-2 font-semibold text-white">{revenueMoney(points[index][series],currency)}</strong></p></>}
  </>;
}
function DomainRevenue({ filters }: { filters: RevenueFilters }) {
  const [after,setAfter] = useState(""),[history,setHistory] = useState<string[]>([]);
  const r = useRevenue<RevenueDomainPage>(`/api/v1/admin/partners/revenue/domains?${revenueParams(filters,{ after })}`,validRevenueDomains);
  return <Section title="Domain-wise Revenue" note="Published domains with the selected service scope. Financial values remain separate by currency.">
    {r.data && !r.data.available && <p className="mb-4 text-xs text-slate-500">Domain names are available; their financial totals are not connected yet.</p>}
    <div className="overflow-x-auto rounded-lg border border-slate-700/50" role="region" aria-label="Domain revenue table" tabIndex={0}><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-[#142033] text-xs text-slate-400"><tr>{["Domain","GMV","TPL Revenue","Partner Payable","Settled","Pending Settlement","Refunds","Adjustments"].map(h => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-800">{r.data?.rows.map(row => <tr key={row.key}><th scope="row" className="max-w-60 px-4 py-4 font-medium text-slate-200">{row.name}</th>{(["gmv","revenue","payable","settled","pending","refunds","adjustments"] as const).map(k => <td key={k} className="whitespace-nowrap px-4 py-4 tabular-nums text-slate-400">{revenueMoney(row[k],r.data?.currency)}</td>)}</tr>)}</tbody></table>
      <ReadState state={r.state} retry={r.retry} empty={r.data?.catalogueAvailable && !r.data.rows.length}/>
      {r.data && !r.data.catalogueAvailable && <p className="p-5 text-center text-sm text-slate-400">Published domain catalogue is not available yet.</p>}
    </div><Pager next={r.data?.nextCursor ?? null} history={history} loading={r.state === "loading"} onNext={() => { setHistory([...history,after]); setAfter(r.data?.nextCursor ?? ""); }} onBack={() => { setAfter(history.at(-1) ?? ""); setHistory(history.slice(0,-1)); }}/>
  </Section>;
}
function TopRevenuePartners({ filters }: { filters: RevenueFilters }) {
  const container = useRef<HTMLDivElement>(null); const [visible,setVisible] = useState(false),[after,setAfter] = useState(""),[history,setHistory] = useState<string[]>([]);
  useEffect(() => { const observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { setVisible(true); observer.disconnect(); } },{ rootMargin: "200px" }); if (container.current) observer.observe(container.current); return () => observer.disconnect(); },[]);
  const r = useRevenue<RevenuePartnerPage>(visible ? `/api/v1/admin/partners/revenue/partners?${revenueParams(filters,{ after })}` : null,validRevenuePartners);
  return <div ref={container}><Section title="Top Revenue-generating Partners" note="Ranked by TPL revenue in the selected period. Rankings require attributed financial activity.">
    <div className="overflow-x-auto rounded-lg border border-slate-700/50" role="region" aria-label="Top revenue Partners table" tabIndex={0}><table className="w-full min-w-[740px] text-left text-sm"><thead className="bg-[#142033] text-xs text-slate-400"><tr>{["Partner","Domain","Service","GMV","TPL Revenue","Partner Payable"].map(h => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-800">{r.data?.available && r.data.rows.map(row => <tr key={row.id}><th className="px-4 py-4 font-medium text-slate-200" scope="row">{row.name}</th><td className="px-4 text-slate-400">{row.domain}</td><td className="px-4 text-slate-400">{row.service}</td>{(["gmv","revenue","payable"] as const).map(k => <td key={k} className="whitespace-nowrap px-4 tabular-nums text-slate-300">{revenueMoney(row[k],r.data?.currency)}</td>)}</tr>)}</tbody></table>
      <ReadState state={r.state} retry={r.retry} empty={r.data?.available && !r.data.rows.length}/>
      {r.data && !r.data.available && <p className="p-6 text-center text-sm text-slate-400">Partner revenue rankings are not available yet.</p>}
    </div><Pager next={r.data?.nextCursor ?? null} history={history} loading={r.state === "loading"} onNext={() => { setHistory([...history,after]); setAfter(r.data?.nextCursor ?? ""); }} onBack={() => { setAfter(history.at(-1) ?? ""); setHistory(history.slice(0,-1)); }}/>
  </Section></div>;
}
export default function PartnerRevenueDashboard() {
  const [draft,setDraft] = useState(defaultRevenueFilters),[applied,setApplied] = useState(defaultRevenueFilters),[error,setError] = useState("");
  const overview = useRevenue<RevenueOverview>(`/api/v1/admin/partners/revenue/overview?${revenueParams(applied)}`,validRevenueOverview),data = overview.data;
  const change = (key: keyof RevenueFilters,value: string) => setDraft(d => ({ ...d,[key]: value,...(key === "domain" ? { service: "" } : {}) }));
  const apply = () => {
    if (draft.preset === "custom") {
      const days = (Date.parse(draft.to)-Date.parse(draft.from))/86400000;
      if (!draft.from || !draft.to || !Number.isFinite(days) || days < 0 || days >= 366 || draft.to > new Date().toISOString().slice(0,10)) { setError("Choose a valid date range of up to 366 days, ending today or earlier."); return; }
    }
    setError(""); setApplied({ ...draft });
  };
  const key = revenueParams(applied);
  return <div data-partner-revenue className="min-w-0 space-y-5 pb-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-semibold text-white">Revenue</h2><p className="mt-1 text-sm text-slate-400">Partner business value, earnings and settlement position.</p></div><button type="button" className={button} disabled={overview.state === "loading"} onClick={overview.retry}><RefreshCcw aria-hidden="true" className="h-4 w-4"/>Refresh</button></div>
    <Section title="Revenue Filters" aside={<SlidersHorizontal aria-hidden="true" className="h-4 w-4 text-slate-500"/>}>
      <form onSubmit={e => { e.preventDefault(); apply(); }}><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-xs font-medium text-slate-400">Date Range<select aria-label="Revenue Date Range" className={`${input} mt-2`} value={draft.preset} onChange={e => change("preset",e.target.value)}>{(data?.filterPolicy.presets ?? [draft.preset]).map(p => <option key={p} value={p}>{performanceLabels[p] ?? p}</option>)}</select></label>
        <CatalogueSelect field="domain" label="Domain" filters={draft} value={draft.domain} onChange={v => change("domain",v)}/>
        <CatalogueSelect key={draft.domain} field="service" label="Service" filters={draft} value={draft.service} onChange={v => change("service",v)}/>
        {draft.preset === "custom" && <><label className="text-xs text-slate-400">From<input className={`${input} mt-2`} type="date" required value={draft.from} max={draft.to || undefined} onChange={e => change("from",e.target.value)}/></label><label className="text-xs text-slate-400">To<input className={`${input} mt-2`} type="date" required value={draft.to} min={draft.from || undefined} onChange={e => change("to",e.target.value)}/></label></>}
      </div><div className="mt-5 flex flex-wrap items-center gap-3"><button className={`${button} border-sky-500/40 bg-sky-500/10 text-sky-200`}>Apply Filters</button><button type="button" className={button} onClick={() => { setDraft(defaultRevenueFilters); setApplied(defaultRevenueFilters); setError(""); }}>Reset Filters</button><span className="text-xs text-slate-500">UTC calendar dates</span></div>{error && <p role="alert" className="mt-3 text-sm text-amber-200">{error}</p>}</form>
    </Section>
    <ReadState state={overview.state} retry={overview.retry}/>
    {data && <>
      <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-400"><p>{data.period.from} — {data.period.to}</p><p>Updated {new Date(data.asOf).toLocaleTimeString("en-IN",{ timeZone: "UTC" })} UTC</p></div>
      {data.coverage.revenue !== "available" && <p className="rounded-lg border border-slate-700/50 bg-slate-900/40 px-4 py-3 text-xs leading-5 text-slate-400">Partner financial reporting is not connected yet. — means unavailable, not zero. No estimated revenue or settlement figures are shown.</p>}
      <section aria-label="Revenue KPIs" className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {[["gmv","GMV","Gross business value"],["revenue","TPL Revenue","TPL earnings"],["payable","Partner Payable","Partner earnings payable"],["settled","Settled Amount","Confirmed settlements"],["pending","Pending Settlement","Outstanding settlement amount"]].map(([id,label,note]) => <article key={id} className={`${panel} flex min-h-36 flex-col p-4`}><h3 className="text-xs font-medium leading-5 text-slate-400">{label}</h3><p className="my-3 break-words text-2xl font-semibold tabular-nums text-white">{revenueMoney(data.amounts[id as keyof typeof data.amounts],data.currency)}</p><p className="mt-auto text-[11px] leading-4 text-slate-500">{note}</p></article>)}
        <article className={`${panel} flex min-h-36 flex-col p-4`}><h3 className="text-xs font-medium leading-5 text-slate-400">Refunds / Adjustments</h3><p className="my-3 break-words text-2xl font-semibold tabular-nums text-white">{revenueMoney(data.amounts.refunds,data.currency)}</p><p className="mt-auto text-[11px] leading-4 text-slate-500">Refunds · Adjustments {revenueMoney(data.amounts.adjustments,data.currency)}</p></article>
      </section>
      <Section title="Revenue Trend" note="GMV, TPL earnings and Partner payable are distinct financial measures." aside={<label className="text-xs text-slate-400">Interval<select aria-label="Revenue trend interval" className={`${input} mt-1`} value={applied.grain} onChange={e => { setApplied(a => ({ ...a,grain: e.target.value })); setDraft(d => ({ ...d,grain: e.target.value })); }}>{data.filterPolicy.grains.map(g => <option key={g} value={g}>{performanceLabels[g] ?? g}</option>)}</select></label>}><RevenueTrend points={data.trend} currency={data.currency} available={data.coverage.revenue === "available"}/></Section>
      <DomainRevenue key={`domains-${key}`} filters={applied}/>
      <TopRevenuePartners key={`partners-${key}`} filters={applied}/>
      <Section title="Settlement Summary" note="Settlement status is separate from revenue earned. Detailed transactions, tax and ledger analysis remain in their respective sections.">
        <div className="grid gap-3 sm:grid-cols-3">{[["payable","Partner Payable"],["settled","Settled Amount"],["pending","Pending Settlement"]].map(([id,label],i) => <div key={id} className="rounded-lg border border-slate-700/50 p-4"><p className="flex items-center justify-between gap-2 text-xs text-slate-400">{label}{i < 2 && <ArrowRight className="h-3 w-3" aria-hidden="true"/>}</p><p className="mt-3 break-words text-xl font-semibold tabular-nums text-white">{revenueMoney(data.settlement[id as "payable" | "settled" | "pending"],data.currency)}</p></div>)}</div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400"><p>Partners awaiting settlement <strong className="ml-2 font-medium text-slate-200">{performanceNumber(data.settlement.partnersAwaitingSettlement)}</strong></p><p>Failed settlements <strong className="ml-2 font-medium text-slate-200">{performanceNumber(data.settlement.failedSettlements)}</strong></p></div>
        <p className="mt-4 text-xs leading-5 text-slate-500">{data.coverage.settlements !== "available" ? "Settlement reporting is not connected yet." : data.settlement.balanceAsOf ? `Settlement balances as of ${data.settlement.balanceAsOf}.` : "Settlement balance timestamp is unavailable."} Payable is not calculated by subtracting TPL revenue from GMV; tax, refunds and adjustments require reconciliation.</p>
      </Section>
    </>}
  </div>;
}
