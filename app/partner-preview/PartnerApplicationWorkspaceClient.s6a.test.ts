import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const workspaceSource = readFileSync(join(process.cwd(), "app/partner-preview/PartnerApplicationWorkspaceClient.tsx"), "utf8");
const apiSource = readFileSync(join(process.cwd(), "app/lib/partner/partnerApiClient.ts"), "utf8");
const centerSource = readFileSync(join(process.cwd(), "app/lib/partner/partnerApplicationCenter.ts"), "utf8");
const adminSource = readFileSync(join(process.cwd(), "app/admin/partners/payout-tax/page.tsx"), "utf8");
const shellSource = readFileSync(join(process.cwd(), "app/admin/_components/AdminShell.tsx"), "utf8");

test("Step 6 replaces the placeholder with a guided six-section payout and tax flow", () => {
    expect(workspaceSource).toContain("function PayoutTaxStep");
    expect(workspaceSource).toContain("Payout country and currency");
    expect(workspaceSource).toContain("Who will receive the payout?");
    expect(workspaceSource).toContain("Bank account details");
    expect(workspaceSource).toContain("Tax details");
    expect(workspaceSource).toContain("Supporting documents");
    expect(workspaceSource).toContain("Review your details");
});

test("Step 6 uses the backend bundle and save endpoint instead of a local authority", () => {
    expect(apiSource).toContain("/api/v1/partner/application/draft/payout-tax");
    expect(workspaceSource).toContain("savePartnerPayoutTaxDraft");
    expect(workspaceSource).toContain("payoutTaxFormFromBundle(result.data)");
    expect(centerSource).toContain("bundle?.payoutTaxReview?.status");
});

test("Step 6 keeps sensitive and provider states human-safe", () => {
    expect(workspaceSource).toContain("Sensitive values stay masked");
    expect(workspaceSource).toContain("Provider setup pending");
    expect(workspaceSource).toContain("Manual review available");
    expect(workspaceSource).toContain("This does not activate payouts or move money.");
});

test("Step 6 summary is rendered once in the outer right shell instead of inside the form card", () => {
    expect((workspaceSource.match(/Step 6 summary/g) ?? []).length).toBe(1);
    expect(workspaceSource).toContain('data-step6-summary-panel="right-shell"');
    expect(workspaceSource).toContain('payoutTaxSummary={activeStep === "payout_tax"');
    expect(workspaceSource).not.toMatch(/activeStep === "payout_tax"[\\s\\S]{0,800}Coming next/);
});

test("Step 6 form fields use vertical one-control-per-row stacks", () => {
    expect(workspaceSource).toContain('data-step6-field-stack="country"');
    expect(workspaceSource).toContain('data-step6-field-stack="beneficiary"');
    expect(workspaceSource).toContain('data-step6-field-stack="bank"');
    expect(workspaceSource).toContain('data-step6-field-stack="tax"');
    expect(workspaceSource).not.toMatch(/data-step6-field-stack="(?:country|beneficiary|bank|tax)"[^>]*sm:grid-cols-2/);
    expect(workspaceSource).toContain('label="SWIFT/BIC"');
    expect(workspaceSource).toContain('label="Routing number"');
});

test("Step 6 right summary has safe values and responsive shell placement", () => {
    expect(workspaceSource).toContain('xl:grid-cols-[280px_minmax(0,1fr)_360px]');
    expect(workspaceSource).toContain('activeStep === "payout_tax" ? "block min-w-0 lg:col-start-2 xl:col-start-auto"');
    expect(workspaceSource).toContain("Bank account");
    expect(workspaceSource).toContain("GST/VAT state");
    expect(workspaceSource).toContain("Masked after save");
});

test("Step 6 adds a protected Admin payout and tax review area", () => {
    expect(adminSource).toContain('requiredPermissions={["partner_payout_tax.read"]}');
    expect(adminSource).toContain("/api/v1/admin/partners/payout-tax");
    expect(adminSource).toContain("Full bank and tax values are not displayed here.");
    expect(shellSource).toContain("/admin/partners/payout-tax");
});
