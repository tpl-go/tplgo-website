"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, ChevronDown, Download, Scale, ShieldAlert, Users } from "lucide-react";
import type { CreatorAsset, CreatorLicenseOption } from "@/app/lib/creators/creatorCatalogTypes";

function licenseLabel(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function UsageList({ title, items, tone }: { title: string; items: string[]; tone: "allow" | "block" }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
      <p className={`text-xs font-black uppercase tracking-[0.14em] ${tone === "allow" ? "text-emerald-700" : "text-red-700"}`}>{title}</p>
      <ul className="mt-3 space-y-2 text-sm font-semibold leading-6 text-slate-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function CreatorLicensePanel({ asset, compareEnabled }: { asset: CreatorAsset; compareEnabled: boolean }) {
  const [selectedType, setSelectedType] = useState(asset.licenseOptions[0]?.type || asset.licenses[0]);
  const [compareOpen, setCompareOpen] = useState(false);
  const selected = useMemo(
    () => asset.licenseOptions.find((option) => option.type === selectedType) || asset.licenseOptions[0],
    [asset.licenseOptions, selectedType]
  );

  if (!selected) return null;

  return (
    <>
      <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm lg:sticky lg:top-28">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">License</p>
            <p className="mt-2 text-3xl font-black text-slate-950">₹{selected.price.toLocaleString("en-IN")}</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">Selected {licenseLabel(selected.type)} license</p>
          </div>
          <Scale className="h-6 w-6 text-slate-400" />
        </div>

        <div className="mt-5 grid gap-2">
          {asset.licenseOptions.map((option) => (
            <button
              key={option.type}
              type="button"
              onClick={() => setSelectedType(option.type)}
              className={`flex min-h-12 items-center justify-between gap-3 rounded-2xl border px-3 text-left text-sm font-black transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 ${selectedType === option.type ? "border-slate-950 bg-slate-950 text-white" : "border-stone-200 bg-white text-slate-800 hover:border-slate-300"}`}
            >
              <span>{licenseLabel(option.type)}</span>
              <span>₹{option.price.toLocaleString("en-IN")}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-3 text-sm">
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-3 font-bold text-emerald-800">
            <Users className="h-4 w-4" />
            {selected.seats} · {selected.projects}
          </div>
          <div className="rounded-2xl bg-stone-100 px-3 py-3 font-bold text-slate-700">
            Distribution: {selected.distribution}
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <UsageList title="Allowed use" items={selected.allowedUse.slice(0, 3)} tone="allow" />
          <UsageList title="Prohibited use" items={selected.prohibitedUse.slice(0, 3)} tone="block" />
        </div>

        <button
          type="button"
          onClick={() => setCompareOpen(true)}
          disabled={!compareEnabled}
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 text-sm font-black text-slate-800 transition hover:border-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 disabled:text-slate-400 disabled:hover:border-stone-200"
        >
          <ChevronDown className="h-4 w-4" />
          {compareEnabled ? "Compare licenses" : "License comparison disabled"}
        </button>

        <button disabled className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-300 text-sm font-black text-white opacity-90">
          <Download className="h-4 w-4" />
          Add to cart coming next
        </button>
        <p className="mt-3 text-xs leading-5 text-slate-500">No paid order, entitlement or local purchase is created in this phase.</p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-[250] border-t border-stone-200 bg-white p-3 shadow-2xl lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-black uppercase text-cyan-700">{licenseLabel(selected.type)}</p>
            <p className="text-lg font-black text-slate-950">₹{selected.price.toLocaleString("en-IN")}</p>
          </div>
          <button disabled className="min-h-11 rounded-2xl bg-slate-300 px-4 text-sm font-black text-white opacity-90">
            Coming next
          </button>
        </div>
      </div>

      {compareOpen ? (
        <LicenseCompareDrawer options={asset.licenseOptions} onClose={() => setCompareOpen(false)} />
      ) : null}
    </>
  );
}

function LicenseCompareDrawer({ options, onClose }: { options: CreatorLicenseOption[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[500] bg-slate-950/60 p-4">
      <div className="ml-auto flex h-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white">
        <div className="flex items-center justify-between border-b border-stone-200 p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">License comparison</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Choose the right usage model</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-stone-100 px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-stone-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600">
            Close
          </button>
        </div>
        <div className="grid gap-4 overflow-y-auto p-5 md:grid-cols-2 xl:grid-cols-3">
          {options.map((option) => (
            <article key={option.type} className="rounded-2xl border border-stone-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-950">{licenseLabel(option.type)}</h3>
                  <p className="mt-1 text-2xl font-black text-slate-950">₹{option.price.toLocaleString("en-IN")}</p>
                </div>
                <BadgeCheck className="h-5 w-5 text-emerald-700" />
              </div>
              <p className="mt-4 text-sm font-bold text-slate-600">{option.seats} · {option.projects}</p>
              <div className="mt-4 space-y-3">
                <UsageList title="Allowed" items={option.allowedUse} tone="allow" />
                <UsageList title="Blocked" items={option.prohibitedUse} tone="block" />
              </div>
              <div className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-800">
                <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
                Final legal license certificate is future entitlement scope.
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
