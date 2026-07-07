export type ReviewStatusTone =
  | "selected"
  | "recommended"
  | "pending"
  | "missing"
  | "optional";

export type ReviewStatusVisual = {
  badgeClass: string;
  cardClass: string;
  iconClass: string;
  label: string;
  tone: ReviewStatusTone;
};

function normalizeStatus(status?: string) {
  return String(status || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function titleCaseStatus(status?: string) {
  const value = String(status || "").trim();
  if (!value) return "Optional";
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getReviewStatusVisual(status?: string): ReviewStatusVisual {
  const normalized = normalizeStatus(status);

  if (
    [
      "selected",
      "added",
      "added to basket",
      "added to booking",
      "ready",
      "passed",
      "provided",
      "covered",
      "resolved",
      "applied",
    ].includes(normalized)
  ) {
    return {
      badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
      cardClass:
        "border-l-4 border-l-emerald-400 bg-[linear-gradient(180deg,#f0fdf4,#ffffff)]",
      iconClass: "text-emerald-600",
      label: titleCaseStatus(status),
      tone: "selected",
    };
  }

  if (["recommended", "suggested", "info", "updated"].includes(normalized)) {
    return {
      badgeClass: "border-blue-200 bg-blue-50 text-blue-700",
      cardClass:
        "border-l-4 border-l-blue-400 bg-[linear-gradient(180deg,#eff6ff,#ffffff)]",
      iconClass: "text-blue-600",
      label: titleCaseStatus(status),
      tone: "recommended",
    };
  }

  if (
    [
      "pending",
      "needs review",
      "warning",
      "open",
      "not ready",
      "needs attention",
    ].includes(normalized)
  ) {
    return {
      badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
      cardClass:
        "border-l-4 border-l-amber-400 bg-[linear-gradient(180deg,#fffbeb,#ffffff)]",
      iconClass: "text-amber-600",
      label: titleCaseStatus(status),
      tone: "pending",
    };
  }

  if (
    [
      "missing",
      "blocker",
      "critical",
      "removed",
      "failed",
      "error",
    ].includes(normalized)
  ) {
    return {
      badgeClass: "border-red-200 bg-red-50 text-red-700",
      cardClass:
        "border-l-4 border-l-red-400 bg-[linear-gradient(180deg,#fef2f2,#ffffff)]",
      iconClass: "text-red-600",
      label: titleCaseStatus(status),
      tone: "missing",
    };
  }

  return {
    badgeClass: "border-violet-200 bg-violet-50 text-violet-700",
    cardClass:
      "border-l-4 border-l-violet-300 bg-[linear-gradient(180deg,#f5f3ff,#ffffff)]",
    iconClass: "text-violet-600",
    label: titleCaseStatus(status),
    tone: "optional",
  };
}
