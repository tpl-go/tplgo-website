import type { CreatorUnifiedAccountSectionKey } from "./creatorCatalogTypes";

export const creatorUnifiedAccountSections: Array<{
  key: CreatorUnifiedAccountSectionKey;
  label: string;
  purpose: string;
}> = [
  {
    key: "creator-purchases",
    label: "Creator Purchases",
    purpose: "Future paid Creator asset orders inside the existing shared TPL account.",
  },
  {
    key: "creator-downloads",
    label: "Creator Downloads",
    purpose: "Future secure download entitlements inside the existing shared TPL account.",
  },
  {
    key: "creator-licenses",
    label: "Creator Licenses",
    purpose: "Future license certificates and usage terms inside the existing shared TPL account.",
  },
  {
    key: "creator-refunds",
    label: "Creator Refunds",
    purpose: "Future Creator refund status inside the existing shared TPL account.",
  },
];

export const creatorUnifiedAccountRule = {
  accountRoot: "/account",
  separateCustomerAccountAllowed: false,
  separateAuthAllowed: false,
  separateWalletAllowed: false,
  professionalWorkspaceRoot: "/creator",
};
