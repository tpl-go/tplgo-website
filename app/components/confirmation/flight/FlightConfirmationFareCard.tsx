"use client";

import { BadgeCheck, CreditCard, Sparkles, Tag } from "lucide-react";

type PriceBreakup = {
  baseFare?: number;
  tax?: number;
  surcharge?: number;

  seatTotal?: number;
  mealTotal?: number;
  cabTotal?: number;
  insuranceTotal?: number;
  addonsTotal?: number;

  appliedOffer?: number;
  appliedOfferCode?: string;
  appliedOfferTitle?: string;
  offerData?: any;

  discount?: number;
  tplCredit?: number;

  walletCalc?: {
    promoUsed?: number;
    earnedUsed?: number;
    refundUsed?: number;
  };

  totalAmount?: number;
};

type Props = {
  priceBreakup?: PriceBreakup;
  paymentMethod?: string;
  paymentStatus?: "paid" | "pending" | "failed";
  paidAt?: string | null;
  earnedOnThisBooking?: number;
};

function formatPrice(value?: number) {
  return `₹${Math.abs(Number(value || 0)).toLocaleString("en-IN")}`;
}

function formatDateTime(value?: string | null) {
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

export default function FlightConfirmationFareCard({
  priceBreakup,
  paymentMethod,
  paymentStatus = "paid",
  paidAt,
  earnedOnThisBooking = 0,
}: Props) {
  const walletCalc = priceBreakup?.walletCalc || {
    promoUsed: 0,
    earnedUsed: 0,
    refundUsed: 0,
  };

  const promoUsed = Number(walletCalc.promoUsed || 0);
  const earnedUsed = Number(walletCalc.earnedUsed || 0);
  const refundUsed = Number(walletCalc.refundUsed || 0);
  const walletUsed =
    promoUsed + earnedUsed + refundUsed || Number(priceBreakup?.tplCredit || 0);

  const appliedOfferAmount = Number(
    priceBreakup?.appliedOffer ||
      priceBreakup?.offerData?.discountAmount ||
      0
  );

  const appliedOfferCode =
    priceBreakup?.appliedOfferCode ||
    priceBreakup?.offerData?.code ||
    priceBreakup?.offerData?.couponCode ||
    "";

  const appliedOfferTitle =
    priceBreakup?.appliedOfferTitle ||
    priceBreakup?.offerData?.title ||
    "Best Flight Offer Applied";

  const grossAmount =
    Number(priceBreakup?.baseFare || 0) +
    Number(priceBreakup?.tax || 0) +
    Number(priceBreakup?.surcharge || 0) +
    Number(priceBreakup?.seatTotal || 0) +
    Number(priceBreakup?.mealTotal || 0) +
    Number(priceBreakup?.cabTotal || 0) +
    Number(priceBreakup?.insuranceTotal || 0) +
    Number(priceBreakup?.addonsTotal || 0);

  const amountAfterOffer = Math.max(
    grossAmount - appliedOfferAmount - Number(priceBreakup?.discount || 0),
    0
  );

  const totalPaid = Number(
    priceBreakup?.totalAmount || Math.max(amountAfterOffer - walletUsed, 0)
  );

  const paymentStatusText =
    paymentStatus === "paid"
      ? "Payment Successful"
      : paymentStatus === "pending"
      ? "Payment Pending"
      : "Payment Failed";

  const paymentStatusClass =
    paymentStatus === "paid"
      ? "border-[#bbf7d0] bg-[#dcfce7] text-[#166534]"
      : paymentStatus === "pending"
      ? "border-[#fde68a] bg-[#fef3c7] text-[#92400e]"
      : "border-[#fecaca] bg-[#fee2e2] text-[#b91c1c]";

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#d9e2ec] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.08)]">
      <div className="border-b border-[#e5e7eb] bg-white px-5 py-4">
        <div className="flex items-center gap-2">
          <CreditCard size={20} className="text-[#ea580c]" />
          <h2 className="text-[22px] font-black text-[#111827]">
            Fare & Payment Details
          </h2>
        </div>

        <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
          Flight fare, add-ons, offer, wallet and paid amount
        </div>
      </div>

      {appliedOfferAmount > 0 ? (
        <div className="relative overflow-hidden border-b border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_50%,#fff1e6_100%)] px-5 py-4">
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

                {appliedOfferCode ? (
                  <div className="rounded-full border border-[#fdba74] bg-[#fff7ed] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#ea580c]">
                    {appliedOfferCode}
                  </div>
                ) : null}
              </div>

              <div className="mt-2 text-[16px] font-black leading-tight text-[#111827]">
                {appliedOfferTitle}
              </div>

              <div className="mt-1 flex items-center gap-2 text-[13px] font-bold text-[#ea580c]">
                <Tag className="h-4 w-4" />
                <span>You saved {formatPrice(appliedOfferAmount)} instantly</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="px-5 py-5">
        <div className="mb-4 rounded-[16px] border border-[#e5e7eb] bg-[#f8fafc] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[12px] font-extrabold text-[#64748b]">
                Payment Method
              </div>

              <div className="mt-1 text-[15px] font-black text-[#111827]">
                {paymentMethod || "Online Payment"}
              </div>
            </div>

            <span
              className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[12px] font-black ${paymentStatusClass}`}
            >
              {paymentStatusText}
            </span>
          </div>

          <div className="mt-3 text-[12px] font-bold text-[#64748b]">
            Paid On:{" "}
            <span className="font-black text-[#111827]">
              {formatDateTime(paidAt)}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <FareRow label="Base Fare" value={priceBreakup?.baseFare} />
          <FareRow label="Taxes" value={priceBreakup?.tax} />
          <FareRow label="Surcharge" value={priceBreakup?.surcharge} />

          <Divider />

          <FareRow label="Seat Selection" value={priceBreakup?.seatTotal} />
          <FareRow label="Meal Charges" value={priceBreakup?.mealTotal} />
          <FareRow label="Cab Charges" value={priceBreakup?.cabTotal} />
          <FareRow label="Travel Insurance" value={priceBreakup?.insuranceTotal} />
          <FareRow label="Add-ons" value={priceBreakup?.addonsTotal} />

          <div className="-mt-1 rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] p-3">
            <MiniInfoRow label="Gross Amount" value={formatPrice(grossAmount)} />
          </div>

          <FareRow label="Offer Applied" value={-appliedOfferAmount} orange />

          {Number(priceBreakup?.discount || 0) > 0 ? (
            <FareRow label="Discount" value={-Number(priceBreakup?.discount)} orange />
          ) : null}

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

                {!promoUsed && !earnedUsed && !refundUsed && priceBreakup?.tplCredit ? (
                  <WalletRow
                    label="TPL Credit"
                    value={Number(priceBreakup.tplCredit)}
                  />
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
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[20px] font-black text-[#111827]">
                  Total Paid
                </div>

                <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
                  Final paid amount after offer and wallet benefits
                </div>
              </div>

              <div className="whitespace-nowrap text-[30px] font-black text-[#111827]">
                ₹{totalPaid.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>
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
    <div className="flex items-start justify-between gap-3">
      <div
        className={`text-[15px] font-bold ${
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

function Divider() {
  return <div className="h-px bg-[#e5e7eb] my-1" />;
}