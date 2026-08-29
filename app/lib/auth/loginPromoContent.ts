export type LoginPromoContext = "user_login" | "partner_login";

export type LoginPromoContent = {
  context: LoginPromoContext;
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
    desktopImage: "/hero-bg.jpg",
    mobileImage: "/hero-bg.jpg",
    eyebrow: "Travel smarter",
    headline: "Your trips stay",
    highlightedText: "together",
    subtitle: "Access bookings, travellers, wallet, and trip support from one TPL GO identity.",
    benefits: [
      { title: "Faster Checkout", description: "Continue bookings with saved traveller details", tone: "sky" },
      { title: "Trip Records", description: "Access bookings and upcoming journeys", tone: "emerald" },
      { title: "Wallet Tracking", description: "View eligible wallet and refund activity", tone: "amber" },
      { title: "One TPL Identity", description: "Use one account across TPL GO", tone: "violet" },
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
      { title: "Grow Your Reach", description: "Reach more travellers and customers", tone: "sky" },
      { title: "Real-time Opportunities", description: "Manage partner enquiries and readiness", tone: "emerald" },
      { title: "Service-aware Setup", description: "Keep each selected service on its own path", tone: "amber" },
      { title: "Dedicated Support", description: "Get help when your team needs it", tone: "violet" },
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
