"use client";

type Props = {
  timerLabel: string;
};

export default function CabBookingTopBar({ timerLabel }: Props) {
  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-[#111827]">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-4">
        <h1 className="text-[18px] font-extrabold text-white">
          Complete your booking
        </h1>

        <div className="rounded-full bg-white px-4 py-2 text-[14px] font-extrabold text-slate-900">
          {timerLabel}
        </div>
      </div>
    </div>
  );
}