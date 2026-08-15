import type { LucideIcon } from "lucide-react";
import { Archive, Bookmark, Clock3, Download, FileBadge2, FolderHeart, HardDrive, History, Search, Settings, UserRoundCheck } from "lucide-react";

export type LibraryTab = "overview" | "downloads" | "saved" | "licensed-assets" | "plan-downloads" | "orders" | "licenses" | "collections" | "history";

export interface LibraryNavItem { label: string; tab?: LibraryTab; icon: LucideIcon; action?: "searches" | "following" | "settings"; }

export const libraryStats = [
  { label: "Downloads", value: "24", description: "Available in your library", icon: Download, tab: "downloads" as const },
  { label: "Saved Assets", value: "18", description: "Ready for your next project", icon: Bookmark, tab: "saved" as const },
  { label: "Licenses", value: "12", description: "Digital records on file", icon: FileBadge2, tab: "licenses" as const },
  { label: "Collections", value: "4", description: "Curated workspaces", icon: FolderHeart, tab: "collections" as const },
  { label: "History", value: "36", description: "Recent library events", icon: History, tab: "history" as const },
];

export const libraryNavigation: LibraryNavItem[] = [
  { label: "Overview", tab: "overview", icon: Archive },
  { label: "Downloads", tab: "downloads", icon: Download },
  { label: "Saved Assets", tab: "saved", icon: Bookmark },
  { label: "Licensed Assets", tab: "licensed-assets", icon: FileBadge2 },
  { label: "Plan Downloads", tab: "plan-downloads", icon: Download },
  { label: "Orders", tab: "orders", icon: Archive },
  { label: "Licenses", tab: "licenses", icon: FileBadge2 },
  { label: "Collections", tab: "collections", icon: FolderHeart },
  { label: "History", tab: "history", icon: History },
  { label: "Recent Searches", action: "searches", icon: Search },
  { label: "Following Creators", action: "following", icon: UserRoundCheck },
  { label: "Settings", action: "settings", icon: Settings },
];

export const libraryAssets = [
  { slug: "cinematic-ladakh-drone-pack", date: "12 Jul 2026", state: "Downloaded", license: "Standard" },
  { slug: "rajasthan-heritage-portraits", date: "10 Jul 2026", state: "Downloaded", license: "Extended" },
  { slug: "luxury-resort-reel-templates", date: "08 Jul 2026", state: "Downloaded", license: "Standard" },
  { slug: "urban-night-mobile-presets", date: "06 Jul 2026", state: "Saved", license: "Standard" },
  { slug: "himalayan-sunrise-aerials", date: "04 Jul 2026", state: "Saved", license: "Standard" },
  { slug: "india-adventure-content-kit", date: "02 Jul 2026", state: "Saved", license: "Standard" },
];

export const libraryLicenses = [
  { assetSlug: "cinematic-ladakh-drone-pack", asset: "Cinematic Ladakh Drone Pack", license: "Standard", id: "TPL-LIC-20481", purchaseDate: "12 Jul 2026", expiry: "Perpetual", status: "Active" },
  { assetSlug: "rajasthan-heritage-portraits", asset: "Rajasthan Heritage Portraits", license: "Extended", id: "TPL-LIC-20372", purchaseDate: "10 Jul 2026", expiry: "Perpetual", status: "Active" },
  { assetSlug: "luxury-resort-reel-templates", asset: "Luxury Resort Reel Templates", license: "Standard", id: "TPL-LIC-20194", purchaseDate: "08 Jul 2026", expiry: "Perpetual", status: "Active" },
  { assetSlug: "jaipur-editorial-photo-set", asset: "Jaipur Editorial Photo Set", license: "Editorial", id: "TPL-LIC-19821", purchaseDate: "28 Jun 2026", expiry: "Perpetual", status: "Active" },
];

export const libraryActivity = [
  { title: "Downloaded Cinematic Ladakh Drone Pack", detail: "Standard License · 12 Jul 2026, 11:42", icon: Download },
  { title: "Saved Urban Night Mobile Presets", detail: "Saved Assets · 11 Jul 2026, 18:05", icon: Bookmark },
  { title: "License activated for Rajasthan Heritage Portraits", detail: "Extended License · 10 Jul 2026, 09:30", icon: FileBadge2 },
  { title: "Added Luxury Resort Reel Templates to Luxury Escapes", detail: "Collection · 08 Jul 2026, 15:18", icon: FolderHeart },
  { title: "Downloaded Himalayan Sunrise Aerials", detail: "Standard License · 04 Jul 2026, 12:11", icon: Download },
];

export const recentSearches = ["Himalayan drone 4K", "Luxury resort reels", "Rajasthan editorial", "Urban night presets"];
export const followingCreators = ["Aira Studio", "Northlight Motion", "Noor Visuals", "RouteCraft Labs"];

export const storagePreview = { used: "6.4 GB", remaining: "18.6 GB", total: "25 GB", percent: 26, icon: HardDrive };
export const libraryTabs: { key: LibraryTab; label: string }[] = [
  { key: "overview", label: "Overview" }, { key: "downloads", label: "Recent Downloads" },
  { key: "saved", label: "Saved Assets" }, { key: "licensed-assets", label: "Licensed Assets" },
  { key: "plan-downloads", label: "Plan Downloads" }, { key: "orders", label: "Orders" }, { key: "licenses", label: "Licenses" },
  { key: "collections", label: "Collections" }, { key: "history", label: "History" },
];

export const libraryEmptyStates = {
  downloads: { title: "Your downloads will appear here", copy: "Explore premium assets and keep every licensed file organized in one workspace.", cta: "Browse Assets", href: "/creators/search" },
  saved: { title: "Save inspiration for later", copy: "Use the heart action on any asset to build a focused creative shortlist.", cta: "Browse Assets", href: "/creators/search" },
  "licensed-assets": { title: "Licensed assets will appear here", copy: "Purchased and activated asset licenses stay ready for reuse across campaigns.", cta: "Browse Assets", href: "/creators/search" },
  "plan-downloads": { title: "Plan downloads will appear here", copy: "Downloads included with your active plan will be tracked in this workspace.", cta: "View Plans", href: "/creators/plans" },
  orders: { title: "No orders yet", copy: "Creator purchases and checkout records will appear here after ordering is enabled.", cta: "Browse Assets", href: "/creators/search" },
  collections: { title: "Build your first collection", copy: "Explore expert-curated collections for destinations, campaigns and client work.", cta: "Explore Collections", href: "/creators/collections" },
  licenses: { title: "No licenses yet", copy: "License records will stay organized here after eligible purchases are enabled.", cta: "View Plans", href: "/creators/plans" },
  history: { title: "Activity starts here", copy: "Downloads, saved assets and collection activity will form a clear timeline.", cta: "Browse Assets", href: "/creators/search" },
} satisfies Record<Exclude<LibraryTab, "overview">, { title: string; copy: string; cta: string; href: string }>;

export const libraryUpdatedLabel = { label: "Updated just now", icon: Clock3 };
