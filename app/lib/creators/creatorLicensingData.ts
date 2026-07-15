import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Ban,
  Building2,
  CheckCircle2,
  FileBadge2,
  FileCheck2,
  Globe2,
  Image,
  Landmark,
  Megaphone,
  MonitorPlay,
  PackageCheck,
  Presentation,
  Radio,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  UserCheck,
  Users,
  Youtube,
} from "lucide-react";

export type LicenseKey = "standard" | "extended" | "enterprise";

export interface CreatorLicenseTier {
  key: LicenseKey;
  name: string;
  badge: string;
  description: string;
  color: "blue" | "gold" | "purple";
  suitableFor: string[];
  highlight: string;
}

export interface ComparisonRow {
  feature: string;
  standard: boolean | string;
  extended: boolean | string;
  enterprise: boolean | string;
}

export interface LicensingInfoCard {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: string;
}

export const licensingHeroStats = [
  { value: "195K+", label: "Creators" },
  { value: "2.8M+", label: "Premium Assets" },
  { value: "50+", label: "Countries" },
];

export const licensingTrustItems = [
  { label: "Instant Digital License", icon: FileCheck2 },
  { label: "Global Validity", icon: Globe2 },
  { label: "Secure & Trusted", icon: ShieldCheck },
  { label: "Creator Protection", icon: UserCheck },
];

export const creatorLicenseTiers: CreatorLicenseTier[] = [
  {
    key: "standard",
    name: "Standard License",
    badge: "Included in most plans",
    description: "Everyday digital publishing rights for creators, teams and client projects.",
    color: "blue",
    suitableFor: ["Website", "Social Media", "YouTube", "Blogs", "Client Work", "Certificate Included"],
    highlight: "Flexible digital use",
  },
  {
    key: "extended",
    name: "Extended License",
    badge: "Best for Commercial Use",
    description: "Broader commercial rights for high-reach campaigns and products for sale.",
    color: "gold",
    suitableFor: ["Advertising", "Broadcast", "Merchandise", "Packaging", "OTT", "TV"],
    highlight: "Commercial scale",
  },
  {
    key: "enterprise",
    name: "Enterprise License",
    badge: "Custom Solutions",
    description: "Negotiated protection, scale and support for complex global organizations.",
    color: "purple",
    suitableFor: ["Tourism Boards", "Hotel Chains", "Government", "Global Brands", "Exclusive Usage", "Large Campaigns"],
    highlight: "Tailored global rights",
  },
];

export const licenseComparisonRows: ComparisonRow[] = [
  { feature: "Commercial Use", standard: true, extended: true, enterprise: true },
  { feature: "Editorial Use", standard: true, extended: true, enterprise: true },
  { feature: "Client Projects", standard: "Limited", extended: true, enterprise: true },
  { feature: "Unlimited Digital", standard: true, extended: true, enterprise: true },
  { feature: "Merchandise", standard: false, extended: true, enterprise: true },
  { feature: "Packaging", standard: false, extended: true, enterprise: true },
  { feature: "TV", standard: false, extended: true, enterprise: true },
  { feature: "OTT", standard: false, extended: true, enterprise: true },
  { feature: "Broadcast", standard: false, extended: true, enterprise: true },
  { feature: "Unlimited Prints", standard: false, extended: "Expanded", enterprise: true },
  { feature: "Outdoor", standard: false, extended: true, enterprise: true },
  { feature: "Billboards", standard: false, extended: true, enterprise: true },
  { feature: "Redistribution", standard: false, extended: false, enterprise: "By agreement" },
  { feature: "Exclusive Rights", standard: false, extended: false, enterprise: "Optional" },
  { feature: "License Certificate", standard: true, extended: true, enterprise: true },
  { feature: "Priority Support", standard: false, extended: "Business hours", enterprise: "Dedicated" },
];

export const rightsOverview: LicensingInfoCard[] = [
  { title: "Allowed Uses", description: "Publish across approved digital, editorial and client channels with clear usage rights.", icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700" },
  { title: "Restricted Uses", description: "Understand resale, redistribution, harmful-use and identity restrictions before publishing.", icon: Ban, tone: "bg-rose-50 text-rose-700" },
  { title: "Model Release", description: "Confirm whether recognizable people are cleared for commercial or editorial use.", icon: UserCheck, tone: "bg-blue-50 text-blue-700" },
  { title: "Property Release", description: "Review permissions for private locations, architecture, artwork and branded interiors.", icon: Building2, tone: "bg-amber-50 text-amber-700" },
  { title: "License Certificate", description: "Keep a verifiable digital record connecting the asset, buyer, creator and license.", icon: FileBadge2, tone: "bg-violet-50 text-violet-700" },
  { title: "Commercial Workflow", description: "Move from asset selection to documented commercial use through a transparent process.", icon: ShieldCheck, tone: "bg-cyan-50 text-cyan-700" },
];

export const allowedUses = [
  { label: "Website", icon: Globe2 }, { label: "Instagram", icon: Smartphone },
  { label: "Facebook", icon: Users }, { label: "YouTube", icon: Youtube },
  { label: "Presentations", icon: Presentation }, { label: "Travel Blog", icon: Image },
  { label: "Client Project", icon: BadgeCheck }, { label: "Email Campaign", icon: Megaphone },
  { label: "Digital Ads", icon: MonitorPlay },
];

export const restrictedUses = [
  "Trademark resale", "Logo resale", "Redistribution", "Stock resale", "NFT resale",
  "Pornographic usage", "Deepfake misuse", "Illegal usage", "Hate speech", "Counterfeit products",
];

export const releaseSections = {
  model: {
    eyebrow: "People & identity",
    title: "Model Release",
    description: "A model release records a recognizable person's permission for specified commercial uses. Always check the asset details before using people photography in advertising.",
    icon: UserCheck,
    points: ["Model Release Available", "Commercial Use", "Editorial Only", "People Photography", "Portrait Licensing"],
  },
  property: {
    eyebrow: "Places & creative property",
    title: "Property Release",
    description: "Private property, distinctive interiors and protected artwork may need additional permission. Release status remains visible with the licensed asset.",
    icon: Landmark,
    points: ["Buildings", "Museums", "Hotels", "Resorts", "Private Property", "Artwork", "Architecture"],
  },
};

export const commercialWorkflow = [
  { label: "Asset", icon: Image }, { label: "License", icon: FileCheck2 },
  { label: "Purchase", icon: ShoppingBag }, { label: "Certificate", icon: FileBadge2 },
  { label: "Download", icon: PackageCheck }, { label: "Commercial Usage", icon: Radio },
];

export const licensingFaqs = [
  ["What is the difference between Standard and Extended?", "Standard supports common digital and client publishing. Extended adds broader advertising, broadcast, packaging, merchandise and high-volume commercial rights."],
  ["Can I use a licensed asset on YouTube?", "Yes, Standard typically covers published YouTube content when the asset is part of the production and not redistributed as a standalone file."],
  ["Can I use assets in digital advertising?", "Standard may cover limited digital promotion; larger paid campaigns should use Extended or an Enterprise agreement."],
  ["Do I need a model release?", "Commercial use of recognizable people generally requires an appropriate model release. Editorial-only assets must not be presented as commercial endorsements."],
  ["What is a property release?", "It documents permission associated with private property, protected interiors, artwork or other recognizable property where required."],
  ["Can I print merchandise for sale?", "Merchandise for resale requires an Extended or negotiated Enterprise license."],
  ["Can I use an asset on TV?", "TV, OTT and broadcast use requires Extended or Enterprise licensing unless the asset terms explicitly state otherwise."],
  ["Can I transfer my license?", "Licenses are generally issued to the named buyer or organization and cannot be transferred except under an approved Enterprise agreement."],
  ["Does every purchase include a certificate?", "Eligible purchases include a digital license record. This page shows only a preview; no certificate is generated here."],
  ["Can agencies license for clients?", "Yes, subject to the selected tier's client-project terms and the named end client being documented where required."],
  ["Can I edit or crop licensed assets?", "Reasonable creative edits are allowed when they do not misrepresent people, creators, locations or the asset's release status."],
  ["Are exclusive rights included?", "No. Exclusive or category-exclusive rights require a negotiated Enterprise license."],
  ["Can I resell the original file?", "No. Standalone resale, stock redistribution and source-file sharing are prohibited."],
  ["Can I use assets in a logo or trademark?", "No standard tier grants trademark ownership. Contact the licensing team for a custom review."],
  ["What does editorial only mean?", "Editorial-only content can illustrate newsworthy or factual subjects but cannot imply commercial endorsement."],
  ["How long does a license last?", "Duration depends on the issued license terms. Most completed uses remain covered, while new campaigns may require renewed rights."],
  ["Is global use included?", "Digital Standard and Extended licenses generally support global publishing, while territory-specific campaign terms may apply."],
  ["Do social media boosts count as advertising?", "Paid boosts and sponsored placements are advertising. Select the tier appropriate to campaign reach and spend."],
  ["Can government bodies license content?", "Yes. Government, tourism and public-sector use is handled through Enterprise licensing."],
  ["How do I request a custom license?", "Use the Contact Licensing Team preview below. No request is transmitted from this phase."],
];
