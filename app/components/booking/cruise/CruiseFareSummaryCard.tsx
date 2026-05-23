"use client";

import { Sparkles, BadgeCheck, Tag } from "lucide-react";

type StatusType = "pending" | "selected" | "skipped";

type WalletBreakdown = {
  promoUsed: number;
  earnedUsed: number;
  refundUsed: number;
};

type Props = {
  title?: string;
  sailingDate?: string | null;
  cabinCount?: number;
  travellerCount?: number;

  baseFare: number;
  taxes: number;
  portCharges?: number;
  gratuityCharges?: number;

  appliedOffer?: number;
  appliedOfferCode?: string;
  appliedOfferTitle?: string;
  discount?: number;
  tplCredit?: number;

  walletBreakdown?: WalletBreakdown;
  earnedOnThisBooking?: number;
  refundWalletAvailable?: number;
  useRefundWallet?: boolean;
  onToggleRefundWallet?: (checked: boolean) => void;

  baseAfterOffer?: number;
  totalBeforeWallet?: number;
  pricingRuleSummary?: any;

  insuranceTotal?: number;
  addonsTotal?: number;

  insuranceStatus?: StatusType;
  addonsStatus?: StatusType;

  totalAmount: number;
  canProceed: boolean;
  blockerMessage?: string;
  buttonLabel?: string;
  onProceed: () => void;
  pricingSummary?: any;
};

function formatPrice(value: number) {
  return `₹${Math.abs(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(value?: string | null) {
  if (!value) return "Sailing date on request";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CruiseFareSummaryCard({
  title = "Cruise Booking",
  sailingDate,
  cabinCount = 0,
  travellerCount = 0,

  baseFare,
  taxes,
  portCharges = 0,
  gratuityCharges = 0,

  appliedOffer = 0,
  appliedOfferCode = "",
  appliedOfferTitle = "Best Cruise Offer Activated",
  discount = 0,
  tplCredit = 0,

  walletBreakdown,
  earnedOnThisBooking = 0,
  refundWalletAvailable = 0,
  useRefundWallet = true,
  onToggleRefundWallet,

  baseAfterOffer = 0,
  totalBeforeWallet = 0,
  pricingRuleSummary,
  pricingSummary,

  insuranceTotal = 0,
  addonsTotal = 0,
  insuranceStatus = "pending",
  addonsStatus = "pending",

  totalAmount,
  canProceed,
  blockerMessage = "",
  buttonLabel = "Proceed to Payment",
  onProceed,
}: Props) {
  const promoUsed = walletBreakdown?.promoUsed || 0;
  const earnedUsed = walletBreakdown?.earnedUsed || 0;
  const refundUsed = walletBreakdown?.refundUsed || 0;

  const cabinBreakupText =
  pricingSummary?.cabins?.length > 0
    ? pricingSummary.cabins
        .map((cabin: any) => {
          const travellers =
            Number(cabin.adults || 0) +
            Number(cabin.children || 0) +
            Number(cabin.infants || 0);

          const perCabinAvg =
            travellers > 0
              ? Math.round(Number(cabin.subtotal || 0) / travellers)
              : Number(cabin.subtotal || 0);

          return `${formatPrice(perCabinAvg)} × ${travellers} traveller${
            travellers > 1 ? "s" : ""
          }`;
        })
        .join(" + ")
    : undefined;

  const finalBaseAfterOffer =
    baseAfterOffer ||
    pricingRuleSummary?.baseAfterOffer ||
    Math.max(Number(baseFare || 0) - Number(appliedOffer || 0), 0);

  const finalTotalBeforeWallet =
    totalBeforeWallet ||
    pricingRuleSummary?.payableBeforeRefundWallet ||
    Math.max(finalBaseAfterOffer + taxes + portCharges + gratuityCharges, 0);

  const totalWalletUsed = promoUsed + earnedUsed + refundUsed;

  return (
    <aside className="w-full">
      <div className="sticky top-[96px] z-20">
        <div className="overflow-hidden rounded-[24px] border border-[#d9e2ec] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.08)]">
          {/* HEADER */}
          <div className="border-b border-[#e5e7eb] bg-white px-4 py-4">
            <div className="text-[22px] font-extrabold text-[#1f2937]">
              Fare Summary
            </div>

            <div className="mt-1 line-clamp-2 text-[12px] font-semibold leading-[18px] text-[#6b7280]">
              {title}
            </div>

            <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
              Sailing: {formatDate(sailingDate)}
            </div>
          </div>

          {/* SMART OFFER */}
          {appliedOffer > 0 ? (
            <div className="relative overflow-hidden border-b border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_50%,#fff1e6_100%)] px-4 py-4">
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

                  <div className="mt-2 text-[17px] font-black leading-tight text-[#111827]">
                    {appliedOfferTitle}
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-[13px] font-bold text-[#ea580c]">
                    <Tag className="h-4 w-4" />

                    <span>
                      You saved {formatPrice(appliedOffer)} instantly
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* BODY */}
          <div className="border-b border-[#eef2f7] px-4 py-4">
            <FareRow
  label="Cruise Base Fare"
  value={baseFare}
  detail={cabinBreakupText}
/>

            {appliedOffer > 0 ? (
              <>
                <FareRow
                  label="Offer Discount"
                  value={-appliedOffer}
                  positiveGreen
                />

                <div className="mb-4 rounded-[14px] border border-[#fed7aa] bg-[#fffaf5] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] font-bold text-[#9a3412]">
                      Base After Offer
                    </span>

                    <span className="text-[12px] font-extrabold text-[#ea580c]">
                      ₹{finalBaseAfterOffer.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="mt-1 text-[11px] font-semibold leading-[17px] text-[#7c2d12]">
                    Promo & Earned Credit apply only on cruise base fare after
                    offer. Taxes and extra charges remain outside benefit
                    calculation.
                  </div>
                </div>
              </>
            ) : null}

            <FareRow label="Taxes & Fees" value={taxes} />

            {portCharges > 0 ? (
              <FareRow label="Port Charges" value={portCharges} />
            ) : null}

            {gratuityCharges > 0 ? (
              <FareRow label="Gratuity Charges" value={gratuityCharges} />
            ) : null}

            {insuranceStatus === "skipped" ? (
              <StatusRow label="Travel Protection" value="Skipped" />
            ) : insuranceTotal > 0 ? (
              <FareRow label="Travel Protection" value={insuranceTotal} />
            ) : null}

            {addonsStatus === "skipped" ? (
              <StatusRow label="Add-ons" value="Skipped" />
            ) : addonsTotal > 0 ? (
              <FareRow label="Add-ons" value={addonsTotal} />
            ) : null}

            {discount > 0 ? (
              <FareRow label="Discount" value={-discount} positiveGreen />
            ) : null}

            {tplCredit > 0 ? (
              <>
                <FareRow label="TPL Credit" value={-tplCredit} positiveGreen />

                {(promoUsed > 0 || earnedUsed > 0 || refundUsed > 0) && (
                  <div className="-mt-1 mb-4 rounded-[14px] border border-[#dbeafe] bg-[#f8fbff] p-3">
                    <div className="mb-2 text-[12px] font-extrabold text-[#1d4ed8]">
                      TPL Wallet Benefit Applied
                    </div>

                    {promoUsed > 0 ? (
                      <MiniWalletRow label="Promo Credit" value={promoUsed} />
                    ) : null}

                    {earnedUsed > 0 ? (
                      <MiniWalletRow
                        label="Earned Credit"
                        value={earnedUsed}
                      />
                    ) : null}

                    {refundUsed > 0 ? (
                      <MiniWalletRow label="Refund Wallet" value={refundUsed} />
                    ) : null}
                  </div>
                )}
              </>
            ) : (
              <FareRow label="TPL Credit" value={0} />
            )}

            {refundWalletAvailable > 0 && onToggleRefundWallet ? (
              <div className="mb-4 rounded-[12px] border border-[#e5e7eb] bg-white p-3">
                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    checked={useRefundWallet}
                    onChange={(e) => onToggleRefundWallet(e.target.checked)}
                    className="mt-1"
                  />

                  <span>
                    <span className="block text-[13px] font-extrabold text-[#111827]">
                      Use Refund Wallet
                    </span>

                    <span className="mt-1 block text-[12px] font-semibold leading-[18px] text-[#6b7280]">
                      Available balance ₹
                      {refundWalletAvailable.toLocaleString("en-IN")}
                    </span>
                  </span>
                </label>
              </div>
            ) : null}

            {earnedOnThisBooking > 0 ? (
              <div className="mt-1 rounded-[14px] border border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed,#ffffff)] p-3 text-[12px] font-extrabold leading-[18px] text-[#ea580c]">
                🎉 You will earn ₹
                {earnedOnThisBooking.toLocaleString("en-IN")} TPL Earned Credit
                after this booking.
              </div>
            ) : null}
          </div>

          {finalTotalBeforeWallet > 0 && totalWalletUsed > 0 ? (
            <div className="border-b border-[#eef2f7] px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[14px] font-extrabold text-[#111827]">
                    Total Before Wallet
                  </div>

                  <div className="mt-1 text-[11px] font-semibold text-[#6b7280]">
                    Amount after offer and before wallet adjustment
                  </div>
                </div>

                <div className="text-[18px] font-extrabold text-[#111827]">
                  ₹{finalTotalBeforeWallet.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          ) : null}

          {/* TOTAL */}
          <div className="border-b border-[#e5e7eb] bg-white px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[20px] font-extrabold text-[#111827]">
                  Total Amount
                </div>

                <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
                  Inclusive of selected cabin fare, taxes, offer and wallet
                  benefits
                </div>
              </div>

              <div className="whitespace-nowrap text-[30px] font-extrabold text-[#111827]">
                ₹{totalAmount.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-white px-4 py-4">
            <button
              type="button"
              disabled={!canProceed}
              onClick={onProceed}
              className={`h-[50px] w-full rounded-full text-[16px] font-extrabold transition ${
                canProceed
                  ? "bg-[#ef4444] text-white shadow-[0_10px_24px_rgba(239,68,68,0.25)] hover:opacity-95"
                  : "cursor-not-allowed bg-[#cfd8e3] text-white"
              }`}
            >
              {buttonLabel}
            </button>

            {!canProceed && blockerMessage ? (
              <div className="mt-3 text-[12px] font-bold leading-[18px] text-[#dc2626]">
                {blockerMessage}
              </div>
            ) : (
              <div className="mt-3 text-center text-[12px] font-medium text-[#6b7280]">
                Secure cruise booking powered by TPL
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

function FareRow({
  label,
  value,
  detail,
  positiveGreen = false,
}: {
  label: string;
  value: number;
  detail?: string;
  positiveGreen?: boolean;
}) {
  const isNegative = value < 0;

  return (
    <div className="mb-3 flex items-start justify-between gap-3 last:mb-0">
      <div>
        <div
          className={`text-[15px] font-bold ${
            positiveGreen ? "text-[#ea580c]" : "text-[#1f2937]"
          }`}
        >
          {label}
        </div>

        {detail ? (
          <div className="mt-0.5 text-[12px] font-semibold text-[#6b7280]">
            {detail}
          </div>
        ) : null}
      </div>

      <div
        className={`whitespace-nowrap text-[15px] font-bold ${
          positiveGreen ? "text-[#ea580c]" : "text-[#1f2937]"
        }`}
      >
        {isNegative ? "-" : ""}
        {formatPrice(value)}
      </div>
    </div>
  );
}

function MiniWalletRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="mt-1.5 flex items-center justify-between gap-3">
      <span className="text-[12px] font-bold text-[#475569]">{label}</span>

      <span className="whitespace-nowrap text-[12px] font-extrabold text-[#ea580c]">
        -₹{Number(value || 0).toLocaleString("en-IN")}
      </span>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3 last:mb-0">
      <div className="text-[15px] font-bold text-[#1f2937]">{label}</div>

      <div className="whitespace-nowrap text-[15px] font-bold text-[#6b7280]">
        {value}
      </div>
    </div>
  );
}