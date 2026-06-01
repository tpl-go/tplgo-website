"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, FileText, ShieldCheck, WalletCards } from "lucide-react";
import type { VisaOption } from "@/app/lib/visa/visaCatalog";
import {
  calculateSmartOfferDiscount,
  getSmartActiveOfferItem,
} from "@/app/lib/smartOffers";

export type VisaResultPricingSnapshot = {
  baseVisaAmount: number;
  embassyFee: number;
  serviceFee: number;
  taxesAndFees: number;
  nonBenefitTotal: number;
  totalBeforeOffer: number;
  offerDiscount: number;
  baseAfterOffer: number;
  totalBeforeWallet: number;
  payableTotal: number;
  appliedOfferCode: string;
  appliedOfferTitle: string;
  appliedOfferAmount: number;
  earnedOnThisBooking: number;
};

type Props = {
  item: VisaOption;
  travellers?: number;
  onApply: (
    item: VisaOption & { pricingSnapshot?: VisaResultPricingSnapshot }
  ) => void;
};

type VisaOptionChargeExtras = {
  baseVisaAmount?: number;
  basePrice?: number;
  visaFee?: number;
};

type SmartOffer = {
  service?: string;
  couponCode?: string;
  slug?: string;
  title?: string;
};

function safeNumber(value: unknown, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export default function VisaResultCard({ item, travellers = 1, onApply }: Props) {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const update = () => setRefreshKey((prev) => prev + 1);

    window.addEventListener("TPL_ACTIVE_OFFER_UPDATED", update);
    window.addEventListener("TPL_SMART_OFFER_UPDATED", update);

    update();

    return () => {
      window.removeEventListener("TPL_ACTIVE_OFFER_UPDATED", update);
      window.removeEventListener("TPL_SMART_OFFER_UPDATED", update);
    };
  }, []);

  const smartOffer = useMemo(() => {
    void refreshKey;
    return getSmartActiveOfferItem() as SmartOffer | null;
  }, [refreshKey]);

  const pricingSnapshot = useMemo<VisaResultPricingSnapshot>(() => {
    const itemExtras = item as VisaOption & VisaOptionChargeExtras;
    const applicantCount = Math.max(1, safeNumber(travellers, 1));

    const embassyFeePerApplicant = safeNumber(item.embassyFee);
    const serviceFeePerApplicant = safeNumber(item.serviceFee);

    const totalPricePerApplicant = safeNumber(
      item.totalPrice,
      embassyFeePerApplicant + serviceFeePerApplicant
    );

    const baseVisaAmountPerApplicant = safeNumber(
      itemExtras.baseVisaAmount || itemExtras.basePrice || itemExtras.visaFee,
      serviceFeePerApplicant
    );

    const knownFeePerApplicant = embassyFeePerApplicant + serviceFeePerApplicant;

    const taxesAndFeesPerApplicant = Math.max(
      totalPricePerApplicant - knownFeePerApplicant,
      0
    );

    const baseVisaAmount = baseVisaAmountPerApplicant * applicantCount;
    const embassyFee = embassyFeePerApplicant * applicantCount;
    const serviceFee = serviceFeePerApplicant * applicantCount;
    const taxesAndFees = taxesAndFeesPerApplicant * applicantCount;

    const totalBeforeOffer =
      totalPricePerApplicant * applicantCount > 0
        ? totalPricePerApplicant * applicantCount
        : baseVisaAmount + embassyFee + taxesAndFees;

    const nonBenefitTotal = Math.max(totalBeforeOffer - baseVisaAmount, 0);

    const serviceOk =
      smartOffer?.service === "visa" || smartOffer?.service === "all";

    const offerDiscount =
      smartOffer && serviceOk
        ? Math.min(
            calculateSmartOfferDiscount(smartOffer, baseVisaAmount),
            baseVisaAmount
          )
        : 0;

    const baseAfterOffer = Math.max(baseVisaAmount - offerDiscount, 0);
    const totalBeforeWallet = Math.max(totalBeforeOffer - offerDiscount, 0);
    const payableTotal = totalBeforeWallet;

    return {
      baseVisaAmount,
      embassyFee,
      serviceFee,
      taxesAndFees,
      nonBenefitTotal,
      totalBeforeOffer,
      offerDiscount,
      baseAfterOffer,
      totalBeforeWallet,
      payableTotal,
      appliedOfferCode: smartOffer?.couponCode || smartOffer?.slug || "",
      appliedOfferTitle: smartOffer?.title || "",
      appliedOfferAmount: offerDiscount,
      earnedOnThisBooking: Math.floor(baseAfterOffer * 0.02),
    };
  }, [item, smartOffer, travellers]);

  const offerDiscount = pricingSnapshot.offerDiscount;
  const offerCode = pricingSnapshot.appliedOfferCode;
  const payableTotal = pricingSnapshot.payableTotal;

  const handleApplyNow = () => {
    onApply({
      ...item,
      pricingSnapshot,
    });
  };

  return (
    <div className="min-w-0 rounded-[22px] border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-lg md:rounded-3xl md:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-extrabold text-orange-700">
              {item.visaType}
            </span>

            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-extrabold text-blue-700">
              {item.entryType}
            </span>

            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-extrabold text-green-700">
              TPL Verified
            </span>
          </div>

          <h2 className="break-words text-[21px] font-extrabold leading-7 text-gray-950 md:text-2xl">
            {item.title}
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="min-w-0 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <Clock size={19} className="mb-2 text-orange-600" />
              <p className="text-xs font-bold text-gray-600">Processing Time</p>
              <p className="mt-1 break-words font-extrabold leading-5 text-gray-950">
                {item.processingTime}
              </p>
            </div>

            <div className="min-w-0 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <ShieldCheck size={19} className="mb-2 text-orange-600" />
              <p className="text-xs font-bold text-gray-600">Validity</p>
              <p className="mt-1 break-words font-extrabold leading-5 text-gray-950">
                {item.validity}
              </p>
            </div>

            <div className="min-w-0 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <FileText size={19} className="mb-2 text-orange-600" />
              <p className="text-xs font-bold text-gray-600">Stay Duration</p>
              <p className="mt-1 break-words font-extrabold leading-5 text-gray-950">
                {item.stayDuration}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-sm font-extrabold text-gray-950">
              Documents Required
            </p>

            <div className="flex flex-wrap gap-2">
              {item.documents.map((doc) => (
                <span
                  key={doc}
                  className="break-words rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-800"
                >
                  {doc}
                </span>
              ))}
            </div>
          </div>

          {item.notes?.length > 0 && (
            <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
              <p className="mb-2 text-sm font-extrabold text-gray-950">
                Important Notes
              </p>

              <ul className="space-y-1 text-xs font-medium leading-5 text-gray-700">
                {item.notes.map((note) => (
                  <li key={note} className="break-words">
                    • {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="w-full min-w-0 rounded-[22px] border border-gray-200 bg-gray-50 p-4 md:rounded-3xl md:p-5 lg:w-80">
          <div className="flex items-center gap-2 text-sm font-extrabold text-gray-950">
            <WalletCards size={18} />
            Fee Summary
          </div>

          <div className="mt-4 space-y-2.5 text-sm">
  <div className="flex items-start justify-between gap-3">
    <span className="font-semibold text-gray-600">
      Visa Fees
    </span>

    <span className="font-extrabold text-gray-950">
      ₹{pricingSnapshot.embassyFee.toLocaleString("en-IN")}
    </span>
  </div>

  <div className="flex items-start justify-between gap-3">
    <span className="font-semibold text-gray-600">
      Service Fees
    </span>

    <span className="font-extrabold text-gray-950">
  ₹{pricingSnapshot.serviceFee.toLocaleString("en-IN")}
</span>
  </div>

{pricingSnapshot.taxesAndFees > 0 && (
  <div className="flex items-start justify-between gap-3">
    <span className="font-semibold text-gray-600">
      Taxes & Charges
    </span>

    <span className="font-extrabold text-gray-950">
      ₹{pricingSnapshot.taxesAndFees.toLocaleString("en-IN")}
    </span>
  </div>
)}

  {offerDiscount > 0 && (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2">
      <span className="max-w-[160px] truncate text-xs font-extrabold text-green-700">
        {offerCode} Applied
      </span>

      <span className="text-xs font-extrabold text-green-700">
        -₹{offerDiscount.toLocaleString("en-IN")}
      </span>
    </div>
  )}

  <div className="border-t border-gray-300 pt-3">
    <div className="flex items-start justify-between gap-3 text-xl font-extrabold text-gray-950">
      <span>{offerDiscount > 0 ? "Payable" : "Total"}</span>

      <span>
        ₹{payableTotal.toLocaleString("en-IN")}
      </span>
    </div>

    <p className="mt-1 break-words text-[11px] font-medium leading-4 text-gray-600">
      Includes embassy, visa processing and applicable charges.
    </p>
  </div>
</div>

          <button
            type="button"
            onClick={handleApplyNow}
            className="mt-5 min-h-12 w-full rounded-xl bg-orange-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-orange-700"
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
}
