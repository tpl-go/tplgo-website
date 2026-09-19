import { describe,expect,it } from "vitest";
import { defaultPerformanceFilters,performanceNumber,performanceParams,validPerformanceOverview } from "./partnerPerformanceContract";
describe("Performance presentation contract",()=>{
 it("distinguishes unavailable and genuine zero; money requires explicit currency/minor units",()=>{expect(performanceNumber(null)).toBe("—");expect(performanceNumber(0)).toBe("0");expect(performanceNumber(1200,"money")).toBe("—");expect(performanceNumber(1200,"money","INR")).toContain("12.00");expect(performanceNumber(12.3,"money","INR")).toBe("—");expect(performanceNumber(12.345,"percent")).toBe("12.3%");});
 it("encodes all filters server-side without contacts in browser storage",()=>{const p=new URLSearchParams(performanceParams({...defaultPerformanceFilters,country:"A & B",domain:"qa"},{search:"QA Name",sort:"nameDesc",after:"opaque"}));expect(p.get("country")).toBe("A & B");expect(p.get("search")).toBe("QA Name");expect(p.get("after")).toBe("opaque");expect(p.has("service")).toBe(false);});
 it("rejects malformed/partial overview rather than showing false zero",()=>{for(const v of [null,{}, {contractVersion:1}, {contractVersion:1,asOf:"not-a-date"}])expect(validPerformanceOverview(v)).toBe(false);});
});
