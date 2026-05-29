"use client";

export type InsuranceManageTab =
  | "summary"
  | "traveller-details"
  | "nominee-contact"
  | "medical-declaration"
  | "claim-support"
  | "policy-download";

type Props = {
  activeTab: InsuranceManageTab;
  onTabChange: (tab: InsuranceManageTab) => void;
  bookingId: string;
  policyTitle: string;
  destination: string;
  startDateLabel: string;
  children: React.ReactNode;
};

const tabs: { key: InsuranceManageTab; label: string }[] = [
  { key: "summary", label: "Summary" },
  { key: "traveller-details", label: "Traveller Details" },
  { key: "nominee-contact", label: "Nominee / Contact" },
  { key: "medical-declaration", label: "Medical Declaration" },
  { key: "claim-support", label: "Claim Support" },
  { key: "policy-download", label: "Policy Download" },
];

export default function InsuranceManageLayout({
  activeTab,
  onTabChange,
  bookingId,
  policyTitle,
  destination,
  startDateLabel,
  children,
}: Props) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f8f9fb] px-3 py-4 text-black md:px-4 md:py-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-4 rounded-[20px] border border-black/5 bg-white p-4 shadow-sm md:mb-5 md:rounded-[30px] md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wide text-orange-600">
                Insurance Manage Booking
              </p>

              <h1 className="mt-1 break-words text-[22px] font-black leading-8 text-[#111827] md:text-2xl">
                {policyTitle || "Insurance Policy"}
              </h1>

              <p className="mt-1 break-words text-[13px] font-semibold leading-5 text-[#6b7280] md:text-sm">
                Booking ID: {bookingId} • {destination || "Destination"} •{" "}
                {startDateLabel || "Travel date"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="h-11 rounded-2xl border border-gray-200 bg-white px-5 text-sm font-black text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr] lg:gap-5">
          <aside className="h-fit rounded-[20px] border border-black/5 bg-white p-3 shadow-sm md:rounded-[28px]">
            <div className="lg:hidden">
              <select
                value={activeTab}
                onChange={(event) =>
                  onTabChange(event.target.value as InsuranceManageTab)
                }
                className="h-12 w-full rounded-2xl border border-orange-200 bg-orange-50 px-4 text-sm font-black text-gray-900 outline-none shadow-sm"
                aria-label="Select booking action"
              >
                {tabs.map((tab) => (
                  <option key={tab.key} value={tab.key}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden space-y-2 lg:block lg:overflow-visible">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onTabChange(tab.key)}
                  className={`flex h-11 min-w-[154px] items-center rounded-2xl px-4 text-left text-sm font-black transition lg:w-full lg:min-w-0 ${
                    activeTab === tab.key
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-700"
                  }`}
                >
                  <span className="truncate">{tab.label}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="min-w-0">{children}</section>
        </div>
      </div>
    </main>
  );
}
