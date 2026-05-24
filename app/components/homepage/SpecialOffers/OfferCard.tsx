"use client";

import { useMemo, useState } from "react";
import {
  Plane,
  Hotel,
  Map,
  Crown,
  Bus,
  Train,
  Car,
  Ship,
  ShieldCheck,
  BadgePercent,
  Sparkles,
} from "lucide-react";

import SmartOfferActivationModal from "@/app/components/smartOffers/SmartOfferActivationModal";

import {
  SMART_OFFERS_DATA,
  SmartOfferItem,
} from "@/app/lib/smartOffers";

type Props = {
  o: any;
};

function findSmartOfferBySlug(slug: string) {
  return SMART_OFFERS_DATA.find((item) => item.slug === slug) || null;
}

function getServiceMeta(type: string) {
  switch (type) {
    case "flight":
      return {
        label: "Flight Offer",
        icon: Plane,
        tone: "from-[#0b74ff] via-[#123c8c] to-[#06143a]",
        soft: "from-[#eff6ff] to-[#dbeafe]",
        accent: "#0b74ff",
      };

    case "hotel":
      return {
        label: "Hotel Offer",
        icon: Hotel,
        tone: "from-[#7c3aed] via-[#4c1d95] to-[#111827]",
        soft: "from-[#f5f3ff] to-[#ede9fe]",
        accent: "#7c3aed",
      };

    case "holiday":
      return {
        label: "Holiday Offer",
        icon: Map,
        tone: "from-[#f97316] via-[#c2410c] to-[#431407]",
        soft: "from-[#fff7ed] to-[#ffedd5]",
        accent: "#f97316",
      };

    case "bus":
      return {
        label: "Bus Offer",
        icon: Bus,
        tone: "from-[#16a34a] via-[#166534] to-[#052e16]",
        soft: "from-[#f0fdf4] to-[#dcfce7]",
        accent: "#16a34a",
      };

    case "train":
      return {
        label: "Train Offer",
        icon: Train,
        tone: "from-[#0891b2] via-[#155e75] to-[#083344]",
        soft: "from-[#ecfeff] to-[#cffafe]",
        accent: "#0891b2",
      };

    case "cab":
      return {
        label: "Cab Offer",
        icon: Car,
        tone: "from-[#ca8a04] via-[#854d0e] to-[#422006]",
        soft: "from-[#fefce8] to-[#fef3c7]",
        accent: "#ca8a04",
      };

    case "cruise":
      return {
        label: "Cruise Offer",
        icon: Ship,
        tone: "from-[#2563eb] via-[#1e40af] to-[#020617]",
        soft: "from-[#eff6ff] to-[#dbeafe]",
        accent: "#2563eb",
      };

    case "insurance":
      return {
        label: "Insurance Offer",
        icon: ShieldCheck,
        tone: "from-[#059669] via-[#047857] to-[#022c22]",
        soft: "from-[#ecfdf5] to-[#d1fae5]",
        accent: "#059669",
      };

    case "membership":
      return {
        label: "Privilege Offer",
        icon: Crown,
        tone: "from-[#111827] via-[#78350f] to-[#f97316]",
        soft: "from-[#fff7ed] to-[#fef3c7]",
        accent: "#f97316",
      };

    default:
      return {
        label: "Smart Offer",
        icon: BadgePercent,
        tone: "from-[#0f172a] via-[#334155] to-[#020617]",
        soft: "from-[#f8fafc] to-[#e2e8f0]",
        accent: "#334155",
      };
  }
}

export default function OfferCard({ o }: Props) {
  const [open, setOpen] = useState(false);

  const matchedOffer = useMemo<SmartOfferItem | null>(() => {
    if (o?.smartOfferSlug) {
      return findSmartOfferBySlug(o.smartOfferSlug);
    }

    const title = String(o?.title || "").toLowerCase();
    const type = String(o?.type || "").toLowerCase();
    const desc = String(o?.desc || "").toLowerCase();

    const combined = `${title} ${desc}`;

    if (type === "flight") {
      if (
        combined.includes("dubai") ||
        combined.includes("international") ||
        combined.includes("intl")
      ) {
        return findSmartOfferBySlug("international-flight-smart-offer");
      }

      return findSmartOfferBySlug("domestic-flight-smart-offer");
    }

    if (type === "hotel") {
      return findSmartOfferBySlug("luxury-hotel-smart-offer");
    }

    if (type === "holiday") {
      if (
        combined.includes("goa") ||
        combined.includes("package") ||
        combined.includes("holiday")
      ) {
        return findSmartOfferBySlug("goa-holiday-smart-offer");
      }

      return SMART_OFFERS_DATA.find((item) => item.service === "holiday") || null;
    }

    if (
      type === "membership" ||
      combined.includes("platinum") ||
      combined.includes("privilege") ||
      combined.includes("member")
    ) {
      return findSmartOfferBySlug("tpl-platinum-privilege-smart");
    }

    return null;
  }, [o]);

  const type = String(o?.type || matchedOffer?.service || "smart").toLowerCase();
  const meta = getServiceMeta(type);
  const Icon = meta.icon;

  const couponCode = matchedOffer?.couponCode || o?.smartOfferCode || "SMART";
  const discountText =
    matchedOffer?.discountMode === "percent"
      ? `${matchedOffer.discountValue}% OFF`
      : matchedOffer?.discountMode === "flat"
      ? `₹${Number(matchedOffer.discountValue || 0).toLocaleString(
          "en-IN"
        )} OFF`
      : matchedOffer?.discountMode === "membership"
      ? "PRIVILEGE"
      : "SPECIAL DEAL";

  return (
    <>
      <div
        className="
          group relative flex-shrink-0
          w-[82vw] max-w-[330px]
          overflow-hidden rounded-3xl bg-white
          shadow-[0_12px_30px_rgba(15,23,42,0.16)]
          transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.22)]
          cursor-pointer
          sm:w-[320px]
          lg:w-[calc((100%-72px)/4)] lg:max-w-none
        "
        onMouseEnter={() => {
          const scroll = document.querySelector(".offer-scroll") as any;
          if (scroll) scroll.dataset.pause = "true";
        }}
        onMouseLeave={() => {
          const scroll = document.querySelector(".offer-scroll") as any;
          if (scroll) scroll.dataset.pause = "false";
        }}
        onClick={() => {
          if (matchedOffer) setOpen(true);
        }}
      >
        <div
          className={`relative h-[148px] overflow-hidden bg-gradient-to-br ${meta.tone} sm:h-[168px]`}
        >
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute -right-12 bottom-0 h-36 w-36 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.20),transparent_32%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.16),transparent_30%)]" />

          <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/20 bg-black/25 px-2.5 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:px-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white shadow-lg">
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <div className="text-[8px] font-black uppercase tracking-[0.14em] text-white/65 sm:text-[9px] sm:tracking-[0.18em]">
                  TPL Exclusive
                </div>

                <div className="truncate text-[11px] font-black leading-none text-white sm:text-[12px]">
                  {meta.label}
                </div>
              </div>
            </div>

            <div className="shrink-0 rounded-2xl border border-[#facc15]/30 bg-[#111827]/60 px-2.5 py-2 shadow-lg backdrop-blur-xl sm:px-3">
              <div className="text-[8px] font-black uppercase tracking-[0.14em] text-[#facc15] sm:text-[9px] sm:tracking-[0.18em]">
                Premium
              </div>

              <div className="mt-0.5 text-[11px] font-black text-white sm:text-[12px]">
                TPL GO
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="inline-flex max-w-full rounded-full bg-white/95 px-3 py-1 text-[11px] font-black tracking-wide text-[#0f172a] shadow-sm">
              <span className="truncate">{couponCode}</span>
            </div>

            <div className="mt-2 truncate text-[24px] font-black leading-none text-white drop-shadow sm:text-[28px]">
              {discountText}
            </div>

            <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-white/85">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">AI matched smart travel deal</span>
            </div>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${meta.soft} p-4`}>
          <h3 className="line-clamp-2 min-h-[40px] text-[15px] font-black leading-tight text-[#111827]">
            {o.title}
          </h3>

          <p className="mt-2 line-clamp-2 min-h-[34px] text-[12px] font-semibold leading-[17px] text-[#64748b]">
            {o.desc}
          </p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-black text-[#0f172a] shadow-sm">
              Auto Match
            </div>

            <button
              type="button"
              className={`rounded-full bg-gradient-to-r ${meta.tone} px-4 py-2 text-[12px] font-black text-white shadow-md transition group-hover:scale-105`}
            >
              View Deal
            </button>
          </div>
        </div>
      </div>

      <SmartOfferActivationModal
        open={open}
        offer={matchedOffer}
        onClose={() => setOpen(false)}
      />
    </>
  );
}