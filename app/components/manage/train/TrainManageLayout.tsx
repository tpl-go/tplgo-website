"use client";

import MobileInnerBack from "@/app/components/common/mobile/MobileInnerBack";

export type TrainManageTab =
  | "summary"
  | "traveller-details"
  | "contact-details"
  | "special-request"
  | "seat-addons";

type SidebarItem = {
  key: TrainManageTab;
  label: string;
  desc: string;
  badge?: string;
};

type Props = {
  activeTab: TrainManageTab;
  onTabChange: (tab: TrainManageTab) => void;

  bookingId: string;

  trainName: string;
  routeLabel: string;
  journeyDateLabel: string;
  pnrLabel?: string;
  classLabel?: string;
  travellersLabel?: string;

  children: React.ReactNode;
};

const tabs: SidebarItem[] = [
  {
    key: "summary",
    label: "Booking Summary",
    desc: "View train booking details",
  },
  {
    key: "traveller-details",
    label: "Traveller Details",
    desc: "Update passenger information",
  },
  {
    key: "contact-details",
    label: "Contact Details",
    desc: "Update email and phone",
  },
  {
    key: "special-request",
    label: "Special Request",
    desc: "Update train travel notes",
  },
  {
    key: "seat-addons",
    label: "Seat / Add-ons",
    desc: "Paid changes next",
    badge: "Paid",
  },
];

export default function TrainManageLayout({
  activeTab,
  onTabChange,
  bookingId,
  trainName,
  routeLabel,
  journeyDateLabel,
  pnrLabel,
  classLabel,
  travellersLabel,
  children,
}: Props) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4f7fb] pb-6 lg:pb-0">
      <div className="bg-[#f4f7fb] px-3 pt-3 lg:hidden">
        <MobileInnerBack title="Manage Train Booking" />
      </div>

      <div className="mx-auto w-full max-w-[1440px] px-3 pt-3 lg:hidden">
        <div className="rounded-[20px] border border-black/5 bg-white p-4 shadow-[0_10px_34px_rgba(15,23,42,0.06)]">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#ff6b00]">
            Manage Train Booking
          </p>
          <h1 className="mt-1 break-words text-[20px] font-black leading-7 text-[#111827]">
            {trainName}
          </h1>
          <p className="mt-1 break-words text-[13px] font-semibold leading-5 text-[#6b7280]">
            {routeLabel}
          </p>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <InfoPill label="Booking ID" value={bookingId} />
            <InfoPill label="Journey" value={journeyDateLabel} />
            <InfoPill label="Train" value={trainName} />
            {pnrLabel ? <InfoPill label="PNR" value={pnrLabel} /> : null}
            {classLabel ? <InfoPill label="Class" value={classLabel} /> : null}
            {travellersLabel ? (
              <InfoPill label="Passengers" value={travellersLabel} />
            ) : null}
          </div>
        </div>
      </div>

      <div className="hidden border-b border-black/5 bg-white lg:block">
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
        <aside className="h-fit min-w-0 rounded-[20px] border border-black/5 bg-white p-3 shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:rounded-[28px] md:p-4 lg:sticky lg:top-4">
          <div className="lg:hidden">
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#6b7280]">
              Manage Section
            </p>
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
                  {tab.badge ? `${tab.label} (${tab.badge})` : tab.label}
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
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-bold">
                      {tab.label}
                    </span>
                    <span className="mt-0.5 hidden text-xs font-semibold text-[#6b7280] lg:block">
                      {tab.desc}
                    </span>
                  </div>

                  {tab.badge ? (
                    <span
                      className={`ml-3 shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        isActive
                          ? "bg-[#ff6b00] text-white"
                          : "bg-[#f8f9fb] text-[#6b7280]"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  ) : (
                    <span
                      className={`ml-3 h-2.5 w-2.5 shrink-0 rounded-full ${
                        isActive
                          ? "bg-[#ff6b00]"
                          : "bg-[#d1d5db]"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        <section className="min-w-0 rounded-[20px] border border-black/5 bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:rounded-[28px] md:p-5 lg:p-6">
          {children}
        </section>
      </div>
    </main>
  );
}

function InfoPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-black/5 bg-[#f8f9fb] px-3 py-2.5">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6b7280]">
        {label}
      </p>
      <p className="mt-1 break-words text-[12px] font-black leading-4 text-[#111827]">
        {value || "-"}
      </p>
    </div>
  );
}
