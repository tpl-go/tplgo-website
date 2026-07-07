"use client";

type Props = {
  bookingId: string;
  email?: string;
  invoiceNumber: string;
  mobile?: string;
  onDownload?: () => void;
  onGoHome?: () => void;
  onGoToMyBookings?: () => void;
  onManageBooking?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  paymentId: string;
};

export default function PlannerConfirmationActionsCard({
  bookingId,
  email,
  invoiceNumber,
  mobile,
  onDownload,
  onGoHome,
  onGoToMyBookings,
  onManageBooking,
  onPrint,
  onShare,
  paymentId,
}: Props) {
  return (
    <aside className="w-full">
      <div className="flex flex-col gap-4 lg:sticky lg:top-24">
        <Card title="Booking Actions" subtitle="Download, print, share and manage your Smart Planner booking.">
          <Action label="Download Confirmation" onClick={onDownload} variant="primary" />
          <Action label="Print Confirmation" onClick={onPrint} />
          <Action label="Share Trip" onClick={onShare} />
          <Action label="Manage Booking" onClick={onManageBooking} />
        </Card>

        <Card title="Quick Reference">
          <Meta label="Booking ID" value={bookingId} />
          <Meta label="Payment ID" value={paymentId} />
          <Meta label="Invoice No." value={invoiceNumber} />
          <Meta label="Email" value={email || "Not available"} />
          <Meta label="Mobile" value={mobile || "Not available"} />
        </Card>

        <Card title="Navigation">
          <Action label="View My Booking" onClick={onGoToMyBookings} />
          <Action label="Back to Home" onClick={onGoHome} variant="ghost" />
        </Card>
      </div>
    </aside>
  );
}

function Card({
  children,
  subtitle,
  title,
}: {
  children: React.ReactNode;
  subtitle?: string;
  title: string;
}) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[#d9e2ec] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-200 bg-[linear-gradient(90deg,#eef6ff_0%,#ffffff_55%,#fff7ed_100%)] px-4 py-4">
        <div className="text-lg font-black text-slate-950">{title}</div>
        {subtitle ? <div className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</div> : null}
      </div>
      <div className="grid gap-3 p-4">{children}</div>
    </div>
  );
}

function Action({
  label,
  onClick,
  variant = "secondary",
}: {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const classes =
    variant === "primary"
      ? "border-red-500 bg-red-500 text-white"
      : variant === "ghost"
        ? "border-slate-200 bg-slate-50 text-slate-700"
        : "border-slate-200 bg-white text-slate-900";

  return (
    <button
      className={`rounded-2xl border px-4 py-3 text-left text-sm font-black transition hover:shadow-sm ${classes}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
      <span className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
      <span className="break-words text-right text-sm font-black text-slate-950">{value}</span>
    </div>
  );
}
