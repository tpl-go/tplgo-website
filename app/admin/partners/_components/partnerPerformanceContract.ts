export type PerformanceFilters = { preset: string; comparison: string; from: string; to: string; domain: string; service: string; type: string; status: string; country: string; state: string; city: string; grain: string };
export const defaultPerformanceFilters: PerformanceFilters = { preset: "last30", comparison: "previousPeriod", from: "", to: "", domain: "", service: "", type: "", status: "", country: "", state: "", city: "", grain: "daily" };
export type Metric = { current: number | null; previous: number | null; changePercent: number | null; basis: string };
export type TrendPoint = { date: string; comparisonDate: string | null; current: Record<string, number | null>; previous: Record<string, number | null> };
export type PerformanceOverview = {
  contractVersion: 1; asOf: string; timezone: string; currency: string | null;
  period: { from: string; to: string; compareFrom: string; compareTo: string };
  metrics: Record<string, Metric>; registrations: Metric; matchingPartners: number;
  coverage: Record<string, string>; bookingTrend: TrendPoint[]; financialTrend: TrendPoint[];
  insights: Array<{ key: string; current: number; previous: number; change: number }>;
  filterPolicy: { presets: string[]; comparisons: string[]; grains: string[]; searchModes: string[]; sorts: string[] };
};
export type Breakdown = { level: "domain" | "service"; rows: Array<{ key: string; name: string; partners: number; bookings: number | null; gmv: number | null; revenue: number | null; growth: number | null }>; nextCursor: string | null };
export type PartnerPerformancePage = { rows: Array<{ id: string; name: string; status: string; services: Array<{ key: string; name: string; domain: string; status: string }>; moreServices: boolean; bookings: number | null; gmv: number | null; revenue: number | null; cancellation: number | null; average: number | null; changePercent: number | null; profileHref: null; reviewHref: string }>; nextCursor: string | null };
export type PerformanceOptions = { rows: Array<{ value: string; label: string }>; nextCursor: string | null };
export const performanceLabels: Record<string,string> = { today: "Today", yesterday: "Yesterday", last7: "Last 7 Days", last30: "Last 30 Days", thisMonth: "This Month", previousMonth: "Previous Month", thisQuarter: "This Quarter", previousQuarter: "Previous Quarter", thisYear: "This Year", custom: "Custom Range", previousPeriod: "Previous Period", previousYear: "Previous Year", daily: "Daily", weekly: "Weekly", monthly: "Monthly", nameAsc: "Name A–Z", nameDesc: "Name Z–A", idAsc: "Partner ID ascending", idDesc: "Partner ID descending", name: "Exact legal name", id: "Partner ID" };
export function performanceParams(filters: PerformanceFilters, extra: Record<string,string> = {}) { const params = new URLSearchParams(); for (const [key,value] of Object.entries({ ...filters,...extra })) if (value) params.set(key,value); return params.toString(); }
export function performanceNumber(value: number | null | undefined, kind: "count" | "money" | "percent" = "count", currency?: string | null) {
  if (value == null || !Number.isFinite(value)) return "—";
  if (kind === "percent") return `${value.toLocaleString("en-IN", { maximumFractionDigits: 1 })}%`;
  if (kind === "money") { if (!currency || !/^[A-Z]{3}$/.test(currency) || !Number.isSafeInteger(value)) return "—"; try { return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(value / 100); } catch { return "—"; } }
  return value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}
export function validPerformanceOverview(value: unknown): value is PerformanceOverview {
  if (!value || typeof value !== "object") return false;
  const v = value as PerformanceOverview;
  return v.contractVersion === 1 && typeof v.asOf === "string" && Number.isFinite(Date.parse(v.asOf)) && !!v.period && !!v.coverage && !!v.metrics && ["bookings","completed","cancellation","gmv","revenue","payable","active","average"].every(k => v.metrics[k] && [v.metrics[k].current,v.metrics[k].previous,v.metrics[k].changePercent].every(n => n === null || typeof n === "number" && Number.isFinite(n))) && !!v.filterPolicy && [v.filterPolicy.presets,v.filterPolicy.comparisons,v.filterPolicy.grains,v.filterPolicy.sorts,v.filterPolicy.searchModes].every(a => Array.isArray(a) && a.length <= 20 && a.every(x => typeof x === "string")) && [v.bookingTrend,v.financialTrend].every(a => Array.isArray(a) && a.length <= 366) && Array.isArray(v.insights);
}
