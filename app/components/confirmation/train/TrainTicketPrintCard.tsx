"use client";

import { formatTrainDate } from "@/app/lib/train/trainConfirmationHelpers";

type Props = {
  data: any;
};

export default function TrainTicketPrintCard({ data }: Props) {
  const booking = data.bookingPayload;

  return (
    <div
      id="train-ticket-pdf"
      className="mx-auto w-[900px] bg-white p-8 text-black"
      style={{ backgroundColor: "#ffffff", color: "#000000" }}
    >
      <div
        className="overflow-hidden rounded-[24px] border"
        style={{ borderColor: "#cbd5e1", backgroundColor: "#ffffff" }}
      >
        <div
          className="border-b px-8 py-6"
          style={{
            backgroundColor: "#eff6ff",
            borderColor: "#cbd5e1",
          }}
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-[28px] font-black tracking-tight text-black">
                TPL Train E-Ticket
              </div>
              <div className="mt-1 text-[14px]" style={{ color: "#475569" }}>
                Confirmed booking summary
              </div>
            </div>

            <div className="text-right">
              <div className="text-[13px] font-bold" style={{ color: "#64748b" }}>
                PNR
              </div>
              <div className="text-[24px] font-black" style={{ color: "#15803d" }}>
                {data.pnr}
              </div>
              <div className="mt-1 text-[13px] font-bold" style={{ color: "#15803d" }}>
                {data.bookingStatus || "Confirmed"}
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-white">
          <div
            className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 pb-6 border-b"
            style={{ borderColor: "#cbd5e1" }}
          >
            <div>
              <div className="text-[32px] font-black text-black">
                {booking.departureTime}
              </div>
              <div className="mt-1 text-[16px] font-bold text-black">
                {booking.fromCity} ({booking.fromCode})
              </div>
            </div>

            <div className="text-center">
              <div className="text-[15px] font-bold text-black">
                {booking.trainName}
              </div>
              <div className="mt-1 text-[13px]" style={{ color: "#64748b" }}>
                #{booking.trainNumber}
              </div>
              <div className="mt-2 text-[13px] font-semibold" style={{ color: "#475569" }}>
                {booking.duration}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[32px] font-black text-black">
                {booking.arrivalTime}
              </div>
              <div className="mt-1 text-[16px] font-bold text-black">
                {booking.toCity} ({booking.toCode})
              </div>
            </div>
          </div>

          <div
            className="grid grid-cols-4 gap-4 py-6 border-b"
            style={{ borderColor: "#cbd5e1" }}
          >
            <Info label="Journey Date" value={formatTrainDate(booking.travelDate)} />
            <Info label="Class" value={booking.classCode} />
            <Info label="Quota" value={booking.quota} />
            <Info label="Booking Type" value={booking.bookingType} />
          </div>

          <div className="py-6 border-b" style={{ borderColor: "#cbd5e1" }}>
            <div className="mb-4 text-[18px] font-extrabold text-black">
              Passenger Details
            </div>
            <div className="space-y-3">
              {data.travellers?.map((traveller: any, index: number) => (
                <div
                  key={index}
                  className="grid grid-cols-4 gap-4 rounded-xl border px-4 py-3 bg-white"
                  style={{ borderColor: "#cbd5e1" }}
                >
                  <Info label={`Passenger ${index + 1}`} value={traveller.fullName || "N/A"} />
                  <Info
                    label="Age / Gender"
                    value={`${traveller.age || "-"} / ${traveller.gender || "-"}`}
                  />
                  <Info
                    label="Berth Preference"
                    value={traveller.berthPreference || "No Preference"}
                  />
                  <Info
                    label="IRCTC Username"
                    value={data.irctcAccount?.username || "N/A"}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[1.2fr_0.8fr] gap-6 py-6">
            <div>
              <div className="mb-3 text-[18px] font-extrabold text-black">Contact</div>
              <div className="space-y-2 text-[14px] text-black">
                <div>Email: {data.contactDetails?.email || "N/A"}</div>
                <div>Mobile: {data.contactDetails?.mobile || "N/A"}</div>
              </div>
            </div>

            <div>
              <div className="mb-3 text-[18px] font-extrabold text-black">
                Fare Summary
              </div>
              <div className="space-y-2 text-[14px] text-black">
                <Price label="Base Fare" value={data.pricing?.baseFare} />
                <Price label="Convenience Fee" value={data.pricing?.convenienceFee} />
                <Price label="Gateway Fee" value={data.pricing?.gatewayFee} />
                {data.pricing?.offerApplied > 0 && (
                  <Price label="Offer Applied" value={-data.pricing.offerApplied} />
                )}
                {data.pricing?.tplCredit > 0 && (
                  <Price label="TPL Credit" value={-data.pricing.tplCredit} />
                )}
                <div
                  className="mt-3 border-t border-dashed pt-3 text-[18px] font-black text-black"
                  style={{ borderColor: "#94a3b8" }}
                >
                  Total Paid: ₹ {Number(data.pricing?.totalAmount || 0).toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </div>

          <div
            className="rounded-xl border px-4 py-3 text-[13px]"
            style={{
              borderColor: "#fcd34d",
              backgroundColor: "#fef3c7",
              color: "#92400e",
            }}
          >
            Please carry a valid ID proof during travel. Final boarding and journey rules remain subject to railway and IRCTC policies.
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div
        className="text-[12px] font-bold uppercase tracking-wide"
        style={{ color: "#64748b" }}
      >
        {label}
      </div>
      <div className="mt-1 text-[14px] font-bold text-black">{value}</div>
    </div>
  );
}

function Price({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const formatted =
    value < 0
      ? `- ₹ ${Math.abs(value).toLocaleString("en-IN")}`
      : `₹ ${Number(value || 0).toLocaleString("en-IN")}`;

  return (
    <div className="flex items-center justify-between text-black">
      <span>{label}</span>
      <span className="font-bold">{formatted}</span>
    </div>
  );
}