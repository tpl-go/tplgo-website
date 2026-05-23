"use client";

import { CruiseTravellers } from "@/app/lib/cruise/cruiseTypes";

type CruiseTravellersPopoverProps = {
  value: CruiseTravellers;
  onUpdate: (key: "adults" | "children" | "infants", delta: number) => void;
};

type TravellerRowProps = {
  label: string;
  subtext: string;
  value: number;
  onMinus: () => void;
  onPlus: () => void;
};

function CounterButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-base font-semibold text-slate-700 transition hover:border-orange-400 hover:text-orange-500"
    >
      {children}
    </button>
  );
}

function TravellerRow({
  label,
  subtext,
  value,
  onMinus,
  onPlus,
}: TravellerRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{subtext}</p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <CounterButton onClick={onMinus}>−</CounterButton>
        <span className="w-5 text-center text-sm font-semibold text-slate-900">
          {value}
        </span>
        <CounterButton onClick={onPlus}>+</CounterButton>
      </div>
    </div>
  );
}

export default function CruiseTravellersPopover({
  value,
  onUpdate,
}: CruiseTravellersPopoverProps) {
  return (
    <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      <div className="px-4 py-3">
        <TravellerRow
          label="Adults"
          subtext="Age 12+"
          value={value.adults}
          onMinus={() => onUpdate("adults", -1)}
          onPlus={() => onUpdate("adults", 1)}
        />

        <div className="border-t border-slate-100" />

        <TravellerRow
          label="Children"
          subtext="Age 2–11"
          value={value.children}
          onMinus={() => onUpdate("children", -1)}
          onPlus={() => onUpdate("children", 1)}
        />

        <div className="border-t border-slate-100" />

        <TravellerRow
          label="Infants"
          subtext="Under 2"
          value={value.infants}
          onMinus={() => onUpdate("infants", -1)}
          onPlus={() => onUpdate("infants", 1)}
        />
      </div>
    </div>
  );
}