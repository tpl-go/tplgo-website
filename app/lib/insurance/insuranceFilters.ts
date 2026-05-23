import { InsurancePlan } from "./insuranceDummyData";

export type InsuranceFilterState = {
  providers: string[];
  coverageAmounts: string[];
  medicalCovered: boolean;
  adventureSportsCovered: boolean;
  cashlessHospitals: boolean;
  covidCover: boolean;
  visaCompliant: boolean;
  minClaimRatio: number;
  premiumRange: [number, number];
};

export const defaultInsuranceFilters: InsuranceFilterState = {
  providers: [],
  coverageAmounts: [],
  medicalCovered: false,
  adventureSportsCovered: false,
  cashlessHospitals: false,
  covidCover: false,
  visaCompliant: false,
  minClaimRatio: 0,
  premiumRange: [0, 10000],
};

export function getInsuranceProviders(plans: InsurancePlan[]) {
  return Array.from(new Set(plans.map((plan) => plan.provider)));
}

export function getCoverageOptions(plans: InsurancePlan[]) {
  return Array.from(new Set(plans.map((plan) => String(plan.coverageAmount))));
}

export function applyInsuranceFilters(
  plans: InsurancePlan[],
  filters: InsuranceFilterState
) {
  return plans.filter((plan) => {
    if (
      filters.providers.length > 0 &&
      !filters.providers.includes(plan.provider)
    ) {
      return false;
    }

    if (
      filters.coverageAmounts.length > 0 &&
      !filters.coverageAmounts.includes(String(plan.coverageAmount))
    ) {
      return false;
    }

    if (filters.medicalCovered && !plan.medicalCovered) return false;
    if (filters.adventureSportsCovered && !plan.adventureSportsCovered)
      return false;
    if (filters.cashlessHospitals && !plan.cashlessHospitals) return false;
    if (filters.covidCover && !plan.covidCover) return false;
    if (filters.visaCompliant && !plan.visaCompliant) return false;

    if (plan.claimSettlementRatio < filters.minClaimRatio) return false;

    if (
      plan.premium < filters.premiumRange[0] ||
      plan.premium > filters.premiumRange[1]
    ) {
      return false;
    }

    return true;
  });
}

export function toggleFilterValue(list: string[], value: string) {
  if (list.includes(value)) {
    return list.filter((item) => item !== value);
  }

  return [...list, value];
}