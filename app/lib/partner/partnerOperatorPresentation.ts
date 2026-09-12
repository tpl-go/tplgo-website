import type { PartnerApplicationStatus } from "./partnerApiClient";

const profileLifecycleLabels: Record<string, string> = {
  DRAFT_INCOMPLETE: "Application in progress",
  READY_TO_SUBMIT: "Application in progress",
  SUBMITTED: "Application submitted",
  UNDER_REVIEW: "Application submitted",
  RESUBMITTED: "Application submitted",
  CHANGES_REQUESTED: "Updates required",
  NOT_APPROVED: "Application status available",
  APPROVED: "Account setup pending",
  ACTIVE: "Active Partner account",
  RESTRICTED: "Please contact support",
};

const profileActionLabels: Record<string, string> = {
  APPLICATION: "Continue application",
  APPLICATION_STATUS: "View application status",
  CORRECTIONS: "Update application",
  SETUP_PENDING: "Continue account setup",
  ACTIVE: "View account status",
  RESTRICTED: "Contact support",
};

export function partnerProfileLifecycleLabel(status: string): string {
  return profileLifecycleLabels[status] ?? "Account status available";
}

export function partnerProfileActionLabel(destinationType: string, selectable: boolean): string {
  if (!selectable || destinationType === "RESTRICTED") return "Contact support";
  return profileActionLabels[destinationType] ?? "Contact support";
}

export function partnerApplicationLifecycleLabel(status: PartnerApplicationStatus): string {
  if (status === "DRAFT_INCOMPLETE" || status === "READY_TO_SUBMIT") return "Application in progress";
  if (status === "SUBMITTED" || status === "UNDER_REVIEW" || status === "RESUBMITTED") return "Application submitted";
  if (status === "CHANGES_REQUESTED") return "Updates required";
  if (status === "NOT_APPROVED") return "Application status available";
  return "Account setup pending";
}

export function cleanPartnerApplicationName(value: unknown): string {
  let name = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  name = name.replace(/(?:\s*[-–—|:]\s*)?Partner\s+Application(?:\s+(?:Draft|In\s+Progress|Submitted|Status))?$/i, "").trim();
  name = name.replace(/\b(DRAFT_INCOMPLETE|READY_TO_SUBMIT|CHANGES_REQUESTED|UNDER_REVIEW|SETUP_PENDING)\b$/, "").trim();
  name = collapseAdjacentRepeatedWords(name);
  return name || "Partner application";
}

function collapseAdjacentRepeatedWords(value: string): string {
  const words = value.split(" ").filter(Boolean);
  return words.filter((word, index) => index === 0 || word.toLocaleLowerCase("en") !== words[index - 1]!.toLocaleLowerCase("en")).join(" ");
}
