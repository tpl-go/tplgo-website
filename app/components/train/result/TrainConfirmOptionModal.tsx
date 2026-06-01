"use client";

import { useEffect } from "react";
import { Lightbulb, X, ShieldCheck, MapPin, TrainFront } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  trainName: string;
  travelDate: string;
  classCode: string;
  confirmChance?: number;
  confirmTicketPrice?: number;
  onBookConfirmTicket?: () => void;
};

export default function TrainConfirmOptionModal({
  open,
  onClose,
  trainName,
  travelDate,
  classCode,
  confirmChance,
  confirmTicketPrice,
  onBookConfirmTicket,
}: Props) {
  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[180] flex items-end justify-center bg-black/45 px-3 py-0 backdrop-blur-[2px] md:items-center md:px-4 md:py-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[88vh] w-full max-w-[620px] overflow-hidden rounded-t-[22px] border border-emerald-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.22)] md:rounded-[20px]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-red-300 hover:text-red-500"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="border-b border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5,#ffffff)] px-4 py-3">
          <div className="flex items-start gap-3 pr-10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
              <Lightbulb size={18} />
            </div>

            <div className="min-w-0">
              <div className="text-[18px] font-extrabold leading-tight text-slate-900 md:text-[20px]">
                Confirmed Alternate Option
              </div>
              <div className="mt-1 break-words text-[13px] text-slate-600">
                {travelDate} • {trainName}
              </div>
            </div>
          </div>
        </div>

        <div className="max-h-[calc(88vh-152px)] overflow-y-auto">
          {/* Top tags */}
          <div className="px-4 pt-4 md:px-5">
            <div className="flex gap-2 overflow-x-auto rounded-[16px] border border-emerald-100 bg-emerald-50/60 px-3 py-3 md:flex-wrap md:overflow-visible">
              <Tag icon={<ShieldCheck size={13} />}>Confirm or 3X Refund</Tag>
              <Tag icon={<TrainFront size={13} />}>{classCode}</Tag>
              <Tag icon={<Lightbulb size={13} />}>
                {confirmChance ? `${confirmChance}% Chance` : "Confirmed"}
              </Tag>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 gap-2 px-4 py-3 md:grid-cols-3 md:px-5">
            <InfoBlock
              icon={<TrainFront size={16} />}
              title="Book From"
              value="Alternate boarding option"
              subValue="Optimized boarding possibility"
            />
            <InfoBlock
              icon={<MapPin size={16} />}
              title="Board From"
              value="Near-origin station"
              subValue="Smarter pickup alignment"
            />
            <InfoBlock
              icon={<MapPin size={16} />}
              title="Get Down"
              value="Near-destination station"
              subValue="Flexible confirmed travel plan"
            />
          </div>

          {/* Assured box */}
          <div className="px-4 pb-4 md:px-5">
            <div className="mx-auto max-w-[270px] rounded-[18px] border border-emerald-100 bg-[linear-gradient(180deg,#ffffff,#f0fdf4)] px-4 py-4 text-center shadow-sm">
              <div className="text-[12px] font-extrabold uppercase tracking-wide text-emerald-600">
                Assured Alternate
              </div>

              <div className="mt-1 text-[22px] font-extrabold text-slate-900">
                {classCode}
              </div>

              <div className="mt-1 text-[13px] font-semibold text-slate-700">
                {confirmChance
                  ? `${confirmChance}% confirmation chance`
                  : "Confirmed option"}
              </div>

              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                <ShieldCheck size={12} className="text-emerald-600" />
                Safer option on same train
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-slate-100 bg-white px-4 pb-5 pt-3 md:px-5">
          <button
            type="button"
            onClick={onBookConfirmTicket}
            className="h-[48px] w-full rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(34,197,94,0.26)] transition hover:scale-[1.01]"
          >
            Book Confirm Ticket ₹
            {(confirmTicketPrice || 0).toLocaleString("en-IN")}
          </button>

          <div className="mt-2 text-center text-[11px] font-medium text-slate-500">
            Alternate option shown for better confirmation support
          </div>
        </div>
      </div>
    </div>
  );
}

function Tag({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 shadow-sm">
      {icon}
      <span>{children}</span>
    </div>
  );
}

function InfoBlock({
  icon,
  title,
  value,
  subValue,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subValue: string;
}) {
  return (
    <div className="rounded-[16px] border border-slate-200 bg-white px-3 py-3 shadow-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        {icon}
      </div>

      <div className="mt-3 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
        {title}
      </div>

      <div className="mt-1 text-[13px] font-bold leading-[18px] text-slate-900">
        {value}
      </div>

      <div className="mt-1 text-[12px] leading-[16px] text-slate-500">
        {subValue}
      </div>
    </div>
  );
}
