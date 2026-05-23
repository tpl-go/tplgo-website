"use client";

type RoundTripFareSummaryProps = {
  totalBaseFare: number;
  
  returnTripDiscount: number;
  totalAmount: number;
};

export default function RoundTripFareSummary({
  totalBaseFare,
  
  returnTripDiscount,
  totalAmount,
}: RoundTripFareSummaryProps) {
  return (
    <div className="w-[320px] rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-900">Fare Summary</h3>
      </div>

      <div className="space-y-4 px-5 py-4 text-sm text-slate-700">
        <div className="flex items-center justify-between">
          <span>Total base fare</span>
          <span className="font-medium">
            ₹ {totalBaseFare.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex items-center justify-between">
          
          <span className="font-medium">
            
          </span>
        </div>

        <div className="flex items-center justify-between text-emerald-600">
          <span>Return trip discount</span>
          <span className="font-medium">
            - ₹ {returnTripDiscount.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between text-base font-semibold text-slate-900">
            <span>Total Amount</span>
            <span>₹ {totalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}