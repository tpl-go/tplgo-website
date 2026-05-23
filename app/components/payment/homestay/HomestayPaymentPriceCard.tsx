"use client";

type WalletBreakdown = {
  promoUsed: number;
  earnedUsed: number;
  refundUsed: number;
};

type PriceBreakup = {
  stayPrice: number;
  rooms: number;
  nights: number;
  subtotal: number;
  taxes: number;
  tripSecureTotal: number;
  cabTotal: number;
  addOnsTotal: number;
  tplCredit: number;
  appliedOffer: number;
  totalAmount: number;

  totalBeforeWallet?: number;
  earnedOnThisBooking?: number;
  walletBreakdown?: WalletBreakdown;
};

type Props = {
  priceBreakup: PriceBreakup;
  selectedPaymentMethod?: string;
  paymentActionState?: "idle" | "processing" | "success" | "failure";
  isExpired?: boolean;
  onPayNow?: () => void;
  onRetryPayment?: () => void;
};

export default function HomestayPaymentPriceCard({
  priceBreakup,
  selectedPaymentMethod = "",
  paymentActionState = "idle",
  isExpired = false,
  onPayNow,
  onRetryPayment,
}: Props) {
  const promoUsed = priceBreakup.walletBreakdown?.promoUsed || 0;
  const earnedUsed = priceBreakup.walletBreakdown?.earnedUsed || 0;
  const refundUsed = priceBreakup.walletBreakdown?.refundUsed || 0;

  const walletUsed = promoUsed + earnedUsed + refundUsed;

  return (
    <aside className="flex h-full w-full">
      <div className="sticky top-[110px] z-20 flex w-full flex-col gap-4 bg-[#eef3f8]">
        <div className="overflow-hidden rounded-2xl border border-[#d9e2ec] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
          <div className="border-b border-[#e5e7eb] px-[18px] pb-[14px] pt-[18px]">
            <div className="mb-[10px] text-[16px] font-extrabold text-[#111827]">
              Total Due
            </div>

            <div className="text-[30px] font-black leading-none text-[#111827]">
              ₹ {priceBreakup.totalAmount.toLocaleString("en-IN")}
            </div>
          </div>

          <div className="px-[18px] pb-[18px] pt-[14px]">
            <PriceRow
              label="Stay Price / Night"
              value={`₹ ${priceBreakup.stayPrice.toLocaleString("en-IN")}`}
            />

            <PriceRow
              label="Rooms × Nights"
              value={`${priceBreakup.rooms} × ${priceBreakup.nights}`}
            />

            <PriceRow
              label="Subtotal"
              value={`₹ ${priceBreakup.subtotal.toLocaleString("en-IN")}`}
            />

            <PriceRow
              label="Taxes & Fees"
              value={`₹ ${priceBreakup.taxes.toLocaleString("en-IN")}`}
            />

            {priceBreakup.tripSecureTotal > 0 && (
              <PriceRow
                label="Trip Secure"
                value={`₹ ${priceBreakup.tripSecureTotal.toLocaleString("en-IN")}`}
              />
            )}

            {priceBreakup.cabTotal > 0 && (
              <PriceRow
                label="Cab"
                value={`₹ ${priceBreakup.cabTotal.toLocaleString("en-IN")}`}
              />
            )}

            {priceBreakup.addOnsTotal > 0 && (
              <PriceRow
                label="Add-ons"
                value={`₹ ${priceBreakup.addOnsTotal.toLocaleString("en-IN")}`}
              />
            )}

            {priceBreakup.appliedOffer > 0 && (
              <PriceRow
                label="Applied Offer"
                value={`- ₹ ${priceBreakup.appliedOffer.toLocaleString("en-IN")}`}
                valueColor="#15803d"
              />
            )}

            {priceBreakup.tplCredit > 0 && (
              <PriceRow
                label="TPL Credit"
                value={`- ₹ ${priceBreakup.tplCredit.toLocaleString("en-IN")}`}
                valueColor="#15803d"
              />
            )}

            {walletUsed > 0 && (
              <div className="mb-[12px] mt-[4px] rounded-xl border border-[#dbeafe] bg-[#f8fbff] p-3">
                <div className="mb-2 text-[12px] font-extrabold text-[#1d4ed8]">
                  TPL Wallet Benefit Applied
                </div>

                {promoUsed > 0 && (
                  <MiniWalletRow label="Promo Credit" value={promoUsed} />
                )}

                {earnedUsed > 0 && (
                  <MiniWalletRow label="Earned Credit" value={earnedUsed} />
                )}

                {refundUsed > 0 && (
                  <MiniWalletRow label="Refund Wallet" value={refundUsed} />
                )}
              </div>
            )}

            {(priceBreakup.earnedOnThisBooking || 0) > 0 && (
              <div className="mb-[12px] rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-3 text-[12px] font-extrabold leading-[18px] text-[#15803d]">
                🎉 You will earn ₹
                {Number(priceBreakup.earnedOnThisBooking || 0).toLocaleString(
                  "en-IN"
                )}{" "}
                TPL Earned Credit after this booking.
              </div>
            )}

            <div className="mt-[14px] flex items-center justify-between gap-3 border-t border-dashed border-[#d1d5db] pt-[14px]">
              <span className="text-[15px] font-extrabold text-[#111827]">
                Final Payable
              </span>

              <span className="text-[18px] font-black text-[#111827]">
                ₹ {priceBreakup.totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[10px] border border-[#d9e2ec] bg-white p-[6px] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
          <button
            type="button"
            onClick={() => {
              if (paymentActionState === "failure") {
                onRetryPayment?.();
              } else {
                onPayNow?.();
              }
            }}
            disabled={
              isExpired ||
              !selectedPaymentMethod ||
              paymentActionState === "processing"
            }
            className={`h-12 w-full rounded-full text-[15px] font-extrabold text-white ${
              isExpired ||
              !selectedPaymentMethod ||
              paymentActionState === "processing"
                ? "cursor-not-allowed bg-[#cbd5e1]"
                : "bg-[#ef4444]"
            }`}
          >
            {isExpired
              ? "Session Expired"
              : paymentActionState === "processing"
              ? "Processing..."
              : paymentActionState === "success"
              ? "Payment Success ✅"
              : paymentActionState === "failure"
              ? "Retry Payment"
              : "Proceed to Payment"}
          </button>

          {isExpired && (
            <div className="mt-[10px] text-[13px] font-bold text-[#dc2626]">
              Your session has expired. Please restart booking.
            </div>
          )}

          {!isExpired && !selectedPaymentMethod && (
            <div className="mt-[10px] text-[13px] font-semibold text-[#b45309]">
              Please select a payment method first.
            </div>
          )}

          {!isExpired && paymentActionState === "failure" && (
            <div className="mt-[10px] text-[13px] font-semibold text-[#dc2626]">
              Payment failed. You can retry.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function PriceRow({
  label,
  value,
  valueColor = "#111827",
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="mb-[10px] flex items-center justify-between gap-3">
      <span className="text-[14px] font-medium text-[#374151]">{label}</span>
      <span
        className="whitespace-nowrap text-[14px] font-bold"
        style={{ color: valueColor }}
      >
        {value}
      </span>
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
    <div className="mt-[6px] flex items-center justify-between gap-3">
      <span className="text-[12px] font-bold text-[#475569]">{label}</span>
      <span className="whitespace-nowrap text-[12px] font-extrabold text-[#15803d]">
        -₹{Number(value || 0).toLocaleString("en-IN")}
      </span>
    </div>
  );
}