"use client";

type Props = {
  bookingPayload: {
    trainName: string;
    trainNumber: string;
    fromCity: string;
    fromCode: string;
    toCity: string;
    toCode: string;
    travelDate: string;
    departureTime: string;
    arrivalTime: string;
    classCode: string;
    quota: string;
    bookingType: string;
  };
  irctcUsername?: string;
};

function formatDateLabel(dateStr?: string) {
  if (!dateStr) return "Not selected";

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

export default function TrainIrctcAuthSummaryCard({
  bookingPayload,
  irctcUsername,
}: Props) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#eff6ff,#ffffff)] px-4 py-4 md:px-5">
        <div className="text-[18px] font-extrabold text-slate-900 md:text-[19px]">
          Final Booking Summary
        </div>
        <div className="mt-1 text-[13px] text-slate-500">
          Verify with IRCTC to complete your booking.
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-5 md:gap-4 md:px-5">
        <div className="min-w-0">
          <div className="text-[20px] font-black text-slate-900">
            {bookingPayload.departureTime}
          </div>
          <div className="mt-1 break-words text-[12px] text-slate-500">
            {bookingPayload.fromCity} ({bookingPayload.fromCode})
          </div>
        </div>

        <div className="min-w-[86px] text-center md:min-w-0">
          <div className="break-words text-[13px] font-bold leading-5 text-slate-700 md:text-[14px]">
            {bookingPayload.trainName}
          </div>
          <div className="mt-1 text-[12px] text-slate-500">
            #{bookingPayload.trainNumber}
          </div>
        </div>

        <div className="min-w-0 text-right">
          <div className="text-[20px] font-black text-slate-900">
            {bookingPayload.arrivalTime}
          </div>
          <div className="mt-1 break-words text-[12px] text-slate-500">
            {bookingPayload.toCity} ({bookingPayload.toCode})
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 md:grid-cols-4 md:px-5">
        <MiniInfo label="Journey Date" value={formatDateLabel(bookingPayload.travelDate)} />
        <MiniInfo label="Class" value={bookingPayload.classCode} />
        <MiniInfo label="Quota" value={bookingPayload.quota} />
        <MiniInfo label="IRCTC ID" value={irctcUsername || "Not entered"} />
      </div>
    </section>
  );
}

function MiniInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-[16px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 break-words text-[14px] font-bold text-slate-900">
        {value}
      </div>
    </div>
  );
}
