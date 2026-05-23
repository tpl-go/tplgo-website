export function applyWallet({
  totalAmount,
  tplPromo,
  tplEarned,
  refundWallet,
}: {
  totalAmount: number;
  tplPromo: number;
  tplEarned: number;
  refundWallet: number;
}) {
  const amount = Number(totalAmount || 0);

  if (amount < 0) {
    return {
      promoUsed: 0,
      earnedUsed: 0,
      refundUsed: 0,
      refundCredit: Math.abs(amount),
      finalPayable: 0,
      settlementMode: "wallet_credit" as const,
    };
  }

  if (amount === 0) {
    return {
      promoUsed: 0,
      earnedUsed: 0,
      refundUsed: 0,
      refundCredit: 0,
      finalPayable: 0,
      settlementMode: "save" as const,
    };
  }

  const promoCap = amount * 0.05;
  const earnedCap = amount * 0.1;
  const combinedCap = amount * 0.12;

  const promoUsed = Math.min(promoCap, Number(tplPromo || 0));

  const earnedUsed = Math.min(
    earnedCap,
    Number(tplEarned || 0),
    Math.max(combinedCap - promoUsed, 0)
  );

  const remainingAfterTpl = Math.max(amount - promoUsed - earnedUsed, 0);

  const refundUsed = Math.min(Number(refundWallet || 0), remainingAfterTpl);

  const finalPayable = Math.max(remainingAfterTpl - refundUsed, 0);

  return {
    promoUsed,
    earnedUsed,
    refundUsed,
    refundCredit: 0,
    finalPayable,
    settlementMode: "payment" as const,
  };
}