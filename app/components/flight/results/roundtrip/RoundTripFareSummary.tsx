"use client";

type RoundTripFareSummaryProps = {
  totalBaseFare: number;
  appliedOffer?: number;
  baseAfterOffer?: number;
  returnTripDiscount: number;
};

export default function RoundTripFareSummary({
  totalBaseFare,
  appliedOffer = 0,
  baseAfterOffer,
  returnTripDiscount,
}: RoundTripFareSummaryProps) {
  const displayBase =
    typeof baseAfterOffer === "number" ? baseAfterOffer : totalBaseFare;

  return (
    <div className="w-full bg-white md:w-[320px] md:rounded-2xl md:border md:border-slate-200 md:shadow-2xl">
      <div className="border-b border-slate-100 px-4 py-3 md:px-5 md:py-4">
        <h3 className="text-[15px] font-black text-slate-900 md:text-base">
          Fare Summary
        </h3>
      </div>

      <div className="space-y-3 px-4 py-4 text-[13px] text-slate-700 md:space-y-4 md:px-5 md:text-sm">
        <div className="flex items-center justify-between">
          <span>Base Fare</span>
          <span className="font-medium">
            ₹ {totalBaseFare.toLocaleString("en-IN")}
          </span>
        </div>

        {appliedOffer > 0 ? (
          <div className="flex items-center justify-between text-emerald-600">
            <span>Offer Discount</span>
            <span className="font-medium">
              - ₹ {appliedOffer.toLocaleString("en-IN")}
            </span>
          </div>
        ) : null}

        {returnTripDiscount > 0 ? (
          <div className="flex items-center justify-between text-emerald-600">
            <span>Return trip discount</span>
            <span className="font-medium">
              - ₹ {returnTripDiscount.toLocaleString("en-IN")}
            </span>
          </div>
        ) : null}

        <div className="border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between text-base font-black text-slate-900">
            <span>Flight Price after offer</span>
            <span>₹ {displayBase.toLocaleString("en-IN")}</span>
          </div>

          <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-500">
            Taxes & fees shown on booking page.
          </div>
        </div>
      </div>
    </div>
  );
}
