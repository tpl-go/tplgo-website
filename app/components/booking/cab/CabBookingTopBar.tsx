"use client";

type Props = {
  timerLabel: string;
};

export default function CabBookingTopBar({ timerLabel }: Props) {
  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-[#111827]">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-3 py-3 md:px-4 md:py-4">
        <h1 className="text-[16px] font-extrabold text-white md:text-[18px]">
          Complete your booking
        </h1>

        <div className="rounded-full bg-white px-3 py-2 text-[13px] font-extrabold text-slate-900 md:px-4 md:text-[14px]">
          {timerLabel}
        </div>
      </div>
    </div>
  );
}
