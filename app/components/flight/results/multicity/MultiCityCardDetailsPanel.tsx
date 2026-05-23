"use client";

import { MultiCityFareOption, MultiCityFlight } from "../../data/multicityFlights";

type DetailTab = "flight" | "fare" | "rules" | "baggage";

type Props = {
  flight: MultiCityFlight;
  selectedFare: MultiCityFareOption;
  activeTab?: DetailTab;
  setActiveTab?: (tab: DetailTab) => void;
};

export default function MultiCityCardDetailsPanel({
  flight,
  selectedFare,
  activeTab = "flight",
  setActiveTab,
}: Props) {
  const openDetailedRules = () => {
    window.open("/fare-rules-details", "_blank");
  };

  const changeTab = (tab: DetailTab) => {
    if (setActiveTab) setActiveTab(tab);
  };

  const renderTabButton = (tab: DetailTab, label: string) => {
    const isActive = activeTab === tab;

    return (
      <button
        type="button"
        onClick={() => changeTab(tab)}
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
            {flight.fromCity} → {flight.toCity}
          </div>

          <div className="grid grid-cols-4 items-start gap-5">
            <div>
              <div className="mb-2 h-10 w-10 rounded-md bg-[#1d4ed8]" />
              <div className="text-[13px] font-semibold text-[#111827]">
                {flight.flightNumber}
              </div>
              <div className="text-[12px] text-[#6b7280]">Economy</div>
              {flight.seatLeft ? (
                <div className="mt-1 text-[12px] text-[#dc2626]">
                  CB: {flight.seatLeft} seats left
                </div>
              ) : null}
            </div>

            <div>
              <div className="text-[14px] font-semibold text-[#111827]">
                {flight.departureTime}
              </div>
              <div className="mt-1 text-[13px] text-[#111827]">
                {flight.fromCity}, {flight.fromCode}
              </div>
              <div className="text-[12px] text-[#6b7280]">
                Departure sector
              </div>
            </div>

            <div className="pt-1 text-center">
              <div className="text-[13px] font-medium text-[#111827]">
                {flight.stopsText}
              </div>
              <div className="text-[13px] text-[#111827]">{flight.duration}</div>
            </div>

            <div>
              <div className="text-[14px] font-semibold text-[#111827]">
                {flight.arrivalTime}
              </div>
              <div className="mt-1 text-[13px] text-[#111827]">
                {flight.toCity}, {flight.toCode}
              </div>
              <div className="text-[12px] text-[#6b7280]">
                Arrival sector
              </div>
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
              Fare Details for Adult
            </div>

            <div className="grid grid-cols-[1.3fr_1fr_1fr] py-1.5">
              <div>Base Price</div>
              <div>₹{selectedFare.price.toLocaleString("en-IN")} x 1</div>
              <div>₹{selectedFare.price.toLocaleString("en-IN")}</div>
            </div>

            <div className="grid grid-cols-[1.3fr_1fr_1fr] py-1.5">
              <div>Fare Type</div>
              <div>{selectedFare.label}</div>
              <div>{selectedFare.subtitle}</div>
            </div>

            <div className="mt-2 grid grid-cols-[1.3fr_1fr_1fr] border-t border-[#e5e7eb] pt-2 text-[16px] font-semibold">
              <div>Total</div>
              <div></div>
              <div>₹{selectedFare.price.toLocaleString("en-IN")}</div>
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
          <div>
            {flight.fromCode}-{flight.toCode}
          </div>
          <div>{flight.baggage}</div>
          <div>Cabin baggage included</div>
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