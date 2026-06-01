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

type BookingPayload = {
  trainName?: string;
  trainNumber?: string;
  fromCity?: string;
  fromCode?: string;
  toCity?: string;
  toCode?: string;
  travelDate?: string;
  classCode?: string;
  quota?: string;
};

type Props = {
  data: {
    bookingPayload: BookingPayload;
    pnr?: string;
  };
};

export default function TrainConfirmationSummaryCard({ data }: Props) {
  const booking = data.bookingPayload;

  return (
    <div className="min-w-0 rounded-xl border bg-white p-4 shadow-sm md:p-5">
      <div className="mb-2 break-words text-[18px] font-extrabold text-slate-900">
        {booking.trainName} ({booking.trainNumber})
      </div>

      <div className="break-words text-[15px] font-semibold text-slate-700">
        {booking.fromCity} ({booking.fromCode}) → {booking.toCity} ({booking.toCode})
      </div>

      <div className="mt-2 break-words text-[14px] font-medium text-slate-700">
        {formatDate(booking.travelDate)} • {booking.classCode} • {booking.quota}
      </div>

      <div className="mt-3 break-words text-[16px] font-extrabold text-green-700">
        PNR: {data.pnr}
      </div>
    </div>
  );
}
