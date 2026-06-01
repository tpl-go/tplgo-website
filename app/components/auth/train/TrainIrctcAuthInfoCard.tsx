"use client";

export default function TrainIrctcAuthInfoCard() {
  return (
    <section className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-4 md:px-5">
        <div className="text-[18px] font-extrabold text-slate-900">
          Important
        </div>
      </div>

      <div className="space-y-3 px-4 py-4 text-[13px] text-slate-700 md:px-5 md:py-5">
        <div className="rounded-[14px] border border-amber-200 bg-amber-50 px-4 py-3 font-semibold text-amber-800">
          Please keep your IRCTC password ready. Booking will complete only after successful verification.
        </div>

        <div className="rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-3">
          • This is the final step before train booking confirmation.
        </div>

        <div className="rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-3">
          • If verification fails, booking may remain incomplete.
        </div>

        <div className="rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-3">
          • Captcha is currently a dummy UI block and will be replaced during real API integration.
        </div>
      </div>
    </section>
  );
}
