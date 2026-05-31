"use client";

export function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff6b00]">
        Bus Manage
      </p>
      <h2 className="mt-1 break-words text-xl font-bold text-[#111827]">{title}</h2>
      <p className="mt-1 break-words text-sm text-[#6b7280]">{subtitle}</p>
    </div>
  );
}

export function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-[#111827]">
        {value || "-"}
      </p>
    </div>
  );
}

export function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-[#111827] outline-none focus:border-[#ff6b00]"
      />
    </label>
  );
}

export function PrimaryButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[48px] w-full rounded-full bg-[#ff6b00] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 sm:w-auto"
    >
      {label}
    </button>
  );
}

export function formatPrice(amount: number) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}
