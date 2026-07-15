import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Building2,
  CalendarCheck2,
  Camera,
  CircleUserRound,
  Crown,
  Gem,
  Globe2,
  Layers3,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  UsersRound,
  WalletCards,
  Zap,
} from "lucide-react";

export type BillingCycle = "monthly" | "yearly";
export type PlanKey = "free" | "individual" | "creator" | "business" | "agency" | "enterprise";

export interface CreatorPlan {
  key: PlanKey;
  name: string;
  description: string;
  monthlyPrice: number | null;
  yearlyMonthlyPrice: number | null;
  badge?: string;
  icon: LucideIcon;
  tone: "slate" | "blue" | "violet" | "cyan" | "amber" | "navy";
  features: string[];
  cta: string;
}

export interface PlanComparisonRow {
  feature: string;
  free: string | boolean;
  individual: string | boolean;
  creator: string | boolean;
  business: string | boolean;
  agency: string | boolean;
  enterprise: string | boolean;
}

export const plansHeroStats = [
  { value: "195K+", label: "Creators" },
  { value: "2.8M+", label: "Premium Assets" },
  { value: "50+", label: "Countries" },
];

export const plansHeroTrust = [
  { label: "Cancel Anytime", icon: CalendarCheck2 },
  { label: "Instant Access", icon: Zap },
  { label: "Secure & Trusted", icon: ShieldCheck },
];

export const creatorPlans: CreatorPlan[] = [
  { key: "free", name: "Free Preview", description: "Explore the marketplace and preview the licensing experience.", monthlyPrice: 0, yearlyMonthlyPrice: 0, icon: Sparkles, tone: "slate", features: ["Marketplace previews", "Curated collections", "Watermarked previews", "License education"], cta: "Start Exploring" },
  { key: "individual", name: "Individual", description: "Premium assets for independent creators and professionals.", monthlyPrice: 999, yearlyMonthlyPrice: 799, icon: CircleUserRound, tone: "blue", features: ["25 downloads / month", "Standard License", "Personal collections", "Commercial digital use", "Email support"], cta: "Choose Individual" },
  { key: "creator", name: "Creator", description: "Create, license, upload and grow from one professional workspace.", monthlyPrice: 1999, yearlyMonthlyPrice: 1599, badge: "MOST POPULAR", icon: Camera, tone: "violet", features: ["60 downloads / month", "Standard License", "Creator Studio access", "Upload & sell assets", "Creator analytics", "Priority support"], cta: "Choose Creator" },
  { key: "business", name: "Business", description: "Commercial assets and workflows for growing business teams.", monthlyPrice: 1999, yearlyMonthlyPrice: 1599, icon: Building2, tone: "cyan", features: ["75 downloads / month", "Standard License", "Selected Extended rights", "3 team members", "Shared collections", "Business support"], cta: "Choose Business" },
  { key: "agency", name: "Agency", description: "High-volume licensing for agencies and multi-client teams.", monthlyPrice: 9999, yearlyMonthlyPrice: 7999, icon: UsersRound, tone: "amber", features: ["400 downloads / month", "Standard + Extended", "10 team members", "Client project coverage", "Priority support", "Advanced analytics"], cta: "Choose Agency" },
  { key: "enterprise", name: "Enterprise", description: "Custom rights, governance and service for large organizations.", monthlyPrice: null, yearlyMonthlyPrice: null, icon: Crown, tone: "navy", features: ["Custom download volumes", "Enterprise rights", "Unlimited team options", "Dedicated manager", "Custom SLA", "Guided onboarding"], cta: "Contact Sales" },
];

export const planComparisonRows: PlanComparisonRow[] = [
  { feature: "Downloads", free: "Preview", individual: "25 / mo", creator: "60 / mo", business: "75 / mo", agency: "400 / mo", enterprise: "Custom" },
  { feature: "Standard License", free: false, individual: true, creator: true, business: true, agency: true, enterprise: true },
  { feature: "Extended License", free: false, individual: false, creator: false, business: "Selected", agency: true, enterprise: "Custom" },
  { feature: "Sell Assets", free: false, individual: false, creator: true, business: false, agency: false, enterprise: "Optional" },
  { feature: "Creator Studio", free: false, individual: false, creator: true, business: false, agency: false, enterprise: "Optional" },
  { feature: "Collections", free: "Browse", individual: "Personal", creator: "Personal", business: "Shared", agency: "Shared", enterprise: "Managed" },
  { feature: "Upload Content", free: false, individual: false, creator: true, business: false, agency: false, enterprise: "Optional" },
  { feature: "Creator Analytics", free: false, individual: false, creator: true, business: false, agency: "Advanced", enterprise: "Custom" },
  { feature: "Priority Support", free: false, individual: false, creator: true, business: true, agency: true, enterprise: true },
  { feature: "Dedicated Manager", free: false, individual: false, creator: false, business: false, agency: false, enterprise: true },
  { feature: "Team Members", free: "1", individual: "1", creator: "1", business: "3", agency: "10", enterprise: "Custom" },
  { feature: "Commercial Usage", free: false, individual: true, creator: true, business: true, agency: true, enterprise: true },
  { feature: "Enterprise Rights", free: false, individual: false, creator: false, business: false, agency: false, enterprise: true },
  { feature: "SLA", free: false, individual: false, creator: false, business: false, agency: "Priority", enterprise: "Custom" },
  { feature: "Onboarding", free: "Self serve", individual: "Self serve", creator: "Guided help", business: "Guided help", agency: "Priority", enterprise: "Dedicated" },
];

export const plansInclude = [
  { title: "Commercial License", description: "Clear usage terms for approved creative work.", icon: BadgeCheck },
  { title: "High Quality Assets", description: "Premium photos, footage, templates and resources.", icon: Gem },
  { title: "Secure Licensing", description: "Documented rights and protected marketplace access.", icon: LockKeyhole },
  { title: "Global Coverage", description: "Create and publish for audiences around the world.", icon: Globe2 },
  { title: "Creator Protection", description: "Respectful rights designed around creator ownership.", icon: ShieldCheck },
  { title: "Cancel Anytime", description: "Flexible preview plans without purchase execution here.", icon: CalendarCheck2 },
  { title: "Transparent Pricing", description: "Simple plan limits and clearly presented inclusions.", icon: WalletCards },
  { title: "Trusted Marketplace", description: "A curated ecosystem for professional creative work.", icon: Store },
];

export const plansTrust = [
  { title: "Ratings & reviews", description: "Asset-level quality signals remain visible before licensing.", icon: Star },
  { title: "Trusted by creators", description: "Tools for discovery, licensing, uploads and portfolio growth.", icon: Camera },
  { title: "Built for agencies", description: "Multi-client workflows, broader rights and team access.", icon: UsersRound },
  { title: "Premium content", description: "Curated travel media and production-ready creative assets.", icon: Layers3 },
  { title: "Secure payments", description: "Payment execution is disabled in this preview phase.", icon: LockKeyhole },
  { title: "Global customers", description: "Licensing guidance designed for international creative teams.", icon: Globe2 },
];

export const plansFaqs = [
  ["Can I upgrade later?", "Yes. The planned subscription experience supports moving to a higher tier when your download, licensing or team needs grow."],
  ["Can I downgrade my plan?", "Downgrade rules will be presented before a future billing change. No subscription mutation is active in this phase."],
  ["What happens to unused downloads?", "Rollover behavior depends on the final subscription policy and will be confirmed before commerce is enabled."],
  ["Does every paid plan allow commercial usage?", "Individual and higher plans include Standard commercial licensing for eligible assets. Broader uses may need Extended or Enterprise rights."],
  ["Which plans include Extended License rights?", "Agency includes Extended rights, Business includes selected broader rights, and Enterprise is tailored. Always review the issued asset license."],
  ["Are refunds available?", "Refund terms will follow the published refund policy once subscription purchasing is enabled. No payment occurs on this page."],
  ["Who should choose Enterprise?", "Large organizations, tourism boards, hotel groups, media houses and government teams needing custom volumes, rights, support or SLAs."],
  ["Can I upload assets with every plan?", "Upload and selling tools are designed for the Creator plan. Enterprise access may be configured by agreement."],
  ["Can I sell my own assets?", "The Creator plan includes access to Creator Studio workflows, subject to onboarding and marketplace review."],
  ["Which plan is best for agencies?", "Agency is designed for multi-client work, higher monthly volume, team access and broader licensing."],
  ["Is the billing toggle charging me?", "No. Monthly and Yearly only change preview prices in this UI phase."],
  ["How much can I save yearly?", "Displayed yearly preview prices are up to 20% lower than equivalent monthly preview pricing."],
  ["Can team members share downloads?", "Business, Agency and Enterprise tiers are structured for team workflows within the named organization and applicable license terms."],
  ["Are downloaded assets mine forever?", "You receive usage rights under the issued license, not ownership of the creator's copyright or source asset."],
  ["Can I use assets for client projects?", "Yes, when the plan and asset license cover the intended client use. Agency is optimized for ongoing multi-client work."],
  ["Do plans include license certificates?", "Eligible licensed downloads are intended to include digital license records when commerce is enabled."],
  ["Can I cancel anytime?", "The planned service supports flexible cancellation. Final timing and access rules will be shown before purchasing is activated."],
  ["Is there a free trial?", "Free Preview lets you explore the marketplace and licensing experience without enabling paid downloads."],
  ["What support is included?", "Support ranges from standard email help to priority service and a dedicated Enterprise manager."],
  ["Can tourism boards request custom rights?", "Yes. Tourism, government, broadcast and large campaign requirements are handled through Enterprise sales."],
];

export const enterpriseAudiences = ["Large organizations", "Tourism boards", "Media houses", "Hotel groups", "Government projects"];

export const comparisonKeys: PlanKey[] = ["free", "individual", "creator", "business", "agency", "enterprise"];
