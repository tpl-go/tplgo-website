"use client";

function formatDate(dateStr?: string) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export default function TrainConfirmationSummaryCard({ data }: any) {
  const booking = data.bookingPayload;

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="text-[18px] font-extrabold text-slate-900 mb-2">
  {booking.trainName} ({booking.trainNumber})
</div>

<div className="text-[15px] font-semibold text-slate-700">
  {booking.fromCity} ({booking.fromCode}) → {booking.toCity} ({booking.toCode})
</div>

<div className="mt-2 text-[14px] font-medium text-slate-700">
  {formatDate(booking.travelDate)} • {booking.classCode} • {booking.quota}
</div>

<div className="mt-3 text-[16px] font-extrabold text-green-700">
  PNR: {data.pnr}
</div>
    </div>
  );
}