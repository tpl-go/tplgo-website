"use client";

import { RefreshCcw } from "lucide-react";

export default function CreatorsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen bg-stone-50 px-4 py-12 text-slate-950">
      <section className="mx-auto max-w-2xl rounded-3xl border border-stone-200 bg-white p-6 text-center">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Creator catalog</p>
        <h1 className="mt-3 text-3xl font-black tracking-normal">Catalog view could not load</h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
          The Creator catalog is isolated from paid orders and protected OTA flows. Retry this view or return to the main Creator page.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-black text-white">
            <RefreshCcw className="h-4 w-4" />
            Retry
          </button>
          <a href="/creators" className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-200 px-5 text-sm font-black text-slate-700">
            Creator home
          </a>
        </div>
      </section>
    </main>
  );
}
