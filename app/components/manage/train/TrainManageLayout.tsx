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
    <main className="min-h-screen bg-[#f4f7fb]">
      <div className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-5 lg:px-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff6b00]">
              Train Manage Booking
            </p>

            <h1 className="mt-1 text-2xl font-black text-[#111827]">
              {trainName}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-[#6b7280]">
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
            className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-bold text-[#111827] transition hover:border-[#ff6b00] hover:text-[#ff6b00]"
          >
            Back to My Bookings
          </a>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
        <aside className="h-fit rounded-[28px] border border-black/5 bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
          <div className="space-y-2">
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
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left transition ${
                    isActive
                      ? "bg-[#fff4ec] text-[#ff6b00]"
                      : "bg-white text-[#111827] hover:bg-[#f8fafc]"
                  }`}
                >
                  <span className="text-sm font-bold">
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