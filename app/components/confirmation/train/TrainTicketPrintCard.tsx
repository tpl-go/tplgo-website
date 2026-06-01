"use client";

import { formatTrainDate } from "@/app/lib/train/trainConfirmationHelpers";

type TicketTraveller = {
  fullName?: string;
  age?: string | number;
  gender?: string;
  berthPreference?: string;
};

type TicketData = {
  pnr?: string;
  bookingStatus?: string;
  bookingPayload: {
    departureTime?: string;
    arrivalTime?: string;
    fromCity?: string;
    fromCode?: string;
    toCity?: string;
    toCode?: string;
    trainName?: string;
    trainNumber?: string;
    duration?: string;
    travelDate?: string;
    classCode?: string;
    quota?: string;
    bookingType?: string;
  };
  travellers?: TicketTraveller[];
  irctcAccount?: {
    username?: string;
  };
  contactDetails?: {
    email?: string;
    mobile?: string;
  };
  pricing?: {
    baseFare?: number;
    convenienceFee?: number;
    gatewayFee?: number;
    offerApplied?: number;
    tplCredit?: number;
    totalAmount?: number;
  };
};

type Props = {
  data: TicketData;
};

export default function TrainTicketPrintCard({ data }: Props) {
  const booking = data.bookingPayload;

  return (
    <div
      id="train-ticket-pdf"
      className="mx-auto w-full max-w-[900px] bg-white p-4 text-black md:p-8"
      style={{ backgroundColor: "#ffffff", color: "#000000" }}
    >
      <div
        className="overflow-hidden rounded-[24px] border"
        style={{ borderColor: "#cbd5e1", backgroundColor: "#ffffff" }}
      >
        <div
          className="border-b px-4 py-5 md:px-8 md:py-6"
          style={{
            backgroundColor: "#eff6ff",
            borderColor: "#cbd5e1",
          }}
        >
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:gap-6">
            <div className="min-w-0">
              <div className="break-words text-[22px] font-black tracking-tight text-black md:text-[28px]">
                TPL Train E-Ticket
              </div>
              <div className="mt-1 text-[14px]" style={{ color: "#475569" }}>
                Confirmed booking summary
              </div>
            </div>

            <div className="text-left md:text-right">
              <div className="text-[13px] font-bold" style={{ color: "#64748b" }}>
                PNR
              </div>
              <div className="break-words text-[20px] font-black md:text-[24px]" style={{ color: "#15803d" }}>
                {data.pnr}
              </div>
              <div className="mt-1 text-[13px] font-bold" style={{ color: "#15803d" }}>
                {data.bookingStatus || "Confirmed"}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white px-4 py-5 md:px-8 md:py-6">
          <div className="border-b pb-5 md:hidden" style={{ borderColor: "#cbd5e1" }}>
            <div className="break-words text-[15px] font-black leading-5 text-black">
              {booking.trainName}
            </div>
            <div className="mt-1 text-[12px] font-bold" style={{ color: "#64748b" }}>
              #{booking.trainNumber} • {booking.duration}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border px-3 py-3" style={{ borderColor: "#cbd5e1" }}>
                <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#64748b" }}>
                  Departure
                </div>
                <div className="mt-1 text-[22px] font-black text-black">
                  {booking.departureTime}
                </div>
                <div className="mt-1 break-words text-[12px] font-bold text-black">
                  {booking.fromCity} ({booking.fromCode})
                </div>
              </div>

              <div className="rounded-xl border px-3 py-3 text-right" style={{ borderColor: "#cbd5e1" }}>
                <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#64748b" }}>
                  Arrival
                </div>
                <div className="mt-1 text-[22px] font-black text-black">
                  {booking.arrivalTime}
                </div>
                <div className="mt-1 break-words text-[12px] font-bold text-black">
                  {booking.toCity} ({booking.toCode})
                </div>
              </div>
            </div>
          </div>

          <div
            className="hidden grid-cols-[1fr_auto_1fr] items-center gap-3 border-b pb-6 md:grid md:gap-6"
            style={{ borderColor: "#cbd5e1" }}
          >
            <div>
              <div className="text-[24px] font-black text-black md:text-[32px]">
                {booking.departureTime}
              </div>
              <div className="mt-1 break-words text-[13px] font-bold text-black md:text-[16px]">
                {booking.fromCity} ({booking.fromCode})
              </div>
            </div>

            <div className="text-center">
              <div className="break-words text-[13px] font-bold text-black md:text-[15px]">
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
              <div className="text-[24px] font-black text-black md:text-[32px]">
                {booking.arrivalTime}
              </div>
              <div className="mt-1 break-words text-[13px] font-bold text-black md:text-[16px]">
                {booking.toCity} ({booking.toCode})
              </div>
            </div>
          </div>

          <div
            className="grid grid-cols-2 gap-4 border-b py-6 md:grid-cols-4"
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
              {data.travellers?.map((traveller, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-4 rounded-xl border bg-white px-4 py-3 md:grid-cols-4"
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

          <div className="grid grid-cols-1 gap-6 py-6 md:grid-cols-[1.2fr_0.8fr]">
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
  value?: string;
}) {
  return (
    <div>
      <div
        className="text-[12px] font-bold uppercase tracking-wide"
        style={{ color: "#64748b" }}
      >
        {label}
      </div>
      <div className="mt-1 break-words text-[14px] font-bold text-black">{value}</div>
    </div>
  );
}

function Price({
  label,
  value,
}: {
  label: string;
  value?: number;
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
