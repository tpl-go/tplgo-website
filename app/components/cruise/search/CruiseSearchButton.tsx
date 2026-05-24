"use client";

type CruiseSearchButtonProps = {
  onClick: () => void;
  loading?: boolean;
  label?: string;
  heightClass?: string;
};

export default function CruiseSearchButton({
  onClick,
  loading = false,
  label = "Search Cruises",
  heightClass = "h-[78px]",
}: CruiseSearchButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`flex ${heightClass} h-11 md:h-[78px] w-full md:w-auto min-w-0 md:min-w-[230px] items-center justify-center gap-2 md:gap-3 rounded-xl md:rounded-[22px] bg-gradient-to-r from-orange-500 to-lime-500 px-8 text-sm md:text-[17px] font-extrabold text-white shadow-[0_14px_32px_rgba(249,115,22,0.30)] transition-all duration-200 hover:scale-[1.02] hover:brightness-105 active:scale-[0.98] active:brightness-95 disabled:cursor-not-allowed disabled:opacity-75`}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 md:h-5 md:w-5 animate-spin rounded-full border-2 border-white/35 border-t-white" />
          <span>Searching...</span>
        </>
      ) : (
        label
      )}
    </button>
  );
}