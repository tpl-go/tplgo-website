"use client";

import { Sparkles, BadgeCheck, Tag } from "lucide-react";

type WalletBreakdown = {
  promoUsed: number;
  earnedUsed: number;
  refundUsed: number;
};

type Props = {
  baseFare: number;
  seatUpgradeTotal?: number;

  taxAndSurcharge: number;
  discount: number;

  offerApplied: number;
  appliedOfferCode?: string;
  appliedOfferTitle?: string;

  tplCredit: number;

  walletBreakdown?: WalletBreakdown;
  earnedOnThisBooking?: number;

  refundWalletAvailable?: number;
  useRefundWallet?: boolean;
  onToggleRefundWallet?: (checked: boolean) => void;

  tripAssuredTotal: number;
  freeCancellationTotal: number;

  finalTotal: number;

  canProceed: boolean;
  blockerMessage?: string;

  onProceed: () => void;
};

function formatPrice(value: number) {
  return `₹${Math.abs(value || 0).toLocaleString("en-IN")}`;
}

export default function BusBookingFareSummaryCard({
  baseFare,
  seatUpgradeTotal = 0,

  taxAndSurcharge,
  discount,

  offerApplied,
  appliedOfferCode = "",
  appliedOfferTitle = "Best Bus Offer Activated",

  tplCredit,

  walletBreakdown,
  earnedOnThisBooking = 0,

  refundWalletAvailable = 0,
  useRefundWallet = true,
  onToggleRefundWallet,

  tripAssuredTotal,
  freeCancellationTotal,

  finalTotal,

  canProceed,
  blockerMessage = "",

  onProceed,
}: Props) {
  const promoUsed = walletBreakdown?.promoUsed || 0;
  const earnedUsed = walletBreakdown?.earnedUsed || 0;
  const refundUsed = walletBreakdown?.refundUsed || 0;

  return (
    <aside className="w-full">
      <div className="sticky top-[88px] z-20">
        <div className="overflow-hidden rounded-[28px] border border-[#d9e2ec] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
          {/* HEADER */}
          <div className="border-b border-[#edf2f7] bg-white px-5 py-5">
            <div className="text-[24px] font-black tracking-[-0.02em] text-[#111827]">
              Fare Summary
            </div>

            <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
              Bus fare, seat upgrades, offers & wallet savings
            </div>
          </div>

          {/* OFFER BLOCK */}
          {offerApplied > 0 ? (
            <div className="relative overflow-hidden border-b border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_45%,#fff1e6_100%)] px-5 py-5">
              <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[#fb923c]/10 blur-3xl" />

              <div className="relative flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f97316,#ea580c)] shadow-[0_10px_24px_rgba(249,115,22,0.35)]">
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
                      You saved {formatPrice(offerApplied)} instantly
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* BODY */}
          <div className="border-b border-[#eef2f7] px-5 py-5">
            <FareRow
              label="Base Fare"
              value={baseFare}
            />

            {seatUpgradeTotal > 0 ? (
              <FareRow
                label="Seat Upgrade"
                value={seatUpgradeTotal}
              />
            ) : (
              <StatusRow
                label="Seat Upgrade"
                value="Standard seat selected"
              />
            )}

            <FareRow
              label="Tax & Surcharge"
              value={taxAndSurcharge}
            />

            {tripAssuredTotal > 0 ? (
              <FareRow
                label="Trip Assured"
                value={tripAssuredTotal}
              />
            ) : (
              <StatusRow
                label="Trip Assured"
                value="Not selected"
              />
            )}

            {freeCancellationTotal > 0 ? (
              <FareRow
                label="Free Cancellation"
                value={freeCancellationTotal}
              />
            ) : (
              <StatusRow
                label="Free Cancellation"
                value="Not selected"
              />
            )}

            {discount > 0 ? (
              <FareRow
                label="Discount"
                value={-discount}
                positiveOrange
              />
            ) : null}

            <FareRow
              label="Offer Applied"
              value={-offerApplied}
              positiveOrange
            />

            {tplCredit > 0 ? (
              <>
                <FareRow
                  label="TPL Credit"
                  value={-tplCredit}
                  positiveOrange
                />

                {(promoUsed > 0 ||
                  earnedUsed > 0 ||
                  refundUsed > 0) && (
                  <div className="-mt-1 mb-4 rounded-[18px] border border-[#dbeafe] bg-[#f8fbff] p-4">
                    <div className="mb-2 text-[12px] font-extrabold uppercase tracking-wide text-[#2563eb]">
                      Wallet Benefit Applied
                    </div>

                    {promoUsed > 0 ? (
                      <MiniWalletRow
                        label="Promo Credit"
                        value={promoUsed}
                      />
                    ) : null}

                    {earnedUsed > 0 ? (
                      <MiniWalletRow
                        label="Earned Credit"
                        value={earnedUsed}
                      />
                    ) : null}

                    {refundUsed > 0 ? (
                      <MiniWalletRow
                        label="Refund Wallet"
                        value={refundUsed}
                      />
                    ) : null}
                  </div>
                )}
              </>
            ) : (
              <FareRow
                label="TPL Credit"
                value={0}
              />
            )}

            {refundWalletAvailable > 0 &&
            onToggleRefundWallet ? (
              <div className="mb-4 rounded-[16px] border border-[#e5e7eb] bg-white p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={useRefundWallet}
                    onChange={(e) =>
                      onToggleRefundWallet(
                        e.target.checked
                      )
                    }
                    className="mt-1 h-4 w-4 accent-orange-500"
                  />

                  <span>
                    <span className="block text-[13px] font-extrabold text-[#111827]">
                      Use Refund Wallet
                    </span>

                    <span className="mt-1 block text-[12px] font-semibold leading-[18px] text-[#6b7280]">
                      Available balance ₹
                      {refundWalletAvailable.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </span>
                </label>
              </div>
            ) : null}

            {earnedOnThisBooking > 0 ? (
              <div className="mt-1 rounded-[16px] border border-[#fed7aa] bg-[linear-gradient(135deg,#fff7ed,#ffffff)] p-4 text-[12px] font-extrabold leading-[18px] text-[#ea580c]">
                🎉 You will earn ₹
                {earnedOnThisBooking.toLocaleString(
                  "en-IN"
                )}{" "}
                TPL Earned Credit after this booking.
              </div>
            ) : null}
          </div>

          {/* TOTAL */}
          <div className="border-b border-[#e5e7eb] bg-white px-5 py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[22px] font-black text-[#111827]">
                  Total Amount
                </div>

                <div className="mt-1 text-[12px] font-semibold text-[#6b7280]">
                  Inclusive of all taxes & benefits
                </div>
              </div>

              <div className="whitespace-nowrap text-[32px] font-black tracking-[-0.03em] text-[#111827]">
                ₹{finalTotal.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-white px-5 py-5">
            <button
              type="button"
              disabled={!canProceed}
              onClick={onProceed}
              className={`h-[54px] w-full rounded-full text-[16px] font-extrabold transition ${
                canProceed
                  ? "bg-[linear-gradient(135deg,#f97316,#ea580c)] text-white shadow-[0_12px_28px_rgba(249,115,22,0.32)] hover:scale-[1.01]"
                  : "cursor-not-allowed bg-[#cfd8e3] text-white"
              }`}
            >
              Proceed to Payment
            </button>

            {!canProceed && blockerMessage ? (
              <div className="mt-3 text-[12px] font-bold leading-[18px] text-[#dc2626]">
                {blockerMessage}
              </div>
            ) : (
              <div className="mt-3 text-center text-[12px] font-medium text-[#6b7280]">
                Secure bus booking powered by TPL
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
  positiveOrange = false,
}: {
  label: string;
  value: number;
  detail?: string;
  positiveOrange?: boolean;
}) {
  const isNegative = value < 0;

  return (
    <div className="mb-3 flex items-start justify-between gap-3 last:mb-0">
      <div>
        <div
          className={`text-[15px] font-bold ${
            positiveOrange
              ? "text-[#ea580c]"
              : "text-[#1f2937]"
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
          positiveOrange
            ? "text-[#ea580c]"
            : "text-[#1f2937]"
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
      <span className="text-[12px] font-bold text-[#475569]">
        {label}
      </span>

      <span className="whitespace-nowrap text-[12px] font-extrabold text-[#ea580c]">
        -₹
        {Number(value || 0).toLocaleString("en-IN")}
      </span>
    </div>
  );
}

function StatusRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3 last:mb-0">
      <div className="text-[15px] font-bold text-[#1f2937]">
        {label}
      </div>

      <div className="whitespace-nowrap text-[14px] font-bold text-[#6b7280]">
        {value}
      </div>
    </div>
  );
}