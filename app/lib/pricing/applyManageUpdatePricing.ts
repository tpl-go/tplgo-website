export type ManageUpdatePricingInput = {
  updateAmount: number;
  refundWallet?: number;
};

export type ManageUpdatePricingResult = {
  updateAmount: number;

  promoUsed: 0;
  earnedUsed: 0;
  tplCreditUsed: 0;

  refundUsed: number;
  finalPayable: number;

  earnedOnThisUpdate: 0;
};

function safeAmount(value?: number) {
  return Math.max(Number(value || 0), 0);
}

export function applyManageUpdatePricing(
  input: ManageUpdatePricingInput
): ManageUpdatePricingResult {
  const updateAmount = Math.round(
    safeAmount(input.updateAmount)
  );

  const refundUsed = Math.floor(
    Math.min(
      safeAmount(input.refundWallet),
      updateAmount
    )
  );

  const finalPayable = Math.max(
    Math.round(updateAmount - refundUsed),
    0
  );

  return {
    updateAmount,

    promoUsed: 0,
    earnedUsed: 0,
    tplCreditUsed: 0,

    refundUsed,
    finalPayable,

    earnedOnThisUpdate: 0,
  };
}