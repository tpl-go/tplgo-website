"use client";

import { Fare } from "./OneWayCardTypes";

type Props = {
  fares: Fare[];
  selectedFareId: string;
  setSelectedFareId: (id: string) => void;
  compareStartIndex: number;
  setCompareStartIndex: React.Dispatch<React.SetStateAction<number>>;
  compareVisibleCount: number;
  code: string;
  onSelectFare: (id: string) => void;
};

export default function OneWayCardComparePanel({
  fares,
  selectedFareId,
  setSelectedFareId,
  compareStartIndex,
  setCompareStartIndex,
  compareVisibleCount,
  code,
  onSelectFare,
}: Props) {
  const compareVisibleFares = fares.slice(
    compareStartIndex,
    compareStartIndex + compareVisibleCount
  );

  const canGoCompareLeft = compareStartIndex > 0;
  const canGoCompareRight =
    compareStartIndex + compareVisibleCount < fares.length;

  return (
    <div className="overflow-hidden rounded-b-2xl bg-slate-50">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-3 sm:px-5 sm:py-4">
        <div>
          <div className="text-[15px] font-black text-slate-950 sm:text-[17px]">
            Compare fares
          </div>
          <div className="text-[11px] font-semibold text-slate-500">
            Services per passenger
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              canGoCompareLeft &&
              setCompareStartIndex((prev) => Math.max(prev - 1, 0))
            }
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-[16px] transition ${
              canGoCompareLeft
                ? "border-slate-300 bg-white text-slate-900 hover:border-orange-300 hover:bg-orange-50"
                : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
            }`}
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() =>
              canGoCompareRight && setCompareStartIndex((prev) => prev + 1)
            }
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-[16px] transition ${
              canGoCompareRight
                ? "border-slate-300 bg-white text-slate-900 hover:border-orange-300 hover:bg-orange-50"
                : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
            }`}
          >
            ›
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="sticky left-0 z-10 w-[132px] shrink-0 border-r border-slate-200 bg-slate-50 p-2 sm:static sm:w-[210px] sm:p-4">
          <div className="space-y-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex h-[64px] items-center rounded-t-2xl bg-slate-100 px-3 text-[12px] font-black text-slate-900 sm:h-[72px] sm:px-4 sm:text-[14px]">
              Services (Per Pax)
            </div>

            <div className="flex h-[92px] items-center border-t border-slate-100 bg-slate-50 px-3 text-[12px] font-black text-slate-900 sm:h-[108px] sm:px-4 sm:text-[14px]">
              Fares
            </div>

            <div className="border-t border-slate-100 bg-slate-50 px-3 py-3 sm:px-4 sm:py-4">
              <div className="text-[12px] font-black text-slate-900 sm:text-[14px]">
                Baggage Info
              </div>
              <div className="mt-2 text-[11px] font-semibold text-slate-500 sm:text-[13px]">
                Adult (Age 12+)
              </div>
            </div>

            <div className="flex h-[76px] items-center border-t border-slate-100 bg-slate-50 px-3 text-[12px] font-black text-slate-900 sm:h-[86px] sm:px-4 sm:text-[14px]">
              Cancellation Fee
            </div>

            <div className="flex h-[76px] items-center border-t border-slate-100 bg-slate-50 px-3 text-[12px] font-black text-slate-900 sm:h-[86px] sm:px-4 sm:text-[14px]">
              Date Change Fee
            </div>

            <div className="flex h-[76px] items-center border-t border-slate-100 bg-slate-50 px-3 text-[12px] font-black text-slate-900 sm:h-[86px] sm:px-4 sm:text-[14px]">
              Seat Charge
            </div>

            <div className="flex h-[100px] items-center rounded-b-2xl border-t border-slate-100 bg-slate-50 px-3 text-[12px] font-black text-slate-900 sm:h-[110px] sm:px-4 sm:text-[14px]">
              Meals
            </div>
          </div>
        </div>

        <div className="flex min-w-max flex-1 gap-3 p-2 sm:gap-4 sm:p-4">
          {compareVisibleFares.map((fare) => {
            const isSelected = selectedFareId === fare.id;

            return (
              <div
                key={fare.id}
                className={`flex min-w-[196px] flex-1 flex-col overflow-hidden rounded-2xl border bg-white transition sm:min-w-[240px] ${
                  isSelected ? "border-orange-400 shadow-[0_14px_36px_rgba(249,115,22,0.16)] ring-1 ring-orange-100" : "border-slate-200 shadow-sm"
                }`}
              >
                <div
                  className={`flex h-[64px] items-center gap-2 border-b px-3 sm:h-[72px] sm:px-4 ${
                    isSelected ? "bg-orange-50" : "bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name={`compare-fare-${code}`}
                    checked={isSelected}
                    onChange={() => setSelectedFareId(fare.id)}
                    className="h-4 w-4 accent-orange-500"
                  />
                  <span
                    className={`text-[13px] font-semibold sm:text-[14px] ${
                      isSelected ? "text-slate-950" : "text-orange-700"
                    }`}
                  >
                    {fare.title}
                  </span>
                </div>

                <div className="flex h-[78px] items-center justify-center border-b border-slate-100 px-3 text-[20px] font-black text-slate-950 sm:px-4 sm:text-[24px]">
                  {fare.price}
                </div>

                <div className="grid h-[110px] grid-cols-2 border-b border-slate-100 text-center">
                  <div className="border-r border-slate-100 px-2 py-4 sm:px-3">
                    <div className="text-[12px] font-bold text-slate-900 sm:text-[14px]">
                      Check In Bag
                    </div>
                    <div className="mt-2 text-[11px] font-semibold text-slate-500 sm:text-[13px]">
                      15 Kg (01 Piece only)
                    </div>
                  </div>
                  <div className="px-2 py-4 sm:px-3">
                    <div className="text-[12px] font-bold text-slate-900 sm:text-[14px]">
                      Cabin Bag
                    </div>
                    <div className="mt-2 text-[11px] font-semibold text-slate-500 sm:text-[13px]">
                      7 Kg
                    </div>
                  </div>
                </div>

                <div className="flex h-[76px] items-center justify-center border-b border-slate-100 px-3 text-[12px] font-semibold text-slate-400 sm:h-[86px] sm:px-4 sm:text-[14px]">
                  {fare.cancellationFee || "NA"}
                </div>

                <div className="flex h-[76px] items-center justify-center border-b border-slate-100 px-3 text-[12px] font-semibold text-slate-400 sm:h-[86px] sm:px-4 sm:text-[14px]">
                  {fare.dateChangeFee || "NA"}
                </div>

                <div className="flex h-[76px] items-center justify-center border-b border-slate-100 px-3 text-[12px] font-semibold text-slate-700 sm:h-[86px] sm:px-4 sm:text-[14px]">
                  {fare.seatCharge || "Chargeable"}
                </div>

                <div className="flex h-[100px] flex-col items-center justify-center px-3 text-center sm:h-[110px] sm:px-4">
                  <div className="mb-3 rounded-full bg-slate-100 px-3 py-1 text-[12px] font-bold text-slate-700 sm:mb-4 sm:text-[14px]">
                    {fare.meals || "Chargeable"}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectFare(fare.id)}
                    className="rounded-full bg-orange-500 px-5 py-2 text-[12px] font-black text-white shadow-sm transition hover:bg-orange-600 sm:px-6 sm:text-[13px]"
                  >
                    SELECT
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white px-3 pb-5 pt-3 text-[12px] leading-6 text-slate-500 sm:px-5 sm:text-[13px]">
        <div>
          The airline fee is indicative, which will depend upon the time of
          cancellation / re-issue as per the airline fare rules.
        </div>
        <div>Mentioned fees are Per Pax Per Sector</div>
        <div>
          Apart from airline charges, GST + RAF + applicable charges if any,
          will be charged.
        </div>
        <div>For more clarity, Please check Detailed Rules</div>
      </div>
    </div>
  );
}
