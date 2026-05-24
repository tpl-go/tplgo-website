"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Sparkles,
  CheckCircle2,
  Wallet,
  Crown,
  ArrowRight,
} from "lucide-react";

import {
  SmartOfferItem,
  activateAndBuildSmartOfferUrl,
} from "@/app/lib/smartOffers";

type Props = {
  offer: SmartOfferItem | null;
  open: boolean;
  onClose: () => void;
};

export default function SmartOfferActivationModal({
  offer,
  open,
  onClose,
}: Props) {
  const router = useRouter();

  const activation = useMemo(() => {
    if (!offer) return null;

    let estimatedSaving = 0;

    if (offer.discountMode === "flat") {
      estimatedSaving = Number(offer.discountValue || 0);
    } else if (offer.discountMode === "percent") {
      estimatedSaving = Number(offer.maxDiscount || offer.discountValue || 0);
    } else {
      estimatedSaving = Number(offer.discountValue || 0);
    }

    return {
      message:
        offer.discountMode === "percent"
          ? `${offer.discountValue}% savings activated`
          : `₹${estimatedSaving.toLocaleString("en-IN")} discount activated`,
      estimatedSaving,
    };
  }, [offer]);

  if (!open || !offer || !activation) return null;

  const handleContinue = () => {
    const redirectUrl = activateAndBuildSmartOfferUrl(offer);

    onClose();
    router.push(redirectUrl);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-3 py-4 backdrop-blur-sm sm:px-4">
      <div className="relative flex max-h-[92vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl sm:rounded-[32px]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow hover:bg-gray-100 sm:right-5 sm:top-5 sm:h-10 sm:w-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="shrink-0 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 p-5 text-white sm:p-6">
          <div className="flex items-center gap-2 text-xs font-semibold sm:text-sm">
            <Sparkles className="h-5 w-5" />
            AI Offer Activated
          </div>

          <h2 className="mt-3 pr-10 text-xl font-bold leading-snug sm:text-2xl">
            {offer.title}
          </h2>

          {offer.subtitle && (
            <p className="mt-2 text-xs text-white/90 sm:text-sm">
              {offer.subtitle}
            </p>
          )}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:space-y-5 sm:p-6">
          <div className="rounded-3xl border border-orange-100 bg-orange-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />

              <div>
                <div className="text-sm font-bold text-gray-900">
                  {activation.message}
                </div>

                <div className="mt-1 text-sm leading-6 text-gray-600">
                  Estimated saving:{" "}
                  <span className="font-bold text-green-700">
                    ₹{activation.estimatedSaving.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <Wallet className="h-5 w-5 text-orange-600" />

              <div className="mt-2 text-sm font-bold text-gray-900">
                Wallet Stack
              </div>

              <div className="mt-1 text-xs text-gray-500">
                {offer.stackableWithWallet
                  ? "TPL Credit supported"
                  : "Not available"}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <Crown className="h-5 w-5 text-orange-600" />

              <div className="mt-2 text-sm font-bold text-gray-900">
                Membership
              </div>

              <div className="mt-1 text-xs text-gray-500">
                {offer.stackableWithMembership
                  ? "Privilege benefits supported"
                  : "Standard offer"}
              </div>
            </div>
          </div>

          {offer.couponCode && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-orange-300 bg-white px-4 py-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-gray-500">
                  Coupon Code
                </div>

                <div className="truncate text-base font-black tracking-widest text-orange-600 sm:text-lg">
                  {offer.couponCode}
                </div>
              </div>

              <div className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                Auto Apply
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleContinue}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
          >
            Continue with Offer
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="h-11 w-full rounded-2xl bg-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-200"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}