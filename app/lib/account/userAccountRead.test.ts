import { expect, test } from "vitest";
import { latestAccountRead, readAccountDevices } from "./userAccountRead";
import { accountEmailDisplay, readVerifiedLoginEmails } from "../partner/accountLoginEmail";

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
