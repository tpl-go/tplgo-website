import type { LucideIcon } from "lucide-react";
import { BarChart3, BellRing, CircleDollarSign, CloudUpload, FolderKanban, Gauge, HelpCircle, Image, Landmark, LayoutDashboard, Library, MessageSquare, Scale, Settings, ShieldCheck, UploadCloud, WalletCards } from "lucide-react";

export interface StudioNavItem { href: string; label: string; icon: LucideIcon; badge?: string; }

export const studioNavigation: StudioNavItem[] = [
  { href: "/creator-studio", label: "Dashboard", icon: LayoutDashboard },
  { href: "/creator-studio/assets", label: "Assets", icon: Library },
  { href: "/creator-studio/uploads", label: "Uploads", icon: UploadCloud },
  { href: "/creator-studio/collections", label: "Collections", icon: FolderKanban },
  { href: "/creator-studio/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/creator-studio/revenue", label: "Revenue", icon: CircleDollarSign },
  { href: "/creator-studio/licenses", label: "Licenses", icon: Scale },
  { href: "/creator-studio/messages", label: "Messages", icon: MessageSquare, badge: "3" },
  { href: "/creator-studio/moderation", label: "Moderation", icon: ShieldCheck, badge: "2" },
  { href: "/creator-studio/payouts", label: "Payouts", icon: Landmark },
  { href: "/creator-studio/settings", label: "Settings", icon: Settings },
];

export const studioOverview = [
  { label: "Total Assets", value: "128", change: "+8 this month", icon: Image, tone: "bg-blue-50 text-blue-700" },
  { label: "Downloads", value: "24.8K", change: "+12.4% preview", icon: CloudUpload, tone: "bg-cyan-50 text-cyan-700" },
  { label: "Revenue", value: "₹1.84L", change: "+9.1% preview", icon: CircleDollarSign, tone: "bg-emerald-50 text-emerald-700" },
  { label: "Profile Views", value: "86.2K", change: "+18.2% preview", icon: Gauge, tone: "bg-violet-50 text-violet-700" },
  { label: "Active Licenses", value: "42", change: "Across 12 assets", icon: Scale, tone: "bg-amber-50 text-amber-700" },
];

export const studioRecentAssets = [
  { slug: "cinematic-ladakh-drone-pack", title: "Cinematic Ladakh Drone Pack", type: "Video", uploaded: "12 Jul 2026", downloads: "4.8K", revenue: "₹42,800", image: "/experiences/adventure.jpg" },
  { slug: "rajasthan-heritage-portraits", title: "Rajasthan Heritage Portraits", type: "Photo", uploaded: "10 Jul 2026", downloads: "3.2K", revenue: "₹31,400", image: "/themes/banners/culture-2.jpg" },
  { slug: "luxury-resort-reel-templates", title: "Luxury Resort Reel Templates", type: "Template", uploaded: "08 Jul 2026", downloads: "5.6K", revenue: "₹54,100", image: "/experiences/luxury.jpg" },
];

export const studioQuickActions = [
  { label: "Upload New Asset", href: "/creator-studio/uploads", icon: UploadCloud },
  { label: "Create Collection", href: "/creator-studio/collections", icon: FolderKanban },
  { label: "View Analytics", href: "/creator-studio/analytics", icon: BarChart3 },
  { label: "Manage Licenses", href: "/creator-studio/licenses", icon: Scale },
  { label: "Revenue Overview", href: "/creator-studio/revenue", icon: WalletCards },
];

export const studioActivity = [
  { title: "Cinematic Ladakh Drone Pack reached 4.8K downloads", detail: "Download milestone · 14 minutes ago", icon: CloudUpload },
  { title: "Extended License activated", detail: "Rajasthan Heritage Portraits · 1 hour ago", icon: Scale },
  { title: "Luxury Escapes collection updated", detail: "3 assets added · Yesterday", icon: FolderKanban },
  { title: "Revenue preview crossed ₹1.8L", detail: "Monthly performance · 2 days ago", icon: CircleDollarSign },
  { title: "Two assets are awaiting moderation", detail: "Preview status only · 3 days ago", icon: ShieldCheck },
];

export const studioEarnings = [
  { label: "Downloads", value: "₹82,400", percent: 45 },
  { label: "Subscriptions", value: "₹46,800", percent: 26 },
  { label: "Licenses", value: "₹39,600", percent: 21 },
  { label: "Other", value: "₹15,200", percent: 8 },
];

export const studioTopAssets = [
  { asset: "Luxury Resort Reel Templates", downloads: "5.6K", revenue: "₹54,100", conversion: "8.4%", trend: "+18%" },
  { asset: "Cinematic Ladakh Drone Pack", downloads: "4.8K", revenue: "₹42,800", conversion: "7.9%", trend: "+12%" },
  { asset: "Rajasthan Heritage Portraits", downloads: "3.2K", revenue: "₹31,400", conversion: "6.8%", trend: "+9%" },
  { asset: "Urban Night Mobile Presets", downloads: "2.9K", revenue: "₹18,700", conversion: "6.1%", trend: "+7%" },
];

export const studioCalendar = [
  { date: "16 Jul", title: "Himalayan Monsoon Series", type: "Upcoming upload" },
  { date: "20 Jul", title: "Luxury Escapes refresh", type: "Collection launch" },
  { date: "25 Jul", title: "Independence campaign assets", type: "Campaign reminder" },
];

export const studioModeration = [
  { label: "Published", value: "118", tone: "text-emerald-700" },
  { label: "In review", value: "2", tone: "text-amber-700" },
  { label: "Draft", value: "8", tone: "text-blue-700" },
];

export const studioTips = ["Add precise location metadata to improve discovery.", "Complete model and property release details before review.", "Refresh seasonal collections ahead of campaign demand."];
export const studioQuickLinks = [{ label: "Creator profile", href: "/creators/authors/aira-studio" }, { label: "Licensing center", href: "/creators/licensing" }, { label: "Plans & storage", href: "/creators/plans" }, { label: "Help & Support", href: "/creator-studio/settings", icon: HelpCircle }];

export const studioPlaceholderMeta: Record<string, { title: string; description: string; icon: LucideIcon; relatedHref?: string; relatedLabel?: string }> = {
  assets: { title: "Assets", description: "Asset Manager will mount here in B13 without changing the Studio shell.", icon: Library },
  uploads: { title: "Uploads", description: "The B12 Upload Wizard will mount here. No upload execution exists in B11.", icon: UploadCloud },
  collections: { title: "Collections", description: "Public collections are available now; Studio management remains a route-ready preview with no persistence.", icon: FolderKanban, relatedHref: "/creators/collections", relatedLabel: "Browse Public Collections" },
  analytics: { title: "Analytics", description: "Analytics logic and live reporting are reserved for B14.", icon: BarChart3 },
  revenue: { title: "Revenue", description: "Revenue and wallet logic are reserved for B15.", icon: CircleDollarSign },
  licenses: { title: "Licenses", description: "Licensing guidance is available now; Creator license management remains preview-only.", icon: Scale, relatedHref: "/creators/licensing", relatedLabel: "Open Licensing Center" },
  messages: { title: "Messages", description: "Messaging architecture is reserved for B17.", icon: MessageSquare },
  moderation: { title: "Moderation", description: "Moderation workflows are reserved for B16.", icon: ShieldCheck },
  payouts: { title: "Payouts", description: "Revenue and payout history previews are available; payout execution remains disabled.", icon: Landmark, relatedHref: "/creator-studio/revenue?tab=payouts", relatedLabel: "View Payout Preview" },
  settings: { title: "Settings", description: "Creator Studio settings are reserved for B18.", icon: Settings },
};

export const studioUtilityIcons = { notifications: BellRing, messages: MessageSquare };
