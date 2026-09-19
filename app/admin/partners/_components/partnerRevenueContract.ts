import { performanceNumber } from "./partnerPerformanceContract";

export const revenuePermissions = ["partner_verification.read", "partner_service_catalogue.read", "payments.read", "partner_payout_tax.read"];
export const revenueAmountKeys = ["gmv", "revenue", "payable", "settled", "pending", "refunds", "adjustments"] as const;
export type RevenueAmounts = Record<typeof revenueAmountKeys[number], number | null>;
export type RevenueFilters = { preset: string; from: string; to: string; domain: string; service: string; grain: string };
export const defaultRevenueFilters: RevenueFilters = { preset: "last30", from: "", to: "", domain: "", service: "", grain: "daily" };
export type RevenueTrendPoint = { date: string; gmv: number | null; revenue: number | null; payable: number | null };
export type RevenueOverview = {
  contractVersion: 1; asOf: string; currency: string | null; period: { from: string; to: string };
  coverage: { revenue: "available" | "not_connected"; settlements: "available" | "not_connected"; partnerRanking: "available" | "not_connected" };
  amounts: RevenueAmounts; trend: RevenueTrendPoint[];
  settlement: { settled: number | null; pending: number | null; payable: number | null; partnersAwaitingSettlement: number | null; failedSettlements: number | null; balanceAsOf: string | null };
  filterPolicy: { presets: string[]; grains: string[]; maxRangeDays: number };
};
export type RevenueDomainPage = { available: boolean; catalogueAvailable: boolean; currency: string | null; rows: Array<RevenueAmounts & { key: string; name: string }>; nextCursor: string | null };
export type RevenuePartnerPage = { available: boolean; currency: string | null; rows: Array<{ id: string; name: string; domain: string; service: string; gmv: number | null; revenue: number | null; payable: number | null }>; nextCursor: string | null };
export type RevenueOptions = { rows: Array<{ value: string; label: string }>; nextCursor: string | null };
export const revenueMoney = (value: number | null | undefined, currency?: string | null) => performanceNumber(value, "money", currency);
export function revenueParams(filters: RevenueFilters, extra: Record<string,string> = {}) {
  const p = new URLSearchParams();
  for (const [key,value] of Object.entries({ ...filters,...extra })) if (value) p.set(key,value);
  return p.toString();
}
const amount = (v: unknown) => v === null || typeof v === "number" && Number.isSafeInteger(v);
const currency = (v: unknown) => v === null || typeof v === "string" && /^[A-Z]{3}$/.test(v);
const day = (v: unknown) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v));
const text = (v: unknown, max = 180) => typeof v === "string" && v.length <= max;
const cursor = (v: unknown) => v === null || text(v, 1400);
export function validRevenueOverview(value: unknown): value is RevenueOverview {
  if (!value || typeof value !== "object") return false;
  const v = value as RevenueOverview;
  return v.contractVersion === 1 && Number.isFinite(Date.parse(v.asOf)) && currency(v.currency)
    && !!v.period && day(v.period.from) && day(v.period.to)
    && !!v.coverage && [v.coverage.revenue,v.coverage.settlements,v.coverage.partnerRanking].every(s => ["available","not_connected"].includes(s))
    && !!v.amounts && revenueAmountKeys.every(k => amount(v.amounts[k]))
    && Array.isArray(v.trend) && v.trend.length <= 366 && v.trend.every(p => p && day(p.date) && [p.gmv,p.revenue,p.payable].every(amount))
    && !!v.settlement && [v.settlement.settled,v.settlement.pending,v.settlement.payable,v.settlement.partnersAwaitingSettlement,v.settlement.failedSettlements].every(amount)
    && (v.settlement.balanceAsOf === null || Number.isFinite(Date.parse(v.settlement.balanceAsOf)))
    && !!v.filterPolicy && [v.filterPolicy.presets,v.filterPolicy.grains].every(a => Array.isArray(a) && a.length <= 20 && a.every(s => text(s,40)));
}
export function validRevenueOptions(value: unknown): value is RevenueOptions {
  const v = value as RevenueOptions | null;
  return !!v && Array.isArray(v.rows) && v.rows.length <= 30 && v.rows.every(r => r && text(r.value,160) && text(r.label)) && cursor(v.nextCursor);
}
export function validRevenueDomains(value: unknown): value is RevenueDomainPage {
  const v = value as RevenueDomainPage | null;
  return !!v && typeof v.available === "boolean" && typeof v.catalogueAvailable === "boolean" && currency(v.currency) && cursor(v.nextCursor) && Array.isArray(v.rows) && v.rows.length <= 25 && v.rows.every(r => r && text(r.key,160) && text(r.name) && revenueAmountKeys.every(k => amount(r[k])));
}
export function validRevenuePartners(value: unknown): value is RevenuePartnerPage {
  const v = value as RevenuePartnerPage | null;
  return !!v && typeof v.available === "boolean" && currency(v.currency) && cursor(v.nextCursor) && Array.isArray(v.rows) && v.rows.length <= 25 && v.rows.every(r => r && typeof r.id === "string" && /^[0-9a-f-]{36}$/i.test(r.id) && text(r.name,500) && text(r.domain) && text(r.service) && [r.gmv,r.revenue,r.payable].every(amount));
}
