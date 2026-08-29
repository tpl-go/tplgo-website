export type LoginPromoContext = "user_login" | "partner_login";

export type LoginPromoContent = {
  context: LoginPromoContext;
  desktopImage: string;
  mobileImage?: string;
  eyebrow: string;
  headline: string;
  highlightedText: string;
  subtitle: string;
  benefits: [string, string, string, string];
  footerTrustLine: string;
  active: boolean;
};

const DEFAULT_LOGIN_PROMO_CONTENT: Record<LoginPromoContext, LoginPromoContent> = {
  user_login: {
    context: "user_login",
    desktopImage: "/themes/banners/culture-2.jpg",
    mobileImage: "/themes/banners/culture-2.jpg",
    eyebrow: "Travel smarter",
    headline: "Your trips stay",
    highlightedText: "together",
    subtitle: "Access bookings, travellers, wallet, and trip support from one TPL GO identity.",
    benefits: [
      "Faster booking checkout",
      "Saved travellers and trips",
      "Wallet and refund tracking",
      "One account across TPL GO",
    ],
    footerTrustLine: "Secure OTP login powered by the TPL identity layer.",
    active: true,
  },
  partner_login: {
    context: "partner_login",
    desktopImage: "/experiences/adventure.jpg",
    mobileImage: "/experiences/adventure.jpg",
    eyebrow: "Partner with TPL GO",
    headline: "Grow your business",
    highlightedText: "together",
    subtitle: "Use Partner Desk to manage your organization, verification, services, and readiness.",
    benefits: [
      "Grow your reach",
      "Manage partner opportunities",
      "Service-aware verification",
      "Dedicated partner support",
    ],
    footerTrustLine: "Same TPL identity. No separate Partner credentials.",
    active: true,
  },
};

export function getLoginPromoContent(context: LoginPromoContext): LoginPromoContent {
  const configured = DEFAULT_LOGIN_PROMO_CONTENT[context];
  if (configured.active) return configured;
  return DEFAULT_LOGIN_PROMO_CONTENT.user_login;
}

export const loginPromoContentAdminSchema = {
  contexts: ["user_login", "partner_login"] as const,
  editableFields: [
    "desktopImage",
    "mobileImage",
    "eyebrow",
    "headline",
    "highlightedText",
    "subtitle",
    "benefits",
    "footerTrustLine",
    "active",
  ] as const,
  lockedSecurityFields: [
    "authenticationRoutes",
    "otpProvider",
    "rbac",
    "apiBase",
    "loginPermissions",
    "securityRules",
  ] as const,
};
