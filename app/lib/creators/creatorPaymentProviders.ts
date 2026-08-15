import type { CreatorPaymentProvider, CreatorPaymentProviderContract } from "./creatorPaymentTypes";

const providerNames: Record<CreatorPaymentProvider, string> = {
  stripe: "Stripe",
  razorpay: "Razorpay",
  cashfree: "Cashfree",
  paypal: "PayPal",
  manual: "Manual Review",
  mock: "TPL Mock Provider",
};

export function getCreatorPaymentProviderContract(provider: CreatorPaymentProvider): CreatorPaymentProviderContract {
  return {
    provider,
    displayName: providerNames[provider],
    uppCompatible: true,
    sdkRequired: false,
    apiCallAllowed: false,
    credentialRequired: false,
    redirectAllowed: false,
    captureAllowed: false,
    refundAllowed: false,
    metadata: {
      hiddenMode: true,
      providerAbstractionOnly: true,
      uppAdapterReady: true,
    },
  };
}

export function listCreatorPaymentProviderContracts() {
  return (Object.keys(providerNames) as CreatorPaymentProvider[]).map((provider) => getCreatorPaymentProviderContract(provider));
}
