import type { LucideIcon } from "lucide-react";
import { CalendarClock, CircleDollarSign, Clock3, HandCoins, WalletCards } from "lucide-react";

export interface CreatorRevenueKpi { label: string; amountMinor: number; growth?: number; support: string; status?: string; icon: LucideIcon; }
export interface CreatorRevenueTransaction { id: string; date: string; description: string; source: string; type: "Earning" | "Adjustment" | "Hold" | "Release" | "Payout" | "Refund/Reversal"; asset: string; grossMinor: number; platformFeeMinor: number; gatewayFeeMinor: number; taxMinor: number; creatorShareMinor: number; status: string; reference: string; }

export const revenueKpis: CreatorRevenueKpi[] = [
  { label: "Total Revenue", amountMinor: 18425000, growth: 21.4, support: "All Creator earnings preview", icon: CircleDollarSign },
  { label: "Pending Earnings", amountMinor: 2840000, growth: 8.2, support: "Awaiting settlement window", status: "Pending", icon: Clock3 },
  { label: "Available for Payout", amountMinor: 9625000, support: "Eligible preview balance", status: "Available", icon: WalletCards },
  { label: "Withdrawn", amountMinor: 5940000, growth: 12.0, support: "Completed payout previews", icon: HandCoins },
  { label: "Estimated Next Payout", amountMinor: 9625000, support: "Expected 25 Jul 2026", status: "Scheduled", icon: CalendarClock },
];

export const revenueSources = [
  { label: "Subscription Plans", amountMinor: 6840000, share: 37, growth: 16.2 }, { label: "Individual Licenses", amountMinor: 4120000, share: 22, growth: 8.4 },
  { label: "Extended Licenses", amountMinor: 4760000, share: 26, growth: 31.8 }, { label: "Enterprise Licenses", amountMinor: 1840000, share: 10, growth: 24.1 },
  { label: "Advertising Revenue", amountMinor: 420000, share: 2, growth: 4.2 }, { label: "Affiliate Revenue", amountMinor: 285000, share: 2, growth: 2.8 },
  { label: "Other Earnings", amountMinor: 190000, share: 1, growth: -1.3 },
];

export const revenueTrendSeries = {
  amount: [42, 56, 48, 69, 76, 88, 82, 101, 112, 126, 139, 154], downloads: [34, 41, 47, 52, 61, 68, 73, 78, 86, 93, 101, 110],
  licenses: [18, 24, 22, 31, 36, 42, 39, 49, 54, 61, 68, 76], earnings: [22, 29, 27, 34, 39, 45, 48, 53, 58, 64, 69, 74],
};

export const topRevenueAssets = [
  { title: "Luxury Resort Reel Templates", image: "/experiences/luxury.jpg", type: "Template", revenueMinor: 5410000, downloads: "5.6K", conversion: "8.4%", trend: "+18%" },
  { title: "Cinematic Ladakh Drone Pack", image: "/experiences/adventure.jpg", type: "Drone", revenueMinor: 4280000, downloads: "4.8K", conversion: "7.9%", trend: "+12%" },
  { title: "Rajasthan Heritage Portraits", image: "/themes/banners/culture-2.jpg", type: "Photo", revenueMinor: 3140000, downloads: "3.2K", conversion: "6.8%", trend: "+9%" },
];

export const revenueTransactions: CreatorRevenueTransaction[] = [
  { id: "tx-1", date: "2026-07-15", description: "Extended license earning", source: "Extended License", type: "Earning", asset: "Cinematic Ladakh Drone Pack", grossMinor: 1499900, platformFeeMinor: 299980, gatewayFeeMinor: 44997, taxMinor: 115000, creatorShareMinor: 1039923, status: "Available", reference: "CR-REV-4102" },
  { id: "tx-2", date: "2026-07-14", description: "Subscription allocation", source: "Creator Plan", type: "Earning", asset: "Luxury Resort Reel Templates", grossMinor: 842000, platformFeeMinor: 168400, gatewayFeeMinor: 0, taxMinor: 62000, creatorShareMinor: 611600, status: "Pending", reference: "CR-REV-4097" },
  { id: "tx-3", date: "2026-07-12", description: "Rights review hold", source: "Moderation", type: "Hold", asset: "Rajasthan Heritage Portraits", grossMinor: 399900, platformFeeMinor: 0, gatewayFeeMinor: 0, taxMinor: 0, creatorShareMinor: 399900, status: "On Hold", reference: "CR-HOLD-112" },
  { id: "tx-4", date: "2026-07-10", description: "Monthly payout preview", source: "Payout", type: "Payout", asset: "—", grossMinor: 3250000, platformFeeMinor: 0, gatewayFeeMinor: 2500, taxMinor: 0, creatorShareMinor: 3247500, status: "Completed", reference: "CR-PAY-882" },
  { id: "tx-5", date: "2026-07-08", description: "License reversal", source: "Adjustment", type: "Refund/Reversal", asset: "Urban Night Mobile Presets", grossMinor: -39900, platformFeeMinor: -7980, gatewayFeeMinor: 0, taxMinor: 0, creatorShareMinor: -31920, status: "Adjusted", reference: "CR-REV-4081" },
];

export const creatorInvoices = [
  { number: "CR-INV-2026-06", period: "June 2026", grossMinor: 4820000, deductionsMinor: 1120000, netMinor: 3700000, status: "Ready" },
  { number: "CR-INV-2026-05", period: "May 2026", grossMinor: 4210000, deductionsMinor: 980000, netMinor: 3230000, status: "Ready" },
  { number: "CR-INV-2026-04", period: "April 2026", grossMinor: 3890000, deductionsMinor: 910000, netMinor: 2980000, status: "Ready" },
];

export const creatorPayouts = [
  { id: "CR-PAY-882", date: "10 Jul 2026", method: "Bank", account: "•••• 4521", requestedMinor: 3250000, feesMinor: 2500, netMinor: 3247500, status: "Completed", expected: "12 Jul 2026" },
  { id: "CR-PAY-841", date: "10 Jun 2026", method: "UPI", account: "ai•••@upi", requestedMinor: 2690000, feesMinor: 0, netMinor: 2690000, status: "Completed", expected: "10 Jun 2026" },
  { id: "CR-PAY-903", date: "16 Jul 2026", method: "Bank", account: "•••• 4521", requestedMinor: 4500000, feesMinor: 2500, netMinor: 4497500, status: "Processing", expected: "20 Jul 2026" },
];

export const creatorTaxSummary = { grossMinor: 18425000, platformFeesMinor: 3685000, gatewayFeesMinor: 184000, taxesWithheldMinor: 920000, otherDeductionsMinor: 126000, netMinor: 13510000, gstReady: "GST profile preview ready", tdsReady: "TDS document preview pending", documentStatus: "Configuration only — no filing" };
export const payoutAccounts = [{ id: "bank-4521", label: "Bank •••• 4521", method: "Bank transfer", processing: "2–5 business days", feeMinor: 2500 }, { id: "upi-aira", label: "UPI ai•••@upi", method: "UPI", processing: "Within 1 business day", feeMinor: 0 }];
export const revenueInsights = ["Revenue grew 21.4% this month.", "Photos are the top earning asset type.", "India contributes the highest revenue share.", "Extended licenses increased 31.8%.", "One asset is under payout review.", "Consistent uploads could improve subscription allocation."];
export const revenueSplit = [{ label: "Buyer Payment", share: 100 }, { label: "Taxes / Gateway Fees", share: 92 }, { label: "Operational Charges", share: 84 }, { label: "Creator Share", share: 68 }, { label: "TPL Platform Share", share: 16 }];
export const revenueFilterOptions = { date: ["this-month", "last-month", "this-quarter", "this-year", "all-time"], compare: ["previous-period", "previous-year", "none"], type: ["photos", "videos", "drone", "templates", "guides"], collection: ["cinematic-india", "luxury-escapes", "himalayan-aerials"], license: ["standard", "extended", "editorial", "commercial", "enterprise"], status: ["published", "under-review", "archived"], destination: ["india", "uae", "singapore", "global"] };
export const revenueTabs = ["transactions", "invoices", "payouts", "tax"] as const;
