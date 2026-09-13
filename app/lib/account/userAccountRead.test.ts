import { expect, test } from "vitest";
import { latestAccountRead, readAccountDevices, loginMobileDisplay } from "./userAccountRead";
import { accountEmailDisplay, readVerifiedLoginEmails } from "../partner/accountLoginEmail";

test("login mobile uses masked canonical methods independently of legacy/profile contacts", () => {
  const mobile = { id: "linked", provider: "mobile", verified: true, label: "+******0123" };
  const payload = (methods: unknown[]) => ({ ok: true, data: { ownerId: "a", methods, mobile: "internal-placeholder", profile: { mobile: "+19995550000" } } });
  expect(loginMobileDisplay(payload([mobile]), "a")).toBe("+******0123 · Verified");
  expect(loginMobileDisplay(payload([{ ...mobile, id: "legacy-mobile" }]), "a")).toBe("+******0123 · Verified");
  expect(loginMobileDisplay(payload([]), "a")).toBe("Mobile not added");
  expect(loginMobileDisplay(payload([mobile, { ...mobile, id: "second", label: "+******0456" }]), "a")).toBe("2 verified login mobiles");
  expect(loginMobileDisplay(payload([{ ...mobile, verified: false }, { ...mobile, status: "disabled" }]), "a")).toBe("Mobile not added");
  expect(loginMobileDisplay(payload([mobile]), "b")).toBe("Login mobile unavailable");
  for (const value of [undefined, { ok: false }, payload([null]), payload([{ ...mobile, label: "internal-placeholder" }])]) {
    expect(loginMobileDisplay(value, "a")).toBe("Login mobile unavailable");
  }
});

  test("keeps verified login emails deterministic and independent of profile email", () => {
    const payload = { ok: true, data: { user: { id: "user-a", email: "profile@example.test", verifiedLoginEmails: ["Z@example.test", "a@example.test", "z@example.test"] } } };
    expect(readVerifiedLoginEmails(payload, "user-a")).toEqual(["a@example.test", "z@example.test"]);
    expect(accountEmailDisplay(readVerifiedLoginEmails(payload, "user-a")).verified).toBe(true);
    expect(accountEmailDisplay([], payload.data.user.email).verified).toBe(false);
    expect(accountEmailDisplay([]).value).toBe("Email not added");
    expect(readVerifiedLoginEmails(payload, "user-b")).toBeNull();
  });
  test("never presents failed or missing contracts as verified/absent", () => {
    for (const value of [undefined, null]) {
      const display = accountEmailDisplay(value, "profile@example.test");
      expect(display.verified).toBe(false);
      expect(display.value).not.toBe("Email not added");
    }
    expect(readVerifiedLoginEmails({ ok: false }, "user-a")).toBeNull();
  });
  test("rejects old responses after newer reads and after owner cleanup", () => {
    const order = latestAccountRead();
    const first = order.begin();
    const second = order.begin();
    expect(first()).toBe(false);
    expect(second()).toBe(true);
    order.cancel();
    expect(second()).toBe(false);
  });
  test("accepts only account-owned device records, discarding session-like metadata", () => {
    const payload = { ok: true, data: { deviceSessions: [{ id: "device", userId: "user-a", deviceLabel: "Synthetic browser", lastSeenAt: "invalid", metadata: { isCurrent: true } }] } };
    expect(readAccountDevices(payload, "user-a")).toEqual([{ id: "device", label: "Synthetic browser", lastSeenAt: null }]);
    expect(readAccountDevices(payload, "user-b")).toBeNull();
    expect(readAccountDevices({ ok: true, data: { deviceSessions: [] } }, "user-a")).toEqual([]);
    expect(readAccountDevices({ ok: false }, "user-a")).toBeNull();
  });
