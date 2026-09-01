import { resolveCurrentTplApiTarget } from "@/app/lib/api/apiTargetResolver";

export type LoginPromoContext = "user_login" | "partner_login" | "partner_registration";

export type LoginPromoContent = {
  context: LoginPromoContext;
  brandMediaSlot: "auth_promo_brand_image";
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

export const DEFAULT_LOGIN_PROMO_CONTENT: Record<LoginPromoContext, LoginPromoContent> = {
  user_login: {
    context: "user_login",
    brandMediaSlot: "auth_promo_brand_image",
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
      { title: "One Account", description: "Use TPL GO with less friction", tone: "violet" },
    ],
    footerTrustLine: "Secure sign-in for your TPL GO account.",
    active: true,
  },
  partner_login: {
    context: "partner_login",
    brandMediaSlot: "auth_promo_brand_image",
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
      { title: "Clear Setup", description: "Complete each service at the right step", tone: "amber" },
      { title: "Dedicated Support", description: "Get help when needed", tone: "violet" },
    ],
    footerTrustLine: "One account. Easy Partner access.",
    active: true,
  },
  partner_registration: {
    context: "partner_registration",
    brandMediaSlot: "auth_promo_brand_image",
    brandLogoImage: "/logo.png",
    brandLabel: "TPL GO",
    desktopImage: "/experiences/adventure.jpg",
    mobileImage: "/experiences/adventure.jpg",
    eyebrow: "Start Partner Registration",
    headline: "Bring your service",
    highlightedText: "online",
    subtitle: "Register basic details first. Full verification continues in Partner Desk.",
    benefits: [
      { title: "Simple Entry", description: "Start with essential business details", tone: "sky" },
      { title: "Verified Contact", description: "Use a service mobile for OTP", tone: "emerald" },
      { title: "Admin Review", description: "Applications enter the Partner queue", tone: "amber" },
      { title: "Multiple Services", description: "Add more scopes in Partner Desk", tone: "violet" },
    ],
    footerTrustLine: "Your service goes live only after review and setup.",
    active: true,
  },
};

export function getLoginPromoContent(context: LoginPromoContext): LoginPromoContent {
  const configured = DEFAULT_LOGIN_PROMO_CONTENT[context];
  if (configured.active) return configured;
  return DEFAULT_LOGIN_PROMO_CONTENT.user_login;
}

type WebsiteExperiencePublicResponse = {
  contexts?: Partial<Record<LoginPromoContext, Partial<LoginPromoContent>>>;
};

const API_TARGET = resolveCurrentTplApiTarget();

export async function fetchPublishedLoginPromoContent(context: LoginPromoContext): Promise<LoginPromoContent | null> {
  if (!API_TARGET.baseUrl) return null;
  try {
    const response = await fetch(`${API_TARGET.baseUrl}/api/v1/content/website-experience/login-signup`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const payload = await response.json();
    const data = payload?.ok === true ? payload.data as WebsiteExperiencePublicResponse : null;
    const configured = data?.contexts?.[context];
    return configured ? normalizeLoginPromoContent(context, configured) : null;
  } catch {
    return null;
  }
}

export function normalizeLoginPromoContent(
  context: LoginPromoContext,
  input: Partial<LoginPromoContent>
): LoginPromoContent {
  const fallback = DEFAULT_LOGIN_PROMO_CONTENT[context];
  return {
    ...fallback,
    ...input,
    context,
    brandMediaSlot: "auth_promo_brand_image",
    brandLogoImage: safeMediaUrl(input.brandLogoImage, fallback.brandLogoImage),
    desktopImage: safeMediaUrl(input.desktopImage, fallback.desktopImage) || fallback.desktopImage,
    mobileImage: safeMediaUrl(input.mobileImage, fallback.mobileImage),
    benefits: normalizeBenefits(input.benefits, fallback.benefits),
    active: typeof input.active === "boolean" ? input.active : fallback.active,
  };
}

function normalizeBenefits(
  benefits: LoginPromoContent["benefits"] | undefined,
  fallback: LoginPromoContent["benefits"]
): LoginPromoContent["benefits"] {
  if (!Array.isArray(benefits)) return fallback;
  return fallback.map((fallbackBenefit, index) => {
    const value = benefits[index];
    return {
      title: value?.title || fallbackBenefit.title,
      description: value?.description || fallbackBenefit.description,
      tone: value?.tone || fallbackBenefit.tone,
    };
  }) as LoginPromoContent["benefits"];
}

function safeMediaUrl(value: string | undefined, fallback?: string): string | undefined {
  if (!value) return fallback;
  if (!value.startsWith("/") && !value.startsWith("https://")) return fallback;
  const path = value.split("?")[0]?.toLowerCase() || "";
  if (![".png", ".jpg", ".jpeg", ".webp"].some((extension) => path.endsWith(extension))) return fallback;
  return value;
}

export const loginPromoContentAdminSchema = {
  contexts: ["user_login", "partner_login", "partner_registration"] as const,
  editableFields: [
    "brandMediaSlot",
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
