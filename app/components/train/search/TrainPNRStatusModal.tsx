"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { TrainPNRResult } from "./trainTypes";

type Props = {
  open: boolean;
  onClose: () => void;
  data: TrainPNRResult | null;
};

function playWarningBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioCtx();

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.16);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.16);
  } catch {}
}

export default function TrainPNRStatusModal({ open, onClose, data }: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [flash, setFlash] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  function triggerBlockedCloseFeedback() {
    setFlash(true);
    playWarningBeep();

    setTimeout(() => {
      setFlash(false);
    }, 260);
  }

  if (!mounted || !open || !data) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
          triggerBlockedCloseFeedback();
        }
      }}
    >
      <div
        ref={panelRef}
        className={`relative w-full max-w-[760px] rounded-[24px] border bg-white shadow-2xl transition-all duration-200 ${
          flash
            ? "border-red-400 ring-4 ring-red-200"
            : "border-slate-200 ring-1 ring-black/5"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-red-300 hover:text-red-500"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="border-b border-slate-200 px-6 py-5">
          <h3 className="pr-10 text-[28px] font-extrabold text-slate-900">
            {data.trainName} ({data.trainNumber})
          </h3>

          <div className="mt-2 text-[16px] font-medium text-slate-600">
            {data.from} → {data.to} • {data.journeyDate}
          </div>

          <div className="mt-1 text-[15px] text-slate-500">
            PNR: {data.pnr}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b border-slate-200 px-6 py-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="text-[14px] font-medium text-slate-500">
              Chart Status
            </div>
            <div className="mt-1 text-[18px] font-bold text-slate-900">
              {data.chartStatus}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="text-[14px] font-medium text-slate-500">
              Booking Status
            </div>
            <div className="mt-1 text-[18px] font-bold text-slate-900">
              {data.bookingStatus}
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="mb-4 text-[22px] font-extrabold text-slate-900">
            Passenger Status
          </div>

          <div className="space-y-3">
            {data.passengers.map((passenger) => (
              <div
                key={passenger.passengerNo}
                className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4"
              >
                <div className="text-[16px] font-medium text-slate-600">
                  Passenger {passenger.passengerNo}
                </div>

                <div className="text-right">
                  <div className="text-[22px] font-extrabold text-slate-900">
                    {passenger.currentStatus}
                  </div>
                  <div className="text-[14px] text-slate-500">
                    {passenger.coach && passenger.berth
                      ? `${passenger.coach} / ${passenger.berth}`
                      : "Waiting / RAC"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}