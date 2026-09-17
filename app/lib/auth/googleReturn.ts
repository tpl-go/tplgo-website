export const GOOGLE_OWNERSHIP_PROOF_MESSAGE =
  "We need one more step to protect your TPL account. Sign in with a method you already use, or request support.";

export const GOOGLE_LOGIN_ERROR_MESSAGE =
  "Google sign-in could not be completed. Please try again or use another linked login method.";

export type GoogleReturnOutcome =
  | { kind: "none" }
  | { kind: "success" }
  | { kind: "resolution_required"; message: string }
  | { kind: "error"; message: string };

export function readGoogleReturnOutcome(search: string): GoogleReturnOutcome {
  const params = new URLSearchParams(search);
  const status = params.get("status");

  // The ownership-decision callback intentionally has no `auth=google`
  // marker. Treat it as a Google return only when the opaque resolution
  // token is present, then remove that token from browser-visible history.
  if (status === "resolution_required" && params.has("resolution")) {
    return {
      kind: "resolution_required",
      message: GOOGLE_OWNERSHIP_PROOF_MESSAGE,
    };
  }

  if (params.get("auth") !== "google") return { kind: "none" };
  if (status === "success") return { kind: "success" };

  return { kind: "error", message: GOOGLE_LOGIN_ERROR_MESSAGE };
}

export function removeGoogleReturnQuery(search: string): string {
  const params = new URLSearchParams(search);
  params.delete("auth");
  params.delete("status");
  params.delete("code");
  params.delete("resolution");
  const next = params.toString();
  return next ? `?${next}` : "";
}
