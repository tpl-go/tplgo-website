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
    <main className="min-h-screen bg-[#f8f9fb] px-4 py-8 text-black">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-5 rounded-[30px] border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-orange-600">
                Insurance Manage Booking
              </p>

              <h1 className="mt-1 text-2xl font-black text-[#111827]">
                {policyTitle || "Insurance Policy"}
              </h1>

              <p className="mt-1 text-sm font-semibold text-[#6b7280]">
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

        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-[28px] border border-black/5 bg-white p-3 shadow-sm">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onTabChange(tab.key)}
                  className={`flex h-11 w-full items-center rounded-2xl px-4 text-left text-sm font-black transition ${
                    activeTab === tab.key
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>

          <section>{children}</section>
        </div>
      </div>
    </main>
  );
}