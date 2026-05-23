"use client";

import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Gift,
  IndianRupee,
  Share2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import type {
  CruiseInfoItem,
  CruiseResultItem,
} from "@/app/lib/cruise/cruiseResultTypes";

type Props = {
  item: CruiseResultItem;
};

type SailingRow = CruiseResultItem["sailingDates"][number];

function buildInfoItem(
  id: string,
  label: string,
  title: string,
  description: string
): CruiseInfoItem {
  return {
    id,
    label,
    title,
    description,
  };
}

export default function CruiseShipPreviewOtherDatesTab({ item }: Props) {
  const router = useRouter();

  function handleShare(row: SailingRow) {
    const shareText = `${item.tripLabel} | ${row.date}`;

    if (navigator.share) {
      navigator.share({
        title: item.shipName,
        text: shareText,
      });
      return;
    }

    navigator.clipboard.writeText(shareText);
    alert("Sailing copied for sharing");
  }

  function handleViewDetails(row: SailingRow) {
    const payload = {
      cruiseId: item.id,
      title: item.title,
      tripLabel: item.tripLabel,
      cruiseLine: item.cruiseLine,
      shipName: item.shipName,
      departurePort: item.departurePort,
      arrivalPort: item.arrivalPort,
      durationNights: item.durationNights,
      mapImage: item.mapImage,
      taxesText: item.taxesText,
      sailingDateId: row.id,
      sailingDate: row.date,
      rates: {
        inside: row.inside,
        outside: row.outside,
        balcony: row.balcony,
        suite: row.suite,
      },
      promoItems: item.promoItems,
    };

    sessionStorage.setItem(
      "tpl_cruise_selected_sailing",
      JSON.stringify(payload)
    );

    const query = new URLSearchParams({
      sailingId: row.id,
      date: row.date,
    });

    router.push(`/cruise/detail/${item.id}?${query.toString()}`);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="grid grid-cols-[90px_140px_110px_110px_110px_110px_220px_150px] border-b border-slate-200 bg-slate-100 px-4 py-3 text-[13px] font-semibold text-slate-800">
        <div></div>
        <div>DATE</div>
        <div>INSIDE</div>
        <div>OUTSIDE</div>
        <div>BALCONY</div>
        <div>SUITE</div>
        <div>BENEFITS</div>
        <div className="text-right">ACTION</div>
      </div>

      <div className="divide-y divide-slate-200">
        {item.sailingDates.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-[90px_140px_110px_110px_110px_110px_220px_150px] items-center px-4 py-4 text-[13px]"
          >
            <div className="flex items-center gap-2">
              <IconPillButton
                title="Itinerary"
                onClick={() =>
                  alert("Itinerary view wiring yahan next step me connect hogi.")
                }
                icon={<CalendarDays size={14} />}
              />

              <IconPillButton
                title="Share"
                onClick={() => handleShare(row)}
                icon={<Share2 size={14} />}
              />
            </div>

            <div className="whitespace-nowrap text-[14px] font-semibold text-slate-800">
              {row.date}
            </div>

            <FareCell value={row.inside} />
            <FareCell value={row.outside} />
            <FareCell value={row.balcony} />
            <FareCell value={row.suite} />

            <div className="flex items-center gap-2">
              <IconPillButton
                title="Buy One Get One Offer"
                onClick={() =>
                  alert(
                    buildInfoItem(
                      `${row.id}-bogo`,
                      "Buy One Get One Offer",
                      "Buy One Get One Offer",
                      "These promotions are subject to availability and may not always be applicable to all guests on the booking. Please continue to price and book for complete eligibility and promotion details."
                    ).title
                  )
                }
                icon={<Gift size={14} />}
              />

              <IconPillButton
                title="Special Promotions"
                onClick={() =>
                  alert(
                    buildInfoItem(
                      `${row.id}-promo`,
                      "Special Promotions",
                      "Special Promotions",
                      "Additional cruise promotions may apply for selected sailings, cabins, and guest categories."
                    ).title
                  )
                }
                icon={<Sparkles size={14} />}
              />

              <IconPillButton
                title="Non Refundable Deposit"
                onClick={() =>
                  alert(
                    buildInfoItem(
                      `${row.id}-nrd`,
                      "Non Refundable Deposit",
                      "Non Refundable Deposit",
                      "This sailing may be booked under a non-refundable deposit fare. Cancellation and refund rules will apply as per fare conditions."
                    ).title
                  )
                }
                icon={<ShieldAlert size={14} />}
              />

              <IconPillButton
                title="Onboard Credit"
                onClick={() =>
                  alert(
                    buildInfoItem(
                      `${row.id}-obc`,
                      "Onboard Credit",
                      "Onboard Credit",
                      "Eligible guests may receive onboard credit that can be used during the cruise for selected purchases and experiences."
                    ).title
                  )
                }
                icon={<IndianRupee size={14} />}
              />
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => handleViewDetails(row)}
                className="rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 px-4 py-2 text-[13px] font-semibold text-white shadow-md transition hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FareCell({ value }: { value?: number }) {
  return (
    <div className="text-[14px] font-semibold text-slate-800">
      {value ? `₹${value.toLocaleString("en-IN")}` : "—"}
    </div>
  );
}

function IconPillButton({
  icon,
  title,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
    >
      {icon}
    </button>
  );
}