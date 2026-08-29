"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Eye,
  FilePenLine,
  Globe2,
  Image as ImageIcon,
  LayoutTemplate,
  MonitorCog,
  Navigation,
  Palette,
  PanelTop,
  ShieldCheck,
  Sparkles,
  Tags,
  type LucideIcon,
} from "lucide-react";
import {
  getAdminWebsiteExperienceLoginSignup,
  type AdminApiError,
  type WebsiteExperienceAdminContext,
  type WebsiteExperienceAdminResponse,
} from "../../lib/admin/adminApiClient";

type LoadState =
  | { status: "loading"; data: null; error: null }
  | { status: "ready"; data: WebsiteExperienceAdminResponse; error: null }
  | { status: "error"; data: null; error: AdminApiError };

const futureModules = [
  { label: "Homepage", icon: LayoutTemplate },
  { label: "Navigation", icon: Navigation },
  { label: "Promotional Banners", icon: PanelTop },
  { label: "Service Pages", icon: Globe2 },
  { label: "Themes", icon: Palette },
  { label: "Footer", icon: Tags },
  { label: "Partner Content", icon: Sparkles },
  { label: "SEO / Metadata", icon: FilePenLine },
];

export function AdminWebsiteExperienceLanding() {
  const [state, setState] = useState<LoadState>({ status: "loading", data: null, error: null });

  useEffect(() => {
    let active = true;
    void getAdminWebsiteExperienceLoginSignup().then((result) => {
      if (!active) return;
      setState(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: null, error: result.error });
    });
    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => buildLoginSignupSummary(state.status === "ready" ? state.data.contexts : []), [state]);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded border border-blue-100 bg-white">
        <div className="relative bg-gradient-to-r from-slate-950 via-blue-950 to-cyan-800 px-5 py-6 text-white md:px-7 md:py-8">
          <div className="absolute right-8 top-6 hidden h-28 w-28 rounded-full border border-white/10 bg-white/5 md:block" />
          <div className="relative flex max-w-4xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase text-cyan-100">
                <MonitorCog className="h-4 w-4" />
                Website & Content
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-normal md:text-3xl">Website Experience</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-50">
                Manage what customers and partners see across TPL GO.
              </p>
            </div>
            <div className="rounded border border-white/15 bg-white/10 px-4 py-3 text-sm text-blue-50 shadow-sm backdrop-blur">
              <div className="flex items-center gap-2 font-semibold text-white">
                <ShieldCheck className="h-4 w-4 text-cyan-200" />
                Presentation only
              </div>
              <p className="mt-1 max-w-xs text-xs leading-5 text-blue-100">
                Auth routes, RBAC, OTP, providers, payments, and storage credentials are not editable here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {state.status === "error" ? (
        <section className="rounded border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {state.error.message}
        </section>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded bg-blue-50 text-blue-700">
                <MonitorCog className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase text-blue-700">Operational module</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-950">Login & Signup</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Manage promotional presentation for User Login, Partner Login, and Partner Registration without changing authentication behavior.
              </p>
            </div>
            <Link
              href="/admin/website-experience/login-signup"
              className="inline-flex h-11 items-center justify-center gap-2 rounded bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Manage Login & Signup
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <StatusTile icon={BadgeCheck} label="Published" value={summary.publishedLabel} detail="Public login reads published content" />
            <StatusTile icon={FilePenLine} label="Draft Changes" value={summary.draftLabel} detail="Saved drafts remain private until publish" />
            <StatusTile icon={Clock3} label="Last Published" value={summary.lastPublishedLabel} detail={summary.lastPublishedContext || "No published timestamp returned"} />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {summary.contexts.map((context) => (
              <div key={context.context} className="rounded border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{context.label}</p>
                  <span className={context.draftVersion > context.publishedVersion ? "rounded bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700" : "rounded bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700"}>
                    {context.draftVersion > context.publishedVersion ? "Draft changes" : "Published"}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Draft v{context.draftVersion} / Published v{context.publishedVersion}
                </p>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-blue-700" />
            <h3 className="text-sm font-semibold text-slate-950">Editor Includes</h3>
          </div>
          <div className="mt-4 space-y-3">
            {["Brand image", "Desktop hero image", "Mobile hero image", "Headline and highlight", "Benefits", "Trust line", "Save Draft", "Preview", "Publish", "Audit history"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                {item}
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="rounded border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-950">Future Website Content</h3>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          These areas are reserved for later Website Experience work. Login & Signup is the only operational editor in this batch.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {futureModules.map((item) => (
            <FutureModule key={item.label} label={item.label} icon={item.icon} />
          ))}
        </div>
      </section>
    </div>
  );
}

function buildLoginSignupSummary(contexts: WebsiteExperienceAdminContext[]) {
  const published = contexts.filter((context) => context.publishedVersion > 0).length;
  const draftChanges = contexts.filter((context) => context.draftVersion > context.publishedVersion).length;
  const lastPublished = contexts
    .filter((context) => context.publishedAt)
    .sort((left, right) => Date.parse(right.publishedAt || "") - Date.parse(left.publishedAt || ""))[0];

  return {
    publishedLabel: contexts.length ? `${published}/${contexts.length}` : "Loading",
    draftLabel: contexts.length ? String(draftChanges) : "Loading",
    lastPublishedLabel: lastPublished?.publishedAt ? formatDateTime(lastPublished.publishedAt) : "Not available",
    lastPublishedContext: lastPublished?.label,
    contexts,
  };
}

function StatusTile({ icon: Icon, label, value, detail }: { icon: LucideIcon; label: string; value: string; detail: string }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
        <Icon className="h-4 w-4 text-blue-700" />
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  );
}

function FutureModule({ label, icon: Icon }: { label: string; icon: LucideIcon }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span className="rounded bg-white px-2 py-1 text-[10px] font-semibold uppercase text-slate-400">Later</span>
    </div>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
