"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Command,
  Compass,
  Keyboard,
  Pin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";
import {
  getAdminSearchCenter,
  type AdminApiError,
  type AdminCommandPaletteItem,
  type AdminFavoriteItem,
  type AdminKeyboardShortcut,
  type AdminNavigationGraphItem,
  type AdminRecentItem,
  type AdminSearchCenterDashboard,
  type AdminSearchIndexStatus,
  type AdminSearchMetric,
  type AdminSearchResult,
  type AdminSearchStatus,
} from "../../lib/admin/adminApiClient";

type LoadState =
  | { status: "loading"; data: AdminSearchCenterDashboard; error: null }
  | { status: "ready"; data: AdminSearchCenterDashboard; error: null }
  | { status: "error"; data: AdminSearchCenterDashboard; error: AdminApiError };

const emptyDashboard: AdminSearchCenterDashboard = {
  metrics: [],
  results: [],
  commandPalette: [],
  navigationGraph: [],
  recent: [],
  favorites: [],
  searchStatus: [],
  shortcuts: [],
};

export function AdminSearchCenter() {
  const [state, setState] = useState<LoadState>({ status: "loading", data: emptyDashboard, error: null });
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    void getAdminSearchCenter().then((result) => {
      if (!active) return;
      setState(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: emptyDashboard, error: result.error });
    });
    return () => {
      active = false;
    };
  }, []);

  const data = state.data;
  const filteredResults = useMemo(() => filterResults(data.results, query), [data.results, query]);

  return (
    <div className="space-y-6">
      <Hero query={query} onQueryChange={setQuery} />

      {state.status === "error" ? <Notice tone="danger" text={state.error.message} /> : null}
      {state.status === "loading" ? <Notice tone="neutral" text="Loading search, command palette, navigation, and discovery read models from the admin API." /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {data.metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_28rem]">
        <div className="space-y-4">
          <GlobalSearchResults rows={filteredResults} />
          <NavigationGraph rows={data.navigationGraph} />
          <SearchStatus rows={data.searchStatus} />
        </div>
        <div className="space-y-4">
          <CommandPalette rows={data.commandPalette} />
          <RecentActivity rows={data.recent} />
          <Favorites rows={data.favorites} />
          <KeyboardShortcuts rows={data.shortcuts} />
        </div>
      </section>
    </div>
  );
}

function Hero({ query, onQueryChange }: { query: string; onQueryChange: (query: string) => void }) {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase text-slate-500">Unified Discovery</p>
      <div className="mt-2 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Enterprise Search, Command Palette & Unified Admin Navigation Center</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Read-only search and navigation foundation across operations, finance, CRM, content, suppliers, workflows, knowledge, teams, approvals, observability, platform, AI, and future ecosystem modules.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          No command execution or entity mutations
        </span>
      </div>
      <label className="relative mt-5 block">
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search modules, entities, runbooks, queues, finance, platform, AI, or future ecosystem areas"
          className="h-11 w-full rounded border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-slate-400"
        />
      </label>
    </section>
  );
}

function GlobalSearchResults({ rows }: { rows: AdminSearchResult[] }) {
  return (
    <Panel title="Global Search" icon={Search}>
      <DataTable
        headers={["Result", "Module", "Category", "Entity", "Status", "Open"]}
        rows={rows.map((row) => [
          <div key={`${row.id}-title`}>
            <p className="font-semibold text-slate-950">{row.title}</p>
            <p className="mt-1 text-xs text-slate-500">{row.detail}</p>
          </div>,
          row.module,
          row.category,
          row.entityType,
          <StatusPill key={`${row.id}-status`} status={row.status} />,
          <Link key={`${row.id}-open`} href={row.href} className="text-xs font-semibold text-slate-700 hover:text-slate-950">Open</Link>,
        ])}
        emptyText="No search results match the current query."
      />
    </Panel>
  );
}

function CommandPalette({ rows }: { rows: AdminCommandPaletteItem[] }) {
  return (
    <Panel title="Command Palette" icon={Command}>
      <div className="mb-3 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">Ctrl/Cmd + K ready · execution disabled</div>
      <div className="space-y-2">
        {rows.slice(0, 12).map((row) => (
          <div key={row.id} className="rounded border border-slate-200 px-3 py-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.label}</p>
                <p className="mt-1 text-xs text-slate-500">{row.commandType.replace(/_/g, " ")} · {row.shortcut}</p>
              </div>
              <DisabledButton label="Execute disabled" />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function NavigationGraph({ rows }: { rows: AdminNavigationGraphItem[] }) {
  const groups = groupNavigation(rows);
  return (
    <Panel title="Unified Navigation" icon={Compass}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(groups).map(([group, items]) => (
          <article key={group} className="rounded border border-slate-200 p-3">
            <p className="text-sm font-semibold text-slate-950">{group}</p>
            <div className="mt-3 space-y-2">
              {items.map((item) => (
                <Link key={item.id} href={item.href} className="flex items-center justify-between gap-2 rounded border border-slate-100 px-3 py-2 text-xs hover:bg-slate-50">
                  <span className="font-semibold text-slate-700">{item.label}</span>
                  <StatusPill status={item.status} />
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function RecentActivity({ rows }: { rows: AdminRecentItem[] }) {
  return (
    <Panel title="Recent Activity" icon={Sparkles}>
      <div className="space-y-2">
        {rows.map((row) => (
          <Link key={row.id} href={row.href} className="block rounded border border-slate-200 px-3 py-2 hover:bg-slate-50">
            <p className="text-sm font-semibold text-slate-950">{row.label}</p>
            <p className="mt-1 text-xs text-slate-500">{row.kind} · {row.lastSeen} · {row.persistence}</p>
          </Link>
        ))}
      </div>
    </Panel>
  );
}

function Favorites({ rows }: { rows: AdminFavoriteItem[] }) {
  return (
    <Panel title="Favorites" icon={Star}>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="rounded border border-slate-200 px-3 py-2">
            <div className="flex items-start justify-between gap-3">
              <Link href={row.href} className="text-sm font-semibold text-slate-950 hover:text-slate-700">{row.label}</Link>
              <DisabledButton label="Edit disabled" />
            </div>
            <p className="mt-1 text-xs text-slate-500">{row.kind}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function SearchStatus({ rows }: { rows: AdminSearchIndexStatus[] }) {
  return (
    <Panel title="Search Intelligence" icon={Pin}>
      <DataTable
        headers={["Category", "Index", "Entities", "Coverage", "AI Suggestions"]}
        rows={rows.map((row) => [
          row.category,
          <StatusPill key={`${row.id}-status`} status={row.indexStatus} />,
          row.entityCount,
          row.moduleCoverage,
          row.aiSuggestions,
        ])}
        emptyText="No search status returned."
      />
    </Panel>
  );
}

function KeyboardShortcuts({ rows }: { rows: AdminKeyboardShortcut[] }) {
  return (
    <Panel title="Keyboard Shortcuts" icon={Keyboard}>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="rounded border border-slate-200 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.shortcut}</p>
                <p className="mt-1 text-xs text-slate-500">{row.description}</p>
              </div>
              <DisabledButton label="Customize disabled" />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function MetricCard({ metric }: { metric: AdminSearchMetric }) {
  return (
    <article className="rounded border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">{metric.value}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded bg-emerald-50 text-emerald-700">
          <Search className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{metric.detail}</p>
    </article>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <section className="rounded border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
        <Icon className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function DataTable({ headers, rows, emptyText }: { headers: string[]; rows: Array<Array<ReactNode>>; emptyText: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
          <tr>{headers.map((header) => <th key={header} className="px-3 py-3 font-semibold">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <tr>
              <td className="px-3 py-8 text-center text-sm text-slate-500" colSpan={headers.length}>{emptyText}</td>
            </tr>
          ) : null}
          {rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`} className="hover:bg-slate-50">
              {row.map((cell, cellIndex) => <td key={`cell-${rowIndex}-${cellIndex}`} className="px-3 py-3 text-slate-600">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({ status }: { status: AdminSearchStatus }) {
  return <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${statusClass(status)}`}>{status.replace(/_/g, " ")}</span>;
}

function DisabledButton({ label }: { label: string }) {
  return <button type="button" disabled className="h-8 rounded border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-400">{label}</button>;
}

function Notice({ tone, text }: { tone: "danger" | "neutral"; text: string }) {
  const className = tone === "danger" ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-600";
  return <div className={`rounded border px-4 py-3 text-sm ${className}`}>{text}</div>;
}

function filterResults(rows: AdminSearchResult[], query: string): AdminSearchResult[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return rows;
  return rows.filter((row) => [row.title, row.module, row.category, row.entityType, row.detail].some((value) => value.toLowerCase().includes(normalized)));
}

function groupNavigation(rows: AdminNavigationGraphItem[]): Record<string, AdminNavigationGraphItem[]> {
  return rows.reduce<Record<string, AdminNavigationGraphItem[]>>((groups, row) => {
    groups[row.group] = [...(groups[row.group] ?? []), row];
    return groups;
  }, {});
}

function statusClass(status: AdminSearchStatus) {
  if (status === "ready") return "bg-emerald-50 text-emerald-700";
  if (status === "planned") return "bg-amber-50 text-amber-700";
  if (status === "disabled") return "bg-slate-100 text-slate-600";
  return "bg-blue-50 text-blue-700";
}
