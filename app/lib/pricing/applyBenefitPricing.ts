export type BenefitPricingInput = {
  baseAmount: number;

  taxes?: number;
  addOns?: number;
  fees?: number;

  seatCharges?: number;
  mealCharges?: number;
  baggageCharges?: number;
  insuranceCharges?: number;
  cabCharges?: number;
  visaCharges?: number;
  gatewayCharges?: number;
  convenienceFee?: number;
  upgradeCharges?: number;
  markup?: number;

  offerDiscount?: number;

  promoCredit?: number;
  earnedCredit?: number;
  refundWallet?: number;
};

export type BenefitPricingResult = {
  baseAmount: number;

  taxes: number;
  addOns: number;
  fees: number;

  seatCharges: number;
  mealCharges: number;
  baggageCharges: number;
  insuranceCharges: number;
  cabCharges: number;
  visaCharges: number;
  gatewayCharges: number;
  convenienceFee: number;
  upgradeCharges: number;
  markup: number;

  nonBenefitAmount: number;
  grossAmount: number;

  offerDiscount: number;
  baseAfterOffer: number;

  promoUsed: number;
  earnedUsed: number;
  tplCreditUsed: number;

  baseAfterTplCredit: number;

  payableBeforeRefundWallet: number;

  refundUsed: number;
  finalPayable: number;
};

function safeAmount(value?: number) {
  return Math.max(Number(value || 0), 0);
}

export function applyBenefitPricing(
  input: BenefitPricingInput
): BenefitPricingResult {
  const baseAmount = Math.round(
    safeAmount(input.baseAmount)
  );

  const taxes = Math.round(
    safeAmount(input.taxes)
  );

  const addOns = Math.round(
    safeAmount(input.addOns)
  );

  const fees = Math.round(
    safeAmount(input.fees)
  );

  const seatCharges = Math.round(
    safeAmount(input.seatCharges)
  );

  const mealCharges = Math.round(
    safeAmount(input.mealCharges)
  );

  const baggageCharges = Math.round(
    safeAmount(input.baggageCharges)
  );

  const insuranceCharges = Math.round(
    safeAmount(input.insuranceCharges)
  );

  const cabCharges = Math.round(
    safeAmount(input.cabCharges)
  );

  const visaCharges = Math.round(
    safeAmount(input.visaCharges)
  );

  const gatewayCharges = Math.round(
    safeAmount(input.gatewayCharges)
  );

  const convenienceFee = Math.round(
    safeAmount(input.convenienceFee)
  );

  const upgradeCharges = Math.round(
    safeAmount(input.upgradeCharges)
  );

  const markup = Math.round(
    safeAmount(input.markup)
  );

  const nonBenefitAmount =
    taxes +
    addOns +
    fees +
    seatCharges +
    mealCharges +
    baggageCharges +
    insuranceCharges +
    cabCharges +
    visaCharges +
    gatewayCharges +
    convenienceFee +
    upgradeCharges +
    markup;

  const grossAmount = Math.round(
    baseAmount + nonBenefitAmount
  );

  // =====================================================
  // OFFER → ONLY ON BASE
  // =====================================================

  const offerDiscount = Math.round(
    Math.min(
      safeAmount(input.offerDiscount),
      baseAmount
    )
  );

  const baseAfterOffer = Math.max(
    Math.round(baseAmount - offerDiscount),
    0
  );

  // =====================================================
  // PROMO CREDIT → ONLY ON BASE AFTER OFFER
  // MAX 5%
  // =====================================================

  const promoCap = Math.floor(
    baseAfterOffer * 0.05
  );

  const promoUsed = Math.floor(
    Math.min(
      safeAmount(input.promoCredit),
      promoCap
    )
  );

  // =====================================================
  // EARNED CREDIT → ONLY ON BASE AFTER OFFER
  // MAX 10%
  // =====================================================

  const earnedCap = Math.floor(
    baseAfterOffer * 0.1
  );

  const earnedUsed = Math.floor(
    Math.min(
      safeAmount(input.earnedCredit),
      earnedCap
    )
  );

  const tplCreditUsed =
    promoUsed + earnedUsed;

  const baseAfterTplCredit = Math.max(
    Math.round(
      baseAfterOffer - tplCreditUsed
    ),
    0
  );

  // =====================================================
  // REFUND WALLET → CAN APPLY ON FULL PAYABLE
  // =====================================================

  const payableBeforeRefundWallet = Math.round(
    baseAfterTplCredit +
      nonBenefitAmount
  );

  const refundUsed = Math.floor(
    Math.min(
      safeAmount(input.refundWallet),
      payableBeforeRefundWallet
    )
  );

  const finalPayable = Math.max(
    Math.round(
      payableBeforeRefundWallet -
        refundUsed
    ),
    0
  );

  return {
    baseAmount,

    taxes,
    addOns,
    fees,

    seatCharges,
    mealCharges,
    baggageCharges,
    insuranceCharges,
    cabCharges,
    visaCharges,
    gatewayCharges,
    convenienceFee,
    upgradeCharges,
    markup,

    nonBenefitAmount,
    grossAmount,

    offerDiscount,
    baseAfterOffer,

    promoUsed,
    earnedUsed,
    tplCreditUsed,

    baseAfterTplCredit,

    payableBeforeRefundWallet,

    refundUsed,
    finalPayable,
  };
}