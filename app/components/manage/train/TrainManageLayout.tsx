"use client";

export type TrainManageTab =
  | "summary"
  | "traveller-details"
  | "contact-details"
  | "special-request"
  | "seat-addons";

type Props = {
  activeTab: TrainManageTab;
  onTabChange: (tab: TrainManageTab) => void;

  bookingId: string;

  trainName: string;
  routeLabel: string;
  journeyDateLabel: string;

  children: React.ReactNode;
};

const tabs: {
  key: TrainManageTab;
  label: string;
}[] = [
  {
    key: "summary",
    label: "Booking Summary",
  },
  {
    key: "traveller-details",
    label: "Traveller Details",
  },
  {
    key: "contact-details",
    label: "Contact Details",
  },
  {
    key: "special-request",
    label: "Special Request",
  },
  {
    key: "seat-addons",
    label: "Seat / Add-ons",
  },
];

export default function TrainManageLayout({
  activeTab,
  onTabChange,
  bookingId,
  trainName,
  routeLabel,
  journeyDateLabel,
  children,
}: Props) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4f7fb]">
      <div className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-3 py-4 md:px-4 md:py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff6b00]">
              Train Manage Booking
            </p>

            <h1 className="mt-1 break-words text-[22px] font-black leading-8 text-[#111827] md:text-2xl">
              {trainName}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-2 break-words text-[13px] font-semibold text-[#6b7280] md:text-sm">
              <span>{routeLabel}</span>

              <span>•</span>

              <span>
                Journey:{" "}
                {journeyDateLabel}
              </span>

              <span>•</span>

              <span>
                Booking ID: {bookingId}
              </span>
            </div>
          </div>

          <a
            href="/account/bookings"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-bold text-[#111827] transition hover:border-[#ff6b00] hover:text-[#ff6b00]"
          >
            Back to My Bookings
          </a>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-4 px-3 py-4 md:px-4 md:py-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-6 lg:px-8">
        <aside className="h-fit rounded-[20px] border border-black/5 bg-white p-3 shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:rounded-[28px] md:p-4">
          <div className="lg:hidden">
            <select
              value={activeTab}
              onChange={(event) =>
                onTabChange(event.target.value as TrainManageTab)
              }
              className="h-12 w-full rounded-2xl border border-[#ff6b00]/20 bg-[#fff7f2] px-4 text-sm font-bold text-[#111827] outline-none shadow-[0_8px_24px_rgba(255,107,0,0.08)]"
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
            {tabs.map((tab) => {
              const isActive =
                activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() =>
                    onTabChange(tab.key)
                  }
                  className={`flex min-w-[160px] items-center justify-between rounded-2xl px-3 py-3 text-left transition lg:w-full lg:min-w-0 lg:px-4 lg:py-4 ${
                    isActive
                      ? "bg-[#fff4ec] text-[#ff6b00]"
                      : "bg-white text-[#111827] hover:bg-[#f8fafc]"
                  }`}
                >
                  <span className="truncate text-sm font-bold">
                    {tab.label}
                  </span>

                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isActive
                        ? "bg-[#ff6b00]"
                        : "bg-[#d1d5db]"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </aside>

        <section className="min-w-0">
          {children}
        </section>
      </div>
    </main>
  );
}
