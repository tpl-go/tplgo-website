import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const source = readFileSync(join(process.cwd(), "app/admin/_components/AdminWebsiteExperienceLanding.tsx"), "utf8");

test("AdminWebsiteExperienceLanding uses one published-first central workflow dashboard", () => {
  expect(source).toContain('data-central-workflow-dashboard="real-data"');
  expect(source).toContain('centralWorkflowStageFromValue(searchParams.get("view")) ?? "published"');
  expect(source).toContain("CentralWorkflowDashboard");
  expect(source).toContain("DashboardCountCard");
  expect(source).not.toContain("Work Queue");
  expect(source).not.toContain("Records");
  expect(source).not.toContain("Service Requests");
  expect(source).not.toContain("All statuses");
});

test("AdminWebsiteExperienceLanding keeps canonical workflow stage navigation and central actions", () => {
  for (const label of ["Published", "Drafts", "Awaiting Approval", "Changes Requested", "Approved", "Scheduled", "Archived", "History"]) {
    expect(source).toContain(label);
  }
  expect(source).toContain("Open Draft");
  expect(source).toContain("Review");
  expect(source).toContain("Publish or Schedule");
  expect(source).toContain("Manage Schedule");
  expect(source).toContain('href="/admin/website-experience/versions-audit"');
});

test("AdminWebsiteExperienceLanding keeps the home copy compact and operator-facing", () => {
  expect(source).toContain("Content areas");
  expect(source).toContain("Global Experience");
  expect(source).toContain("Pages");
  expect(source).toContain("Some workflow data could not load. Navigation is still available.");
  expect(source).toContain("Loading workflow items...");
  expect(source).not.toContain("Central workflow dashboard");
  expect(source).not.toContain("Draft, approval and publishing operations");
  expect(source).not.toContain("One operational view for saved Drafts");
  expect(source).not.toContain("Manage content from Draft to approval");
});

test("AdminWebsiteExperienceLanding global listing uses immediate parent navigation", () => {
  expect(source).toContain('current="Global Experience"');
  expect(source).toContain('title="Global Experience"');
  expect(source).toContain('detail="Manage content shared across the website."');
  expect(source).toContain('const backTarget = parent ?? { label: "Website Experience", href: "/admin/website-experience" };');
  expect(source).toContain('<AdminBackButton href={backTarget.href} label={`Back to ${backTarget.label}`} />');
  expect(source).toContain('title="Login & Signup"');
  expect(source).toContain('detail="Manage login and registration content."');
  expect(source).toContain('count="3 experiences"');
  expect(source).not.toContain("Registered global module");
  expect(source).not.toContain("Dynamic editing is not configured");
});

test("AdminWebsiteExperienceLanding pages listing uses compact page navigation", () => {
  expect(source).toContain('current="Pages"');
  expect(source).toContain('title="Pages"');
  expect(source).toContain('detail="Choose a page to manage its content."');
  expect(source).toContain('placeholder="Search pages"');
  expect(source).toContain('description: "Manage Partner experience content."');
  expect(source).toContain('href={page.label === "Partner" ? "/admin/website-experience/pages/partner" : undefined}');
  expect(source).toContain('count={`${page.sections.length} sections`}');
  expect(source).not.toContain('detail={page.path}');
  expect(source).not.toContain("Open one registered page at a time.");
  expect(source).not.toContain("Search pages or routes");
});

test("AdminWebsiteExperienceLanding disabled listing rows have no active navigation affordance", () => {
  expect(source).toContain('aria-disabled="true"');
  expect(source).toContain('disabledHelp = "This area is not available yet."');
  expect(source).toContain('title={disabledHelp}');
  expect(source).toContain("disabled ? null : <ArrowRight");
  expect(source).not.toContain("tabIndex={0}");
});

test("AdminWebsiteExperienceLanding Partner third-level screen uses human copy and existing destinations", () => {
  expect(source).toContain('current="Partner"');
  expect(source).toContain('parent={{ label: "Pages", href: "/admin/website-experience/pages" }}');
  expect(source).toContain('title="Partner"');
  expect(source).toContain('detail="Choose a Partner area to manage."');
  expect(source).toContain('title="Partner Application" detail="Manage Partner onboarding content."');
  expect(source).toContain('title="Service Catalogue" detail="Manage Partner service domains and services."');
  expect(source).toContain('href="/admin/website-experience/pages/partner/application"');
  expect(source).toContain('href="/admin/website-experience/pages/partner/service-catalogue"');
  expect(source).not.toContain("authoritative Service Catalogue");
  expect(source).not.toContain("safe presentation fields");
});

test("AdminWebsiteExperienceLanding Partner and page rows keep vertical full-row layout", () => {
  expect(source).toContain("VerticalEntry");
  expect(source).toContain("flex min-h-20 w-full flex-col justify-between gap-4");
  expect(source).toContain("sm:flex-row sm:items-center");
  expect(source).toContain("return <Link href={href} className={className}>{body}</Link>;");
  expect(source).not.toContain("grid grid-cols");
});

test("AdminWebsiteExperienceLanding route audit keeps undiscovered page third-level screens out of scope", () => {
  const pageRouteRoot = join(process.cwd(), "app/admin/website-experience/pages");
  expect(existsSync(join(pageRouteRoot, "partner/page.tsx"))).toBe(true);
  expect(existsSync(join(pageRouteRoot, "homepage/page.tsx"))).toBe(false);
  expect(existsSync(join(pageRouteRoot, "flights/page.tsx"))).toBe(false);
  expect(existsSync(join(pageRouteRoot, "hotels/page.tsx"))).toBe(false);
});
