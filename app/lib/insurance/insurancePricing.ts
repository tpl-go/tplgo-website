import { InsurancePlan } from "./insuranceDummyData";

export function formatInsuranceMoney(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatCoverageAmount(amount: number) {
  if (amount >= 1000000) {
    return `₹${(amount / 100000).toLocaleString("en-IN")} Lakh`;
  }

  return `$${amount.toLocaleString("en-US")}`;
}

export function getInsurancePlanTax(plan: InsurancePlan) {
  return Math.round(plan.premium * 0.18);
}

export function getInsurancePlanTotal(plan: InsurancePlan) {
  return plan.premium + getInsurancePlanTax(plan);
}

export function getInsuranceEarnedCredit(plan: InsurancePlan) {
  return Math.round(plan.premium * 0.02);
}