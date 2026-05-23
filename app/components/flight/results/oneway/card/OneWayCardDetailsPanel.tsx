"use client";

import { DetailTab, Fare } from "./OneWayCardTypes";

type Props = {
  activeTab: DetailTab;
  setActiveTab: (tab: DetailTab) => void;
  selectedFare: Fare;
  depart: string;
  departCity: string;
  duration: string;
  stop: string;
  arrive: string;
  arriveCity: string;
  code: string;
};

export default function OneWayCardDetailsPanel({
  activeTab,
  setActiveTab,
  selectedFare,
  depart,
  departCity,
  duration,
  stop,
  arrive,
  arriveCity,
  code,
}: Props) {
  const openDetailedRules = () => {
    window.open("/fare-rules-details", "_blank");
  };

  const renderTabButton = (tab: DetailTab, label: string) => {
    const isActive = activeTab === tab;

    return (
      <button
        type="button"
        onClick={() => setActiveTab(tab)}
        className={`border-b-2 px-3 py-2 text-[13px] font-semibold transition ${
          isActive
            ? "border-[#ef4444] text-[#ef4444]"
            : "border-transparent text-[#111827] hover:text-[#ef4444]"
        }`}
      >
        {label}
      </button>
    );
  };

  const renderTabContent = () => {
    if (activeTab === "flight") {
      return (
        <div className="px-4 py-4">
          <div className="mb-4 text-[16px] font-semibold text-[#111827]">
            {departCity} → {arriveCity}
          </div>

          <div className="grid grid-cols-4 items-start gap-5">
            <div>
              <div className="mb-2 h-10 w-10 rounded-md bg-[#1d4ed8]" />
              <div className="text-[13px] font-semibold text-[#111827]">{code}</div>
              <div className="text-[12px] text-[#6b7280]">Economy</div>
              <div className="mt-1 text-[12px] text-[#dc2626]">CB: 9 seats left</div>
            </div>

            <div>
              <div className="text-[14px] font-semibold text-[#111827]">
                Apr 2, Thu, {depart}
              </div>
              <div className="mt-1 text-[13px] text-[#111827]">{departCity}, India</div>
              <div className="text-[12px] text-[#6b7280]">
                {departCity} Intl Terminal 1
              </div>
            </div>

            <div className="pt-1 text-center">
              <div className="text-[13px] font-medium text-[#111827]">{stop}</div>
              <div className="text-[13px] text-[#111827]">{duration}</div>
            </div>

            <div>
              <div className="text-[14px] font-semibold text-[#111827]">
                Apr 2, Thu, {arrive}
              </div>
              <div className="mt-1 text-[13px] text-[#111827]">{arriveCity}, India</div>
              <div className="text-[12px] text-[#6b7280]">{arriveCity} Airport</div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "fare") {
      return (
        <div className="px-4 py-4">
          <div className="grid grid-cols-[1.3fr_1fr_1fr] border-b border-[#e5e7eb] pb-2 text-[13px] font-semibold text-[#111827]">
            <div>TYPE</div>
            <div>Fare</div>
            <div>Total</div>
          </div>

          <div className="py-3 text-[13px] text-[#111827]">
            <div className="mb-2 text-[13px] text-[#6b7280]">
              Fare Details for Adult (CB: J)
            </div>

            <div className="grid grid-cols-[1.3fr_1fr_1fr] py-1.5">
              <div>Base Price</div>
              <div>₹8,100.00 x 1</div>
              <div>₹8,100.00</div>
            </div>

            <div className="grid grid-cols-[1.3fr_1fr_1fr] py-1.5">
              <div>Taxes and fees</div>
              <div>₹1,369.00 x 1</div>
              <div>₹1,369.00</div>
            </div>

            <div className="mt-2 grid grid-cols-[1.3fr_1fr_1fr] border-t border-[#e5e7eb] pt-2 text-[16px] font-semibold">
              <div>Total</div>
              <div></div>
              <div>{selectedFare.price}</div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "rules") {
      return (
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openDetailedRules}
              className="rounded bg-[#fff7ed] px-3 py-1.5 text-[12px] font-semibold text-[#d97706]"
            >
              Detailed Rules
            </button>

            <div className="text-[13px] text-[#111827]">
              Sorry, unable to fetch fare rules from airline. Please refer to detailed
              fare rules or contact customer service.
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="px-4 py-4">
        <div className="grid grid-cols-3 border-b border-[#e5e7eb] pb-2 text-[13px] font-semibold text-[#111827]">
          <div>SECTOR</div>
          <div>CHECKIN</div>
          <div>CABIN</div>
        </div>

        <div className="grid grid-cols-3 py-3 text-[13px] text-[#111827]">
          <div>DEL-GOI</div>
          <div>Adult : 15 Kg (01 Piece only)</div>
          <div>Adult : 7 Kg</div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center gap-1 border-b border-[#dbe4ef] bg-white px-4">
        {renderTabButton("flight", "Flight Details")}
        {renderTabButton("fare", "Fare Details")}
        {renderTabButton("rules", "Fare Rules")}
        {renderTabButton("baggage", "Baggage Information")}
      </div>

      {renderTabContent()}
    </div>
  );
}