"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { changeCentralSchedule, listCentralSchedules, readCentralScheduleHistory, validateScheduleForm, type CentralSchedule, type ScheduleAction, type ScheduleHistory, type ScheduleTarget } from "../../lib/admin/centralSchedules";

const button = "rounded-lg border px-3 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-50";
const actionClass: Record<ScheduleAction, string> = {
  cancel: "border-red-300/30 bg-red-400/10 text-red-100",
  reschedule: "border-amber-300/30 bg-amber-400/10 text-amber-100",
  retry: "border-red-300/30 bg-red-400/10 text-red-100",
};
const passiveButton = `${button} border-slate-500/30 bg-slate-700/20 text-slate-200`;
const primaryButton = `${button} border-sky-300/25 bg-sky-400/10 text-cyan-100`;
const labels: Record<ScheduleAction, string> = { cancel: "Cancel publication", reschedule: "Reschedule", retry: "Retry publication" };
const targetLabels: Record<ScheduleTarget, string> = {
  website_experience: "Website Experience",
  verification_policy: "Verification Rules",
  service_catalogue: "Service Catalogue",
};

export function CentralSchedulePanel({ targetType, targetId, onChanged, initialView = "scheduled" }: {
  targetType?: ScheduleTarget; targetId?: string; onChanged?: () => void;
  initialView?: "scheduled" | "failed" | "all";
}) {
  const [rows, setRows] = useState<CentralSchedule[]>([]);
  const [view, setView] = useState(initialView);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<{ row: CentralSchedule; action: ScheduleAction } | null>(null);
  const [history, setHistory] = useState<ScheduleHistory | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const panel = useRef<HTMLDivElement>(null);
  const request = useRef(0);
  const load = useCallback(async () => {
    const sequence = ++request.current;
    setLoading(true);
    try {
      const result = await listCentralSchedules(targetType, targetId);
      if (sequence !== request.current) return;
      if (result.ok) { setRows(result.data.rows); setDenied(false); }
      else { setRows([]); setDenied(result.status === 401 || result.status === 403); setMessage(result.status === 401 || result.status === 403 ? "You do not have access to these publications." : "Unable to load publications. Please refresh."); }
    } catch { if (sequence === request.current) { setRows([]); setMessage("Unable to load publications. Please refresh."); } }
    finally { if (sequence === request.current) setLoading(false); }
  }, [targetType, targetId]);
  useEffect(() => { void load(); return () => { request.current += 1; }; }, [load]);
  useEffect(() => { if (pending || history) panel.current?.focus(); }, [pending, history]);

  function select(row: CentralSchedule, action: ScheduleAction) {
    setMessage(""); setHistory(null); setPending({ row, action });
    const initial = new Date(Math.max(Date.parse(row.scheduledFor), Date.now() + 3600000)).toISOString();
    setDate(initial.slice(0, 10)); setTime(initial.slice(11, 16)); setTimezone(row.timezone);
  }
  async function submit() {
    if (!pending || busy) return;
    let schedule: { scheduledFor: string; timezone: string } | undefined;
    if (pending.action === "reschedule") {
      const value = validateScheduleForm(date, time, timezone);
      if (value.error || !value.scheduledFor || !value.timezone) { setMessage(value.error ?? "Choose a valid publication time."); return; }
      schedule = { scheduledFor: value.scheduledFor, timezone: value.timezone };
    }
    setBusy(true); setMessage(pending.action === "retry" ? "Retrying..." : "Saving...");
    try {
      const result = await changeCentralSchedule(pending.row, pending.action, schedule);
      if (result.ok) { setMessage(result.data.message); setPending(null); await load(); onChanged?.(); }
      else { setMessage(result.status === 403 ? "You do not have permission." : result.status === 409 ? "This schedule changed after you opened it. Refresh and review the latest version." : pending.action === "retry" ? "Publication failed. Review the issue before retrying." : "Action failed"); }
    } catch { setMessage("Action failed. Please refresh and try again."); }
    finally { setBusy(false); }
  }
  async function showHistory(row: CentralSchedule) {
    setPending(null); setBusy(true);
    try {
      const result = await readCentralScheduleHistory(row.id);
      if (result.ok) { setHistory(result.data); setMessage(""); }
      else setMessage("Unable to load publication history.");
    } catch { setMessage("Unable to load publication history."); }
    finally { setBusy(false); }
  }
  const visible = rows.filter(row => view === "all" || (view === "failed" ? row.status === "failed" : ["scheduled", "processing"].includes(row.status)));
  return <section className="min-w-0 space-y-3 rounded-xl border border-slate-700 bg-[#0b1628] p-4" aria-label="Publication schedules" aria-busy={loading || busy}>
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold text-cyan-100">Publication schedules</h2><button className={primaryButton} disabled={busy || loading} onClick={() => void load()}>Refresh publications</button></div>
    {message ? <p role="status" className="text-sm text-amber-100">{message}</p> : null}
    {!denied ? <>
      <div className="flex flex-wrap gap-2" aria-label="Publication views">{([['scheduled', 'Scheduled'], ['failed', 'Failed / Needs Attention'], ['all', 'History / All']] as const).map(([key, label]) => <button key={key} className={view === key ? primaryButton : passiveButton} aria-pressed={view === key} onClick={() => setView(key)}>{label}</button>)}</div>
      {loading ? <p className="text-sm text-slate-300">Loading publications...</p> : visible.length === 0 ? <p className="text-sm text-slate-300">No publications in this view.</p> : <ul className="space-y-3">{visible.map(row => <li key={row.id} className="min-w-0 space-y-2 rounded-lg border border-slate-700 p-3">
        <div className="flex flex-wrap justify-between gap-2"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-sky-300/70">{row.targetTypeLabel ?? targetLabels[row.targetType] ?? row.targetName}</p><h3 className="break-words font-semibold text-white">{row.targetName}</h3></div><span className={`text-sm font-semibold ${row.status === 'failed' ? 'text-red-200' : row.status === 'completed' ? 'text-green-200' : row.status === 'cancelled' ? 'text-slate-400' : 'text-amber-200'}`}>{row.statusLabel}</span></div>
        <p className="text-sm text-slate-300">{row.summary}</p>
        <p className="text-sm text-slate-300">{formatTime(row.scheduledFor, row.timezone)} · {row.timezone} · Scheduled by {row.scheduledBy}</p>
        {row.attemptCount > 0 ? <p className="text-xs text-slate-400">{row.attemptCount} publication attempts{row.lastAttemptAt ? ` · Last attempt ${formatTime(row.lastAttemptAt, row.timezone)}` : ''}</p> : null}
        {row.failureReason ? <p className="text-sm text-red-200">{row.failureReason}</p> : null}
        <div className="flex flex-wrap gap-2"><Link href={row.editorRoute} className={primaryButton}>Open</Link>{row.actions.map(action => <button className={`${button} ${actionClass[action]}`} key={action} disabled={busy} onClick={() => select(row, action)}>{labels[action]}</button>)}<button className={passiveButton} disabled={busy} onClick={() => void showHistory(row)}>View History</button></div>
      </li>)}</ul>}
    </> : null}
    {pending ? <div ref={panel} tabIndex={-1} className="space-y-3 rounded-lg border border-amber-300/30 p-4 focus:outline-cyan-300" onKeyDown={event => { if (event.key === "Escape" && !busy) setPending(null); }}>
      <h3 className="font-semibold text-cyan-100">{pending.action === 'reschedule' ? 'Reschedule publication' : labels[pending.action]} · {pending.row.targetName}</h3>
      {pending.action === "reschedule" ? <form className="space-y-3" onSubmit={event => { event.preventDefault(); void submit(); }}>
        <label className="block text-sm text-slate-300">New date<input required type="date" value={date} onChange={event => setDate(event.target.value)} className="mt-1 block w-full rounded bg-slate-900 p-2 text-white" /></label>
        <label className="block text-sm text-slate-300">New time<input required type="time" value={time} onChange={event => setTime(event.target.value)} className="mt-1 block w-full rounded bg-slate-900 p-2 text-white" /></label>
        <label className="block text-sm text-slate-300">Timezone<input required value={timezone} onChange={event => setTimezone(event.target.value)} placeholder="Asia/Kolkata" className="mt-1 block w-full rounded bg-slate-900 p-2 text-white" /></label>
        <div className="flex flex-wrap gap-2"><button className={primaryButton} disabled={busy}>{busy ? 'Saving...' : 'Save schedule'}</button><button type="button" className={passiveButton} disabled={busy} onClick={() => setPending(null)}>Cancel</button></div>
      </form> : <><p className="text-sm text-slate-300">{pending.action === 'cancel' ? 'Cancel this scheduled publication? The currently published version will remain active.' : pending.row.failureReason || "Publication failed. Review the issue before retrying."}</p><div className="flex flex-wrap gap-2"><button className={`${button} ${actionClass[pending.action]}`} disabled={busy} onClick={() => void submit()}>{busy ? (pending.action === 'retry' ? 'Retrying...' : 'Saving...') : pending.action === 'cancel' ? 'Confirm cancellation' : 'Confirm retry'}</button><button className={passiveButton} disabled={busy} onClick={() => setPending(null)}>Cancel</button></div></>}
    </div> : null}
    {history ? <div ref={panel} tabIndex={-1} className="space-y-3 rounded-lg border border-slate-700 p-3"><h3 className="font-semibold text-cyan-100">Publication history · {history.schedule.targetName}</h3><p className="text-sm text-slate-300">{history.schedule.statusLabel}</p><ol className="space-y-2">{history.events.map((event, index) => <li key={`${event.createdAt}-${index}`} className="text-sm text-slate-300">{event.action} · {event.actor} · {formatTime(event.createdAt, history.schedule.timezone)}{event.previousTime && event.scheduledTime ? <p className="text-xs">{formatTime(event.previousTime, history.schedule.timezone)} - {formatTime(event.scheduledTime, history.schedule.timezone)}</p> : null}</li>)}</ol>{history.events.length === 0 ? <p className="text-sm text-slate-400">No schedule changes recorded.</p> : null}<button className={passiveButton} onClick={() => setHistory(null)}>Close history</button></div> : null}
  </section>;
}
function formatTime(value: string, timezone: string) {
  try { return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: timezone }).format(new Date(value)); }
  catch { return "Date unavailable"; }
}
