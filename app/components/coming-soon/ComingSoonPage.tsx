"use client";

import Link from "next/link";
import { ArrowLeft, Clock, MessageCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const FALLBACK_TARGET_DATE = "2026-08-17T00:00:00+05:30";
const WHATSAPP_CONTACT_URL = "https://wa.me/919649400299";

type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTargetDate() {
  const configuredDate =
    process.env.NEXT_PUBLIC_TPL_COMING_SOON_TARGET_DATE || FALLBACK_TARGET_DATE;
  const parsedDate = new Date(configuredDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return new Date(FALLBACK_TARGET_DATE);
  }

  return parsedDate;
}

function getCountdownParts(targetDate: Date): CountdownParts {
  const remainingMs = Math.max(targetDate.getTime() - Date.now(), 0);
  const totalSeconds = Math.floor(remainingMs / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function formatPart(value: number) {
  return value.toString().padStart(2, "0");
}

export default function ComingSoonPage() {
  const targetDate = useMemo(() => getTargetDate(), []);
  const [countdown, setCountdown] = useState<CountdownParts>(() =>
    getCountdownParts(targetDate),
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCountdown(getCountdownParts(targetDate));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [targetDate]);

  const countdownItems = [
    { label: "Days", value: countdown.days.toString() },
    { label: "Hours", value: formatPart(countdown.hours) },
    { label: "Minutes", value: formatPart(countdown.minutes) },
    { label: "Seconds", value: formatPart(countdown.seconds) },
  ];

  return (
    <section className="min-h-[calc(100vh-96px)] bg-[#f6f7fb] px-4 py-10 text-[#111827] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-176px)] max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f97316]/25 bg-white px-4 py-2 text-sm font-semibold text-[#c2410c] shadow-sm">
              <Clock className="h-4 w-4" aria-hidden="true" />
              TPL beta upgrade in progress
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-black tracking-normal text-[#0f172a] sm:text-5xl lg:text-6xl">
                Coming Soon
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[#475569] sm:text-xl">
                We're upgrading TPL with real-time booking, payment, and travel
                APIs.
              </p>
            </div>

            <div className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {countdownItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-[#e2e8f0] bg-white p-4 shadow-sm"
                >
                  <div
                    className="font-mono text-3xl font-black text-[#0f172a]"
                    suppressHydrationWarning
                  >
                    {item.value}
                  </div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-normal text-[#64748b]">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#f97316] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:ring-offset-2"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to Home
              </Link>
              <a
                href={WHATSAPP_CONTACT_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#cbd5e1] bg-white px-5 py-3 text-sm font-bold text-[#0f172a] shadow-sm transition hover:border-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:ring-offset-2"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Contact on WhatsApp
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6 lg:p-8">
            <div className="grid gap-4">
              {[
                "Payment API readiness",
                "Amadeus flight API integration",
                "Amadeus hotel API integration",
                "Production OTP delivery",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-4 rounded-lg bg-[#f8fafc] p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0f172a] text-sm font-black text-white">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[#0f172a]">
                      {item}
                    </div>
                    <div className="mt-1 text-sm text-[#64748b]">
                      Being prepared for a safer live booking rollout.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
