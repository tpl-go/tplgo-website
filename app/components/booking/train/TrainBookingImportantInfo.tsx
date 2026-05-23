"use client";

export default function TrainBookingImportantInfo() {
  return (
    <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="text-[20px] font-extrabold text-slate-900">
          Important Information
        </div>
        <div className="mt-1 text-[13px] text-slate-500">
          Please review these train booking rules before proceeding.
        </div>
      </div>

      <div className="space-y-3 px-5 py-5 text-[13px] text-slate-700">
        <div className="rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3">
          • Final train booking confirmation will happen only after payment and IRCTC authentication.
        </div>

        <div className="rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3">
          • Passenger details should match valid travel identity documents.
        </div>

        <div className="rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3">
          • Fare, availability and booking outcome may change until final IRCTC completion.
        </div>

        <div className="rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3">
          • In case IRCTC authentication fails after payment, refund / reversal flow may apply as per actual provider logic later.
        </div>
      </div>
    </section>
  );
}