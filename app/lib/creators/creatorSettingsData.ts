import type { LucideIcon } from "lucide-react";
import { Bell, BriefcaseBusiness, CreditCard, Link2, LockKeyhole, Settings2, Shield, SlidersHorizontal, UserRound } from "lucide-react";

export type CreatorSettingsTab = "profile" | "workspace" | "notifications" | "privacy" | "security" | "connected" | "payout-tax" | "preferences" | "advanced";
export interface CreatorSettingsTabItem { id: CreatorSettingsTab; label: string; description: string; icon: LucideIcon; keywords: string[]; }

export const creatorSettingsTabs: CreatorSettingsTabItem[] = [
  { id: "profile", label: "Profile", description: "Public identity and creator details", icon: UserRound, keywords: ["avatar", "bio", "website", "social", "language", "location"] },
  { id: "workspace", label: "Workspace", description: "Studio defaults and regional settings", icon: BriefcaseBusiness, keywords: ["landing", "grid", "date", "timezone", "currency", "density"] },
  { id: "notifications", label: "Notifications", description: "Choose which updates reach you", icon: Bell, keywords: ["email", "browser", "moderation", "revenue", "payout", "marketing", "campaign"] },
  { id: "privacy", label: "Privacy", description: "Control public visibility", icon: Shield, keywords: ["portfolio", "email", "location", "search", "social"] },
  { id: "security", label: "Security", description: "Password, sessions and sign-in safety", icon: LockKeyhole, keywords: ["password", "two-factor", "sessions", "login", "2fa"] },
  { id: "connected", label: "Connected Accounts", description: "External creator profiles", icon: Link2, keywords: ["instagram", "youtube", "behance", "linkedin", "website", "portfolio"] },
  { id: "payout-tax", label: "Payout & Tax", description: "Financial workspace shortcuts", icon: CreditCard, keywords: ["revenue", "payout", "tax", "invoice"] },
  { id: "preferences", label: "Preferences", description: "Appearance and accessibility", icon: SlidersHorizontal, keywords: ["theme", "compact", "accessibility", "keyboard", "experimental"] },
  { id: "advanced", label: "Advanced", description: "Data, agreements and future tools", icon: Settings2, keywords: ["export", "agreement", "delete", "api", "developer"] },
];

export const notificationSettings = ["Email notifications", "Browser notifications", "Moderation updates", "Revenue summaries", "Payout alerts", "Marketing", "Product updates", "Campaign invitations", "System alerts"];
export const privacySettings = ["Public profile", "Portfolio visibility", "Email visibility", "Location visibility", "Social links visibility", "Creator search visibility"];
export const connectedAccounts = [{ name: "Instagram", handle: "@aira.travels", connected: true }, { name: "YouTube", handle: "Aira Visual Journeys", connected: true }, { name: "Behance", handle: "Not connected", connected: false }, { name: "Website", handle: "aira-visuals.example", connected: true }, { name: "LinkedIn", handle: "Not connected", connected: false }, { name: "X", handle: "Not connected", connected: false }, { name: "Portfolio", handle: "TPL Creator Portfolio", connected: true }];
export const securitySessions = [{ device: "Chrome on Windows", location: "New Delhi, India", activity: "Current session" }, { device: "Safari on iPhone", location: "New Delhi, India", activity: "2 days ago" }, { device: "Chrome on macOS", location: "Mumbai, India", activity: "12 days ago" }];
export const workspaceOptions = { landing: ["Dashboard", "Assets", "Analytics", "Revenue"], view: ["Grid", "List"], date: ["Last 7 days", "Last 30 days", "This month", "This year"], timezone: ["Asia/Kolkata", "UTC", "Asia/Dubai", "Europe/London"], language: ["English", "Hindi", "Spanish", "French"], currency: ["INR", "USD", "EUR", "GBP"], density: ["Comfortable", "Compact", "Spacious"] };
export const settingsSummary = [{ label: "Creator Plan", value: "Creator Pro" }, { label: "Storage Usage", value: "48.2 GB / 100 GB" }, { label: "Total Assets", value: "248" }, { label: "Downloads", value: "18.4K" }, { label: "Revenue", value: "₹1,84,250" }];
