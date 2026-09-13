import { expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import ts from "typescript";

const path = "app/components/common/LoginModal.tsx";
const current = readFileSync(path, "utf8");
const accepted = execFileSync("git", ["show", `4594125^:${path}`], { encoding: "utf8" });
function declarations(source: string) {
  const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const result = new Map<string, string>();
  for (const node of file.statements) {
    if (ts.isFunctionDeclaration(node) && node.name) result.set(node.name.text, node.getText(file));
    if (ts.isVariableStatement(node)) for (const declaration of node.declarationList.declarations) result.set(declaration.name.getText(file), node.getText(file));
  }
  return result;
}

{
  const before = declarations(accepted), after = declarations(current);
  test("preserves every retained styling declaration, including responsive shell proportions", () => {
    for (const [name, value] of after) if (/Style$/.test(name)) expect(value, name).toBe(before.get(name));
  });
  test("preserves shared User Login controls, promo panel, tabs and original Google control", () => {
    for (const name of ["PromoPanel", "TopAccountTabs", "MethodSelector", "AuthDivider", "AuthMessageLayer"]) expect(after.get(name), name).toBe(before.get(name));
    // Only the unchanged country select was extracted for reuse by recovery.
    // Substituting its original JSX must recover the entire accepted input,
    // including paste handling, validation, layout, styles and keyboard behavior.
    const originalMobile = before.get("MobileIdentityInput")!;
    const originalSelect = originalMobile.match(/<select[\s\S]*?<\/select>/)![0];
    expect(after.get("MobileIdentityInput")!.replace(/<CountryDialCodeSelect[^>]*\/>/, originalSelect)).toBe(originalMobile);
    const countries = declarations(readFileSync("app/lib/auth/mobileCountries.ts", "utf8"));
    expect(countries.get("COUNTRY_OPTIONS")!.replace(/^export /, "").replace(/\s+/g, "")).toBe(before.get("COUNTRY_OPTIONS")!.replace(/\s+/g, ""));
    expect(current).toContain('setSuccessText("Login successful. Welcome to TPL GO.")');
  });
  test("removes the alternative shell and entire duplicate registration path", () => {
    expect(current).not.toMatch(/PartnerAccessLogin|Become a TPL Partner|createPartnerRegistrationIntake|partnerView|registerLegalName|registerTerms/);
  });
  test("hands both successful Partner OTP methods to the single resolver route", () => {
    expect(current).not.toContain("readPartnerAccess");
    expect(current).not.toContain('window.location.assign("/partner-preview")');
    expect(current.match(/window\.location\.replace\("\/partner-access"\)/g)).toHaveLength(2);
  });
  test("retains one Google OAuth integration and returns Partner authentication to the resolver page", () => {
    expect(current).toContain('/api/v1/auth/google?returnTo=${encodeURIComponent(returnTo)}');
    expect(current).toContain('`${window.location.origin}/partner-access`');
    expect(current).toContain('`${window.location.origin}${window.location.pathname}${window.location.search}`');
  });
}
