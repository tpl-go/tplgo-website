"use client";

type Props = {
  bookingStatus: string;
  bookedAt: string;
  policyNumber: string;
  provider: string;
  planName: string;
  destination: string;
  travelDates: string;
  travellersLabel: string;
  coverageAmount: string;
  totalAmount: number;
};

function money(value: number) {
  return `₹${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;
}

export default function InsuranceManageSummary({
  bookingStatus,
  bookedAt,
  policyNumber,
  provider,
  planName,
  destination,
  travelDates,
  travellersLabel,
  coverageAmount,
  totalAmount,
}: Props) {
  return (
    <div className="rounded-[30px] border border-black/5 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-black text-[#111827]">Policy Summary</h2>
        <p className="text-sm font-semibold text-[#6b7280]">
          Current policy and booking details.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <InfoBox label="Policy Status" value={bookingStatus || "Active"} />
        <InfoBox label="Booked At" value={bookedAt || "-"} />
        <InfoBox label="Policy Number" value={policyNumber || "-"} />
        <InfoBox label="Insurance Provider" value={provider || "-"} />
        <InfoBox label="Plan Name" value={planName || "-"} />
        <InfoBox label="Destination" value={destination || "-"} />
        <InfoBox label="Travel Dates" value={travelDates || "-"} />
        <InfoBox label="Travellers" value={travellersLabel || "-"} />
        <InfoBox label="Coverage" value={coverageAmount || "-"} />
      </div>

      <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50 p-5">
        <p className="text-sm font-bold text-gray-600">Total Paid</p>
        <p className="mt-1 text-3xl font-black text-orange-700">
          {money(totalAmount)}
        </p>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f8fafc] p-4">
      <p className="text-xs font-bold text-[#64748b]">{label}</p>
      <p className="mt-1 break-words text-sm font-black text-[#111827]">
        {value}
      </p>
    </div>
  );
}