"use client";

import { ArrowRightLeft } from "lucide-react";

import type { CabLocationItem } from "@/app/lib/cab/cabSearchTypes";
import CabLocationSelector from "./CabLocationSelector";

type Props = {
  fromLabel?: string;
  toLabel?: string;
  fromValue: CabLocationItem | null;
  toValue: CabLocationItem | null;
  fromPlaceholder: string;
  toPlaceholder: string;
  onChangeFrom: (location: CabLocationItem) => void;
  onChangeTo: (location: CabLocationItem) => void;
  onSwap: () => void;
  compact?: boolean;
};

export default function CabFromToFields({
  fromLabel = "From",
  toLabel = "To",
  fromValue,
  toValue,
  fromPlaceholder,
  toPlaceholder,
  onChangeFrom,
  onChangeTo,
  onSwap,
  compact = false,
}: Props) {
  return (
    <div className="grid grid-cols-[1.1fr_72px_1.1fr] items-center gap-4 overflow-visible">
      <CabLocationSelector
        label={fromLabel}
        value={fromValue}
        onChange={onChangeFrom}
        placeholder={fromPlaceholder}
        excludeId={toValue?.id}
        compact={compact}
      />

      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={onSwap}
          className="flex h-[58px] w-[58px] items-center justify-center rounded-2xl border border-sky-200 bg-white text-sky-500 shadow-sm transition-all duration-300 hover:scale-105 hover:border-sky-300 hover:shadow-md"
          aria-label="Swap locations"
        >
          <ArrowRightLeft size={20} />
        </button>
      </div>

      <CabLocationSelector
        label={toLabel}
        value={toValue}
        onChange={onChangeTo}
        placeholder={toPlaceholder}
        excludeId={fromValue?.id}
        compact={compact}
      />
    </div>
  );
}