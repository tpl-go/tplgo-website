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
    <div className="overflow-hidden rounded-b-2xl">
      <div className="flex items-center justify-between border-b border-[#dbe4ef] bg-white px-4 py-3">
        <div className="text-[14px] font-semibold text-[#111827]">
          Services (Per Pax)
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              canGoCompareLeft &&
              setCompareStartIndex((prev) => Math.max(prev - 1, 0))
            }
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-[16px] ${
              canGoCompareLeft
                ? "border-[#cbd5e1] bg-white text-[#111827]"
                : "cursor-not-allowed border-[#e5e7eb] bg-[#f8fafc] text-[#cbd5e1]"
            }`}
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() =>
              canGoCompareRight && setCompareStartIndex((prev) => prev + 1)
            }
            className={`flex h-8 w-6 items-center justify-center rounded-full border text-[16px] ${
              canGoCompareRight
                ? "border-[#cbd5e1] bg-white text-[#111827]"
                : "cursor-not-allowed border-[#e5e7eb] bg-[#f8fafc] text-[#cbd5e1]"
            }`}
          >
            ›
          </button>
        </div>
      </div>

      <div className="flex">
        <div className="w-[220px] shrink-0 border-r border-[#dbe4ef] bg-[#f8fbff] p-4">
          <div className="space-y-0 overflow-hidden rounded-2xl border border-[#dbe4ef] bg-white">
            <div className="flex h-[72px] items-center rounded-t-2xl bg-[#eef4fb] px-4 text-[14px] font-semibold text-[#111827]">
              Services (Per Pax)
            </div>

            <div className="flex h-[108px] items-center border-t border-[#eceff3] bg-[#eef4fb] px-4 text-[14px] font-semibold text-[#111827]">
              Fares
            </div>

            <div className="border-t border-[#eceff3] bg-[#eef4fb] px-4 py-4">
              <div className="text-[14px] font-semibold text-[#111827]">
                Baggage Info
              </div>
              <div className="mt-2 text-[13px] text-[#374151]">
                Adult (Age 12+)
              </div>
            </div>

            <div className="flex h-[86px] items-center border-t border-[#eceff3] bg-[#eef4fb] px-4 text-[14px] font-semibold text-[#111827]">
              Cancellation Fee
            </div>

            <div className="flex h-[86px] items-center border-t border-[#eceff3] bg-[#eef4fb] px-4 text-[14px] font-semibold text-[#111827]">
              Date Change Fee
            </div>

            <div className="flex h-[86px] items-center border-t border-[#eceff3] bg-[#eef4fb] px-4 text-[14px] font-semibold text-[#111827]">
              Seat Charge
            </div>

            <div className="flex h-[110px] items-center rounded-b-2xl border-t border-[#eceff3] bg-[#eef4fb] px-4 text-[14px] font-semibold text-[#111827]">
              Meals
            </div>
          </div>
        </div>

        <div className="flex flex-1 gap-4 overflow-x-auto p-4">
          {compareVisibleFares.map((fare) => {
            const isSelected = selectedFareId === fare.id;

            return (
              <div
                key={fare.id}
                className={`flex min-w-[240px] flex-1 flex-col overflow-hidden rounded-2xl border ${
                  isSelected ? "border-[#d1a67a] shadow-sm" : "border-[#e5e7eb]"
                } bg-white`}
              >
                <div
                  className={`flex h-[72px] items-center gap-2 border-b px-4 ${
                    isSelected ? "bg-[#d8c2a6]" : "bg-[#f9fafb]"
                  }`}
                >
                  <input
                    type="radio"
                    name={`compare-fare-${code}`}
                    checked={isSelected}
                    onChange={() => setSelectedFareId(fare.id)}
                    className="h-4 w-4"
                  />
                  <span
                    className={`text-[14px] font-semibold ${
                      isSelected ? "text-[#111827]" : "text-[#b91c1c]"
                    }`}
                  >
                    {fare.title}
                  </span>
                </div>

                <div className="flex h-[78px] items-center justify-center border-b px-4 text-[24px] font-semibold text-[#111827]">
                  {fare.price}
                </div>

                <div className="grid h-[110px] grid-cols-2 border-b text-center">
                  <div className="border-r px-3 py-4">
                    <div className="text-[14px] font-medium text-[#111827]">
                      Check In Bag
                    </div>
                    <div className="mt-2 text-[13px] text-[#111827]">
                      15 Kg (01 Piece only)
                    </div>
                  </div>
                  <div className="px-3 py-4">
                    <div className="text-[14px] font-medium text-[#111827]">
                      Cabin Bag
                    </div>
                    <div className="mt-2 text-[13px] text-[#111827]">7 Kg</div>
                  </div>
                </div>

                <div className="flex h-[86px] items-center justify-center border-b px-4 text-[14px] text-[#9ca3af]">
                  {fare.cancellationFee || "NA"}
                </div>

                <div className="flex h-[86px] items-center justify-center border-b px-4 text-[14px] text-[#9ca3af]">
                  {fare.dateChangeFee || "NA"}
                </div>

                <div className="flex h-[86px] items-center justify-center border-b px-4 text-[14px] text-[#111827]">
                  {fare.seatCharge || "Chargeable"}
                </div>

                <div className="flex h-[110px] flex-col items-center justify-center px-4 text-center">
                  <div className="mb-4 text-[14px] text-[#111827]">
                    {fare.meals || "Chargeable"}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectFare(fare.id)}
                    className="rounded bg-orange-500 px-6 py-2 text-[13px] font-semibold text-white hover:bg-orange-600"
                  >
                    SELECT
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white px-4 pb-5 pt-1 text-[13px] leading-7 text-[#7c5a5a]">
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