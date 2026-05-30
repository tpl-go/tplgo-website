"use client";

import { SectionTitle, formatPrice } from "./PackageManageShared";

export type PackageAddOnOption = {
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  price?: number;
  type?: string;
};

export type PackageAddOnQuote = {
  oldTotal: number;
  newTotal: number;
  difference: number;
  settlementMode: "save" | "payment" | "wallet_credit";
};

type Props = {
  currentAddOnsTotal: number;
  selectedAddOns?: PackageAddOnOption[];
  availableAddOns?: PackageAddOnOption[];
  activeAddOnIds: string[];
  onToggleAddOn: (addOn: PackageAddOnOption) => void;
  quote: PackageAddOnQuote;
  onContinue: () => void;
};

export default function PackageManageAddons({
  currentAddOnsTotal,
  selectedAddOns = [],
  availableAddOns = [],
  activeAddOnIds,
  onToggleAddOn,
  quote,
  onContinue,
}: Props) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Package Add-ons"
        subtitle="Modify package add-ons and review upgrade or refund settlement."
      />

      <div className="rounded-[24px] border border-black/5 bg-[#f8f9fb] p-5">
        <p className="text-sm font-bold text-[#111827]">
          Current Add-ons Total: {formatPrice(currentAddOnsTotal)}
        </p>

        <div className="mt-4 rounded-2xl border border-black/5 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
            Currently Selected
          </p>

          {selectedAddOns.length === 0 ? (
            <p className="mt-2 text-sm font-semibold text-[#6b7280]">
              No paid add-ons selected.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedAddOns.map((item) => (
                <Pill
                  key={item.id || item.title || item.name}
                  label={`${item.title || item.name || "Add-on"} • ${formatPrice(
                    Number(item.price || 0)
                  )}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[24px] border border-black/5 bg-white p-5">
        <p className="text-base font-bold text-[#111827]">
          Available Add-ons
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {availableAddOns.length === 0 ? (
            <div className="rounded-2xl border border-black/5 bg-[#f8f9fb] p-4 text-sm font-semibold text-[#6b7280]">
              Package add-ons not available in payload.
            </div>
          ) : (
            availableAddOns.map((addOn) => {
              const key = getAddOnKey(addOn);
              const isSelected = activeAddOnIds.includes(key);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onToggleAddOn(addOn)}
                  className={`min-w-0 rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? "border-[#ff6b00] bg-[#fff7f2] shadow-[0_8px_24px_rgba(255,107,0,0.08)]"
                      : "border-black/5 bg-[#f8f9fb] hover:border-[#ff6b00]/30"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#111827]">
                        {addOn.title || addOn.name || "Package Add-on"}
                      </p>
                      <p className="mt-1 break-words text-sm text-[#6b7280]">
                        {addOn.description || addOn.type || "Optional package add-on"}
                      </p>
                    </div>

                    {isSelected ? (
                      <span className="w-fit shrink-0 rounded-full bg-[#ff6b00] px-3 py-1 text-[11px] font-bold text-white">
                        Selected
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 rounded-xl bg-white px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                      Add-on Price
                    </p>
                    <p className="mt-1 text-lg font-black text-[#111827]">
                      {formatPrice(Number(addOn.price || 0))}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="rounded-[24px] border border-black/5 bg-white p-5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff6b00]">
          Settlement Summary
        </p>

        <h3 className="mt-1 text-lg font-bold text-[#111827]">
          {getSettlementTitle(quote.settlementMode)}
        </h3>

        <p className="mt-2 text-sm text-[#6b7280]">
          {getSettlementDescription(quote.settlementMode)}
        </p>

        <div className="mt-5 space-y-3">
          <Row label="Current Add-ons Total" value={formatPrice(quote.oldTotal)} />
          <Row label="New Add-ons Total" value={formatPrice(quote.newTotal)} />
          <Row
            label="Difference"
            value={
              quote.difference < 0
                ? `- ${formatPrice(Math.abs(quote.difference))}`
                : formatPrice(quote.difference)
            }
          />
        </div>

        <div className="mt-5 rounded-2xl bg-[#fff7f2] p-4">
          {quote.settlementMode === "payment" && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                  Net Payable
                </p>
                <p className="mt-1 text-xl font-bold text-[#111827]">
                  {formatPrice(quote.difference)}
                </p>
              </div>

              <button
                type="button"
                onClick={onContinue}
                className="w-full rounded-full bg-[#ff6b00] px-5 py-3 text-sm font-semibold text-white sm:w-auto"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {quote.settlementMode === "wallet_credit" && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                  Refund Wallet Credit
                </p>
                <p className="mt-1 text-xl font-bold text-[#111827]">
                  {formatPrice(Math.abs(quote.difference))}
                </p>
              </div>

              <button
                type="button"
                onClick={onContinue}
                className="w-full rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white sm:w-auto"
              >
                Save Changes
              </button>
            </div>
          )}

          {quote.settlementMode === "save" && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#111827]">
                  No payment required
                </p>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Same add-on price. Changes can be saved directly.
                </p>
              </div>

              <button
                type="button"
                onClick={onContinue}
                className="w-full rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white sm:w-auto"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function getAddOnKey(addOn: PackageAddOnOption) {
  return String(addOn.id || addOn.title || addOn.name || "");
}

function Pill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-black/5 bg-white px-3 py-1 text-[11px] font-bold text-[#4b5563]">
      {label}
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-[#f8f9fb] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <p className="text-sm text-[#4b5563]">{label}</p>
      <p className="text-sm font-semibold text-[#111827]">{value}</p>
    </div>
  );
}

function getSettlementTitle(mode: PackageAddOnQuote["settlementMode"]) {
  if (mode === "payment") return "Add-on Payment Required";
  if (mode === "wallet_credit") return "Refund Available";
  return "Direct Save Available";
}

function getSettlementDescription(mode: PackageAddOnQuote["settlementMode"]) {
  if (mode === "payment") {
    return "Selected package add-ons are higher priced. Continue to payment to confirm this change.";
  }

  if (mode === "wallet_credit") {
    return "Selected package add-ons are lower priced. Difference will be credited to Refund Wallet.";
  }

  return "Selected package add-ons have the same total price.";
}
