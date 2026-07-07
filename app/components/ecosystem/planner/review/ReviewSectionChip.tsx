"use client";

type ReviewSectionChipProps = {
  active: boolean;
  label: string;
  onClick: () => void;
};

export default function ReviewSectionChip({
  active,
  label,
  onClick,
}: ReviewSectionChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black transition ${
        active
          ? "border-[#4f46e5] bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white shadow-[0_12px_28px_rgba(79,70,229,0.28)]"
          : "border-slate-200 bg-white/85 text-slate-600 hover:border-[#4f46e5]/40 hover:text-[#4f46e5]"
      }`}
    >
      {label}
    </button>
  );
}
