"use client";

import { BadgeCheck, CreditCard, Sparkles, Tag } from "lucide-react";

type WalletCalc = {
  promoUsed?: number;
  earnedUsed?: number;
  refundUsed?: number;
};

type PackageConfirmationFareCardProps = {
  bookingId?: string;
  paymentId?: string;
  invoiceNumber?: string;
  paymentMethod?: string;
  paymentStatus?: "paid" | "pending" | "failed" | string;
  paidAt?: string;

  basePrice?: number;
  upgradedDiffTotal?: number;
  feesAndTaxes?: number;
  insuranceAmount?: number;

  couponDiscount?: number;
  tplCreditUsed?: number;
  grandTotal?: number;
  appliedCoupon?: string;

  baseAfterOffer?: number;
  totalBeforeWallet?: number;

  appliedOfferAmount?: number;
  appliedOfferCode?: string;
  appliedOfferTitle?: string;
  offerData?: any;

  walletCalc?: WalletCalc;
  earnedOnThisBooking?: number;

  totalTravellers?: number;

  

  upgradeBreakupRows?: Array<{
    label: string;
    value: number;
  }>;
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
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPaymentStatusMeta(status?: string) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "paid" || normalized === "success") {
    return {
      label: "Payment Successful",
      className: "border-[#bbf7d0] bg-[#dcfce7] text-[#166534]",
    };
  }

  if (normalized === "pending") {
    return {
      label: "Payment Pending",
      className: "border-[#fde68a] bg-[#fef3c7] text-[#92400e]",
    };
  }

  return {
    label: "Payment Failed",
    className: "border-[#fecaca] bg-[#fee2e2] text-[#b91c1c]",
  };
}

export default function PackageConfirmationFareCard({
  bookingId = "TPL-PKG-BOOKING",
  paymentId = "TPL-PAYMENT-ID",
  invoiceNumber = "TPL-INV-001",
  paymentMethod = "Online Payment",
  paymentStatus = "paid",
  paidAt = "",

  basePrice = 0,
  upgradedDiffTotal = 0,
  feesAndTaxes = 0,
  insuranceAmount = 0,

  couponDiscount = 0,
  tplCreditUsed = 0,
  grandTotal = 0,
  appliedCoupon = "",

  baseAfterOffer,
  totalBeforeWallet,

  appliedOfferAmount = 0,
  appliedOfferCode = "",
  appliedOfferTitle = "",
  offerData,

  walletCalc,
  earnedOnThisBooking = 0,

  totalTravellers = 1,

  

  upgradeBreakupRows = [],
}: PackageConfirmationFareCardProps) {
  const statusMeta = getPaymentStatusMeta(paymentStatus);

  const promoUsed = Number(walletCalc?.promoUsed || 0);
  const earnedUsed = Number(walletCalc?.earnedUsed || 0);
  const refundUsed = Number(walletCalc?.refundUsed || 0);

  const walletUsed =
    promoUsed + earnedUsed + refundUsed || Number(tplCreditUsed || 0);

  const offerAmount = Number(
    appliedOfferAmount || offerData?.discountAmount || couponDiscount || 0
  );

  const safeOfferAmount = Math.min(offerAmount, Number(basePrice || 0));

  const offerCode =
    appliedOfferCode ||
    offerData?.code ||
    offerData?.couponCode ||
    appliedCoupon ||
    "";

  const offerTitle =
    appliedOfferTitle || offerData?.title || "Best Package Offer Applied";

  const calculatedBaseAfterOffer = Math.max(
    Number(basePrice || 0) - safeOfferAmount,
    0
  );

  const finalBaseAfterOffer = Number(
    baseAfterOffer ?? calculatedBaseAfterOffer
  );

  const finalTotalBeforeWallet = Number(
    totalBeforeWallet ??
      finalBaseAfterOffer +
        Number(upgradedDiffTotal || 0) +
        Number(feesAndTaxes || 0) +
        Number(insuranceAmount || 0)
  );

  const totalPaid = Number(
    grandTotal || Math.max(finalTotalBeforeWallet - walletUsed, 0)
  );

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#d9e2ec] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.08)]">
      <div className="border-b border-[#e5e7eb] bg-white px-5 py-4">
        <div className="flex items-center gap-2">
          <CreditCard size={20} className="text-[#ea580c]" />

          <h2 className="text-[22px] font-black text-[#111827]">
            Fare & Payment Summary
          </h2>
        </div>

        <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
          Package fare, upgrades, offer, wallet and paid amount
        </div>
      </div>

      {safeOfferAmount > 0 ? (
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
                <span>You saved {formatPrice(safeOfferAmount)} on base package</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="px-5 py-5">
        <div className="mb-4 rounded-[16px] border border-[#e5e7eb] bg-[#f8fafc] p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <InfoItem label="Booking ID" value={bookingId} />
            <InfoItem label="Payment ID" value={paymentId} />
            <InfoItem label="Invoice No." value={invoiceNumber} />
            <InfoItem label="Payment Method" value={paymentMethod} />
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
            label={`Base Package Price (${totalTravellers} Traveller${
              totalTravellers > 1 ? "s" : ""
            })`}
            value={basePrice}
          />

          <FareRow
            label="Offer Discount"
            value={-safeOfferAmount}
            orange
          />

          <FareRow
            label="Base After Offer"
            value={finalBaseAfterOffer}
          />

          <FareRow label="Upgrade Difference" value={upgradedDiffTotal} />

          {upgradedDiffTotal > 0 ? (
            <div className="rounded-[14px] border border-[#fed7aa] bg-[#fff7ed] p-3">
              <div className="mb-2 text-[12px] font-extrabold text-[#ea580c]">
                Upgrade Breakup
              </div>

              {upgradeBreakupRows.length > 0 ? (
                upgradeBreakupRows.map((item) => (
                  <MiniInfoRow
                    key={item.label}
                    label={item.label}
                    value={`+${formatPrice(item.value)}`}
                  />
                ))
              ) : (
                <MiniInfoRow
                  label="Customisation / Upgrade"
                  value={`+${formatPrice(upgradedDiffTotal)}`}
                />
              )}
            </div>
          ) : null}

          <FareRow label="Fees & Taxes" value={feesAndTaxes} />

          {insuranceAmount > 0 ? (
            <FareRow label="Insurance" value={insuranceAmount} />
          ) : null}

          <div className="-mt-1 rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] p-3">
            <MiniInfoRow
              label="Total Before Wallet"
              value={formatPrice(finalTotalBeforeWallet)}
            />
          </div>

          {walletUsed > 0 ? (
            <>
              <FareRow label="TPL Wallet Benefit" value={-walletUsed} orange />

              <div className="rounded-[14px] border border-[#dbeafe] bg-[#f8fbff] p-3">
                <div className="mb-2 text-[12px] font-extrabold text-[#1d4ed8]">
                  Wallet Split
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

                {!promoUsed && !earnedUsed && !refundUsed && tplCreditUsed > 0 ? (
                  <WalletRow label="TPL Credit" value={tplCreditUsed} />
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
                  Grand Total Paid
                </div>

                <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
                  Final paid amount after offer and wallet benefits
                </div>
              </div>

              <div className="whitespace-nowrap text-[30px] font-black text-[#111827]">
                ₹{Number(totalPaid || 0).toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div className="rounded-[16px] bg-[#f8fafc] p-4 text-[12px] font-semibold leading-[20px] text-[#64748b]">
            Offer applies only on base package value. Promo Credit and Earned
            Credit apply only on base-after-offer. Refund Wallet can apply on
            full payable amount.
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