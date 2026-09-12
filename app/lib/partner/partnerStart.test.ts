import { expect, test, vi } from "vitest";
import { tplApiRequest } from "../api/tplApiClient";
import { partnerAccessDestination, startPartnerApplication } from "./partnerAccess";
vi.mock("../api/tplApiClient", () => ({ tplApiRequest: vi.fn() }));
const request = vi.mocked(tplApiRequest) as typeof tplApiRequest & { mockClear: () => void; mockResolvedValueOnce: (value: Awaited<ReturnType<typeof tplApiRequest>>) => void };
const key = "explicit-start-request-key";
const organizationId = "11111111-1111-4111-8111-111111111111";

test("verified-contact conflict stays blocked and offers existing safe choices without private details", async () => {
  request.mockClear();
  request.mockResolvedValueOnce({ ok: false, status: 409, error: { code: "PARTNER_ACCESS_SUPPORT_REQUIRED", message: "private-contact-and-record-data" } } as Awaited<ReturnType<typeof tplApiRequest>>);
  await expect(startPartnerApplication(key)).rejects.toThrow("We couldn’t start a new application safely. Use another Partner login, choose Recover existing application, or contact Partner Support.");
  expect(request).toHaveBeenCalledTimes(1);
  expect(request).toHaveBeenCalledWith("/api/v1/partner/application/start", { method: "POST", body: {}, idempotencyKey: key, fallbackOnError: false });
});

for (const step of ["account_contact", "business_identity"] as const) test(`successful Start/resume uses only authoritative ${step}`, async () => {
  request.mockClear();
  request.mockResolvedValueOnce({ ok: true, status: 200, data: { access: { outcome: "APPLICATION", organizationId, step } } } as Awaited<ReturnType<typeof tplApiRequest>>);
  expect(partnerAccessDestination(await startPartnerApplication(key))).toBe(`/partner-preview?step=${step}&organizationId=${organizationId}`);
  expect(request).toHaveBeenCalledTimes(1);
});

for (const outcome of ["APPLICATION_STATUS", "SETUP_PENDING", "ACTIVE"] as const) test(`existing ${outcome} retains Partner routing without editable fallback`, async () => {
  request.mockResolvedValueOnce({ ok: true, status: 200, data: { access: { outcome, organizationId, step: null } } } as Awaited<ReturnType<typeof tplApiRequest>>);
  const access = await startPartnerApplication(key);
  expect(access.outcome).toBe(outcome);
  expect(partnerAccessDestination(access)).toBeNull();
});

test("unrelated errors do not invent contact collisions or fake a draft", async () => {
  request.mockResolvedValueOnce({ ok: false, status: 500, error: { code: "INTERNAL_ERROR", message: "private-database-error" } } as Awaited<ReturnType<typeof tplApiRequest>>);
  await expect(startPartnerApplication(key)).rejects.toThrow("The application could not be opened. Please retry.");
});
