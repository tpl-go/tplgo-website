"use client";

type WalletCalc = {
  promoUsed: number;
  earnedUsed: number;
  refundUsed: number;
};

type PriceBreakup = {
  baseFare: number;
  seatUpgradeTotal?: number;
  taxAndSurcharge: number;
  tripSecureTotal: number;
  freeCancellationTotal: number;
  appliedOffer: number;
  totalAmount: number;

  walletCalc?: WalletCalc;
  tplCredit?: number;
  totalBeforeWallet?: number;
  earnedOnThisBooking?: number;
};

type Props = {
  priceBreakup: PriceBreakup;
  selectedPaymentMethod?: string;
  paymentActionState?: "idle" | "processing" | "success" | "failure";
  isExpired?: boolean;
  onPayNow?: () => void;
  onRetryPayment?: () => void;
};

function formatPrice(value: number) {
  return `₹${Math.abs(Number(value || 0)).toLocaleString("en-IN")}`;
}

export default function BusPaymentPriceCard({
  priceBreakup,
  selectedPaymentMethod = "",
  paymentActionState = "idle",
  isExpired = false,
  onPayNow,
  onRetryPayment,
}: Props) {
  const walletCalc = priceBreakup.walletCalc || {
    promoUsed: 0,
    earnedUsed: 0,
    refundUsed: 0,
  };

  const totalWalletUsed =
    Number(walletCalc.promoUsed || 0) +
    Number(walletCalc.earnedUsed || 0) +
    Number(walletCalc.refundUsed || 0);

  return (
    <aside className="flex h-full w-full">
      <div className="flex min-h-full w-full flex-col gap-4">
        <div className="z-20 flex flex-col gap-4 bg-[#eef3f8] lg:sticky lg:top-[110px]">
          <div className="overflow-hidden rounded-[22px] border border-[#d9e2ec] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.08)] sm:rounded-[28px]">
            <div className="border-b border-[#edf2f7] bg-white px-5 py-5">
              <div className="text-[20px] font-black text-[#111827]">
                Total Due
              </div>

              <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
                Final payable after offers and wallet benefits
              </div>

              <div className="mt-3 text-[34px] font-black leading-none tracking-[-0.03em] text-[#111827]">
                {formatPrice(priceBreakup.totalAmount)}
              </div>
            </div>

            <div className="px-5 py-5">
              <PriceRow
                label="Base Fare"
                value={priceBreakup.baseFare}
              />

              {Number(priceBreakup.seatUpgradeTotal || 0) > 0 ? (
                <PriceRow
                  label="Seat Upgrade"
                  value={Number(priceBreakup.seatUpgradeTotal || 0)}
                />
              ) : (
                <StatusRow
                  label="Seat Upgrade"
                  value="Standard seat selected"
                />
              )}

              <PriceRow
                label="Taxes & Fees"
                value={priceBreakup.taxAndSurcharge}
              />

              {priceBreakup.tripSecureTotal > 0 ? (
                <PriceRow
                  label="Trip Secure"
                  value={priceBreakup.tripSecureTotal}
                />
              ) : null}

              {priceBreakup.freeCancellationTotal > 0 ? (
                <PriceRow
                  label="Free Cancellation"
                  value={priceBreakup.freeCancellationTotal}
                />
              ) : null}

              {priceBreakup.appliedOffer > 0 ? (
                <PriceRow
                  label="Applied Offer"
                  value={-priceBreakup.appliedOffer}
                  positiveOrange
                />
              ) : (
                <PriceRow
                  label="Applied Offer"
                  value={0}
                  positiveOrange
                />
              )}

              {totalWalletUsed > 0 ? (
                <div className="mb-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-[15px] font-bold text-[#ea580c]">
                      TPL Credit
                    </span>

                    <span className="whitespace-nowrap text-[15px] font-bold text-[#ea580c]">
                      -{formatPrice(totalWalletUsed)}
                    </span>
                  </div>

                  <div className="rounded-[18px] border border-[#dbeafe] bg-[#f8fbff] p-4">
                    <div className="mb-2 text-[12px] font-extrabold uppercase tracking-wide text-[#2563eb]">
                      Wallet Benefit Applied
                    </div>

                    {walletCalc.promoUsed > 0 ? (
                      <MiniWalletRow
                        label="Promo Credit"
                        value={walletCalc.promoUsed}
                      />
                    ) : null}

                    {walletCalc.earnedUsed > 0 ? (
                      <MiniWalletRow
                        label="Earned Credit"
                        value={walletCalc.earnedUsed}
                      />
                    ) : null}

                    {walletCalc.refundUsed > 0 ? (
                      <MiniWalletRow
                        label="Refund Wallet"
                        value={walletCalc.refundUsed}
                      />
                    ) : null}
                  </div>
                </div>
              ) : priceBreakup.tplCredit && priceBreakup.tplCredit > 0 ? (
                <PriceRow
                  label="TPL Credit"
                  value={-priceBreakup.tplCredit}
                  positiveOrange
                />
              ) : (
                <PriceRow label="TPL Credit" value={0} />
              )}

              {priceBreakup.earnedOnThisBooking &&
              priceBreakup.earnedOnThisBooking > 0 ? (
                <div className="mt-1 rounded-[16px] border border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed,#ffffff)] p-4 text-[12px] font-extrabold leading-[18px] text-[#ea580c]">
                  🎉 You will earn ₹
                  {priceBreakup.earnedOnThisBooking.toLocaleString("en-IN")} TPL
                  Earned Credit after this booking.
                </div>
              ) : null}

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-dashed border-[#d1d5db] pt-5">
                <span className="text-[17px] font-black text-[#111827]">
                  Final Payable
                </span>

                <span className="shrink-0 text-[22px] font-black text-[#111827]">
                  {formatPrice(priceBreakup.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[18px] border border-[#d9e2ec] bg-white p-[8px] shadow-[0_4px_14px_rgba(15,23,42,0.05)]">
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
              className={`h-[52px] w-full rounded-full text-[15px] font-extrabold text-white transition ${
                isExpired
                  ? "cursor-not-allowed bg-[#9ca3af]"
                  : paymentActionState === "processing"
                  ? "cursor-not-allowed bg-[#9ca3af]"
                  : !selectedPaymentMethod
                  ? "cursor-not-allowed bg-[#cbd5e1]"
                  : "bg-[linear-gradient(135deg,#f97316,#ea580c)] shadow-[0_12px_28px_rgba(249,115,22,0.32)] hover:scale-[1.01]"
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
      </div>
    </aside>
  );
}

function PriceRow({
  label,
  value,
  positiveOrange = false,
}: {
  label: string;
  value: number;
  positiveOrange?: boolean;
}) {
  const isNegative = value < 0;

  return (
    <div className="mb-3 flex items-start justify-between gap-3 last:mb-0">
      <span
        className={`min-w-0 break-words text-[15px] font-bold ${
          positiveOrange ? "text-[#ea580c]" : "text-[#1f2937]"
        }`}
      >
        {label}
      </span>

      <span
        className={`whitespace-nowrap text-[15px] font-bold ${
          positiveOrange ? "text-[#ea580c]" : "text-[#1f2937]"
        }`}
      >
        {isNegative ? "-" : ""}
        {formatPrice(value)}
      </span>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3 last:mb-0">
      <span className="min-w-0 break-words text-[15px] font-bold text-[#1f2937]">{label}</span>

      <span className="whitespace-nowrap text-[14px] font-bold text-[#6b7280]">
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
    <div className="mt-1.5 flex items-center justify-between gap-3 first:mt-0">
      <span className="text-[12px] font-bold text-[#475569]">{label}</span>

      <span className="whitespace-nowrap text-[12px] font-extrabold text-[#ea580c]">
        -₹{Number(value || 0).toLocaleString("en-IN")}
      </span>
    </div>
  );
}
