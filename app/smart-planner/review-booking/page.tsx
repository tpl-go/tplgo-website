"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function SmartPlannerReviewBookingPage() {
  return (
    <main className="min-h-screen bg-[#061839] px-4 py-10 text-white">
      <section className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[0.08] p-5 shadow-[0_22px_80px_rgba(0,0,0,0.24)] sm:p-8">
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
          <CheckCircle2 size={16} />
          Smart Planner review booking
        </div>
        <h1 className="mt-3 text-3xl font-black text-white">
          Booking review handoff
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/70">
          Your confirmed Smart Planner review is ready for final booking review.
          This page does not start payment or direct booking.
        </p>
        <div className="mt-5 grid gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4 text-sm font-semibold leading-6 text-cyan-50">
          <p>Review selected hotels, transport, activities, costs and notes before continuing to the booking engine.</p>
          <p>Payment and final booking remain disabled until the review step is complete.</p>
        </div>
        <Link
          href="/smart-planner/review"
          className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-5 text-sm font-black text-white"
        >
          Open Smart Planner Review
          <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}
