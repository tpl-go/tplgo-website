"use client";

import { useEffect, useMemo, useState } from "react";

type CabType = "airport" | "outstation" | "none";
type CabStatus = "pending" | "selected" | "skipped";

export type HomestayCabPayload = {
  cabType: CabType;
  cabStatus: CabStatus;
  cabLabel: string;
  cabPrice: number;
};

type Props = {
  isEnabled: boolean;
  onChange?: (payload: HomestayCabPayload) => void;
};

type CabOption = {
  key: CabType;
  title: string;
  subtitle: string;
  price: number;
};

const CAB_OPTIONS: CabOption[] = [
  {
    key: "airport",
    title: "Airport Transfer",
    subtitle: "Reliable pickup/drop for your homestay stay.",
    price: 899,
  },
  {
    key: "outstation",
    title: "Local / Outstation Cab",
    subtitle: "Pre-book local sightseeing or outstation ride with fixed fare.",
    price: 2499,
  },
];

export default function HomestayBookingCabSection({
  isEnabled,
  onChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [showCabModal, setShowCabModal] = useState(false);

  const [selectedCab, setSelectedCab] = useState<CabType>("none");
  const [cabStatus, setCabStatus] = useState<CabStatus>("pending");

  const selectedCabOption = useMemo(() => {
    return CAB_OPTIONS.find((item) => item.key === selectedCab) || null;
  }, [selectedCab]);

  const summaryText =
    cabStatus === "selected" && selectedCabOption
      ? `${selectedCabOption.title} selected`
      : cabStatus === "skipped"
      ? "Cab skipped"
      : "No cab selected";

  useEffect(() => {
    const option = CAB_OPTIONS.find((item) => item.key === selectedCab) || null;

    onChange?.({
      cabType: selectedCab,
      cabStatus,
      cabLabel:
        cabStatus === "skipped"
          ? "Cab skipped"
          : option?.title || "No cab selected",
      cabPrice: cabStatus === "selected" && option ? option.price : 0,
    });
  }, [selectedCab, cabStatus, onChange]);

  const handleSelectCab = (cabType: CabType) => {
    if (cabType === "none") {
      setSelectedCab("none");
      setCabStatus("skipped");
      setShowCabModal(false);
      return;
    }

    setSelectedCab(cabType);
    setCabStatus("selected");
    setShowCabModal(false);
  };

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-[#d9e2ec] bg-white">
        <div
          className="flex min-h-[58px] cursor-pointer items-center justify-between gap-4 border-b border-[#d9e2ec] bg-[#fffdf4] px-5"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex h-[18px] w-[18px] items-center justify-center rounded-full text-[12px] font-extrabold text-white ${
                isEnabled ? "bg-[#22c55e]" : "bg-[#d9534f]"
              }`}
            >
              {isEnabled ? "✓" : "!"}
            </span>

            <h3 className="text-[18px] font-extrabold text-[#1f2937]">Cab</h3>
          </div>

          <span
            className={`text-[18px] font-bold text-[#55a8d8] transition ${
              isOpen ? "rotate-0" : "-rotate-90"
            }`}
          >
            ˅
          </span>
        </div>

        {isOpen && (
          <div className="border-t border-[#e5e7eb] bg-white p-5">
            {!isEnabled ? (
              <div className="rounded-lg border border-[#f3d2d0] bg-[#fff7f7] p-5">
                <div className="text-[18px] font-extrabold text-[#111827]">
                  Cab locked
                </div>
                <div className="mt-2 text-[14px] leading-6 text-[#6b7280]">
                  Please complete Trip Secure section first to continue with cab
                  selection.
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-[#d9e2ec] bg-[#f8fbff] p-5">
                <div className="text-[18px] font-extrabold text-[#111827]">
                  Travel with comfort
                </div>

                <div className="mt-2 text-[14px] leading-6 text-[#4b5563]">
                  {summaryText}
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <CabCard
                    title="Airport Transfer"
                    subtitle="Reliable pickup/drop for your homestay stay."
                    price={899}
                    active={selectedCab === "airport" && cabStatus === "selected"}
                    onClick={() => setShowCabModal(true)}
                  />

                  <CabCard
                    title="Local / Outstation Cab"
                    subtitle="Pre-book local sightseeing or outstation ride with fixed fare."
                    price={2499}
                    active={
                      selectedCab === "outstation" && cabStatus === "selected"
                    }
                    onClick={() => setShowCabModal(true)}
                  />

                  <CabCard
                    title="No Cab Needed"
                    subtitle="Skip cab booking for this homestay stay."
                    price={0}
                    active={cabStatus === "skipped"}
                    onClick={() => handleSelectCab("none")}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {showCabModal && (
        <ModalOverlay onClose={() => setShowCabModal(false)}>
          <div className="w-full max-w-[860px] overflow-hidden rounded-xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-5">
              <div className="text-[22px] font-extrabold text-[#111827]">
                Select Cab
              </div>

              <button
                type="button"
                onClick={() => setShowCabModal(false)}
                className="border-0 bg-transparent text-[34px] leading-none text-[#374151]"
              >
                ×
              </button>
            </div>

            <div className="p-5">
              <div className="grid gap-4">
                {CAB_OPTIONS.map((item) => {
                  const active =
                    selectedCab === item.key && cabStatus === "selected";

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleSelectCab(item.key)}
                      className={`rounded-lg p-5 text-left transition ${
                        active
                          ? "border-2 border-[#38bdf8] bg-[#eef8ff]"
                          : "border border-[#d9e2ec] bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[18px] font-extrabold text-[#111827]">
                            {item.title}
                          </div>
                          <div className="mt-2 text-[14px] leading-6 text-[#4b5563]">
                            {item.subtitle}
                          </div>
                        </div>

                        <div className="whitespace-nowrap text-[20px] font-extrabold text-[#111827]">
                          ₹{item.price.toLocaleString("en-IN")}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectCab("none")}
                  className="h-[44px] rounded-lg border border-[#d1d5db] bg-white px-4 font-bold text-[#111827]"
                >
                  Skip Cab
                </button>

                <button
                  type="button"
                  onClick={() => setShowCabModal(false)}
                  className="h-[44px] rounded-lg bg-[#38bdf8] px-4 font-extrabold text-white"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}
    </>
  );
}

function CabCard({
  title,
  subtitle,
  price,
  active,
  onClick,
}: {
  title: string;
  subtitle: string;
  price: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[150px] rounded-lg p-4 text-left transition ${
        active
          ? "border-2 border-[#38bdf8] bg-[#eef8ff]"
          : "border border-[#d9e2ec] bg-white"
      }`}
    >
      <div className="text-[17px] font-extrabold text-[#111827]">{title}</div>
      <div className="mt-2 text-[14px] leading-6 text-[#4b5563]">
        {subtitle}
      </div>
      <div className="mt-4 text-[16px] font-extrabold text-[#111827]">
        {price > 0 ? `₹${price.toLocaleString("en-IN")}` : "Skip"}
      </div>
    </button>
  );
}

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] overflow-y-auto"
      >
        {children}
      </div>
    </div>
  );
}