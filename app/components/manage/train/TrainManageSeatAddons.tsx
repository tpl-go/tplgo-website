"use client";

import {
  SectionTitle,
  formatPrice,
} from "./TrainManageShared";

export type TrainSeatVariant = {
  id?: string;

  className?: string;
  seatType?: string;

  berthType?: string;

  price?: number;
  taxes?: number;

  availability?: string;

  mealIncluded?: boolean;
};

export type TrainSeatQuote = {
  oldTotal: number;
  newTotal: number;
  difference: number;

  settlementMode:
    | "save"
    | "payment"
    | "wallet_credit";
};

type Props = {
  currentClassName: string;

  travellers: number;

  selectedSeat:
    | TrainSeatVariant
    | null;

  variants?: TrainSeatVariant[];

  activeVariantId?: string;

  onVariantChange: (
    variant: TrainSeatVariant
  ) => void;

  quote: TrainSeatQuote;

  onContinue: () => void;
};

export default function TrainManageSeatAddons({
  currentClassName,
  travellers,
  selectedSeat,
  variants = [],
  activeVariantId,
  onVariantChange,
  quote,
  onContinue,
}: Props) {
  const currentVariantId =
    selectedSeat?.id || "";

  const selectedNewVariantId =
    activeVariantId ||
    currentVariantId;

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Seat / Add-ons"
        subtitle="Upgrade class, berth preference or train add-ons."
      />

      <div className="rounded-[24px] border border-black/5 bg-[#f8f9fb] p-5">
        <p className="text-sm font-bold text-[#111827]">
          Current Class:{" "}
          {currentClassName}
        </p>

        <p className="mt-2 text-sm text-[#6b7280]">
          Total Travellers:{" "}
          {travellers}
        </p>

        {selectedSeat ? (
          <div className="mt-4 rounded-2xl border border-black/5 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
              Current Selected Option
            </p>

            <p className="mt-1 text-sm font-bold text-[#111827]">
              {selectedSeat.className ||
                currentClassName}
            </p>

            <p className="mt-1 text-sm text-[#6b7280]">
              {selectedSeat.berthType ||
                "-"}{" "}
              •{" "}
              {selectedSeat.seatType ||
                "-"}
            </p>
          </div>
        ) : null}
      </div>

      <div className="rounded-[24px] border border-black/5 bg-white p-5">
        <p className="text-base font-bold text-[#111827]">
          Available Options
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {variants.length ===
          0 ? (
            <div className="rounded-2xl border border-black/5 bg-[#f8f9fb] p-4 text-sm font-semibold text-[#6b7280]">
              Seat variants not
              available.
            </div>
          ) : (
            variants.map(
              (
                variant,
                index
              ) => {
                const isCurrent =
                  variant.id ===
                  currentVariantId;

                const isSelected =
                  variant.id ===
                  selectedNewVariantId;

                const total =
                  (Number(
                    variant.price ||
                      0
                  ) +
                    Number(
                      variant.taxes ||
                        0
                    )) *
                  travellers;

                return (
                  <button
                    key={`train-seat-${variant.id || index}`}
                    type="button"
                    onClick={() =>
                      onVariantChange(
                        variant
                      )
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-[#ff6b00] bg-[#fff7f2] shadow-[0_8px_24px_rgba(255,107,0,0.08)]"
                        : "border-black/5 bg-[#f8f9fb] hover:border-[#ff6b00]/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-[#111827]">
                          {variant.className ||
                            "Train Class"}
                        </p>

                        <p className="mt-1 text-sm text-[#6b7280]">
                          {variant.berthType ||
                            "-"}{" "}
                          •{" "}
                          {variant.seatType ||
                            "-"}
                        </p>
                      </div>

                      {isCurrent ? (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-green-700">
                          Current
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 rounded-xl bg-white px-3 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                        Total Fare
                      </p>

                      <p className="mt-1 text-lg font-black text-[#111827]">
                        {formatPrice(
                          total
                        )}
                      </p>
                    </div>

                    <p className="mt-3 text-xs font-semibold text-[#2563eb]">
                      {variant.availability ||
                        "Available"}
                    </p>
                  </button>
                );
              }
            )
          )}
        </div>
      </div>

      <div className="rounded-[24px] border border-black/5 bg-white p-5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff6b00]">
          Settlement Summary
        </p>

        <h3 className="mt-1 text-lg font-bold text-[#111827]">
          {getSettlementTitle(
            quote.settlementMode
          )}
        </h3>

        <p className="mt-2 text-sm text-[#6b7280]">
          {getSettlementDescription(
            quote.settlementMode
          )}
        </p>

        <div className="mt-5 space-y-3">
          <Row
            label="Current Total"
            value={formatPrice(
              quote.oldTotal
            )}
          />

          <Row
            label="Updated Total"
            value={formatPrice(
              quote.newTotal
            )}
          />

          <Row
            label="Difference"
            value={
              quote.difference < 0
                ? `- ${formatPrice(
                    Math.abs(
                      quote.difference
                    )
                  )}`
                : formatPrice(
                    quote.difference
                  )
            }
          />
        </div>

        <div className="mt-5 rounded-2xl bg-[#fff7f2] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                Settlement
              </p>

              <p className="mt-1 text-xl font-bold text-[#111827]">
                {quote.settlementMode ===
                "wallet_credit"
                  ? formatPrice(
                      Math.abs(
                        quote.difference
                      )
                    )
                  : formatPrice(
                      quote.difference
                    )}
              </p>
            </div>

            <button
              type="button"
              onClick={onContinue}
              className={`rounded-full px-5 py-3 text-sm font-semibold text-white ${
                quote.settlementMode ===
                "payment"
                  ? "bg-[#ff6b00]"
                  : "bg-[#111827]"
              }`}
            >
              {quote.settlementMode ===
              "payment"
                ? "Continue to Payment"
                : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#f8f9fb] px-4 py-3">
      <p className="text-sm text-[#4b5563]">
        {label}
      </p>

      <p className="text-sm font-semibold text-[#111827]">
        {value}
      </p>
    </div>
  );
}

function getSettlementTitle(
  mode: TrainSeatQuote["settlementMode"]
) {
  if (mode === "payment")
    return "Upgrade Payment Required";

  if (mode === "wallet_credit")
    return "Refund Available";

  return "Direct Save Available";
}

function getSettlementDescription(
  mode: TrainSeatQuote["settlementMode"]
) {
  if (mode === "payment") {
    return "Selected class is higher priced. Continue to payment to confirm.";
  }

  if (mode === "wallet_credit") {
    return "Selected option is lower priced. Refund will be credited to Refund Wallet.";
  }

  return "Selected option has same fare as current booking.";
}