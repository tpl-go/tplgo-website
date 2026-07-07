"use client";

import { BadgeCheck, CreditCard, Sparkles, Tag } from "lucide-react";

type WalletCalc = {
  earnedOnThisBooking?: number;
  earnedUsed?: number;
  promoUsed?: number;
  refundUsed?: number;
  totalWalletUsed?: number;
};

type Props = {
  appliedCoupon?: string;
  baseAfterOffer?: number;
  basePrice?: number;
  bookingId: string;
  couponDiscount?: number;
  earnedOnThisBooking?: number;
  feesAndTaxes?: number;
  finalAmount?: number;
  invoiceNumber: string;
  paidAt?: string;
  paymentId: string;
  paymentMethod?: string;
  paymentStatus?: string;
  tplCreditUsed?: number;
  totalBeforeWallet?: number;
  totalTravellers?: number;
  walletCalc?: WalletCalc;
};

function formatPrice(value?: number) {
  return `₹${Math.abs(Math.round(Number(value || 0))).toLocaleString("en-IN")}`;
}

function formatDateTime(value?: string) {
  if (!value) return "Not available";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getPaymentStatusMeta(status?: string) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "paid" || normalized === "success") {
    return {
      className: "border-[#bbf7d0] bg-[#dcfce7] text-[#166534]",
      label: "Payment Successful",
    };
  }

  if (normalized === "pending") {
    return {
      className: "border-[#fde68a] bg-[#fef3c7] text-[#92400e]",
      label: "Payment Pending",
    };
  }

  return {
    className: "border-[#fecaca] bg-[#fee2e2] text-[#b91c1c]",
    label: "Payment Failed",
  };
}

export default function PlannerConfirmationFareCard({
  appliedCoupon = "",
  baseAfterOffer,
  basePrice = 0,
  bookingId,
  couponDiscount = 0,
  earnedOnThisBooking = 0,
  feesAndTaxes,
  finalAmount = 0,
  invoiceNumber,
  paidAt = "",
  paymentId,
  paymentMethod = "Online Payment",
  paymentStatus = "paid",
  tplCreditUsed = 0,
  totalBeforeWallet,
  totalTravellers = 1,
  walletCalc,
}: Props) {
  const statusMeta = getPaymentStatusMeta(paymentStatus);
  const promoUsed = Number(walletCalc?.promoUsed || 0);
  const earnedUsed = Number(walletCalc?.earnedUsed || 0);
  const refundUsed = Number(walletCalc?.refundUsed || 0);
  const walletUsed =
    Number(walletCalc?.totalWalletUsed || 0) ||
    promoUsed + earnedUsed + refundUsed ||
    Number(tplCreditUsed || 0);
  const safeOfferAmount = Number(couponDiscount || 0);
  const finalBaseAfterOffer = Number(baseAfterOffer || 0);
  const finalTotalBeforeWallet = Number(totalBeforeWallet || 0);
  const totalPaid = Number(finalAmount || 0);

  return (
    <div className="overflow-hidden rounded-[18px] border border-[#d9e2ec] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.08)] sm:rounded-[24px]">
      <div className="border-b border-[#e5e7eb] bg-white px-4 py-4 sm:px-5">
        <div className="flex items-start gap-2 sm:items-center">
          <CreditCard className="h-5 w-5 text-[#ea580c]" />

          <h2 className="text-[20px] font-black leading-7 text-[#111827] sm:text-[22px]">
            Fare & Payment Summary
          </h2>
        </div>

        <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
          Smart Planner basket value, offer, wallet and paid amount
        </div>
      </div>

      {safeOfferAmount > 0 ? (
        <div className="relative overflow-hidden border-b border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_50%,#fff1e6_100%)] px-4 py-4 sm:px-5">
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

                {appliedCoupon ? (
                  <div className="rounded-full border border-[#fdba74] bg-[#fff7ed] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#ea580c]">
                    {appliedCoupon}
                  </div>
                ) : null}
              </div>

              <div className="mt-2 text-[16px] font-black leading-tight text-[#111827]">
                Smart Planner Offer Applied
              </div>

              <div className="mt-1 flex items-center gap-2 text-[13px] font-bold text-[#ea580c]">
                <Tag className="h-4 w-4" />
                <span>You saved {formatPrice(safeOfferAmount)} on selected basket value</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <div className="mb-4 rounded-[16px] border border-[#e5e7eb] bg-[#f8fafc] p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <InfoItem label="Booking ID" value={bookingId} />
            <InfoItem label="Payment ID" value={paymentId} />
            <InfoItem label="Invoice No." value={invoiceNumber} />
            <InfoItem label="Payment Method" value={paymentMethod || "Online Payment"} />
            <InfoItem label="Paid At" value={formatDateTime(paidAt)} />
          </div>

          <div className="mt-4">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[12px] font-black ${statusMeta.className}`}
            >
              {statusMeta.label}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <FareRow
            label={`Selected Basket Value (${totalTravellers} Traveller${
              totalTravellers > 1 ? "s" : ""
            })`}
            value={basePrice}
          />

          <FareRow label="Offer Discount" orange value={-safeOfferAmount} />

          <FareRow label="Base After Offer" value={finalBaseAfterOffer} />

          <FareRow label="Taxes & Fees" value={feesAndTaxes} />

          <div className="-mt-1 rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] p-3">
            <MiniInfoRow
              label="Total Before Wallet"
              value={formatPrice(finalTotalBeforeWallet)}
            />
          </div>

          <FareRow label="TPL Wallet Benefit" orange value={-walletUsed} />

          <div className="rounded-[14px] border border-[#dbeafe] bg-[#f8fbff] p-3">
            <div className="mb-2 text-[12px] font-extrabold text-[#1d4ed8]">
              Wallet Split
            </div>

            <WalletRow label="Promo Credit Used" value={promoUsed} />
            <WalletRow label="Earned Credit Used" value={earnedUsed} />
            <WalletRow label="Refund Wallet Used" value={refundUsed} />
          </div>

          <div className="rounded-[14px] border border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed,#ffffff)] p-3 text-[12px] font-extrabold leading-[18px] text-[#ea580c]">
            Earned Credit: ₹{earnedOnThisBooking.toLocaleString("en-IN")}
          </div>

          <div className="border-t border-dashed border-[#d1d5db] pt-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div>
                <div className="text-[20px] font-black text-[#111827]">
                  Total Paid
                </div>

                <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
                  Final paid amount after offer and wallet benefits
                </div>
              </div>

              <div className="whitespace-nowrap text-[28px] font-black text-[#111827] sm:text-[30px]">
                ₹{Number(totalPaid || 0).toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div className="rounded-[16px] bg-[#f8fafc] p-4 text-[12px] font-semibold leading-[20px] text-[#64748b]">
            Offer applies on eligible Smart Planner basket value. Promo Credit
            and Earned Credit apply as per saved payment calculation. Refund
            Wallet applies on payable amount where available.
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
        {value || "Not available"}
      </div>
    </div>
  );
}

function FareRow({
  label,
  orange,
  value,
}: {
  label: string;
  orange?: boolean;
  value?: number;
}) {
  const numeric = Number(value || 0);
  const isNegative = numeric < 0;

  return (
    <div className="flex items-start justify-between gap-3">
      <div
        className={`min-w-0 break-words text-[15px] font-bold ${
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
        {formatPrice(numeric)}
      </div>
    </div>
  );
}

function MiniInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-1 flex items-center justify-between gap-3 first:mt-0">
      <span className="min-w-0 break-words text-[12px] font-bold text-[#64748b]">{label}</span>
      <span className="text-[12px] font-extrabold text-[#475569]">{value}</span>
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
