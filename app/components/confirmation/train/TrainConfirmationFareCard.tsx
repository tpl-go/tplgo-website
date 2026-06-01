"use client";

import { BadgeCheck, CreditCard, Sparkles, Tag } from "lucide-react";

type WalletCalc = {
  promoUsed?: number;
  earnedUsed?: number;
  refundUsed?: number;
};

type OfferData = {
  discountAmount?: number;
  code?: string;
  couponCode?: string;
  title?: string;
};

type Props = {
  bookingId: string;
  paymentId: string;
  pnrNumber?: string;
  baseFare: number;
  reservationCharge?: number;
  superfastCharge?: number;
  otherCharges?: number;
  tax?: number;
  insuranceAmount?: number;
  foodAmount?: number;
  tplCredit?: number;

  appliedOffer?: number;
  appliedOfferCode?: string;
  appliedOfferTitle?: string;
  offerData?: OfferData;

  totalAmount: number;
  paymentMethod?: string;
  paymentStatus?: "success" | "pending" | "failed";
  paidAt?: string;

  walletCalc?: WalletCalc;
  earnedOnThisBooking?: number;
};

function formatPrice(value?: number) {
  return `₹${Math.abs(Number(value || 0)).toLocaleString("en-IN")}`;
}

function formatDateTime(value?: string) {
  if (!value) return "Just now";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TrainConfirmationFareCard({
  bookingId,
  paymentId,
  pnrNumber,
  baseFare,
  reservationCharge = 0,
  superfastCharge = 0,
  otherCharges = 0,
  tax = 0,
  insuranceAmount = 0,
  foodAmount = 0,
  tplCredit = 0,

  appliedOffer = 0,
  appliedOfferCode = "",
  appliedOfferTitle = "",
  offerData,

  totalAmount,
  paymentMethod = "UPI",
  paymentStatus = "success",
  paidAt,

  walletCalc,
  earnedOnThisBooking = 0,
}: Props) {
  const promoUsed = Number(walletCalc?.promoUsed || 0);
  const earnedUsed = Number(walletCalc?.earnedUsed || 0);
  const refundUsed = Number(walletCalc?.refundUsed || 0);

  const walletUsed = promoUsed + earnedUsed + refundUsed || Number(tplCredit || 0);

  const offerAmount = Number(appliedOffer || offerData?.discountAmount || 0);
  const offerCode = appliedOfferCode || offerData?.code || offerData?.couponCode || "";
  const offerTitle =
    appliedOfferTitle || offerData?.title || "Best Train Offer Applied";

  const grossAmount =
    Number(baseFare || 0) +
    Number(reservationCharge || 0) +
    Number(superfastCharge || 0) +
    Number(otherCharges || 0) +
    Number(tax || 0) +
    Number(insuranceAmount || 0) +
    Number(foodAmount || 0);

  const amountAfterOffer = Math.max(grossAmount - offerAmount, 0);

  const paymentStatusText =
    paymentStatus === "success"
      ? "Payment Successful"
      : paymentStatus === "pending"
      ? "Payment Pending"
      : "Payment Failed";

  const paymentStatusClass =
    paymentStatus === "success"
      ? "border-[#bbf7d0] bg-[#dcfce7] text-[#166534]"
      : paymentStatus === "pending"
      ? "border-[#fde68a] bg-[#fef3c7] text-[#92400e]"
      : "border-[#fecaca] bg-[#fee2e2] text-[#b91c1c]";

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#d9e2ec] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.08)]">
      <div className="border-b border-[#e5e7eb] bg-white px-4 py-4 md:px-5">
        <div className="flex items-center gap-2">
          <CreditCard size={20} className="text-[#ea580c]" />
          <h2 className="text-[19px] font-black text-[#111827] md:text-[22px]">
            Fare & Payment Details
          </h2>
        </div>

        <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
          Train fare, charges, offer, wallet and paid amount
        </div>
      </div>

      {offerAmount > 0 ? (
        <div className="relative overflow-hidden border-b border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_50%,#fff1e6_100%)] px-4 py-4 md:px-5">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#fb923c]/10 blur-3xl" />

          <div className="relative flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f97316,#ea580c)] shadow-[0_10px_24px_rgba(249,115,22,0.35)]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 rounded-full bg-[linear-gradient(135deg,#f97316,#ea580c)] px-3 py-1 shadow-[0_6px_18px_rgba(249,115,22,0.3)]">
                  <BadgeCheck className="h-3.5 w-3.5 text-white" />
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white">
                    Offer Applied
                  </span>
                </div>

                {offerCode ? (
                  <div className="rounded-full border border-[#fdba74] bg-[#fff7ed] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#ea580c]">
                    {offerCode}
                  </div>
                ) : null}
              </div>

              <div className="mt-2 text-[16px] font-black leading-tight text-[#111827]">
                {offerTitle}
              </div>

              <div className="mt-1 flex items-center gap-2 text-[13px] font-bold text-[#ea580c]">
                <Tag className="h-4 w-4" />
                <span>You saved {formatPrice(offerAmount)} instantly</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="px-4 py-4 md:px-5 md:py-5">
        <div className="mb-4 rounded-[16px] border border-[#e5e7eb] bg-[#f8fafc] p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <InfoItem label="Booking ID" value={bookingId} />
            <InfoItem label="Payment ID" value={paymentId} />
            <InfoItem label="PNR Number" value={pnrNumber || "Not available"} />
            <InfoItem label="Payment Method" value={paymentMethod} />
            <InfoItem label="Paid On" value={formatDateTime(paidAt)} />
          </div>

          <div className="mt-4">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[12px] font-black ${paymentStatusClass}`}
            >
              {paymentStatusText}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <FareRow label="Base Fare" value={baseFare} />
          <FareRow label="Reservation Charge" value={reservationCharge} />
          <FareRow label="Superfast Charge" value={superfastCharge} />
          <FareRow label="Other Charges" value={otherCharges} />
          <FareRow label="Taxes" value={tax} />
          <FareRow label="Travel Insurance" value={insuranceAmount} />
          <FareRow label="Meal Charges" value={foodAmount} />

          <div className="-mt-1 rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] p-3">
            <MiniInfoRow label="Gross Amount" value={formatPrice(grossAmount)} />
          </div>

          <FareRow label="Offer Applied" value={-offerAmount} orange />

          <FareRow label="Amount After Offer" value={amountAfterOffer} />

          {walletUsed > 0 ? (
            <>
              <FareRow label="TPL Credit" value={-walletUsed} orange />

              <div className="rounded-[14px] border border-[#dbeafe] bg-[#f8fbff] p-3">
                <div className="mb-2 text-[12px] font-extrabold text-[#1d4ed8]">
                  TPL Wallet Applied
                </div>

                {promoUsed > 0 ? (
                  <WalletRow label="Promo Credit" value={promoUsed} />
                ) : null}

                {earnedUsed > 0 ? (
                  <WalletRow label="Earned Credit" value={earnedUsed} />
                ) : null}

                {refundUsed > 0 ? (
                  <WalletRow label="Refund Wallet" value={refundUsed} />
                ) : null}

                {!promoUsed && !earnedUsed && !refundUsed && tplCredit > 0 ? (
                  <WalletRow label="TPL Credit" value={tplCredit} />
                ) : null}
              </div>
            </>
          ) : null}

          {earnedOnThisBooking > 0 ? (
            <div className="rounded-[14px] border border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed,#ffffff)] p-3 text-[12px] font-extrabold leading-[18px] text-[#ea580c]">
              🎉 You earned ₹{earnedOnThisBooking.toLocaleString("en-IN")} TPL
              Earned Credit on this booking.
            </div>
          ) : null}

          <div className="border-t border-dashed border-[#d1d5db] pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[18px] font-black text-[#111827] md:text-[20px]">
                  Total Paid
                </div>

                <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
                  Final paid amount after offer and wallet benefits
                </div>
              </div>

              <div className="whitespace-nowrap text-[24px] font-black text-[#111827] md:text-[30px]">
                ₹{Number(totalAmount || 0).toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-[#e5e7eb] bg-white px-3 py-3">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#64748b]">
        {label}
      </div>

      <div className="mt-1 break-words text-[13px] font-black leading-5 text-[#111827]">
        {value}
      </div>
    </div>
  );
}

function FareRow({
  label,
  value,
  orange = false,
}: {
  label: string;
  value?: number;
  orange?: boolean;
}) {
  if (!value) return null;

  const isNegative = value < 0;

  return (
    <div className="flex min-w-0 items-start justify-between gap-3">
      <div
        className={`min-w-0 text-[14px] font-bold md:text-[15px] ${
          orange ? "text-[#ea580c]" : "text-[#1f2937]"
        }`}
      >
        {label}
      </div>

      <div
        className={`whitespace-nowrap text-[15px] font-bold ${
          orange ? "text-[#ea580c]" : "text-[#1f2937]"
        }`}
      >
        {isNegative ? "-" : ""}
        {formatPrice(value)}
      </div>
    </div>
  );
}

function WalletRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-1.5 flex items-center justify-between gap-3">
      <span className="text-[12px] font-bold text-[#475569]">{label}</span>

      <span className="whitespace-nowrap text-[12px] font-extrabold text-[#ea580c]">
        -₹{Number(value || 0).toLocaleString("en-IN")}
      </span>
    </div>
  );
}

function MiniInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-1 flex items-center justify-between gap-3 first:mt-0">
      <span className="text-[12px] font-bold text-[#64748b]">{label}</span>
      <span className="text-[12px] font-extrabold text-[#475569]">{value}</span>
    </div>
  );
}
