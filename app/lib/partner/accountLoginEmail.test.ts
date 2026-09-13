import { expect, test } from "vitest";
import { accountEmailDisplay, readVerifiedLoginEmails } from "./accountLoginEmail";

test("verified recovered login email wins over empty or different legacy profile email", () => {
  expect(accountEmailDisplay(["recovered@example.test"], "profile@example.test")).toEqual({ value: "r••••@example.test", status: "Verified", verified: true });
});
test("mobile-only and unverified profile emails cannot manufacture verified email", () => {
  expect(accountEmailDisplay([], "")).toEqual({ value: "Email not added", status: "Not added", verified: false });
  expect(accountEmailDisplay([], "profile@example.test").verified).toBe(false);
  expect(accountEmailDisplay([], "profile@example.test").status).toBe("Profile email · Not verified");
});
test("all login emails are sorted, deduplicated and masked without choosing a row", () => {
  const emails = readVerifiedLoginEmails({ ok: true, data: { user: { id: "account", verifiedLoginEmails: ["z@example.test", "a@example.test", "z@example.test"] } } }, "account");
  expect(emails).toEqual(["a@example.test", "z@example.test"]);
  expect(accountEmailDisplay(emails).value).toBe("a••••@example.test, z••••@example.test");
});
test("missing, failed or other-account responses remain unavailable rather than asserting no email", () => {
  for (const response of [{}, { ok: false }, { ok: true, data: { user: { id: "other", verifiedLoginEmails: [] } } }]) {
    expect(readVerifiedLoginEmails(response, "account")).toBeNull();
  }
  expect(accountEmailDisplay(null).verified).toBe(false);
  expect(accountEmailDisplay(undefined).status).toBe("Checking");
});
