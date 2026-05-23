"use client";

import { BadgeCheck, CreditCard, Sparkles, Tag } from "lucide-react";

type Props = {
  data: any;
  paymentId: string;
};

function formatPrice(value?: number) {
  return `₹${Math.abs(Number(value || 0)).toLocaleString("en-IN")}`;
}

export default function InsuranceConfirmationFareCard({
  data,
  paymentId,
}: Props) {
  const fare = data?.fare || {};
  const wallet = fare?.walletBreakdown || data?.walletBreakdown || {};

  const basePremium = Number(fare?.basePremium || 0);
  const gst = Number(fare?.gst || 0);
  const addOnTotal = Number(fare?.addOnTotal || 0);

  const promoUsed = Number(fare?.promoUsed || wallet?.promoUsed || 0);
  const earnedUsed = Number(fare?.earnedUsed || wallet?.earnedUsed || 0);
  const refundUsed = Number(fare?.refundUsed || wallet?.refundUsed || 0);

  const walletUsed = Number(
    fare?.walletUsed ||
      wallet?.totalWalletUsed ||
      promoUsed + earnedUsed + refundUsed
  );

  const offerAmount = Number(
    fare?.appliedOfferAmount ||
      fare?.offerApplied ||
      data?.appliedOffer?.discountAmount ||
      0
  );

  const offerCode =
    fare?.appliedOfferCode ||
    data?.appliedOfferCode ||
    data?.appliedOffer?.code ||
    "";

  const offerTitle =
    fare?.appliedOfferTitle ||
    data?.appliedOfferTitle ||
    data?.appliedOffer?.title ||
    "Best Insurance Offer Applied";

  const grossAmount = Number(
    fare?.grossAmount ||
      fare?.totalBeforeWallet + offerAmount ||
      basePremium + gst + addOnTotal
  );

  const totalBeforeWallet = Number(
    fare?.totalBeforeWallet || Math.max(grossAmount - offerAmount, 0)
  );

  const totalPaid = Number(fare?.totalPaid || fare?.totalAmount || 0);

  const earnedOnThisBooking = Number(
    wallet?.earnedOnThisBooking ||
      data?.earnedCreditAmount ||
      data?.earnedOnThisBooking ||
      0
  );

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#d9e2ec] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.08)]">
      <div className="border-b border-[#e5e7eb] bg-white px-5 py-4">
        <div className="flex items-center gap-2">
          <CreditCard size={20} className="text-[#ea580c]" />
          <h2 className="text-[22px] font-black text-[#111827]">
            Payment & Fare Details
          </h2>
        </div>

        <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
          Premium, add-ons, offer, wallet and paid amount
        </div>
      </div>

      {offerAmount > 0 ? (
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
                <span>You saved {formatPrice(offerAmount)} instantly</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="px-5 py-5">
        <div className="space-y-3">
          <FareRow label="Base Premium" value={basePremium} />
          <FareRow label="GST" value={gst} />
          <FareRow label="Add-ons" value={addOnTotal} />

          <div className="-mt-1 rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] p-3">
            <MiniInfoRow label="Gross Amount" value={formatPrice(grossAmount)} />
          </div>

          <FareRow label="Offer Applied" value={-offerAmount} orange />

          <FareRow label="Amount After Offer" value={totalBeforeWallet} />

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
              </div>
            </>
          ) : null}

          {earnedOnThisBooking > 0 ? (
            <div className="rounded-[14px] border border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed,#ffffff)] p-3 text-[12px] font-extrabold leading-[18px] text-[#ea580c]">
              🎉 You earned {formatPrice(earnedOnThisBooking)} TPL Earned Credit
              on this policy booking.
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
                ₹{Number(totalPaid || 0).toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div className="rounded-[16px] bg-[#f8fafc] p-4 text-[12px] font-semibold leading-[20px] text-[#64748b]">
            Payment ID:{" "}
            <span className="font-black text-[#111827]">{paymentId}</span>
            <br />
            Method:{" "}
            <span className="font-black text-[#111827]">
              {data?.paymentMethod || data?.paymentData?.method || "Online Payment"}
            </span>
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