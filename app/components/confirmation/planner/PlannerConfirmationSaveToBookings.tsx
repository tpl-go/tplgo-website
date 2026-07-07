"use client";

type Props = {
  bookingId?: string;
  saved: boolean;
};

export default function PlannerConfirmationSaveToBookings({ bookingId, saved }: Props) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
        saved
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-amber-200 bg-amber-50 text-amber-800"
      }`}
    >
      {saved
        ? `Saved to My Bookings${bookingId ? ` as ${bookingId}` : ""}.`
        : "This Smart Planner confirmation is ready. It will be saved to My Bookings when traveller contact data is available."}
    </div>
  );
}
