"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getSmartActiveOfferItem,
  SMART_OFFERS_DATA,
  SmartOfferItem,
  calculateSmartOfferDiscount,
} from "@/app/lib/smartOffers";

export type FlightOfferItem = {
  code: string;
  title: string;
  description: string;
  discountAmount: number;
};

type Props = {
  offers?: FlightOfferItem[];
  appliedOfferCode: string;
  isInternational?: boolean;
  bookingValue?: number;
  onApplyOffer: (offer: FlightOfferItem) => void;
  onRemoveOffer: () => void;
};

function isFlightOfferForRoute(
  offer: SmartOfferItem,
  isInternational: boolean
) {
  if (!offer.active) return false;

  if (
    offer.service !== "flight" &&
    offer.service !== "all"
  ) {
    return false;
  }

  if (offer.offerType === "membership") {
    return false;
  }

  if (offer.rule?.domesticOnly && isInternational) {
    return false;
  }

  if (offer.rule?.internationalOnly && !isInternational) {
    return false;
  }

  return true;
}

function mapSmartOfferToFlightOffer(
  offer: SmartOfferItem,
  bookingValue: number
): FlightOfferItem {
  return {
    code: offer.couponCode || offer.slug,
    title: offer.title,
    description:
      offer.description ||
      offer.subtitle ||
      "Smart offer available for this booking.",
    discountAmount: calculateSmartOfferDiscount(
      offer,
      bookingValue
    ),
  };
}

function uniqueOffers(
  offers: FlightOfferItem[]
) {
  const map = new Map<string, FlightOfferItem>();

  offers.forEach((offer) => {
    if (!offer.code) return;
    map.set(offer.code, offer);
  });

  return Array.from(map.values());
}

export default function FlightOffersSection({
  offers = [],
  appliedOfferCode,
  isInternational = false,
  bookingValue = 12000,
  onApplyOffer,
  onRemoveOffer,
}: Props) {
  const [smartActiveOffer, setSmartActiveOffer] =
    useState<SmartOfferItem | null>(null);

  useEffect(() => {
    const load = () => {
      setSmartActiveOffer(getSmartActiveOfferItem());
    };

    load();

    window.addEventListener("TPL_SMART_OFFER_UPDATED", load);
    window.addEventListener("storage", load);

    return () => {
      window.removeEventListener("TPL_SMART_OFFER_UPDATED", load);
      window.removeEventListener("storage", load);
    };
  }, []);



  const masterFlightOffers = useMemo(() => {
    return SMART_OFFERS_DATA.filter((item) =>
      isFlightOfferForRoute(item, isInternational)
    )
      .map((item) =>
        mapSmartOfferToFlightOffer(item, bookingValue)
      )
      .filter(
        (item) =>
          item.code &&
          Number(item.discountAmount || 0) > 0
      );
  }, [isInternational, bookingValue]);

  const smartOfferCard = useMemo(() => {
    if (!smartActiveOffer) return null;

    if (
      !isFlightOfferForRoute(
        smartActiveOffer,
        isInternational
      )
    ) {
      return null;
    }

    const mapped = mapSmartOfferToFlightOffer(
      smartActiveOffer,
      bookingValue
    );

    if (!mapped.code || mapped.discountAmount <= 0) {
      return null;
    }

    return mapped;
  }, [
    smartActiveOffer,
    isInternational,
    bookingValue,
  ]);

  const dynamicOffers = useMemo(() => {
  const list = uniqueOffers([
    ...masterFlightOffers,
  ]);

  if (!smartOfferCard?.code) {
    return list;
  }

  return list.filter(
    (offer) => offer.code !== smartOfferCard.code
  );
}, [masterFlightOffers, smartOfferCard?.code]);

  const appliedOffer = useMemo(() => {
    return (
      dynamicOffers.find(
        (item) => item.code === appliedOfferCode
      ) ||
      offers.find(
        (item) => item.code === appliedOfferCode
      ) ||
      null
    );
  }, [
    dynamicOffers,
    offers,
    appliedOfferCode,
  ]);

  const smartIsApplied =
  Boolean(smartOfferCard) &&
  (!appliedOfferCode || smartOfferCard?.code === appliedOfferCode);

  const smartAvailableBelow =
  Boolean(smartOfferCard) &&
  Boolean(appliedOfferCode) &&
  smartOfferCard?.code !== appliedOfferCode;

  return (
    <div
      style={{
        marginTop: "16px",
        border: "1px solid #d9e2ec",
        background: "#ffffff",
        boxShadow:
          "0 2px 8px rgba(15, 23, 42, 0.06)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 18px",
          borderBottom: "1px solid #e5e7eb",
          background: "#fff7ed",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: 800,
            color: "#111827",
          }}
        >
          Coupons & Offers
        </div>
      </div>

      <div style={{ padding: "16px 18px" }}>
        {appliedOffer ? (
          <div
            style={{
              marginBottom: "16px",
              border: "1px solid #bae6fd",
              background: "#f0f9ff",
              padding: "14px",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 800,
                color: "#0369a1",
              }}
            >
              Applied: {appliedOffer.code}
            </div>

            <div
              style={{
                marginTop: "4px",
                fontSize: "13px",
                color: "#374151",
                lineHeight: "20px",
              }}
            >
              {appliedOffer.title} — Save ₹
              {appliedOffer.discountAmount.toLocaleString(
                "en-IN"
              )}
            </div>

            <button
              type="button"
              onClick={onRemoveOffer}
              style={{
                marginTop: "10px",
                height: "36px",
                padding: "0 12px",
                border: "1px solid #d1d5db",
                background: "#ffffff",
                borderRadius: "8px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Remove Offer
            </button>
          </div>
        ) : null}

        {smartOfferCard ? (
          <div
            style={{
              marginBottom: "16px",
              border: smartIsApplied
                ? "2px solid #f97316"
                : "1px solid #fed7aa",
              background: smartIsApplied
                ? "linear-gradient(135deg,#fff7ed,#ffedd5)"
                : "linear-gradient(135deg,#fff7ed,#ffffff)",
              padding: "14px",
              borderRadius: "12px",
              boxShadow:
                "0 6px 16px rgba(249,115,22,0.10)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                gap: "12px",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    padding: "4px 9px",
                    borderRadius: "999px",
                    background: smartIsApplied
                      ? "#f97316"
                      : "#ffedd5",
                    color: smartIsApplied
                      ? "#ffffff"
                      : "#c2410c",
                    fontSize: "11px",
                    fontWeight: 900,
                    letterSpacing: "0.04em",
                  }}
                >
                  {smartIsApplied
                    ? "AI OFFER APPLIED"
                    : "AI RECOMMENDED"}
                </div>

                <div
                  style={{
                    marginTop: "9px",
                    fontSize: "15px",
                    fontWeight: 900,
                    color: "#111827",
                  }}
                >
                  {smartOfferCard.code}
                </div>

                <div
                  style={{
                    marginTop: "4px",
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "#111827",
                  }}
                >
                  {smartOfferCard.title}
                </div>

                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "13px",
                    color: "#6b7280",
                    lineHeight: "20px",
                  }}
                >
                  {smartIsApplied
                    ? "This smart offer is currently applied to your booking."
                    : "This smart offer is still available if you want to switch back."}
                </div>

                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "13px",
                    fontWeight: 900,
                    color: "#15803d",
                  }}
                >
                  Save ₹
                  {smartOfferCard.discountAmount.toLocaleString(
                    "en-IN"
                  )}
                </div>
              </div>

              {smartAvailableBelow ? (
                <button
                  type="button"
                  onClick={() =>
                    onApplyOffer(smartOfferCard)
                  }
                  style={{
                    minWidth: "96px",
                    height: "40px",
                    border: "none",
                    background: "#f97316",
                    color: "#ffffff",
                    borderRadius: "10px",
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow:
                      "0 6px 14px rgba(249,115,22,0.25)",
                  }}
                >
                  APPLY
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  style={{
                    minWidth: "96px",
                    height: "40px",
                    border: "none",
                    background: "#f97316",
                    color: "#ffffff",
                    borderRadius: "10px",
                    fontWeight: 900,
                    cursor: "not-allowed",
                    opacity: 0.9,
                  }}
                >
                  APPLIED
                </button>
              )}
            </div>
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gap: "12px",
          }}
        >
          {dynamicOffers.length === 0 ? (
            <div
              style={{
                border: "1px dashed #d1d5db",
                background: "#f9fafb",
                padding: "14px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 700,
                color: "#6b7280",
              }}
            >
              No eligible flight offers available for this route.
            </div>
          ) : null}

          {dynamicOffers.map((offer) => {
            const active =
              appliedOfferCode === offer.code;

            return (
              <div
                key={offer.code}
                style={{
                  border: active
                    ? "2px solid #38bdf8"
                    : "1px solid #d9e2ec",
                  background: active
                    ? "#eef8ff"
                    : "#ffffff",
                  padding: "14px",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    gap: "12px",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 800,
                        color: "#111827",
                      }}
                    >
                      {offer.code}
                    </div>

                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      {offer.title}
                    </div>

                    <div
                      style={{
                        marginTop: "6px",
                        fontSize: "13px",
                        color: "#6b7280",
                        lineHeight: "20px",
                      }}
                    >
                      {offer.description}
                    </div>

                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "13px",
                        fontWeight: 800,
                        color: "#15803d",
                      }}
                    >
                      Save ₹
                      {offer.discountAmount.toLocaleString(
                        "en-IN"
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={active}
                    onClick={() =>
                      onApplyOffer(offer)
                    }
                    style={{
                      minWidth: "92px",
                      height: "40px",
                      border: active
                        ? "none"
                        : "1px solid #d1d5db",
                      background: active
                        ? "#38bdf8"
                        : "#ffffff",
                      color: active
                        ? "#ffffff"
                        : "#111827",
                      borderRadius: "8px",
                      fontWeight: 800,
                      cursor: active
                        ? "not-allowed"
                        : "pointer",
                      opacity: active ? 0.95 : 1,
                    }}
                  >
                    {active ? "APPLIED" : "APPLY"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}