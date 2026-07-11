"use client";

import { ShoppingCart } from "lucide-react";
import type { CreatorCheckoutPreview } from "@/app/lib/creators/creatorCartTypes";

export default function CreatorHiddenCartPreview({ preview }: { preview: CreatorCheckoutPreview }) {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-6 md:grid-cols-[1fr_320px]">
      <div className="rounded-3xl border border-stone-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white">
            <ShoppingCart className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Hidden cart preview</p>
            <h2 className="text-xl font-black text-slate-950">Creator checkout foundation</h2>
          </div>
        </div>
        <div className="mt-5 grid gap-3">
          {preview.items.length ? (
            preview.items.map((item) => (
              <article key={item.id} className="rounded-2xl border border-stone-200 p-4">
                <p className="text-sm font-black text-slate-950">{item.title}</p>
                <p className="mt-1 text-xs font-bold uppercase text-slate-500">{item.selectedLicense} license</p>
              </article>
            ))
          ) : (
            <div className="rounded-2xl bg-stone-100 p-4 text-sm font-bold text-slate-600">No Creator cart items in hidden preview.</div>
          )}
        </div>
      </div>

      <aside className="rounded-3xl border border-stone-200 bg-white p-4 md:sticky md:top-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Purchase summary</p>
        <div className="mt-4 space-y-3 text-sm font-bold text-slate-700">
          <div className="flex justify-between gap-4">
            <span>Subtotal</span>
            <span>₹{preview.price.subtotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Tax placeholder</span>
            <span>₹0</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-stone-200 pt-3 text-base font-black text-slate-950">
            <span>Total</span>
            <span>₹{preview.price.grandTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>
        <button disabled className="mt-5 min-h-11 w-full rounded-2xl bg-slate-300 px-4 text-sm font-black text-white">
          Checkout disabled
        </button>
        <p className="mt-3 text-xs leading-5 text-slate-500">Hidden mode only. No payment, order, entitlement or download is created.</p>
      </aside>
    </section>
  );
}
