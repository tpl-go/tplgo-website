"use client";

type Props = {
  onClick: () => void;
  compact?: boolean;
  label?: string;
};

export default function CabSearchButton({
  onClick,
  compact = false,
  label = "Search Cabs",
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600 font-extrabold text-white shadow-[0_14px_32px_rgba(234,88,12,0.28)] transition hover:scale-[1.02] hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] ${
        compact
          ? "h-[48px] min-w-[190px] px-8 text-[15px]"
          : "h-[54px] min-w-[220px] px-8 text-[15px]"
      }`}
    >
      {label}
    </button>
  );
}