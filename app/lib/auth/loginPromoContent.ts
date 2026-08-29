export type LoginPromoContext = "user_login" | "partner_login";

export type LoginPromoContent = {
  context: LoginPromoContext;
  brandLogoImage?: string;
  brandLabel: string;
  desktopImage: string;
  mobileImage?: string;
  eyebrow: string;
  headline: string;
  highlightedText: string;
  subtitle: string;
  benefits: [
    { title: string; description: string; tone: "sky" | "emerald" | "amber" | "violet" },
    { title: string; description: string; tone: "sky" | "emerald" | "amber" | "violet" },
    { title: string; description: string; tone: "sky" | "emerald" | "amber" | "violet" },
    { title: string; description: string; tone: "sky" | "emerald" | "amber" | "violet" }
  ];
  footerTrustLine: string;
  active: boolean;
};

const DEFAULT_LOGIN_PROMO_CONTENT: Record<LoginPromoContext, LoginPromoContent> = {
  user_login: {
    context: "user_login",
    brandLogoImage: "/logo.png",
    brandLabel: "TPL GO",
    desktopImage: "/hero-bg.jpg",
    mobileImage: "/hero-bg.jpg",
    eyebrow: "Travel smarter",
    headline: "Your trips stay",
    highlightedText: "together",
    subtitle: "Access bookings, travellers, wallet, and support from one account.",
    benefits: [
      { title: "Faster Checkout", description: "Use saved traveller details", tone: "sky" },
      { title: "Trip Records", description: "Find bookings and journeys", tone: "emerald" },
      { title: "Wallet Tracking", description: "View eligible wallet activity", tone: "amber" },
      { title: "One TPL Identity", description: "One account across TPL GO", tone: "violet" },
    ],
    footerTrustLine: "Secure OTP login powered by the TPL identity layer.",
    active: true,
  },
  partner_login: {
    context: "partner_login",
    brandLogoImage: "/logo.png",
    brandLabel: "TPL GO",
    desktopImage: "/experiences/adventure.jpg",
    mobileImage: "/experiences/adventure.jpg",
    eyebrow: "Partner with TPL GO",
    headline: "Grow your business",
    highlightedText: "together",
    subtitle: "Manage your organization, verification, services, and readiness.",
    benefits: [
      { title: "Grow Your Reach", description: "Reach more travellers and customers", tone: "sky" },
      { title: "Partner Opportunities", description: "Manage enquiries and readiness", tone: "emerald" },
      { title: "Service-aware Setup", description: "Keep services on separate paths", tone: "amber" },
      { title: "Dedicated Support", description: "Get help when needed", tone: "violet" },
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
    "brandLogoImage",
    "brandLabel",
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
