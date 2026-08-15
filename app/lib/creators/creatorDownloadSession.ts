import type { CreatorDownloadSessionStatus } from "./creatorDownloadTypes";

export const creatorDownloadTokenTransitions = [
  { from: "draft", to: "pending_authorization" },
  { from: "pending_authorization", to: "authorized" },
  { from: "authorized", to: "issued" },
  { from: "issued", to: "used" },
  { from: "issued", to: "expired" },
  { from: "issued", to: "revoked" },
  { from: "pending_authorization", to: "failed" },
] as const;

export const creatorDownloadSessionTransitions: Array<{ from: CreatorDownloadSessionStatus; to: CreatorDownloadSessionStatus }> = [
  { from: "created", to: "authorized" },
  { from: "authorized", to: "ready" },
  { from: "ready", to: "started" },
  { from: "started", to: "completed" },
  { from: "ready", to: "expired" },
  { from: "created", to: "cancelled" },
  { from: "started", to: "failed" },
];

export function canTransitionCreatorDownloadSession(from: CreatorDownloadSessionStatus, to: CreatorDownloadSessionStatus) {
  return creatorDownloadSessionTransitions.some((transition) => transition.from === from && transition.to === to);
}

export function canTransitionCreatorDownloadToken(from: (typeof creatorDownloadTokenTransitions)[number]["from"], to: (typeof creatorDownloadTokenTransitions)[number]["to"]) {
  return creatorDownloadTokenTransitions.some((transition) => transition.from === from && transition.to === to);
}
