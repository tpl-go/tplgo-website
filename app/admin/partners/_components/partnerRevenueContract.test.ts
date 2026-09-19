import { expect,it } from "vitest";
import { defaultRevenueFilters,revenueAmountKeys,revenueMoney,revenueParams,validRevenueDomains,validRevenueOptions,validRevenueOverview,validRevenuePartners } from "./partnerRevenueContract";
const amounts = Object.fromEntries(revenueAmountKeys.map(k => [k,null]));
const overview = { contractVersion: 1,asOf: "2026-09-19T12:00:00Z",currency: null,period: { from: "2026-09-01",to: "2026-09-19" },coverage: { revenue: "not_connected",settlements: "not_connected",partnerRanking: "not_connected" },amounts,trend: [],settlement: { settled: null,pending: null,payable: null,partnersAwaitingSettlement: null,failedSettlements: null,balanceAsOf: null },filterPolicy: { presets: ["last30"],grains: ["daily"],maxRangeDays: 366 } };
it("distinguishes unknown from zero and keeps minor units/currency explicit", () => {
  expect(revenueMoney(null,"INR")).toBe("—"); expect(revenueMoney(0,"INR")).toContain("0.00");
  expect(revenueMoney(12345,"INR")).toContain("123.45"); expect(revenueMoney(12345)).toBe("—"); expect(revenueMoney(12.5,"INR")).toBe("—"); expect(revenueMoney(-100,"INR")).toContain("-₹1.00");
});
it("rejects malformed money, oversized collections and incomplete responses", () => {
  expect(validRevenueOverview(overview)).toBe(true);
  for (const v of [null,{}, { ...overview,amounts: { ...amounts,revenue: "100" } },{ ...overview,trend: Array(367).fill({ date: "2026-09-01",gmv: 0,revenue: 0,payable: 0 }) }]) expect(validRevenueOverview(v)).toBe(false);
  expect(validRevenueOptions({ rows: Array(31).fill({ value: "x",label: "x" }),nextCursor: null })).toBe(false);
  expect(validRevenuePartners({ available: false,currency: null,rows: [],nextCursor: null })).toBe(true);
  expect(validRevenueDomains({ available: false,catalogueAvailable: true,currency: null,rows: [{ key: "esim",name: "eSIM Provider",...amounts }],nextCursor: null })).toBe(true);
});
it("encodes scoped filters and cursors without a full Partner dataset", () => {
  const q = new URLSearchParams(revenueParams({ ...defaultRevenueFilters,domain: "qa",service: "qa-service" },{ after: "next",term: "A & B" }));
  expect(q.get("domain")).toBe("qa"); expect(q.get("term")).toBe("A & B"); expect(q.get("after")).toBe("next"); expect(q.has("country")).toBe(false);
});
