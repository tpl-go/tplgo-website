"use client";

import { SectionTitle, formatPrice } from "./HotelManageShared";

export type HotelRoomVariant = {
  id?: string;
  name?: string;
  price?: number;
  taxes?: number;
  mealPlan?: string;
  cancellation?: string;
  availableRooms?: number;
  amenities?: string[];
  roomView?: string[];
};

export type HotelRoomQuote = {
  oldTotal: number;
  newTotal: number;
  difference: number;
  settlementMode: "save" | "payment" | "wallet_credit";
};

type Props = {
  roomName: string;
  rooms: number;
  nights: number;
  addOnsTotal: number;
  selectedVariant?: HotelRoomVariant | null;
  variants?: HotelRoomVariant[];
  activeVariantId?: string;
  onVariantChange: (variant: HotelRoomVariant) => void;
  quote: HotelRoomQuote;
  onContinue: () => void;
};

export default function HotelManageRoomAddons({
  roomName,
  rooms,
  nights,
  addOnsTotal,
  selectedVariant,
  variants = [],
  activeVariantId,
  onVariantChange,
  quote,
  onContinue,
}: Props) {
  const currentVariantId = selectedVariant?.id || "";
  const selectedNewVariantId = activeVariantId || currentVariantId;

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Room / Add-ons"
        subtitle="Select a room option and review upgrade or refund settlement."
      />

      <div className="rounded-[24px] border border-black/5 bg-[#f8f9fb] p-5">
        <p className="text-sm font-bold text-[#111827]">
          Current Room: {roomName}
        </p>
        <p className="mt-2 text-sm text-[#6b7280]">
          Stay: {rooms} Room • {nights} Night
        </p>
        <p className="mt-2 text-sm text-[#6b7280]">
          Current Add-ons Total: {formatPrice(addOnsTotal)}
        </p>

        {selectedVariant ? (
          <div className="mt-4 rounded-2xl border border-black/5 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
              Current Selected Variant
            </p>
            <p className="mt-1 text-sm font-bold text-[#111827]">
              {selectedVariant.name || roomName}
            </p>
            <p className="mt-1 text-sm text-[#6b7280]">
              {formatPrice(Number(selectedVariant.price || 0))} +{" "}
              {formatPrice(Number(selectedVariant.taxes || 0))} taxes •{" "}
              {selectedVariant.mealPlan || "-"} •{" "}
              {selectedVariant.cancellation || "-"}
            </p>
          </div>
        ) : null}
      </div>

      <div className="rounded-[24px] border border-black/5 bg-white p-5">
        <p className="text-base font-bold text-[#111827]">
          Available Room Options
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {variants.length === 0 ? (
            <div className="rounded-2xl border border-black/5 bg-[#f8f9fb] p-4 text-sm font-semibold text-[#6b7280]">
              Room variants not available in payload.
            </div>
          ) : (
            variants.map((variant) => {
              const isCurrent = variant.id === currentVariantId;
              const isSelected = variant.id === selectedNewVariantId;

              const perNight = Number(variant.price || 0);
              const taxes = Number(variant.taxes || 0);
              const total = (perNight + taxes) * rooms * nights;

              return (
                <button
                  key={variant.id || variant.name}
                  type="button"
                  onClick={() => onVariantChange(variant)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? "border-[#ff6b00] bg-[#fff7f2] shadow-[0_8px_24px_rgba(255,107,0,0.08)]"
                      : "border-black/5 bg-[#f8f9fb] hover:border-[#ff6b00]/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[#111827]">
                        {variant.name || "Room Option"}
                      </p>
                      <p className="mt-1 text-sm text-[#6b7280]">
                        {formatPrice(perNight)} + {formatPrice(taxes)} taxes / night
                      </p>
                    </div>

                    {isCurrent ? (
                      <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-green-700">
                        Current
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Pill label={variant.mealPlan || "-"} />
                    <Pill label={variant.cancellation || "-"} />
                    {(variant.roomView || []).slice(0, 2).map((item) => (
                      <Pill key={item} label={item} />
                    ))}
                  </div>

                  {!!variant.amenities?.length && (
                    <p className="mt-3 text-xs font-semibold text-[#6b7280]">
                      {variant.amenities.slice(0, 4).join(" • ")}
                    </p>
                  )}

                  <div className="mt-4 rounded-xl bg-white px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                      Total for stay
                    </p>
                    <p className="mt-1 text-lg font-black text-[#111827]">
                      {formatPrice(total)}
                    </p>
                  </div>

                  <p className="mt-3 text-xs font-semibold text-[#dc2626]">
                    {Number(variant.availableRooms || 0) > 0
                      ? `Only ${variant.availableRooms} room${
                          Number(variant.availableRooms || 0) > 1 ? "s" : ""
                        } left`
                      : "Availability pending"}
                  </p>
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
          <Row label="Current Room Total" value={formatPrice(quote.oldTotal)} />
          <Row label="New Room Total" value={formatPrice(quote.newTotal)} />
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
            <div className="flex items-center justify-between gap-4">
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
                className="rounded-full bg-[#ff6b00] px-5 py-3 text-sm font-semibold text-white"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {quote.settlementMode === "wallet_credit" && (
            <div className="flex items-center justify-between gap-4">
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
                className="rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white"
              >
                Save Changes
              </button>
            </div>
          )}

          {quote.settlementMode === "save" && (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#111827]">
                  No payment required
                </p>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Same room price. Changes can be saved directly.
                </p>
              </div>

              <button
                type="button"
                onClick={onContinue}
                className="rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white"
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

function Pill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-black/5 bg-white px-3 py-1 text-[11px] font-bold text-[#4b5563]">
      {label}
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#f8f9fb] px-4 py-3">
      <p className="text-sm text-[#4b5563]">{label}</p>
      <p className="text-sm font-semibold text-[#111827]">{value}</p>
    </div>
  );
}

function getSettlementTitle(mode: HotelRoomQuote["settlementMode"]) {
  if (mode === "payment") return "Upgrade Payment Required";
  if (mode === "wallet_credit") return "Downgrade Refund Available";
  return "Direct Save Available";
}

function getSettlementDescription(mode: HotelRoomQuote["settlementMode"]) {
  if (mode === "payment") {
    return "Selected room is higher priced. Continue to payment to confirm this change.";
  }

  if (mode === "wallet_credit") {
    return "Selected room is lower priced. Difference will be credited to Refund Wallet.";
  }

  return "Selected room has the same price as current room.";
}